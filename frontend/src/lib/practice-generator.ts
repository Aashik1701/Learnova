import { QuestionnaireAnswers, Chapter } from "@/pages/Practice";

const chapterTemplates = {
  beginner: [
    "Introduction and Fundamentals",
    "Basic Concepts and Terminology",
    "Getting Started with Practice",
    "Core Principles Explained",
    "Building Your Foundation",
  ],
  intermediate: [
    "Intermediate Techniques",
    "Practical Applications",
    "Advanced Concepts Introduction",
    "Problem-Solving Strategies",
    "Refining Your Skills",
  ],
  advanced: [
    "Advanced Theory and Practice",
    "Expert-Level Techniques",
    "Complex Problem Solving",
    "Mastery and Innovation",
    "Professional Applications",
  ],
};

const contentTemplates = {
  visual: (topic: string) => `This chapter explores ${topic} through visual examples and diagrams.

Visual learning emphasizes understanding through seeing patterns, relationships, and structures. When studying ${topic}, it's helpful to create mental images and diagrams that represent the key concepts.

Key Visual Elements:
- Diagrams that show relationships between concepts
- Charts that organize information hierarchically
- Visual metaphors that make abstract ideas concrete
- Color coding to distinguish different categories

Practice visualizing the concepts as you study. Draw your own diagrams and sketches to reinforce your understanding. This approach helps create lasting mental models that you can recall when needed.

Remember: The goal is to build a visual framework in your mind that makes the information easier to retrieve and apply in practical situations.`,
  
  practical: (topic: string) => `This chapter focuses on hands-on practice and real-world applications of ${topic}.

Learning through doing is one of the most effective approaches. This section will guide you through practical exercises and scenarios where you can apply ${topic} directly.

Practical Applications:
- Real-world scenarios where you'll use these skills
- Step-by-step exercises to build muscle memory
- Common problems and their solutions
- Tips from practitioners in the field

Try to practice each concept immediately after learning it. The more you apply these ideas in practical contexts, the better they will stick. Don't just read - actively engage with the material through hands-on experimentation.

Challenge yourself to find new ways to apply what you're learning in your daily life or work.`,
  
  theoretical: (topic: string) => `This chapter examines the theoretical foundations and principles underlying ${topic}.

Understanding theory provides the intellectual framework needed for deep mastery. While practical skills are important, theoretical knowledge explains why things work the way they do.

Theoretical Framework:
- Fundamental principles and laws
- Historical development of key ideas
- Logical relationships between concepts
- Theoretical models and their applications

Take time to reflect on these theories. Ask yourself why each principle matters and how it connects to other concepts you've learned. Theory provides the "why" behind the "how."

The strongest practitioners combine theoretical understanding with practical experience. Use this theoretical knowledge as a foundation for all your future learning.`,
};

const quizTemplates = {
  beginner: [
    {
      question: "What is the main focus of this chapter?",
      options: [
        "Advanced techniques for experts",
        "Building fundamental understanding",
        "Specialized applications only",
        "Historical context only"
      ],
      correctAnswer: 1
    },
    {
      question: "Which approach is emphasized for beginners?",
      options: [
        "Immediate mastery",
        "Skipping basics",
        "Step-by-step learning",
        "Random exploration"
      ],
      correctAnswer: 2
    },
    {
      question: "What should you prioritize at this level?",
      options: [
        "Expert-level problems",
        "Core concepts and terminology",
        "Complex theories only",
        "Advanced certifications"
      ],
      correctAnswer: 1
    },
  ],
  intermediate: [
    {
      question: "What distinguishes intermediate from beginner level?",
      options: [
        "No need to review basics",
        "Application of concepts in varied contexts",
        "Complete mastery achieved",
        "Theory only, no practice"
      ],
      correctAnswer: 1
    },
    {
      question: "What's important at the intermediate stage?",
      options: [
        "Ignoring fundamentals",
        "Only memorizing facts",
        "Connecting concepts together",
        "Avoiding challenges"
      ],
      correctAnswer: 2
    },
    {
      question: "How should you approach problem-solving now?",
      options: [
        "Always look up answers",
        "Apply learned principles independently",
        "Avoid difficult problems",
        "Only follow examples exactly"
      ],
      correctAnswer: 1
    },
  ],
  advanced: [
    {
      question: "What characterizes advanced understanding?",
      options: [
        "Memorization of all facts",
        "Following instructions only",
        "Deep comprehension and innovation",
        "Avoiding complex topics"
      ],
      correctAnswer: 2
    },
    {
      question: "At an advanced level, you should be able to:",
      options: [
        "Explain concepts to others clearly",
        "Only solve textbook problems",
        "Avoid teaching others",
        "Stick to basic applications"
      ],
      correctAnswer: 0
    },
    {
      question: "What's the focus of advanced study?",
      options: [
        "Reviewing basics only",
        "Mastery, innovation, and contribution",
        "Avoiding challenging material",
        "Speed over understanding"
      ],
      correctAnswer: 1
    },
  ],
};

export const generateChapters = (answers: QuestionnaireAnswers): Chapter[] => {
  const proficiency = answers.proficiency as keyof typeof chapterTemplates;
  const learningStyle = answers.learningStyle as keyof typeof contentTemplates;
  
  const chapterTitles = chapterTemplates[proficiency] || chapterTemplates.beginner;
  const quizQuestions = quizTemplates[proficiency] || quizTemplates.beginner;
  
  return chapterTitles.map((title, index) => ({
    id: `chapter-${index}`,
    title,
    content: contentTemplates[learningStyle](title),
    quiz: {
      questions: quizQuestions
    },
    completed: false,
  }));
};
