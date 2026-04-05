import { NextRequest, NextResponse } from 'next/server';
import { getArticleById, saveArticle, deleteArticle } from '@/lib/articles';
import { cookies } from 'next/headers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const token = (await cookies()).get('access_token')?.value;
  const article = await getArticleById(id, token);
  
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
  const token = (await cookies()).get('access_token')?.value;
  
  const existingArticle = await getArticleById(id, token);
  if (!existingArticle) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  await saveArticle({ ...data, id }, token);
  return NextResponse.json({ success: true, article: data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const token = (await cookies()).get('access_token')?.value;
  await deleteArticle(id, token);
  return NextResponse.json({ success: true });
}
