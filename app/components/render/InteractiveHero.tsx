"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface InteractiveHeroProps {
  imageSrc?: string;
}

export default function InteractiveHero({ imageSrc = "/quantum-hero.png" }: InteractiveHeroProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Mouse position for tilting
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // Transform values for tilt
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background Ambience - Layered Gradients */}
      <div className="absolute inset-0 bg-[#0B0E23]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(78,96,255,0.1)_0%,transparent_80%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0E23]/50 to-[#0A0D1F]" />
      
      {/* Interactive Chip Card */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          y: 0
        }}
        transition={{
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="relative w-full max-w-4xl h-[400px] md:h-[550px] group cursor-pointer z-10 px-4"
      >
        {/* Glow Layer */}
        <div className="absolute inset-0 bg-brand/10 blur-[120px] rounded-full scale-90 group-hover:bg-brand/20 transition-all duration-700" />
        
        {/* The Image Chip Container */}
        <div 
          className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(78,96,255,0.2)] border border-white/5 bg-[#0B0E23]/40 backdrop-blur-sm"
          style={{ transform: "translateZ(50px)" }}
        >
          <Image 
            src={imageSrc} 
            alt="Article Hero" 
            fill 
            className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700 scale-105 group-hover:scale-100 transition-transform duration-1000"
            priority
          />
          
          {/* Inner Light/Pulse Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D1F] via-transparent to-white/5 pointer-events-none" />
          
          {/* IQM Core Highlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand/20 blur-[80px] rounded-full animate-pulse pointer-events-none" />
        </div>

        {/* Decorative Circuit Lines overlay */}
        <div 
          className="absolute inset-0 border border-brand/30 rounded-[2rem] pointer-events-none transition-all duration-700 group-hover:border-brand/60 group-hover:scale-[1.02]"
          style={{ transform: "translateZ(80px)" }}
        />
        
        {/* Tech Corner Accents */}
        <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-brand/40 rounded-tl-xl pointer-events-none" style={{ transform: "translateZ(90px)" }} />
        <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-brand/40 rounded-br-xl pointer-events-none" style={{ transform: "translateZ(90px)" }} />
      </motion.div>

      {/* Hero Visual Polish - Scanner Line */}
      <motion.div 
        animate={{ y: [0, 500, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent opacity-20 pointer-events-none z-20"
      />

      {/* Helper text overlay */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none opacity-50 z-30">
         <div className="w-1 h-12 bg-gradient-to-b from-transparent via-brand to-transparent animate-bounce" />
         <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">Interactive Neural Core</span>
      </div>
    </div>
  );
}
