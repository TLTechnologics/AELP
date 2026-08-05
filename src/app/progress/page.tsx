'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { Flame, Target, Zap, Clock, TrendingUp } from 'lucide-react';
import { useDashboard } from '@/hooks/use-dashboard';
import { FeatureLocked } from '@/components/feature-locked';
import { LiquidLoader } from '@/components/ui/liquid-loader';

export default function ProgressPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return <LiquidLoader isLooping={true} />;
  }

  const isLocked = data?.profile_stage === 1;

  if (isLocked) {
    return (
      <MainLayout>
        <FeatureLocked 
          title="Progress Tracking Locked" 
          message="Complete your first assessment to unlock detailed progress analytics." 
        />
      </MainLayout>
    );
  }

  // Map API weekly_progress to UI format
  const weeklyData = data?.weekly_progress?.length > 0 
    ? data.weekly_progress.map((d: any) => {
        const total = (d.reading || 0) + (d.writing || 0) + (d.speaking || 0);
        const xp = Math.round(total);
        // Map height roughly. max expected is ~300.
        let heightClass = 'h-2';
        if (xp > 200) heightClass = 'h-48';
        else if (xp > 150) heightClass = 'h-32';
        else if (xp > 100) heightClass = 'h-24';
        else if (xp > 50) heightClass = 'h-16';
        else if (xp > 0) heightClass = 'h-8';
        return { day: d.date, xp: xp, height: heightClass };
      })
    : [
        { day: 'Mon', xp: 0, height: 'h-2' },
        { day: 'Tue', xp: 0, height: 'h-2' },
        { day: 'Wed', xp: 0, height: 'h-2' },
        { day: 'Thu', xp: 0, height: 'h-2' },
        { day: 'Fri', xp: 0, height: 'h-2' },
        { day: 'Sat', xp: 0, height: 'h-2' },
        { day: 'Sun', xp: 0, height: 'h-2' },
      ];

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-8">
          <div>
            <h1 className="font-heading text-3xl sm:text-5xl mb-1 sm:mb-2 uppercase tracking-tight">Your Progress</h1>
            <p className="text-muted-foreground font-medium text-xs sm:text-lg">Track your learning journey and stay consistent.</p>
          </div>
          <div className="bg-brand-yellow/20 text-brand-dark px-4 py-2 sm:px-6 sm:py-3 rounded-2xl font-bold flex items-center gap-2 sm:gap-3 border border-brand-yellow text-xs sm:text-base">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 fill-orange-500" />
            <span>{data?.completed_assessments > 0 ? "Active Learner" : "Start Learning!"}</span>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Overall Progress', value: `${data?.overall_progress || 0}%`, icon: Zap, color: 'text-brand-yellow', bg: 'bg-brand-yellow' },
            { label: 'Assessments', value: data?.completed_assessments || '0', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500' },
            { label: 'Time Spent', value: '0h', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500' },
            { label: 'Accuracy', value: `${data?.average_score || 0}%`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl sm:rounded-[24px] p-4 sm:p-6 shadow-xs border border-border/40 flex flex-col items-center justify-center text-center">
              <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full ${stat.bg}/10 flex items-center justify-center mb-2 sm:mb-3`}>
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1">{stat.label}</p>
              <p className="font-heading text-2xl sm:text-3xl">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-2xl sm:rounded-[32px] p-4 sm:p-8 shadow-xs border border-border/40">
          <div className="flex items-center justify-between mb-6 sm:mb-12">
            <h3 className="font-heading text-lg sm:text-2xl">XP Earned This Week</h3>
            <select className="bg-muted px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold text-xs sm:text-sm outline-none cursor-pointer">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 sm:h-64 min-w-[280px]">
              {weeklyData.map((data: any, i: number) => (
                <div key={i} className="flex flex-col items-center gap-2 sm:gap-4 flex-1 group">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-brand-dark text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none">
                    {data.xp} XP
                  </div>
                  
                  {/* Bar */}
                  <div className="w-full bg-muted rounded-t-xl relative overflow-hidden flex items-end justify-center">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: data.xp === 0 ? '4px' : '100%' }}
                      transition={{ duration: 1, delay: i * 0.1, type: 'spring' }}
                      className={`w-full ${data.height} ${data.xp > 300 ? 'bg-brand-yellow' : 'bg-brand-dark'} rounded-t-xl`} 
                    />
                  </div>
                  
                  {/* Label */}
                  <span className="text-xs sm:text-sm font-bold text-muted-foreground">{data.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
