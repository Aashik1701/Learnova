import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ArrowLeft, Loader2, CheckCircle, XCircle, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { VoiceButton } from "@/components/VoiceButton";
import confetti from "canvas-confetti";

const PracticeNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setIsLoading(true);

      // Load existing questions or generate new ones
      const { data: existingQuestions } = await supabase
        .from('practice_questions')
        .select('*')
        .eq('user_id', session.user.id)
        .limit(5);

      if (existingQuestions && existingQuestions.length > 0) {
        setQuestions(existingQuestions);
      } else {
        // Generate new questions
        await generateQuestions();
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error",
        description: "Failed to load practice questions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestions = async () => {
    try {
      setIsGenerating(true);
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .single();

      const { data, error } = await supabase.functions.invoke('generate-practice', {
        body: {
          subject: 'general knowledge',
          difficulty: profile?.proficiency_level || 'beginner',
          language: profile?.preferred_language || 'en',
          count: 5,
        },
      });

      if (error) throw error;
      setQuestions(data.questions);
      
      toast({
        title: "Questions generated!",
        description: "Your personalized practice is ready",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate questions",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (isCorrect !== null) return;

    setSelectedAnswer(answer);
    const correct = answer === questions[currentQuestion].correct_answer;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Save attempt
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('practice_attempts').insert({
        user_id: session.user.id,
        question_id: questions[currentQuestion].id,
        user_answer: answer,
        is_correct: correct,
      });
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setShowResults(false);
    generateQuestions();
  };

  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showResults) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <Trophy className="h-16 w-16 text-warning mx-auto mb-4" />
              <CardTitle className="text-3xl">Practice Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div>
                <p className="text-6xl font-bold text-primary">{percentage.toFixed(0)}%</p>
                <p className="text-muted-foreground mt-2">
                  You got {score} out of {questions.length} correct
                </p>
              </div>
              <div className="space-y-2">
                <Button onClick={handleRestart} className="w-full">
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full">
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Practice
            </span>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8 max-w-2xl">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-muted-foreground">No practice questions available</p>
              <Button onClick={generateQuestions}>
                Generate Practice Questions
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const options = question.options as Record<string, string>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Practice Quiz</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-xl font-bold text-primary">{score}/{questions.length}</p>
            </div>
            <VoiceButton text={question.question} lang={question.language} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{question.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(options).map(([key, value]) => (
                  <motion.div
                    key={key}
                    whileHover={{ scale: isCorrect === null ? 1.02 : 1 }}
                    whileTap={{ scale: isCorrect === null ? 0.98 : 1 }}
                  >
                    <Button
                      variant={
                        selectedAnswer === key
                          ? isCorrect
                            ? "default"
                            : "destructive"
                          : selectedAnswer !== null && key === question.correct_answer
                          ? "default"
                          : "outline"
                      }
                      className={`w-full justify-start text-left h-auto py-4 ${
                        selectedAnswer === key
                          ? isCorrect
                            ? "bg-success"
                            : "bg-destructive"
                          : selectedAnswer !== null && key === question.correct_answer
                          ? "bg-success"
                          : ""
                      }`}
                      onClick={() => handleAnswer(key)}
                      disabled={isCorrect !== null}
                    >
                      <span className="flex items-center gap-3 w-full">
                        <span className="font-bold">{key}.</span>
                        <span className="flex-1">{value}</span>
                        {selectedAnswer === key && (
                          isCorrect ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )
                        )}
                        {selectedAnswer !== null && key === question.correct_answer && selectedAnswer !== key && (
                          <CheckCircle className="h-5 w-5" />
                        )}
                      </span>
                    </Button>
                  </motion.div>
                ))}

                {isCorrect !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <div className={`p-4 rounded-lg ${isCorrect ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                      <p className="font-semibold mb-2">
                        {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        The correct answer is: <strong>{question.correct_answer}</strong>
                      </p>
                    </div>
                    <Button onClick={handleNext} className="w-full mt-4">
                      {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default PracticeNew;
