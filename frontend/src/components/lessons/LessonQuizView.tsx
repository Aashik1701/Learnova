import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Trophy, RotateCcw, BookOpen } from "lucide-react";

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
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <Progress value={progress} className="mb-4" />
            <CardTitle>
              Question {currentQuestion + 1} of {questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
      </main>
    </div>
  );
};
