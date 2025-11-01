import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Trophy, RotateCcw, BookOpen, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import ProctorCamera from "@/components/proctor/ProctorCamera";
import ProctorAlerts from "@/components/proctor/ProctorAlerts";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface LessonQuizViewProps {
  questions: QuizQuestion[];
  chapterTitle: string;
  onComplete: (score: number, passed: boolean) => void;
  onBack: () => void;
  onReviewLesson: () => void;
}

export const LessonQuizView = ({ questions, chapterTitle, onComplete, onBack, onReviewLesson }: LessonQuizViewProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [enableProctor, setEnableProctor] = useState(false);
  const [showProctorConsent, setShowProctorConsent] = useState(false);
  const [proctorModeActive, setProctorModeActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const handleProctorToggle = (checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    setEnableProctor(isChecked);
    if (isChecked) {
      setShowProctorConsent(true);
    }
  };

  const handleConsentAgree = () => {
    setProctorModeActive(true);
    setShowProctorConsent(false);
  };

  const handleConsentCancel = () => {
    setEnableProctor(false);
    setShowProctorConsent(false);
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: answerIndex });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return (correct / questions.length) * 100;
  };

  const score = calculateScore();
  const passed = score > 50;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Proctor Consent Screen
  if (showProctorConsent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-6">
        <Card className="max-w-4xl w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">Enable Proctor Mode</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Proctoring Requirements
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Camera must remain on throughout the quiz</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Ensure good lighting and face visibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Stay in frame and avoid distractions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Do not switch tabs or leave the window</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Camera Preview</h3>
                <ProctorCamera 
                  isActive={true}
                  onStreamReady={() => setCameraReady(true)}
                />
                {cameraReady && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Camera ready
                  </p>
                )}
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                <strong>Privacy Notice:</strong> Video feed is analyzed in real-time by AI. Data is encrypted and used only for integrity monitoring.
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleConsentCancel} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleConsentAgree}
                disabled={!cameraReady}
                className="flex-1"
              >
                {cameraReady ? "I Agree - Start Quiz" : "Waiting for camera..."}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Trophy className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Quiz Results
              </span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {passed ? "Congratulations! 🎉" : "Keep Learning! 📚"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-primary">
                  {score.toFixed(0)}%
                </div>
                <p className="text-xl text-muted-foreground">
                  You scored {score.toFixed(0)}% on the {chapterTitle} quiz
                </p>
                <p className="text-lg">
                  {passed
                    ? "Great job! You've unlocked the next chapter."
                    : "You need at least 51% to unlock the next chapter. Review the lesson and try again!"}
                </p>
              </div>

              <div className="space-y-4 pt-6">
                <h3 className="font-semibold text-lg">Review Your Answers:</h3>
                {questions.map((q, idx) => {
                  const userAnswer = selectedAnswers[q.id];
                  const isCorrect = userAnswer === q.correctAnswer;
                  return (
                    <Card key={q.id} className={isCorrect ? "border-green-500" : "border-red-500"}>
                      <CardContent className="pt-6">
                        <p className="font-medium mb-2">
                          {idx + 1}. {q.question}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Your answer: {q.options[userAnswer]}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Correct answer: {q.options[q.correctAnswer]}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex gap-4 pt-6">
                <Button variant="outline" onClick={onReviewLesson} className="flex-1">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Review Lesson
                </Button>
                {passed ? (
                  <Button onClick={() => onComplete(score, true)} className="flex-1">
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={() => onComplete(score, false)} variant="secondary" className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const isAnswered = selectedAnswers[currentQ.id] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Quiz: {chapterTitle}
            </span>
            {proctorModeActive && (
              <div className="ml-4 flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                <Shield className="h-4 w-4 text-cyan-400" />
                <span className="text-xs text-cyan-400 font-semibold">PROCTOR ACTIVE</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className={proctorModeActive ? "grid lg:grid-cols-3 gap-6" : ""}>
          <div className={proctorModeActive ? "lg:col-span-2" : ""}>
            <Card>
              <CardHeader>
                <Progress value={progress} className="mb-4" />
                <CardTitle>
                  Question {currentQuestion + 1} of {questions.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Proctor Mode Checkbox - Only show if not already active */}
                {!proctorModeActive && (
                  <div className="flex items-center space-x-2 p-4 rounded-lg border bg-muted/50">
                    <Checkbox 
                      id="enable-proctor" 
                      checked={enableProctor}
                      onCheckedChange={handleProctorToggle}
                    />
                    <Label 
                      htmlFor="enable-proctor" 
                      className="cursor-pointer flex items-center gap-2 text-sm font-medium"
                    >
                      <Shield className="h-4 w-4 text-primary" />
                      Enable Proctor Mode (AI monitoring)
                    </Label>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">{currentQ.question}</h3>
                  <RadioGroup
                    value={selectedAnswers[currentQ.id]?.toString() || ""}
                    onValueChange={(value) => handleAnswerSelect(currentQ.id, parseInt(value))}
                  >
                    {currentQ.options.map((option, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                        <Label htmlFor={`option-${idx}`} className="cursor-pointer flex-1">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentQuestion === 0}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!isAnswered}
                    className="flex-1"
                  >
                    {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Proctor Sidebar */}
          {proctorModeActive && (
            <div className="space-y-6 lg:sticky lg:top-6">
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    AI Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="w-full">
                    <ProctorCamera key={`quiz-camera-${proctorModeActive}`} isActive={proctorModeActive} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <ProctorAlerts isActive={true} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
