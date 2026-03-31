import { useState, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DesktopNav from "@/components/DesktopNav";
import ScrollToTop from "@/components/ScrollToTop";
import PageTransition from "@/components/PageTransition";
import Onboarding from "@/components/Onboarding";
import CookieBanner from "@/components/CookieBanner";
import Index from "./pages/Index";

const ChatPage = lazy(() => import("./pages/ChatPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const ManagerChatPage = lazy(() => import("./pages/ManagerChatPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ServiceDetailPage = lazy(() => import("./pages/ServiceDetailPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const CasesPage = lazy(() => import("./pages/CasesPage"));
const OrderPage = lazy(() => import("./pages/OrderPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const P = ({ children }: { children: React.ReactNode }) => (
  <PageTransition>{children}</PageTransition>
);

const HIDE_NAV_ROUTES = ["/chat", "/manager-chat"];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const hideNav = HIDE_NAV_ROUTES.includes(pathname);

  if (hideNav) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col">
      <DesktopNav />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
};

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
          <Layout>
              <Suspense fallback={null}>
              <Routes>
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
              </Suspense>
          </Layout>
          <CookieBanner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
