import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, BookOpen, Users, Shield, TrendingUp, Award, Clock, Target, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Hardcoded data for demonstration
const HARDCODED_LESSONS = [
  { id: 1, title: "Advanced React Patterns", subject: "React", difficulty: "Advanced", progress: 85 },
  { id: 2, title: "TypeScript Best Practices", subject: "TypeScript", difficulty: "Intermediate", progress: 60 },
  { id: 3, title: "Web Performance Optimization", subject: "Performance", difficulty: "Advanced", progress: 45 },
  { id: 4, title: "CSS Grid Mastery", subject: "CSS", difficulty: "Intermediate", progress: 92 },
  { id: 5, title: "API Design Principles", subject: "Backend", difficulty: "Advanced", progress: 30 },
];

const HARDCODED_RECOMMENDATIONS = [
  {
    title: "Microservices Architecture",
    subject: "System Design",
    difficulty: "Advanced",
    description: "Learn to design and implement scalable microservices-based systems with best practices.",
    reason: "Based on your interest in backend development and API design"
  },
  {
    title: "React Server Components",
    subject: "React",
    difficulty: "Advanced",
    description: "Master the new React Server Components paradigm for building modern web applications.",
    reason: "Perfect next step after Advanced React Patterns"
  },
  {
    title: "Database Optimization",
    subject: "Database",
    difficulty: "Intermediate",
    description: "Optimize database queries, indexes, and schema design for maximum performance.",
    reason: "Complements your backend and API knowledge"
  }
];

const DashboardNew = () => {
  const navigate = useNavigate();
  const [userName] = useState("Alex");
  const [progress] = useState(HARDCODED_LESSONS);
  const [recommendations] = useState(HARDCODED_RECOMMENDATIONS);
  
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Learnova
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>Dashboard</Button>
            <Button variant="ghost" onClick={() => navigate("/lessons")}>Lessons</Button>
            <Button variant="ghost" onClick={() => navigate("/practice")}>Practice</Button>
            <Button variant="ghost" onClick={() => navigate("/peers")}>Peers</Button>
            <Button variant="ghost" onClick={() => navigate("/passports")}>Passports</Button>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2">Welcome, {userName}! 👋</h1>
          <p className="text-muted-foreground text-lg">
            Let's continue your personalized learning journey
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="Learning Streak"
            value="12 days"
            change="+3 this week"
            variant="success"
          />
          <StatCard
            icon={<Target className="h-6 w-6" />}
            title="Lessons Completed"
            value="23"
            change="5 in progress"
            variant="primary"
          />
          <StatCard
            icon={<Clock className="h-6 w-6" />}
            title="Study Time"
            value="47h"
            change="2.5 hrs today"
            variant="secondary"
          />
          <StatCard
            icon={<Award className="h-6 w-6" />}
            title="Achievements"
            value="8"
            change="2 new"
            variant="warning"
          />
        </div>

        {/* AI Recommendations */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recommended Lessons</CardTitle>
                  <CardDescription>AI-powered suggestions based on your profile</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <RecommendationCard 
                    recommendation={rec}
                    onStart={() => navigate("/lessons")}
                  />
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent lessons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {progress.map((p) => (
                <div key={p.id} className="space-y-2 cursor-pointer hover:opacity-80" onClick={() => navigate("/lessons")}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{p.title}</span>
                    <span className="text-muted-foreground">{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ActionCard
            icon={<BookOpen className="h-8 w-8" />}
            title="Continue Learning"
            description="Resume where you left off"
            onClick={() => navigate("/lessons")}
          />
          <ActionCard
            icon={<Target className="h-8 w-8" />}
            title="Practice Quiz"
            description="Test your knowledge"
            onClick={() => navigate("/practice")}
          />
          <ActionCard
            icon={<Users className="h-8 w-8" />}
            title="Join Study Group"
            description="Connect with peers"
            onClick={() => navigate("/peers")}
          />
          <ActionCard
            icon={<Shield className="h-8 w-8" />}
            title="View Credentials"
            description="Your learning passports"
            onClick={() => navigate("/passports")}
          />
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ 
  icon, 
  title, 
  value, 
  change, 
  variant 
}: { 
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  variant: "success" | "primary" | "secondary" | "warning";
}) => {
  const variantColors = {
    success: "text-success",
    primary: "text-primary",
    secondary: "text-secondary",
    warning: "text-warning",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold">{value}</p>
              <p className={`text-sm ${variantColors[variant]}`}>{change}</p>
            </div>
            <div className={variantColors[variant]}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const RecommendationCard = ({ 
  recommendation, 
  onStart 
}: { 
  recommendation: any;
  onStart: () => void;
}) => (
  <Card className="hover:shadow-lg transition-all duration-300">
    <CardContent className="pt-6">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{recommendation.title}</h3>
            <p className="text-sm text-muted-foreground">{recommendation.subject} • {recommendation.difficulty}</p>
          </div>
          <Button size="sm" onClick={onStart}>
            Start <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm">{recommendation.description}</p>
        <p className="text-xs text-primary">💡 {recommendation.reason}</p>
      </div>
    </CardContent>
  </Card>
);

const ActionCard = ({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300"
      onClick={onClick}
    >
      <CardContent className="pt-6 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

export default DashboardNew;
