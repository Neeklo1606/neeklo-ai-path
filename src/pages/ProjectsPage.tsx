import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, Play, Eye } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { toast } from "sonner";

/* ─── types ─── */
interface Task { title: string; done: boolean }
interface Project {
  id: string; emoji: string; title: string; service: string;
  status: string; price: number; paid: number; deadline: string;
  progress: number; manager: string; managerInitials: string;
  brief: string; tasks: Task[]; timeline: string[]; currentStep: number;
}

/* ─── data ─── */
const mockProjects: Project[] = [
  { id: "1", emoji: "🌐", title: "Лендинг для DA-Motors", service: "Сайт", status: "in_progress", price: 95000, paid: 47500, deadline: "15 апр 2026", progress: 75, manager: "Никита К.", managerInitials: "НК", brief: "Современный лендинг для авто-дилера с формой заявки и интеграцией CRM.", tasks: [{ title: "Дизайн в Figma", done: true }, { title: "Верстка главной страницы", done: true }, { title: "Форма заявки + CRM", done: true }, { title: "Мобильная адаптация", done: false }, { title: "SEO-оптимизация", done: false }], timeline: ["Бриф", "Предложение", "Разработка", "Проверка", "Сдача"], currentStep: 2 },
  { id: "2", emoji: "📱", title: "Telegram Mini App", service: "Mini App", status: "review", price: 200000, paid: 200000, deadline: "5 апр 2026", progress: 95, manager: "Никита К.", managerInitials: "НК", brief: "Каталог услуг и запись на приём внутри Telegram.", tasks: [{ title: "UI/UX дизайн", done: true }, { title: "Frontend разработка", done: true }, { title: "Backend API", done: true }, { title: "Оплата Stars", done: true }, { title: "Финальное тестирование", done: false }], timeline: ["Бриф", "Предложение", "Разработка", "Проверка", "Сдача"], currentStep: 3 },
  { id: "3", emoji: "✦", title: "AI-агент продаж", service: "AI-агент", status: "briefing", price: 150000, paid: 0, deadline: "30 апр 2026", progress: 15, manager: "Никита К.", managerInitials: "НК", brief: "AI-ассистент для квалификации входящих лидов и ответов на вопросы.", tasks: [{ title: "Сбор брифа", done: true }, { title: "Сценарии диалогов", done: false }, { title: "GPT интеграция", done: false }, { title: "CRM подключение", done: false }, { title: "Тестирование", done: false }], timeline: ["Бриф", "Предложение", "Разработка", "Проверка", "Сдача"], currentStep: 0 },
  { id: "4", emoji: "🎬", title: "Имиджевые ролики", service: "AI-видео", status: "done", price: 80000, paid: 80000, deadline: "1 мар 2026", progress: 100, manager: "Никита К.", managerInitials: "НК", brief: "Серия из 5 коротких роликов для Instagram Reels и TikTok.", tasks: [{ title: "Сценарий", done: true }, { title: "AI-генерация", done: true }, { title: "Монтаж", done: true }, { title: "Озвучка", done: true }, { title: "Финальная сдача", done: true }], timeline: ["Бриф", "Предложение", "Разработка", "Проверка", "Сдача"], currentStep: 4 },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  new: { label: "Новый", color: "#888888", bg: "#F5F5F5", border: "#E0E0E0" },
  briefing: { label: "Сбор брифа", color: "#6A6860", bg: "#F5F3EE", border: "#D4CFC6" },
  in_progress: { label: "В работе", color: "#0052FF", bg: "#EEF3FF", border: "#0052FF" },
  review: { label: "На проверке", color: "#FF9500", bg: "#FFF8EE", border: "#FF9500" },
  done: { label: "Завершён", color: "#00B341", bg: "#EEFBF3", border: "#00B341" },
  cancelled: { label: "Отменён", color: "#FF3B30", bg: "#FFF0EE", border: "#FF3B30" },
};

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
  usePageTitle("Проекты – neeklo");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"active" | "done">("active");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<"overview" | "tasks" | "chat">("overview");

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

  useEffect(() => {
    document.body.style.overflow = selectedProject ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedProject]);

  useEffect(() => { setActiveDetailTab("overview"); }, [selectedProject?.id]);

  return (
    <div className="bg-[#F5F5F5] min-h-screen pb-[100px] overflow-x-hidden">
      {/* Header */}
      <div className="bg-white px-5 md:px-10 pt-8 pb-6 border-b border-[#F0F0F0]">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-[24px] font-[800] text-[#0D0D0B]">Мои проекты</h1>
          <button onClick={() => navigate("/chat")} className="w-10 h-10 border border-[#E0E0E0] bg-white rounded-xl flex items-center justify-center hover:bg-[#F5F5F5] transition-colors cursor-pointer">
            <Plus size={18} className="text-[#0D0D0B]" />
          </button>
        </div>
        <div className="flex gap-2 mt-5">
          {([["active", "Активные", activeCount], ["done", "Завершённые", doneCount]] as const).map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`rounded-full px-5 py-2 font-body text-[14px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === key ? "bg-[#0D0D0B] text-white" : "bg-white border border-[#E0E0E0] text-[#6A6860]"
              }`}
            >
              {label}
              <span className={`inline-flex items-center justify-center rounded-full text-[10px] font-bold ${activeTab === key ? "bg-white/20 text-white" : "bg-[#F0F0F0] text-[#888]"}`} style={{ width: 18, height: 18 }}>{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {activeTab === "active" && (
        <div className="px-5 md:px-10 pt-5 pb-2">
          <div className="grid gap-2.5" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            {[
              { icon: <Play size={16} />, color: "#0052FF", bg: "#EEF3FF", value: inProgressCount, label: "В работе" },
              { icon: <Eye size={16} />, color: "#FF9500", bg: "#FFF8EE", value: reviewCount, label: "На проверке" },
              { icon: <span className="text-[16px]">₽</span>, color: "#00B341", bg: "#EEFBF3", value: fmt(totalPrice), label: "Сумма проектов" },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-2xl p-3 pr-3 flex items-center gap-2 min-w-0">
                <div className="rounded-xl flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, background: c.bg, color: c.color }}>{c.icon}</div>
                <div className="min-w-0">
                  <div className="font-heading text-[15px] font-[800] text-[#0D0D0B] whitespace-nowrap">{c.value}</div>
                  <div className="font-body text-[11px] text-[#6A6860] mt-0.5 whitespace-nowrap">{c.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <div className="px-5 md:px-10 pt-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center px-8">
            <span className="text-[48px]">📋</span>
            <p className="font-body text-[16px] font-semibold text-[#0D0D0B] mt-3">Проектов пока нет</p>
            <button onClick={() => navigate("/chat")} className="mt-4 bg-[#0D0D0B] text-white rounded-2xl px-6 py-3 font-body text-[15px] font-semibold cursor-pointer">Заказать первый проект</button>
          </div>
        ) : (
          filtered.map((p, i) => {
            const sc = statusConfig[p.status] || statusConfig.new;
            return (
              <motion.div
                key={p.id}
                className="bg-white rounded-[20px] overflow-hidden cursor-pointer"
                style={{ borderLeft: `4px solid ${sc.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)" }}
                onClick={() => setSelectedProject(p)}
                whileHover={{ y: -2, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                whileTap={{ scale: 0.99 }}
                {...fadeUp(i * 0.06)}
              >
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
                    <span className="font-body text-[13px] text-[#6A6860]">до {p.deadline}</span>
                    {p.paid > 0 && p.paid < p.price && <span className="font-body text-[11px] text-[#00B341]">Оплачено {Math.round(p.paid / p.price * 100)}%</span>}
                    {p.paid === p.price && p.paid > 0 && <span className="font-body text-[11px] text-[#00B341]">Оплачен ✓</span>}
                  </div>
                  <div className="mt-3">
                    <div className="bg-[#F0F0F0] h-1 rounded-full w-full"><div className="h-full rounded-full" style={{ width: barsAnimated ? `${p.progress}%` : "0%", background: sc.border, transition: "width 0.8s ease" }} /></div>
                    <div className="flex justify-between mt-1.5">
                      <span className="font-body text-[11px] text-[#6A6860]">{p.progress}% выполнено</span>
                      <span className="font-body text-[12px] font-semibold text-[#0D0D0B]">Открыть →</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Sheet */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectSheet project={selectedProject} activeTab={activeDetailTab} setActiveTab={setActiveDetailTab} onClose={() => setSelectedProject(null)} navigate={navigate} />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ━━━ SHEET ━━━ */
const ProjectSheet = ({ project: p, activeTab, setActiveTab, onClose, navigate }: {
  project: Project; activeTab: "overview" | "tasks" | "chat";
  setActiveTab: (t: "overview" | "tasks" | "chat") => void;
  onClose: () => void; navigate: ReturnType<typeof useNavigate>;
}) => {
  const sc = statusConfig[p.status] || statusConfig.new;
  const doneCount = p.tasks.filter((t) => t.done).length;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const tabs = [{ key: "overview" as const, label: "Обзор" }, { key: "tasks" as const, label: "Задачи" }, { key: "chat" as const, label: "Чат" }];

  return (
    <>
      <motion.div className="fixed inset-0 bg-black/40 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className={`fixed z-[60] bg-white flex flex-col overflow-hidden ${isMobile ? "inset-x-0 bottom-0 rounded-t-[24px]" : "inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[24px] md:max-w-[600px] md:w-full"}`}
        style={{ height: "88dvh", maxHeight: "88dvh" }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.35, ease }}
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
            <span className="font-body text-[11px] text-[#6A6860]">до {p.deadline}</span>
          </div>
        </div>

        <div className="mt-4 px-5 flex gap-0 border-b border-[#F0F0F0]">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex-1 text-center py-3 font-body text-[14px] font-semibold transition-colors cursor-pointer ${activeTab === t.key ? "text-[#0D0D0B] border-b-2 border-[#0D0D0B]" : "text-[#888] border-b-2 border-transparent"}`}>{t.label}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 pb-24">
          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[{ label: "Бюджет", value: `${fmt(p.price)}₽` }, { label: "Оплачено", value: `${fmt(p.paid)}₽` }, { label: "Дедлайн", value: p.deadline }, { label: "Прогресс", value: `${p.progress}%` }].map((c) => (
                  <div key={c.label} className="bg-[#F9F9F9] rounded-2xl p-4">
                    <div className="font-body text-[11px] text-[#6A6860] uppercase tracking-wide mb-1">{c.label}</div>
                    <div className="font-body text-[16px] font-bold text-[#0D0D0B]">{c.value}</div>
                  </div>
                ))}
              </div>
              <div className="mb-5">
                <div className="font-body text-[12px] font-semibold uppercase tracking-[0.06em] text-[#B0B0B0] mb-2">Описание</div>
                <div className="bg-[#F9F9F9] rounded-2xl p-4 font-body text-[14px] text-[#3A3A3A] leading-[1.65]">{p.brief}</div>
              </div>
              <div className="mb-5">
                <div className="font-body text-[12px] font-semibold uppercase tracking-[0.06em] text-[#B0B0B0] mb-2">Этапы работы</div>
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
                    <div className="font-body text-[11px] text-[#6A6860]">Менеджер</div>
                    <div className="font-body text-[14px] font-semibold text-[#0D0D0B]">{p.manager}</div>
                  </div>
                </div>
                <button onClick={() => { onClose(); navigate("/chat"); }} className="border border-[#E0E0E0] bg-white rounded-xl px-3 py-2 font-body text-[13px] font-semibold cursor-pointer hover:bg-[#F5F5F5] transition-colors">Написать</button>
              </div>
            </>
          )}
          {activeTab === "tasks" && (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="font-body text-[14px] font-semibold">{doneCount}/{p.tasks.length} задач выполнено</span>
                  <span className="font-body text-[14px] font-bold text-[#0052FF]">{Math.round(doneCount / p.tasks.length * 100)}%</span>
                </div>
                <div className="bg-[#F0F0F0] h-1.5 rounded-full mt-2"><div className="h-full rounded-full bg-[#0052FF] transition-all duration-500" style={{ width: `${Math.round(doneCount / p.tasks.length * 100)}%` }} /></div>
              </div>
              <div className="flex flex-col gap-2">
                {p.tasks.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[#F9F9F9] rounded-2xl">
                    {t.done ? <div className="w-[22px] h-[22px] rounded-full bg-[#0D0D0B] flex items-center justify-center flex-shrink-0"><Check size={11} className="text-white" /></div> : <div className="w-[22px] h-[22px] rounded-full border-2 border-[#D0D0D0] bg-white flex-shrink-0" />}
                    <span className={`font-body text-[14px] ${t.done ? "line-through text-[#B0B0B0]" : "text-[#0D0D0B]"}`}>{t.title}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {activeTab === "chat" && (
            <div className="flex flex-col items-center text-center mt-8">
              <span className="text-[40px]">💬</span>
              <p className="font-body text-[15px] font-semibold mt-3">Чат с менеджером</p>
              <p className="font-body text-[13px] text-[#6A6860] mt-1">Здесь будет история переписки по проекту</p>
              <button onClick={() => { onClose(); navigate("/chat"); }} className="mt-5 bg-[#0D0D0B] text-white rounded-2xl px-6 py-3 font-body text-[14px] font-semibold cursor-pointer">Написать менеджеру →</button>
            </div>
          )}
        </div>

        {activeTab === "overview" && (
          <div className="sticky bottom-0 bg-white border-t border-[#F0F0F0] p-4" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
            {p.status === "review" ? (
              <button onClick={() => { toast.success("Работа принята! Менеджер получит уведомление."); onClose(); }} className="w-full bg-[#00B341] text-white rounded-2xl py-3.5 font-body text-[15px] font-bold cursor-pointer hover:-translate-y-[1px] active:scale-[0.97] transition-all duration-200">Принять работу ✓</button>
            ) : p.status === "done" ? (
              <button onClick={() => { onClose(); navigate("/chat"); }} className="w-full bg-[#0D0D0B] text-white rounded-2xl py-3.5 font-body text-[15px] font-bold cursor-pointer hover:-translate-y-[1px] active:scale-[0.97] transition-all duration-200">Заказать ещё →</button>
            ) : (
              <button onClick={() => { onClose(); navigate("/chat"); }} className="w-full bg-[#0D0D0B] text-white rounded-2xl py-3.5 font-body text-[15px] font-bold cursor-pointer hover:-translate-y-[1px] active:scale-[0.97] transition-all duration-200">Написать менеджеру →</button>
            )}
          </div>
        )}
      </motion.div>
    </>
  );
};

export default ProjectsPage;
