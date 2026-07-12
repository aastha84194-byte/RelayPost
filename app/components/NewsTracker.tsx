"use client";

import { useEffect } from "react";
import { recordNewsView } from "@/lib/articles";

interface NewsTrackerProps {
  newsId: number;
  title: string;
  slug: string;
}

export default function NewsTracker({ newsId, title, slug }: NewsTrackerProps) {
  useEffect(() => {
    // Record that the user viewed this news article
    recordNewsView(newsId, title, slug);
  }, [newsId, title, slug]);

  return null; // This component doesn't render anything
}
