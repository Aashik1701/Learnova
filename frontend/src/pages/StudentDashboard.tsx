import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, BookOpen, Shield, TrendingUp, Award, Clock, Target, ArrowRight, Sparkles, Crown, CalendarClock, ListChecks, NotebookPen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const HARDCODED_LESSONS = [
  { id: 1, title: "Intro to Algebra", subject: "Math", difficulty: "Beginner", progress: 85 },
  { id: 2, title: "Basics of Biology", subject: "Science", difficulty: "Beginner", progress: 60 },
  { id: 3, title: "World History Overview", subject: "History", difficulty: "Intermediate", progress: 45 },
];

const UPCOMING_ITEMS = [
  { id: "u1", title: "Algebra Quiz 2", type: "Quiz", dueDate: "2025-09-25" },
  { id: "u2", title: "Biology Assignment - Cells", type: "Assignment", dueDate: "2025-09-27" },
  { id: "u3", title: "History Quiz - WW2", type: "Quiz", dueDate: "2025-09-30" },
];

const COMPLETED_QUIZZES = [
  { id: "c1", title: "Algebra Basics", subject: "Math", score: 85, date: "2025-09-10" },
  { id: "c2", title: "Linear Equations", subject: "Math", score: 78, date: "2025-09-15" },
  { id: "c3", title: "Biology Fundamentals", subject: "Science", score: 92, date: "2025-09-18" },
  { id: "c4", title: "World History - WW1", subject: "History", score: 66, date: "2025-09-20" },
];

const HARDCODED_RECOMMENDATIONS = [
  {
    title: "Study Skills 101",
    subject: "Skills",
    difficulty: "Beginner",
    description: "Learn effective study techniques to boost your learning.",
    reason: "Great next step based on your recent activity"
  },
  {
    title: "Interactive Geometry",
    subject: "Math",
    difficulty: "Intermediate",
    description: "Explore shapes and theorems with visual explanations.",
    reason: "Builds on your Algebra progress"
  }
];

