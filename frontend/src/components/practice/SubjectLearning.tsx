import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ArrowLeft, BookOpen, Trophy, Lock, CheckCircle2 } from "lucide-react";
import { Subject } from "@/pages/Practice";
import { generateChapters } from "@/lib/practice-generator";
import { LessonViewer } from "./LessonViewer";
import { QuizView } from "./QuizView";
import { Progress } from "@/components/ui/progress";
import { issueCertificate, CertificateResponse } from "@/lib/api";
import { CertificateSection } from "@/components/CertificateSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubjectLearningProps {
  subject: Subject;
  onUpdate: (subject: Subject) => void;
  onBack: () => void;
}

type ViewMode = "chapters" | "lesson" | "quiz";

export const SubjectLearning = ({ subject, onUpdate, onBack }: SubjectLearningProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("chapters");
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);
  const [certificate, setCertificate] = useState<CertificateResponse | null>(
    subject.certificate || null
  );
  const [issuingCertificate, setIssuingCertificate] = useState(false);
  const { toast } = useToast();

  // Load certificate from subject on mount
  useEffect(() => {
    if (subject.certificate) {
      setCertificate(subject.certificate as CertificateResponse);
    }
  }, [subject.certificate]);

  useEffect(() => {
    if (!subject.chapters || subject.chapters.length === 0) {
      const chapters = generateChapters(subject.questionnaireAnswers!);
      onUpdate({ ...subject, chapters });
    }
  }, []);

  const handleStartChapter = (index: number) => {
    setSelectedChapterIndex(index);
    setViewMode("lesson");
  };

  const handleLessonComplete = () => {
    setViewMode("quiz");
  };

  const handleQuizComplete = async (score: number) => {
    const passed = score >= 60;
    const updatedChapters = subject.chapters!.map((ch, idx) => 
      idx === selectedChapterIndex 
        ? { ...ch, completed: passed, score }
        : ch
    );

    const completedChapters = passed && !subject.completedChapters.includes(selectedChapterIndex)
      ? [...subject.completedChapters, selectedChapterIndex]
      : subject.completedChapters;

    const currentChapter = passed ? Math.min(selectedChapterIndex + 1, subject.chapters!.length - 1) : selectedChapterIndex;

    const updatedSubject = {
      ...subject,
      chapters: updatedChapters,
      completedChapters,
      currentChapter,
    };

    onUpdate(updatedSubject);
    setViewMode("chapters");

    // Check if subject is 100% complete and issue certificate (only if not already issued)
    const progress = (completedChapters.length / subject.chapters!.length) * 100;
    if (progress >= 100 && !certificate && !updatedSubject.certificate) {
      await handleSubjectCompletion(updatedSubject);
    }
  };

  const handleSubjectCompletion = async (completedSubject: Subject) => {
    try {
      setIssuingCertificate(true);
      
      // Check if certificate already exists for this subject (check localStorage first)
      if (completedSubject.certificate) {
        console.log("Certificate already exists in subject data");
        setCertificate(completedSubject.certificate as CertificateResponse);
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to receive your certificate",
          variant: "destructive",
        });
        return;
      }

      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // Calculate grade based on scores
      const scores = completedSubject.chapters!
        .filter(ch => ch.completed && ch.score !== null && ch.score !== undefined)
        .map(ch => ch.score!);
      const averageScore = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;
      const grade = averageScore >= 90 ? "Distinction" : averageScore >= 70 ? "Pass" : "Pass";

      // Estimate duration
      const durationHours = completedSubject.chapters!.length * 1;

      // Generate a unique course ID for the subject
      const courseId = `subject-${completedSubject.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

      // Issue certificate
      const result = await issueCertificate({
        userId: user.id,
        courseId: courseId,
        courseName: completedSubject.name,
        learnerName: profile?.full_name || user.email || "Learner",
        grade: grade,
        durationHours: durationHours,
        modules: completedSubject.chapters!.length,
        metadata: {
          type: "subject",
          averageScore: averageScore.toFixed(1),
          completedAt: new Date().toISOString(),
        },
      });

      if (result.status === 'success' || result.status === 'already_issued') {
        setCertificate(result);
        
        // Save certificate to subject and persist to localStorage
        const updatedSubjectWithCert = {
          ...completedSubject,
          certificate: result
        };
        onUpdate(updatedSubjectWithCert);
        
        // Also save to localStorage directly
        try {
          const savedSubjects = localStorage.getItem("practice_subjects");
          if (savedSubjects) {
            const subjects = JSON.parse(savedSubjects);
            const updatedSubjects = subjects.map((s: Subject) => 
              s.id === completedSubject.id 
                ? { ...s, certificate: result }
                : s
            );
            localStorage.setItem("practice_subjects", JSON.stringify(updatedSubjects));
          }
        } catch (error) {
          console.error("Failed to save certificate to localStorage:", error);
        }
        
        toast({
          title: "🎓 Certificate Generated!",
          description: "Your certificate has been created and uploaded to IPFS",
        });
      } else {
        throw new Error(result.error || "Failed to issue certificate");
      }
    } catch (error: any) {
      console.error("Error issuing certificate:", error);
      toast({
        title: "Certificate issuance failed",
        description: error.message || "Could not issue certificate. You can retry later.",
        variant: "destructive",
      });
    } finally {
      setIssuingCertificate(false);
    }
  };

  if (!subject.chapters || subject.chapters.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Generating Your Curriculum...</CardTitle>
            <CardDescription>Please wait while we create your personalized chapters</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (viewMode === "lesson") {
    return (
      <LessonViewer
        chapter={subject.chapters[selectedChapterIndex]}
        onComplete={handleLessonComplete}
        onBack={() => setViewMode("chapters")}
      />
    );
  }

  if (viewMode === "quiz") {
    return (
      <QuizView
        chapter={subject.chapters[selectedChapterIndex]}
        onComplete={handleQuizComplete}
        onBack={() => setViewMode("chapters")}
      />
    );
  }

  const progress = (subject.completedChapters.length / subject.chapters.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {subject.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="font-medium">
              {subject.completedChapters.length} / {subject.chapters.length} Completed
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Complete quizzes with 60% or higher to unlock the next chapter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {subject.chapters.map((chapter, index) => {
            const isCompleted = subject.completedChapters.includes(index);
            const isLocked = index > 0 && !subject.completedChapters.includes(index - 1);
            const isCurrent = index === subject.currentChapter && !isCompleted;

            return (
              <Card 
                key={chapter.id} 
                className={`transition-all ${
                  isCompleted ? "border-primary/50 bg-primary/5" : 
                  isLocked ? "opacity-50" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                          {index + 1}
                        </span>
                        <CardTitle className="text-xl">{chapter.title}</CardTitle>
                        {isCompleted && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                        {isLocked && (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      {chapter.score !== undefined && (
                        <CardDescription>
                          Last score: {chapter.score}% {chapter.score >= 60 ? "✓" : "✗"}
                        </CardDescription>
                      )}
                    </div>
                    <Button
                      onClick={() => handleStartChapter(index)}
                      disabled={isLocked}
                      variant={isCurrent ? "default" : "outline"}
                      className="gap-2"
                    >
                      {isCompleted ? (
                        <>
                          <BookOpen className="h-4 w-4" />
                          Review
                        </>
                      ) : isLocked ? (
                        <>
                          <Lock className="h-4 w-4" />
                          Locked
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4" />
                          {chapter.score !== undefined ? "Retry" : "Start"}
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Certificate Section - Shows when subject is complete and certificate exists */}
        {progress >= 100 && (certificate || subject.certificate) && (
          <CertificateSection
            certificate={certificate || (subject.certificate as CertificateResponse)}
            loading={issuingCertificate}
            onRetry={() => !certificate && handleSubjectCompletion(subject)}
          />
        )}
      </main>
    </div>
  );
};
