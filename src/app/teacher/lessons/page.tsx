'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonService } from '@/services/api';
import { LiquidLoader } from '@/components/ui/liquid-loader';
import { 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  PenTool, 
  Mic, 
  Headphones, 
  Clock, 
  Play, 
  Pause, 
  Edit3, 
  Trash2, 
  X, 
  Upload, 
  FileText,
  Sparkles,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } }
};

interface LessonItem {
  id: number;
  title: string;
  description: string;
  content?: string;
  audio_url?: string;
  skill_domain: string;
  difficulty: string;
  estimated_time: number;
  created_at?: string;
}

export default function TeacherLessonsPage() {
  const queryClient = useQueryClient();
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonItem | null>(null);

  // Form State
  const [formatType, setFormatType] = useState<'text' | 'audio'>('text');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [skillDomain, setSkillDomain] = useState('reading');
  const [difficulty, setDifficulty] = useState('beginner');
  const [estimatedTime, setEstimatedTime] = useState(15);
  const [formError, setFormError] = useState<string | null>(null);

  // Audio Preview Player
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  // Fetch Lessons Query
  const { data: lessons = [], isLoading, isError } = useQuery<LessonItem[]>({
    queryKey: ['teacherLessons', selectedSkill, selectedDifficulty, searchQuery],
    queryFn: async () => {
      const res = await lessonService.getLessons({
        skill: selectedSkill !== 'All' ? selectedSkill : undefined,
        difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
        search: searchQuery || undefined,
      });
      return res.data;
    }
  });

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('content', content);
      if (audioUrl) formData.append('audio_url', audioUrl);
      formData.append('skill_domain', skillDomain);
      formData.append('difficulty', difficulty);
      formData.append('estimated_time', estimatedTime.toString());
      if (audioFile) formData.append('audio_file', audioFile);

      if (editingLesson) {
        return await lessonService.updateLesson(editingLesson.id, formData);
      } else {
        return await lessonService.createLesson(formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherLessons'] });
      closeModal();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.detail || 'Failed to save lesson. Please try again.');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await lessonService.deleteLesson(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherLessons'] });
    }
  });

  const openAddModal = () => {
    setEditingLesson(null);
    setFormatType('text');
    setTitle('');
    setDescription('');
    setContent('');
    setAudioUrl('');
    setAudioFile(null);
    setSkillDomain('reading');
    setDifficulty('beginner');
    setEstimatedTime(15);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (lesson: LessonItem) => {
    setEditingLesson(lesson);
    setFormatType(lesson.audio_url ? 'audio' : 'text');
    setTitle(lesson.title);
    setDescription(lesson.description || '');
    setContent(lesson.content || '');
    setAudioUrl(lesson.audio_url || '');
    setAudioFile(null);
    setSkillDomain(lesson.skill_domain);
    setDifficulty(lesson.difficulty);
    setEstimatedTime(lesson.estimated_time || 15);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLesson(null);
    setFormError(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Lesson title is required.');
      return;
    }
    setFormError(null);
    saveMutation.mutate();
  };

  const toggleAudioPlay = (id: number, url: string) => {
    if (playingAudioId === id) {
      audioRef?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioRef) audioRef.pause();
      const newAudio = new Audio(url);
      newAudio.play();
      newAudio.onended = () => setPlayingAudioId(null);
      setAudioRef(newAudio);
      setPlayingAudioId(id);
    }
  };

  if (isLoading) {
    return <LiquidLoader isLooping={true} />;
  }

  const getDomainIcon = (domain: string) => {
    switch (domain.toLowerCase()) {
      case 'writing': return { icon: PenTool, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' };
      case 'speaking': return { icon: Mic, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' };
      case 'listening': return { icon: Headphones, color: 'text-pink-600', bg: 'bg-pink-100', border: 'border-pink-200' };
      default: return { icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' };
    }
  };

  const getDifficultyBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      case 'intermediate': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <MainLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 pb-20"
      >
        {/* Header Row */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
          <div>
            <h2 className="text-sm sm:text-xl text-muted-foreground font-medium mb-1">Create & Assign Adaptive Content</h2>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading uppercase tracking-tight">
              Lesson <span className="highlight-yellow inline-block px-2">Management</span>
            </h1>
          </div>
          
          <button 
            onClick={openAddModal}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-brand-dark text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md hover:bg-brand-dark/90 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5 text-brand-yellow" /> Add New Lesson
          </button>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div 
          variants={itemVariants}
          className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[24px] border border-border/40 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 items-center"
        >
          {/* Search Bar */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-3 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search lessons by title, topic, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted border border-border/50 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 pl-10 sm:pl-12 pr-4 outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/15 transition-all text-xs sm:text-sm font-medium text-brand-dark"
            />
          </div>

          {/* Skill Domain Filter */}
          <div className="relative">
            <select 
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full bg-muted border border-border/50 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-3.5 sm:px-4 outline-none focus:border-brand-yellow font-bold text-xs sm:text-sm text-brand-dark cursor-pointer appearance-none uppercase"
            >
              <option value="All">All Skill Domains</option>
              <option value="reading">📖 Reading</option>
              <option value="writing">✍️ Writing</option>
              <option value="listening">🎧 Listening</option>
              <option value="speaking">🎤 Speaking</option>
            </select>
            <Filter className="absolute right-3.5 top-3 sm:top-4 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Difficulty Filter */}
          <div className="relative">
            <select 
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-muted border border-border/50 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-3.5 sm:px-4 outline-none focus:border-brand-yellow font-bold text-xs sm:text-sm text-brand-dark cursor-pointer appearance-none uppercase"
            >
              <option value="All">All Difficulties</option>
              <option value="beginner">🟢 Beginner</option>
              <option value="intermediate">🟡 Intermediate</option>
              <option value="advanced">🔴 Advanced</option>
            </select>
            <Filter className="absolute right-3.5 top-3 sm:top-4 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground pointer-events-none" />
          </div>
        </motion.div>

        {/* Lessons Cards Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {lessons.length > 0 ? (
            lessons.map((lesson) => {
              const { icon: DomainIcon, color, bg, border } = getDomainIcon(lesson.skill_domain);
              const difficultyBadgeClass = getDifficultyBadge(lesson.difficulty);

              return (
                <div 
                  key={lesson.id}
                  className="bg-white rounded-2xl sm:rounded-[28px] p-5 sm:p-6 border border-border/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${bg} ${color} ${border} flex items-center gap-1.5`}>
                        <DomainIcon className="w-3.5 h-3.5" />
                        {lesson.skill_domain}
                      </span>
                      <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${difficultyBadgeClass}`}>
                        {lesson.difficulty}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-heading text-xl sm:text-2xl text-slate-900 group-hover:text-brand-dark transition-colors line-clamp-2">
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 leading-relaxed line-clamp-3">
                          {lesson.description}
                        </p>
                      )}
                    </div>

                    {/* Format Preview (Audio or Written Text) */}
                    {lesson.audio_url ? (
                      <div className="bg-purple-50/60 p-3 sm:p-4 rounded-xl border border-purple-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                          <Headphones className="w-4 h-4 text-purple-600 shrink-0" />
                          <span className="truncate">Audio Track Attached</span>
                        </div>
                        <button 
                          onClick={() => toggleAudioPlay(lesson.id, lesson.audio_url!)}
                          className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-transform active:scale-95 shrink-0 shadow-xs"
                        >
                          {playingAudioId === lesson.id ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Written Text Lesson</span>
                        </div>
                        {lesson.content && (
                          <p className="text-[11px] text-slate-600 line-clamp-2 italic font-medium">
                            "{lesson.content}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Duration & Actions */}
                  <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{lesson.estimated_time} mins</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditModal(lesson)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                        title="Edit Lesson"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${lesson.title}"?`)) {
                            deleteMutation.mutate(lesson.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        title="Delete Lesson"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-border/40 text-center space-y-4">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-heading text-2xl uppercase">No Lessons Found</h3>
              <p className="text-slate-500 text-sm font-medium">Try adjusting your filters or click "+ Add New Lesson" to create one.</p>
            </div>
          )}
        </motion.div>

        {/* Add / Edit Lesson Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                onClick={closeModal}
              />

              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 p-6 sm:p-8 space-y-6 relative"
              >
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-yellow/30 text-brand-dark flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading text-2xl sm:text-3xl">
                      {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
                    </h3>
                  </div>
                  <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                {formError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-5">
                  {/* Format Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Lesson Content Format</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormatType('text')}
                        className={`p-3.5 rounded-2xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                          formatType === 'text'
                            ? 'border-brand-dark bg-brand-dark text-white shadow-sm'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <FileText className="w-4 h-4" /> Written Text Lesson
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormatType('audio')}
                        className={`p-3.5 rounded-2xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                          formatType === 'audio'
                            ? 'border-purple-600 bg-purple-600 text-white shadow-sm'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Headphones className="w-4 h-4" /> Audio Track Lesson
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Lesson Title *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Advanced Academic Vocabulary & Collocations"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-semibold text-slate-900 outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Short Summary / Description</label>
                    <input 
                      type="text" 
                      placeholder="Brief overview for students..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-semibold text-slate-900 outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20"
                    />
                  </div>

                  {/* Written Content OR Audio Upload */}
                  {formatType === 'text' ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Written Lesson Material / Article</label>
                      <textarea 
                        rows={6}
                        placeholder="Write detailed reading/writing lesson notes or prompt material here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm font-medium text-slate-900 outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 resize-y"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-200">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                          <Upload className="w-4 h-4 text-purple-600" /> Upload Audio MP3/WAV File
                        </label>
                        <input 
                          type="file"
                          accept="audio/*"
                          onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                          className="w-full text-xs font-bold text-slate-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                        />
                      </div>

                      <div className="text-center text-xs font-bold text-slate-400">OR</div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-purple-900">Audio Track Public URL</label>
                        <input 
                          type="url" 
                          placeholder="https://example.com/audio.mp3"
                          value={audioUrl}
                          onChange={(e) => setAudioUrl(e.target.value)}
                          className="w-full bg-white border border-purple-200 rounded-xl p-3 text-xs font-semibold text-slate-900 outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>
                  )}

                  {/* Skill Domain & Difficulty Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Skill Domain */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Target Skill *</label>
                      <select 
                        value={skillDomain}
                        onChange={(e) => setSkillDomain(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-brand-yellow uppercase cursor-pointer"
                      >
                        <option value="reading">📖 Reading</option>
                        <option value="writing">✍️ Writing</option>
                        <option value="listening">🎧 Listening</option>
                        <option value="speaking">🎤 Speaking</option>
                      </select>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Difficulty Level *</label>
                      <select 
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-brand-yellow uppercase cursor-pointer"
                      >
                        <option value="beginner">🟢 Beginner</option>
                        <option value="intermediate">🟡 Intermediate</option>
                        <option value="advanced">🔴 Advanced</option>
                      </select>
                    </div>

                    {/* Estimated Duration */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Est. Time (Mins)</label>
                      <input 
                        type="number"
                        min={1}
                        max={120}
                        value={estimatedTime}
                        onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 15)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-brand-yellow"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-border/50 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-5 py-3 rounded-full font-bold text-xs sm:text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saveMutation.isPending}
                      className="bg-brand-dark text-white px-8 py-3 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 hover:bg-brand-dark/90 transition-transform active:scale-95 shadow-md disabled:opacity-50"
                    >
                      {saveMutation.isPending ? 'Saving...' : editingLesson ? 'Update Lesson' : 'Create Lesson'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </MainLayout>
  );
}
