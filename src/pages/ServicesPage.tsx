import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

interface Service {
  id: string;
  emoji: string;
  name: string;
  badge: string;
  badgeColor: string;
  priceFrom: number;
  days: number;
  shortDesc: string;
  fullDesc: string;
  tags: string[];
  steps: string[];
  includes: string[];
  result: string;
  bg: string;
  category: string;
}

const services: Service[] = [
  { id:'s1', emoji:'🎬', name:'AI-ролики', badge:'ХИТ', badgeColor:'#0D0D0B', priceFrom:25000, days:5, shortDesc:'Рекламные ролики с нейросетями за 5 дней', fullDesc:'Создаём имиджевые и рекламные ролики с помощью Runway, Kling, Sora. Сценарий, генерация, монтаж, озвучка — всё под ключ.', tags:['Runway','Kling','Монтаж','Озвучка'], steps:['Бриф (1 день)','Сценарий','Генерация сцен','Монтаж + звук','Сдача'], includes:['Сценарий','AI-генерация сцен','Профессиональный монтаж','Озвучка / музыка','2 правки'], result:'Готовый ролик для Reels, TikTok, презентации', bg:'linear-gradient(135deg,#1a0808 0%,#2d1515 100%)', category:'AI-видео' },
  { id:'s2', emoji:'🌐', name:'Сайт под ключ', badge:'', badgeColor:'', priceFrom:95000, days:14, shortDesc:'Современный сайт с AI-ассистентом', fullDesc:'Разрабатываем лендинги и корпоративные сайты на React. Дизайн, верстка, AI-чат, SEO, аналитика — всё включено.', tags:['React','Lovable','SEO','AI-чат'], steps:['Бриф (1-2 дня)','Дизайн','Верстка','Тест','Сдача'], includes:['Дизайн в Figma','React-разработка','AI-ассистент','SEO-оптимизация','Адаптив','1 мес поддержки'], result:'Продающий сайт с высокой конверсией', bg:'linear-gradient(135deg,#0f1535 0%,#1e3a7a 100%)', category:'Сайты' },
  { id:'s3', emoji:'📱', name:'Telegram Mini App', badge:'', badgeColor:'', priceFrom:65000, days:21, shortDesc:'Полноценное приложение внутри Telegram', fullDesc:'Создаём Mini App для каталога, записи, оплаты, личного кабинета. Дешевле мобильного приложения в 5 раз.', tags:['Telegram','React','Python','Stars'], steps:['Бриф','UI/UX','Frontend','Backend','Запуск'], includes:['UI/UX дизайн','Frontend React','Backend API','Оплата Stars/ЮKassa','Админ-панель','2 мес поддержки'], result:'Работающий сервис внутри Telegram', bg:'linear-gradient(135deg,#0d0d18 0%,#1a1a35 100%)', category:'Mini App' },
  { id:'s4', emoji:'✦', name:'AI-агент', badge:'ТОП', badgeColor:'#0052FF', priceFrom:150000, days:14, shortDesc:'Автоматизация продаж и поддержки 24/7', fullDesc:'Разрабатываем AI-агентов на GPT-4 для автоматизации продаж, поддержки клиентов, квалификации лидов. Интеграция с CRM.', tags:['GPT-4','n8n','amoCRM','Telegram'], steps:['Бриф','Сценарии диалогов','Разработка','Интеграция CRM','Запуск'], includes:['AI на GPT-4','Сценарии продаж','CRM-интеграция','Telegram-бот','Аналитика','1 мес поддержки'], result:'80% обращений обрабатывается автоматически', bg:'linear-gradient(135deg,#0a0a0a 0%,#252525 100%)', category:'AI-агенты' },
  { id:'s5', emoji:'🎨', name:'Дизайн и брендинг', badge:'', badgeColor:'', priceFrom:30000, days:7, shortDesc:'Логотип, фирменный стиль, UI/UX', fullDesc:'Создаём визуальный образ бренда: логотип, фирменный стиль, брендбук, UI-кит для продукта.', tags:['Figma','Брендбук','UI-кит','Логотип'], steps:['Бриф','Концепции (3 шт)','Правки','Финал','Файлы'], includes:['Логотип (3 варианта)','Фирменные цвета и шрифты','Брендбук PDF','UI-кит','Все форматы файлов'], result:'Профессиональный визуальный образ бренда', bg:'linear-gradient(135deg,#1a0a1a 0%,#2d1535 100%)', category:'Дизайн' },
  { id:'s6', emoji:'⚡', name:'Автоматизация', badge:'', badgeColor:'', priceFrom:60000, days:14, shortDesc:'Бизнес-процессы на автопилоте', fullDesc:'Автоматизируем рутину: CRM-интеграции, API-связки, воронки продаж, уведомления, отчёты через n8n/Make.', tags:['n8n','Make','API','CRM'], steps:['Аудит процессов','Архитектура','Разработка','Тест','Запуск'], includes:['Аудит текущих процессов','Схема автоматизации','Разработка на n8n/Make','API-интеграции','Документация'], result:'Экономия 20-40 часов в месяц на рутине', bg:'linear-gradient(135deg,#0a1a0a 0%,#153520 100%)', category:'Автоматизация' },
];

