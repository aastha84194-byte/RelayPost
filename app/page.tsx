"use client";
import React, { Suspense } from 'react';
import HeroSection from './components/HeroSection';
import TrendingNow from './components/TrendingNow';
import LatestInsights from './components/LatestInsights';
import TechSpotlight from './components/TechSpotlight';
import ExpertAnalysis from './components/ExpertAnalysis';

import PopularConversations from './components/PopularConversations';
import GoUnlimited from './components/GoUnlimited';
import Navbar from './components/Navbar';
import TheBriefing from './components/TheBriefing';
import CommunityPulse from './components/CommunityPulse';
import Footer from './components/Footer';
import CategoryArticleSection from './components/CategoryArticleSection';
import LiveInsightsSidebar from './components/LiveInsightsSidebar';
import { getArticlesBySection, getHomepageCategorySections, getPopularKeywords, getNewsLive, getAllArticles } from '@/lib/articles';
import { Article, NewsArticle } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

function HomeContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const [trending, setTrending] = React.useState<Article[]>([]);
  const [expert, setExpert] = React.useState<Article[]>([]);
  const [insights, setInsights] = React.useState<Article[]>([]);
  const [techSpotlight, setTechSpotlight] = React.useState<Article[]>([]);
  const [heroes, setHeroes] = React.useState<Article[]>([]);
  const [categorySections, setCategorySections] = React.useState<Record<string, { slug: string, articles: Article[] }>>({});
  const [derivedKeywords, setDerivedKeywords] = React.useState<string[]>([]);
  const [news, setNews] = React.useState<NewsArticle[]>([]);
  const [allCategoryArticles, setAllCategoryArticles] = React.useState<Article[]>([]);
  const [skip, setSkip] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const [isFetchingMore, setIsFetchingMore] = React.useState(false);
  const observerTarget = React.useRef(null);

  const [isTrendingLoading, setIsTrendingLoading] = React.useState(true);
  const [isExpertLoading, setIsExpertLoading] = React.useState(true);
  const [isInsightsLoading, setIsInsightsLoading] = React.useState(true);
  const [isTechSpotlightLoading, setIsTechSpotlightLoading] = React.useState(true);
  const [isHeroesLoading, setIsHeroesLoading] = React.useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = React.useState(true);
  const [isKeywordsLoading, setIsKeywordsLoading] = React.useState(true);
  const [isNewsLoading, setIsNewsLoading] = React.useState(true);
  const [isAllCategoryArticlesLoading, setIsAllCategoryArticlesLoading] = React.useState(true);

  React.useEffect(() => {
    setIsTrendingLoading(true);
    setIsExpertLoading(true);
    setIsInsightsLoading(true);
    setIsTechSpotlightLoading(true);
    setIsHeroesLoading(true);
    setIsCategoriesLoading(true);
    setIsKeywordsLoading(true);
    setIsNewsLoading(true);
    setIsAllCategoryArticlesLoading(true);

    getArticlesBySection("TrendingNow", category || undefined)
      .then((data) => {
        setTrending(data);
        setIsTrendingLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsTrendingLoading(false);
      });

    getArticlesBySection("ExpertAnalysis", category || undefined)
      .then((data) => {
        setExpert(data);
        setIsExpertLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsExpertLoading(false);
      });

    getArticlesBySection("LatestInsights", category || undefined)
      .then((data) => {
        setInsights(data);
        setIsInsightsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsInsightsLoading(false);
      });

    getArticlesBySection("TechSpotlight", category || undefined)
      .then((data) => {
        setTechSpotlight(data);
        setIsTechSpotlightLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsTechSpotlightLoading(false);
      });

    getArticlesBySection("Hero", category || undefined)
      .then((data) => {
        setHeroes(data);
        setIsHeroesLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsHeroesLoading(false);
      });

    getHomepageCategorySections(5)
      .then((data) => {
        setCategorySections(data);
        setIsCategoriesLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsCategoriesLoading(false);
      });

    getPopularKeywords(10)
      .then((data) => {
        setDerivedKeywords(data);
        setIsKeywordsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsKeywordsLoading(false);
      });

    getNewsLive(5)
      .then((data) => {
        setNews(data);
        setIsNewsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsNewsLoading(false);
      });

    if (category) {
      setSkip(0);
      setHasMore(true);
      getAllArticles(category, 0, 20)
        .then((data) => {
          setAllCategoryArticles(data);
          setIsAllCategoryArticlesLoading(false);
          if (data.length < 20) setHasMore(false);
        })
        .catch((err) => {
          console.error(err);
          setIsAllCategoryArticlesLoading(false);
        });
    } else {
      setAllCategoryArticles([]);
      setIsAllCategoryArticlesLoading(false);
      setHasMore(false);
    }
  }, [category]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isAllCategoryArticlesLoading && category) {
          setIsFetchingMore(true);
          const nextSkip = skip + 20;
          getAllArticles(category, nextSkip, 20)
            .then((data) => {
              if (data.length > 0) {
                setAllCategoryArticles(prev => {
                  const existingIds = new Set(prev.map(a => a.id));
                  const newArticles = data.filter(a => !existingIds.has(a.id));
                  return [...prev, ...newArticles];
                });
                setSkip(nextSkip);
              }
              if (data.length < 20) {
                setHasMore(false);
              }
              setIsFetchingMore(false);
            })
            .catch(err => {
              console.error(err);
              setIsFetchingMore(false);
            });
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isFetchingMore, isAllCategoryArticlesLoading, category, skip]);

  return (
    <div className="min-h-full flex flex-col font-sans overflow-x-hidden bg-white md:bg-[#F8F9FB] dark:bg-slate-900 dark:md:bg-[#0f172a] transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-2 pb-6 md:py-4">
          
          <AnimatePresence mode="wait">
            {category && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{category}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Showing all articles related to {category}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* LEFT COLUMN - 8 columns wide */}
            <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">
              {isHeroesLoading ? (
                <div className="h-[360px] md:h-[460px] bg-slate-200 dark:bg-slate-800 rounded-3xl md:rounded-[2.5rem] animate-pulse w-full" />
              ) : (
                heroes.length > 0 && <HeroSection articles={heroes} />
              )}

              {isTrendingLoading ? (
                <div className="space-y-4 animate-pulse w-full">
                  <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="flex gap-4 overflow-hidden">
                    <div className="h-[180px] w-[240px] shrink-0 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="h-[180px] w-[240px] shrink-0 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="h-[180px] w-[240px] shrink-0 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  </div>
                </div>
              ) : (
                trending.length > 0 && <TrendingNow articles={trending} />
              )}

              {isInsightsLoading ? (
                <div className="h-[300px] bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] animate-pulse w-full" />
              ) : (
                insights.length > 0 && <LatestInsights articles={insights} />
              )}

              {isTechSpotlightLoading ? (
                <div className="h-[300px] bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] animate-pulse w-full" />
              ) : (
                !category && techSpotlight.length > 0 && <TechSpotlight articles={techSpotlight} />
              )}

              {isExpertLoading ? (
                <div className="h-[250px] bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] animate-pulse w-full" />
              ) : (
                expert.length > 0 && <ExpertAnalysis articles={expert} />
              )}

              {/* News section on mobile view, placed right above categories */}
              <div className="block lg:hidden">
                <LiveInsightsSidebar news={news} isLoading={isNewsLoading} />
              </div>

              {isCategoriesLoading ? (
                <div className="space-y-8 animate-pulse w-full">
                  <div className="h-[280px] bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] w-full" />
                  <div className="h-[280px] bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] w-full" />
                </div>
              ) : (
                !category && Object.entries(categorySections).map(([name, data]) => (
                  <CategoryArticleSection 
                    key={name}
                    title={name}
                    slug={data.slug}
                    articles={data.articles}
                  />
                ))
              )}

              {category && !isAllCategoryArticlesLoading && allCategoryArticles.length > 0 && (
                <>
                  <CategoryArticleSection 
                    title={`All ${category} Articles`}
                    slug={category}
                    articles={allCategoryArticles}
                  />
                  {hasMore && (
                    <div ref={observerTarget} className="w-full flex justify-center py-8">
                      <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* RIGHT COLUMN - Sidebar - 4 columns wide */}
            <div className="lg:col-span-4 flex flex-col pl-0 lg:pl-4">
              <div className="hidden lg:block">
                <LiveInsightsSidebar news={news} isLoading={isNewsLoading} />
              </div>
              <PopularConversations articles={trending.slice(0, 5)} />
              <GoUnlimited />
              <TheBriefing />
              {isKeywordsLoading ? (
                <div className="h-[150px] bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] animate-pulse w-full mt-6" />
              ) : (
                derivedKeywords.length > 0 && <CommunityPulse keywords={derivedKeywords} />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function HomeFallback() {
  return (
    <div className="min-h-full flex flex-col font-sans bg-white md:bg-[#F8F9FB] dark:bg-slate-900 dark:md:bg-[#0f172a] transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 w-full">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-8 animate-pulse w-full">
                 <div className="h-[400px] bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] w-full"></div>
                 <div className="h-[300px] bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] w-full"></div>
              </div>
              <div className="lg:col-span-4 space-y-8 animate-pulse w-full">
                 <div className="h-[200px] bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] w-full"></div>
                 <div className="h-[300px] bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] w-full"></div>
              </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}
