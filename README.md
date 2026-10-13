# SendBloom

Libreng digital bouquet na puwedeng ipadala sa Messenger. Walang database at walang bayad.

## Paano gumagana
- Ang bouquet, mensahe, at pangalan ay naka-encode sa mismong link (`/b/<code>`), kaya walang backend.
- Ang `app/b/[code]/opengraph-image.tsx` ang gumagawa ng preview image na lumalabas sa Messenger chat.
- Ang `components/Reveal.tsx` ang boom effect: tap, flash, confetti, bloom ng mga bulaklak, falling petals, at typewriter na sulat.

## Run
```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Deploy (Vercel)
I-push sa GitHub at i-import sa Vercel. Optional: i-set ang `NEXT_PUBLIC_SITE_URL` (halimbawa `https://sendbloom.vercel.app`) para tama ang absolute URL ng preview image.

## Mga file
- `lib/bouquet.tsx` — drawing ng mga bulaklak at balot (SVG)
- `lib/codec.ts` — encode/decode at validation ng link
- `components/Builder.tsx` — gumagawa ng bouquet at share buttons
- `components/Reveal.tsx` — ang page na bubuksan ng pagbibigyan
