'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { Check, Lock, Play, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

const pathNodes = [
  { id: 1, title: 'Basics 1', type: 'lesson', status: 'completed', stars: 3 },
  { id: 2, title: 'Greetings', type: 'lesson', status: 'completed', stars: 2 },
  { id: 3, title: 'Practice Test', type: 'practice', status: 'current', stars: 0 },
  { id: 4, title: 'Travel', type: 'lesson', status: 'locked', stars: 0 },
  { id: 5, title: 'Checkpoint 1', type: 'checkpoint', status: 'locked', stars: 0 },
  { id: 6, title: 'Restaurant', type: 'lesson', status: 'locked', stars: 0 },
];

export default function LearningPathPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-8">
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl mb-3">Unit 1: Foundations</h1>
          <p className="text-muted-foreground font-medium text-lg">Build your core vocabulary and grammar.</p>
        </div>

        <div className="relative flex flex-col items-center">
          {/* Connecting Line */}
          <div className="absolute top-10 bottom-10 w-4 bg-muted rounded-full z-0" />
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: '40%' }} // Represents progress
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-10 w-4 bg-brand-yellow rounded-full z-0 shadow-[0_0_15px_rgba(255,225,124,0.5)]" 
          />

          {/* Nodes */}
          {pathNodes.map((node, i) => {
            // Determine horizontal offset for zig-zag effect
            const isLeft = i % 2 !== 0;
            const offsetClass = isLeft ? '-translate-x-16' : 'translate-x-16';

            return (
              <motion.div 
                key={node.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative z-10 w-full flex flex-col items-center mb-12 ${offsetClass}`}
              >
                {/* Tooltip Label */}
                <div className={`mb-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-border/50 text-sm font-bold flex flex-col items-center transition-transform hover:scale-110 cursor-pointer ${node.status === 'locked' ? 'opacity-50' : ''}`}>
                  <span>{node.title}</span>
                  {node.status === 'completed' && (
                    <div className="flex gap-1 mt-1 text-brand-yellow">
                      {[...Array(3)].map((_, idx) => (
                        <Star key={idx} className={`w-3 h-3 ${idx < node.stars ? 'fill-current' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Node Circle */}
                <button 
                  onClick={() => node.status !== 'locked' && router.push('/lesson')}
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 relative group 
                    ${node.status === 'completed' ? 'bg-brand-yellow border-b-8 border-yellow-500 hover:border-b-4 hover:translate-y-1' : ''}
                    ${node.status === 'current' ? 'bg-white border-4 border-brand-yellow border-b-8 hover:border-b-4 hover:translate-y-1 ring-4 ring-brand-yellow/30' : ''}
                    ${node.status === 'locked' ? 'bg-muted border-4 border-border/50 text-muted-foreground cursor-not-allowed' : ''}
                  `}
                >
                  {node.status === 'completed' && <Check className="w-8 h-8 text-brand-dark" strokeWidth={3} />}
                  {node.status === 'current' && <Play className="w-8 h-8 text-brand-yellow fill-brand-yellow ml-1" strokeWidth={3} />}
                  {node.status === 'locked' && <Lock className="w-8 h-8" strokeWidth={3} />}
                  
                  {/* Pulse effect for current node */}
                  {node.status === 'current' && (
                    <div className="absolute inset-0 rounded-full border-4 border-brand-yellow animate-ping opacity-20" />
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
