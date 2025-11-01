import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { GeneralSurveyQuestions, SurveyQuestion } from "@/lib/survey";

export type SurveyAnswers = Record<SurveyQuestion["id"], string>;

interface LessonSurveyProps {
  lessonName: string;
  onComplete: (answers: SurveyAnswers) => void;
  onCancel: () => void;
}

export const LessonSurvey = ({ lessonName, onComplete, onCancel }: LessonSurveyProps) => {
  const [answers, setAnswers] = useState<Partial<SurveyAnswers>>({});
  const [index, setIndex] = useState(0);

  const total = GeneralSurveyQuestions.length;
  const current = GeneralSurveyQuestions[index];
  const allAnswered = GeneralSurveyQuestions.every(q => !!answers[q.id]);
  const isLast = index === total - 1;
  const progress = ((index + 1) / total) * 100;

  const goNext = () => {
    if (!answers[current.id]) return;
    if (isLast) {
      onComplete(answers as SurveyAnswers);
    } else {
      setIndex((i) => Math.min(i + 1, total - 1));
    }
  };

  const goBack = () => setIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background p-6">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Tell us about your learning preferences</CardTitle>
            <CardDescription>
              We'll tailor the {lessonName} lesson based on your preferences. This takes less than a minute.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">{index + 1} of {total}</p>
            </div>

            <div className="space-y-3">
              <Label className="text-base">{current.question.replace('{topic}', lessonName)}</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {current.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`text-left border rounded-md p-3 hover:bg-muted/50 transition-colors ${
                      answers[current.id] === opt.value ? 'border-primary' : 'border-border'
                    }`}
                    onClick={() => setAnswers(prev => ({ ...prev, [current.id]: opt.value }))}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <Button variant="outline" onClick={onCancel}>Cancel</Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={goBack} disabled={index === 0}>Back</Button>
                <Button onClick={goNext} disabled={!answers[current.id]}>
                  {isLast ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
