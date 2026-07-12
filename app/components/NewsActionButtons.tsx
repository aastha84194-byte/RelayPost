"use client";
import React, { useState, useEffect } from 'react';
import { Share2, Bookmark, BookmarkCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { API_BASE } from "@/lib/config";

interface NewsArticleType {
  id: number;
  title: string;
  slug: string;
  image_url?: string;
  hero_image?: string;
  source_name?: string;
  category?: string;
}

interface Props {
  newsArticle: NewsArticleType;
}

export default function NewsActionButtons({ newsArticle }: Props) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Check if bookmarked already
    const checkBookmarkStatus = async () => {
      const token = Cookies.get("access_token");
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/bookmarks?source_type=news&limit=100`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const found = (data.bookmarks || []).some(
            (b: any) => b.news_article_id === newsArticle.id
          );
          setIsSaved(found);
        }
      } catch (e) {
        console.error("Failed to check bookmark status", e);
      }
    };
    checkBookmarkStatus();
  }, [newsArticle.id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!", { id: `news-share-${newsArticle.id}` });
  };

  const handleBookmark = async () => {
    if (isSaving) return;
    const token = Cookies.get("access_token");
    if (!token) {
      toast.error("Please login to save this news article", { id: "news-bookmark-auth" });
      return;
    }

    setIsSaving(true);
    const previousState = isSaved;
    setIsSaved(!isSaved);

    try {
      if (previousState) {
        // Unbookmark (we need to get the bookmark ID first to DELETE it)
        const checkRes = await fetch(`${API_BASE}/bookmarks?source_type=news&limit=100`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (checkRes.ok) {
          const data = await checkRes.json();
          const bookmarkItem = (data.bookmarks || []).find(
            (b: any) => b.news_article_id === newsArticle.id
          );
          if (bookmarkItem) {
            const delRes = await fetch(`${API_BASE}/bookmarks/${bookmarkItem.id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
            if (delRes.ok) {
              toast.success("Removed from saved news.", { id: `news-bookmark-${newsArticle.id}` });
              setIsSaved(false);
            } else {
              throw new Error("Failed to delete bookmark");
            }
          }
        }
      } else {
        // Create bookmark
        const res = await fetch(`${API_BASE}/bookmarks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            source_type: "news",
            news_article_id: newsArticle.id,
            news_title: newsArticle.title,
            news_slug: newsArticle.slug,
            news_image_url: newsArticle.image_url || newsArticle.hero_image || "",
            news_source: newsArticle.source_name || newsArticle.category || "News"
          })
        });

        if (res.ok) {
          toast.success("News article saved to your profile!", { id: `news-bookmark-${newsArticle.id}` });
          setIsSaved(true);
        } else if (res.status === 429) {
          const data = await res.json();
          toast.error(data.detail?.message || "Bookmark limit reached", { id: `news-bookmark-limit-${newsArticle.id}` });
          setIsSaved(previousState);
        } else {
          throw new Error('Failed to save');
        }
      }
    } catch (err) {
      setIsSaved(previousState);
      toast.error("Failed to update bookmark", { id: `news-bookmark-err-${newsArticle.id}` });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex gap-4">
      <button 
        onClick={handleBookmark} 
        disabled={isSaving}
        className={`p-2 rounded-full border transition-colors ${
          isSaved 
            ? "bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800/30" 
            : "border-slate-100 dark:border-slate-800 text-slate-400 hover:text-indigo-600"
        }`}
        title={isSaved ? "Remove bookmark" : "Bookmark news"}
      >
        {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
      </button>

      <button onClick={handleShare} className="p-2 rounded-full border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-indigo-600 transition-colors" title="Copy link">
        <Share2 size={18} />
      </button>
    </div>
  );
}
