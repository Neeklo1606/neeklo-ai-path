import { useState, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

const mobileMenuItems = [
  { icon: Home, label: "Главная", path: "/" },
  { icon: MessageSquare, label: "Чат", path: "/chat" },
  { icon: Sparkles, label: "Услуги", path: "/services" },
  { icon: Image, label: "Работы", path: "/cases" },
  { icon: FolderOpen, label: "Проекты", path: "/projects" },
  { icon: Bell, label: "Уведомления", path: "/notifications" },
  { icon: User, label: "Профиль", path: "/profile" },
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

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="flex items-center justify-center w-9 h-9 rounded-lg text-foreground hover:bg-muted transition-colors">
            <Menu size={22} strokeWidth={1.8} />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] p-0">
          <div className="flex flex-col h-full pt-14 pb-8">
            <nav className="flex flex-col gap-1 px-4">
              {mobileMenuItems.map(({ icon: Icon, label, path }) => {
                const active = pathname === path;
                return (
                  <button
                    key={path}
                    onClick={() => { setOpen(false); navigate(path); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
                    {label}
                  </button>
                );
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const hideNav = HIDE_NAV_ROUTES.includes(pathname);

  if (hideNav) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col">
      <MobileHeader />
      <DesktopNav />
      <div className="flex-1 flex flex-col">{children}</div>
      <BottomNav />
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
