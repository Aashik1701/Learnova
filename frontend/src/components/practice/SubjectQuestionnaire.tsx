import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Brain, ArrowLeft } from "lucide-react";
import { QuestionnaireAnswers, Subject } from "@/pages/Practice";

interface SubjectQuestionnaireProps {
  existingSubject: Subject | null;
  onComplete: (name: string, answers: QuestionnaireAnswers) => void;
  onCancel: () => void;
}

const questions = [
  {
    id: "proficiency",
    question: "What's your current proficiency level?",
    options: [
      { value: "beginner", label: "Beginner - Just starting out" },
      { value: "intermediate", label: "Intermediate - Have some knowledge" },
      { value: "advanced", label: "Advanced - Strong understanding" },
    ],
  },
  {
    id: "interest",
    question: "What's your main interest in this subject?",
    options: [
      { value: "career", label: "Career advancement" },
      { value: "hobby", label: "Personal hobby/interest" },
      { value: "academic", label: "Academic requirements" },
    ],
  },
  {
    id: "goal",
    question: "What's your primary learning goal?",
    options: [
      { value: "mastery", label: "Complete mastery" },
      { value: "practical", label: "Practical application" },
      { value: "overview", label: "General overview" },
    ],
  },
  {
    id: "timeCommitment",
    question: "How much time can you commit weekly?",
    options: [
      { value: "light", label: "1-3 hours - Light study" },
      { value: "moderate", label: "4-7 hours - Moderate study" },
      { value: "intensive", label: "8+ hours - Intensive study" },
    ],
  },
  {
    id: "learningStyle",
    question: "What's your preferred learning style?",
    options: [
      { value: "visual", label: "Visual - Diagrams and examples" },
      { value: "practical", label: "Practical - Hands-on exercises" },
      { value: "theoretical", label: "Theoretical - Concepts and theory" },
    ],
  },
];

export const SubjectQuestionnaire = ({ existingSubject, onComplete, onCancel }: SubjectQuestionnaireProps) => {
  const [subjectName, setSubjectName] = useState(existingSubject?.name || "");
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>(
    existingSubject?.questionnaireAnswers || {}
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleAnswerSelect = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete(subjectName, answers as QuestionnaireAnswers);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isNameValid = subjectName.trim().length > 0;
  const isCurrentAnswered = answers[questions[currentQuestion].id as keyof QuestionnaireAnswers];
  const canProceed = isNameValid && isCurrentAnswered;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {existingSubject ? "Edit Subject" : "New Subject"}
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Setup Your Subject</CardTitle>
              <span className="text-sm text-muted-foreground">
                Step {currentQuestion + 1} of {questions.length + 1}
              </span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / (questions.length + 1)) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestion === -1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject-name">Subject Name</Label>
                  <Input
                    id="subject-name"
                    placeholder="e.g., Spanish, Guitar, Web Development"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {currentQuestion >= 0 && (
              <div className="space-y-6">
                {currentQuestion === 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="subject-name">Subject Name</Label>
                    <Input
                      id="subject-name"
                      placeholder="e.g., Spanish, Guitar, Web Development"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                    />
                  </div>
                )}
                
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">
                    {questions[currentQuestion].question}
                  </Label>
                  <RadioGroup
                    value={answers[questions[currentQuestion].id as keyof QuestionnaireAnswers] || ""}
                    onValueChange={(value) => handleAnswerSelect(questions[currentQuestion].id, value)}
                  >
                    {questions[currentQuestion].options.map((option) => (
                      <div key={option.value} className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label
                          htmlFor={option.value}
                          className="font-normal cursor-pointer flex-1 py-3"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {currentQuestion > 0 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              <Button 
                onClick={handleNext} 
                disabled={!canProceed}
                className="flex-1"
              >
                {currentQuestion === questions.length - 1 ? "Complete" : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
