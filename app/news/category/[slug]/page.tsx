import React from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { getNewsByCategory } from '@/lib/articles';
import { Metadata } from 'next';
import NewsCategoryClient from './NewsCategoryClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedCategory = decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `${decodedCategory} News`,
    description: `Stay updated with the latest news and intelligence on ${decodedCategory} from RelayPost.`,
    openGraph: {
      title: `${decodedCategory} News`,
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

  // Fetch initial 20 articles
  const res = await getNewsByCategory(decodedCategory, 0, 20);
  const articles = res.items || [];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      <Navbar />
      
      <NewsCategoryClient 
        initialArticles={articles}
        decodedCategory={decodedCategory}
        slug={slug}
      />

      <Footer />
    </div>
  );
}
