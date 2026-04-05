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
    <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden bg-[#0B0E23]">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(78,96,255,0.15)_0%,transparent_70%)] animate-pulse" />
      
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          y: [0, -15, 0] // Constant Floating
        }}
        transition={{
          opacity: { duration: 0.8 },
          scale: { duration: 0.8 },
          y: { 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }
        }}
        className="relative w-[320px] h-[320px] md:w-[450px] md:h-[450px] group cursor-pointer z-20"
      >
        {/* Glow Layer */}
        <div className="absolute inset-0 bg-brand/20 blur-[100px] rounded-full scale-75 group-hover:bg-brand/30 transition-colors duration-500" />
        
        {/* The Image Chip */}
        <div 
          className="absolute inset-0 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(78,96,255,0.3)] border border-white/10 bg-[#0B0E23]"
          style={{ transform: "translateZ(50px)" }}
        >
          <Image 
            src={imageSrc} 
            alt="Quantum Chip" 
            fill 
            className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500 scale-110 group-hover:scale-100 transition-transform duration-700"
          />
          
          {/* Inner Light/Pulse Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand/20 via-transparent to-transparent pointer-events-none" />
          
          {/* IQM Core Highlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-brand/40 blur-[40px] rounded-full animate-pulse pointer-events-none" />
        </div>

        {/* Decorative Circuit Lines (Simulated Layer) */}
        <div 
          className="absolute inset-0 border-2 border-brand/20 rounded-3xl pointer-events-none transition-all duration-500 group-hover:border-brand/40"
          style={{ transform: "translateZ(75px) scale(1.05)" }}
        />
      </motion.div>

      {/* Helper text overlay */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none opacity-50 z-30">
         <div className="w-1 h-12 bg-gradient-to-b from-transparent via-brand to-transparent animate-bounce" />
         <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">Interactive Neural Core</span>
      </div>
    </div>
  );
}
