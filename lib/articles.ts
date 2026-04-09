import { Article } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";

export async function getAllArticles(category?: string): Promise<Article[]> {
  try {
    const url = new URL(`${API_BASE}/public/articles`);
    if (category) url.searchParams.append("category", category);
    
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch articles from backend", err);
    return [];
  }
}

export async function getTrendingArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${API_BASE}/public/articles/trending`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch trending articles", err);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API_BASE}/public/articles/${slug}`, { 
      next: { revalidate: 0 }, // Disable cache for detailed view to see live updates
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch article ${slug}`, err);
    return null;
  }
}

export async function getArticleById(id: string, token?: string): Promise<Article | null> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    // Note: This hits the admin endpoint as there is no public by-id endpoint
    const res = await fetch(`${API_BASE}/admin/articles/${id}`, { 
      headers,
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch article by id ${id}`, err);
    return null;
  }
}

export async function getArticlesBySection(section: string, category?: string): Promise<Article[]> {
  try {
    const url = new URL(`${API_BASE}/public/articles/section/${section}`);
    if (category) url.searchParams.append("category", category);

    const res = await fetch(url.toString(), { 
      next: { revalidate: 60 } 
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch section ${section}`, err);
    return [];
  }
}

export async function recordArticleView(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/public/articles/${id}/view`, { method: "POST" });
  } catch (err) {
    console.error("Failed to record view", err);
  }
}

export async function submitReflection(id: string, content: string, isAnonymous: boolean = true): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/public/articles/${id}/reflections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, is_anonymous: isAnonymous })
      });
      return await res.json();
    } catch (err) {
      console.error("Failed to submit reflection", err);
      return null;
    }
}

export async function toggleLike(id: string, token: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/admin/articles/${id}/like`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      return await res.json();
    } catch (err) {
      console.error("Failed to toggle like", err);
      return null;
    }
}

export async function saveArticle(article: Partial<Article> & { id: string }, token?: string): Promise<any> {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/admin/articles/${article.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(article)
      });
      return await res.json();
    } catch (err) {
      console.error("Failed to save article", err);
      return null;
    }
}

export async function deleteArticle(id: string, token?: string): Promise<any> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/admin/articles/${id}`, {
        method: "DELETE",
        headers
      });
      return await res.json();
    } catch (err) {
      console.error("Failed to delete article", err);
      return null;
    }
}

export async function getCategories(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/public/categories`, { next: { revalidate: 60 } });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.error("Failed to fetch categories", err);
      return [];
    }
}
