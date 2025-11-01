import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Users, ClipboardList, Shield, Sparkles, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const HARDCODED_CLASSES = [
  { id: 1, name: "Algebra - Section A", students: 28, assignments: 3 },
  { id: 2, name: "Physics - Grade 10", students: 32, assignments: 2 },
];

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [teacherName] = useState(() => localStorage.getItem("teacher_name") || "Teacher");

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
            <Button variant="ghost" onClick={() => navigate("/dashboard/teacher")} className="rounded-xl">Dashboard</Button>
            <Button variant="outline" onClick={handleLogout} className="rounded-xl">Logout</Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                Teacher Dashboard
                <GraduationCap className="h-8 w-8 text-primary" />
              </h1>
              <p className="text-muted-foreground text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Welcome back, {teacherName}! Manage your classes and assignments.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div className="lg:col-span-2 space-y-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <Card className="rounded-xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Your Classes
                    </CardTitle>
                    <CardDescription>Overview of your current classes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {HARDCODED_CLASSES.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => navigate(`/teacher/class/${c.id}`)}
                        className="w-full text-left p-4 border rounded-xl hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                        {c.name}
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                <Card className="rounded-xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-3">
                    <Button variant="secondary" >Upload Note</Button>
                    <Button variant="secondary" >Create Quiz</Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <Card className="rounded-xl shadow-lg mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Classroom Tips
                    </CardTitle>
                    <CardDescription>Improve engagement and outcomes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-2">
                      <li>Use formative quizzes to assess understanding quickly.</li>
                      <li>Encourage peer learning with small group activities.</li>
                      <li>Celebrate milestones to motivate students.</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-12 w-96 rounded-xl" />
    <Skeleton className="h-6 w-72 rounded-xl" />
    <Skeleton className="h-40 w-full rounded-xl" />
  </div>
);

export default TeacherDashboard;
