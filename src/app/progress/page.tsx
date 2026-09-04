'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { Flame, Target, Zap, TrendingUp } from 'lucide-react';
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

  // BUG-027: Compute max XP for scaling instead of using class-based heights
  const rawData = data?.weekly_progress?.length > 0
    ? data.weekly_progress.map((d: any) => {
        const total = (d.reading || 0) + (d.writing || 0) + (d.speaking || 0);
        return { day: d.date, xp: Math.round(total) };
      })
    : [
        { day: 'Mon', xp: 0 },
        { day: 'Tue', xp: 0 },
        { day: 'Wed', xp: 0 },
        { day: 'Thu', xp: 0 },
        { day: 'Fri', xp: 0 },
        { day: 'Sat', xp: 0 },
        { day: 'Sun', xp: 0 },
      ];

  const maxXP = Math.max(...rawData.map((d: any) => d.xp), 1); // avoid /0

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

        {/* BUG-028: Removed hardcoded "0h" Time Spent — replaced with Accuracy card */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: 'Overall Progress', value: `${data?.overall_progress || 0}%`, icon: Zap, color: 'yellow' as const },
            { label: 'Assessments', value: data?.completed_assessments || '0', icon: Target, color: 'blue' as const },
            { label: 'Accuracy', value: `${data?.average_score || 0}%`, icon: TrendingUp, color: 'green' as const },
          ].map((stat, i) => (
            <div key={stat.label} className="bg-white rounded-[24px] p-6 shadow-sm border border-border/80 flex flex-col items-center justify-center text-center hover-card-up">
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
            {/* BUG-029: Coming soon badge instead of non-functional dropdown */}
            <div className="flex items-center gap-2 bg-muted/40 border border-border/50 px-4 py-2.5 rounded-xl">
              <span className="text-sm font-bold text-brand-dark uppercase tracking-wider">This Week</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-yellow text-brand-dark px-2 py-0.5 rounded-full">Live</span>
            </div>
          </div>

          {/* BUG-027: Inline height from real data, BUG-030: overflow-visible for tooltips */}
          <div className="overflow-x-auto pb-4">
            <div className="flex items-end justify-between gap-4 h-72 min-w-[500px] overflow-visible relative">

              {/* IMPROVE-019: Y-axis reference lines */}
              {[25, 50, 75, 100].map(pct => (
                <div
                  key={pct}
                  className="absolute left-0 right-0 border-t border-dashed border-border/40 flex items-center"
                  style={{ bottom: `${pct}%` }}
                >
                  <span className="text-[10px] text-muted-foreground font-bold ml-1 -translate-y-3 bg-white px-1">
                    {Math.round(maxXP * pct / 100)} XP
                  </span>
                </div>
              ))}

              {rawData.map((d: any, i: number) => {
                const heightPct = maxXP > 0 ? Math.max((d.xp / maxXP) * 100, d.xp > 0 ? 4 : 1) : 1;
                return (
                  <div key={d.day} className="flex flex-col items-center gap-4 flex-1 group relative overflow-visible">
                    {/* BUG-030: tooltip now above with overflow-visible on container */}
                    <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-all bg-brand-dark text-white text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap pointer-events-none z-10 transform translate-y-2 group-hover:translate-y-0">
                      {d.xp} XP
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-brand-dark rotate-45" />
                    </div>

                    {/* Bar — BUG-026: inline style height, no Tailwind classes */}
                    <div className="w-full max-w-[60px] bg-muted/40 rounded-t-2xl relative overflow-hidden border-x border-t border-border/50 flex items-end" style={{ height: '100%' }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.08, type: 'spring' }}
                        className={`w-full rounded-t-2xl ${d.xp > maxXP * 0.75 ? 'bg-brand-yellow' : 'bg-brand-dark'}`}
                        style={{ minHeight: d.xp > 0 ? 4 : 2 }}
                      />
                    </div>

                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

      </motion.div>
    </MainLayout>
  );
}
