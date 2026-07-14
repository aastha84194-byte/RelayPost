import { Article } from './types';
import { API_BASE, NEWS_API_BASE } from './config';

const MOCK_EXPERT_ARTICLES: Article[] = [
  {
    id: 'mock-1',
    title: 'The Future of Quantum Computing: Why 2024 is the Turning Point',
    slug: 'future-of-quantum-computing-2024',
    subtitle: 'Expert analysis on the upcoming breakthroughs in quantum supremacy and practicality.',
    excerpt: 'Quantum computing is no longer a distant dream. As we enter 2024, the convergence of error correction and qubit stability is bringing us closer to real-world applications than ever before.',
    author_id: 'expert-john',
    category_name: 'Quantum Tech',
    template_type: 'tech',
    content_blocks: [],
    status: 'published',
    visibility: 'public',
    is_featured: true,
    published_at: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    title: 'Why Decentralized Identifiers are the Next Massive Privacy Shift',
    slug: 'decentralized-identifiers-privacy-shift',
    subtitle: 'A deep dive into how DID technology will return data ownership to the users.',
    excerpt: 'The shift from centralized identity providers to user-owned decentralized identifiers (DIDs) represents the biggest fundamental change to web architecture since SSL.',
    author_id: 'expert-sarah',
    category_name: 'Cybersecurity',
    template_type: 'tech',
    content_blocks: [],
    status: 'published',
    visibility: 'public',
    is_featured: true,
    published_at: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    title: 'The Economics of Global Semiconductor Supply Chains',
    slug: 'economics-global-semiconductor-supply-chains',
    subtitle: 'Understanding the geopolitical and economic pressures shaping the silicon landscape.',
    excerpt: 'As chips become the new oil, nations are racing to secure their supply chains. We analyze the investment trends and risks in the current semiconductor market.',
    author_id: 'expert-alan',
    category_name: 'Economics',
    template_type: 'tech',
    content_blocks: [],
    status: 'published',
    visibility: 'public',
    is_featured: true,
    published_at: new Date().toISOString(),
  },
  {
    id: 'mock-4',
    title: 'The Ethics of Autonomous Systems: Who is Responsible?',
    slug: 'ethics-autonomous-systems-responsibility',
    subtitle: 'Legal and ethical frameworks for a world where machines make critical decisions.',
    excerpt: 'When an AI system makes a mistake, the question of liability remains murky. We explore the emerging legal frameworks designed to tackle autonomous decision-making.',
    author_id: 'expert-lisa',
    category_name: 'Ethics',
    template_type: 'tech',
    content_blocks: [],
    status: 'published',
    visibility: 'public',
    is_featured: true,
    published_at: new Date().toISOString(),
  }
];

export async function getAllArticles(category?: string, skip: number = 0, limit: number = 20): Promise<Article[]> {
  try {
    const url = new URL(`${API_BASE}/public/articles`);
    if (category) url.searchParams.append("category", category);
    url.searchParams.append("skip", skip.toString());
    url.searchParams.append("limit", limit.toString());
    
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch articles from backend", err);
    return [];
  }
}

