"use client";

import { useState } from "react";
import { AVATAR_COLORS } from "@/lib/guest";

/* ── Tiny copy-to-clipboard helper ── */
function Swatch({ hex, label, className }: { hex: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(hex); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
      className={`group flex flex-col items-center gap-1.5 ${className || ""}`}
    >
      <div
        className="w-16 h-16 rounded-xl shadow-md border border-black/5 transition-transform group-hover:scale-105"
        style={{ backgroundColor: hex }}
      />
      <span className="text-xs font-semibold text-sage">{label}</span>
      <span className="text-[10px] text-sage/50 font-mono">{copied ? "Copied!" : hex}</span>
    </button>
  );
}

/* ── Section wrapper ── */
function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-sage" style={{ fontFamily: "var(--font-serif)" }}>{title}</h2>
        <div className="flex-1 h-px bg-blush" />
      </div>
      {children}
    </section>
  );
}

/* ── Sub-section label ── */
function SubLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-sage/50 uppercase tracking-wider mb-3 mt-6">{children}</p>;
}

/* ── Nav link item ── */
const NAV_ITEMS = [
  { id: "colors", label: "Colors" },
  { id: "avatars", label: "Avatar Palettes" },
  { id: "typography", label: "Typography" },
  { id: "buttons", label: "Buttons" },
  { id: "inputs", label: "Inputs" },
  { id: "cards", label: "Cards" },
  { id: "radius", label: "Border Radius" },
  { id: "shadows", label: "Shadows" },
  { id: "opacity", label: "Opacity" },
  { id: "layout", label: "Layout" },
  { id: "spacing", label: "Spacing" },
];

