/**
 * Upserts CMS pages + public chat setting (Prisma / PostgreSQL).
 * Run: node server/seed-cms-content.mjs
 * Env: DATABASE_URL
 */
import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

/** Static bundle files under public/cms-static — upserted into cms_media; blocks use `images: { slot: id }` (+ legacy imageId). */
const STATIC_ASSETS = [
  { k: "mascot", sp: "cms-static/mascot-nobg.webp", pu: "/cms-static/mascot-nobg.webp", mime: "image/webp" },
  { k: "iconVideo", sp: "cms-static/icon-video.png", pu: "/cms-static/icon-video.png", mime: "image/png" },
  { k: "iconWeb", sp: "cms-static/icon-web.png", pu: "/cms-static/icon-web.png", mime: "image/png" },
  { k: "iconApp", sp: "cms-static/icon-app.png", pu: "/cms-static/icon-app.png", mime: "image/png" },
  { k: "iconAi", sp: "cms-static/icon-ai.png", pu: "/cms-static/icon-ai.png", mime: "image/png" },
  { k: "iconDesign", sp: "cms-static/icon-design.png", pu: "/cms-static/icon-design.png", mime: "image/png" },
  { k: "iconAnalytics", sp: "cms-static/icon-analytics.png", pu: "/cms-static/icon-analytics.png", mime: "image/png" },
  { k: "workFashion", sp: "cms-static/work-fashion.webp", pu: "/cms-static/work-fashion.webp", mime: "image/webp" },
  { k: "workStudio", sp: "cms-static/work-studio.webp", pu: "/cms-static/work-studio.webp", mime: "image/webp" },
  { k: "workRacing", sp: "cms-static/work-racing.webp", pu: "/cms-static/work-racing.webp", mime: "image/webp" },
  { k: "workVision", sp: "cms-static/work-vision.webp", pu: "/cms-static/work-vision.webp", mime: "image/webp" },
  { k: "workEcommerce", sp: "cms-static/work-ecommerce.webp", pu: "/cms-static/work-ecommerce.webp", mime: "image/webp" },
  { k: "workAssistant", sp: "cms-static/work-assistant.webp", pu: "/cms-static/work-assistant.webp", mime: "image/webp" },
  { k: "logo", sp: "cms-static/logo.png", pu: "/cms-static/logo.png", mime: "image/png" },
  { k: "logoWhite", sp: "cms-static/logo-white.png", pu: "/cms-static/logo-white.png", mime: "image/png" },
];

async function ensureStaticMediaIds() {
  const M = {};
  for (const a of STATIC_ASSETS) {
    const row = await prisma.media.upsert({
      where: { storagePath: a.sp },
      create: { storagePath: a.sp, publicUrl: a.pu, mime: a.mime },
      update: { publicUrl: a.pu, mime: a.mime },
    });
    M[a.k] = row.id;
  }
  return M;
}

