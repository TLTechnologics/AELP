'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to login after animation
    const timer = setTimeout(() => {
      router.push('/auth/login');
    }, 3500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Gradients */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute w-[800px] h-[800px] bg-brand-yellow rounded-full blur-[100px] pointer-events-none"
      />

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
        className="z-10 flex flex-col items-center"
      >
        <motion.div 
          animate={{ 
            rotateY: [0, 180, 360],
          }}
          transition={{ 
            duration: 2, 
            ease: "easeInOut",
            times: [0, 0.5, 1],
            delay: 0.5
          }}
          className="w-24 h-24 bg-brand-yellow rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-yellow/30 mb-8"
        >
          <span className="font-heading text-5xl text-brand-dark">A</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-white font-heading text-6xl tracking-wider mb-4"
        >
          AELP
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="text-brand-sage text-xl font-medium tracking-wide"
        >
          Adaptive English Learning
        </motion.p>
      </motion.div>
    </div>
  );
}
