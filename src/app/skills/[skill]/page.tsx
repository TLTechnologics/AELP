'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, PenTool, Headphones, Mic, ArrowRight, PlayCircle, Star, Trophy, Lock, FileText, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { lessonService } from '@/services/api';
import { useDashboard } from '@/hooks/use-dashboard';
import { FeatureLocked } from '@/components/feature-locked';

const skillConfig: Record<string, { title: string, icon: any, color: string, bg: string, border: string, level: string, progress: number }> = {
  reading: { title: 'Reading Comprehension', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200', level: 'Advanced', progress: 84 },
  writing: { title: 'Academic Writing', icon: PenTool, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200', level: 'Intermediate', progress: 59 },
  listening: { title: 'Listening Comprehension', icon: Headphones, color: 'text-pink-600', bg: 'bg-pink-100', border: 'border-pink-200', level: 'Intermediate', progress: 68 },
  speaking: { title: 'Conversational Speaking', icon: Mic, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200', level: 'Beginner', progress: 45 },
};

const DEFAULT_SKILL_LESSONS: Record<string, any[]> = {
  writing: [
    {
      id: 1,
      title: "Mastering IELTS Task 2 Essays",
      description: "Learn how to structure problem-solution and opinion essays with high-band vocabulary.",
      content: "To score Band 7+ in IELTS Writing Task 2, structure your essay into 4 distinct paragraphs: Introduction, Body 1, Body 2, and Conclusion.",
      skill_domain: "writing",
      difficulty: "intermediate",
      estimated_time: 20
    }
  ],
  speaking: [
    {
      id: 2,
      title: "Conversational Fluency & Connected Speech",
      description: "Listen to native speakers and practice linking words, contractions, and stress patterns.",
      audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      skill_domain: "speaking",
      difficulty: "beginner",
      estimated_time: 15
    }
  ],
  reading: [
    {
      id: 3,
      title: "Academic Reading: Skimming & Scanning Techniques",
      description: "Improve your reading speed and accuracy for complex scientific and academic articles.",
      content: "Skimming allows you to grasp the main topic quickly by reading headers and topic sentences.",
      skill_domain: "reading",
      difficulty: "advanced",
      estimated_time: 25
    }
  ],
  listening: [
    {
      id: 4,
      title: "Active Listening: Identifying Speaker Intent",
      description: "Practice listening comprehension with audio tracks and catch subtle emotional cues.",
      audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      skill_domain: "listening",
      difficulty: "intermediate",
      estimated_time: 18
    }
  ]
};

export default function SkillPage() {
  const { data } = useDashboard();
  const params = useParams();
  const router = useRouter();
  const skillId = (params.skill as string || 'reading').toLowerCase();
  const config = skillConfig[skillId] || skillConfig.reading;
  const Icon = config.icon;

  const isLocked = data?.profile_stage === 1;

  // Fetch teacher lessons for this skill
  const { data: teacherLessons = [], isLoading } = useQuery({
    queryKey: ['studentSkillLessons', skillId],
    queryFn: async () => {
      let remote: any[] = [];
      try {
        const res = await lessonService.getLessons({ skill: skillId });
        if (Array.isArray(res.data) && res.data.length > 0 && !res.data[0]?.message) {
          remote = res.data;
        }
      } catch (e) {}

      let local: any[] = [];
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('aelp_custom_lessons');
          if (saved) {
            const parsed = JSON.parse(saved);
            local = parsed.filter((l: any) => l.skill_domain?.toLowerCase() === skillId);
          }
        } catch (e) {}
      }

      const merged = [...local, ...remote.filter(r => !local.some(l => l.id === r.id))];
      return merged.length > 0 ? merged : (DEFAULT_SKILL_LESSONS[skillId] || DEFAULT_SKILL_LESSONS.reading);
    }
  });

  if (isLocked) {
    return (
      <MainLayout>
        <FeatureLocked 
          title="Skill Training Locked" 
          message="Complete your diagnostic assessment first to unlock targeted skill practice." 
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-16">
        {/* Header Area */}
        <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-xs border border-border/40 relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full ${config.bg} opacity-20 blur-3xl`} />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5 sm:gap-6">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center ${config.bg} ${config.color} shadow-inner shrink-0`}>
                <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <h1 className="font-heading text-3xl sm:text-5xl mb-1 text-slate-900">{config.title}</h1>
                <p className="text-muted-foreground font-bold flex items-center gap-2 text-xs sm:text-sm">
                  <span className={`px-3 py-1 rounded-full ${config.bg} ${config.color} text-[10px] sm:text-xs uppercase tracking-wider font-extrabold border ${config.border}`}>
                    {config.level}
                  </span>
                  Current Mastery Level
                </p>
              </div>
            </div>

            <div className="bg-muted px-6 py-4 rounded-2xl border border-border text-center min-w-[180px] w-full md:w-auto">
              <p className="text-xs font-bold mb-1 uppercase tracking-wider text-slate-600">Domain Mastery</p>
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
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-2xl sm:text-3xl text-slate-900">Available Lectures</h3>
              <span className="text-xs font-bold uppercase px-3 py-1 bg-brand-yellow/30 text-brand-dark rounded-full">
                {teacherLessons.length} Modules
              </span>
            </div>
            
            {teacherLessons.map((lesson: any, i: number) => {
              const isAudio = !!lesson.audio_url;

              return (
                <motion.div 
                  key={lesson.id || i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-[24px] p-5 sm:p-6 border border-border/50 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start sm:items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isAudio ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                      {isAudio ? <Headphones className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {lesson.difficulty || 'beginner'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {isAudio ? '🎙️ Audio Lecture' : '📖 Written Material'}
                        </span>
                      </div>
                      <h4 className="font-bold text-lg text-slate-900 group-hover:text-brand-dark transition-colors line-clamp-1">
                        {lesson.title}
                      </h4>
                      {lesson.description && (
                        <p className="text-xs text-slate-600 font-medium line-clamp-2">
                          {lesson.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-400 pt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {lesson.estimated_time || 15} mins</span>
                        <span>•</span>
                        <span className="text-emerald-600">+50 XP</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push(`/lesson?id=${lesson.id}`)}
                    className="w-full sm:w-auto bg-brand-dark text-white px-5 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-brand-dark/90 transition-transform active:scale-95 shadow-sm shrink-0"
                  >
                    Start Lecture <ArrowRight className="w-4 h-4 text-brand-yellow" />
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <h3 className="font-heading text-2xl sm:text-3xl text-slate-900">Skill Badges</h3>
            <div className="bg-white rounded-[24px] p-6 shadow-xs border border-border/40 grid grid-cols-2 gap-4">
              {[
                { icon: Trophy, label: 'Mastery Streak', count: '5 Days' },
                { icon: Star, label: 'XP Earned', count: '450 XP' },
              ].map((ach, i) => (
                <div key={i} className="bg-slate-50 rounded-2xl p-4 text-center flex flex-col items-center justify-center border border-border/50">
                  <ach.icon className="w-7 h-7 text-brand-yellow mb-1.5" fill="currentColor" />
                  <span className="font-heading text-xl text-slate-900">{ach.count}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">{ach.label}</span>
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
