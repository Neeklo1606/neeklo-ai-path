import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ArrowRight } from "lucide-react";
import { cmsPageBySlug } from "@/lib/cms-api";
import { parseServicesGrid, type ServiceItem } from "@/lib/cms-parsers";
import iconVideo from "@/assets/icon-video.png";
import iconWeb from "@/assets/icon-web.png";
import iconApp from "@/assets/icon-app.png";
import iconAi from "@/assets/icon-ai.png";
import iconDesign from "@/assets/icon-design.png";
import iconAnalytics from "@/assets/icon-analytics.png";

const ICON_MAP: Record<string, string> = {
  "icon-video": iconVideo,
  "icon-web": iconWeb,
  "icon-app": iconApp,
  "icon-ai": iconAi,
  "icon-design": iconDesign,
  "icon-analytics": iconAnalytics,
};

function resolveIcon(asset: string): string {
  return ICON_MAP[asset] || iconWeb;
}

function mapItems(items: ServiceItem[]) {
  return items.map((s) => ({
    ...s,
    icon: resolveIcon(s.iconAsset),
  }));
}

const ServicesPage = () => {
  const navigate = useNavigate();
  const q = useQuery({
    queryKey: ["cms", "page", "services", "ru"],
    queryFn: () => cmsPageBySlug("services", "ru"),
  });

  const grid = q.data ? parseServicesGrid(q.data) : null;
  const services = grid?.length ? mapItems(grid) : null;
  const pageTitle = q.data?.title || "Услуги";
  const pageSubtitle =
    (q.data?.meta?.subtitle as string) || "Выберите подходящее решение";

  usePageTitle(`${pageTitle} – neeklo`);

  if (q.isLoading) {
    return (
      <div className="min-h-screen bg-white px-5 pt-12 pb-[100px] md:px-10">
        <p className="font-body text-[#6A6860]">Загрузка услуг…</p>
      </div>
    );
  }

  if (q.isError || !services?.length) {
    return (
      <div className="min-h-screen bg-white px-5 pt-12 pb-[100px] md:px-10">
        <p className="font-body text-red-600">
          Не удалось загрузить услуги из CMS. Запустите{" "}
          <code className="rounded bg-muted px-1">npm run dev:full</code> и примените миграции Supabase.
        </p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">{(q.error as Error)?.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white" style={{ paddingBottom: 100 }}>
      <div className="px-5 pt-8 pb-2 max-w-[1280px] mx-auto md:px-10">
        <h1 className="font-heading" style={{ fontSize: 28, fontWeight: 800, color: "#0D0D0B" }}>
          {pageTitle}
        </h1>
        <p className="font-body mt-1" style={{ fontSize: 15, color: "#6A6860" }}>
          {pageSubtitle}
        </p>
      </div>

      <div className="px-5 mt-6 max-w-[1280px] mx-auto md:px-10">
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
          {services.map((s) => (
            <div
              key={s.id}
              className="relative rounded-2xl cursor-pointer hover:-translate-y-[2px] active:scale-[0.98] transition-all duration-200"
              style={{ background: "#F7F6F3", padding: "20px", border: "1px solid #EDECE8" }}
              onClick={() => navigate("/chat")}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center rounded-2xl flex-shrink-0"
                    style={{ width: 52, height: 52, background: "#EDECE8" }}
                  >
                    <img src={s.icon} alt={s.name} className="w-7 h-7 object-contain" loading="lazy" />
                  </div>
                  <div>
                    <p className="font-heading" style={{ fontSize: 16, fontWeight: 700, color: "#0D0D0B" }}>
                      {s.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-body" style={{ fontSize: 14, fontWeight: 600, color: "#0052FF" }}>
                        от {s.priceFrom.toLocaleString("ru")} ₽
                      </span>
                      <span className="font-body" style={{ fontSize: 12, color: "#8A8880" }}>
                        · {s.days} дн
                      </span>
                    </div>
                  </div>
                </div>
                {s.badge && (
                  <span
                    className="font-body text-white flex-shrink-0"
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 9999,
                      background: s.badgeColor,
                    }}
                  >
                    {s.badge}
                  </span>
                )}
              </div>

              <p className="font-body mt-3" style={{ fontSize: 13, color: "#6A6860", lineHeight: 1.5 }}>
                {s.shortDesc}
              </p>

              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
                {s.includes.slice(0, 4).map((item) => (
                  <span key={item} className="font-body flex items-center gap-1" style={{ fontSize: 11, color: "#6A6860" }}>
                    <span style={{ color: "#00B341", fontSize: 10 }}>✓</span> {item}
                  </span>
                ))}
                {s.includes.length > 4 && (
                  <span className="font-body" style={{ fontSize: 11, color: "#8A8880" }}>
                    +{s.includes.length - 4}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-1.5">
                  {s.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-body rounded-full"
                      style={{
                        background: "#E8E6E0",
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#6A6860",
                        padding: "3px 8px",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="font-body flex items-center gap-1" style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B" }}>
                  Заказать <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mx-5 mt-8 rounded-2xl px-5 py-12 text-center max-w-[1280px] md:mx-auto md:px-10"
        style={{ background: "#0D0D0B" }}
      >
        <h2 className="font-heading text-white" style={{ fontSize: 22, fontWeight: 800 }}>
          Не нашли нужное?
        </h2>
        <p className="font-body mt-2 mb-6" style={{ fontSize: 15, color: "rgba(255,255,255,0.5)" }}>
          Опишите задачу — предложим решение
        </p>
        <button
          onClick={() => navigate("/chat")}
          className="font-body rounded-2xl px-8 py-4 active:scale-[0.97] hover:-translate-y-[1px] transition-all duration-150 cursor-pointer"
          style={{ background: "#fff", color: "#0D0D0B", fontSize: 15, fontWeight: 700 }}
        >
          Написать в чат →
        </button>
      </div>
    </div>
  );
};

export default ServicesPage;
