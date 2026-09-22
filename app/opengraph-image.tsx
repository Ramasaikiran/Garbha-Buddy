import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  const logoData = readFileSync(join(process.cwd(), 'public', 'logo-full.png'));
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FAF7F1',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={600} height={600} alt="" />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: 40,
          }}
        >
          <div style={{ display: 'flex', fontSize: 40, color: 'rgba(26,20,32,0.6)' }}>
            Don't go alone.
          </div>
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, color: '#1A1420' }}>
            Find your Garba partner.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
