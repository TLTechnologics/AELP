"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LiquidLoaderProps {
  progress?: number; // 0 to 100
  onComplete?: () => void;
  isLooping?: boolean; // Set to true to loop the animation continuously without completion
}

export function LiquidLoader({ progress = 0, onComplete, isLooping = false }: LiquidLoaderProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isLooping && progress >= 100 && !isCompleted) {
      setIsCompleted(true);
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [progress, isCompleted, onComplete, isLooping]);

  const waveY = 75 - (progress / 100) * 150;

  // BUG-049: Inline clip-path (no external SVG url()) to fix Firefox rendering
  const pathA = "M 50 10 L 90 90 L 70 90 L 60 70 L 40 70 L 30 90 L 10 90 Z M 50 30 L 45 60 L 55 60 Z";

  return (
    // POLISH-006: branded loading screen
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0A0A] overflow-hidden gap-8"
      role="status"
      aria-label="Loading AELP..."
    >
      <AnimatePresence>
        <motion.div
          key="loader-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center"
        >
          {/* BUG-049: Inline SVG defs + clip path — resolves Firefox url() issue */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full"
            style={{ overflow: 'visible' }}
            aria-hidden="true"
          >
            <defs>
              {/* Inline clipPath — works in all browsers */}
              <clipPath id="a-clip-inline">
                <path d={pathA} fillRule="evenodd" />
              </clipPath>
              <linearGradient id="wave-gradient-2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,225,124,0.7)" />
                <stop offset="100%" stopColor="rgba(255,225,124,0.3)" />
              </linearGradient>
            </defs>

            {/* A outline */}
            <path
              d={pathA}
              fill="none"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth="1.5"
              fillRule="evenodd"
              strokeLinejoin="round"
            />

            {/* Clipped fill group */}
            <g clipPath="url(#a-clip-inline)">
              {/* Liquid wave area */}
              <motion.rect
                x="0"
                y="0"
                width="100"
                height="100"
                fill="url(#wave-gradient-2)"
                initial={{ y: 100 }}
                animate={isLooping
                  ? { y: [60, 30, 60] }
                  : { y: waveY }
                }
                transition={isLooping
                  ? { y: { duration: 4, ease: "easeInOut", repeat: Infinity } }
                  : { y: { type: "tween", ease: "easeOut", duration: 0.8 } }
                }
              />
            </g>
          </svg>
        </motion.div>
      </AnimatePresence>

      {/* POLISH-006: branded text below the A */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="flex flex-col items-center gap-1"
      >
        <span className="font-heading text-white text-3xl tracking-widest uppercase">
          ELP<span className="text-brand-yellow">.</span>
        </span>
        <span className="text-white/40 text-xs font-bold uppercase tracking-[0.3em]">
          {isLooping ? 'Loading...' : `${Math.round(progress)}%`}
        </span>
      </motion.div>
    </div>
  );
}
