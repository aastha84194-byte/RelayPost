import React from "react";
import { getArticleById } from "@/lib/articles";
import ArticleRenderer from "@/app/components/render/ArticleRenderer";
import { notFound } from "next/navigation";

export default async function ArticlePage(
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  return <ArticleRenderer article={article} />;
}
