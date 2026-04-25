'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'

interface MinimalHeaderProps {
  subjectName: string
  subjectSlug: string
  conceptName?: string
  questionCount: number
  subtopicCount: number
  secondaryLabel?: string
  onMenuClick?: () => void
}

export default function MinimalHeader({
  subjectName,
  subjectSlug,
  conceptName,
  questionCount,
  subtopicCount,
  secondaryLabel = 'Subtopics',
  onMenuClick,
}: MinimalHeaderProps) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '48px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Left: Branding & Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0px', fontSize: '13px' }}>
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              marginRight: '16px',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#374151'
            }}
            aria-label="Toggle contents menu"
          >
            <Menu size={20} />
          </button>
        )}
        
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontWeight: 800, color: '#7C3AED', marginRight: '16px', fontSize: '15px', letterSpacing: '-0.02em' }}>
            Swaseekh
          </span>
        </Link>
        
        <span style={{ width: '1px', height: '16px', background: '#E5E7EB', marginRight: '16px' }} />

        <Link
          href="/gate"
          style={{ color: '#6B7280', textDecoration: 'none' }}
          className="hover:text-gray-900 transition-colors"
        >
          GATE
        </Link>
        <span style={{ color: '#9CA3AF', margin: '0 6px' }}>›</span>
        {conceptName ? (
          <>
            <Link
              href={`/gate/${subjectSlug}`}
              style={{ color: '#6B7280', textDecoration: 'none' }}
              className="hover:text-gray-900 transition-colors"
            >
              {subjectName}
            </Link>
            <span style={{ color: '#9CA3AF', margin: '0 6px' }}>›</span>
            <span style={{ color: '#111827', fontWeight: 600 }}>{conceptName}</span>
          </>
        ) : (
          <span style={{ color: '#111827', fontWeight: 600 }}>{subjectName}</span>
        )}
      </nav>

      {/* Right: Stat pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            fontSize: '12px',
            color: '#6B7280',
            border: '1px solid #E5E7EB',
            borderRadius: '20px',
            padding: '3px 10px',
          }}
        >
          {questionCount} Questions
        </span>
        {subtopicCount > 0 && (
          <span
            style={{
              fontSize: '12px',
              color: '#6B7280',
              border: '1px solid #E5E7EB',
              borderRadius: '20px',
              padding: '3px 10px',
            }}
          >
            {subtopicCount} {secondaryLabel}
          </span>
        )}
      </div>
    </div>
  )
}
