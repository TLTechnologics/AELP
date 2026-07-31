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
  TrendingUp, 
  Clock, 
  Search,
  Filter,
  ArrowRight,
  BookOpen,
  PenTool,
  Mic,
  Calendar
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
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

  const getIcon = (assessmentType: string) => {
    switch (assessmentType) {
      case 'writing': return <PenTool className="w-5 h-5 text-orange-600" />;
      case 'speaking': return <Mic className="w-5 h-5 text-purple-600" />;
      case 'reading': default: return <BookOpen className="w-5 h-5 text-blue-600" />;
    }
  };

  const getColor = (assessmentType: string) => {
    switch (assessmentType) {
      case 'writing': return 'bg-orange-100';
      case 'speaking': return 'bg-purple-100';
      case 'reading': default: return 'bg-blue-100';
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
          <h1 className="text-4xl font-heading uppercase mb-2">Assessment <span className="highlight-yellow inline-block px-2">History</span></h1>
          <p className="text-muted-foreground">Track your progress and review detailed reports for past assessments.</p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-[24px] border border-border/40 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by title or topic..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border-none rounded-xl focus:ring-2 focus:ring-brand-yellow outline-none transition-all"
            />
          </div>
          <div className="flex gap-4">
            <select 
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="px-4 py-2 bg-muted/50 rounded-xl outline-none focus:ring-2 focus:ring-brand-yellow cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="reading">Reading</option>
              <option value="writing">Writing</option>
              <option value="speaking">Speaking</option>
            </select>
            <select 
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-4 py-2 bg-muted/50 rounded-xl outline-none focus:ring-2 focus:ring-brand-yellow cursor-pointer"
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
            data.items.map((item: any) => (
              <div key={item.id} className="bg-white rounded-[24px] p-5 border border-border/40 hover:border-brand-yellow hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getColor(item.type)}`}>
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.type}</span>
                      <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(item.date).toLocaleDateString()}
                      </span>
                      {item.cefr_level && (
                        <span className="text-xs font-bold bg-brand-yellow/20 text-brand-dark px-2 py-0.5 rounded-full">
                          {item.cefr_level}
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-bold">{item.title}</h4>
                    {item.topic && <p className="text-sm text-muted-foreground">{item.topic}</p>}
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground font-medium mb-0.5">Score</p>
                    <p className="text-2xl font-heading">{Math.round(item.percentage || 0)}%</p>
                  </div>
                  
                  <button 
                    onClick={() => router.push(`/results/${item.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-full font-medium hover:bg-brand-dark/90 transition-all hover:gap-3"
                  >
                    View Report <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[32px] border border-border/40">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-10 h-10 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-2xl font-heading mb-2">No Assessment History</h3>
              <p className="text-muted-foreground mb-6">You haven't completed any assessments matching these filters.</p>
              <button 
                onClick={() => router.push('/lesson')}
                className="bg-brand-yellow text-brand-dark px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
              >
                Start an Assessment
              </button>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {data?.pages > 1 && (
          <motion.div variants={itemVariants} className="flex justify-center items-center gap-2 mt-8">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-full border border-border/40 disabled:opacity-50 font-medium hover:bg-muted transition-colors"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-muted-foreground">
              Page {page} of {data.pages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              className="px-4 py-2 rounded-full border border-border/40 disabled:opacity-50 font-medium hover:bg-muted transition-colors"
            >
              Next
            </button>
          </motion.div>
        )}
      </motion.div>
    </MainLayout>
  );
}
