import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SupportMission from "./SupportMission";
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
              <div className="flex items-center">
                <span className="text-white font-bold text-xl tracking-tight">RelayPost</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mb-6 max-w-sm">
              A modern, premium destination for news and articles.            </p>
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
          <SupportMission />
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 dark:text-slate-400 transition-colors duration-300">
          <p>Copyright © 2026 RelayPost</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-gray-300 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
