import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  LayoutDashboard, Users2, Layers, MessageCircle, Settings2, Sparkles, Image,
  Bell, FolderOpen, TrendingUp, Search, X, ChevronRight, Plus, Download,
  CheckSquare, Trash2, MoreVertical, Send, Pencil, Phone, Mail, ArrowLeft,
} from "lucide-react";

/* ═══════ TYPES ═══════ */
interface Lead {
  id: string; name: string; contact: string; source: string; service: string;
  budget: string; status: string; msg: string; time: string; unread: number;
}
interface Project {
  id: string; emoji: string; title: string; client: string; service: string;
  status: string; price: number; paid: number; deadline: string; progress: number;
  manager: string; notes: string;
}
interface Task { id: string; title: string; done: boolean; priority: 'high' | 'medium' | 'low'; }
interface Msg { id: string; from: 'client' | 'manager'; name: string; text: string; time: string; }
interface Service {
  id: string; emoji: string; name: string; priceFrom: number; priceTo: number;
  days: number; badge: string; active: boolean;
}
interface PortfolioItem {
  id: string; emoji: string; title: string; cat: string; result: string;
  featured: boolean; active: boolean; bg: string;
}

/* ═══════ CONFIG ═══════ */
const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  new: { label: 'Новый', color: '#888', bg: '#F5F5F5', border: '#E0E0E0' },
  contacted: { label: 'Связались', color: '#0052FF', bg: '#EEF3FF', border: '#0052FF' },
  qualified: { label: 'Квалифицирован', color: '#8B5CF6', bg: '#F3F0FF', border: '#8B5CF6' },
  proposal: { label: 'Предложение', color: '#FF9500', bg: '#FFF8EE', border: '#FF9500' },
  won: { label: 'Выигран', color: '#00B341', bg: '#EEFBF3', border: '#00B341' },
  lost: { label: 'Потерян', color: '#FF3B30', bg: '#FFF0EE', border: '#FF3B30' },
};
const projectStatus: Record<string, { label: string; color: string; border: string }> = {
  briefing: { label: 'Сбор брифа', color: '#6A6860', border: '#D4CFC6' },
  in_progress: { label: 'В работе', color: '#0052FF', border: '#0052FF' },
  review: { label: 'На проверке', color: '#FF9500', border: '#FF9500' },
  done: { label: 'Готово', color: '#00B341', border: '#00B341' },
  cancelled: { label: 'Отменено', color: '#FF3B30', border: '#FF3B30' },
};
const sourceColors: Record<string, string> = {
  Telegram: '#2AABEE', Avito: '#FF6B35', Сайт: '#00B341',
  Чат: '#0052FF', Reels: '#E1306C', VK: '#4C75A3',
};
const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ═══════ INITIAL DATA ═══════ */
const initLeads: Lead[] = [
  { id: 'l1', name: 'Максим Орлов', contact: '@maksim_orl', source: 'Telegram', service: 'Лендинг', budget: 'от 95 000 ₽', status: 'new', msg: 'Нужен лендинг для автосервиса', time: '2 мин назад', unread: 2 },
  { id: 'l2', name: 'Анна Петрова', contact: '+7 916 234-55-66', source: 'Avito', service: 'AI-агент', budget: 'от 150 000 ₽', status: 'contacted', msg: 'Хочу автоматизировать продажи', time: '1 час назад', unread: 0 },
  { id: 'l3', name: 'Дмитрий Смирнов', contact: 'dsmith@mail.ru', source: 'Сайт', service: 'Mini App', budget: 'от 65 000 ₽', status: 'qualified', msg: 'Нужно приложение в Telegram', time: '3 часа назад', unread: 1 },
  { id: 'l4', name: 'Ольга Иванова', contact: '@olga_shop', source: 'Чат', service: 'Сайт', budget: 'от 120 000 ₽', status: 'proposal', msg: 'Интернет-магазин одежды', time: 'вчера', unread: 0 },
  { id: 'l5', name: 'Сергей Волков', contact: '+7 903 111-22-33', source: 'Reels', service: 'AI-видео', budget: 'от 50 000 ₽', status: 'won', msg: 'Ролики для бренда', time: '2 дня', unread: 0 },
  { id: 'l6', name: 'Игорь Кузнецов', contact: '@igor_biz', source: 'Чат', service: 'Платформа', budget: 'от 300 000 ₽', status: 'lost', msg: 'Агрегатор услуг', time: '3 дня', unread: 0 },
];
const initProjects: Project[] = [
  { id: 'p1', emoji: '🌐', title: 'Лендинг DA-Motors', client: 'Максим Орлов', service: 'Сайт', status: 'in_progress', price: 95000, paid: 47500, deadline: '15 апр', progress: 75, manager: 'НК', notes: 'Ждём фото от клиента' },
  { id: 'p2', emoji: '📱', title: 'Telegram Mini App', client: 'Сергей Волков', service: 'Mini App', status: 'review', price: 200000, paid: 200000, deadline: '5 апр', progress: 95, manager: 'НК', notes: 'Финальное тестирование' },
  { id: 'p3', emoji: '✦', title: 'AI-агент продаж', client: 'Анна Петрова', service: 'AI-агент', status: 'briefing', price: 150000, paid: 0, deadline: '30 апр', progress: 15, manager: 'НК', notes: 'Собираем бриф' },
  { id: 'p4', emoji: '🎬', title: 'Ролики Совкомбанк', client: 'Совкомбанк', service: 'AI-видео', status: 'done', price: 80000, paid: 80000, deadline: '1 мар', progress: 100, manager: 'НК', notes: 'Сдан и оплачен' },
  { id: 'p5', emoji: '🛡️', title: 'АВИС сайт', client: 'АВИС', service: 'Сайт', status: 'in_progress', price: 120000, paid: 60000, deadline: '20 апр', progress: 55, manager: 'НК', notes: 'Ждём контент' },
];
const initTasks: Record<string, Task[]> = {
  p1: [{ id: 't1', title: 'Дизайн главной', done: true, priority: 'high' }, { id: 't2', title: 'Верстка Hero', done: true, priority: 'high' }, { id: 't3', title: 'Форма заявки', done: true, priority: 'medium' }, { id: 't4', title: 'Мобильная адаптация', done: false, priority: 'medium' }, { id: 't5', title: 'SEO-оптимизация', done: false, priority: 'low' }],
  p2: [{ id: 't6', title: 'UI/UX дизайн', done: true, priority: 'high' }, { id: 't7', title: 'Frontend', done: true, priority: 'high' }, { id: 't8', title: 'Backend API', done: true, priority: 'high' }, { id: 't9', title: 'Оплата Stars', done: true, priority: 'medium' }, { id: 't10', title: 'Финальные правки', done: false, priority: 'high' }],
  p3: [{ id: 't11', title: 'Сбор брифа', done: true, priority: 'high' }, { id: 't12', title: 'Сценарии диалогов', done: false, priority: 'high' }, { id: 't13', title: 'GPT интеграция', done: false, priority: 'high' }],
  p4: [{ id: 't14', title: 'Сценарий', done: true, priority: 'high' }, { id: 't15', title: 'Генерация', done: true, priority: 'high' }, { id: 't16', title: 'Монтаж', done: true, priority: 'medium' }, { id: 't17', title: 'Сдача', done: true, priority: 'high' }],
  p5: [{ id: 't18', title: 'Дизайн', done: true, priority: 'high' }, { id: 't19', title: 'Верстка', done: false, priority: 'high' }, { id: 't20', title: 'Контент', done: false, priority: 'medium' }],
};
const initMessages: Record<string, Msg[]> = {
  l1: [{ id: 'm1', from: 'client', name: 'Максим', text: 'Привет! Хочу заказать лендинг для автосервиса', time: '10:23' }, { id: 'm2', from: 'client', name: 'Максим', text: 'Бюджет около 100к, срок — 2 недели', time: '10:24' }, { id: 'm3', from: 'manager', name: 'Никита', text: 'Привет Максим! Отлично, давайте обсудим детали. Пришлите примеры которые нравятся', time: '10:30' }],
  l2: [{ id: 'm4', from: 'client', name: 'Анна', text: 'Добрый день, интересует автоматизация входящих заявок', time: '09:15' }, { id: 'm5', from: 'manager', name: 'Никита', text: 'Добрый! Расскажите подробнее — сколько заявок в день?', time: '09:45' }],
  l3: [{ id: 'm6', from: 'client', name: 'Дмитрий', text: 'Нужно Mini App для записи к мастерам', time: 'вчера' }, { id: 'm7', from: 'client', name: 'Дмитрий', text: 'Есть уже похожие примеры?', time: 'вчера' }],
  p1: [{ id: 'm8', from: 'client', name: 'Максим', text: 'Когда будет готов первый макет?', time: '11:00' }, { id: 'm9', from: 'manager', name: 'Никита', text: 'Завтра вечером пришлю на согласование', time: '11:05' }],
  p2: [{ id: 'm10', from: 'client', name: 'Сергей', text: 'Проверил — всё отлично! Можно принимать', time: '09:30' }, { id: 'm11', from: 'manager', name: 'Никита', text: 'Отличные новости! Выставляю финальный счёт', time: '09:35' }],
};
const initServices: Service[] = [
  { id: 's1', emoji: '🎬', name: 'AI-ролики', priceFrom: 25000, priceTo: 150000, days: 5, badge: 'ХИТ', active: true },
  { id: 's2', emoji: '🌐', name: 'Сайт под ключ', priceFrom: 95000, priceTo: 400000, days: 14, badge: '', active: true },
  { id: 's3', emoji: '📱', name: 'Telegram Mini App', priceFrom: 65000, priceTo: 300000, days: 21, badge: '', active: true },
  { id: 's4', emoji: '✦', name: 'AI-агент', priceFrom: 150000, priceTo: 500000, days: 14, badge: 'ТОП', active: true },
];
const initPortfolio: PortfolioItem[] = [
  { id: 'w1', emoji: '🎙️', title: 'Голосовой AI-ассистент', cat: 'AI', result: '80% автоматизация', featured: true, active: true, bg: 'linear-gradient(135deg,#0a0a1a,#1a1035)' },
  { id: 'w2', emoji: '🚗', title: 'DA-Motors Mini App', cat: 'Mini App', result: '+80% заявок', featured: true, active: true, bg: 'linear-gradient(135deg,#1a0808,#2d1010)' },
  { id: 'w3', emoji: '🛡️', title: 'АВИС B2B сайт', cat: 'Сайты', result: '+200% заявок', featured: false, active: true, bg: 'linear-gradient(135deg,#0a1020,#152040)' },
  { id: 'w4', emoji: '🏦', title: 'Совкомбанк ролик', cat: 'Ролики', result: 'Корп. контент', featured: false, active: true, bg: 'linear-gradient(135deg,#0a1628,#1a3060)' },
  { id: 'w5', emoji: '🎓', title: 'ПОВУЗАМ EdTech', cat: 'Платформы', result: 'Фед. масштаб', featured: true, active: true, bg: 'linear-gradient(135deg,#0a1a0a,#153520)' },
  { id: 'w6', emoji: '🔍', title: 'Метод Малова', cat: 'Сайты', result: '+90% конверсия', featured: false, active: true, bg: 'linear-gradient(135deg,#1a0a05,#2d1a0a)' },
];

