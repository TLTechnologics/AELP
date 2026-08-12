'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  Sparkles,
  Loader2,
  Bot,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useWritingSubmissions, useEvaluateWriting } from '@/hooks/use-teacher';
import { apiClient } from '@/services/api';

interface AIDetectResult {
  ai_percentage: number;
  verdict: string;
  confidence: string;
  indicators: string[];
  human_indicators: string[];
  summary: string;
}

export default function WritingAssessment() {
  const { data: submissions = [], isLoading, refetch } = useWritingSubmissions();
  const evaluateMutation = useEvaluateWriting();
  
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [aiDetectResult, setAiDetectResult] = useState<AIDetectResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showDetectCard, setShowDetectCard] = useState(false);

  const selectedSubmission = submissions.find((s: any) => s.id === selectedSubmissionId) || submissions[0] || null;

  useEffect(() => {
    if (submissions.length > 0 && !selectedSubmissionId) {
      setSelectedSubmissionId(submissions[0].id);
    }
  }, [submissions, selectedSubmissionId]);

  // Reset AI detect result when switching submissions
  useEffect(() => {
    setAiDetectResult(null);
    setShowDetectCard(false);
  }, [selectedSubmissionId]);

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

  const handleAICheck = async () => {
    if (!selectedSubmission) return;
    setIsDetecting(true);
    setAiDetectResult(null);
    setShowDetectCard(true);
    try {
      const response = await apiClient.post('/writing/ai-detect', {
        submission_id: selectedSubmission.id,
      });
      setAiDetectResult(response.data);
    } catch (err: any) {
      // Fallback: send raw content if submission_id fails
      try {
        const fallback = await apiClient.post('/writing/ai-detect', {
          text: selectedSubmission.content,
        });
        setAiDetectResult(fallback.data);
      } catch {
        triggerToast('AI Check failed. Please try again.');
        setShowDetectCard(false);
      }
    } finally {
      setIsDetecting(false);
    }
  };

  const getVerdictStyle = (verdict: string) => {
    if (verdict === 'Human Written') return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', badge: 'bg-green-100 text-green-800', icon: ShieldCheck };
    if (verdict === 'Possibly AI Assisted') return { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    if (verdict === 'Likely AI-generated') return { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800', icon: ShieldAlert };
    return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', badge: 'bg-red-100 text-red-800', icon: XCircle };
  };

  const getScoreColor = (pct: number) => {
    if (pct <= 30) return '#16a34a'; // green
    if (pct <= 60) return '#ca8a04'; // yellow
    if (pct <= 85) return '#ea580c'; // orange
    return '#dc2626'; // red
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
        
        {/* Toast Notification */}
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading break-words uppercase">
            Writing <span className="highlight-yellow inline-block px-2">Evaluations</span>
          </h1>
        </div>

        {/* Main Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Submissions Sidebar */}
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
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Left Column: Student Answer */}
                <div className="space-y-6">
                  {/* Submission Details */}
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

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 pt-2">
                    {selectedSubmission.status === 'Pending' && (
                      <button 
                        onClick={handleEvaluateAI}
                        disabled={evaluateMutation.isPending}
                        className="flex-1 bg-brand-dark hover:bg-brand-dark/90 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow disabled:opacity-50"
                      >
                        {evaluateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-brand-yellow" />}
                        Evaluate with AI
                      </button>
                    )}

                    {/* AI Check Button — always visible */}
                    <button
                      onClick={handleAICheck}
                      disabled={isDetecting}
                      className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md disabled:opacity-50"
                    >
                      {isDetecting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                      ) : (
                        <><Bot className="w-4 h-4" /> AI Check</>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Detection Result Card */}
              <AnimatePresence>
                {showDetectCard && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.97 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="bg-white rounded-[32px] p-6 border border-border/40 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-heading text-lg leading-none">AI Content Detection</h3>
                          <p className="text-xs text-muted-foreground font-medium">Powered by Llama 3.3 70B</p>
                        </div>
                      </div>
                      {aiDetectResult && (
                        <button
                          onClick={() => setShowDetectCard(false)}
                          className="text-xs text-muted-foreground hover:text-brand-dark transition-colors"
                        >
                          ✕ Close
                        </button>
                      )}
                    </div>

                    {isDetecting ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
                        <p className="text-sm font-medium text-muted-foreground">Analyzing essay for AI patterns...</p>
                      </div>
                    ) : aiDetectResult ? (
                      <div className="space-y-5">
                        {/* Score Row */}
                        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border-2 ${getVerdictStyle(aiDetectResult.verdict).bg} ${getVerdictStyle(aiDetectResult.verdict).border}`}>
                          {/* Circular Score */}
                          <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 flex-shrink-0">
                              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                                <motion.circle
                                  cx="40" cy="40" r="32"
                                  fill="none"
                                  stroke={getScoreColor(aiDetectResult.ai_percentage)}
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                  strokeDasharray={`${2 * Math.PI * 32}`}
                                  initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                                  animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - aiDetectResult.ai_percentage / 100) }}
                                  transition={{ duration: 1.2, ease: 'easeOut' }}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="font-heading text-xl" style={{ color: getScoreColor(aiDetectResult.ai_percentage) }}>
                                  {aiDetectResult.ai_percentage}%
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">AI Content Score</p>
                              <span className={`inline-flex items-center gap-1.5 font-bold text-sm px-3 py-1 rounded-full ${getVerdictStyle(aiDetectResult.verdict).badge}`}>
                                {(() => { const Icon = getVerdictStyle(aiDetectResult.verdict).icon; return <Icon className="w-4 h-4" />; })()}
                                {aiDetectResult.verdict}
                              </span>
                            </div>
                          </div>

                          {/* Confidence */}
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Detection Confidence</p>
                            <p className={`font-heading text-2xl ${getVerdictStyle(aiDetectResult.verdict).text}`}>
                              {aiDetectResult.confidence}
                            </p>
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-muted/40 rounded-2xl p-4 border border-border/30">
                          <p className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Analysis Summary</p>
                          <p className="text-sm font-medium text-brand-dark leading-relaxed">{aiDetectResult.summary}</p>
                        </div>

                        {/* Indicators Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {aiDetectResult.indicators.length > 0 && (
                            <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                              <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5" /> AI Indicators
                              </p>
                              <ul className="space-y-1.5">
                                {aiDetectResult.indicators.map((ind, i) => (
                                  <li key={i} className="text-xs text-red-800 font-medium flex items-start gap-1.5">
                                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                    {ind}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {aiDetectResult.human_indicators.length > 0 && (
                            <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                              <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" /> Human Indicators
                              </p>
                              <ul className="space-y-1.5">
                                {aiDetectResult.human_indicators.map((ind, i) => (
                                  <li key={i} className="text-xs text-green-800 font-medium flex items-start gap-1.5">
                                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                    {ind}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <p className="text-[10px] text-muted-foreground text-center font-medium">
                          ⚠️ AI detection results are indicative, not definitive. Use as one signal among others.
                        </p>
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
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
