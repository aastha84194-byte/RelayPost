import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles, saveArticle } from '@/lib/articles';
import { Article } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

export async function GET() {
  const articles = await getAllArticles();
  return NextResponse.json(articles);
}

export async function POST(req: NextRequest) {
  const data = await req.json() as Article;
  
  if (!data.id) {
    data.id = uuidv4();
  }
  
  if (!data.published_at) {
    data.published_at = new Date().toISOString();
  }

  const token = (await cookies()).get('access_token')?.value;
  await saveArticle(data as any, token);
  return NextResponse.json({ success: true, article: data });
}
