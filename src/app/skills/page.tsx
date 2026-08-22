'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Headphones, BookOpen, PenTool, Mic, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useDashboard } from '@/hooks/use-dashboard';
import { FeatureLocked } from '@/components/feature-locked';
import { LiquidLoader } from '@/components/ui/liquid-loader';
import { SectionHeader } from '@/components/ui/section-header';
import { IconContainer } from '@/components/ui/icon-container';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

const ALL_SKILLS_CONFIG = {
  listening: { id: 'listening', title: 'Listening', icon: Headphones, color: 'pink' as const, bg: 'bg-pink-100', fill: 'bg-pink-500' },
  reading: { id: 'reading', title: 'Reading', icon: BookOpen, color: 'blue' as const, bg: 'bg-blue-100', fill: 'bg-blue-500' },
  writing: { id: 'writing', title: 'Writing', icon: PenTool, color: 'orange' as const, bg: 'bg-orange-100', fill: 'bg-orange-500' },
  speaking: { id: 'speaking', title: 'Speaking', icon: Mic, color: 'purple' as const, bg: 'bg-purple-100', fill: 'bg-purple-500' }
};

function getClassification(score: number) {
  if (score >= 80) return { label: 'Strong', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  if (score >= 60) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
  if (score >= 40) return { label: 'Needs Improvement', color: 'text-orange-600', bg: 'bg-orange-50' };
  return { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50' };
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

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

  const rawScores = {
    listening: data?.listening_avg || 0,
    reading: data?.reading_avg || 0,
    writing: data?.writing_avg || 0,
    speaking: data?.speaking_avg || 0
  };

  const weakSkills = Object.entries(rawScores)
    .filter(([_, score]) => score < 80)
    .map(([key, score]) => {
        const config = ALL_SKILLS_CONFIG[key as keyof typeof ALL_SKILLS_CONFIG];
        const classification = getClassification(score);
        
        const totalLessons = 10;
        const completedLessons = Math.floor((score / 100) * totalLessons);
        
        return {
            ...config,
            score: Math.round(score),
            classification,
            totalLessons,
            completedLessons,
            remainingLessons: totalLessons - completedLessons,
            estimatedTime: (totalLessons - completedLessons) * 15
        };
    });

  return (
    <MainLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-12 pb-24"
      >
        <motion.div variants={itemVariants}>
          <SectionHeader 
            title={<>Adaptive <span className="highlight-yellow inline-block px-2">Skill Plan</span></>}
            description="Based on your latest assessments, we've dynamically generated a learning path specifically targeting your weak areas."
          />
        </motion.div>

        {weakSkills.length === 0 ? (
          <motion.div variants={itemVariants}>
            <EmptyState 
              icon={CheckCircle2}
              iconColor="green"
              title="You're All Caught Up!"
              description="You have scored over 80% in all domains. Keep taking advanced assessments to maintain your streak."
              actionLabel="Take Assessment"
              onAction={() => window.location.href = '/assessment'}
            />
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {weakSkills.map((skill, i) => (
              <motion.div 
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link 
                  href={`/skills/${skill.id}`}
                  className="group flex flex-col h-full bg-white rounded-[32px] p-8 shadow-sm border border-border/80 hover-card-up transition-all relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-48 h-48 rounded-full ${skill.bg} opacity-20 blur-3xl group-hover:scale-150 transition-transform duration-700`} />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-5">
                            <IconContainer icon={skill.icon} color={skill.color} size="lg" />
                            <div>
                                <h2 className="font-heading text-3xl group-hover:text-brand-dark transition-colors">{skill.title}</h2>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md mt-1 inline-block ${skill.classification.bg} ${skill.classification.color}`}>
                                    {skill.classification.label}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Score</span>
                            <span className="font-heading text-4xl text-brand-dark">{skill.score}%</span>
                        </div>
                    </div>
                    
                    <div className="space-y-6 mb-8">
                        <div>
                            <div className="flex justify-between text-xs font-bold text-muted-foreground mb-2">
                                <span>Module Progress</span>
                                <span>{skill.completedLessons} / {skill.totalLessons} Lessons</span>
                            </div>
                            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full ${skill.fill} rounded-full transition-all duration-1000`} style={{ width: `${(skill.completedLessons / skill.totalLessons) * 100}%` }} />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="bg-muted/40 rounded-xl p-4 border border-border/50 flex flex-col justify-center">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Remaining</span>
                                <span className="text-brand-dark font-bold">{skill.remainingLessons} Lessons</span>
                            </div>
                            <div className="bg-muted/40 rounded-xl p-4 border border-border/50 flex flex-col justify-center">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Est. Time</span>
                                <span className="text-brand-dark font-bold">{skill.estimatedTime} mins</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-5 border-t border-border/50">
                      <span className="font-bold text-xs tracking-wider uppercase text-muted-foreground">Open Assignments</span>
                      <div className="w-12 h-12 rounded-full bg-brand-dark flex items-center justify-center group-hover:bg-brand-yellow group-hover:text-brand-dark text-white transition-all shadow-md group-hover:scale-110">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </MainLayout>
  );
}
