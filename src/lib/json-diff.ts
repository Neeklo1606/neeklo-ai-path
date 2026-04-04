/** Deep JSON diff for CMS blocks/meta (no cycles). */

export type DiffKind = "added" | "removed" | "changed";

export type DiffEntry = {
  path: string;
  kind: DiffKind;
  before?: unknown;
  after?: unknown;
};

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  const ao = a as Record<string, unknown>;
  const bo = b as Record<string, unknown>;
  const ak = Object.keys(ao);
  const bk = Object.keys(bo);
  if (ak.length !== bk.length) return false;
  return ak.every((k) => Object.prototype.hasOwnProperty.call(bo, k) && deepEqual(ao[k], bo[k]));
}

function walk(before: unknown, after: unknown, path: string, out: DiffEntry[]): void {
  if (deepEqual(before, after)) return;

  const p = path || ".";

  if (after === undefined && before !== undefined) {
    out.push({ path: p, kind: "removed", before });
    return;
  }
  if (before === undefined && after !== undefined) {
    out.push({ path: p, kind: "added", after });
    return;
  }

  if (
    before === null ||
    after === null ||
    typeof before !== "object" ||
    typeof after !== "object" ||
    Array.isArray(before) !== Array.isArray(after)
  ) {
    out.push({ path: p, kind: "changed", before, after });
    return;
  }

  if (Array.isArray(before) && Array.isArray(after)) {
    const max = Math.max(before.length, after.length);
    for (let i = 0; i < max; i++) {
      const ip = `${path}[${i}]`;
      if (i >= before.length) walk(undefined, after[i], ip, out);
      else if (i >= after.length) walk(before[i], undefined, ip, out);
      else walk(before[i], after[i], ip, out);
    }
    return;
  }

  const bObj = before as Record<string, unknown>;
  const aObj = after as Record<string, unknown>;
  const keys = new Set([...Object.keys(bObj), ...Object.keys(aObj)]);
  for (const k of keys) {
    const kp = path ? `${path}.${k}` : k;
    walk(bObj[k], aObj[k], kp, out);
  }
}

/** `before` → `after`: removed = only in before, added = only in after, changed = both differ. */
export function jsonDeepDiff(before: unknown, after: unknown): DiffEntry[] {
  const out: DiffEntry[] = [];
  walk(before, after, "", out);
  return out;
}

export function formatDiffValue(v: unknown, max = 400): string {
  if (v === undefined) return "undefined";
  if (typeof v === "string") return v.length > max ? `${v.slice(0, max)}…` : v;
  try {
    const s = JSON.stringify(v, null, 0);
    return s.length > max ? `${s.slice(0, max)}…` : s;
  } catch {
    return String(v);
  }
}
