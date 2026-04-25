'use client'

export default function SectionDivider() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        margin: '48px 0 32px',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
      <span style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 500, whiteSpace: 'nowrap' }}>
        All Questions
      </span>
      <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
    </div>
  )
}
