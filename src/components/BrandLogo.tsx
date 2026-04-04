import { useQuery } from "@tanstack/react-query";
import { fetchPublicSettings } from "@/lib/cms-api";

const KEY_HEADER = "public.brand.logo_url";
const KEY_FOOTER = "public.brand.logo_white_url";

type Props = {
  /** Header nav (dark logo on light) vs footer (light logo on dark). */
  variant: "header" | "footer";
  className?: string;
  alt?: string;
};

/**
 * Logos from CMS public settings (DB), not bundled /assets.
 * Set URLs in Admin → Брендинг or `public.brand.*` settings.
 */
export default function BrandLogo({ variant, className = "", alt = "neeklo" }: Props) {
  const q = useQuery({
    queryKey: ["cms", "public-settings"],
    queryFn: fetchPublicSettings,
    staleTime: 60_000,
  });

  const raw = q.data?.[variant === "footer" ? KEY_FOOTER : KEY_HEADER];
  const url = typeof raw === "string" ? raw.trim() : "";

  if (url) {
    return <img src={url} alt={alt} className={className} loading="lazy" decoding="async" />;
  }

  return (
    <span
      className={`font-heading font-extrabold tracking-tight ${variant === "footer" ? "text-white" : "text-[#0D0D0B]"} ${className}`}
      style={{ fontSize: variant === "footer" ? "1.35rem" : "1.15rem" }}
    >
      neeklo
    </span>
  );
}
