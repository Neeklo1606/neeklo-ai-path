import { useState, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DesktopNav from "@/components/DesktopNav";
import BottomNav from "@/components/BottomNav";
import ScrollToTop from "@/components/ScrollToTop";
import PageTransition from "@/components/PageTransition";
import Onboarding from "@/components/Onboarding";
import CookieBanner from "@/components/CookieBanner";
import logoImg from "@/assets/logo.png";
import Index from "./pages/Index";
import { Menu, X, Home, MessageSquare, Sparkles, Image, FolderOpen, User, Settings, Bell } from "lucide-react";


import ChatPage from "./pages/ChatPage";
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
import ManagerChatPage from "./pages/ManagerChatPage";
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ServiceDetailPage = lazy(() => import("./pages/ServiceDetailPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const CasesPage = lazy(() => import("./pages/CasesPage"));
const WorksPage = lazy(() => import("./pages/WorksPage"));
const OrderPage = lazy(() => import("./pages/OrderPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const P = ({ children }: { children: React.ReactNode }) => (
  <PageTransition>{children}</PageTransition>
);

const RouteLoadingFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
    Загрузка страницы...
  </div>
);

const HIDE_NAV_ROUTES = ["/chat", "/manager-chat"];

const navItems = [
  { icon: Home, label: "Главная", path: "/" },
  { icon: MessageSquare, label: "Чат", path: "/chat" },
  { icon: Sparkles, label: "Услуги", path: "/services" },
  { icon: Image, label: "Работы", path: "/cases" },
  { icon: FolderOpen, label: "Проекты", path: "/projects" },
];

const accountItems = [
  { icon: User, label: "Профиль", path: "/profile" },
  { icon: Bell, label: "Уведомления", path: "/notifications" },
  { icon: Settings, label: "Настройки", path: "/settings" },
];

const MobileHeader = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sm:hidden sticky top-0 z-50 flex items-center justify-between px-4"
      style={{
        height: 52,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid #F0F0F0",
      }}
    >
      <button onClick={() => navigate("/")} className="flex items-center">
        <img src={logoImg} alt="neeklo" className="h-8 w-auto" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[60]"
          style={{ background: "rgba(0,0,0,0.4)", transition: "opacity 0.2s" }}
          onClick={() => setOpen(false)}
        />
      )}

      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-foreground hover:bg-muted transition-colors"
      >
        <Menu size={22} strokeWidth={1.8} />
      </button>

      {/* Slide-in menu */}
      <div
        className="fixed top-0 right-0 z-[70] bg-white"
        style={{
          width: "min(75vw, 280px)",
          height: "auto",
          maxHeight: "100dvh",
          padding: "24px 20px",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1)",
          borderRadius: "0 0 0 16px",
          boxShadow: open ? "-4px 0 24px rgba(0,0,0,0.08)" : "none",
        }}
      >
        {/* Close */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center"
        >
          <X size={24} strokeWidth={1.6} className="text-[#0D0D0B]" />
        </button>

        {/* Group 1 — Navigation */}
        <nav className="mt-8">
          {navItems.map(({ icon: Icon, label, path }) => {
            const active = pathname === path;
            return (
              <button
                key={path}
                onClick={() => { setOpen(false); navigate(path); }}
                className="flex items-center gap-3 w-full text-left"
                style={{
                  padding: "13px 0",
                  borderBottom: "1px solid #F5F5F5",
                  fontFamily: "'Onest', sans-serif",
                  fontSize: 17,
                  fontWeight: active ? 700 : 600,
                  color: active ? "#0D0D0B" : "#6A6860",
                  transition: "color 0.15s",
                }}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.6} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div style={{ height: 1, background: "#F0F0F0", margin: "16px 0" }} />

        {/* Group 2 — Account */}
        <p
          style={{
            fontFamily: "'Onest', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            color: "#B0B0B0",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
          }}
        >
          Аккаунт
        </p>
        <nav>
          {accountItems.map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              onClick={() => { setOpen(false); navigate(path); }}
              className="flex items-center gap-3 w-full text-left"
              style={{
                padding: "11px 0",
                fontFamily: "'Onest', sans-serif",
                fontSize: 15,
                fontWeight: 500,
                color: "#6A6860",
                transition: "color 0.15s",
              }}
            >
              <Icon size={18} strokeWidth={1.6} />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const hideNav = HIDE_NAV_ROUTES.includes(pathname) || pathname.startsWith("/admin");
  const hideBottomNav = pathname.startsWith("/admin");

  if (hideNav) return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <MobileHeader />
      <DesktopNav />
      <div className="flex-1 flex flex-col">{children}</div>
      <BottomNav />
    </div>
  );
};

const AppContent = ({
  showOnboarding,
  onCompleteOnboarding,
}: {
  showOnboarding: boolean;
  onCompleteOnboarding: () => void;
}) => {
  const { pathname } = useLocation();
  const shouldShowOnboarding = showOnboarding && pathname === "/";

  return (
    <>
      <ScrollToTop />
      {shouldShowOnboarding && <Onboarding onComplete={onCompleteOnboarding} />}
      <Layout>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<P><Index /></P>} />
            <Route path="/login" element={<P><LoginPage /></P>} />
            <Route path="/register" element={<P><RegisterPage /></P>} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/services" element={<P><ServicesPage /></P>} />
            <Route path="/works" element={<P><WorksPage /></P>} />
            <Route path="/cases" element={<P><CasesPage /></P>} />
            <Route path="/projects" element={<P><ProjectsPage /></P>} />
            <Route path="/projects/:id" element={<P><ProjectDetailPage /></P>} />
            <Route path="/profile" element={<P><ProfilePage /></P>} />
            <Route path="/settings" element={<P><SettingsPage /></P>} />
            <Route path="/services/:slug" element={<P><ServiceDetailPage /></P>} />
            <Route path="/order/:serviceId" element={<P><OrderPage /></P>} />
            <Route path="/manager-chat" element={<ManagerChatPage />} />
            <Route path="/notifications" element={<P><NotificationsPage /></P>} />
            <Route path="/legal/:slug" element={<P><LegalPage /></P>} />
            <Route path="/admin" element={<P><AdminPage /></P>} />
            <Route path="/admin/*" element={<P><AdminPage /></P>} />
            <Route path="*" element={<P><NotFound /></P>} />
          </Routes>
        </Suspense>
      </Layout>
      <CookieBanner />
    </>
  );
};

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("neeklo_onboarded")
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MotionConfig reducedMotion="user">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent
              showOnboarding={showOnboarding}
              onCompleteOnboarding={() => setShowOnboarding(false)}
            />
          </BrowserRouter>
        </MotionConfig>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

// Ready for production - neeklo.studio 2026
