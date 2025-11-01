import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, CheckCircle2, Star, Shield, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Premium = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Learnova Premium
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
          <Button className="gap-2">
            Upgrade Now <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Hero */}
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Unlock your full potential</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Go <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Premium</span> and learn smarter
            </h1>
            <p className="text-lg text-muted-foreground">
              Premium gives you advanced AI features, richer content, and priority tools to accelerate your learning journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="gap-2">
                Upgrade Now <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/dashboard")}>Explore Dashboard</Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
            <Card className="relative border border-border shadow-card bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-secondary" /> Premium Benefits
                </CardTitle>
                <CardDescription>Everything you need to accelerate progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Benefit icon={<Zap className="h-4 w-4" />} title="Faster AI responses" desc="Priority access to our AI with lower latency and more context." />
                  <Benefit icon={<Shield className="h-4 w-4" />} title="Learning Passports Pro" desc="Enhanced credentials and private IPFS pinning." />
                  <Benefit icon={<Star className="h-4 w-4" />} title="Advanced lessons" desc="Deeper, adaptive lesson plans with extra practice." />
                  <Benefit icon={<CheckCircle2 className="h-4 w-4" />} title="Unlimited quizzes" desc="Practice without limits and track improvement." />
                </div>
                <div className="mt-6 p-4 rounded-xl bg-muted/60 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Starting at</div>
                      <div className="text-2xl font-bold">$9.99/month</div>
                    </div>
                    <Badge variant="outline" className="border-secondary/30 text-secondary">Early-bird pricing</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Detailed features */}
        <section className="mt-14 grid md:grid-cols-3 gap-6">
          <FeatureCard
            title="Adaptive AI Tutor"
            description="Personalized explanations, hints, and feedback tailored to your pace."
          />
          <FeatureCard
            title="Rich Content Library"
            description="Access premium study sets, templates, and real-world case studies."
          />
          <FeatureCard
            title="Advanced Analytics"
            description="Track mastery, identify gaps, and get targeted recommendations."
          />
        </section>

        {/* CTA */}
        <section className="mt-14 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to level up?</h2>
          <p className="text-muted-foreground mb-6">Join thousands of learners who upgraded to Premium.</p>
          <Button size="lg" className="gap-2">
            Buy Premium <Crown className="h-5 w-5" />
          </Button>
        </section>
      </main>
    </div>
  );
};

const Benefit = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-gradient-to-br from-background to-muted">
    <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
      {icon}
    </div>
    <div>
      <div className="font-medium">{title}</div>
      <div className="text-sm text-muted-foreground">{desc}</div>
    </div>
  </div>
);

const FeatureCard = ({ title, description }: { title: string; description: string }) => (
  <Card className="border border-border bg-card/80 backdrop-blur-sm">
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  </Card>
);

export default Premium;
