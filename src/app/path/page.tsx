'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { Check, Lock, Play, Info, TrendingUp, Map } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { learningPathService } from '@/services/api';
import { useDashboard } from '@/hooks/use-dashboard';
import { FeatureLocked } from '@/components/feature-locked';
import { LiquidLoader } from '@/components/ui/liquid-loader';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import React from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

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

  // BUG-031: Compute progress line from real data
  const completedCount = recommendations.filter((n: any) => n.is_completed).length;
  const totalCount = recommendations.length || 1;
  const progressPct = Math.max((completedCount / totalCount) * 100, 4);

  // IMPROVE-020: "X of Y" summary
  const progressSummary = `${completedCount} of ${totalCount} steps completed`;

  return (
    <MainLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto space-y-12 pb-24 px-4"
      >
        <motion.div variants={itemVariants} className="text-center">
          <SectionHeader 
            title={<>Personalized <span className="highlight-yellow inline-block px-2">Roadmap</span></>}
            description="Automatically generated based on your latest assessment results."
          />
          
          {/* IMPROVE-020: Progress summary banner */}
          {recommendations.length > 0 && (
            <div className="mt-6 inline-flex items-center gap-3 bg-brand-yellow/15 text-brand-dark border border-brand-yellow/40 rounded-full px-6 py-2.5">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-bold tracking-wider uppercase">{progressSummary}</span>
            </div>
          )}
          
          {activePaths.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {activePaths.map((path: any) => (
                <span key={path.id} className="px-5 py-2 bg-brand-yellow/20 text-brand-dark rounded-xl text-sm font-bold border border-brand-yellow/50 uppercase tracking-wider">
                  {path.path_name}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-6 px-5 py-2 bg-muted/40 border border-border/50 text-muted-foreground rounded-xl inline-block text-sm font-bold uppercase tracking-wider">
              Take an assessment to generate your path!
            </div>
          )}
        </motion.div>

        {recommendations.length === 0 ? (
          <motion.div variants={itemVariants}>
            <EmptyState 
              icon={Check}
              iconColor="green"
              title="You're all caught up!"
              description="Complete another assessment to get new recommendations."
              actionLabel="Take Assessment"
              onAction={() => router.push('/assessment')}
            />
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="relative flex flex-col items-center mt-16">
            {/* BUG-034: Connecting line — percent-based, scales with content */}
            <div className="absolute top-10 w-4 bg-muted/40 rounded-full z-0 border-x border-border/50" style={{ bottom: 40 }} />
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: `${progressPct}%` }}  // BUG-031: real progress
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-10 w-4 bg-brand-yellow rounded-full z-0 shadow-[0_0_20px_rgba(255,225,124,0.6)]" 
            />

            {/* Nodes */}
            {recommendations.map((node: any, i: number) => {
              // BUG-032: distinguish completed, current, and locked states
              const isCompleted = node.is_completed === true;
              const isCurrent = !isCompleted && i === recommendations.findIndex((n: any) => !n.is_completed);
              const isNodeLocked = !isCompleted && !isCurrent;
              const isHighPriority = node.priority === "HIGH";

              // BUG-033: only apply offset on lg+ screens
              const lgOffsetClass = i % 2 !== 0 ? 'lg:-translate-x-24' : 'lg:translate-x-24';

              return (
                <motion.div 
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative z-10 w-full flex flex-col items-center mb-20 ${lgOffsetClass}`}
                >
                  {/* Node card */}
                  <div className={`mb-6 w-[280px] sm:w-[320px] bg-white p-6 rounded-[24px] shadow-sm border text-sm flex flex-col items-center transition-all hover:-translate-y-2 hover:shadow-lg cursor-pointer ${
                    isCompleted ? 'border-green-200 bg-green-50/50' :
                    isCurrent ? 'border-brand-yellow' : 
                    'border-border/80 opacity-80 hover:opacity-100'
                  }`}>
                    <span className="font-heading text-xl text-center text-brand-dark mb-2">{node.title}</span>
                    {isHighPriority && !isCompleted && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-3 py-1 rounded-md mb-3">High Priority</span>
                    )}
                    {isCompleted && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-3 py-1 rounded-md mb-3 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Completed
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground text-center mb-4 line-clamp-2">{node.description}</span>
                    
                    {/* BUG-021 style: Info icon for AI reason, not AlertCircle */}
                    <div className="mt-auto text-xs bg-blue-50/50 text-blue-800 p-3 rounded-xl border border-blue-100/50 flex gap-3 items-start text-left w-full font-medium">
                      <Info className="w-5 h-5 shrink-0 text-blue-500" />
                      <span>{node.reason}</span>
                    </div>
                  </div>

                  {/* Node Circle */}
                  <button 
                    onClick={() => (isCurrent || isCompleted) && router.push('/lesson')}
                    aria-label={isNodeLocked ? `${node.title} — locked` : `Start ${node.title}`}
                    className={`w-24 h-24 rounded-[32px] flex items-center justify-center shadow-sm transition-all duration-300 relative group 
                      ${isCurrent ? 'bg-white border-4 border-brand-yellow border-b-[8px] hover:border-b-4 hover:translate-y-1' : ''}
                      ${isCompleted ? 'bg-green-500 border-4 border-green-400' : ''}
                      ${isNodeLocked ? 'bg-muted/40 border-4 border-border/50 text-muted-foreground cursor-not-allowed' : ''}
                    `}
                  >
                    {/* BUG-032: correct icons per state */}
                    {isCompleted && <Check className="w-10 h-10 text-white" strokeWidth={3} />}
                    {isCurrent && <Play className="w-10 h-10 text-brand-yellow fill-brand-yellow ml-1 group-hover:scale-110 transition-transform" strokeWidth={3} />}
                    {isNodeLocked && <Lock className="w-8 h-8 opacity-50" strokeWidth={3} />}
                    
                    {/* Pulse effect for current node */}
                    {isCurrent && (
                      <div className="absolute inset-0 rounded-[32px] border-4 border-brand-yellow animate-ping opacity-20" />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </MainLayout>
  );
}
