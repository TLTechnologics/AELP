'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { Flame, Target, Zap, Clock, TrendingUp } from 'lucide-react';

const weeklyData = [
  { day: 'Mon', xp: 120, height: 'h-16' },
  { day: 'Tue', xp: 350, height: 'h-48' },
  { day: 'Wed', xp: 210, height: 'h-28' },
  { day: 'Thu', xp: 180, height: 'h-24' },
  { day: 'Fri', xp: 420, height: 'h-56' },
  { day: 'Sat', xp: 50, height: 'h-8' },
  { day: 'Sun', xp: 0, height: 'h-2' },
];

export default function ProgressPage() {
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-5xl mb-2">Your Progress</h1>
            <p className="text-muted-foreground font-medium text-lg">Track your learning journey and stay consistent.</p>
          </div>
          <div className="hidden md:flex bg-brand-yellow/20 text-brand-dark px-6 py-3 rounded-2xl font-bold items-center gap-3 border border-brand-yellow">
            <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
            <span className="text-xl">14 Day Streak!</span>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total XP', value: '14,250', icon: Zap, color: 'text-brand-yellow', bg: 'bg-brand-yellow' },
            { label: 'Lessons', value: '42', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500' },
            { label: 'Time Spent', value: '18h', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500' },
            { label: 'Accuracy', value: '94%', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-[24px] p-6 shadow-sm border border-border/40 flex flex-col items-center justify-center text-center">
              <div className={`w-12 h-12 rounded-full ${stat.bg}/10 flex items-center justify-center mb-3`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="font-heading text-3xl">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-border/40">
          <div className="flex items-center justify-between mb-12">
            <h3 className="font-heading text-2xl">XP Earned This Week</h3>
            <select className="bg-muted px-4 py-2 rounded-xl font-bold text-sm outline-none cursor-pointer">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>

          <div className="flex items-end justify-between gap-4 h-64 mt-8">
            {weeklyData.map((data, i) => (
              <div key={i} className="flex flex-col items-center gap-4 flex-1 group">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-brand-dark text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap mb-2 pointer-events-none">
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
                <span className="text-sm font-bold text-muted-foreground">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
