export type SectionType = 
    'heading' | 
    'paragraph' | 
    'image' | 
    'quote' | 
    'graph' | 
    'table' | 
    'divider' |
    'bullet_list' |
    'numbered_list' |
    'youtube_embed' |
    'twitter_embed' |
    'code_block' |
    'callout' |
    'cta_block' |
    'faq_block' |
    'button_block';

export interface ContentBlock {
  id: string;
  type: SectionType;
  content?: any;
  styles?: {
    fontFamily?: string; // Rich fonts support
    fontSize?: string; // Custom px/rem
    fontWeight?: string; // bold, normal, etc.
    color?: string; // HEX
    backgroundColor?: string; // HEX
    align?: "left" | "center" | "right" | "justify";
    padding?: string;
    borderRadius?: string;
    borderLeftWidth?: string;
    borderLeftColor?: string;
    lineHeight?: string;
  };
  metadata?: {
    level?: 1 | 2 | 3 | 4 | 5 | 6; // For heading type
    caption?: string;
    altText?: string;
    chartType?: "bar" | "line" | "area" | "pie" | "graph"; // For graph type
    chartData?: any[]; // For data visualization
    tableData?: { headers: string[], rows: string[][] }; // For table type
    quoteStyle?: "minimal" | "block" | "callout" | "bordered";
    items?: string[]; // For list types
    language?: string; // For code_block type
    videoId?: string; // For youtube_embed type
    calloutType?: string; // For callout type
    icon?: string; // For callout type icon
    questions?: { question: string; answer: string; }[]; // For faq_block type
    title?: string; // For cta_block type
    buttonText?: string; // For cta_block type
    url?: string; // For button/cta type
  };
}

export type TemplateType = "standard" | "news" | "tech" | "seo_blog";
export type ThemeType = "standard" | "intelligence" | "sports";
export type ArticleStatus = "draft" | "pending_review" | "scheduled" | "published" | "archived" | "rejected";

export interface Article {
  id?: string;
  
  // Core Basic Info
  title: string;
  slug: string;
  subtitle?: string;
  author_id?: string;
  category_id?: string;
  category_name?: string;
  hero_image?: string;
  excerpt?: string;
  
  // Content Structure
  template_type: TemplateType;
  theme?: ThemeType;
  content_blocks: ContentBlock[];
  media_gallery?: any[];
  
  // SEO Sections
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  secondary_keywords?: string[];
  canonical_url?: string;
  schema_markup?: Record<string, any>;
  
  // GEO / AI SEO
  ai_summary?: string;
  key_takeaways?: Record<string, any>[];
  faq_section?: Record<string, any>[];
  
  // Admin fields
  status: ArticleStatus;
  visibility: string;
  is_featured: boolean;
  homepage_section?: string;
  section_order?: number;
  
  // Interactions
  views_count?: number;
  likes_count?: number;
  reflections?: Reflection[];
  
  // Timestamps
  scheduled_at?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Reflection {
  id: string;
  content: string;
  author_name?: string;
  author_role?: string;
  author_img?: string;
  is_anonymous: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Keyword {
  id: string;
  tag: string;
}
