import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, BookOpen, Shield, TrendingUp, Award, Clock, Target, ArrowRight, Sparkles, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const HARDCODED_LESSONS = [
  { id: 1, title: "Intro to Algebra", subject: "Math", difficulty: "Beginner", progress: 85 },
  { id: 2, title: "Basics of Biology", subject: "Science", difficulty: "Beginner", progress: 60 },
  { id: 3, title: "World History Overview", subject: "History", difficulty: "Intermediate", progress: 45 },
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

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <Card className="rounded-xl shadow-lg border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Recommended for You
                        </CardTitle>
                        <CardDescription>Based on your recent learning</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recommendations.map((rec, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + idx * 0.1 }}>
                        <RecommendationCard recommendation={rec} onStart={() => navigate("/lessons")} />
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <Card className="rounded-xl shadow-lg">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your recent lessons</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {progress.map((p, idx) => (
                      <motion.div key={p.id} className="space-y-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/lessons")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + idx * 0.05 }}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium truncate pr-2">{p.title}</span>
                          <span className="text-muted-foreground flex-shrink-0">{p.progress}%</span>
                        </div>
                        <Progress value={p.progress} className="h-2" />
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <ActionCard icon={<BookOpen className="h-8 w-8" />} title="Continue Learning" description="Resume where you left off" onClick={() => navigate("/lessons")} />
              <ActionCard icon={<Target className="h-8 w-8" />} title="Practice Quiz" description="Test your knowledge" onClick={() => navigate("/practice")} />
              <ActionCard icon={<Shield className="h-8 w-8" />} title="Certificates" description="View your achievements" onClick={() => navigate("/passports")} />
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
