import { useEffect } from "react";

interface PageMetaOptions {
  title: string;
  description?: string;
  /** OG tags — pass `url` as relative path, e.g. "/" or "/products/ai-video" */
  og?: {
    title?: string;
    description?: string;
    url?: string;
    image?: string;
    type?: string;
  };
  /** Raw JSON-LD object to inject as <script type="application/ld+json"> */
  jsonLd?: Record<string, unknown>;
}

function setMeta(selector: string, attr: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    if (selector.includes("property=")) {
      el.setAttribute("property", selector.match(/property="([^"]+)"/)![1]);
    } else {
      el.setAttribute("name", selector.match(/name="([^"]+)"/)![1]);
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
  return el;
}

const SCHEMA_LD_ID = "schema-ld-json";

export function usePageMeta({ title, description, og, jsonLd }: PageMetaOptions) {
  useEffect(() => {
    // ── title ────────────────────────────────────────────────────────
    document.title = title;

    const cleaned: HTMLElement[] = [];

    // ── description ──────────────────────────────────────────────────
    if (description) {
      cleaned.push(setMeta('meta[name="description"]', "content", description));
    }

    // ── OG tags ──────────────────────────────────────────────────────
    if (og) {
      const base = "https://neeklo.ru";
      const ogTitle = og.title ?? title;
      const ogDesc = og.description ?? description ?? "";
      const ogUrl = og.url ? `${base}${og.url}` : base;
      const ogImage = og.image ?? `${base}/og-image.png`;
      const ogType = og.type ?? "website";

      cleaned.push(setMeta('meta[property="og:title"]', "content", ogTitle));
      cleaned.push(setMeta('meta[property="og:description"]', "content", ogDesc));
      cleaned.push(setMeta('meta[property="og:type"]', "content", ogType));
      cleaned.push(setMeta('meta[property="og:url"]', "content", ogUrl));
      cleaned.push(setMeta('meta[property="og:image"]', "content", ogImage));
    }

    // ── JSON-LD ───────────────────────────────────────────────────────
    let ldScript: HTMLScriptElement | null = null;
    if (jsonLd) {
      ldScript = document.head.querySelector(`#${SCHEMA_LD_ID}`);
      if (!ldScript) {
        ldScript = document.createElement("script");
        ldScript.id = SCHEMA_LD_ID;
        ldScript.type = "application/ld+json";
        document.head.appendChild(ldScript);
      }
      ldScript.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      // reset meta content on unmount so stale values don't bleed across routes
      cleaned.forEach((el) => el.setAttribute("content", ""));
      if (jsonLd && ldScript) ldScript.textContent = "";
    };
  }, [title, description, og, jsonLd]);
}
