'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { Flame, Target, Zap, Clock, TrendingUp } from 'lucide-react';
import { useDashboard } from '@/hooks/use-dashboard';
import { FeatureLocked } from '@/components/feature-locked';
import { LiquidLoader } from '@/components/ui/liquid-loader';
import { SectionHeader } from '@/components/ui/section-header';
import { IconContainer } from '@/components/ui/icon-container';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

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
        if (xp > 200) heightClass = 'h-64';
        else if (xp > 150) heightClass = 'h-48';
        else if (xp > 100) heightClass = 'h-32';
        else if (xp > 50) heightClass = 'h-24';
        else if (xp > 0) heightClass = 'h-12';
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
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-12 pb-24"
      >
        <motion.div variants={itemVariants}>
          <SectionHeader 
            title={<>Your <span className="highlight-yellow inline-block px-2">Progress</span></>}
            description="Track your learning journey and stay consistent."
          >
            <div className="bg-brand-yellow/20 text-brand-dark px-6 py-3 rounded-2xl font-bold flex items-center gap-3 border border-brand-yellow text-sm">
              <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
              <span>{data?.completed_assessments > 0 ? "Active Learner" : "Start Learning!"}</span>
            </div>
          </SectionHeader>
        </motion.div>

        {/* Top Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Overall Progress', value: `${data?.overall_progress || 0}%`, icon: Zap, color: 'yellow' as const },
            { label: 'Assessments', value: data?.completed_assessments || '0', icon: Target, color: 'blue' as const },
            { label: 'Time Spent', value: '0h', icon: Clock, color: 'purple' as const },
            { label: 'Accuracy', value: `${data?.average_score || 0}%`, icon: TrendingUp, color: 'green' as const },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-[24px] p-6 shadow-sm border border-border/80 flex flex-col items-center justify-center text-center hover-card-up">
              <IconContainer icon={stat.icon} color={stat.color} size="lg" className="mb-4" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</p>
              <p className="font-heading text-4xl text-brand-dark">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Chart Section */}
        <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 shadow-sm border border-border/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
            <h3 className="font-heading text-3xl text-brand-dark uppercase">XP Earned</h3>
            <select className="bg-muted/40 border border-border/50 px-4 py-3 rounded-xl font-bold text-sm outline-none cursor-pointer focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 text-brand-dark uppercase tracking-wider transition-all">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="flex items-end justify-between gap-4 h-72 min-w-[500px]">
              {weeklyData.map((data: any, i: number) => (
                <div key={i} className="flex flex-col items-center gap-4 flex-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all bg-brand-dark text-white text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                    {data.xp} XP
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-brand-dark rotate-45" />
                  </div>
                  
                  {/* Bar */}
                  <div className="w-full max-w-[60px] bg-muted/40 rounded-t-2xl relative overflow-hidden flex items-end justify-center border-x border-t border-border/50">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: data.xp === 0 ? '4px' : '100%' }}
                      transition={{ duration: 1, delay: i * 0.1, type: 'spring' }}
                      className={`w-full ${data.height} ${data.xp > 300 ? 'bg-brand-yellow' : 'bg-brand-dark'} rounded-t-2xl hover:brightness-110 transition-all`} 
                    />
                  </div>
                  
                  {/* Label */}
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{data.day}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </motion.div>
    </MainLayout>
  );
}
