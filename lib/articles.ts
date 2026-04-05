import fs from 'fs';
import path from 'path';
import { Article } from './types';

const ARTICLES_DIR = path.join(process.cwd(), 'data/articles');

if (!fs.existsSync(ARTICLES_DIR)) {
  fs.mkdirSync(ARTICLES_DIR, { recursive: true });
}

export async function getAllArticles(): Promise<Article[]> {
  const files = fs.readdirSync(ARTICLES_DIR);
  const articles: Article[] = [];

  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(ARTICLES_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      articles.push(JSON.parse(content));
    }
  }

  return articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getArticleById(id: string): Promise<Article | null> {
  const filePath = path.join(ARTICLES_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

export async function saveArticle(article: Article): Promise<void> {
  const filePath = path.join(ARTICLES_DIR, `${article.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(article, null, 2));
}

export async function deleteArticle(id: string): Promise<void> {
  const filePath = path.join(ARTICLES_DIR, `${id}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
