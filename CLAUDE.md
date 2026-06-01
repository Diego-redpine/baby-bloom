# Baby in Bloom

Baby shower web app for Diego's sister Adamary. QR-code → photo sharing + guessing game. Live: https://diego-redpine.github.io/baby-bloom/

## Status (2026-03-26, ~stale)
Live, auto-deploys on push via GitHub Actions. Family testing phase ahead of Apr 4 shower. Own Supabase project `mkhlmcrrsrnkdaxllqxa`.

## Stack
Next.js 15 + React 19 + TS + Tailwind 4. Supabase (Postgres + Storage). GSAP. facehash avatars. Cormorant Garamond + Pinyon Script. Static export → GitHub Pages.

## Where things live
- `src/app/page.tsx` — Home (hand-coded SVG watercolor flowers, GSAP animations)
- `src/app/photos/page.tsx` — Photo sharing (onboarding, profiles, polaroid grid)
- `src/app/game/page.tsx` — 5-question guessing wizard
- `src/app/admin/page.tsx`, `reveal/page.tsx` — admin + reveal screens
- `src/lib/supabase.ts`, `src/lib/guest.ts` — client + cookie identity
- `public/qr-{classic,sage,blush}.png` — printable QR codes
- Supabase tables: `babyshower_guests`, `babyshower_photos`, `babyshower_guesses`. Bucket `babyshower-photos` (public).

## Rules
- No emojis in UI
- Fonts must match invitation (Cormorant Garamond + Pinyon Script)
- Watercolor SVGs (stdDeviation < 0.5 for crisp petals), not cartoons
- Public RLS (no auth)

## Open items (Diego's hands)
- Rename Supabase project "Twin Tigers Taekwondo" → "Projects" in dashboard
- Family testing for remaining bugs
- Drop old Twin Tigers tables (empty, safe)

## Commands
```bash
npm run dev          # localhost:3000
npx next build       # static export to /out
git push             # auto-deploys
```

## See also
- HISTORY.md — Supabase migration details, identity behavior, mobile pass notes, design-decision rationale
