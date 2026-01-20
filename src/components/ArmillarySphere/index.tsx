import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import THEME from '../../constants/theme'

/**
 * 单个旋转圆环组件
 */
interface TorusRingProps {
  radius: number
  tubeRadius?: number
  speed: number
  axis: 'x' | 'y' | 'z'
}

const TorusRing: React.FC<TorusRingProps> = ({
  radius,
  tubeRadius = 0.08,
  speed,
  axis
}) => {
  const meshRef = useRef<Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      if (axis === 'x') {
        meshRef.current.rotation.x += speed
      } else if (axis === 'y') {
        meshRef.current.rotation.y += speed
      } else if (axis === 'z') {
        meshRef.current.rotation.z += speed
      }
    }
  })

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[radius, tubeRadius, 16, 100]} />
      <meshStandardMaterial
        color={THEME.Gold}
        metalness={1.0}
        roughness={0.3}
        emissive={THEME.Gold}
        emissiveIntensity={0.2}
      />
    </mesh>
  )
}

/**
 * 浑天仪场景内容组件
 */
const ArmillarySphereScene: React.FC = () => {
  return (
    <>
      {/* 环境光 - 提供整体光照 */}
      <ambientLight intensity={0.6} color="#ffffff" />

      {/* 点光源 - 从上方照射，增强金色光泽 */}
      <pointLight
        position={[5, 8, 5]}
        intensity={1.2}
        color={THEME.Gold}
        decay={2}
      />

      {/* 补充点光源 - 从侧面照射 */}
      <pointLight
        position={[-5, 5, 5]}
        intensity={0.8}
        color={THEME.NeonCyan}
        decay={2}
      />

      {/* 三个旋转圆环 - 模拟浑天仪 */}
      <TorusRing radius={2.0} speed={0.001} axis="x" />
      <TorusRing radius={2.6} speed={0.0012} axis="y" />
      <TorusRing radius={3.2} speed={0.0008} axis="z" />
    </>
  )
}

/**
 * 完整的 3D 浑天仪组件
 * 适配 Taro 小程序环境
 */
interface ArmillaryProps {
  width?: number | string
  height?: number | string
  className?: string
}

const Armillary: React.FC<ArmillaryProps> = ({
  width = '100%',
  height = '100%',
  className = ''
}) => {
  return (
    <Canvas
      className={className}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        background: THEME.DarkBg,
        display: 'block'
      }}
      camera={{
        position: [0, 0, 8.5],
        fov: 50,
        near: 0.1,
        far: 1000
      }}
      dpr={[1, 2]}
    >
      <ArmillarySphereScene />
    </Canvas>
  )
}

export default Armillary
