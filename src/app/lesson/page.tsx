'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, Bookmark, CheckCircle2, MessageSquare, Mic, RotateCcw, Headphones, FileText, Sparkles, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { lessonService } from '@/services/api';
import { useDashboard } from '@/hooks/use-dashboard';
import { FeatureLocked } from '@/components/feature-locked';
import { MainLayout } from '@/components/layout/main-layout';

interface LessonData {
  id: number;
  title: string;
  description?: string;
  content?: string;
  audio_url?: string;
  skill_domain: string;
  difficulty: string;
  estimated_time: number;
}

const DEFAULT_LESSON: LessonData = {
  id: 1,
  title: "Understanding Tone & Emotion",
  description: "Listen to the dialogue between speakers and identify key intonation cues.",
  content: "To identify speaker intent and emotion in English conversations, pay attention to intonation changes. A rising intonation indicates curiosity or doubt, while pitch drops signal conclusion.",
  audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  skill_domain: "listening",
  difficulty: "intermediate",
  estimated_time: 15
};

export default function LessonPage() {
  const { data } = useDashboard();
  const searchParams = useSearchParams();
  const router = useRouter();
  const lessonIdStr = searchParams.get('id');

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeTab, setActiveTab] = useState<'content' | 'notes'>('content');
  const [completed, setCompleted] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch specific lesson details or fallback to local storage / default
  const { data: currentLesson = DEFAULT_LESSON } = useQuery<LessonData>({
    queryKey: ['studentLessonDetails', lessonIdStr],
    queryFn: async () => {
      if (!lessonIdStr) return DEFAULT_LESSON;

      // 1. Check local storage
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('aelp_custom_lessons');
          if (saved) {
            const list = JSON.parse(saved);
            const found = list.find((l: any) => l.id.toString() === lessonIdStr);
            if (found) return found;
          }
        } catch (e) {}
      }

      // 2. Fetch from backend API
      try {
        const res = await lessonService.getLessons();
        if (Array.isArray(res.data)) {
          const found = res.data.find((l: any) => l.id.toString() === lessonIdStr);
          if (found) return found;
        }
      } catch (e) {}

      return DEFAULT_LESSON;
    }
  });

  const isLocked = data?.profile_stage === 1;

  const isAudio = !!currentLesson.audio_url;

  useEffect(() => {
    if (isAudio && currentLesson.audio_url) {
      const audio = new Audio(currentLesson.audio_url);
      audio.onloadedmetadata = () => setDuration(audio.duration || 90);
      audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
      audio.onended = () => {
        setIsPlaying(false);
        setCompleted(true);
      };
      audioRef.current = audio;

      return () => {
        audio.pause();
      };
    }
  }, [currentLesson.audio_url, isAudio]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const restartAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isLocked) {
    return (
      <MainLayout>
        <FeatureLocked 
          title="Interactive Lessons Locked" 
          message="Complete your first diagnostic assessment to unlock your personalized learning path and lessons." 
        />
      </MainLayout>
    );
  }

  return (
    <div className="min-h-screen bg-muted bg-grid-pattern pb-24">
      {/* Top Navigation */}
      <header className="h-16 sm:h-20 bg-white/80 backdrop-blur-md border-b border-border/40 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-brand-dark" />
          </button>
          <div>
            <h1 className="font-bold text-sm sm:text-lg leading-tight text-slate-900 line-clamp-1">{currentLesson.title}</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-extrabold uppercase tracking-wider">
              {currentLesson.skill_domain} • {currentLesson.difficulty} • {currentLesson.estimated_time} mins
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            +50 XP
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-6 sm:pt-8">
        {!completed ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Left Column: Media & Interactive Lesson View */}
            <div className="lg:col-span-2 space-y-6">
              
              {isAudio ? (
                /* Audio Player Card */
                <div className="bg-brand-dark text-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-900/60 text-purple-200 border border-purple-700/50 flex items-center gap-1.5">
                      <Headphones className="w-3.5 h-3.5 text-brand-yellow" /> Audio Lecture
                    </span>
                    <span className="text-xs font-bold text-white/60">
                      {formatTime(currentTime)} / {formatTime(duration || 90)}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-6 sm:gap-8 relative z-10">
                    {/* Wave Animation */}
                    <div className="flex items-center justify-center gap-1.5 h-16 w-full">
                      {[...Array(24)].map((_, i) => (
                        <motion.div 
                          key={i}
                          animate={{ 
                            height: isPlaying ? [10, Math.random() * 45 + 15, 10] : 10 
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: isPlaying ? 0.4 + Math.random() * 0.4 : 0 
                          }}
                          className={`w-1.5 md:w-2 rounded-full ${i % 3 === 0 ? 'bg-brand-yellow' : 'bg-white/30'}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-6 w-full max-w-md">
                      <button onClick={restartAudio} className="text-white/60 hover:text-white transition-colors" title="Restart Audio">
                        <RotateCcw className="w-6 h-6" />
                      </button>
                      
                      <button 
                        onClick={togglePlay}
                        className="w-16 h-16 rounded-full bg-brand-yellow text-brand-dark flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-[0_0_25px_rgba(255,225,124,0.4)] shrink-0"
                      >
                        {isPlaying ? <Pause className="w-8 h-8 fill-brand-dark" /> : <Play className="w-8 h-8 fill-brand-dark ml-1" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Written Text Material Card */
                <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-xs border border-border/40 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Reading & Writing Lecture
                    </span>
                  </div>

                  <h2 className="font-heading text-2xl sm:text-3xl text-slate-900 leading-snug">
                    {currentLesson.title}
                  </h2>

                  {currentLesson.description && (
                    <p className="text-xs sm:text-sm text-slate-600 font-semibold bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      💡 {currentLesson.description}
                    </p>
                  )}

                  {currentLesson.content && (
                    <div className="prose prose-slate max-w-none text-xs sm:text-sm font-medium leading-relaxed text-slate-800 pt-2 whitespace-pre-line">
                      {currentLesson.content}
                    </div>
                  )}
                </div>
              )}

              {/* Practice / Reflection Area */}
              <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-xs border border-border/40 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-900">Lecture Verification Check</h3>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">Practice Activity</span>
                </div>
                
                <p className="text-xs sm:text-sm font-semibold text-slate-700">
                  {isAudio 
                    ? "Based on the audio lecture, what is the main key takeaway discussed?" 
                    : "Review the lesson material above. Select your response or confirm completion:"}
                </p>
                
                <div className="space-y-2.5">
                  {[
                    'Mastered key structure & techniques explained in lecture',
                    'Identified central themes and vocabulary collocations',
                    'Ready to apply concepts in diagnostic assessments'
                  ].map((opt, i) => (
                    <button 
                      key={i} 
                      onClick={() => setUserAnswer(opt)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 font-semibold text-xs sm:text-sm transition-all ${
                        userAnswer === opt 
                          ? 'border-brand-dark bg-brand-yellow/20 text-slate-900 shadow-xs' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={() => setCompleted(true)}
                    className="w-full sm:w-auto bg-brand-dark text-white rounded-full px-8 py-3.5 font-bold text-xs sm:text-sm hover:bg-brand-dark/90 transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2"
                  >
                    Complete Lecture & Claim XP <CheckCircle2 className="w-4 h-4 text-brand-yellow" />
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Lesson Notes & Key Vocabulary */}
            <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 shadow-xs border border-border/40 flex flex-col h-[520px]">
              <div className="flex p-1 bg-slate-100 rounded-2xl mb-5">
                <button 
                  onClick={() => setActiveTab('content')}
                  className={`flex-1 py-2 text-xs font-bold capitalize rounded-xl transition-all ${activeTab === 'content' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Overview & Notes
                </button>
                <button 
                  onClick={() => setActiveTab('notes')}
                  className={`flex-1 py-2 text-xs font-bold capitalize rounded-xl transition-all ${activeTab === 'notes' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Key Vocabulary
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar text-xs font-medium text-slate-700">
                {activeTab === 'content' ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="font-bold text-slate-900 block mb-1">Target Skill</span>
                      <p className="text-slate-600 uppercase font-extrabold text-[11px]">{currentLesson.skill_domain} • {currentLesson.difficulty}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="font-bold text-slate-900 block mb-1">Key Summary</span>
                      <p className="text-slate-600 leading-relaxed">{currentLesson.description || "Review this lecture carefully to build fluency."}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { word: 'Collocation', type: 'noun', def: 'Words that frequently occur together in natural English.' },
                      { word: 'Cohesion', type: 'noun', def: 'Flow and logical connection between sentences and paragraphs.' },
                      { word: 'Fluency', type: 'noun', def: 'Ability to express oneself easily and articulately.' }
                    ].map((v, i) => (
                      <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900">{v.word}</span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">{v.type}</span>
                        </div>
                        <p className="text-[11px] text-slate-600">{v.def}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          /* Lesson Completed State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center py-12 space-y-6"
          >
            <motion.div 
              animate={{ rotateY: 360 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-24 h-24 sm:w-28 sm:h-28 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
            </motion.div>
            
            <div>
              <h2 className="font-heading text-4xl sm:text-5xl text-slate-900">Lecture Completed!</h2>
              <p className="text-sm sm:text-base text-slate-600 font-semibold mt-2">
                Great job! You earned <span className="text-emerald-600 font-extrabold">+50 XP</span> for completing "{currentLesson.title}".
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button 
                onClick={() => router.push(`/skills/${currentLesson.skill_domain}`)} 
                className="w-full sm:w-auto bg-brand-dark text-white px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-md hover:bg-brand-dark/90 transition-transform active:scale-95"
              >
                Back to {currentLesson.skill_domain.toUpperCase()} Modules
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
