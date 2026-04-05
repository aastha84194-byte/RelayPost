import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles, saveArticle } from '@/lib/articles';
import { Article } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const articles = await getAllArticles();
  return NextResponse.json(articles);
}

export async function POST(req: NextRequest) {
  const data = await req.json() as Article;
  
  if (!data.id) {
    data.id = uuidv4();
  }
  
  if (!data.publishedAt) {
    data.publishedAt = new Date().toISOString();
  }

  await saveArticle(data);
  return NextResponse.json({ success: true, article: data });
}
