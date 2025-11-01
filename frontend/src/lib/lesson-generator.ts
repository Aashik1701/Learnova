interface QuestionnaireAnswers {
  proficiency: string;
  interest: string;
  goal: string;
  timeCommitment: string;
  learningStyle: string;
}

interface Chapter {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  quizScore: number | null;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const generateChapters = (lessonName: string, answers: QuestionnaireAnswers): Chapter[] => {
  const { proficiency, goal, learningStyle } = answers;
  
  const chapterCount = proficiency === 'beginner' ? 5 : proficiency === 'intermediate' ? 4 : 3;
  const chapters: Chapter[] = [];

  const chapterTemplates = [
    {
      title: `Introduction to ${lessonName}`,
      content: `Welcome to ${lessonName}! This chapter introduces the fundamental concepts and core principles you'll need to master. 

We'll start with the basics and build a strong foundation. ${learningStyle === 'visual' ? 'Visual learners will find diagrams and examples throughout.' : learningStyle === 'hands-on' ? 'We recommend trying examples as you read.' : 'Take notes and review concepts regularly.'}

Key concepts covered:
• Understanding the fundamentals
• Core terminology and definitions
• Historical context and evolution
• Why ${lessonName} matters today
• Real-world applications and examples

${goal === 'career' ? 'This knowledge will be crucial for your career advancement.' : goal === 'personal' ? 'Master these concepts at your own pace.' : 'These fundamentals are essential for academic success.'}

Remember: Everyone starts somewhere. Take your time to absorb the material, and don't hesitate to revisit sections as needed.`
    },
    {
      title: `Core Principles of ${lessonName}`,
      content: `Now that you understand the basics, let's dive deeper into the core principles that make ${lessonName} work.

These principles form the backbone of everything you'll learn moving forward. Understanding them thoroughly will make advanced topics much easier to grasp.

Main principles include:
• Principle 1: Foundation concepts
• Principle 2: Building blocks
• Principle 3: Interconnections
• Principle 4: Practical applications
• Principle 5: Advanced considerations

${proficiency === 'beginner' ? 'Take your time with these concepts—they might seem complex at first, but they\'ll become clearer with practice.' : 'You may already be familiar with some of these, but reviewing them will strengthen your understanding.'}

Practice exercises:
1. Identify examples in everyday life
2. Explain concepts in your own words
3. Draw connections between principles
4. Apply them to sample problems

The goal is not just to memorize, but to truly understand how these principles work together.`
    },
    {
      title: `Advanced Techniques in ${lessonName}`,
      content: `Congratulations on making it this far! Now we'll explore advanced techniques that professionals use in ${lessonName}.

These techniques build upon the fundamentals you've mastered and take your skills to the next level. You'll learn how experts approach complex problems and create elegant solutions.

Advanced topics covered:
• Technique 1: Expert approaches
• Technique 2: Optimization strategies
• Technique 3: Problem-solving frameworks
• Technique 4: Industry best practices
• Technique 5: Cutting-edge methods

${goal === 'career' ? 'These skills are highly valued in professional settings and will set you apart from peers.' : 'These advanced concepts will deepen your mastery of the subject.'}

Case studies:
• Real-world scenario 1: How professionals apply these techniques
• Real-world scenario 2: Problem-solving in action
• Common pitfalls and how to avoid them
• Tips from industry experts

Practice applying these techniques to various scenarios to build confidence and proficiency.`
    },
    {
      title: `Practical Applications of ${lessonName}`,
      content: `Theory is important, but application is where learning truly comes alive. In this chapter, we focus on practical, hands-on applications of ${lessonName}.

You'll see how everything you've learned connects to real-world scenarios and actual problems people solve every day.

Practical exercises:
• Project 1: Beginner-friendly application
• Project 2: Intermediate challenge
• Project 3: Advanced implementation
• Common use cases and solutions
• Troubleshooting guide

${learningStyle === 'hands-on' ? 'This is where hands-on learners really shine! Dive in and experiment.' : 'Try working through examples even if you prefer other learning styles—practice is essential.'}

Tips for success:
• Start small and build incrementally
• Don't be afraid to make mistakes
• Debug systematically
• Document your learning process
• Share your work and get feedback

The projects in this chapter are designed to reinforce your understanding while building practical skills you can showcase.`
    },
    {
      title: `Mastery and Next Steps in ${lessonName}`,
      content: `You've come so far! This final chapter focuses on mastery and charting your path forward in ${lessonName}.

Let's consolidate everything you've learned and explore how to continue growing your expertise beyond this course.

Mastery checklist:
• Review key concepts and principles
• Self-assessment exercises
• Advanced challenges to test your skills
• Resources for continued learning
• Community and networking opportunities

${goal === 'career' ? 'Career pathways: Learn about roles that use these skills and how to position yourself for opportunities.' : goal === 'academic' ? 'Academic resources: Recommended courses, certifications, and further study options.' : 'Personal growth: Ways to continue learning and applying your knowledge.'}

Next steps:
1. Complete a capstone project
2. Join communities of practice
3. Find a mentor or study group
4. Set learning goals for the next 3-6 months
5. Stay updated with latest developments

Remember: Mastery is a journey, not a destination. Keep learning, practicing, and growing!

Congratulations on completing this learning journey. You now have a solid foundation in ${lessonName} and the tools to continue advancing your skills.`
    }
  ];

