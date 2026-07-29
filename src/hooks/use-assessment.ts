import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentService, writingService } from '@/services/api';

export function useReadingAssessment() {
  return useQuery({
    queryKey: ['readingAssessment'],
    queryFn: async () => {
      const { data } = await assessmentService.getReadingAssessment();
      return data;
    }
  });
}

export function useWritingAssessment() {
  return useQuery({
    queryKey: ['writingAssessment'],
    queryFn: async () => {
      const { data } = await assessmentService.getWritingAssessment();
      return data;
    }
  });
}

export function useSpeakingAssessment() {
  return useQuery({
    queryKey: ['speakingAssessment'],
    queryFn: async () => {
      const { data } = await assessmentService.getSpeakingAssessment();
      return data;
    }
  });
}

export function useSubmitReading() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (answers: Array<{ question_id: number; selected_option_id?: number; text_answer?: string }>) => {
      const { data } = await assessmentService.submitReadingAssessment({ student_id: 1, answers });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

export function useSubmitWriting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: { prompt: string; submission: string }) => {
      const { data } = await writingService.submitEvaluation({ student_id: 1, ...payload });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

export function useSubmitSpeaking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: FormData) => {
      const { data } = await assessmentService.submitSpeakingAssessment(payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}
