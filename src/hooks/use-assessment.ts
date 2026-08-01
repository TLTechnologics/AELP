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

export function useListeningAssessment() {
  return useQuery({
    queryKey: ['listeningAssessment'],
    queryFn: async () => {
      const { data } = await assessmentService.getListeningAssessment();
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
    mutationFn: async (formData: FormData) => {
      const { data } = await assessmentService.submitSpeakingAssessment(formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

export function useSubmitSpeakingText() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: { assessment_id: number; prompt: string; duration: number; transcript: string }) => {
      let lastError;
      for (let i = 0; i < 3; i++) {
        try {
          const { data } = await assessmentService.submitSpeakingAssessmentText(payload);
          return data;
        } catch (e: any) {
          lastError = e;
          // Don't retry client errors (4xx) except timeouts/network errors
          if (e.response && e.response.status >= 400 && e.response.status < 500 && e.response.status !== 408 && e.response.status !== 429) {
            throw e; 
          }
          console.warn(`Retry ${i + 1}/3 for submitSpeakingAssessmentText due to error:`, e.message);
          await new Promise(res => setTimeout(res, 2000 * (i + 1))); // Exponential backoff
        }
      }
      throw lastError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

export function useSubmitListening() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (answers: Array<{ question_id: number; selected_option_id?: number; text_answer?: string }>) => {
      const { data } = await assessmentService.submitListeningAssessment({ student_id: 1, answers });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}
