import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowUpRight, Play, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import Footer from "@/components/Footer";

const ease = [0.16, 1, 0.3, 1] as const;
const ALL = "Все";
const VIDEO_TAB = "Видео";

// ─── Types ────────────────────────────────────────────────────────────────────

// Tags for cases (not stored in DB yet)
const CASE_TAGS: Record<string, string[]> = {
  povuzam:             ["EdTech", "Платформа", "Каталог"],
  batnorton:           ["E-commerce", "Каталог", "Оплата"],
  damotors:            ["Telegram", "Mini App", "Каталог"],
  "ai-contracts":      ["AI", "Автоматизация", "Документы"],
  avangard31:          ["CRM", "Недвижимость", "Бот"],
  "bella-hasias":      ["Telegram", "SaaS", "Подписка"],
  "ai-avito":          ["AI", "Автоматизация"],
  "ai-platform":       ["AI", "SaaS", "Агенты"],
  svoikhleb:           ["Telegram", "Mini App"],
  "ai-video-business": ["Видео", "AI", "Контент"],
};

interface ApiCase {
  id: number;
  title: string;
  slug: string;
  category: string;
  badge: string;
  description: string;
  metric: string;
  url: string | null;
  color: string;
  coverImage: string | null;
  videos: { videoUrl: string; thumbnailUrl: string | null; duration: number | null; title: string }[];
}

interface VideoItem {
  id: number;
  title: string;
  description?: string;
  client?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  categoryId?: number;
  category?: { id: number; name: string; slug: string };
}
interface VideoCat { id: number; name: string; slug: string; videoCount: number; }

