import { 
  Cpu, 
  Globe, 
  Microscope, 
  Coffee, 
  Trophy, 
  Briefcase, 
  UserCircle,
  Leaf,
  Utensils,
  Brain,
  Palette,
  Map,
  BookOpen
} from "lucide-react";

export interface CategoryMapping {
  id: string;
  name: string;
  shortName?: string;
  slug: string;
  description: string;
  icon: any;
  isPrimary: boolean;
  backendSlugs: string[]; // Slugs from the backend that fall into this category
  image_url?: string;
}

export const HARDCODED_CATEGORIES: CategoryMapping[] = [
  // --- 7 Primary Categories ---
  {
    id: "cat-technology",
    name: "Technology",
    shortName: "Technology",
    slug: "technology",
    description: "Explore how technology is shaping industries, innovation, and everyday life around the world.",
    icon: Cpu,
    isPrimary: true,
    backendSlugs: ["technology", "technology-innovation"],
    image_url: "/categories/technology.webp"
  },
  {
    id: "cat-global",
    name: "Global",
    shortName: "Global",
    slug: "global",
    description: "Stay informed on global events, trends, and developments that influence our connected world.",
    icon: Globe,
    isPrimary: true,
    backendSlugs: ["global", "world-news"],
    image_url: "/categories/global.webp"
  },
  {
    id: "cat-science",
    name: "Science & Health",
    shortName: "Science",
    slug: "science-health",
    description: "Discover the latest breakthroughs, research, and health insights shaping the future.",
    icon: Microscope,
    isPrimary: true,
    backendSlugs: ["science-health", "science-nature", "health-medicine", "psychology-behavior"],
    image_url: "/categories/science.webp"
  },
  {
    id: "cat-lifestyle",
    name: "Lifestyle & Culture",
    shortName: "Lifestyle",
    slug: "lifestyle-culture",
    description: "Dive into modern living, arts, society, and the cultural shifts defining our generation.",
    icon: Coffee,
    isPrimary: true,
    backendSlugs: ["lifestyle-culture", "society-culture"],
    image_url: "/categories/lifestyle.webp"
  },
  {
    id: "cat-sports",
    name: "Sports",
    shortName: "Sports",
    slug: "sports",
    description: "Coverage of major athletic events, team dynamics, and the business of global sports.",
    icon: Trophy,
    isPrimary: true,
    backendSlugs: ["sports"],
    image_url: "/categories/sports.webp"
  },
  {
    id: "cat-business",
    name: "Business & Economy",
    shortName: "Business",
    slug: "business-economy",
    description: "Analysis of market trends, economic shifts, and the strategies driving corporate growth.",
    icon: Briefcase,
    isPrimary: true,
    backendSlugs: ["business-economy", "economics-money"],
    image_url: "/categories/business.webp"
  },
  {
    id: "cat-careers",
    name: "Professionals & Careers",
    shortName: "Careers",
    slug: "professionals-careers",
    description: "Actionable insights for career advancement, leadership, and navigating the modern workplace.",
    icon: UserCircle,
    isPrimary: true,
    backendSlugs: ["professionals-careers", "business-work"],
    image_url: "/categories/professionals.webp"
  },

  // --- 6 Distinct Categories (Standalone) ---
  {
    id: "cat-environment",
    name: "Environment",
    slug: "environment",
    description: "In-depth reporting on climate change, sustainability, and green energy innovations.",
    icon: Leaf,
    isPrimary: false,
    backendSlugs: ["environment-energy"],
    image_url: "/categories/environment.webp"
  },
  {
    id: "cat-food",
    name: "Food & Agriculture",
    slug: "food-agriculture",
    description: "Exploring global food systems, agricultural technology, and culinary trends.",
    icon: Utensils,
    isPrimary: false,
    backendSlugs: ["food-agriculture"],
    image_url: "/categories/food.webp"
  },
  {
    id: "cat-education",
    name: "Education & Learning",
    slug: "education-learning",
    description: "Tracking the evolution of education systems and new methodologies for lifelong learning.",
    icon: Brain,
    isPrimary: false,
    backendSlugs: ["education-learning"],
    image_url: "/categories/education.webp"
  },
  {
    id: "cat-arts",
    name: "Arts & Entertainment",
    slug: "arts-entertainment",
    description: "Curated perspectives on film, music, literature, and the creative industries.",
    icon: Palette,
    isPrimary: false,
    backendSlugs: ["arts-entertainment", "arts-design-media", "design-media", "arts"],
    image_url: "/categories/arts.webp"
  },
  {
    id: "cat-travel",
    name: "Travel & Places",
    slug: "travel-places",
    description: "Guides and stories highlighting global destinations, cultures, and the future of travel.",
    icon: Map,
    isPrimary: false,
    backendSlugs: ["travel-places", "travel-geography"],
    image_url: "/categories/travel.webp"
  },
  {
    id: "cat-history",
    name: "History & Ideas",
    slug: "history-ideas",
    description: "Reflections on historical events and the philosophical ideas shaping human progress.",
    icon: BookOpen,
    isPrimary: false,
    backendSlugs: ["history-ideas"],
    image_url: "/categories/history.webp"
  }
];

export function getCategoryMapping(slug: string): CategoryMapping | undefined {
  return HARDCODED_CATEGORIES.find(cat => cat.slug === slug || cat.backendSlugs.includes(slug));
}

export function getAllBackendSlugsForFrontendSlug(frontendSlug: string): string[] {
  const cat = HARDCODED_CATEGORIES.find(c => c.slug === frontendSlug);
  return cat ? cat.backendSlugs : [frontendSlug];
}
