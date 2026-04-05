import { NextRequest, NextResponse } from 'next/server';
import { getArticleById, saveArticle, deleteArticle } from '@/lib/articles';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const article = await getArticleById(id);
  
  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const data = await req.json();
  
  const existingArticle = await getArticleById(id);
  if (!existingArticle) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  await saveArticle({ ...data, id });
  return NextResponse.json({ success: true, article: data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  await deleteArticle(id);
  return NextResponse.json({ success: true });
}
