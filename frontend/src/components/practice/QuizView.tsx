import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Trophy, XCircle, CheckCircle2 } from "lucide-react";
import { Chapter } from "@/pages/Practice";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

interface QuizViewProps {
  chapter: Chapter;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export const QuizView = ({ chapter, onComplete, onBack }: QuizViewProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const questions = chapter.quiz.questions;
  const totalQuestions = questions.length;

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
          <Card className={passed ? "border-primary" : "border-destructive"}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {passed ? (
                  <CheckCircle2 className="h-20 w-20 text-primary" />
                ) : (
                  <XCircle className="h-20 w-20 text-destructive" />
                )}
              </div>
              <CardTitle className="text-3xl">
                {passed ? "Congratulations!" : "Keep Practicing!"}
              </CardTitle>
              <CardDescription className="text-lg">
                You scored {score}% on this quiz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Your Score</span>
                  <span className="font-bold text-lg">{score}%</span>
                </div>
                <Progress value={score} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
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
              </div>

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

              <div className="flex gap-3">
                <Button variant="outline" onClick={onBack} className="flex-1">
                  Review Lesson
                </Button>
                <Button onClick={handleFinish} className="flex-1">
                  {passed ? "Continue" : "Try Again"}
                </Button>
              </div>
            </CardContent>
          </Card>
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
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Question {currentQuestion + 1} of {totalQuestions}</CardTitle>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p className="text-lg font-medium leading-relaxed">{question.question}</p>
              
              <RadioGroup
                value={selectedAnswers[currentQuestion]?.toString()}
                onValueChange={(value) => handleAnswerSelect(parseInt(value))}
              >
                {question.options.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                    <Label
                      htmlFor={`option-${idx}`}
                      className="font-normal cursor-pointer flex-1 py-3"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex gap-3 pt-4">
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
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
