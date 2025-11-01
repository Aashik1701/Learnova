import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Users, UserCircle2 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";

const CLASS_STUDENTS: Record<string, Array<{ id: string; name: string; email: string; progress: number }>> = {
  "1": [
    { id: "s1", name: "John Doe", email: "john@example.com", progress: 76 },
    { id: "s2", name: "Aisha Patel", email: "aisha@example.com", progress: 88 },
    { id: "s3", name: "Wei Chen", email: "wei@example.com", progress: 62 },
  ],
  "2": [
    { id: "s4", name: "Sara Khan", email: "sara@example.com", progress: 91 },
    { id: "s5", name: "Liam Smith", email: "liam@example.com", progress: 54 },
  ],
};

const CLASS_QUIZ_SCORES: Record<string, Array<{ id: string; title: string; scores: number[] }>> = {
  "1": [
    { id: "q1", title: "Algebra Basics", scores: [85, 78, 67, 90, 72, 81] },
    { id: "q2", title: "Linear Equations", scores: [70, 88, 74, 92, 65, 79] },
    { id: "q3", title: "Quadratic Functions", scores: [91, 86, 73, 88, 84, 95] },
  ],
  "2": [
    { id: "q4", title: "Kinematics", scores: [95, 82, 77, 88] },
    { id: "q5", title: "Dynamics", scores: [58, 64, 70, 61] },
  ],
};

const ClassStudents = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const students = useMemo(() => CLASS_STUDENTS[id || "1"] || [], [id]);

  const stats = useMemo(() => {
    if (students.length === 0) {
      return { count: 0, avg: 0, best: 0, worst: 0 };
    }
    const arr = students.map(s => s.progress);
    const count = arr.length;
    const avg = Math.round((arr.reduce((a, b) => a + b, 0) / count) * 10) / 10;
    const best = Math.max(...arr);
    const worst = Math.min(...arr);
    return { count, avg, best, worst };
  }, [students]);

  const progressData = useMemo(() => students.map(s => ({ name: s.name, progress: s.progress })), [students]);

  const quizStats = useMemo(() => {
    const quizzes = CLASS_QUIZ_SCORES[id || "1"] || [];
    return quizzes.map(q => {
      const arr = q.scores || [];
      if (arr.length === 0) return { id: q.id, title: q.title, avg: 0, best: 0, worst: 0 };
      const avg = Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
      const best = Math.max(...arr);
      const worst = Math.min(...arr);
      return { id: q.id, title: q.title, avg, best, worst };
    });
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/teacher")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Class {id} • Students</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle>Class Analytics</CardTitle>
            <CardDescription>Average, best, and lowest scores for each quiz</CardDescription>
          </CardHeader>
          <CardContent>
            {quizStats.length === 0 ? (
              <p className="text-muted-foreground">No quizzes yet for this class.</p>
            ) : (
              <>
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm">
                    <thead className="text-muted-foreground">
                      <tr className="border-b">
                        <th className="py-2 text-left font-medium">Quiz</th>
                        <th className="py-2 text-left font-medium">Average</th>
                        <th className="py-2 text-left font-medium">Best</th>
                        <th className="py-2 text-left font-medium">Lowest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizStats.map(q => (
                        <tr key={q.id} className="border-b last:border-0">
                          <td className="py-3">{q.title}</td>
                          <td className="py-3 font-medium">{q.avg}%</td>
                          <td className="py-3">{q.best}%</td>
                          <td className="py-3">{q.worst}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ChartContainer className="h-64" config={{ avg: { label: "Average", color: "hsl(var(--primary))" }, best: { label: "Best", color: "hsl(var(--success, 142 71% 45%))" }, worst: { label: "Lowest", color: "hsl(var(--destructive))" } }}>
                  <BarChart data={quizStats} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="title" tickLine={false} axisLine={false} interval={0} angle={-15} height={60} textAnchor="end" />
                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent hideIndicator nameKey="title" />} />
                    <Bar dataKey="avg" fill="var(--color-avg)" radius={[6,6,0,0]} />
                    <Bar dataKey="best" fill="var(--color-best)" radius={[6,6,0,0]} />
                    <Bar dataKey="worst" fill="var(--color-worst)" radius={[6,6,0,0]} />
                  </BarChart>
                </ChartContainer>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Roster and progress overview</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {students.length === 0 ? (
              <p className="text-muted-foreground">No students in this class yet.</p>
            ) : (
              students.map((s) => (
                <div key={s.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <UserCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold leading-tight">{s.name}</div>
                      <div className="text-sm text-muted-foreground">{s.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" className="rounded-xl" onClick={() => navigate(`/teacher/class/${id}/student/${s.id}`)}>
                      View Marks
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ClassStudents;
