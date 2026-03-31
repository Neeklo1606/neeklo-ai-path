import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, FolderOpen, Settings, Bell, Plus, Search,
  UserPlus, TrendingUp, Target, Star, X, ChevronRight,
} from "lucide-react";

/* ═══════ TYPES ═══════ */
interface Lead { id: string; name: string; contact: string; source: string; service: string; status: string; time: string; msg: string; }
interface Project { id: string; title: string; client: string; status: string; price: number; progress: number; deadline: string; manager: string; }
interface Service { id: string; icon: string; name: string; price: string; badge: string; active: boolean; }
interface Portfolio { id: string; title: string; cat: string; result: string; featured: boolean; emoji: string; }

/* ═══════ INITIAL DATA ═══════ */
const initLeads: Lead[] = [
  { id:"1", name:"Максим Орлов", contact:"@maksim_orl", source:"Чат", service:"Лендинг", status:"new", time:"2 мин назад", msg:"Нужен лендинг для автосервиса" },
  { id:"2", name:"Анна Петрова", contact:"+7 916 234-55-66", source:"Avito", service:"AI-агент", status:"contacted", time:"1 час назад", msg:"Хочу автоматизировать продажи" },
  { id:"3", name:"Дмитрий Смирнов", contact:"dsmith@mail.ru", source:"Сайт", service:"Mini App", status:"qualified", time:"3 часа назад", msg:"Нужно приложение в Telegram" },
  { id:"4", name:"Ольга Иванова", contact:"@olga_shop", source:"Telegram", service:"Сайт", status:"proposal", time:"вчера", msg:"Интернет-магазин одежды" },
  { id:"5", name:"Сергей Волков", contact:"+7 903 111-22-33", source:"Reels", service:"AI-видео", status:"won", time:"2 дня назад", msg:"Ролики для бренда" },
];
const initProjects: Project[] = [
  { id:"1", title:"Лендинг DA-Motors", client:"Максим Орлов", status:"in_progress", price:95000, progress:75, deadline:"15 апр", manager:"Никита" },
  { id:"2", title:"TG Mini App", client:"Сергей Волков", status:"review", price:200000, progress:95, deadline:"5 апр", manager:"Никита" },
  { id:"3", title:"AI-агент продаж", client:"Анна Петрова", status:"briefing", price:150000, progress:15, deadline:"30 апр", manager:"Никита" },
  { id:"4", title:"Имиджевые ролики", client:"ООО Бренд", status:"done", price:80000, progress:100, deadline:"1 мар", manager:"Никита" },
];
const initServices: Service[] = [
  { id:"1", icon:"🎬", name:"AI-ролики", price:"от 25 000 ₽", badge:"ХИТ", active:true },
  { id:"2", icon:"🌐", name:"Сайт под ключ", price:"от 95 000 ₽", badge:"", active:true },
  { id:"3", icon:"📱", name:"Telegram Mini App", price:"от 65 000 ₽", badge:"", active:true },
  { id:"4", icon:"✦", name:"AI-агент", price:"от 150 000 ₽", badge:"ТОП", active:true },
];
const initPortfolio: Portfolio[] = [
  { id:"1", title:"Имиджевый ролик", cat:"AI-видео", result:"+40% узнаваемость", featured:true, emoji:"🎬" },
  { id:"2", title:"Лендинг студии", cat:"Сайты", result:"+60% заявок", featured:false, emoji:"🌐" },
  { id:"3", title:"Vision AI App", cat:"Mini App", result:"50K пользователей", featured:true, emoji:"📱" },
  { id:"4", title:"AI-продавец", cat:"AI-агенты", result:"80% автоматизация", featured:false, emoji:"🤖" },
];

const sourceColors: Record<string,string> = { "Чат":"#0052FF", "Avito":"#FF9500", "Сайт":"#00B341", "Telegram":"#2AABEE", "Reels":"#E1306C" };
const leadStatuses = [
  { key:"new", label:"Новые", color:"#888" },
  { key:"contacted", label:"Связались", color:"#0052FF" },
  { key:"qualified", label:"Квалифицированы", color:"#8B5CF6" },
  { key:"proposal", label:"Предложение", color:"#FF9500" },
  { key:"won", label:"Выиграны", color:"#00B341" },
  { key:"lost", label:"Потеряны", color:"#FF3B30" },
];
const projStatuses: Record<string,{ label:string; color:string }> = {
  briefing:{ label:"Бриф", color:"#6A6860" },
  in_progress:{ label:"В работе", color:"#0052FF" },
  review:{ label:"Проверка", color:"#FF9500" },
  done:{ label:"Готово", color:"#00B341" },
};

const ease = [0.16,1,0.3,1] as const;

