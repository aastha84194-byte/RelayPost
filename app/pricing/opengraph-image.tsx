import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

// Image metadata
export const alt = 'RelayPost Pricing';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const logoData = fs.readFileSync(path.join(process.cwd(), 'app', 'icon.png'));
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #0a0f1e, #101223)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: 'white',
        }}
      >
        {/* Background Decorative Gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'radial-gradient(circle at 50% 0%, rgba(78, 96, 255, 0.2) 0%, transparent 50%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 40,
            zIndex: 10,
          }}
        >
          {/* Logo */}
          <img
            src={logoSrc}
            width={64}
            height={64}
            style={{
              borderRadius: 16,
              marginRight: 24,
            }}
          />
          <span style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-0.03em' }}>
            RelayPost
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          <h1 style={{ fontSize: 72, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', textAlign: 'center' }}>
            Pricing Plans
          </h1>
          <p style={{ fontSize: 36, color: '#bcc7de', marginTop: 24, textAlign: 'center', maxWidth: '80%' }}>
            Start free. Upgrade when you need the Pro Features.
          </p>
        </div>

        {/* Badges/Tags representation */}
        <div style={{ display: 'flex', gap: '24px', marginTop: 60, zIndex: 10 }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '12px 32px', borderRadius: 100, fontSize: 24, fontWeight: 600 }}>
            Free
          </div>
          <div style={{ display: 'flex', background: 'rgba(78, 96, 255, 0.2)', color: '#bcc7de', border: '1px solid rgba(78, 96, 255, 0.5)', padding: '12px 32px', borderRadius: 100, fontSize: 24, fontWeight: 600 }}>
            Plus
          </div>
          <div style={{ display: 'flex', background: 'rgba(144, 78, 255, 0.2)', color: '#d9d8ff', border: '1px solid rgba(144, 78, 255, 0.5)', padding: '12px 32px', borderRadius: 100, fontSize: 24, fontWeight: 600 }}>
            Pro
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
