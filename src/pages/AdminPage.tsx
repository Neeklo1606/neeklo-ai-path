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
  ArrowUp, Copy, Star, AlertTriangle, Lightbulb, BookOpen, Clock, Shield,
  FileText, Zap,
} from "lucide-react";

/* ═══════ TYPES ═══════ */
interface Lead {
  id: string; num: string; name: string; contact: string; source: string; service: string;
  budget: number; prepaid: number; balance: number; deadline: string; daysLeft: number;
  status: string; manager: string; comment: string; unread: number;
}
interface Project {
  id: string; emoji: string; title: string; client: string; service: string;
  status: string; price: number; paid: number; deadline: string; progress: number;
  manager: string; notes: string;
}
interface Task { id: string; title: string; done: boolean; priority: 'high' | 'medium' | 'low'; }
interface Msg { id: string; from: 'client' | 'manager'; name: string; text: string; time: string; read?: boolean; }
interface Service {
  id: string; emoji: string; name: string; priceFrom: number; priceTo: number;
  days: number; badge: string; active: boolean;
}
interface PortfolioItem {
  id: string; emoji: string; title: string; cat: string; result: string;
  featured: boolean; active: boolean; bg: string;
}

/* ═══════ CONFIG ═══════ */
const leadStatusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  in_progress: { label: 'В работе', color: '#0052FF', bg: '#EEF3FF', border: '#0052FF' },
  done: { label: 'Завершён', color: '#00B341', bg: '#EEFBF3', border: '#00B341' },
  new: { label: 'Новый', color: '#888', bg: '#F5F5F5', border: '#E0E0E0' },
  cancelled: { label: 'Отменён', color: '#FF3B30', bg: '#FFF0EE', border: '#FF3B30' },
};
const projectStatus: Record<string, { label: string; color: string; border: string }> = {
  briefing: { label: 'Сбор брифа', color: '#6A6860', border: '#D4CFC6' },
  in_progress: { label: 'В работе', color: '#0052FF', border: '#0052FF' },
  review: { label: 'На проверке', color: '#FF9500', border: '#FF9500' },
  done: { label: 'Готово', color: '#00B341', border: '#00B341' },
  cancelled: { label: 'Отменено', color: '#FF3B30', border: '#FF3B30' },
};
const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];
const fmt = (n: number) => n.toLocaleString('ru') + ' ₽';

/* ═══════ INITIAL DATA ═══════ */
const initLeads: Lead[] = [
  {id:'l1',num:'001',name:'АННА (САБИНА)',contact:'Telegram',source:'Avito',service:'Видео',budget:15000,prepaid:7500,balance:7500,deadline:'15.04.26',daysLeft:13,status:'in_progress',manager:'Сабина',comment:'Ролик на ДР',unread:0},
  {id:'l2',num:'002',name:'@Tanychizh',contact:'@Tanychizh',source:'Avito',service:'Видео',budget:10000,prepaid:5000,balance:5000,deadline:'05.04.26',daysLeft:3,status:'in_progress',manager:'Данил',comment:'Ролик ВБ чехлы',unread:2},
  {id:'l3',num:'003',name:'@YiliyaP',contact:'@YiliyaP',source:'Avito',service:'Видео',budget:8000,prepaid:4000,balance:4000,deadline:'05.04.26',daysLeft:3,status:'in_progress',manager:'Марина',comment:'Ролик платок',unread:1},
  {id:'l4',num:'004',name:'АНИМАЦИЯ',contact:'Telegram',source:'Avito',service:'Видео',budget:15000,prepaid:5000,balance:10000,deadline:'02.04.26',daysLeft:0,status:'done',manager:'Сабина',comment:'Видео ДР',unread:0},
  {id:'l5',num:'005',name:'@svetaass',contact:'@svetaass',source:'Avito',service:'Фото',budget:7500,prepaid:3750,balance:3750,deadline:'05.04.26',daysLeft:0,status:'done',manager:'Марина',comment:'Фотографии',unread:0},
  {id:'l6',num:'006',name:'LIVEGRID',contact:'Игорь',source:'Avito',service:'Сайт',budget:350000,prepaid:250000,balance:100000,deadline:'03.04.26',daysLeft:1,status:'in_progress',manager:'Игорь',comment:'Направил фронт',unread:0},
  {id:'l7',num:'007',name:'Ольга (MAX)',contact:'+79608640046',source:'Avito',service:'Видео',budget:12000,prepaid:6000,balance:6000,deadline:'15.04.26',daysLeft:13,status:'in_progress',manager:'Данил',comment:'Видео выпускной',unread:0},
  {id:'l8',num:'008',name:'БОГДАН',contact:'Telegram',source:'Avito',service:'Видео',budget:15000,prepaid:7500,balance:7500,deadline:'07.04.26',daysLeft:5,status:'in_progress',manager:'Данил',comment:'Мультик, часть 01.04',unread:1},
  {id:'l9',num:'009',name:'АЛЕКСАНДР ВЫКУП',contact:'+79523299999',source:'Avito',service:'Видео',budget:15000,prepaid:7500,balance:7500,deadline:'09.04.26',daysLeft:7,status:'in_progress',manager:'Данил',comment:'Данил',unread:0},
];
const initProjects: Project[] = [
  { id:'p1',emoji:'🌐',title:'LIVEGRID сайт',client:'LIVEGRID',service:'Сайт',status:'in_progress',price:350000,paid:250000,deadline:'03 апр',progress:85,manager:'Игорь',notes:'Направил фронт' },
  { id:'p2',emoji:'🎬',title:'Ролик ВБ чехлы',client:'@Tanychizh',service:'Видео',status:'in_progress',price:10000,paid:5000,deadline:'05 апр',progress:60,manager:'Данил',notes:'В монтаже' },
  { id:'p3',emoji:'🎬',title:'Ролик платок',client:'@YiliyaP',service:'Видео',status:'in_progress',price:8000,paid:4000,deadline:'05 апр',progress:50,manager:'Марина',notes:'Генерация сцен' },
  { id:'p4',emoji:'🎬',title:'Ролик на ДР',client:'АННА (САБИНА)',service:'Видео',status:'in_progress',price:15000,paid:7500,deadline:'15 апр',progress:30,manager:'Сабина',notes:'Сценарий готов' },
  { id:'p5',emoji:'🎬',title:'Видео ДР',client:'АНИМАЦИЯ',service:'Видео',status:'done',price:15000,paid:5000,deadline:'02 апр',progress:100,manager:'Сабина',notes:'Сдан' },
  { id:'p6',emoji:'🎬',title:'Мультик',client:'БОГДАН',service:'Видео',status:'in_progress',price:15000,paid:7500,deadline:'07 апр',progress:40,manager:'Данил',notes:'Часть 01.04' },
];
const initTasks: Record<string, Task[]> = {
  p1: [{id:'t1',title:'Дизайн макетов',done:true,priority:'high'},{id:'t2',title:'Верстка',done:true,priority:'high'},{id:'t3',title:'Интеграция фильтров',done:true,priority:'medium'},{id:'t4',title:'SEO',done:false,priority:'low'},{id:'t5',title:'Тестирование',done:false,priority:'medium'}],
  p2: [{id:'t6',title:'Сценарий',done:true,priority:'high'},{id:'t7',title:'Генерация',done:true,priority:'high'},{id:'t8',title:'Монтаж',done:false,priority:'high'}],
  p3: [{id:'t9',title:'Сценарий',done:true,priority:'high'},{id:'t10',title:'Генерация',done:false,priority:'high'},{id:'t11',title:'Монтаж',done:false,priority:'medium'}],
  p4: [{id:'t12',title:'Сценарий',done:true,priority:'high'},{id:'t13',title:'Раскадровка',done:false,priority:'medium'},{id:'t14',title:'Генерация',done:false,priority:'high'}],
};
const initMessages: Record<string, Msg[]> = {
  l1: [{id:'m1',from:'client',name:'Анна',text:'Привет! Хочу ролик на день рождения мужу',time:'10:23',read:true},{id:'m2',from:'manager',name:'Сабина',text:'Привет! Отлично, давайте обсудим. Какой формат?',time:'10:30',read:true}],
  l2: [{id:'m3',from:'client',name:'@Tanychizh',text:'Нужен ролик для ВБ, чехлы для телефонов',time:'09:15'},{id:'m4',from:'client',name:'@Tanychizh',text:'Бюджет 10к, успеете к 5 апреля?',time:'09:16'}],
  l3: [{id:'m5',from:'client',name:'@YiliyaP',text:'Здравствуйте! Нужен видеоролик для платка',time:'вчера'}],
  l6: [{id:'m6',from:'client',name:'LIVEGRID',text:'Игорь, как там фронт?',time:'11:00',read:true},{id:'m7',from:'manager',name:'Игорь',text:'Направил, проверь на staging',time:'11:05',read:true}],
  l8: [{id:'m8',from:'client',name:'Богдан',text:'Когда будет первая часть мультика?',time:'14:00'}],
};
const initServices: Service[] = [
  {id:'s1',emoji:'🎬',name:'AI-ролики',priceFrom:25000,priceTo:150000,days:5,badge:'ХИТ',active:true},
  {id:'s2',emoji:'🌐',name:'Сайт под ключ',priceFrom:95000,priceTo:400000,days:14,badge:'',active:true},
  {id:'s3',emoji:'📱',name:'Telegram Mini App',priceFrom:65000,priceTo:300000,days:21,badge:'',active:true},
  {id:'s4',emoji:'✦',name:'AI-агент',priceFrom:150000,priceTo:500000,days:14,badge:'ТОП',active:true},
];
const initPortfolio: PortfolioItem[] = [
  {id:'w1',emoji:'🎙️',title:'Голосовой AI-ассистент',cat:'AI',result:'80% автоматизация',featured:true,active:true,bg:'linear-gradient(135deg,#0a0a1a,#1a1035)'},
  {id:'w2',emoji:'🚗',title:'DA-Motors Mini App',cat:'Mini App',result:'+80% заявок',featured:true,active:true,bg:'linear-gradient(135deg,#1a0808,#2d1010)'},
  {id:'w3',emoji:'🛡️',title:'АВИС B2B сайт',cat:'Сайты',result:'+200% заявок',featured:false,active:true,bg:'linear-gradient(135deg,#0a1020,#152040)'},
  {id:'w4',emoji:'🏦',title:'Совкомбанк ролик',cat:'Ролики',result:'Корп. контент',featured:false,active:true,bg:'linear-gradient(135deg,#0a1628,#1a3060)'},
];

