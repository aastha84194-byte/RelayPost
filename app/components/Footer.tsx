import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-bg text-gray-300 py-16 mt-24 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 mb-12">
          
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                <img src="/favicon.ico" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-white font-bold text-lg tracking-tight">Relay</span>
                <span className="text-indigo-400 text-[10px] font-semibold uppercase tracking-widest">Post</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mb-6 max-w-sm">
              Premium, modern redesign of an article posting homepage platform with rich interactivity.
            </p>
          </div>

          {/* Links Col 1 */}
          <div className="col-span-1 md:col-span-1">
            <h4 className="text-white font-semibold mb-4 text-base">About</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="col-span-1 md:col-span-1">
            <h4 className="text-white font-semibold mb-4 text-base">Categories</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Sports</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Health</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Entertainment</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Politics</Link></li>
            </ul>
          </div>

          {/* Mission & Newsletter Box */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-white font-semibold mb-4 text-base">Support the Mission</h4>
            <p className="text-sm text-gray-400 mb-4">
              Sign up for exclusive content and monthly contributions to the site.
            </p>
            <div className="flex items-center bg-dark-surface rounded-full p-1 border border-gray-700/50 focus-within:border-brand/50 transition-colors max-w-sm">
              <span className="pl-4 text-gray-500 dark:text-slate-400 transition-colors duration-300">$</span>
              <input 
                type="number" 
                placeholder="/ monthly" 
                className="bg-transparent border-none outline-none text-white text-sm w-full p-2 placeholder-gray-500"
              />
              <button className="w-8 h-8 rounded-full bg-brand hover:bg-brand-dark flex flex-shrink-0 items-center justify-center text-white transition-colors">
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 dark:text-slate-400 transition-colors duration-300">
          <p>Copyright © 2026 RelayPost</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
