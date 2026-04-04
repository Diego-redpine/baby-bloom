# Codex Audit Round 2 — Baby Bloom

This is a SECOND audit pass. Round 1 caught and fixed major bugs. Now find what we missed.

---

## Prompt

You are performing a second-pass audit on a baby shower app that goes live TODAY at 6pm. Round 1 already caught and fixed the obvious bugs. Your job is to find the subtle ones — edge cases, race conditions, mobile quirks, and things that only break under real usage.

### Already Fixed (DO NOT re-report)
- Lavender hex typo in guest.ts
- Capsule storage_path now stores filename, not full URL
- Capsule upload error feedback (alert added)
- Game filters empty answers before insert
- Game uses shared GuestOnboarding (proper Supabase identity)
- Game submit checks for Supabase errors
- GuestOnboarding has error handling + double-tap prevention
- 120s max recording duration on capsule
- iOS Safari MediaRecorder MIME type detection added
- Blob URL cleanup in capsule
- Metadata year corrected to 2026
- Manifest basePath fixed
- Pinch zoom re-enabled (maximumScale removed)
- UNIQUE(guest_id) constraint on capsule_messages in DB
- Admin signed URLs fetched in parallel
- Photo save/download buttons added

### What to Look For This Round

**1. Bugs in the fixes themselves**
The fixes above introduced new code. Review that new code for bugs — wrong variable names, missed edge cases, incomplete error paths.

**2. The reveal page is probably broken**
`src/app/reveal/page.tsx` was built for the OLD `babyshower_guesses` table (birth_date, birth_weight, baby_name, looks_like, birth_time). The game was replaced with `babyshower_game_votes` (question_key, answer). Does the reveal page still work? Does it query the right table?

**3. Race conditions**
- What happens if two tabs submit game answers simultaneously?
- What if a realtime event fires while the component is unmounting?
- What if the guest identity changes mid-session (cookie cleared while on a page)?

**4. Mobile layout bugs**
- Are touch targets at least 44px on all interactive elements?
- Do long guest names or long freetext answers overflow their containers?
- Does the photo grid handle portrait vs landscape photos correctly?
- Does the sticky header in photos page overlap content?

**5. Cross-origin download issues**
The photo download function uses `fetch(url)` then creates a blob. Will this work for Supabase Storage URLs? Are there CORS headers? What about the "Save All" function with many photos?

**6. Navigation dead ends**
- Can a guest get stuck on any screen with no way back?
- What happens if a guest hits browser back during capsule recording?
- Does the capsule "no-profile" screen actually lead somewhere useful?

**7. Static export compatibility**
The app uses `output: "export"` and deploys to GitHub Pages. Check for:
- Any use of `next/headers`, `cookies()`, or server-only APIs
- Dynamic routes that need server rendering
- API routes that won't work in static export

**8. Realtime subscription cleanup**
Are all Supabase realtime subscriptions properly cleaned up on unmount? Memory leaks from orphaned channels?

**9. Accessibility**
- Color contrast on sage/cream text combinations
- Focus states on interactive elements
- Screen reader compatibility of custom components

**10. Data edge cases**
- What if a guest has a very long name (50+ chars)?
- What if the Supabase project hits rate limits during the party?
- What if someone uploads a 20MB photo?

### Files to Review
```
src/app/page.tsx
src/app/game/page.tsx
src/app/capsule/page.tsx
src/app/photos/page.tsx
src/app/admin/page.tsx
src/app/reveal/page.tsx
src/components/GuestOnboarding.tsx
src/components/GuestAvatar.tsx
src/lib/guest.ts
src/lib/supabase.ts
next.config.ts
```

### Output Format
For each NEW issue (not already fixed):
- **File:** path and line number
- **Severity:** Critical / High / Medium / Low
- **Description:** What's wrong and when it would manifest
- **Fix:** Concrete code change

Focus on things that would actually break during a real party with 30+ guests on phones.
