import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FAF7F1',
          padding: 80,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              background: '#A8752C',
              borderRadius: '50% 50% 50% 0',
              transform: 'rotate(45deg)',
            }}
          />
          <span style={{ fontSize: 40, fontWeight: 700, color: '#1A1420' }}>
            Garba Buddy
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 48,
            fontSize: 60,
            fontWeight: 600,
            color: '#1A1420',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          Never Garba Alone This Navratri
        </div>
        <div style={{ display: 'flex', marginTop: 32, fontSize: 28, color: 'rgba(26,20,32,0.6)' }}>
          ID-verified · Face-matched · Escrow-secured
        </div>
      </div>
    ),
    { ...size }
  );
}
