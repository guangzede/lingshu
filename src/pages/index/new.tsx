import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import Taro from '@tarojs/taro';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// --- [配置常量：玄天黑玉·古神禁制] ---
const THEME = {
    bg: '#000000',

    // 阵盘材质
    ringFill: 'rgba(5, 8, 12, 0.95)',

    // 线条
    linePrimary: '#D4AF37',  // 古金
    lineSecondary: '#5D4037',// 暗铜
    divider: 'rgba(212, 175, 55, 0.3)',

    // 文字
    textNormal: '#C0C0C0',
    textGold: '#FFD700',

    // 特效 [修复：颜色匹配]
    active: '#FFFFFF',
    shockwave: '#D4AF37',  // [修改] 改为古金色，与主色调统一，不再突兀
    energy: '#FFFFFF',

    // 太极
    yinFish: '#000000',
    yangFish: '#F5F5F5',
};

const GEO = {
    MESH_SIZE: 6,
    TEX_SIZE: 4096,
    CONTENT_SCALE: 0.95,
    EYE_OFFSET_RATIO: 0.215
};

const TAIJI_RADIUS = 3 * 0.98 * GEO.CONTENT_SCALE;

// 定义层级尺寸，用于计算无缝衔接的比例
const LAYER_SIZES = [6, 12, 18, 24, 30, 38, 44, 52];

interface LingShuCompassProps {
    onLoaded?: () => void;
    flyStartPos: { x: number; y: number; z: number };
    onTransitionComplete?: () => void;
}

export interface LingShuCompassRef {
    startAnimation: () => void;
    endAnimation: (callback?: () => void) => void;
}

// --- [Canvas 绘图逻辑] ---

const createCloudTexture = () => {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 40; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
};

