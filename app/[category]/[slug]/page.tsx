import React from "react";
import { getArticleBySlug } from "@/lib/articles";
import { getCategorySlugForArticle } from "@/lib/categoryMapping";
import ArticleRenderer from "@/app/components/render/ArticleRenderer";
import Navbar from "@/app/components/Navbar";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ category: string, slug: string }> }
): Promise<Metadata> {
  const { slug, category } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: 'Article Not Found' };
  }

  // Canonical should now reflect the new URL structure with a clean slug
  const catSlug = article.category_name
    ? getCategorySlugForArticle(article.category_name)
    : category;

  return {
    title: article.meta_title || article.title,
    description: article.meta_description || article.excerpt || article.subtitle,
    keywords: [article.focus_keyword, ...(article.secondary_keywords || [])].filter(Boolean) as string[],
    alternates: {
      canonical: article.canonical_url || `https://relaypost.com/${catSlug}/${article.slug}`
    },
    openGraph: {
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt || article.subtitle,
      images: article.hero_image ? [{ url: article.hero_image }] : [],
    }
  };
}

export default async function ArticlePage(
  { params }: { params: Promise<{ category: string, slug: string }> }
) {
  const { slug, category } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Optional: Check if the category in URL matches the article's actual category
  // If not, we could redirect, but for flexibility we can just render.

  return (
    <>
      <Navbar />
      <ArticleRenderer article={article} />
    </>
  );
}
