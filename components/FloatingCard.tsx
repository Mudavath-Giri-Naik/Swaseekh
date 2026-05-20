'use client'

import { motion } from 'motion/react'
import { ReactNode } from 'react'

interface FloatingCardProps {
  children: ReactNode
  /** Absolute positioning classes, e.g. "top-24 left-10" */
  position: string
  /** Rotation in degrees applied at rest, e.g. -5 or 4 */
  rotation?: number
  /** Animation delay (seconds) so cards float out-of-phase */
  delay?: number
  /** Total float-loop duration (seconds) */
  duration?: number
  /** Tailwind width class, e.g. "w-48" */
  width?: string
  /** If true, the card is hidden below lg breakpoint (used for the 'middle' cards on tablets) */
  desktopOnly?: boolean
  className?: string
}

/**
 * Decorative card that floats gently on a loop.
 * Use it absolutely-positioned around the hero column.
 */
export default function FloatingCard({
  children,
  position,
  rotation = 0,
  delay = 0,
  duration = 5,
  width = 'w-48',
  desktopOnly = false,
  className = '',
}: FloatingCardProps) {
  return (
    <motion.div
      initial={{ y: 0, rotate: rotation, opacity: 0 }}
      animate={{ y: [0, -8, 0], rotate: rotation, opacity: 1 }}
      transition={{
        y: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
        },
        opacity: { duration: 0.6, delay: delay * 0.3 },
      }}
      className={`absolute ${position} ${width} ${
        desktopOnly ? 'hidden lg:block' : 'hidden md:block'
      } rounded-2xl border border-slate-200 bg-white p-3 shadow-md ${className}`}
    >
      {children}
    </motion.div>
  )
}
