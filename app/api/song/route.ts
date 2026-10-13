import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title")?.trim() || "";
  const artist = searchParams.get("artist")?.trim() || "";

  if (!title && !artist) {
    return NextResponse.json({ found: false });
  }

  // 1. Try search with title and artist together
  const primaryQuery = `${title} ${artist}`.trim();

  try {
    let res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(primaryQuery)}&entity=song&limit=5`,
      {
        headers: { "User-Agent": "SendBloom/2.0" },
        next: { revalidate: 86400 },
      }
    );

    let data = res.ok ? await res.json() : null;

    // 2. If no match and artist was provided, fallback to searching just the title
    if ((!data?.results || data.results.length === 0) && artist && title) {
      res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(title)}&entity=song&limit=5`,
        {
          headers: { "User-Agent": "SendBloom/2.0" },
          next: { revalidate: 86400 },
        }
      );
      if (res.ok) {
        data = await res.json();
      }
    }

    if (data?.results && data.results.length > 0) {
      // Pick best matching track with previewUrl
      const trackWithAudio = data.results.find((t: any) => !!t.previewUrl) || data.results[0];

      if (trackWithAudio && trackWithAudio.previewUrl) {
        return NextResponse.json({
          found: true,
          title: trackWithAudio.trackName || title,
          artist: trackWithAudio.artistName || artist,
          audioUrl: trackWithAudio.previewUrl,
          artwork: trackWithAudio.artworkUrl100 || trackWithAudio.artworkUrl60,
          query: primaryQuery,
        });
      }
    }

    return NextResponse.json({ found: false, query: primaryQuery, title, artist });
  } catch (error) {
    return NextResponse.json({ found: false, query: primaryQuery, title, artist });
  }
}
