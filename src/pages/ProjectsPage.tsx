import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

interface Project {
  id: string;
  title: string;
  service: string;
  status: string;
  price: number;
  paid: number;
  deadline: string;
  progress: number;
  manager: string;
  color: string;
}

const mockProjects: Project[] = [
  { id: "1", title: "Лендинг для DA-Motors", service: "Сайт", status: "in_progress", price: 95000, paid: 47500, deadline: "15 апр 2026", progress: 75, manager: "Никита К.", color: "#0052FF" },
  { id: "2", title: "Telegram Mini App", service: "Mini App", status: "review", price: 200000, paid: 200000, deadline: "5 апр 2026", progress: 95, manager: "Никита К.", color: "#FF9500" },
  { id: "3", title: "AI-агент продаж", service: "AI-агент", status: "briefing", price: 150000, paid: 0, deadline: "30 апр 2026", progress: 15, manager: "Никита К.", color: "#888888" },
  { id: "4", title: "Имиджевые ролики", service: "AI-видео", status: "done", price: 80000, paid: 80000, deadline: "1 мар 2026", progress: 100, manager: "Никита К.", color: "#00B341" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "Новый", color: "#888", bg: "#F5F5F5" },
  briefing: { label: "Сбор брифа", color: "#6A6860", bg: "#F0EEE8" },
  in_progress: { label: "В работе", color: "#0052FF", bg: "#EEF3FF" },
  review: { label: "На проверке", color: "#FF9500", bg: "#FFF8EE" },
  done: { label: "Завершён", color: "#00B341", bg: "#EEFBF3" },
  cancelled: { label: "Отменён", color: "#FF3B30", bg: "#FFF0EE" },
};

const serviceEmojis: Record<string, string> = {
  "Сайт": "🌐", "Mini App": "📱", "AI-агент": "✦", "AI-видео": "🎬",
};

const timelineSteps = ["Бриф", "Предложение", "Разработка", "Проверка", "Сдача"];

function getTimelineIndex(status: string) {
  const map: Record<string, number> = { new: 0, briefing: 0, in_progress: 2, review: 3, done: 4, cancelled: -1 };
  return map[status] ?? 0;
}

const ease = [0.16, 1, 0.3, 1] as const;

