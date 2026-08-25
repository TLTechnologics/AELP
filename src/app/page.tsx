'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { LiquidLoader } from '@/components/ui/liquid-loader';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useDashboard } from '@/hooks/use-dashboard';
import { 
  Play, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Clock, 
  ArrowRight,
  Mic,
  AlertCircle,
  Lock,
  Trophy,
  PenTool
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { IconContainer } from '@/components/ui/icon-container';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading, isError } = useDashboard();

  if (authLoading || isLoading) {
    return <LiquidLoader isLooping={true} />;
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-muted flex-col gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-xl font-heading text-brand-dark">Cannot connect to the server</p>
        <p className="text-sm text-muted-foreground">Please make sure NEXT_PUBLIC_API_URL is correct and the backend is running.</p>
        <Button onClick={() => window.location.reload()} variant="primary">Retry</Button>
      </div>
    );
  }

  return (
    <MainLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-12"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants}>
          <SectionHeader 
            title={<>Time to <span className="highlight-yellow inline-block px-2">Level Up</span></>}
            description={`Welcome back, ${user?.user_metadata?.full_name || data?.student_name || 'Student'}! 👋`}
          >
            {data?.profile_stage === 1 ? (
              <Button onClick={() => router.push('/assessment')} variant="secondary">
                Start First Assessment <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button onClick={() => router.push('/lesson')} variant="primary">
                Continue Learning <Play className="w-5 h-5 fill-white ml-2" />
              </Button>
            )}
          </SectionHeader>
        </motion.div>
        
        {/* Progressive Unlocking Banner */}
        <motion.div variants={itemVariants} className="bg-brand-dark text-white rounded-[24px] p-6 shadow-md flex items-center justify-between gap-6 hover-card-up">
          <div className="flex items-center gap-6">
            <IconContainer 
              icon={data?.profile_stage === 4 ? Trophy : Lock} 
              color="yellow" 
              size="lg" 
              className="bg-brand-yellow text-brand-dark" 
            />
            <div>
              <h3 className="font-heading text-2xl sm:text-3xl mb-1">
                {data?.profile_stage === 1 && "Start Your Journey"}
                {data?.profile_stage === 2 && "Personalized Journey Started"}
                {data?.profile_stage === 3 && "Advanced Profile Upgraded"}
                {data?.profile_stage === 4 && "Congratulations!"}
              </h3>
              <p className="text-white/80 text-sm font-medium leading-relaxed max-w-xl">
                {data?.profile_stage === 1 && "Complete your first assessment to begin your personalized English learning journey."}
                {data?.profile_stage === 2 && "Complete both Reading and Writing assessments to receive a more accurate learning plan."}
                {data?.profile_stage === 3 && "Your personalized learning plan has been upgraded based on multiple assessments. Complete Speaking next!"}
                {data?.profile_stage === 4 && "Your complete English profile is now available."}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end shrink-0 pl-6 border-l border-white/20">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-yellow mb-2">Profile Completion</span>
            <span className="text-4xl font-heading text-white">{data?.profile_completeness || 0}%</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Overall Progress', value: `${data?.overall_progress || 0}%`, sub: `Level: ${data?.latest_cefr_level || 'A1'}`, icon: Target, color: 'blue' as const },
            { label: 'Avg Score', value: `${data?.average_score || 0}%`, sub: 'Across tests', icon: TrendingUp, color: 'green' as const },
            { label: 'Assessments', value: data?.completed_assessments || 0, sub: 'Completed', icon: Clock, color: 'orange' as const },
            { label: 'Recent Activity', value: data?.recent_activity?.length || 0, sub: 'Last 7 days', icon: BookOpen, color: 'pink' as const },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-[24px] p-6 shadow-sm border border-border/80 hover-card-up relative overflow-hidden group">
              <IconContainer icon={stat.icon} color={stat.color} size="md" className="mb-4" />
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-2">{stat.label}</p>
              <h3 className="font-heading text-4xl text-brand-dark mb-1">{stat.value}</h3>
              <p className="text-xs text-muted-foreground font-medium">{stat.sub}</p>
            </div>
          ))}
        </motion.div>

        {/* Learning Path & Weak Skills */}
        {data?.profile_stage === 1 ? (
          <motion.div variants={itemVariants}>
            <EmptyState 
              icon={Lock}
              iconColor="muted"
              title="Feature Locked"
              description="Your personalized Learning Path and Weak Skills analysis will appear here after you complete your first assessment."
              actionLabel="Start First Assessment"
              onAction={() => router.push('/assessment')}
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Personalized Path */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              <h3 className="font-heading text-3xl uppercase text-brand-dark">Your Learning Path</h3>
              
              <div className="space-y-4">
                {data?.recommended_lessons?.length > 0 ? (
                  data.recommended_lessons.map((lesson: any, i: number) => {
                    let Icon = BookOpen;
                    let color: 'blue' | 'orange' | 'purple' = 'blue';
                    if (lesson.title?.toLowerCase().includes('writ')) {
                      Icon = PenTool;
                      color = 'orange';
                    } else if (lesson.title?.toLowerCase().includes('speak')) {
                      Icon = Mic;
                      color = 'purple';
                    }

                    return (
                      <div key={i} className="bg-white rounded-[24px] p-5 border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover-card-up shadow-sm group">
                        <div className="flex items-start sm:items-center gap-5 w-full">
                          <IconContainer icon={Icon} color={color} size="lg" />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded-md">{lesson.difficulty || 'All Levels'}</span>
                              {lesson.priority === 'HIGH' && (
                                <span className="text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2 py-1 rounded-md">High Priority</span>
                              )}
                            </div>
                            <h4 className="text-lg font-bold text-brand-dark mb-1 group-hover:text-brand-yellow transition-colors">{lesson.title}</h4>
                            {lesson.reason && (
                              <div className="text-sm text-muted-foreground flex gap-1.5 items-start">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span className="line-clamp-2">{lesson.reason}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => router.push(`/lesson?id=${lesson.id || 1}`)}
                          variant="secondary"
                          size="icon"
                          className="shrink-0 sm:w-14 sm:h-14 bg-brand-yellow hover:scale-110 shadow-md"
                        >
                          <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-brand-dark text-brand-dark" />
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <EmptyState 
                    icon={Target}
                    iconColor="green"
                    title="All Caught Up!"
                    description="You have completed all recommended lessons. Keep up the great work and take another assessment."
                  />
                )}
              </div>
            </motion.div>

            {/* Weak Skills */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="font-heading text-3xl uppercase text-brand-dark">Weak Skills</h3>
              <div className="bg-white rounded-[24px] p-6 border border-border/80 shadow-sm space-y-4 max-h-[500px] overflow-y-auto">
                {data?.weak_skills?.length > 0 ? (
                  data.weak_skills.map((skill: any, i: number) => (
                    <div key={i} className="flex flex-col gap-3 p-4 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-base text-brand-dark">{skill.skill}</span>
                        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${skill.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {skill.priority}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground font-medium">
                        <span>Latest Score</span>
                        <span className="text-brand-dark">{Math.round(skill.score)}%</span>
                      </div>
                      <div className="h-2 w-full bg-border rounded-full overflow-hidden mt-1">
                        <div className={`h-full rounded-full transition-all duration-1000 ${skill.priority === 'HIGH' ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(Math.max(skill.score, 5), 100)}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                    <IconContainer icon={Target} color="muted" size="lg" className="mb-4 opacity-50" />
                    <p className="text-sm font-medium max-w-[200px]">Complete more assessments to analyze your weak skills.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
}
