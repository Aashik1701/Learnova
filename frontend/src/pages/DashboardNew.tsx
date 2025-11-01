import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, BookOpen, Users, Shield, TrendingUp, Award, Clock, Target, ArrowRight, 
  Sparkles, Calendar, Crown, BarChart3, PieChart as PieChartIcon, Activity, 
  Trophy, Zap, CheckCircle2, AlertCircle, Star, TrendingDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserMenu from "@/components/UserMenu";
import { motion } from "framer-motion";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

// Color palette inspired by Tableau
const CHART_COLORS = {
  primary: "#4F46E5",      // Indigo
  secondary: "#7C3AED",    // Violet
  success: "#10B981",       // Emerald
  warning: "#F59E0B",      // Amber
  danger: "#EF4444",       // Red
  info: "#3B82F6",         // Blue
  purple: "#8B5CF6",       // Purple
  pink: "#EC4899",         // Pink
  gradient: ["#4F46E5", "#7C3AED", "#EC4899", "#F59E0B", "#10B981"],
};

// Generate comprehensive analytics data
const generateAnalyticsData = () => {
  // Progress over time (last 30 days)
  const progressOverTime = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      progress: Math.min(100, 20 + Math.random() * 60 + i * 2),
      lessons: Math.floor(10 + Math.random() * 15),
      score: Math.floor(65 + Math.random() * 30),
    };
  });

  // Subject performance
  const subjectPerformance = [
    { subject: "React", completed: 85, avgScore: 92, certificates: 3, time: 42 },
    { subject: "TypeScript", completed: 60, avgScore: 88, certificates: 2, time: 28 },
    { subject: "Performance", completed: 45, avgScore: 75, certificates: 1, time: 18 },
    { subject: "CSS", completed: 92, avgScore: 95, certificates: 4, time: 35 },
    { subject: "Backend", completed: 30, avgScore: 70, certificates: 0, time: 12 },
  ];

  // Score distribution
  const scoreDistribution = [
    { range: "90-100", count: 12, label: "Excellent" },
    { range: "80-89", count: 18, label: "Good" },
    { range: "70-79", count: 15, label: "Average" },
    { range: "60-69", count: 8, label: "Needs Improvement" },
    { range: "0-59", count: 2, label: "Review" },
  ];

  // Weekly activity
  const weeklyActivity = [
    { day: "Mon", lessons: 4, quizzes: 3, hours: 2.5 },
    { day: "Tue", lessons: 6, quizzes: 5, hours: 3.2 },
    { day: "Wed", lessons: 3, quizzes: 2, hours: 1.8 },
    { day: "Thu", lessons: 5, quizzes: 4, hours: 2.9 },
    { day: "Fri", lessons: 7, quizzes: 6, hours: 4.1 },
    { day: "Sat", lessons: 8, quizzes: 7, hours: 5.2 },
    { day: "Sun", lessons: 6, quizzes: 5, hours: 3.8 },
  ];

  // Certificate breakdown
  const certificateData = [
    { name: "React Master", value: 3, color: CHART_COLORS.primary },
    { name: "TypeScript Expert", value: 2, color: CHART_COLORS.secondary },
    { name: "CSS Pro", value: 4, color: CHART_COLORS.success },
    { name: "Performance Guru", value: 1, color: CHART_COLORS.warning },
  ];

  return {
    progressOverTime,
    subjectPerformance,
    scoreDistribution,
    weeklyActivity,
    certificateData,
  };
};

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
];

interface Recommendation {
  title: string;
  subject: string;
  difficulty: string;
  description: string;
  reason: string;
}

