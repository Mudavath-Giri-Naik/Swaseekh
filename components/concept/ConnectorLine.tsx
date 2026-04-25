'use client'

import { useEffect, useState, useCallback } from 'react'

interface ConnectionInfo {
  id: string
  questionId: string
  sectionId: string
  side: 'left' | 'right'
}

interface ConnectorLineProps {
  connections: ConnectionInfo[]
  questionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
  sectionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
  containerRef: React.RefObject<HTMLDivElement | null>
}

interface LineData {
  id: string
  path: string
  color: string
}

/**
 * SVG overlay that draws curved bezier connector lines
 * between question side cards and their content sections.
 * Reads refs directly at calculation time to avoid stale closures.
 */
export default function ConnectorLine({
  connections,
  questionRefs,
  sectionRefs,
  containerRef,
}: ConnectorLineProps) {
  const [lines, setLines] = useState<LineData[]>([])
  const [svgHeight, setSvgHeight] = useState(0)

  const recalculate = useCallback(() => {
    if (!containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const containerScrollHeight = containerRef.current.scrollHeight
    setSvgHeight(Math.max(containerScrollHeight, containerRect.height))

    const newLines: LineData[] = []

    for (const conn of connections) {
      // Read refs directly — they may have been populated after the component mounted
      const questionEl = questionRefs.current[conn.questionId]
      const sectionEl = sectionRefs.current[conn.sectionId]

      if (!questionEl || !sectionEl) continue

      const qRect = questionEl.getBoundingClientRect()
      const sRect = sectionEl.getBoundingClientRect()

      // Calculate positions relative to the container
      const qCenterY = qRect.top - containerRect.top + qRect.height / 2
      const sCenterY = sRect.top - containerRect.top + sRect.height / 2

      let path: string
      let color: string

      if (conn.side === 'left') {
        // Left question → right edge of card → curve right → left edge of section
        const qX = qRect.right - containerRect.left + 4
        const sX = sRect.left - containerRect.left - 4
        const midX = (qX + sX) / 2

        path = `M ${qX} ${qCenterY} C ${midX} ${qCenterY}, ${midX} ${sCenterY}, ${sX} ${sCenterY}`
        color = '#8B5CF6'
      } else {
        // Right question → left edge of card → curve left → right edge of section
        const qX = qRect.left - containerRect.left - 4
        const sX = sRect.right - containerRect.left + 4
        const midX = (qX + sX) / 2

        path = `M ${qX} ${qCenterY} C ${midX} ${qCenterY}, ${midX} ${sCenterY}, ${sX} ${sCenterY}`
        color = '#3B82F6'
      }

      newLines.push({ id: conn.id, path, color })
    }

    setLines(newLines)
  }, [connections, questionRefs, sectionRefs, containerRef])

  useEffect(() => {
    // Delay initial calculation to ensure refs are populated
    const initialTimer = setTimeout(recalculate, 100)
    const timer2 = setTimeout(recalculate, 800)
    const timer3 = setTimeout(recalculate, 2000)

    // Recalculate on resize
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(recalculate)
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    // Recalculate on scroll
    const handleScroll = () => {
      requestAnimationFrame(recalculate)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      clearTimeout(initialTimer)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [recalculate, containerRef])

  if (lines.length === 0) return null

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: svgHeight || '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'visible',
      }}
    >
      {lines.map((line) => (
        <path
          key={line.id}
          d={line.path}
          fill="none"
          stroke={line.color}
          strokeWidth={2}
          strokeLinecap="round"
          className="connector-line"
          opacity={0.45}
        />
      ))}
    </svg>
  )
}
