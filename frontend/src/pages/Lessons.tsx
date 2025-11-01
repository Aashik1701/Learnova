import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ArrowLeft, Plus, BookOpen, Trash2, Edit, PlayCircle, FileText, CheckCircle2, Loader2, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LessonCreation } from "@/components/lessons/LessonCreation";
import { LessonQuestionnaire, QuestionnaireAnswer } from "@/components/lessons/LessonQuestionnaire";
import { LessonSurvey, type SurveyAnswers } from "@/components/lessons/LessonSurvey";
import { LessonLearning } from "@/components/lessons/LessonLearning";
import { generateChapters } from "@/lib/lesson-generator";
import { useToast } from "@/hooks/use-toast";
import { formatFileSize } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface Chapter {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  quizScore: number | null;
}

export interface StudyMaterial {
  name: string;
  size: number;
  type: string;
  content?: string;
}


export interface QuestionnaireData {
  answers: QuestionnaireAnswer[];
  score: number;
  completed: boolean;
  totalQuestions?: number;
  correctAnswers?: number;
}

// Type guard to check if the questionnaire is in the new format
function isQuestionnaireData(obj: any): obj is QuestionnaireData {
  return obj && Array.isArray(obj.answers) && 'score' in obj && 'completed' in obj;
}

export interface Lesson {
  id: string;
  name: string;
  fileName: string;
  material: StudyMaterial;
  chapters: Chapter[];
  questionnaire: QuestionnaireData | Record<string, any>;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

type ViewMode = "dashboard" | "create" | "questionnaire" | "learning" | "scoreCard";

const STORAGE_KEY = "learnova-lessons";

// Store files in memory to avoid localStorage quota issues
const lessonFiles = new Map<string, File>();

const Lessons = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State management
  const [state, setState] = useState({
    lessons: [] as Lesson[],
    viewMode: 'dashboard' as ViewMode,
    currentLesson: null as Lesson | null,
    tempLessonData: null as { name: string; file?: File; description?: string } | null,
    isLoading: false,
    deleteDialogOpen: false,
    lessonToDelete: null as string | null,
    showScoreCard: false,
    scoreCardData: null as { score: number; totalQuestions: number; correctAnswers: number } | null
  });

  // Destructure state for easier access
  const { 
    lessons, 
    viewMode, 
    currentLesson, 
    tempLessonData, 
    isLoading, 
    deleteDialogOpen, 
    lessonToDelete 
  } = state;

  // Helper function to update state
  const updateState = (updates: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Handle general survey (topic-based flow) completion
  const handleSurveyComplete = (survey: SurveyAnswers) => {
    if (!tempLessonData) return;

    // Generate chapters based on general survey responses
    const chapters = generateChapters(tempLessonData.name, survey as any);

    const lessonId = Date.now().toString();
    const newLesson: Lesson = {
      id: lessonId,
      name: tempLessonData.name,
      fileName: tempLessonData.file?.name || 'Topic',
      material: {
        name: tempLessonData.file?.name || 'Topic',
        size: tempLessonData.file?.size || 0,
        type: tempLessonData.file?.type || 'text/plain',
        content: tempLessonData.description || ''
      },
      chapters,
      questionnaire: { answers: [], score: 0, completed: true },
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedLessons = [...lessons, newLesson];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLessons));
    } catch (e) {
      console.error('Failed to save lessons to localStorage:', e);
    }

