// AELP Teacher Module Mock Database
// Generates realistic mock data for 100 students, 5 classes, assessments, alerts, and recommendations.

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
  mostImproved: string[];
}

export interface AssessmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  type: 'Speaking' | 'Writing';
  prompt: string;
  submissionDate: string;
  status: 'Pending' | 'Graded';
  // Speaking specific
  audioUrl?: string;
  duration?: string;
  // Writing specific
  textResponse?: string;
  // Rubrics & Grading
  rubricScores?: Record<string, number>;
  totalScore?: number;
  maxScore: number;
  feedback?: string;
}

const firstNames = [
  'Alex', 'Emily', 'Liam', 'Sophia', 'Noah', 'Olivia', 'Ethan', 'Ava', 'Mason', 'Isabella',
  'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn',
  'Alexander', 'Abigail', 'Michael', 'Daniel', 'Elizabeth', 'Sofia', 'Matthew', 'Avery', 'Jackson', 'Ella',
  'Sebastian', 'Madison', 'Aiden', 'Scarlett', 'Chloe', 'Samuel', 'Victoria', 'David', 'Aria', 'Joseph',
  'Grace', 'Carter', 'Owen', 'Zoey', 'Wyatt', 'Penelope', 'Logan', 'Lily', 'Luke', 'Lillian'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const classes = ['Class 10-A', 'Class 10-B', 'Class 9-A', 'Class 9-B', 'Class 8-A'];
const skillGroups = ['Beginner Listening', 'Advanced Reading', 'Intermediate Writing', 'Beginner Speaking', 'Intermediate Speaking', 'Advanced Grammar'];

const lessonList = [
  'Advanced Reading Comprehension',
  'Listening to Podcasts',
  'Argumentative Essay Structure',
  'Business Conversational English',
  'Irregular Verbs Masterclass',
  'Public Speaking Confidence',
  'Idiomatic Expressions',
  'Email Writing Etiquette'
];

const upcomingTests = [
  'Mid-term Oral Speaking Test',
  'Weekly Essay: Climate Change',
  'Diagnostic Level Assessment B2',
  'Listening Exam: Interview Tone'
];

// Helper to generate random number in range
const randomRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate 100 students
export const generateStudents = (): Student[] => {
  const list: Student[] = [];
  
  for (let i = 1; i <= 100; i++) {
    const fName = firstNames[(i - 1) % firstNames.length];
    const lName = lastNames[Math.floor((i - 1) / firstNames.length) % lastNames.length];
    const name = `${fName} ${lName}`;
    const id = `std-${1000 + i}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@aelp.edu`;
    const avatar = fName.charAt(0) + lName.charAt(0);
    const cls = classes[(i - 1) % classes.length];
    
    // Scores configuration based on student bracket
    let bracket: 'high' | 'mid' | 'low' = 'mid';
    if (i % 10 === 0 || i % 15 === 0) bracket = 'low';
    else if (i % 7 === 0 || i % 9 === 0) bracket = 'high';
    
    let l = randomRange(55, 75);
    let r = randomRange(60, 80);
    let w = randomRange(50, 70);
    let s = randomRange(45, 65);
    
    if (bracket === 'low') {
      l = randomRange(30, 52);
      r = randomRange(35, 55);
      w = randomRange(28, 48);
      s = randomRange(25, 45);
    } else if (bracket === 'high') {
      l = randomRange(80, 98);
      r = randomRange(85, 99);
      w = randomRange(78, 95);
      s = randomRange(75, 96);
    }
    
    const overall = Math.round((l + r + w + s) / 4);
    
    let cefr = 'B1';
    if (overall < 40) cefr = 'A1';
    else if (overall < 55) cefr = 'A2';
    else if (overall < 75) cefr = 'B1';
    else if (overall < 88) cefr = 'B2';
    else cefr = 'C1';
    
    let status: Student['status'] = 'Good';
    if (overall < 50) status = 'Critical';
    else if (overall < 68) status = 'Needs Improvement';
    
    const attendance = randomRange(status === 'Critical' ? 68 : 82, 99);
    const streak = randomRange(status === 'Critical' ? 0 : 3, status === 'Good' ? 24 : 10);
    const xp = randomRange(2000, 18000);
    const accuracy = randomRange(overall - 5, Math.min(overall + 5, 100));
    const timeSpent = Math.round((xp / 800) * 10) / 10;
    
    // Progress trends
    const weeklyProgress = [
      randomRange(20, 50),
      randomRange(30, 80),
      randomRange(40, 100),
      randomRange(50, 120),
      randomRange(70, 150),
      randomRange(10, 60),
      0
    ];
    
    const monthlyProgress = [
      randomRange(600, 1000),
      randomRange(800, 1400),
      randomRange(900, 1600),
      randomRange(1100, 2000)
    ];
    
    const completedCount = randomRange(5, 25);
    const completedLessons = [...Array(completedCount)].map((_, idx) => lessonList[idx % lessonList.length]);
    const assignedLessons = [lessonList[completedCount % lessonList.length], lessonList[(completedCount + 1) % lessonList.length]];
    
    const upcomingAssessments = [upcomingTests[(i) % upcomingTests.length]];
    
    const recs: string[] = [];
    if (s < 55) recs.push('Join a 1-on-1 Speaking session focus on vowels.');
    if (w < 55) recs.push('Complete vocabulary drill on transitional adverbs.');
    if (l < 55) recs.push('Listen to Podcast Episode 4: Travel Conversations.');
    if (r < 55) recs.push('Review comprehension questions in Foundations Part 2.');
    if (recs.length === 0) recs.push('Challenge yourself with advanced C1 listening modules.');

    const feedbackHistory = [
      {
        id: `fb-${i}-1`,
        date: '2026-07-15',
        type: 'Speaking' as const,
        score: s - randomRange(-3, 3),
        feedback: s < 50 
          ? 'Needs to focus on word stress and slow down during complex paragraphs.' 
          : 'Great confidence shown. Pronunciation was clear, vocabulary choice was appropriate.',
        teacher: 'Prof. Sarah Jenkins'
      },
      {
        id: `fb-${i}-2`,
        date: '2026-06-28',
        type: 'Writing' as const,
        score: w - randomRange(-2, 4),
        feedback: w < 50 
          ? 'Fragmented sentences are common. Work on connecting ideas using conjunctions.' 
          : 'Highly cohesive structure. Very few grammatical slip-ups.',
        teacher: 'Prof. Sarah Jenkins'
      }
    ];

    const assessmentHistory = [
      {
        id: `as-${i}-1`,
        title: 'Diagnostic Entry Test',
        type: 'Diagnostic' as const,
        date: '2026-06-01',
        score: overall - randomRange(5, 12),
        status: 'Graded' as const
      },
      {
        id: `as-${i}-2`,
        title: 'Mid-term Oral Speaking Test',
        type: 'Speaking' as const,
        date: '2026-07-15',
        score: s,
        status: 'Graded' as const
      }
    ];
    
    list.push({
      id,
      name,
      email,
      avatar,
      class: cls,
      listeningScore: l,
      readingScore: r,
      writingScore: w,
      speakingScore: s,
      overallScore: overall,
      cefrLevel: cefr,
      attendance,
      status,
      group: skillGroups[i % skillGroups.length],
      streak,
      xp,
      accuracy,
      timeSpent,
      weeklyProgress,
      monthlyProgress,
      assignedLessons,
      completedLessons,
      upcomingAssessments,
      recommendations: recs,
      feedbackHistory,
      assessmentHistory
    });
  }
  
  return list;
};

export const mockStudents = generateStudents();

// Generate Classes
export const mockClasses: ClassData[] = classes.map((cls, idx) => {
  const classStudents = mockStudents.filter(s => s.class === cls);
  const total = classStudents.length;
  const avgListening = Math.round(classStudents.reduce((acc, s) => acc + s.listeningScore, 0) / total);
  const avgReading = Math.round(classStudents.reduce((acc, s) => acc + s.readingScore, 0) / total);
  const avgWriting = Math.round(classStudents.reduce((acc, s) => acc + s.writingScore, 0) / total);
  const avgSpeaking = Math.round(classStudents.reduce((acc, s) => acc + s.speakingScore, 0) / total);
  const avgOverall = Math.round((avgListening + avgReading + avgWriting + avgSpeaking) / 4);
  const attendance = Math.round(classStudents.reduce((acc, s) => acc + s.attendance, 0) / total);
  const missing = classStudents.filter(s => s.status === 'Critical').length;
  const needsAttention = classStudents.filter(s => s.status !== 'Good').length;
  
  const sorted = [...classStudents].sort((a, b) => b.overallScore - a.overallScore);
  const topPerformers = sorted.slice(0, 3).map(s => s.name);
  const atRiskStudents = classStudents.filter(s => s.status === 'Critical').slice(0, 3).map(s => s.name);
  const mostImproved = sorted.slice(Math.floor(total/2), Math.floor(total/2) + 3).map(s => s.name);

  return {
    id: `cls-00${idx + 1}`,
    name: cls,
    totalStudents: total,
    avgListening,
    avgReading,
    avgWriting,
    avgSpeaking,
    avgOverall,
    attendance,
    missingAssessments: missing,
    needsAttention,
    topPerformers,
    atRiskStudents,
    mostImproved
  };
});

// Generate 20 assessments (submissions awaiting grading or recently graded)
export const generateAssessments = (): AssessmentSubmission[] => {
  const submissions: AssessmentSubmission[] = [];
  
  const speakingPrompts = [
    'Describe your favorite childhood memory and explain why it remains special to you.',
    'Express your opinion on whether remote work makes employees more or less productive.',
    'Describe a place of natural beauty that you have visited recently.',
    'Summarize a book or film that made a deep impression on you.',
    'Discuss the advantages and disadvantages of social networking sites.'
  ];

  const writingPrompts = [
    'Some people believe that university education should be free for everyone. To what extent do you agree or disagree?',
    'Write a letter requesting information about an English proficiency course starting next month.',
    'Analyze the effects of urbanization on environmental sustainability in major metropolitan areas.',
    'Write a narrative passage about an unexpected journey that changed the narrator\'s perspective.',
    'Explain the importance of preserving traditional cultures in a globalized world.'
  ];

  const writingEssays = [
    'University education should indeed be accessible to all regardless of financial status. If higher education is restricted to those who can pay, society wastes immense human potential. Gifted minds from impoverished backgrounds might never develop, leading to systemic inequality. In conclusion, free university education promotes meritocracy and uplifts national productivity.',
    'Dear Sir/Madam, I am writing to express my interest in enrolling in the Advanced IELTS Preparation Course beginning next month. Could you kindly provide details regarding the exact schedule, course syllabus, and pricing options? Thank you for your time. Sincerely, Alex.',
    'Rapid urbanization represents a significant threat to global environmental sustainability. As concrete structures replace green covers, city temperatures rise due to the heat island effect. Furthermore, industrial waste pollutes waterways. Cities must adopt green infrastructure like rooftop gardens and public mass transits to mitigate these severe impacts.',
    'The train rattled to a stop at a station not listed on my itinerary. Stepping out onto the foggy platform, I was greeted by an elderly gentleman who offered me a hot cup of tea. That cold night in a strange village, surrounded by kind strangers, taught me that life\'s greatest treasures are found when we are thoroughly lost.',
    'Preserving cultural heritage in our globalized world is essential to maintain diversity. Global commercialization tends to homogenize foods, values, and languages. Preserving traditional arts, folktales, and practices ensures that subsequent generations stay rooted in their unique histories, giving them a sense of identity.'
  ];

  // Pick first 20 students to have assessments
  for (let i = 0; i < 20; i++) {
    const student = mockStudents[i];
    const isSpeaking = i % 2 === 0;
    const isPending = i < 8; // First 8 are pending evaluation, rest are already graded
    
    const prompt = isSpeaking 
      ? speakingPrompts[i % speakingPrompts.length]
      : writingPrompts[i % writingPrompts.length];
      
    const date = `2026-07-26`;
    
    let sub: AssessmentSubmission = {
      id: `asub-${2000 + i}`,
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      type: isSpeaking ? 'Speaking' : 'Writing',
      prompt,
      submissionDate: date,
      status: isPending ? 'Pending' : 'Graded',
      maxScore: 50
    };
    
    if (isSpeaking) {
      sub.audioUrl = `https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg`;
      sub.duration = `1:15`;
      
      if (!isPending) {
        sub.rubricScores = {
          pronunciation: randomRange(6, 10),
          fluency: randomRange(5, 10),
          vocabulary: randomRange(7, 10),
          grammar: randomRange(6, 10),
          confidence: randomRange(7, 10)
        };
        sub.totalScore = Object.values(sub.rubricScores).reduce((a, b) => a + b, 0);
        sub.feedback = 'Clear delivery and good conversational flow. Pronunciation of vowel sounds is excellent. Minor pauses when thinking of vocabulary, but self-corrected quickly.';
      }
    } else {
      sub.textResponse = writingEssays[i % writingEssays.length];
      
      if (!isPending) {
        sub.rubricScores = {
          grammar: randomRange(6, 10),
          vocabulary: randomRange(7, 10),
          sentenceStructure: randomRange(6, 10),
          creativity: randomRange(6, 10),
          spelling: randomRange(8, 10)
        };
        sub.totalScore = Object.values(sub.rubricScores).reduce((a, b) => a + b, 0);
        sub.feedback = 'Very cohesive arguments. Vocabulary choice shows high proficiency. Grammar is overall solid, with minor errors in the use of articles. Spelling is perfect.';
      }
    }
    
    submissions.push(sub);
  }
  
  return submissions;
};

export const mockAssessments = generateAssessments();

// Alerts
export const mockAlerts = [
  { id: 'al-1', type: 'critical', message: '12 students have not completed their weekly assessments.', class: 'All Classes' },
  { id: 'al-2', type: 'warning', message: '8 students are failing Speaking goals and need 1-on-1 speaking practice.', class: 'Class 10-A' },
  { id: 'al-3', type: 'warning', message: '5 students have shown no score improvements for the last 3 weeks.', class: 'Class 9-B' },
  { id: 'al-4', type: 'info', message: '3 students have crossed B2 margins and are ready for promotion.', class: 'Class 10-B' }
];

// Recommendations
export const mockRecommendations = [
  { id: 'rec-1', issue: 'General cohort weakness in Speaking Fluency.', suggestedActivity: 'Pairwise Speaking & Conversation Practice', duration: '30 Minutes', focus: 'Speaking' },
  { id: 'rec-2', issue: 'High grammatical error rate in past Writing submissions.', suggestedActivity: 'Transitional Phrases & Conjunctions Drills', duration: '20 Minutes', focus: 'Writing' },
  { id: 'rec-3', issue: 'Decline in Listening accuracy for conversational audio.', suggestedActivity: 'Listening Comprehension: Podcasting Unit 2', duration: '15 Minutes', focus: 'Listening' }
];

// Notifications
export const mockNotifications = [
  { id: 'nt-1', date: '2026-07-27 10:15', title: 'New Submission', desc: 'Liam Lopez submitted Mid-term Speaking Test.', unread: true },
  { id: 'nt-2', date: '2026-07-27 09:30', title: 'Critical Alert', desc: 'Class 9-A average speaking score dropped by 4%.', unread: true },
  { id: 'nt-3', date: '2026-07-26 15:45', title: 'System Notification', desc: 'Diagnostic assessment questions updated for Unit 2.', unread: false }
];
