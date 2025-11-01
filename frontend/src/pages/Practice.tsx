import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ArrowLeft, Plus, BookOpen, Trophy, Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SubjectQuestionnaire } from "@/components/practice/SubjectQuestionnaire";
import { SubjectLearning } from "@/components/practice/SubjectLearning";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export interface Subject {
  id: string;
  name: string;
  createdAt: string;
  questionnaireAnswers?: QuestionnaireAnswers;
  chapters?: Chapter[];
  currentChapter: number;
  completedChapters: number[];
  certificate?: {
    cert_id: string;
    verify_url?: string;
    proof_url?: string;
    tx_hash?: string;
    cid_doc?: string;
    gateway_url?: string;
    issued_on?: string;
  } | null;
}

export interface QuestionnaireAnswers {
  proficiency: string;
  interest: string;
  goal: string;
  timeCommitment: string;
  learningStyle: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  quiz: Quiz;
  completed: boolean;
  score?: number;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

const Practice = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("practice_subjects");
    if (stored) {
      setSubjects(JSON.parse(stored));
    }
  }, []);

  const saveSubjects = (updatedSubjects: Subject[]) => {
    setSubjects(updatedSubjects);
    localStorage.setItem("practice_subjects", JSON.stringify(updatedSubjects));
  };

  const handleCreateSubject = () => {
    setEditingSubject(null);
    setShowQuestionnaire(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setShowQuestionnaire(true);
  };

  const handleDeleteSubject = (subjectId: string) => {
    const updated = subjects.filter(s => s.id !== subjectId);
    saveSubjects(updated);
  };

  const handleQuestionnaireComplete = (name: string, answers: QuestionnaireAnswers) => {
    if (editingSubject) {
      const updated = subjects.map(s => 
        s.id === editingSubject.id 
          ? { ...s, name, questionnaireAnswers: answers }
          : s
      );
      saveSubjects(updated);
    } else {
      const newSubject: Subject = {
        id: Date.now().toString(),
        name,
        createdAt: new Date().toISOString(),
        questionnaireAnswers: answers,
        chapters: [],
        currentChapter: 0,
        completedChapters: [],
      };
      saveSubjects([...subjects, newSubject]);
    }
    setShowQuestionnaire(false);
    setEditingSubject(null);
  };

  const handleSubjectUpdate = (updatedSubject: Subject) => {
    const updated = subjects.map(s => s.id === updatedSubject.id ? updatedSubject : s);
    saveSubjects(updated);
    setSelectedSubject(updatedSubject);
  };

  const calculateProgress = (subject: Subject) => {
    if (!subject.chapters || subject.chapters.length === 0) return 0;
    return (subject.completedChapters.length / subject.chapters.length) * 100;
  };

  if (showQuestionnaire) {
    return (
      <SubjectQuestionnaire
        existingSubject={editingSubject}
        onComplete={handleQuestionnaireComplete}
        onCancel={() => {
          setShowQuestionnaire(false);
          setEditingSubject(null);
        }}
      />
    );
  }

  if (selectedSubject) {
    return (
      <SubjectLearning
        subject={selectedSubject}
        onUpdate={handleSubjectUpdate}
        onBack={() => setSelectedSubject(null)}
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
                Practice Hub
              </span>
            </div>
          </div>
          <Button onClick={handleCreateSubject} className="gap-2">
            <Plus className="h-4 w-4" />
            New Subject
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {subjects.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-primary" />
              <CardTitle>Start Your Learning Journey</CardTitle>
              <CardDescription>
                Create your first subject to begin practicing with personalized chapters and quizzes
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={handleCreateSubject} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Your First Subject
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => {
              const progress = calculateProgress(subject);
              const totalChapters = subject.chapters?.length || 0;
              const completedCount = subject.completedChapters.length;

              return (
                <Card key={subject.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{subject.name}</CardTitle>
                        <CardDescription>
                          {totalChapters > 0 
                            ? `${completedCount} of ${totalChapters} chapters completed`
                            : "Ready to start"
                          }
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditSubject(subject)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Subject?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{subject.name}" and all its progress.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteSubject(subject.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {totalChapters > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                    <Button 
                      onClick={() => setSelectedSubject(subject)} 
                      className="w-full gap-2"
                    >
                      {totalChapters > 0 ? (
                        <>
                          <BookOpen className="h-4 w-4" />
                          Continue Learning
                        </>
                      ) : (
                        <>
                          <Trophy className="h-4 w-4" />
                          Start Learning
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Practice;
