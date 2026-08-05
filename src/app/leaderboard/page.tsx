'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Trophy, Medal, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboard } from '@/hooks/use-dashboard';
import { FeatureLocked } from '@/components/feature-locked';

const leaderboard = [
  { rank: 1, name: 'Sarah Jenkins', xp: '12,450', avatar: 'SJ', isCurrentUser: false },
  { rank: 2, name: 'Alex Rodriguez', xp: '11,200', avatar: 'AR', isCurrentUser: false },
  { rank: 3, name: 'Yuki Tanaka', xp: '10,950', avatar: 'YT', isCurrentUser: false },
  { rank: 4, name: 'Michael Chen', xp: '9,800', avatar: 'MC', isCurrentUser: false },
  { rank: 5, name: 'You', xp: '9,450', avatar: 'U', isCurrentUser: true },
  { rank: 6, name: 'Emma Watson', xp: '8,200', avatar: 'EW', isCurrentUser: false },
  { rank: 7, name: 'David Smith', xp: '7,650', avatar: 'DS', isCurrentUser: false },
];

export default function LeaderboardPage() {
  const { data } = useDashboard();
  const isLocked = data?.profile_stage === 1;

  if (isLocked) {
    return (
      <MainLayout>
        <FeatureLocked 
          title="Leaderboard Locked" 
          message="Complete your first assessment to join the league and compete with other learners." 
        />
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="text-center space-y-4 mb-12">
          <div className="w-20 h-20 bg-brand-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-yellow shadow-[0_0_30px_rgba(255,225,124,0.4)]">
            <Trophy className="w-10 h-10 text-brand-dark fill-brand-yellow" />
          </div>
          <h1 className="font-heading text-5xl">Diamond League</h1>
          <p className="text-muted-foreground font-medium text-lg">Top 10 advance to the next league. You are currently in the promotion zone!</p>
        </div>

        <div className="bg-white rounded-[32px] p-4 md:p-8 shadow-xl border border-border/40">
          
          {/* Header row */}
          <div className="flex items-center px-6 py-4 text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
            <div className="w-12 text-center">Rank</div>
            <div className="flex-1 ml-6">Student</div>
            <div className="w-24 text-right">XP</div>
          </div>

          <div className="space-y-3">
            {leaderboard.map((user, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center px-6 py-4 rounded-2xl transition-all ${user.isCurrentUser ? 'bg-brand-dark text-white shadow-lg scale-[1.02]' : 'hover:bg-muted bg-white border border-border/40'}`}
              >
                <div className="w-12 flex justify-center items-center font-heading text-2xl">
                  {user.rank === 1 && <Medal className="w-8 h-8 text-yellow-400 fill-yellow-400" />}
                  {user.rank === 2 && <Medal className="w-8 h-8 text-gray-300 fill-gray-300" />}
                  {user.rank === 3 && <Medal className="w-8 h-8 text-orange-400 fill-orange-400" />}
                  {user.rank > 3 && <span className={user.isCurrentUser ? 'text-white' : 'text-muted-foreground'}>{user.rank}</span>}
                </div>
                
                <div className="flex-1 ml-6 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${user.isCurrentUser ? 'bg-brand-yellow text-brand-dark' : 'bg-muted text-brand-dark border border-border'}`}>
                    {user.avatar}
                  </div>
                  <span className={`font-bold text-lg ${user.isCurrentUser ? 'text-white' : 'text-brand-dark'}`}>
                    {user.name}
                  </span>
                </div>
                
                <div className="w-24 text-right flex items-center justify-end gap-1 font-bold text-lg">
                  {user.xp}
                  {!user.isCurrentUser && <Star className="w-4 h-4 text-brand-yellow fill-brand-yellow" />}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
