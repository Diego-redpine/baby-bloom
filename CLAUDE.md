# CLAUDE.md — Baby in Bloom Project

Baby shower web app for Diego's sister Adamary. Guests scan a QR code at the party table to access photo sharing, guessing game, and more.

## Tech Stack
- **Frontend:** Next.js 15 + React 19 + TypeScript + Tailwind CSS 4
- **Database:** Supabase (PostgreSQL + Storage)
- **Animations:** GSAP
- **Avatars:** facehash (deterministic pixel faces)
- **Fonts:** Cormorant Garamond (serif) + Pinyon Script (calligraphy)
- **Deploy:** GitHub Pages (static export)
- **Repo:** https://github.com/Diego-redpine/baby-bloom
- **Live:** https://diego-redpine.github.io/baby-bloom/

## Project Structure
```
src/
  app/
    page.tsx          — Home page (SVG watercolor flowers, GSAP animations)
    photos/page.tsx   — Photo sharing (onboarding, profiles, polaroid grid)
    game/page.tsx     — Baby guessing game (5-question wizard)
    admin/page.tsx    — Admin dashboard (view guesses + photos)
    reveal/page.tsx   — Reveal screen (show guesses at party)
    layout.tsx        — Root layout (fonts, metadata)
    globals.css       — Theme colors, utility styles
  lib/
    supabase.ts       — Supabase client
    guest.ts          — Cookie-based guest identity + avatar colors
public/
    qr-classic.png    — QR code (black on white)
    qr-sage.png       — QR code (sage green on cream)
    qr-blush.png      — QR code (dark rose on white)
```

## Supabase Tables
- **babyshower_guests** — id, name, avatar_url, avatar_color, created_at
- **babyshower_photos** — id, photo_url, guest_id, guest_name, created_at
- **babyshower_guesses** — id, guest_name, birth_date, birth_weight, baby_name, looks_like, birth_time, created_at

## Key Design Decisions

### SVG Flowers (page.tsx)
All flowers are hand-coded SVG components with watercolor filters:
- **Cosmos** — 5 broad oval petals, salmon pink, golden center
- **WildRose** — larger version, deeper pink, layered petals
- **Daisy** — cream petals, large dark brown center
- **Sunflower** — narrow yellow petals, dark center
- **SmallBlossom** — tiny 5-petal filler
- **TinyYellowFlower** — small buttercup accents
- **Butterfly** — 3 variants (gold monarch, pink, grey painted lady)
- **Bee** — striped body, translucent wings
- **Leaf/LeafSprig/Bud/Stem** — foliage

Compositions: FloralCornerTopLeft, FloralCornerTopRight, FloralSideLeft, FloralSideRight, FloralBottom

### Animations (GSAP)
- Flowers fade in with gentle scale on page load
- Letters "BABY" cascade in
- Text lines reveal sequentially
- Continuous ambient sway on flower corners
- Falling petal particles + sparkle dots

### Photos System
- Cookie-based identity (localStorage, no auth)
- Onboarding: enter name → pick facehash avatar color (8 options) or upload photo
- Profile avatars as horizontal filter bar (newest first, "All" at end)
- Polaroid-style photo cards with uploader avatar in bottom-left white space
- Instant photo appearance after upload (no refresh needed)
- Realtime subscription for other users' photos

## Design Reference
The visual style matches the baby shower invitation:
- Watercolor wildflower border (pink cosmos, cream daisies, yellow accents)
- Sage green (#2d5a27) and blush/cream (#fdf8f4) color palette
- Cormorant Garamond for headings, Pinyon Script for calligraphy
- No emojis anywhere in the UI

## Commands
```bash
npm run dev          # Dev server (port 3000)
npx next build       # Static export to /out
git push             # Auto-deploys via GitHub Actions
```

## Rules
- No emojis in the UI
- Fonts must match the invitation (Cormorant Garamond + Pinyon Script)
- Flowers should look like painted watercolor, not cartoons
- Keep watercolor SVG filters light (stdDeviation < 0.5) for crisp petals
- All Supabase tables have public RLS policies (no auth)
- Photos upload to `babyshower-photos` storage bucket
