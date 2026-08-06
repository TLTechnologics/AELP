'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Headphones, BookOpen, PenTool, Mic, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useDashboard } from '@/hooks/use-dashboard';
import { FeatureLocked } from '@/components/feature-locked';
import { LiquidLoader } from '@/components/ui/liquid-loader';

const skills = [
  { id: 'reading', title: 'Reading', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100', desc: 'Comprehend complex texts, articles, and literature.' },
  { id: 'writing', title: 'Writing', icon: PenTool, color: 'text-orange-600', bg: 'bg-orange-100', desc: 'Express your thoughts clearly with proper grammar and structure.' },
];

export default function SkillsHubPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return <LiquidLoader isLooping={true} />;
  }

  const isLocked = data?.profile_stage === 1;

  if (isLocked) {
    return (
      <MainLayout>
        <FeatureLocked 
          title="Skills Hub Locked" 
          message="Complete your first assessment to unlock detailed skill breakdowns." 
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12 pb-12">
        <div className="text-center space-y-2 sm:space-y-4 max-w-2xl mx-auto mb-8 sm:mb-12">
          <h1 className="font-heading text-3xl sm:text-6xl uppercase tracking-tight">Core Skills</h1>
          <p className="text-sm sm:text-xl text-muted-foreground font-medium leading-relaxed">Focus on specific areas of your English journey. Select a skill to view your mastery and start targeted lessons.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
          {skills.map((skill, i) => (
            <motion.div 
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link 
                href={`/skills/${skill.id}`}
                className="group flex flex-col h-full bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-xs border border-border/40 hover:border-brand-dark transition-all hover:-translate-y-1 hover:shadow-xl relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-36 sm:w-48 h-36 sm:h-48 rounded-full ${skill.bg} opacity-20 blur-3xl group-hover:scale-150 transition-transform duration-700`} />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center ${skill.bg} ${skill.color} mb-4 sm:mb-6 shadow-inner`}>
                    <skill.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  
                  <h2 className="font-heading text-2xl sm:text-4xl mb-2 sm:mb-3 group-hover:text-brand-yellow transition-colors">{skill.title}</h2>
                  <p className="text-muted-foreground font-medium text-xs sm:text-lg mb-6 sm:mb-8 flex-1 leading-relaxed">{skill.desc}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-xs tracking-wider uppercase opacity-60">View Dashboard</span>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-dark flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
