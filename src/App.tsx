import { useState, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MainNav from "@/components/layout/MainNav";
import BottomNav from "@/components/layout/BottomNav";
import StickyCTA from "@/components/layout/StickyCTA";
import ScrollToTop from "@/components/ScrollToTop";
import PageTransition from "@/components/PageTransition";
import Onboarding from "@/components/Onboarding";
import CookieBanner from "@/components/CookieBanner";
import TelegramManagerButton from "@/components/TelegramManagerButton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LanguageProvider } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { BriefProvider } from "@/context/BriefContext";
import Index from "./pages/Index";

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
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminAuthGuard = lazy(() => import("./pages/admin/AdminAuthGuard"));
const AdminRoot = lazy(() => import("./pages/admin/AdminRoot"));
const AdminCmsShell = lazy(() => import("./pages/admin/AdminCmsShell"));
const AdminPagesList = lazy(() => import("./pages/admin/AdminPagesList"));
const AdminPageEditor = lazy(() => import("./pages/admin/AdminPageEditor"));
const AdminMediaPage = lazy(() => import("./pages/admin/AdminMediaPage"));
const AdminAssistantsPage = lazy(() => import("./pages/admin/AdminAssistantsPage"));
const AdminAssistantEditor = lazy(() => import("./pages/admin/AdminAssistantEditor"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminSettingEditor = lazy(() => import("./pages/admin/AdminSettingEditor"));
const AdminBrandingPage = lazy(() => import("./pages/admin/AdminBrandingPage"));
const AdminCrmPage = lazy(() => import("./pages/admin/AdminCrmPage"));
const AdminOperatorPage = lazy(() => import("./pages/admin/AdminOperatorPage"));
const AdminAiAnalyticsPage = lazy(() => import("./pages/admin/AdminAiAnalyticsPage"));
const AdminBillingPage = lazy(() => import("./pages/admin/AdminBillingPage"));
const AdminKnowledgePage = lazy(() => import("./pages/admin/AdminKnowledgePage"));
const AdminKnowledgeGraphPage = lazy(() => import("./pages/admin/AdminKnowledgeGraphPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const KpShowcasePage = lazy(() => import("./pages/kp/KpShowcasePage"));
const KpSlugPage = lazy(() => import("./pages/kp/KpSlugPage"));
const ServiceAiVideo = lazy(() => import("./pages/services/ServiceAiVideo"));
const ServiceWeb = lazy(() => import("./pages/services/ServiceWeb"));
const ServiceAiAssistant = lazy(() => import("./pages/services/ServiceAiAssistant"));
const ServiceTelegram = lazy(() => import("./pages/services/ServiceTelegram"));
const ServiceEducation = lazy(() => import("./pages/services/ServiceEducation"));
const PrivacyPage = lazy(() => import("./routes/privacy"));
const OfferPage = lazy(() => import("./routes/offer"));
const CookiesPage = lazy(() => import("./routes/cookies"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const ProductPage = lazy(() => import("./pages/products/ProductPage"));
const WebsitesPage = lazy(() => import("./pages/products/WebsitesPage"));
const AIAgentsPage = lazy(() => import("./pages/products/AIAgentsPage"));
const VideoPage = lazy(() => import("./pages/products/VideoPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));

const queryClient = new QueryClient();

const P = ({ children }: { children: React.ReactNode }) => (
  <PageTransition>{children}</PageTransition>
);

const RouteLoadingFallback = () => (
  <div
    className="flex min-h-[60vh] items-center justify-center"
    style={{ opacity: 0, animation: "page-in 200ms ease-out 100ms both" }}
  >
    <div
      className="rounded-full"
      style={{
        width: 28,
        height: 28,
        border: "2.5px solid var(--bd)",
        borderTopColor: "var(--tx)",
        animation: "spin 0.6s linear infinite",
      }}
    />
  </div>
);

const HIDE_NAV_ROUTES = ["/chat", "/manager-chat", "/kp"];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const hideNav =
    HIDE_NAV_ROUTES.some((r) => pathname.startsWith(r)) ||
    pathname.startsWith("/admin");
  const showManagerFab = !pathname.startsWith("/admin");

  if (hideNav) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col">{children}</div>
        {showManagerFab && <TelegramManagerButton />}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <div className="flex-1 flex flex-col">{children}</div>
      <BottomNav />
      <StickyCTA />
      {showManagerFab && <TelegramManagerButton />}
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
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<P><Index /></P>} />
            <Route path="/login" element={<P><LoginPage /></P>} />
            <Route path="/register" element={<P><RegisterPage /></P>} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/services" element={<P><ServicesPage /></P>} />
            <Route path="/works" element={<P><WorksPage /></P>} />
            <Route path="/cases" element={<P><CasesPage /></P>} />
            <Route path="/blog" element={<P><BlogPage /></P>} />
            <Route path="/blog/:slug" element={<P><BlogPostPage /></P>} />
            <Route path="/projects" element={<P><ProjectsPage /></P>} />
            <Route path="/projects/:id" element={<P><ProjectDetailPage /></P>} />
            <Route path="/profile" element={<P><ProfilePage /></P>} />
            <Route path="/settings" element={<P><SettingsPage /></P>} />
            <Route path="/services/ai-video" element={<P><ServiceAiVideo /></P>} />
            <Route path="/services/web" element={<P><ServiceWeb /></P>} />
            <Route path="/services/ai-assistant" element={<P><ServiceAiAssistant /></P>} />
            <Route path="/services/telegram" element={<P><ServiceTelegram /></P>} />
            <Route path="/services/education" element={<P><ServiceEducation /></P>} />
            <Route path="/services/:slug" element={<P><ServiceDetailPage /></P>} />
            <Route path="/order/:serviceId" element={<P><OrderPage /></P>} />
            <Route path="/manager-chat" element={<ManagerChatPage />} />
            <Route path="/notifications" element={<P><NotificationsPage /></P>} />
            <Route path="/legal/:slug" element={<P><LegalPage /></P>} />
            <Route path="/privacy" element={<P><PrivacyPage /></P>} />
            <Route path="/offer" element={<P><OfferPage /></P>} />
            <Route path="/cookies" element={<P><CookiesPage /></P>} />
            <Route
              path="/admin/login"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AdminLoginPage />
                </Suspense>
              }
            />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AdminAuthGuard />
                </Suspense>
              }
            >
              <Route
                element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <AdminRoot />
                  </Suspense>
                }
              >
                <Route
                  index
                  element={
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <AdminPage />
                    </Suspense>
                  }
                />
                <Route
                  element={
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <AdminCmsShell />
                    </Suspense>
                  }
                >
                  <Route
                    path="crm"
                    element={
                      <Suspense fallback={<RouteLoadingFallback />}>
                        <AdminCrmPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="operator"
                    element={
                      <Suspense fallback={<RouteLoadingFallback />}>
                        <AdminOperatorPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="pages"
                    element={
                      <Suspense fallback={<RouteLoadingFallback />}>
                        <AdminPagesList />
                      </Suspense>
                    }
                  />
                  <Route
                    path="pages/:id"
                    element={
                      <Suspense fallback={<RouteLoadingFallback />}>
                        <AdminPageEditor />
                      </Suspense>
                    }
                  />
                  <Route
                    path="media"
                    element={
                      <Suspense fallback={<RouteLoadingFallback />}>
                        <AdminMediaPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="branding"
                    element={
                      <Suspense fallback={<RouteLoadingFallback />}>
                        <AdminBrandingPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="assistants"
                    element={
                      <Suspense fallback={<RouteLoadingFallback />}>
                        <AdminAssistantsPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="assistants/:id"
                    element={
                      <Suspense fallback={<RouteLoadingFallback />}>
                        <AdminAssistantEditor />
                      </Suspense>
                    }
                  />
                  <Route
                    path="ai-analytics"
                    element={
                      <Suspense fallback={<RouteLoadingFallback />}>
                        <AdminAiAnalyticsPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="billing"
                    element={
                      <Suspense fallback={<RouteLoadingFallback />}>
                        <AdminBillingPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="knowledge"
                    element={
                      <Suspense fallback={<RouteLoadingFallback />}>
                        <AdminKnowledgePage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="knowledge/graph"
                    element={
                      <Suspense fallback={<RouteLoadingFallback />}>
                        <AdminKnowledgeGraphPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <Suspense fallback={<RouteLoadingFallback />}>
                        <AdminSettingsPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="settings/item/:settingKey"
                    element={
                      <Suspense fallback={<RouteLoadingFallback />}>
                        <AdminSettingEditor />
                      </Suspense>
                    }
                  />
                </Route>
              </Route>
            </Route>
            <Route path="/contact" element={<P><ContactPage /></P>} />
            <Route path="/products/websites" element={<P><WebsitesPage /></P>} />
            <Route path="/products/ai-agents" element={<P><AIAgentsPage /></P>} />
            <Route path="/products/video" element={<P><VideoPage /></P>} />
            <Route path="/products/:slug" element={<P><ProductPage /></P>} />
            <Route path="/kp" element={<KpShowcasePage />} />
            <Route path="/kp/:slug" element={<KpSlugPage />} />
            <Route path="*" element={<P><NotFound /></P>} />
          </Routes>
          </ErrorBoundary>
        </Suspense>
      </Layout>
      <CookieBanner />
    </>
  );
};

const ThemeInitializer = () => {
  // init theme on mount — applies class to <html>
  useTheme();
  return null;
};

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <MotionConfig reducedMotion="user">
            <ThemeInitializer />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <BriefProvider>
                <AppContent
                  showOnboarding={showOnboarding}
                  onCompleteOnboarding={() => setShowOnboarding(false)}
                />
              </BriefProvider>
            </BrowserRouter>
          </MotionConfig>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
