import { useQuery } from '@tanstack/react-query';
import { lessonService } from '@/services/api';

export function useLearningPath() {
  return useQuery({
    queryKey: ['learningPath'],
    queryFn: async () => {
      try {
        const { data } = await lessonService.getLearningPath();
        return data;
      } catch (error) {
        console.warn('Backend not reachable, using fallback learning path.');
        return [
          { id: '1', title: 'Unit 4: Advanced Comprehension', type: 'Reading', time: '15 min', status: 'Next' },
        ];
      }
    }
  });
}

export function useLesson(id: string) {
  return useQuery({
    queryKey: ['lesson', id],
    queryFn: async () => {
      try {
        const { data } = await lessonService.getLesson(id);
        return data;
      } catch (error) {
        return {
          id: '1',
          title: 'Advanced Comprehension',
          content: 'This is the lesson content.',
          video_url: null,
          pdf_url: null,
        };
      }
    },
    enabled: !!id,
  });
}
