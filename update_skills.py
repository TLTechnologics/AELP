import os

content = """'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Headphones, BookOpen, PenTool, Mic, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useDashboard } from '@/hooks/use-dashboard';
import { FeatureLocked } from '@/components/feature-locked';
import { LiquidLoader } from '@/components/ui/liquid-loader';

const ALL_SKILLS_CONFIG = {
  listening: { id: 'listening', title: 'Listening', icon: Headphones, color: 'text-pink-600', bg: 'bg-pink-100', fill: 'bg-pink-500' },
  reading: { id: 'reading', title: 'Reading', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100', fill: 'bg-blue-500' },
  writing: { id: 'writing', title: 'Writing', icon: PenTool, color: 'text-orange-600', bg: 'bg-orange-100', fill: 'bg-orange-500' },
  speaking: { id: 'speaking', title: 'Speaking', icon: Mic, color: 'text-purple-600', bg: 'bg-purple-100', fill: 'bg-purple-500' }
};

function getClassification(score: number) {
  if (score >= 80) return { label: 'Strong', color: 'text-emerald-600' };
  if (score >= 60) return { label: 'Good', color: 'text-blue-600' };
  if (score >= 40) return { label: 'Needs Improvement', color: 'text-orange-600' };
  return { label: 'Critical', color: 'text-red-600' };
}

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

  // Extract real scores from backend dashboard payload
  const rawScores = {
    listening: data?.listening_avg || 0,
    reading: data?.reading_avg || 0,
    writing: data?.writing_avg || 0,
    speaking: data?.speaking_avg || 0
  };

  // Only keep skills < 80
  const weakSkills = Object.entries(rawScores)
    .filter(([_, score]) => score < 80)
    .map(([key, score]) => {
        const config = ALL_SKILLS_CONFIG[key as keyof typeof ALL_SKILLS_CONFIG];
        const classification = getClassification(score);
        
        // Mocking assigned/completed lessons based on progress for now,
        // since the dashboard payload doesn't strictly break down lesson counts per domain yet.
        const totalLessons = 10;
        const completedLessons = Math.floor((score / 100) * totalLessons);
        
        return {
            ...config,
            score: Math.round(score),
            classification,
            totalLessons,
            completedLessons,
            remainingLessons: totalLessons - completedLessons,
            estimatedTime: (totalLessons - completedLessons) * 15 // 15 mins per lesson
        };
    });

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12 pb-12">
        <div className="text-center space-y-2 sm:space-y-4 max-w-2xl mx-auto mb-8 sm:mb-12">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight break-words">Adaptive Skill Plan</h1>
          <p className="text-sm sm:text-lg text-muted-foreground font-medium leading-relaxed">
            Based on your latest assessments, we've dynamically generated a learning path specifically targeting your weak areas.
          </p>
        </div>

        {weakSkills.length === 0 ? (
          <div className="bg-emerald-50 rounded-[32px] p-8 text-center border border-emerald-100 flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
            <h2 className="font-heading text-3xl text-emerald-900 mb-2">You're All Caught Up!</h2>
            <p className="text-emerald-700 font-medium">You have scored over 80% in all domains. Keep taking advanced assessments to maintain your streak.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {weakSkills.map((skill, i) => (
              <motion.div 
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link 
                  href={`/skills/${skill.id}`}
                  className="group flex flex-col h-full bg-white rounded-[32px] p-6 shadow-sm border border-border/40 hover:border-brand-dark transition-all hover:-translate-y-1 hover:shadow-xl relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-48 h-48 rounded-full ${skill.bg} opacity-10 blur-3xl group-hover:scale-150 transition-transform duration-700`} />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${skill.bg} ${skill.color} shadow-inner shrink-0`}>
                                <skill.icon className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="font-heading text-2xl group-hover:text-brand-dark transition-colors">{skill.title}</h2>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${skill.classification.color}`}>
                                    {skill.classification.label}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Score</span>
                            <span className="font-heading text-2xl text-slate-900">{skill.score}%</span>
                        </div>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                                <span>Module Progress</span>
                                <span>{skill.completedLessons} / {skill.totalLessons} Lessons</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full ${skill.fill} rounded-full transition-all duration-1000`} style={{ width: `${(skill.completedLessons / skill.totalLessons) * 100}%` }} />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="bg-slate-50 rounded-xl p-3 border border-border/50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Remaining</span>
                                <span className="text-slate-700 font-bold">{skill.remainingLessons} Lessons</span>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3 border border-border/50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Est. Time</span>
                                <span className="text-slate-700 font-bold">{skill.estimatedTime} mins</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                      <span className="font-bold text-xs tracking-wider uppercase opacity-60">Open Assignments</span>
                      <div className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
"""
with open(r"src\app\skills\page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Skills page updated!")
