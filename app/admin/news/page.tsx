"use client";
import React, { useEffect, useState } from "react";
import { NewsArticle } from "@/lib/types";
import { getAllNewsAdmin, deleteNewsAdmin } from "@/lib/articles";
import { Edit, Trash2, Globe, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    const data = await getAllNewsAdmin(50);
    setNews(data);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this news article?")) {
      await deleteNewsAdmin(id);
      fetchNews();
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">News Management</h1>
        <button 
          onClick={fetchNews}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Refresh Feed
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                <th className="p-4">Source</th>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Published</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                      <Globe size={12} /> {item.source_name}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-800 max-w-md truncate">{item.title}</div>
                    <div className="text-xs text-gray-400 mt-1">Cluster: {item.cluster_id || 'None'}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                      {item.category || 'General'}
                    </span>
                  </td>
                  <td className="p-4">
                    {item.is_verified ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded w-max">
                        <CheckCircle size={12} /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded w-max">
                        <XCircle size={12} /> Unverified
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-600">
                      {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/news/edit/${item.id}`}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      >
                        <Edit size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {news.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No news ingested yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
