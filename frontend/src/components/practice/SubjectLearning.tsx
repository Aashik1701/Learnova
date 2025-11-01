import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ArrowLeft, BookOpen, Trophy, Lock, CheckCircle2, Download, Award, Sparkles } from "lucide-react";
import { Subject } from "@/pages/Practice";
import { generateChapters } from "@/lib/practice-generator";
import { LessonViewer } from "./LessonViewer";
import { QuizView } from "./QuizView";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface SubjectLearningProps {
  subject: Subject;
  onUpdate: (subject: Subject) => void;
  onBack: () => void;
}

type ViewMode = "chapters" | "lesson" | "quiz";

export const SubjectLearning = ({ subject, onUpdate, onBack }: SubjectLearningProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("chapters");
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    if (!subject.chapters || subject.chapters.length === 0) {
      const chapters = generateChapters(subject.questionnaireAnswers!);
      onUpdate({ ...subject, chapters });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const progress = (subject.completedChapters.length / subject.chapters.length) * 100;
  const isCompleted = subject.completedChapters.length === subject.chapters.length;

  // Show certificate modal when subject is completed
  useEffect(() => {
    if (isCompleted && !showCertificate) {
      setShowCertificate(true);
    }
  }, [isCompleted, showCertificate]);

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
  const isCompleted = subject.completedChapters.length === subject.chapters.length;

  // Show certificate modal when subject is completed
  useEffect(() => {
    if (isCompleted && !showCertificate) {
      setShowCertificate(true);
    }
  }, [isCompleted, showCertificate]);

  const handleDownloadCertificate = () => {
    // Mock certificate download
    const certificateData = {
      subject: subject.name,
      completedChapters: subject.completedChapters.length,
      totalChapters: subject.chapters.length,
      completionDate: new Date().toLocaleDateString(),
      score: Math.round(subject.chapters.reduce((acc, ch) => acc + (ch.score || 0), 0) / subject.chapters.length)
    };
    
    // Create a simple certificate text
    const certificateText = `
LEARNOVA CERTIFICATE OF COMPLETION

Subject: ${certificateData.subject}
Completed: ${certificateData.completedChapters}/${certificateData.totalChapters} Chapters
Average Score: ${certificateData.score}%
Date: ${certificateData.completionDate}

Congratulations on completing this learning journey!
    `.trim();

    const blob = new Blob([certificateText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${subject.name.replace(/\s+/g, '_')}_Certificate.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

      {/* Certificate Modal */}
      <AnimatePresence>
        {showCertificate && (
          <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
            <DialogContent className="max-w-2xl">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                    Certificate Earned!
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                  </DialogTitle>
                </DialogHeader>
                
                <motion.div 
                  className="relative"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Certificate Design */}
                  <div className="bg-gradient-to-br from-yellow-50 via-white to-blue-50 border-4 border-yellow-200 rounded-xl p-8 shadow-2xl">
                    <div className="text-center space-y-6">
                      {/* Header */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                      >
                        <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
                          Certificate of Completion
                        </h2>
                      </motion.div>

                      {/* Content */}
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        <div className="text-xl font-semibold text-gray-800">
                          {subject.name}
                        </div>
                        <div className="text-lg text-gray-600">
                          Completed {subject.completedChapters.length} of {subject.chapters.length} Chapters
                        </div>
                        <div className="text-md text-gray-500">
                          Average Score: {Math.round(subject.chapters.reduce((acc, ch) => acc + (ch.score || 0), 0) / subject.chapters.length)}%
                        </div>
                        <div className="text-sm text-gray-400">
                          Issued on {new Date().toLocaleDateString()}
                        </div>
                      </motion.div>

                      {/* Decorative elements */}
                      <motion.div 
                        className="flex justify-center items-center gap-4 text-yellow-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        <Trophy className="h-8 w-8" />
                        <Sparkles className="h-6 w-6" />
                        <Trophy className="h-8 w-8" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <motion.div 
                    className="flex gap-3 mt-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <Button 
                      onClick={handleDownloadCertificate}
                      className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Download className="h-4 w-4" />
                      Download Certificate
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCertificate(false)}
                      className="flex-1"
                    >
                      Continue Learning
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};