const filters = ['Все','AI-видео','Сайты','Mini App','AI-агенты','Дизайн','Автоматизация'];
const ease = [0.16, 1, 0.3, 1] as const;

/* ─── Detail Modal ─── */
const DetailModal = ({ service, onClose, isMobile, navigate }: { service: Service; onClose: () => void; isMobile: boolean; navigate: ReturnType<typeof useNavigate> }) => {
  const handleOrder = () => { onClose(); navigate('/chat'); };

  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/50" style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className={`fixed z-50 bg-white overflow-y-auto ${isMobile ? 'inset-x-0 bottom-0 rounded-t-[28px]' : 'inset-0 flex items-center justify-center'}`}
        style={isMobile ? { maxHeight: '88dvh' } : undefined}
        initial={isMobile ? { y: '100%' } : { scale: 0.92, opacity: 0 }}
        animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
        exit={isMobile ? { y: '100%' } : { scale: 0.92, opacity: 0 }}
        transition={{ duration: isMobile ? 0.35 : 0.3, ease }}
        onClick={isMobile ? undefined : (e) => e.target === e.currentTarget && onClose()}
      >
        <div className={`bg-white overflow-y-auto ${isMobile ? '' : 'rounded-3xl max-w-[560px] w-full mx-4'}`} style={isMobile ? undefined : { maxHeight: '88dvh' }}>
          {/* Hero */}
          <div className="relative" style={{ height: 180, background: service.bg, borderRadius: isMobile ? 0 : '24px 24px 0 0' }}>
            <div className="absolute inset-0 flex items-center justify-center text-[64px]" style={{ opacity: 0.8 }}>{service.emoji}</div>
            <div className="absolute inset-x-0 bottom-0 h-20" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)' }} />
            <button onClick={onClose} className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
              <X size={20} color="white" />
            </button>
            {service.badge && (
              <span className="absolute top-3 left-3 text-white rounded-full" style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', background: service.badgeColor }}>{service.badge}</span>
            )}
          </div>

          {/* Body */}
          <div className="px-5 pb-8 pt-5">
            {isMobile && <div className="w-9 h-1 rounded-full mx-auto mb-4" style={{ background: '#E0E0E0' }} />}
            <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: '#0D0D0B' }}>{service.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-body" style={{ fontSize: 16, fontWeight: 700, color: '#0052FF' }}>от {service.priceFrom.toLocaleString('ru')} ₽</span>
              <span className="font-body" style={{ fontSize: 14, color: '#6A6860' }}>· {service.days} дней</span>
            </div>

            {/* Result */}
            <div className="mt-3 flex gap-2 items-start rounded-2xl px-4 py-3" style={{ background: '#F0FFF4', border: '1px solid #86EFAC' }}>
              <span style={{ color: '#00B341', fontSize: 16 }}>✓</span>
              <span className="font-body" style={{ fontSize: 14, fontWeight: 600, color: '#00B341' }}>{service.result}</span>
            </div>

            {/* Description */}
            <div className="mt-4">
              <p className="font-body uppercase tracking-wide" style={{ fontSize: 11, fontWeight: 600, color: '#B0B0B0', marginBottom: 8 }}>О услуге</p>
              <p className="font-body" style={{ fontSize: 15, lineHeight: 1.65, color: '#3A3A3A' }}>{service.fullDesc}</p>
            </div>

            {/* Includes */}
            <div className="mt-5">
              <p className="font-body uppercase tracking-wide" style={{ fontSize: 11, fontWeight: 600, color: '#B0B0B0', marginBottom: 8 }}>Что входит</p>
              <div className="flex flex-col gap-2">
                {service.includes.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#F0F0F0' }}>
                      <span style={{ color: '#00B341', fontSize: 12, fontWeight: 700 }}>✓</span>
                    </div>
                    <span className="font-body" style={{ fontSize: 14, color: '#0D0D0B' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Process */}
            <div className="mt-5">
              <p className="font-body uppercase tracking-wide" style={{ fontSize: 11, fontWeight: 600, color: '#B0B0B0', marginBottom: 12 }}>Как работаем</p>
              <div className="flex gap-0 overflow-x-auto scrollbar-hide">
                {service.steps.map((step, i) => (
                  <div key={step} className="flex items-start flex-shrink-0" style={{ minWidth: 80 }}>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: i === 0 ? '#0D0D0B' : '#F0F0F0', color: i === 0 ? '#fff' : '#6A6860', fontSize: 12, fontWeight: 700 }}>{i + 1}</div>
                        {i < service.steps.length - 1 && <div className="h-[2px] w-6" style={{ background: '#E0E0E0' }} />}
                      </div>
                      <p className="font-body text-center mt-2 px-1" style={{ fontSize: 11, color: '#6A6860' }}>{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="mt-5">
              <p className="font-body uppercase tracking-wide" style={{ fontSize: 11, fontWeight: 600, color: '#B0B0B0', marginBottom: 8 }}>Инструменты</p>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span key={tag} className="font-body rounded-full" style={{ background: '#F5F5F5', fontSize: 12, fontWeight: 600, color: '#6A6860', padding: '4px 12px' }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="sticky bottom-0 bg-white pt-3" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
              <button onClick={handleOrder} className="w-full flex items-center justify-center gap-2 text-white rounded-2xl font-body active:scale-[0.97] hover:-translate-y-[1px] transition-all duration-150" style={{ background: '#0D0D0B', padding: '16px 0', fontSize: 15, fontWeight: 700 }}>
                Заказать {service.name} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

/* ─── Page ─── */
const ServicesPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  usePageTitle('Услуги – neeklo');

  const [activeFilter, setActiveFilter] = useState('Все');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const filtered = activeFilter === 'Все' ? services : services.filter(s => s.category === activeFilter);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#F0EEE8', paddingBottom: 100 }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-6">
        <h1 className="font-heading" style={{ fontSize: 28, fontWeight: 800, color: '#0D0D0B' }}>Услуги</h1>
        <p className="font-body mt-1" style={{ fontSize: 15, color: '#6A6860' }}>Выберите подходящее решение</p>
      </div>

      {/* Filters */}
      <div className="px-5 mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2">
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} className="font-body whitespace-nowrap rounded-full flex-shrink-0 active:scale-[0.97] transition-all duration-150" style={{ fontSize: 13, fontWeight: 600, padding: '6px 16px', background: activeFilter === f ? '#0D0D0B' : '#fff', color: activeFilter === f ? '#fff' : '#6A6860', border: activeFilter === f ? '1px solid #0D0D0B' : '1px solid #E0E0E0' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-5 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {filtered.map((s, i) => (
          <motion.div
            key={s.id}
            className="bg-white rounded-[20px] overflow-hidden cursor-pointer hover:-translate-y-[3px] hover:shadow-lg active:scale-[0.98] transition-all duration-200"
            style={{ border: '1px solid #F0F0F0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease, delay: i * 0.07 }}
            onClick={() => setSelectedService(s)}
          >
            {/* Card hero */}
            <div className="relative" style={{ height: 120, background: s.bg }}>
              <div className="absolute inset-0 flex items-center justify-center text-[48px]" style={{ opacity: 0.8 }}>{s.emoji}</div>
              {s.badge && (
                <span className="absolute top-3 right-3 text-white rounded-full" style={{ fontSize: 11, fontWeight: 700, padding: '3px 12px', background: s.badgeColor }}>{s.badge}</span>
              )}
            </div>
            {/* Card body */}
            <div className="p-4">
              <p className="font-body" style={{ fontSize: 18, fontWeight: 700, color: '#0D0D0B' }}>{s.name}</p>
              <div className="mt-1 flex items-center">
                <span className="font-body" style={{ fontSize: 15, fontWeight: 600, color: '#0052FF' }}>от {s.priceFrom.toLocaleString('ru')} ₽</span>
                <span className="font-body ml-2" style={{ fontSize: 13, color: '#6A6860' }}>· {s.days} дней</span>
              </div>
              <p className="font-body mt-2 line-clamp-2" style={{ fontSize: 14, color: '#6A6860', lineHeight: 1.5 }}>{s.shortDesc}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.tags.map(tag => (
                  <span key={tag} className="font-body rounded-full" style={{ background: '#F5F5F5', fontSize: 11, fontWeight: 500, color: '#6A6860', padding: '3px 10px' }}>{tag}</span>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={(e) => { e.stopPropagation(); setSelectedService(s); }} className="flex-1 font-body rounded-xl text-center active:scale-[0.97] hover:bg-[#F5F5F5] transition-all duration-150" style={{ border: '1px solid #E0E0E0', background: '#fff', padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#0D0D0B' }}>
                  Подробнее
                </button>
                <button onClick={(e) => { e.stopPropagation(); navigate('/chat'); }} className="flex-1 font-body text-white rounded-xl text-center active:scale-[0.97] hover:bg-[#1a1a1a] transition-all duration-150" style={{ background: '#0D0D0B', padding: '12px 16px', fontSize: 14, fontWeight: 700 }}>
                  Заказать
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="mt-16 flex flex-col items-center text-center px-8">
          <span style={{ fontSize: 40 }}>🔍</span>
          <p className="font-body mt-3" style={{ fontSize: 15, fontWeight: 600, color: '#0D0D0B' }}>Услуг в этой категории пока нет</p>
          <button onClick={() => setActiveFilter('Все')} className="font-body mt-4 rounded-2xl px-6 py-3 active:scale-[0.97] transition-all" style={{ border: '1px solid #E0E0E0', fontSize: 14, fontWeight: 600 }}>Покажем все</button>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mx-5 mt-8 rounded-2xl px-5 py-12 text-center" style={{ background: '#0D0D0B' }}>
        <h2 className="font-heading text-white" style={{ fontSize: 22, fontWeight: 800 }}>Не нашли нужное?</h2>
        <p className="font-body mt-2 mb-6" style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)' }}>Опишите задачу — предложим решение</p>
        <button onClick={() => navigate('/chat')} className="font-body rounded-2xl px-8 py-4 active:scale-[0.97] hover:-translate-y-[1px] transition-all duration-150" style={{ background: '#fff', color: '#0D0D0B', fontSize: 15, fontWeight: 700 }}>
          Написать в чат →
        </button>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedService && <DetailModal service={selectedService} onClose={() => setSelectedService(null)} isMobile={isMobile} navigate={navigate} />}
      </AnimatePresence>
    </div>
  );
};

export default ServicesPage;
