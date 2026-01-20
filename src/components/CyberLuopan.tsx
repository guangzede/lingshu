import React, { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { GroupProps, useFrame } from '@react-three/fiber'
import { generateRingTexture, generateTaijiThreeTexture } from '@/utils/luopanTexture'

const RING_RADII = [1.5, 2.0, 2.5, 3.0, 3.5]
const TUBE_RADIUS = 0.2
const RADIAL_SEGMENTS = 4 // keep section rectangular for a flat metal band
const TUBULAR_SEGMENTS = 64

// 动画参数
const IDLE_SPEED = 0.002 // 待机自转速度
const COMPUTING_SPEED_MIN = 0.08 // 演算最小速度
const COMPUTING_SPEED_MAX = 0.15 // 演算最大速度
const IDLE_DAMPING = 0.05 // 待机阻尼（较大，过渡缓慢）
const COMPUTING_DAMPING = 0.02 // 演算阻尼（较小，加速快）

// 每层旋转速度倍数（让每层以不同速度自转）
const LAYER_SPEED_MULTIPLIERS = [1.0, -0.8, 0.6, -0.5, 0.4]

interface Velocity {
  x: number
  y: number
  z: number
}

interface CyberLuopanProps extends GroupProps {
  isComputing?: boolean
  animationState?: 'idle' | 'flyIn' | 'rotating' // 动画状态
}

const CyberLuopan: React.FC<CyberLuopanProps> = ({ isComputing = false, animationState = 'idle', ...props }) => {
  const groupRef = useRef<THREE.Group>(null)
  const meshesRef = useRef<THREE.Mesh[]>([])
  const taijiMeshRef = useRef<THREE.Mesh>(null)

  // 飞入动画进度（0-1）
  const flyInProgressRef = useRef(0)

  // 生成随机飞入起始位置（每个环独立）
  const randomStartPositionsRef = useRef<Array<{ x: number; y: number; z: number }>>([])

  // 速度向量引用（不触发重渲染）
  const velocitiesRef = useRef<Velocity[]>([
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 }
  ])

  const targetVelocitiesRef = useRef<Velocity[]>([
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 }
  ])

  const initialRotations = useMemo(
    () =>
      RING_RADII.map(() =>
        new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        )
      ),
    []
  )

  // 标准平面旋转（将圆环文字正对窗口，所有圆盘在同一平面）
  const flatRotations = useMemo(
    () =>
      RING_RADII.map(() =>
        new THREE.Euler(Math.PI / 2, 0, 0) // X轴旋转90度，使文字正对摄像机
      ),
    []
  )

  const textures = useMemo(() => RING_RADII.map((_, i) => generateRingTexture(i)), [])
  const taijiTexture = useMemo(() => generateTaijiThreeTexture(), [])

  // 初始化随机飞入位置（仅一次）
  useEffect(() => {
    randomStartPositionsRef.current = RING_RADII.map(() => {
      const distance = 15 + Math.random() * 20 // 15-35 范围的距离
      const angle = Math.random() * Math.PI * 2 // 随机角度
      const z = -8 - Math.random() * 8 // -8 到 -16 的 z 坐标

      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        z: z
      }
    })
  }, [])

  // 更新目标速度
  useEffect(() => {
    targetVelocitiesRef.current = velocitiesRef.current.map((_, i) => {
      const multiplier = LAYER_SPEED_MULTIPLIERS[i]

      // 只有在 rotating 状态才旋转
      if (animationState === 'rotating') {
        if (isComputing) {
          // 演算模式：Z轴主旋转 + 随机扰动
          const speed = COMPUTING_SPEED_MIN + Math.random() * (COMPUTING_SPEED_MAX - COMPUTING_SPEED_MIN)
          return {
            x: (Math.random() - 0.5) * speed * 0.3,
            y: (Math.random() - 0.5) * speed * 0.3,
            z: speed * multiplier
          }
        } else {
          // 待机模式：纯 Z 轴自转
          return {
            x: 0,
            y: 0,
            z: IDLE_SPEED * multiplier
          }
        }
      }

      // idle 和 flyIn 状态不旋转
      return { x: 0, y: 0, z: 0 }
    })
  }, [isComputing, animationState])

  // 动画帧更新
  useFrame(({ camera, clock }) => {
    if (!groupRef.current) return

    // === 飞入动画控制 ===
    if (animationState === 'flyIn' && flyInProgressRef.current < 1) {
      flyInProgressRef.current = Math.min(flyInProgressRef.current + 0.02, 1)
    }

    const damping = isComputing ? COMPUTING_DAMPING : IDLE_DAMPING

    // 太极图自旋和面向摄像机
    if (taijiMeshRef.current) {
      const taijiSpinSpeed = isComputing ? 0.12 : 0.04
      taijiMeshRef.current.rotation.z += taijiSpinSpeed

      const pulsate = Math.sin(clock.getElapsedTime() * 2) * 0.3 + 1
      const material = taijiMeshRef.current.material as any
      if (material && material.emissiveIntensity !== undefined) {
        material.emissiveIntensity = 0.8 * pulsate
      }

      const floatOffset = Math.sin(clock.getElapsedTime() * 0.5) * 0.05
      taijiMeshRef.current.position.z = floatOffset

      taijiMeshRef.current.lookAt(camera.position)
    }

    // 圆环旋转和飞入动画
    meshesRef.current.forEach((mesh, i) => {
      // === 飞入动画位置和旋转 ===
      if (animationState === 'idle') {
        // 初始状态：圆环在屏幕外，但已在平面状态
        const startPos = randomStartPositionsRef.current[i]
        mesh.position.copy(startPos as any)
        mesh.rotation.copy(flatRotations[i])
        mesh.visible = false
      } else if (animationState === 'flyIn') {
        // 飞入动画：从随机位置飞到原点，同时旋转到平面状态
        const startPos = randomStartPositionsRef.current[i]
        const progress = flyInProgressRef.current
        const easeProgress = 1 - Math.pow(1 - progress, 3) // easeOutCubic

        // 位置插值
        mesh.position.x = startPos.x * (1 - easeProgress)
        mesh.position.y = startPos.y * (1 - easeProgress)
        mesh.position.z = startPos.z * (1 - easeProgress)

        // 旋转插值（从随机旋转到平面旋转）
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

        mesh.visible = true
      } else {
        // rotating 状态：在原点，保持平面状态（旋转由速度控制）
        mesh.position.set(0, 0, 0)
        mesh.visible = true
      }

      // === 旋转动画（仅 rotating 状态） ===
      if (animationState === 'rotating') {
        const vel = velocitiesRef.current[i]
        const target = targetVelocitiesRef.current[i]

        vel.x = THREE.MathUtils.lerp(vel.x, target.x, damping)
        vel.y = THREE.MathUtils.lerp(vel.y, target.y, damping)
        vel.z = THREE.MathUtils.lerp(vel.z, target.z, damping)

        mesh.rotation.x += vel.x
        mesh.rotation.y += vel.y
        mesh.rotation.z += vel.z
      }
    })
  })

  return (
    <group ref={groupRef} {...props}>
      {/* 中心太极图 */}
      <mesh ref={taijiMeshRef} position={[0, 0, 0]} rotation={[0, 0, 0]} renderOrder={100}>
        <circleGeometry args={[1.2, 64]} />
        <meshStandardMaterial
          map={taijiTexture}
          transparent={false}
          side={THREE.DoubleSide}
          metalness={0.3}
          roughness={0.5}
          emissive="#FFD700"
          emissiveIntensity={0.8}
          depthTest={false}
        />
      </mesh>

      {/* 罗盘环 */}
      {RING_RADII.map((radius, i) => (
        <mesh
          key={radius}
          ref={(el) => {
            if (el) meshesRef.current[i] = el
          }}
          rotation={initialRotations[i]}
          renderOrder={i}
        >
          <torusGeometry
            args={[radius, TUBE_RADIUS, RADIAL_SEGMENTS, TUBULAR_SEGMENTS]}
          />
          <meshStandardMaterial
            metalness={0.9}
            roughness={0.3}
            map={textures[i]}
            emissive="#FFD700"
            emissiveMap={textures[i]}
            emissiveIntensity={2.5}
            transparent
            opacity={1.0}
            alphaTest={0.1}
          />
        </mesh>
      ))}
    </group>
  )
}

export default CyberLuopan
