import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import { View, Text, Button as TaroButton } from '@tarojs/components'; // 引入 Taro 组件
import Taro from '@tarojs/taro';
import { navigateWithH5Fade } from '@/utils/h5Fade';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import './index.scss'; // 假设您有配套的样式文件，或者直接使用 Tailwind

// --- [类型定义] ---

interface LingShuCompassProps {
  onLoaded?: () => void;
  flyStartPos: { x: number; y: number; z: number };
  onTransitionComplete?: () => void;
}

export interface LingShuCompassRef {
  startAnimation: () => void;
  endAnimation: (callback: () => void) => void;
}

interface LayerConfig {
  size: number;
  speed: number;
  dir: number;
  delay: number;
  offset?: number;
}

// --- [配置常量] ---
const THEME = {
  bg: '#030510',
  primary: '#FFD54F',
  secondary: '#FF8F00',
  energy: '#64FFDA',
  active: '#FFFFFF',
  shockwave: '#FFF176',
  text: '#FFFFFF',
  haze: 0.015,
  yinFish: '#0F172A',

  yangBeam: '#FFFFFF',
  yangGlow: '#FFAB00',
  yinBeam: '#240046',
  yinGlow: '#9D4EDD'
};

const GEO = {
    MESH_SIZE: 6,
    TEX_SIZE: 4096,
    CONTENT_SCALE: 0.85,
    // 归一化偏移量
    EYE_OFFSET_RATIO: 0.215
};

const TAIJI_RADIUS = 3 * 0.98 * GEO.CONTENT_SCALE;
const EYE_OFFSET_2D = GEO.TEX_SIZE * GEO.EYE_OFFSET_RATIO;
const EYE_OFFSET_3D = (GEO.MESH_SIZE / 2) * 0.98 * GEO.CONTENT_SCALE * 0.5; // 近似物理偏移

// --- [数据常量] ---
const DATA = {
  bagua: ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"],
  mountains24: ["壬", "子", "癸", "丑", "艮", "寅", "甲", "卯", "乙", "辰", "巽", "巳", "丙", "午", "丁", "未", "坤", "申", "庚", "酉", "辛", "戌", "乾", "亥"],
  dragons72: [] as string[],
  hexagrams64: [
    { name: "乾", code: 0 }, { name: "夬", code: 42 }, { name: "大有", code: 13 }, { name: "大壮", code: 33 }, { name: "小畜", code: 8 }, { name: "需", code: 4 }, { name: "大畜", code: 25 }, { name: "泰", code: 10 }, { name: "履", code: 9 }, { name: "兑", code: 57 }, { name: "睽", code: 37 }, { name: "归妹", code: 53 }, { name: "中孚", code: 60 }, { name: "节", code: 59 }, { name: "损", code: 40 }, { name: "临", code: 18 }, { name: "同人", code: 12 }, { name: "革", code: 48 }, { name: "离", code: 29 }, { name: "丰", code: 54 }, { name: "家人", code: 36 }, { name: "既济", code: 62 }, { name: "贲", code: 21 }, { name: "明夷", code: 35 }, { name: "无妄", code: 24 }, { name: "随", code: 16 }, { name: "噬嗑", code: 20 }, { name: "震", code: 50 }, { name: "益", code: 41 }, { name: "屯", code: 2 }, { name: "颐", code: 26 }, { name: "复", code: 23 }, { name: "姤", code: 43 }, { name: "大过", code: 27 }, { name: "鼎", code: 49 }, { name: "恒", code: 31 }, { name: "巽", code: 56 }, { name: "井", code: 47 }, { name: "蛊", code: 17 }, { name: "升", code: 45 }, { name: "讼", code: 5 }, { name: "困", code: 46 }, { name: "未济", code: 63 }, { name: "解", code: 39 }, { name: "涣", code: 58 }, { name: "坎", code: 28 }, { name: "蒙", code: 3 }, { name: "师", code: 6 }, { name: "遁", code: 32 }, { name: "咸", code: 30 }, { name: "旅", code: 55 }, { name: "小过", code: 61 }, { name: "渐", code: 52 }, { name: "蹇", code: 38 }, { name: "艮", code: 51 }, { name: "谦", code: 14 }, { name: "否", code: 11 }, { name: "萃", code: 44 }, { name: "晋", code: 34 }, { name: "豫", code: 15 }, { name: "观", code: 19 }, { name: "比", code: 7 }, { name: "剥", code: 22 }, { name: "坤", code: 1 }
  ],
  stars28: ["角", "亢", "氐", "房", "心", "尾", "箕", "斗", "牛", "女", "虚", "危", "室", "壁", "奎", "娄", "胃", "昴", "毕", "觜", "参", "井", "鬼", "柳", "星", "张", "翼", "轸"]
};

