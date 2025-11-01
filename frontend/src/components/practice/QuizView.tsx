import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Trophy, XCircle, CheckCircle2, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { Chapter } from "@/pages/Practice";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import ProctorCamera from "@/components/proctor/ProctorCamera";
import ProctorAlerts from "@/components/proctor/ProctorAlerts";

interface QuizViewProps {
  chapter: Chapter;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export const QuizView = ({ chapter, onComplete, onBack }: QuizViewProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [enableProctor, setEnableProctor] = useState(false);
  const [showProctorConsent, setShowProctorConsent] = useState(false);
  const [proctorModeActive, setProctorModeActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const questions = chapter.quiz.questions;
  const totalQuestions = questions.length;

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

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
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
    const correct = questions.filter((q, idx) => 
      selectedAnswers[idx] === q.correctAnswer
    ).length;
    return Math.round((correct / totalQuestions) * 100);
  };

  const handleFinish = () => {
    const score = calculateScore();
    onComplete(score);
  };

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
    const score = calculateScore();
    const passed = score >= 60;

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

        <main className="container mx-auto px-6 py-8 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={`${passed ? "border-primary" : "border-destructive"} shadow-lg`}>
              <CardHeader className="text-center">
                <motion.div 
                  className="flex justify-center mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  {passed ? (
                    <CheckCircle2 className="h-20 w-20 text-primary" />
                  ) : (
                    <XCircle className="h-20 w-20 text-destructive" />
                  )}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <CardTitle className="text-3xl">
                    {passed ? "Congratulations!" : "Keep Practicing!"}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    You scored {score}% on this quiz
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span>Your Score</span>
                    <span className="font-bold text-lg">{score}%</span>
                  </div>
                  <Progress value={score} className="h-3" />
                </motion.div>

                <motion.div 
                  className="grid grid-cols-2 gap-4 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="p-4 rounded-lg bg-primary/10">
                    <div className="text-2xl font-bold text-primary">
                      {questions.filter((q, idx) => selectedAnswers[idx] === q.correctAnswer).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Correct</div>
                  </div>
                  <div className="p-4 rounded-lg bg-destructive/10">
                    <div className="text-2xl font-bold text-destructive">
                      {questions.filter((q, idx) => selectedAnswers[idx] !== q.correctAnswer).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Incorrect</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {passed ? (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <p className="text-center">
                        Great job! You've passed this chapter and unlocked the next one.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                      <p className="text-center">
                        You need 60% or higher to pass. Review the lesson and try again!
                      </p>
                    </div>
                  )}
                </motion.div>

                <motion.div 
                  className="flex gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <Button variant="outline" onClick={onBack} className="flex-1">
                    Review Lesson
                  </Button>
                  <Button onClick={handleFinish} className="flex-1">
                    {passed ? "Continue" : "Try Again"}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const question = questions[currentQuestion];
  const hasAnswer = selectedAnswers[currentQuestion] !== undefined;

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
              Quiz
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
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>Question {currentQuestion + 1} of {totalQuestions}</CardTitle>
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Proctor Mode Checkbox - Only show if not already active */}
                {!proctorModeActive && (
                  <motion.div 
                    className="flex items-center space-x-2 p-4 rounded-lg border bg-muted/50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
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
                  </motion.div>
                )}

                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <p className="text-lg font-medium leading-relaxed">{question.question}</p>
                  
                  <RadioGroup
                    value={selectedAnswers[currentQuestion]?.toString()}
                    onValueChange={(value) => handleAnswerSelect(parseInt(value))}
                  >
                    {question.options.map((option, idx) => (
                      <motion.div 
                        key={idx} 
                        className="flex items-center space-x-3 space-y-0"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                      >
                        <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                        <Label
                          htmlFor={`option-${idx}`}
                          className="font-normal cursor-pointer flex-1 py-3"
                        >
                          {option}
                        </Label>
                      </motion.div>
                    ))}
                  </RadioGroup>
                </motion.div>

                <motion.div 
                  className="flex gap-3 pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {currentQuestion > 0 && (
                    <Button variant="outline" onClick={handleBack}>
                      Previous
                    </Button>
                  )}
                  <Button 
                    onClick={handleNext}
                    disabled={!hasAnswer}
                    className="flex-1"
                  >
                    {currentQuestion === totalQuestions - 1 ? "Finish Quiz" : "Next Question"}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
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
