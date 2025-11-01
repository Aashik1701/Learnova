import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ArrowLeft, BookOpen, Trophy, Lock, CheckCircle2 } from "lucide-react";
import { Subject } from "@/pages/Practice";
import { generateChapters } from "@/lib/practice-generator";
import { LessonViewer } from "./LessonViewer";
import { QuizView } from "./QuizView";
import { Progress } from "@/components/ui/progress";

interface SubjectLearningProps {
  subject: Subject;
  onUpdate: (subject: Subject) => void;
  onBack: () => void;
}

type ViewMode = "chapters" | "lesson" | "quiz";

export const SubjectLearning = ({ subject, onUpdate, onBack }: SubjectLearningProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("chapters");
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);

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

  const handleQuizComplete = (score: number) => {
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

    onUpdate({
      ...subject,
      chapters: updatedChapters,
      completedChapters,
      currentChapter,
    });

    setViewMode("chapters");
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
      </main>
    </div>
  );
};
