import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import axios from "axios";
import { adminApi } from "@/lib/admin-api";
import type { CmsMedia, CmsSetting } from "@/lib/cms-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const KEY_LOGO = "public.brand.logo_url";
const KEY_LOGO_WHITE = "public.brand.logo_white_url";

export default function AdminBrandingPage() {
  usePageTitle("CMS — брендинг");
  const qc = useQueryClient();
  const [logoUrl, setLogoUrl] = useState("");
  const [logoWhiteUrl, setLogoWhiteUrl] = useState("");

  const settingsQ = useQuery({
    queryKey: ["cms", "settings", "admin"],
    queryFn: async () => {
      const { data } = await adminApi.get<CmsSetting[]>("/settings");
      return data;
    },
  });

  const mediaQ = useQuery({
    queryKey: ["cms", "media", "admin", "branding"],
    queryFn: async () => {
      const { data } = await adminApi.get<CmsMedia[]>("/media");
      return data;
    },
  });

  useEffect(() => {
    const rows = settingsQ.data;
    if (!rows) return;
    const getVal = (key: string) => {
      const r = rows.find((x) => x.key === key);
      const v = r?.value;
      return typeof v === "string" ? v : "";
    };
    setLogoUrl(getVal(KEY_LOGO));
    setLogoWhiteUrl(getVal(KEY_LOGO_WHITE));
  }, [settingsQ.data]);

  const save = async (key: string, value: string) => {
    try {
      await adminApi.patch(`/settings/${encodeURIComponent(key)}`, {
        value: value.trim() || "",
        is_public: true,
      });
      toast.success("Сохранено");
      qc.invalidateQueries({ queryKey: ["cms", "settings"] });
      qc.invalidateQueries({ queryKey: ["cms", "public-settings"] });
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
    }
  };

  if (settingsQ.isLoading) return <p className="text-muted-foreground">Загрузка…</p>;

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-2xl font-extrabold">Брендинг</h1>
      <p className="text-sm text-muted-foreground">
        URL логотипов хранятся в БД (публичные настройки). Загрузите файлы в «Медиа», затем вставьте <code className="text-xs">public_url</code> ниже
        или кликните по превью.
      </p>

      <div className="rounded-2xl border border-[#E8E6E0] bg-white p-6 space-y-6">
        <div className="space-y-2">
          <Label>Логотип шапки (тёмный на светлом)</Label>
          <Input className="rounded-xl font-mono text-sm" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="/uploads/....png" />
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="rounded-xl bg-[#0D0D0B]" onClick={() => save(KEY_LOGO, logoUrl)}>
              Сохранить
            </Button>
            {logoUrl ? <img src={logoUrl} alt="" className="h-10 w-auto border rounded border-border" /> : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Логотип подвала (светлый на тёмном)</Label>
          <Input
            className="rounded-xl font-mono text-sm"
            value={logoWhiteUrl}
            onChange={(e) => setLogoWhiteUrl(e.target.value)}
            placeholder="/uploads/....png"
          />
          <div className="flex flex-wrap gap-2 items-center">
            <Button type="button" className="rounded-xl bg-[#0D0D0B]" onClick={() => save(KEY_LOGO_WHITE, logoWhiteUrl)}>
              Сохранить
            </Button>
            {logoWhiteUrl ? (
              <div className="rounded border border-border bg-[#0D0D0B] p-2">
                <img src={logoWhiteUrl} alt="" className="h-8 w-auto" />
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Медиатека — клик вставляет URL в буфер и подставляет в активное поле</Label>
          <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto rounded-xl border border-[#E8E6E0] p-3 bg-muted/30">
            {mediaQ.isLoading ? (
              <p className="text-xs text-muted-foreground">Загрузка…</p>
            ) : (
              mediaQ.data?.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="relative h-14 w-14 overflow-hidden rounded-lg border shrink-0 hover:ring-2 hover:ring-primary/30"
                  title={m.public_url}
                  onClick={() => {
                    void navigator.clipboard.writeText(m.public_url);
                    toast.success("URL скопирован — вставьте в поле или используйте кнопку ниже");
                  }}
                  onDoubleClick={() => {
                    setLogoUrl(m.public_url);
                    toast.info("Подставлено в логотип шапки");
                  }}
                >
                  {m.mime?.startsWith("image/") ? (
                    <img src={m.public_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[9px] p-1">file</span>
                  )}
                </button>
              ))
            )}
          </div>
          <p className="text-xs text-muted-foreground">Двойной клик по картинке — подставить в шапку.</p>
        </div>
      </div>
    </div>
  );
}
