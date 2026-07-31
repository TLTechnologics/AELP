'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Upload, Save, BookOpen, PenTool, Mic, Headphones } from 'lucide-react';
import { teacherService } from '@/services/api';

type AssessmentType = 'reading' | 'writing' | 'speaking' | 'listening';

export default function AssessmentBuilder() {
  const [activeTab, setActiveTab] = useState<AssessmentType>('reading');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Shared state
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [topic, setTopic] = useState('');

  // Audio state
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // Reading / Listening specific state
  const [readingPassage, setReadingPassage] = useState('');
  const [questions, setQuestions] = useState([
    {
      type: 'mcq',
      text: '',
      marks: 1,
      options: [
        { text: '', is_correct: true },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ],
    },
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: 'mcq',
        text: '',
        marks: 1,
        options: [
          { text: '', is_correct: true },
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      if (activeTab === 'reading') {
        await teacherService.uploadReadingAssessment({
          title,
          difficulty,
          reading_passage: readingPassage,
          questions,
        });
      } else if (activeTab === 'writing') {
        await teacherService.uploadWritingAssessment({
          title,
          difficulty,
          topic,
        });
      } else if (activeTab === 'speaking') {
        await teacherService.uploadSpeakingAssessment({
          title,
          difficulty,
          topic,
        });
      } else if (activeTab === 'listening') {
        if (!audioFile) {
          setErrorMsg('Please upload an audio file.');
          setIsSubmitting(false);
          return;
        }
        const formData = new FormData();
        formData.append('title', title);
        formData.append('difficulty', difficulty);
        formData.append('audio_file', audioFile);
        formData.append('questions', JSON.stringify(questions));
        await teacherService.uploadListeningAssessment(formData);
      }

      setSuccessMsg(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Assessment uploaded successfully! Students will now see these questions.`);
      
      // Reset form
      setTitle('');
      setTopic('');
      if (activeTab === 'reading' || activeTab === 'listening') {
        setReadingPassage('');
        setAudioFile(null);
        setQuestions([
          {
            type: 'mcq',
            text: '',
            marks: 1,
            options: [
              { text: '', is_correct: true },
              { text: '', is_correct: false },
              { text: '', is_correct: false },
              { text: '', is_correct: false },
            ],
          },
        ]);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to upload assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto pb-20 space-y-8">
        <div>
          <h1 className="text-4xl font-heading uppercase">Assessment <span className="text-brand-yellow">Builder</span></h1>
          <p className="text-muted-foreground mt-2 font-medium">Create and publish custom assessments directly to your students.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-muted rounded-2xl">
          {[
            { id: 'reading', label: 'Reading Comprehension', icon: BookOpen },
            { id: 'listening', label: 'Listening Audio', icon: Headphones },
            { id: 'writing', label: 'Writing Prompt', icon: PenTool },
            { id: 'speaking', label: 'Speaking Topic', icon: Mic },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as AssessmentType)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-brand-dark shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-brand-dark hover:bg-white/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {successMsg && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-2 border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-2 border border-red-200">
            <span className="font-bold">{errorMsg}</span>
          </div>
        )}

        {/* Form Container */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-dark">Assessment Title</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mid-term Reading Test"
                  className="w-full bg-muted border border-border/50 rounded-xl py-3 px-4 outline-none focus:border-brand-yellow font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-dark">Difficulty Level</label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-muted border border-border/50 rounded-xl py-3 px-4 outline-none focus:border-brand-yellow font-medium appearance-none cursor-pointer"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            {/* Speaking / Writing specific fields */}
            {(activeTab === 'speaking' || activeTab === 'writing') && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-dark">Topic / Prompt</label>
                <textarea 
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={`Provide the prompt that the student should respond to...`}
                  rows={4}
                  className="w-full bg-muted border border-border/50 rounded-xl py-3 px-4 outline-none focus:border-brand-yellow font-medium resize-none"
                />
              </div>
            )}

            {/* Reading / Listening specific fields */}
            {(activeTab === 'reading' || activeTab === 'listening') && (
              <>
                {activeTab === 'reading' && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-brand-dark">Reading Passage</label>
                    <textarea 
                      required
                      value={readingPassage}
                      onChange={(e) => setReadingPassage(e.target.value)}
                      placeholder="Enter the reading passage here..."
                      rows={6}
                      className="w-full bg-muted border border-border/50 rounded-xl py-3 px-4 outline-none focus:border-brand-yellow font-medium custom-scrollbar"
                    />
                  </div>
                )}

                {activeTab === 'listening' && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-brand-dark">Audio Track</label>
                    <input 
                      required
                      type="file" 
                      accept=".mp3, .wav, .m4a, .aac, .ogg, audio/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAudioFile(e.target.files[0]);
                        }
                      }}
                      className="w-full bg-white border border-border/50 rounded-xl py-2 px-3 outline-none focus:border-brand-yellow font-medium file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-brand-yellow/20 file:text-brand-dark hover:file:bg-brand-yellow/40 file:cursor-pointer cursor-pointer text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground font-medium">Upload an MP3 or WAV file (Max 25MB).</p>
                  </div>
                )}


                <div className="pt-6 border-t border-border/40">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-heading text-2xl">Questions</h3>
                    <button 
                      type="button" 
                      onClick={handleAddQuestion}
                      className="text-sm font-bold bg-brand-yellow/20 text-brand-dark px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-brand-yellow/40 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Question
                    </button>
                  </div>

                  <div className="space-y-8">
                    {questions.map((q, qIndex) => (
                      <div key={qIndex} className="p-6 bg-muted/50 rounded-2xl border border-border/50 relative">
                        {questions.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveQuestion(qIndex)}
                            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                        
                        <div className="flex gap-4 items-start pr-12">
                          <span className="w-8 h-8 shrink-0 bg-brand-dark text-brand-yellow rounded-full flex items-center justify-center font-bold text-sm">
                            {qIndex + 1}
                          </span>
                          <div className="flex-1 space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                              <select
                                value={q.type || 'mcq'}
                                onChange={(e) => {
                                  const newType = e.target.value;
                                  const newQ = [...questions];
                                  newQ[qIndex].type = newType;
                                  if (newType === 'mcq') {
                                    newQ[qIndex].options = [
                                      { text: '', is_correct: true },
                                      { text: '', is_correct: false },
                                      { text: '', is_correct: false },
                                      { text: '', is_correct: false },
                                    ];
                                  } else if (newType === 'true_false') {
                                    newQ[qIndex].options = [
                                      { text: 'True', is_correct: true },
                                      { text: 'False', is_correct: false },
                                      { text: 'Not Given', is_correct: false },
                                    ];
                                  } else if (newType === 'fill_in_blank') {
                                    newQ[qIndex].options = [
                                      { text: '', is_correct: true },
                                    ];
                                  }
                                  setQuestions(newQ);
                                }}
                                className="bg-white border border-border/50 rounded-xl py-3 px-4 outline-none focus:border-brand-yellow font-medium cursor-pointer"
                              >
                                <option value="mcq">Multiple Choice</option>
                                <option value="true_false">True / False</option>
                                <option value="fill_in_blank">Short Answer</option>
                              </select>

                              <input 
                                required
                                type="text" 
                                value={q.text}
                                onChange={(e) => {
                                  const newQ = [...questions];
                                  newQ[qIndex].text = e.target.value;
                                  setQuestions(newQ);
                                }}
                                placeholder="Question text"
                                className="flex-1 bg-white border border-border/50 rounded-xl py-3 px-4 outline-none focus:border-brand-yellow font-medium"
                              />
                            </div>

                            <div className={`grid gap-3 ${q.type === 'fill_in_blank' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                              {q.options.map((opt, optIndex) => (
                                <div key={optIndex} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${opt.is_correct ? 'bg-green-50 border-green-200' : 'bg-white border-border/50'}`}>
                                  {q.type !== 'fill_in_blank' && (
                                    <input 
                                      type="radio" 
                                      name={`correct-${qIndex}`}
                                      checked={opt.is_correct}
                                      onChange={() => {
                                        const newQ = [...questions];
                                        newQ[qIndex].options = newQ[qIndex].options.map((o, idx) => ({
                                          ...o,
                                          is_correct: idx === optIndex
                                        }));
                                        setQuestions(newQ);
                                      }}
                                      className="w-4 h-4 text-brand-dark focus:ring-brand-yellow cursor-pointer"
                                    />
                                  )}
                                  <input 
                                    required
                                    type="text" 
                                    value={opt.text}
                                    readOnly={q.type === 'true_false'}
                                    onChange={(e) => {
                                      if (q.type === 'true_false') return;
                                      const newQ = [...questions];
                                      newQ[qIndex].options[optIndex].text = e.target.value;
                                      setQuestions(newQ);
                                    }}
                                    placeholder={q.type === 'fill_in_blank' ? "Enter the exact correct answer" : `Option ${String.fromCharCode(65 + optIndex)}`}
                                    className={`flex-1 bg-transparent outline-none text-sm font-medium ${q.type === 'true_false' ? 'cursor-default text-brand-dark' : ''}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end pt-6 border-t border-border/40">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-brand-dark text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-dark/90 transition-transform active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Publish Assessment
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </MainLayout>
  );
}
