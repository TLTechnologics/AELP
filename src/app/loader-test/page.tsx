"use client";

import React, { useState, useEffect } from "react";
import { LiquidLoader } from "@/components/ui/liquid-loader";

export default function LoaderTestPage() {
  const [progress, setProgress] = useState(0);
  const [showMainContent, setShowMainContent] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Random increment to simulate real loading behavior
        const increment = Math.random() * 15 + 5;
        return Math.min(100, prev + increment);
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  if (showMainContent) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-4">
          AELP AI Platform
        </h1>
        <p className="text-gray-400 max-w-md text-center text-lg">
          The loader has completed and you are now viewing the main application content. 
        </p>
        <button
          onClick={() => {
            setShowMainContent(false);
            setProgress(0);
            
            // Restart progress
            const interval = setInterval(() => {
              setProgress((prev) => {
                if (prev >= 100) {
                  clearInterval(interval);
                  return 100;
                }
                const increment = Math.random() * 15 + 5;
                return Math.min(100, prev + increment);
              });
            }, 400);
          }}
          className="mt-8 px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
        >
          Replay Animation
        </button>
      </div>
    );
  }

  return (
    <>
      <LiquidLoader 
        progress={progress} 
        onComplete={() => setShowMainContent(true)} 
      />
      {/* 
        This is behind the loader to prove it covers the screen.
        The LiquidLoader uses fixed inset-0 z-50.
      */}
      <div className="min-h-screen bg-black"></div>
    </>
  );
}
