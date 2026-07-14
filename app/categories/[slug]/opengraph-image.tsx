import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';
import { getCategoryMapping } from '@/lib/categoryMapping';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const category = getCategoryMapping(params.slug);
  
  const logoData = fs.readFileSync(path.join(process.cwd(), 'app', 'icon.png'));
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

  let bgImageSrc = '';
  if (category && category.image_url) {
    try {
      const imgPath = path.join(process.cwd(), 'public', category.image_url);
      const imgData = fs.readFileSync(imgPath);
      const ext = path.extname(category.image_url).toLowerCase();
      const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png';
      bgImageSrc = `data:${mimeType};base64,${imgData.toString('base64')}`;
    } catch (e) {
      console.error("Failed to load category OG image", e);
    }
  }

  const title = category ? category.name : "Category";
  const desc = category ? category.description : "Explore articles and news.";

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          fontFamily: 'sans-serif',
          color: 'white',
          padding: '80px',
          position: 'relative',
          backgroundColor: '#0a0f1e',
        }}
      >
        {/* Background Image with Overlay */}
        {bgImageSrc ? (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
            <img src={bgImageSrc} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            {/* Dark overlay to make text readable */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 15, 30, 0.75)' }} />
          </div>
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom right, #0a0f1e, #101223)', display: 'flex' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 50% 0%, rgba(78, 96, 255, 0.2) 0%, transparent 50%)' }} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', zIndex: 10, maxWidth: '85%', marginTop: 'auto', marginBottom: 'auto' }}>
          <div style={{ display: 'flex', padding: '8px 24px', background: 'rgba(78, 96, 255, 0.8)', borderRadius: 100, fontSize: 24, fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Category
          </div>
          <h1 style={{ fontSize: 84, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>{title}</h1>
          <p style={{ fontSize: 40, color: '#e2e8f0', marginTop: 32, lineHeight: 1.4, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            {desc}
          </p>
        </div>

        {/* Logo and Name at bottom left */}
        <div style={{ display: 'flex', alignItems: 'center', zIndex: 10 }}>
          <img src={logoSrc} width={56} height={56} style={{ borderRadius: 12, marginRight: 20 }} />
          <span style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', color: '#e2e8f0', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>RelayPost</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
