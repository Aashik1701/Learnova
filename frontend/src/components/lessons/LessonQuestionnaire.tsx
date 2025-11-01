import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ClipboardList, ArrowLeft, ArrowRight, Loader2, CheckCircle2, BookOpen } from "lucide-react";
import { 
  generateQuestionnaire, 
  QuestionnaireQuestion, 
  generateStudyMaterials,
  StudyMaterialsResponse
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export interface AnswerState {
  answer: string;
  isCorrect: boolean;
  selectedIndex?: number;
}

export interface QuestionnaireAnswer {
  question: string;
  answer: string;
  isCorrect: boolean;
  correctAnswer: string;
  selectedIndex?: number;
}

interface LessonQuestionnaireProps {
  lessonName: string;
  file: File;
  onComplete: (answers: QuestionnaireAnswer[]) => void;
  onCancel: () => void;
  onError?: (error: Error) => void;
}

export const LessonQuestionnaire = ({ lessonName, file, onComplete, onCancel, onError }: LessonQuestionnaireProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuestionnaireQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const { toast } = useToast();
  const hasFetchedQuestions = useRef(false);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterialsResponse | null>(null);
  
  const scoreMessage = score >= 70
    ? "Great job! Our AI is tailoring an overall review to reinforce your knowledge."
    : "Our AI is creating a detailed lesson plan to help you master these concepts.";

  // Load questions from the API when the component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      // Prevent multiple fetches
      if (hasFetchedQuestions.current) return;
      hasFetchedQuestions.current = true;
      
      try {
        setIsLoading(true);
        const response = await generateQuestionnaire(lessonName, file);
        setQuestions(response.questions);
      } catch (error) {
        console.error("Failed to generate questions:", error);
        toast({
          title: "Error",
          description: "Failed to generate questions. Please try again.",
          variant: "destructive",
        });
        onError?.(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [lessonName, file, onError, toast]);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (submitted) return;

    const question = questions[questionIndex];
    // The API returns correctAnswer (not correct_answer) as the index
    const correctAnswerIndex = question.correctAnswer || question.correct_answer;
    const isCorrect = answerIndex === correctAnswerIndex;
    
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: {
        answer: question.options[answerIndex],
        isCorrect,
        selectedIndex: answerIndex
      }
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (!submitted) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate score based on correct answers
    let correctCount = 0;
    const questionnaireAnswers: QuestionnaireAnswer[] = questions.map((q, idx) => {
      const userAnswer = answers[idx];
      const correctAnswerIndex = q.correctAnswer || q.correct_answer;
      const isCorrect = userAnswer?.selectedIndex === correctAnswerIndex;
      
      if (isCorrect) correctCount++;
      
      return {
        question: q.question,
        answer: userAnswer?.answer || "Not answered",
        isCorrect,
        correctAnswer: q.options[correctAnswerIndex],
        selectedIndex: userAnswer?.selectedIndex
      };
    });
    
    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    
    setScore(calculatedScore);
    setSubmitted(true);
    setShowScore(true);
    
    // Store answers in localStorage for the parent component to access
    localStorage.setItem(`quiz_answers_${Date.now()}`, JSON.stringify({
      answers: questionnaireAnswers,
      score: calculatedScore,
      totalQuestions: questions.length,
      correctAnswers: correctCount
    }));
    
    onComplete(questionnaireAnswers);
  };

  const progress = questions.length > 0 
    ? ((currentQuestionIndex + 1) / questions.length) * 100 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Generating questions based on your material...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">No Questions Generated</CardTitle>
            <CardDescription className="text-center">
              We couldn't generate any questions from the provided material. Please try with different content.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={onCancel}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted && showScore) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2">Quiz Complete! 🎉</CardTitle>
          <CardDescription className="text-lg">
            {scoreMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="relative">
              <svg className="w-40 h-40">
                <circle
                  className="text-gray-200"
                  strokeWidth="12"
                  stroke="currentColor"
                  fill="transparent"
                  r="70"
                  cx="80"
                  cy="80"
                />
                <circle
                  className="text-green-500"
                  strokeWidth="12"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="70"
                  cx="80"
                  cy="80"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={2 * Math.PI * 70 * (1 - score / 100)}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px' }}
                />
                <text
                  x="50%"
                  y="50%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  className="text-3xl font-bold"
                >
                  {score}%
                </text>
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold">
                {score >= 70 ? "Well Done!" : "Keep Learning!"}
              </h3>
              <p className="text-muted-foreground">
                {score >= 70 
                  ? "You've got a solid understanding of the material!" 
                  : "Review the material and try again to improve your score."}
              </p>
            </div>
          </div>
          
          <div className="pt-6 flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={onCancel} 
              variant="outline" 
              className="flex-1 sm:flex-none"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Lessons
            </Button>
            <Button 
              onClick={() => {
                setCurrentQuestionIndex(0);
                setSubmitted(false);
                setShowScore(false);
                setAnswers({});
              }}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <ClipboardList className="w-4 h-4 mr-2" /> Try Again
            </Button>
            <Button 
              onClick={async () => {
                try {
                  setIsGenerating(true);
                  const userResponses = questions.map((q, idx) => {
                    const userAnswer = answers[idx];
                    const correctAnswerIndex = q.correctAnswer || q.correct_answer;
                    return {
                      question: q.question,
                      selected_option: userAnswer?.answer || "",
                      is_correct: userAnswer?.selectedIndex === correctAnswerIndex,
                      correct_answer: q.options[correctAnswerIndex]
                    };
                  });
                  
                  const materials = await generateStudyMaterials(
                    lessonName,
                    file,
                    userResponses
                  );
                  
                  // Store study materials in localStorage
                  localStorage.setItem(`study_materials_${Date.now()}`, JSON.stringify(materials));
                  setStudyMaterials(materials);
                  
                  toast({
                    title: "Success",
                    description: "Study materials have been generated and saved!",
                  });
                  
                  // Notify parent component that study materials are ready
                  if (onComplete) {
                    onComplete(questions.map((q, idx) => ({
                      question: q.question,
                      answer: answers[idx]?.answer || "",
                      isCorrect: answers[idx]?.isCorrect || false,
                      correctAnswer: q.options[q.correctAnswer || q.correct_answer]
                    })));
                  }
                } catch (error) {
                  console.error("Error generating study materials:", error);
                  toast({
                    title: "Error",
                    description: "Failed to generate study materials. Please try again.",
                    variant: "destructive",
                  });
                } finally {
                  setIsGenerating(false);
                }
              }}
              disabled={isGenerating}
              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-2" /> Generate Study Materials
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const isAnswered = currentAnswer !== undefined;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const correctAnswerIndex = currentQuestion.correctAnswer || currentQuestion.correct_answer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background p-6">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-primary" />
              {submitted ? "Quiz Results" : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
            </CardTitle>
            {!submitted && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {currentQuestionIndex + 1} of {questions.length} questions
                </p>
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
                <RadioGroup
                  value={currentAnswer?.selectedIndex?.toString() || ""}
                  className="space-y-2"
                >
                  {currentQuestion.options.map((option, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center space-x-3 rounded-lg border p-3 transition-colors ${
                        currentAnswer?.selectedIndex === idx
                          ? currentAnswer.isCorrect 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'hover:bg-muted/50 cursor-pointer'
                      }`}
                      onClick={() => handleAnswerSelect(currentQuestionIndex, idx)}
                    >
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        currentAnswer?.selectedIndex === idx
                          ? currentAnswer.isCorrect 
                            ? 'border-green-500 bg-green-500' 
                            : 'border-red-500 bg-red-500'
                          : 'border-border'
                      }`}>
                        {currentAnswer?.selectedIndex === idx && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        )}
                      </div>
                      <Label className="cursor-pointer font-normal flex-1">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!isAnswered && !submitted}
                >
                  {isLastQuestion ? (
                    "Submit Quiz"
                  ) : (
                    <>{isAnswered ? 'Next' : 'Skip'} <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};