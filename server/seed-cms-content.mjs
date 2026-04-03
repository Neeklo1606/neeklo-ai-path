/**
 * Upserts CMS pages + public chat setting (Supabase service role).
 * Run: node server/seed-cms-content.mjs
 * Env: SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("[seed-cms] Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const STATIC = "/cms-static";

const pages = [
  {
    slug: "home",
    title: "neeklo — Сайты и AI-агенты под ключ",
    locale: "ru",
    published: true,
    meta: {},
    blocks: [
      {
        type: "hero",
        title: { ru: "Сайты и AI-агенты\nпод ключ", en: "Websites & AI Agents\nTurnkey Solutions" },
        subtitle: { ru: "Пиши задачу. Получай результат.", en: "Describe your task. Get results." },
        mascotUrl: `${STATIC}/mascot-nobg.webp`,
        ctaLabel: { ru: "Заказать проект", en: "Start a Project" },
        secondaryLabel: { ru: "Смотреть работы", en: "View Our Work" },
        showScrollChevron: true,
      },
      {
        type: "services_preview",
        sectionTitle: { ru: "Продукты", en: "Products" },
        items: [
          { iconUrl: `${STATIC}/icon-video.png`, name: { ru: "AI-ролики", en: "AI Videos" }, priceLabel: { ru: "от 25 000 ₽", en: "from 25,000 ₽" } },
          { iconUrl: `${STATIC}/icon-web.png`, name: { ru: "Сайты", en: "Websites" }, priceLabel: { ru: "от 95 000 ₽", en: "from 95,000 ₽" } },
          { iconUrl: `${STATIC}/icon-app.png`, name: { ru: "Mini App", en: "Mini App" }, priceLabel: { ru: "от 65 000 ₽", en: "from 65,000 ₽" } },
          { iconUrl: `${STATIC}/icon-ai.png`, name: { ru: "AI-агенты", en: "AI Agents" }, priceLabel: { ru: "от 150 000 ₽", en: "from 150,000 ₽" } },
          { iconUrl: `${STATIC}/icon-design.png`, name: { ru: "Дизайн", en: "Design" }, priceLabel: { ru: "от 30 000 ₽", en: "from 30,000 ₽" } },
          { iconUrl: `${STATIC}/icon-analytics.png`, name: { ru: "Аналитика", en: "Analytics" }, priceLabel: { ru: "от 60 000 ₽", en: "from 60,000 ₽" } },
        ],
      },
      {
        type: "cases_preview",
        sectionTitle: { ru: "Наши работы", en: "Our Work" },
        seeAllLabel: { ru: "Все работы", en: "All Works" },
        seeAllPath: "/works",
        itemNavigatePath: "/cases",
        mobileSeeAllLabel: { ru: "Смотреть все", en: "See all" },
        items: [
          {
            imageUrl: `${STATIC}/work-fashion.webp`,
            cat: { ru: "AI-видео", en: "AI Video" },
            title: { ru: "Имиджевый ролик", en: "Brand Film" },
            result: { ru: "+40% узнаваемость", en: "+40% awareness" },
            featured: true,
          },
          {
            imageUrl: `${STATIC}/work-studio.webp`,
            cat: { ru: "Сайт", en: "Website" },
            title: { ru: "Лендинг студии", en: "Studio Landing Page" },
            result: { ru: "+60% заявок", en: "+60% leads" },
            featured: false,
          },
          {
            imageUrl: `${STATIC}/work-racing.webp`,
            cat: { ru: "AI-видео", en: "AI Video" },
            title: { ru: "Промо для бренда", en: "Brand Promo" },
            result: { ru: "2M просмотров", en: "2M views" },
            featured: false,
          },
          {
            imageUrl: `${STATIC}/work-vision.webp`,
            cat: { ru: "Mini App", en: "Mini App" },
            title: { ru: "Vision AI App", en: "Vision AI App" },
            result: { ru: "50K пользователей", en: "50K users" },
            featured: false,
          },
          {
            imageUrl: `${STATIC}/work-ecommerce.webp`,
            cat: { ru: "Сайт", en: "Website" },
            title: { ru: "Интернет-магазин", en: "E-commerce Store" },
            result: { ru: "+120% конверсия", en: "+120% conversion" },
            featured: false,
          },
          {
            imageUrl: `${STATIC}/work-assistant.webp`,
            cat: { ru: "AI", en: "AI" },
            title: { ru: "AI-ассистент", en: "AI Assistant" },
            result: { ru: "80% автоматизация", en: "80% automation" },
            featured: false,
          },
        ],
      },
      {
        type: "reviews",
        title: { ru: "Отзывы клиентов", en: "Client Reviews" },
        items: [
          {
            name: "Анна",
            date: { ru: "2 дня назад", en: "2 days ago" },
            text: {
              ru: "Сделали ролик к запуску за неделю. Всё чётко, правки учли быстро.",
              en: "They delivered a launch video in a week. Clear process, quick revisions.",
            },
          },
          {
            name: "Михаил",
            date: { ru: "неделю назад", en: "a week ago" },
            text: {
              ru: "Сайт + чат-бот на сайте. Заявок стало заметно больше.",
              en: "Website + on-site chatbot. We’re getting noticeably more leads.",
            },
          },
          {
            name: "Ксения",
            date: { ru: "2 недели назад", en: "2 weeks ago" },
            text: {
              ru: "Mini App в Telegram — удобно клиентам, нам проще вести записи.",
              en: "Telegram Mini App — easier for clients, simpler booking for us.",
            },
          },
        ],
        avitoUrl: "",
        avitoLabel: { ru: "Смотреть на Авито →", en: "View on Avito →" },
      },
      {
        type: "how_steps",
        title: { ru: "Как это работает", en: "How It Works" },
        steps: [
          {
            num: "01",
            title: { ru: "Опиши задачу", en: "Describe Your Task" },
            desc: { ru: "Напиши в чат, AI задаст уточняющие вопросы", en: "Write in chat, AI will ask clarifying questions" },
          },
          {
            num: "02",
            title: { ru: "AI собирает бриф", en: "AI Creates a Brief" },
            desc: { ru: "Формирует ТЗ, срок и предварительную стоимость", en: "Generates specs, timeline and estimated cost" },
          },
          {
            num: "03",
            title: { ru: "Менеджер берёт в работу", en: "Manager Takes Over" },
            desc: { ru: "Обсуждаете детали, подписываете, стартуем", en: "Discuss details, sign off, and we begin" },
          },
        ],
        footerNote: { ru: "Первая консультация бесплатно", en: "First consultation is free" },
      },
      {
        type: "cta_simple",
        title: { ru: "Готовы обсудить проект?", en: "Ready to talk?" },
        subtitle: { ru: "Напишите в чат — ответим с вариантами сроков и бюджета.", en: "Message us in chat — we’ll reply with timelines and budget options." },
        buttonLabel: { ru: "Открыть чат", en: "Open chat" },
        buttonHref: "/chat",
      },
    ],
  },
  {
    slug: "home",
    title: "neeklo — Websites & AI Agents | Turnkey Solutions",
    locale: "en",
    published: true,
    meta: {},
    blocks: [],
  },
  {
    slug: "legal",
    title: "Правовые документы",
    locale: "ru",
    published: true,
    meta: {},
    blocks: [
      {
        type: "legal_docs",
        entries: {
          privacy: {
            title: { ru: "Политика конфиденциальности", en: "Privacy policy" },
            body: {
              ru: "Текст политики конфиденциальности. Отредактируйте в CMS (страница legal, блок legal_docs).",
              en: "Privacy policy text. Edit in CMS (page legal, block legal_docs).",
            },
          },
          terms: {
            title: { ru: "Пользовательское соглашение", en: "Terms of use" },
            body: {
              ru: "Текст соглашения. Редактируйте в CMS.",
              en: "Terms text. Edit in CMS.",
            },
          },
        },
      },
    ],
  },
  {
    slug: "legal",
    title: "Legal",
    locale: "en",
    published: true,
    meta: {},
    blocks: [
      {
        type: "legal_docs",
        entries: {
          privacy: {
            title: { ru: "Политика конфиденциальности", en: "Privacy policy" },
            body: {
              ru: "Текст политики конфиденциальности. Отредактируйте в CMS (страница legal, блок legal_docs).",
              en: "Privacy policy text. Edit in CMS (page legal, block legal_docs).",
            },
          },
          terms: {
            title: { ru: "Пользовательское соглашение", en: "Terms of use" },
            body: {
              ru: "Текст соглашения. Редактируйте в CMS.",
              en: "Terms text. Edit in CMS.",
            },
          },
        },
      },
    ],
  },
  {
    slug: "works",
    title: "Работы",
    locale: "ru",
    published: true,
    meta: {
      subtitle: "Кейсы, сайты, AI и mini apps",
      projectCount: "15+ проектов",
      ctaTitle: "Хотите так же?",
      ctaSubtitle: "Расскажите о задаче в чате — подберём формат.",
      ctaButton: "Написать в чат",
    },
    blocks: [
      {
        type: "works_grid",
        filterTabs: [
          { key: "all", label: { ru: "Все", en: "All" } },
          { key: "ai", label: { ru: "AI", en: "AI" } },
          { key: "mini-app", label: { ru: "Mini App", en: "Mini App" } },
          { key: "sites", label: { ru: "Сайты", en: "Websites" } },
          { key: "platforms", label: { ru: "Платформы", en: "Platforms" } },
          { key: "videos", label: { ru: "Ролики", en: "Videos" } },
        ],
        items: [
          {
            id: 1,
            filterKey: "ai",
            cat: { ru: "AI", en: "AI" },
            title: { ru: "Голосовой AI-ассистент", en: "Voice AI assistant" },
            result: { ru: "80% автоматизация", en: "80% automation" },
            tags: ["Voice AI", "Telegram"],
            bg: "linear-gradient(135deg,#0a0a1a,#1a1035)",
            emoji: "🎙️",
          },
          {
            id: 2,
            filterKey: "ai",
            cat: { ru: "AI", en: "AI" },
            title: { ru: "AI-анализ договоров", en: "AI contract review" },
            result: { ru: "Ускорение ×5", en: "5× faster" },
            tags: ["GPT-4", "Python"],
            bg: "linear-gradient(135deg,#0a1a0a,#0d2d1a)",
            emoji: "📄",
          },
          {
            id: 3,
            filterKey: "mini-app",
            cat: { ru: "Mini App", en: "Mini App" },
            title: { ru: "DA-Motors Mini App", en: "DA-Motors Mini App" },
            result: { ru: "+80% заявок", en: "+80% leads" },
            tags: ["Telegram", "React"],
            bg: "linear-gradient(135deg,#1a0808,#2d1010)",
            emoji: "🚗",
          },
          {
            id: 4,
            filterKey: "sites",
            cat: { ru: "Сайты", en: "Websites" },
            title: { ru: "АВИС — B2B", en: "AVIS — B2B" },
            result: { ru: "+200% заявок", en: "+200% leads" },
            tags: ["React", "B2B"],
            bg: "linear-gradient(135deg,#0a1020,#152040)",
            emoji: "🛡️",
          },
          {
            id: 5,
            filterKey: "videos",
            cat: { ru: "Ролики", en: "Videos" },
            title: { ru: "Совкомбанк 3D", en: "Sovcombank 3D" },
            result: { ru: "Корп.", en: "Corporate" },
            tags: ["3D", "AI"],
            bg: "linear-gradient(135deg,#0a1628,#1a3060)",
            emoji: "🏦",
          },
        ],
      },
    ],
  },
  {
    slug: "works",
    title: "Work",
    locale: "en",
    published: true,
    meta: {
      subtitle: "Cases, sites, AI and mini apps",
      projectCount: "15+ projects",
      ctaTitle: "Want the same?",
      ctaSubtitle: "Tell us in chat — we’ll pick the format.",
      ctaButton: "Open chat",
    },
    blocks: [], // copy from RU programmatically below
  },
  {
    slug: "cases",
    title: "Наши работы",
    locale: "ru",
    published: true,
    meta: {
      subtitle: "Подборка результатов по направлениям",
      projectCount: "6 кейсов",
    },
    blocks: [
      {
        type: "cases_list",
        filters: [
          { key: "all", label: { ru: "Все", en: "All" } },
          { key: "sites", label: { ru: "Сайты", en: "Websites" } },
          { key: "videos", label: { ru: "Ролики", en: "Videos" } },
          { key: "mini-app", label: { ru: "Mini App", en: "Mini App" } },
          { key: "ai", label: { ru: "AI", en: "AI" } },
        ],
        items: [
          {
            name: { ru: "Fashion Brand Promo", en: "Fashion Brand Promo" },
            tag: "videos",
            tagLabel: { ru: "Ролики", en: "Videos" },
            result: { ru: "+40% конверсия", en: "+40% conversion" },
          },
          {
            name: { ru: "Корпоративный сайт", en: "Corporate website" },
            tag: "sites",
            tagLabel: { ru: "Сайты", en: "Websites" },
            result: { ru: "+120% заявок", en: "+120% leads" },
          },
          {
            name: { ru: "Loyalty Mini App", en: "Loyalty Mini App" },
            tag: "mini-app",
            tagLabel: { ru: "Mini App", en: "Mini App" },
            result: { ru: "50K пользователей", en: "50K users" },
          },
          {
            name: { ru: "AI-ассистент продаж", en: "AI sales assistant" },
            tag: "ai",
            tagLabel: { ru: "AI", en: "AI" },
            result: { ru: "−60% времени ответа", en: "−60% response time" },
          },
        ],
      },
    ],
  },
  {
    slug: "cases",
    title: "Our work",
    locale: "en",
    published: true,
    meta: {
      subtitle: "Results by direction",
      projectCount: "6 cases",
    },
    blocks: [],
  },
  {
    slug: "projects",
    title: "Проекты",
    locale: "ru",
    published: true,
    meta: {
      emptyTitle: { ru: "Начните первый проект", en: "Start your first project" },
      emptyDesc: {
        ru: "Здесь будет статус заказов. Оформите бриф в чате.",
        en: "Order status will appear here. Start with chat.",
      },
      emptyCta: { ru: "Открыть чат", en: "Open chat" },
    },
    blocks: [
      {
        type: "projects_data",
        items: [
          {
            id: "demo-1",
            emoji: "🎬",
            title: "Демо-проект из CMS",
            service: "Видео",
            status: "in_progress",
            price: 50000,
            paid: 25000,
            deadline: "15 апр",
            progress: 45,
            manager: "Никита К.",
            brief: "Пример карточки проекта. Данные из блока projects_data.",
            tasks: [
              { title: "Сценарий", done: true },
              { title: "Монтаж", done: false },
            ],
            timeline: ["Бриф", "Продакшн", "Сдача"],
            currentStep: 1,
          },
        ],
      },
    ],
  },
  {
    slug: "projects",
    title: "Projects",
    locale: "en",
    published: true,
    meta: {
      emptyTitle: { ru: "Начните первый проект", en: "Start your first project" },
      emptyDesc: {
        ru: "Здесь будет статус заказов. Оформите бриф в чате.",
        en: "Order status will appear here. Start with chat.",
      },
      emptyCta: { ru: "Открыть чат", en: "Open chat" },
    },
    blocks: [],
  },
  {
    slug: "chat",
    title: "Чат",
    locale: "ru",
    published: true,
    meta: {},
    blocks: [{ type: "chat_config", welcomeMessage: "Здравствуйте! Чем могу помочь?" }],
  },
  {
    slug: "chat",
    title: "Chat",
    locale: "en",
    published: true,
    meta: {},
    blocks: [{ type: "chat_config", welcomeMessage: "Hi! How can I help?" }],
  },
];

const worksRu = pages.find((p) => p.slug === "works" && p.locale === "ru");
const casesRu = pages.find((p) => p.slug === "cases" && p.locale === "ru");
const projectsRu = pages.find((p) => p.slug === "projects" && p.locale === "ru");

const worksEn = pages.find((p) => p.slug === "works" && p.locale === "en");
const clone = (x) => JSON.parse(JSON.stringify(x));
if (worksEn && worksRu?.blocks?.length) worksEn.blocks = clone(worksRu.blocks);

const casesEn = pages.find((p) => p.slug === "cases" && p.locale === "en");
if (casesEn && casesRu?.blocks?.length) casesEn.blocks = clone(casesRu.blocks);

const projectsEn = pages.find((p) => p.slug === "projects" && p.locale === "en");
if (projectsEn && projectsRu?.blocks?.length) projectsEn.blocks = clone(projectsRu.blocks);

const homeRu = pages.find((p) => p.slug === "home" && p.locale === "ru");
const homeEn = pages.find((p) => p.slug === "home" && p.locale === "en");
if (homeEn && homeRu?.blocks?.length) homeEn.blocks = clone(homeRu.blocks);

async function main() {
  for (const row of pages) {
    const { error } = await sb.from("cms_pages").upsert(
      {
        slug: row.slug,
        title: row.title,
        locale: row.locale,
        published: row.published,
        blocks: row.blocks,
        meta: row.meta,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug,locale" }
    );
    if (error) {
      console.error("[seed-cms] page", row.slug, row.locale, error.message);
      process.exitCode = 1;
    } else {
      console.log("[seed-cms] upsert", row.slug, row.locale);
    }
  }

  const { error: sErr } = await sb.from("cms_settings").upsert(
    {
      key: "public.chat.site_api_key",
      value: null,
      is_public: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );
  if (sErr) console.error("[seed-cms] setting", sErr.message);
  else console.log("[seed-cms] upsert public.chat.site_api_key (set value in admin after creating assistant)");
}

main();
