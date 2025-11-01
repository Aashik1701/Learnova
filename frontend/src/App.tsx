import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hero from "./pages/Hero";
import Premium from "./pages/Premium";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ClassStudents from "./pages/ClassStudents";
import TeacherStudentMarks from "./pages/TeacherStudentMarks";
import TeacherStudentQuizAnalysis from "./pages/TeacherStudentQuizAnalysis";
import Lessons from "./pages/Lessons";
import PracticeNew from "./pages/PracticeNew";
import Passports from "./pages/Passports";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Verify from "./pages/Verify";
import Settings from "./pages/Settings";
import QuizProctor from "./pages/QuizProctor";
import DashboardNew from "./pages/DashboardNew";
import "./lib/i18n";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/class/:id" element={<ClassStudents />} />
          <Route path="/dashboard" element={<DashboardNew />} />
          <Route path="/teacher/class/:id/student/:studentId" element={<TeacherStudentMarks />} />
          <Route path="/teacher/class/:id/student/:studentId/quiz/:quizId" element={<TeacherStudentQuizAnalysis />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/practice" element={<PracticeNew />} />
          <Route path="/quiz-proctor" element={<QuizProctor />} />
          <Route path="/passports" element={<Passports />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
