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
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isLooping && progress >= 100 && !isCompleted) {
      setIsCompleted(true);
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [progress, isCompleted, onComplete, isLooping]);

  // Loading dots animation
  useEffect(() => {
    if (!isLooping && isCompleted) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 600);
    return () => clearInterval(interval);
  }, [isLooping, isCompleted]);

  // Map progress (0-100) to Y coordinates for non-looping mode
  const progressY = 1200 - progress * 15;

  // Seamless 10-second animation loop sequence
  // 0-40%: Liquid flows in and fills
  // 40-60%: Liquid waves gently at the top
  // 60-90%: Liquid rolls back out
  // 90-100%: Empty hold
  const waveTimes = [0, 0.4, 0.6, 0.9, 1];
  const duration = 10;

  return (
    <AnimatePresence>
      <motion.div
        key="loader-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/5 backdrop-blur-[8px] overflow-hidden pointer-events-auto"
        role="status"
        aria-label="Loading AELP..."
      >
        <div className="relative w-40 h-40 sm:w-56 sm:h-56 flex items-center justify-center mb-6">
          
          <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full overflow-visible z-10 drop-shadow-2xl">
            <defs>
              {/* Extracts the AELP logo into a perfect silhouette by removing the white background */}
              <filter id="logo-silhouette" colorInterpolationFilters="sRGB">
                <feColorMatrix type="matrix" values="
                  0 0 0 0 1
                  0 0 0 0 1
                  0 0 0 0 1
                  -3.33 -3.33 -3.33 1 9
                " />
              </filter>

              {/* Master mask that isolates the logo shape */}
              <mask id="official-logo-mask">
                <image 
                  href="/aelp-logo.jpg" 
                  width="1000" height="1000" 
                  preserveAspectRatio="xMidYMid meet" 
                  filter="url(#logo-silhouette)" 
                />
              </mask>

              {/* Wave 1: Back layer, tallest, fastest, tinted yellow */}
              <mask id="wave-1-mask">
                <motion.path 
                  d="M -2000 0 C -1750 200, -1250 -200, -1000 0 C -750 200, -250 -200, 0 0 C 250 200, 750 -200, 1000 0 C 1250 200, 1750 -200, 2000 0 C 2250 200, 2750 -200, 3000 0 C 3250 200, 3750 -200, 4000 0 V 2000 H -2000 Z" 
                  fill="white"
                  initial={{ y: 1200, x: -1000 }}
                  animate={isLooping ? { y: [1200, -300, -300, 1200, 1200], x: [-1000, -500, 0, -500, -1000] } : { y: progressY - 300, x: [0, -1000] }}
                  transition={isLooping
                    ? { y: { duration, ease: "easeInOut", repeat: Infinity, times: waveTimes }, x: { duration, ease: "easeInOut", repeat: Infinity, times: waveTimes } }
                    : { y: { type: "tween", ease: "easeOut", duration: 0.8 }, x: { duration: 3, ease: "linear", repeat: Infinity } }
                  }
                />
              </mask>

              {/* Wave 2: Middle layer, medium height, inverted phase, tinted dark gray */}
              <mask id="wave-2-mask">
                <motion.path 
                  d="M -2000 0 C -1750 -300, -1250 300, -1000 0 C -750 -300, -250 300, 0 0 C 250 -300, 750 300, 1000 0 C 1250 -300, 1750 300, 2000 0 C 2250 -300, 2750 300, 3000 0 C 3250 -300, 3750 300, 4000 0 V 2000 H -2000 Z" 
                  fill="white"
                  initial={{ y: 1200, x: 0 }}
                  animate={isLooping ? { y: [1200, -150, -150, 1200, 1200], x: [0, -500, -1000, -500, 0] } : { y: progressY - 150, x: [0, -1000] }}
                  transition={isLooping
                    ? { y: { duration, ease: "easeInOut", repeat: Infinity, times: waveTimes }, x: { duration, ease: "easeInOut", repeat: Infinity, times: waveTimes } }
                    : { y: { type: "tween", ease: "easeOut", duration: 0.8 }, x: { duration: 4, ease: "linear", repeat: Infinity } }
                  }
                />
              </mask>

              {/* Wave 3: Front layer, lowest, widest organic wave, full color */}
              <mask id="wave-3-mask">
                <motion.path 
                  d="M -4000 0 C -3500 400, -2500 -400, -2000 0 C -1500 400, -500 -400, 0 0 C 500 400, 1500 -400, 2000 0 C 2500 400, 3500 -400, 4000 0 C 4500 400, 5500 -400, 6000 0 V 2000 H -4000 Z" 
                  fill="white"
                  initial={{ y: 1200, x: -2000 }}
                  animate={isLooping ? { y: [1200, 50, 50, 1200, 1200], x: [-2000, -1000, 0, -1000, -2000] } : { y: progressY, x: [0, -2000] }}
                  transition={isLooping
                    ? { y: { duration, ease: "easeInOut", repeat: Infinity, times: waveTimes }, x: { duration, ease: "easeInOut", repeat: Infinity, times: waveTimes } }
                    : { y: { type: "tween", ease: "easeOut", duration: 0.8 }, x: { duration: 5, ease: "linear", repeat: Infinity } }
                  }
                />
              </mask>
            </defs>

            {/* Base Logo (Empty State) - Faint glass-like opacity */}
            <g mask="url(#official-logo-mask)" opacity="0.15">
              <image href="/aelp-logo.jpg" width="1000" height="1000" preserveAspectRatio="xMidYMid meet" filter="grayscale(100%)" />
            </g>

            {/* Layer 1: Back Wave - Yellow Tint */}
            <g mask="url(#official-logo-mask)">
              <g mask="url(#wave-1-mask)">
                <image href="/aelp-logo.jpg" width="1000" height="1000" preserveAspectRatio="xMidYMid meet" opacity="0.4" />
                <rect width="1000" height="1000" fill="#f59e0b" style={{ mixBlendMode: 'screen' }} opacity="0.7" />
              </g>
            </g>

            {/* Layer 2: Mid Wave - Dark/Gray Tint */}
            <g mask="url(#official-logo-mask)">
              <g mask="url(#wave-2-mask)">
                <image href="/aelp-logo.jpg" width="1000" height="1000" preserveAspectRatio="xMidYMid meet" opacity="0.6" />
                <rect width="1000" height="1000" fill="#111" style={{ mixBlendMode: 'multiply' }} opacity="0.5" />
              </g>
            </g>

            {/* Layer 3: Front Wave - Full Color Logo */}
            <g mask="url(#official-logo-mask)">
              <g mask="url(#wave-3-mask)">
                <image href="/aelp-logo.jpg" width="1000" height="1000" preserveAspectRatio="xMidYMid meet" />
                {/* Subtle glassy reflection over the liquid portion */}
                <rect width="1000" height="1000" fill="rgba(255,255,255,0.15)" style={{ mixBlendMode: 'overlay' }} />
              </g>
            </g>
          </svg>
        </div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-heading text-white text-4xl sm:text-5xl tracking-widest uppercase flex items-baseline drop-shadow-md">
            AELP<span className="text-brand-yellow text-5xl sm:text-6xl leading-none">.</span>
          </span>
          
          <motion.div 
            animate={isLooping ? { opacity: [0.6, 1, 1, 0.6, 0.6] } : { opacity: 1 }}
            transition={isLooping ? { duration, ease: "easeInOut", repeat: Infinity, times: waveTimes } : {}}
            className="flex items-center"
          >
            <span className="text-white/80 text-sm sm:text-base font-bold uppercase tracking-[0.3em] drop-shadow-sm ml-2">
              {isLooping ? (
                <div className="w-[120px] text-left">
                  LOADING{dots}
                </div>
              ) : (
                `${Math.round(progress)}%`
              )}
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