interface Recommendation {
  title: string;
  subject: string;
  difficulty: string;
  description: string;
  reason: string;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userName] = useState(() => localStorage.getItem("learner_name") || "Student");
  const [progress] = useState(HARDCODED_LESSONS);
  const [recommendations] = useState(HARDCODED_RECOMMENDATIONS);
  const [upcoming] = useState(UPCOMING_ITEMS);
  const [completed] = useState(COMPLETED_QUIZZES);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);
  
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Learnova
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Button variant="ghost" onClick={() => navigate("/dashboard/student")} className="rounded-xl">Dashboard</Button>
            <Button variant="outline" onClick={handleLogout} className="rounded-xl">Logout</Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                Student Dashboard
                <motion.span
                  animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 3 }}
                >
                  🎓
                </motion.span>
              </h1>
              <p className="text-muted-foreground text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Welcome back, {userName}! Keep up the great work.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard icon={<TrendingUp className="h-6 w-6" />} title="Learning Streak" value="8 days" change="+2 this week" variant="success" delay={0} />
              <StatCard icon={<Target className="h-6 w-6" />} title="Lessons Completed" value="12" change="3 in progress" variant="primary" delay={0.1} />
              <StatCard icon={<Clock className="h-6 w-6" />} title="Study Time" value="21h" change="1.2 hrs today" variant="secondary" delay={0.2} />
              <StatCard icon={<Award className="h-6 w-6" />} title="Achievements" value="4" change="1 new" variant="warning" delay={0.3} />
            </div>

            <motion.div className="grid lg:grid-cols-3 gap-6 my-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <Card className="rounded-xl shadow-lg lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-primary" /> Upcoming</CardTitle>
                  <CardDescription>Quizzes and assignments assigned to you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcoming.length === 0 ? (
                    <p className="text-muted-foreground">No upcoming items.</p>
                  ) : (
                    upcoming.map((u) => (
                      <div key={u.id} className="p-3 border rounded-xl flex items-center justify-between hover:bg-muted/40">
                        <div>
                          <div className="font-medium">{u.title}</div>
                          <div className="text-xs text-muted-foreground">{u.type} • Due {u.dueDate}</div>
                        </div>
                        <Button size="sm" variant="outline" className="rounded-xl">View</Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><NotebookPen className="h-5 w-5 text-primary" /> Notes</CardTitle>
                  <CardDescription>Quick access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full rounded-xl" variant="secondary">View Notes</Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div className="grid lg:grid-cols-3 gap-6 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
              <Card className="rounded-xl shadow-lg lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary" /> Completed Quizzes</CardTitle>
                  <CardDescription>Results and scores</CardDescription>
                </CardHeader>
                <CardContent>
                  {completed.length === 0 ? (
                    <p className="text-muted-foreground">No completed quizzes yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-muted-foreground">
                          <tr className="border-b">
                            <th className="py-2 text-left font-medium">Quiz</th>
                            <th className="py-2 text-left font-medium">Subject</th>
                            <th className="py-2 text-left font-medium">Date</th>
                            <th className="py-2 text-left font-medium">Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {completed.map((c) => (
                            <tr key={c.id} className="border-b last:border-0">
                              <td className="py-3">{c.title}</td>
                              <td className="py-3">{c.subject}</td>
                              <td className="py-3">{c.date}</td>
                              <td className="py-3 font-semibold">{c.score}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-lg">
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Recent scores</CardDescription>
                </CardHeader>
                <CardContent>
                  {completed.length === 0 ? (
                    <p className="text-muted-foreground">No data to display.</p>
                  ) : (
                    <ChartContainer className="h-64" config={{ score: { label: "Score", color: "hsl(var(--primary))" } }}>
                      <LineChart data={completed.map(c => ({ name: c.title, score: c.score }))} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-15} height={60} textAnchor="end" />
                        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent hideIndicator nameKey="name" />} />
                        <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} dot />
                      </LineChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div className="grid lg:grid-cols-3 gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
              <Card className="rounded-xl shadow-lg">
                <CardHeader>
                  <CardTitle>Subject Mix</CardTitle>
                  <CardDescription>Distribution of completed quizzes</CardDescription>
                </CardHeader>
                <CardContent>
                  {completed.length === 0 ? (
                    <p className="text-muted-foreground">No data to display.</p>
                  ) : (
                    (() => {
                      const bySubject: Record<string, number> = {};
                      completed.forEach(c => { bySubject[c.subject] = (bySubject[c.subject] || 0) + 1; });
                      const data = Object.entries(bySubject).map(([name, value]) => ({ name, value }));
                      const colors = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4"]; // fallback palette
                      return (
                        <ChartContainer className="h-64" config={{ value: { label: "Count", color: "hsl(var(--primary))" } }}>
                          <PieChart>
                            <ChartTooltip content={<ChartTooltipContent hideIndicator nameKey="name" />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Pie
                              data={data}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ name, percent }) => `${name}: ${Math.round((percent || 0) * 100)}%`}
                              labelLine={false}
                            >
                              {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ChartContainer>
                      );
                    })()
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-lg lg:col-span-2">
                <CardHeader>
                  <CardTitle>Consistency</CardTitle>
                  <CardDescription>Rolling performance trend</CardDescription>
                </CardHeader>
                <CardContent>
                  {completed.length === 0 ? (
                    <p className="text-muted-foreground">No data to display.</p>
                  ) : (
                    <ChartContainer className="h-64" config={{ score: { label: "Score", color: "hsl(var(--primary))" } }}>
                      <BarChart data={completed.map(c => ({ name: c.title, score: c.score }))} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-15} height={60} textAnchor="end" />
                        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent hideIndicator nameKey="name" />} />
                        <Bar dataKey="score" fill="var(--color-score)" radius={[6,6,0,0]} />
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

const DashboardSkeleton = () => (
  <>
    <div className="mb-8 space-y-3">
      <Skeleton className="h-12 w-96 rounded-xl" />
      <Skeleton className="h-6 w-72 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="rounded-xl">
          <CardContent className="pt-6">
            <Skeleton className="h-20 w-full rounded-xl" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid lg:grid-cols-3 gap-6 mb-8">
      <Card className="lg:col-span-2 rounded-xl">
        <CardHeader>
          <Skeleton className="h-6 w-48 rounded-xl" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
      <Card className="rounded-xl">
        <CardHeader>
          <Skeleton className="h-6 w-32 rounded-xl" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    </div>
  </>
);

const StatCard = ({ 
  icon, 
  title, 
  value, 
  change, 
  variant,
  delay 
}: { 
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  variant: "success" | "primary" | "secondary" | "warning";
  delay: number;
}) => {
  const variantColors = {
    success: "text-green-500",
    primary: "text-blue-500",
    secondary: "text-purple-500",
    warning: "text-amber-500",
  };

  const variantBg = {
    success: "bg-green-500/10",
    primary: "bg-blue-500/10",
    secondary: "bg-purple-500/10",
    warning: "bg-amber-500/10",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} whileHover={{ scale: 1.02, y: -4 }} className="transition-all">
      <Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold">{value}</p>
              <p className={`text-sm font-medium ${variantColors[variant]}`}>{change}</p>
            </div>
            <div className={`p-3 rounded-xl ${variantBg[variant]} ${variantColors[variant]}`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const RecommendationCard = ({ recommendation, onStart }: { recommendation: Recommendation; onStart: () => void; }) => (
  <Card className="rounded-xl hover:shadow-md transition-all duration-300 border-border/50">
    <CardContent className="pt-6">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-lg">{recommendation.title}</h3>
            <p className="text-sm text-muted-foreground">{recommendation.subject} • {recommendation.difficulty}</p>
          </div>
          <Button size="sm" onClick={onStart} className="rounded-xl flex-shrink-0">
            Start <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm leading-relaxed">{recommendation.description}</p>
        <p className="text-xs text-primary flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          {recommendation.reason}
        </p>
      </div>
    </CardContent>
  </Card>
);

const ActionCard = ({ icon, title, description, onClick }: { icon: React.ReactNode; title: string; description: string; onClick: () => void; }) => (
  <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }} className="transition-all">
    <Card className="cursor-pointer rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-border/50 h-full" onClick={onClick}>
      <CardContent className="pt-6 text-center space-y-3 flex flex-col items-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

export default StudentDashboard;
