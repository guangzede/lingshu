import React, { useEffect, useMemo, useState } from 'react'
import './index.scss'

interface MosaicTransitionProps {
  duration?: number
  rows?: number
  cols?: number
  onFinish?: () => void
}

const MosaicTransition: React.FC<MosaicTransitionProps> = ({
  duration = 900,
  rows = 10,
  cols = 16,
  onFinish
}) => {
  const [active, setActive] = useState(true)

  const tiles = useMemo(() => rows * cols, [rows, cols])
  const tileOffsets = useMemo(
    () =>
      Array.from({ length: tiles }).map(() => ({
        delay: Math.random() * duration * 0.6,
        tx: (Math.random() - 0.5) * 12,
        ty: (Math.random() - 0.5) * 12,
        rot: (Math.random() - 0.5) * 20
      })),
    [tiles, duration]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setActive(false)
      onFinish?.()
    }, duration + 250)
    return () => clearTimeout(timer)
  }, [duration, onFinish])

  if (!active) return null

  return (
    <div
      className="mosaic-overlay"
      style={{
        ['--cols' as string]: cols,
        ['--rows' as string]: rows
      }}
    >
      {tileOffsets.map((offset, idx) => (
        <span
          key={idx}
          style={{
            animationDelay: `${offset.delay}ms`,
            ['--tx' as string]: `${offset.tx}px`,
            ['--ty' as string]: `${offset.ty}px`,
            ['--rot' as string]: `${offset.rot}deg`
          }}
        />
      ))}
    </div>
  )
}

export default MosaicTransition
