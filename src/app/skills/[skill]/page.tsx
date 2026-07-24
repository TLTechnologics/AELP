'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { useParams, useRouter } from 'next/navigation';
import { Headphones, BookOpen, PenTool, Mic, ArrowRight, PlayCircle, Star, Trophy, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const skillConfig: Record<string, { title: string, icon: any, color: string, bg: string, level: string, progress: number }> = {
  listening: { title: 'Listening', icon: Headphones, color: 'text-purple-600', bg: 'bg-purple-100', level: 'Beginner', progress: 38 },
  reading: { title: 'Reading', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100', level: 'Advanced', progress: 84 },
  writing: { title: 'Writing', icon: PenTool, color: 'text-orange-600', bg: 'bg-orange-100', level: 'Intermediate', progress: 59 },
  speaking: { title: 'Speaking', icon: Mic, color: 'text-green-600', bg: 'bg-green-100', level: 'Beginner', progress: 42 },
};

export default function SkillPage() {
  const params = useParams();
  const router = useRouter();
  const skillId = params.skill as string;
  const config = skillConfig[skillId] || skillConfig.listening;
  const Icon = config.icon;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header Area */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-border/40 relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full ${config.bg} opacity-20 blur-3xl`} />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${config.bg} ${config.color} shadow-inner`}>
                <Icon className="w-10 h-10" />
              </div>
              <div>
                <h1 className="font-heading text-5xl mb-1">{config.title}</h1>
                <p className="text-muted-foreground font-bold flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full ${config.bg} ${config.color} text-xs uppercase tracking-wider`}>
                    {config.level}
                  </span>
                  Current Level
                </p>
              </div>
            </div>

            <div className="bg-muted px-6 py-4 rounded-2xl border border-border text-center min-w-[200px]">
              <p className="text-sm font-bold mb-2">Skill Mastery</p>
              <div className="flex items-end justify-center gap-1 font-heading text-4xl text-brand-dark">
                {config.progress}<span className="text-2xl text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Lessons Column */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-heading text-3xl">Up Next</h3>
            
            {[
              { title: 'Understanding Tone & Emotion', duration: '12 min', xp: 50, locked: false },
              { title: 'Identifying Main Ideas in Lectures', duration: '15 min', xp: 75, locked: true },
              { title: 'Practice: Note-taking', duration: '20 min', xp: 100, locked: true },
            ].map((lesson, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white rounded-[24px] p-6 flex items-center justify-between border ${lesson.locked ? 'border-border/40 opacity-70 grayscale' : 'border-brand-yellow shadow-md hover:-translate-y-1 transition-transform'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    {lesson.locked ? <Lock className="w-5 h-5 text-muted-foreground" /> : <PlayCircle className="w-6 h-6 text-brand-dark" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{lesson.title}</h4>
                    <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground mt-1">
                      <span>⏱️ {lesson.duration}</span>
                      <span>⭐ {lesson.xp} XP</span>
                    </div>
                  </div>
                </div>
                {!lesson.locked && (
                  <button 
                    onClick={() => router.push('/lesson')}
                    className="bg-brand-dark text-white rounded-full p-3 hover:bg-brand-dark/90"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <h3 className="font-heading text-3xl">Achievements</h3>
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-border/40 grid grid-cols-2 gap-4">
              {[
                { icon: Trophy, label: 'Perfect Score', count: 3 },
                { icon: Star, label: 'Fast Learner', count: 1 },
              ].map((ach, i) => (
                <div key={i} className="bg-muted rounded-2xl p-4 text-center flex flex-col items-center justify-center border border-border/50">
                  <ach.icon className="w-8 h-8 text-brand-yellow mb-2" fill="currentColor" />
                  <span className="font-bold text-xs">{ach.label}</span>
                  <span className="font-heading text-xl mt-1">{ach.count}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-brand-yellow to-brand-warning rounded-[24px] p-6 text-brand-dark shadow-lg">
              <h4 className="font-heading text-2xl mb-2">Daily Challenge</h4>
              <p className="font-medium text-sm mb-4">Complete 2 {config.title} lessons today to earn a bonus chest!</p>
              <button className="w-full bg-white text-brand-dark font-bold rounded-xl py-3 shadow-sm hover:scale-105 transition-transform">
                Start Challenge
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
