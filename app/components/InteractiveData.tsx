"use client";
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function InteractiveData() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 is right
  const isHovered = useRef(false);
  const isPaused = useRef(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const chartsData = [
    { title: "GLOBAL TECH INDEX", val: "$1,166,524", icon: TrendingUp, color: "text-[#4f46e5]", bg: "bg-[#4f46e5]/10", perc: "+38%" },
    { title: "RENEWABLE ENERGY ADOPTION", val: "680 +29%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", perc: "+200%" },
    { title: "CRYPTOCURRENCY MARKET CAP", val: "$1.36T CAP", icon: TrendingDown, color: "text-purple-500", bg: "bg-purple-500/10", perc: "+242%" },
    { title: "GLOBAL TECH INDEX", val: "$1,166,524", icon: TrendingUp, color: "text-[#4f46e5]", bg: "bg-[#4f46e5]/10", perc: "+38%" },
    { title: "RENEWABLE ENERGY ADOPTION", val: "680 +29%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", perc: "+200%" },
    { title: "CRYPTOCURRENCY MARKET CAP", val: "$1.36T CAP", icon: TrendingDown, color: "text-purple-500", bg: "bg-purple-500/10", perc: "+242%" }
  ];

  // Use 3 sets for infinite scrolling
  const charts = [...chartsData, ...chartsData, ...chartsData];

  useEffect(() => {
    if (scrollRef.current) {
      const setWidth = scrollRef.current.scrollWidth / 3;
      scrollRef.current.scrollLeft = setWidth;
    }
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp: number;

    const animateScroll = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (scrollRef.current) {
        if (!isHovered.current && !isPaused.current) {
          const speed = 0.05 * deltaTime;
          scrollRef.current.scrollLeft += speed * direction;
        }

        const { scrollLeft, scrollWidth } = scrollRef.current;
        const setWidth = scrollWidth / 3;

        if (scrollLeft >= setWidth * 2) {
           scrollRef.current.scrollLeft -= setWidth;
        } else if (scrollLeft <= 0) {
           scrollRef.current.scrollLeft += setWidth;
        }
      }

      animationFrameId = requestAnimationFrame(animateScroll);
    };

    animationFrameId = requestAnimationFrame(animateScroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [direction]);

  const changeDirectionAndScroll = (newDirection: 'left' | 'right') => {
    setDirection(newDirection === 'left' ? -1 : 1);
    
    isPaused.current = true;
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => (isPaused.current = false), 800);

    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ 
        left: newDirection === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaX > 0 || e.deltaY > 0) {
      setDirection(1);
    } else if (e.deltaX < 0 || e.deltaY < 0) {
      setDirection(-1);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-dark-bg mb-1 border-l-4 border-[#4f46e5] pl-3 dark:text-white transition-colors duration-300">Interactive Data</h2>
          <p className="text-sm text-gray-500 ml-4 dark:text-slate-400 transition-colors duration-300">Live market trends with animated visualizations</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => changeDirectionAndScroll('left')}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors shadow-sm ${direction === -1 ? 'bg-brand text-white border-brand dark:bg-brand dark:text-white dark:border-brand' : 'bg-white border-gray-200 text-gray-500 hover:text-brand dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:shadow-none'}`}
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => changeDirectionAndScroll('right')}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors shadow-sm ${direction === 1 ? 'bg-brand text-white border-brand dark:bg-brand dark:text-white dark:border-brand' : 'bg-white border-gray-200 text-gray-500 hover:text-brand dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:shadow-none'}`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden w-full relative pb-4">
        <div 
          ref={scrollRef}
          onMouseEnter={() => (isHovered.current = true)}
          onMouseLeave={() => (isHovered.current = false)}
          onWheel={handleWheel}
          className="flex gap-3 overflow-x-auto hide-scrollbar"
        >
          {charts.map((chart, i) => (
            <div key={i} className="w-[300px]  rounded-2xl shrink-0 bg-white p-5 border border-gray-200 overflow-hidden flex flex-col group cursor-pointer hover:bg-gray-50 hover:-translate-y-2 active:-translate-y-3 hover:shadow-xl hover:z-10 transition-all duration-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/50">
              <div className="flex justify-between items-start mb-2 relative z-10">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-500 tracking-wider mb-1 uppercase dark:text-slate-400 transition-colors duration-300">{chart.title}</h4>
                  <p className="text-xl font-bold text-dark-bg leading-none dark:text-white transition-colors duration-300">{chart.val}</p>
                </div>
                <div className={`p-1.5 rounded-full ${chart.bg} ${chart.color} group-hover:scale-110 transition-transform`}>
                  <chart.icon size={12} strokeWidth={3} />
                </div>
              </div>

              {/* Simple Bar Chart Visualization */}
              <div className="h-16 mt-4 flex items-end justify-between gap-3 px-1">
                {generateBars(i % 3).map((h, j) => (
                  <motion.div
                    key={j}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: (j * 0.1) + ((i % 3) * 0.2) }}
                    className={`w-full rounded-t-sm ${j === 3 ? chart.color.replace('text-', 'bg-') : 'bg-gray-100 group-hover:bg-gray-200'} transition-colors duration-300`}
                  />
                ))}
              </div>

              <div className="flex justify-between items-center mt-auto pt-4 text-[10px] text-gray-400 font-bold">
                <span>{['MAY', 'MAR 20', 'DEC 22'][i % 3]}</span>
                <span className={chart.color}>{chart.perc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function generateBars(i: number) {
  if (i === 0) return [40, 60, 45, 90, 40, 50, 45];
  if (i === 1) return [30, 40, 35, 60, 45, 90, 80];
  return [20, 30, 45, 80, 50, 40, 35];
}
