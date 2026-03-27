import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DesktopNav from "@/components/DesktopNav";
import Onboarding from "@/components/Onboarding";
import Index from "./pages/Index";
import ChatPage from "./pages/ChatPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SettingsPage from "./pages/SettingsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ManagerChatPage from "./pages/ManagerChatPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import LegalPage from "./pages/LegalPage";
import CasesPage from "./pages/CasesPage";
import OrderPage from "./pages/OrderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("neeklo_onboarded")
  );

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <DesktopNav />
          <div className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/cases" element={<CasesPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/services/:slug" element={<ServiceDetailPage />} />
              <Route path="/order/:serviceId" element={<OrderPage />} />
              <Route path="/manager-chat" element={<ManagerChatPage />} />
              <Route path="/legal/:slug" element={<LegalPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
