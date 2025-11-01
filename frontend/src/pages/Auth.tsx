import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Mail, Lock, User, Languages, BookOpen, Accessibility } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    language: 'en',
    learningStyle: 'visual',
    proficiency: 'beginner',
  });
  const [accountType, setAccountType] = useState<'normal' | 'organizational'>('normal');
  const [orgRole, setOrgRole] = useState<'student' | 'teacher' | 'admin'>('student');

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: { user } } = await supabase.auth.getUser();
        const meta = user?.user_metadata as { account_type?: string; org_role?: string } | undefined;
        const path = meta?.account_type === 'organizational'
          ? meta?.org_role === 'student'
            ? '/dashboard/student'
            : meta?.org_role === 'teacher'
              ? '/dashboard/teacher'
              : '/dashboard'
          : '/dashboard';
        navigate(path);
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Fetch user to determine role-based redirect
      const { data: { user } } = await supabase.auth.getUser();
      const meta = user?.user_metadata as { account_type?: string; org_role?: string } | undefined;
      const path = meta?.account_type === 'organizational'
        ? meta?.org_role === 'student'
          ? '/dashboard/student'
          : meta?.org_role === 'teacher'
            ? '/dashboard/teacher'
            : '/dashboard'
        : '/dashboard';

      toast({
        title: "Welcome back!",
        description: "Successfully logged in to Learnova.",
      });
      navigate(path);
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            account_type: accountType,
            org_role: accountType === 'organizational' ? orgRole : null,
          },
        },
      });

      if (error) throw error;

      // Create or update profile with additional info
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: formData.name,
          email: formData.email,
          preferred_language: formData.language,
          learning_style: formData.learningStyle,
          proficiency_level: formData.proficiency,
        });
      }

      toast({
        title: "Account created!",
        description: "Your learning journey begins now.",
      });
      // Redirect based on selected account type and role
      const path = accountType === 'organizational'
        ? (orgRole === 'student' ? '/dashboard/student' : orgRole === 'teacher' ? '/dashboard/teacher' : '/dashboard')
        : '/dashboard';
      navigate(path);
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <Brain className="h-12 w-12 text-primary" />
            <span className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Learnova
            </span>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-foreground">
              Your Personalized Learning Journey Starts Here
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of learners worldwide using AI-powered adaptive education
            </p>
          </div>

          <div className="space-y-4 pt-8">
            <BenefitItem 
              icon={<Brain className="h-5 w-5" />}
              text="AI adapts to your learning style"
            />
            <BenefitItem 
              icon={<Languages className="h-5 w-5" />}
              text="Learn in your preferred language"
            />
            <BenefitItem 
              icon={<BookOpen className="h-5 w-5" />}
              text="Earn verifiable credentials"
            />
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <Card className="w-full animate-scale-in shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to Learnova</CardTitle>
            <CardDescription>Sign in or create an account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={accountType === 'normal' ? 'default' : 'outline'}
                        onClick={() => setAccountType('normal')}
                        className="w-full"
                      >
                        Normal User
                      </Button>
                      <Button
                        type="button"
                        variant={accountType === 'organizational' ? 'default' : 'outline'}
                        onClick={() => setAccountType('organizational')}
                        className="w-full"
                      >
                        Organizational User
                      </Button>
                    </div>
                  </div>

                  {accountType === 'organizational' && (
                    <div className="space-y-2">
                      <Label htmlFor="login-org-role">Organizational Role</Label>
                      <Select value={orgRole} onValueChange={(value: 'student' | 'teacher' | 'admin') => setOrgRole(value)}>
                        <SelectTrigger id="login-org-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Log In"}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    <a href="#" className="text-primary hover:underline">
                      Forgot password?
                    </a>
                  </p>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={accountType === 'normal' ? 'default' : 'outline'}
                        onClick={() => setAccountType('normal')}
                        className="w-full"
                      >
                        Normal User
                      </Button>
                      <Button
                        type="button"
                        variant={accountType === 'organizational' ? 'default' : 'outline'}
                        onClick={() => setAccountType('organizational')}
                        className="w-full"
                      >
                        Organizational User
                      </Button>
                    </div>
                  </div>

                  {accountType === 'organizational' && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-org-role">Organizational Role</Label>
                      <Select value={orgRole} onValueChange={(value: 'student' | 'teacher' | 'admin') => setOrgRole(value)}>
                        <SelectTrigger id="signup-org-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        className="pl-10"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred Language</Label>
                    <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                        <SelectItem value="hi">🇮🇳 हिन्दी</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(accountType !== 'organizational' || orgRole === 'student') && (
                    <div className="space-y-2">
                      <Label htmlFor="learning-style">Learning Style</Label>
                      <Select value={formData.learningStyle} onValueChange={(value) => setFormData({ ...formData, learningStyle: value })}>
                        <SelectTrigger id="learning-style">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visual">👁️ Visual</SelectItem>
                          <SelectItem value="auditory">🎧 Auditory</SelectItem>
                          <SelectItem value="kinesthetic">✋ Kinesthetic</SelectItem>
                          <SelectItem value="reading">📖 Reading/Writing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {(accountType !== 'organizational' || orgRole === 'student') && (
                    <div className="space-y-2">
                      <Label htmlFor="proficiency">Proficiency Level</Label>
                      <Select value={formData.proficiency} onValueChange={(value) => setFormData({ ...formData, proficiency: value })}>
                        <SelectTrigger id="proficiency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">🌱 Beginner</SelectItem>
                          <SelectItem value="intermediate">🌿 Intermediate</SelectItem>
                          <SelectItem value="advanced">🌳 Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const BenefitItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-3">
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
      {icon}
    </div>
    <p className="text-foreground">{text}</p>
  </div>
);

export default Auth;
