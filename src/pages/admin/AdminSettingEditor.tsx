import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import axios from "axios";
import { adminApi } from "@/lib/admin-api";
import type { CmsSetting } from "@/lib/cms-api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function AdminSettingEditor() {
  const { settingKey } = useParams();
  const navigate = useNavigate();
  const key = settingKey ?? "";
  usePageTitle(`Настройка: ${key}`);

  const [valText, setValText] = useState("{}");
  const [isPub, setIsPub] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: rows } = await adminApi.get<CmsSetting[]>("/settings");
        if (cancelled) return;
        const s = rows.find((r) => r.key === key);
        if (!s) {
          toast.error("Ключ не найден");
          navigate("/admin/settings");
          return;
        }
        setValText(JSON.stringify(s.value, null, 2));
        setIsPub(s.is_public);
      } catch (e) {
        toast.error((e as Error).message);
        navigate("/admin/settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key, navigate]);

  const save = async () => {
    let value: unknown;
    try {
      value = JSON.parse(valText);
    } catch {
      toast.error("Некорректный JSON");
      return;
    }
    try {
      await adminApi.patch(`/settings/${encodeURIComponent(key)}`, { value, is_public: isPub });
      toast.success("Сохранено");
      navigate("/admin/settings");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (!key) return null;
  if (loading) return <p className="text-muted-foreground">Загрузка…</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" className="rounded-xl" asChild>
          <Link to="/admin/settings">← Назад</Link>
        </Button>
        <h1 className="font-heading text-xl font-extrabold sm:text-2xl">Настройка</h1>
      </div>
      <p className="font-mono text-sm text-muted-foreground">{key}</p>
      <div className="space-y-6 rounded-2xl border border-[#E8E6E0] bg-white p-6">
        <div className="space-y-2">
          <Label htmlFor="json">Значение (JSON)</Label>
          <textarea
            id="json"
            className="font-mono min-h-[220px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            value={valText}
            onChange={(e) => setValText(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Switch id="isp" checked={isPub} onCheckedChange={setIsPub} />
          <Label htmlFor="isp">Публичная (доступна на сайте без JWT)</Label>
        </div>
        <Button className="rounded-xl bg-[#0D0D0B]" onClick={save}>
          Сохранить
        </Button>
      </div>
    </div>
  );
}
