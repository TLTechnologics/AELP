import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aelp.onrender.com/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Supabase Auth Token and handle FormData
apiClient.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // If data is FormData, delete Content-Type so Axios/browser sets boundary automatically
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authService = {
  getProfile: () => apiClient.get('/auth/profile'),
};

export const progressService = {
  getHistory: () => apiClient.get('/progress/history'),
};

export const dashboardService = {
  getDashboard: () => apiClient.get('/dashboard'),
};

export const learningPathService = {
  getRoadmap: () => apiClient.get('/path'),
};

export const resultsService = {
  getResults: (params?: any) => apiClient.get('/results', { params }),
  getResultDetails: (id: string | number) => apiClient.get(`/results/${id}`),
};

export const lessonService = {
  getLearningPath: () => apiClient.get('/lessons/path'),
  getLesson: (id: string) => apiClient.get(`/lessons/${id}`),
  getLessons: (params?: { skill?: string; difficulty?: string; search?: string }) => 
    apiClient.get('/teacher/lessons', { params }).catch(() => apiClient.get('/lessons', { params })),
  createLesson: (data: FormData) => 
    apiClient.post('/teacher/lessons', data).catch(() => apiClient.post('/lessons', data)),
  updateLesson: (id: number | string, data: FormData) => 
    apiClient.put(`/teacher/lessons/${id}`, data).catch(() => apiClient.put(`/lessons/${id}`, data)),
  deleteLesson: (id: number | string) => 
    apiClient.delete(`/teacher/lessons/${id}`).catch(() => apiClient.delete(`/lessons/${id}`)),
};

export const assessmentService = {
  getReadingAssessment: () => apiClient.get('/assessments/reading'),
  getWritingAssessment: () => apiClient.get('/assessments/writing'),
  getSpeakingAssessment: () => apiClient.get('/assessments/speaking'),
  getListeningAssessment: () => apiClient.get('/assessments/listening'),
  submitReadingAssessment: (payload: any) => apiClient.post('/assessments/submit/reading', payload),
  submitListeningAssessment: (payload: any) => apiClient.post('/assessments/listening/submit', payload),
  submitSpeakingAssessment: (payload: FormData) => apiClient.post('/speaking/evaluate', payload),
  submitSpeakingAssessmentText: (payload: { assessment_id: number, prompt: string, duration: number, transcript: string }) => apiClient.post('/speaking/evaluate-text', payload),
  getAssessment: (id: string) => apiClient.get(`/assessments/${id}`),
  submitAssessment: (id: string, payload: any) => apiClient.post(`/assessments/${id}/submit`, payload),
};

export const speakingService = {
  submitEvaluationText: (payload: any) => apiClient.post('/speaking/evaluate-text', payload),
};

export const writingService = {
  submitEvaluation: (payload: any) => apiClient.post('/writing/evaluate', payload),
};

export const teacherService = {
  getStudents: () => apiClient.get('/teacher/students'),
  addStudent: (data: { full_name: string; email: string; password: string; semester: string }) => apiClient.post('/teacher/students', data),
  uploadSpeakingAssessment: (payload: { title: string; difficulty: string; topic: string }) => apiClient.post('/teacher/assessments/speaking', payload),
  uploadWritingAssessment: (payload: { title: string; difficulty: string; topic: string }) => apiClient.post('/teacher/assessments/writing', payload),
  uploadReadingAssessment: (payload: { 
    title: string; 
    difficulty: string; 
    reading_passage: string; 
    questions: Array<{ type?: string; text: string; marks: number; options: Array<{ text: string; is_correct: boolean }> }> 
  }) => apiClient.post('/teacher/assessments/reading', payload),
  uploadListeningAssessment: (payload: FormData) => apiClient.post('/teacher/assessments/listening', payload),
};