function buildPages(M) {
  return [
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
        images: { mascot: M.mascot },
        ctaLabel: { ru: "Заказать проект", en: "Start a Project" },
        secondaryLabel: { ru: "Смотреть работы", en: "View Our Work" },
        showScrollChevron: true,
      },
      {
        type: "services",
        sectionTitle: { ru: "Продукты", en: "Products" },
        items: [
          { images: { icon: M.iconVideo }, name: { ru: "AI-ролики", en: "AI Videos" }, priceLabel: { ru: "от 25 000 ₽", en: "from 25,000 ₽" } },
          { images: { icon: M.iconWeb }, name: { ru: "Сайты", en: "Websites" }, priceLabel: { ru: "от 95 000 ₽", en: "from 95,000 ₽" } },
          { images: { icon: M.iconApp }, name: { ru: "Mini App", en: "Mini App" }, priceLabel: { ru: "от 65 000 ₽", en: "from 65,000 ₽" } },
          { images: { icon: M.iconAi }, name: { ru: "AI-агенты", en: "AI Agents" }, priceLabel: { ru: "от 150 000 ₽", en: "from 150,000 ₽" } },
          { images: { icon: M.iconDesign }, name: { ru: "Дизайн", en: "Design" }, priceLabel: { ru: "от 30 000 ₽", en: "from 30,000 ₽" } },
          { images: { icon: M.iconAnalytics }, name: { ru: "Аналитика", en: "Analytics" }, priceLabel: { ru: "от 60 000 ₽", en: "from 60,000 ₽" } },
        ],
      },
      {
        type: "cases",
        sectionTitle: { ru: "Наши работы", en: "Our Work" },
        seeAllLabel: { ru: "Все работы", en: "All Works" },
        seeAllPath: "/works",
        itemNavigatePath: "/cases",
        mobileSeeAllLabel: { ru: "Смотреть все", en: "See all" },
        items: [
          {
            images: { cover: M.workFashion },
            cat: { ru: "AI-видео", en: "AI Video" },
            title: { ru: "Имиджевый ролик", en: "Brand Film" },
            result: { ru: "+40% узнаваемость", en: "+40% awareness" },
            featured: true,
          },
          {
            images: { cover: M.workStudio },
            cat: { ru: "Сайт", en: "Website" },
            title: { ru: "Лендинг студии", en: "Studio Landing Page" },
            result: { ru: "+60% заявок", en: "+60% leads" },
            featured: false,
          },
          {
            images: { cover: M.workRacing },
            cat: { ru: "AI-видео", en: "AI Video" },
            title: { ru: "Промо для бренда", en: "Brand Promo" },
            result: { ru: "2M просмотров", en: "2M views" },
            featured: false,
          },
          {
            images: { cover: M.workVision },
            cat: { ru: "Mini App", en: "Mini App" },
            title: { ru: "Vision AI App", en: "Vision AI App" },
            result: { ru: "50K пользователей", en: "50K users" },
            featured: false,
          },
          {
            images: { cover: M.workEcommerce },
            cat: { ru: "Сайт", en: "Website" },
            title: { ru: "Интернет-магазин", en: "E-commerce Store" },
            result: { ru: "+120% конверсия", en: "+120% conversion" },
            featured: false,
          },
          {
            images: { cover: M.workAssistant },
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
        type: "steps",
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
        type: "cta",
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
            images: { cover: M.workAssistant },
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
      resultPrefix: "Результат:",
      viewCta: "Смотреть",
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
            images: { cover: M.workFashion },
          },
          {
            name: { ru: "Корпоративный сайт", en: "Corporate website" },
            tag: "sites",
            tagLabel: { ru: "Сайты", en: "Websites" },
            result: { ru: "+120% заявок", en: "+120% leads" },
            images: { cover: M.workEcommerce },
          },
          {
            name: { ru: "Loyalty Mini App", en: "Loyalty Mini App" },
            tag: "mini-app",
            tagLabel: { ru: "Mini App", en: "Mini App" },
            result: { ru: "50K пользователей", en: "50K users" },
            images: { cover: M.workVision },
          },
          {
            name: { ru: "AI-ассистент продаж", en: "AI sales assistant" },
            tag: "ai",
            tagLabel: { ru: "AI", en: "AI" },
            result: { ru: "−60% времени ответа", en: "−60% response time" },
            images: { cover: M.workAssistant },
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
      resultPrefix: "Result:",
      viewCta: "View",
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
    meta: {
      chatHeaderTitle: { ru: "neeklo AI", en: "neeklo AI" },
      chatStatusLabel: { ru: "онлайн", en: "online" },
      chatInputPlaceholder: { ru: "Напишите сообщение…", en: "Type a message…" },
    },
    blocks: [{ type: "chat_config", welcomeMessage: "Здравствуйте! Чем могу помочь?" }],
  },
  {
    slug: "chat",
    title: "Chat",
    locale: "en",
    published: true,
    meta: {
      chatHeaderTitle: { ru: "neeklo AI", en: "neeklo AI" },
      chatStatusLabel: { ru: "онлайн", en: "online" },
      chatInputPlaceholder: { ru: "Напишите сообщение…", en: "Type a message…" },
    },
    blocks: [{ type: "chat_config", welcomeMessage: "Hi! How can I help?" }],
  },
  {
    slug: "services",
    title: "Услуги",
    locale: "ru",
    published: true,
    meta: {
      subtitle: { ru: "Выберите подходящее решение", en: "Choose a solution that fits" },
      footerTitle: { ru: "Не нашли нужное?", en: "Didn't find what you need?" },
      footerSubtitle: { ru: "Опишите задачу — предложим решение", en: "Describe the task — we'll suggest a solution" },
      footerButton: { ru: "Написать в чат →", en: "Message in chat →" },
      orderLabel: { ru: "Заказать", en: "Order" },
    },
    blocks: [
      {
        type: "services_grid",
        items: [
          {
            id: "s1",
            images: { icon: M.iconVideo },
            name: "AI-ролики",
            badge: "ХИТ",
            badgeColor: "#0D0D0B",
            priceFrom: 25000,
            days: 5,
            priceLine: { ru: "от 25 000 ₽", en: "from 25,000 ₽" },
            durationLine: { ru: "5 дн", en: "5 d" },
            shortDesc: "Рекламные ролики с нейросетями за 5 дней",
            includes: ["Сценарий", "AI-генерация", "Монтаж"],
            tags: ["Runway", "Kling"],
          },
          {
            id: "s2",
            images: { icon: M.iconWeb },
            name: "Сайт под ключ",
            priceFrom: 95000,
            days: 14,
            priceLine: { ru: "от 95 000 ₽", en: "from 95,000 ₽" },
            durationLine: { ru: "14 дн", en: "14 d" },
            shortDesc: "Современный сайт с AI-ассистентом и SEO",
            includes: ["Дизайн", "React", "AI-ассистент"],
            tags: ["React", "SEO"],
          },
        ],
      },
    ],
  },
  {
    slug: "services",
    title: "Services",
    locale: "en",
    published: true,
    meta: {},
    blocks: [],
  },
];
}

async function main() {
  const M = await ensureStaticMediaIds();
  const pages = buildPages(M);

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

  const servicesRu = pages.find((p) => p.slug === "services" && p.locale === "ru");
  const servicesEn = pages.find((p) => p.slug === "services" && p.locale === "en");
  if (servicesEn && servicesRu?.blocks?.length) {
    servicesEn.blocks = clone(servicesRu.blocks);
    servicesEn.meta = clone(servicesRu.meta ?? {});
  }

  for (const row of pages) {
    try {
      await prisma.page.upsert({
        where: {
          slug_locale: { slug: row.slug, locale: row.locale },
        },
        create: {
          slug: row.slug,
          title: row.title,
          locale: row.locale,
          published: row.published,
          blocks: row.blocks,
          meta: row.meta,
        },
        update: {
          title: row.title,
          published: row.published,
          blocks: row.blocks,
          meta: row.meta,
        },
      });
      console.log("[seed-cms] upsert", row.slug, row.locale);
    } catch (e) {
      console.error("[seed-cms] page", row.slug, row.locale, e.message);
      process.exitCode = 1;
    }
  }

  try {
    await prisma.cmsSetting.upsert({
      where: { key: "public.chat.site_api_key" },
      create: {
        key: "public.chat.site_api_key",
        value: Prisma.JsonNull,
        isPublic: true,
      },
      update: { isPublic: true },
    });
    await prisma.cmsSetting.upsert({
      where: { key: "public.chat.default_assistant_id" },
      create: {
        key: "public.chat.default_assistant_id",
        value: Prisma.JsonNull,
        isPublic: true,
      },
      update: {},
    });
    for (const key of ["public.brand.logo_url", "public.brand.logo_white_url"]) {
      await prisma.cmsSetting.upsert({
        where: { key },
        create: { key, value: null, isPublic: true },
        update: { isPublic: true },
      });
    }
    console.log("[seed-cms] settings ok (set site_api_key in admin after creating assistant)");
  } catch (e) {
    console.error("[seed-cms] setting", e.message);
    process.exitCode = 1;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
