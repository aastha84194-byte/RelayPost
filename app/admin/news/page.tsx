"use client";
import React, { useEffect, useState, useCallback } from "react";
import { NewsArticle } from "@/lib/types";
import { getAllNewsAdmin, deleteNewsAdmin } from "@/lib/articles";
import { Edit, Trash2, Globe, CheckCircle, XCircle, ChevronLeft, ChevronRight, RefreshCw, Search, Copy, Check } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 25;

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleCopyUrl = (id: number, url: string) => {
    if (url) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchNews = useCallback(async (p: number = 1, sq: string = "") => {
    setLoading(true);
    const skip = (p - 1) * PAGE_SIZE;
    const data = await getAllNewsAdmin(PAGE_SIZE, skip, sq);
    setNews(data.items);
    setTotal(data.total || data.items.length);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNews(page, searchQuery);
  }, [page, searchQuery, fetchNews]);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this news article?")) {
      await deleteNewsAdmin(id);
      fetchNews(page, searchQuery);
    }
  };

  const goToPage = (p: number) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">News Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total > 0 ? `${total} articles total — Page ${page} of ${totalPages}` : "Loading..."}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search news..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 bg-white"
            />
          </div>
          <button
            onClick={() => fetchNews(page, searchQuery)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh Feed
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
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
                        <button
                          onClick={() => handleCopyUrl(item.id, item.url || "")}
                          title="Copy URL"
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        >
                          {copiedId === item.id ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                        </button>
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

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPageNumbers().map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-3 py-2 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p as number)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        page === p
                          ? "bg-indigo-600 text-white"
                          : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