const DashboardNew = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userName] = useState(() => localStorage.getItem("learner_name") || "Learner");
  const [recommendations] = useState(HARDCODED_RECOMMENDATIONS);
  const [analyticsData, setAnalyticsData] = useState(generateAnalyticsData());
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Calculate stats
  const totalLessons = 23;
  const totalCertificates = 10;
  const totalStudyHours = 143;
  const averageScore = 87;
  const learningStreak = 12;
  const inProgressLessons = 5;
  
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const chartConfig = {
    progress: { label: "Progress", color: CHART_COLORS.primary },
    lessons: { label: "Lessons", color: CHART_COLORS.secondary },
    score: { label: "Score", color: CHART_COLORS.success },
    hours: { label: "Hours", color: CHART_COLORS.warning },
    completed: { label: "Completed", color: CHART_COLORS.success },
    avgScore: { label: "Avg Score", color: CHART_COLORS.info },
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/90 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Learnova
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Button variant="outline" className="rounded-xl gap-2" onClick={() => navigate("/premium")}>
              <Crown className="h-4 w-4 text-amber-500" /> Buy Premium
            </Button>
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="rounded-xl font-semibold">Dashboard</Button>
            <Button variant="ghost" onClick={() => navigate("/lessons")} className="rounded-xl">Lessons</Button>
            <Button variant="ghost" onClick={() => navigate("/passports")} className="rounded-xl">Passports</Button>
            <UserMenu onLogout={handleLogout} />
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
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Performance Analytics Dashboard
                <motion.span
                  animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 3 }}
                >
              📊
                </motion.span>
              </h1>
              <p className="text-muted-foreground text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Comprehensive insights into your learning journey, {userName}
              </p>
            </motion.div>

        {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={<TrendingUp className="h-6 w-6" />}
                title="Learning Streak"
            value={`${learningStreak} days`}
                change="+3 this week"
                variant="success"
            trend="up"
                delay={0}
              />
              <StatCard
            icon={<BookOpen className="h-6 w-6" />}
                title="Lessons Completed"
            value={totalLessons.toString()}
            change={`${inProgressLessons} in progress`}
                variant="primary"
            trend="up"
                delay={0.1}
              />
              <StatCard
                icon={<Clock className="h-6 w-6" />}
                title="Study Time"
            value={`${totalStudyHours}h`}
            change="12h this week"
                variant="secondary"
            trend="up"
                delay={0.2}
              />
              <StatCard
            icon={<Target className="h-6 w-6" />}
            title="Average Score"
            value={`${averageScore}%`}
            change="+5% improvement"
                variant="warning"
            trend="up"
                delay={0.3}
              />
            </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4 bg-muted/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Performance
            </TabsTrigger>
            <TabsTrigger value="subjects" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Subjects
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Progress Over Time */}
              <Card className="rounded-xl shadow-lg border-2 border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-t-xl">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Progress Over Time
                  </CardTitle>
                  <CardDescription>30-day learning journey</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ChartContainer config={chartConfig}>
                    <AreaChart data={analyticsData.progressOverTime}>
                      <defs>
                        <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="progress" 
                        stroke={CHART_COLORS.primary} 
                        strokeWidth={3}
                        fill="url(#progressGradient)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Weekly Activity */}
              <Card className="rounded-xl shadow-lg border-2 border-secondary/20">
                <CardHeader className="bg-gradient-to-r from-secondary/10 to-pink-500/10 rounded-t-xl">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-secondary" />
                    Weekly Activity Breakdown
                  </CardTitle>
                  <CardDescription>Lessons, quizzes, and study hours</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ChartContainer config={chartConfig}>
                    <BarChart data={analyticsData.weeklyActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="lessons" fill={CHART_COLORS.primary} radius={[8, 8, 0, 0]} />
                      <Bar dataKey="quizzes" fill={CHART_COLORS.secondary} radius={[8, 8, 0, 0]} />
                      <Bar dataKey="hours" fill={CHART_COLORS.warning} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Score Distribution & Certificates */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="rounded-xl shadow-lg border-2 border-success/20">
                <CardHeader className="bg-gradient-to-r from-success/10 to-emerald-500/10 rounded-t-xl">
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-success" />
                    Score Distribution
                  </CardTitle>
                  <CardDescription>Your quiz performance breakdown</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ChartContainer config={chartConfig}>
                    <PieChart>
                      <Pie
                        data={analyticsData.scoreDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.scoreDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS.gradient[index % CHART_COLORS.gradient.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-lg border-2 border-warning/20">
                <CardHeader className="bg-gradient-to-r from-warning/10 to-amber-500/10 rounded-t-xl">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-warning" />
                    Certificates Earned
                  </CardTitle>
                  <CardDescription>Breakdown by subject area</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ChartContainer config={chartConfig}>
                    <PieChart>
                      <Pie
                        data={analyticsData.certificateData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData.certificateData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="rounded-xl shadow-lg border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Performance Trends
                </CardTitle>
                <CardDescription>Combined metrics over time</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ChartContainer config={chartConfig}>
                  <LineChart data={analyticsData.progressOverTime.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="progress" 
                      stroke={CHART_COLORS.primary} 
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      name="Progress %"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="score" 
                      stroke={CHART_COLORS.success} 
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      name="Score %"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="lessons" 
                      stroke={CHART_COLORS.secondary} 
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      name="Lessons"
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              {analyticsData.scoreDistribution.map((item, index) => (
                <Card key={index} className="rounded-xl shadow-md border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{item.range}</p>
                        <p className="text-2xl font-bold">{item.count}</p>
                      </div>
                      <div className={`p-3 rounded-full ${
                        index === 0 ? 'bg-green-100 text-green-600' :
                        index === 1 ? 'bg-blue-100 text-blue-600' :
                        index === 2 ? 'bg-yellow-100 text-yellow-600' :
                        index === 3 ? 'bg-orange-100 text-orange-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {index === 0 ? <Star className="h-6 w-6" /> :
                         index === 1 ? <CheckCircle2 className="h-6 w-6" /> :
                         <AlertCircle className="h-6 w-6" />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects" className="space-y-6">
            <Card className="rounded-xl shadow-lg border-2 border-secondary/20">
              <CardHeader className="bg-gradient-to-r from-secondary/10 to-purple-500/10 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-secondary" />
                  Subject Performance Comparison
                </CardTitle>
                <CardDescription>Completion rates, scores, and certificates by subject</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ChartContainer config={chartConfig}>
                  <BarChart data={analyticsData.subjectPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="subject" type="category" tick={{ fontSize: 12 }} width={100} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="completed" fill={CHART_COLORS.primary} radius={[0, 8, 8, 0]} name="Completed %" />
                    <Bar dataKey="avgScore" fill={CHART_COLORS.success} radius={[0, 8, 8, 0]} name="Avg Score" />
                    <Bar dataKey="certificates" fill={CHART_COLORS.warning} radius={[0, 8, 8, 0]} name="Certificates" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {analyticsData.subjectPerformance.map((subject, index) => (
                <Card key={index} className="rounded-xl shadow-md border-2 hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-lg">{subject.subject}</h3>
                        <p className="text-sm text-muted-foreground">{subject.completed}% Complete</p>
                      </div>
                      <Progress value={subject.completed} className="h-2" />
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Score</p>
                          <p className="font-semibold">{subject.avgScore}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Time</p>
                          <p className="font-semibold">{subject.time}h</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-warning" />
                        <span className="text-sm font-medium">{subject.certificates} Certificates</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="rounded-xl shadow-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
                <CardContent className="pt-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <p className="text-3xl font-bold">{totalCertificates}</p>
                  <p className="text-sm text-muted-foreground mt-2">Total Certificates</p>
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-lg border-2 border-success/20 bg-gradient-to-br from-success/5 to-emerald-500/5">
                <CardContent className="pt-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <p className="text-3xl font-bold">{totalLessons}</p>
                  <p className="text-sm text-muted-foreground mt-2">Lessons Mastered</p>
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-lg border-2 border-warning/20 bg-gradient-to-br from-warning/5 to-amber-500/5">
                <CardContent className="pt-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning/10 text-warning mb-4">
                    <Zap className="h-8 w-8" />
                  </div>
                  <p className="text-3xl font-bold">{learningStreak}</p>
                  <p className="text-sm text-muted-foreground mt-2">Day Streak</p>
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-lg border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-600/5">
                <CardContent className="pt-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4">
                    <Star className="h-8 w-8" />
                  </div>
                  <p className="text-3xl font-bold">{averageScore}%</p>
                  <p className="text-sm text-muted-foreground mt-2">Average Score</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="rounded-xl shadow-lg border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          AI Recommendations
                        </CardTitle>
                        <CardDescription>Personalized lessons based on your profile</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recommendations.map((rec, idx) => (
                      <RecommendationCard 
                        key={idx}
                          recommendation={rec}
                          onStart={() => navigate("/lessons")}
                        />
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="rounded-xl shadow-lg">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                        onClick={() => navigate("/lessons")}
                      className="w-full justify-start gap-2"
                      variant="outline"
                    >
                      <BookOpen className="h-4 w-4" />
                      Continue Learning
                    </Button>
                    <Button 
                      onClick={() => navigate("/passports")} 
                      className="w-full justify-start gap-2"
                      variant="outline"
                    >
                      <Shield className="h-4 w-4" />
                      View Certificates
                    </Button>
                    <Button 
                      onClick={() => navigate("/premium")} 
                      className="w-full justify-start gap-2"
                      variant="default"
                    >
                      <Crown className="h-4 w-4" />
                      Upgrade to Premium
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Loading skeleton component
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
    <div className="grid lg:grid-cols-2 gap-6 mb-8">
      <Card className="rounded-xl">
        <CardHeader>
          <Skeleton className="h-6 w-48 rounded-xl" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full rounded-xl" />
        </CardContent>
      </Card>
      <Card className="rounded-xl">
        <CardHeader>
          <Skeleton className="h-6 w-48 rounded-xl" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full rounded-xl" />
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
  trend,
  delay 
}: { 
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  variant: "success" | "primary" | "secondary" | "warning";
  trend?: "up" | "down";
  delay: number;
}) => {
  const variantColors = {
    success: "text-emerald-600 dark:text-emerald-400",
    primary: "text-blue-600 dark:text-blue-400",
    secondary: "text-purple-600 dark:text-purple-400",
    warning: "text-amber-600 dark:text-amber-400",
  };

  const variantBg = {
    success: "bg-emerald-500/10 dark:bg-emerald-500/20",
    primary: "bg-blue-500/10 dark:bg-blue-500/20",
    secondary: "bg-purple-500/10 dark:bg-purple-500/20",
    warning: "bg-amber-500/10 dark:bg-amber-500/20",
  };

  const variantBorder = {
    success: "border-emerald-500/20",
    primary: "border-blue-500/20",
    secondary: "border-purple-500/20",
    warning: "border-amber-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="transition-all"
    >
      <Card className={`rounded-xl shadow-lg hover:shadow-xl transition-all border-2 ${variantBorder[variant]}`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold">{value}</p>
              <div className="flex items-center gap-1">
                {trend === "up" ? (
                  <TrendingUp className={`h-4 w-4 ${variantColors[variant]}`} />
                ) : trend === "down" ? (
                  <TrendingDown className={`h-4 w-4 ${variantColors[variant]}`} />
                ) : null}
              <p className={`text-sm font-medium ${variantColors[variant]}`}>{change}</p>
              </div>
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

const RecommendationCard = ({ 
  recommendation, 
  onStart 
}: { 
  recommendation: Recommendation;
  onStart: () => void;
}) => (
  <Card className="rounded-xl hover:shadow-md transition-all duration-300 border-2 border-border/50">
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

export default DashboardNew;
