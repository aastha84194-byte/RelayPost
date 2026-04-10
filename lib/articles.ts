import { Article } from './types';

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


const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://content-servive.onrender.com";

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
