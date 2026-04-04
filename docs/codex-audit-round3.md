# Codex Audit Round 3 — Baby Bloom

Third and final audit pass. Party is in hours. Find what two prior rounds missed.

---

## Prompt

Third-pass audit of a baby shower app going live TODAY. Two prior rounds fixed 20+ bugs. Your job: find what we STILL missed. Be ruthless — trace every flow end to end.

### Already Fixed (DO NOT re-report)
All items from rounds 1 and 2, plus:
- Video preview blob URL fix (now uses useState + useEffect instead of inline createObjectURL)
- Full English/Spanish i18n with LanguageProvider, localStorage persistence, 10s popup
- Reveal page rewritten for new game schema
- Game answers always stored in English regardless of display language

### Critical Traces — Walk Through These Flows

**1. Video capsule end-to-end on iOS Safari:**
Read `src/app/capsule/page.tsx` line by line. Trace:
- User taps "Record Video" → getUserMedia → MediaRecorder starts → chunks collected
- User taps "Stop" → recorder.onstop fires → blob created → screen changes to "preview"
- Preview screen: useEffect creates blob URL → video element gets src → user sees preview
- User taps "Submit" → blob uploaded to Supabase → DB record inserted → done screen

Questions to answer:
- Does the blob get the correct MIME type from `detectedMimeTypeRef`?
- Does `recorder.onstop` fire AFTER all `dataavailable` events?
- Is `previewUrl` set before the preview screen renders, or is there a flash?
- Does the file extension match the actual MIME type on upload?
- Does iOS Safari actually play back webm/mp4 blobs in a `<video>` element?
- Are `playsInline` and `controls` both present?

**2. Game i18n answer storage:**
Read `src/app/game/page.tsx`. Trace:
- Spanish user sees "De mama" / "De papa" buttons
- They tap "De mama"
- What value goes into `handleThisOrThatSelect`? Is it the English "Mama's girl" or the Spanish "De mama"?
- What gets inserted into Supabase?
- On the results screen, do the percentage bars match English values from DB against English option labels?

**3. Language provider in static export:**
Read `src/app/layout.tsx` and `src/lib/LanguageContext.tsx`.
- Layout is a Server Component that renders `<LanguageProvider>` (a client component)
- Does this work with `output: "export"`? Server Components can render client components, but verify no SSR-only APIs are used
- Does `localStorage` access in the provider cause hydration mismatches?
- The `loaded` state returns null until localStorage is read — does this cause a flash of no content?

**4. Translation completeness:**
Read `src/lib/translations.ts`. Cross-reference every `t()` call in every file against the translation keys. Are there any keys referenced in code that don't exist in the translations file? That would show the raw key string to users.

**5. Timer cleanup in LanguageContext:**
The 10-second popup timer — what happens if:
- User navigates away before 10 seconds (React unmount)
- User picks a language in the popup, then the timer fires after
- Component re-renders before timer fires

### Files to Review
```
src/app/capsule/page.tsx
src/app/game/page.tsx
src/app/photos/page.tsx
src/app/reveal/page.tsx
src/app/page.tsx
src/app/layout.tsx
src/app/admin/page.tsx
src/lib/LanguageContext.tsx
src/lib/translations.ts
src/components/GuestOnboarding.tsx
src/components/LanguagePopup.tsx
src/components/GuestAvatar.tsx
```

### Output Format
For each NEW issue:
- **File:** path and line number
- **Severity:** Critical / High / Medium / Low
- **Description:** What's wrong, when it would break, and on which device/browser
- **Fix:** Concrete code change

Only report NEW issues. Zero tolerance for re-reporting fixed bugs.
