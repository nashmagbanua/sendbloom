import {
  Bouquet,
  CardTheme,
  CARD_THEMES,
  Flower,
  FlowerType,
  FLOWER_META,
  FLOWER_ORDER,
  MAX_FLOWERS,
  MAX_LINK,
  MAX_MSG,
  MAX_NAME,
  StickerId,
  STICKER_META,
  WrapId,
  WRAPS,
} from "./constants";

function b64urlEncode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): string {
  const p = s.replace(/-/g, "+").replace(/_/g, "/");
  const padded = p + "=".repeat((4 - (p.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// strip control characters and clamp length
function clean(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max);
}

export function safeLink(v: unknown): string | undefined {
  if (typeof v !== "string" || !v) return undefined;
  const s = v.trim().slice(0, MAX_LINK);
  try {
    const u = new URL(s);
    return u.protocol === "https:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

const CODE_TO_TYPE: Record<string, FlowerType> = Object.fromEntries(
  FLOWER_ORDER.map((t) => [FLOWER_META[t].code, t])
) as Record<string, FlowerType>;

export function encodeBouquet(b: Bouquet): string {
  const payload: Record<string, unknown> = {
    t: clean(b.to, MAX_NAME),
    r: clean(b.from, MAX_NAME),
    m: clean(b.msg, MAX_MSG),
    w: b.w,
    f: b.f.slice(0, MAX_FLOWERS).map((x) => FLOWER_META[x.t].code + x.c),
    s: safeLink(b.s),
  };
  if (b.st?.trim()) payload.st = clean(b.st, 60);
  if (b.sa?.trim()) payload.sa = clean(b.sa, 50);
  if (b.k && b.k in STICKER_META) payload.k = b.k;
  if (b.c && b.c in CARD_THEMES) payload.c = b.c;

  return b64urlEncode(JSON.stringify(payload));
}

export function decodeBouquet(code: string): Bouquet | null {
  try {
    if (!code || code.length > 2000) return null;
    const raw = JSON.parse(b64urlDecode(code));
    if (!raw || typeof raw !== "object") return null;

    const flowers: Flower[] = [];
    if (Array.isArray(raw.f)) {
      for (const item of raw.f.slice(0, MAX_FLOWERS)) {
        if (typeof item !== "string" || item.length < 2) continue;
        const t = CODE_TO_TYPE[item[0]];
        const c = parseInt(item.slice(1), 10);
        if (!t || Number.isNaN(c)) continue;
        const max = FLOWER_META[t].colors.length - 1;
        flowers.push({ t, c: Math.max(0, Math.min(max, c)) });
      }
    }
    if (flowers.length === 0) return null;

    const w: WrapId = raw.w in WRAPS ? raw.w : "kraft";
    const k: StickerId | undefined = raw.k in STICKER_META ? (raw.k as StickerId) : undefined;
    const c: CardTheme | undefined = raw.c in CARD_THEMES ? (raw.c as CardTheme) : undefined;
    const st: string | undefined = typeof raw.st === "string" ? clean(raw.st, 60) : undefined;
    const sa: string | undefined = typeof raw.sa === "string" ? clean(raw.sa, 50) : undefined;

    return {
      to: clean(raw.t, MAX_NAME),
      from: clean(raw.r, MAX_NAME),
      msg: clean(raw.m, MAX_MSG),
      w,
      f: flowers,
      s: safeLink(raw.s),
      st,
      sa,
      k,
      c,
    };
  } catch {
    return null;
  }
}
