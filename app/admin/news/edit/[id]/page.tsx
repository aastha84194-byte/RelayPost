"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { NewsArticle } from "@/lib/types";
import { getNewsByIdAdmin, updateNewsAdmin } from "@/lib/articles";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<Partial<NewsArticle>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) return;
      const data = await getNewsByIdAdmin(id);
      if (data) setArticle(data);
      setLoading(false);
    };
    fetchNews();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setArticle({ ...article, [name]: checked });
    } else {
      setArticle({ ...article, [name]: value });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateNewsAdmin(parseInt(id), article);
      alert("Article updated successfully!");
      router.push("/admin/news");
    } catch (err) {
      console.error(err);
      alert("Failed to update article.");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/news" className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Edit News Article</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={article.title || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
            <input
              type="text"
              name="slug"
              value={article.slug || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <input
              type="text"
              name="category"
              value={article.category || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">AI Summary</label>
            <textarea
              name="ai_summary"
              value={article.ai_summary || ""}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Analysis</label>
            <textarea
              name="full_analysis"
              value={article.full_analysis || ""}
              onChange={handleChange}
              rows={12}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg font-mono text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Original Content (Scraped)</label>
            <textarea
              name="content"
              value={article.content || ""}
              onChange={handleChange}
              rows={8}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Source Name</label>
            <input
              type="text"
              name="source_name"
              value={article.source_name || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Source URL</label>
            <input
              type="text"
              name="url"
              value={article.url || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>

          <div className="col-span-2 flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="is_verified"
              name="is_verified"
              checked={article.is_verified || false}
              onChange={handleChange}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="is_verified" className="text-sm font-semibold text-gray-700">
              Verified by AI (Genuine/Factual)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
