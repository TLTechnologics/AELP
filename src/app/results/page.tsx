'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { resultsService } from '@/services/api';
import { LiquidLoader } from '@/components/ui/liquid-loader';
import { useDashboard } from '@/hooks/use-dashboard';
import { FeatureLocked } from '@/components/feature-locked';
import { useState } from 'react';
import { 
  Target, 
  Search,
  ArrowRight,
  BookOpen,
  PenTool,
  Mic,
  Calendar
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { IconContainer } from '@/components/ui/icon-container';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export default function ResultsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [type, setType] = useState('all');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['results', page, type, sort, search],
    queryFn: async () => {
      const res = await resultsService.getResults({ page, limit: 20, type, sort, search });
      return res.data;
    }
  });

  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();

  const isLocked = dashboardData?.profile_stage === 1;

  if (isLocked) {
    return (
      <MainLayout>
        <FeatureLocked 
          title="Results Locked" 
          message="Complete your first assessment to unlock detailed performance reports." 
        />
      </MainLayout>
    );
  }

  const getIconInfo = (assessmentType: string) => {
    switch (assessmentType) {
      case 'writing': return { icon: PenTool, color: 'orange' as const };
      case 'speaking': return { icon: Mic, color: 'purple' as const };
      case 'reading': default: return { icon: BookOpen, color: 'blue' as const };
    }
  };

  return (
    <MainLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 pb-24"
      >
        <motion.div variants={itemVariants}>
          <SectionHeader 
            title={<>Assessment <span className="highlight-yellow inline-block px-2">History</span></>}
            description="Track your progress and review detailed reports for past assessments."
          />
        </motion.div>

        {/* Filters and Search */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-[24px] border border-border/80 shadow-sm hover-card-up">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by title or topic..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-muted/40 border border-border/50 rounded-xl focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 outline-none transition-all text-sm font-medium"
            />
          </div>
          <div className="flex gap-4">
            <select 
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="px-4 py-3 bg-muted/40 border border-border/50 rounded-xl outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 cursor-pointer text-sm font-bold uppercase tracking-wider text-brand-dark"
            >
              <option value="all">All Types</option>
              <option value="reading">Reading</option>
              <option value="writing">Writing</option>
              <option value="speaking">Speaking</option>
            </select>
            <select 
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-4 py-3 bg-muted/40 border border-border/50 rounded-xl outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 cursor-pointer text-sm font-bold uppercase tracking-wider text-brand-dark"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Score</option>
              <option value="lowest">Lowest Score</option>
            </select>
          </div>
        </motion.div>

        {/* Results List */}
        <motion.div variants={itemVariants} className="space-y-4">
          {isLoading ? (
            <LiquidLoader isLooping={true} />
          ) : data?.items?.length > 0 ? (
            data.items.map((item: any) => {
              const { icon, color } = getIconInfo(item.type);
              return (
                <div key={item.id} className="bg-white rounded-[24px] p-5 border border-border/80 hover:border-brand-yellow shadow-sm hover-card-up transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group cursor-pointer" onClick={() => router.push(`/results/${item.id}`)}>
                  <div className="flex items-center gap-5">
                    <IconContainer icon={icon} color={color} size="lg" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.type}</span>
                        <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-md text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(item.date).toLocaleDateString()}
                        </span>
                        {item.cefr_level && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-yellow/20 text-brand-dark px-2 py-0.5 rounded-md">
                            {item.cefr_level}
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-brand-dark group-hover:text-brand-yellow transition-colors">{item.title}</h4>
                      {item.topic && <p className="text-sm text-muted-foreground font-medium">{item.topic}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right border-r border-border/50 pr-6">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Score</p>
                      <p className="text-2xl font-heading text-brand-dark">{Math.round(item.percentage || 0)}%</p>
                    </div>
                    
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/results/${item.id}`);
                      }}
                      variant="outline"
                    >
                      View Report <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState 
              icon={Target}
              iconColor="muted"
              title="No Assessment History"
              description="You haven't completed any assessments matching these filters."
              actionLabel="Start an Assessment"
              onAction={() => router.push('/lesson')}
            />
          )}
        </motion.div>

        {/* Pagination */}
        {data?.pages > 1 && (
          <motion.div variants={itemVariants} className="flex justify-center items-center gap-4 mt-8 bg-white w-fit mx-auto p-2 rounded-[20px] shadow-sm border border-border/80">
            <Button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="ghost"
              size="sm"
            >
              Previous
            </Button>
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-2">
              Page {page} of {data.pages}
            </span>
            <Button 
              onClick={() => setPage(p => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              variant="ghost"
              size="sm"
            >
              Next
            </Button>
          </motion.div>
        )}
      </motion.div>
    </MainLayout>
  );
}