const ProjectDetail = ({ project, onClose, navigate }: { project: Project; onClose: () => void; navigate: ReturnType<typeof useNavigate> }) => {
  const st = statusConfig[project.status] || statusConfig.new;
  const currentStep = getTimelineIndex(project.status);

  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl overflow-y-auto"
        style={{ height: "88vh" }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.3, ease }}
      >
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-8 h-1 rounded-full bg-[#E0E0E0]" />
        </div>
        <div className="px-5 pb-24">
          <span className="font-body inline-block rounded-full" style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", background: st.bg, color: st.color }}>{st.label}</span>
          <h2 className="font-heading mt-1" style={{ fontSize: 20, fontWeight: 800 }}>{project.title}</h2>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {[
              { label: "Бюджет", value: `${project.price.toLocaleString("ru")} ₽` },
              { label: "Оплачено", value: `${project.paid.toLocaleString("ru")} ₽` },
              { label: "Дедлайн", value: project.deadline },
              { label: "Прогресс", value: `${project.progress}%` },
            ].map((c) => (
              <div key={c.label} className="bg-[#F9F9F9] rounded-xl p-3">
                <p className="font-body" style={{ fontSize: 11, color: "#6A6860" }}>{c.label}</p>
                <p className="font-body" style={{ fontSize: 15, fontWeight: 700 }}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 w-full h-2 rounded-full bg-[#F0F0F0] overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${project.progress}%`, background: st.color }} />
          </div>

          <div className="mt-6">
            <p className="font-body mb-3" style={{ fontSize: 15, fontWeight: 700 }}>Этапы</p>
            {timelineSteps.map((step, i) => {
              const isDone = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={step}>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 rounded-full flex items-center justify-center" style={{ width: 20, height: 20, background: isDone ? "#0D0D0B" : "white", border: isDone ? "none" : "2px solid #E0E0E0", boxShadow: isCurrent ? "0 0 0 4px rgba(0,200,83,0.2)" : "none" }}>
                      {isDone && <span className="text-white" style={{ fontSize: 10 }}>✓</span>}
                    </div>
                    <span className="font-body" style={{ fontSize: 14, fontWeight: isDone ? 600 : 400, color: isDone ? "#0D0D0B" : "#6A6860" }}>{step}</span>
                  </div>
                  {i < timelineSteps.length - 1 && <div className="ml-[9px] w-0.5 h-6 bg-[#E0E0E0]" />}
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <p className="font-body mb-2" style={{ fontSize: 11, color: "#6A6860" }}>Менеджер</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E0E0E0] flex items-center justify-center flex-shrink-0">
                <span className="font-body" style={{ fontSize: 11, fontWeight: 700, color: "#6A6860" }}>НК</span>
              </div>
              <span className="font-body flex-1" style={{ fontSize: 14, fontWeight: 600 }}>{project.manager}</span>
              <button onClick={() => navigate("/chat")} className="font-body rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer" style={{ border: "1px solid #E0E0E0", padding: "6px 12px", fontSize: 13 }}>Написать</button>
            </div>
          </div>

          <button onClick={() => navigate("/chat")} className="w-full font-body text-white rounded-xl mt-6 cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.97] transition-all" style={{ background: "#0D0D0B", padding: "14px 0", fontSize: 15, fontWeight: 600 }}>
            Написать менеджеру →
          </button>
        </div>
      </motion.div>
    </>
  );
};

const ProjectsPage = () => {
  const navigate = useNavigate();
  usePageTitle("Проекты — neeklo");
  const [tab, setTab] = useState<"active" | "done">("active");
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered = mockProjects.filter((p) =>
    tab === "active" ? ["new", "briefing", "in_progress", "review"].includes(p.status) : ["done", "cancelled"].includes(p.status)
  );

  return (
    <div className="min-h-screen bg-background" style={{ paddingBottom: 100 }}>
      <div className="max-w-[720px] mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between" style={{ paddingTop: 32 }}>
          <h1 className="font-heading" style={{ fontSize: 22, fontWeight: 800 }}>Мои проекты</h1>
          <button onClick={() => navigate("/chat")} className="flex items-center justify-center hover:bg-[#F5F5F5] active:scale-95 transition-all cursor-pointer" style={{ width: 36, height: 36, borderRadius: 12, border: "1px solid #E0E0E0" }}>
            <Plus size={18} />
          </button>
        </div>

        <div className="flex gap-2 mt-4 mb-5">
          {(["active", "done"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className="font-body rounded-full cursor-pointer transition-colors" style={{ fontSize: 13, fontWeight: 600, padding: "7px 16px", background: tab === t ? "#0D0D0B" : "transparent", color: tab === t ? "#fff" : "#6A6860", border: tab === t ? "1px solid #0D0D0B" : "1px solid #E0E0E0" }}>
              {t === "active" ? "Активные" : "Завершённые"}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center mt-16">
            <span style={{ fontSize: 48 }}>📋</span>
            <p className="font-body mt-3" style={{ fontSize: 16, fontWeight: 600 }}>Проектов пока нет</p>
            <button onClick={() => navigate("/chat")} className="font-body text-white rounded-xl mt-4 cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.97] transition-all" style={{ background: "#0D0D0B", padding: "12px 24px", fontSize: 14, fontWeight: 600 }}>
              Заказать первый проект
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((p, i) => {
              const st = statusConfig[p.status] || statusConfig.new;
              return (
                <motion.div key={p.id} onClick={() => setSelected(p)} className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md active:scale-[0.98] transition-all" style={{ borderLeft: `4px solid ${st.color}` }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease, delay: i * 0.06 }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 20 }}>{serviceEmojis[p.service] || "📁"}</span>
                    <span className="font-body flex-1 truncate" style={{ fontSize: 15, fontWeight: 600 }}>{p.title}</span>
                    <span className="font-body rounded-full flex-shrink-0" style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-body" style={{ fontSize: 14, fontWeight: 700, color: "#0052FF" }}>₽ {p.price.toLocaleString("ru")}</span>
                    <span className="font-body" style={{ fontSize: 13, color: "#6A6860" }}>до {p.deadline}</span>
                  </div>
                  <div className="mt-3 w-full h-1 rounded-full bg-[#F0F0F0] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: st.color }} />
                  </div>
                  <p className="font-body mt-1" style={{ fontSize: 11, color: "#6A6860" }}>{p.progress}% выполнено</p>
                  <p className="font-body mt-2" style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B" }}>Открыть →</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <AnimatePresence>
        {selected && <ProjectDetail project={selected} onClose={() => setSelected(null)} navigate={navigate} />}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsPage;
