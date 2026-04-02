import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Lang = "ru" | "en";

const translations = {
  // Nav
  "nav.home": { ru: "Главная", en: "Home" },
  "nav.chat": { ru: "Чат", en: "Chat" },
  "nav.services": { ru: "Услуги", en: "Services" },
  "nav.works": { ru: "Работы", en: "Works" },
  "nav.projects": { ru: "Проекты", en: "Projects" },
  "nav.profile": { ru: "Профиль", en: "Profile" },
  "nav.notifications": { ru: "Уведомления", en: "Notifications" },
  "nav.settings": { ru: "Настройки", en: "Settings" },
  "nav.account": { ru: "Аккаунт", en: "Account" },

  // Hero
  "hero.title1": { ru: "Сайты и AI-агенты", en: "Websites & AI Agents" },
  "hero.title2": { ru: "под ключ", en: "Turnkey Solutions" },
  "hero.subtitle": { ru: "Пиши задачу. Получай результат.", en: "Describe your task. Get results." },
  "hero.cta": { ru: "Заказать проект", en: "Start a Project" },
  "hero.works": { ru: "Смотреть работы", en: "View Our Work" },

  // Services
  "services.title": { ru: "Продукты", en: "Products" },
  "services.aiVideo": { ru: "AI-ролики", en: "AI Videos" },
  "services.websites": { ru: "Сайты", en: "Websites" },
  "services.miniApp": { ru: "Mini App", en: "Mini App" },
  "services.aiAgents": { ru: "AI-агенты", en: "AI Agents" },
  "services.design": { ru: "Дизайн", en: "Design" },
  "services.analytics": { ru: "Аналитика", en: "Analytics" },
  "services.priceFrom": { ru: "от", en: "from" },
  "services.badgeHit": { ru: "ХИТ", en: "HOT" },
  "services.badgeTop": { ru: "ТОП", en: "TOP" },

  // Works
  "works.title": { ru: "Наши работы", en: "Our Work" },
  "works.all": { ru: "Все работы", en: "All Works" },
  "works.cat.aiVideo": { ru: "AI-видео", en: "AI Video" },
  "works.cat.site": { ru: "Сайт", en: "Website" },
  "works.cat.sites": { ru: "Сайты", en: "Websites" },
  "works.cat.miniApp": { ru: "Mini App", en: "Mini App" },
  "works.cat.ai": { ru: "AI", en: "AI" },
  "works.item1": { ru: "Имиджевый ролик", en: "Brand Film" },
  "works.item2": { ru: "Лендинг студии", en: "Studio Landing Page" },
  "works.item3": { ru: "Промо для бренда", en: "Brand Promo" },
  "works.item4": { ru: "Vision AI App", en: "Vision AI App" },
  "works.item5": { ru: "Интернет-магазин", en: "E-commerce Store" },
  "works.item6": { ru: "AI-ассистент", en: "AI Assistant" },
  "works.res1": { ru: "+40% узнаваемость", en: "+40% awareness" },
  "works.res2": { ru: "+60% заявок", en: "+60% leads" },
  "works.res3": { ru: "2M просмотров", en: "2M views" },
  "works.res4": { ru: "50K пользователей", en: "50K users" },
  "works.res5": { ru: "+120% конверсия", en: "+120% conversion" },
  "works.res6": { ru: "80% автоматизация", en: "80% automation" },

  // Reviews
  "reviews.title": { ru: "Отзывы клиентов", en: "Client Reviews" },
  "reviews.avito": { ru: "Смотреть на Авито →", en: "View on Avito →" },

  // How
  "how.title": { ru: "Как это работает", en: "How It Works" },
  "how.step1.title": { ru: "Опиши задачу", en: "Describe Your Task" },
  "how.step1.desc": { ru: "Напиши в чат, AI задаст уточняющие вопросы", en: "Write in chat, AI will ask clarifying questions" },
  "how.step2.title": { ru: "AI собирает бриф", en: "AI Creates a Brief" },
  "how.step2.desc": { ru: "Формирует ТЗ, срок и предварительную стоимость", en: "Generates specs, timeline and estimated cost" },
  "how.step3.title": { ru: "Менеджер берёт в работу", en: "Manager Takes Over" },
  "how.step3.desc": { ru: "Обсуждаете детали, подписываете, стартуем", en: "Discuss details, sign off, and we begin" },
  "how.free": { ru: "Первая консультация бесплатно", en: "First consultation is free" },

  // CTA / Feedback
  "cta.title": { ru: "Как вам наш сервис?", en: "How do you like our service?" },
  "cta.subtitle": { ru: "3 шага. Меньше минуты", en: "3 steps. Less than a minute" },
  "cta.rate": { ru: "Оцените сервис", en: "Rate our service" },
  "cta.next": { ru: "Далее", en: "Next" },
  "cta.improve": { ru: "Чем можно улучшить?", en: "How can we improve?" },
  "cta.improvePlaceholder": { ru: "Ваши пожелания...", en: "Your suggestions..." },
  "cta.opinion": { ru: "Своё мнение", en: "Your opinion" },
  "cta.opinionPlaceholder": { ru: "Что ещё хотите сказать...", en: "Anything else you'd like to say..." },
  "cta.send": { ru: "Отправить", en: "Submit" },
  "cta.thanks": { ru: "Спасибо!", en: "Thank you!" },
  "cta.thanksDesc": { ru: "Ваше мнение помогает нам стать лучше", en: "Your feedback helps us improve" },
  "cta.telegram": { ru: "Наш Telegram", en: "Our Telegram" },

  // Footer
  "footer.desc": { ru: "AI-продакшн студия.\nСайты, Mini App, AI-агенты и видео.", en: "AI production studio.\nWebsites, Mini Apps, AI agents and video." },
  "footer.services": { ru: "Услуги", en: "Services" },
  "footer.navigation": { ru: "Навигация", en: "Navigation" },
  "footer.contacts": { ru: "Контакты", en: "Contacts" },
  "footer.startProject": { ru: "Начать проект", en: "Start a Project" },
  "footer.home": { ru: "Главная", en: "Home" },
  "footer.chat": { ru: "Чат", en: "Chat" },
  "footer.ourWorks": { ru: "Наши работы", en: "Our Works" },
  "footer.aiVideos": { ru: "AI-ролики", en: "AI Videos" },
  "footer.websiteKey": { ru: "Сайт под ключ", en: "Turnkey Website" },
  "footer.tgMiniApp": { ru: "Telegram Mini App", en: "Telegram Mini App" },
  "footer.aiAgent": { ru: "AI-агент", en: "AI Agent" },
  "footer.automation": { ru: "Автоматизация", en: "Automation" },
  "footer.privacy": { ru: "Политика конфиденциальности", en: "Privacy Policy" },
  "footer.offer": { ru: "Публичная оферта", en: "Terms of Service" },
  "footer.cookies": { ru: "Политика Cookie", en: "Cookie Policy" },

  // Telegram button
  "tg.writeManager": { ru: "Написать менеджеру", en: "Contact Manager" },

  // Page title
  "pageTitle": { ru: "neeklo — Сайты и AI-агенты под ключ", en: "neeklo — Websites & AI Agents | Turnkey Solutions" },
} as const;

type TranslationKey = keyof typeof translations;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("neeklo_lang");
    return (saved === "en" ? "en" : "ru") as Lang;
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("neeklo_lang", l);
    document.documentElement.lang = l;
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "ru" ? "en" : "ru");
  }, [lang, setLang]);

  const t = useCallback((key: TranslationKey): string => {
    return translations[key]?.[lang] ?? key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
