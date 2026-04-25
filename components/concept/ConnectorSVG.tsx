'use client'

import { useEffect, useState, useCallback } from 'react'

interface ConnectionInfo {
  id: string
  questionId: string
  sectionId: string
  side: 'left' | 'right'
}

interface ConnectorSVGProps {
  connections: ConnectionInfo[]
  questionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
  sectionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
  containerRef: React.RefObject<HTMLDivElement | null>
  hoveredQuestionId: string | null
}

interface LineData {
  id: string
  path: string
  color: string
  hoverColor: string
  isHovered: boolean
}

export default function ConnectorSVG({
  connections,
  questionRefs,
  sectionRefs,
  containerRef,
  hoveredQuestionId,
}: ConnectorSVGProps) {
  const [lines, setLines] = useState<LineData[]>([])
  const [svgHeight, setSvgHeight] = useState(0)

  const recalculate = useCallback(() => {
    if (!containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    setSvgHeight(containerRef.current.scrollHeight)

    const newLines: LineData[] = []

    for (const conn of connections) {
      const questionEl = questionRefs.current[conn.questionId]
      const sectionEl = sectionRefs.current[conn.sectionId]

      if (!questionEl || !sectionEl) continue

      const qRect = questionEl.getBoundingClientRect()
      const sRect = sectionEl.getBoundingClientRect()

      const qCenterY = qRect.top - containerRect.top + qRect.height / 2
      const sCenterY = sRect.top - containerRect.top + 14 // align to heading text center

      let path: string
      let color: string
      let hoverColor: string

      if (conn.side === 'left') {
        const qX = qRect.right - containerRect.left + 6
        const sX = sRect.left - containerRect.left - 6
        const cpOffset = (sX - qX) * 0.45

        path = `M ${qX} ${qCenterY} C ${qX + cpOffset} ${qCenterY}, ${sX - cpOffset} ${sCenterY}, ${sX} ${sCenterY}`
        color = '#A78BFA'
        hoverColor = '#7C3AED'
      } else {
        const qX = qRect.left - containerRect.left - 6
        const sX = sRect.right - containerRect.left + 6
        const cpOffset = (qX - sX) * 0.45

        path = `M ${qX} ${qCenterY} C ${qX - cpOffset} ${qCenterY}, ${sX + cpOffset} ${sCenterY}, ${sX} ${sCenterY}`
        color = '#93C5FD'
        hoverColor = '#3B82F6'
      }

      newLines.push({
        id: conn.id,
        path,
        color,
        hoverColor,
        isHovered: hoveredQuestionId === conn.questionId,
      })
    }

    setLines(newLines)
  }, [connections, questionRefs, sectionRefs, containerRef, hoveredQuestionId])

  useEffect(() => {
    const t1 = setTimeout(recalculate, 150)
    const t2 = setTimeout(recalculate, 800)
    const t3 = setTimeout(recalculate, 2000)

    const resizeObserver = new ResizeObserver(() => requestAnimationFrame(recalculate))
    if (containerRef.current) resizeObserver.observe(containerRef.current)

    const onScroll = () => requestAnimationFrame(recalculate)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
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
        zIndex: 0,
        overflow: 'visible',
      }}
    >
      {lines.map((line) => (
        <path
          key={line.id}
          d={line.path}
          fill="none"
          stroke={line.isHovered ? line.hoverColor : line.color}
          strokeWidth={line.isHovered ? 2.5 : 1.5}
          strokeLinecap="round"
          className="connector-path"
          opacity={line.isHovered ? 1 : 0.6}
        />
      ))}
    </svg>
  )
}
