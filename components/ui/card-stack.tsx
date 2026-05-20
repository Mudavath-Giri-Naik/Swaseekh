'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface CardStackItem {
  id: number | string
  /** Rotation (in deg) applied when the card sits in the back of the stack */
  rotate?: number
  content: React.ReactNode
}

interface CardStackProps {
  items: CardStackItem[]
  /** ms between auto-cycles */
  interval?: number
  /** vertical gap between stacked cards (px) */
  offset?: number
  /** how much each rear card scales down */
  scaleFactor?: number
  className?: string
  cardClassName?: string
}

/**
 * Auto-cycling card stack. The top card slides back, the next card rises to
 * the front. Each card supports a `rotate` value so the deck feels organic.
 */
export function CardStack({
  items,
  interval = 2000,
  offset = 8,
  scaleFactor = 0.04,
  className,
  cardClassName,
}: CardStackProps) {
  const [cards, setCards] = useState<CardStackItem[]>(items)

  useEffect(() => {
    const id = setInterval(() => {
      setCards((prev) => {
        const next = [...prev]
        // Move the front card to the back
        const front = next.shift()
        if (front) next.push(front)
        return next
      })
    }, interval)
    return () => clearInterval(id)
  }, [interval])

  return (
    <div
      className={cn(
        'relative h-44 w-64 sm:h-48 sm:w-72 md:h-52 md:w-80',
        className
      )}
    >
      {cards.map((card, index) => {
        const isFront = index === 0
        return (
          <motion.div
            key={card.id}
            className={cn(
              'absolute inset-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)]',
              cardClassName
            )}
            style={{ transformOrigin: 'top center' }}
            animate={{
              y: index * -offset,
              scale: 1 - index * scaleFactor,
              rotate: isFront ? 0 : card.rotate ?? 0,
              zIndex: cards.length - index,
            }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          >
            {card.content}
          </motion.div>
        )
      })}
    </div>
  )
}
