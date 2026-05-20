'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { ReactNode, CSSProperties } from 'react'

interface NoiseBackgroundProps {
  children: ReactNode
  /** Tailwind classes for the outer ring container. Padding here = ring thickness. */
  containerClassName?: string
  /** Optional classes for the inner content slot */
  className?: string
  /** Colors that cycle through the animated gradient ring */
  gradientColors?: string[]
  /** Seconds per gradient sweep */
  animationDuration?: number
}

// Inline SVG fractal-noise — gives the gradient ring its premium "grain"
const NOISE_DATA_URI =
  "url(\"data:image/svg+xml;utf8,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

/**
 * Wraps its child with an animated multi-color gradient ring overlaid by
 * a subtle SVG noise texture. Use `containerClassName` to control the
 * outer shape (e.g. `rounded-full p-[3px]`).
 */
export function NoiseBackground({
  children,
  containerClassName,
  className,
  gradientColors = [
    'rgb(99, 102, 241)', // indigo-500
    'rgb(139, 92, 246)', // violet-500
    'rgb(217, 70, 239)', // fuchsia-500
    'rgb(59, 130, 246)', // blue-500
    'rgb(245, 158, 11)', // amber-500
  ],
  animationDuration = 6,
}: NoiseBackgroundProps) {
  const gradient = `linear-gradient(90deg, ${[...gradientColors, gradientColors[0]].join(', ')})`

  const animatedStyle: CSSProperties = {
    background: gradient,
    backgroundSize: '300% 100%',
  }

  return (
    <div className={cn('relative isolate', containerClassName)}>
      {/* Animated gradient layer */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-[inherit]"
        style={animatedStyle}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{
          duration: animationDuration,
          ease: 'linear',
          repeat: Infinity,
        }}
      />
      {/* Noise grain overlay */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-[inherit] opacity-40 mix-blend-overlay"
        style={{ backgroundImage: NOISE_DATA_URI }}
      />
      {/* Inner slot */}
      <div className={cn('relative z-10', className)}>{children}</div>
    </div>
  )
}
