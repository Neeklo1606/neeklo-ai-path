/**
 * Keep validation rules in sync with `src/lib/block-schemas.ts` (same JSON + same logic).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const BLOCK_SCHEMAS = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/lib/block-schemas.json"), "utf8"),
);

const BLOCK_TYPE_ALIASES = {
  services_preview: "services",
  services_row: "services",
  cases_preview: "cases",
  works_preview: "cases",
  how_steps: "steps",
  cta_simple: "cta",
};

export function canonicalBlockType(type) {
  return BLOCK_TYPE_ALIASES[type] || type;
}

function deriveRequiredKeys(fieldMap) {
  if (!fieldMap || typeof fieldMap !== "object") return [];
  return Object.entries(fieldMap)
    .filter(([, d]) => d && d.required)
    .map(([k]) => k);
}

function effectiveBlockSchema(sch) {
  const fromTop = deriveRequiredKeys(sch.fields);
  const fromItem = deriveRequiredKeys(sch.itemFields);
  const fromNested = sch.nestedList?.fields ? deriveRequiredKeys(sch.nestedList.fields) : [];
  return {
    ...sch,
    requiredFields: [...new Set([...(sch.requiredFields ?? []), ...fromTop])],
    requiredItemFields: [...new Set([...(sch.requiredItemFields ?? []), ...fromItem, ...fromNested])],
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isMediaUuid(s) {
  return typeof s === "string" && UUID_RE.test(s.trim());
}

function getBlockImageId(block, key) {
  if (!block) return undefined;
  const imgs = block.images && typeof block.images === "object" && !Array.isArray(block.images) ? block.images : undefined;
  const pick = (k) => {
    const raw = imgs?.[k];
    return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
  };
  const direct = pick(key);
  if (direct) return direct;
  if (key === "mascot" && pick("main")) return pick("main");
  if (key === "icon" && pick("main")) return pick("main");
  if (key === "cover" && pick("main")) return pick("main");
  const leg = typeof block.imageId === "string" && block.imageId.trim() ? block.imageId.trim() : undefined;
  if (!leg) return undefined;
  if (["main", "mascot", "icon", "cover"].includes(key)) return leg;
  return undefined;
}

function fieldPresent(v) {
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "object" && !Array.isArray(v)) {
    const o = v;
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

function hasAnyImagePayload(block) {
  if (typeof block.imageId === "string" && block.imageId.trim()) return true;
  const imgs = block.images;
  if (imgs && typeof imgs === "object" && !Array.isArray(imgs) && Object.keys(imgs).length > 0) return true;
  return false;
}

function blockHasNestedItemImages(block, nested) {
  const arr = block[nested];
  if (!Array.isArray(arr)) return false;
  for (const it of arr) {
    if (!it || typeof it !== "object") continue;
    if (typeof it.imageId === "string" && it.imageId.trim()) return true;
    const im = it.images;
    if (im && typeof im === "object" && !Array.isArray(im) && Object.keys(im).length > 0) return true;
  }
  return false;
}

function validateImagesKeys(images, allowed, rawType) {
  if (images == null) return { ok: true };
  if (typeof images !== "object" || Array.isArray(images)) {
    return { ok: false, error: `Invalid images on block '${rawType}'` };
  }
  for (const key of Object.keys(images)) {
    if (!allowed.has(key)) {
      return { ok: false, error: `Invalid image slot '${key}' for block '${rawType}'` };
    }
    const v = images[key];
    if (v === undefined || v === null || v === "") continue;
    if (typeof v !== "string" || !isMediaUuid(v)) {
      return { ok: false, error: `Invalid media id for slot '${key}' on block '${rawType}'` };
    }
  }
  return { ok: true };
}

function validateOneBlock(block, sch, rawType) {
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
      const row = item;
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

export function validatePageBlocksSchema(blocks) {
  if (!Array.isArray(blocks)) return { ok: true };
  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    const b = block;
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