const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
for (let i = 0; i < 72; i++) {
  if (i % 6 === 0 || i % 6 === 5) DATA.dragons72.push("正");
  else DATA.dragons72.push(stems[i%10] + branches[i%12]);
}

// --- [Canvas 绘图逻辑] ---

interface TextOpts {
  isUpright?: boolean;
  font?: string;
  color?: string;
  fontSize?: number;
}

const drawRingText = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, data: any[], fontSize = 40, opts: TextOpts = {}) => {
  const { isUpright = false, font = "KaiTi", color = THEME.text } = opts;
  ctx.font = `bold ${fontSize}px "${font}", "STKaiti", serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const count = data.length; const step = (Math.PI * 2) / count;
  for (let i = 0; i < count; i++) {
    const item = data[i]; const angle = i * step - Math.PI / 2;
    ctx.save(); ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    if (!isUpright) ctx.rotate(angle + Math.PI / 2);
    const isSpecial = (item === "正");

    ctx.shadowBlur = 15;
    ctx.shadowColor = isSpecial ? THEME.energy : 'rgba(255, 213, 79, 0.5)';
    ctx.fillStyle = isSpecial ? THEME.energy : color;

    if (typeof item === 'string') { ctx.fillText(item, 0, 0); }
    else if (item.hex) {
        ctx.font = `bold ${fontSize * 1.6}px "Segoe UI Symbol", sans-serif`; ctx.fillText(item.hex, 0, -fontSize * 0.55);
        ctx.font = `bold ${fontSize * 0.7}px "${font}", serif`; ctx.fillText(item.name, 0, fontSize * 0.85);
    }
    ctx.restore();
  }
};

const drawTaiji = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) => {
  ctx.save(); ctx.translate(cx, cy);
  ctx.shadowBlur = 40; ctx.shadowColor = THEME.primary;

  ctx.fillStyle = THEME.yinFish; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();

  const grad = ctx.createLinearGradient(-radius, -radius, radius, radius);
  grad.addColorStop(0, THEME.primary); grad.addColorStop(0.4, '#FFF'); grad.addColorStop(1, THEME.energy);
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(0, 0, radius, Math.PI / 2, -Math.PI / 2, false); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -radius / 2, radius / 2, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = THEME.yinFish; ctx.beginPath(); ctx.arc(0, radius / 2, radius / 2, 0, Math.PI * 2); ctx.fill();

  // 鱼眼 - 使用 EYE_OFFSET_2D 确保对齐
  const eyeR = radius / 6;
  ctx.fillStyle = THEME.yinFish;
  ctx.beginPath(); ctx.arc(0, -EYE_OFFSET_2D, eyeR, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = THEME.energy; ctx.shadowColor = THEME.energy; ctx.shadowBlur = 30;
  ctx.beginPath(); ctx.arc(0, EYE_OFFSET_2D, eyeR, 0, Math.PI * 2); ctx.fill();

  ctx.shadowBlur = 0; ctx.lineWidth = 4; ctx.strokeStyle = THEME.primary;
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
  const drawGlowingCircle = (rad: number, width: number) => {
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI*2); ctx.lineWidth = width;
      const grad = ctx.createLinearGradient(cx - rad, cy, cx + rad, cy);
      grad.addColorStop(0, THEME.primary); grad.addColorStop(0.5, '#FFF'); grad.addColorStop(1, THEME.primary);
      ctx.strokeStyle = grad; ctx.stroke();
  };
  const drawSectorLines = (cx: number, cy: number, radius: number, count: number, innerRadius: number) => {
      ctx.strokeStyle = 'rgba(255, 213, 79, 0.25)'; ctx.lineWidth = 3;
      const step = (Math.PI * 2) / count; const offset = step / 2;
      for (let i = 0; i < count; i++) {
          const angle = i * step + offset - Math.PI / 2;
          ctx.beginPath(); ctx.moveTo(cx + Math.cos(angle) * innerRadius, cy + Math.sin(angle) * innerRadius);
          const endX = cx + Math.cos(angle) * radius; const endY = cy + Math.sin(angle) * radius;
          const grad = ctx.createLinearGradient(cx + Math.cos(angle) * innerRadius, cy + Math.sin(angle) * innerRadius, endX, endY);
          grad.addColorStop(0, THEME.secondary); grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.strokeStyle = grad; ctx.lineTo(endX, endY); ctx.stroke();
      }
  };
  const drawBand = (outerR: number, innerR: number, count: number, data: any[], textOpts: TextOpts = {}) => {
      drawGlowingCircle(outerR, 6); drawGlowingCircle(innerR, 4);
      drawSectorLines(cx, cy, outerR, count, innerR);
      const textR = innerR + (outerR - innerR) / 2; const bandHeight = outerR - innerR;
      const autoFontSize = textOpts.fontSize || bandHeight * 0.45;
      drawRingText(ctx, cx, cy, textR, data, autoFontSize, textOpts);
  };
  switch (idx) {
    case 0: drawTaiji(ctx, cx, cy, r * GEO.CONTENT_SCALE); break;
    case 1: drawBand(r, r*0.7, 8, DATA.bagua, {font:"Segoe UI Symbol", fontSize: 240}); break;
    case 2: drawBand(r, r*0.82, 24, DATA.mountains24, {isUpright:false, fontSize: 130}); break;
    case 3: drawBand(r, r*0.88, 72, DATA.dragons72, {isUpright:false, fontSize: 70}); break;
    case 4: drawBand(r, r*0.85, 24, DATA.mountains24, {color:THEME.secondary, isUpright:false, fontSize: 100}); break;
    case 5: drawBand(r, r*0.78, 64, DATA.hexagrams64.map(g => ({name:g.name, hex:String.fromCharCode(0x4DC0+g.code)})), {isUpright:false, fontSize: 85}); break;
    case 6: drawBand(r, r*0.85, 24, DATA.mountains24, {color:THEME.text, isUpright:false, fontSize: 100}); break;
    case 7: drawBand(r, r*0.88, 28, DATA.stars28, {isUpright:false, fontSize: 100});
        const tickR = r * 0.88; ctx.strokeStyle = 'rgba(255, 213, 79, 0.4)'; ctx.lineWidth = 4;
        for(let i=0; i<365; i++) {
             const angle = (i/365)*Math.PI*2; ctx.beginPath();
             ctx.moveTo(cx + Math.cos(angle)*(tickR-30), cy + Math.sin(angle)*(tickR-30));
             ctx.lineTo(cx + Math.cos(angle)*tickR, cy + Math.sin(angle)*tickR); ctx.stroke();
        } break;
  }
  const tex = new THREE.CanvasTexture(canvas); tex.anisotropy = 16; return tex;
};

// --- [3D 几何] ---
const createTaijiShapes = (R: number) => {
    const yangShape = new THREE.Shape();
    yangShape.moveTo(0, R);
    yangShape.absarc(0, 0, R, Math.PI / 2, 3 * Math.PI / 2, false);
    yangShape.absarc(0, -R/2, R/2, 3 * Math.PI / 2, Math.PI / 2, true);
    yangShape.absarc(0, R/2, R/2, 3 * Math.PI / 2, Math.PI / 2, false);

    const yinShape = new THREE.Shape();
    yinShape.moveTo(0, R);
    yinShape.absarc(0, 0, R, Math.PI / 2, 3 * Math.PI / 2, true);
    yinShape.absarc(0, -R/2, R/2, 3 * Math.PI / 2, Math.PI / 2, false);
    yinShape.absarc(0, R/2, R/2, 3 * Math.PI / 2, Math.PI / 2, true);

    return { yangShape, yinShape };
};

// --- [组件] ---
const LingShuCompass = forwardRef<LingShuCompassRef, LingShuCompassProps>(({ onLoaded, flyStartPos, onTransitionComplete }, ref) => {
  const mountRef = useRef<HTMLDivElement>(null); // H5 模式下这里是 div
  const layersRef = useRef<THREE.Mesh[]>([]);
  const shockwavesRef = useRef<any[]>([]);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const yangPillarRef = useRef<THREE.Mesh | null>(null);
  const yinPillarRef = useRef<THREE.Mesh | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  const stateRef = useRef({
      phase: 'init',
      timeline: 0,
      energy: 0,
      shake: 0,
      onExitComplete: null as (() => void) | null,
      hasLoaded: false
  });

  useImperativeHandle(ref, () => ({
    startAnimation: () => {
      if (stateRef.current.phase === 'init') {
          stateRef.current.phase = 'entering';
          stateRef.current.timeline = 0;
          stateRef.current.energy = 0;
      }
    },
    endAnimation: (callback) => {
      if (stateRef.current.phase === 'active' || stateRef.current.phase === 'entering') {
          stateRef.current.phase = 'exiting';
          stateRef.current.timeline = 0;
          stateRef.current.onExitComplete = callback;
      }
    }
  }));

  const fitCameraToObject = (camera: THREE.PerspectiveCamera, objectSize = 65, aspectRatio: number) => {
      const vFOV = THREE.MathUtils.degToRad(camera.fov);
      let dist = aspectRatio < 1 ? objectSize / (2 * Math.tan(vFOV / 2) * aspectRatio) : objectSize / (2 * Math.tan(vFOV / 2));
      return Math.max(dist, 40);
  };

  useEffect(() => {
    // 重置引用
    layersRef.current = []; shockwavesRef.current = [];
    stateRef.current = { phase: 'init', timeline: 0, energy: 0, shake: 0, hasLoaded: false, onExitComplete: null };

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(THEME.bg, THEME.haze);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;
    const initialZ = fitCameraToObject(camera, 52, window.innerWidth / window.innerHeight);
    camera.position.set(0, -40, initialZ);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;

    if (mountRef.current) {
        while(mountRef.current.firstChild) mountRef.current.removeChild(mountRef.current.firstChild);
        mountRef.current.appendChild(renderer.domElement);
    }

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.strength = 1.3; bloomPass.radius = 0.5; bloomPass.threshold = 0.2;
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene); composer.addPass(bloomPass);

    const compassGroup = new THREE.Group();
    scene.add(compassGroup);

    // 冲击波
    const createShockwaveGroup = () => {
        const group = new THREE.Group();
        const wallGeo = new THREE.CylinderGeometry(1, 1, 2, 64, 1, true);
        wallGeo.rotateX(Math.PI / 2);
        const wallMat = new THREE.MeshBasicMaterial({ color: THEME.shockwave, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
        const wall = new THREE.Mesh(wallGeo, wallMat);
        const groundGeo = new THREE.RingGeometry(0.8, 1, 64);
        const groundMat = new THREE.MeshBasicMaterial({ color: THEME.energy, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        group.add(wall); group.add(ground); group.visible = false;
        return { group, wall, ground, active: false, time: 0 };
    };
    for(let i=0; i<10; i++) {
        const waveObj = createShockwaveGroup(); scene.add(waveObj.group); shockwavesRef.current.push(waveObj);
    }
    const triggerShockwave = (size: number, zPos: number) => {
        const wave = shockwavesRef.current.find(w => !w.active);
        if(wave) {
            wave.active = true; wave.time = 0; wave.group.visible = true;
            wave.group.position.z = zPos;
            wave.wall.scale.set(size/2, size/2, 0.1); wave.wall.material.opacity = 1;
            wave.ground.scale.setScalar(size/2); wave.ground.material.opacity = 1;
        }
    };

    // 层级
    const layerConfigs = [
      { size: GEO.MESH_SIZE,  speed: 0.002, dir: 1,  delay: 0 },
      { size: 12, speed: 0.001, dir: -1, delay: 0.4 },
      { size: 18, speed: 0.0005, dir: 1,  delay: 0.7 },
      { size: 24, speed: 0.0005, dir: 1,  delay: 1.0 },
      { size: 30, speed: 0.0008, dir: -1, delay: 1.3, offset: -0.13 },
      { size: 38, speed: 0.0006, dir: 1,  delay: 1.6 },
      { size: 44, speed: 0.0012, dir: -1, delay: 1.9, offset: 0.13 },
      { size: 52, speed: 0.0016, dir: 1,  delay: 2.2 }
    ];

    layerConfigs.forEach((cfg, idx) => {
      const tex = createLayerTexture(idx);
      const mat = new THREE.MeshBasicMaterial({
        map: tex, transparent: true, opacity: 0, side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending, depthWrite: false, color: new THREE.Color(THEME.primary)
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(cfg.size, cfg.size), mat);
      mesh.position.z = idx * 0.1;
      if (cfg.offset) mesh.rotation.z = cfg.offset;
      mesh.userData = { cfg, currentRot: cfg.offset || 0, hasLanded: false, flashIntensity: 0 };

      if (idx === 0) {
          mesh.material.opacity = 1;
          const { yangShape, yinShape } = createTaijiShapes(TAIJI_RADIUS);
          const extrudeSettings = { depth: 300, bevelEnabled: false, curveSegments: 32 };

          const yangGeo = new THREE.ExtrudeGeometry(yangShape, extrudeSettings);
          const yangMat = new THREE.MeshBasicMaterial({ color: THEME.yangBeam, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false });
          const yangPillar = new THREE.Mesh(yangGeo, yangMat);
          yangPillar.position.z = 0.1; yangPillar.scale.set(1, 1, 0);
          mesh.add(yangPillar); yangPillarRef.current = yangPillar;

          const yinGeo = new THREE.ExtrudeGeometry(yinShape, extrudeSettings);
          const yinMat = new THREE.MeshBasicMaterial({ color: THEME.yinGlow, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false });
          const yinPillar = new THREE.Mesh(yinGeo, yinMat);
          yinPillar.position.z = 0.1; yinPillar.scale.set(1, 1, 0);
          mesh.add(yinPillar); yinPillarRef.current = yinPillar;
      } else {
          mesh.material.opacity = 0; mesh.scale.setScalar(0);
      }
      compassGroup.add(mesh); layersRef.current.push(mesh);
    });

    const createParticles = () => {
        const geo = new THREE.BufferGeometry(); const pos = new Float32Array(1500 * 3);
        for(let i=0; i<1500; i++) {
            const r = 10 + Math.random() * 80; const th = Math.random()*Math.PI*2;
            pos[i*3]=Math.cos(th)*r; pos[i*3+1]=Math.sin(th)*r; pos[i*3+2]=(Math.random()-0.5)*40;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({color: THEME.energy, size: 0.4, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending});
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

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const dt = clock.getDelta(); const state = stateRef.current;
      if (state.phase === 'done') { composer.render(); return; }
      state.timeline += dt;

      if (state.phase === 'init') {
          const taiji = layersRef.current[0]; if (taiji) taiji.rotation.z += 0.005;
          if (onLoaded && !state.hasLoaded) { onLoaded(); state.hasLoaded = true; }
      }
      else if (state.phase === 'entering') {
          const taiji = layersRef.current[0]; if (taiji) taiji.rotation.z += 0.005;
          const pillarT = Math.min(state.timeline / 1.5, 1); const pEase = easeOutCubic(pillarT);
          if(yangPillarRef.current) { yangPillarRef.current.scale.set(1, 1, pEase * 0.5); yangPillarRef.current.material.opacity = pEase * 0.8; }
          if(yinPillarRef.current) { yinPillarRef.current.scale.set(1, 1, pEase * 0.5); yinPillarRef.current.material.opacity = pEase * 0.5; }

          layersRef.current.forEach((mesh, i) => {
              if (i === 0) return;
              const { delay, offset=0, size } = mesh.userData.cfg;
              if (state.timeline > delay) {
                  const p = Math.min((state.timeline - delay)/0.6, 1); const ease = easeOutBack(p);
                  mesh.scale.setScalar(ease); mesh.material.opacity = p;
                  mesh.rotation.z = offset + (1-ease) * 0.2 * (i%2===0?1:-1);
                  if (p > 0.1 && !mesh.userData.hasLanded) {
                      mesh.userData.hasLanded = true; mesh.userData.flashIntensity = 1.0;
                      state.shake += 0.5; triggerShockwave(size, mesh.position.z);
                  }
              }
              if (mesh.userData.flashIntensity > 0.01) {
                  mesh.userData.flashIntensity *= 0.85;
                  mesh.material.color.copy(new THREE.Color(THEME.primary)).lerp(new THREE.Color(THEME.shockwave), mesh.userData.flashIntensity);
              } else { mesh.material.color.set(THEME.primary); }
          });
          if (state.timeline > 3.0) state.phase = 'active';
      }
      else if (state.phase === 'active') {
          layersRef.current.forEach((mesh) => {
              const { speed, dir } = mesh.userData.cfg;
              mesh.userData.currentRot += speed * dir;
              mesh.rotation.z = mesh.userData.currentRot;
              mesh.material.color.set(THEME.primary);
          });
          const time = clock.elapsedTime;
          if(yangPillarRef.current) yangPillarRef.current.material.opacity = 0.8 + Math.sin(time*2)*0.1;
          if(yinPillarRef.current) yinPillarRef.current.material.opacity = 0.5 + Math.cos(time*2)*0.1;
      }
      else if (state.phase === 'exiting') {
          if (state.timeline < 1.0) {
              const t = state.timeline / 1.0; const ease = easeInOutQuad(t);
              if (cameraRef.current) {
                  const startY = -40; const targetY = 0; const currentY = THREE.MathUtils.lerp(startY, targetY, ease);
                  const startZ = fitCameraToObject(cameraRef.current, 52, window.innerWidth/window.innerHeight);
                  const targetZ = startZ * 1.2; const currentZ = THREE.MathUtils.lerp(startZ, targetZ, ease);
                  cameraRef.current.position.set(0, currentY, currentZ); cameraRef.current.lookAt(0, 0, 0);
              }
          } else if (cameraRef.current) { cameraRef.current.lookAt(0, 0, 0); }

          if (state.timeline > 0.8) {
              const blastTime = Math.min((state.timeline - 0.8) / 1.2, 1);
              const blastEase = easeInExpo(blastTime);
              if (yangPillarRef.current) {
                  yangPillarRef.current.scale.z = 0.5 + blastEase * 20;
                  yangPillarRef.current.material.opacity = 0.8 + blastTime * 0.2;
              }
              if (yinPillarRef.current) {
                  yinPillarRef.current.scale.z = 0.5 + blastEase * 20;
                  yinPillarRef.current.material.opacity = 0.5 + blastTime * 0.2;
              }
              layersRef.current.forEach((mesh) => { mesh.rotation.z += 0.1 * mesh.userData.cfg.dir; });
              bloomPass.strength = 1.0 + blastEase * 10.0; bloomPass.radius = 0.6 + blastEase * 3.0;

              if (blastTime >= 0.95) {
                  state.phase = 'done'; if (state.onExitComplete) state.onExitComplete();
                  if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
                  composer.render(); return;
              }
          }
      }

      shockwavesRef.current.forEach(wave => {
          if (wave.active) {
              wave.time += dt; const life = 0.5; const progress = wave.time / life;
              if (progress >= 1) { wave.active = false; wave.group.visible = false; }
              else {
                  const easeP = 1 - Math.pow(1 - progress, 3);
                  wave.wall.scale.set(1 + easeP * 0.5, 1 + easeP * 0.5, 1 + easeP * 2);
                  wave.wall.material.opacity = 1 - easeP;
                  wave.ground.scale.multiplyScalar(1.05); wave.ground.material.opacity = 1 - easeP;
              }
          }
      });

      state.shake *= 0.9;
      if (state.phase !== 'exiting' && cameraRef.current) {
          const baseZ = cameraRef.current.position.z; const baseY = cameraRef.current.position.y;
          cameraRef.current.position.y = baseY + (Math.random() - 0.5) * state.shake;
          cameraRef.current.position.z = baseZ + (Math.random() - 0.5) * state.shake;
      }
      if (particlesRef.current) particlesRef.current.rotation.z += 0.002;
      composer.render();
    };
    animate();

    const handleResize = () => {
      if (cameraRef.current) {
          const aspect = window.innerWidth / window.innerHeight; cameraRef.current.aspect = aspect; cameraRef.current.updateProjectionMatrix();
          const newZ = fitCameraToObject(cameraRef.current, 52, aspect);
          cameraRef.current.position.z = newZ;
      }
      renderer.setSize(window.innerWidth, window.innerHeight); composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => {
        if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        window.removeEventListener('resize', handleResize); renderer.dispose();
        if(mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement);
    };
  }, [flyStartPos]);

  return <View ref={mountRef} className="compass-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />;
});

// --- [主页面] ---
export default function Index() {
  const compassRef = useRef<LingShuCompassRef>(null);
  const [phase, setPhase] = useState<'idle' | 'running' | 'ending'>('idle');
  const startPos = useMemo(() => ({ x: 0, y: 30, z: 0 }), []);
  const targetUrlRef = useRef('/pages/Liuyao/divination/index');
  const pagePreloadedRef = useRef(false);

  const handleStart = () => {
    if (!compassRef.current) return;
    setPhase('running');
    compassRef.current.startAnimation();

    // 立即开始预加载目标页面
    const targetUrl = targetUrlRef.current;
    const isH5 = process.env.TARO_ENV === 'h5';

    console.log('[Page Preload] 开始预加载页面:', targetUrl);

    if (isH5) {
      // H5 环境：预加载页面的 JS chunk
      // 通过动态导入预热路由对应的组块
      import('@/pages/Liuyao/divination/index')
        .then(() => {
          console.log('[Page Preload] H5 页面预加载成功');
          pagePreloadedRef.current = true;
        })
        .catch((err) => {
          console.warn('[Page Preload] H5 页面预加载失败:', err);
        });

      // 同时尝试预加载相关依赖
      import('@/store/liuyao').catch(() => {});
      import('@/utils/h5Fade').catch(() => {});
    } else {
      // 小程序环境：使用平台特定的预加载 API
      const isWeChat = typeof (wx as any) !== 'undefined';
      if (isWeChat && (wx as any).preloadPage) {
        (wx as any).preloadPage({
          url: targetUrl
        });
        console.log('[Page Preload] 微信小程序预加载已触发');
      } else {
        console.log('[Page Preload] 该平台不支持预加载，将在跳转时加载');
      }
    }

    // 动画播放 2.5 秒后自动进入退出阶段
    setTimeout(() => {
      handleEnd();
    }, 2500);
  };

  const handleEnd = () => {
    if (!compassRef.current) return;
    setPhase('ending');
    compassRef.current.endAnimation(() => {
      console.log("=== 穿越完成，准备跳转 ===");

      // 动画结束立即跳转（页面应该已经预加载完成）
      const targetUrl = targetUrlRef.current;
      const isH5 = process.env.TARO_ENV === 'h5';

      if (isH5) {
        navigateWithH5Fade(targetUrl);
      } else {
        Taro.navigateTo({ url: targetUrl });
      }
    });
  };

  return (
    <View className="page-index" style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: '#020408', overflow: 'hidden' }}>
      <LingShuCompass
        ref={compassRef}
        flyStartPos={startPos}
        onTransitionComplete={handleEnd}
      />
      <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '96px 0' }}>
        <View style={{ textAlign: 'center', transition: 'opacity 0.7s', opacity: phase === 'idle' ? 1 : 0 }}>
          <Text style={{ fontSize: '60px', fontWeight: 'bold', letterSpacing: '0.5em', color: '#FFD54F', textShadow: '0 0 20px rgba(255,213,79,0.5)' }}>灵 枢</Text>
          <View style={{ width: '48px', height: '1px', backgroundColor: '#FFD54F', margin: '24px auto', opacity: 0.8 }}></View>
          <Text style={{ fontSize: '20px', letterSpacing: '0.3em', opacity: 0.9, fontWeight: 300, color: '#F0F4F8' }}>寂然不动 · 感而遂通</Text>
        </View>
        <View style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '32px', pointerEvents: 'auto' }}>
          <View
            onClick={handleStart}
            className={phase !== 'idle' ? 'btn-disabled' : ''}
            style={{
              padding: '12px 40px', borderRadius: '999px', border: '1px solid #FFD54F', color: '#FFD54F',
              transition: 'all 0.5s', opacity: phase === 'idle' ? 1 : 0, transform: phase === 'idle' ? 'translateY(0)' : 'translateY(40px)',
              pointerEvents: phase === 'idle' ? 'auto' : 'none'
            }}
          >
            <Text style={{ fontSize: '18px', letterSpacing: '0.2em', fontWeight: 500 }}>开启灵境</Text>
          </View>
          <View
            onClick={handleEnd}
            style={{
              padding: '12px 40px', borderRadius: '999px', border: '1px solid #7DF9FF', color: '#7DF9FF', boxShadow: '0 0 20px #7DF9FF',
              position: 'absolute', bottom: '96px', transition: 'all 0.5s',
              opacity: phase === 'running' ? 1 : 0, transform: phase === 'running' ? 'translateY(0)' : 'translateY(40px)',
              pointerEvents: phase === 'running' ? 'auto' : 'none'
            }}
          >
            <Text style={{ fontSize: '18px', letterSpacing: '0.2em', fontWeight: 500 }}>破阵入世</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