function fmtDur(s?: number | null) {
  if (!s) return "";
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CasesPage() {
  usePageMeta({
    title: "Наши работы — neeklo",
    description: "Кейсы neeklo: платформы, Telegram Mini App, AI-ассистенты, автоматизация и видео-портфолио.",
  });

  // Cases
  const [cases, setCases] = useState<ApiCase[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);

  // Videos
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [videoCats, setVideoCats] = useState<VideoCat[]>([]);
  const [videoFilter, setVideoFilter] = useState<number | null>(null);
  const [playerVideo, setPlayerVideo] = useState<VideoItem | null>(null);

  // Navigation
  const [activeTab, setActiveTab] = useState(ALL);

  useEffect(() => {
    fetch("/cms-api/cases")
      .then(r => r.ok ? r.json() : [])
      .then((data: ApiCase[]) => { setCases(data); setCasesLoading(false); })
      .catch(() => setCasesLoading(false));

    fetch("/cms-api/videos")
      .then(r => r.ok ? r.json() : [])
      .then(setVideos)
      .catch(() => {});

    fetch("/cms-api/video-categories")
      .then(r => r.ok ? r.json() : [])
      .then(setVideoCats)
      .catch(() => {});
  }, []);

  // Build tabs — exclude "Видео" from case categories to avoid duplicate
  const caseCategories = [ALL, ...Array.from(
    new Set(cases.map(c => c.category).filter(cat => cat !== VIDEO_TAB))
  )];
  const tabs = [...caseCategories, VIDEO_TAB];

  const isVideoTab = activeTab === VIDEO_TAB;
  const filteredCases = isVideoTab
    ? cases // won't show, but keep reference
    : activeTab === ALL
      ? cases
      : cases.filter(c => c.category === activeTab);

  const filteredVideos = videoFilter
    ? videos.filter(v => v.categoryId === videoFilter)
    : videos;

  const activeCats = videoCats.filter(c => videos.some(v => v.categoryId === c.id));

  // Player
  const closePlayer = useCallback(() => setPlayerVideo(null), []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") closePlayer(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [closePlayer]);

  useEffect(() => {
    document.body.style.overflow = playerVideo ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [playerVideo]);

  return (
    <div className="flex-1 flex flex-col" style={{ background: "var(--bg)", color: "var(--tx)" }}>
      <div
        className="max-w-6xl mx-auto w-full px-4 md:px-6"
        style={{ paddingTop: 40, paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}
      >

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
          style={{ marginBottom: 28 }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--tx-faint)", marginBottom: 6 }}>
            КЕЙСЫ
          </p>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--tx)", lineHeight: 1.1, marginBottom: 8 }}>
            Наши работы
          </h1>
          <p style={{ fontSize: 14, color: "var(--tx-muted)", lineHeight: 1.6 }}>
            44+ проектов: сайты, AI, Telegram, автоматизация и видеопродакшн.
          </p>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease, delay: 0.08 }}
          className="flex flex-wrap gap-2"
          style={{ marginBottom: 28 }}
        >
          {tabs.map(tab => {
            const active = activeTab === tab;
            const count = tab === VIDEO_TAB ? videos.length : null;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => { setActiveTab(tab); setVideoFilter(null); }}
                style={{
                  padding: "6px 16px",
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: active ? "var(--tx)" : "transparent",
                  color: active ? "var(--bg)" : "var(--tx-muted)",
                  border: active ? "1px solid transparent" : "1px solid var(--bd)",
                }}
              >
                {tab}{count && count > 0 ? ` (${count})` : ""}
              </button>
            );
          })}
        </motion.div>

        {/* ── Video section ── */}
        <AnimatePresence mode="wait">
          {isVideoTab && (
            <motion.div
              key="videos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Sub-category filter — only if videos exist */}
              {videos.length > 0 && activeCats.length > 1 && (
                <div className="flex flex-wrap gap-2" style={{ marginBottom: 20 }}>
                  <button
                    onClick={() => setVideoFilter(null)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 9999,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      background: !videoFilter ? "var(--tx)" : "transparent",
                      color: !videoFilter ? "var(--bg)" : "var(--tx-muted)",
                      border: !videoFilter ? "1px solid transparent" : "1px solid var(--bd)",
                    }}
                  >
                    Все
                  </button>
                  {activeCats.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setVideoFilter(videoFilter === c.id ? null : c.id)}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 9999,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        background: videoFilter === c.id ? "var(--tx)" : "transparent",
                        color: videoFilter === c.id ? "var(--bg)" : "var(--tx-muted)",
                        border: videoFilter === c.id ? "1px solid transparent" : "1px solid var(--bd)",
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {filteredVideos.length === 0 && (
                <div
                  style={{
                    padding: "64px 24px",
                    textAlign: "center",
                    borderRadius: 20,
                    border: "1px dashed var(--bd)",
                    marginTop: 8,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: "var(--surface-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                    }}
                  >
                    <Play size={22} style={{ color: "var(--tx-faint)", marginLeft: 2 }} />
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--tx)", marginBottom: 6 }}>
                    Видеопортфолио скоро появится
                  </p>
                  <p style={{ fontSize: 13, color: "var(--tx-muted)", lineHeight: 1.6, maxWidth: 300, margin: "0 auto" }}>
                    Мы добавляем работы — анимации, рекламные ролики, AI-видео. Загляните позже.
                  </p>
                </div>
              )}

              {/* Video grid */}
              {filteredVideos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {filteredVideos.map((v, i) => (
                    <VideoCard key={v.id} video={v} index={i} onPlay={setPlayerVideo} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Cases grid ── */}
          {!isVideoTab && (
            <motion.div
              key="cases"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {casesLoading ? (
                /* Skeleton */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <div key={n} style={{ borderRadius: 20, overflow: "hidden", border: "1px solid var(--bd)", background: "var(--surface)" }}>
                      <div className="aspect-video" style={{ background: "var(--surface-2)", animation: "pulse 1.5s ease-in-out infinite" }} />
                      <div style={{ padding: 16 }}>
                        <div style={{ height: 14, borderRadius: 6, background: "var(--surface-2)", marginBottom: 8, width: "60%" }} />
                        <div style={{ height: 10, borderRadius: 6, background: "var(--surface-2)", width: "80%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {filteredCases.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease, delay: i * 0.04 }}
                    >
                      <CaseCard item={c} tags={CASE_TAGS[c.slug] ?? [c.badge].filter(Boolean)} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />

      {/* ── Fullscreen video player ── */}
      <AnimatePresence>
        {playerVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.96)", padding: "20px" }}
            onClick={closePlayer}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full"
              style={{ maxWidth: "min(860px, 100%)" }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-white text-base">{playerVideo.title}</p>
                  {playerVideo.client && (
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{playerVideo.client}</p>
                  )}
                </div>
                <button
                  onClick={closePlayer}
                  style={{
                    width: 36, height: 36,
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.08)",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.7)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <video
                src={playerVideo.videoUrl}
                poster={playerVideo.thumbnailUrl}
                controls
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  borderRadius: 16,
                  maxHeight: "calc(100vh - 140px)",
                  background: "#000",
                  display: "block",
                }}
              />

              {playerVideo.description && (
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 12, lineHeight: 1.6 }}>
                  {playerVideo.description}
                </p>
              )}

              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 12, textAlign: "center" }}>
                Нажмите Esc или за пределами видео, чтобы закрыть
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CaseCard ─────────────────────────────────────────────────────────────────

function CaseCard({ item, tags }: { item: ApiCase; tags: string[] }) {
  const firstVideo = item.videos?.[0] ?? null;
  const thumb = firstVideo?.thumbnailUrl ?? item.coverImage;

  const inner = (
    <>
      {/* Media */}
      <div className={`relative aspect-video bg-gradient-to-br ${item.color} overflow-hidden`}>
        {thumb && (
          <img
            src={thumb}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        )}

        {/* Play button overlay for videos */}
        {firstVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div style={{
              width: 44, height: 44,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Play size={18} fill="white" color="white" style={{ marginLeft: 2 }} />
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors duration-200 flex items-center justify-center">
          <span
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-black font-semibold text-sm px-4 py-2 rounded-full pointer-events-none"
            style={{ fontSize: 13 }}
          >
            {item.url ? "Открыть проект →" : "Смотреть →"}
          </span>
        </div>

        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
            padding: "3px 9px", borderRadius: 6,
            background: "rgba(0,0,0,0.55)", color: "#fff", backdropFilter: "blur(4px)",
          }}>
            {item.badge}
          </span>
        </div>

        {/* External link */}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="absolute top-3 right-3 flex items-center justify-center hover:bg-black/60 transition-colors"
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", color: "#fff",
            }}
          >
            <ArrowUpRight size={13} strokeWidth={2} />
          </a>
        )}
      </div>

      {/* Text */}
      <div style={{ padding: "14px 16px 16px" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--tx)", lineHeight: 1.3, marginBottom: 4 }}>
          {item.title}
        </h3>
        <p style={{ fontSize: 18, fontWeight: 700, color: "var(--ac-b)", lineHeight: 1.2, marginBottom: 6 }}>
          {item.metric}
        </p>
        <p style={{ fontSize: 12, color: "var(--tx-muted)", lineHeight: 1.55, marginBottom: 10 }}>
          {item.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {tags.map(tag => (
            <span key={tag} style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 9999,
              background: "var(--surface-2)", color: "var(--tx-faint)", border: "1px solid var(--bd)",
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  const baseClass = "rounded-2xl overflow-hidden group transition-all duration-200 flex flex-col";
  const baseStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--bd)",
    textDecoration: "none",
  };
  const hoverIn = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    el.style.borderColor = "var(--bd-hover)";
    el.style.boxShadow = "0 4px 24px rgba(0,0,0,0.07)";
  };
  const hoverOut = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    el.style.borderColor = "var(--bd)";
    el.style.boxShadow = "none";
  };

  if (item.url) {
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer"
        className={baseClass} style={baseStyle}
        onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
        {inner}
      </a>
    );
  }
  return (
    <div className={baseClass} style={{ ...baseStyle, cursor: "default" }}
      onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
      {inner}
    </div>
  );
}

// ─── VideoCard ────────────────────────────────────────────────────────────────

function VideoCard({ video: v, index: i, onPlay }: { video: VideoItem; index: number; onPlay: (v: VideoItem) => void }) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease, delay: i * 0.04 }}
      onClick={() => onPlay(v)}
      className="w-full text-left group rounded-2xl overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--bd)", cursor: "pointer" }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video" style={{ background: "var(--surface-2)" }}>
        {v.thumbnailUrl ? (
          <img
            src={v.thumbnailUrl}
            alt={v.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play size={24} style={{ color: "var(--tx-faint)" }} />
          </div>
        )}

        {/* Hover play */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-200">
          <div
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-75 group-hover:scale-100"
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(255,255,255,0.95)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Play size={16} fill="#111" color="#111" style={{ marginLeft: 2 }} />
          </div>
        </div>

        {/* Duration */}
        {v.duration && (
          <span style={{
            position: "absolute", bottom: 8, right: 8,
            background: "rgba(0,0,0,0.7)", color: "#fff",
            fontSize: 11, padding: "2px 6px", borderRadius: 5,
          }}>
            {fmtDur(v.duration)}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--tx)", lineHeight: 1.3, marginBottom: 2 }}
          className="truncate">
          {v.title}
        </div>
        {v.category && (
          <div style={{ fontSize: 11, color: "var(--tx-muted)" }}>{v.category.name}</div>
        )}
      </div>
    </motion.button>
  );
}