export async function getPaginatedArticles(page: number = 1, size: number = 25, token?: string): Promise<any> {

    try {
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}/admin/articles?page=${page}&size=${size}`, {
            headers,
            cache: 'no-store'
        });
        if (!res.ok) return { items: [], total: 0, pages: 0 };
        return await res.json();
    } catch (err) {
        console.error("Failed to fetch paginated articles", err);
        return { items: [], total: 0, pages: 0 };
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
      cache: 'no-store' 
    });
    if (!res.ok) return section === "ExpertAnalysis" ? MOCK_EXPERT_ARTICLES : [];
    const data = await res.json();
    
    // Return mock data if section is ExpertAnalysis and backend is empty
    if (section === "ExpertAnalysis" && (!data || data.length === 0)) {
      return MOCK_EXPERT_ARTICLES;
    }
    
    return data;
  } catch (err) {
    console.error(`Failed to fetch section ${section}`, err);
    return section === "ExpertAnalysis" ? MOCK_EXPERT_ARTICLES : [];
  }
}

export async function recordArticleView(id: string): Promise<void> {
  try {
    const headers: Record<string, string> = {};
    const Cookies = require("js-cookie");
    const token = typeof window !== "undefined" 
      ? ((Cookies.default ? Cookies.default.get("access_token") : Cookies.get("access_token")) || localStorage.getItem("auth_token"))
      : undefined;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    await fetch(`${API_BASE}/public/articles/${id}/view`, { 
      method: "POST",
      headers
    });
  } catch (err) {
    console.error("Failed to record view", err);
  }
}

export async function updateArticleDuration(id: string, durationSeconds: number): Promise<void> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const Cookies = require("js-cookie");
    const token = typeof window !== "undefined" 
      ? ((Cookies.default ? Cookies.default.get("access_token") : Cookies.get("access_token")) || localStorage.getItem("auth_token"))
      : undefined;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    // Using fetch with keepalive ensures it completes even if the tab is closing
    await fetch(`${API_BASE}/public/articles/${id}/view/duration`, { 
      method: "PATCH",
      headers,
      body: JSON.stringify({ duration_seconds: durationSeconds }),
      keepalive: true
    });
  } catch (err) {
    console.error("Failed to update article duration", err);
  }
}

export async function recordNewsView(newsId: number, title: string, slug: string): Promise<void> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const Cookies = require("js-cookie");
    const token = typeof window !== "undefined" 
      ? ((Cookies.default ? Cookies.default.get("access_token") : Cookies.get("access_token")) || localStorage.getItem("auth_token"))
      : undefined;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Record view in the news service to increment backend views counter
    fetch(`${NEWS_API_BASE}/id/${newsId}/view`, { method: "POST" }).catch(err => console.error("news_service view error", err));

    await fetch(`${API_BASE}/public/news/${newsId}/view`, { 
      method: "POST",
      headers,
      body: JSON.stringify({ title, slug })
    });
  } catch (err) {
    console.error("Failed to record news view", err);
  }
}

export async function getUserHistory(token: string, limit: number = 20, offset: number = 0): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/profile/history?limit=${limit}&offset=${offset}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch user history", err);
    return [];
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

export async function restoreArticle(id: string, token?: string): Promise<any> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/admin/articles/${id}/restore`, {
      method: "POST",
      headers
    });
    return await res.json();
  } catch (err) {
    console.error("Failed to restore article", err);
    return null;
  }
}

