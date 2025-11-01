import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, ListChecks } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";

const STUDENT_QUIZ_MARKS: Record<string, Array<{ id: string; title: string; score: number; date: string }>> = {
  s1: [
    { id: "q1", title: "Algebra Basics", score: 85, date: "2025-09-10" },
    { id: "q2", title: "Linear Equations", score: 78, date: "2025-09-15" },
  ],
  s2: [
    { id: "q3", title: "Quadratic Functions", score: 92, date: "2025-09-12" },
    { id: "q4", title: "Polynomials", score: 88, date: "2025-09-20" },
  ],
  s3: [
    { id: "q5", title: "Vectors Intro", score: 67, date: "2025-09-11" },
  ],
  s4: [
    { id: "q6", title: "Kinematics", score: 95, date: "2025-09-14" },
  ],
  s5: [
    { id: "q7", title: "Dynamics", score: 58, date: "2025-09-18" },
  ],
};

const QUIZ_TOPIC_BREAKDOWN: Record<string, Array<{ topic: string; correct: number; incorrect: number }>> = {
  q1: [
    { topic: "Variables", correct: 6, incorrect: 2 },
    { topic: "Operations", correct: 5, incorrect: 3 },
    { topic: "Word Problems", correct: 2, incorrect: 4 },
  ],
  q2: [
    { topic: "Solving Equations", correct: 5, incorrect: 4 },
    { topic: "Graphing", correct: 2, incorrect: 3 },
    { topic: "Slope-Intercept", correct: 1, incorrect: 3 },
  ],
  q3: [
    { topic: "Roots", correct: 7, incorrect: 1 },
    { topic: "Vertex Form", correct: 5, incorrect: 2 },
  ],
  q4: [
    { topic: "Addition/Subtraction", correct: 6, incorrect: 1 },
    { topic: "Multiplication", correct: 5, incorrect: 2 },
    { topic: "Factoring", correct: 3, incorrect: 3 },
  ],
  q5: [
    { topic: "Basics", correct: 3, incorrect: 4 },
    { topic: "Dot Product", correct: 1, incorrect: 3 },
  ],
  q6: [
    { topic: "Displacement", correct: 6, incorrect: 0 },
    { topic: "Velocity", correct: 6, incorrect: 1 },
    { topic: "Acceleration", correct: 5, incorrect: 1 },
  ],
  q7: [
    { topic: "Forces", correct: 2, incorrect: 5 },
    { topic: "Newton's Laws", correct: 1, incorrect: 4 },
  ],
};

const TeacherStudentQuizAnalysis = () => {
  const { id, studentId, quizId } = useParams();
  const navigate = useNavigate();

  const attempts = useMemo(() => {
    const list = STUDENT_QUIZ_MARKS[studentId || ""] || [];
    return [...list].sort((a, b) => a.date.localeCompare(b.date));
  }, [studentId]);

  const selectedQuiz = useMemo(() => attempts.find((a) => a.id === quizId) || null, [attempts, quizId]);
  const stats = useMemo(() => {
    if (attempts.length === 0) return { avg: 0 };
    const scores = attempts.map((a) => a.score);
    const avg = Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10;
    return { avg };
  }, [attempts]);

  const topicData = useMemo(() => QUIZ_TOPIC_BREAKDOWN[quizId || ""] || [], [quizId]);
  const chart = useMemo(() => topicData.map(d => ({ topic: d.topic, correct: d.correct, incorrect: d.incorrect })), [topicData]);
  const focus = useMemo(() => {
    const ranked = [...topicData]
      .map(d => ({
        topic: d.topic,
        total: d.correct + d.incorrect,
        accuracy: d.correct + d.incorrect === 0 ? 0 : d.correct / (d.correct + d.incorrect),
        incorrect: d.incorrect,
      }))
      .sort((a, b) => a.accuracy - b.accuracy || b.incorrect - a.incorrect);
    return ranked;
  }, [topicData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/teacher/class/${id}/student/${studentId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Class {id} • Student {studentId} • Quiz {quizId}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="rounded-xl md:col-span-2">
            <CardHeader>
              <CardTitle>Topics Performance</CardTitle>
              <CardDescription>Correct vs Incorrect per topic</CardDescription>
            </CardHeader>
            <CardContent>
              {chart.length === 0 ? (
                <p className="text-muted-foreground">No topic analytics available.</p>
              ) : (
                <ChartContainer className="h-64" config={{ correct: { label: "Correct", color: "hsl(var(--success, 142 71% 45%))" }, incorrect: { label: "Incorrect", color: "hsl(var(--destructive))" } }}>
                  <BarChart data={chart} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="topic" tickLine={false} axisLine={false} interval={0} angle={-15} height={60} textAnchor="end" />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent hideIndicator nameKey="topic" />} />
                    <Bar dataKey="correct" stackId="a" fill="var(--color-correct)" radius={[6,6,0,0]} />
                    <Bar dataKey="incorrect" stackId="a" fill="var(--color-incorrect)" radius={[6,6,0,0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Score Context</CardTitle>
              <CardDescription>Compared to student average</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Quiz Score: <span className="font-medium text-foreground">{selectedQuiz?.score ?? "-"}%</span></div>
                <div className="text-sm text-muted-foreground">Average: <span className="font-medium text-foreground">{stats.avg}%</span></div>
                <div className="text-xs text-muted-foreground">Date: {selectedQuiz?.date}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Focus Areas</CardTitle>
            <CardDescription>Topics needing attention</CardDescription>
          </CardHeader>
          <CardContent>
            {focus.length === 0 ? (
              <p className="text-muted-foreground">No focus areas detected.</p>
            ) : (
              <div className="space-y-3">
                {focus.map((r) => (
                  <div key={r.topic} className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{r.topic}</div>
                      <div className="text-xs text-muted-foreground">Accuracy {(Math.round(r.accuracy * 1000) / 10).toFixed(1)}% • Incorrect {r.incorrect}</div>
                    </div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, r.accuracy * 100))}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TeacherStudentQuizAnalysis;
