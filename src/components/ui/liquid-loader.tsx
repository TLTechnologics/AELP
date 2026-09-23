"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

interface LiquidLoaderProps {
  progress?: number; // 0 to 100
  onComplete?: () => void;
  isLooping?: boolean; // Set to true to loop the animation continuously without completion
}

export function LiquidLoader({ progress = 0, onComplete, isLooping = false }: LiquidLoaderProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [dots, setDots] = useState("");

  const wave1Controls = useAnimation();
  const wave2Controls = useAnimation();
  const wave3Controls = useAnimation();
  const textControls = useAnimation();

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

  // Organic, randomized continuous wave animation loop
  useEffect(() => {
    if (!isLooping) return;
    let isMounted = true;

    // A helper to run an infinite, randomized tide cycle for a wave
    const runTideCycle = async (
      controls: any,
      baseTopY: number,
      baseDuration: number,
      invertX: boolean
    ) => {
      // Start below the logo
      let currentX = -2000 + Math.random() * 500;
      await controls.set({ y: 1200, x: currentX });

      while (isMounted) {
        // Randomize the next cycle's parameters to feel organic and unpredictable
        const topY = baseTopY + (Math.random() * 80 - 40); // Slight height variation
        const upDuration = baseDuration + Math.random() * 2.0; // Randomize fill speed
        const downDuration = baseDuration + Math.random() * 2.0; // Randomize drain speed
        
        // Randomize how far the wave travels horizontally (tide moving in and out)
        const xTravel = 800 + Math.random() * 600; 
        const nextXIn = invertX ? currentX + xTravel : currentX - xTravel;
        const nextXOut = invertX ? nextXIn - xTravel * 0.8 : nextXIn + xTravel * 0.8;

        // Flow IN and UP
        await controls.start({
          y: topY,
          x: nextXIn,
          transition: { duration: upDuration, ease: "easeInOut" }
        });

        if (!isMounted) break;

        // Flow OUT and DOWN immediately (no static hold/jump)
        await controls.start({
          y: 1200,
          x: nextXOut,
          transition: { duration: downDuration, ease: "easeInOut" }
        });

        currentX = nextXOut;
      }
    };

    // Start all 3 waves with different base parameters to create parallax and depth
    runTideCycle(wave1Controls, -350, 4.0, false);  // Back wave, tallest, fastest
    runTideCycle(wave2Controls, -150, 4.5, true);   // Mid wave, medium height, opposite flow
    runTideCycle(wave3Controls, 50, 5.0, false);    // Front wave, lowest, slowest

    // Text pulsing loop
    const runTextPulse = async () => {
      while (isMounted) {
        await textControls.start({ opacity: 1, transition: { duration: 2.5, ease: "easeInOut" } });
        if (!isMounted) break;
        await textControls.start({ opacity: 0.6, transition: { duration: 2.5, ease: "easeInOut" } });
      }
    };
    runTextPulse();

    return () => {
      isMounted = false;
      wave1Controls.stop();
      wave2Controls.stop();
      wave3Controls.stop();
      textControls.stop();
    };
  }, [isLooping, wave1Controls, wave2Controls, wave3Controls, textControls]);

  // Non-looping progress tracking
  const progressY = 1200 - progress * 15;

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
          
          <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full overflow-visible z-10">
            <defs>
              <filter id="logo-silhouette" colorInterpolationFilters="sRGB">
                <feColorMatrix type="matrix" values="
                  0 0 0 0 1
                  0 0 0 0 1
                  0 0 0 0 1
                  -10 -10 -10 1 28
                " />
              </filter>

              <mask id="official-logo-mask">
                <image 
                  href="/aelp-logo.jpg" 
                  width="1000" height="1000" 
                  preserveAspectRatio="xMidYMid meet" 
                  filter="url(#logo-silhouette)" 
                />
              </mask>

              <mask id="wave-1-mask">
                <motion.path 
                  d="M -4000 0 C -3750 250, -3250 -250, -3000 0 C -2750 250, -2250 -250, -2000 0 C -1750 250, -1250 -250, -1000 0 C -750 250, -250 -250, 0 0 C 250 250, 750 -250, 1000 0 C 1250 250, 1750 -250, 2000 0 C 2250 250, 2750 -250, 3000 0 C 3250 250, 3750 -250, 4000 0 C 4250 250, 4750 -250, 5000 0 C 5250 250, 5750 -250, 6000 0 V 2000 H -4000 Z" 
                  fill="white"
                  animate={isLooping ? wave1Controls : { y: progressY - 300, x: [0, -1000] }}
                  transition={isLooping ? {} : { y: { type: "tween", ease: "easeOut", duration: 0.8 }, x: { duration: 3, ease: "linear", repeat: Infinity } }}
                />
              </mask>

              <mask id="wave-2-mask">
                <motion.path 
                  d="M -4000 0 C -3750 -350, -3250 350, -3000 0 C -2750 -350, -2250 350, -2000 0 C -1750 -350, -1250 350, -1000 0 C -750 -350, -250 350, 0 0 C 250 -350, 750 350, 1000 0 C 1250 -350, 1750 350, 2000 0 C 2250 -350, 2750 350, 3000 0 C 3250 -350, 3750 350, 4000 0 C 4250 -350, 4750 350, 5000 0 C 5250 -350, 5750 350, 6000 0 V 2000 H -4000 Z" 
                  fill="white"
                  animate={isLooping ? wave2Controls : { y: progressY - 150, x: [0, -1000] }}
                  transition={isLooping ? {} : { y: { type: "tween", ease: "easeOut", duration: 0.8 }, x: { duration: 4, ease: "linear", repeat: Infinity } }}
                />
              </mask>

              <mask id="wave-3-mask">
                <motion.path 
                  d="M -6000 0 C -5500 500, -4500 -500, -4000 0 C -3500 500, -2500 -500, -2000 0 C -1500 500, -500 -500, 0 0 C 500 500, 1500 -500, 2000 0 C 2500 500, 3500 -500, 4000 0 C 4500 500, 5500 -500, 6000 0 C 6500 500, 7500 -500, 8000 0 V 2000 H -6000 Z" 
                  fill="white"
                  animate={isLooping ? wave3Controls : { y: progressY, x: [0, -2000] }}
                  transition={isLooping ? {} : { y: { type: "tween", ease: "easeOut", duration: 0.8 }, x: { duration: 5, ease: "linear", repeat: Infinity } }}
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
            animate={textControls}
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
