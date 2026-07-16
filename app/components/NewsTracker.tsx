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
    recordNewsView(newsId, title, slug);
  }, [newsId, title, slug]);

  return null;
}