/* ═══════ SHEET WRAPPER ═══════ */
const Sheet = ({ children, onClose, height="75vh" }: { children: React.ReactNode; onClose:()=>void; height?:string }) => (
  <>
    <motion.div className="fixed inset-0 z-50 bg-black/40" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose} />
    <motion.div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl overflow-y-auto" style={{ maxHeight:height }} initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }} transition={{ duration:0.3, ease }}>
      <div className="flex justify-center pt-3 pb-2"><div className="w-8 h-1 rounded-full bg-[#E0E0E0]" /></div>
      <div className="px-5 pb-24">{children}</div>
    </motion.div>
  </>
);

/* ═══════ TOGGLE ═══════ */
const Toggle = ({ value, onChange }: { value:boolean; onChange:(v:boolean)=>void }) => (
  <button onClick={()=>onChange(!value)} className="flex-shrink-0 rounded-full transition-colors duration-200" style={{ width:40, height:22, background:value?"#00B341":"#E0E0E0", padding:2 }}>
    <div className="rounded-full bg-white transition-transform duration-200" style={{ width:18, height:18, transform:value?"translateX(18px)":"translateX(0)" }} />
  </button>
);

/* ═══════ MAIN PAGE ═══════ */
const AdminPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  usePageTitle("Admin — neeklo");

  const [adminUnlocked, setAdminUnlocked] = useState(() => sessionStorage.getItem("neeklo_admin") === "true");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const [activeTab, setActiveTab] = useState<"dashboard"|"leads"|"projects"|"content">("dashboard");
  const [leads, setLeads] = useState(initLeads);
  const [projects, setProjects] = useState(initProjects);
  const [services, setServices] = useState(initServices);
  const [portfolio, setPortfolio] = useState(initPortfolio);

  const tabs = [
    { key:"dashboard" as const, icon:LayoutDashboard, label:"Дашборд" },
    { key:"leads" as const, icon:Users, label:"Лиды" },
    { key:"projects" as const, icon:FolderOpen, label:"Проекты" },
    { key:"content" as const, icon:Settings, label:"Контент" },
  ];

  if (!adminUnlocked) {
    return (
      <div className="flex items-center justify-center" style={{ height: "100dvh", background: "#F5F5F5" }}>
        <div className="bg-white rounded-3xl p-8 w-full max-w-xs mx-4 shadow-sm text-center">
          <h2 className="font-heading" style={{ fontSize: 20, fontWeight: 800 }}>Введите код доступа</h2>
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={e => { setPin(e.target.value.replace(/\D/g, "")); setPinError(false); }}
            onKeyDown={e => {
              if (e.key === "Enter") {
                if (pin === "2626") { sessionStorage.setItem("neeklo_admin", "true"); setAdminUnlocked(true); }
                else setPinError(true);
              }
            }}
            placeholder="••••"
            className="w-full font-body bg-[#F5F5F5] rounded-xl px-4 py-3 outline-none text-center mt-4 tracking-[0.3em]"
            style={{ fontSize: 20, fontWeight: 700, border: pinError ? "1px solid #FF3B30" : "1px solid transparent" }}
            autoFocus
          />
          {pinError && <p className="font-body mt-2" style={{ fontSize: 13, color: "#FF3B30" }}>Неверный код</p>}
          <button
            onClick={() => { if (pin === "2626") { sessionStorage.setItem("neeklo_admin", "true"); setAdminUnlocked(true); } else setPinError(true); }}
            className="w-full font-body text-white rounded-xl mt-4 cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.97] transition-all"
            style={{ background: "#0D0D0B", padding: "13px 0", fontSize: 15, fontWeight: 600 }}
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F5]">
      {/* Desktop sidebar */}
      {!isMobile && (
        <div className="w-[220px] bg-[#0D0D0B] text-white flex flex-col flex-shrink-0">
          <div className="px-4 py-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"><span style={{ fontSize:12 }}>✦</span></div>
            <span className="font-heading" style={{ fontSize:14, fontWeight:700 }}>neeklo admin</span>
          </div>
          <nav className="flex-1 px-3 mt-2">
            {tabs.map(t=>{
              const Icon=t.icon; const active=activeTab===t.key;
              return (
                <button key={t.key} onClick={()=>setActiveTab(t.key)} className="w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl transition-colors text-left" style={{ background:active?"rgba(255,255,255,0.1)":"transparent" }}>
                  <Icon size={18} strokeWidth={active?2:1.5} />
                  <span className="font-body" style={{ fontSize:14, fontWeight:active?600:400 }}>{t.label}</span>
                </button>
              );
            })}
          </nav>
          <button onClick={()=>navigate("/")} className="px-4 py-3 font-body text-white/50 hover:text-white transition-colors text-left" style={{ fontSize:13 }}>← На сайт</button>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 flex-shrink-0" style={{ height:56, background:"#0D0D0B" }}>
          {isMobile && <span className="font-heading text-white" style={{ fontSize:14, fontWeight:700 }}>neeklo admin</span>}
          {!isMobile && <div />}
          <div className="flex items-center gap-3">
            <button className="text-white/60 hover:text-white transition-colors"><Bell size={18} /></button>
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              <span className="font-body text-white" style={{ fontSize:11, fontWeight:700 }}>НК</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: isMobile?80:24 }}>
          {activeTab==="dashboard" && <DashboardTab leads={leads} projects={projects} setActiveTab={setActiveTab} />}
          {activeTab==="leads" && <LeadsTab leads={leads} setLeads={setLeads} setActiveTab={setActiveTab} />}
          {activeTab==="projects" && <ProjectsTab projects={projects} setProjects={setProjects} />}
          {activeTab==="content" && <ContentTab services={services} setServices={setServices} portfolio={portfolio} setPortfolio={setPortfolio} />}
        </div>

        {/* Mobile bottom tabs */}
        {isMobile && (
          <div className="flex-shrink-0 bg-white border-t border-[#F0F0F0] flex" style={{ height:60, paddingBottom:"env(safe-area-inset-bottom)" }}>
            {tabs.map(t=>{
              const Icon=t.icon; const active=activeTab===t.key;
              return (
                <button key={t.key} onClick={()=>setActiveTab(t.key)} className="flex-1 flex flex-col items-center justify-center gap-0.5">
                  <Icon size={20} strokeWidth={active?2:1.5} color={active?"#0D0D0B":"#888"} />
                  <span className="font-body" style={{ fontSize:10, fontWeight:active?700:500, color:active?"#0D0D0B":"#888" }}>{t.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════ DASHBOARD TAB ═══════ */
const DashboardTab = ({ leads, projects, setActiveTab }: { leads:Lead[]; projects:Project[]; setActiveTab:(t:any)=>void }) => {
  const stats = [
    { label:"Новых лидов", value:"5", trend:"+3 сегодня", icon:UserPlus, color:"#0052FF" },
    { label:"Активных проектов", value:"3", trend:"2 в работе", icon:FolderOpen, color:"#FF9500" },
    { label:"Выручка месяца", value:"₽ 375 000", trend:"+15%", icon:TrendingUp, color:"#00B341" },
    { label:"Конверсия", value:"32%", trend:"↑ хорошо", icon:Target, color:"#8B5CF6" },
  ];
  return (
    <div className="p-4 max-w-[900px] mx-auto">
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((s,i)=>{
          const Icon=s.icon;
          return (
            <motion.div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35, ease, delay:i*0.05 }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background:`${s.color}15` }}><Icon size={18} color={s.color} /></div>
              <p className="font-heading" style={{ fontSize:22, fontWeight:800 }}>{s.value}</p>
              <p className="font-body" style={{ fontSize:12, color:"#6A6860" }}>{s.label}</p>
              <p className="font-body" style={{ fontSize:11, color:"#00B341", marginTop:2 }}>{s.trend}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Recent leads */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-body" style={{ fontSize:15, fontWeight:700 }}>Новые лиды</p>
          <button onClick={()=>setActiveTab("leads")} className="font-body cursor-pointer" style={{ fontSize:13, color:"#0052FF" }}>Все →</button>
        </div>
        {leads.slice(0,3).map(l=>(
          <div key={l.id} className="bg-white rounded-xl p-3 mb-2 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:sourceColors[l.source]||"#888" }} />
            <div className="flex-1 min-w-0">
              <p className="font-body truncate" style={{ fontSize:14, fontWeight:600 }}>{l.name}</p>
              <p className="font-body truncate" style={{ fontSize:12, color:"#6A6860" }}>{l.msg}</p>
            </div>
            <span className="font-body flex-shrink-0" style={{ fontSize:11, color:"#6A6860" }}>{l.time}</span>
          </div>
        ))}
      </div>

      {/* Recent projects */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-body" style={{ fontSize:15, fontWeight:700 }}>Проекты</p>
          <button onClick={()=>setActiveTab("projects")} className="font-body cursor-pointer" style={{ fontSize:13, color:"#0052FF" }}>Все →</button>
        </div>
        {projects.slice(0,3).map(p=>{
          const st=projStatuses[p.status]||{label:p.status,color:"#888"};
          return (
            <div key={p.id} className="bg-white rounded-xl p-3 mb-2 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-body truncate" style={{ fontSize:14, fontWeight:600 }}>{p.title}</p>
                <p className="font-body" style={{ fontSize:12, color:"#6A6860" }}>{p.client}</p>
              </div>
              <span className="font-body rounded-full flex-shrink-0" style={{ fontSize:10, fontWeight:600, padding:"2px 8px", background:`${st.color}15`, color:st.color }}>{st.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════ LEADS TAB ═══════ */
const LeadsTab = ({ leads, setLeads, setActiveTab }: { leads:Lead[]; setLeads:React.Dispatch<React.SetStateAction<Lead[]>>; setActiveTab:(t:any)=>void }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Все");
  const [selectedLead, setSelectedLead] = useState<Lead|null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const filtered = leads.filter(l=>{
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==="Все" || leadStatuses.find(s=>s.label===filter)?.key===l.status;
    return matchSearch && matchFilter;
  });

  const updateStatus = (id:string, status:string) => {
    setLeads(prev=>prev.map(l=>l.id===id?{...l,status}:l));
    toast("Статус обновлён");
  };

  return (
    <div className="p-4 max-w-[900px] mx-auto relative">
      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0B0B0]" />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск по имени..." className="w-full font-body bg-[#F5F5F5] rounded-xl pl-10 pr-4 py-2.5 outline-none" style={{ fontSize:14 }} />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
        {["Все",...leadStatuses.map(s=>s.label)].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className="font-body rounded-full flex-shrink-0 whitespace-nowrap transition-colors cursor-pointer" style={{ fontSize:12, fontWeight:600, padding:"5px 12px", background:filter===f?"#0D0D0B":"transparent", color:filter===f?"#fff":"#6A6860", border:filter===f?"1px solid #0D0D0B":"1px solid #E0E0E0" }}>{f}</button>
        ))}
      </div>

      {/* Cards */}
      {filtered.map((l,i)=>(
        <motion.div key={l.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04, duration:0.3, ease }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-body" style={{ fontSize:15, fontWeight:600 }}>{l.name}</span>
            <span className="font-body rounded-full" style={{ fontSize:10, fontWeight:700, padding:"2px 8px", background:`${sourceColors[l.source]||"#888"}15`, color:sourceColors[l.source]||"#888" }}>{l.source}</span>
          </div>
          <p className="font-body" style={{ fontSize:13, color:"#6A6860" }}>{l.contact} · {l.service}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="font-body flex-1 truncate" style={{ fontSize:13, color:"#888" }}>{l.msg}</p>
            <span className="font-body flex-shrink-0" style={{ fontSize:11, color:"#B0B0B0" }}>{l.time}</span>
          </div>
          <div className="flex gap-2 mt-2">
            <select value={l.status} onChange={e=>updateStatus(l.id,e.target.value)} className="font-body bg-[#F5F5F5] rounded-lg px-2 py-1.5 border-none outline-none cursor-pointer" style={{ fontSize:12 }}>
              {leadStatuses.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <button onClick={()=>setSelectedLead(l)} className="font-body rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer" style={{ fontSize:13, fontWeight:600, border:"1px solid #E0E0E0", padding:"4px 12px" }}>Открыть</button>
          </div>
        </motion.div>
      ))}

      {/* FAB */}
      <button onClick={()=>setShowNewForm(true)} className="fixed z-40 rounded-full bg-[#0D0D0B] shadow-lg flex items-center justify-center cursor-pointer hover:bg-[#1a1a1a] active:scale-90 transition-all" style={{ width:52, height:52, bottom:76, right:16 }}>
        <Plus size={22} color="#fff" />
      </button>

      {/* Lead detail sheet */}
      <AnimatePresence>
        {selectedLead && (
          <Sheet onClose={()=>setSelectedLead(null)}>
            <h2 className="font-heading" style={{ fontSize:20, fontWeight:800 }}>{selectedLead.name}</h2>
            <span className="font-body rounded-full inline-block mt-1" style={{ fontSize:10, fontWeight:700, padding:"2px 8px", background:`${sourceColors[selectedLead.source]||"#888"}15`, color:sourceColors[selectedLead.source]||"#888" }}>{selectedLead.source}</span>

            <div className="flex gap-2 mt-4">
              {selectedLead.contact.startsWith("@") && <a href={`https://t.me/${selectedLead.contact.slice(1)}`} target="_blank" rel="noreferrer" className="font-body text-white rounded-xl px-4 py-2.5 cursor-pointer" style={{ background:"#2AABEE", fontSize:13, fontWeight:600 }}>Написать</a>}
              {selectedLead.contact.startsWith("+") && <a href={`tel:${selectedLead.contact}`} className="font-body text-white rounded-xl px-4 py-2.5 cursor-pointer" style={{ background:"#00B341", fontSize:13, fontWeight:600 }}>Позвонить</a>}
              {selectedLead.contact.includes("@") && !selectedLead.contact.startsWith("@") && <a href={`mailto:${selectedLead.contact}`} className="font-body text-white rounded-xl px-4 py-2.5 cursor-pointer" style={{ background:"#0D0D0B", fontSize:13, fontWeight:600 }}>Email</a>}
            </div>

            <div className="bg-[#F5F5F5] rounded-xl p-3 mt-4"><p className="font-body" style={{ fontSize:14 }}>{selectedLead.msg}</p></div>

            <p className="font-body mt-4 mb-2" style={{ fontSize:13, fontWeight:600 }}>Изменить статус</p>
            <div className="flex flex-wrap gap-2">
              {leadStatuses.map(s=>(
                <button key={s.key} onClick={()=>{updateStatus(selectedLead.id,s.key); setSelectedLead({...selectedLead,status:s.key})}} className="font-body rounded-full cursor-pointer transition-colors" style={{ fontSize:12, fontWeight:600, padding:"5px 12px", background:selectedLead.status===s.key?s.color:s.color+"15", color:selectedLead.status===s.key?"#fff":s.color }}>{s.label}</button>
              ))}
            </div>

            <textarea placeholder="Заметки по лиду..." rows={3} className="w-full mt-4 font-body bg-[#F5F5F5] rounded-xl p-3 outline-none resize-none" style={{ fontSize:14 }} />

            <button onClick={()=>{setSelectedLead(null); setActiveTab("projects"); toast("Проект создан!");}} className="w-full font-body text-white rounded-xl mt-4 cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.97] transition-all" style={{ background:"#0D0D0B", padding:"13px 0", fontSize:15, fontWeight:600 }}>Создать проект</button>
          </Sheet>
        )}
      </AnimatePresence>

      {/* New lead form */}
      <AnimatePresence>
        {showNewForm && (
          <Sheet onClose={()=>setShowNewForm(false)}>
            <NewLeadForm onSave={(l)=>{setLeads(prev=>[l,...prev]); setShowNewForm(false); toast("Лид добавлен!");}} />
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  );
};

const NewLeadForm = ({ onSave }: { onSave:(l:Lead)=>void }) => {
  const [name,setName]=useState(""); const [contact,setContact]=useState(""); const [source,setSource]=useState("Чат"); const [service,setService]=useState("Лендинг"); const [msg,setMsg]=useState("");
  const inputCls = "w-full font-body bg-[#F5F5F5] rounded-xl px-4 py-2.5 outline-none mb-3";
  return (
    <div>
      <h3 className="font-heading mb-4" style={{ fontSize:18, fontWeight:800 }}>Новый лид</h3>
      <input placeholder="Имя" value={name} onChange={e=>setName(e.target.value)} className={inputCls} style={{ fontSize:14 }} />
      <input placeholder="Контакт" value={contact} onChange={e=>setContact(e.target.value)} className={inputCls} style={{ fontSize:14 }} />
      <select value={source} onChange={e=>setSource(e.target.value)} className={inputCls} style={{ fontSize:14 }}>{["Чат","Avito","Сайт","Telegram","Reels"].map(s=><option key={s}>{s}</option>)}</select>
      <select value={service} onChange={e=>setService(e.target.value)} className={inputCls} style={{ fontSize:14 }}>{["Лендинг","AI-агент","Mini App","Сайт","AI-видео"].map(s=><option key={s}>{s}</option>)}</select>
      <textarea placeholder="Сообщение" value={msg} onChange={e=>setMsg(e.target.value)} rows={3} className={`${inputCls} resize-none`} style={{ fontSize:14 }} />
      <button onClick={()=>{if(!name)return; onSave({id:Date.now().toString(),name,contact,source,service,status:"new",time:"Только что",msg});}} className="w-full font-body text-white rounded-xl cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.97] transition-all" style={{ background:"#0D0D0B", padding:"13px 0", fontSize:15, fontWeight:600 }}>Добавить лид</button>
    </div>
  );
};

/* ═══════ PROJECTS TAB ═══════ */
const ProjectsTab = ({ projects, setProjects }: { projects:Project[]; setProjects:React.Dispatch<React.SetStateAction<Project[]>> }) => {
  const [view, setView] = useState<"cards"|"list">("cards");
  const [editProject, setEditProject] = useState<Project|null>(null);

  const columns = ["briefing","in_progress","review","done"];

  return (
    <div className="p-4 max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="font-body" style={{ fontSize:16, fontWeight:700 }}>Проекты</p>
        <div className="flex gap-1 bg-[#F0F0F0] rounded-lg p-0.5">
          {(["cards","list"] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} className="font-body rounded-md px-3 py-1 transition-colors cursor-pointer" style={{ fontSize:12, fontWeight:600, background:view===v?"white":"transparent", color:view===v?"#0D0D0B":"#6A6860" }}>
              {v==="cards"?"Карточки":"Список"}
            </button>
          ))}
        </div>
      </div>

      {view==="cards" ? (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4">
          {columns.map(col=>{
            const st=projStatuses[col]||{label:col,color:"#888"};
            const items=projects.filter(p=>p.status===col);
            return (
              <div key={col} className="min-w-[240px] flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-body" style={{ fontSize:13, fontWeight:700, color:st.color }}>{st.label}</span>
                  <span className="font-body rounded-full" style={{ fontSize:10, fontWeight:700, padding:"1px 6px", background:`${st.color}15`, color:st.color }}>{items.length}</span>
                </div>
                {items.map(p=>(
                  <div key={p.id} onClick={()=>setEditProject(p)} className="bg-white rounded-xl p-3 shadow-sm mb-2 cursor-pointer hover:shadow-md transition-shadow">
                    <p className="font-body" style={{ fontSize:14, fontWeight:600 }}>{p.title}</p>
                    <p className="font-body" style={{ fontSize:12, color:"#6A6860" }}>{p.client}</p>
                    <p className="font-body mt-1" style={{ fontSize:13, fontWeight:700, color:"#0052FF" }}>₽ {p.price.toLocaleString("ru")}</p>
                    <p className="font-body" style={{ fontSize:11, color:"#888" }}>до {p.deadline}</p>
                    <div className="mt-2 w-full h-1 rounded-full bg-[#F0F0F0] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${p.progress}%`, background:st.color }} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((p,i)=>{
            const st=projStatuses[p.status]||{label:p.status,color:"#888"};
            return (
              <motion.div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04, duration:0.3, ease }}>
                <div className="flex-1 min-w-0">
                  <p className="font-body truncate" style={{ fontSize:15, fontWeight:600 }}>{p.title}</p>
                  <p className="font-body" style={{ fontSize:12, color:"#6A6860" }}>{p.client} · ₽ {p.price.toLocaleString("ru")}</p>
                </div>
                <span className="font-body rounded-full flex-shrink-0" style={{ fontSize:10, fontWeight:600, padding:"2px 8px", background:`${st.color}15`, color:st.color }}>{st.label}</span>
                <button onClick={()=>setEditProject(p)} className="font-body flex-shrink-0 cursor-pointer" style={{ fontSize:13, fontWeight:600, color:"#0052FF" }}>Редактировать</button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* FAB */}
      <button onClick={()=>{ const n:Project={id:Date.now().toString(),title:"Новый проект",client:"",status:"briefing",price:0,progress:0,deadline:"",manager:"Никита"}; setProjects(prev=>[n,...prev]); setEditProject(n); }} className="fixed z-40 rounded-full bg-[#0D0D0B] shadow-lg flex items-center justify-center cursor-pointer hover:bg-[#1a1a1a] active:scale-90 transition-all" style={{ width:52, height:52, bottom:76, right:16 }}>
        <Plus size={22} color="#fff" />
      </button>

      <AnimatePresence>
        {editProject && (
          <Sheet onClose={()=>setEditProject(null)} height="85vh">
            <ProjectEditForm project={editProject} onSave={(p)=>{setProjects(prev=>prev.map(x=>x.id===p.id?p:x)); setEditProject(null); toast("Сохранено!");}} />
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProjectEditForm = ({ project, onSave }: { project:Project; onSave:(p:Project)=>void }) => {
  const [p, setP] = useState({...project});
  const inputCls = "w-full font-body bg-[#F5F5F5] rounded-xl px-4 py-2.5 outline-none mb-3";
  return (
    <div>
      <h3 className="font-heading mb-4" style={{ fontSize:18, fontWeight:800 }}>Редактировать проект</h3>
      <label className="font-body block mb-1" style={{ fontSize:12, color:"#6A6860" }}>Название</label>
      <input value={p.title} onChange={e=>setP({...p,title:e.target.value})} className={inputCls} style={{ fontSize:14 }} />
      <label className="font-body block mb-1" style={{ fontSize:12, color:"#6A6860" }}>Клиент</label>
      <input value={p.client} onChange={e=>setP({...p,client:e.target.value})} className={inputCls} style={{ fontSize:14 }} />
      <label className="font-body block mb-1" style={{ fontSize:12, color:"#6A6860" }}>Статус</label>
      <select value={p.status} onChange={e=>setP({...p,status:e.target.value})} className={inputCls} style={{ fontSize:14 }}>
        {Object.entries(projStatuses).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
      </select>
      <label className="font-body block mb-1" style={{ fontSize:12, color:"#6A6860" }}>Прогресс: {p.progress}%</label>
      <input type="range" min={0} max={100} value={p.progress} onChange={e=>setP({...p,progress:+e.target.value})} className="w-full mb-3 accent-[#0D0D0B]" />
      <label className="font-body block mb-1" style={{ fontSize:12, color:"#6A6860" }}>Бюджет</label>
      <input type="number" value={p.price} onChange={e=>setP({...p,price:+e.target.value})} className={inputCls} style={{ fontSize:14 }} />
      <label className="font-body block mb-1" style={{ fontSize:12, color:"#6A6860" }}>Дедлайн</label>
      <input value={p.deadline} onChange={e=>setP({...p,deadline:e.target.value})} className={inputCls} style={{ fontSize:14 }} />
      <label className="font-body block mb-1" style={{ fontSize:12, color:"#6A6860" }}>Менеджер</label>
      <input value={p.manager} onChange={e=>setP({...p,manager:e.target.value})} className={inputCls} style={{ fontSize:14 }} />
      <button onClick={()=>onSave(p)} className="w-full font-body text-white rounded-xl cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.97] transition-all" style={{ background:"#0D0D0B", padding:"13px 0", fontSize:15, fontWeight:600 }}>Сохранить</button>
    </div>
  );
};

/* ═══════ CONTENT TAB ═══════ */
const ContentTab = ({ services, setServices, portfolio, setPortfolio }: { services:Service[]; setServices:React.Dispatch<React.SetStateAction<Service[]>>; portfolio:Portfolio[]; setPortfolio:React.Dispatch<React.SetStateAction<Portfolio[]>> }) => {
  const [subTab, setSubTab] = useState<"services"|"portfolio">("services");
  const [editService, setEditService] = useState<Service|null>(null);
  const [editWork, setEditWork] = useState<Portfolio|null>(null);

  return (
    <div className="p-4 max-w-[900px] mx-auto">
      <div className="flex gap-2 mb-4">
        {(["services","portfolio"] as const).map(t=>(
          <button key={t} onClick={()=>setSubTab(t)} className="font-body rounded-full cursor-pointer transition-colors" style={{ fontSize:13, fontWeight:600, padding:"7px 16px", background:subTab===t?"#0D0D0B":"transparent", color:subTab===t?"#fff":"#6A6860", border:subTab===t?"1px solid #0D0D0B":"1px solid #E0E0E0" }}>
            {t==="services"?"Услуги":"Портфолио"}
          </button>
        ))}
      </div>

      {subTab==="services" && (
        <>
          <p className="font-body mb-4" style={{ fontSize:16, fontWeight:700 }}>Управление услугами</p>
          {services.map(s=>(
            <div key={s.id} onClick={()=>setEditService(s)} className="bg-white rounded-xl p-4 mb-2 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-shadow">
              <span style={{ fontSize:24 }}>{s.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-body" style={{ fontSize:14, fontWeight:600 }}>{s.name}</p>
                <p className="font-body" style={{ fontSize:13, color:"#0052FF" }}>{s.price}</p>
              </div>
              {s.badge && <span className="font-body rounded-full" style={{ fontSize:10, fontWeight:700, padding:"2px 8px", background:"#0D0D0B", color:"#fff" }}>{s.badge}</span>}
              <Toggle value={s.active} onChange={(v)=>{setServices(prev=>prev.map(x=>x.id===s.id?{...x,active:v}:x)); toast(v?"Услуга включена":"Услуга выключена");}} />
            </div>
          ))}
          <button onClick={()=>{const n:Service={id:Date.now().toString(),icon:"📦",name:"Новая услуга",price:"от 0 ₽",badge:"",active:true}; setServices(prev=>[...prev,n]); setEditService(n);}} className="w-full mt-3 py-4 font-body rounded-2xl cursor-pointer transition-colors hover:bg-[#F5F5F5]" style={{ border:"2px dashed #E0E0E0", fontSize:14, color:"#6A6860" }}>+ Добавить услугу</button>
        </>
      )}

      {subTab==="portfolio" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {portfolio.map(w=>(
              <div key={w.id} onClick={()=>setEditWork(w)} className="cursor-pointer">
                <div className="aspect-square bg-[#F5F5F5] rounded-xl flex items-center justify-center text-4xl hover:bg-[#EBEBEB] transition-colors">{w.emoji}</div>
                <p className="font-body mt-1.5" style={{ fontSize:14, fontWeight:600 }}>{w.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <p className="font-body" style={{ fontSize:12, color:"#6A6860" }}>{w.cat}</p>
                  <button onClick={e=>{e.stopPropagation(); setPortfolio(prev=>prev.map(x=>x.id===w.id?{...x,featured:!x.featured}:x));}} className="cursor-pointer"><Star size={14} fill={w.featured?"#FFB800":"none"} color={w.featured?"#FFB800":"#D0D0D0"} /></button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={()=>{const n:Portfolio={id:Date.now().toString(),title:"Новая работа",cat:"Сайты",result:"",featured:false,emoji:"📁"}; setPortfolio(prev=>[...prev,n]); setEditWork(n);}} className="w-full mt-3 py-4 font-body rounded-2xl cursor-pointer transition-colors hover:bg-[#F5F5F5]" style={{ border:"2px dashed #E0E0E0", fontSize:14, color:"#6A6860" }}>+ Добавить работу</button>
        </>
      )}

      {/* Service edit sheet */}
      <AnimatePresence>
        {editService && (
          <Sheet onClose={()=>setEditService(null)}>
            <ServiceEditForm service={editService} onSave={s=>{setServices(prev=>prev.map(x=>x.id===s.id?s:x)); setEditService(null); toast("Сохранено!");}} onDelete={()=>{setServices(prev=>prev.filter(x=>x.id!==editService.id)); setEditService(null); toast("Удалено");}} />
          </Sheet>
        )}
      </AnimatePresence>

      {/* Portfolio edit sheet */}
      <AnimatePresence>
        {editWork && (
          <Sheet onClose={()=>setEditWork(null)}>
            <PortfolioEditForm work={editWork} onSave={w=>{setPortfolio(prev=>prev.map(x=>x.id===w.id?w:x)); setEditWork(null); toast("Сохранено!");}} onDelete={()=>{setPortfolio(prev=>prev.filter(x=>x.id!==editWork.id)); setEditWork(null); toast("Удалено");}} />
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  );
};

const ServiceEditForm = ({ service, onSave, onDelete }: { service:Service; onSave:(s:Service)=>void; onDelete:()=>void }) => {
  const [s,setS]=useState({...service});
  const inputCls="w-full font-body bg-[#F5F5F5] rounded-xl px-4 py-2.5 outline-none mb-3";
  return (
    <div>
      <h3 className="font-heading mb-4" style={{ fontSize:18, fontWeight:800 }}>Редактировать услугу</h3>
      <input value={s.icon} onChange={e=>setS({...s,icon:e.target.value})} placeholder="Emoji" maxLength={2} className={inputCls} style={{ fontSize:14 }} />
      <input value={s.name} onChange={e=>setS({...s,name:e.target.value})} placeholder="Название" className={inputCls} style={{ fontSize:14 }} />
      <input value={s.price} onChange={e=>setS({...s,price:e.target.value})} placeholder="Цена" className={inputCls} style={{ fontSize:14 }} />
      <select value={s.badge} onChange={e=>setS({...s,badge:e.target.value})} className={inputCls} style={{ fontSize:14 }}>
        <option value="">Без бейджа</option><option>ХИТ</option><option>ТОП</option><option>НОВОЕ</option>
      </select>
      <div className="flex items-center justify-between mb-4">
        <span className="font-body" style={{ fontSize:14 }}>Активна</span>
        <Toggle value={s.active} onChange={v=>setS({...s,active:v})} />
      </div>
      <button onClick={()=>onSave(s)} className="w-full font-body text-white rounded-xl cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.97] transition-all mb-2" style={{ background:"#0D0D0B", padding:"13px 0", fontSize:15, fontWeight:600 }}>Сохранить</button>
      <button onClick={onDelete} className="w-full font-body rounded-xl cursor-pointer hover:bg-[#FFF5F5] active:scale-[0.97] transition-all" style={{ border:"1px solid #E0E0E0", padding:"13px 0", fontSize:15, fontWeight:600, color:"#FF3B30" }}>Удалить</button>
    </div>
  );
};

const PortfolioEditForm = ({ work, onSave, onDelete }: { work:Portfolio; onSave:(w:Portfolio)=>void; onDelete:()=>void }) => {
  const [w,setW]=useState({...work});
  const inputCls="w-full font-body bg-[#F5F5F5] rounded-xl px-4 py-2.5 outline-none mb-3";
  return (
    <div>
      <h3 className="font-heading mb-4" style={{ fontSize:18, fontWeight:800 }}>Редактировать работу</h3>
      <input value={w.title} onChange={e=>setW({...w,title:e.target.value})} placeholder="Название" className={inputCls} style={{ fontSize:14 }} />
      <select value={w.cat} onChange={e=>setW({...w,cat:e.target.value})} className={inputCls} style={{ fontSize:14 }}>
        {["AI-видео","Сайты","Mini App","AI-агенты"].map(c=><option key={c}>{c}</option>)}
      </select>
      <input value={w.result} onChange={e=>setW({...w,result:e.target.value})} placeholder="Результат" className={inputCls} style={{ fontSize:14 }} />
      <input value={w.emoji} onChange={e=>setW({...w,emoji:e.target.value})} placeholder="Emoji" maxLength={2} className={inputCls} style={{ fontSize:14 }} />
      <div className="flex items-center justify-between mb-4">
        <span className="font-body" style={{ fontSize:14 }}>Избранное</span>
        <Toggle value={w.featured} onChange={v=>setW({...w,featured:v})} />
      </div>
      <button onClick={()=>onSave(w)} className="w-full font-body text-white rounded-xl cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.97] transition-all mb-2" style={{ background:"#0D0D0B", padding:"13px 0", fontSize:15, fontWeight:600 }}>Сохранить</button>
      <button onClick={onDelete} className="w-full font-body rounded-xl cursor-pointer hover:bg-[#FFF5F5] active:scale-[0.97] transition-all" style={{ border:"1px solid #E0E0E0", padding:"13px 0", fontSize:15, fontWeight:600, color:"#FF3B30" }}>Удалить</button>
    </div>
  );
};

export default AdminPage;
