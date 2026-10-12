# portable-digital-front

IT services storefront on Next.js 16 (App Router, React 19, server rendering with Cache Components).
Data comes from the NestJS API in `portable-digital-back`.

## Development

```bash
cp .env.example .env.local   # API_URL, NEXT_PUBLIC_SITE_URL
npm install
npm run dev                  # http://localhost:3000
```

## Pages

| Route | What it renders |
| --- | --- |
| `/` | Vantage landing: full-screen video hero, no scroll (`src/app/(landing)`) |
| `/services` | Catalogue: `?category=`, `?q=` search, `?page=` |
| `/services/[slug]` | Service details, pricing tiers, request form, JSON-LD |
| `/contact` | Project request form (Server Action → `POST /api/leads`) |
| `/sitemap.xml`, `/robots.txt` | Built from `GET /api/services/sitemap` |

The static shell of every page is prerendered at build time. Catalogue data is fetched on the server per request
(cached in memory for ~1 minute, see `src/lib/api.ts`), so the build does not need a running backend.

## Docker

```bash
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://example.com -t portable-front .
docker run -p 3000:3000 -e API_URL=http://backend:4000/api portable-front
```

## Landing fonts

The landing uses the **Reference Sans** and **Reference Display** variable fonts. They are not on Google Fonts:
put the files at `public/fonts/ReferenceSans-Variable.woff2` and `public/fonts/ReferenceDisplay-Variable.woff2`.
Until then the page falls back to Arial.

## Landing background videos

`public/videos/*.mp4` play in turn with a crossfade (`REEL` in `src/app/(landing)/Vantage.tsx`).
The LED look is baked into the files with `scripts/led-video.sh` (ffmpeg); sources are Mixkit clips
(free Mixkit License): 45219 "Android walking robotically against a green screen", 20970 "Robotic arm in a factory"
and 45229 "Space shuttle taking off from Earth" (`rocket-launch.mp4`).
The launch clip goes through `led-video.sh` with the pre-filter
`scale=1920:1080,curves=all='0/0 0.4/0.02 0.75/0.35 1/1'`: crushed shadows leave only the plume lit.
# portable-digital-front
