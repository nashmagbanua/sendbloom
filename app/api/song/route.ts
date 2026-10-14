import { NextRequest, NextResponse } from "next/server";

const MAX_TITLE = 60;
const MAX_ARTIST = 50;
const FETCH_TIMEOUT_MS = 6000;

/** Best-effort in-memory per-IP rate limit (resets on cold start). */
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

function looseArtistMatch(requested: string, found: string): boolean {
  if (!requested.trim()) return true;
  const a = requested.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const b = found.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!a || !b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const aWords = a.split(" ").filter((w) => w.length > 2);
  const bWords = new Set(b.split(" ").filter((w) => w.length > 2));
  if (aWords.length === 0) return true;
  const hits = aWords.filter((w) => bWords.has(w)).length;
  return hits >= Math.ceil(aWords.length * 0.5);
}

async function itunesSearch(term: string): Promise<any[] | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=8&country=PH`,
      {
        headers: { "User-Agent": "SendBloom/2.0" },
        signal: controller.signal,
        next: { revalidate: 86400 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data?.results) ? data.results : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function cacheHeaders() {
  return {
    "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
  };
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { found: false, error: "rate_limited" },
      { status: 429, headers: cacheHeaders() }
    );
  }

  const { searchParams } = new URL(req.url);
  const titleRaw = searchParams.get("title")?.trim() || "";
  const artistRaw = searchParams.get("artist")?.trim() || "";

  if (!titleRaw && !artistRaw) {
    return NextResponse.json({ found: false }, { headers: cacheHeaders() });
  }

  if (titleRaw.length > MAX_TITLE || artistRaw.length > MAX_ARTIST) {
    return NextResponse.json({ found: false }, { headers: cacheHeaders() });
  }

  const title = titleRaw.slice(0, MAX_TITLE);
  const artist = artistRaw.slice(0, MAX_ARTIST);
  const primaryQuery = `${title} ${artist}`.trim();

  try {
    let results = await itunesSearch(primaryQuery);

    // Title-only fallback only when artist was provided and we can verify a loose match
    if ((!results || results.length === 0) && artist && title) {
      const titleResults = await itunesSearch(title);
      if (titleResults && titleResults.length > 0) {
        results = titleResults.filter((t: any) =>
          looseArtistMatch(artist, t.artistName || "")
        );
        if (results.length === 0) results = null;
      }
    }

    if (results && results.length > 0) {
      // Prefer tracks whose artist loosely matches when artist was given
      let candidates = results;
      if (artist) {
        const matched = results.filter((t: any) =>
          looseArtistMatch(artist, t.artistName || "")
        );
        if (matched.length > 0) candidates = matched;
        else {
          // No artist match at all — do not return an unrelated song
          return NextResponse.json(
            { found: false, query: primaryQuery, title, artist },
            { headers: cacheHeaders() }
          );
        }
      }

      const trackWithAudio =
        candidates.find((t: any) => !!t.previewUrl) || candidates[0];

      if (trackWithAudio && trackWithAudio.previewUrl) {
        return NextResponse.json(
          {
            found: true,
            title: trackWithAudio.trackName || title,
            artist: trackWithAudio.artistName || artist,
            audioUrl: trackWithAudio.previewUrl,
            artwork: trackWithAudio.artworkUrl100 || trackWithAudio.artworkUrl60,
            query: primaryQuery,
          },
          { headers: cacheHeaders() }
        );
      }
    }

    return NextResponse.json(
      { found: false, query: primaryQuery, title, artist },
      { headers: cacheHeaders() }
    );
  } catch {
    return NextResponse.json(
      { found: false, query: primaryQuery, title, artist },
      { headers: cacheHeaders() }
    );
  }
}
