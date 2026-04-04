import BLOCK_SCHEMAS_JSON from "./block-schemas.json";
import { getBlockImageId } from "./cms-block-images";

export type FieldUiDef = {
  type: "localeText" | "text" | "boolean" | "number" | "json";
  label: string;
  required?: boolean;
  multiline?: boolean;
  /** Default root for empty json fields */
  jsonKind?: "object" | "array";
};

export type NestedListDef = {
  arrayKey: string;
  itemLabel?: string;
  addButtonLabel?: string;
  fields: Record<string, FieldUiDef>;
};

export type BlockSchema = {
  imageSlots: string[];
  requiredFields?: string[];
  requiredImageSlots?: string[];
  requiredItemFields?: string[];
  requiredItemImageSlots?: string[];
  imagesNestedIn?: string | null;
  imageSlotLabels?: Record<string, string>;
  fields?: Record<string, FieldUiDef>;
  itemFields?: Record<string, FieldUiDef>;
  nestedList?: NestedListDef;
};

export const BLOCK_SCHEMAS = BLOCK_SCHEMAS_JSON as Record<string, BlockSchema>;

export const BLOCK_TYPE_ALIASES: Record<string, string> = {
  services_preview: "services",
  services_row: "services",
  cases_preview: "cases",
  works_preview: "cases",
  how_steps: "steps",
  cta_simple: "cta",
};

export function canonicalBlockType(type: string): string {
  return BLOCK_TYPE_ALIASES[type] || type;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isMediaUuid(s: string): boolean {
  return UUID_RE.test(s.trim());
}

function deriveRequiredKeys(fieldMap?: Record<string, FieldUiDef> | undefined): string[] {
  if (!fieldMap) return [];
  return Object.entries(fieldMap)
    .filter(([, d]) => d?.required)
    .map(([k]) => k);
}

/** Merge `required: true` from `fields` / `itemFields` / `nestedList.fields` into legacy arrays. */
export function effectiveBlockSchema(sch: BlockSchema): BlockSchema {
  const fromTop = deriveRequiredKeys(sch.fields);
  const fromItem = deriveRequiredKeys(sch.itemFields);
  const fromNested = sch.nestedList?.fields ? deriveRequiredKeys(sch.nestedList.fields) : [];
  return {
    ...sch,
    requiredFields: [...new Set([...(sch.requiredFields ?? []), ...fromTop])],
    requiredItemFields: [...new Set([...(sch.requiredItemFields ?? []), ...fromItem, ...fromNested])],
  };
}

function fieldPresent(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "object" && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    const ru = o.ru != null && String(o.ru).trim().length > 0;
    const en = o.en != null && String(o.en).trim().length > 0;
    if (ru || en) return true;
    return Object.values(o).some((x) => {
      if (typeof x === "string") return x.trim().length > 0;
      if (typeof x === "number") return Number.isFinite(x);
      return x != null;
    });
  }
  if (typeof v === "number") return Number.isFinite(v);
  if (typeof v === "boolean") return true;
  return false;
}

function hasAnyImagePayload(block: Record<string, unknown>): boolean {
  const leg = typeof block.imageId === "string" && block.imageId.trim();
  if (leg) return true;
  const imgs = block.images;
  if (imgs && typeof imgs === "object" && !Array.isArray(imgs) && Object.keys(imgs as object).length > 0) return true;
  return false;
}

function blockHasNestedItemImages(block: Record<string, unknown>, nested: string): boolean {
  const arr = block[nested];
  if (!Array.isArray(arr)) return false;
  for (const it of arr) {
    if (!it || typeof it !== "object") continue;
    const row = it as Record<string, unknown>;
    if (typeof row.imageId === "string" && row.imageId.trim()) return true;
    const im = row.images;
    if (im && typeof im === "object" && !Array.isArray(im) && Object.keys(im as object).length > 0) return true;
  }
  return false;
}

function validateImagesKeys(
  images: unknown,
  allowed: Set<string>,
  rawType: string,
): { ok: true } | { ok: false; error: string } {
  if (images == null) return { ok: true };
  if (typeof images !== "object" || Array.isArray(images)) {
    return { ok: false, error: `Invalid images on block '${rawType}'` };
  }
  for (const key of Object.keys(images as object)) {
    if (!allowed.has(key)) {
      return { ok: false, error: `Invalid image slot '${key}' for block '${rawType}'` };
    }
    const v = (images as Record<string, unknown>)[key];
    if (v === undefined || v === null || v === "") continue;
    if (typeof v !== "string" || !isMediaUuid(v)) {
      return { ok: false, error: `Invalid media id for slot '${key}' on block '${rawType}'` };
    }
  }
  return { ok: true };
}

