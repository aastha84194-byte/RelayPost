"use client";
import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ParticleEffect from './ParticleEffect';

export default function HeroSection() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden min-h-[460px] group shadow-xl"
    >
      <div className="absolute inset-0">
        <Image 
          src="/jeremy-thomas-E0AHdsENmDg-unsplash.jpg" 
          alt="Quantum Computing" 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
      </div>
      
      <ParticleEffect />
      
      <div className="absolute bottom-0 left-0 right-0 p-8 z-20 pointer-events-none">
        <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-white mb-4 border border-white/20 pointer-events-auto">
          SPACE & TECH
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight max-w-2xl pointer-events-auto">
          The Quantum Frontier: How Computing is Reshaping Reality
        </h1>
        <p className="text-gray-200 mb-6 max-w-2xl text-sm md:text-base pointer-events-auto">
          The shift from bits to qubits represents more than a speed upgrade - it&apos;s a fundamental change in how we process the universe&apos;s most complex problems.
        </p>
        <button className="bg-brand hover:bg-brand-dark text-white px-6 py-2.5 rounded-full font-medium inline-flex items-center gap-2 transition-colors shadow-lg shadow-brand/30 pointer-events-auto">
          Read More
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.section>
  );
}
