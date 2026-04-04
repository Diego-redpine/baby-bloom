# Codex Final Audit — Baby Bloom

Final pre-party audit. App goes live in hours. Three prior rounds caught 25+ bugs. Find anything remaining.

---

## Prompt

Final audit of a baby shower app going live TODAY. Three prior rounds already fixed 25+ bugs. Find anything we still missed. Zero tolerance for false positives — only report real issues.

### Already Fixed (DO NOT re-report)
- Lavender hex, capsule storage_path, upload errors, game empty answers, GuestOnboarding errors, 120s max recording, iOS MediaRecorder MIME detection, blob URL cleanup, metadata year, manifest basePath, pinch zoom, capsule unique constraint, admin signed URLs → public URLs, photo downloads, reveal page rewritten, i18n across all pages, video preview blob URL, language gate (inline on landing page, not popup), hydration error (Math.random → deterministic), guest identity validation against Supabase on mount, admin subtitle removed

### Current Architecture
- Language gate: inline on landing page, two buttons in the pink card, GSAP fade out → content animates in
- Guest identity: `getValidatedGuest()` checks localStorage guest_id against Supabase `babyshower_guests` table on every page mount. Clears stale identity automatically.
- No more `LanguagePopup` component (deleted)
- `LanguageContext` exposes: `lang`, `setLang`, `t()`, `hasChosen`

### What to Look For

**1. The landing page language gate flow**
Read `src/app/page.tsx`. Trace:
- First visit: server renders gate (mounted=false), client sets mounted=true, still shows gate since hasChosen=false
- User taps English → GSAP fades gate → setLang("en") → hasChosen=true → content renders → animateContentIn() triggers
- Return visit: mounted=true + hasChosen=true → content renders immediately → animateContentIn() triggers
- Any flash? Any missing animations? Any broken state?

**2. Guest validation flow**
Read `src/lib/guest.ts` `getValidatedGuest()`. Is there a race condition? What if the Supabase query is slow? Does the page show a broken state while waiting?

**3. Remaining hardcoded strings**
Search ALL files for English strings that should be translated. Check alert() calls, placeholder texts, button labels, heading text.

**4. Mobile-specific issues**
- Touch targets under 44px
- Text overflow on small screens
- Video playback on iOS Safari
- Keyboard pushing content off screen on input focus

**5. Static export compatibility**
Any use of server-only APIs, dynamic routes, or features that break with `output: "export"`?

**6. Edge cases**
- What if Supabase is down? Does every page handle it gracefully?
- What if a guest opens multiple tabs?
- What if someone submits the game, clears localStorage, and revisits?

### Files
```
src/app/page.tsx
src/app/game/page.tsx  
src/app/capsule/page.tsx
src/app/photos/page.tsx
src/app/reveal/page.tsx
src/app/admin/page.tsx
src/app/layout.tsx
src/lib/LanguageContext.tsx
src/lib/translations.ts
src/lib/guest.ts
src/lib/supabase.ts
src/components/GuestOnboarding.tsx
src/components/GuestAvatar.tsx
```

### Output Format
For each NEW issue only:
- **File:** path:line
- **Severity:** Critical / High / Medium / Low
- **What breaks:** specific scenario
- **Fix:** concrete code change
