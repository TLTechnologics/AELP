import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export const useStudents = () => {
  return useQuery({
    queryKey: ['teacher', 'students'],
    queryFn: async () => {
      const { data } = await api.get('/teacher/students');
      return data;
    },
  });
};

export const useStudentDetails = (id: string) => {
  return useQuery({
    queryKey: ['teacher', 'student', id],
    queryFn: async () => {
      const { data } = await api.get(`/teacher/students/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useReportsSummary = () => {
  return useQuery({
    queryKey: ['teacher', 'reports-summary'],
    queryFn: async () => {
      const { data } = await api.get('/teacher/reports/summary');
      return data;
    },
  });
};
