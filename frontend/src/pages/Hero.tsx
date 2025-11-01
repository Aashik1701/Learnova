import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Brain, Globe, Users, Shield, Sparkles, ArrowRight, Crown } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Learnova
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="gap-2" onClick={() => navigate("/premium")}>
            <Crown className="h-4 w-4 text-amber-500" /> Buy Premium
          </Button>
          <Button variant="ghost" onClick={() => navigate("/auth")}>
            Log In
          </Button>
          <Button 
            className="animate-pulse-glow"
            onClick={() => navigate("/auth")}
          >
            Sign Up Free
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Learning</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Personalized AI Learning{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                for Everyone
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Adaptive lessons that match your learning style. Verifiable credentials 
              powered by blockchain. Connect with peers worldwide. Learn smarter, not harder.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="text-lg animate-pulse-glow"
                onClick={() => navigate("/auth")}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg"
              >
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-primary">85%</div>
                <div className="text-sm text-muted-foreground">Higher retention</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-secondary">120+</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-success">100%</div>
                <div className="text-sm text-muted-foreground">Verifiable</div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative animate-scale-in">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
            <div className="relative bg-card rounded-3xl p-8 shadow-card border border-border">
              {/* Feature Cards */}
              <div className="space-y-4">
                <FeatureCard
                  icon={<Brain className="h-6 w-6" />}
                  title="Adaptive AI Lessons"
                  description="Content that evolves with your progress"
                  delay="0s"
                />
                <FeatureCard
                  icon={<Shield className="h-6 w-6" />}
                  title="Learning Passports"
                  description="Blockchain-verified credentials on IPFS"
                  delay="0.2s"
                />
                <FeatureCard
                  icon={<Users className="h-6 w-6" />}
                  title="Peer Network"
                  description="Connect with learners worldwide"
                  delay="0.4s"
                />
                <FeatureCard
                  icon={<Globe className="h-6 w-6" />}
                  title="Multilingual Support"
                  description="Learn in your preferred language"
                  delay="0.6s"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/5 to-transparent" />
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  delay 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay: string;
}) => (
  <div 
    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-background to-muted border border-border hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in-up"
    style={{ animationDelay: delay }}
  >
    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
      {icon}
    </div>
    <div className="space-y-1">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default Hero;
