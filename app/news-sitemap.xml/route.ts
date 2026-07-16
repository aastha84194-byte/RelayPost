import { NextResponse } from 'next/server';
import { getNewsLive } from '@/lib/articles';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = 'https://relaypost.me';
  
  // Google News Sitemaps should ideally only contain articles from the last 48 hours
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  // Fetch dynamic news
  const newsItems = await getNewsLive(1000);
  const safeNews = Array.isArray(newsItems) ? newsItems : [];

  // Combine and filter for recent publications
  const sitemapEntries: string[] = [];

  // Process Aggregated News
  safeNews.forEach((news) => {
    const pubDate = news.published_at ? new Date(news.published_at) : new Date();
    
    if (pubDate >= fortyEightHoursAgo) {
      const cleanSlug = news.slug ? news.slug.replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
      const url = `${baseUrl}/news/${cleanSlug}`;
      
      const title = (news.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

      sitemapEntries.push(`
        <url>
          <loc>${url}</loc>
          <news:news>
            <news:publication>
              <news:name>RelayPost News</news:name>
              <news:language>en</news:language>
            </news:publication>
            <news:publication_date>${pubDate.toISOString()}</news:publication_date>
            <news:title>${title}</news:title>
          </news:news>
        </url>`);
    }
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${sitemapEntries.join('')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Optional: Add cache-control headers if you want to cache it at the CDN level
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
