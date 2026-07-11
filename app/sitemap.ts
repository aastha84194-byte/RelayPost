import { MetadataRoute } from 'next';
import { getAllArticles, getNewsLive } from '@/lib/articles';
import { getCategorySlugForArticle } from '@/lib/categoryMapping';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://relay-post.vercel.app';
  
  // Fetch dynamic articles
  const articles = await getAllArticles(undefined, 0, 1000);
  const safeArticles = Array.isArray(articles) ? articles : [];
  
  const articleUrls: MetadataRoute.Sitemap = safeArticles.map((article) => {
    const catSlug = getCategorySlugForArticle(article.category_name);
    
    const cleanSlug = article.slug ? article.slug.replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';

    return {
      url: `${baseUrl}/${catSlug}/${cleanSlug}`,
      lastModified: article.published_at ? new Date(article.published_at) : new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    };
  });

  // Fetch dynamic news
  const newsItems = await getNewsLive(1000);
  const safeNews = Array.isArray(newsItems) ? newsItems : [];

  const newsUrls: MetadataRoute.Sitemap = safeNews.map((news) => {
    const cleanSlug = news.slug ? news.slug.replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
    return {
      url: `${baseUrl}/news/${cleanSlug}`,
      lastModified: news.published_at ? new Date(news.published_at) : new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
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
  ];

  return [...staticUrls, ...articleUrls, ...newsUrls];
}
