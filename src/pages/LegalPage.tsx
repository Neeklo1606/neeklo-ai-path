import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import { cmsPageBySlug } from "@/lib/cms-api";
import { parseLegalDocs } from "@/lib/cms-parsers";
import { useLanguage } from "@/hooks/useLanguage";

function pick(v: unknown, lang: string): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null) {
    const o = v as Record<string, string>;
    return o[lang] || o.ru || o.en || "";
  }
  return String(v);
}

const LegalPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const locale = lang === "en" ? "en" : "ru";

  const q = useQuery({
    queryKey: ["cms", "legal", locale],
    queryFn: () => cmsPageBySlug("legal", locale),
  });

  const docs = q.data ? parseLegalDocs(q.data) : null;
  const doc = slug && docs ? docs[slug] : undefined;

  if (q.isLoading) {
    return (
      <div className="page-container">
        <div className="page-content flex min-h-[40vh] items-center justify-center" aria-busy="true">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
        </div>
      </div>
    );
  }

  if (q.isError || !doc) {
    return (
      <div className="page-container">
        <div className="page-content flex flex-col items-center justify-center pt-28">
          <p className="mb-4 text-[15px] text-destructive break-words text-center max-w-md">{q.isError ? (q.error as Error).message : "CMS"}</p>
          <button type="button" onClick={() => navigate("/")} className="btn-primary max-w-[200px]">
            ←
          </button>
        </div>
      </div>
    );
  }

  const title = pick(doc.title, lang);
  const body = pick(doc.body, lang);

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card transition-transform active:scale-95"
          >
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <h1 className="flex-1 text-[18px] font-bold leading-tight text-foreground md:text-[22px]">{title}</h1>
        </div>
        <div className="game-card">
          <div className="whitespace-pre-line text-[13px] leading-[1.8] text-foreground/80 md:text-[14px]">{body.trim()}</div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LegalPage;
