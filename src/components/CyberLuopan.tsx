import React, { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { GroupProps, useFrame } from '@react-three/fiber'
import { generateRingTexture, generateTaijiThreeTexture } from '@/utils/luopanTexture'
import { LUOPAN_LAYERS as DATA_LAYERS } from '@/constants/luopanData'

// ============ 几何参数配置 ============
const LAYER_COUNT = DATA_LAYERS.length
const RING_RADII = DATA_LAYERS.map((_, idx) => 1.2 + idx * 0.55) // 根据层数动态生成半径
const TUBE_RADIUS = 0.9 // 圆环的"厚度"（管道半径），值越小圆环越扁
const RADIAL_SEGMENTS = 12 // 圆环截面的分段数（圆的平滑度），值越大越圆滑
const TUBULAR_SEGMENTS = 128 // 圆环周长的分段数（整圆的平滑度）

// ============ 动画速度参数 ============
const IDLE_SPEED = 0.002 // 待机状态：圆环极慢自转的速度
const COMPUTING_SPEED_MIN = 0.08 // 演算状态：最小旋转速度
const COMPUTING_SPEED_MAX = 0.15 // 演算状态：最大旋转速度（随机变化）
const IDLE_DAMPING = 0.05 // 待机阻尼：速度变化的"粘滞度"（大=反应慢）
const COMPUTING_DAMPING = 0.02 // 演算阻尼：速度变化快速（小=反应灵敏）

// 每层圆环的相对转速倍数（正数=顺时针，负数=逆时针）
// 通过基础序列循环分配，让不同层方向和速度有差异感
const BASE_SPEEDS = [1.0, -0.8, 0.6, -0.5, 0.4]
const LAYER_SPEED_MULTIPLIERS = Array.from({ length: LAYER_COUNT }, (_, idx) => BASE_SPEEDS[idx % BASE_SPEEDS.length])

// ============ 速度向量类型定义 ============
// 用于存储每层圆环在 X、Y、Z 三个轴上的旋转速度
interface Velocity {
  x: number // X轴旋转速度（绕左右轴旋转）
  y: number // Y轴旋转速度（绕上下轴旋转）
  z: number // Z轴旋转速度（绕前后轴旋转）
}

// ============ 组件Props类型 ============
interface CyberLuopanProps extends GroupProps {
  isComputing?: boolean // 是否处于演算状态
  animationState?: 'idle' | 'flyIn' | 'rotating' // 动画阶段：待机/飞入/旋转
}

const CyberLuopan: React.FC<CyberLuopanProps> = ({ isComputing = false, animationState = 'idle', ...props }) => {
  // ============ React引用（不触发重渲染） ============
  const groupRef = useRef<THREE.Group>(null) // 整个3D场景容器的引用
  const meshesRef = useRef<THREE.Mesh[]>([]) // 圆环网格对象的引用数组（层数由数据决定）
  const taijiMeshRef = useRef<THREE.Mesh>(null) // 中心太极图的引用

  // 飞入动画进度（0-1）：0表示未开始，1表示完成
  const flyInProgressRef = useRef(0)

  // 每层圆环的随机飞入起始位置（离屏幕中心很远的地方）
  const randomStartPositionsRef = useRef<Array<{ x: number; y: number; z: number }>>([])

  // 当前速度：每层圆环实时的旋转速度向量
  const velocitiesRef = useRef<Velocity[]>(Array.from({ length: LAYER_COUNT }, () => ({ x: 0, y: 0, z: 0 })))

  // 目标速度：我们想要达到的旋转速度（通过阻尼逐渐靠近这个值）
  const targetVelocitiesRef = useRef<Velocity[]>(Array.from({ length: LAYER_COUNT }, () => ({ x: 0, y: 0, z: 0 })))

  // ============ 初始旋转角度 ============
  // 在飞入动画之前，为每层圆环设置随机的初始旋转（让场景看起来更立体）
  const initialRotations = useMemo(
    () =>
      RING_RADII.map(() =>
        new THREE.Euler(
          Math.random() * Math.PI * 2, // X轴随机旋转角度（0-360度）
          Math.random() * Math.PI * 2, // Y轴随机旋转角度
          Math.random() * Math.PI * 2  // Z轴随机旋转角度
        )
      ),
    []
  )

  // ============ 平面旋转角度 ============
  // 飞入动画完成后，所有圆环都应该旋转到"平面"状态（所有文字正对摄像机）
  // Math.PI / 2 = 90度，X轴旋转90度使圆环平面朝向屏幕
  const flatRotations = useMemo(
    () =>
      RING_RADII.map(() =>
        new THREE.Euler(Math.PI / 2, 0, 0) // 只绕X轴旋转90度
      ),
    []
  )

  // ============ 纹理资源 ============
  // 为每层圆环生成对应的纹理（包含文字：天干、地支、八卦等）
  const textures = useMemo(() => RING_RADII.map((_, i) => generateRingTexture(i)), [])
  // 中心太极图的纹理（黑白阴阳图）
  const taijiTexture = useMemo(() => generateTaijiThreeTexture(), [])

  // ============ 初始化飞入起始位置 ============
  // 这个Effect只执行一次，为每层圆环设置一个随机的、离屏幕很远的起始位置
  // 目的是让圆环看起来像从宇宙边缘飞入屏幕
  useEffect(() => {
    randomStartPositionsRef.current = RING_RADII.map(() => {
      const distance = 15 + Math.random() * 20 // 距离屏幕中心15-35单位
      const angle = Math.random() * Math.PI * 2 // 随机圆周角度
      const z = -8 - Math.random() * 8 // 深度：-8到-16（负数表示在摄像机后方）

      return {
        x: Math.cos(angle) * distance, // 圆周上的X坐标
        y: Math.sin(angle) * distance, // 圆周上的Y坐标
        z: z
      }
    })
  }, [])

  // ============ 动态更新目标速度 ============
  // 根据动画状态（idle/flyIn/rotating）和是否演算，计算每层圆环应该旋转的速度
  useEffect(() => {
    targetVelocitiesRef.current = velocitiesRef.current.map((_, i) => {
      const multiplier = LAYER_SPEED_MULTIPLIERS[i] // 该层的相对速度倍数

      // 只有 rotating 状态才会旋转
      if (animationState === 'rotating') {
        if (isComputing) {
          // ========== 演算模式 ==========
          // Z轴高速旋转 + 少量X/Y轴扰动（造成摇晃感）
          const speed = COMPUTING_SPEED_MIN + Math.random() * (COMPUTING_SPEED_MAX - COMPUTING_SPEED_MIN)
          return {
            x: (Math.random() - 0.5) * speed * 0.3, // 随机X轴扰动
            y: (Math.random() - 0.5) * speed * 0.3, // 随机Y轴扰动
            z: speed * multiplier // 主旋转轴（可能顺时针或逆时针）
          }
        } else {
          // ========== 待机模式 ==========
          // 只在Z轴平缓自转，每层以不同方向和速度
          return {
            x: 0,
            y: 0,
            z: IDLE_SPEED * multiplier // 待机速度 × 该层倍数
          }
        }
      }

      // idle 和 flyIn 状态不旋转（速度为0）
      return { x: 0, y: 0, z: 0 }
    })
  }, [isComputing, animationState])

  // ============ 动画帧更新（每帧执行一次） ============
  // useFrame是React Three Fiber提供的钩子，在每次屏幕刷新时调用
  useFrame(({ camera, clock }) => {
    if (!groupRef.current) return

    // ========== 飞入动画控制 ==========
    // 如果处于飞入状态，逐帧增加进度值
    if (animationState === 'flyIn' && flyInProgressRef.current < 1) {
      flyInProgressRef.current = Math.min(flyInProgressRef.current + 0.02, 1) // 每帧增加2%，共50帧完成
    }

    // 选择当前应该使用的阻尼值
    const damping = isComputing ? COMPUTING_DAMPING : IDLE_DAMPING

    // ========== 太极图动画 ==========
    if (taijiMeshRef.current) {
      // 根据演算状态调整自转速度
      const taijiSpinSpeed = isComputing ? 0.12 : 0.04
      taijiMeshRef.current.rotation.z += taijiSpinSpeed // Z轴旋转

      // 脉冲发光效果（正弦波控制发光强度）
      const pulsate = Math.sin(clock.getElapsedTime() * 2) * 0.3 + 1 // 0.7-1.3之间振荡
      const material = taijiMeshRef.current.material as any
      if (material && material.emissiveIntensity !== undefined) {
        material.emissiveIntensity = 0.8 * pulsate // 发光强度随脉冲变化
      }

      // 浮动效果（上下微微摆动）
      const floatOffset = Math.sin(clock.getElapsedTime() * 0.5) * 0.05 // Z轴上下浮动
      taijiMeshRef.current.position.z = floatOffset

      // 让太极图始终面向摄像机（解决朝向问题）
      taijiMeshRef.current.lookAt(camera.position)
    }

    // ========== 圆环动画 ==========
    // 逐层更新每个圆环的位置、旋转和可见性
    meshesRef.current.forEach((mesh, i) => {
      // ===== 飞入动画位置和旋转 =====
      if (animationState === 'idle') {
        // 待机状态：圆环在屏幕外，隐藏不显示
        const startPos = randomStartPositionsRef.current[i]
        mesh.position.copy(startPos as any) // 设置到随机远处位置
        mesh.rotation.copy(flatRotations[i]) // 设置为平面旋转
        mesh.visible = false // 隐藏（因为还没开始飞入）

      } else if (animationState === 'flyIn') {
        // 飞入动画状态：圆环从远处飞向屏幕中心
        const startPos = randomStartPositionsRef.current[i]
        const progress = flyInProgressRef.current // 0-1的进度值
        // easeOutCubic：加速度曲线（开始快，后期变慢，让动画看起来更自然）
        const easeProgress = 1 - Math.pow(1 - progress, 3)

        // 位置插值：从起始位置逐渐飞向原点(0,0,0)
        mesh.position.x = startPos.x * (1 - easeProgress)
        mesh.position.y = startPos.y * (1 - easeProgress)
        mesh.position.z = startPos.z * (1 - easeProgress)

        // 旋转插值：从随机旋转逐渐变为平面旋转
        mesh.rotation.x = THREE.MathUtils.lerp(
          initialRotations[i].x,
          flatRotations[i].x,
          easeProgress
        )
        mesh.rotation.y = THREE.MathUtils.lerp(
          initialRotations[i].y,
          flatRotations[i].y,
          easeProgress
        )
        mesh.rotation.z = THREE.MathUtils.lerp(
          initialRotations[i].z,
          flatRotations[i].z,
          easeProgress
        )

        mesh.visible = true // 显示圆环

      } else {
        // 旋转状态（rotating）：圆环在原点，只旋转不移动
        mesh.position.set(0, 0, 0) // 固定在屏幕中心
        // mesh.visible = true // 显示圆环
      }

      // ===== 旋转动画（仅在 rotating 状态） =====
      // 这里实现速度的平滑过渡（模拟惯性和摩擦力）
      if (animationState === 'rotating') {
        const vel = velocitiesRef.current[i] // 当前速度
        const target = targetVelocitiesRef.current[i] // 目标速度

        // 线性插值：当前速度逐步向目标速度靠近
        // 公式：新速度 = 旧速度 * (1-阻尼) + 目标速度 * 阻尼
        vel.x = THREE.MathUtils.lerp(vel.x, target.x, damping)
        vel.y = THREE.MathUtils.lerp(vel.y, target.y, damping)
        vel.z = THREE.MathUtils.lerp(vel.z, target.z, damping)

        // 应用速度到旋转角度
        // 每帧累加速度到旋转角度，实现连续旋转
        mesh.rotation.x += vel.x
        mesh.rotation.y += vel.y
        mesh.rotation.z += vel.z
      }
    })
  })

  // ============ 渲染结构 ============
  return (
    <group ref={groupRef} {...props}>
      {/* 中心太极图（黑白阴阳） */}
      <mesh ref={taijiMeshRef} position={[0, 0, 0]} rotation={[0, 0, 0]} renderOrder={100}>
        {/* 厚版太极圆盘：半径0.6，高度0.12，64边形 */}
        <cylinderGeometry args={[0.6, 0.6, 0.12, 64]} />
        {/* 金属质感材质，贴图和自发光 */}
        <meshStandardMaterial
          map={taijiTexture}
          transparent={false}
          side={THREE.DoubleSide}
          metalness={0.65}
          roughness={0.35}
          emissive="#FFD700"
          emissiveIntensity={0.9}
          depthTest={false}
        />
      </mesh>

      {/* 圆环（罗盘层级，层数随数据动态生成） */}
      {RING_RADII.map((radius, i) => (
        <mesh
          key={radius}
          ref={(el) => {
            // 将网格对象存入数组引用中
            if (el) meshesRef.current[i] = el
          }}
          rotation={initialRotations[i]} // 初始随机旋转
          renderOrder={i} // 渲染顺序（内层先绘制，外层后绘制）
        >
          {/* 圆环(甜甜圈)几何体 */}
          {/* 参数：[大半径, 管道半径, 径向分段数, 周向分段数] */}
          <torusGeometry
            args={[radius, TUBE_RADIUS, RADIAL_SEGMENTS, TUBULAR_SEGMENTS]}
          />
          {/* 标准网格材质（支持贴图发光） */}
          <meshStandardMaterial
            metalness={1.0} // 提升金属感
            roughness={0.25}
            map={textures[i]} // 应用纹理贴图（文字）
            emissive="#FFD700" // 自发光颜色（金色）
            emissiveMap={textures[i]} // 自发光贴图（根据纹理的亮度自发光）
            emissiveIntensity={2.5} // 自发光强度很高（明亮的金色发光）
            transparent // 启用透明度支持
            opacity={1.0} // 完全不透明
            alphaTest={0.1} // 透明度测试阈值（小于0.1的像素完全透明）
          />
        </mesh>
      ))}
    </group>
  )
}

export default CyberLuopan
