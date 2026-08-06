import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export const useStudents = () => {
  return useQuery({
    queryKey: ['teacher', 'students'],
    queryFn: async () => {
      const { data } = await apiClient.get('/teacher/students');
      return data;
    },
  });
};

export const useStudentDetails = (id: string) => {
  return useQuery({
    queryKey: ['teacher', 'student', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/teacher/students/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useUpdateStudent = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: response } = await apiClient.put(`/teacher/students/${id}`, data);
      return response;
    }
  });
};

export const useDeleteStudent = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: response } = await apiClient.delete(`/teacher/students/${id}`);
      return response;
    }
  });
};

export const useReportsSummary = () => {
  return useQuery({
    queryKey: ['teacher', 'reports-summary'],
    queryFn: async () => {
      const { data } = await apiClient.get('/teacher/reports/summary');
      return data;
    },
  });
};

export const useClassAnalytics = () => {
  return useQuery({
    queryKey: ['teacher', 'class-analytics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/teacher/class-analytics');
      return data;
    },
  });
};

export const useWritingSubmissions = () => {
  return useQuery({
    queryKey: ['teacher', 'writing-submissions'],
    queryFn: async () => {
      const { data } = await apiClient.get('/teacher/writing-submissions');
      return data;
    },
  });
};

export const useEvaluateWriting = () => {
  return useMutation({
    mutationFn: async (submissionId: string | number) => {
      const { data } = await apiClient.post(`/teacher/evaluate-writing/${submissionId}`);
      return data;
    }
  });
};

export const useSpeakingSubmissions = () => {
  return useQuery({
    queryKey: ['teacher', 'speaking-submissions'],
    queryFn: async () => {
      const { data } = await apiClient.get('/teacher/speaking-submissions');
      return data;
    },
  });
};

export const useEvaluateSpeaking = () => {
  return useMutation({
    mutationFn: async (recordingId: string | number) => {
      const { data } = await apiClient.post(`/teacher/evaluate-speaking/${recordingId}`);
      return data;
    }
  });
};
