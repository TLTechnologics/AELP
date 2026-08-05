'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { resultsService } from '@/services/api';
import { 
  ArrowLeft,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  Play,
  BookOpen,
  PenTool,
  Mic
} from 'lucide-react';
import React from 'react';
import { LiquidLoader } from '@/components/ui/liquid-loader';
import { useDashboard } from '@/hooks/use-dashboard';
import { FeatureLocked } from '@/components/feature-locked';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ResultDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { data: dashboardData } = useDashboard();

  const isLocked = dashboardData?.profile_stage === 1;

  if (isLocked) {
    return (
      <MainLayout>
        <FeatureLocked 
          title="Assessment Results Locked" 
          message="Complete your first assessment to view detailed AI feedback and reports." 
        />
      </MainLayout>
    );
  }

  const { data, isLoading } = useQuery({
    queryKey: ['resultDetails', id],
    queryFn: async () => {
      const res = await resultsService.getResultDetails(id);
      return res.data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return <LiquidLoader isLooping={true} />;
  }

  if (!data) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-heading mb-4">Result Not Found</h2>
          <button onClick={() => router.push('/results')} className="text-brand-dark underline font-medium">
            Back to Results
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-24 max-w-5xl mx-auto">
        
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/results')}
            className="w-10 h-10 bg-white border border-border/40 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{data.type}</span>
              <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                {new Date(data.date).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-3xl font-heading uppercase">{data.title}</h1>
          </div>
        </motion.div>

        {/* Top Summary Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-[24px] p-6 border border-border/40 text-center">
            <p className="text-muted-foreground text-sm font-medium mb-1">Score</p>
            <h3 className="text-4xl font-heading text-brand-dark">{Math.round(data.percentage || 0)}%</h3>
          </div>
          <div className="bg-white rounded-[24px] p-6 border border-border/40 text-center">
            <p className="text-muted-foreground text-sm font-medium mb-1">Points</p>
            <h3 className="text-4xl font-heading text-brand-info">{data.score || 0}</h3>
          </div>
          <div className="bg-white rounded-[24px] p-6 border border-border/40 text-center">
            <p className="text-muted-foreground text-sm font-medium mb-1">Duration</p>
            <h3 className="text-4xl font-heading text-brand-warning">{data.time_taken || 0}s</h3>
          </div>
          <div className="bg-white rounded-[24px] p-6 border border-border/40 text-center">
            <p className="text-muted-foreground text-sm font-medium mb-1">Status</p>
            <h3 className="text-2xl font-heading text-brand-success mt-2">Completed</h3>
          </div>
        </motion.div>

        {/* Dynamic Report Content */}
        <motion.div variants={itemVariants}>
          {data.type === 'reading' && data.reading_report && <ReadingReport report={data.reading_report} />}
          {data.type === 'writing' && data.writing_report && <WritingReport report={data.writing_report} />}
          {data.type === 'speaking' && data.speaking_report && <SpeakingReport report={data.speaking_report} />}
        </motion.div>

      </motion.div>
    </MainLayout>
  );
}

// ---------------------------------------------------------
// Sub-components for specific reports
// ---------------------------------------------------------

function ReadingReport({ report }: { report: any }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[24px] p-6 border border-border/40">
          <h3 className="text-xl font-heading mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-info" /> Performance
          </h3>
          <div className="flex gap-8 justify-center items-center py-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Correct</p>
              <p className="text-3xl font-heading text-brand-success">{report.correct_answers}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Incorrect</p>
              <p className="text-3xl font-heading text-brand-danger">{report.incorrect_answers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[24px] p-6 border border-border/40">
          <h3 className="text-xl font-heading mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-warning" /> Weak Topics & Lessons
          </h3>
          <div className="space-y-3">
            {report.weak_topics?.length > 0 ? (
              report.weak_topics.map((t: string, i: number) => (
                <div key={i} className="px-3 py-1.5 bg-red-50 text-red-700 text-sm font-medium rounded-lg inline-block mr-2 mb-2">
                  {t}
                </div>
              ))
            ) : <p className="text-sm text-muted-foreground">None identified!</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-6 border border-border/40">
        <h3 className="text-xl font-heading mb-6">Question by Question Review</h3>
        <div className="space-y-4">
          {report.questions_review?.map((q: any, i: number) => (
            <div key={i} className={`p-4 rounded-xl border ${q.is_correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {q.is_correct ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-brand-dark mb-2">{q.question}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs font-bold uppercase mb-1">Your Answer</p>
                      <p className={`font-medium ${q.is_correct ? 'text-green-700' : 'text-red-700'}`}>{q.student_answer || '-'}</p>
                    </div>
                    {!q.is_correct && (
                      <div>
                        <p className="text-muted-foreground text-xs font-bold uppercase mb-1">Correct Answer</p>
                        <p className="font-medium text-green-700">{q.correct_answer || '-'}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold bg-white px-2 py-1 rounded-md shadow-sm border border-border/40">
                    {q.marks_awarded} / {q.total_marks} pts
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WritingReport({ report }: { report: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[24px] p-6 border border-border/40">
        <h3 className="text-xl font-heading mb-2">Essay: {report.essay_topic}</h3>
        <div className="p-4 bg-muted/30 rounded-xl mt-4">
          <p className="whitespace-pre-wrap text-brand-dark leading-relaxed">{report.student_essay}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[24px] p-6 border border-border/40">
          <h3 className="text-xl font-heading mb-4 text-brand-info">Scores</h3>
          <div className="space-y-4">
            {[
              { label: 'Grammar', value: report.grammar },
              { label: 'Vocabulary', value: report.vocabulary },
              { label: 'Sentence Structure', value: report.sentence_structure },
              { label: 'Coherence', value: report.coherence },
              { label: 'Relevance', value: report.relevance },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>{s.label}</span>
                  <span>{s.value}/10</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-brand-info rounded-full" style={{ width: `${(s.value / 10) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 border border-border/40 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-heading mb-4 text-brand-success">Feedback</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {report.feedback}
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Estimated Level</p>
              <p className="text-2xl font-heading text-brand-dark">{report.cefr_level || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpeakingReport({ report }: { report: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[24px] p-6 border border-border/40 flex flex-col items-center text-center">
        <h3 className="text-xl font-heading mb-4">Audio Playback</h3>
        {report.audio_url ? (
          <audio controls className="w-full max-w-md mt-2">
            <source src={report.audio_url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        ) : (
          <p className="text-muted-foreground text-sm">No audio available.</p>
        )}
      </div>

      <div className="bg-white rounded-[24px] p-6 border border-border/40">
        <h3 className="text-xl font-heading mb-2">Transcript</h3>
        <div className="p-4 bg-muted/30 rounded-xl mt-4 max-h-[200px] overflow-y-auto">
          <p className="text-brand-dark leading-relaxed italic">"{report.transcript}"</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[24px] p-6 border border-border/40">
          <h3 className="text-xl font-heading mb-4 text-brand-purple">Scores</h3>
          <div className="space-y-4">
            {[
              { label: 'Pronunciation', value: report.pronunciation },
              { label: 'Fluency', value: report.fluency },
              { label: 'Grammar', value: report.grammar },
              { label: 'Vocabulary', value: report.vocabulary },
              { label: 'Coherence', value: report.coherence },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>{s.label}</span>
                  <span>{s.value}/10</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(s.value / 10) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 border border-border/40">
          <h3 className="text-xl font-heading mb-4 text-brand-success">Feedback</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {report.feedback}
          </p>

          <div className="space-y-4">
            {report.strengths?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase text-green-700 mb-2">Strengths</p>
                <div className="flex flex-wrap gap-2">
                  {report.strengths.map((s: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {report.weaknesses?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase text-red-700 mb-2">Areas to Improve</p>
                <div className="flex flex-wrap gap-2">
                  {report.weaknesses.map((w: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md">{w}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
