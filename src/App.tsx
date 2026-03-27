import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DesktopNav from "@/components/DesktopNav";
import ScrollToTop from "@/components/ScrollToTop";
import PageTransition from "@/components/PageTransition";
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
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const P = ({ children }: { children: React.ReactNode }) => (
  <PageTransition>{children}</PageTransition>
);

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
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <DesktopNav />
            <div className="flex-1 flex flex-col">
              <Routes>
                <Route path="/" element={<P><Index /></P>} />
                <Route path="/login" element={<P><LoginPage /></P>} />
                <Route path="/register" element={<P><RegisterPage /></P>} />
                <Route path="/chat" element={<P><ChatPage /></P>} />
                <Route path="/services" element={<P><ServicesPage /></P>} />
                <Route path="/cases" element={<P><CasesPage /></P>} />
                <Route path="/projects" element={<P><ProjectsPage /></P>} />
                <Route path="/projects/:id" element={<P><ProjectDetailPage /></P>} />
                <Route path="/profile" element={<P><ProfilePage /></P>} />
                <Route path="/settings" element={<P><SettingsPage /></P>} />
                <Route path="/services/:slug" element={<P><ServiceDetailPage /></P>} />
                <Route path="/order/:serviceId" element={<P><OrderPage /></P>} />
                <Route path="/manager-chat" element={<P><ManagerChatPage /></P>} />
                <Route path="/notifications" element={<P><NotificationsPage /></P>} />
                <Route path="/legal/:slug" element={<P><LegalPage /></P>} />
                <Route path="*" element={<P><NotFound /></P>} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
