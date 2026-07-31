'use client';

import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FeatureLockedProps {
  title?: string;
  message?: string;
}

export function FeatureLocked({ 
  title = "Feature Locked", 
  message = "Complete your first assessment to begin your personalized English learning journey." 
}: FeatureLockedProps) {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center min-h-[60vh]">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 shadow-inner"
      >
        <Lock className="w-10 h-10 text-muted-foreground" />
      </motion.div>
      
      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-4xl font-heading mb-4 text-brand-dark"
      >
        {title}
      </motion.h2>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-muted-foreground max-w-md mb-8 font-medium"
      >
        {message}
      </motion.p>
      
      <motion.button 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={() => router.push('/assessment')}
        className="bg-brand-dark text-white rounded-full px-8 py-4 flex items-center gap-3 hover:bg-brand-dark/90 transition-transform hover:-translate-y-1 active:scale-95 shadow-xl font-bold text-lg"
      >
        Start First Assessment
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
