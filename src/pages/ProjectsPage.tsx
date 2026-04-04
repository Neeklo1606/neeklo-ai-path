import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, Play, Eye } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { cmsPageBySlug } from "@/lib/cms-api";
import { parseProjectsCms, type ProjectCmsItem } from "@/lib/cms-parsers";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";

function pick(v: unknown, lang: string): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null) {
    const o = v as Record<string, string>;
    return o[lang] || o.ru || o.en || "";
  }
  return String(v);
}

function managerInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
}

/* ─── types ─── */
interface Task { title: string; done: boolean }
interface Project {
  id: string; emoji: string; title: string; service: string;
  status: string; price: number; paid: number; deadline: string;
  progress: number; manager: string; managerInitials: string;
  brief: string; tasks: Task[]; timeline: string[]; currentStep: number;
}

function cmsItemToProject(p: ProjectCmsItem): Project {
  return {
    id: p.id,
    emoji: p.emoji || "📁",
    title: p.title,
    service: p.service,
    status: p.status,
    price: p.price,
    paid: p.paid,
    deadline: p.deadline,
    progress: p.progress,
    manager: p.manager,
    managerInitials: managerInitials(p.manager),
    brief: p.brief || "",
    tasks: p.tasks || [],
    timeline: p.timeline || [],
    currentStep: p.currentStep ?? 0,
  };
}

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.45, ease, delay },
});

const fmt = (n: number) => n.toLocaleString("ru-RU");