export async function getArticlesByKeyword(tag: string, page: number = 1, size: number = 20): Promise<any> {
    try {
        const res = await fetch(`${API_BASE}/public/articles/keyword/${tag}?page=${page}&size=${size}`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) return { items: [], total: 0, pages: 0 };
        return await res.json();
    } catch (err) {
        console.error("Failed to fetch articles by keyword", err);
        return { items: [], total: 0, pages: 0 };
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

export async function getHomepageCategorySections(limit?: number, categories?: string[]): Promise<Record<string, { slug: string, articles: Article[] }>> {
    try {
        const url = new URL(`${API_BASE}/public/homepage/category-sections`);
        if (limit !== undefined) {
            url.searchParams.append("limit", limit.toString());
        }
        if (categories && categories.length > 0) {
            categories.forEach(cat => url.searchParams.append("categories", cat));
        }
        const res = await fetch(url.toString(), { 
            next: { revalidate: 60 } 
        });
        if (!res.ok) return {};
        return await res.json();
    } catch (err) {
        console.error("Failed to fetch home category sections", err);
        return {};
    }
}

export async function getPublicKeywords(limit?: number): Promise<any[]> {
    try {
        const url = new URL(`${API_BASE}/public/keywords`);
        if (limit) url.searchParams.append("limit", limit.toString());
        const res = await fetch(url.toString(), { next: { revalidate: 60 } });
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        console.error("Failed to fetch keywords", err);
        return [];
    }
}

// --- Discovery & Interactivity ---

export async function subscribeToNewsletter(email: string): Promise<any> {
    try {
        const res = await fetch(`${API_BASE}/public/newsletter/subscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        return await res.json();
    } catch (err) {
        console.error("Failed to subscribe to newsletter", err);
        return null;
    }
}

export async function toggleFollow(user_id: string, target_id: string, target_type: 'category' | 'keyword'): Promise<any> {
    try {
        const res = await fetch(`${API_BASE}/public/follow/toggle`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id, target_id, target_type })
        });
        return await res.json();
    } catch (err) {
        console.error("Failed to toggle follow", err);
        return null;
    }
}

export async function getUserFollows(user_id: string): Promise<any[]> {
    try {
        const res = await fetch(`${API_BASE}/public/follows/${user_id}`, { cache: 'no-store' });
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        console.error("Failed to fetch user follows", err);
        return [];
    }
}

export function getUserIdentifier(): string {
    if (typeof window === 'undefined') return '';
    const token = localStorage.getItem('auth_token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload && payload.sub) {
                return payload.sub;
            }
        } catch (e) {
            // ignore
        }
    }
    let id = localStorage.getItem('rp_user_id');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('rp_user_id', id);
    }
    return id;
}

export async function getNewsLive(limit: number = 20): Promise<NewsArticle[]> {
  try {
    const res = await fetch(`${NEWS_API_BASE}/live?limit=${limit}`, { 
      next: { revalidate: 60 } 
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch live news", err);
    return [];
  }
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    const res = await fetch(`${NEWS_API_BASE}/slug/${slug}`, { 
      next: { revalidate: 300 } 
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch news slug ${slug}`, err);
    return null;
  }
}

export async function getNewsByCategory(category: string, limit: number = 20, skip: number = 0): Promise<{ items: NewsArticle[], total: number }> {
    try {
      const res = await fetch(`${NEWS_API_BASE}/categories/${category}?limit=${limit}&skip=${skip}`, { 
        next: { revalidate: 60 } 
      });
      if (!res.ok) return { items: [], total: 0 };
      const data = await res.json();
      return { items: data.items, total: data.total };
    } catch (err) {
      console.error(`Failed to fetch news category ${category}`, err);
      return { items: [], total: 0 };
    }
}

export async function getNewsByKeyword(keyword: string, limit: number = 20, skip: number = 0): Promise<{ items: NewsArticle[], total: number }> {
    try {
      const res = await fetch(`${NEWS_API_BASE}/keywords/${keyword}?limit=${limit}&skip=${skip}`, { 
        next: { revalidate: 60 } 
      });
      if (!res.ok) return { items: [], total: 0 };
      const data = await res.json();
      return { items: data.items, total: data.total };
    } catch (err) {
      console.error(`Failed to fetch news keyword ${keyword}`, err);
      return { items: [], total: 0 };
    }
}

export async function getNewsCategories(): Promise<string[]> {
  try {
    const response = await fetch(`${NEWS_API_BASE}/meta/categories`, {
      next: { revalidate: 3600 }
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getPopularKeywords(limit: number = 10): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE}/public/meta/popular-keywords?limit=${limit}`, {
      next: { revalidate: 3600 }
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching popular keywords:', error);
    return [];
  }
}

export async function getAllNewsAdmin(limit: number = 50, skip: number = 0, search: string = ""): Promise<{ items: NewsArticle[], total: number }> {
  try {
    let url = `${NEWS_API_BASE}/live?limit=${limit}&skip=${skip}&is_admin=true`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const res = await fetch(url, { 
      cache: 'no-store' 
    });
    if (!res.ok) return { items: [], total: 0 };
    const data = await res.json();
    // Backend returns an array; total comes from X-Total-Count header or we estimate
    const total = parseInt(res.headers.get('X-Total-Count') || '0', 10) || data.length;
    return { items: Array.isArray(data) ? data : [], total };
  } catch (err) {
    console.error("Failed to fetch all news admin", err);
    return { items: [], total: 0 };
  }
}

export async function getNewsByIdAdmin(id: string): Promise<NewsArticle | null> {
  try {
    const res = await fetch(`${NEWS_API_BASE}/id/${id}?is_admin=true`, { 
      cache: 'no-store' 
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch news by id", err);
    return null;
  }
}

export async function deleteNewsAdmin(id: number): Promise<any> {
  try {
    const res = await fetch(`${NEWS_API_BASE}/admin/${id}`, { method: "DELETE" });
    return await res.json();
  } catch (err) {
    console.error("Failed to delete news", err);
    return null;
  }
}

export async function updateNewsAdmin(id: number, data: Partial<NewsArticle>): Promise<any> {
  try {
    const res = await fetch(`${NEWS_API_BASE}/admin/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (err) {
    console.error("Failed to update news", err);
    return null;
  }
}

import { NewsArticle } from './types';

export async function getTopNews(): Promise<NewsArticle[]> {
  try {
    const res = await fetch(`${NEWS_API_BASE}/top`, { 
      next: { revalidate: 60 } 
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch top news", err);
    return [];
  }
}



