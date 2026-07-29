import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Supabase Auth Token
apiClient.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authService = {
  getProfile: () => apiClient.get('/auth/profile'),
};

export const progressService = {
  getDashboard: () => apiClient.get('/progress/dashboard'),
  getHistory: () => apiClient.get('/progress/history'),
};

export const lessonService = {
  getLearningPath: () => apiClient.get('/lessons/path'),
  getLesson: (id: string) => apiClient.get(`/lessons/${id}`),
};

export const assessmentService = {
  getReadingAssessment: () => apiClient.get('/assessments/reading'),
  getWritingAssessment: () => apiClient.get('/assessments/writing'),
  getSpeakingAssessment: () => apiClient.get('/assessments/speaking'),
  submitReadingAssessment: (payload: any) => apiClient.post('/assessments/submit/reading', payload),
  submitSpeakingAssessment: (payload: FormData) => apiClient.post('/speaking/submit', payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getAssessment: (id: string) => apiClient.get(`/assessments/${id}`),
  submitAssessment: (id: string, payload: any) => apiClient.post(`/assessments/${id}/submit`, payload),
};

export const writingService = {
  submitEvaluation: (payload: any) => apiClient.post('/writing/evaluate', payload),
};
