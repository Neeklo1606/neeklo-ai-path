-- CMS core: pages (JSON blocks), media metadata, settings, assistants
-- Public read for published pages + media; mutations via service role (API server only)

CREATE TABLE public.cms_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  locale TEXT NOT NULL DEFAULT 'ru',
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  published BOOLEAN NOT NULL DEFAULT false,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, locale)
);

CREATE TABLE public.cms_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  mime TEXT,
  alt TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.cms_settings (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL DEFAULT 'null'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.cms_assistants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  api_key_hash TEXT NOT NULL,
  api_key_prefix TEXT NOT NULL DEFAULT '',
  provider TEXT NOT NULL DEFAULT 'openai',
  base_url TEXT,
  model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  system_prompt TEXT,
  provider_api_key TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX cms_pages_slug_locale_idx ON public.cms_pages (slug, locale);
CREATE INDEX cms_pages_published_idx ON public.cms_pages (published);

ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_assistants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published cms_pages"
  ON public.cms_pages FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Anyone can read cms_media"
  ON public.cms_media FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read public cms_settings"
  ON public.cms_settings FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

-- Inserts for contact_requests already exist; no direct client writes to CMS tables

INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-media', 'cms-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read cms-media" ON storage.objects;
CREATE POLICY "Public read cms-media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'cms-media');

-- Seed: services page (RU) — same structure consumed by ServicesPage
INSERT INTO public.cms_pages (slug, title, locale, published, blocks, meta)
VALUES (
  'services',
  'Услуги',
  'ru',
  true,
  '[
    {"type":"services_grid","items":[
      {"id":"s1","iconAsset":"icon-video","name":"AI-ролики","badge":"ХИТ","badgeColor":"#0D0D0B","priceFrom":25000,"days":5,"shortDesc":"Рекламные ролики с нейросетями за 5 дней","includes":["Сценарий","AI-генерация","Монтаж","Озвучка","2 правки"],"tags":["Runway","Kling","Монтаж"]},
      {"id":"s2","iconAsset":"icon-web","name":"Сайт под ключ","priceFrom":95000,"days":14,"shortDesc":"Современный сайт с AI-ассистентом и SEO","includes":["Дизайн в Figma","React-разработка","AI-ассистент","SEO","Адаптив","1 мес поддержки"],"tags":["React","Lovable","SEO"]},
      {"id":"s3","iconAsset":"icon-app","name":"Telegram Mini App","priceFrom":65000,"days":21,"shortDesc":"Полноценное приложение внутри Telegram","includes":["UI/UX дизайн","Frontend","Backend API","Оплата Stars","Админ-панель"],"tags":["Telegram","React","Python"]},
      {"id":"s4","iconAsset":"icon-ai","name":"AI-агент","badge":"ТОП","badgeColor":"#0052FF","priceFrom":150000,"days":14,"shortDesc":"Автоматизация продаж и поддержки 24/7","includes":["AI на GPT-4","Сценарии продаж","CRM-интеграция","Telegram-бот","Аналитика"],"tags":["GPT-4","n8n","amoCRM"]},
      {"id":"s5","iconAsset":"icon-design","name":"Дизайн и брендинг","priceFrom":30000,"days":7,"shortDesc":"Логотип, фирменный стиль, UI/UX","includes":["Логотип (3 варианта)","Брендбук PDF","UI-кит","Все форматы"],"tags":["Figma","Брендбук"]},
      {"id":"s6","iconAsset":"icon-analytics","name":"Автоматизация","priceFrom":60000,"days":14,"shortDesc":"Бизнес-процессы на автопилоте","includes":["Аудит процессов","Разработка на n8n/Make","API-интеграции","Документация"],"tags":["n8n","Make","API"]}
    ]}
  ]'::jsonb,
  '{}'::jsonb
)
ON CONFLICT (slug, locale) DO NOTHING;

-- Optional public setting for default chat assistant (set after creating assistant in admin)
INSERT INTO public.cms_settings (key, value, is_public)
VALUES ('public.chat.default_assistant_id', 'null'::jsonb, true)
ON CONFLICT (key) DO NOTHING;
