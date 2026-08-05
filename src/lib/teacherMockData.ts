// AELP Teacher Module Mock Database
// Cleared dummy data.

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  class: string;
  listeningScore: number;
  readingScore: number;
  writingScore: number;
  speakingScore: number;
  overallScore: number;
  cefrLevel: string;
  attendance: number;
  status: 'Good' | 'Needs Improvement' | 'Critical';
  group: string;
  streak: number;
  xp: number;
  accuracy: number;
  timeSpent: number;
  weeklyProgress: number[];
  monthlyProgress: number[];
  assignedLessons: string[];
  completedLessons: string[];
  upcomingAssessments: string[];
  recommendations: string[];
  feedbackHistory: Array<{
    id: string;
    date: string;
    type: 'Speaking' | 'Writing' | 'General';
    score?: number;
    feedback: string;
    teacher: string;
  }>;
  assessmentHistory: Array<{
    id: string;
    title: string;
    type: 'Speaking' | 'Writing' | 'Diagnostic';
    date: string;
    score: number;
    status: 'Graded' | 'Pending';
  }>;
}

export interface ClassData {
  id: string;
  name: string;
  totalStudents: number;
  avgListening: number;
  avgReading: number;
  avgWriting: number;
  avgSpeaking: number;
  avgOverall: number;
  attendance: number;
  missingAssessments: number;
  needsAttention: number;
  topPerformers: string[];
  atRiskStudents: string[];
}

export interface Assessment {
  id: string;
  title: string;
  type: 'Speaking' | 'Writing';
  targetClass: string;
  assignedDate: string;
  dueDate: string;
  totalSubmissions: number;
  gradedCount: number;
  status: 'Pending' | 'Graded';
  submissions: Array<{
    studentId: string;
    studentName: string;
    avatar: string;
    submittedDate: string;
    status: 'Pending' | 'Graded';
    audioUrl?: string;
    textResponse?: string;
    rubricScores?: {
      pronunciation?: number;
      fluency?: number;
      grammar?: number;
      vocabulary?: number;
      sentenceStructure?: number;
      creativity?: number;
      spelling?: number;
      confidence?: number;
    };
    totalScore?: number;
    feedback?: string;
  }>;
}

export const mockStudents: Student[] = [];
export const mockClasses: ClassData[] = [];
export const mockAssessments: Assessment[] = [];
export const mockAlerts: Array<any> = [];
export const mockRecommendations: Array<any> = [];
export const mockNotifications: Array<any> = [];
