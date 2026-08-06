import os

content = """'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Save, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useWritingSubmissions, useEvaluateWriting } from '@/hooks/use-teacher';

export default function WritingAssessment() {
  const { data: submissions = [], isLoading, refetch } = useWritingSubmissions();
  const evaluateMutation = useEvaluateWriting();
  
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedSubmission = submissions.find((s: any) => s.id === selectedSubmissionId) || submissions[0] || null;

  useEffect(() => {
    if (submissions.length > 0 && !selectedSubmissionId) {
      setSelectedSubmissionId(submissions[0].id);
    }
  }, [submissions, selectedSubmissionId]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleEvaluateAI = async () => {
    if (!selectedSubmission) return;
    try {
      await evaluateMutation.mutateAsync(selectedSubmission.id);
      triggerToast('AI Evaluation completed! 🎉');
      refetch();
    } catch (error) {
      triggerToast('Evaluation failed.');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-10 h-10 animate-spin text-brand-dark" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8 pb-20 relative">
        
        {/* Toast Notification Container */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-24 right-8 bg-brand-dark text-white font-bold text-sm px-6 py-4 rounded-2xl shadow-2xl border border-brand-yellow/30 z-[100] flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5 text-brand-yellow" />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Row */}
        <div>
          <h2 className="text-xl text-muted-foreground font-medium mb-1">Interactive Essay Grading Terminal</h2>
          <h1 className="text-5xl md:text-6xl font-heading uppercase">
            Writing <span className="highlight-yellow inline-block px-2">Evaluations</span>
          </h1>
        </div>

        {/* Main Work Area split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Submissions Sidebar List */}
          <div className="bg-white rounded-[32px] p-6 border border-border/40 shadow-sm space-y-6 h-[680px] flex flex-col">
            <h3 className="font-heading text-2xl">Writing Submissions</h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {submissions.map((sub: any) => {
                const isActive = selectedSubmission?.id === sub.id;
                return (
                  <div 
                    key={sub.id}
                    onClick={() => setSelectedSubmissionId(sub.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between hover:scale-[1.01] ${
                      isActive 
                        ? 'border-brand-dark bg-brand-dark text-white shadow-md' 
                        : 'border-border/40 hover:bg-muted bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className={`font-bold ${isActive ? 'text-white' : 'text-brand-dark'}`}>{sub.studentName}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">{sub.class} • {sub.rollNumber}</p>
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        sub.status === 'Evaluated' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {sub.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/10">
                      <span className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> Written Essay
                      </span>
                      {sub.status === 'Evaluated' && (
                        <span className="font-heading text-sm">{sub.evaluation?.overall || 0}/100</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Evaluation Panel */}
          {selectedSubmission ? (
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Left Column: Student Answer */}
              <div className="space-y-6">
                {/* Prompt Header */}
                <div className="bg-white rounded-[24px] p-6 border border-border/40 shadow-sm space-y-3">
                  <span className="text-xs font-bold text-brand-dark uppercase tracking-widest bg-brand-yellow/30 px-3 py-1 rounded-full w-fit">Submission Details</span>
                  <p className="text-sm font-medium text-muted-foreground">Submitted At: {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                </div>

                {/* Essay Sheet */}
                <div className="bg-[#FAF9F6] border-2 border-brand-dark rounded-[24px] p-6 shadow-md min-h-[400px] relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-brand-yellow rounded-bl-full border-l border-b border-brand-dark opacity-10 pointer-events-none" />
                  
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider pb-3 border-b border-brand-dark/10">Student Submission Response</p>
                    <p className="text-sm font-medium text-brand-dark leading-relaxed whitespace-pre-wrap font-sans">
                      {selectedSubmission.content}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-brand-dark/10 text-right text-xs font-bold text-muted-foreground uppercase">
                    Word Count: {selectedSubmission.wordCount} Words
                  </div>
                </div>
              </div>

              {/* Right Column: Grading Form */}
              <div className="bg-white rounded-[32px] p-6 border border-border/40 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-border/40 pb-4">
                  <h3 className="font-heading text-xl">AI Evaluation Form</h3>
                  <div className="text-right">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase">Aggregate</p>
                    <p className="font-heading text-2xl text-brand-dark">{selectedSubmission.evaluation?.overall || 0} <span className="text-xs font-bold text-muted-foreground">/ 100</span></p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Grammar Accuracy', value: selectedSubmission.evaluation?.grammar || 0 },
                    { name: 'Vocabulary Lexicon', value: selectedSubmission.evaluation?.vocabulary || 0 },
                    { name: 'Sentence Cohesion', value: selectedSubmission.evaluation?.coherence || 0 },
                  ].map(rubric => (
                    <div key={rubric.name} className="space-y-1 p-2.5 bg-muted/40 rounded-xl border border-border/30">
                      <div className="flex justify-between text-xs font-bold text-brand-dark">
                        <span>{rubric.name}</span>
                        <span className="bg-brand-yellow/30 px-2 py-0.5 rounded text-brand-dark">{rubric.value}/100</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={rubric.value} 
                        readOnly
                        className="w-full accent-brand-dark cursor-not-allowed opacity-70"
                      />
                    </div>
                  ))}
                </div>

                {/* Feedback */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">AI Written Comments</label>
                  <textarea 
                    value={selectedSubmission.evaluation?.feedback || 'Pending AI evaluation...'}
                    readOnly
                    className="w-full bg-muted border border-border/50 rounded-xl p-3 text-xs font-medium outline-none transition-all opacity-70"
                    rows={4}
                  />
                </div>
                
                {selectedSubmission.evaluation && selectedSubmission.evaluation.strengths && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-green-700 uppercase tracking-wider">Weaknesses Found</label>
                    <div className="flex flex-wrap gap-2">
                        {selectedSubmission.evaluation.strengths.map((s: string, i: number) => (
                            <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">{s}</span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedSubmission.status === 'Pending' && (
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={handleEvaluateAI}
                      disabled={evaluateMutation.isPending}
                      className="flex-1 bg-brand-dark hover:bg-brand-dark/90 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow disabled:opacity-50"
                    >
                      {evaluateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-brand-yellow" />}
                      Evaluate with AI
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-border/40 shadow-sm flex items-center justify-center min-h-[500px]">
              <p className="text-muted-foreground font-medium">Select a writing submission to begin grading.</p>
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}
"""
with open(r"src\app\teacher\writing\page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated writing page!")