export default function DesignReferencePage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur-sm border-b border-blush/40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-bold text-sage" style={{ fontFamily: "var(--font-serif)" }}>
              Baby in Bloom
            </h1>
            <span className="text-sage/40 text-sm">Design Reference</span>
          </div>
          {/* Quick nav */}
          <nav className="flex gap-4 mt-2 overflow-x-auto pb-1 scrollbar-hide">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-xs text-sage/50 hover:text-sage whitespace-nowrap transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-16">

        {/* ═══════════ COLORS ═══════════ */}
        <Section title="Colors" id="colors">
          <SubLabel>Theme Colors</SubLabel>
          <div className="flex flex-wrap gap-6">
            <Swatch hex="#fdf8f4" label="Cream" />
            <Swatch hex="#e8c4c4" label="Blush" />
            <Swatch hex="#f5e6e0" label="Blush Light" />
            <Swatch hex="#d4a0a0" label="Blush Dark" />
            <Swatch hex="#2d5a27" label="Sage" />
            <Swatch hex="#4a7c44" label="Sage Light" />
            <Swatch hex="#c9a84c" label="Gold" />
          </div>

          <SubLabel>SVG Flower Palette</SubLabel>
          <div className="flex flex-wrap gap-4">
            {["#e48888","#eba8a0","#f5ccc4","#c87070","#dc8888","#d48080"].map((hex) => (
              <Swatch key={hex} hex={hex} label="Petal" className="scale-90" />
            ))}
            {["#c8a830","#dcc040","#e8d460","#f0e478"].map((hex) => (
              <Swatch key={hex} hex={hex} label="Center" className="scale-90" />
            ))}
          </div>

          <SubLabel>Functional Colors</SubLabel>
          <div className="flex flex-wrap gap-6">
            <Swatch hex="#000000" label="Overlay" />
            <Swatch hex="#ffffff" label="White" />
            <Swatch hex="#f0d8a8" label="Sparkle" />
          </div>
        </Section>

        {/* ═══════════ AVATAR PALETTES ═══════════ */}
        <Section title="Avatar Palettes" id="avatars">
          <p className="text-sm text-sage/60 mb-4">8 four-color palettes for facehash avatars. Each row is one palette.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AVATAR_COLORS.map((palette) => (
              <div key={palette.name} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
                <span className="text-sm font-semibold text-sage w-20">{palette.name}</span>
                <div className="flex gap-2">
                  {palette.colors.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => navigator.clipboard.writeText(c)}
                      className="w-10 h-10 rounded-full border border-black/5 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-sage/40 font-mono hidden sm:block">{palette.colors[0]}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══════════ TYPOGRAPHY ═══════════ */}
        <Section title="Typography" id="typography">
          <SubLabel>Font Families</SubLabel>
          <div className="space-y-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-xs text-sage/40 font-mono mb-2">font-serif &middot; Cormorant Garamond</p>
              <p className="text-3xl text-sage" style={{ fontFamily: "var(--font-serif)" }}>
                Baby in Bloom — The quick brown fox jumps over the lazy dog
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-xs text-sage/40 font-mono mb-2">font-calligraphy &middot; Pinyon Script</p>
              <p className="text-3xl text-sage" style={{ fontFamily: "var(--font-calligraphy)" }}>
                Baby in Bloom — The quick brown fox jumps
              </p>
            </div>
          </div>

          <SubLabel>Font Weights (Cormorant Garamond)</SubLabel>
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-3">
            {[
              { weight: 300, label: "Light (300)" },
              { weight: 400, label: "Regular (400)" },
              { weight: 500, label: "Medium (500)" },
              { weight: 600, label: "Semibold (600)" },
              { weight: 700, label: "Bold (700)" },
            ].map(({ weight, label }) => (
              <div key={weight} className="flex items-baseline gap-4">
                <span className="text-[10px] text-sage/40 font-mono w-32">{label}</span>
                <p className="text-xl text-sage" style={{ fontFamily: "var(--font-serif)", fontWeight: weight }}>
                  Baby in Bloom
                </p>
              </div>
            ))}
          </div>

          <SubLabel>Type Scale</SubLabel>
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            {[
              { cls: "text-5xl", label: "text-5xl (3rem)", sample: "Display" },
              { cls: "text-4xl", label: "text-4xl (2.25rem)", sample: "Hero Title" },
              { cls: "text-3xl", label: "text-3xl (1.875rem)", sample: "Page Title" },
              { cls: "text-2xl", label: "text-2xl (1.5rem)", sample: "Section Heading" },
              { cls: "text-xl", label: "text-xl (1.25rem)", sample: "Card Heading" },
              { cls: "text-lg", label: "text-lg (1.125rem)", sample: "Subheading" },
              { cls: "text-base", label: "text-base (1rem)", sample: "Body Text" },
              { cls: "text-sm", label: "text-sm (0.875rem)", sample: "Description / Helper" },
              { cls: "text-xs", label: "text-xs (0.75rem)", sample: "Label / Caption" },
            ].map(({ cls, label, sample }) => (
              <div key={cls} className="flex items-baseline gap-4">
                <span className="text-[10px] text-sage/40 font-mono w-44 shrink-0">{label}</span>
                <p className={`${cls} text-sage font-semibold`} style={{ fontFamily: "var(--font-serif)" }}>
                  {sample}
                </p>
              </div>
            ))}
          </div>

          <SubLabel>Heading Patterns</SubLabel>
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <p className="text-[10px] text-sage/40 font-mono mb-1">Page title &middot; text-2xl font-bold text-sage + serif</p>
              <h3 className="text-2xl font-bold text-sage" style={{ fontFamily: "var(--font-serif)" }}>Baby Guessing Game</h3>
            </div>
            <div>
              <p className="text-[10px] text-sage/40 font-mono mb-1">Section header &middot; text-lg font-bold text-sage + serif</p>
              <h3 className="text-lg font-bold text-sage" style={{ fontFamily: "var(--font-serif)" }}>Share your memories</h3>
            </div>
            <div>
              <p className="text-[10px] text-sage/40 font-mono mb-1">Sub-label &middot; text-xs text-sage/50 uppercase tracking-wider</p>
              <p className="text-xs text-sage/50 uppercase tracking-wider">Default avatars</p>
            </div>
            <div>
              <p className="text-[10px] text-sage/40 font-mono mb-1">Body text &middot; text-sm text-sage/60</p>
              <p className="text-sm text-sage/60">Answer 5 questions about the baby!</p>
            </div>
            <div>
              <p className="text-[10px] text-sage/40 font-mono mb-1">Calligraphy accent &middot; text-4xl + calligraphy font</p>
              <p className="text-4xl" style={{ fontFamily: "var(--font-calligraphy)", color: "#d4a0a0" }}>*</p>
            </div>
          </div>
        </Section>

        {/* ═══════════ BUTTONS ═══════════ */}
        <Section title="Buttons" id="buttons">
          <div className="space-y-6">
            {/* Primary */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-[10px] text-sage/40 font-mono mb-3">Primary &middot; py-3 bg-sage text-cream font-semibold rounded-xl</p>
              <div className="flex flex-wrap gap-3 items-center">
                <button className="py-3 px-8 bg-sage text-cream font-semibold rounded-xl">Let&apos;s Go!</button>
                <button className="py-3 px-8 bg-sage text-cream font-semibold rounded-xl">Next</button>
                <button className="py-3 px-8 bg-sage text-cream font-semibold rounded-xl">Submit</button>
                <button className="py-3 px-8 bg-sage text-cream font-semibold rounded-xl opacity-40" disabled>Disabled</button>
              </div>
            </div>

            {/* Primary full width */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-[10px] text-sage/40 font-mono mb-3">Primary Full Width &middot; w-full max-w-xs py-3 bg-sage text-cream font-semibold rounded-xl</p>
              <div className="max-w-xs">
                <button className="w-full py-3 bg-sage text-cream font-semibold rounded-xl">Let&apos;s Go!</button>
              </div>
            </div>

            {/* Secondary */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-[10px] text-sage/40 font-mono mb-3">Secondary &middot; py-3 bg-blush text-sage font-semibold rounded-xl</p>
              <div className="flex flex-wrap gap-3 items-center">
                <button className="py-3 px-8 bg-blush text-sage font-semibold rounded-xl">Back to Home</button>
                <button className="py-3 px-8 bg-blush text-sage font-semibold rounded-xl">View Photos</button>
              </div>
            </div>

            {/* Tertiary / Back */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-[10px] text-sage/40 font-mono mb-3">Tertiary / Back &middot; py-3 bg-blush-light text-sage font-semibold rounded-xl</p>
              <div className="flex flex-wrap gap-3 items-center">
                <button className="py-3 px-8 bg-blush-light text-sage font-semibold rounded-xl">Back</button>
              </div>
            </div>

            {/* Ghost on dark */}
            <div className="bg-sage rounded-xl p-6 shadow-sm">
              <p className="text-[10px] text-cream/40 font-mono mb-3">Ghost (dark bg) &middot; py-3 px-6 bg-cream/20 text-cream &amp; bg-cream text-sage</p>
              <div className="flex flex-wrap gap-3 items-center">
                <button className="py-3 px-6 bg-cream/20 text-cream font-semibold rounded-xl">&larr; Previous</button>
                <button className="py-3 px-6 bg-cream text-sage font-semibold rounded-xl">Next &rarr;</button>
              </div>
            </div>

            {/* Floating Action */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-[10px] text-sage/40 font-mono mb-3">Floating Action &middot; bg-sage text-cream py-3 px-6 rounded-full shadow-lg</p>
              <button className="bg-sage text-cream font-semibold py-3 px-6 rounded-full shadow-lg text-sm">
                Take a Photo
              </button>
            </div>

            {/* Choice A/B */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-[10px] text-sage/40 font-mono mb-3">Choice A/B &middot; py-4 rounded-xl font-semibold border-2 border-blush</p>
              <div className="flex gap-3 max-w-xs">
                <button className="flex-1 py-4 rounded-xl font-semibold text-base bg-cream text-sage border-2 border-blush">
                  Adamary
                </button>
                <button className="flex-1 py-4 rounded-xl font-semibold text-base bg-cream text-sage border-2 border-blush">
                  Juan
                </button>
              </div>
              <p className="text-[10px] text-sage/40 font-mono mt-4 mb-2">Active / Flash states</p>
              <div className="flex gap-3 max-w-xs">
                <button className="flex-1 py-4 rounded-xl font-semibold text-base bg-pink-400 text-white scale-105 shadow-md">
                  Adamary
                </button>
                <button className="flex-1 py-4 rounded-xl font-semibold text-base bg-blue-400 text-white scale-105 shadow-md">
                  Juan
                </button>
              </div>
            </div>

            {/* Upload button */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-[10px] text-sage/40 font-mono mb-3">Upload &middot; py-2.5 px-6 rounded-xl text-sm font-semibold</p>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="py-2.5 px-6 rounded-xl text-center text-sm font-semibold bg-blush text-sage border border-blush-dark/20">
                  Upload Photo
                </div>
                <div className="py-2.5 px-6 rounded-xl text-center text-sm font-semibold bg-sage text-cream">
                  Photo uploaded
                </div>
              </div>
            </div>

            {/* Text links */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-[10px] text-sage/40 font-mono mb-3">Text Links</p>
              <div className="flex flex-wrap gap-6 items-center">
                <span className="text-sage/50 text-sm">&larr; Back</span>
                <span className="text-sage/40 text-[10px]">Not you?</span>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════════ INPUTS ═══════════ */}
        <Section title="Inputs" id="inputs">
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-[10px] text-sage/40 font-mono mb-3">Standard &middot; py-3 px-4 rounded-xl border-2 border-blush bg-white text-sage text-center text-lg</p>
              <div className="max-w-xs mx-auto">
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full py-3 px-4 rounded-xl border-2 border-blush bg-white text-sage text-center text-lg focus:outline-none focus:border-sage transition-colors"
                  readOnly
                />
              </div>
            </div>

            <div className="bg-cream rounded-xl p-6 border border-blush/20">
              <p className="text-[10px] text-sage/40 font-mono mb-3">On cream bg &middot; py-3 px-4 rounded-xl border-2 border-blush bg-cream text-sage text-center</p>
              <div className="max-w-xs mx-auto">
                <input
                  type="text"
                  placeholder="Your guess..."
                  className="w-full py-3 px-4 rounded-xl border-2 border-blush bg-cream text-sage text-center focus:outline-none focus:border-sage transition-colors"
                  readOnly
                />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-[10px] text-sage/40 font-mono mb-3">Admin (compact) &middot; py-2 px-3 rounded-lg border border-blush text-sage</p>
              <div className="max-w-xs space-y-2">
                <div>
                  <label className="text-sm text-sage/60">Birth Date</label>
                  <input type="date" className="w-full py-2 px-3 rounded-lg border border-blush text-sage" readOnly />
                </div>
                <div>
                  <label className="text-sm text-sage/60">Birth Weight</label>
                  <input type="text" placeholder="e.g. 7 lbs 4 oz" className="w-full py-2 px-3 rounded-lg border border-blush text-sage" readOnly />
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════════ CARDS ═══════════ */}
        <Section title="Cards" id="cards">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Question card */}
            <div>
              <p className="text-[10px] text-sage/40 font-mono mb-2">Question Card &middot; bg-white rounded-2xl shadow-lg p-5</p>
              <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
                <h2 className="text-lg font-bold text-sage mb-4" style={{ fontFamily: "var(--font-serif)" }}>What will baby&apos;s name be?</h2>
                <input
                  type="text"
                  placeholder="Your guess..."
                  className="w-full py-3 px-4 rounded-xl border-2 border-blush bg-cream text-sage text-center focus:outline-none"
                  readOnly
                />
              </div>
            </div>

            {/* Stat card */}
            <div>
              <p className="text-[10px] text-sage/40 font-mono mb-2">Stat Card &middot; bg-white rounded-xl p-4 shadow</p>
              <div className="bg-white rounded-xl p-4 text-center shadow">
                <p className="text-3xl font-bold text-sage">12</p>
                <p className="text-sage/60 text-sm">Guesses</p>
              </div>
            </div>

            {/* Polaroid card */}
            <div>
              <p className="text-[10px] text-sage/40 font-mono mb-2">Polaroid &middot; bg-white rounded-lg shadow-md p-2 pb-2.5</p>
              <div className="bg-white rounded-lg shadow-md p-2 pb-2.5 w-48">
                <div className="aspect-square rounded overflow-hidden bg-blush-light flex items-center justify-center">
                  <span className="text-sage/30 text-xs">Photo</span>
                </div>
                <div className="pt-1.5 pl-0.5">
                  <div className="w-5 h-5 rounded-full bg-sage/20" />
                </div>
              </div>
            </div>

            {/* Admin section */}
            <div>
              <p className="text-[10px] text-sage/40 font-mono mb-2">Admin Section &middot; bg-white rounded-xl p-6 shadow</p>
              <div className="bg-white rounded-xl p-6 shadow">
                <h2 className="font-bold text-sage mb-4">All Guesses</h2>
                <div className="border-b border-blush-light pb-3">
                  <p className="font-bold text-sage">Guest Name</p>
                  <div className="grid grid-cols-2 gap-1 text-sm text-sage/70 mt-1">
                    <span>Birth date</span>
                    <span>Weight</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reveal card (dark bg) */}
            <div className="sm:col-span-2">
              <p className="text-[10px] text-sage/40 font-mono mb-2">Reveal Card &middot; bg-white rounded-2xl shadow-2xl p-8 (on dark bg)</p>
              <div className="bg-sage rounded-2xl p-6">
                <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md mx-auto">
                  <h2 className="text-xl font-bold text-sage mb-6">What will baby&apos;s name be?</h2>
                  <button className="py-3 px-8 bg-blush text-sage font-bold rounded-xl text-lg">
                    Reveal Answers!
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reveal answer row */}
          <SubLabel>Reveal Answer Row</SubLabel>
          <div className="max-w-md">
            <div className="flex justify-between items-center py-3 px-4 bg-cream rounded-xl">
              <span className="font-semibold text-sage">Guest Name</span>
              <span className="text-sage/70">Luna</span>
            </div>
          </div>
        </Section>

        {/* ═══════════ BORDER RADIUS ═══════════ */}
        <Section title="Border Radius" id="radius">
          <div className="flex flex-wrap gap-6 items-end">
            {[
              { cls: "rounded-lg", label: "rounded-lg (8px)", size: "w-20 h-20" },
              { cls: "rounded-xl", label: "rounded-xl (12px)", size: "w-20 h-20" },
              { cls: "rounded-2xl", label: "rounded-2xl (16px)", size: "w-20 h-20" },
              { cls: "rounded-full", label: "rounded-full (50%)", size: "w-20 h-20" },
            ].map(({ cls, label, size }) => (
              <div key={cls} className="flex flex-col items-center gap-2">
                <div className={`${size} ${cls} bg-blush border-2 border-blush-dark/30`} />
                <span className="text-[10px] text-sage/50 font-mono text-center">{label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══════════ SHADOWS ═══════════ */}
        <Section title="Shadows" id="shadows">
          <div className="flex flex-wrap gap-8 items-end">
            {[
              { cls: "shadow-sm", label: "shadow-sm" },
              { cls: "shadow", label: "shadow" },
              { cls: "shadow-md", label: "shadow-md" },
              { cls: "shadow-lg", label: "shadow-lg" },
              { cls: "shadow-2xl", label: "shadow-2xl" },
            ].map(({ cls, label }) => (
              <div key={cls} className="flex flex-col items-center gap-2">
                <div className={`w-20 h-20 rounded-xl bg-white ${cls}`} />
                <span className="text-[10px] text-sage/50 font-mono">{label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══════════ OPACITY ═══════════ */}
        <Section title="Opacity" id="opacity">
          <p className="text-sm text-sage/60 mb-4">Used as alpha on sage text color: <code className="text-[10px] bg-sage/5 px-1.5 py-0.5 rounded font-mono">text-sage/[value]</code></p>
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-3">
            {[
              { val: "100", desc: "Primary text, headings" },
              { val: "80", desc: "Avatar filter (active)" },
              { val: "70", desc: "Secondary data values" },
              { val: "60", desc: "Body text, descriptions" },
              { val: "50", desc: "Back links, sub-labels" },
              { val: "40", desc: "Disabled state, empty state text" },
              { val: "20", desc: "Decorative / very faint" },
            ].map(({ val, desc }) => (
              <div key={val} className="flex items-center gap-4">
                <span className="text-[10px] text-sage/40 font-mono w-20">sage/{val}</span>
                <p className={`text-base font-semibold`} style={{ color: `rgb(45 90 39 / ${parseInt(val) / 100})` }}>
                  Baby in Bloom
                </p>
                <span className="text-[10px] text-sage/40 ml-auto">{desc}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══════════ LAYOUT ═══════════ */}
        <Section title="Layout" id="layout">
          <SubLabel>Max Widths</SubLabel>
          <div className="space-y-3">
            {[
              { cls: "max-w-xs", label: "max-w-xs (320px)", desc: "Game, onboarding" },
              { cls: "max-w-md", label: "max-w-md (448px)", desc: "Reveal cards" },
              { cls: "max-w-lg", label: "max-w-lg (512px)", desc: "Photo grid" },
              { cls: "max-w-2xl", label: "max-w-2xl (672px)", desc: "Admin dashboard" },
            ].map(({ cls, label, desc }) => (
              <div key={cls}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-sage/40 font-mono">{label}</span>
                  <span className="text-[10px] text-sage/40">&middot; {desc}</span>
                </div>
                <div className={`${cls} h-3 bg-sage/15 rounded-full`} />
              </div>
            ))}
          </div>

          <SubLabel>Grid Patterns</SubLabel>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-sage/40 font-mono mb-2">grid-cols-2 gap-4 &middot; Photos &amp; Stats</p>
              <div className="grid grid-cols-2 gap-4 max-w-xs">
                <div className="h-16 bg-blush/40 rounded-xl" />
                <div className="h-16 bg-blush/40 rounded-xl" />
                <div className="h-16 bg-blush/40 rounded-xl" />
                <div className="h-16 bg-blush/40 rounded-xl" />
              </div>
            </div>
            <div>
              <p className="text-[10px] text-sage/40 font-mono mb-2">grid-cols-4 gap-3 &middot; Avatar Picker</p>
              <div className="grid grid-cols-4 gap-3 max-w-xs">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-14 h-14 bg-blush/40 rounded-full mx-auto" />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════════ SPACING ═══════════ */}
        <Section title="Spacing" id="spacing">
          <p className="text-sm text-sage/60 mb-4">Common spacing values used across the app.</p>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <SubLabel>Padding Scale</SubLabel>
            <div className="space-y-2">
              {[
                { val: "p-2", px: "8px", desc: "Polaroid card inner" },
                { val: "p-4", px: "16px", desc: "Stat cards, page horizontal" },
                { val: "p-5", px: "20px", desc: "Question card inner" },
                { val: "p-6", px: "24px", desc: "Admin sections, onboarding screens" },
                { val: "p-8", px: "32px", desc: "Reveal card inner" },
              ].map(({ val, px, desc }) => (
                <div key={val} className="flex items-center gap-3">
                  <span className="text-[10px] text-sage/40 font-mono w-12">{val}</span>
                  <div className="bg-sage/10 rounded" style={{ width: px, height: "16px" }} />
                  <span className="text-[10px] text-sage/50">{px} &middot; {desc}</span>
                </div>
              ))}
            </div>

            <SubLabel>Common Vertical Gaps</SubLabel>
            <div className="space-y-2">
              {[
                { val: "gap-1", px: "4px" },
                { val: "gap-2", px: "8px" },
                { val: "gap-3", px: "12px" },
                { val: "gap-4", px: "16px" },
                { val: "gap-6", px: "24px" },
              ].map(({ val, px }) => (
                <div key={val} className="flex items-center gap-3">
                  <span className="text-[10px] text-sage/40 font-mono w-12">{val}</span>
                  <div className="flex gap-0 items-center">
                    <div className="w-4 h-4 bg-sage/20 rounded" />
                    <div className="bg-blush" style={{ width: px, height: "4px" }} />
                    <div className="w-4 h-4 bg-sage/20 rounded" />
                  </div>
                  <span className="text-[10px] text-sage/50">{px}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══════════ PROGRESS BAR ═══════════ */}
        <Section title="Progress Bar" id="progress">
          <div className="bg-white rounded-xl p-6 shadow-sm max-w-xs">
            <div className="flex justify-between text-xs text-sage/50 mb-2">
              <span>Guest Name</span>
              <span>3 of 5</span>
            </div>
            <div className="h-2 bg-blush-light rounded-full overflow-hidden">
              <div className="h-full bg-sage rounded-full transition-all duration-500" style={{ width: "60%" }} />
            </div>
          </div>
        </Section>

        {/* ═══════════ FULLSCREEN OVERLAY ═══════════ */}
        <Section title="Overlay" id="overlay">
          <p className="text-[10px] text-sage/40 font-mono mb-2">Fullscreen photo viewer &middot; bg-black/80</p>
          <div className="h-40 rounded-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="w-32 h-24 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-cream/60 text-xs">Photo preview</span>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════════ REVEAL PAGE NUMBER DOTS ═══════════ */}
        <Section title="Navigation Dots" id="dots">
          <p className="text-[10px] text-sage/40 font-mono mb-2">Reveal page question indicator (on dark bg)</p>
          <div className="bg-sage rounded-xl p-6 flex justify-center">
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-full bg-cream/40 text-sage font-bold flex items-center justify-center text-sm">1</div>
              <div className="w-10 h-10 rounded-full bg-cream text-sage font-bold flex items-center justify-center text-sm scale-110">2</div>
              <div className="w-10 h-10 rounded-full bg-sage-light text-cream/60 font-bold flex items-center justify-center text-sm">3</div>
              <div className="w-10 h-10 rounded-full bg-sage-light text-cream/60 font-bold flex items-center justify-center text-sm">4</div>
              <div className="w-10 h-10 rounded-full bg-sage-light text-cream/60 font-bold flex items-center justify-center text-sm">5</div>
            </div>
          </div>
        </Section>

      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-8 border-t border-blush/40 text-center">
        <p className="text-xs text-sage/40">
          Baby in Bloom &middot; Design Reference &middot; Last updated: source of truth lives in globals.css + layout.tsx
        </p>
      </footer>
    </div>
  );
}