  for (let i = 0; i < chapterCount; i++) {
    const template = chapterTemplates[i];
    chapters.push({
      id: `chapter-${i + 1}`,
      title: template.title,
      content: template.content,
      completed: false,
      quizScore: null
    });
  }

  return chapters;
};

export const generateQuizQuestions = (chapterIndex: number, lessonName: string): QuizQuestion[] => {
  const quizSets = [
    [
      {
        id: 'q1',
        question: `What is the primary focus of the introduction to ${lessonName}?`,
        options: [
          'Advanced techniques only',
          'Building a strong foundation',
          'Career opportunities',
          'Historical dates and facts'
        ],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'Why is it important to understand fundamental concepts first?',
        options: [
          'To impress others',
          'It\'s not really important',
          'They form the basis for advanced topics',
          'Only for academic purposes'
        ],
        correctAnswer: 2
      },
      {
        id: 'q3',
        question: 'What should you do if a concept seems complex at first?',
        options: [
          'Skip it and move on',
          'Give up completely',
          'Take your time and revisit as needed',
          'Only read it once'
        ],
        correctAnswer: 2
      }
    ],
    [
      {
        id: 'q1',
        question: 'What do core principles provide?',
        options: [
          'Just memorization material',
          'The backbone for understanding advanced topics',
          'Entertainment value',
          'Quick shortcuts'
        ],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'How should you approach learning core principles?',
        options: [
          'Memorize without understanding',
          'Skip them if you know basics',
          'Understand how they work together',
          'Only learn your favorite ones'
        ],
        correctAnswer: 2
      },
      {
        id: 'q3',
        question: 'What is a good practice exercise?',
        options: [
          'Ignore real-world examples',
          'Only read without thinking',
          'Explain concepts in your own words',
          'Copy definitions exactly'
        ],
        correctAnswer: 2
      }
    ],
    [
      {
        id: 'q1',
        question: 'What do advanced techniques build upon?',
        options: [
          'Nothing specific',
          'The fundamentals you\'ve mastered',
          'Random concepts',
          'Only memorized facts'
        ],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'How do experts approach complex problems?',
        options: [
          'They guess randomly',
          'They avoid them',
          'They use frameworks and best practices',
          'They only use beginner methods'
        ],
        correctAnswer: 2
      },
      {
        id: 'q3',
        question: 'Why are case studies important?',
        options: [
          'They\'re not important',
          'They show how professionals apply techniques in real scenarios',
          'Only for entertainment',
          'To make the course longer'
        ],
        correctAnswer: 1
      }
    ],
    [
      {
        id: 'q1',
        question: 'Why is practical application important?',
        options: [
          'It\'s optional',
          'Theory alone is sufficient',
          'It\'s where learning truly comes alive',
          'Only for certain learners'
        ],
        correctAnswer: 2
      },
      {
        id: 'q2',
        question: 'What should you do when making mistakes during practice?',
        options: [
          'Give up immediately',
          'Never practice again',
          'Don\'t be afraid—debug systematically',
          'Ignore them and move on'
        ],
        correctAnswer: 2
      },
      {
        id: 'q3',
        question: 'How should you approach projects?',
        options: [
          'Try to do everything at once',
          'Start small and build incrementally',
          'Skip the small ones',
          'Only do the easiest ones'
        ],
        correctAnswer: 1
      }
    ],
    [
      {
        id: 'q1',
        question: 'What does this chapter focus on?',
        options: [
          'Starting over',
          'Mastery and charting your path forward',
          'Forgetting what you learned',
          'Only review'
        ],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'What is the nature of mastery?',
        options: [
          'A final destination',
          'Impossible to achieve',
          'A journey, not a destination',
          'Only for experts'
        ],
        correctAnswer: 2
      },
      {
        id: 'q3',
        question: 'What should you do after completing this course?',
        options: [
          'Stop learning completely',
          'Forget everything',
          'Keep learning, practicing, and growing',
          'Never review again'
        ],
        correctAnswer: 2
      }
    ]
  ];

  return quizSets[chapterIndex] || quizSets[0];
};
