import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, BookOpen, Users, Shield, TrendingUp, Award, Clock, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

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
            <Button variant="outline" onClick={() => navigate("/")}>Logout</Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">Welcome back, Learner! 👋</h1>
          <p className="text-muted-foreground text-lg">
            Let's continue your personalized learning journey
          </p>
        </div>

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
            value="47"
            change="3 today"
            variant="primary"
          />
          <StatCard
            icon={<Clock className="h-6 w-6" />}
            title="Study Time"
            value="24.5 hrs"
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

        {/* Current Progress */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 animate-scale-in">
            <CardHeader>
              <CardTitle>Current Learning Path</CardTitle>
              <CardDescription>Your personalized curriculum based on AI analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <CourseProgress
                title="Introduction to Machine Learning"
                progress={65}
                lessons="13/20 lessons"
                time="6 hrs left"
              />
              <CourseProgress
                title="Web Development Fundamentals"
                progress={40}
                lessons="8/20 lessons"
                time="12 hrs left"
              />
              <CourseProgress
                title="Data Structures & Algorithms"
                progress={25}
                lessons="5/20 lessons"
                time="15 hrs left"
              />
            </CardContent>
          </Card>

          <Card className="animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle>Daily Goals</CardTitle>
              <CardDescription>Track your progress today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GoalItem
                title="Complete 3 lessons"
                progress={66}
                current={2}
                total={3}
              />
              <GoalItem
                title="Practice for 30 min"
                progress={80}
                current={24}
                total={30}
              />
              <GoalItem
                title="Help 1 peer"
                progress={100}
                current={1}
                total={1}
              />
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
    <Card className="animate-fade-in-up hover:shadow-lg transition-all duration-300">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className={`text-sm ${variantColors[variant]}`}>{change}</p>
          </div>
          <div className={`${variantColors[variant]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CourseProgress = ({ 
  title, 
  progress, 
  lessons, 
  time 
}: { 
  title: string;
  progress: number;
  lessons: string;
  time: string;
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold">{title}</h3>
      <span className="text-sm text-muted-foreground">{progress}%</span>
    </div>
    <Progress value={progress} className="h-2" />
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>{lessons}</span>
      <span>{time}</span>
    </div>
  </div>
);

const GoalItem = ({
  title,
  progress,
  current,
  total,
}: {
  title: string;
  progress: number;
  current: number;
  total: number;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span>{title}</span>
      <span className="text-muted-foreground">{current}/{total}</span>
    </div>
    <Progress value={progress} className="h-2" />
  </div>
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
  <Card 
    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in-up"
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
);

export default Dashboard;
