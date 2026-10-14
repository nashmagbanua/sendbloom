# SendBloom

Libreng digital bouquet na puwedeng ipadala sa Messenger. Walang database at walang bayad.

## Paano gumagana
- Ang bouquet, mensahe, at pangalan ay naka-encode sa mismong link (`/b/<code>`), kaya walang backend storage.
- Ang `app/b/[code]/opengraph-image.tsx` ang gumagawa ng preview image na lumalabas sa Messenger chat.
- Ang `components/Reveal.tsx` ang two-step surprise: sealed envelope → bloom + kanta → second seal → sulat.
- Ang `app/api/song/route.ts` ay naghahanap ng iTunes preview (country=PH) para sa kalakip na kanta.

## Run
```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

May `bun.lock` din kung mas gusto mong gumamit ng Bun.

## Env vars
Kopyahin ang `.env.example` at i-set kung kailangan:

| Variable | Gamit |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | Absolute URL (hal. `https://sendbloom.vercel.app`) para tama ang OG image |
| `NEXT_PUBLIC_REPORT_EMAIL` | Email para sa “I-report ang bouquet na ito” link |

## Deploy (Vercel)
I-push sa GitHub at i-import sa Vercel. I-set ang env vars sa Vercel dashboard kung kailangan.

## Mga file
- `lib/bouquet.tsx` — drawing ng mga bulaklak at balot (SVG)
- `lib/codec.ts` — encode/decode at validation ng link
- `lib/constants.ts` — presets, themes, salutations, closings
- `lib/audio.ts` — Web Audio SFX at synth melody
- `components/Builder.tsx` — gumagawa ng bouquet at share buttons
- `components/Reveal.tsx` — ang page na bubuksan ng pagbibigyan
- `app/api/song/route.ts` — iTunes song search + rate limit + cache