/* ═══════ SMALL COMPONENTS ═══════ */
const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button onClick={() => onChange(!value)} className="flex-shrink-0 rounded-full transition-colors duration-200" style={{ width: 40, height: 22, background: value ? '#00B341' : '#E0E0E0', padding: 2 }}>
    <div className="rounded-full bg-white transition-transform duration-200" style={{ width: 18, height: 18, transform: value ? 'translateX(18px)' : 'translateX(0)' }} />
  </button>
);

const Sheet = ({ children, onClose, height = '75dvh' }: { children: React.ReactNode; onClose: () => void; height?: string }) => (
  <>
    <motion.div className="fixed inset-0 z-40 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
    <motion.div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl overflow-y-auto" style={{ maxHeight: height }} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.3, ease }}>
      <div className="flex justify-center pt-3 pb-1"><div className="w-9 h-1 rounded-full bg-[#E0E0E0]" /></div>
      {children}
    </motion.div>
  </>
);

const PriorityDot = ({ p }: { p: string }) => {
  const c = p === 'high' ? '#FF3B30' : p === 'medium' ? '#FF9500' : '#00B341';
  return <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c }} />;
};

/* ═══════ MAIN ═══════ */
const AdminPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  usePageTitle('Admin – neeklo');

  /* PIN */
  const [adminUnlocked, setAdminUnlocked] = useState(() => sessionStorage.getItem('nk_admin') === '1');
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [pinValues, setPinValues] = useState(['', '', '', '']);
  const [pinShake, setPinShake] = useState(false);

  const handlePinInput = (idx: number, val: string) => {
    const v = val.replace(/\D/g, '').slice(-1);
    const next = [...pinValues];
    next[idx] = v;
    setPinValues(next);
    if (v && idx < 3) pinRefs.current[idx + 1]?.focus();
    const code = next.join('');
    if (code.length === 4) {
      if (code === '2626') {
        sessionStorage.setItem('nk_admin', '1');
        setAdminUnlocked(true);
      } else {
        setPinShake(true);
        setTimeout(() => { setPinShake(false); setPinValues(['', '', '', '']); pinRefs.current[0]?.focus(); }, 600);
      }
    }
  };

  /* DATA */
  const [leads, setLeads] = useState<Lead[]>(initLeads);
  const [projects, setProjects] = useState<Project[]>(initProjects);
  const [tasks, setTasks] = useState<Record<string, Task[]>>(initTasks);
  const [messages, setMessages] = useState<Record<string, Msg[]>>(initMessages);
  const [services, setServices] = useState<Service[]>(initServices);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(initPortfolio);

  /* UI STATE */
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedChat, setSelectedChat] = useState<{ type: string; id: string; name: string } | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [searchLeads, setSearchLeads] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editService, setEditService] = useState<Service | null>(null);
  const [editPortfolio, setEditPortfolio] = useState<PortfolioItem | null>(null);
  const [newTaskText, setNewTaskText] = useState<Record<string, string>>({});
  const [contentTab, setContentTab] = useState<'services' | 'works'>('services');
  const [showNewLead, setShowNewLead] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({ name: '', contact: '', source: 'Чат', service: '', budget: '', msg: '' });
  const [leadDetailTab, setLeadDetailTab] = useState<'details' | 'chat' | 'notes'>('details');
  const [projectDetailTab, setProjectDetailTab] = useState<'overview' | 'tasks' | 'chat' | 'edit'>('overview');
  const [leadNote, setLeadNote] = useState('');
  const [projectMenuId, setProjectMenuId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalUnread = useMemo(() => leads.reduce((a, l) => a + l.unread, 0), [leads]);

  const exportCSV = useCallback(() => {
    const headers = ['Имя', 'Контакт', 'Источник', 'Услуга', 'Статус', 'Время'];
    const rows = leads.map(l => [l.name, l.contact, l.source, l.service, statusConfig[l.status]?.label || l.status, l.time]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'leads.csv';
    a.click();
  }, [leads]);

  const sendMessage = useCallback((chatId: string, text: string) => {
    if (!text.trim()) return;
    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), { id: 'm' + Date.now(), from: 'manager', name: 'Никита', text: text.trim(), time: 'сейчас' }],
    }));
    setLeads(prev => prev.map(l => l.id === chatId ? { ...l, unread: 0 } : l));
    setChatInput('');
  }, []);

  const toggleTask = useCallback((projectId: string, taskId: string) => {
    setTasks(prev => {
      const updated = { ...prev };
      updated[projectId] = (updated[projectId] || []).map(t => t.id === taskId ? { ...t, done: !t.done } : t);
      const done = updated[projectId].filter(t => t.done).length;
      const total = updated[projectId].length;
      setProjects(pp => pp.map(p => p.id === projectId ? { ...p, progress: total ? Math.round(done / total * 100) : 0 } : p));
      return updated;
    });
  }, []);

  const conversations = useMemo(() => {
    const convs: { type: string; id: string; name: string; lastMsg: string; time: string; unread: number }[] = [];
    leads.forEach(l => {
      const msgs = messages[l.id] || [];
      const last = msgs[msgs.length - 1];
      convs.push({ type: 'lead', id: l.id, name: l.name, lastMsg: last?.text || l.msg, time: last?.time || l.time, unread: l.unread });
    });
    projects.forEach(p => {
      const msgs = messages[p.id] || [];
      if (msgs.length === 0) return;
      const last = msgs[msgs.length - 1];
      convs.push({ type: 'project', id: p.id, name: p.title, lastMsg: last?.text || '', time: last?.time || '', unread: 0 });
    });
    return convs;
  }, [leads, projects, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChat, selectedLead, leadDetailTab, projectDetailTab]);

  /* ═══════ PIN SCREEN ═══════ */
  if (!adminUnlocked) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: '#0D0D0B' }}>
        <div className="text-center">
          <p className="text-white mb-2" style={{ fontSize: 28 }}>✦</p>
          <p className="text-white mb-8" style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 20, fontWeight: 700 }}>neeklo admin</p>
          <div className={`flex gap-3 ${pinShake ? 'animate-shake' : ''}`}>
            {[0, 1, 2, 3].map(i => (
              <input
                key={i}
                ref={el => { pinRefs.current[i] = el; }}
                type="password"
                maxLength={1}
                value={pinValues[i]}
                onChange={e => handlePinInput(i, e.target.value)}
                onKeyDown={e => { if (e.key === 'Backspace' && !pinValues[i] && i > 0) pinRefs.current[i - 1]?.focus(); }}
                className="text-center text-white outline-none"
                style={{
                  width: 56, height: 60, fontFamily: "'Unbounded', sans-serif", fontSize: 22,
                  background: 'rgba(255,255,255,0.08)', border: pinShake ? '1px solid #FF3B30' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 16,
                }}
                autoFocus={i === 0}
              />
            ))}
          </div>
        </div>
        <p className="absolute bottom-6" style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>© 2026 neeklo</p>
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}.animate-shake{animation:shake 0.5s ease-in-out}`}</style>
      </div>
    );
  }

  /* ═══════ TABS CONFIG ═══════ */
  const desktopTabs = [
    { key: 'dashboard', icon: LayoutDashboard, label: 'Дашборд' },
    { key: 'leads', icon: Users2, label: 'Лиды' },
    { key: 'kanban', icon: Layers, label: 'Канбан' },
    { key: 'chats', icon: MessageCircle, label: 'Чаты' },
    { key: 'services', icon: Sparkles, label: 'Услуги' },
    { key: 'works', icon: Image, label: 'Работы' },
  ];
  const mobileTabs = [
    { key: 'dashboard', icon: LayoutDashboard, label: 'Главная' },
    { key: 'leads', icon: Users2, label: 'Лиды' },
    { key: 'kanban', icon: Layers, label: 'Канбан' },
    { key: 'chats', icon: MessageCircle, label: 'Чаты' },
    { key: 'content', icon: Settings2, label: 'Контент' },
  ];

  /* ═══════ FILTERED LEADS ═══════ */
  const filteredLeads = leads
    .filter(l => filterStatus === 'all' || l.status === filterStatus)
    .filter(l => l.name.toLowerCase().includes(searchLeads.toLowerCase()) || l.contact.toLowerCase().includes(searchLeads.toLowerCase()));




  /* ═══════ KANBAN COLUMNS ═══════ */
  const kanbanCols = ['briefing', 'in_progress', 'review', 'done', 'cancelled'];

  /* ═══════ RENDER DASHBOARD ═══════ */
  const renderDashboard = () => {
    const stats = [
      { icon: Users2, color: '#0052FF', bg: '#EEF3FF', label: 'Новых лидов', value: leads.filter(l => l.status === 'new').length, trend: '+2 сегодня' },
      { icon: FolderOpen, color: '#FF9500', bg: '#FFF8EE', label: 'Активных', value: projects.filter(p => p.status !== 'done' && p.status !== 'cancelled').length, trend: '2 в работе' },
      { icon: TrendingUp, color: '#00B341', bg: '#EEFBF3', label: 'Выручка', value: '₽' + projects.reduce((a, p) => a + p.paid, 0).toLocaleString('ru'), trend: 'этот месяц' },
      { icon: MessageCircle, color: '#8B5CF6', bg: '#F3F0FF', label: 'Сообщений', value: Object.values(messages).flat().filter(m => m.from === 'client').length, trend: 'непрочитанных: ' + totalUnread },
    ];
    return (
      <div className="p-5">
        <div className="flex items-baseline justify-between mb-6">
          <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 22, fontWeight: 800 }}>Дашборд</h1>
          <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 13, color: '#6A6860' }}>{new Date().toLocaleDateString('ru', { day: 'numeric', month: 'short' })}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease, delay: i * 0.05 }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: s.bg }}><Icon size={18} color={s.color} /></div>
                <p style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 26, fontWeight: 800 }}>{s.value}</p>
                <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 12, color: '#6A6860' }}>{s.label}</p>
                <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, color: '#00B341', marginTop: 2 }}>{s.trend}</p>
              </motion.div>
            );
          })}
        </div>

        {totalUnread > 0 && (
          <button onClick={() => setActiveTab('chats')} className="w-full flex items-center gap-3 mb-4 cursor-pointer" style={{ background: '#FFF8EE', border: '1px solid #FFD580', borderRadius: 16, padding: 12 }}>
            <Bell size={18} color="#FF9500" />
            <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, fontWeight: 600 }}>Есть непрочитанные сообщения</span>
            <span className="ml-auto" style={{ fontFamily: "'Onest', sans-serif", fontSize: 13, color: '#0052FF' }}>Открыть чаты →</span>
          </button>
        )}

        <div className="bg-white rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 15, fontWeight: 700 }}>Новые лиды</p>
            <button onClick={() => setActiveTab('leads')} className="cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 13, color: '#0052FF' }}>Все →</button>
          </div>
          {leads.filter(l => l.status === 'new').slice(0, 3).map(l => (
            <div key={l.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #F5F5F5' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: statusConfig[l.status]?.color }} />
                <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, fontWeight: 600 }}>{l.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full" style={{ fontFamily: "'Onest', sans-serif", fontSize: 10, padding: '2px 8px', background: (sourceColors[l.source] || '#888') + '15', color: sourceColors[l.source] || '#888' }}>{l.source}</span>
                <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, color: '#B0B0B0' }}>{l.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 15, fontWeight: 700 }}>Проекты</p>
            <button onClick={() => setActiveTab('kanban')} className="cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 13, color: '#0052FF' }}>Канбан →</button>
          </div>
          {projects.slice(0, 3).map(p => {
            const st = projectStatus[p.status] || { label: p.status, color: '#888' };
            return (
              <div key={p.id} className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid #F5F5F5' }}>
                <span style={{ fontSize: 18 }}>{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, fontWeight: 600 }}>{p.title}</p>
                  <div className="w-full h-1.5 rounded-full mt-1" style={{ background: '#F0F0F0' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: p.progress + '%', background: st.color }} />
                  </div>
                </div>
                <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, color: st.color, fontWeight: 600 }}>{p.progress}%</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ═══════ RENDER LEADS ═══════ */
  const renderLeads = () => (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 22, fontWeight: 800 }}>Лиды</h1>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 13, border: '1px solid #E0E0E0', borderRadius: 12, padding: '8px 12px' }}>
            <Download size={14} />Экспорт
          </button>
          <button onClick={() => setShowNewLead(true)} className="flex items-center gap-1.5 cursor-pointer text-white" style={{ fontFamily: "'Onest', sans-serif", fontSize: 13, fontWeight: 600, background: '#0D0D0B', borderRadius: 12, padding: '8px 16px' }}>
            <Plus size={14} />Лид
          </button>
        </div>
      </div>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#B0B0B0' }} />
        <input value={searchLeads} onChange={e => setSearchLeads(e.target.value)} placeholder="Поиск по имени или контакту..."
          className="w-full outline-none" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: 'white', border: '1px solid #F0F0F0', borderRadius: 12, padding: '10px 16px 10px 40px' }} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: 'none' }}>
        {[{ key: 'all', label: 'Все', count: leads.length }, ...Object.entries(statusConfig).map(([k, v]) => ({ key: k, label: v.label, count: leads.filter(l => l.status === k).length }))].map(f => (
          <button key={f.key} onClick={() => setFilterStatus(f.key)} className="flex-shrink-0 whitespace-nowrap cursor-pointer transition-colors"
            style={{
              fontFamily: "'Onest', sans-serif", fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 20,
              background: filterStatus === f.key ? '#0D0D0B' : 'transparent', color: filterStatus === f.key ? '#fff' : '#6A6860',
              border: filterStatus === f.key ? '1px solid #0D0D0B' : '1px solid #E0E0E0',
            }}>
            {f.label} · {f.count}
          </button>
        ))}
      </div>

      {filteredLeads.map((l, i) => (
        <motion.div key={l.id} onClick={() => { setSelectedLead(l); setLeadDetailTab('details'); setLeadNote(''); }}
          className="bg-white rounded-2xl p-4 mb-3 cursor-pointer transition-all hover:shadow-md"
          style={{ borderLeft: `4px solid ${statusConfig[l.status]?.border || '#E0E0E0'}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3, ease }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: statusConfig[l.status]?.color }} />
              <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 15, fontWeight: 600 }}>{l.name}</span>
              {l.unread > 0 && <span className="rounded-full text-white flex items-center justify-center" style={{ fontFamily: "'Onest', sans-serif", fontSize: 10, background: '#FF3B30', minWidth: 18, height: 18, padding: '0 5px' }}>{l.unread}</span>}
            </div>
            <span className="rounded-full" style={{ fontFamily: "'Onest', sans-serif", fontSize: 10, padding: '2px 8px', background: (sourceColors[l.source] || '#888') + '15', color: sourceColors[l.source] || '#888' }}>{l.source}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="rounded-full" style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, padding: '2px 8px', background: '#F5F5F5' }}>{l.service}</span>
            <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 13, color: '#0052FF', fontWeight: 600 }}>{l.budget}</span>
          </div>
          <p className="line-clamp-1 mt-1" style={{ fontFamily: "'Onest', sans-serif", fontSize: 13, color: '#6A6860' }}>{l.msg}</p>
          <div className="flex items-center justify-between mt-2">
            <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, color: '#B0B0B0' }}>{l.time}</span>
            <select value={l.status} onClick={e => e.stopPropagation()} onChange={e => { setLeads(prev => prev.map(ll => ll.id === l.id ? { ...ll, status: e.target.value } : ll)); toast('Статус обновлён'); }}
              className="cursor-pointer bg-transparent border-none outline-none" style={{ fontFamily: "'Onest', sans-serif", fontSize: 12, fontWeight: 600, color: statusConfig[l.status]?.color }}>
              {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </motion.div>
      ))}
    </div>
  );

  /* ═══════ RENDER LEAD DETAIL ═══════ */
  const renderLeadDetail = () => {
    if (!selectedLead) return null;
    const l = selectedLead;
    const contactBtns: { label: string; bg: string; icon: React.ReactNode; onClick: () => void }[] = [];
    if (l.contact.startsWith('@')) contactBtns.push({ label: 'Telegram', bg: '#2AABEE', icon: <Send size={14} />, onClick: () => window.open('https://t.me/' + l.contact.replace('@', '')) });
    if (l.contact.startsWith('+')) contactBtns.push({ label: 'Позвонить', bg: '#00B341', icon: <Phone size={14} />, onClick: () => { window.location.href = 'tel:' + l.contact; } });
    if (l.contact.includes('@') && !l.contact.startsWith('@')) contactBtns.push({ label: 'Email', bg: '#0D0D0B', icon: <Mail size={14} />, onClick: () => { window.location.href = 'mailto:' + l.contact; } });

    return (
      <Sheet onClose={() => setSelectedLead(null)} height="85dvh">
        <div className="px-5 pt-2 flex justify-between items-center">
          <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 18, fontWeight: 800 }}>{l.name}</h2>
          <button onClick={() => setSelectedLead(null)} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer" style={{ background: '#F5F5F5' }}><X size={18} /></button>
        </div>

        <div className="flex gap-3 mt-4 px-5">
          {contactBtns.map(b => (
            <button key={b.label} onClick={b.onClick} className="flex items-center gap-2 text-white cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, fontWeight: 600, background: b.bg, borderRadius: 12, padding: '10px 16px' }}>
              {b.icon}{b.label}
            </button>
          ))}
        </div>

        <div className="mx-5 mt-4 flex gap-0" style={{ borderBottom: '1px solid #F0F0F0' }}>
          {(['details', 'chat', 'notes'] as const).map(t => (
            <button key={t} onClick={() => setLeadDetailTab(t)} className="flex-1 py-3 cursor-pointer transition-colors" style={{
              fontFamily: "'Onest', sans-serif", fontSize: 13, fontWeight: 600,
              color: leadDetailTab === t ? '#0D0D0B' : '#888',
              borderBottom: leadDetailTab === t ? '2px solid #0D0D0B' : '2px solid transparent',
            }}>
              {t === 'details' ? 'Детали' : t === 'chat' ? 'Переписка' : 'Заметка'}
            </button>
          ))}
        </div>

        {leadDetailTab === 'details' && (
          <div className="px-5 py-4">
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'ИСТОЧНИК', value: l.source }, { label: 'УСЛУГА', value: l.service }, { label: 'БЮДЖЕТ', value: l.budget }, { label: 'ВРЕМЯ', value: l.time }].map(d => (
                <div key={d.label} className="rounded-xl p-3" style={{ background: '#F9F9F9' }}>
                  <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, color: '#B0B0B0', textTransform: 'uppercase' }}>{d.label}</p>
                  <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, fontWeight: 700 }}>{d.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-4 mt-3" style={{ background: '#F9F9F9' }}>
              <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, lineHeight: 1.65 }}>{l.msg}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(statusConfig).map(([k, v]) => (
                <button key={k} onClick={() => { setLeads(prev => prev.map(ll => ll.id === l.id ? { ...ll, status: k } : ll)); setSelectedLead({ ...l, status: k }); toast('Статус: ' + v.label); }}
                  className="cursor-pointer transition-colors" style={{
                    fontFamily: "'Onest', sans-serif", fontSize: 12, fontWeight: l.status === k ? 700 : 500, padding: '6px 12px', borderRadius: 20,
                    background: l.status === k ? v.bg : 'transparent', color: l.status === k ? v.color : '#888',
                    border: `1px solid ${l.status === k ? v.border : '#E0E0E0'}`,
                  }}>{v.label}</button>
              ))}
            </div>
          </div>
        )}

        {leadDetailTab === 'chat' && (
          <div className="px-5 py-4 flex flex-col" style={{ minHeight: 300 }}>
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(85dvh - 300px)' }}>
              {(messages[l.id] || []).map(m => (
                <div key={m.id} className={`flex ${m.from === 'manager' ? 'justify-end' : 'justify-start'}`}>
                  <div style={{
                    maxWidth: '75%', padding: '10px 16px', fontFamily: "'Onest', sans-serif", fontSize: 15,
                    background: m.from === 'manager' ? '#0D0D0B' : '#F0F0F0',
                    color: m.from === 'manager' ? 'white' : '#0D0D0B',
                    borderRadius: m.from === 'manager' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  }}>
                    {m.text}
                    <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, color: m.from === 'manager' ? 'rgba(255,255,255,0.5)' : '#B0B0B0', marginTop: 4 }}>{m.name} · {m.time}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2 mt-3">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(l.id, chatInput); } }}
                placeholder="Сообщение..." className="flex-1 outline-none" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }} />
              <button onClick={() => sendMessage(l.id, chatInput)} className="w-10 h-10 rounded-xl flex items-center justify-center text-white cursor-pointer" style={{ background: '#0D0D0B' }}><Send size={16} /></button>
            </div>
          </div>
        )}

        {leadDetailTab === 'notes' && (
          <div className="px-5 py-4">
            <textarea value={leadNote} onChange={e => setLeadNote(e.target.value)} rows={8} placeholder="Заметки по лиду, договорённости, следующие шаги..."
              className="w-full outline-none resize-none" style={{ fontFamily: "'Onest', sans-serif", fontSize: 15, background: '#F5F5F5', border: 'none', borderRadius: 16, padding: 16 }} />
          </div>
        )}

        <div className="sticky bottom-0 bg-white p-4 flex gap-3" style={{ borderTop: '1px solid #F0F0F0' }}>
          <button onClick={() => {
            setProjects(prev => [...prev, { id: 'p' + Date.now(), emoji: '✦', title: l.service + ' — ' + l.name, client: l.name, service: l.service, status: 'briefing', price: 0, paid: 0, deadline: '', progress: 0, manager: 'НК', notes: '' }]);
            setSelectedLead(null);
            setActiveTab('kanban');
            toast('Проект создан!');
          }} className="flex-1 text-white cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, fontWeight: 700, background: '#0D0D0B', borderRadius: 12, padding: 12 }}>
            Создать проект →
          </button>
          <button onClick={() => setSelectedLead(null)} className="cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, border: '1px solid #E0E0E0', borderRadius: 12, padding: '12px 16px' }}>Закрыть</button>
        </div>
      </Sheet>
    );
  };

  /* ═══════ RENDER KANBAN ═══════ */
  const renderKanban = () => (
    <div className="p-5">
      <h1 className="mb-4" style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 22, fontWeight: 800 }}>Проекты</h1>
      <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-4" style={{ minWidth: kanbanCols.length * 296 }}>
          {kanbanCols.map(colKey => {
            const col = projectStatus[colKey];
            if (!col) return null;
            const colProjects = projects.filter(p => p.status === colKey);
            return (
              <div key={colKey} className="flex flex-col" style={{ minWidth: 280, flex: '0 0 280px' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                    <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, fontWeight: 700 }}>{col.label}</span>
                    <span className="rounded-full" style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, padding: '1px 8px', background: '#F0F0F0' }}>{colProjects.length}</span>
                  </div>
                </div>
                <div className="flex-1 rounded-2xl p-2" style={{ background: 'rgba(0,0,0,0.02)', minHeight: 200 }}>
                  {colProjects.map(p => {
                    const pTasks = tasks[p.id] || [];
                    const done = pTasks.filter(t => t.done).length;
                    return (
                      <div key={p.id} className="bg-white rounded-2xl p-4 mb-3 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 relative"
                        style={{ border: '1px solid #F0F0F0' }} onClick={() => { setSelectedProject(p); setProjectDetailTab('overview'); }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span style={{ fontSize: 18 }}>{p.emoji}</span>
                          <span className="flex-1 truncate" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, fontWeight: 700 }}>{p.title}</span>
                          <button onClick={e => { e.stopPropagation(); setProjectMenuId(projectMenuId === p.id ? null : p.id); }} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F5F5F5] cursor-pointer">
                            <MoreVertical size={14} />
                          </button>
                        </div>
                        {projectMenuId === p.id && (
                          <div className="absolute right-4 top-12 bg-white rounded-xl shadow-lg z-10 py-1" style={{ border: '1px solid #F0F0F0', minWidth: 150 }} onClick={e => e.stopPropagation()}>
                            {Object.entries(projectStatus).filter(([k]) => k !== p.status && k !== 'cancelled').map(([k, v]) => (
                              <button key={k} onClick={() => { setProjects(prev => prev.map(pp => pp.id === p.id ? { ...pp, status: k } : pp)); setProjectMenuId(null); toast('Перемещено: ' + v.label); }}
                                className="w-full text-left px-3 py-2 hover:bg-[#F5F5F5] cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 13, color: v.color }}>{v.label}</button>
                            ))}
                            <div style={{ height: 1, background: '#F0F0F0', margin: '2px 0' }} />
                            <button onClick={() => { setProjects(prev => prev.filter(pp => pp.id !== p.id)); setProjectMenuId(null); toast('Проект удалён'); }}
                              className="w-full text-left px-3 py-2 hover:bg-[#FFF0EE] cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 13, color: '#FF3B30' }}>Удалить</button>
                          </div>
                        )}
                        <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 12, color: '#6A6860' }}>{p.client}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 13, fontWeight: 700, color: '#0052FF' }}>₽{p.price.toLocaleString('ru')}</span>
                          <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, color: '#B0B0B0' }}>{p.deadline}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full mt-2" style={{ background: '#F0F0F0' }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: p.progress + '%', background: col.color }} />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <CheckSquare size={12} color="#B0B0B0" />
                            <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, color: '#B0B0B0' }}>{done}/{pTasks.length}</span>
                          </div>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ background: '#0D0D0B', fontFamily: "'Onest', sans-serif", fontSize: 10 }}>{p.manager}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ═══════ RENDER PROJECT DETAIL ═══════ */
  const renderProjectDetail = () => {
    if (!selectedProject) return null;
    const p = selectedProject;
    const st = projectStatus[p.status] || { label: p.status, color: '#888' };
    const pTasks = tasks[p.id] || [];
    const done = pTasks.filter(t => t.done).length;

    const content = (
      <>
        <div className="px-5 pt-4 flex justify-between items-start">
          <div>
            <span style={{ fontSize: 32 }}>{p.emoji}</span>
            <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 18, fontWeight: 800, marginTop: 4 }}>{p.title}</h2>
            <span className="inline-block mt-1 rounded-full" style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, fontWeight: 600, padding: '3px 10px', background: st.color + '15', color: st.color }}>{st.label}</span>
          </div>
          <button onClick={() => setSelectedProject(null)} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer" style={{ background: '#F5F5F5' }}><X size={18} /></button>
        </div>

        <div className="mx-5 mt-4 flex gap-0" style={{ borderBottom: '1px solid #F0F0F0' }}>
          {(['overview', 'tasks', 'chat', 'edit'] as const).map(t => (
            <button key={t} onClick={() => setProjectDetailTab(t)} className="flex-1 py-3 cursor-pointer" style={{
              fontFamily: "'Onest', sans-serif", fontSize: 13, fontWeight: 600,
              color: projectDetailTab === t ? '#0D0D0B' : '#888',
              borderBottom: projectDetailTab === t ? '2px solid #0D0D0B' : '2px solid transparent',
            }}>
              {t === 'overview' ? 'Обзор' : t === 'tasks' ? 'Задачи' : t === 'chat' ? 'Чат' : 'Редактировать'}
            </button>
          ))}
        </div>

        {projectDetailTab === 'overview' && (
          <div className="px-5 py-4">
            <div className="w-full h-2 rounded-full mb-4" style={{ background: '#F0F0F0' }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: p.progress + '%', background: st.color }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'БЮДЖЕТ', value: '₽' + p.price.toLocaleString('ru') }, { label: 'ОПЛАЧЕНО', value: '₽' + p.paid.toLocaleString('ru') }, { label: 'ДЕДЛАЙН', value: p.deadline || '—' }, { label: 'ПРОГРЕСС', value: p.progress + '%' }].map(d => (
                <div key={d.label} className="rounded-xl p-3" style={{ background: '#F9F9F9' }}>
                  <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, color: '#B0B0B0', textTransform: 'uppercase' }}>{d.label}</p>
                  <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, fontWeight: 700 }}>{d.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-3 mt-3" style={{ background: '#F9F9F9' }}>
              <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, color: '#B0B0B0', textTransform: 'uppercase', marginBottom: 4 }}>ЗАМЕТКИ</p>
              <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 14 }}>{p.notes || '—'}</p>
            </div>
          </div>
        )}

        {projectDetailTab === 'tasks' && (
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, fontWeight: 600 }}>{done}/{pTasks.length} задач</span>
              <div className="flex-1 h-1.5 rounded-full" style={{ background: '#F0F0F0' }}>
                <div className="h-full rounded-full transition-all" style={{ width: pTasks.length ? (done / pTasks.length * 100) + '%' : '0%', background: '#0D0D0B' }} />
              </div>
            </div>
            {pTasks.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl mb-2" style={{ background: '#F9F9F9' }}>
                <button onClick={() => toggleTask(p.id, t.id)} className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 cursor-pointer"
                  style={{ background: t.done ? '#0D0D0B' : 'transparent', border: t.done ? 'none' : '2px solid #D0D0D0' }}>
                  {t.done && <span className="text-white" style={{ fontSize: 12 }}>✓</span>}
                </button>
                <span className="flex-1" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#B0B0B0' : '#0D0D0B' }}>{t.title}</span>
                <PriorityDot p={t.priority} />
                <button onClick={() => { setTasks(prev => { const u = { ...prev }; u[p.id] = (u[p.id] || []).filter(tt => tt.id !== t.id); return u; }); }} className="cursor-pointer hover:text-[#FF3B30]" style={{ color: '#D0D0D0' }}><Trash2 size={14} /></button>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input value={newTaskText[p.id] || ''} onChange={e => setNewTaskText(prev => ({ ...prev, [p.id]: e.target.value }))}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (newTaskText[p.id] || '').trim()) {
                    setTasks(prev => ({ ...prev, [p.id]: [...(prev[p.id] || []), { id: 't' + Date.now(), title: newTaskText[p.id].trim(), done: false, priority: 'medium' }] }));
                    setNewTaskText(prev => ({ ...prev, [p.id]: '' }));
                  }
                }}
                placeholder="Добавить задачу..." className="flex-1 outline-none" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F0F0F0', borderRadius: 12, padding: '10px 12px' }} />
              <button onClick={() => {
                if (!(newTaskText[p.id] || '').trim()) return;
                setTasks(prev => ({ ...prev, [p.id]: [...(prev[p.id] || []), { id: 't' + Date.now(), title: newTaskText[p.id].trim(), done: false, priority: 'medium' }] }));
                setNewTaskText(prev => ({ ...prev, [p.id]: '' }));
              }} className="w-9 h-9 rounded-xl flex items-center justify-center text-white cursor-pointer" style={{ background: '#0D0D0B' }}><Plus size={16} /></button>
            </div>
          </div>
        )}

        {projectDetailTab === 'chat' && (
          <div className="px-5 py-4 flex flex-col" style={{ minHeight: 250 }}>
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto" style={{ maxHeight: 300 }}>
              {(messages[p.id] || []).map(m => (
                <div key={m.id} className={`flex ${m.from === 'manager' ? 'justify-end' : 'justify-start'}`}>
                  <div style={{
                    maxWidth: '75%', padding: '10px 16px', fontFamily: "'Onest', sans-serif", fontSize: 15,
                    background: m.from === 'manager' ? '#0D0D0B' : '#F0F0F0',
                    color: m.from === 'manager' ? 'white' : '#0D0D0B',
                    borderRadius: m.from === 'manager' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  }}>
                    {m.text}
                    <p style={{ fontSize: 11, color: m.from === 'manager' ? 'rgba(255,255,255,0.5)' : '#B0B0B0', marginTop: 4 }}>{m.time}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2 mt-3">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(p.id, chatInput); } }}
                placeholder="Сообщение..." className="flex-1 outline-none" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }} />
              <button onClick={() => sendMessage(p.id, chatInput)} className="w-10 h-10 rounded-xl flex items-center justify-center text-white cursor-pointer" style={{ background: '#0D0D0B' }}><Send size={16} /></button>
            </div>
          </div>
        )}

        {projectDetailTab === 'edit' && (
          <div className="px-5 py-4 flex flex-col gap-4">
            {[
              { label: 'Название', key: 'title', type: 'text' },
              { label: 'Клиент', key: 'client', type: 'text' },
              { label: 'Дедлайн', key: 'deadline', type: 'text' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontFamily: "'Onest', sans-serif", fontSize: 12, color: '#6A6860', marginBottom: 4, display: 'block' }}>{f.label}</label>
                <input value={(p as any)[f.key]} onChange={e => { const v = e.target.value; setProjects(prev => prev.map(pp => pp.id === p.id ? { ...pp, [f.key]: v } : pp)); setSelectedProject({ ...p, [f.key]: v }); }}
                  className="w-full outline-none" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }} />
              </div>
            ))}
            <div>
              <label style={{ fontFamily: "'Onest', sans-serif", fontSize: 12, color: '#6A6860', marginBottom: 4, display: 'block' }}>Статус</label>
              <select value={p.status} onChange={e => { const v = e.target.value; setProjects(prev => prev.map(pp => pp.id === p.id ? { ...pp, status: v } : pp)); setSelectedProject({ ...p, status: v }); }}
                className="w-full outline-none cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }}>
                {Object.entries(projectStatus).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ fontFamily: "'Onest', sans-serif", fontSize: 12, color: '#6A6860', marginBottom: 4, display: 'block' }}>Цена</label>
                <input type="number" value={p.price} onChange={e => { const v = +e.target.value; setProjects(prev => prev.map(pp => pp.id === p.id ? { ...pp, price: v } : pp)); setSelectedProject({ ...p, price: v }); }}
                  className="w-full outline-none" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }} />
              </div>
              <div>
                <label style={{ fontFamily: "'Onest', sans-serif", fontSize: 12, color: '#6A6860', marginBottom: 4, display: 'block' }}>Оплачено</label>
                <input type="number" value={p.paid} onChange={e => { const v = +e.target.value; setProjects(prev => prev.map(pp => pp.id === p.id ? { ...pp, paid: v } : pp)); setSelectedProject({ ...p, paid: v }); }}
                  className="w-full outline-none" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }} />
              </div>
            </div>
            <div>
              <label style={{ fontFamily: "'Onest', sans-serif", fontSize: 12, color: '#6A6860', marginBottom: 4, display: 'block' }}>Заметки</label>
              <textarea value={p.notes} onChange={e => { const v = e.target.value; setProjects(prev => prev.map(pp => pp.id === p.id ? { ...pp, notes: v } : pp)); setSelectedProject({ ...p, notes: v }); }}
                rows={4} className="w-full outline-none resize-none" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }} />
            </div>
            <button onClick={() => { if (confirm('Удалить проект?')) { setProjects(prev => prev.filter(pp => pp.id !== p.id)); setSelectedProject(null); toast('Проект удалён'); } }}
              className="cursor-pointer mt-2" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, color: '#FF3B30' }}>Удалить проект</button>
          </div>
        )}
      </>
    );

    if (isMobile) {
      return <Sheet onClose={() => setSelectedProject(null)} height="88dvh">{content}</Sheet>;
    }
    return (
      <>
        <motion.div className="fixed inset-0 z-30 bg-black/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProject(null)} />
        <motion.div className="fixed right-0 z-40 bg-white overflow-y-auto" style={{ top: 52, bottom: 0, width: 400, borderLeft: '1px solid #F0F0F0', boxShadow: '-4px 0 24px rgba(0,0,0,0.08)' }}
          initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ duration: 0.3, ease }}>
          {content}
        </motion.div>
      </>
    );
  };

  /* ═══════ RENDER CHATS ═══════ */
  const renderChats = () => {
    const chatMsgs = selectedChat ? (messages[selectedChat.id] || []) : [];

    const listPanel = (
      <div className={`${isMobile && selectedChat ? 'hidden' : ''} overflow-y-auto`} style={{ width: isMobile ? '100%' : 320, borderRight: isMobile ? 'none' : '1px solid #F0F0F0', flexShrink: 0 }}>
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F0F0F0' }}>
          <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 18, fontWeight: 800 }}>Сообщения</h2>
          {totalUnread > 0 && <span className="rounded-full text-white flex items-center justify-center" style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, background: '#0D0D0B', minWidth: 20, height: 20, padding: '0 6px' }}>{totalUnread}</span>}
        </div>
        {conversations.map(c => (
          <button key={c.type + c.id} onClick={() => setSelectedChat({ type: c.type, id: c.id, name: c.name })}
            className="w-full flex items-center gap-3 p-4 cursor-pointer text-left transition-colors hover:bg-[#F9F9F9]"
            style={{ borderBottom: '1px solid #F5F5F5', background: selectedChat?.id === c.id ? '#F0F0F0' : 'transparent', borderLeft: selectedChat?.id === c.id ? '3px solid #0D0D0B' : '3px solid transparent' }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0D0D0B, #333)', fontFamily: "'Unbounded', sans-serif", fontSize: 15, color: 'white' }}>
              {c.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="truncate" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, fontWeight: 700 }}>{c.name}</span>
                <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, color: '#B0B0B0' }}>{c.time}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="rounded-full" style={{ fontFamily: "'Onest', sans-serif", fontSize: 10, padding: '1px 6px', background: c.type === 'lead' ? '#EEF3FF' : '#FFF8EE', color: c.type === 'lead' ? '#0052FF' : '#FF9500' }}>
                  {c.type === 'lead' ? 'Лид' : 'Проект'}
                </span>
                <span className="truncate" style={{ fontFamily: "'Onest', sans-serif", fontSize: 13, color: '#6A6860' }}>{c.lastMsg}</span>
              </div>
            </div>
            {c.unread > 0 && <span className="rounded-full text-white flex items-center justify-center flex-shrink-0" style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, background: '#FF3B30', minWidth: 20, height: 20, padding: '0 5px' }}>{c.unread}</span>}
          </button>
        ))}
      </div>
    );

    const chatPanel = (
      <div className={`flex flex-col flex-1 ${isMobile && !selectedChat ? 'hidden' : ''}`} style={{ minWidth: 0 }}>
        {!selectedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center" style={{ color: '#6A6860' }}>
            <span style={{ fontSize: 48 }}>💬</span>
            <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 16, fontWeight: 600, marginTop: 8 }}>Выберите диалог</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid #F0F0F0' }}>
              {isMobile && <button onClick={() => setSelectedChat(null)} className="cursor-pointer"><ArrowLeft size={20} /></button>}
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0D0D0B, #333)', fontFamily: "'Unbounded', sans-serif", fontSize: 14, color: 'white' }}>
                {selectedChat.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 15, fontWeight: 700 }}>{selectedChat.name}</p>
                <span className="rounded-full" style={{ fontFamily: "'Onest', sans-serif", fontSize: 10, padding: '1px 6px', background: selectedChat.type === 'lead' ? '#EEF3FF' : '#FFF8EE', color: selectedChat.type === 'lead' ? '#0052FF' : '#FF9500' }}>
                  {selectedChat.type === 'lead' ? 'Лид' : 'Проект'}
                </span>
              </div>
              <button onClick={() => setActiveTab(selectedChat.type === 'lead' ? 'leads' : 'kanban')} className="cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 12, color: '#0052FF' }}>Открыть в CRM →</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3" style={{ background: '#F9F9F9' }}>
              {chatMsgs.map(m => (
                <div key={m.id} className={`flex ${m.from === 'manager' ? 'justify-end' : 'justify-start'} items-end gap-2.5`}>
                  {m.from === 'client' && <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#E0E0E0', fontFamily: "'Onest', sans-serif", fontSize: 10 }}>{m.name.charAt(0)}</div>}
                  <div style={{
                    maxWidth: '75%', padding: '10px 16px', fontFamily: "'Onest', sans-serif", fontSize: 15,
                    background: m.from === 'manager' ? '#0D0D0B' : 'white',
                    color: m.from === 'manager' ? 'white' : '#0D0D0B',
                    border: m.from === 'client' ? '1px solid #F0F0F0' : 'none',
                    borderRadius: m.from === 'manager' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  }}>
                    {m.text}
                    <p style={{ fontSize: 11, color: m.from === 'manager' ? 'rgba(255,255,255,0.5)' : '#B0B0B0', marginTop: 4, textAlign: m.from === 'manager' ? 'right' : 'left' }}>
                      {m.time}{m.from === 'manager' && <span style={{ color: '#4dff91', marginLeft: 4 }}>✓✓</span>}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="px-4 py-3 flex gap-3 items-end" style={{ borderTop: '1px solid #F0F0F0', background: 'white' }}>
              <textarea value={chatInput} onChange={e => { setChatInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(selectedChat.id, chatInput); } }}
                placeholder="Сообщение..." rows={1} className="flex-1 outline-none resize-none"
                style={{ fontFamily: "'Onest', sans-serif", fontSize: 15, background: '#F5F4F0', border: '1px solid transparent', borderRadius: 16, padding: '12px 16px', minHeight: 44, maxHeight: 120 }} />
              <button onClick={() => sendMessage(selectedChat.id, chatInput)} className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer"
                style={{ background: chatInput.trim() ? '#0D0D0B' : '#F0F0F0', color: chatInput.trim() ? 'white' : '#B0B0B0' }}><Send size={18} /></button>
            </div>
          </>
        )}
      </div>
    );

    return (
      <div className="flex h-full" style={{ minHeight: 'calc(100dvh - 52px - 60px)' }}>
        {listPanel}
        {chatPanel}
      </div>
    );
  };

  /* ═══════ RENDER CONTENT (SERVICES + WORKS) ═══════ */
  const renderContent = () => (
    <div className="p-5">
      <div className="flex gap-0 mb-5 rounded-xl overflow-hidden" style={{ background: '#F0F0F0' }}>
        {(['services', 'works'] as const).map(t => (
          <button key={t} onClick={() => setContentTab(t)} className="flex-1 py-2.5 cursor-pointer transition-colors" style={{
            fontFamily: "'Onest', sans-serif", fontSize: 13, fontWeight: 600,
            background: contentTab === t ? '#0D0D0B' : 'transparent', color: contentTab === t ? 'white' : '#6A6860',
            borderRadius: contentTab === t ? 12 : 0,
          }}>
            {t === 'services' ? 'Услуги' : 'Работы'}
          </button>
        ))}
      </div>

      {contentTab === 'services' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 20, fontWeight: 800 }}>Услуги</h2>
            <button onClick={() => setEditService({ id: '', emoji: '', name: '', priceFrom: 0, priceTo: 0, days: 7, badge: '', active: true })} className="flex items-center gap-1.5 text-white cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 13, fontWeight: 600, background: '#0D0D0B', borderRadius: 12, padding: '8px 16px' }}>
              <Plus size={14} />Добавить
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {services.map(s => (
              <div key={s.id} className="bg-white rounded-2xl p-4 flex items-center gap-4">
                <span style={{ fontSize: 28 }}>{s.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 15, fontWeight: 700 }}>{s.name}</p>
                  <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 13, color: '#6A6860' }}>от {s.priceFrom.toLocaleString('ru')} ₽ · {s.days} дней</p>
                </div>
                {s.badge && <span className="rounded-full text-white" style={{ fontFamily: "'Onest', sans-serif", fontSize: 10, fontWeight: 700, background: '#0D0D0B', padding: '3px 8px' }}>{s.badge}</span>}
                <Toggle value={s.active} onChange={v => { setServices(prev => prev.map(ss => ss.id === s.id ? { ...ss, active: v } : ss)); toast(v ? 'Активировано' : 'Деактивировано'); }} />
                <button onClick={() => setEditService(s)} className="cursor-pointer" style={{ color: '#6A6860' }}><Pencil size={18} /></button>
              </div>
            ))}
          </div>
        </>
      )}

      {contentTab === 'works' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 20, fontWeight: 800 }}>Портфолио</h2>
            <button onClick={() => setEditPortfolio({ id: '', emoji: '', title: '', cat: '', result: '', featured: false, active: true, bg: 'linear-gradient(135deg,#0a0a1a,#1a1035)' })} className="flex items-center gap-1.5 text-white cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 13, fontWeight: 600, background: '#0D0D0B', borderRadius: 12, padding: '8px 16px' }}>
              <Plus size={14} />Добавить
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {portfolio.map(w => (
              <div key={w.id} className="bg-white rounded-xl overflow-hidden cursor-pointer">
                <div className="flex items-center justify-center" style={{ height: 72, background: w.bg }}><span style={{ fontSize: 28 }}>{w.emoji}</span></div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 10, color: '#6A6860' }}>{w.cat}</span>
                    <button onClick={() => { setPortfolio(prev => prev.map(ww => ww.id === w.id ? { ...ww, featured: !ww.featured } : ww)); }} className="cursor-pointer" style={{ fontSize: 14 }}>{w.featured ? '⭐' : '☆'}</button>
                  </div>
                  <p className="mt-1" style={{ fontFamily: "'Onest', sans-serif", fontSize: 13, fontWeight: 700 }}>{w.title}</p>
                  <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 12, color: '#0052FF' }}>{w.result}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Toggle value={w.active} onChange={v => { setPortfolio(prev => prev.map(ww => ww.id === w.id ? { ...ww, active: v } : ww)); }} />
                    <button onClick={() => setEditPortfolio(w)} className="cursor-pointer" style={{ color: '#6A6860' }}><Pencil size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  /* ═══════ EDIT SERVICE SHEET ═══════ */
  const renderEditService = () => {
    if (!editService) return null;
    const s = editService;
    const isNew = !s.id;
    return (
      <Sheet onClose={() => setEditService(null)} height="75dvh">
        <div className="px-5 pt-2 flex justify-between items-center mb-4">
          <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 18, fontWeight: 800 }}>{isNew ? 'Новая услуга' : 'Редактировать'}</h2>
          <button onClick={() => setEditService(null)} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer" style={{ background: '#F5F5F5' }}><X size={18} /></button>
        </div>
        <div className="px-5 pb-4 flex flex-col gap-4">
          <div className="flex gap-3">
            <input value={s.emoji} onChange={e => setEditService({ ...s, emoji: e.target.value })} className="text-center outline-none" style={{ width: 72, fontFamily: "'Onest', sans-serif", fontSize: 28, background: '#F5F5F5', borderRadius: 12, padding: 8 }} placeholder="🎯" />
            <input value={s.name} onChange={e => setEditService({ ...s, name: e.target.value })} placeholder="Название*" className="flex-1 outline-none" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={{ fontFamily: "'Onest', sans-serif", fontSize: 12, color: '#6A6860' }}>Цена от</label><input type="number" value={s.priceFrom} onChange={e => setEditService({ ...s, priceFrom: +e.target.value })} className="w-full outline-none mt-1" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }} /></div>
            <div><label style={{ fontFamily: "'Onest', sans-serif", fontSize: 12, color: '#6A6860' }}>Цена до</label><input type="number" value={s.priceTo} onChange={e => setEditService({ ...s, priceTo: +e.target.value })} className="w-full outline-none mt-1" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={{ fontFamily: "'Onest', sans-serif", fontSize: 12, color: '#6A6860' }}>Срок (дней)</label><input type="number" value={s.days} onChange={e => setEditService({ ...s, days: +e.target.value })} className="w-full outline-none mt-1" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }} /></div>
            <div><label style={{ fontFamily: "'Onest', sans-serif", fontSize: 12, color: '#6A6860' }}>Бейдж</label><input value={s.badge} onChange={e => setEditService({ ...s, badge: e.target.value })} className="w-full outline-none mt-1" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }} placeholder="ХИТ" /></div>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 14 }}>Активна</span>
            <Toggle value={s.active} onChange={v => setEditService({ ...s, active: v })} />
          </div>
          <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: '#F9F9F9' }}>
            <span style={{ fontSize: 28 }}>{s.emoji || '🎯'}</span>
            <div>
              <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, fontWeight: 700 }}>{s.name || 'Название'}</p>
              <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 13, color: '#0052FF' }}>от {s.priceFrom.toLocaleString('ru')} ₽</p>
            </div>
            {s.badge && <span className="ml-auto rounded-full text-white" style={{ fontFamily: "'Onest', sans-serif", fontSize: 10, fontWeight: 700, background: '#0D0D0B', padding: '3px 8px' }}>{s.badge}</span>}
          </div>
        </div>
        <div className="sticky bottom-0 bg-white p-4 flex gap-3" style={{ borderTop: '1px solid #F0F0F0' }}>
          <button onClick={() => {
            if (isNew) { setServices(prev => [...prev, { ...s, id: 's' + Date.now() }]); }
            else { setServices(prev => prev.map(ss => ss.id === s.id ? s : ss)); }
            setEditService(null); toast('✓ Сохранено');
          }} className="flex-1 text-white cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, fontWeight: 700, background: '#0D0D0B', borderRadius: 12, padding: 12 }}>Сохранить</button>
          {!isNew && <button onClick={() => { setServices(prev => prev.filter(ss => ss.id !== s.id)); setEditService(null); toast('Удалено'); }}
            className="cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, color: '#FF3B30', border: '1px solid #FFE0DE', borderRadius: 12, padding: '12px 16px' }}>Удалить</button>}
        </div>
      </Sheet>
    );
  };

  /* ═══════ EDIT PORTFOLIO SHEET ═══════ */
  const renderEditPortfolio = () => {
    if (!editPortfolio) return null;
    const w = editPortfolio;
    const isNew = !w.id;
    return (
      <Sheet onClose={() => setEditPortfolio(null)} height="75dvh">
        <div className="px-5 pt-2 flex justify-between items-center mb-4">
          <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 18, fontWeight: 800 }}>{isNew ? 'Новая работа' : 'Редактировать'}</h2>
          <button onClick={() => setEditPortfolio(null)} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer" style={{ background: '#F5F5F5' }}><X size={18} /></button>
        </div>
        <div className="px-5 pb-4 flex flex-col gap-4">
          <div className="flex gap-3">
            <input value={w.emoji} onChange={e => setEditPortfolio({ ...w, emoji: e.target.value })} className="text-center outline-none" style={{ width: 72, fontFamily: "'Onest', sans-serif", fontSize: 28, background: '#F5F5F5', borderRadius: 12, padding: 8 }} placeholder="🎯" />
            <input value={w.title} onChange={e => setEditPortfolio({ ...w, title: e.target.value })} placeholder="Название*" className="flex-1 outline-none" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }} />
          </div>
          <input value={w.cat} onChange={e => setEditPortfolio({ ...w, cat: e.target.value })} placeholder="Категория" className="outline-none" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }} />
          <input value={w.result} onChange={e => setEditPortfolio({ ...w, result: e.target.value })} placeholder="Результат" className="outline-none" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }} />
          <div className="flex items-center justify-between"><span style={{ fontFamily: "'Onest', sans-serif", fontSize: 14 }}>Featured</span><Toggle value={w.featured} onChange={v => setEditPortfolio({ ...w, featured: v })} /></div>
          <div className="flex items-center justify-between"><span style={{ fontFamily: "'Onest', sans-serif", fontSize: 14 }}>Активна</span><Toggle value={w.active} onChange={v => setEditPortfolio({ ...w, active: v })} /></div>
          <div className="rounded-2xl overflow-hidden" style={{ background: '#F9F9F9' }}>
            <div className="flex items-center justify-center" style={{ height: 80, background: w.bg }}><span style={{ fontSize: 32 }}>{w.emoji || '🎯'}</span></div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white p-4 flex gap-3" style={{ borderTop: '1px solid #F0F0F0' }}>
          <button onClick={() => {
            if (isNew) { setPortfolio(prev => [...prev, { ...w, id: 'w' + Date.now() }]); }
            else { setPortfolio(prev => prev.map(ww => ww.id === w.id ? w : ww)); }
            setEditPortfolio(null); toast('✓ Сохранено');
          }} className="flex-1 text-white cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, fontWeight: 700, background: '#0D0D0B', borderRadius: 12, padding: 12 }}>Сохранить</button>
          {!isNew && <button onClick={() => { setPortfolio(prev => prev.filter(ww => ww.id !== w.id)); setEditPortfolio(null); toast('Удалено'); }}
            className="cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, color: '#FF3B30', border: '1px solid #FFE0DE', borderRadius: 12, padding: '12px 16px' }}>Удалить</button>}
        </div>
      </Sheet>
    );
  };

  /* ═══════ NEW LEAD SHEET ═══════ */
  const renderNewLead = () => (
    <Sheet onClose={() => setShowNewLead(false)} height="60dvh">
      <div className="px-5 pt-2 flex justify-between items-center mb-4">
        <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 18, fontWeight: 800 }}>Новый лид</h2>
        <button onClick={() => setShowNewLead(false)} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer" style={{ background: '#F5F5F5' }}><X size={18} /></button>
      </div>
      <div className="px-5 pb-4 flex flex-col gap-3">
        <input value={newLeadForm.name} onChange={e => setNewLeadForm({ ...newLeadForm, name: e.target.value })} placeholder="Имя *" className="outline-none" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }} />
        <input value={newLeadForm.contact} onChange={e => setNewLeadForm({ ...newLeadForm, contact: e.target.value })} placeholder="Контакт" className="outline-none" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }} />
        <select value={newLeadForm.source} onChange={e => setNewLeadForm({ ...newLeadForm, source: e.target.value })} className="outline-none cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }}>
          {['Чат', 'Telegram', 'Avito', 'Сайт', 'Reels', 'VK'].map(s => <option key={s}>{s}</option>)}
        </select>
        <input value={newLeadForm.service} onChange={e => setNewLeadForm({ ...newLeadForm, service: e.target.value })} placeholder="Услуга" className="outline-none" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }} />
        <input value={newLeadForm.budget} onChange={e => setNewLeadForm({ ...newLeadForm, budget: e.target.value })} placeholder="Бюджет" className="outline-none" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }} />
        <textarea value={newLeadForm.msg} onChange={e => setNewLeadForm({ ...newLeadForm, msg: e.target.value })} placeholder="Сообщение" rows={3} className="outline-none resize-none" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, background: '#F5F5F5', borderRadius: 12, padding: '10px 16px' }} />
      </div>
      <div className="sticky bottom-0 bg-white p-4" style={{ borderTop: '1px solid #F0F0F0' }}>
        <button onClick={() => {
          if (!newLeadForm.name.trim()) { toast('Введите имя'); return; }
          setLeads(prev => [{ id: 'l' + Date.now(), ...newLeadForm, status: 'new', time: 'только что', unread: 0 }, ...prev]);
          setShowNewLead(false);
          setNewLeadForm({ name: '', contact: '', source: 'Чат', service: '', budget: '', msg: '' });
          toast('✓ Лид создан');
        }} className="w-full text-white cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, fontWeight: 700, background: '#0D0D0B', borderRadius: 12, padding: 12 }}>Сохранить</button>
      </div>
    </Sheet>
  );

  /* ═══════ MAIN RENDER ═══════ */
  const activeContent = activeTab === 'content' ? (contentTab === 'services' ? 'services' : 'works') : activeTab;

  return (
    <div className="flex" style={{ height: '100dvh', overflow: 'hidden' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="flex flex-col flex-shrink-0" style={{ width: 240, background: 'white', borderRight: '1px solid #F0F0F0' }}>
          <div className="px-5 py-4 flex items-center gap-2">
            <span className="text-white flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: 8, background: '#0D0D0B', fontSize: 12 }}>✦</span>
            <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 700 }}>admin</span>
            <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, color: '#B0B0B0', marginLeft: 4 }}>v2.0</span>
          </div>
          <nav className="flex-1 px-3 mt-1">
            {desktopTabs.map(t => {
              const Icon = t.icon;
              const active = t.key === activeTab || (activeTab === 'content' && (t.key === 'services' || t.key === 'works'));
              const isActive = t.key === activeTab || (t.key === 'services' && activeTab === 'content' && contentTab === 'services') || (t.key === 'works' && activeTab === 'content' && contentTab === 'works');
              return (
                <button key={t.key} onClick={() => {
                  if (t.key === 'services') { setActiveTab('content'); setContentTab('services'); }
                  else if (t.key === 'works') { setActiveTab('content'); setContentTab('works'); }
                  else setActiveTab(t.key);
                }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl cursor-pointer transition-colors text-left"
                  style={{ background: isActive ? '#0D0D0B' : 'transparent', color: isActive ? 'white' : '#6A6860' }}>
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                  <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 14, fontWeight: isActive ? 600 : 500 }}>{t.label}</span>
                </button>
              );
            })}
          </nav>
          <div style={{ height: 1, background: '#F0F0F0', margin: '0 20px' }} />
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #0D0D0B, #333)', fontFamily: "'Onest', sans-serif", fontSize: 11, fontWeight: 700 }}>НК</div>
            <div className="flex-1">
              <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 13, fontWeight: 600 }}>Никита К.</p>
              <button onClick={() => navigate('/')} className="cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 12, color: '#6A6860' }}>Выйти</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0" style={{ overflow: 'hidden' }}>
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 flex-shrink-0" style={{ height: 52, background: '#0D0D0B' }}>
          <div className="flex items-center gap-2">
            {isMobile && <>
              <span style={{ fontSize: 16, color: 'white' }}>✦</span>
              <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 14, fontWeight: 700, color: 'white' }}>neeklo admin</span>
            </>}
            {!isMobile && <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              {desktopTabs.find(t => t.key === activeTab)?.label || 'Контент'}
            </span>}
          </div>
          <div className="flex items-center gap-3">
            {totalUnread > 0 && <span className="rounded-full text-white" style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, background: '#FF3B30', padding: '2px 8px' }}>{totalUnread}</span>}
            <button onClick={() => navigate('/')} className="flex items-center gap-1 cursor-pointer" style={{ fontFamily: "'Onest', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '6px 12px' }}>← Сайт</button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ background: '#F5F5F7', paddingBottom: isMobile ? 80 : 0 }}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'leads' && renderLeads()}
          {activeTab === 'kanban' && renderKanban()}
          {activeTab === 'chats' && renderChats()}
          {activeTab === 'content' && renderContent()}
          {/* Desktop: services/works tabs mapped to content */}
        </div>

        {/* Mobile Bottom Tabs */}
        {isMobile && (
          <div className="flex-shrink-0 bg-white flex" style={{ height: 60, borderTop: '1px solid #F0F0F0', paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {mobileTabs.map(t => {
              const Icon = t.icon;
              const active = t.key === activeTab;
              return (
                <button key={t.key} onClick={() => setActiveTab(t.key)} className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer">
                  <Icon size={20} strokeWidth={active ? 2 : 1.5} color={active ? '#0D0D0B' : '#999'} />
                  <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 10, fontWeight: active ? 700 : 500, color: active ? '#0D0D0B' : '#999' }}>{t.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* OVERLAYS */}
      <AnimatePresence>
        {selectedLead && renderLeadDetail()}
        {selectedProject && renderProjectDetail()}
        {editService && renderEditService()}
        {editPortfolio && renderEditPortfolio()}
        {showNewLead && renderNewLead()}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;
