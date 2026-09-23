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

  // Map progress (0-100) to Y coordinates (1000 to -100)
  const progressY = 1000 - progress * 11;

  // Liquid animation sequence: fill (0->40%), wave top (40->60%), drain (60->90%), hold empty (90->100%)
  const waveYKeyframes = [1000, -100, -100, 1000, 1000];
  const waveXKeyframes = [0, -500, -1000, -1500, -2000];
  const waveTimes = [0, 0.4, 0.6, 0.9, 1];

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
        <div className="relative w-32 h-32 sm:w-48 sm:h-48 flex items-center justify-center mb-4">
          
          <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full overflow-visible z-10 drop-shadow-xl">
            <defs>
              {/* 
                This filter extracts the AELP logo perfectly by making pure white (the JPEG background) transparent, 
                and turning everything else into a solid white silhouette for masking.
                Formula: Alpha = -3.33*(R+G+B) + 1*A + 9. 
                Pure white (1,1,1) -> Alpha 0
                Slightly dark/colored (<0.9) -> Alpha 1
              */}
              <filter id="logo-silhouette" colorInterpolationFilters="sRGB">
                <feColorMatrix type="matrix" values="
                  0 0 0 0 1
                  0 0 0 0 1
                  0 0 0 0 1
                  -3.33 -3.33 -3.33 1 9
                " />
              </filter>

              {/* The master mask that perfectly isolates the logo shape without the white box */}
              <mask id="official-logo-mask">
                <image 
                  href="/aelp-logo.jpg" 
                  width="1000" height="1000" 
                  preserveAspectRatio="xMidYMid meet" 
                  filter="url(#logo-silhouette)" 
                />
              </mask>

              {/* The wave mask that rises and falls to simulate liquid filling */}
              <mask id="wave-mask">
                <motion.g
                  initial={{ y: 1000, x: 0 }}
                  animate={isLooping
                    ? { y: waveYKeyframes, x: waveXKeyframes }
                    : { y: progressY, x: [0, -1000] }
                  }
                  transition={isLooping
                    ? { 
                        y: { duration: 6, ease: "easeInOut", repeat: Infinity, times: waveTimes },
                        x: { duration: 6, ease: "linear", repeat: Infinity, times: waveTimes }
                      }
                    : { 
                        y: { type: "tween", ease: "easeOut", duration: 0.8 },
                        x: { duration: 2, ease: "linear", repeat: Infinity }
                      }
                  }
                >
                  <path 
                    d="M -1000 0 
                       C -750 -120, -250 120, 0 0 
                       C 250 -120, 750 120, 1000 0 
                       C 1250 -120, 1750 120, 2000 0 
                       C 2250 -120, 2750 120, 3000 0 
                       L 3000 1500 L -1000 1500 Z" 
                    fill="white" 
                  />
                </motion.g>
              </mask>
            </defs>

            {/* Base Logo (Empty State) - Faint glass-like opacity, perfectly clipped to remove the white box */}
            <g mask="url(#official-logo-mask)" opacity="0.25">
              <image 
                href="/aelp-logo.jpg" 
                width="1000" height="1000" 
                preserveAspectRatio="xMidYMid meet" 
              />
            </g>

            {/* Filled Logo (Liquid State) - Full original colors, revealed organically by the flowing wave mask */}
            <g mask="url(#official-logo-mask)">
              <g mask="url(#wave-mask)">
                <image 
                  href="/aelp-logo.jpg" 
                  width="1000" height="1000" 
                  preserveAspectRatio="xMidYMid meet" 
                />
                
                {/* Subtle glassy reflection over the liquid portion to enhance the water feel */}
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
          
          {/* Synchronized subtle pulse with the liquid fill/drain cycle */}
          <motion.div 
            animate={isLooping ? { opacity: [0.6, 1, 1, 0.6, 0.6] } : { opacity: 1 }}
            transition={isLooping ? { duration: 6, ease: "easeInOut", repeat: Infinity, times: waveTimes } : {}}
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
