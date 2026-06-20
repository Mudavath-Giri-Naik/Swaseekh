import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Swaseekh — GATE CS Preparation Platform'

export const size = { width: 1200, height: 630 }

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: 80,
          background: '#FAFAFB',
          backgroundImage:
            'radial-gradient(circle at 100% 0%, rgba(79,70,229,0.18) 0%, rgba(250,250,251,0) 45%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 120,
            height: 12,
            borderRadius: 6,
            background: '#4f46e5',
            marginBottom: 40,
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: 84,
            fontWeight: 800,
            color: '#3b82f6',
            lineHeight: 1,
          }}
        >
          Swaseekh
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 40,
            color: '#0f172a',
            marginTop: 28,
          }}
        >
          GATE CS Preparation, Decoded.
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: '#475569',
            marginTop: 20,
          }}
        >
          2000+ PYQs · Year-wise Mock Tests · Aptitude Practice
        </div>
      </div>
    ),
    { ...size }
  )
}