const drawRingText = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, data: any[], fontSize = 40, opts: any = {}) => {
    const { isUpright = false, font = "KaiTi", isGold = false } = opts;
    ctx.font = `900 ${fontSize}px "${font}", "STKaiti", serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const count = data.length; const step = (Math.PI * 2) / count;

    for (let i = 0; i < count; i++) {
        const item = data[i]; const angle = i * step - Math.PI / 2;
        ctx.save(); ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        if (!isUpright) ctx.rotate(angle + Math.PI / 2);

        ctx.shadowBlur = 0;
        ctx.fillStyle = isGold ? THEME.textGold : THEME.textNormal;

        if (typeof item === 'string') {
            ctx.fillText(item, 0, 0);
        }
        else if (item.hex) {
            ctx.font = `bold ${fontSize * 1.4}px "Segoe UI Symbol", sans-serif`; ctx.fillText(item.hex, 0, -fontSize * 0.55);
            ctx.font = `900 ${fontSize * 0.7}px "${font}", serif`; ctx.fillText(item.name, 0, fontSize * 0.85);
        }
        ctx.restore();
    }
};

const drawTaiji = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) => {
    ctx.save(); ctx.translate(cx, cy);
    ctx.shadowBlur = 0;

    // 1. 底色 (阴)
    ctx.fillStyle = THEME.yinFish;
    ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();

    // 2. 阳鱼
    const grad = ctx.createRadialGradient(0, radius / 2, 0, 0, 0, radius);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.3, '#FFF9C4');
    grad.addColorStop(1, '#B8860B');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.arc(0, 0, radius, -Math.PI / 2, Math.PI / 2, false);
    ctx.fill();
    ctx.beginPath(); ctx.arc(0, -radius / 2, radius / 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = THEME.yinFish;
    ctx.beginPath(); ctx.arc(0, radius / 2, radius / 2, 0, Math.PI * 2); ctx.fill();

    // 3. 鱼眼
    const eyeR = radius / 5;
    const eyeOffset = radius / 2;

    ctx.fillStyle = '#000000';
    ctx.beginPath(); ctx.arc(0, -eyeOffset, eyeR, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#DAA520'; ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#FFFFFF'; ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.arc(0, eyeOffset, eyeR, 0, Math.PI * 2); ctx.fill();

    // 4. 外框
    ctx.shadowBlur = 0;
    ctx.lineWidth = 8;
    ctx.strokeStyle = THEME.linePrimary;
    ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.stroke();

    ctx.restore();
};

const createLayerTexture = (idx: number) => {
    const size = GEO.TEX_SIZE;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2; const cy = size / 2; const r = size / 2 * 0.98;

    ctx.shadowBlur = 0;

    const drawSolidRing = (rad: number, width: number, color = THEME.linePrimary) => {
        ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.stroke();
    };

    const drawSectorLines = (cx: number, cy: number, radius: number, count: number, innerRadius: number) => {
        ctx.strokeStyle = THEME.divider;
        ctx.lineWidth = 3;
        const step = (Math.PI * 2) / count;
        for (let i = 0; i < count; i++) {
            const angle = i * step - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * innerRadius, cy + Math.sin(angle) * innerRadius);
            ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
            ctx.stroke();
        }
    };

    const drawBand = (outerR: number, innerR: number, count: number, data: any[], textOpts: any = {}, isGoldLayer = false) => {
        const grad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
        grad.addColorStop(0, 'rgba(5, 8, 10, 0.9)');
        grad.addColorStop(1, 'rgba(2, 4, 5, 1.0)');

        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
        ctx.fillStyle = grad;
        ctx.fill();

        const borderColor = isGoldLayer ? '#FFD700' : THEME.linePrimary;
        drawSolidRing(outerR, 6, borderColor);
        drawSolidRing(innerR, 6, borderColor);

        if (count > 0) drawSectorLines(cx, cy, outerR, count, innerR);

        const textR = innerR + (outerR - innerR) / 2;
        const autoFontSize = textOpts.fontSize || (outerR - innerR) * 0.55;
        const finalOpts = { ...textOpts, isGold: isGoldLayer };
        drawRingText(ctx, cx, cy, textR, data, autoFontSize, finalOpts);
    };

    const DATA_LOCAL = {
        bagua: ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"],
        mountains: ["壬", "子", "癸", "丑", "艮", "寅", "甲", "卯", "乙", "辰", "巽", "巳", "丙", "午", "丁", "未", "坤", "申", "庚", "酉", "辛", "戌", "乾", "亥"],
        stars: ["角", "亢", "氐", "房", "心", "尾", "箕", "斗", "牛", "女", "虚", "危", "室", "壁", "奎", "娄", "胃", "昴", "毕", "觜", "参", "井", "鬼", "柳", "星", "张", "翼", "轸"]
    };
    const dragons = [];
    const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
    const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
    for (let i = 0; i < 72; i++) { if (i % 6 === 0 || i % 6 === 5) dragons.push("正"); else dragons.push(stems[i % 10] + branches[i % 12]); }

    // [修复：自动计算无缝内径]
    // 每一层的内径应该等于上一层的外径，考虑到缩放 r = size/2 * 0.98
    // 上一层尺寸: prevSize = LAYER_SIZES[idx-1]
    // 当前尺寸: currSize = LAYER_SIZES[idx]
    // 理想比例: ratio = prevSize / currSize
    // 为了确保覆盖，稍微减小一点点 innerR (增加 overlap) -> ratio - 0.02

    let innerRatio = 0.5; // 默认
    if (idx > 0) {
        innerRatio = (LAYER_SIZES[idx - 1] / LAYER_SIZES[idx]) - 0.02;
    }

    switch (idx) {
        case 0: drawTaiji(ctx, cx, cy, r * GEO.CONTENT_SCALE); break;
        case 1: drawBand(r, r * innerRatio, 8, DATA_LOCAL.bagua, { fontSize: 260 }, true); break;
        case 2: drawBand(r, r * innerRatio, 24, DATA_LOCAL.mountains, { isUpright: false, fontSize: 140 }); break;
        case 3: drawBand(r, r * innerRatio, 72, dragons, { isUpright: false, fontSize: 80 }, true); break;
        case 4: drawBand(r, r * innerRatio, 24, DATA_LOCAL.mountains, { color: THEME.textNormal, isUpright: false, fontSize: 120 }); break;
        case 5: drawBand(r, r * innerRatio, 64, Array(64).fill("").map(() => ({ name: "卦", hex: "|||" })), { isUpright: false, fontSize: 90 }); break;
        case 6: drawBand(r, r * innerRatio, 24, DATA_LOCAL.mountains, { color: THEME.textNormal, isUpright: false, fontSize: 130 }); break;
        case 7: drawBand(r, r * innerRatio, 28, DATA_LOCAL.stars, { isUpright: false, fontSize: 110 }, true);
            const tickR = r * 0.98;
            drawSolidRing(tickR, 4, THEME.linePrimary);
            ctx.strokeStyle = THEME.linePrimary; ctx.lineWidth = 3;
            for (let i = 0; i < 360; i += 2) {
                const angle = (i / 360) * Math.PI * 2; ctx.beginPath();
                const len = i % 10 === 0 ? 40 : 15;
                ctx.moveTo(cx + Math.cos(angle) * (tickR), cy + Math.sin(angle) * (tickR));
                ctx.lineTo(cx + Math.cos(angle) * (tickR - len), cy + Math.sin(angle) * (tickR - len)); ctx.stroke();
            }
            break;
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    return tex;
};

// --- [组件] ---
const LingShuCompass = forwardRef<LingShuCompassRef, LingShuCompassProps>(({ onLoaded, flyStartPos, onTransitionComplete }, ref) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const layersRef = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[]>([]);
    const shockwavesRef = useRef<any[]>([]);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const particlesRef = useRef<THREE.Points | null>(null);

    const stateRef = useRef({
        phase: 'init',
        timeline: 0,
        energy: 0,
        shake: 0,
        onExitComplete: null as (() => void) | null,
        hasLoaded: false,
        p0Scale: 1
    });

    useImperativeHandle(ref, () => ({
        startAnimation: () => {
            if (stateRef.current.phase === 'init') {
                stateRef.current.phase = 'entering';
                stateRef.current.timeline = 0;
                stateRef.current.energy = 0;
            }
        },
        endAnimation: (callback?: () => void) => {
            if (stateRef.current.phase === 'active' || stateRef.current.phase === 'entering') {
                stateRef.current.phase = 'exiting';
                stateRef.current.timeline = 0;
                stateRef.current.onExitComplete = callback ?? null;
            }
        }
    }));

    const fitCameraToObject = (camera: THREE.PerspectiveCamera, objectSize: number, aspectRatio: number) => {
        const vFOV = THREE.MathUtils.degToRad(camera.fov);
        let dist = aspectRatio < 1 ? objectSize / (2 * Math.tan(vFOV / 2) * aspectRatio) : objectSize / (2 * Math.tan(vFOV / 2));
        return Math.max(dist, 40);
    };

    useEffect(() => {
        layersRef.current = []; shockwavesRef.current = [];
        stateRef.current = { phase: 'init', timeline: 0, energy: 0, shake: 0, hasLoaded: false, onExitComplete: null, p0Scale: 1 };

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(THEME.bg, 0.001);

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        cameraRef.current = camera;
        const initialZ = fitCameraToObject(camera, 42, window.innerWidth / window.innerHeight);
        camera.position.set(0, -40, initialZ);
        camera.lookAt(0, 0, 0);

        const distToCenter = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        const vFOV = THREE.MathUtils.degToRad(60);
        const visibleHeight = 2 * Math.tan(vFOV / 2) * distToCenter;
        const visibleWidth = visibleHeight * (window.innerWidth / window.innerHeight);
        const targetDiameter = visibleWidth / 3.5;
        stateRef.current.p0Scale = targetDiameter / GEO.MESH_SIZE;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ReinhardToneMapping;
        renderer.toneMappingExposure = 1.0;

        if (mountRef.current) {
            while (mountRef.current.firstChild) mountRef.current.removeChild(mountRef.current.firstChild);
            mountRef.current.appendChild(renderer.domElement);
        }

        const renderScene = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.strength = 0.5;
        bloomPass.radius = 0.2;
        bloomPass.threshold = 0.8;
        const composer = new EffectComposer(renderer);
        composer.addPass(renderScene); composer.addPass(bloomPass);

        const compassGroup = new THREE.Group();
        scene.add(compassGroup);

        const cloudTex = createCloudTexture();
        for (let i = 0; i < 3; i++) {
            const geo = new THREE.PlaneGeometry(80, 80);
            const mat = new THREE.MeshBasicMaterial({
                map: cloudTex, transparent: true, opacity: 0.15,
                depthWrite: false, blending: THREE.AdditiveBlending, color: '#D4AF37'
            });
            const cloud = new THREE.Mesh(geo, mat);
            cloud.position.z = -2 - i * 1;
            cloud.rotation.z = Math.random() * Math.PI;
            scene.add(cloud);
        }

        const createShockwaveGroup = () => {
            const group = new THREE.Group();
            const groundGeo = new THREE.RingGeometry(0.9, 1, 128);
            const groundMat = new THREE.MeshBasicMaterial({ color: THEME.shockwave, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
            const ground = new THREE.Mesh(groundGeo, groundMat);
            group.add(ground); group.visible = false;
            return { group, ground, active: false, time: 0 };
        };
        for (let i = 0; i < 10; i++) {
            const waveObj = createShockwaveGroup(); scene.add(waveObj.group); shockwavesRef.current.push(waveObj);
        }
        const triggerShockwave = (size: number, zPos: number) => {
            const wave = shockwavesRef.current.find(w => !w.active);
            if (wave) {
                wave.active = true; wave.time = 0; wave.group.visible = true;
                wave.group.position.z = zPos + 0.05;
                const r = size / 2;
                wave.group.scale.setScalar(r);
                wave.ground.material.opacity = 0.8;
            }
        };

        // 层级
        const layerConfigs = [
            { size: LAYER_SIZES[0], speed: 0.002, dir: 1, delay: 0 },
            { size: LAYER_SIZES[1], speed: 0.001, dir: -1, delay: 0.4 + 0.8 },
            { size: LAYER_SIZES[2], speed: 0.0005, dir: 1, delay: 0.7 + 0.8 },
            { size: LAYER_SIZES[3], speed: 0.0005, dir: 1, delay: 1.0 + 0.8 },
            { size: LAYER_SIZES[4], speed: 0.0008, dir: -1, delay: 1.3 + 0.8, offset: -0.13 },
            { size: LAYER_SIZES[5], speed: 0.0006, dir: 1, delay: 1.6 + 0.8 },
            { size: LAYER_SIZES[6], speed: 0.0012, dir: -1, delay: 1.9 + 0.8, offset: 0.13 },
            { size: LAYER_SIZES[7], speed: 0.0008, dir: 1, delay: 2.2 + 0.8 }
        ];

        layerConfigs.forEach((cfg, idx) => {
            const tex = createLayerTexture(idx);
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

            const mat = new THREE.MeshBasicMaterial({
                map: tex, transparent: true, opacity: 0, side: THREE.DoubleSide,
                blending: THREE.NormalBlending,
                depthWrite: false,
                color: 0xFFFFFF
            });
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(cfg.size, cfg.size), mat) as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
            mesh.position.z = idx * 0.08;
            if (cfg.offset) mesh.rotation.z = cfg.offset;
            mesh.userData = { cfg, currentRot: cfg.offset || 0, hasLanded: false, flashIntensity: 0 };

            if (idx === 0) {
                mesh.material.opacity = 1;
                mesh.scale.setScalar(stateRef.current.p0Scale);
            } else {
                mesh.material.opacity = 0; mesh.scale.setScalar(0);
            }
            compassGroup.add(mesh); layersRef.current.push(mesh);
        });

        const createParticles = () => {
            const geo = new THREE.BufferGeometry(); const pos = new Float32Array(2000 * 3);
            const colors = new Float32Array(2000 * 3);
            const c1 = new THREE.Color(THEME.linePrimary);
            const c2 = new THREE.Color(THEME.shockwave);
            for (let i = 0; i < 2000; i++) {
                const r = 20 + Math.random() * 60; const th = Math.random() * Math.PI * 2;
                pos[i * 3] = Math.cos(th) * r; pos[i * 3 + 1] = Math.sin(th) * r; pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
                const mixC = Math.random() > 0.8 ? c2 : c1;
                colors[i * 3] = mixC.r; colors[i * 3 + 1] = mixC.g; colors[i * 3 + 2] = mixC.b;
            }
            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            const mat = new THREE.PointsMaterial({ size: 0.25, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, vertexColors: true });
            return new THREE.Points(geo, mat);
        };
        const particles = createParticles();
        particlesRef.current = particles;
        scene.add(particles);

        const clock = new THREE.Clock();
        const easeOutBack = (x: number) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);
        const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
        const easeInOutQuad = (x: number) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
        const easeInExpo = (x: number) => x === 0 ? 0 : Math.pow(2, 10 * x - 10);
        const easeInOutCubic = (x: number) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

        const animate = () => {
            animationFrameId.current = requestAnimationFrame(animate);
            const dt = clock.getDelta(); const state = stateRef.current;

            state.timeline += dt;

            if (state.phase === 'init') {
                const taiji = layersRef.current[0];
                if (taiji) {
                    taiji.rotation.z += 0.002;
                    taiji.scale.setScalar(state.p0Scale);
                }
                if (onLoaded && !state.hasLoaded) { onLoaded(); state.hasLoaded = true; }
            }
            else if (state.phase === 'entering') {
                const taiji = layersRef.current[0];

                if (state.timeline < 0.8) {
                    const t = state.timeline / 0.8;
                    const ease = easeInOutCubic(t);
                    const currentScale = THREE.MathUtils.lerp(state.p0Scale, 1, ease);
                    if (taiji) {
                        taiji.scale.setScalar(currentScale);
                        taiji.rotation.z += 0.005;
                    }
                } else {
                    if (taiji) {
                        taiji.scale.setScalar(1);
                        taiji.rotation.z += 0.002;
                    }
                }

                layersRef.current.forEach((mesh, i) => {
                    if (i === 0) return;
                    const ud = mesh.userData;
                    const { delay, offset = 0, size } = ud.cfg;
                    if (state.timeline > delay) {
                        const p = Math.min((state.timeline - delay) / 0.6, 1); const ease = easeOutBack(p);
                        mesh.scale.setScalar(ease); mesh.material.opacity = p;
                        mesh.rotation.z = offset + (1 - ease) * 0.2 * (i % 2 === 0 ? 1 : -1);
                        if (p > 0.1 && !ud.hasLanded) {
                            ud.hasLanded = true; ud.flashIntensity = 1.0;
                            state.shake += 0.3; triggerShockwave(size, mesh.position.z);
                        }
                    }
                    if (ud.flashIntensity > 0.01) {
                        ud.flashIntensity *= 0.9;
                        // 闪光：白 -> 本色
                        mesh.material.color.copy(new THREE.Color(0xFFFFFF)).lerp(new THREE.Color(0xFFFFFF), ud.flashIntensity);
                    } else { mesh.material.color.set(0xFFFFFF); }
                });
                if (state.timeline > 3.0 + 0.8) state.phase = 'active';
            }
            else if (state.phase === 'active') {
                layersRef.current.forEach((mesh) => {
                    const ud = mesh.userData;
                    const { speed, dir } = ud.cfg;
                    ud.currentRot += speed * dir;
                    mesh.rotation.z = ud.currentRot;
                    mesh.material.color.set(0xFFFFFF);
                });
            }
            else if (state.phase === 'exiting') {
                if (state.timeline < 1.0) {
                    const t = state.timeline / 1.0; const ease = easeInOutQuad(t);
                    if (cameraRef.current) {
                        const startY = -40; const targetY = 0; const currentY = THREE.MathUtils.lerp(startY, targetY, ease);
                        const startZ = fitCameraToObject(cameraRef.current, 42, window.innerWidth / window.innerHeight);
                        const targetZ = startZ * 1.2; const currentZ = THREE.MathUtils.lerp(startZ, targetZ, ease);
                        cameraRef.current.position.set(0, currentY, currentZ); cameraRef.current.lookAt(0, 0, 0);
                    }
                } else if (cameraRef.current) { cameraRef.current.lookAt(0, 0, 0); }

                if (state.timeline > 0.8) {
                    const blastTime = Math.min((state.timeline - 0.8) / 1.2, 1);
                    const blastEase = easeInExpo(blastTime);

                    layersRef.current.forEach((mesh) => {
                        const ud = mesh.userData;
                        mesh.rotation.z += (0.01 + blastEase * 0.1) * ud.cfg.dir;
                    });
                    bloomPass.strength = 0.5 + blastEase * 1.5;
                    bloomPass.radius = 0.2 + blastEase * 0.5;

                    if (blastTime >= 0.95) {
                        state.phase = 'ascension';
                        if (state.onExitComplete) state.onExitComplete();
                    }
                }
            }
            else if (state.phase === 'ascension') {
                // 飞升循环
                layersRef.current.forEach((mesh) => {
                    const ud = mesh.userData;
                    mesh.rotation.z += 0.15 * ud.cfg.dir;
                });
                const pulse = Math.sin(clock.elapsedTime * 15) * 0.5 + 0.5;
                bloomPass.strength = 2.0 + pulse * 1.0;
                bloomPass.radius = 0.5 + pulse * 0.1;

                if (particlesRef.current) {
                    particlesRef.current.rotation.z += 0.1;
                    particlesRef.current.rotation.y = Math.sin(clock.elapsedTime * 2) * 0.2;
                }
                if (cameraRef.current) {
                    cameraRef.current.position.x = (Math.random() - 0.5) * 0.2;
                    cameraRef.current.position.y = (Math.random() - 0.5) * 0.2;
                    cameraRef.current.lookAt(0, 0, 0);
                }
            }

            shockwavesRef.current.forEach(wave => {
                if (wave.active) {
                    wave.time += dt; const life = 0.8; const progress = wave.time / life;
                    if (progress >= 1) { wave.active = false; wave.group.visible = false; }
                    else {
                        const easeP = 1 - Math.pow(1 - progress, 3);
                        wave.group.scale.multiplyScalar(1.01);
                        wave.ground.material.opacity = (1 - easeP) * 0.4;
                    }
                }
            });

            state.shake *= 0.9;
            if (state.phase !== 'exiting' && state.phase !== 'ascension' && cameraRef.current) {
                const baseZ = cameraRef.current.position.z; const baseY = cameraRef.current.position.y;
                cameraRef.current.position.y = baseY + (Math.random() - 0.5) * state.shake;
                cameraRef.current.position.z = baseZ + (Math.random() - 0.5) * state.shake;
            }

            if (particlesRef.current && state.phase !== 'ascension') {
                particlesRef.current.rotation.z += 0.002;
            }
            composer.render();
        };
        animate();

        const handleResize = () => {
            if (cameraRef.current) {
                const aspect = window.innerWidth / window.innerHeight; cameraRef.current.aspect = aspect; cameraRef.current.updateProjectionMatrix();
                const newZ = fitCameraToObject(cameraRef.current, 42, aspect);
                cameraRef.current.position.z = newZ;
                const distToCenter = cameraRef.current.position.distanceTo(new THREE.Vector3(0, 0, 0));
                const vFOV = THREE.MathUtils.degToRad(60);
                const visibleHeight = 2 * Math.tan(vFOV / 2) * distToCenter;
                const visibleWidth = visibleHeight * aspect;
                const targetDiameter = visibleWidth / 3.5;
                stateRef.current.p0Scale = targetDiameter / GEO.MESH_SIZE;
            }
            renderer.setSize(window.innerWidth, window.innerHeight); composer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            window.removeEventListener('resize', handleResize); renderer.dispose();
            if (mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement);
        };
    }, [flyStartPos]);

    return <div ref={mountRef} className="compass-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />;
});

// --- [主页面] ---
export default function Index() {
    const compassRef = useRef<LingShuCompassRef | null>(null);
    const [phase, setPhase] = useState('idle');
    const [showAction, setShowAction] = useState(true);
    const startPos = useMemo(() => ({ x: 0, y: 30, z: 0 }), []);

    const handleStart = () => {
        if (!compassRef.current) return;
        setPhase('running');
        compassRef.current.startAnimation();
    };

    const handleEnd = () => {
        if (!compassRef.current) return;
        setPhase('ending');
        compassRef.current.endAnimation(() => {
            console.log("=== 破阵入世触发，动画进入高能循环模式 ===");
        });
    };

    const handleAction = () => {
        if (!compassRef.current || !showAction) return;
        setShowAction(false);
        handleStart();
        setTimeout(() => {
            handleEnd();
            setTimeout(() => {
                Taro.navigateTo({ url: '/pages/Liuyao/divination    ' });
            }, 3000);
        }, 4000);
    };

    return (
        <div className="page-index" style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: '#000000', overflow: 'hidden' }}>
            <LingShuCompass
                ref={compassRef}
                flyStartPos={startPos}
                onTransitionComplete={handleEnd}
            />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '96px 0', zIndex: 2 }}>
                <div style={{ textAlign: 'center', transition: 'opacity 0.7s', opacity: phase === 'idle' ? 1 : 0 }}>
                    <h1 style={{ fontSize: '72px', fontWeight: 'bold', letterSpacing: '0.5em', color: '#D4AF37', textShadow: '0 0 30px rgba(212, 175, 55, 0.4)', fontFamily: 'serif', margin: 0 }}>灵 枢</h1>
                    <div style={{ width: '64px', height: '2px', backgroundColor: '#D4AF37', margin: '32px auto', opacity: 0.8 }}></div>
                    <p style={{ fontSize: '24px', letterSpacing: '0.3em', opacity: 0.9, fontWeight: 300, color: '#FFFFFF', fontFamily: 'serif', margin: 0 }}>寂然不动 · 感而遂通</p>
                </div>

            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '32px', pointerEvents: 'auto', position: 'fixed', bottom: '20%', zIndex: 3 }}>
                {showAction && (
                    <button
                        onClick={handleAction}
                        style={{
                            padding: '16px 48px', borderRadius: '999px', border: '1px solid #FFD54F', color: '#FFD54F', boxShadow: '0 0 25px rgba(255, 179, 0, 0.5)',
                            transition: 'all 0.5s',
                            opacity: 1, transform: 'translateY(0)',
                            pointerEvents: 'auto',
                            background: 'rgba(255, 179, 0, 0.1)',
                            fontFamily: 'serif', letterSpacing: '0.2em', cursor: 'pointer'
                        }}
                    >
                        <span style={{ fontSize: '20px', fontWeight: 600 }}>六爻排盘</span>
                    </button>
                )}
            </div>
        </div>
    );
}