'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Save, 
  CheckCircle, 
  ChevronRight,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { mockAssessments } from '@/lib/teacherMockData';

export default function WritingAssessment() {
  const [submissions, setSubmissions] = useState<any[]>(
    mockAssessments.filter(a => a.type === 'Writing')
  );
  
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(
    submissions.find(s => s.status === 'Pending') || submissions[0] || null
  );

  // Rubric Scores State
  const [grammar, setGrammar] = useState(8);
  const [vocabulary, setVocabulary] = useState(7);
  const [structure, setStructure] = useState(8);
  const [creativity, setCreativity] = useState(7);
  const [spelling, setSpelling] = useState(8);
  
  const [feedback, setFeedback] = useState(selectedSubmission?.feedback || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalScore = grammar + vocabulary + structure + creativity + spelling;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectSubmission = (sub: any) => {
    setSelectedSubmission(sub);
    
    // Reset rubrics
    if (sub.status === 'Graded' && sub.rubricScores) {
      setGrammar(sub.rubricScores.grammar || 8);
      setVocabulary(sub.rubricScores.vocabulary || 8);
      setStructure(sub.rubricScores.sentenceStructure || 8);
      setCreativity(sub.rubricScores.creativity || 8);
      setSpelling(sub.rubricScores.spelling || 8);
      setFeedback(sub.feedback || '');
    } else {
      setGrammar(8);
      setVocabulary(7);
      setStructure(8);
      setCreativity(7);
      setSpelling(8);
      setFeedback('');
    }
  };

  const handleSaveDraft = () => {
    if (!selectedSubmission) return;
    triggerToast('Draft saved successfully! 💾');
  };

  const handleSubmitEvaluation = () => {
    if (!selectedSubmission) return;

    // Update state to Graded
    const updated = submissions.map(s => {
      if (s.id === selectedSubmission.id) {
        return {
          ...s,
          status: 'Graded' as const,
          rubricScores: { grammar, vocabulary, sentenceStructure: structure, creativity, spelling },
          totalScore,
          feedback
        };
      }
      return s;
    });

    setSubmissions(updated);
    setSelectedSubmission({
      ...selectedSubmission,
      status: 'Graded',
      rubricScores: { grammar, vocabulary, sentenceStructure: structure, creativity, spelling },
      totalScore,
      feedback
    });
    
    triggerToast('Writing assessment graded! 🎉');
  };

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
              {submissions.map(sub => {
                const isActive = selectedSubmission?.id === sub.id;
                return (
                  <div 
                    key={sub.id}
                    onClick={() => handleSelectSubmission(sub)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between hover:scale-[1.01] ${
                      isActive 
                        ? 'border-brand-dark bg-brand-dark text-white shadow-md' 
                        : 'border-border/40 hover:bg-muted bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className={`font-bold ${isActive ? 'text-white' : 'text-brand-dark'}`}>{sub.studentName}</p>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{sub.class} • {sub.id}</p>
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        sub.status === 'Graded' 
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
                      {sub.status === 'Graded' && (
                        <span className="font-heading text-sm">{sub.totalScore}/50</span>
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
                  <span className="text-xs font-bold text-brand-dark uppercase tracking-widest bg-brand-yellow/30 px-3 py-1 rounded-full w-fit">Essay Prompt</span>
                  <p className="font-sans font-bold text-base text-brand-dark leading-snug">"{selectedSubmission.prompt}"</p>
                </div>

                {/* Essay Sheet */}
                <div className="bg-[#FAF9F6] border-2 border-brand-dark rounded-[24px] p-6 shadow-md min-h-[400px] relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-brand-yellow rounded-bl-full border-l border-b border-brand-dark opacity-10 pointer-events-none" />
                  
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider pb-3 border-b border-brand-dark/10">Student Submission Response</p>
                    <p className="text-sm font-medium text-brand-dark leading-relaxed whitespace-pre-wrap font-sans">
                      {selectedSubmission.textResponse}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-brand-dark/10 text-right text-xs font-bold text-muted-foreground uppercase">
                    Word Count: {selectedSubmission.textResponse?.split(' ').length || 0} Words
                  </div>
                </div>
              </div>

              {/* Right Column: Grading Form */}
              <div className="bg-white rounded-[32px] p-6 border border-border/40 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-border/40 pb-4">
                  <h3 className="font-heading text-xl">Grading Form</h3>
                  <div className="text-right">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase">Aggregate</p>
                    <p className="font-heading text-2xl text-brand-dark">{totalScore} <span className="text-xs font-bold text-muted-foreground">/ 50</span></p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Grammar Accuracy', value: grammar, setter: setGrammar, desc: 'Usage of proper tenses, prepositions.' },
                    { name: 'Vocabulary Lexicon', value: vocabulary, setter: setVocabulary, desc: 'Advanced and appropriate word choices.' },
                    { name: 'Sentence Cohesion', value: structure, setter: setStructure, desc: 'Proper structuring and flow of sentences.' },
                    { name: 'Creative Arguments', value: creativity, setter: setCreativity, desc: 'Quality of ideas and arguments.' },
                    { name: 'Spelling & Mechanics', value: spelling, setter: setSpelling, desc: 'Punctuation, casing and word spelling.' },
                  ].map(rubric => (
                    <div key={rubric.name} className="space-y-1 p-2.5 bg-muted/40 rounded-xl border border-border/30">
                      <div className="flex justify-between text-xs font-bold text-brand-dark">
                        <span>{rubric.name}</span>
                        <span className="bg-brand-yellow/30 px-2 py-0.5 rounded text-brand-dark">{rubric.value}/10</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        value={rubric.value} 
                        onChange={(e) => rubric.setter(parseInt(e.target.value))}
                        disabled={selectedSubmission.status === 'Graded'}
                        className="w-full accent-brand-dark cursor-pointer disabled:opacity-50"
                      />
                    </div>
                  ))}
                </div>

                {/* Feedback */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">Instructor Written Comments</label>
                  <textarea 
                    placeholder="Provide written suggestions for improvements..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={selectedSubmission.status === 'Graded'}
                    className="w-full bg-muted border border-border/50 rounded-xl p-3 text-xs font-medium outline-none focus:border-brand-yellow transition-all disabled:opacity-70"
                    rows={3}
                  />
                </div>

                {/* Actions */}
                {selectedSubmission.status === 'Pending' && (
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={handleSaveDraft}
                      className="flex-1 bg-muted hover:bg-border/60 text-brand-dark font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border"
                    >
                      <Save className="w-4 h-4" /> Draft
                    </button>
                    <button 
                      onClick={handleSubmitEvaluation}
                      className="flex-[2] bg-brand-dark hover:bg-brand-dark/90 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow"
                    >
                      Grade Essay <ArrowRight className="w-4 h-4" />
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
