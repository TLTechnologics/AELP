'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Play, 
  Pause, 
  Volume2, 
  User, 
  Save, 
  CheckCircle, 
  Clock, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { mockAssessments } from '@/lib/teacherMockData';

export default function SpeakingAssessment() {
  const [submissions, setSubmissions] = useState<any[]>(
    mockAssessments.filter(a => a.type === 'Speaking')
  );
  
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(
    submissions.find(s => s.status === 'Pending') || submissions[0] || null
  );

  // Rubric Scores State
  const [pronunciation, setPronunciation] = useState(8);
  const [fluency, setFluency] = useState(7);
  const [vocabulary, setVocabulary] = useState(8);
  const [grammar, setGrammar] = useState(7);
  const [confidence, setConfidence] = useState(8);
  
  const [feedback, setFeedback] = useState(selectedSubmission?.feedback || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalScore = pronunciation + fluency + vocabulary + grammar + confidence;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectSubmission = (sub: any) => {
    setSelectedSubmission(sub);
    setIsPlaying(false);
    
    // Reset rubrics
    if (sub.status === 'Graded' && sub.rubricScores) {
      setPronunciation(sub.rubricScores.pronunciation || 8);
      setFluency(sub.rubricScores.fluency || 8);
      setVocabulary(sub.rubricScores.vocabulary || 8);
      setGrammar(sub.rubricScores.grammar || 8);
      setConfidence(sub.rubricScores.confidence || 8);
      setFeedback(sub.feedback || '');
    } else {
      setPronunciation(8);
      setFluency(7);
      setVocabulary(8);
      setGrammar(7);
      setConfidence(8);
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
          rubricScores: { pronunciation, fluency, vocabulary, grammar, confidence },
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
      rubricScores: { pronunciation, fluency, vocabulary, grammar, confidence },
      totalScore,
      feedback
    });
    
    triggerToast('Evaluation submitted successfully! 🎉');
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
          <h2 className="text-xl text-muted-foreground font-medium mb-1">Interactive Speech Evaluation Console</h2>
          <h1 className="text-5xl md:text-6xl font-heading uppercase">
            Speaking <span className="highlight-yellow inline-block px-2">Evaluations</span>
          </h1>
        </div>

        {/* Main Work Area split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Submissions Sidebar List */}
          <div className="bg-white rounded-[32px] p-6 border border-border/40 shadow-sm space-y-6 h-[680px] flex flex-col">
            <h3 className="font-heading text-2xl">Audio Submissions</h3>
            
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
                        <Mic className="w-3.5 h-3.5" /> Speech Audio
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
            <div className="lg:col-span-2 space-y-6">
              
              {/* Media Player Card */}
              <div className="bg-brand-dark text-white rounded-[32px] p-8 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs font-bold text-brand-yellow uppercase tracking-widest bg-white/15 px-3 py-1 rounded-full">Speaking Prompt</span>
                    <p className="font-sans font-bold text-lg text-white mt-2 leading-snug">"{selectedSubmission.prompt}"</p>
                  </div>
                  
                  <div className="bg-white/10 px-4 py-2 rounded-xl text-center shrink-0 border border-white/5">
                    <p className="text-[9px] text-white/50 font-bold uppercase">Student ID</p>
                    <p className="font-heading text-sm text-white">{selectedSubmission.studentId}</p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-6 relative z-10">
                  {/* Wave Visualizer Mock */}
                  <div className="flex items-center justify-center gap-1.5 h-12 w-full">
                    {[...Array(30)].map((_, i) => (
                      <motion.div 
                        key={i}
                        animate={{ 
                          height: isPlaying ? [8, Math.random() * 35 + 15, 8] : 8 
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: isPlaying ? 0.4 + Math.random() * 0.4 : 0 
                        }}
                        className={`w-1.5 rounded-full ${i % 3 === 0 ? 'bg-brand-yellow' : 'bg-white/30'}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-6 w-full max-w-md">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-14 h-14 rounded-full bg-brand-yellow text-brand-dark flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-[0_0_15px_rgba(255,225,124,0.3)] shrink-0"
                    >
                      {isPlaying ? <Pause className="w-6 h-6 fill-brand-dark" /> : <Play className="w-6 h-6 fill-brand-dark ml-0.5" />}
                    </button>
                    
                    <div className="flex-1 bg-white/10 h-2 rounded-full relative overflow-hidden">
                      <div className="absolute left-0 top-0 h-full bg-brand-yellow" style={{ width: isPlaying ? '40%' : '0%' }} />
                    </div>
                    
                    <span className="text-xs font-bold text-white/50">{selectedSubmission.duration || '1:15'}</span>
                  </div>
                </div>
              </div>

              {/* Rubric Evaluator Slider Form */}
              <div className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-border/40 pb-4">
                  <h3 className="font-heading text-2xl">Assessment Rubric</h3>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground font-bold uppercase">Aggregate Grade</p>
                    <p className="font-heading text-3xl text-brand-dark">{totalScore} <span className="text-sm font-bold text-muted-foreground">/ 50</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column Rubrics */}
                  <div className="space-y-5">
                    {[
                      { name: 'Pronunciation', value: pronunciation, setter: setPronunciation, desc: 'Clarity of vowels, consonants, word stress.' },
                      { name: 'Fluency', value: fluency, setter: setFluency, desc: 'Smooth conversational flow, minimal fillers.' },
                      { name: 'Vocabulary', value: vocabulary, setter: setVocabulary, desc: 'Richness and appropriateness of word choice.' },
                    ].map(rubric => (
                      <div key={rubric.name} className="space-y-1.5 p-3 bg-muted/30 rounded-2xl border">
                        <div className="flex justify-between text-xs font-bold text-brand-dark">
                          <span>{rubric.name}</span>
                          <span className="bg-brand-yellow/30 text-brand-dark px-2.5 py-0.5 rounded-lg">{rubric.value} / 10</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="10" 
                          value={rubric.value} 
                          onChange={(e) => rubric.setter(parseInt(e.target.value))}
                          disabled={selectedSubmission.status === 'Graded'}
                          className="w-full accent-brand-dark cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground leading-normal">{rubric.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Right Column Rubrics */}
                  <div className="space-y-5">
                    {[
                      { name: 'Grammar', value: grammar, setter: setGrammar, desc: 'Accuracy in tenses, verb endings, structures.' },
                      { name: 'Confidence', value: confidence, setter: setConfidence, desc: 'Delivery, projection, and communicative ease.' },
                    ].map(rubric => (
                      <div key={rubric.name} className="space-y-1.5 p-3 bg-muted/30 rounded-2xl border">
                        <div className="flex justify-between text-xs font-bold text-brand-dark">
                          <span>{rubric.name}</span>
                          <span className="bg-brand-yellow/30 text-brand-dark px-2.5 py-0.5 rounded-lg">{rubric.value} / 10</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="10" 
                          value={rubric.value} 
                          onChange={(e) => rubric.setter(parseInt(e.target.value))}
                          disabled={selectedSubmission.status === 'Graded'}
                          className="w-full accent-brand-dark cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground leading-normal">{rubric.desc}</p>
                      </div>
                    ))}
                    
                    {/* Extra placeholder info */}
                    <div className="p-4 bg-yellow-50/50 border border-brand-yellow/20 rounded-2xl text-xs text-brand-dark leading-relaxed font-medium">
                      ⚠️ Adjusting values instantly re-calculates the student overall CEFR level assessment index.
                    </div>
                  </div>
                </div>

                {/* Feedback Textbox */}
                <div className="space-y-2 pt-4 border-t border-border/40">
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">Instructor Written Feedback</label>
                  <textarea 
                    placeholder="Provide constructive feedback, noting strong areas and specific pronunciation improvements..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={selectedSubmission.status === 'Graded'}
                    className="w-full bg-muted border border-border/50 rounded-2xl p-4 text-xs font-medium outline-none focus:border-brand-yellow transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    rows={4}
                  />
                </div>

                {/* Submissions Trigger buttons */}
                {selectedSubmission.status === 'Pending' && (
                  <div className="flex justify-end gap-4 pt-4">
                    <button 
                      onClick={handleSaveDraft}
                      className="bg-muted hover:bg-border/60 text-brand-dark font-bold rounded-full px-6 py-3 text-xs flex items-center gap-1.5 transition-colors border border-border"
                    >
                      <Save className="w-4 h-4" /> Save Draft
                    </button>
                    <button 
                      onClick={handleSubmitEvaluation}
                      className="bg-brand-dark hover:bg-brand-dark/90 text-white font-bold rounded-full px-8 py-3 text-xs flex items-center gap-1.5 transition-transform hover:scale-105 shadow-md"
                    >
                      Submit Assessment <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-border/40 shadow-sm flex items-center justify-center min-h-[500px]">
              <p className="text-muted-foreground font-medium">Select an audio submission to begin grading.</p>
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}
