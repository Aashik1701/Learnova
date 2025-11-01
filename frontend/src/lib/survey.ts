export type SurveyOption = {
  value: string;
  label: string;
};

export type SurveyQuestion = {
  id:
    | 'proficiency'
    | 'timeCommitment'
    | 'goal'
    | 'learningStyle'
    | 'interest'
    | 'priorKnowledge'
    | 'motivation'
    | 'pace'
    | 'assessmentPreference'
    | 'background'
    | 'deadline';
  question: string;
  options: SurveyOption[];
};

export const GeneralSurveyQuestions: SurveyQuestion[] = [
  {
    id: 'proficiency',
    question: 'What is your current level of understanding for {topic}?',
    options: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
    ],
  },
  {
    id: 'timeCommitment',
    question: 'How many hours per week can you dedicate?',
    options: [
      { value: '<2h', label: '< 2 hours' },
      { value: '2-4h', label: '2 - 4 hours' },
      { value: '5-7h', label: '5 - 7 hours' },
      { value: '8h+', label: '8+ hours' },
    ],
  },
  {
    id: 'goal',
    question: 'What is your primary learning goal with {topic}?',
    options: [
      { value: 'career', label: 'Career advancement' },
      { value: 'academic', label: 'Academic success' },
      { value: 'personal', label: 'Personal growth' },
    ],
  },
  {
    id: 'learningStyle',
    question: 'What is your preferred learning style?',
    options: [
      { value: 'visual', label: 'Visual (diagrams, charts)' },
      { value: 'hands-on', label: 'Hands-on (projects, practice)' },
      { value: 'reading', label: 'Reading/Writing' },
      { value: 'auditory', label: 'Auditory' },
    ],
  },
  {
    id: 'interest',
    question: 'Within {topic}, which area interests you the most?',
    options: [
      { value: 'fundamentals', label: 'Fundamentals' },
      { value: 'applications', label: 'Practical applications' },
      { value: 'theory', label: 'Theory & concepts' },
      { value: 'projects', label: 'Projects & case studies' },
    ],
  },
  {
    id: 'priorKnowledge',
    question: 'Which prerequisite areas have you studied related to {topic}?',
    options: [
      { value: 'none', label: 'None' },
      { value: 'basics', label: 'Basics in related subjects' },
      { value: 'math', label: 'Mathematical/analytical background' },
      { value: 'coding', label: 'Programming experience' },
    ],
  },
  {
    id: 'motivation',
    question: 'What best describes your motivation for learning {topic}?',
    options: [
      { value: 'upskill', label: 'Upskilling / reskilling' },
      { value: 'exam', label: 'Exam or certification' },
      { value: 'project', label: 'Specific project need' },
      { value: 'curiosity', label: 'Curiosity / personal interest' },
    ],
  },
  {
    id: 'pace',
    question: 'What learning pace do you prefer for {topic}?',
    options: [
      { value: 'slow', label: 'Slow (step-by-step, more practice)' },
      { value: 'moderate', label: 'Moderate (balanced)' },
      { value: 'fast', label: 'Fast (condensed, advanced insights)' },
    ],
  },
  {
    id: 'assessmentPreference',
    question: 'How would you like to assess your understanding of {topic}?',
    options: [
      { value: 'quizzes', label: 'Short quizzes' },
      { value: 'assignments', label: 'Hands-on assignments' },
      { value: 'projects', label: 'Mini projects' },
      { value: 'reviews', label: 'Review summaries' },
    ],
  },
  {
    id: 'background',
    question: 'What is your background most relevant to {topic}?',
    options: [
      { value: 'student', label: 'Student' },
      { value: 'professional', label: 'Working professional' },
      { value: 'switcher', label: 'Career switcher' },
      { value: 'hobbyist', label: 'Hobbyist / Enthusiast' },
    ],
  },
  {
    id: 'deadline',
    question: 'Do you have a target timeline to get comfortable with {topic}?',
    options: [
      { value: '1-2w', label: '1–2 weeks' },
      { value: '1m', label: 'About 1 month' },
      { value: '3m', label: 'About 3 months' },
      { value: 'flexible', label: 'Flexible / no deadline' },
    ],
  },
];
