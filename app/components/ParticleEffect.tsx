"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface ParticleEffectProps {
  mode?: 'repel' | 'attract';
  interactiveId?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export default function ParticleEffect({ mode = 'repel', interactiveId }: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  // Initialize particles
  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    const numParticles = 180;
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        color: `rgba(255, 255, 255, ${Math.random() * 0.6 + 0.2})`
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    
    // Setup high DPI canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    initParticles(width, height);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      const mouse = mouseRef.current;
      const radius = mode === 'attract' ? 250 : 120;
      
      particlesRef.current.forEach(p => {
        // Natural drifting movement
        p.x += p.vx;
        p.y += p.vy;

        // Particle Interaction Logic
        if (isHovering) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (radius - distance) / radius;
            
            if (mode === 'attract') {
              // Pull toward mouse
              const pull = 0.5;
              p.vx = (p.vx + forceDirectionX * force * pull) * 0.95;
              p.vy = (p.vy + forceDirectionY * force * pull) * 0.95;
            } else {
              // Push away from mouse
              const push = 3;
              p.x -= forceDirectionX * force * push;
              p.y -= forceDirectionY * force * push;
            }
          } else {
            p.vx *= 0.99;
            p.vy *= 0.99;
          }
        }

        // Screen wrap
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      initParticles(width, height);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [initParticles, isHovering, mode]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="absolute inset-0 w-full h-full pointer-events-auto mix-blend-screen opacity-70 transition-opacity"
      style={{ zIndex: 10 }}
    />
  );
}
