'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { Settings, Shield, Award, Edit3, Camera, MapPin, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const badges = [
  { id: 1, name: 'First Steps', icon: '🐣', unlocked: true },
  { id: 2, name: '7-Day Streak', icon: '🔥', unlocked: true },
  { id: 3, name: 'Perfect Score', icon: '🎯', unlocked: true },
  { id: 4, name: 'Grammar Master', icon: '📚', unlocked: false },
  { id: 5, name: '30-Day Streak', icon: '🌋', unlocked: false },
  { id: 6, name: 'Diamond League', icon: '💎', unlocked: false },
];

export default function ProfilePage() {
  const { user, loading } = useAuth();

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'You';
  const userEmail = user?.email || 'student@college.edu';
  const userInitial = userName.charAt(0).toUpperCase();

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-[50vh] items-center justify-center">Loading...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        
        {/* Profile Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-border/40 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-6xl text-brand-dark shadow-xl border-4 border-white uppercase">
              {userInitial}
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-brand-dark text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left z-10">
            <h1 className="font-heading text-4xl mb-2 flex items-center justify-center md:justify-start gap-3 capitalize">
              {userName}
              <button className="text-muted-foreground hover:text-brand-dark transition-colors">
                <Edit3 className="w-5 h-5" />
              </button>
            </h1>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-muted-foreground mb-6">
              <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {userEmail}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> New York, USA</span>
              <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Member since 2026</span>
            </div>

            <div className="flex justify-center md:justify-start gap-4">
              <div className="bg-muted px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-brand-dark">
                Followers <span className="bg-white px-2 py-0.5 rounded-lg text-xs">24</span>
              </div>
              <div className="bg-muted px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-brand-dark">
                Following <span className="bg-white px-2 py-0.5 rounded-lg text-xs">12</span>
              </div>
            </div>
          </div>
          
          <div className="z-10 flex flex-col gap-3 w-full md:w-auto">
            <button className="bg-muted hover:bg-border/50 text-brand-dark font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Settings className="w-5 h-5" /> Settings
            </button>
            <button className="bg-brand-dark hover:bg-brand-dark/90 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md">
              Share Profile
            </button>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-border/40">
          <div className="flex items-center gap-3 mb-8">
            <Award className="w-8 h-8 text-brand-yellow fill-brand-yellow" />
            <h2 className="font-heading text-3xl">Badges & Achievements</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {badges.map((badge, i) => (
              <motion.div 
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all ${badge.unlocked ? 'border-brand-yellow bg-yellow-50/50 shadow-sm' : 'border-border/40 bg-muted/50 grayscale opacity-50'}`}
              >
                <div className="text-5xl mb-3 drop-shadow-md">{badge.icon}</div>
                <span className="font-bold text-sm leading-tight text-brand-dark">{badge.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
