'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Lock, Shield, Award, Edit3, LogOut, Camera, Loader2, BookOpen, PenTool, Headphones, Mic, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useDashboard } from '@/hooks/use-dashboard';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { IconContainer } from '@/components/ui/icon-container';
import { SectionHeader } from '@/components/ui/section-header';

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

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export default function ProfilePage() {
  const { user, role, loading: authLoading } = useAuth();
  const { data: dashboardData, isLoading: dashLoading } = useDashboard();
  const router = useRouter();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // IMPROVE-021
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success'|'error'; msg: string } | null>(null); // BUG-036

  const handlePasswordChange = async () => {
    setPasswordFeedback(null);
    // IMPROVE-021: validate confirm password
    if (!newPassword || newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', msg: 'Password must be at least 6 characters long' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', msg: 'Passwords do not match' });
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    
    if (error) {
      // BUG-036: inline feedback instead of alert()
      setPasswordFeedback({ type: 'error', msg: error.message });
    } else {
      setPasswordFeedback({ type: 'success', msg: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => { setShowPasswordModal(false); setPasswordFeedback(null); }, 1500);
    }
  };

  const isTeacher = role === 'teacher';

  const loading = authLoading || (dashLoading && !isTeacher);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-brand-yellow" />
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
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full space-y-6 shadow-xl border border-border/80">
            <h3 className="font-heading text-3xl text-brand-dark">Change Password</h3>
            {/* BUG-036: Inline feedback */}
            {passwordFeedback && (
              <div className={`p-3 rounded-xl text-sm font-medium text-center ${passwordFeedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                {passwordFeedback.msg}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-muted/40 border border-border/80 rounded-xl px-4 py-3.5 text-brand-dark font-medium focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow transition-all"
                  placeholder="Enter new password (min. 6 characters)"
                />
              </div>
              {/* IMPROVE-021: confirm password field */}
              <div>
                <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-muted/40 border border-border/80 rounded-xl px-4 py-3.5 text-brand-dark font-medium focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow transition-all"
                  placeholder="Re-enter your new password"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => { setShowPasswordModal(false); setPasswordFeedback(null); setNewPassword(''); setConfirmPassword(''); }}>Cancel</Button>
              <Button variant="primary" className="flex-1" onClick={handlePasswordChange} disabled={changingPassword}>
                {changingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto space-y-8 pb-24"
      >
        <motion.div variants={itemVariants}>
          <SectionHeader 
            title={<>{isTeacher ? 'Instructor' : 'Learner'} <span className="highlight-yellow inline-block px-2">Profile</span></>}
            description={isTeacher ? "Manage your instructor account and settings." : "Manage your account, track your progress, and view achievements."}
          />
        </motion.div>
        
        {/* Simplified Educational Profile Card */}
        <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 sm:p-12 shadow-sm border border-border/80 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8 sm:gap-12 hover-card-up">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-yellow/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/30 rounded-full blur-[60px] pointer-events-none" />
          
          <div className="relative group shrink-0">
            {/* BUG-050: onError fallback to initial-based avatar */}
            {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={userName} 
                  className="w-40 h-40 rounded-full object-cover shadow-xl border-4 border-white relative z-10"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
            ) : (
                <div className="w-40 h-40 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-6xl text-brand-dark shadow-xl border-4 border-white relative z-10 uppercase">
                {userInitial}
                </div>
            )}
            {/* BUG-035: Camera button now shows a tooltip instead of doing nothing silently */}
            <button 
              aria-label="Change avatar photo (coming soon)" 
              title="Avatar change coming soon"
              disabled
              className="absolute bottom-2 right-2 w-12 h-12 bg-brand-dark/60 text-white/70 rounded-full flex items-center justify-center shadow-lg cursor-not-allowed z-20"
            >
              <Camera className="w-5 h-5" />
            </button>
            
            {/* Decorative ring */}
            <div className="absolute -inset-4 border-2 border-brand-yellow/30 rounded-full z-0 group-hover:scale-105 transition-transform duration-500 border-dashed animate-spin-slow" />
          </div>

          <div className="flex-1 text-center md:text-left z-10 w-full space-y-6">
            <h1 className="font-heading text-5xl flex items-center justify-center md:justify-start gap-4 capitalize break-words hyphens-auto text-brand-dark">
              {userName}
            </h1>
            
            {!isTeacher && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-medium text-muted-foreground bg-muted/40 p-5 rounded-[24px] border border-border/50">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Student ID</span>
                  <span className="text-brand-dark font-bold text-lg">{rollNumber}</span>
                </div>
                <div className="space-y-1.5 border-l border-border/50 pl-4">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Class</span>
                  <span className="text-brand-dark font-bold text-lg">{studentClass}</span>
                </div>
                <div className="space-y-1.5 sm:border-l border-border/50 sm:pl-4">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Group</span>
                  <span className="text-brand-dark font-bold text-lg">{studentGroup}</span>
                </div>
                <div className="space-y-1.5 border-l border-border/50 pl-4">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Level</span>
                  <span className="text-brand-dark font-bold bg-brand-yellow/30 px-3 py-1 rounded-lg text-sm">{currentLevel}</span>
                </div>
              </div>
            )}
            
            {isTeacher && (
              <div className="bg-muted/40 p-5 rounded-[24px] border border-border/50">
                <span className="text-brand-dark font-bold text-lg">Instructor Account</span>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 pt-2">
              <Button 
                onClick={() => setShowPasswordModal(true)}
                variant="primary" 
                size="lg" 
                className="gap-2"
              >
                <Lock className="w-4 h-4" /> Change Password
              </Button>
              <Button 
                onClick={async () => {
                    await supabase.auth.signOut();
                    router.push('/auth/login');
                }}
                variant="outline" 
                size="lg" 
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>
          </div>
        </motion.div>

        {!isTeacher && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* LRWS Progress Area */}
              <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 shadow-sm border border-border/80 space-y-8 hover-card-up">
                  <div className="flex justify-between items-center pb-6 border-b border-border/50">
                      <h2 className="font-heading text-3xl text-brand-dark">Skill Progress</h2>
                      <div className="text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Overall Score</span>
                          <span className="font-heading text-4xl text-brand-dark">{Math.round(overallScore)}%</span>
                      </div>
                  </div>

                  <div className="space-y-6">
                      {[
                          { label: 'Listening', score: listeningScore, icon: Headphones, color: 'pink' as const, bg: 'bg-pink-100', fill: 'bg-pink-500' },
                          { label: 'Reading', score: readingScore, icon: BookOpen, color: 'blue' as const, bg: 'bg-blue-100', fill: 'bg-blue-500' },
                          { label: 'Writing', score: writingScore, icon: PenTool, color: 'orange' as const, bg: 'bg-orange-100', fill: 'bg-orange-500' },
                          { label: 'Speaking', score: speakingScore, icon: Mic, color: 'purple' as const, bg: 'bg-purple-100', fill: 'bg-purple-500' },
                      ].map((skill, idx) => (
                          <div key={skill.label} className="space-y-3">
                              <div className="flex justify-between items-center text-sm font-bold text-brand-dark">
                                  <span className="flex items-center gap-3">
                                      <IconContainer icon={skill.icon} color={skill.color} size="sm" />
                                      <span className="uppercase tracking-wider">{skill.label}</span>
                                  </span>
                                  <span className="text-lg">{Math.round(skill.score)}%</span>
                              </div>
                              <div className="w-full h-3 bg-muted/40 rounded-full overflow-hidden border border-border/50">
                                  {/* BUG-037: animate from width 0 on mount */}
                                  <motion.div
                                    className={`h-full ${skill.fill} rounded-full`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${skill.score}%` }}
                                    transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                                  />
                              </div>
                          </div>
                      ))}
                  </div>
              </motion.div>

              {/* Achievements Grid */}
              <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 shadow-sm border border-border/80 hover-card-up">
                <div className="flex items-center justify-between pb-6 border-b border-border/50 mb-8">
                    <div className="flex items-center gap-4">
                      <IconContainer icon={Award} color="yellow" size="md" />
                      <h2 className="font-heading text-3xl text-brand-dark">Achievements</h2>
                    </div>
                    <span className="bg-brand-yellow/20 text-brand-dark text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                      {unlockedBadges.length} Unlocked
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {DEFAULT_BADGES.map((badge, i) => {
                    // BUG-039: use badge ID for reliable matching
                    const isUnlocked = unlockedBadges.some((unlockedTitle: string) => 
                      unlockedTitle === badge.id || unlockedTitle.includes(badge.id)
                    );
                    
                    return (
                    <motion.div 
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex flex-col items-center justify-center text-center p-5 rounded-[20px] transition-all relative overflow-hidden group ${isUnlocked ? 'bg-brand-yellow/10 border-2 border-brand-yellow shadow-sm hover:-translate-y-1' : 'bg-muted/30 border border-border/50 grayscale opacity-50'}`}
                    >
                        {isUnlocked && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Sparkles className="w-4 h-4 text-brand-yellow" />
                          </div>
                        )}
                        {/* IMPROVE-022: padlock overlay on locked badges */}
                        {!isUnlocked && (
                          <div className="absolute top-2 right-2">
                            <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
                          </div>
                        )}
                        <div className="text-4xl sm:text-5xl mb-3 drop-shadow-md group-hover:scale-110 transition-transform">{badge.icon}</div>
                        <span className="font-bold text-[10px] sm:text-xs leading-tight text-brand-dark uppercase tracking-wider">{badge.name}</span>
                    </motion.div>
                    )})}
                </div>
              </motion.div>
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
}