/* ━━━ PAGE ━━━ */
const ProjectsPage = () => {
  const [barsAnimated, setBarsAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setBarsAnimated(true), 100); return () => clearTimeout(t); }, []);
  const { t, lang } = useLanguage();
  usePageTitle(lang === "en" ? "Projects – neeklo" : "Проекты – neeklo");
  const navigate = useNavigate();
  const locale = lang === "en" ? "en" : "ru";

  const pageQ = useQuery({
    queryKey: ["cms", "projects", locale],
    queryFn: () => cmsPageBySlug("projects", locale),
  });

  const cmsParsed = pageQ.data ? parseProjectsCms(pageQ.data) : null;
  const mockProjects = useMemo(() => (cmsParsed?.items || []).map(cmsItemToProject), [cmsParsed]);

  const emptyTitle = pick(pageQ.data?.meta?.emptyTitle, lang) || t("proj.startFirst");
  const emptyDesc = pick(pageQ.data?.meta?.emptyDesc, lang) || t("proj.startFirstDesc");
  const emptyCta = pick(pageQ.data?.meta?.emptyCta, lang) || t("proj.startProject");

  const [activeTab, setActiveTab] = useState<"active" | "done">("active");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<"overview" | "tasks" | "chat">("overview");

  const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    new: { label: t("status.new"), color: "#888888", bg: "#F5F5F5", border: "#E0E0E0" },
    briefing: { label: t("status.briefing"), color: "#6A6860", bg: "#F5F3EE", border: "#D4CFC6" },
    in_progress: { label: t("status.inProgress"), color: "#0052FF", bg: "#EEF3FF", border: "#0052FF" },
    review: { label: t("status.review"), color: "#FF9500", bg: "#FFF8EE", border: "#FF9500" },
    done: { label: t("status.done"), color: "#00B341", bg: "#EEFBF3", border: "#00B341" },
    cancelled: { label: t("status.cancelled"), color: "#FF3B30", bg: "#FFF0EE", border: "#FF3B30" },
  };

  const filtered = mockProjects.filter((p) =>
    activeTab === "active"
      ? ["new", "briefing", "in_progress", "review"].includes(p.status)
      : ["done", "cancelled"].includes(p.status)
  );

  const activeCount = mockProjects.filter((p) => ["new", "briefing", "in_progress", "review"].includes(p.status)).length;
  const doneCount = mockProjects.filter((p) => ["done", "cancelled"].includes(p.status)).length;
  const inProgressCount = mockProjects.filter((p) => p.status === "in_progress").length;
  const reviewCount = mockProjects.filter((p) => p.status === "review").length;
  const totalPrice = mockProjects.filter((p) => ["new", "briefing", "in_progress", "review"].includes(p.status)).reduce((s, p) => s + p.price, 0);

  useEffect(() => { document.body.style.overflow = selectedProject ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [selectedProject]);
  useEffect(() => { setActiveDetailTab("overview"); }, [selectedProject?.id]);

  const handleRefresh = useCallback(async () => {
    await pageQ.refetch();
    toast.success(lang === "en" ? "Updated" : "Обновлено");
  }, [pageQ, lang]);

  const { containerRef, pullDistance, isRefreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh({ onRefresh: handleRefresh });

  if (pageQ.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#F5F5F5]">
        <p className="font-body text-[14px] text-[#6A6860]">…</p>
      </div>
    );
  }

  if (pageQ.isError) {
    return (
      <div className="bg-[#F5F5F5] min-h-screen px-4 py-16 text-center">
        <p className="font-body text-[14px] text-[#6A6860]">{(pageQ.error as Error).message}</p>
      </div>
    );
  }

  if (!pageQ.data) {
    return (
      <div className="bg-[#F5F5F5] min-h-screen px-4 py-16 text-center">
        <p className="font-body text-[14px] text-[#6A6860]">
          Создайте страницу CMS slug «projects» с блоком projects_data (см. server/seed-cms-content.mjs).
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5F5] min-h-screen pb-[100px] overflow-x-hidden">
      <div className="bg-white px-5 md:px-10 pt-8 pb-6 border-b border-[#F0F0F0]">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-[24px] font-[800] text-[#0D0D0B]">{t("proj.title")}</h1>
          <button onClick={() => navigate("/chat")} className="w-10 h-10 border border-[#E0E0E0] bg-white rounded-xl flex items-center justify-center hover:bg-[#F5F5F5] transition-colors cursor-pointer">
            <Plus size={18} className="text-[#0D0D0B]" />
          </button>
        </div>
        <div className="flex gap-2 mt-5">
          {([["active", t("proj.active"), activeCount], ["done", t("proj.done"), doneCount]] as const).map(([key, label, count]) => (
            <button key={key} onClick={() => setActiveTab(key as "active" | "done")} className={`rounded-full px-5 py-2 font-body text-[14px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === key ? "bg-[#0D0D0B] text-white" : "bg-white border border-[#E0E0E0] text-[#6A6860]"}`}>
              {label}
              <span className={`inline-flex items-center justify-center rounded-full text-[10px] font-bold ${activeTab === key ? "bg-white/20 text-white" : "bg-[#F0F0F0] text-[#888]"}`} style={{ width: 18, height: 18 }}>{count}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === "active" && (
        <div className="px-5 md:px-10 pt-5 pb-2">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: <Play size={12} />, color: "#0052FF", bg: "#EEF3FF", value: String(inProgressCount), label: t("proj.inProgress") },
              { icon: <Eye size={12} />, color: "#FF9500", bg: "#FFF8EE", value: String(reviewCount), label: t("proj.onReview") },
              { icon: <span className="text-[12px]">₽</span>, color: "#00B341", bg: "#EEFBF3", value: fmt(totalPrice), label: t("proj.sum") },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-xl p-2.5 flex flex-col items-center text-center gap-1">
                <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 26, height: 26, background: c.bg, color: c.color }}>{c.icon}</div>
                <div>
                  <div className="font-heading text-[14px] font-[800] text-[#0D0D0B] whitespace-nowrap">{c.value}</div>
                  <div className="font-body text-[9px] text-[#6A6860] mt-0.5">{c.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 md:px-10 pt-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="mt-20 flex flex-col items-center text-center px-8">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5" style={{ background: "linear-gradient(135deg, #e0e8ff 0%, #f0e6ff 50%, #e8f4ff 100%)" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #a8c0ff 0%, #7b8ddb 40%, #5c6bc0 100%)", boxShadow: "0 8px 24px rgba(92,107,192,0.35), inset 0 -4px 8px rgba(0,0,0,0.15), inset 0 4px 8px rgba(255,255,255,0.25)" }} />
            </div>
            <p className="font-heading text-[20px] font-[800] text-[#0D0D0B]">{emptyTitle}</p>
            <p className="font-body text-[14px] text-[#6A6860] mt-2 max-w-[280px] leading-relaxed">{emptyDesc}</p>
            <button onClick={() => navigate("/chat")} className="mt-6 bg-[#0D0D0B] text-white rounded-2xl px-8 py-4 font-body text-[15px] font-bold cursor-pointer hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 flex items-center gap-2">
              {emptyCta}
            </button>
          </div>
        ) : (
          filtered.map((p, i) => {
            const sc = statusConfig[p.status] || statusConfig.new;
            return (
              <motion.div key={p.id} className="bg-white rounded-[20px] overflow-hidden cursor-pointer" style={{ borderLeft: `4px solid ${sc.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)" }} onClick={() => setSelectedProject(p)} whileHover={{ y: -2, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} whileTap={{ scale: 0.99 }} {...fadeUp(i * 0.06)}>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-[#F5F5F5] rounded-xl flex items-center justify-center text-[18px] flex-shrink-0">{p.emoji}</div>
                      <span className="font-body text-[15px] font-semibold text-[#0D0D0B]">{p.title}</span>
                    </div>
                    <span className="rounded-full font-body text-[11px] font-semibold px-3 py-1 flex-shrink-0" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="font-body text-[14px] font-bold text-[#0052FF]">₽ {fmt(p.price)}</span>
                    <span className="font-body text-[13px] text-[#6A6860]">{lang === "en" ? "by" : "до"} {p.deadline}</span>
                    {p.paid > 0 && p.paid < p.price && <span className="font-body text-[11px] text-[#00B341]">{t("proj.paid")} {Math.round(p.paid / p.price * 100)}%</span>}
                    {p.paid === p.price && p.paid > 0 && <span className="font-body text-[11px] text-[#00B341]">{t("proj.paidFull")}</span>}
                  </div>
                  <div className="mt-3">
                    <div className="bg-[#F0F0F0] h-1 rounded-full w-full"><div className="h-full rounded-full" style={{ width: barsAnimated ? `${p.progress}%` : "0%", background: sc.border, transition: "width 0.8s ease" }} /></div>
                    <div className="flex justify-between mt-1.5">
                      <span className="font-body text-[11px] text-[#6A6860]">{p.progress}% {t("proj.completed")}</span>
                      <span className="font-body text-[12px] font-semibold text-[#0D0D0B]">{t("proj.open")}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectSheet project={selectedProject} activeTab={activeDetailTab} setActiveTab={setActiveDetailTab} onClose={() => setSelectedProject(null)} navigate={navigate} t={t} lang={lang} statusConfig={statusConfig} />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ━━━ SHEET ━━━ */
const ProjectSheet = ({ project: p, activeTab, setActiveTab, onClose, navigate, t, lang, statusConfig }: {
  project: Project; activeTab: "overview" | "tasks" | "chat";
  setActiveTab: (t: "overview" | "tasks" | "chat") => void;
  onClose: () => void; navigate: ReturnType<typeof useNavigate>;
  t: (key: any) => string; lang: string;
  statusConfig: Record<string, { label: string; color: string; bg: string; border: string }>;
}) => {
  const sc = statusConfig[p.status] || statusConfig.new;
  const doneCount = p.tasks.filter((tk) => tk.done).length;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const tabs = [
    { key: "overview" as const, label: t("proj.overview") },
    { key: "tasks" as const, label: t("proj.tasks") },
    { key: "chat" as const, label: t("proj.chat") },
  ];

  return (
    <>
      <motion.div className="fixed inset-0 bg-black/40 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className={`fixed z-[60] bg-white flex flex-col overflow-hidden ${isMobile ? "inset-x-0 bottom-0 rounded-t-[24px]" : "inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[24px] md:max-w-[600px] md:w-full"}`}
        style={{ height: "88dvh", maxHeight: "88dvh" }}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.35, ease }}
        onClick={(e) => e.stopPropagation()}
      >
        {isMobile && <div className="w-9 h-1 bg-[#E0E0E0] rounded-full mx-auto mt-3" />}
        <div className="px-5 pt-3 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F5F5F5] rounded-xl flex items-center justify-center text-[20px]">{p.emoji}</div>
            <div>
              <div className="font-heading text-[17px] font-[800] text-[#0D0D0B]">{p.title}</div>
              <span className="rounded-full font-body text-[11px] font-semibold px-2.5 py-0.5 inline-block mt-0.5" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-[#F5F5F5] flex items-center justify-center cursor-pointer hover:bg-[#EBEBEB] transition-colors"><X size={18} className="text-[#0D0D0B]" /></button>
        </div>

        <div className="px-5 mt-3">
          <div className="bg-[#F0F0F0] h-1.5 rounded-full"><div className="h-full rounded-full transition-all duration-[1s] ease-out" style={{ width: `${p.progress}%`, background: sc.border }} /></div>
          <div className="flex justify-between mt-1">
            <span className="font-body text-[11px] text-[#6A6860]">{p.progress}%</span>
            <span className="font-body text-[11px] text-[#6A6860]">{lang === "en" ? "by" : "до"} {p.deadline}</span>
          </div>
        </div>

        <div className="mt-4 px-5 flex gap-0 border-b border-[#F0F0F0]">
          {tabs.map((tb) => (
            <button key={tb.key} onClick={() => setActiveTab(tb.key)} className={`flex-1 text-center py-3 font-body text-[14px] font-semibold transition-colors cursor-pointer ${activeTab === tb.key ? "text-[#0D0D0B] border-b-2 border-[#0D0D0B]" : "text-[#888] border-b-2 border-transparent"}`}>{tb.label}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 pb-24">
          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[{ label: t("proj.budget"), value: `${fmt(p.price)}₽` }, { label: t("proj.paid"), value: `${fmt(p.paid)}₽` }, { label: t("proj.deadline"), value: p.deadline }, { label: t("proj.progress"), value: `${p.progress}%` }].map((c) => (
                  <div key={c.label} className="bg-[#F9F9F9] rounded-2xl p-4">
                    <div className="font-body text-[11px] text-[#6A6860] uppercase tracking-wide mb-1">{c.label}</div>
                    <div className="font-body text-[16px] font-bold text-[#0D0D0B]">{c.value}</div>
                  </div>
                ))}
              </div>
              <div className="mb-5">
                <div className="font-body text-[12px] font-semibold uppercase tracking-[0.06em] text-[#B0B0B0] mb-2">{t("proj.description")}</div>
                <div className="bg-[#F9F9F9] rounded-2xl p-4 font-body text-[14px] text-[#3A3A3A] leading-[1.65]">{p.brief}</div>
              </div>
              <div className="mb-5">
                <div className="font-body text-[12px] font-semibold uppercase tracking-[0.06em] text-[#B0B0B0] mb-2">{t("proj.stages")}</div>
                <div className="flex flex-col">
                  {p.timeline.map((step, i) => {
                    const isDone = i < p.currentStep;
                    const isCurrent = i === p.currentStep;
                    const isLast = i === p.timeline.length - 1;
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          {isDone ? (
                            <div className="w-5 h-5 rounded-full bg-[#0D0D0B] flex items-center justify-center flex-shrink-0"><Check size={10} className="text-white" /></div>
                          ) : isCurrent ? (
                            <div className="w-5 h-5 rounded-full border-2 border-[#00C853] flex items-center justify-center flex-shrink-0">
                              <motion.div className="w-2 h-2 rounded-full bg-[#00C853]" animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-[#E0E0E0] bg-white flex-shrink-0" />
                          )}
                          {!isLast && <div className="w-0.5 h-6" style={{ background: isDone ? "#0D0D0B" : "#E0E0E0" }} />}
                        </div>
                        <span className={`font-body text-[14px] font-semibold pt-0.5 ${isDone ? "text-[#0D0D0B]" : isCurrent ? "text-[#00B341]" : "text-[#B0B0B0]"}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-[#F9F9F9] rounded-2xl p-4 flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0D0D0B] flex items-center justify-center font-heading text-[13px] text-white">{p.managerInitials}</div>
                  <div>
                    <div className="font-body text-[11px] text-[#6A6860]">{t("proj.manager")}</div>
                    <div className="font-body text-[14px] font-semibold text-[#0D0D0B]">{p.manager}</div>
                  </div>
                </div>
                <button onClick={() => { onClose(); navigate("/chat"); }} className="border border-[#E0E0E0] bg-white rounded-xl px-3 py-2 font-body text-[13px] font-semibold cursor-pointer hover:bg-[#F5F5F5] transition-colors">{t("proj.write")}</button>
              </div>
            </>
          )}
          {activeTab === "tasks" && (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="font-body text-[14px] font-semibold">{doneCount}/{p.tasks.length} {t("proj.tasksCompleted")}</span>
                  <span className="font-body text-[14px] font-bold text-[#0052FF]">{p.tasks.length > 0 ? Math.round(doneCount / p.tasks.length * 100) : 0}%</span>
                </div>
                <div className="bg-[#F0F0F0] h-1.5 rounded-full mt-2"><div className="h-full rounded-full bg-[#0052FF] transition-all duration-500" style={{ width: `${p.tasks.length > 0 ? Math.round(doneCount / p.tasks.length * 100) : 0}%` }} /></div>
              </div>
              <div className="flex flex-col gap-2">
                {p.tasks.map((tk, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[#F9F9F9] rounded-2xl">
                    {tk.done ? <div className="w-[22px] h-[22px] rounded-full bg-[#0D0D0B] flex items-center justify-center flex-shrink-0"><Check size={11} className="text-white" /></div> : <div className="w-[22px] h-[22px] rounded-full border-2 border-[#D0D0D0] bg-white flex-shrink-0" />}
                    <span className={`font-body text-[14px] ${tk.done ? "line-through text-[#B0B0B0]" : "text-[#0D0D0B]"}`}>{tk.title}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {activeTab === "chat" && (
            <div className="flex flex-col items-center text-center mt-8">
              <span className="text-[40px]">💬</span>
              <p className="font-body text-[15px] font-semibold mt-3">{t("proj.chatManager")}</p>
              <p className="font-body text-[13px] text-[#6A6860] mt-1">{t("proj.chatDesc")}</p>
              <button onClick={() => { onClose(); navigate("/chat"); }} className="mt-5 bg-[#0D0D0B] text-white rounded-2xl px-6 py-3 font-body text-[14px] font-semibold cursor-pointer">{t("proj.writeManager")}</button>
            </div>
          )}
        </div>

        {activeTab === "overview" && (
          <div className="sticky bottom-0 bg-white border-t border-[#F0F0F0] p-4" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}>
            {p.status === "review" ? (
              <button onClick={() => { toast.success(t("proj.workAccepted")); onClose(); }} className="w-full bg-[#00B341] text-white rounded-2xl py-3.5 font-body text-[15px] font-bold cursor-pointer hover:-translate-y-[1px] active:scale-[0.97] transition-all duration-200">{t("proj.acceptWork")}</button>
            ) : p.status === "done" ? (
              <button onClick={() => { onClose(); navigate("/chat"); }} className="w-full bg-[#0D0D0B] text-white rounded-2xl py-3.5 font-body text-[15px] font-bold cursor-pointer hover:-translate-y-[1px] active:scale-[0.97] transition-all duration-200">{t("proj.orderMore")}</button>
            ) : (
              <button onClick={() => { onClose(); navigate("/chat"); }} className="w-full bg-[#0D0D0B] text-white rounded-2xl py-3.5 font-body text-[15px] font-bold cursor-pointer hover:-translate-y-[1px] active:scale-[0.97] transition-all duration-200">{t("proj.writeManager")}</button>
            )}
          </div>
        )}
      </motion.div>
    </>
  );
};

export default ProjectsPage;