/* ═══════ AGENT DATA ═══════ */
const agentData = {
  scripts: [
    {id:'s1',title:'Первый ответ (универсальный)',category:'Продажи',content:'Привет! 👋 Спасибо за обращение в neeklo.studio.\n\nМы делаем сайты, Telegram-боты, AI-агенты и видео.\n\nЧтобы я мог сразу сказать стоимость:\n1. Что именно нужно?\n2. Это для бизнеса?\n3. Есть ли дедлайн?\n\nОтвечу через 5-10 минут ✌️'},
    {id:'s2',title:'Ответ тёплому B2B',category:'Продажи',content:'Добрый день! Изучил ваш запрос — это именно наш профиль.\n\nМы специализируемся на [запрос клиента].\nДелали похожее для [тип бизнеса].\n\nПредлагаю созвониться на 20 минут.\nУдобно в 14:00 или 16:00? 📞'},
    {id:'s3',title:'Follow-up после КП',category:'Дожим',content:'[Имя], добрый день!\n\nОтправил расчёт [дата] — хотел уточнить, получили?\nМожет быть, остались вопросы?\n\nГотов обсудить 🙂'},
    {id:'s4',title:'Реактивация базы',category:'Дожим',content:'[Имя], привет! Мы общались [месяц] по поводу [тема].\n\nПоявились новые кейсы именно по вашей теме.\nЕсли задача ещё актуальна — давайте обсудим?\n\nБуду рад помочь 🙌'},
    {id:'s5',title:'Допродажа после проекта',category:'Удержание',content:'[Имя], добрый день!\n\nПрошло [X недель] с запуска [проекта]. Как всё работает?\n\nЕсть логичный следующий шаг — [продукт].\nЭто даст [результат].\n\nГотов обсудить — удобно на этой неделе?'},
  ],
  sla: [
    {metric:'Первый ответ',norm:'≤ 15 мин',warning:'15-30 мин',critical:'> 30 мин'},
    {metric:'Квалификация',norm:'≤ 4 часа',warning:'4-8 часов',critical:'> 8 часов'},
    {metric:'Отправка КП',norm:'≤ 48 часов',warning:'48-72 часа',critical:'> 72 часов'},
    {metric:'Follow-up',norm:'24ч после КП',warning:'24-48ч',critical:'> 48ч'},
  ],
  products: [
    {name:'AI-ролики',from:25000,to:150000,days:5,desc:'Runway, Kling, Sora. Сценарий + генерация + монтаж + озвучка.'},
    {name:'Сайт под ключ',from:95000,to:400000,days:14,desc:'Дизайн + верстка React/Lovable + SEO + аналитика.'},
    {name:'Telegram Mini App',from:65000,to:300000,days:21,desc:'UI/UX + frontend + backend + оплата Stars/ЮKassa.'},
    {name:'AI-агент',from:150000,to:500000,days:14,desc:'GPT-4 + сценарии + CRM-интеграция + аналитика.'},
    {name:'Лендинг',from:35000,to:120000,days:7,desc:'Прототип за 2 дня + адаптив + форма + CRM.'},
    {name:'Автоматизация',from:60000,to:300000,days:14,desc:'n8n/Make + API-связки + CRM-интеграции.'},
  ],
  company: {
    name:'neeklo.studio',legal:'ИП Клочко Н.Н. · ИНН 263520430560',email:'neeklostudio@gmail.com',
    telegram:'@neeekn',about:'AI-продакшн студия. Делаем сайты, Mini App, AI-агентов и видео. Работаем удалённо. Команда: Никита (CEO), Игорь (разработка), Данил (PM/контент), Марина/Сабина (видео).',
    process:['Бриф (1-2 дня)','КП + предоплата 50%','Разработка','Сдача + остаток 50%','Поддержка 1 мес'],
  },
};

const tips = [
  'Ответ в первые 15 минут повышает конверсию на 391%',
  'После отправки КП сделай follow-up через 24 часа',
  'Реактивируй старую базу — напиши 5 клиентам из архива',
  'Допродажа клиенту стоит в 7 раз дешевле привлечения нового',
  'Проверяй дедлайны каждое утро — срочные заказы требуют внимания',
];

/* ═══════ SMALL COMPONENTS ═══════ */
const Toggle = ({value,onChange}:{value:boolean;onChange:(v:boolean)=>void}) => (
  <button onClick={()=>onChange(!value)} className="flex-shrink-0 rounded-full transition-colors duration-200 active:scale-95" style={{width:40,height:22,background:value?'#00B341':'#E0E0E0',padding:2}}>
    <div className="rounded-full bg-white transition-transform duration-200" style={{width:18,height:18,transform:value?'translateX(18px)':'translateX(0)'}} />
  </button>
);

const Sheet = ({children,onClose,height='75dvh'}:{children:React.ReactNode;onClose:()=>void;height?:string}) => (
  <>
    <motion.div className="fixed inset-0 z-40" style={{background:'rgba(0,0,0,0.3)',backdropFilter:'blur(4px)'}} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} />
    <motion.div className="fixed inset-x-0 bottom-0 z-50 bg-white overflow-y-auto" style={{maxHeight:height,borderRadius:'28px 28px 0 0'}} initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} transition={{duration:0.3,ease}}>
      <div className="flex justify-center pt-3 pb-1"><div className="w-9 h-1 rounded-full bg-[#E0E0E0]" /></div>
      {children}
    </motion.div>
  </>
);

const PriorityDot = ({p}:{p:string}) => {
  const c = p==='high'?'#FF3B30':p==='medium'?'#FF9500':'#00B341';
  return <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:c}} />;
};

const DaysBadge = ({days,status}:{days:number;status:string}) => {
  if(status==='done') return <span className="rounded-full px-2 py-0.5" style={{fontSize:11,fontWeight:600,background:'#EEFBF3',color:'#00B341'}}>✓ готов</span>;
  if(days<=0) return <span className="rounded-full px-2 py-0.5" style={{fontSize:11,fontWeight:600,background:'#FFE8E8',color:'#FF3B30'}}>🔴 просрочен</span>;
  if(days<=3) return <span className="rounded-full px-2 py-0.5" style={{fontSize:11,fontWeight:600,background:'#FFF8EE',color:'#FF9500'}}>⚡ {days} дн</span>;
  return <span className="rounded-full px-2 py-0.5" style={{fontSize:11,fontWeight:600,background:'#F5F5F5',color:'#6A6860'}}>{days} дн</span>;
};

const ManagerAvatar = ({name,size=24}:{name:string;size?:number}) => {
  const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  return <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{width:size,height:size,background:'#E0E0E0',fontSize:size*0.42,fontWeight:700,color:'#6A6860'}}>{initials}</div>;
};

