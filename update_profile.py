import os

content = """'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { Settings, Shield, Award, Edit3, LogOut, Camera, Loader2, BookOpen, PenTool, Headphones, Mic } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useDashboard } from '@/hooks/use-dashboard';
import { useRouter } from 'next/navigation';

const DEFAULT_BADGES = [
  { id: 'first_steps', name: 'First Steps', icon: '🐣' },
  { id: '7_day_streak', name: '7-Day Streak', icon: '🔥' },
  { id: '30_day_streak', name: '30-Day Streak', icon: '🌋' },
  { id: 'grammar_master', name: 'Grammar Master', icon: '📚' },
  { id: 'reading_champion', name: 'Reading Champion', icon: '📖' },
  { id: 'speaking_star', name: 'Speaking Star', icon: '🎙️' },
  { id: 'writing_expert', name: 'Writing Expert', icon: '✍️' },
  { id: 'listening_hero', name: 'Listening Hero', icon: '🎧' },
  { id: 'perfect_score', name: 'Perfect Score', icon: '🎯' },
];

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: dashboardData, isLoading: dashLoading } = useDashboard();
  const router = useRouter();

  const loading = authLoading || dashLoading;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-brand-dark" />
        </div>
      </MainLayout>
    );
  }

  // Bind to real backend data
  const userName = dashboardData?.student_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
  const userInitial = userName.charAt(0).toUpperCase();
  const avatarUrl = user?.user_metadata?.avatar_url;
  
  const rollNumber = dashboardData?.roll_number || 'STU-0000';
  const studentClass = dashboardData?.class || 'Semester 1';
  const studentGroup = dashboardData?.group || 'A';
  
  const currentLevel = dashboardData?.current_level || 'Beginner';
  const overallScore = dashboardData?.overall_progress || 0;

  const listeningScore = dashboardData?.listening_avg || 0;
  const readingScore = dashboardData?.reading_avg || 0;
  const writingScore = dashboardData?.writing_avg || 0;
  const speakingScore = dashboardData?.speaking_avg || 0;

  // Process achievements
  const unlockedBadges = dashboardData?.achievements?.map((a: any) => a.title.toLowerCase()) || [];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        
        {/* Simplified Educational Profile Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-border/40 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative group shrink-0">
            {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-white" />
            ) : (
                <div className="w-32 h-32 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-6xl text-brand-dark shadow-xl border-4 border-white uppercase">
                {userInitial}
                </div>
            )}
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-brand-dark text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left z-10 w-full space-y-4">
            <h1 className="font-heading text-4xl flex items-center justify-center md:justify-start gap-3 capitalize break-words hyphens-auto">
              {userName}
            </h1>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-medium text-muted-foreground bg-slate-50 p-4 rounded-2xl border border-border/40">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Student ID</span>
                <span className="text-slate-900 font-bold">{rollNumber}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Class</span>
                <span className="text-slate-900 font-bold">{studentClass}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Group</span>
                <span className="text-slate-900 font-bold">{studentGroup}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Level</span>
                <span className="text-brand-dark font-bold bg-brand-yellow/30 px-2 py-0.5 rounded text-xs">{currentLevel}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3 pt-2">
              <button className="bg-muted hover:bg-border/50 text-brand-dark font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
              <button 
                onClick={() => router.push('/settings')}
                className="bg-brand-dark hover:bg-brand-dark/90 text-white font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <Settings className="w-4 h-4" /> Settings
              </button>
              <button 
                onClick={async () => {
                    await signOut();
                    router.push('/auth/login');
                }}
                className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LRWS Progress Area */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-border/40 space-y-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-heading text-2xl">LRWS Progress</h2>
                    <div className="text-right">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Overall Score</span>
                        <span className="font-heading text-3xl text-brand-dark">{Math.round(overallScore)}%</span>
                    </div>
                </div>

                <div className="space-y-5">
                    {[
                        { label: 'Listening', score: listeningScore, icon: Headphones, color: 'text-pink-600', bg: 'bg-pink-100', fill: 'bg-pink-500' },
                        { label: 'Reading', score: readingScore, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100', fill: 'bg-blue-500' },
                        { label: 'Writing', score: writingScore, icon: PenTool, color: 'text-orange-600', bg: 'bg-orange-100', fill: 'bg-orange-500' },
                        { label: 'Speaking', score: speakingScore, icon: Mic, color: 'text-purple-600', bg: 'bg-purple-100', fill: 'bg-purple-500' },
                    ].map(skill => (
                        <div key={skill.label} className="space-y-2">
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="flex items-center gap-2">
                                    <span className={`w-6 h-6 rounded-md flex items-center justify-center ${skill.bg} ${skill.color}`}>
                                        <skill.icon className="w-3.5 h-3.5" />
                                    </span>
                                    {skill.label}
                                </span>
                                <span>{Math.round(skill.score)}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full ${skill.fill} rounded-full transition-all duration-1000`} style={{ width: `${skill.score}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Achievements Grid */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-border/40">
            <div className="flex items-center gap-3 mb-6">
                <Award className="w-7 h-7 text-brand-yellow fill-brand-yellow" />
                <h2 className="font-heading text-2xl">Badges & Achievements</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {DEFAULT_BADGES.map((badge, i) => {
                // Check if unlocked
                const isUnlocked = unlockedBadges.some((unlockedTitle: string) => unlockedTitle.includes(badge.name.toLowerCase()));
                
                return (
                <motion.div 
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex flex-col items-center justify-center text-center p-3 sm:p-4 rounded-2xl border-2 transition-all ${isUnlocked ? 'border-brand-yellow bg-yellow-50/50 shadow-sm' : 'border-border/40 bg-muted/50 grayscale opacity-40'}`}
                >
                    <div className="text-4xl sm:text-5xl mb-2 drop-shadow-md">{badge.icon}</div>
                    <span className="font-bold text-[10px] sm:text-xs leading-tight text-brand-dark">{badge.name}</span>
                </motion.div>
                )})}
            </div>
            </div>
        </div>
      </div>
    </MainLayout>
  );
}
"""
with open(r"src\app\profile\page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated profile page!")
