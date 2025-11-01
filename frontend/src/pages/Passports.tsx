import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowLeft, Award, Shield, Star, Trophy, Target, Zap, CheckCircle2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Hardcoded credentials data
const CREDENTIALS = [
  {
    id: 1,
    title: "React Advanced Patterns Master",
    issueDate: "2024-10-15",
    category: "React",
    level: "Advanced",
    score: 95,
    icon: Award,
    color: "text-primary",
    bgColor: "bg-primary/10",
    skills: ["Render Props", "HOCs", "Compound Components", "Custom Hooks"]
  },
  {
    id: 2,
    title: "TypeScript Professional",
    issueDate: "2024-10-10",
    category: "TypeScript",
    level: "Intermediate",
    score: 88,
    icon: Shield,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    skills: ["Type Safety", "Generics", "Advanced Types", "Best Practices"]
  },
  {
    id: 3,
    title: "Web Performance Expert",
    issueDate: "2024-10-05",
    category: "Performance",
    level: "Advanced",
    score: 92,
    icon: Zap,
    color: "text-warning",
    bgColor: "bg-warning/10",
    skills: ["Core Web Vitals", "Optimization", "Monitoring", "Debugging"]
  }
];

const ACHIEVEMENTS = [
  {
    id: 1,
    title: "Learning Streak: 30 Days",
    description: "Maintained a 30-day learning streak",
    icon: Trophy,
    unlocked: true,
    date: "2024-10-20"
  },
  {
    id: 2,
    title: "Fast Learner",
    description: "Completed 10 lessons in one week",
    icon: Target,
    unlocked: true,
    date: "2024-10-12"
  },
  {
    id: 3,
    title: "Perfect Score",
    description: "Achieved 100% on 5 quizzes",
    icon: Star,
    unlocked: true,
    date: "2024-10-08"
  },
  {
    id: 4,
    title: "Knowledge Sharer",
    description: "Helped 10 peers in study groups",
    icon: Award,
    unlocked: false,
    date: null
  }
];

const Passports = () => {
  const navigate = useNavigate();

  const downloadCredential = (credential: typeof CREDENTIALS[0]) => {
    // Simulate downloading credential
    console.log("Downloading credential:", credential.title);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Learning Passports
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Credentials</p>
                    <p className="text-3xl font-bold text-primary">{CREDENTIALS.length}</p>
                  </div>
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Achievements</p>
                    <p className="text-3xl font-bold text-secondary">
                      {ACHIEVEMENTS.filter(a => a.unlocked).length}/{ACHIEVEMENTS.length}
                    </p>
                  </div>
                  <Trophy className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="text-3xl font-bold text-success">
                      {Math.round(CREDENTIALS.reduce((acc, c) => acc + c.score, 0) / CREDENTIALS.length)}%
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Learning Streak</p>
                    <p className="text-3xl font-bold text-warning">30d</p>
                  </div>
                  <Zap className="h-8 w-8 text-warning" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Credentials Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">My Credentials</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {CREDENTIALS.map((credential, idx) => (
              <motion.div
                key={credential.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${credential.bgColor}`}>
                        <credential.icon className={`h-8 w-8 ${credential.color}`} />
                      </div>
                      <Badge variant="outline">{credential.level}</Badge>
                    </div>
                    <CardTitle className="text-xl">{credential.title}</CardTitle>
                    <CardDescription>
                      Issued on {new Date(credential.issueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Score</span>
                          <span className="font-semibold">{credential.score}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                            style={{ width: `${credential.score}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Skills Verified</p>
                        <div className="flex flex-wrap gap-2">
                          {credential.skills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => downloadCredential(credential)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Certificate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Achievements Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Achievements</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ACHIEVEMENTS.map((achievement, idx) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`hover:shadow-lg transition-all ${!achievement.unlocked && 'opacity-60'}`}>
                  <CardContent className="pt-6 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                      achievement.unlocked ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <achievement.icon className={`h-8 w-8 ${
                        achievement.unlocked ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <h3 className="font-semibold mb-2">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {achievement.description}
                    </p>
                    {achievement.unlocked && achievement.date && (
                      <Badge variant="outline" className="text-xs">
                        {new Date(achievement.date).toLocaleDateString()}
                      </Badge>
                    )}
                    {!achievement.unlocked && (
                      <Badge variant="secondary" className="text-xs">
                        Locked
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Blockchain Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Blockchain-Verified Credentials</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    All your credentials are stored on IPFS and verified on the blockchain, ensuring they're 
                    tamper-proof and globally verifiable. Share your achievements with confidence.
                  </p>
                  <Button variant="outline" size="sm">
                    Learn More About Verification
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Passports;
