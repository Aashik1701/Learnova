import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, ListChecks } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";

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


const TeacherStudentMarks = () => {
  const { id, studentId } = useParams();
  const navigate = useNavigate();

  const attempts = useMemo(() => {
    const list = STUDENT_QUIZ_MARKS[studentId || ""] || [];
    return [...list].sort((a, b) => a.date.localeCompare(b.date));
  }, [studentId]);

  const goToQuiz = (quizId: string) => navigate(`/teacher/class/${id}/student/${studentId}/quiz/${quizId}`);

  const stats = useMemo(() => {
    if (attempts.length === 0) {
      return { count: 0, avg: 0, best: 0, worst: 0, last: 0, trend: "none" as const };
    }
    const scores = attempts.map(a => a.score);
    const count = scores.length;
    const avg = Math.round((scores.reduce((s, v) => s + v, 0) / count) * 10) / 10;
    const best = Math.max(...scores);
    const worst = Math.min(...scores);
    const last = attempts[attempts.length - 1]?.score || 0;
    const first = attempts[0]?.score || 0;
    const trend = last > first ? "up" : last < first ? "down" : "flat";
    return { count, avg, best, worst, last, trend };
  }, [attempts]);

  const chartData = useMemo(() => attempts.map(a => ({ date: a.date, score: a.score, title: a.title })), [attempts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/teacher/class/${id}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Class {id} • Student {studentId} • Quiz Marks</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overall" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overall">Overall Analysis</TabsTrigger>
            <TabsTrigger value="individual">Individual Quizzes</TabsTrigger>
          </TabsList>

          <TabsContent value="overall" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-sm">Total Quizzes</CardTitle>
                  <CardDescription>Completed</CardDescription>
                </CardHeader>
                <CardContent className="text-3xl font-bold">{stats.count}</CardContent>
              </Card>
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-sm">Average Score</CardTitle>
                  <CardDescription>Across all attempts</CardDescription>
                </CardHeader>
                <CardContent className="text-3xl font-bold">{stats.avg}%</CardContent>
              </Card>
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-sm">Best / Worst</CardTitle>
                  <CardDescription>Highs and lows</CardDescription>
                </CardHeader>
                <CardContent className="text-3xl font-bold">{stats.best}% / {stats.worst}%</CardContent>
              </Card>
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-sm">Latest Score</CardTitle>
                  <CardDescription>Trend</CardDescription>
                </CardHeader>
                <CardContent className="text-3xl font-bold flex items-center gap-2">
                  {stats.last}%
                  <span className={{ up: "text-green-600", down: "text-red-600", flat: "text-muted-foreground", none: "text-muted-foreground" }[stats.trend]}>• {stats.trend}</span>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle>Score Trend</CardTitle>
                <CardDescription>Scores over time</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <p className="text-muted-foreground">No data to display.</p>
                ) : (
                  <ChartContainer className="h-64" config={{ score: { label: "Score", color: "hsl(var(--primary))" } }}>
                    <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
                      <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} dot />
                    </LineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle>Scores by Quiz</CardTitle>
                <CardDescription>Compare quiz outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <p className="text-muted-foreground">No data to display.</p>
                ) : (
                  <ChartContainer className="h-64" config={{ score: { label: "Score", color: "hsl(var(--primary))" } }}>
                    <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="title" tickLine={false} axisLine={false} interval={0} angle={-15} height={60} textAnchor="end" />
                      <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent hideIndicator nameKey="title" />} />
                      <Bar dataKey="score" fill="var(--color-score)" radius={[6,6,0,0]} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="individual">
            <Card className="rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle>Individual Quiz Analysis</CardTitle>
                <CardDescription>Click a quiz to view details</CardDescription>
              </CardHeader>
              <CardContent>
                {attempts.length === 0 ? (
                  <p className="text-muted-foreground">No quiz attempts found for this student.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-muted-foreground">
                        <tr className="border-b">
                          <th className="py-2 text-left font-medium">Quiz</th>
                          <th className="py-2 text-left font-medium">Date</th>
                          <th className="py-2 text-left font-medium">Score</th>
                          <th className="py-2 text-right font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts.map((a) => (
                          <tr key={a.id} className="border-b last:border-0 hover:bg-muted/40 cursor-pointer" onClick={() => goToQuiz(a.id)}>
                            <td className="py-3">{a.title}</td>
                            <td className="py-3">{a.date}</td>
                            <td className="py-3 font-semibold">{a.score}%</td>
                            <td className="py-3 text-right">
                              <Button
                                variant="outline"
                                className="rounded-xl"
                                onClick={(e) => { e.stopPropagation(); goToQuiz(a.id); }}
                              >
                                View Analysis
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherStudentMarks;
