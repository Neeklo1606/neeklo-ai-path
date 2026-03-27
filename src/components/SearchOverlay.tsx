import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const catalog = [
  { name: "AI-ролики", slug: "ai-roliki", tag: "AI-ролики" },
  { name: "Сайт под ключ", slug: "sajt-pod-klyuch", tag: "Сайт" },
  { name: "Telegram Mini App", slug: "telegram-mini-app", tag: "Mini App" },
  { name: "AI-агент", slug: "ai-agent", tag: "AI-агент" },
];

const popularTags = ["AI-ролики", "Сайт", "Mini App", "AI-агент"];

const STORAGE_KEY = "neeklo_recent_searches";

const getRecent = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]").slice(0, 5);
  } catch {
    return [];
  }
};

const saveRecent = (term: string) => {
  const list = getRecent().filter((t) => t !== term);
  list.unshift(term);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 5)));
};

const SearchOverlay = ({ onClose }: { onClose: () => void }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>(getRecent);

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const matches = query.trim().length > 0
    ? catalog.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const go = useCallback((slug: string, term: string) => {
    saveRecent(term);
    onClose();
    navigate(`/services/${slug}`);
  }, [navigate, onClose]);

  const handleTag = (tag: string) => {
    const match = catalog.find((s) => s.tag === tag || s.name === tag);
    if (match) go(match.slug, tag);
  };

  const clearRecent = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRecent([]);
  };

  return (
    <div className="fixed inset-0 z-[90] bg-background flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border">
        <div className="flex-1 flex items-center gap-2.5 bg-muted rounded-xl px-4 py-3">
          <Search size={18} className="text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value.slice(0, 100))}
            placeholder="Найти услугу..."
            className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          )}
        </div>
        <button onClick={onClose} className="text-[14px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
          Отмена
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5">
        {/* Search results */}
        {matches.length > 0 && (
          <div className="mb-6">
            {matches.map((s) => (
              <button
                key={s.slug}
                onClick={() => go(s.slug, s.name)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-colors text-left"
              >
                <Search size={15} className="text-muted-foreground flex-shrink-0" />
                <span className="text-[14px] font-medium text-foreground">{s.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* No query — show recent + popular */}
        {query.trim().length === 0 && (
          <>
            {/* Recent */}
            {recent.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">
                    <Clock size={13} />
                    Недавние
                  </div>
                  <button onClick={clearRecent} className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                    Очистить
                  </button>
                </div>
                {recent.map((term) => {
                  const match = catalog.find((s) => s.name === term || s.tag === term);
                  return (
                    <button
                      key={term}
                      onClick={() => match ? go(match.slug, term) : setQuery(term)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left"
                    >
                      <Clock size={14} className="text-muted-foreground/50 flex-shrink-0" />
                      <span className="text-[14px] text-foreground">{term}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Popular */}
            <div>
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                <TrendingUp size={13} />
                Популярное
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTag(tag)}
                    className="px-4 py-2 rounded-xl bg-muted text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* No results */}
        {query.trim().length > 0 && matches.length === 0 && (
          <p className="text-[14px] text-muted-foreground text-center pt-12">
            Ничего не найдено по запросу «{query}»
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;
