import { useQuery } from '@tanstack/react-query';
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

export const useReportsSummary = () => {
  return useQuery({
    queryKey: ['teacher', 'reports-summary'],
    queryFn: async () => {
      const { data } = await apiClient.get('/teacher/reports/summary');
      return data;
    },
  });
};
