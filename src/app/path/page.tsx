'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { Check, Lock, Play, Star, AlertCircle, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { learningPathService } from '@/services/api';
import { useDashboard } from '@/hooks/use-dashboard';
import { FeatureLocked } from '@/components/feature-locked';
import { LiquidLoader } from '@/components/ui/liquid-loader';
import React from 'react';

export default function LearningPathPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['roadmap'],
    queryFn: async () => {
      const res = await learningPathService.getRoadmap();
      return res.data;
    }
  });

  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();

  if (isLoading || dashboardLoading) {
    return <LiquidLoader isLooping={true} />;
  }

  const isLocked = dashboardData?.profile_stage === 1;

  if (isLocked) {
    return (
      <MainLayout>
        <FeatureLocked 
          title="Learning Path Locked" 
          message="Complete your first assessment to unlock your personalized learning roadmap." 
        />
      </MainLayout>
    );
  }

  const activePaths = data?.active_paths || [];
  const recommendations = data?.recommendations || [];

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl mb-3">Your Personalized Roadmap</h1>
          <p className="text-muted-foreground font-medium text-lg mb-6">
            Automatically generated based on your latest assessment results.
          </p>
          
          {activePaths.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {activePaths.map((path: any) => (
                <span key={path.id} className="px-4 py-2 bg-brand-yellow/20 text-brand-dark rounded-full text-sm font-bold border border-brand-yellow/50">
                  {path.path_name}
                </span>
              ))}
            </div>
          ) : (
            <div className="mb-8 px-4 py-2 bg-muted rounded-full inline-block text-sm">
              Take an assessment to generate your path!
            </div>
          )}
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-[32px] border border-border/40">
            <h3 className="text-xl font-heading mb-2">You're all caught up!</h3>
            <p className="text-muted-foreground">Complete another assessment to get new recommendations.</p>
            <button onClick={() => router.push('/assessment')} className="mt-6 px-6 py-3 bg-brand-yellow text-brand-dark font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              Take Assessment
            </button>
          </div>
        ) : (
          <div className="relative flex flex-col items-center">
            {/* Connecting Line */}
            <div className="absolute top-10 bottom-10 w-4 bg-muted rounded-full z-0" />
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: '20%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-10 w-4 bg-brand-yellow rounded-full z-0 shadow-[0_0_15px_rgba(255,225,124,0.5)]" 
            />

            {/* Nodes */}
            {recommendations.map((node: any, i: number) => {
              const isLeft = i % 2 !== 0;
              const offsetClass = isLeft ? '-translate-x-16' : 'translate-x-16';
              const isCurrent = i === 0; // First uncompleted recommendation is current
              const isLocked = !isCurrent;
              const isHighPriority = node.priority === "HIGH";

              return (
                <motion.div 
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative z-10 w-full flex flex-col items-center mb-16 ${offsetClass}`}
                >
                  {/* Tooltip Label */}
                  <div className={`mb-4 w-64 bg-white p-4 rounded-2xl shadow-lg border-2 ${isHighPriority ? 'border-red-400' : 'border-border/50'} text-sm flex flex-col items-center transition-transform hover:scale-105 cursor-pointer ${isLocked ? 'opacity-70' : ''}`}>
                    <span className="font-bold text-center text-base mb-1">{node.title}</span>
                    {isHighPriority && (
                      <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-md mb-2">High Priority</span>
                    )}
                    <span className="text-xs text-muted-foreground text-center mb-2 line-clamp-2">{node.description}</span>
                    
                    {/* The AI Reason */}
                    <div className="mt-2 text-xs bg-blue-50 text-blue-800 p-2 rounded-lg border border-blue-100 flex gap-2 items-start text-left w-full">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{node.reason}</span>
                    </div>
                  </div>

                  {/* Node Circle */}
                  <button 
                    onClick={() => !isLocked && router.push('/lesson')}
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 relative group 
                      ${isCurrent ? 'bg-white border-4 border-brand-yellow border-b-8 hover:border-b-4 hover:translate-y-1 ring-4 ring-brand-yellow/30' : ''}
                      ${isLocked ? 'bg-muted border-4 border-border/50 text-muted-foreground cursor-not-allowed' : ''}
                    `}
                  >
                    {isCurrent && <Play className="w-8 h-8 text-brand-yellow fill-brand-yellow ml-1" strokeWidth={3} />}
                    {isLocked && <Lock className="w-8 h-8" strokeWidth={3} />}
                    
                    {/* Pulse effect for current node */}
                    {isCurrent && (
                      <div className="absolute inset-0 rounded-full border-4 border-brand-yellow animate-ping opacity-20" />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
