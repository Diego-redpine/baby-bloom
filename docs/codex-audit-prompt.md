# Codex Audit Prompt — Baby Bloom

Copy this into Codex for an independent audit of the project.

---

## Prompt

You are auditing a baby shower web app that goes live TODAY for real guests. Find every bug, issue, and risk. Be thorough — missed bugs will be visible to 30+ party guests on their phones.

### Project Overview
- **Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Supabase (Postgres + Storage)
- **Identity:** Cookie/localStorage-based (no auth). Guest scans QR, enters name, picks avatar, gets a UUID stored in localStorage.
- **Deploy:** GitHub Pages (static export with `output: "export"` and `basePath: "/baby-bloom"`)

### Features to Audit

**1. Landing Page (`src/app/page.tsx`)**
- 3 CTA buttons: Share Memories → /photos, What's She Like? → /game, Time Capsule → /capsule
- SVG watercolor flowers with GSAP animations

**2. Share Memories (`src/app/photos/page.tsx`)**
- Photo upload to Supabase Storage bucket `babyshower-photos`
- Polaroid grid with guest avatars
- Realtime subscription for new photos
- Uses shared `GuestOnboarding` component from `src/components/GuestOnboarding.tsx`

**3. What's She Like? Game (`src/app/game/page.tsx`)**
- 8 questions, 3 types: freetext, thisorthat, multiplechoice
- One question at a time, auto-advance on choice selection
- Submits all answers as batch insert to `babyshower_game_votes` table
- Results screen with live aggregate data via Supabase Realtime
- If guest already submitted, skips straight to results on return

**4. Time Capsule (`src/app/capsule/page.tsx`)**
- Video or voice recording via MediaRecorder API
- Retake flow, preview, submit
- Uploads to Supabase Storage bucket `babyshower-capsule`
- One submission per guest (checks on mount)
- Completion screen shown if already submitted

**5. Admin Dashboard (`src/app/admin/page.tsx`)**
- Tabs: Photos, Game Results, Time Capsule
- Game results display 3 types: percentage bars (thisorthat/multiplechoice), text grid (freetext)
- Capsule playback via signed URLs

**6. Shared Components**
- `src/components/GuestAvatar.tsx` — facehash avatars with 8 color palettes
- `src/components/GuestOnboarding.tsx` — name + avatar picker, creates Supabase guest record
- `src/lib/guest.ts` — localStorage read/write for guest identity

### Supabase Tables (all public RLS)
- `babyshower_guests` (id, name, avatar_url, avatar_color, created_at)
- `babyshower_photos` (id, photo_url, guest_id, guest_name, created_at)
- `babyshower_game_votes` (id, guest_id, guest_name, question_key, answer, created_at) — UNIQUE(guest_id, question_key)
- `babyshower_capsule_messages` (id, guest_id, guest_name, media_type, storage_path, duration_seconds, created_at)

### What to Look For
1. **Runtime crashes** — null access, undefined refs, missing error handling
2. **Logic bugs** — wrong state transitions, race conditions, stale closures
3. **Mobile/iOS issues** — MediaRecorder on Safari, touch events, viewport problems
4. **Data bugs** — failed inserts that fail silently, duplicate submissions, FK violations
5. **UX blockers** — flows where a guest could get stuck with no way out
6. **Security** — any way a guest could see other guests' private capsule recordings
7. **Static export issues** — anything that won't work with `output: "export"` (server-only features, dynamic routes)
8. **basePath issues** — hardcoded paths that don't respect `/baby-bloom` prefix

### Output Format
For each issue:
- **File:** path and line number
- **Severity:** Critical / High / Medium / Low
- **Description:** What's wrong
- **Fix:** Concrete code change

List ALL issues, even minor ones. This is a one-shot event — there's no second chance.
