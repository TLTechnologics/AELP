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

export const mockStudents: Student[] = [
  {
    id: 's1',
    name: 'Emma Thompson',
    email: 'emma.t@example.com',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    class: 'Cohort A',
    listeningScore: 88,
    readingScore: 92,
    writingScore: 85,
    speakingScore: 78,
    overallScore: 86,
    cefrLevel: 'B2',
    attendance: 95,
    status: 'Good',
    group: 'Advanced Reading',
    streak: 12,
    xp: 2450,
    accuracy: 89,
    timeSpent: 1240,
    weeklyProgress: [40, 60, 45, 80, 95, 85, 90],
    monthlyProgress: [75, 80, 82, 86],
    assignedLessons: ['l1', 'l2'],
    completedLessons: ['l0'],
    upcomingAssessments: ['a1'],
    recommendations: ['Focus on vowel phonemes'],
    feedbackHistory: [],
    assessmentHistory: []
  },
  {
    id: 's2',
    name: 'James Wilson',
    email: 'j.wilson@example.com',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    class: 'Cohort A',
    listeningScore: 45,
    readingScore: 52,
    writingScore: 48,
    speakingScore: 40,
    overallScore: 46,
    cefrLevel: 'A2',
    attendance: 72,
    status: 'Critical',
    group: 'Beginner Listening',
    streak: 2,
    xp: 850,
    accuracy: 45,
    timeSpent: 420,
    weeklyProgress: [20, 10, 30, 15, 40, 20, 10],
    monthlyProgress: [50, 48, 45, 46],
    assignedLessons: ['l1'],
    completedLessons: [],
    upcomingAssessments: ['a1'],
    recommendations: ['Grammar review required'],
    feedbackHistory: [],
    assessmentHistory: []
  },
  {
    id: 's3',
    name: 'Sofia Rodriguez',
    email: 'sofia.r@example.com',
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
    class: 'Cohort B',
    listeningScore: 75,
    readingScore: 82,
    writingScore: 70,
    speakingScore: 85,
    overallScore: 78,
    cefrLevel: 'B1',
    attendance: 90,
    status: 'Needs Improvement',
    group: 'Intermediate Writing',
    streak: 5,
    xp: 1600,
    accuracy: 75,
    timeSpent: 980,
    weeklyProgress: [60, 65, 70, 68, 75, 80, 78],
    monthlyProgress: [70, 72, 75, 78],
    assignedLessons: ['l3'],
    completedLessons: ['l1'],
    upcomingAssessments: ['a2'],
    recommendations: ['Writing structure practice'],
    feedbackHistory: [],
    assessmentHistory: []
  }
];

export const mockClasses: ClassData[] = [
  {
    id: 'c1',
    name: 'Cohort A',
    totalStudents: 25,
    avgListening: 72,
    avgReading: 78,
    avgWriting: 68,
    avgSpeaking: 65,
    avgOverall: 71,
    attendance: 88,
    missingAssessments: 3,
    needsAttention: 4,
    topPerformers: ['Emma Thompson'],
    atRiskStudents: ['James Wilson']
  },
  {
    id: 'c2',
    name: 'Cohort B',
    totalStudents: 22,
    avgListening: 65,
    avgReading: 70,
    avgWriting: 62,
    avgSpeaking: 75,
    avgOverall: 68,
    attendance: 92,
    missingAssessments: 1,
    needsAttention: 2,
    topPerformers: ['Sofia Rodriguez'],
    atRiskStudents: []
  }
];

export const mockAssessments: Assessment[] = [
  {
    id: 'a1',
    title: 'Mid-term Speaking Eval',
    type: 'Speaking',
    targetClass: 'Cohort A',
    assignedDate: '2026-08-20',
    dueDate: '2026-08-28',
    totalSubmissions: 25,
    gradedCount: 15,
    status: 'Pending',
    submissions: []
  }
];

export const mockAlerts = [
  { id: 'al1', type: 'critical', class: 'Cohort A', message: '3 students missed the weekly writing assessment.' },
  { id: 'al2', type: 'warning', class: 'Cohort B', message: 'Speaking scores dropped by 5% this week.' },
  { id: 'al3', type: 'info', class: 'Global', message: 'New curriculum update available for B1 students.' }
];

export const mockRecommendations = [
  { id: 'r1', focus: 'Pronunciation', issue: 'Struggling with TH sounds.', suggestedActivity: 'Phonetics Drill Module 4', duration: '15 mins' },
  { id: 'r2', focus: 'Grammar', issue: 'Past tense irregularities.', suggestedActivity: 'Verb Conjugation Quiz', duration: '10 mins' }
];

export const mockNotifications = [
  { id: 'n1', title: 'Assessment Graded', desc: 'System auto-graded 15 writing submissions.', date: '2026-08-26 09:00 AM', unread: true },
  { id: 'n2', title: 'Student Alert', desc: 'James Wilson attendance dropped below 75%.', date: '2026-08-25 02:30 PM', unread: false }
];
