import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://relay-post-mauve.vercel.app';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/profile/', '/search', '/checkout', '/auth/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
