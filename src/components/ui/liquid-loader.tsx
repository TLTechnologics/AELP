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
      // Wait for completion animation before calling onComplete
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500); // Wait for the glow + fade out
      return () => clearTimeout(timer);
    }
  }, [progress, isCompleted, onComplete, isLooping]);

  // Map progress (0-100) to Y translation for the wave.
  // 0% -> y: 100 (wave crest is below the A)
  // 100% -> y: -10 (wave trough is above the A)
  // Our clip-path uses 0-100 bounding box (thanks to scale(0.01))
  // The svg width is 100, height is 100.
  // The wave path: M 0 50 Q 25 25, 50 50 ... so crest is at y=25, trough is at y=75.
  // To place crest just below y=100 (bottom of A), we need y=75.
  // To place trough just above y=0 (top of A), we need y=-75.
  const waveY = 75 - (progress / 100) * 150;

  // The path for the letter A (with inner cutout)
  const pathA = "M 50 10 L 90 90 L 70 90 L 60 70 L 40 70 L 30 90 L 10 90 Z M 50 30 L 45 60 L 55 60 Z";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A] overflow-hidden">
      <AnimatePresence>
        <motion.div
          key="loader-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center"
        >
          {/* SVG Definition & Clip Path */}
          <svg width="0" height="0" className="absolute">
            <defs>
              <clipPath id="a-clip-path" clipPathUnits="objectBoundingBox">
                {/* Transform by 0.01 to use 0-100 path on object bounding box */}
                <path d={pathA} transform="scale(0.01, 0.01)" fillRule="evenodd" />
              </clipPath>
              
              <linearGradient id="wave-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.45)" />
              </linearGradient>

              {/* Shimmer gradient for optional enhancement */}
              <linearGradient id="shimmer" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.6)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Main SVG Container */}
          <motion.div
            className="relative w-full h-full"
            animate={
              isCompleted
                ? {
                    scale: [1, 1.04, 1],
                    filter: ["drop-shadow(0px 0px 0px rgba(255,255,255,0))", "drop-shadow(0px 0px 25px rgba(255,255,255,0.4))", "drop-shadow(0px 0px 10px rgba(255,255,255,0.1))"],
                  }
                : { scale: 1, filter: "drop-shadow(0px 0px 0px rgba(255,255,255,0))" }
            }
            transition={{
              duration: 1.2,
              ease: "easeInOut",
              times: [0, 0.5, 1],
            }}
          >
            {/* Outline of the A (Always visible) */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible z-10 pointer-events-none">
              <path
                d={pathA}
                fill="none"
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth="1.5"
                fillRule="evenodd"
                strokeLinejoin="round"
              />
            </svg>

            {/* Liquid Fill Area (Masked by A) */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                clipPath: "url(#a-clip-path)",
                WebkitClipPath: "url(#a-clip-path)",
              }}
            >
              {/* Solid White Background on Completion */}
              <motion.div
                className="absolute inset-0 w-full h-full bg-white z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: isCompleted ? 1 : 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              />

              {/* The Animated Wave */}
              <motion.div
                className="absolute inset-0 w-full h-full z-10 overflow-hidden pointer-events-none"
                initial={{ opacity: 1 }}
                animate={{ opacity: (isCompleted && !isLooping) ? 0 : 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <motion.svg
                  viewBox="0 0 200 150"
                  preserveAspectRatio="none"
                  className="absolute w-[200%] h-full"
                  initial={{ y: "75%" }}
                  animate={isLooping ? { y: ["15%", "45%", "15%"] } : { y: `${waveY}%` }}
                  transition={isLooping ? {
                    y: { duration: 4, ease: "easeInOut", repeat: Infinity }
                  } : {
                    y: { type: "tween", ease: "easeOut", duration: 0.8 },
                  }}
                >
                  <g className="wave-animation">
                    <path
                      d="M 0 50 Q 25 25, 50 50 T 100 50 T 150 50 T 200 50 L 200 150 L 0 150 Z"
                      fill="url(#wave-gradient)"
                    />
                    <path
                      d="M 0 50 Q 25 25, 50 50 T 100 50 T 150 50 T 200 50"
                      fill="none"
                      stroke="url(#shimmer)"
                      strokeWidth="2"
                      className="shimmer-animation"
                    />
                  </g>
                </motion.svg>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wave-move {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .wave-animation {
          animation: wave-move 4s linear infinite;
        }
        
        @keyframes shimmer-move {
          0% { transform: translateX(0); }
          100% { transform: translateX(-20px); }
        }
        .shimmer-animation {
          animation: shimmer-move 3s ease-in-out infinite alternate;
        }
      `}} />
    </div>
  );
}
