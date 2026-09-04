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

  const waveY = 1000 - (progress * 10); // 0 to 100 maps to 1000 to 0

  return (
    <AnimatePresence>
      <motion.div
        key="loader-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/20 backdrop-blur-[12px] overflow-hidden pointer-events-auto"
        role="status"
        aria-label="Loading AELP..."
      >
        <div className="relative w-32 h-32 sm:w-48 sm:h-48 flex items-center justify-center mb-1">
          <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full overflow-visible drop-shadow-2xl">
            <defs>
              {/* Inverts the JPG so the White background becomes Black (transparent in mask) 
                  and the Black 'A' becomes White (opaque in mask). */}
              <filter id="invert-luminance" colorInterpolationFilters="sRGB">
                <feColorMatrix type="matrix" values="
                  -1  0  0  0  1
                   0 -1  0  0  1
                   0  0 -1  0  1
                   0  0  0  1  0
                " />
              </filter>

              {/* The mask derived strictly from the official JPG geometry */}
              <mask id="official-logo-mask">
                <image 
                  href="/aelp-logo.jpg" 
                  width="1000" height="1000" 
                  preserveAspectRatio="xMidYMid meet" 
                  filter="url(#invert-luminance)" 
                />
              </mask>

              <linearGradient id="liquid-gradient" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#fcd34d" />
                 <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* Base Logo (Dark structure) - Completely transparent background, matches official shape exactly */}
            <rect width="1000" height="1000" fill="#111" mask="url(#official-logo-mask)" />

            {/* Liquid Fill Overlay - Strictly masked to the EXACT official A geometry */}
            <g mask="url(#official-logo-mask)">
              <motion.g
                initial={{ y: 1000, x: 0 }}
                animate={isLooping
                  ? { y: [1000, 100, 1000], x: [0, -1000, 0] }
                  : { y: waveY, x: 0 }
                }
                transition={isLooping
                  ? { 
                      y: { duration: 3.5, ease: "easeInOut", repeat: Infinity },
                      x: { duration: 3.5, ease: "linear", repeat: Infinity }
                    }
                  : { y: { type: "tween", ease: "easeOut", duration: 0.8 } }
                }
              >
                {/* SVG wave path that creates a real liquid surface extending past boundaries */}
                <path 
                  d="M -500 0 C -250 -150, 250 150, 500 0 C 750 -150, 1250 150, 1500 0 L 1500 1500 L -500 1500 Z" 
                  fill="url(#liquid-gradient)" 
                />
              </motion.g>
            </g>
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-heading text-white text-4xl sm:text-5xl tracking-widest uppercase flex items-baseline drop-shadow-md">
            AELP<span className="text-brand-yellow text-5xl sm:text-6xl leading-none">.</span>
          </span>
          <span className="text-white/70 text-xs sm:text-sm font-bold uppercase tracking-[0.4em] drop-shadow-sm mt-1">
            {isLooping ? 'Loading...' : `${Math.round(progress)}%`}
          </span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
