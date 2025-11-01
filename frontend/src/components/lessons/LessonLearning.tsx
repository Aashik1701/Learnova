import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Lock, CheckCircle2, PlayCircle } from "lucide-react";
import { ChapterViewer } from "./ChapterViewer";
import { LessonQuizView } from "./LessonQuizView";
import { generateQuizQuestions } from "@/lib/lesson-generator";
import { Lesson, Chapter, QuestionnaireData } from "@/pages/Lessons";
import { issueCertificate, CertificateResponse } from "@/lib/api";
import { CertificateSection } from "@/components/CertificateSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LessonLearningProps {
  lesson: Lesson;
  onUpdate: (updatedLesson: Lesson) => void;
  onBack: () => void;
}

type ViewMode = "chapters" | "lesson" | "quiz";

export const LessonLearning = ({ lesson, onUpdate, onBack }: LessonLearningProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("chapters");
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);
  const [certificate, setCertificate] = useState<CertificateResponse | null>(
    lesson.certificate || null
  );
  const [issuingCertificate, setIssuingCertificate] = useState(false);
  const { toast } = useToast();

  // Load certificate from lesson on mount
  useEffect(() => {
    if (lesson.certificate) {
      setCertificate(lesson.certificate as CertificateResponse);
    }
  }, [lesson.certificate]);

  const handleStartChapter = (index: number) => {
    setSelectedChapterIndex(index);
    setViewMode("lesson");
  };

  const handleLessonComplete = () => {
    setViewMode("quiz");
  };

  const handleQuizComplete = async (score: number, passed: boolean) => {
    const updatedChapters = [...lesson.chapters];
    updatedChapters[selectedChapterIndex] = {
      ...updatedChapters[selectedChapterIndex],
      completed: passed,
      quizScore: score,
    };

    const completedCount = updatedChapters.filter((ch) => ch.completed).length;
    const progress = (completedCount / updatedChapters.length) * 100;

    const updatedLesson = {
      ...lesson,
      chapters: updatedChapters,
      progress,
    };

    onUpdate(updatedLesson);
    setViewMode("chapters");

    // Check if lesson is 100% complete and issue certificate (only if not already issued)
    if (progress >= 100 && !certificate && !updatedLesson.certificate) {
      await handleCourseCompletion(updatedLesson);
    }
  };

  const handleCourseCompletion = async (completedLesson: typeof lesson) => {
    try {
      setIssuingCertificate(true);
      
      // Check if certificate already exists for this lesson (check localStorage first)
      if (completedLesson.certificate) {
        console.log("Certificate already exists in lesson data");
        setCertificate(completedLesson.certificate as CertificateResponse);
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

      // Calculate grade based on quiz scores
      const quizScores = completedLesson.chapters
        .filter(ch => ch.completed && ch.quizScore !== null && ch.quizScore !== undefined)
        .map(ch => ch.quizScore!);
      const averageScore = quizScores.length > 0
        ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length
        : 0;
      const grade = averageScore >= 90 ? "Distinction" : averageScore >= 70 ? "Pass" : "Pass";

      // Estimate duration (assuming 1 hour per chapter)
      const durationHours = completedLesson.chapters.length * 1;

      // Issue certificate
      const result = await issueCertificate({
        userId: user.id,
        courseId: completedLesson.id,
        courseName: completedLesson.name,
        learnerName: profile?.full_name || user.email || "Learner",
        grade: grade,
        durationHours: durationHours,
        modules: completedLesson.chapters.length,
        metadata: {
          type: "lesson",
          averageScore: averageScore.toFixed(1),
          completedAt: new Date().toISOString(),
        },
      });

      if (result.status === 'success' || result.status === 'already_issued') {
        setCertificate(result);
        
        // Save certificate to lesson and persist to localStorage
        const updatedLessonWithCert = {
          ...completedLesson,
          certificate: result
        };
        onUpdate(updatedLessonWithCert);
        
        // Also save to localStorage directly
        try {
          const STORAGE_KEY = "learnova-lessons";
          const savedLessons = localStorage.getItem(STORAGE_KEY);
          if (savedLessons) {
            const lessons = JSON.parse(savedLessons);
            const updatedLessons = lessons.map((l: Lesson) => 
              l.id === completedLesson.id 
                ? { ...l, certificate: result }
                : l
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLessons));
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

  const currentChapter = lesson.chapters[selectedChapterIndex];

  if (viewMode === "lesson") {
    return (
      <ChapterViewer
        chapter={currentChapter}
        onComplete={handleLessonComplete}
        onBack={() => setViewMode("chapters")}
      />
    );
  }

  if (viewMode === "quiz") {
    const quizQuestions = generateQuizQuestions(selectedChapterIndex, lesson.name);
    return (
      <LessonQuizView
        questions={quizQuestions}
        chapterTitle={currentChapter.title}
        onComplete={handleQuizComplete}
        onBack={() => setViewMode("chapters")}
        onReviewLesson={() => setViewMode("lesson")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {lesson.name}
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {lesson.chapters.filter((ch) => ch.completed).length} of {lesson.chapters.length} chapters completed
                </span>
                <span>{lesson.progress.toFixed(0)}%</span>
              </div>
              <Progress value={lesson.progress} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {lesson.chapters.map((chapter, index) => {
            const isLocked = index > 0 && !lesson.chapters[index - 1].completed;
            const canStart = !isLocked;

            return (
              <Card
                key={chapter.id}
                className={`transition-all ${
                  isLocked ? "opacity-60" : "hover:shadow-lg"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold">{chapter.title}</h3>
                        {chapter.completed && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </Badge>
                        )}
                        {isLocked && (
                          <Badge variant="secondary" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Locked
                          </Badge>
                        )}
                      </div>
                      {chapter.quizScore !== null && (
                        <p className="text-sm text-muted-foreground">
                          Quiz Score: {chapter.quizScore.toFixed(0)}%
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleStartChapter(index)}
                      disabled={isLocked}
                      size="lg"
                    >
                      {chapter.completed ? (
                        <>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Review
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          {isLocked ? "Locked" : "Start"}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Certificate Section - Shows when lesson is complete and certificate exists */}
        {lesson.progress >= 100 && (certificate || lesson.certificate) && (
          <CertificateSection
            certificate={certificate || (lesson.certificate as CertificateResponse)}
            loading={issuingCertificate}
            onRetry={() => !certificate && handleCourseCompletion(lesson)}
          />
        )}
      </main>
    </div>
  );
};
