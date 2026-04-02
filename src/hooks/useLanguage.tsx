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

  // Services (landing)
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

  // Services page
  "sp.title": { ru: "Услуги", en: "Services" },
  "sp.subtitle": { ru: "Выберите подходящее решение для вашего бизнеса", en: "Choose the right solution for your business" },
  "sp.all": { ru: "Все", en: "All" },
  "sp.aiVideo": { ru: "AI-видео", en: "AI Video" },
  "sp.sites": { ru: "Сайты", en: "Websites" },
  "sp.miniApp": { ru: "Mini App", en: "Mini App" },
  "sp.aiAgents": { ru: "AI-агенты", en: "AI Agents" },
  "sp.automation": { ru: "Автоматизация", en: "Automation" },
  "sp.from": { ru: "от", en: "from" },
  "sp.days": { ru: "дней", en: "days" },
  "sp.deadline": { ru: "Срок:", en: "Timeline:" },
  "sp.details": { ru: "Подробнее", en: "Details" },
  "sp.order": { ru: "Заказать", en: "Order" },
  "sp.included": { ru: "Что входит:", en: "What's included:" },
  "sp.workDays": { ru: "рабочих дней", en: "business days" },
  "sp.orderProduct": { ru: "Заказать этот продукт →", en: "Order this product →" },
  "sp.priceRange": { ru: "от {from} до {to} ₽", en: "from {from} to {to} ₽" },

  // Service names (for ServicesPage data)
  "sn.aiRoliki": { ru: "AI-ролики", en: "AI Videos" },
  "sn.saitPodKlyuch": { ru: "Сайт под ключ", en: "Turnkey Website" },
  "sn.landing": { ru: "Лендинг", en: "Landing Page" },
  "sn.tgMiniApp": { ru: "Telegram Mini App", en: "Telegram Mini App" },
  "sn.aiAgent": { ru: "AI-агент продаж", en: "AI Sales Agent" },
  "sn.tgBot": { ru: "Telegram-бот", en: "Telegram Bot" },
  "sn.aiContent": { ru: "AI-контент пакет", en: "AI Content Package" },
  "sn.automation": { ru: "Автоматизация", en: "Automation" },

  // Service descriptions
  "sd.aiRoliki": { ru: "Создание рекламных роликов с помощью нейросетей. Runway, Kling, Sora – подбираем инструмент под задачу.", en: "Creating promotional videos with neural networks. Runway, Kling, Sora — we choose the right tool for your task." },
  "sd.saitPodKlyuch": { ru: "Лендинг или корпоративный сайт с AI-контентом, анимациями и SEO.", en: "Landing page or corporate website with AI content, animations, and SEO." },
  "sd.landing": { ru: "Продающий одностраничник за 7 дней. Конверсионная структура, современный дизайн.", en: "High-converting one-pager in 7 days. Conversion-focused structure, modern design." },
  "sd.tgMiniApp": { ru: "Полноценное приложение внутри Telegram. Каталог, запись, оплата, CRM.", en: "Full-featured app inside Telegram. Catalog, booking, payments, CRM." },
  "sd.aiAgent": { ru: "AI-ассистент который квалифицирует лидов, отвечает 24/7 и ведёт в CRM.", en: "AI assistant that qualifies leads, responds 24/7, and feeds into your CRM." },
  "sd.tgBot": { ru: "Бот для приёма заявок, поддержки, рассылок и автоматизации процессов.", en: "Bot for receiving inquiries, support, newsletters, and process automation." },
  "sd.aiContent": { ru: "Фото и видео с нейросетями для соцсетей, рекламы, сайта.", en: "AI-generated photos and videos for social media, ads, and websites." },
  "sd.automation": { ru: "n8n / Make сценарии, API-интеграции, CRM-связки. Избавляем от ручной рутины.", en: "n8n / Make scenarios, API integrations, CRM connections. Eliminate manual work." },

  // Service includes
  "si.scriptStoryboard": { ru: "Сценарий и раскадровка", en: "Script and storyboard" },
  "si.aiVideoGen": { ru: "Генерация видео AI", en: "AI video generation" },
  "si.voiceover": { ru: "Озвучка и монтаж", en: "Voiceover and editing" },
  "si.revisions2": { ru: "До 2 правок", en: "Up to 2 revisions" },
  "si.figmaDesign": { ru: "Дизайн в Figma", en: "Design in Figma" },
  "si.reactDev": { ru: "Верстка на React/Lovable", en: "React/Lovable development" },
  "si.seo": { ru: "SEO-оптимизация", en: "SEO optimization" },
  "si.analytics": { ru: "Подключение аналитики", en: "Analytics integration" },
  "si.proto2days": { ru: "Прототип за 2 дня", en: "Prototype in 2 days" },
  "si.adaptive": { ru: "Адаптив mobile/desktop", en: "Mobile/desktop responsive" },
  "si.formCrm": { ru: "Форма заявки + CRM", en: "Lead form + CRM" },
  "si.fastLoad": { ru: "Быстрая загрузка", en: "Fast loading" },
  "si.uiux": { ru: "UI/UX дизайн", en: "UI/UX design" },
  "si.frontBack": { ru: "Frontend + Backend", en: "Frontend + Backend" },
  "si.payment": { ru: "Оплата Stars / ЮKassa", en: "Stars / YooKassa payments" },
  "si.support1m": { ru: "Поддержка 1 месяц", en: "1 month support" },
  "si.dialogScenarios": { ru: "Сценарии диалогов", en: "Dialog scenarios" },
  "si.gptIntegration": { ru: "GPT/YandexGPT интеграция", en: "GPT/YandexGPT integration" },
  "si.crmConnect": { ru: "Подключение к CRM", en: "CRM connection" },
  "si.requestAnalytics": { ru: "Аналитика обращений", en: "Request analytics" },
  "si.scenarioDesign": { ru: "Проектирование сценариев", en: "Scenario design" },
  "si.aiogramDev": { ru: "Разработка на aiogram", en: "Development on aiogram" },
  "si.integrations": { ru: "Интеграции (CRM, оплата)", en: "Integrations (CRM, payments)" },
  "si.testLaunch": { ru: "Тестирование и запуск", en: "Testing and launch" },
  "si.aiImages": { ru: "10-30 изображений AI", en: "10-30 AI images" },
  "si.shortVideos": { ru: "3-5 коротких роликов", en: "3-5 short videos" },
  "si.contentPlan": { ru: "Контент-план на месяц", en: "Monthly content plan" },
  "si.branding": { ru: "Брендирование", en: "Branding" },
  "si.processAudit": { ru: "Аудит процессов", en: "Process audit" },
  "si.n8nDev": { ru: "Разработка на n8n/Make", en: "n8n/Make development" },
  "si.serviceIntegration": { ru: "Интеграция с вашими сервисами", en: "Integration with your services" },
  "si.docsTraining": { ru: "Документация и обучение", en: "Documentation and training" },

  // Works (landing)
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

  // Works page
  "wp.title": { ru: "Наши работы", en: "Our Work" },
  "wp.projectCount": { ru: "150+ проектов", en: "150+ projects" },
  "wp.subtitle": { ru: "Реальные кейсы и результаты наших клиентов", en: "Real cases and results from our clients" },
  "wp.all": { ru: "Все", en: "All" },
  "wp.sites": { ru: "Сайты", en: "Websites" },
  "wp.videos": { ru: "Ролики", en: "Videos" },
  "wp.miniApp": { ru: "Mini App", en: "Mini App" },
  "wp.ai": { ru: "AI", en: "AI" },
  "wp.platforms": { ru: "Платформы", en: "Platforms" },
  "wp.task": { ru: "Задача", en: "Challenge" },
  "wp.solution": { ru: "Решение", en: "Solution" },
  "wp.orderSimilar": { ru: "Заказать похожий проект", en: "Order a similar project" },
  "wp.prev": { ru: "← Предыдущий", en: "← Previous" },
  "wp.next": { ru: "Следующий →", en: "Next →" },
  "wp.ctaTitle": { ru: "Хотите такой же проект?", en: "Want a similar project?" },
  "wp.ctaSubtitle": { ru: "Расскажите задачу – предложим решение за 1 час", en: "Tell us your task — we'll propose a solution within 1 hour" },
  "wp.ctaButton": { ru: "Обсудить проект →", en: "Discuss a project →" },
  "wp.openSite": { ru: "Открыть сайт ↗", en: "Open website ↗" },

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

  // Projects page
  "proj.title": { ru: "Мои проекты", en: "My Projects" },
  "proj.active": { ru: "Активные", en: "Active" },
  "proj.done": { ru: "Завершённые", en: "Completed" },
  "proj.inProgress": { ru: "В работе", en: "In Progress" },
  "proj.onReview": { ru: "На проверке", en: "Under Review" },
  "proj.sum": { ru: "Сумма", en: "Total" },
  "proj.startFirst": { ru: "Начни первый проект", en: "Start your first project" },
  "proj.startFirstDesc": { ru: "Опиши задачу в чат — AI соберёт бриф, а менеджер возьмёт проект в работу", en: "Describe your task in chat — AI will create a brief and a manager will take on the project" },
  "proj.startProject": { ru: "Начать проект →", en: "Start a project →" },
  "proj.completed": { ru: "выполнено", en: "completed" },
  "proj.open": { ru: "Открыть →", en: "Open →" },
  "proj.paid": { ru: "Оплачено", en: "Paid" },
  "proj.paidFull": { ru: "Оплачен ✓", en: "Paid ✓" },
  "proj.budget": { ru: "Бюджет", en: "Budget" },
  "proj.deadline": { ru: "Дедлайн", en: "Deadline" },
  "proj.progress": { ru: "Прогресс", en: "Progress" },
  "proj.description": { ru: "Описание", en: "Description" },
  "proj.stages": { ru: "Этапы работы", en: "Work stages" },
  "proj.manager": { ru: "Менеджер", en: "Manager" },
  "proj.write": { ru: "Написать", en: "Message" },
  "proj.overview": { ru: "Обзор", en: "Overview" },
  "proj.tasks": { ru: "Задачи", en: "Tasks" },
  "proj.chat": { ru: "Чат", en: "Chat" },
  "proj.tasksCompleted": { ru: "задач выполнено", en: "tasks completed" },
  "proj.chatManager": { ru: "Чат с менеджером", en: "Chat with manager" },
  "proj.chatDesc": { ru: "Здесь будет история переписки по проекту", en: "Project conversation history will appear here" },
  "proj.writeManager": { ru: "Написать менеджеру →", en: "Message manager →" },
  "proj.acceptWork": { ru: "Принять работу ✓", en: "Accept work ✓" },
  "proj.orderMore": { ru: "Заказать ещё →", en: "Order more →" },
  "proj.workAccepted": { ru: "Работа принята! Менеджер получит уведомление.", en: "Work accepted! Manager will be notified." },

  // Status labels
  "status.new": { ru: "Новый", en: "New" },
  "status.briefing": { ru: "Сбор брифа", en: "Briefing" },
  "status.inProgress": { ru: "В работе", en: "In Progress" },
  "status.review": { ru: "На проверке", en: "Under Review" },
  "status.done": { ru: "Завершён", en: "Completed" },
  "status.cancelled": { ru: "Отменён", en: "Cancelled" },

  // Profile page
  "profile.login": { ru: "Войдите в аккаунт", en: "Sign in to your account" },
  "profile.loginDesc": { ru: "Чтобы видеть проекты и общаться с менеджером", en: "To view projects and communicate with a manager" },
  "profile.signIn": { ru: "Войти", en: "Sign In" },
  "profile.register": { ru: "Зарегистрироваться", en: "Sign Up" },
  "profile.projects": { ru: "Проектов", en: "Projects" },
  "profile.activeProjects": { ru: "Активных", en: "Active" },
  "profile.completedProjects": { ru: "Завершённых", en: "Completed" },
  "profile.myProjects": { ru: "Мои проекты", en: "My Projects" },
  "profile.writeChat": { ru: "Написать в чат", en: "Write in Chat" },
  "profile.notifications": { ru: "Уведомления", en: "Notifications" },
  "profile.settings": { ru: "Настройки", en: "Settings" },
  "profile.privacy": { ru: "Политика конфиденциальности", en: "Privacy Policy" },
  "profile.support": { ru: "Поддержка", en: "Support" },
  "profile.logout": { ru: "Выйти", en: "Sign Out" },
  "profile.loggedOut": { ru: "Вы вышли из аккаунта", en: "You have signed out" },
  "profile.client": { ru: "Клиент", en: "Client" },

  // Settings page
  "settings.title": { ru: "Настройки", en: "Settings" },
  "settings.notifications": { ru: "Уведомления", en: "Notifications" },
  "settings.notifDesc": { ru: "Включены", en: "Enabled" },
  "settings.theme": { ru: "Тема", en: "Theme" },
  "settings.themeDesc": { ru: "Светлая", en: "Light" },
  "settings.language": { ru: "Язык", en: "Language" },
  "settings.langDesc": { ru: "Русский", en: "English" },
  "settings.security": { ru: "Безопасность", en: "Security" },
  "settings.help": { ru: "Помощь", en: "Help" },

  // Cases page
  "cases.title": { ru: "Наши работы", en: "Our Work" },
  "cases.projectCount": { ru: "150+ проектов", en: "150+ projects" },
  "cases.subtitle": { ru: "Реальные кейсы и результаты наших клиентов", en: "Real cases and results from our clients" },
  "cases.all": { ru: "Все", en: "All" },
  "cases.sites": { ru: "Сайты", en: "Websites" },
  "cases.videos": { ru: "Ролики", en: "Videos" },
  "cases.miniApp": { ru: "Mini App", en: "Mini App" },
  "cases.ai": { ru: "AI", en: "AI" },
  "cases.result": { ru: "Результат:", en: "Result:" },
  "cases.view": { ru: "Смотреть", en: "View" },

  // ServiceDetail page
  "sdet.notFound": { ru: "Услуга не найдена", en: "Service not found" },
  "sdet.backServices": { ru: "Услуги", en: "Services" },
  "sdet.included": { ru: "Что входит", en: "What's included" },
  "sdet.timeline": { ru: "Срок выполнения", en: "Timeline" },
  "sdet.howItWorks": { ru: "Как это работает", en: "How it works" },
  "sdet.examples": { ru: "Примеры работ", en: "Work examples" },
  "sdet.soon": { ru: "Скоро", en: "Soon" },
  "sdet.orderService": { ru: "Заказать эту услугу", en: "Order this service" },

  // ServiceDetail data
  "sdet.aiRoliki.title": { ru: "AI-ролики", en: "AI Videos" },
  "sdet.aiRoliki.price": { ru: "от 25 000 ₽", en: "from 25,000 ₽" },
  "sdet.aiRoliki.desc": { ru: "Создаём рекламные и имиджевые ролики с использованием нейросетей – от сценария до финального монтажа. Нейросети генерируют визуал, озвучку и музыку. Вы получаете готовый контент для соцсетей, рекламы и презентаций за считанные дни.", en: "We create promotional and brand videos using neural networks — from script to final edit. AI generates visuals, voiceover, and music. You get ready-made content for social media, ads, and presentations in just a few days." },
  "sdet.aiRoliki.timeline": { ru: "3–7 дней", en: "3–7 days" },
  "sdet.sait.title": { ru: "Сайт под ключ", en: "Turnkey Website" },
  "sdet.sait.price": { ru: "от 95 000 ₽", en: "from 95,000 ₽" },
  "sdet.sait.desc": { ru: "Разрабатываем лендинги и корпоративные сайты с современным дизайном и AI-элементами. Адаптивная вёрстка, SEO-оптимизация, подключение аналитики и форм заявок. Готовый результат с полной документацией.", en: "We develop landing pages and corporate websites with modern design and AI elements. Responsive layout, SEO optimization, analytics and lead form integration. Finished product with full documentation." },
  "sdet.sait.timeline": { ru: "14–21 день", en: "14–21 days" },
  "sdet.miniApp.title": { ru: "Telegram Mini App", en: "Telegram Mini App" },
  "sdet.miniApp.price": { ru: "от 65 000 ₽", en: "from 65,000 ₽" },
  "sdet.miniApp.desc": { ru: "Создаём мини-приложения внутри Telegram для бизнеса: магазины, сервисы бронирования, программы лояльности. Пользователи взаимодействуют с вашим продуктом прямо в мессенджере без установки отдельного приложения.", en: "We create mini-apps inside Telegram for businesses: stores, booking services, loyalty programs. Users interact with your product right in the messenger without installing a separate app." },
  "sdet.miniApp.timeline": { ru: "10–18 дней", en: "10–18 days" },
  "sdet.aiAgent.title": { ru: "AI-агент", en: "AI Agent" },
  "sdet.aiAgent.price": { ru: "от 150 000 ₽", en: "from 150,000 ₽" },
  "sdet.aiAgent.desc": { ru: "Внедряем интеллектуальных AI-агентов для автоматизации бизнес-процессов: обработка заявок, консультации клиентов, квалификация лидов. Агент работает 24/7, обучается на ваших данных и интегрируется с CRM.", en: "We implement intelligent AI agents to automate business processes: handling inquiries, client consultations, lead qualification. The agent works 24/7, learns from your data, and integrates with your CRM." },
  "sdet.aiAgent.timeline": { ru: "14–30 дней", en: "14–30 days" },
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
