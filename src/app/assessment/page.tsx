'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, FileText, CheckCircle, AlertCircle, Award, Sparkles, ArrowLeft, Mic, Square, Play, Pause, Trash2, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useReadingAssessment, useSubmitReading, useSubmitWriting, useSpeakingAssessment, useSubmitSpeaking, useSubmitSpeakingText, useWritingAssessment, useListeningAssessment, useSubmitListening } from '@/hooks/use-assessment';
import { Headphones } from 'lucide-react';

const STAGES = {
  SELECTION: 0,
  READING: 1,
  WRITING: 2,
  SPEAKING: 3,
  RESULTS: 4,
  LISTENING: 5,
};

export default function AssessmentPage() {
  const router = useRouter();
  const [stage, setStage] = useState(STAGES.SELECTION);
  const [activeModule, setActiveModule] = useState<'reading' | 'writing' | 'speaking' | 'listening' | null>(null);
  
  const [readingAnswers, setReadingAnswers] = useState<Record<number, { selected_option_id?: number; text_answer?: string }>>({});
  const [listeningAnswers, setListeningAnswers] = useState<Record<number, { selected_option_id?: number; text_answer?: string }>>({});
  const [writingSubmission, setWritingSubmission] = useState('');
  
  // Speaking State
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [liveTranscript, setLiveTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const [readingResult, setReadingResult] = useState<{ total_marks: number; accuracy: number } | null>(null);
  const [listeningResult, setListeningResult] = useState<{ total_marks: number; accuracy: number } | null>(null);
  const [writingResult, setWritingResult] = useState<any>(null);
  const [speakingResult, setSpeakingResult] = useState<any>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: readingData, isLoading: loadingReading } = useReadingAssessment();
  const { data: writingData, isLoading: loadingWriting } = useWritingAssessment();
  const { data: speakingData, isLoading: loadingSpeaking } = useSpeakingAssessment();
  const { data: listeningData, isLoading: loadingListening } = useListeningAssessment();
  const submitReadingMutation = useSubmitReading();
  const submitListeningMutation = useSubmitListening();
  const submitWritingMutation = useSubmitWriting();
  const submitSpeakingMutation = useSubmitSpeaking();
  const submitSpeakingTextMutation = useSubmitSpeakingText();

  const passage = readingData?.reading_passage || `Many people believe that a good morning routine helps them have a productive day. Waking up early gives people enough time to prepare for the day without feeling rushed. Some people begin their morning by drinking a glass of water because it helps the body stay hydrated after a night's sleep.

Exercise is another healthy habit. It does not have to be difficult. Even a 20-minute walk or a few stretching exercises can improve a person's mood and energy. After exercising, eating a healthy breakfast is important. Foods such as fruits, eggs, whole-grain bread, and milk provide the body with energy.

Many students and workers also spend a few minutes planning their day. They write down the tasks they need to complete and decide which ones are most important. This helps them manage their time better and reduces stress.

However, not everyone follows the same routine. Some people prefer to wake up later because they work at night. Others enjoy reading a book or listening to music before starting work or school. The best morning routine is the one that helps a person feel healthy, focused, and ready for the day.`;

  const questions = readingData?.questions || [
    { id: 1, type: 'mcq', text: '1. Why do many people wake up early?', options: [{ id: 1, text: 'A. To watch television' }, { id: 2, text: 'B. To have enough time to prepare for the day' }, { id: 3, text: 'C. To play games' }, { id: 4, text: 'D. To avoid breakfast' }] },
    { id: 2, type: 'mcq', text: '2. Why do some people drink water in the morning?', options: [{ id: 5, text: 'A. To lose weight immediately' }, { id: 6, text: 'B. To stay hydrated' }, { id: 7, text: 'C. To avoid exercise' }, { id: 8, text: 'D. To help them sleep' }] },
    { id: 3, type: 'mcq', text: '3. Which food is NOT mentioned in the passage?', options: [{ id: 9, text: 'A. Eggs' }, { id: 10, text: 'B. Fruits' }, { id: 11, text: 'C. Rice' }, { id: 12, text: 'D. Milk' }] },
    { id: 4, type: 'mcq', text: '4. Why do students and workers write down their tasks?', options: [{ id: 13, text: 'A. To waste time' }, { id: 14, text: 'B. To improve time management' }, { id: 15, text: 'C. To forget their work' }, { id: 16, text: 'D. To make friends' }] },
    { id: 5, type: 'true_false', text: '5. Everyone should wake up early every day.', options: [{ id: 17, text: 'True' }, { id: 18, text: 'False' }, { id: 19, text: 'Not Given' }] },
    { id: 6, type: 'true_false', text: "6. A short walk can improve a person's mood.", options: [{ id: 20, text: 'True' }, { id: 21, text: 'False' }, { id: 22, text: 'Not Given' }] },
    { id: 7, type: 'true_false', text: '7. Drinking coffee is recommended in the passage.', options: [{ id: 23, text: 'True' }, { id: 24, text: 'False' }, { id: 25, text: 'Not Given' }] },
    { id: 8, type: 'true_false', text: '8. Some people work at night.', options: [{ id: 26, text: 'True' }, { id: 27, text: 'False' }, { id: 28, text: 'Not Given' }] },
    { id: 9, type: 'fill_in_blank', text: '9. Drinking water helps keep the body __________.', options: [] },
    { id: 10, type: 'fill_in_blank', text: '10. A healthy breakfast gives the body __________.', options: [] },
    { id: 11, type: 'fill_in_blank', text: '11. Planning the day can reduce __________.', options: [] },
    { id: 12, type: 'fill_in_blank', text: '12. The best morning routine helps people feel healthy and __________.', options: [] },
    { id: 13, type: 'fill_in_blank', text: '13. How long can a simple walk be?', options: [] },
    { id: 14, type: 'fill_in_blank', text: '14. Name one activity people may enjoy before work or school.', options: [] },
    { id: 15, type: 'fill_in_blank', text: '15. What do people decide after writing their tasks?', options: [] },
    { id: 16, type: 'matching', text: '16. Hydrated', options: [{ id: 29, text: 'A. Feeling worried' }, { id: 30, text: 'B. Daily habit' }, { id: 31, text: 'C. Having enough water in the body' }] },
    { id: 17, type: 'matching', text: '17. Routine', options: [{ id: 32, text: 'A. Feeling worried' }, { id: 33, text: 'B. Daily habit' }, { id: 34, text: 'C. Having enough water in the body' }] },
    { id: 18, type: 'matching', text: '18. Stress', options: [{ id: 35, text: 'A. Feeling worried' }, { id: 36, text: 'B. Daily habit' }, { id: 37, text: 'C. Having enough water in the body' }] },
  ];

  const handleSelectOption = (questionId: number, optionId: number) => {
    setReadingAnswers((prev) => ({
      ...prev,
      [questionId]: { selected_option_id: optionId },
    }));
  };

  const handleTextAnswer = (questionId: number, text: string) => {
    setReadingAnswers((prev) => ({
      ...prev,
      [questionId]: { text_answer: text },
    }));
  };

  const handleSelectListeningOption = (questionId: number, optionId: number) => {
    setListeningAnswers((prev) => ({
      ...prev,
      [questionId]: { selected_option_id: optionId },
    }));
  };

  const handleListeningTextAnswer = (questionId: number, text: string) => {
    setListeningAnswers((prev) => ({
      ...prev,
      [questionId]: { text_answer: text },
    }));
  };

  const words = writingSubmission.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const handleReadingSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const payload = Object.entries(readingAnswers).map(([qId, val]) => ({
        question_id: Number(qId),
        ...val,
      }));
      const res = await submitReadingMutation.mutateAsync(payload);
      setReadingResult(res);
      setActiveModule('reading');
      setStage(STAGES.RESULTS);
    } catch (e: any) {
      setErrorMessage(e?.response?.data?.detail || 'Failed to submit reading assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleListeningSubmit = async () => {
    setErrorMessage(null);
    const requiredQuestions = listeningData?.questions?.length || 0;
    const answeredCount = Object.keys(listeningAnswers).length;
    
    if (answeredCount < requiredQuestions) {
      setErrorMessage('Please answer all listening questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = Object.entries(listeningAnswers).map(([qId, ans]) => ({
        question_id: parseInt(qId),
        selected_option_id: ans.selected_option_id,
        text_answer: ans.text_answer,
      }));
      
      const res = await submitListeningMutation.mutateAsync(payload);
      setListeningResult({ total_marks: res.total_marks, accuracy: res.accuracy });
      setActiveModule('listening');
      setStage(STAGES.RESULTS);
    } catch (e: any) {
      setErrorMessage(e?.response?.data?.detail || 'Failed to submit listening assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWritingSubmit = async () => {
    setErrorMessage(null);
    const submissionText = writingSubmission.trim();

    if (!submissionText) {
      setErrorMessage('Please write your essay before submitting.');
      return;
    }

    if (wordCount < 20) {
      setErrorMessage('Your essay is too short.');
      return;
    }

    setIsSubmitting(true);
    try {
      const promptText = writingData?.topic || "Describe a time when someone helped you or when you helped someone else. How did it make you feel?";
      const res = await submitWritingMutation.mutateAsync({
        prompt: promptText,
        submission: submissionText,
      });
      setWritingResult(res);
      setActiveModule('writing');
      setStage(STAGES.RESULTS);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Unable to evaluate your writing. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- SPEAKING LOGIC ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 120) {
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
      timerIntervalRef.current = interval;
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setAudioUrl(null);
  }, [audioBlob]);

  const startRecording = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100);
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        let finalTranscript = '';
        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptSegment = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptSegment + ' ';
            } else {
              interimTranscript += transcriptSegment;
            }
          }
          setLiveTranscript(finalTranscript + interimTranscript);
        };
        
        recognitionRef.current = recognition;
        recognition.start();
      } else {
        console.warn('Speech Recognition API not supported in this browser.');
      }

      setIsRecording(true);
      setIsPaused(false);
      setRecordingDuration(0);
      setAudioBlob(null);
      setLiveTranscript('');
    } catch (error) {
      setErrorMessage('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (recognitionRef.current) recognitionRef.current.stop();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      if (recognitionRef.current) recognitionRef.current.start();
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingDuration(0);
    setLiveTranscript('');
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioUrl) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeakingSubmit = async () => {
    setErrorMessage(null);
    
    if (recordingDuration < 10) {
      setErrorMessage('Please speak for at least 10 seconds.');
      return;
    }

    if (!liveTranscript.trim()) {
      setErrorMessage('No speech detected. Please ensure your microphone is working and speak clearly.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitSpeakingTextMutation.mutateAsync({
        assessment_id: parseInt(speakingData?.id || '1'),
        prompt: speakingData?.topic || 'Introduce yourself.',
        duration: recordingDuration,
        transcript: liveTranscript
      });
      setSpeakingResult(res);
      setActiveModule('speaking');
      setStage(STAGES.RESULTS);
    } catch (e: any) {
      let msg = 'Unable to evaluate speaking assessment. Please try again later.';
      if (e?.response?.data?.detail) {
        msg = typeof e.response.data.detail === 'string' ? e.response.data.detail : JSON.stringify(e.response.data.detail);
      } else if (e?.response?.data) {
        msg = typeof e.response.data === 'string' ? e.response.data.substring(0, 100) : JSON.stringify(e.response.data).substring(0, 100);
      } else if (e?.message) {
        msg = `Upload Error (V2): ${e.message}`;
      }
      setErrorMessage(msg);
      setAudioBlob(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span>{errorMessage}</span>
          </div>
          <button 
            onClick={() => setErrorMessage(null)} 
            className="text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* STAGE 0: ASSESSMENT SELECTION PAGE */}
        {stage === STAGES.SELECTION && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-12 text-center"
          >
            <div className="space-y-4 max-w-2xl mx-auto">
              <h1 className="font-heading text-5xl md:text-6xl uppercase tracking-tight">Assessments</h1>
              <p className="text-xl text-muted-foreground font-medium">
                Choose an assessment to evaluate your English proficiency. Unlimited time available.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left max-w-[1400px] mx-auto">
              {/* READING ASSESSMENT CARD */}
              <motion.div
                whileHover={{ y: -6 }}
                className="bg-white rounded-[32px] p-8 border border-border shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50" />
                <div className="space-y-6 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Automated Evaluation</span>
                    <h2 className="font-heading text-3xl mt-3">📖 Reading Assessment</h2>
                    <p className="text-muted-foreground text-sm font-medium mt-2 leading-relaxed">
                      Passage comprehension, multiple-choice questions, True/False statements, and vocabulary matching.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-muted-foreground space-y-1">
                    <p>• 18 Questions total</p>
                    <p>• Unlimited duration</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    setStage(STAGES.READING);
                  }}
                  className="mt-8 w-full bg-brand-dark text-white rounded-full py-4 font-bold text-base flex items-center justify-center gap-3 hover:bg-brand-dark/90 transition-transform active:scale-95 shadow-lg"
                >
                  Start Reading Assessment <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>

              {/* WRITING ASSESSMENT CARD */}
              <motion.div
                whileHover={{ y: -6 }}
                className="bg-white rounded-[32px] p-8 border border-border shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50" />
                <div className="space-y-6 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Real Groq AI Evaluation</span>
                    <h2 className="font-heading text-3xl mt-3">✍️ Writing Assessment</h2>
                    <p className="text-muted-foreground text-sm font-medium mt-2 leading-relaxed">
                      Write an essay evaluated by Cambridge English examiner AI on Grammar, Vocabulary, Structure, Coherence & Relevance.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-muted-foreground space-y-1">
                    <p>• Word target: 120 - 150 words</p>
                    <p>• Evaluated by llama-3.3-70b-versatile</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    setStage(STAGES.WRITING);
                  }}
                  className="mt-8 w-full bg-brand-yellow text-brand-dark rounded-full py-4 font-bold text-base flex items-center justify-center gap-3 hover:scale-105 transition-transform active:scale-95 shadow-lg"
                >
                  Start Writing <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>

              {/* SPEAKING ASSESSMENT CARD */}
              <motion.div
                whileHover={{ y: -6 }}
                className="bg-white rounded-[32px] p-8 border border-border shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-50" />
                <div className="space-y-6 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
                    <Mic className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full">Real Gemini AI Evaluation</span>
                    <h2 className="font-heading text-3xl mt-3">🎤 Speaking Assessment</h2>
                    <p className="text-muted-foreground text-sm font-medium mt-2 leading-relaxed">
                      Record yourself speaking. Evaluated by Gemini AI on Pronunciation, Fluency, Grammar & Vocabulary.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-muted-foreground space-y-1">
                    <p>• Min duration: 30 seconds</p>
                    <p>• Max duration: 2 minutes</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    setStage(STAGES.SPEAKING);
                  }}
                  className="mt-8 w-full bg-purple-600 text-white rounded-full py-4 font-bold text-base flex items-center justify-center gap-3 hover:bg-purple-700 transition-transform active:scale-95 shadow-lg"
                >
                  Start Speaking <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>

              {/* LISTENING ASSESSMENT CARD */}
              <motion.div
                whileHover={{ y: -6 }}
                className="bg-white rounded-[32px] p-8 border border-border shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-pink-100 rounded-full blur-3xl opacity-50" />
                <div className="space-y-6 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center shadow-inner">
                    <Headphones className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1 rounded-full">Listening Module</span>
                    <h2 className="font-heading text-3xl mt-3">🎧 Listening Assessment</h2>
                    <p className="text-muted-foreground text-sm font-medium mt-2 leading-relaxed">
                      Listen to audio tracks and answer questions to test your listening comprehension.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-muted-foreground space-y-1">
                    <p>• {listeningData?.questions?.length || 0} Questions total</p>
                    <p>• Custom Audio Track</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    setStage(STAGES.LISTENING);
                  }}
                  className="mt-8 w-full bg-pink-600 text-white rounded-full py-4 font-bold text-base flex items-center justify-center gap-3 hover:bg-pink-700 transition-transform active:scale-95 shadow-lg"
                >
                  Start Listening <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* STAGE 1: READING ASSESSMENT */}
        {stage === STAGES.READING && (
          <motion.div
            key="reading"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-border">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setStage(STAGES.SELECTION)} 
                  className="p-2 rounded-full hover:bg-muted transition-colors text-brand-dark"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Reading Module</span>
                  <h2 className="text-2xl font-heading mt-1">Reading Assessment</h2>
                </div>
              </div>
              <button
                onClick={handleReadingSubmit}
                disabled={isSubmitting}
                className="bg-brand-yellow text-brand-dark px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Evaluating...' : 'Submit Reading Test'} <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Passage Column */}
              <div className="bg-white p-8 rounded-[32px] border border-border shadow-sm space-y-4 h-[650px] overflow-y-auto sticky top-24">
                <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-wider text-xs">
                  <BookOpen className="w-4 h-4" /> Reading Passage
                </div>
                <h3 className="font-heading text-2xl">{readingData?.title || 'A Healthy Morning Routine'}</h3>
                <div className="text-muted-foreground space-y-4 font-medium leading-relaxed whitespace-pre-line text-sm">
                  {passage}
                </div>
              </div>

              {/* Questions Column */}
              <div className="space-y-6 h-[650px] overflow-y-auto pr-2">
                {questions.map((q: any) => (
                  <div key={q.id} className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
                    <h4 className="font-bold text-base text-brand-dark">{q.text}</h4>

                    {/* Multiple Choice / True False / Matching */}
                    {q.options && q.options.length > 0 ? (
                      <div className="space-y-2">
                        {q.options.map((opt: any) => {
                          const selected = readingAnswers[q.id]?.selected_option_id === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => handleSelectOption(q.id, opt.id)}
                              className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all ${
                                selected
                                  ? 'border-brand-yellow bg-brand-yellow/10 font-bold text-brand-dark'
                                  : 'border-border/60 bg-muted/40 hover:bg-muted text-muted-foreground'
                              }`}
                            >
                              {opt.text}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* Large Auto-Expanding Textarea for Text Answers */
                      <textarea
                        rows={3}
                        placeholder="Type your detailed answer here..."
                        value={readingAnswers[q.id]?.text_answer || ''}
                        onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                        className="w-full bg-muted/50 border border-border/60 rounded-xl p-4 text-sm font-medium outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 transition-all resize-y min-h-[90px]"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* STAGE 2: WRITING ASSESSMENT */}
        {stage === STAGES.WRITING && (
          <motion.div
            key="writing"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-border">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setStage(STAGES.SELECTION)} 
                  className="p-2 rounded-full hover:bg-muted transition-colors text-brand-dark"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Writing Module</span>
                  <h2 className="text-2xl font-heading mt-1">Writing Assessment</h2>
                </div>
              </div>
              <button
                onClick={handleWritingSubmit}
                disabled={isSubmitting}
                className="bg-brand-dark text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Evaluating Groq AI...' : 'Submit Essay'} <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-border shadow-xl space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Prompt (Word limit: 120–150 words)</span>
                <h3 className="text-2xl font-heading text-brand-dark leading-snug whitespace-pre-line">
                  {writingData?.topic || "Describe a time when someone helped you or when you helped someone else. How did it make you feel?"}
                </h3>
              </div>

              <div className="space-y-3">
                <textarea
                  rows={12}
                  placeholder="Start writing your essay here..."
                  value={writingSubmission}
                  onChange={(e) => setWritingSubmission(e.target.value)}
                  className="w-full bg-muted/40 border border-border/80 rounded-2xl p-6 text-base font-medium outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 transition-all resize-y min-h-[220px]"
                />

                <div className="flex justify-between items-center text-xs font-bold px-2">
                  <span className={wordCount >= 120 && wordCount <= 150 ? 'text-green-600 font-bold' : 'text-muted-foreground'}>
                    Word Count: {wordCount} words (Target: 120 - 150)
                  </span>
                  {wordCount > 0 && wordCount < 20 && (
                    <span className="text-red-500 flex items-center gap-1 font-bold">
                      <AlertCircle className="w-4 h-4" /> Minimum 20 words required before submitting.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STAGE 3: SPEAKING ASSESSMENT */}
        {stage === STAGES.SPEAKING && (
          <motion.div
            key="speaking"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-border">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    stopRecording();
                    deleteRecording();
                    setStage(STAGES.SELECTION);
                  }} 
                  className="p-2 rounded-full hover:bg-muted transition-colors text-brand-dark"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full">Speaking Module</span>
                  <h2 className="text-2xl font-heading mt-1">Speaking Assessment</h2>
                </div>
              </div>
              <button
                onClick={handleSpeakingSubmit}
                disabled={isSubmitting || !audioBlob}
                className="bg-purple-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-purple-700 transition-transform shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Evaluating...' : 'Submit Recording'} <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-border shadow-xl space-y-8 text-center max-w-3xl mx-auto">
              <div className="space-y-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Prompt (Min: 30s | Max: 2m)</span>
                <h3 className="text-2xl font-heading text-brand-dark leading-snug whitespace-pre-line">
                  {speakingData?.topic || "Introduce yourself.\nTalk about:\n• Your name\n• Your hobbies\n• Your family\n• Your favourite subject\n\nSpeak for approximately one minute."}
                </h3>
              </div>

              <div className="py-8">
                {isRecording ? (
                  <div className="space-y-6">
                    <div className="text-5xl font-heading text-red-500 animate-pulse">
                      {formatDuration(recordingDuration)}
                    </div>
                    {/* Fake Waveform Animation */}
                    <div className="flex items-center justify-center gap-1 h-12">
                      {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <motion.div
                          key={i}
                          animate={{ height: isPaused ? 8 : [8, 30, 8, 40, 8] }}
                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                          className="w-2 bg-red-500 rounded-full"
                        />
                      ))}
                    </div>
                    <div className="flex justify-center gap-4">
                      {isPaused ? (
                        <button onClick={resumeRecording} className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 shadow-md">
                          <Play className="w-8 h-8 fill-current" />
                        </button>
                      ) : (
                        <button onClick={pauseRecording} className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center hover:bg-amber-200 shadow-md">
                          <Pause className="w-8 h-8 fill-current" />
                        </button>
                      )}
                      <button onClick={stopRecording} className="w-16 h-16 bg-brand-dark text-white rounded-full flex items-center justify-center hover:bg-brand-dark/90 shadow-md">
                        <Square className="w-6 h-6 fill-current" />
                      </button>
                    </div>
                  </div>
                ) : audioBlob ? (
                  <div className="space-y-6">
                    <div className="text-4xl font-heading text-brand-dark">
                      {formatDuration(recordingDuration)}
                    </div>
                    
                    <audio 
                      ref={audioPlayerRef} 
                      src={audioUrl || undefined} 
                      onEnded={() => setIsPlaying(false)}
                      className="hidden" 
                    />
                    
                    <div className="flex justify-center gap-4">
                      <button onClick={togglePlayback} className="px-6 py-3 bg-blue-100 text-blue-700 font-bold rounded-full flex items-center gap-2 hover:bg-blue-200 transition-colors">
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                        {isPlaying ? 'Pause' : 'Preview'}
                      </button>
                      <button onClick={deleteRecording} className="px-6 py-3 bg-red-100 text-red-600 font-bold rounded-full flex items-center gap-2 hover:bg-red-200 transition-colors">
                        <Trash2 className="w-5 h-5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <button onClick={startRecording} className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center border-4 border-red-100 hover:scale-110 hover:bg-red-100 transition-all shadow-lg mx-auto">
                      <Mic className="w-10 h-10" />
                    </button>
                    <p className="font-bold text-muted-foreground">Click to start recording</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* STAGE 5: LISTENING ASSESSMENT */}
        {stage === STAGES.LISTENING && (
          <motion.div
            key="listening"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-border">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setStage(STAGES.SELECTION)} 
                  className="p-2 rounded-full hover:bg-muted transition-colors text-brand-dark"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1 rounded-full">Listening Module</span>
                  <h2 className="text-2xl font-heading mt-1">Listening Assessment</h2>
                </div>
              </div>
              <button
                onClick={handleListeningSubmit}
                disabled={isSubmitting}
                className="bg-brand-yellow text-brand-dark px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Evaluating...' : 'Submit Listening Test'} <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Audio Column */}
              <div className="bg-white p-8 rounded-[32px] border border-border shadow-sm space-y-8 h-fit sticky top-24">
                <div className="flex items-center gap-2 text-pink-600 font-bold uppercase tracking-wider text-xs">
                  <Headphones className="w-4 h-4" /> Audio Track
                </div>
                <h3 className="font-heading text-2xl">{listeningData?.title || 'Listening Test'}</h3>
                
                {listeningData?.audio_url ? (
                  <div className="bg-pink-50/50 p-6 rounded-2xl border border-pink-100">
                    <audio 
                      controls 
                      src={listeningData.audio_url} 
                      className="w-full custom-audio-player" 
                      controlsList="nodownload"
                    />
                    <p className="text-xs text-muted-foreground mt-4 font-medium text-center">
                      Listen to the audio carefully. You can play, pause, and replay as needed.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 bg-muted rounded-xl text-center text-muted-foreground font-medium">
                    No audio track available.
                  </div>
                )}
              </div>

              {/* Questions Column */}
              <div className="space-y-6 h-[650px] overflow-y-auto pr-2 custom-scrollbar">
                {(listeningData?.questions || []).map((q: any, idx: number) => (
                  <div key={q.id} className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
                    <h4 className="font-bold text-base text-brand-dark">
                      <span className="text-pink-600 mr-2">{idx + 1}.</span>
                      {q.text}
                    </h4>

                    {/* Options */}
                    {q.options && q.options.length > 0 ? (
                      <div className="space-y-2">
                        {q.options.map((opt: any) => {
                          const selected = listeningAnswers[q.id]?.selected_option_id === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => handleSelectListeningOption(q.id, opt.id)}
                              className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all ${
                                selected
                                  ? 'border-pink-600 bg-pink-50 font-bold text-pink-700'
                                  : 'border-border/60 bg-muted/40 hover:bg-muted text-muted-foreground'
                              }`}
                            >
                              {opt.text}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <textarea
                        rows={3}
                        placeholder="Type your answer here..."
                        value={listeningAnswers[q.id]?.text_answer || ''}
                        onChange={(e) => handleListeningTextAnswer(q.id, e.target.value)}
                        className="w-full bg-muted/50 border border-border/60 rounded-xl p-4 text-sm font-medium outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-200 transition-all resize-y min-h-[90px]"
                      />
                    )}
                  </div>
                ))}
                
                {listeningData?.questions?.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground font-medium bg-white rounded-2xl border border-border">
                    No questions provided for this listening assessment.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* STAGE 4: RESULTS */}
        {stage === STAGES.RESULTS && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center text-green-600">
                <Award className="w-10 h-10" />
              </div>
              <h1 className="font-heading text-5xl">Assessment Evaluation Complete</h1>
              <p className="text-muted-foreground font-medium text-lg">Here is your detailed performance breakdown.</p>
            </div>

            {/* READING RESULT DISPLAY */}
            {activeModule === 'reading' && readingResult && (
              <div className="bg-white p-8 rounded-[32px] border border-border shadow-md space-y-6 max-w-2xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl">Reading Assessment Result</h3>
                    <p className="text-xs text-muted-foreground font-bold">Automated Database Answer Evaluation</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-2xl text-center space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Score & Accuracy</span>
                  <div className="text-5xl font-heading text-blue-700">
                    {readingResult.total_marks} Marks ({readingResult.accuracy.toFixed(1)}%)
                  </div>
                </div>

                <div className="space-y-3 text-sm font-medium text-muted-foreground">
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span>Correct Answered Marks</span>
                    <span className="font-bold text-brand-dark">{readingResult.total_marks} / {questions.length}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span>Passage Title</span>
                    <span className="font-bold text-brand-dark">{readingData?.title || 'A Healthy Morning Routine'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* LISTENING RESULT DISPLAY */}
            {activeModule === 'listening' && listeningResult && (
              <div className="bg-white p-8 rounded-[32px] border border-border shadow-md space-y-8 max-w-3xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl">Listening Assessment Result</h3>
                    <p className="text-xs text-muted-foreground font-bold">Automated Database Answer Evaluation</p>
                  </div>
                </div>

                <div className="bg-pink-50 p-6 rounded-2xl text-center space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Score & Accuracy</span>
                  <div className="text-5xl font-heading text-pink-700">
                    {listeningResult.total_marks} Marks ({listeningResult.accuracy.toFixed(1)}%)
                  </div>
                </div>

                <div className="space-y-3 text-sm font-medium text-muted-foreground">
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span>Correct Answered Marks</span>
                    <span className="font-bold text-brand-dark">{listeningResult.total_marks} / {listeningData?.questions?.length || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span>Assessment Title</span>
                    <span className="font-bold text-brand-dark">{listeningData?.title || 'Listening Test'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* WRITING RESULT DISPLAY */}
            {activeModule === 'writing' && writingResult && (
              <div className="bg-white p-8 rounded-[32px] border border-border shadow-md space-y-8 max-w-3xl mx-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-heading text-2xl">Writing Evaluation</h3>
                      <p className="text-xs text-muted-foreground font-bold">Evaluated by Groq llama-3.3-70b-versatile</p>
                    </div>
                  </div>
                  {writingResult.cefr_level && (
                    <div className="bg-brand-yellow text-brand-dark font-heading text-2xl px-6 py-2 rounded-full border border-brand-dark/20 shadow-sm">
                      CEFR {writingResult.cefr_level}
                    </div>
                  )}
                </div>

                <div className="bg-orange-50/60 p-6 rounded-2xl text-center space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overall Writing Score</span>
                  <div className="text-5xl font-heading text-orange-600">
                    {writingResult.overall} / 50 Marks
                  </div>
                </div>

                {/* Rubric Criteria Progress Bars */}
                <div className="space-y-4">
                  <h4 className="font-heading text-xl">Rubric Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Grammar', score: writingResult.grammar },
                      { label: 'Vocabulary', score: writingResult.vocabulary },
                      { label: 'Sentence Structure', score: writingResult.sentence_structure },
                      { label: 'Coherence', score: writingResult.coherence },
                      { label: 'Relevance', score: writingResult.relevance },
                    ].map((item) => (
                      <div key={item.label} className="bg-muted/50 p-4 rounded-2xl space-y-2 border border-border/40">
                        <div className="flex justify-between font-bold text-sm">
                          <span>{item.label}</span>
                          <span className="text-orange-600">{item.score || 0} / 10</span>
                        </div>
                        <div className="h-2 w-full bg-border/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                            style={{ width: `${((item.score || 0) / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                {writingResult.feedback && (
                  <div className="p-6 bg-muted/40 rounded-2xl space-y-2 border border-border/40">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-dark flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-green-600" /> Examiner Feedback
                    </span>
                    <p className="text-sm text-brand-dark font-medium leading-relaxed">{writingResult.feedback}</p>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {writingResult.strengths && writingResult.strengths.length > 0 && (
                    <div className="p-5 bg-green-50/50 rounded-2xl border border-green-200 space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-green-800">Strengths</span>
                      <ul className="list-disc list-inside text-xs font-medium text-green-900 space-y-1">
                        {writingResult.strengths.map((s: string, idx: number) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {writingResult.weaknesses && writingResult.weaknesses.length > 0 && (
                    <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Areas for Improvement</span>
                      <ul className="list-disc list-inside text-xs font-medium text-amber-900 space-y-1">
                        {writingResult.weaknesses.map((w: string, idx: number) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Recommended Lessons */}
                {writingResult.recommended_lessons && writingResult.recommended_lessons.length > 0 && (
                  <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Recommended Next Steps</span>
                    <ul className="list-disc list-inside text-xs font-medium text-blue-900 space-y-1">
                      {writingResult.recommended_lessons.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* SPEAKING RESULT DISPLAY */}
            {activeModule === 'speaking' && speakingResult && (
              <div className="bg-white p-8 rounded-[32px] border border-border shadow-md space-y-8 max-w-3xl mx-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Mic className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-heading text-2xl">Speaking Evaluation</h3>
                      <p className="text-xs text-muted-foreground font-bold">Evaluated by Gemini 2.5 Flash</p>
                    </div>
                  </div>
                  {speakingResult.cefr_level && (
                    <div className="bg-brand-yellow text-brand-dark font-heading text-2xl px-6 py-2 rounded-full border border-brand-dark/20 shadow-sm">
                      CEFR {speakingResult.cefr_level}
                    </div>
                  )}
                </div>

                <div className="bg-purple-50/60 p-6 rounded-2xl text-center space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overall Speaking Score</span>
                  <div className="text-5xl font-heading text-purple-600">
                    {speakingResult.overall} / 70 Marks
                  </div>
                </div>

                {/* Rubric Criteria Progress Bars */}
                <div className="space-y-4">
                  <h4 className="font-heading text-xl">Rubric Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Grammar', score: speakingResult.grammar },
                      { label: 'Vocabulary', score: speakingResult.vocabulary },
                      { label: 'Pronunciation', score: speakingResult.pronunciation },
                      { label: 'Fluency', score: speakingResult.fluency },
                      { label: 'Coherence', score: speakingResult.coherence },
                      { label: 'Confidence', score: speakingResult.confidence },
                      { label: 'Communication', score: speakingResult.communication },
                    ].map((item) => (
                      <div key={item.label} className="bg-muted/50 p-4 rounded-2xl space-y-2 border border-border/40">
                        <div className="flex justify-between font-bold text-sm">
                          <span>{item.label}</span>
                          <span className="text-purple-600">{item.score || 0} / 10</span>
                        </div>
                        <div className="h-2 w-full bg-border/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                            style={{ width: `${((item.score || 0) / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transcript */}
                {speakingResult.transcript && (
                  <div className="p-6 bg-muted/40 rounded-2xl space-y-2 border border-border/40">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-dark flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-purple-600" /> Generated Transcript
                    </span>
                    <p className="text-sm text-brand-dark font-medium leading-relaxed italic">"{speakingResult.transcript}"</p>
                  </div>
                )}

                {/* Feedback */}
                {speakingResult.feedback && (
                  <div className="p-6 bg-muted/40 rounded-2xl space-y-2 border border-border/40">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-dark flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-green-600" /> Examiner Feedback
                    </span>
                    <p className="text-sm text-brand-dark font-medium leading-relaxed">{speakingResult.feedback}</p>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {speakingResult.strengths && speakingResult.strengths.length > 0 && (
                    <div className="p-5 bg-green-50/50 rounded-2xl border border-green-200 space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-green-800">Strengths</span>
                      <ul className="list-disc list-inside text-xs font-medium text-green-900 space-y-1">
                        {speakingResult.strengths.map((s: string, idx: number) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {speakingResult.weaknesses && speakingResult.weaknesses.length > 0 && (
                    <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Areas for Improvement</span>
                      <ul className="list-disc list-inside text-xs font-medium text-amber-900 space-y-1">
                        {speakingResult.weaknesses.map((w: string, idx: number) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Recommended Lessons */}
                {speakingResult.recommended_lessons && speakingResult.recommended_lessons.length > 0 && (
                  <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Recommended Next Steps</span>
                    <ul className="list-disc list-inside text-xs font-medium text-blue-900 space-y-1">
                      {speakingResult.recommended_lessons.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center gap-4 pt-6">
              <button
                onClick={() => setStage(STAGES.SELECTION)}
                className="bg-muted text-brand-dark rounded-full px-8 py-4 font-bold text-base hover:bg-muted/80 transition-all"
              >
                Back to Assessments
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-brand-dark text-white rounded-full px-10 py-4 font-bold text-base inline-flex items-center gap-3 hover:bg-brand-dark/90 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-dark/20"
              >
                Return to Dashboard <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
