import { MetadataRoute } from 'next';
import { getAllArticles, getNewsLive } from '@/lib/articles';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://relay-post.vercel.app';
  
  // Fetch dynamic articles
  const articles = await getAllArticles();
  
  const articleUrls: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/article/${article.slug}`,
    lastModified: article.published_at ? new Date(article.published_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Fetch dynamic news
  const newsItems = await getNewsLive(1000);

  const newsUrls: MetadataRoute.Sitemap = newsItems.map((news) => ({
    url: `${baseUrl}/news/${news.slug}`,
    lastModified: news.published_at ? new Date(news.published_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

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
      priority: 0.8,
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