/* ═══════ MAIN ═══════ */
const AdminPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  usePageTitle('Admin – neeklo');

  /* PIN */
  const [adminUnlocked,setAdminUnlocked] = useState(()=>sessionStorage.getItem('nk_admin')==='1');
  const pinRefs = useRef<(HTMLInputElement|null)[]>([]);
  const [pinValues,setPinValues] = useState(['','','','']);
  const [pinShake,setPinShake] = useState(false);
  const handlePinInput = (idx:number,val:string) => {
    const v = val.replace(/\D/g,'').slice(-1);
    const next = [...pinValues]; next[idx]=v; setPinValues(next);
    if(v&&idx<3) pinRefs.current[idx+1]?.focus();
    const code = next.join('');
    if(code.length===4){ if(code==='2626'){sessionStorage.setItem('nk_admin','1');setAdminUnlocked(true);} else {setPinShake(true);setTimeout(()=>{setPinShake(false);setPinValues(['','','','']);pinRefs.current[0]?.focus();},600);}}
  };

  /* DATA */
  const [leads,setLeads] = useState<Lead[]>(initLeads);
  const [projects,setProjects] = useState<Project[]>(initProjects);
  const [tasks,setTasks] = useState<Record<string,Task[]>>(initTasks);
  const [messages,setMessages] = useState<Record<string,Msg[]>>(initMessages);
  const [services,setServices] = useState<Service[]>(initServices);
  const [portfolio,setPortfolio] = useState<PortfolioItem[]>(initPortfolio);

  /* UI STATE */
  const [activeTab,setActiveTab] = useState<string>('dashboard');
  const [selectedLead,setSelectedLead] = useState<Lead|null>(null);
  const [selectedProject,setSelectedProject] = useState<Project|null>(null);
  const [openChat,setOpenChat] = useState<{id:string;name:string}|null>(null);
  const [chatInput,setChatInput] = useState('');
  const [searchLeads,setSearchLeads] = useState('');
  const [filterStatus,setFilterStatus] = useState('all');
  const [editService,setEditService] = useState<Service|null>(null);
  const [editPortfolio,setEditPortfolio] = useState<PortfolioItem|null>(null);
  const [newTaskText,setNewTaskText] = useState<Record<string,string>>({});
  const [contentTab,setContentTab] = useState<'services'|'works'|'agent'>('services');
  const [showNewLead,setShowNewLead] = useState(false);
  const [newLeadForm,setNewLeadForm] = useState({name:'',contact:'',source:'Avito',service:'',budget:'',msg:''});
  const [leadDetailTab,setLeadDetailTab] = useState<'details'|'chat'|'notes'>('details');
  const [projectDetailTab,setProjectDetailTab] = useState<'overview'|'tasks'|'chat'|'edit'>('overview');
  const [leadNote,setLeadNote] = useState('');
  const [projectMenuId,setProjectMenuId] = useState<string|null>(null);
  const [leadsView,setLeadsView] = useState<'cards'|'table'>('cards');
  const [agentSubTab,setAgentSubTab] = useState<'scripts'|'sla'|'products'|'company'>('scripts');
  const [scriptFilter,setScriptFilter] = useState('Все');
  const [showQuickActions,setShowQuickActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const totalUnread = useMemo(()=>leads.reduce((a,l)=>a+l.unread,0),[leads]);

  const exportCSV = useCallback(()=>{
    const headers = ['№','Клиент','Услуга','Бюджет','Предоплата','Остаток','Дедлайн','Менеджер','Статус'];
    const rows = leads.map(l=>[l.num,l.name,l.service,l.budget,l.prepaid,l.balance,l.deadline,l.manager,leadStatusConfig[l.status]?.label||l.status]);
    const csv = [headers,...rows].map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='leads.csv'; a.click();
  },[leads]);

  const sendMessage = useCallback((chatId:string,text:string)=>{
    if(!text.trim()) return;
    setMessages(prev=>({...prev,[chatId]:[...(prev[chatId]||[]),{id:'m'+Date.now(),from:'manager',name:'Никита',text:text.trim(),time:new Date().toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'}),read:true}]}));
    setLeads(prev=>prev.map(l=>l.id===chatId?{...l,unread:0}:l));
    setChatInput('');
    if(textareaRef.current){textareaRef.current.style.height='40px';}
  },[]);

  const toggleTask = useCallback((projectId:string,taskId:string)=>{
    setTasks(prev=>{
      const updated={...prev};
      updated[projectId]=(updated[projectId]||[]).map(t=>t.id===taskId?{...t,done:!t.done}:t);
      const done=updated[projectId].filter(t=>t.done).length;
      const total=updated[projectId].length;
      setProjects(pp=>pp.map(p=>p.id===projectId?{...p,progress:total?Math.round(done/total*100):0}:p));
      return updated;
    });
  },[]);

  const conversations = useMemo(()=>{
    return leads.map(l=>{
      const msgs=messages[l.id]||[];
      const last=msgs[msgs.length-1];
      return {id:l.id,name:l.name,lastMsg:last?.text||l.comment,time:last?.time||'',unread:l.unread};
    });
  },[leads,messages]);

  useEffect(()=>{messagesEndRef.current?.scrollIntoView({behavior:'smooth'});},[messages,openChat]);

  /* ═══════ PIN SCREEN ═══════ */
  if(!adminUnlocked){
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center" style={{background:'#0D0D0B'}}>
        <div className="text-center">
          <p className="text-white mb-2" style={{fontSize:28}}>✦</p>
          <p className="text-white mb-8" style={{fontFamily:"'Unbounded',sans-serif",fontSize:20,fontWeight:700}}>neeklo admin</p>
          <div className={`flex flex-row gap-3 justify-center ${pinShake?'animate-shake':''}`}>
            {[0,1,2,3].map(i=>(
              <input key={i} ref={el=>{pinRefs.current[i]=el;}} type="password" maxLength={1} value={pinValues[i]}
                onChange={e=>handlePinInput(i,e.target.value)}
                onKeyDown={e=>{if(e.key==='Backspace'&&!pinValues[i]&&i>0)pinRefs.current[i-1]?.focus();}}
                className="text-center text-white outline-none"
                style={{width:56,height:60,fontFamily:"'Unbounded',sans-serif",fontSize:22,background:'rgba(255,255,255,0.08)',border:pinShake?'1px solid #FF3B30':'1px solid rgba(255,255,255,0.15)',borderRadius:16}}
                autoFocus={i===0} />
            ))}
          </div>
        </div>
        <p className="absolute bottom-6" style={{fontFamily:"'Onest',sans-serif",fontSize:11,color:'rgba(255,255,255,0.2)'}}>© 2026 neeklo</p>
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}.animate-shake{animation:shake 0.5s ease-in-out}`}</style>
      </div>
    );
  }

  /* ═══════ TABS CONFIG ═══════ */
  const desktopTabs = [
    {key:'dashboard',icon:LayoutDashboard,label:'Дашборд'},
    {key:'leads',icon:Users2,label:'Лиды'},
    {key:'kanban',icon:Layers,label:'Канбан'},
    {key:'chats',icon:MessageCircle,label:'Чаты'},
    {key:'services',icon:Sparkles,label:'Услуги'},
    {key:'works',icon:Image,label:'Работы'},
  ];
  const mobileTabs = [
    {key:'dashboard',icon:LayoutDashboard,label:'Главная'},
    {key:'leads',icon:Users2,label:'Лиды'},
    {key:'kanban',icon:Layers,label:'Канбан'},
    {key:'chats',icon:MessageCircle,label:'Чаты'},
    {key:'content',icon:Settings2,label:'Контент'},
  ];

  const filteredLeads = leads
    .filter(l=>filterStatus==='all'||l.status===filterStatus)
    .filter(l=>l.name.toLowerCase().includes(searchLeads.toLowerCase())||l.contact.toLowerCase().includes(searchLeads.toLowerCase()));

  const kanbanCols = ['briefing','in_progress','review','done','cancelled'];
  const urgentLeads = leads.filter(l=>l.daysLeft<=1&&l.status==='in_progress');
  const managers = ['Данил','Марина','Сабина','Игорь','Никита'];
  const managerCounts = managers.map(m=>({name:m,count:leads.filter(l=>l.manager===m).length}));
  const maxCount = Math.max(...managerCounts.map(m=>m.count),1);
  const topManager = managerCounts.reduce((a,b)=>b.count>a.count?b:a,managerCounts[0]);
  const tipOfDay = tips[new Date().getDay()%tips.length];
  const urgentTipText = leads.filter(l=>l.daysLeft<=3&&l.status==='in_progress').length;

  /* ═══════ RENDER DASHBOARD ═══════ */
  const renderDashboard = () => {
    const stats = [
      {icon:Users2,color:'#0052FF',bg:'#EEF3FF',label:'Активных заказов',value:leads.filter(l=>l.status==='in_progress').length,trend:`${leads.filter(l=>l.daysLeft<=3&&l.status==='in_progress').length} срочных`},
      {icon:FolderOpen,color:'#FF9500',bg:'#FFF8EE',label:'Проектов',value:projects.filter(p=>p.status!=='done'&&p.status!=='cancelled').length,trend:'в работе'},
      {icon:TrendingUp,color:'#00B341',bg:'#EEFBF3',label:'Выручка',value:leads.reduce((a,l)=>a+l.prepaid,0).toLocaleString('ru')+' ₽',trend:'получено'},
      {icon:MessageCircle,color:'#8B5CF6',bg:'#F3F0FF',label:'Непрочитанных',value:totalUnread,trend:totalUnread>0?'ответить!':'всё ок'},
    ];
    return (
      <div className="p-5 overflow-x-hidden">
        <div className="flex items-baseline justify-between mb-6">
          <h1 style={{fontFamily:"'Unbounded',sans-serif",fontSize:22,fontWeight:800}}>Дашборд</h1>
          <span style={{fontFamily:"'Onest',sans-serif",fontSize:13,color:'#6A6860'}}>{new Date().toLocaleDateString('ru',{day:'numeric',month:'short'})}</span>
        </div>

        {/* Urgent alerts */}
        {urgentLeads.length>0&&(
          <motion.div className="mb-4 cursor-pointer active:scale-[0.98]" style={{background:'#FFF0EE',border:'1px solid #FFCCCC',borderRadius:16,padding:12}}
            initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} onClick={()=>{setActiveTab('leads');setFilterStatus('all');}}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} color="#FF3B30" />
              <span style={{fontFamily:"'Onest',sans-serif",fontSize:14,fontWeight:600,color:'#FF3B30'}}>🔴 Горящие дедлайны: {urgentLeads.map(l=>l.name).join(', ')}</span>
              <span className="ml-auto" style={{fontFamily:"'Onest',sans-serif",fontSize:13,color:'#FF3B30'}}>Открыть →</span>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((s,i)=>{
            const Icon=s.icon;
            return (
              <motion.div key={s.label} className="rounded-2xl p-4 active:scale-[0.97] transition-transform" style={{background:'linear-gradient(145deg,white 0%,#FAFAFA 100%)',border:'1px solid rgba(0,0,0,0.06)',boxShadow:'0 1px 3px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.04)'}}
                initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.35,ease,delay:i*0.05}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{background:s.bg}}><Icon size={18} color={s.color} /></div>
                <p style={{fontFamily:"'Unbounded',sans-serif",fontSize:26,fontWeight:800}}>{s.value}</p>
                <p style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#6A6860'}}>{s.label}</p>
                <p style={{fontFamily:"'Onest',sans-serif",fontSize:11,color:'#00B341',marginTop:2}}>{s.trend}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Manager status */}
        <div className="rounded-2xl p-4 mb-4" style={{background:'linear-gradient(145deg,white 0%,#FAFAFA 100%)',border:'1px solid rgba(0,0,0,0.06)',boxShadow:'0 1px 3px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.04)'}}>
          <p className="mb-3" style={{fontFamily:"'Onest',sans-serif",fontSize:15,fontWeight:700}}>Статус команды</p>
          <div className="flex flex-col gap-3">
            {managerCounts.map(m=>(
              <div key={m.name} className="flex items-center gap-3">
                <ManagerAvatar name={m.name} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span style={{fontFamily:"'Onest',sans-serif",fontSize:14,fontWeight:600}}>{m.name}</span>
                    {m.name===topManager.name&&<span style={{fontSize:14}}>⭐</span>}
                    <span className="ml-auto" style={{fontFamily:"'Onest',sans-serif",fontSize:13,color:'#6A6860'}}>{m.count} заказов</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full mt-1" style={{background:'#F0F0F0'}}>
                    <div className="h-full rounded-full transition-all duration-700" style={{width:(m.count/maxCount*100)+'%',background:'#0D0D0B'}} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tip of the day */}
        <div className="rounded-2xl p-4" style={{background:'#F0EEE8'}}>
          <div className="flex items-start gap-3">
            <Lightbulb size={18} color="#FF9500" className="flex-shrink-0 mt-0.5" />
            <div>
              <p style={{fontFamily:"'Onest',sans-serif",fontSize:13,fontWeight:700,color:'#6A6860',marginBottom:4}}>💡 Совет дня</p>
              <p style={{fontFamily:"'Onest',sans-serif",fontSize:14,color:'#0D0D0B',lineHeight:1.5}}>
                {urgentTipText>0?`У тебя ${urgentTipText} заказа(ов) с дедлайном через 3 дня — проверь статус`:tipOfDay}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════ RENDER LEADS ═══════ */
  const renderLeads = () => {
    const totals = {budget:filteredLeads.reduce((a,l)=>a+l.budget,0),prepaid:filteredLeads.reduce((a,l)=>a+l.prepaid,0),balance:filteredLeads.reduce((a,l)=>a+l.balance,0)};
    const inProgressCount = filteredLeads.filter(l=>l.status==='in_progress').length;
    const doneCount = filteredLeads.filter(l=>l.status==='done').length;

    return (
      <div className="p-5 overflow-x-hidden">
        <div className="flex items-center justify-between mb-4">
          <h1 style={{fontFamily:"'Unbounded',sans-serif",fontSize:22,fontWeight:800}}>Лиды</h1>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="flex items-center gap-1.5 cursor-pointer active:scale-[0.96] transition-transform" style={{fontFamily:"'Onest',sans-serif",fontSize:13,border:'1px solid #E0E0E0',borderRadius:12,padding:'8px 12px'}}><Download size={14} />CSV</button>
            <button onClick={()=>setShowNewLead(true)} className="flex items-center gap-1.5 cursor-pointer text-white active:scale-[0.96] transition-transform" style={{fontFamily:"'Onest',sans-serif",fontSize:13,fontWeight:600,background:'#0D0D0B',borderRadius:12,padding:'8px 16px'}}><Plus size={14} />Лид</button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{color:'#B0B0B0'}} />
          <input value={searchLeads} onChange={e=>setSearchLeads(e.target.value)} placeholder="Поиск..." className="w-full outline-none" style={{fontFamily:"'Onest',sans-serif",fontSize:14,background:'white',border:'1px solid #F0F0F0',borderRadius:12,padding:'10px 16px 10px 40px'}} />
        </div>

        {/* Filters + View switcher */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-2 overflow-x-auto flex-1" style={{scrollbarWidth:'none'}}>
            {[{key:'all',label:'Все',count:leads.length},...Object.entries(leadStatusConfig).map(([k,v])=>({key:k,label:v.label,count:leads.filter(l=>l.status===k).length}))].map(f=>(
              <button key={f.key} onClick={()=>setFilterStatus(f.key)} className="flex-shrink-0 whitespace-nowrap cursor-pointer transition-colors active:scale-[0.96]"
                style={{fontFamily:"'Onest',sans-serif",fontSize:12,fontWeight:600,padding:'6px 12px',borderRadius:20,background:filterStatus===f.key?'#0D0D0B':'transparent',color:filterStatus===f.key?'#fff':'#6A6860',border:filterStatus===f.key?'1px solid #0D0D0B':'1px solid #E0E0E0'}}>
                {f.label} · {f.count}
              </button>
            ))}
          </div>
          {/* View switcher */}
          <div className="flex rounded-xl overflow-hidden flex-shrink-0" style={{border:'1px solid #E0E0E0'}}>
            {(['cards','table'] as const).map(v=>(
              <button key={v} onClick={()=>setLeadsView(v)} className="cursor-pointer transition-colors active:scale-[0.96]"
                style={{fontFamily:"'Onest',sans-serif",fontSize:12,fontWeight:600,padding:'6px 12px',background:leadsView===v?'#0D0D0B':'white',color:leadsView===v?'white':'#6A6860'}}>
                {v==='cards'?'Карточки':'Таблица'}
              </button>
            ))}
          </div>
        </div>

        {leadsView==='table'?(
          <div className="overflow-x-auto -mx-5 px-5" style={{scrollbarWidth:'none'}}>
            <table className="w-full bg-white rounded-2xl overflow-hidden" style={{minWidth:900,boxShadow:'0 1px 3px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.04)'}}>
              <thead>
                <tr style={{background:'#F5F5F7'}}>
                  {['№','Клиент','Услуга','Бюджет','Предоплата','Остаток','Дедлайн','Дней','Менеджер','Статус'].map(h=>(
                    <th key={h} className="text-left" style={{fontFamily:"'Onest',sans-serif",fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',color:'#6A6860',padding:'10px 16px'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(l=>(
                  <tr key={l.id} onClick={()=>{setSelectedLead(l);setLeadDetailTab('details');}} className="cursor-pointer hover:bg-[#FAFAFA] transition-colors" style={{borderBottom:'1px solid #F5F5F5'}}>
                    <td style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#B0B0B0',padding:'12px 16px'}}>{l.num}</td>
                    <td style={{padding:'12px 16px'}}>
                      <div className="flex items-center gap-2">
                        <span style={{fontFamily:"'Onest',sans-serif",fontSize:14,fontWeight:600,color:'#0D0D0B'}}>{l.name}</span>
                        {l.unread>0&&<div className="w-2 h-2 rounded-full bg-[#FF3B30]" />}
                      </div>
                    </td>
                    <td style={{padding:'12px 16px'}}><span className="rounded-full" style={{fontFamily:"'Onest',sans-serif",fontSize:11,fontWeight:600,padding:'2px 8px',background:'#F0F0F0'}}>{l.service}</span></td>
                    <td style={{fontFamily:"'Onest',sans-serif",fontSize:13,fontWeight:700,color:'#0D0D0B',padding:'12px 16px'}}>{l.budget.toLocaleString('ru')} ₽</td>
                    <td style={{fontFamily:"'Onest',sans-serif",fontSize:13,color:'#00B341',padding:'12px 16px'}}>{l.prepaid.toLocaleString('ru')} ₽</td>
                    <td style={{fontFamily:"'Onest',sans-serif",fontSize:13,color:'#FF9500',padding:'12px 16px'}}>{l.balance.toLocaleString('ru')} ₽</td>
                    <td style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#6A6860',padding:'12px 16px'}}>{l.deadline}</td>
                    <td style={{padding:'12px 16px'}}><DaysBadge days={l.daysLeft} status={l.status} /></td>
                    <td style={{padding:'12px 16px'}}><ManagerAvatar name={l.manager} /></td>
                    <td style={{padding:'12px 16px'}} onClick={e=>e.stopPropagation()}>
                      <select value={l.status} onChange={e=>{setLeads(prev=>prev.map(ll=>ll.id===l.id?{...ll,status:e.target.value}:ll));toast('Статус обновлён');}}
                        className="cursor-pointer bg-transparent border-none outline-none" style={{fontFamily:"'Onest',sans-serif",fontSize:12,fontWeight:600,color:leadStatusConfig[l.status]?.color}}>
                        {Object.entries(leadStatusConfig).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr style={{background:'#F9F9F9',borderTop:'2px solid #E0E0E0'}}>
                  <td colSpan={3} style={{fontFamily:"'Onest',sans-serif",fontSize:13,fontWeight:700,padding:'12px 16px'}}>ИТОГО</td>
                  <td style={{fontFamily:"'Onest',sans-serif",fontSize:13,fontWeight:700,color:'#0D0D0B',padding:'12px 16px'}}>{totals.budget.toLocaleString('ru')} ₽</td>
                  <td style={{fontFamily:"'Onest',sans-serif",fontSize:13,fontWeight:700,color:'#00B341',padding:'12px 16px'}}>{totals.prepaid.toLocaleString('ru')} ₽</td>
                  <td style={{fontFamily:"'Onest',sans-serif",fontSize:13,fontWeight:700,color:'#FF9500',padding:'12px 16px'}}>{totals.balance.toLocaleString('ru')} ₽</td>
                  <td colSpan={2} />
                  <td colSpan={2} style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#6A6860',padding:'12px 16px'}}>{inProgressCount} в работе · {doneCount} завершён</td>
                </tr>
              </tbody>
            </table>
          </div>
        ):(
          filteredLeads.map((l,i)=>(
            <motion.div key={l.id} onClick={()=>{setSelectedLead(l);setLeadDetailTab('details');}}
              className="bg-white rounded-2xl p-4 mb-3 cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
              style={{borderLeft:`4px solid ${leadStatusConfig[l.status]?.border||'#E0E0E0'}`,boxShadow:'0 1px 3px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.04)'}}
              initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04,duration:0.3,ease}}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#B0B0B0'}}>#{l.num}</span>
                  <span style={{fontFamily:"'Onest',sans-serif",fontSize:15,fontWeight:600}}>{l.name}</span>
                  {l.unread>0&&<span className="rounded-full text-white flex items-center justify-center" style={{fontFamily:"'Onest',sans-serif",fontSize:10,background:'#FF3B30',minWidth:18,height:18,padding:'0 5px'}}>{l.unread}</span>}
                </div>
                <DaysBadge days={l.daysLeft} status={l.status} />
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="rounded-full" style={{fontFamily:"'Onest',sans-serif",fontSize:11,padding:'2px 8px',background:'#F5F5F5'}}>{l.service}</span>
                <span style={{fontFamily:"'Onest',sans-serif",fontSize:13,color:'#0052FF',fontWeight:600}}>{fmt(l.budget)}</span>
                <span style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#00B341'}}>↑ {fmt(l.prepaid)}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <ManagerAvatar name={l.manager} />
                  <span style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#6A6860'}}>{l.manager}</span>
                </div>
                <span style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#B0B0B0'}}>{l.deadline}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    );
  };

  /* ═══════ LEAD DETAIL ═══════ */
  const renderLeadDetail = () => {
    if(!selectedLead) return null;
    const l = selectedLead;
    return (
      <Sheet onClose={()=>setSelectedLead(null)} height="85dvh">
        <div className="px-5 pt-2 flex justify-between items-center">
          <div>
            <span style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#B0B0B0'}}>#{l.num}</span>
            <h2 style={{fontFamily:"'Unbounded',sans-serif",fontSize:18,fontWeight:800}}>{l.name}</h2>
          </div>
          <button onClick={()=>setSelectedLead(null)} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer active:scale-[0.96]" style={{background:'#F5F5F5'}}><X size={18} /></button>
        </div>
        <div className="mx-5 mt-4 flex gap-0" style={{borderBottom:'1px solid #F0F0F0'}}>
          {(['details','chat','notes'] as const).map(t=>(
            <button key={t} onClick={()=>setLeadDetailTab(t)} className="flex-1 py-3 cursor-pointer transition-colors" style={{fontFamily:"'Onest',sans-serif",fontSize:13,fontWeight:600,color:leadDetailTab===t?'#0D0D0B':'#888',borderBottom:leadDetailTab===t?'2px solid #0D0D0B':'2px solid transparent'}}>
              {t==='details'?'Детали':t==='chat'?'Переписка':'Заметка'}
            </button>
          ))}
        </div>
        {leadDetailTab==='details'&&(
          <div className="px-5 py-4">
            <div className="grid grid-cols-2 gap-3">
              {[{label:'БЮДЖЕТ',value:fmt(l.budget),color:'#0D0D0B'},{label:'ПРЕДОПЛАТА',value:fmt(l.prepaid),color:'#00B341'},{label:'ОСТАТОК',value:fmt(l.balance),color:'#FF9500'},{label:'ДЕДЛАЙН',value:l.deadline,color:'#0D0D0B'},{label:'МЕНЕДЖЕР',value:l.manager,color:'#0D0D0B'},{label:'КОНТАКТ',value:l.contact,color:'#0052FF'}].map(d=>(
                <div key={d.label} className="rounded-xl p-3" style={{background:'#F9F9F9'}}>
                  <p style={{fontFamily:"'Onest',sans-serif",fontSize:11,color:'#B0B0B0',textTransform:'uppercase'}}>{d.label}</p>
                  <p style={{fontFamily:"'Onest',sans-serif",fontSize:14,fontWeight:700,color:d.color}}>{d.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-4 mt-3" style={{background:'#F9F9F9'}}>
              <p style={{fontFamily:"'Onest',sans-serif",fontSize:14,lineHeight:1.65}}>{l.comment}</p>
            </div>
          </div>
        )}
        {leadDetailTab==='chat'&&(
          <div className="px-5 py-4 flex flex-col" style={{minHeight:300}}>
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto" style={{maxHeight:'calc(85dvh - 300px)'}}>
              {(messages[l.id]||[]).map(m=>(
                <div key={m.id} className={`flex ${m.from==='manager'?'justify-end':'justify-start'}`}>
                  <div style={{maxWidth:'75%',padding:'10px 14px',fontFamily:"'Onest',sans-serif",fontSize:15,background:m.from==='manager'?'#0D0D0B':'white',color:m.from==='manager'?'white':'#0D0D0B',borderRadius:m.from==='manager'?'18px 4px 18px 18px':'4px 18px 18px 18px',boxShadow:m.from==='client'?'0 1px 2px rgba(0,0,0,0.08)':'none'}}>
                    {m.text}
                    <p style={{fontSize:11,color:m.from==='manager'?'rgba(255,255,255,0.5)':'#B0B0B0',marginTop:4,textAlign:m.from==='manager'?'right':'left'}}>
                      {m.time}{m.from==='manager'&&m.read&&<span style={{color:'#4dff91',marginLeft:6}}>✓✓</span>}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2 mt-3">
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage(l.id,chatInput);}}}
                placeholder="Сообщение..." className="flex-1 outline-none" style={{fontFamily:"'Onest',sans-serif",fontSize:14,background:'#F5F5F5',borderRadius:24,padding:'10px 16px'}} />
              <button onClick={()=>sendMessage(l.id,chatInput)} className="w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer active:scale-[0.88] transition-transform" style={{background:chatInput.trim()?'#0D0D0B':'#F5F5F5'}}>
                <ArrowUp size={16} color={chatInput.trim()?'white':'#B0B0B0'} />
              </button>
            </div>
          </div>
        )}
        {leadDetailTab==='notes'&&(
          <div className="px-5 py-4">
            <textarea value={leadNote} onChange={e=>setLeadNote(e.target.value)} rows={8} placeholder="Заметки по лиду..." className="w-full outline-none resize-none" style={{fontFamily:"'Onest',sans-serif",fontSize:15,background:'#F5F5F5',borderRadius:16,padding:16}} />
          </div>
        )}
        <div className="sticky bottom-0 bg-white p-4 flex gap-3" style={{borderTop:'1px solid #F0F0F0',paddingBottom:'calc(16px + env(safe-area-inset-bottom))'}}>
          <button onClick={()=>{setSelectedLead(null);toast('✓ Сохранено');}} className="flex-1 text-white cursor-pointer active:scale-[0.96] transition-transform" style={{fontFamily:"'Onest',sans-serif",fontSize:14,fontWeight:700,background:'#0D0D0B',borderRadius:12,padding:12}}>Закрыть</button>
        </div>
      </Sheet>
    );
  };

  /* ═══════ RENDER KANBAN ═══════ */
  const renderKanban = () => (
    <div className="p-5 overflow-x-hidden">
      <div className="flex items-center justify-between mb-4">
        <h1 style={{fontFamily:"'Unbounded',sans-serif",fontSize:22,fontWeight:800}}>Канбан</h1>
        <button onClick={()=>{setProjects(prev=>[...prev,{id:'p'+Date.now(),emoji:'✦',title:'Новый проект',client:'',service:'',status:'briefing',price:0,paid:0,deadline:'',progress:0,manager:'НК',notes:''}]);toast('Проект создан');}}
          className="flex items-center gap-1.5 text-white cursor-pointer active:scale-[0.96] transition-transform" style={{fontFamily:"'Onest',sans-serif",fontSize:13,fontWeight:600,background:'#0D0D0B',borderRadius:12,padding:'8px 16px'}}><Plus size={14} />Проект</button>
      </div>
      <div className="overflow-x-auto -mx-5 px-5" style={{scrollbarWidth:'none'}}>
        <div className="flex gap-3" style={{minWidth:'fit-content'}}>
          {kanbanCols.map(colKey=>{
            const col = projectStatus[colKey]||{label:colKey,color:'#888',border:'#E0E0E0'};
            const colProjects = projects.filter(p=>p.status===colKey);
            const colSum = colProjects.reduce((a,p)=>a+p.price,0);
            return (
              <div key={colKey} className="flex-shrink-0" style={{minWidth:260,width:260}}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{background:col.color}} />
                    <span style={{fontFamily:"'Onest',sans-serif",fontSize:14,fontWeight:700}}>{col.label}</span>
                    <span className="rounded-full" style={{fontFamily:"'Onest',sans-serif",fontSize:11,fontWeight:600,background:'#F0F0F0',padding:'2px 8px'}}>{colProjects.length}</span>
                  </div>
                </div>
                {colSum>0&&<p style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:col.color,marginBottom:8}}>₽ {colSum.toLocaleString('ru')}</p>}
                <div className="flex flex-col gap-2">
                  {colProjects.length===0?(
                    <div className="rounded-2xl py-8 text-center" style={{border:'2px dashed #E0E0E0'}}>
                      <p style={{fontFamily:"'Onest',sans-serif",fontSize:13,color:'#B0B0B0'}}>Нет проектов</p>
                    </div>
                  ):colProjects.map(p=>{
                    const pTasks = tasks[p.id]||[];
                    const done = pTasks.filter(t=>t.done).length;
                    return (
                      <div key={p.id} className="bg-white rounded-2xl p-3.5 cursor-pointer transition-all hover:shadow-md active:scale-[0.98] relative" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.04)'}}
                        onClick={()=>{setSelectedProject(p);setProjectDetailTab('overview');}}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span style={{fontSize:16}}>{p.emoji}</span>
                            <span className="truncate" style={{fontFamily:"'Onest',sans-serif",fontSize:14,fontWeight:600,maxWidth:140}}>{p.title}</span>
                          </div>
                          <div className="relative">
                            <button onClick={e=>{e.stopPropagation();setProjectMenuId(projectMenuId===p.id?null:p.id);}} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#F5F5F5] active:scale-[0.9] transition-transform"><MoreVertical size={14} color="#B0B0B0" /></button>
                            {projectMenuId===p.id&&(
                              <div className="absolute right-0 top-8 z-10 bg-white rounded-xl shadow-lg py-1" style={{width:160,border:'1px solid #F0F0F0'}} onClick={e=>e.stopPropagation()}>
                                {Object.entries(projectStatus).filter(([k])=>k!==p.status).map(([k,v])=>(
                                  <button key={k} onClick={()=>{setProjects(prev=>prev.map(pp=>pp.id===p.id?{...pp,status:k}:pp));setProjectMenuId(null);toast(`→ ${v.label}`);}}
                                    className="w-full text-left px-3 py-2 hover:bg-[#F9F9F9] cursor-pointer" style={{fontFamily:"'Onest',sans-serif",fontSize:13}}>
                                    → {v.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="truncate" style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#6A6860'}}>{p.client}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span style={{fontFamily:"'Onest',sans-serif",fontSize:13,fontWeight:700,color:'#0052FF'}}>₽ {p.price.toLocaleString('ru')}</span>
                          <span style={{fontFamily:"'Onest',sans-serif",fontSize:11,color:'#B0B0B0'}}>{p.deadline}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full mt-2" style={{background:'#F0F0F0'}}>
                          <div className="h-full rounded-full transition-all duration-700" style={{width:p.progress+'%',background:col.color}} />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <CheckSquare size={12} color="#B0B0B0" />
                            <span style={{fontFamily:"'Onest',sans-serif",fontSize:11,color:'#B0B0B0'}}>{done}/{pTasks.length}</span>
                          </div>
                          <ManagerAvatar name={p.manager} />
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

  /* ═══════ PROJECT DETAIL ═══════ */
  const renderProjectDetail = () => {
    if(!selectedProject) return null;
    const p = selectedProject;
    const st = projectStatus[p.status]||{label:p.status,color:'#888',border:'#E0E0E0'};
    const pTasks = tasks[p.id]||[];
    const done = pTasks.filter(t=>t.done).length;
    return (
      <Sheet onClose={()=>setSelectedProject(null)} height="88dvh">
        <div className="px-5 pt-2 flex justify-between items-start">
          <div>
            <span style={{fontSize:32}}>{p.emoji}</span>
            <h2 style={{fontFamily:"'Unbounded',sans-serif",fontSize:18,fontWeight:800,marginTop:4}}>{p.title}</h2>
            <span className="inline-block mt-1 rounded-full" style={{fontFamily:"'Onest',sans-serif",fontSize:11,fontWeight:600,padding:'3px 10px',background:st.color+'15',color:st.color}}>{st.label}</span>
          </div>
          <button onClick={()=>setSelectedProject(null)} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer active:scale-[0.96]" style={{background:'#F5F5F5'}}><X size={18} /></button>
        </div>
        <div className="mx-5 mt-4 flex gap-0" style={{borderBottom:'1px solid #F0F0F0'}}>
          {(['overview','tasks','edit'] as const).map(t=>(
            <button key={t} onClick={()=>setProjectDetailTab(t)} className="flex-1 py-3 cursor-pointer" style={{fontFamily:"'Onest',sans-serif",fontSize:13,fontWeight:600,color:projectDetailTab===t?'#0D0D0B':'#888',borderBottom:projectDetailTab===t?'2px solid #0D0D0B':'2px solid transparent'}}>
              {t==='overview'?'Обзор':t==='tasks'?'Задачи':'Редактировать'}
            </button>
          ))}
        </div>
        {projectDetailTab==='overview'&&(
          <div className="px-5 py-4">
            <div className="w-full h-2 rounded-full mb-4" style={{background:'#F0F0F0'}}><div className="h-full rounded-full transition-all duration-700" style={{width:p.progress+'%',background:st.color}} /></div>
            <div className="grid grid-cols-2 gap-3">
              {[{label:'БЮДЖЕТ',value:'₽'+p.price.toLocaleString('ru')},{label:'ОПЛАЧЕНО',value:'₽'+p.paid.toLocaleString('ru')},{label:'ДЕДЛАЙН',value:p.deadline||'—'},{label:'ПРОГРЕСС',value:p.progress+'%'}].map(d=>(
                <div key={d.label} className="rounded-xl p-3" style={{background:'#F9F9F9'}}>
                  <p style={{fontFamily:"'Onest',sans-serif",fontSize:11,color:'#B0B0B0',textTransform:'uppercase'}}>{d.label}</p>
                  <p style={{fontFamily:"'Onest',sans-serif",fontSize:14,fontWeight:700}}>{d.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-3 mt-3" style={{background:'#F9F9F9'}}>
              <p style={{fontFamily:"'Onest',sans-serif",fontSize:11,color:'#B0B0B0',textTransform:'uppercase',marginBottom:4}}>ЗАМЕТКИ</p>
              <p style={{fontFamily:"'Onest',sans-serif",fontSize:14}}>{p.notes||'—'}</p>
            </div>
          </div>
        )}
        {projectDetailTab==='tasks'&&(
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span style={{fontFamily:"'Onest',sans-serif",fontSize:14,fontWeight:600}}>{done}/{pTasks.length} задач</span>
              <div className="flex-1 h-1.5 rounded-full" style={{background:'#F0F0F0'}}><div className="h-full rounded-full transition-all" style={{width:pTasks.length?(done/pTasks.length*100)+'%':'0%',background:'#0D0D0B'}} /></div>
            </div>
            {pTasks.map(t=>(
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl mb-2" style={{background:'#F9F9F9'}}>
                <button onClick={()=>toggleTask(p.id,t.id)} className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-[0.9]" style={{background:t.done?'#0D0D0B':'transparent',border:t.done?'none':'2px solid #D0D0D0'}}>{t.done&&<span className="text-white" style={{fontSize:12}}>✓</span>}</button>
                <span className="flex-1" style={{fontFamily:"'Onest',sans-serif",fontSize:14,textDecoration:t.done?'line-through':'none',color:t.done?'#B0B0B0':'#0D0D0B'}}>{t.title}</span>
                <PriorityDot p={t.priority} />
                <button onClick={()=>{setTasks(prev=>{const u={...prev};u[p.id]=(u[p.id]||[]).filter(tt=>tt.id!==t.id);return u;});}} className="cursor-pointer hover:text-[#FF3B30]" style={{color:'#D0D0D0'}}><Trash2 size={14} /></button>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input value={newTaskText[p.id]||''} onChange={e=>setNewTaskText(prev=>({...prev,[p.id]:e.target.value}))}
                onKeyDown={e=>{if(e.key==='Enter'&&(newTaskText[p.id]||'').trim()){setTasks(prev=>({...prev,[p.id]:[...(prev[p.id]||[]),{id:'t'+Date.now(),title:newTaskText[p.id].trim(),done:false,priority:'medium'}]}));setNewTaskText(prev=>({...prev,[p.id]:''}));}}}
                placeholder="Добавить задачу..." className="flex-1 outline-none" style={{fontFamily:"'Onest',sans-serif",fontSize:14,background:'#F0F0F0',borderRadius:12,padding:'10px 12px'}} />
              <button onClick={()=>{if(!(newTaskText[p.id]||'').trim())return;setTasks(prev=>({...prev,[p.id]:[...(prev[p.id]||[]),{id:'t'+Date.now(),title:newTaskText[p.id].trim(),done:false,priority:'medium'}]}));setNewTaskText(prev=>({...prev,[p.id]:''}));}} className="w-9 h-9 rounded-xl flex items-center justify-center text-white cursor-pointer active:scale-[0.9]" style={{background:'#0D0D0B'}}><Plus size={16} /></button>
            </div>
          </div>
        )}
        {projectDetailTab==='edit'&&(
          <div className="px-5 py-4 flex flex-col gap-4">
            {[{label:'Название',key:'title'},{label:'Клиент',key:'client'},{label:'Дедлайн',key:'deadline'}].map(f=>(
              <div key={f.key}>
                <label style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#6A6860',marginBottom:4,display:'block'}}>{f.label}</label>
                <input value={(p as any)[f.key]} onChange={e=>{const v=e.target.value;setProjects(prev=>prev.map(pp=>pp.id===p.id?{...pp,[f.key]:v}:pp));setSelectedProject({...p,[f.key]:v});}} className="w-full outline-none" style={{fontFamily:"'Onest',sans-serif",fontSize:14,background:'#F5F5F5',borderRadius:12,padding:'10px 16px'}} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div><label style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#6A6860'}}>Цена</label><input type="number" value={p.price} onChange={e=>{const v=+e.target.value;setProjects(prev=>prev.map(pp=>pp.id===p.id?{...pp,price:v}:pp));setSelectedProject({...p,price:v});}} className="w-full outline-none mt-1" style={{fontFamily:"'Onest',sans-serif",fontSize:14,background:'#F5F5F5',borderRadius:12,padding:'10px 16px'}} /></div>
              <div><label style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#6A6860'}}>Оплачено</label><input type="number" value={p.paid} onChange={e=>{const v=+e.target.value;setProjects(prev=>prev.map(pp=>pp.id===p.id?{...pp,paid:v}:pp));setSelectedProject({...p,paid:v});}} className="w-full outline-none mt-1" style={{fontFamily:"'Onest',sans-serif",fontSize:14,background:'#F5F5F5',borderRadius:12,padding:'10px 16px'}} /></div>
            </div>
            <button onClick={()=>{if(confirm('Удалить проект?')){setProjects(prev=>prev.filter(pp=>pp.id!==p.id));setSelectedProject(null);toast('Проект удалён');}}} className="cursor-pointer mt-2" style={{fontFamily:"'Onest',sans-serif",fontSize:14,color:'#FF3B30'}}>Удалить проект</button>
          </div>
        )}
      </Sheet>
    );
  };

  /* ═══════ RENDER CHATS — TELEGRAM STYLE ═══════ */
  const renderChats = () => {
    if(openChat){
      const chatMsgs = messages[openChat.id]||[];
      return (
        <motion.div className="fixed inset-0 z-50 bg-white flex flex-col" initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{duration:0.25,ease}}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 flex-shrink-0" style={{height:60,borderBottom:'1px solid #F0F0F0'}}>
            <button onClick={()=>setOpenChat(null)} className="w-10 h-10 flex items-center justify-center cursor-pointer active:scale-[0.9] transition-transform"><ArrowLeft size={20} /></button>
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{background:'#0D0D0B',fontFamily:"'Unbounded',sans-serif",fontSize:14,color:'white'}}>{openChat.name.charAt(0)}</div>
            <div className="flex-1">
              <p style={{fontFamily:"'Onest',sans-serif",fontSize:15,fontWeight:700}}>{openChat.name}</p>
              <p style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#00B341'}}>онлайн</p>
            </div>
            <button className="w-9 h-9 flex items-center justify-center cursor-pointer"><MoreVertical size={18} color="#6A6860" /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 px-4 py-3" style={{background:'#F5F5F7'}}>
            <div className="mx-auto rounded-full px-3 py-1 mb-2" style={{background:'#E0E0E0',fontFamily:"'Onest',sans-serif",fontSize:12}}>Сегодня</div>
            {chatMsgs.map(m=>(
              <div key={m.id} className={`flex ${m.from==='manager'?'justify-end':'justify-start'}`}>
                <div style={{maxWidth:'75%',padding:'10px 14px',fontFamily:"'Onest',sans-serif",fontSize:15,background:m.from==='manager'?'#0D0D0B':'white',color:m.from==='manager'?'white':'#0D0D0B',borderRadius:m.from==='manager'?'18px 4px 18px 18px':'4px 18px 18px 18px',boxShadow:m.from==='client'?'0 1px 2px rgba(0,0,0,0.08)':'none'}}>
                  {m.text}
                  <p style={{fontSize:11,color:m.from==='manager'?'rgba(255,255,255,0.5)':'#B0B0B0',marginTop:4,textAlign:m.from==='manager'?'right':'left'}}>
                    {m.time}{m.from==='manager'&&<span style={{color:'#4dff91',marginLeft:6}}>✓✓</span>}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          <AnimatePresence>
            {showQuickActions&&(
              <motion.div className="bg-white border-t border-[#F0F0F0] px-4 py-3" initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} exit={{y:20,opacity:0}}>
                {['📷 Фото/Видео','📄 Документ','📋 Шаблон ответа','✅ Создать задачу'].map(a=>(
                  <button key={a} onClick={()=>{setShowQuickActions(false);toast(a.split(' ').slice(1).join(' '));}} className="w-full text-left py-2.5 hover:bg-[#F9F9F9] rounded-xl px-3 cursor-pointer" style={{fontFamily:"'Onest',sans-serif",fontSize:14}}>{a}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="bg-white flex items-end gap-2 px-3 py-3" style={{borderTop:'1px solid #F0F0F0',paddingBottom:'max(12px, env(safe-area-inset-bottom))'}}>
            <button onClick={()=>setShowQuickActions(!showQuickActions)} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-[0.9] transition-transform" style={{background:'#F5F5F5'}}>
              <Plus size={18} color="#6A6860" />
            </button>
            <textarea ref={textareaRef} value={chatInput} onChange={e=>{setChatInput(e.target.value);e.target.style.height='40px';e.target.style.height=Math.min(e.target.scrollHeight,100)+'px';}}
              onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage(openChat.id,chatInput);}}}
              placeholder="Сообщение..." className="flex-1 outline-none resize-none" rows={1}
              style={{fontFamily:"'Onest',sans-serif",fontSize:15,background:'#F5F5F5',border:'1px solid transparent',borderRadius:24,padding:'8px 16px',minHeight:40,maxHeight:100}} />
            <button onClick={()=>sendMessage(openChat.id,chatInput)} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-[0.88] transition-transform" style={{background:chatInput.trim()?'#0D0D0B':'#F5F5F5'}}>
              <ArrowUp size={16} color={chatInput.trim()?'white':'#B0B0B0'} />
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="overflow-y-auto">
        <div className="p-4 flex items-center justify-between" style={{borderBottom:'1px solid #F0F0F0'}}>
          <h2 style={{fontFamily:"'Unbounded',sans-serif",fontSize:18,fontWeight:800}}>Сообщения</h2>
          {totalUnread>0&&<span className="rounded-full text-white flex items-center justify-center" style={{fontFamily:"'Onest',sans-serif",fontSize:11,background:'#0D0D0B',minWidth:20,height:20,padding:'0 6px'}}>{totalUnread}</span>}
        </div>
        {conversations.map(c=>(
          <button key={c.id} onClick={()=>setOpenChat({id:c.id,name:c.name})}
            className="w-full flex items-center gap-3 px-4 py-3.5 cursor-pointer text-left transition-colors hover:bg-[#F9F9F9] active:bg-[#F0F0F0]"
            style={{borderBottom:'1px solid #F5F5F5'}}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{background:'#0D0D0B',fontFamily:"'Unbounded',sans-serif",fontSize:16,color:'white'}}>{c.name.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="truncate" style={{fontFamily:"'Onest',sans-serif",fontSize:15,fontWeight:700}}>{c.name}</span>
                <span style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#B0B0B0'}}>{c.time}</span>
              </div>
              <p className="truncate mt-0.5" style={{fontFamily:"'Onest',sans-serif",fontSize:14,color:'#6A6860'}}>{c.lastMsg}</p>
            </div>
            {c.unread>0&&<span className="rounded-full text-white flex items-center justify-center flex-shrink-0" style={{fontFamily:"'Onest',sans-serif",fontSize:11,fontWeight:700,background:'#FF3B30',minWidth:20,height:20,padding:'0 5px'}}>{c.unread}</span>}
          </button>
        ))}
      </div>
    );
  };

  /* ═══════ RENDER CONTENT ═══════ */
  const renderContent = () => (
    <div className="p-5 overflow-x-hidden">
      <div className="flex gap-1 mb-6 rounded-xl p-1" style={{background:'#F0F0F0'}}>
        {(['services','works','agent'] as const).map(t=>(
          <button key={t} onClick={()=>setContentTab(t)} className="flex-1 py-2.5 cursor-pointer transition-all active:scale-[0.97]" style={{fontFamily:"'Onest',sans-serif",fontSize:13,fontWeight:600,background:contentTab===t?'#0D0D0B':'transparent',color:contentTab===t?'white':'#6A6860',borderRadius:contentTab===t?12:0}}>
            {t==='services'?'Услуги':t==='works'?'Работы':'Агент'}
          </button>
        ))}
      </div>

      {contentTab==='services'&&(
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{fontFamily:"'Unbounded',sans-serif",fontSize:20,fontWeight:800}}>Услуги</h2>
            <button onClick={()=>setEditService({id:'',emoji:'',name:'',priceFrom:0,priceTo:0,days:7,badge:'',active:true})} className="flex items-center gap-1.5 text-white cursor-pointer active:scale-[0.96]" style={{fontFamily:"'Onest',sans-serif",fontSize:13,fontWeight:600,background:'#0D0D0B',borderRadius:12,padding:'8px 16px'}}><Plus size={14} />Добавить</button>
          </div>
          <div className="flex flex-col gap-3">
            {services.map(s=>(
              <div key={s.id} className="bg-white rounded-2xl p-4 flex items-center gap-4" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
                <span style={{fontSize:28}}>{s.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p style={{fontFamily:"'Onest',sans-serif",fontSize:15,fontWeight:700}}>{s.name}</p>
                  <p style={{fontFamily:"'Onest',sans-serif",fontSize:13,color:'#6A6860'}}>от {s.priceFrom.toLocaleString('ru')} ₽ · {s.days} дней</p>
                </div>
                {s.badge&&<span className="rounded-full text-white" style={{fontFamily:"'Onest',sans-serif",fontSize:10,fontWeight:700,background:'#0D0D0B',padding:'3px 8px'}}>{s.badge}</span>}
                <Toggle value={s.active} onChange={v=>{setServices(prev=>prev.map(ss=>ss.id===s.id?{...ss,active:v}:ss));toast(v?'Активировано':'Деактивировано');}} />
                <button onClick={()=>setEditService(s)} className="cursor-pointer" style={{color:'#6A6860'}}><Pencil size={18} /></button>
              </div>
            ))}
          </div>
        </>
      )}

      {contentTab==='works'&&(
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{fontFamily:"'Unbounded',sans-serif",fontSize:20,fontWeight:800}}>Портфолио</h2>
            <button onClick={()=>setEditPortfolio({id:'',emoji:'',title:'',cat:'',result:'',featured:false,active:true,bg:'linear-gradient(135deg,#0a0a1a,#1a1035)'})} className="flex items-center gap-1.5 text-white cursor-pointer active:scale-[0.96]" style={{fontFamily:"'Onest',sans-serif",fontSize:13,fontWeight:600,background:'#0D0D0B',borderRadius:12,padding:'8px 16px'}}><Plus size={14} />Добавить</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {portfolio.map(w=>(
              <div key={w.id} className="bg-white rounded-xl overflow-hidden cursor-pointer" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
                <div className="flex items-center justify-center" style={{height:72,background:w.bg}}><span style={{fontSize:28}}>{w.emoji}</span></div>
                <div className="p-3">
                  <p className="mt-1" style={{fontFamily:"'Onest',sans-serif",fontSize:13,fontWeight:700}}>{w.title}</p>
                  <p style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#0052FF'}}>{w.result}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Toggle value={w.active} onChange={v=>{setPortfolio(prev=>prev.map(ww=>ww.id===w.id?{...ww,active:v}:ww));}} />
                    <button onClick={()=>setEditPortfolio(w)} className="cursor-pointer" style={{color:'#6A6860'}}><Pencil size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {contentTab==='agent'&&renderAgent()}
    </div>
  );

  /* ═══════ RENDER AGENT ═══════ */
  const renderAgent = () => {
    const scriptCats = ['Все','Продажи','Дожим','Удержание'];
    const filteredScripts = scriptFilter==='Все'?agentData.scripts:agentData.scripts.filter(s=>s.category===scriptFilter);

    return (
      <>
        <div className="flex gap-1 mb-4 rounded-xl p-1" style={{background:'#F5F5F5'}}>
          {(['scripts','sla','products','company'] as const).map(t=>(
            <button key={t} onClick={()=>setAgentSubTab(t)} className="flex-1 py-2 cursor-pointer transition-all active:scale-[0.97]" style={{fontFamily:"'Onest',sans-serif",fontSize:12,fontWeight:600,background:agentSubTab===t?'white':'transparent',color:agentSubTab===t?'#0D0D0B':'#6A6860',borderRadius:agentSubTab===t?10:0,boxShadow:agentSubTab===t?'0 1px 3px rgba(0,0,0,0.08)':'none'}}>
              {t==='scripts'?'Скрипты':t==='sla'?'SLA':t==='products'?'Продукты':'О компании'}
            </button>
          ))}
        </div>

        {agentSubTab==='scripts'&&(
          <>
            <div className="flex gap-2 mb-4 overflow-x-auto" style={{scrollbarWidth:'none'}}>
              {scriptCats.map(c=>(
                <button key={c} onClick={()=>setScriptFilter(c)} className="flex-shrink-0 rounded-full cursor-pointer active:scale-[0.96]" style={{fontFamily:"'Onest',sans-serif",fontSize:12,fontWeight:600,padding:'6px 14px',background:scriptFilter===c?'#0D0D0B':'white',color:scriptFilter===c?'white':'#6A6860',border:'1px solid '+(scriptFilter===c?'#0D0D0B':'#E0E0E0')}}>{c}</button>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {filteredScripts.map(s=>(
                <div key={s.id} className="bg-white rounded-2xl p-4" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{fontFamily:"'Onest',sans-serif",fontSize:15,fontWeight:700}}>{s.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full" style={{fontFamily:"'Onest',sans-serif",fontSize:11,fontWeight:600,padding:'2px 8px',background:'#F0F0F0',color:'#6A6860'}}>{s.category}</span>
                      <button onClick={()=>{navigator.clipboard.writeText(s.content);toast('Скопировано!');}} className="cursor-pointer active:scale-[0.9]"><Copy size={14} color="#6A6860" /></button>
                    </div>
                  </div>
                  <div className="rounded-xl p-3" style={{background:'#F5F5F5'}}>
                    <pre style={{fontFamily:"'Onest',monospace",fontSize:13,lineHeight:1.6,whiteSpace:'pre-wrap',color:'#0D0D0B'}}>{s.content}</pre>
                  </div>
                  <button onClick={()=>{navigator.clipboard.writeText(s.content);toast('Скопировано!');}} className="mt-2 cursor-pointer active:scale-[0.96] transition-transform" style={{fontFamily:"'Onest',sans-serif",fontSize:13,fontWeight:600,color:'#0052FF'}}>Скопировать</button>
                </div>
              ))}
            </div>
          </>
        )}

        {agentSubTab==='sla'&&(
          <div className="bg-white rounded-2xl overflow-hidden" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
            <table className="w-full">
              <thead><tr style={{background:'#F5F5F7'}}>
                {['Метрика','Норма','Предупреждение','Критично'].map(h=>(
                  <th key={h} className="text-left" style={{fontFamily:"'Onest',sans-serif",fontSize:11,fontWeight:600,textTransform:'uppercase',color:'#6A6860',padding:'10px 12px'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {agentData.sla.map(s=>(
                  <tr key={s.metric} style={{borderBottom:'1px solid #F5F5F5'}}>
                    <td style={{fontFamily:"'Onest',sans-serif",fontSize:13,fontWeight:600,padding:'10px 12px'}}>{s.metric}</td>
                    <td style={{padding:'10px 12px'}}><span className="rounded-full" style={{fontFamily:"'Onest',sans-serif",fontSize:12,padding:'2px 8px',background:'#EEFBF3',color:'#00B341'}}>{s.norm}</span></td>
                    <td style={{padding:'10px 12px'}}><span className="rounded-full" style={{fontFamily:"'Onest',sans-serif",fontSize:12,padding:'2px 8px',background:'#FFF8EE',color:'#FF9500'}}>{s.warning}</span></td>
                    <td style={{padding:'10px 12px'}}><span className="rounded-full" style={{fontFamily:"'Onest',sans-serif",fontSize:12,padding:'2px 8px',background:'#FFF0EE',color:'#FF3B30'}}>{s.critical}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {agentSubTab==='products'&&(
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agentData.products.map(p=>(
              <div key={p.name} className="bg-white rounded-2xl p-4" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
                <p style={{fontFamily:"'Onest',sans-serif",fontSize:14,fontWeight:700}}>{p.name}</p>
                <p style={{fontFamily:"'Onest',sans-serif",fontSize:13,color:'#0052FF',marginTop:2}}>от {p.from.toLocaleString('ru')} до {p.to.toLocaleString('ru')} ₽</p>
                <p style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#6A6860',marginTop:2}}>{p.days} дней · {p.desc}</p>
                <button onClick={()=>{navigator.clipboard.writeText(`${p.name}: от ${p.from.toLocaleString('ru')}₽, срок ${p.days} дней. ${p.desc}`);toast('Скопировано!');}} className="mt-2 cursor-pointer active:scale-[0.96]" style={{fontFamily:"'Onest',sans-serif",fontSize:12,fontWeight:600,color:'#0052FF'}}>Скопировать условия</button>
              </div>
            ))}
          </div>
        )}

        {agentSubTab==='company'&&(
          <div className="flex flex-col gap-3">
            {[{label:'Название',value:agentData.company.name},{label:'Юр. лицо',value:agentData.company.legal},{label:'Email',value:agentData.company.email},{label:'Telegram',value:agentData.company.telegram}].map(f=>(
              <div key={f.label} className="bg-white rounded-2xl p-4 flex items-center justify-between" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
                <div>
                  <p style={{fontFamily:"'Onest',sans-serif",fontSize:11,color:'#B0B0B0',textTransform:'uppercase'}}>{f.label}</p>
                  <p style={{fontFamily:"'Onest',sans-serif",fontSize:14,fontWeight:600}}>{f.value}</p>
                </div>
                <button onClick={()=>{navigator.clipboard.writeText(f.value);toast('Скопировано!');}} className="cursor-pointer active:scale-[0.9]"><Copy size={14} color="#6A6860" /></button>
              </div>
            ))}
            <div className="bg-white rounded-2xl p-4" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
              <p style={{fontFamily:"'Onest',sans-serif",fontSize:11,color:'#B0B0B0',textTransform:'uppercase',marginBottom:4}}>О НАС</p>
              <p style={{fontFamily:"'Onest',sans-serif",fontSize:14,lineHeight:1.65}}>{agentData.company.about}</p>
            </div>
            <div className="bg-white rounded-2xl p-4" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
              <p style={{fontFamily:"'Onest',sans-serif",fontSize:11,color:'#B0B0B0',textTransform:'uppercase',marginBottom:8}}>ПРОЦЕСС</p>
              <div className="flex gap-2 overflow-x-auto" style={{scrollbarWidth:'none'}}>
                {agentData.company.process.map((step,i)=>(
                  <div key={i} className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{background:'#0D0D0B',fontFamily:"'Onest',sans-serif",fontSize:11,fontWeight:700}}>{i+1}</div>
                    <span style={{fontFamily:"'Onest',sans-serif",fontSize:13,whiteSpace:'nowrap'}}>{step}</span>
                    {i<agentData.company.process.length-1&&<span style={{color:'#E0E0E0'}}>→</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  /* ═══════ EDIT SHEETS ═══════ */
  const renderEditService = () => {
    if(!editService) return null;
    const s=editService; const isNew=!s.id;
    return (
      <Sheet onClose={()=>setEditService(null)} height="75dvh">
        <div className="px-5 pt-2 flex justify-between items-center mb-4">
          <h2 style={{fontFamily:"'Unbounded',sans-serif",fontSize:18,fontWeight:800}}>{isNew?'Новая услуга':'Редактировать'}</h2>
          <button onClick={()=>setEditService(null)} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer active:scale-[0.96]" style={{background:'#F5F5F5'}}><X size={18} /></button>
        </div>
        <div className="px-5 pb-4 flex flex-col gap-4">
          <div className="flex gap-3">
            <input value={s.emoji} onChange={e=>setEditService({...s,emoji:e.target.value})} className="text-center outline-none" style={{width:72,fontSize:28,background:'#F5F5F5',borderRadius:12,padding:8}} placeholder="🎯" />
            <input value={s.name} onChange={e=>setEditService({...s,name:e.target.value})} placeholder="Название*" className="flex-1 outline-none" style={{fontFamily:"'Onest',sans-serif",fontSize:14,background:'#F5F5F5',borderRadius:12,padding:'10px 16px'}} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#6A6860'}}>Цена от</label><input type="number" value={s.priceFrom} onChange={e=>setEditService({...s,priceFrom:+e.target.value})} className="w-full outline-none mt-1" style={{fontFamily:"'Onest',sans-serif",fontSize:14,background:'#F5F5F5',borderRadius:12,padding:'10px 16px'}} /></div>
            <div><label style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#6A6860'}}>Цена до</label><input type="number" value={s.priceTo} onChange={e=>setEditService({...s,priceTo:+e.target.value})} className="w-full outline-none mt-1" style={{fontFamily:"'Onest',sans-serif",fontSize:14,background:'#F5F5F5',borderRadius:12,padding:'10px 16px'}} /></div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white p-4 flex gap-3" style={{borderTop:'1px solid #F0F0F0',paddingBottom:'calc(16px + env(safe-area-inset-bottom))'}}>
          <button onClick={()=>{if(isNew)setServices(prev=>[...prev,{...s,id:'s'+Date.now()}]);else setServices(prev=>prev.map(ss=>ss.id===s.id?s:ss));setEditService(null);toast('✓ Сохранено');}} className="flex-1 text-white cursor-pointer active:scale-[0.96]" style={{fontFamily:"'Onest',sans-serif",fontSize:14,fontWeight:700,background:'#0D0D0B',borderRadius:12,padding:12}}>Сохранить</button>
        </div>
      </Sheet>
    );
  };

  const renderEditPortfolio = () => {
    if(!editPortfolio) return null;
    const w=editPortfolio; const isNew=!w.id;
    return (
      <Sheet onClose={()=>setEditPortfolio(null)} height="75dvh">
        <div className="px-5 pt-2 flex justify-between items-center mb-4">
          <h2 style={{fontFamily:"'Unbounded',sans-serif",fontSize:18,fontWeight:800}}>{isNew?'Новая работа':'Редактировать'}</h2>
          <button onClick={()=>setEditPortfolio(null)} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer active:scale-[0.96]" style={{background:'#F5F5F5'}}><X size={18} /></button>
        </div>
        <div className="px-5 pb-4 flex flex-col gap-4">
          <div className="flex gap-3">
            <input value={w.emoji} onChange={e=>setEditPortfolio({...w,emoji:e.target.value})} className="text-center outline-none" style={{width:72,fontSize:28,background:'#F5F5F5',borderRadius:12,padding:8}} placeholder="🎯" />
            <input value={w.title} onChange={e=>setEditPortfolio({...w,title:e.target.value})} placeholder="Название*" className="flex-1 outline-none" style={{fontFamily:"'Onest',sans-serif",fontSize:14,background:'#F5F5F5',borderRadius:12,padding:'10px 16px'}} />
          </div>
          <input value={w.cat} onChange={e=>setEditPortfolio({...w,cat:e.target.value})} placeholder="Категория" className="outline-none" style={{fontFamily:"'Onest',sans-serif",fontSize:14,background:'#F5F5F5',borderRadius:12,padding:'10px 16px'}} />
          <input value={w.result} onChange={e=>setEditPortfolio({...w,result:e.target.value})} placeholder="Результат" className="outline-none" style={{fontFamily:"'Onest',sans-serif",fontSize:14,background:'#F5F5F5',borderRadius:12,padding:'10px 16px'}} />
        </div>
        <div className="sticky bottom-0 bg-white p-4 flex gap-3" style={{borderTop:'1px solid #F0F0F0',paddingBottom:'calc(16px + env(safe-area-inset-bottom))'}}>
          <button onClick={()=>{if(isNew)setPortfolio(prev=>[...prev,{...w,id:'w'+Date.now()}]);else setPortfolio(prev=>prev.map(ww=>ww.id===w.id?w:ww));setEditPortfolio(null);toast('✓ Сохранено');}} className="flex-1 text-white cursor-pointer active:scale-[0.96]" style={{fontFamily:"'Onest',sans-serif",fontSize:14,fontWeight:700,background:'#0D0D0B',borderRadius:12,padding:12}}>Сохранить</button>
        </div>
      </Sheet>
    );
  };

  const renderNewLead = () => (
    <Sheet onClose={()=>setShowNewLead(false)} height="60dvh">
      <div className="px-5 pt-2 flex justify-between items-center mb-4">
        <h2 style={{fontFamily:"'Unbounded',sans-serif",fontSize:18,fontWeight:800}}>Новый лид</h2>
        <button onClick={()=>setShowNewLead(false)} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer active:scale-[0.96]" style={{background:'#F5F5F5'}}><X size={18} /></button>
      </div>
      <div className="px-5 pb-4 flex flex-col gap-3">
        <input value={newLeadForm.name} onChange={e=>setNewLeadForm({...newLeadForm,name:e.target.value})} placeholder="Имя *" className="outline-none" style={{fontFamily:"'Onest',sans-serif",fontSize:14,background:'#F5F5F5',borderRadius:12,padding:'10px 16px'}} />
        <input value={newLeadForm.contact} onChange={e=>setNewLeadForm({...newLeadForm,contact:e.target.value})} placeholder="Контакт" className="outline-none" style={{fontFamily:"'Onest',sans-serif",fontSize:14,background:'#F5F5F5',borderRadius:12,padding:'10px 16px'}} />
        <input value={newLeadForm.service} onChange={e=>setNewLeadForm({...newLeadForm,service:e.target.value})} placeholder="Услуга" className="outline-none" style={{fontFamily:"'Onest',sans-serif",fontSize:14,background:'#F5F5F5',borderRadius:12,padding:'10px 16px'}} />
        <input value={newLeadForm.budget} onChange={e=>setNewLeadForm({...newLeadForm,budget:e.target.value})} placeholder="Бюджет" className="outline-none" style={{fontFamily:"'Onest',sans-serif",fontSize:14,background:'#F5F5F5',borderRadius:12,padding:'10px 16px'}} />
      </div>
      <div className="sticky bottom-0 bg-white p-4" style={{borderTop:'1px solid #F0F0F0',paddingBottom:'calc(16px + env(safe-area-inset-bottom))'}}>
        <button onClick={()=>{
          if(!newLeadForm.name.trim()){toast('Введите имя');return;}
          const num=String(leads.length+1).padStart(3,'0');
          setLeads(prev=>[{id:'l'+Date.now(),num,name:newLeadForm.name,contact:newLeadForm.contact,source:'Avito',service:newLeadForm.service,budget:parseInt(newLeadForm.budget)||0,prepaid:0,balance:parseInt(newLeadForm.budget)||0,deadline:'',daysLeft:14,status:'new',manager:'Данил',comment:'',unread:0},...prev]);
          setShowNewLead(false);setNewLeadForm({name:'',contact:'',source:'Avito',service:'',budget:'',msg:''});toast('✓ Лид создан');
        }} className="w-full text-white cursor-pointer active:scale-[0.96]" style={{fontFamily:"'Onest',sans-serif",fontSize:14,fontWeight:700,background:'#0D0D0B',borderRadius:12,padding:12}}>Сохранить</button>
      </div>
    </Sheet>
  );

  /* ═══════ MAIN RENDER ═══════ */
  return (
    <div className="flex" style={{height:'100dvh',overflow:'hidden'}}>
      {/* Desktop Sidebar */}
      {!isMobile&&(
        <div className="flex flex-col flex-shrink-0" style={{width:240,background:'white',borderRight:'1px solid #F0F0F0'}}>
          <div className="px-5 py-4 flex items-center gap-2">
            <span className="text-white flex items-center justify-center" style={{width:28,height:28,borderRadius:8,background:'#0D0D0B',fontSize:12}}>✦</span>
            <span style={{fontFamily:"'Unbounded',sans-serif",fontSize:15,fontWeight:700}}>admin</span>
            <span style={{fontFamily:"'Onest',sans-serif",fontSize:11,color:'#B0B0B0',marginLeft:4}}>v3.0</span>
          </div>
          <nav className="flex-1 px-3 mt-1">
            {desktopTabs.map(t=>{
              const Icon=t.icon;
              const isActive=t.key===activeTab||(t.key==='services'&&activeTab==='content'&&contentTab==='services')||(t.key==='works'&&activeTab==='content'&&contentTab==='works');
              return (
                <button key={t.key} onClick={()=>{if(t.key==='services'){setActiveTab('content');setContentTab('services');}else if(t.key==='works'){setActiveTab('content');setContentTab('works');}else setActiveTab(t.key);}}
                  className="w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl cursor-pointer transition-colors text-left active:scale-[0.97]"
                  style={{background:isActive?'#0D0D0B':'transparent',color:isActive?'white':'#6A6860'}}>
                  <Icon size={18} strokeWidth={isActive?2:1.5} />
                  <span style={{fontFamily:"'Onest',sans-serif",fontSize:14,fontWeight:isActive?600:500}}>{t.label}</span>
                </button>
              );
            })}
          </nav>
          <div style={{height:1,background:'#F0F0F0',margin:'0 20px'}} />
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{background:'linear-gradient(135deg,#0D0D0B,#333)',fontFamily:"'Onest',sans-serif",fontSize:11,fontWeight:700}}>НК</div>
            <div className="flex-1">
              <p style={{fontFamily:"'Onest',sans-serif",fontSize:13,fontWeight:600}}>Никита К.</p>
              <button onClick={()=>navigate('/')} className="cursor-pointer" style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'#6A6860'}}>← Сайт</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0" style={{overflow:'hidden'}}>
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 flex-shrink-0" style={{height:52,background:'#0D0D0B'}}>
          <div className="flex items-center gap-2">
            {isMobile&&<><span style={{fontSize:16,color:'white'}}>✦</span><span style={{fontFamily:"'Unbounded',sans-serif",fontSize:14,fontWeight:700,color:'white'}}>neeklo</span></>}
            <span className="ml-2" style={{fontFamily:"'Onest',sans-serif",fontSize:13,color:'rgba(255,255,255,0.6)'}}>
              {mobileTabs.find(t=>t.key===activeTab)?.label||desktopTabs.find(t=>t.key===activeTab)?.label||'Контент'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {totalUnread>0&&<span className="rounded-full text-white" style={{fontFamily:"'Onest',sans-serif",fontSize:11,background:'#FF3B30',padding:'2px 8px'}}>{totalUnread}</span>}
            <button onClick={()=>navigate('/')} className="flex items-center gap-1 cursor-pointer active:scale-[0.96] transition-transform" style={{fontFamily:"'Onest',sans-serif",fontSize:12,color:'rgba(255,255,255,0.6)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:8,padding:'6px 12px'}}>← Сайт</button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{background:'#F5F5F7',paddingBottom:isMobile?80:0}}>
          {activeTab==='dashboard'&&renderDashboard()}
          {activeTab==='leads'&&renderLeads()}
          {activeTab==='kanban'&&renderKanban()}
          {activeTab==='chats'&&renderChats()}
          {activeTab==='content'&&renderContent()}
        </div>

        {/* Mobile Bottom Tabs */}
        {isMobile&&(
          <div className="flex-shrink-0 bg-white flex" style={{height:60,borderTop:'1px solid #F0F0F0',paddingBottom:'env(safe-area-inset-bottom)'}}>
            {mobileTabs.map(t=>{
              const Icon=t.icon;
              const active=t.key===activeTab;
              return (
                <button key={t.key} onClick={()=>setActiveTab(t.key)} className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer relative active:scale-[0.97] transition-transform">
                  <Icon size={20} strokeWidth={active?2:1.5} color={active?'#0D0D0B':'#999'} />
                  <span style={{fontFamily:"'Onest',sans-serif",fontSize:10,fontWeight:active?700:500,color:active?'#0D0D0B':'#999'}}>{t.label}</span>
                  {active&&<div className="absolute bottom-1 w-1 h-1 rounded-full" style={{background:'#0D0D0B'}} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* OVERLAYS */}
      <AnimatePresence>
        {selectedLead&&renderLeadDetail()}
        {selectedProject&&renderProjectDetail()}
        {editService&&renderEditService()}
        {editPortfolio&&renderEditPortfolio()}
        {showNewLead&&renderNewLead()}
      </AnimatePresence>

      {/* Fullscreen chat overlay */}
      <AnimatePresence>
        {openChat&&activeTab==='chats'&&renderChats()}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;
