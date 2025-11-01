import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hero from "./pages/Hero";
import Auth from "./pages/Auth";
import DashboardNew from "./pages/DashboardNew";
import Lessons from "./pages/Lessons";
import PracticeNew from "./pages/PracticeNew";
import Peers from "./pages/Peers";
import Passports from "./pages/Passports";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import "./lib/i18n";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<DashboardNew />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/practice" element={<PracticeNew />} />
          <Route path="/peers" element={<Peers />} />
          <Route path="/passports" element={<Passports />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
