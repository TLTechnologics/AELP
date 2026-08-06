'use client';

import { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { useSpeakingSubmissions, useEvaluateSpeaking } from '@/hooks/use-teacher';

export default function SpeakingAssessment() {
  const { data: submissions = [], isLoading, refetch } = useSpeakingSubmissions();
  const evaluateMutation = useEvaluateSpeaking();
  
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  const selectedSubmission = submissions.find((s: any) => s.id === selectedSubmissionId) || submissions[0] || null;

  useEffect(() => {
    if (submissions.length > 0 && !selectedSubmissionId) {
      setSelectedSubmissionId(submissions[0].id);
    }
  }, [submissions, selectedSubmissionId]);

  // Pause audio when switching submissions
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
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

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Audio playback failed:", err);
        triggerToast("Failed to play audio");
      });
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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

  // Prepend backend URL if the path is relative and it's not already a full URL
  const getAudioUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aelp.onrender.com/api';
    // If baseUrl has /api at the end, we might need to strip it if media is served at root
    const rootUrl = baseUrl.replace(/\/api\/?$/, '');
    return url.startsWith('/') ? `${rootUrl}${url}` : `${rootUrl}/${url}`;
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-20 relative">
        
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

        <div>
          <h2 className="text-xl text-muted-foreground font-medium mb-1">Voice & Pronunciation Lab</h2>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading break-words uppercase">
            Speaking <span className="highlight-yellow inline-block px-2">Evaluations</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="bg-white rounded-[32px] p-6 border border-border/40 shadow-sm space-y-6 h-[680px] flex flex-col">
            <h3 className="font-heading text-2xl">Audio Submissions</h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {submissions.map((sub: any) => {
                const isActive = selectedSubmission?.id === sub.id;
                return (
                  <div 
                    key={sub.id}
                    onClick={() => {
                        setSelectedSubmissionId(sub.id);
                    }}
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
                      <span className="text-xs sm:text-sm text-muted-foreground font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {sub.duration}
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

          {selectedSubmission ? (
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              <div className="space-y-6">
                
                <div className="bg-brand-dark rounded-[24px] p-6 shadow-md border border-brand-dark/20 relative overflow-hidden text-white">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-yellow/20 blur-3xl rounded-full" />
                  
                  <span className="text-[9px] font-bold text-brand-yellow uppercase tracking-widest bg-white/15 px-3 py-1 rounded-full">Speaking Recording</span>
                  
                  <div className="mt-8 flex items-center gap-4">
                    <button 
                      onClick={togglePlayPause}
                      className="w-14 h-14 bg-brand-yellow rounded-full flex items-center justify-center text-brand-dark hover:scale-105 transition-transform shrink-0"
                    >
                      {isPlaying ? <Pause className="w-6 h-6 fill-brand-dark" /> : <Play className="w-6 h-6 fill-brand-dark ml-1" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      {selectedSubmission.audioUrl && (
                        <audio 
                            ref={audioRef}
                            src={getAudioUrl(selectedSubmission.audioUrl)} 
                            id={`audio-${selectedSubmission.id}`}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                            className="hidden"
                            preload="auto"
                        />
                      )}
                      
                      {/* Mock Waveform / Progress bar */}
                      <div 
                        className="flex items-center gap-1 h-8 cursor-pointer group"
                        onClick={(e) => {
                          if (audioRef.current && audioRef.current.duration) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pos = (e.clientX - rect.left) / rect.width;
                            audioRef.current.currentTime = pos * audioRef.current.duration;
                          }
                        }}
                      >
                        {[...Array(20)].map((_, i) => {
                          const duration = audioRef.current?.duration || 1;
                          const progressPct = currentTime / duration;
                          const barPct = i / 20;
                          const isPlayed = progressPct >= barPct;
                          return (
                            <motion.div
                              key={i}
                              animate={isPlaying && !isPlayed ? { height: [8, Math.random() * 24 + 8, 8] } : { height: isPlayed ? 24 : 8 }}
                              transition={{ repeat: isPlaying ? Infinity : 0, duration: 0.5 + Math.random() * 0.5 }}
                              className={`flex-1 rounded-full transition-colors ${isPlayed ? 'bg-brand-yellow' : 'bg-brand-yellow/30'}`}
                            />
                          );
                        })}
                      </div>
                      
                      <div className="flex justify-between text-xs font-bold text-white/50 mt-2">
                        <span>{formatTime(currentTime)}</span>
                        <span>{selectedSubmission.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-border/40 rounded-[24px] p-6 shadow-sm min-h-[300px] relative">
                  <p className="text-xs sm:text-sm text-muted-foreground font-bold uppercase tracking-wider pb-3 border-b border-border/40 flex items-center gap-2">
                    <Mic className="w-4 h-4" /> AI Generated Transcript
                  </p>
                  
                  <div className="mt-4 space-y-4 font-sans text-sm font-medium text-brand-dark leading-relaxed">
                    {selectedSubmission.evaluation ? selectedSubmission.evaluation.transcript : (
                        <p className="text-muted-foreground italic">Transcript will be generated by AI upon evaluation.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[32px] p-6 border border-border/40 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-border/40 pb-4">
                  <h3 className="font-heading text-xl">AI Evaluation Form</h3>
                  <div className="text-right">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase">Aggregate Grade</p>
                    <p className="font-heading text-2xl text-brand-dark">{selectedSubmission.evaluation?.overall || 0} <span className="text-xs font-bold text-muted-foreground">/ 100</span></p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Pronunciation Clarity', value: selectedSubmission.evaluation?.pronunciation || 0 },
                    { name: 'Fluency & Pacing', value: selectedSubmission.evaluation?.fluency || 0 },
                    { name: 'Vocabulary Lexicon', value: selectedSubmission.evaluation?.vocabulary || 0 },
                    { name: 'Grammar Accuracy', value: selectedSubmission.evaluation?.grammar || 0 },
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

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">AI Written Comments</label>
                  <textarea 
                    value={selectedSubmission.evaluation?.feedback || 'Pending AI evaluation...'}
                    readOnly
                    className="w-full bg-muted border border-border/50 rounded-xl p-3 text-xs font-medium outline-none transition-all opacity-70"
                    rows={4}
                  />
                </div>
                
                {selectedSubmission.evaluation && selectedSubmission.evaluation.weaknesses && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-red-700 uppercase tracking-wider">Weaknesses Found</label>
                    <div className="flex flex-wrap gap-2">
                        {selectedSubmission.evaluation.weaknesses.map((s: string, i: number) => (
                            <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">{s}</span>
                        ))}
                    </div>
                  </div>
                )}

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
              <p className="text-muted-foreground font-medium">Select a speaking submission to begin grading.</p>
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}
