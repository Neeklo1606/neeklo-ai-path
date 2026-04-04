import { useMemo, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LocalePair } from "../LocalePair";
import { MediaPickerField } from "../MediaPickerField";
import { BLOCK_SCHEMAS, canonicalBlockType, collectBlockSchemaIssues, type FieldUiDef } from "@/lib/block-schemas";
import { patchImages, readImagesMap } from "@/lib/cms-block-images";
import { cn } from "@/lib/utils";

type Props = {
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
};

function emptyValueForField(def: FieldUiDef, key: string): unknown {
  switch (def.type) {
    case "localeText":
      return { ru: "", en: "" };
    case "text":
      return "";
    case "boolean":
      return false;
    case "number":
      return 0;
    case "json": {
      const kind = def.jsonKind ?? (key === "entries" || key === "meta" ? "object" : "array");
      return kind === "object" ? {} : [];
    }
    default:
      return null;
  }
}

function emptyItem(sch: { imagesNestedIn?: string | null }, itemFields: Record<string, FieldUiDef>): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  for (const [k, d] of Object.entries(itemFields)) {
    o[k] = emptyValueForField(d, k);
  }
  if (sch.imagesNestedIn) o.images = {};
  return o;
}

function JsonField({
  label,
  value,
  onChange,
  def,
  fieldKey,
  hasErr,
  showLabel = true,
}: {
  label: string;
  value: unknown;
  onChange: (v: unknown) => void;
  def: FieldUiDef;
  fieldKey: string;
  hasErr: boolean;
  showLabel?: boolean;
}) {
  const kind = def.jsonKind ?? (fieldKey === "entries" ? "object" : "array");
  const initialJson =
    value != null && typeof value === "object" ? value : kind === "object" ? {} : [];
  const [text, setText] = useState(() => JSON.stringify(initialJson, null, 2));

  useEffect(() => {
    const v = value != null && typeof value === "object" ? value : kind === "object" ? {} : [];
    setText(JSON.stringify(v, null, 2));
  }, [value, fieldKey, kind]);

  return (
    <div className={cn("space-y-2", hasErr && "rounded-xl ring-2 ring-destructive/60 p-2 -m-2")}>
      {showLabel ? <Label className="text-sm font-medium">{label}</Label> : null}
      <Textarea
        className="font-mono text-xs min-h-[120px] rounded-xl"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          try {
            const parsed = JSON.parse(text || (kind === "object" ? "{}" : "[]"));
            onChange(parsed);
          } catch {
            /* keep editing */
          }
        }}
      />
      <p className="text-[10px] text-muted-foreground">JSON ({kind})</p>
    </div>
  );
}

function renderFieldControl(
  fieldKey: string,
  def: FieldUiDef,
  v: unknown,
  patch: (p: Record<string, unknown>) => void,
  hasErr: boolean,
) {
  switch (def.type) {
    case "localeText":
      return (
        <div key={fieldKey} className={cn(hasErr && "rounded-xl ring-2 ring-destructive/60 p-2 -m-2")}>
          <LocalePair
            label={def.label}
            value={v}
            onChange={(o) => patch({ [fieldKey]: o })}
            multiline={def.multiline}
          />
        </div>
      );
    case "text":
      return (
        <div key={fieldKey} className={cn("space-y-2", hasErr && "rounded-xl ring-2 ring-destructive/60 p-2 -m-2")}>
          <Label className="text-sm font-medium">{def.label}</Label>
          <Input className="rounded-xl" value={String(v ?? "")} onChange={(e) => patch({ [fieldKey]: e.target.value })} />
        </div>
      );
    case "boolean":
      return (
        <div key={fieldKey} className={cn("flex items-center gap-3", hasErr && "rounded-xl ring-2 ring-destructive/60 p-2 -m-2")}>
          <Switch
            id={`f-${fieldKey}`}
            checked={v === true}
            onCheckedChange={(c) => patch({ [fieldKey]: c })}
          />
          <Label htmlFor={`f-${fieldKey}`} className="font-normal cursor-pointer">
            {def.label}
          </Label>
        </div>
      );
    case "number":
      return (
        <div key={fieldKey} className={cn("space-y-2", hasErr && "rounded-xl ring-2 ring-destructive/60 p-2 -m-2")}>
          <Label className="text-sm font-medium">{def.label}</Label>
          <Input
            type="number"
            className="rounded-xl"
            value={typeof v === "number" && Number.isFinite(v) ? v : Number(v) || ""}
            onChange={(e) => patch({ [fieldKey]: Number(e.target.value) || 0 })}
          />
        </div>
      );
    case "json":
      return (
        <Collapsible key={fieldKey} defaultOpen={false} className={cn("rounded-xl border border-border/70 bg-muted/15", hasErr && "ring-2 ring-destructive/60")}>
          <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium hover:bg-muted/40 rounded-xl [&[data-state=open]>svg]:rotate-180">
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform" />
            <span>
              Расширенное (JSON): {def.label}
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 pb-3">
            <JsonField
              label={def.label}
              value={v}
              onChange={(next) => patch({ [fieldKey]: next })}
              def={def}
              fieldKey={fieldKey}
              hasErr={hasErr}
              showLabel={false}
            />
          </CollapsibleContent>
        </Collapsible>
      );
    default:
      return null;
  }
}

