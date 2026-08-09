import { MetadataRoute } from 'next';
import { getAllArticles, getNewsLive } from '@/lib/articles';
import { getCategorySlugForArticle } from '@/lib/categoryMapping';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://relay-post-mauve.vercel.app';
  
  // Fetch dynamic articles
  const articles = await getAllArticles(undefined, 0, 100);
  const safeArticles = Array.isArray(articles) ? articles : [];
  
  const articleUrls: MetadataRoute.Sitemap = safeArticles.map((article) => {
    const catSlug = getCategorySlugForArticle(article.category_name);
    
    return {
      url: `${baseUrl}/${catSlug}/${article.slug}`,
      lastModified: article.published_at ? new Date(article.published_at) : new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    };
  });

  // Fetch dynamic news
  const newsItems = await getNewsLive(1000);
  const safeNews = Array.isArray(newsItems) ? newsItems : [];

  const newsUrls: MetadataRoute.Sitemap = safeNews.map((news) => {
    return {
      url: `${baseUrl}/news/${news.slug}`,
      lastModified: news.published_at ? new Date(news.published_at) : new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    };
  });

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contribute`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  return [...staticUrls, ...articleUrls, ...newsUrls];
}
