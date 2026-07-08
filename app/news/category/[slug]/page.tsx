import React from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { getNewsByCategory } from '@/lib/articles';
import { NewsCard } from '../../../components/NewsCard';
import { Layers, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedCategory = decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `${decodedCategory} News | RelayPost`,
    description: `Stay updated with the latest news and intelligence on ${decodedCategory} from RelayPost.`,
    openGraph: {
      title: `${decodedCategory} News | RelayPost`,
      description: `Stay updated with the latest news and intelligence on ${decodedCategory} from RelayPost.`,
    },
    alternates: {
      canonical: `https://relaypost.com/news/category/${slug}`
    }
  };
}

export default async function NewsCategoryPage({ params }: Props) {
  const { slug } = await params;
  const decodedCategory = decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const res = await getNewsByCategory(decodedCategory, 50);
  const articles = res.items || [];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col gap-4">
            <Link 
              href="/news"
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors w-fit"
            >
              <ArrowLeft size={16} />
              Back to News
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <Layers size={20} className="text-indigo-600" />
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {decodedCategory} News
              </h1>
            </div>
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            No news article found for this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((item) => (
              <NewsCard key={item.id} article={item} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