/** Always a plain object; never use raw `value.images.*` without this. */
function normalizeImagesObject(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return { ...(raw as Record<string, unknown>) };
  }
  return {};
}

/**
 * Safe block root: never read `value.images.mascot` etc. on raw CMS JSON — use `safeValue` only.
 * Equivalent to: `value = value || {}`, `value.images = value.images || {}` (plus type default).
 */
function normalizeBlockValue(raw: Record<string, unknown> | undefined | null): Record<string, unknown> {
  const v = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const images = normalizeImagesObject(v.images);
  const typeRaw = v.type;
  const type = typeof typeRaw === "string" && typeRaw.length > 0 ? typeRaw : "unknown";
  return { ...v, type, images };
}

/** Nested list rows (services/cases items): ensure `images` is an object map. */
function normalizeNestedRow(row: Record<string, unknown>): Record<string, unknown> {
  return { ...row, images: normalizeImagesObject(row.images) };
}

export function SchemaBlockEditor({ value, onChange }: Props) {
  const safeValue = useMemo(() => normalizeBlockValue(value), [value]);
  const rawType = String(safeValue.type ?? "");
  const t = canonicalBlockType(rawType);
  const sch = BLOCK_SCHEMAS[t];

  const issues = useMemo(() => collectBlockSchemaIssues(safeValue, rawType), [safeValue, rawType]);
  const issuePaths = new Set(issues.map((i) => i.path));

  const has = (path: string) => issuePaths.has(path);

  const patch = (p: Partial<Record<string, unknown>>) => onChange({ ...safeValue, ...p });

  if (!sch) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">
        <p className="font-heading font-bold">Нет схемы блока</p>
        <p className="mt-1 text-xs text-muted-foreground font-mono">{rawType || "unknown"}</p>
        <p className="mt-2 text-xs text-muted-foreground">Добавьте тип в block-schemas.json</p>
      </div>
    );
  }

  const imgs = readImagesMap(safeValue);
  const imageSlots = sch.imageSlots ?? [];
  const labels = sch.imageSlotLabels ?? {};
  const showTopLevelImages = imageSlots.length > 0 && !sch.imagesNestedIn;

  const fields = sch.fields ?? {};
  const itemFields = sch.itemFields ?? {};
  const nested = sch.nestedList;
  const nestedKey = nested?.arrayKey;
  const nestedFields = nested?.fields ?? {};

  const itemsArrayKey = sch.imagesNestedIn ?? nestedKey;
  const listForItems = itemsArrayKey ? (Array.isArray(safeValue[itemsArrayKey]) ? (safeValue[itemsArrayKey] as unknown[]) : []) : [];
  const itemFieldMap =
    Object.keys(itemFields).length > 0 ? itemFields : Object.keys(nestedFields).length > 0 ? nestedFields : null;

  const addRow = () => {
    if (!itemsArrayKey || !itemFieldMap) return;
    const next = [...listForItems, emptyItem(sch, itemFieldMap as Record<string, FieldUiDef>)];
    patch({ [itemsArrayKey]: next } as Record<string, unknown>);
  };

  const updateRow = (i: number, row: Record<string, unknown>) => {
    if (!itemsArrayKey) return;
    const next = [...listForItems];
    next[i] = row;
    patch({ [itemsArrayKey]: next } as Record<string, unknown>);
  };

  const removeRow = (i: number) => {
    if (!itemsArrayKey) return;
    patch({ [itemsArrayKey]: listForItems.filter((_, j) => j !== i) } as Record<string, unknown>);
  };

  return (
    <div className="space-y-6">
      {issues.length > 0 ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-foreground">
          <p className="font-semibold text-amber-900 dark:text-amber-100">Заполните обязательные поля</p>
          <ul className="mt-1 list-disc pl-4 text-muted-foreground">
            {issues.slice(0, 8).map((x, i) => (
              <li key={i}>
                {x.path}: {x.message}
              </li>
            ))}
            {issues.length > 8 ? <li>…</li> : null}
          </ul>
        </div>
      ) : null}

      <div className="space-y-4">
        {Object.entries(fields).map(([key, def]) =>
          renderFieldControl(key, def, safeValue[key], patch, has(key)),
        )}
      </div>

      {showTopLevelImages ? (
        <div className="space-y-4 border-t border-border pt-4">
          <p className="text-sm font-medium">Изображения</p>
          {imageSlots.map((slot) => {
            const id =
              slot === "mascot" ? imgs["mascot"] || imgs["main"] : imgs[slot];
            return (
              <div key={slot} className={cn(has(`images.${slot}`) && "rounded-xl ring-2 ring-destructive/60 p-2 -m-2")}>
                <MediaPickerField
                  label={labels[slot] || slot}
                  imageSlot={slot}
                  imageId={id}
                  onChange={(mid) => onChange(patchImages(safeValue, { [slot]: mid }))}
                />
              </div>
            );
          })}
        </div>
      ) : null}

      {itemsArrayKey && itemFieldMap ? (
        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-sm font-medium">{nested?.itemLabel || "Элементы"}</p>
          {listForItems.map((row, idx) => {
            const rec = normalizeNestedRow((row && typeof row === "object" ? row : {}) as Record<string, unknown>);
            const rowPrefix = `${itemsArrayKey}[${idx}].`;
            const rowHas = (sub: string) => issuePaths.has(rowPrefix + sub);

            return (
              <div key={idx} className="rounded-xl border border-[#E8E6E0] p-4 space-y-3 bg-muted/20">
                {Object.entries(itemFieldMap).map(([fk, def]) =>
                  renderFieldControl(
                    fk,
                    def,
                    rec[fk],
                    (p) => updateRow(idx, { ...rec, ...p }),
                    rowHas(fk),
                  ),
                )}
                {sch.imagesNestedIn
                  ? imageSlots.map((slot) => {
                      const rim = readImagesMap(rec);
                      const id =
                        slot === "mascot" ? rim["mascot"] || rim["main"] : rim[slot];
                      return (
                        <div
                          key={slot}
                          className={cn(rowHas(`images.${slot}`) && "rounded-xl ring-2 ring-destructive/60 p-2 -m-2")}
                        >
                          <MediaPickerField
                            label={labels[slot] || slot}
                            imageSlot={slot}
                            imageId={id}
                            onChange={(mid) => updateRow(idx, patchImages(rec, { [slot]: mid }))}
                          />
                        </div>
                      );
                    })
                  : null}
                <Button type="button" variant="ghost" className="text-destructive h-8 text-xs" onClick={() => removeRow(idx)}>
                  Удалить
                </Button>
              </div>
            );
          })}
          <Button type="button" variant="outline" className="rounded-xl" onClick={addRow}>
            {nested?.addButtonLabel || "+ Добавить"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
