'use client'

import { FileText } from 'lucide-react'

interface ExampleBoxProps {
  content: string
}

export default function ExampleBox({ content }: ExampleBoxProps) {
  return (
    <div
      style={{
        background: 'transparent',
        borderLeft: '2px solid #000',
        padding: '4px 0 4px 16px',
        marginTop: '24px',
        marginBottom: '24px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}
    >
      <div>
        <p
          style={{
            fontWeight: 700,
            fontSize: '14px',
            color: '#000',
            marginBottom: '8px',
            fontFamily: "Georgia, serif",
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Example
        </p>
        <p
          style={{
            fontSize: '15px',
            lineHeight: 1.8,
            color: '#333',
            fontFamily: "Georgia, serif",
          }}
        >
          {content}
        </p>
      </div>
    </div>
  )
}
