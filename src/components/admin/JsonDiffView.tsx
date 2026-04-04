import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { jsonDeepDiff, formatDiffValue, type DiffEntry } from "@/lib/json-diff";
import { cn } from "@/lib/utils";

function rowClass(kind: DiffEntry["kind"]): string {
  switch (kind) {
    case "added":
      return "border-l-4 border-l-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/30";
    case "removed":
      return "border-l-4 border-l-rose-500 bg-rose-50/80 dark:bg-rose-950/30";
    case "changed":
      return "border-l-4 border-l-amber-500 bg-amber-50/80 dark:bg-amber-950/30";
    default:
      return "";
  }
}

function kindLabel(kind: DiffEntry["kind"]): string {
  switch (kind) {
    case "added":
      return "добавлено";
    case "removed":
      return "удалено";
    case "changed":
      return "изменено";
    default:
      return kind;
  }
}

type JsonDiffViewProps = {
  before: unknown;
  after: unknown;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
};

export function JsonDiffView({
  before,
  after,
  beforeLabel = "Было",
  afterLabel = "Стало",
  className,
}: JsonDiffViewProps) {
  const entries = useMemo(() => jsonDeepDiff(before, after), [before, after]);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        Нет отличий между «{beforeLabel}» и «{afterLabel}».
      </p>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs text-muted-foreground">
        Сравнение JSON (глубоко): {beforeLabel} → {afterLabel}
      </p>
      <ScrollArea className="h-[min(420px,50vh)] rounded-xl border border-border">
        <ul className="divide-y divide-border text-xs font-mono">
          {entries.map((e, i) => (
            <li key={`${e.path}-${e.kind}-${i}`} className={cn("px-3 py-2 space-y-1", rowClass(e.kind))}>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{kindLabel(e.kind)}</span>
                <span className="text-[11px] break-all text-foreground/90">{e.path}</span>
              </div>
              {e.kind === "removed" && (
                <pre className="whitespace-pre-wrap break-all text-[11px] text-rose-900 dark:text-rose-200">
                  {formatDiffValue(e.before)}
                </pre>
              )}
              {e.kind === "added" && (
                <pre className="whitespace-pre-wrap break-all text-[11px] text-emerald-900 dark:text-emerald-200">
                  {formatDiffValue(e.after)}
                </pre>
              )}
              {e.kind === "changed" && (
                <div className="grid gap-1 sm:grid-cols-2">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Было</Label>
                    <pre className="whitespace-pre-wrap break-all text-[11px] mt-0.5">{formatDiffValue(e.before)}</pre>
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Стало</Label>
                    <pre className="whitespace-pre-wrap break-all text-[11px] mt-0.5">{formatDiffValue(e.after)}</pre>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}

/** Diff only `blocks` and `meta` with section headers. */
export function PageContentDiffView({
  before,
  after,
  beforeLabel,
  afterLabel,
}: {
  before: { blocks: unknown; meta: unknown };
  after: { blocks: unknown; meta: unknown };
  beforeLabel?: string;
  afterLabel?: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">blocks</p>
        <JsonDiffView
          before={before.blocks}
          after={after.blocks}
          beforeLabel={`${beforeLabel ?? "A"} · blocks`}
          afterLabel={`${afterLabel ?? "B"} · blocks`}
        />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">meta</p>
        <JsonDiffView
          before={before.meta}
          after={after.meta}
          beforeLabel={`${beforeLabel ?? "A"} · meta`}
          afterLabel={`${afterLabel ?? "B"} · meta`}
        />
      </div>
    </div>
  );
}