function validateOneBlock(
  block: Record<string, unknown>,
  sch: BlockSchema,
  rawType: string,
): { ok: true } | { ok: false; error: string } {
  const eff = effectiveBlockSchema(sch);
  const allowed = new Set(sch.imageSlots ?? []);

  const top = validateImagesKeys(block.images, allowed, rawType);
  if (!top.ok) return top;

  for (const f of eff.requiredFields ?? []) {
    if (!fieldPresent(block[f])) {
      return { ok: false, error: `Missing required field '${f}' on block '${rawType}'` };
    }
  }

  for (const slot of sch.requiredImageSlots ?? []) {
    const id = getBlockImageId(block, slot);
    if (!id || !isMediaUuid(id)) {
      return { ok: false, error: `Missing required image slot '${slot}' on block '${rawType}'` };
    }
  }

  const nestedKey = sch.imagesNestedIn ?? sch.nestedList?.arrayKey ?? null;
  if (nestedKey && typeof nestedKey === "string") {
    const arr = block[nestedKey];
    if (!Array.isArray(arr)) return { ok: true };
    let i = 0;
    for (const item of arr) {
      if (!item || typeof item !== "object") {
        i += 1;
        continue;
      }
      const row = item as Record<string, unknown>;
      if (sch.imagesNestedIn) {
        const ik = validateImagesKeys(row.images, allowed, rawType);
        if (!ik.ok) return ik;
      }

      for (const f of eff.requiredItemFields ?? []) {
        if (!fieldPresent(row[f])) {
          return { ok: false, error: `Missing required field '${f}' on block '${rawType}' (${nestedKey}[${i}])` };
        }
      }
      for (const slot of sch.requiredItemImageSlots ?? []) {
        const id = getBlockImageId(row, slot);
        if (!id || !isMediaUuid(id)) {
          return {
            ok: false,
            error: `Missing required image slot '${slot}' on block '${rawType}' (${nestedKey}[${i}])`,
          };
        }
      }
      i += 1;
    }
  }

  return { ok: true };
}

export function validatePageBlocksSchema(blocks: unknown): { ok: true } | { ok: false; error: string } {
  if (!Array.isArray(blocks)) return { ok: true };
  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    const b = block as Record<string, unknown>;
    const rawType = typeof b.type === "string" ? b.type : "";
    if (!rawType) continue;
    const t = canonicalBlockType(rawType);
    const sch = BLOCK_SCHEMAS[t];
    if (!sch) {
      if (hasAnyImagePayload(b) || blockHasNestedItemImages(b, "items")) {
        return { ok: false, error: `Unknown block type '${rawType}' — add a schema or remove images` };
      }
      continue;
    }
    const r = validateOneBlock(b, sch, rawType);
    if (!r.ok) return r;
  }
  return { ok: true };
}

export type SchemaIssue = { path: string; message: string };

function pushFieldIssues(
  issues: SchemaIssue[],
  prefix: string,
  block: Record<string, unknown>,
  fieldMap: Record<string, FieldUiDef> | undefined,
) {
  if (!fieldMap) return;
  for (const [key, def] of Object.entries(fieldMap)) {
    if (!def?.required) continue;
    if (!fieldPresent(block[key])) {
      issues.push({ path: `${prefix}${key}`, message: def.label || key });
    }
  }
}

/** Inline validation for schema-driven editor + pre-save UI. */
export function collectBlockSchemaIssues(block: Record<string, unknown>, rawType: string): SchemaIssue[] {
  const issues: SchemaIssue[] = [];
  const t = canonicalBlockType(rawType);
  const sch = BLOCK_SCHEMAS[t];
  if (!sch) return issues;

  const effFields = sch.fields;
  pushFieldIssues(issues, "", block, effFields);

  for (const slot of sch.requiredImageSlots ?? []) {
    const id = getBlockImageId(block, slot);
    if (!id || !isMediaUuid(id)) {
      issues.push({ path: `images.${slot}`, message: sch.imageSlotLabels?.[slot] || slot });
    }
  }

  const nestedKey = sch.imagesNestedIn ?? sch.nestedList?.arrayKey ?? null;
  if (!nestedKey) return issues;

  const arr = block[nestedKey];
  if (!Array.isArray(arr)) return issues;

  const itemMap = sch.itemFields ?? sch.nestedList?.fields;
  let i = 0;
  for (const item of arr) {
    if (!item || typeof item !== "object") {
      i += 1;
      continue;
    }
    const row = item as Record<string, unknown>;
    const p = `${nestedKey}[${i}].`;
    pushFieldIssues(issues, p, row, itemMap);

    if (sch.imagesNestedIn) {
      for (const slot of sch.requiredItemImageSlots ?? []) {
        const id = getBlockImageId(row, slot);
        if (!id || !isMediaUuid(id)) {
          issues.push({ path: `${p}images.${slot}`, message: `${slot} (${i + 1})` });
        }
      }
    }
    i += 1;
  }

  return issues;
}

export function collectPageSchemaIssues(blocks: unknown): SchemaIssue[] {
  if (!Array.isArray(blocks)) return [];
  const out: SchemaIssue[] = [];
  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks[bi];
    if (!block || typeof block !== "object") continue;
    const b = block as Record<string, unknown>;
    const rawType = typeof b.type === "string" ? b.type : "";
    if (!rawType) continue;
    const prefix = `blocks[${bi}] (${rawType}) `;
    for (const iss of collectBlockSchemaIssues(b, rawType)) {
      out.push({ path: prefix + iss.path, message: iss.message });
    }
  }
  return out;
}

export type HeroBlock = {
  type: "hero";
  title: unknown;
  subtitle: unknown;
  images?: { background?: string; mascot?: string };
  imageId?: string;
  ctaLabel?: unknown;
  secondaryLabel?: unknown;
  showScrollChevron?: boolean;
};

export type ServicesBlockItem = {
  images?: { icon?: string; cover?: string };
  imageId?: string;
  name?: unknown;
  priceLabel?: unknown;
};

export type ServicesBlock = {
  type: "services";
  sectionTitle?: unknown;
  title?: unknown;
  items?: ServicesBlockItem[];
};

export type CasesBlockItem = {
  images?: { cover?: string; logo?: string };
  imageId?: string;
  cat?: unknown;
  title?: unknown;
  result?: unknown;
  featured?: boolean;
};

export type CasesBlock = {
  type: "cases";
  sectionTitle?: unknown;
  title?: unknown;
  seeAllPath?: string;
  itemNavigatePath?: string;
  items?: CasesBlockItem[];
};
