import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

export const alt = 'Subscription Management - RelayPost';
export const size = { width: 1200, height: 630 };
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
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          fontFamily: 'sans-serif',
          color: 'white',
          padding: '80px',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'radial-gradient(circle at 50% 0%, rgba(78, 96, 255, 0.2) 0%, transparent 50%)' }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', zIndex: 10, maxWidth: '85%', marginTop: 'auto', marginBottom: 'auto' }}>
          <h1 style={{ fontSize: 84, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Subscription</h1>
          <p style={{ fontSize: 40, color: '#bcc7de', marginTop: 32, lineHeight: 1.4 }}>
            Unlock the full power of RelayPost. Manage your subscription, billing preferences, and gain access to exclusive Pro features and insights.
          </p>
        </div>

        {/* Logo and Name at bottom left */}
        <div style={{ display: 'flex', alignItems: 'center', zIndex: 10 }}>
          <img src={logoSrc} width={56} height={56} style={{ borderRadius: 12, marginRight: 20 }} />
          <span style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', color: '#bcc7de' }}>RelayPost</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
