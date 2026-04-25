'use client'

import Link from 'next/link'

interface SubtopicRowProps {
  name: string
  slug: string
  questionCount: number
  ccdStatus: 'completed' | 'in-progress' | 'not-started'
  href: string
}

const statusColors = {
  completed: '#22C55E', // Green
  'in-progress': '#F59E0B', // Yellow
  'not-started': '#D1D5DB', // Gray
}

export default function SubtopicRow({ name, slug, questionCount, ccdStatus, href }: SubtopicRowProps) {
  const dotColor = statusColors[ccdStatus] || statusColors['not-started']

  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px 10px 40px',
        background: '#FAFAFA',
        textDecoration: 'none',
        transition: 'all 150ms ease',
        cursor: 'pointer',
      }}
      className="group hover:bg-[#F5F3FF]"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: dotColor,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: '15px',
            color: '#374151',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 500,
          }}
          className="group-hover:text-[#7C3AED]"
        >
          {name}
        </span>
      </div>
      
      <span
        style={{
          fontSize: '13px',
          color: '#9CA3AF',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {questionCount} Qs
      </span>
    </Link>
  )
}
