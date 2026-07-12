import React from "react";
import { getArticleBySlug } from "@/lib/articles";
import ArticleRenderer from "@/app/components/render/ArticleRenderer";
import Navbar from "@/app/components/Navbar";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const slug = (await params).slug;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: 'Article Not Found' };
  }

  return {
    title: article.meta_title || article.title,
    description: article.meta_description || article.excerpt || article.subtitle,
    keywords: [article.focus_keyword, ...(article.secondary_keywords || [])].filter(Boolean) as string[],
    alternates: {
      canonical: article.canonical_url || `https://relaypost.com/article/${article.slug}`
    },
    openGraph: {
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt || article.subtitle,
      images: article.hero_image ? [{ url: article.hero_image }] : [],
    }
  };
}

export default async function ArticlePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const slug = (await params).slug;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.meta_title || article.title,
    "description": article.meta_description || article.excerpt || article.subtitle,
    "image": article.hero_image ? [article.hero_image] : [],
    "datePublished": article.published_at,
    "author": [{
      "@type": "Organization",
      "name": "RelayPost",
      "url": "https://relaypost.me"
    }]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <ArticleRenderer article={article} />
    </>
  );
}
