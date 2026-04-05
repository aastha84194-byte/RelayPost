export type SectionType = "hero" | "text" | "blockquote" | "sidebar" | "stats" | "comments" | "tags";

export interface Section {
  id: string;
  type: SectionType;
  heading?: string;
  content?: any;
  styles?: {
    fontFamily?: string;
    fontSize?: string;
    color?: string;
    backgroundColor?: string;
    padding?: string;
    textAlign?: "left" | "center" | "right";
  };
}

export interface Article {
  id: string;
  title: string;
  author: string;
  authorRole?: string;
  publishedAt: string;
  heroImage: string;
  sections: Section[];
  tags: string[];
  sidebarContent?: {
    relatedArticles?: any[];
    dataPoints?: any[];
    comments?: any[];
  };
}
