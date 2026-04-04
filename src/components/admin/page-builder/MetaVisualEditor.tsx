import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocalePair } from "./LocalePair";

function isLocaleObject(v: unknown): v is { ru?: string; en?: string } {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ru" in v || "en" in v);
}

type Props = {
  meta: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
};

/** Редактирование meta без JSON: пары ru/en и простые строки. Вложенные структуры не трогаем. */
export function MetaVisualEditor({ meta, onChange }: Props) {
  const keys = Object.keys(meta);

  const setKey = (k: string, v: unknown) => {
    onChange({ ...meta, [k]: v });
  };

  const removeKey = (k: string) => {
    const { [k]: _, ...rest } = meta;
    onChange(rest);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Поля страницы (meta): подзаголовки и подписи. Неизвестные ключи сохраняются.
      </p>
      {keys.length === 0 ? <p className="text-sm text-muted-foreground">Пока пусто — можно добавить поля ниже.</p> : null}

      {keys.map((k) => {
        const v = meta[k];
        if (isLocaleObject(v)) {
          return (
            <div key={k} className="rounded-xl border border-[#E8E6E0] p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-muted-foreground">{k}</span>
                <button type="button" className="text-xs text-destructive hover:underline" onClick={() => removeKey(k)}>
                  Удалить ключ
                </button>
              </div>
              <LocalePair label="Значение" value={v} onChange={(o) => setKey(k, o)} multiline />
            </div>
          );
        }
        if (typeof v === "string" || typeof v === "number") {
          return (
            <div key={k} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <Label className="font-mono text-xs">{k}</Label>
                <button type="button" className="text-xs text-destructive hover:underline" onClick={() => removeKey(k)}>
                  Удалить
                </button>
              </div>
              <Input className="rounded-xl" value={String(v)} onChange={(e) => setKey(k, e.target.value)} />
            </div>
          );
        }
        return (
          <div key={k} className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-mono">{k}</span> — сложное значение сохранено (без редактора)
          </div>
        );
      })}

      <AddMetaKey
        onAdd={(key, asLocale) => {
          if (asLocale) onChange({ ...meta, [key]: { ru: "", en: "" } });
          else onChange({ ...meta, [key]: "" });
        }}
      />
    </div>
  );
}

function AddMetaKey({ onAdd }: { onAdd: (key: string, asLocale: boolean) => void }) {
  const [key, setKey] = useState("");
  const [asLocale, setAsLocale] = useState(true);
  return (
    <div className="flex flex-wrap items-end gap-2 pt-2 border-t border-border">
      <div className="space-y-1 flex-1 min-w-[120px]">
        <Label className="text-xs">Новый ключ meta</Label>
        <Input className="rounded-xl font-mono text-sm" value={key} onChange={(e) => setKey(e.target.value)} placeholder="subtitle" />
      </div>
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input type="checkbox" checked={asLocale} onChange={(e) => setAsLocale(e.target.checked)} />
        RU/EN
      </label>
      <button
        type="button"
        className="rounded-xl bg-[#0D0D0B] text-white text-sm px-4 py-2"
        onClick={() => {
          if (!key.trim()) return;
          onAdd(key.trim(), asLocale);
          setKey("");
        }}
      >
        Добавить поле
      </button>
    </div>
  );
}