    updateState({
      lessons: updatedLessons,
      tempLessonData: null,
      currentLesson: newLesson,
      viewMode: 'learning' as ViewMode,
      isLoading: false
    });
  };

  // Load lessons from localStorage when component mounts
  useEffect(() => {
    const loadLessons = () => {
      const savedLessons = localStorage.getItem(STORAGE_KEY);
      if (savedLessons) {
        try {
          const parsedLessons = JSON.parse(savedLessons);
          // Handle legacy lesson format
          const updatedLessons = parsedLessons.map((lesson: any) => {
            if (!lesson.material) {
              return {
                ...lesson,
                material: {
                  name: lesson.fileName || 'Untitled',
                  size: 0,
                  type: "application/octet-stream"
                },
                updatedAt: lesson.updatedAt || lesson.createdAt || new Date().toISOString()
              };
            }
            return lesson;
          });
          updateState({ lessons: updatedLessons });
        } catch (error) {
          console.error("Failed to load lessons:", error);
          toast({
            title: "Error",
            description: "Failed to load your lessons. Please refresh the page.",
            variant: "destructive",
          });
        }
      }
    };

    loadLessons();
  }, [toast]);

  // Handle lesson creation with file upload
  const handleCreateLesson = async (name: string, file: File) => {
    updateState({ isLoading: true });
    try {
      // Prepare default preferences to generate chapters without quiz
      const defaultSurvey = {
        proficiency: 'beginner',
        interest: 'high',
        goal: 'career',
        timeCommitment: 'medium',
        learningStyle: 'visual',
      } as any;

      // Generate chapters directly
      const chapters = generateChapters(name, defaultSurvey);

      // Create a new lesson id and persist the original file in memory
      const lessonId = Date.now().toString();
      lessonFiles.set(lessonId, file);

      // Create lesson object
      const newLesson: Lesson = {
        id: lessonId,
        name,
        fileName: file.name,
        material: {
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
        },
        chapters,
        questionnaire: { answers: [], score: 0, completed: true },
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Persist lessons
      const updatedLessons = [...lessons, newLesson];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLessons));
      } catch (e) {
        console.error('Failed to save lessons to localStorage:', e);
      }

      // Update state to jump straight into learning
      updateState({
        lessons: updatedLessons,
        tempLessonData: null,
        currentLesson: newLesson,
        viewMode: 'learning' as ViewMode,
        isLoading: false,
      });

      toast({
        title: 'Lesson created!',
        description: `${chapters.length} chapters have been generated from your PDF.`,
      });
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error",
        description: "Failed to process the uploaded file. Please try again.",
        variant: "destructive",
      });
      updateState({ isLoading: false });
    }
  };

  // Handle lesson creation from topic description
  const handleCreateLessonFromText = (name: string, description: string) => {
    updateState({ 
      tempLessonData: { name, description },
      viewMode: 'questionnaire' as ViewMode
    });
  };

  // Handle questionnaire completion
  const handleQuestionnaireComplete = (answers: QuestionnaireAnswer[]) => {
    if (!tempLessonData) return;

    // Calculate score and get correct answers count
    const correctAnswersCount = answers.filter(a => a.isCorrect).length;
    const totalQuestions = answers.length;
    const score = totalQuestions > 0 
      ? Math.round((correctAnswersCount / totalQuestions) * 100)
      : 0;

    // Generate chapters based on the questionnaire results
    const chapters = generateChapters(tempLessonData.name, {
      score,
      totalQuestions,
      correctAnswers: correctAnswersCount,
      answers: answers.map(a => ({
        question: a.question,
        answer: a.answer,
        isCorrect: a.isCorrect
      }))
    } as any);

    // Create the questionnaire data
    const questionnaire: QuestionnaireData = {
      answers,
      score,
      completed: true,
      totalQuestions,
      correctAnswers: correctAnswersCount
    };

    // Store file with lesson ID for later retrieval
    const lessonId = Date.now().toString();
    if (tempLessonData.file) {
      lessonFiles.set(lessonId, tempLessonData.file);
    }
    
    // Create the new lesson
    const newLesson: Lesson = {
      id: lessonId,
      name: tempLessonData.name,
      fileName: tempLessonData.file?.name || 'Untitled',
      material: {
        name: tempLessonData.file?.name || 'Untitled',
        size: tempLessonData.file?.size || 0,
        type: tempLessonData.file?.type || "application/octet-stream",
        content: tempLessonData.description
      },
      chapters,
      questionnaire,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add the new lesson and update state
    const updatedLessons = [...lessons, newLesson];
    
    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLessons));
    } catch (error) {
      console.error('Failed to save lessons to localStorage:', error);
      toast({
        title: "Error",
        description: "Failed to save the lesson. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    // Update state
    updateState({
      lessons: updatedLessons,
      tempLessonData: null,
      viewMode: 'scoreCard' as ViewMode,
      currentLesson: newLesson,
      showScoreCard: true,
      scoreCardData: {
        score,
        totalQuestions,
        correctAnswers: correctAnswersCount
      },
      isLoading: false
    });
    
    // Show success message
    toast({
      title: "Lesson created!",
      description: `${chapters.length} chapters have been generated based on your answers.`,
    });
  };

  const handleStartLesson = (lesson: Lesson) => {
    updateState({
      currentLesson: lesson,
      viewMode: 'learning' as ViewMode
    });
  };

  const handleUpdateLesson = (updatedLesson: Lesson) => {
    const updatedLessons = lessons.map((l) => (l.id === updatedLesson.id ? updatedLesson : l));
    
    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLessons));
    } catch (error) {
      console.error('Failed to update lessons in localStorage:', error);
    }
    
    updateState({
      lessons: updatedLessons,
      currentLesson: updatedLesson
    });
  };

  const handleDeleteLesson = (id: string) => {
    updateState({
      lessonToDelete: id,
      deleteDialogOpen: true
    });
  };

  const confirmDelete = () => {
    if (state.lessonToDelete) {
      const updatedLessons = state.lessons.filter((l) => l.id !== state.lessonToDelete);
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLessons));
      } catch (error) {
        console.error('Failed to update lessons in localStorage:', error);
        toast({
          title: "Error",
          description: "Failed to delete the lesson. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Update state
      updateState({
        lessons: updatedLessons,
        deleteDialogOpen: false,
        lessonToDelete: null,
        currentLesson: state.currentLesson?.id === state.lessonToDelete ? null : state.currentLesson,
        viewMode: state.currentLesson?.id === state.lessonToDelete ? 'dashboard' as ViewMode : state.viewMode
      });
      
      toast({
        title: "Lesson deleted",
        description: "The lesson has been removed.",
      });
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Lessons</h1>
          <p className="text-muted-foreground">Manage and track your learning progress</p>
        </div>
        <Button onClick={() => updateState({ viewMode: 'create' as ViewMode })} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> New Lesson
            </>
          )}
        </Button>
      </div>

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No lessons yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Get started by creating your first lesson. Upload your study materials and we'll help you create a personalized learning experience.
            </p>
            <Button onClick={() => updateState({ viewMode: 'create' as ViewMode })} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Create Lesson
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => {
            // Safely get questionnaire data
            const questionnaireData = isQuestionnaireData(lesson.questionnaire) 
              ? lesson.questionnaire 
              : { score: 0, completed: false };
            
            return (
              <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {lesson.name}
                        {questionnaireData.completed && (questionnaireData.answers?.length ?? 0) > 0 && (
                          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Quiz: {questionnaireData.score}%
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <FileText className="h-3.5 w-3.5 mr-1.5" />
                        <span className="truncate max-w-[180px]">
                          {lesson.material.name}
                        </span>
                        <span className="mx-1">•</span>
                        <span>{formatFileSize(lesson.material.size)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Updated: {new Date(lesson.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteLesson(lesson.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{Math.round(lesson.progress)}%</span>
                      </div>
                      <Progress value={lesson.progress} className="h-2" />
                    </div>
                    
                    {lesson.chapters.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <div className="text-muted-foreground">Chapters</div>
                        <div className="font-medium">
                          {lesson.chapters.filter(c => c.completed).length} / {lesson.chapters.length}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleStartLesson(lesson)}
                        disabled={isLoading}
                      >
                        <PlayCircle className="mr-2 h-4 w-4" /> 
                        {lesson.chapters.length > 0 ? 'Continue Learning' : 'Start Learning'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  if (viewMode === "create") {
    return (
      <LessonCreation
        onCompleteUpload={handleCreateLesson}
        onCompleteText={handleCreateLessonFromText}
        onCancel={() => updateState({ viewMode: 'dashboard' as ViewMode })}
        isLoading={isLoading}
      />
    );
  }

  if (viewMode === "questionnaire" && tempLessonData) {
    // Topic-based flow: show general survey (no API)
    if (tempLessonData.description && !tempLessonData.file) {
      return (
        <LessonSurvey
          lessonName={tempLessonData.name}
          onComplete={handleSurveyComplete}
          onCancel={() => updateState({ viewMode: 'create' as ViewMode, tempLessonData: null })}
        />
      );
    }

    return (
      <LessonQuestionnaire
        lessonName={tempLessonData.name}
        file={tempLessonData.file as File}
        onComplete={handleQuestionnaireComplete}
        onCancel={() => updateState({ 
          viewMode: 'create' as ViewMode,
          tempLessonData: null 
        })}
        onError={() => updateState({ 
          viewMode: 'create' as ViewMode,
          tempLessonData: null 
        })}
      />
    );
  }

  // Render score card after questionnaire completion
  if (viewMode === "scoreCard" && currentLesson) {
    const questionnaireData = isQuestionnaireData(currentLesson.questionnaire) 
      ? currentLesson.questionnaire 
      : { score: 0, answers: [], totalQuestions: 0, correctAnswers: 0 };
    
    const score = questionnaireData.score;
    const totalQuestions = questionnaireData.totalQuestions || questionnaireData.answers?.length || 0;
    const correctAnswers = questionnaireData.correctAnswers || questionnaireData.answers?.filter(a => a.isCorrect).length || 0;
    
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-primary/5 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">Quiz Results</CardTitle>
                  <CardDescription>
                    {score >= 70 
                      ? "Great job! You've passed the quiz." 
                      : "Let's review the material and try again."}
                  </CardDescription>
                </div>
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{score}%</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 shadow-md">
                    {score >= 70 ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <FileText className="h-6 w-6 text-amber-500" />
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary">{correctAnswers}</div>
                  <div className="text-sm text-muted-foreground">Correct Answers</div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-foreground">{totalQuestions}</div>
                  <div className="text-sm text-muted-foreground">Total Questions</div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary">{score}%</div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Your Performance</h3>
                <div className="space-y-2">
                  {questionnaireData.answers?.map((answer, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border ${
                        answer.isCorrect 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${
                          answer.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {answer.isCorrect ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <span className="text-xs font-bold">!</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Q: {answer.question}</p>
                          <p className="text-sm text-muted-foreground">
                            Your answer: {answer.answer}
                          </p>
                          {!answer.isCorrect && answer.correctAnswer && (
                            <p className="text-sm text-green-600 mt-1">
                              Correct answer: {answer.correctAnswer}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      updateState({
                        viewMode: 'dashboard' as ViewMode,
                        currentLesson: null
                      });
                    }}
                  >
                    Back to Dashboard
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      updateState({
                        viewMode: 'questionnaire' as ViewMode,
                        tempLessonData: currentLesson.material.size > 0
                          ? {
                              name: currentLesson.name,
                              file: new File([], currentLesson.fileName, { type: currentLesson.material.type })
                            }
                          : {
                              name: currentLesson.name,
                              description: currentLesson.material.content || ''
                            }
                      });
                    }}
                  >
                    Try Again
                  </Button>
                </div>
                <div className="space-x-2">
                  <Button 
                    variant="outline"
                    onClick={async () => {
                      try {
                        // Get the latest answers from localStorage
                        const latestQuizKey = Object.keys(localStorage).find(key => key.startsWith('quiz_answers_'));
                        if (!latestQuizKey) throw new Error('No quiz answers found');
                        
                        const quizData = JSON.parse(localStorage.getItem(latestQuizKey) || '{}');
                        
                        // Convert answers to the format expected by the API
                        const userResponses = quizData.answers.map((a: any) => ({
                          question: a.question,
                          selected_option: a.answer,
                          is_correct: a.isCorrect,
                          correct_answer: a.correctAnswer
                        }));
                        
                        // Call the API to generate study materials
                        const formData = new FormData();
                        formData.append('lesson_name', currentLesson.name);
                        
                        // Get the original file from memory
                        const file = lessonFiles.get(currentLesson.id);
                        if (!file) throw new Error('File not found. Please recreate the lesson.');
                        
                        formData.append('file', file);
                        formData.append('user_responses', JSON.stringify(userResponses));
                        
                        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/generate-study-materials`, {
                          method: 'POST',
                          body: formData,
                        });
                        
                        if (!response.ok) {
                          throw new Error('Failed to generate study materials');
                        }
                        
                        const materials = await response.json();
                        
                        // Store the generated materials in localStorage
                        localStorage.setItem(`study_materials_${Date.now()}`, JSON.stringify(materials));
                        
                        toast({
                          title: 'Success!',
                          description: 'Study materials have been generated and saved.',
                        });
                        
                        // Update the lesson with the study materials
                        const updatedLesson = {
                          ...currentLesson,
                          studyMaterials: materials,
                          updatedAt: new Date().toISOString()
                        };
                        
                        // Update the lessons list
                        const updatedLessons = lessons.map(l => 
                          l.id === currentLesson.id ? updatedLesson : l
                        );
                        
                        // Save to localStorage
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLessons));
                        
                        // Update state
                        updateState({
                          lessons: updatedLessons,
                          currentLesson: updatedLesson,
                          viewMode: 'learning' as ViewMode
                        });
                        
                      } catch (error) {
                        console.error('Error generating study materials:', error);
                        toast({
                          title: 'Error',
                          description: 'Failed to generate study materials. Please try again.',
                          variant: 'destructive',
                        });
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Generate Study Materials
                  </Button>
                  <Button 
                    onClick={() => {
                      updateState({
                        viewMode: 'learning' as ViewMode
                      });
                    }}
                  >
                    Start Learning
                  </Button>
                </div>
              </div>
          </CardContent>
      
        </Card>
      </div>
      </div>
    );
  }

  if (viewMode === "learning" && currentLesson) {
    return (
      <LessonLearning
        lesson={currentLesson}
        onUpdate={handleUpdateLesson}
        onBack={() => {
          updateState({
            currentLesson: null,
            viewMode: 'dashboard' as ViewMode
          });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                My Lessons
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => navigate("/premium")}>
              <Crown className="h-4 w-4 text-amber-500" /> Buy Premium
            </Button>
            <Button onClick={() => updateState({ viewMode: 'create' as ViewMode })} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Create Lesson
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {renderDashboard()}
      </main>

      <AlertDialog 
        open={state.deleteDialogOpen} 
        onOpenChange={(open) => updateState({ deleteDialogOpen: open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lesson? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Lessons;   