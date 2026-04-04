"use client";

import { useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useLanguage } from "@/lib/LanguageContext";

/* SVG filter definitions for watercolor effect */
function WatercolorFilters() {
  return (
    <svg width="0" height="0" className="absolute">
      <defs>
        {/* Watercolor — very light, keeps petal shapes crisp */}
        <filter id="watercolor" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="1" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="0.35" />
        </filter>
        {/* Lighter watercolor for smaller elements */}
        <filter id="watercolor-soft" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="0.25" />
        </filter>
        {/* Butterfly filter — crisp */}
        <filter id="watercolor-butterfly" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="5" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.6" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="0.2" />
        </filter>
        {/* Stem/leaf filter */}
        <filter id="watercolor-leaf" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.5" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="0.15" />
        </filter>
      </defs>
    </svg>
  );
}

function Cosmos({ cx, cy, size = 1, hue = 0, opacity = 0.9 }: { cx: number; cy: number; size?: number; hue?: number; opacity?: number }) {
  const palettes = [
    ["#e48888", "#eba8a0", "#f5ccc4", "#c87070"],
    ["#cc7070", "#d89088", "#e8b8b0", "#b05858"],
    ["#e89898", "#f0b8b0", "#f8d8d0", "#d08080"],
  ];
  const c = palettes[hue] || palettes[0];
  // 5 wide rounded petals like a wild rose — broad ovals, not heart-shaped
  const angles = [0, 72, 144, 216, 288];
  return (
    <g transform={`translate(${cx},${cy}) scale(${size})`} opacity={opacity} filter="url(#watercolor)">
      {/* Ghost back layer for fullness */}
      {angles.map((a) => (
        <ellipse key={`b${a}`} cx="0" cy="-18" rx="14" ry="18" fill={c[0]} opacity="0.25" transform={`rotate(${a + 36})`} />
      ))}
      {/* Main petals — wide soft ovals radiating from center */}
      {angles.map((a, i) => (
        <g key={a} transform={`rotate(${a})`}>
          {/* Broad oval petal */}
          <ellipse cx="0" cy="-17" rx="12" ry="17" fill={c[0]} opacity={0.7 + (i % 2) * 0.06} />
          {/* Lighter inner wash — fades toward center */}
          <ellipse cx="0" cy="-14" rx="8" ry="13" fill={c[1]} opacity="0.5" />
          {/* White-ish highlight near base */}
          <ellipse cx="0" cy="-10" rx="4" ry="8" fill={c[2]} opacity="0.55" />
          {/* Soft darker edge at tip */}
          <ellipse cx="0" cy="-17" rx="12" ry="17" fill="none" stroke={c[3]} strokeWidth="0.6" opacity="0.3" />
          {/* Center vein */}
          <path d="M0,-3 C0,-10 0,-20 0,-28" stroke="#c08888" strokeWidth="0.25" opacity="0.1" fill="none" />
          {/* Side veins */}
          <path d="M0,-5 C-3,-12 -6,-20 -8,-26" stroke="#c08888" strokeWidth="0.2" opacity="0.08" fill="none" />
          <path d="M0,-5 C3,-12 6,-20 8,-26" stroke="#c08888" strokeWidth="0.2" opacity="0.08" fill="none" />
        </g>
      ))}
      {/* Bright golden-yellow center */}
      <circle r="5" fill="#c8a830" opacity="0.5" />
      <circle r="4" fill="#dcc040" />
      <circle r="2.8" fill="#e8d460" />
      <circle r="1.5" fill="#f0e478" opacity="0.8" />
      {/* Tiny stamen dots */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
        <circle key={a} cx={Math.sin(a * Math.PI / 180) * 3.2} cy={-Math.cos(a * Math.PI / 180) * 3.2} r="0.5" fill="#b89028" opacity="0.5" />
      ))}
    </g>
  );
}

function WildRose({ cx, cy, size = 1, opacity = 0.85 }: { cx: number; cy: number; size?: number; opacity?: number }) {
  // Large open wild rose — 5 broad rounded petals, bigger than Cosmos
  const angles = [0, 72, 144, 216, 288];
  return (
    <g transform={`translate(${cx},${cy}) scale(${size})`} opacity={opacity} filter="url(#watercolor)">
      {/* Ghost back layer */}
      {angles.map((a) => (
        <ellipse key={`g${a}`} cx="0" cy="-22" rx="17" ry="22" fill="#dc8888" opacity="0.22" transform={`rotate(${a + 36})`} />
      ))}
      {/* Main petals — very broad rounded ovals */}
      {angles.map((a, i) => (
        <g key={a} transform={`rotate(${a})`}>
          <ellipse cx="0" cy="-20" rx="16" ry="22" fill="#d48080" opacity={0.65 + (i % 2) * 0.07} />
          {/* Inner lighter wash */}
          <ellipse cx="0" cy="-17" rx="11" ry="17" fill="#e4a098" opacity="0.45" />
          {/* White highlight near base */}
          <ellipse cx="0" cy="-12" rx="6" ry="10" fill="#f5dce0" opacity="0.5" />
          {/* Edge blush */}
          <ellipse cx="0" cy="-20" rx="16" ry="22" fill="none" stroke="#b06070" strokeWidth="0.6" opacity="0.25" />
          {/* Veins */}
          <path d="M0,-4 C0,-14 0,-26 0,-34" stroke="#c08888" strokeWidth="0.25" opacity="0.1" fill="none" />
          <path d="M0,-5 C-4,-14 -8,-24 -10,-32" stroke="#c08888" strokeWidth="0.2" opacity="0.08" fill="none" />
          <path d="M0,-5 C4,-14 8,-24 10,-32" stroke="#c08888" strokeWidth="0.2" opacity="0.08" fill="none" />
        </g>
      ))}
      {/* Inner cupped petals — rotated, smaller */}
      {angles.map(a => (
        <ellipse key={`i${a}`} cx="0" cy="-12" rx="9" ry="13" fill="#e0a8b0" opacity="0.4" transform={`rotate(${a + 36})`} />
      ))}
      {/* Center — warm golden */}
      <circle r="6" fill="#f0ddd0" opacity="0.9" />
      <circle r="4.5" fill="#d8b848" />
      <circle r="3" fill="#e0c858" />
      <circle r="1.5" fill="#e8d870" opacity="0.8" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
        <circle key={a} cx={Math.sin(a * Math.PI / 180) * 3.5} cy={-Math.cos(a * Math.PI / 180) * 3.5} r="0.5" fill="#b89028" opacity="0.45" />
      ))}
    </g>
  );
}

function Daisy({ cx, cy, size = 1, opacity = 0.85 }: { cx: number; cy: number; size?: number; opacity?: number }) {
  // Broad cream/white petals with prominent dark center — like reference circled flowers
  return (
    <g transform={`translate(${cx},${cy}) scale(${size})`} opacity={opacity} filter="url(#watercolor-soft)">
      {/* Back petal layer for fullness */}
      {Array.from({ length: 10 }, (_, i) => i * 36 + 18).map((a) => (
        <ellipse key={`b${a}`} cx="0" cy="-16" rx="5" ry="16" fill="#e8dac8" opacity="0.5" transform={`rotate(${a})`} />
      ))}
      {/* Main petals — wider, more visible */}
      {Array.from({ length: 14 }, (_, i) => i * (360 / 14)).map((a, i) => (
        <g key={a} transform={`rotate(${a})`}>
          <ellipse cx="0" cy="-16" rx="4.5" ry="16" fill={i % 2 === 0 ? "#eedcc8" : "#e5d4c0"} opacity={0.88 + (i % 3) * 0.04} />
          {/* Center highlight line */}
          <path d="M0,-5 C0,-10 0,-16 0,-24" stroke="#f8f0e8" strokeWidth="0.4" opacity="0.25" />
        </g>
      ))}
      {/* Very large prominent dark brown center */}
      <circle r="8.5" fill="#3a2518" opacity="0.9" />
      <circle r="7" fill="#5a3a20" />
      <circle r="5.5" fill="#7a5030" opacity="0.8" />
      <circle r="7.5" fill="none" stroke="#2a1a10" strokeWidth="0.5" opacity="0.3" />
      {/* Seed dot texture */}
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map(a => (
        <circle key={a} cx={Math.sin(a * Math.PI / 180) * 4.5} cy={-Math.cos(a * Math.PI / 180) * 4.5} r="0.6" fill="#9a7040" opacity="0.5" />
      ))}
    </g>
  );
}

function Sunflower({ cx, cy, size = 1, opacity = 0.85 }: { cx: number; cy: number; size?: number; opacity?: number }) {
  return (
    <g transform={`translate(${cx},${cy}) scale(${size})`} opacity={opacity} filter="url(#watercolor-soft)">
      {Array.from({ length: 12 }, (_, i) => i * 30).map(a => (
        <path key={a} d={`M0,0 C-0.8,-3 -1.5,-9 -1.2,-14 C-0.8,-17 -0.2,-18.5 0,-19 C0.2,-18.5 0.8,-17 1.2,-14 C1.5,-9 0.8,-3 0,0Z`} fill="#e4cc70" opacity="0.85" transform={`rotate(${a})`} />
      ))}
      {/* Dark brown center */}
      <circle r="5" fill="#5a3a18" opacity="0.9" />
      <circle r="3.5" fill="#7a5028" />
    </g>
  );
}

function SmallBlossom({ cx, cy, size = 1, color = "#e8a8b0", opacity = 0.85 }: { cx: number; cy: number; size?: number; color?: string; opacity?: number }) {
  // Small 5-petal flower — round petals like the reference
  return (
    <g transform={`translate(${cx},${cy}) scale(${size})`} opacity={opacity} filter="url(#watercolor-soft)">
      {[0, 72, 144, 216, 288].map(a => (
        <ellipse key={a} cx="0" cy="-8" rx="5" ry="8" fill={color} opacity="0.7" transform={`rotate(${a})`} />
      ))}
      {/* Lighter inner */}
      {[0, 72, 144, 216, 288].map(a => (
        <ellipse key={`l${a}`} cx="0" cy="-6" rx="3" ry="5" fill="#f4d8d8" opacity="0.3" transform={`rotate(${a})`} />
      ))}
      <circle r="2.5" fill="#dcc040" />
      <circle r="1.5" fill="#e8d460" opacity="0.7" />
    </g>
  );
}

function Bud({ cx, cy, size = 1, color = "#e6a0aa", rotation = 0 }: { cx: number; cy: number; size?: number; color?: string; rotation?: number }) {
  return (
    <g transform={`translate(${cx},${cy}) scale(${size}) rotate(${rotation})`} filter="url(#watercolor-soft)">
      <path d="M0,0 C-4,-3 -5.5,-9 -4,-14 C-3,-17 -1,-18 0,-16 C1,-18 3,-17 4,-14 C5.5,-9 4,-3 0,0Z" fill={color} opacity="0.85" />
      <path d="M-1.5,-2 C-2.5,-5 -2.5,-9 -1.5,-12 C-0.5,-13.5 0.5,-12.5 0,-10 C0.5,-12.5 1.5,-12 2,-10 C2.5,-7 1.5,-3 0.5,-1Z" fill="#4a6a3a" opacity="0.6" />
    </g>
  );
}

function Bee({ cx, cy, size = 1, rotation = 0 }: { cx: number; cy: number; size?: number; rotation?: number }) {
  // Tiny painted honeybee — round fuzzy body, translucent wings
  return (
    <g transform={`translate(${cx},${cy}) scale(${size}) rotate(${rotation})`} filter="url(#watercolor-butterfly)">
      {/* Translucent wings — overlapping, iridescent */}
      <ellipse cx="-4" cy="-4" rx="5.5" ry="3" fill="#d8e8f0" opacity="0.4" transform="rotate(-20)" />
      <ellipse cx="4" cy="-4" rx="5.5" ry="3" fill="#d8e8f0" opacity="0.4" transform="rotate(20)" />
      <ellipse cx="-3.5" cy="-3.5" rx="4.5" ry="2.5" fill="#e8f0f8" opacity="0.35" transform="rotate(-15)" />
      <ellipse cx="3.5" cy="-3.5" rx="4.5" ry="2.5" fill="#e8f0f8" opacity="0.35" transform="rotate(15)" />
      {/* Wing veins */}
      <path d="M-1,-3 C-3,-4 -6,-5 -8,-4" stroke="#a0b8c8" strokeWidth="0.15" fill="none" opacity="0.3" />
      <path d="M1,-3 C3,-4 6,-5 8,-4" stroke="#a0b8c8" strokeWidth="0.15" fill="none" opacity="0.3" />
      {/* Abdomen — striped yellow and dark brown */}
      <ellipse cx="0" cy="3" rx="3" ry="4.5" fill="#d8a830" opacity="0.8" />
      {/* Dark stripes */}
      <path d="M-2.5,1.5 C-1,1 1,1 2.5,1.5" stroke="#4a3018" strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M-2.8,3.5 C-1,3 1,3 2.8,3.5" stroke="#4a3018" strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M-2.2,5.5 C-0.5,5 0.5,5 2.2,5.5" stroke="#4a3018" strokeWidth="1" fill="none" opacity="0.5" />
      {/* Fuzzy texture wash */}
      <ellipse cx="0" cy="3" rx="2.5" ry="3.5" fill="#e8c050" opacity="0.25" />
      {/* Thorax — darker, round */}
      <circle cx="0" cy="-1" r="2.8" fill="#5a4020" opacity="0.75" />
      <circle cx="0" cy="-1" r="2" fill="#7a5830" opacity="0.35" />
      {/* Head — small */}
      <circle cx="0" cy="-3.8" r="1.6" fill="#4a3018" opacity="0.8" />
      {/* Eyes */}
      <circle cx="-0.7" cy="-4" r="0.5" fill="#2a1a08" opacity="0.6" />
      <circle cx="0.7" cy="-4" r="0.5" fill="#2a1a08" opacity="0.6" />
      {/* Antennae — short, bent */}
      <path d="M-0.5,-5.2 C-1,-6.5 -2,-7.5 -2.5,-7.8" stroke="#4a3018" strokeWidth="0.2" fill="none" opacity="0.6" />
      <path d="M0.5,-5.2 C1,-6.5 2,-7.5 2.5,-7.8" stroke="#4a3018" strokeWidth="0.2" fill="none" opacity="0.6" />
      {/* Stinger tip */}
      <path d="M0,7 C0,7.5 0,8 0,8.5" stroke="#4a3018" strokeWidth="0.3" fill="none" opacity="0.4" />
    </g>
  );
}

function Butterfly({ cx, cy, size = 1, rotation = 0, variant = 0 }: { cx: number; cy: number; size?: number; rotation?: number; variant?: number }) {
  // Painted watercolor butterfly — 3 variants: gold monarch, grey painted lady, pink
  // 0=gold monarch, 1=pink, 2=grey painted lady
  const colors = [
    { mid: "#d0a848", light: "#e8cc80", pale: "#f4e8c0", dark: "#886018" },
    { mid: "#e0a0a8", light: "#f0c4c8", pale: "#f8dce0", dark: "#a86070" },
    { mid: "#8a8a98", light: "#b0b0bc", pale: "#d0d0d8", dark: "#585868" },
  ][variant] || { mid: "#d0a848", light: "#e8cc80", pale: "#f4e8c0", dark: "#886018" };
  const { mid, light, pale, dark } = colors;
  return (
    <g transform={`translate(${cx},${cy}) scale(${size}) rotate(${rotation})`} filter="url(#watercolor-butterfly)">

      {/* ── LEFT FOREWING — slightly larger, organic shape ── */}
      {/* Outermost wash — very translucent */}
      <path d="M-1,-2 C-4,-5 -9,-11 -14,-16 C-18,-19 -23,-21 -26,-18 C-28,-13 -25,-6 -20,-2 C-14,2 -7,2 -1,-2Z" fill={mid} opacity="0.3" />
      {/* Main wing fill */}
      <path d="M-1,-3 C-3,-6 -8,-12 -13,-16 C-17,-19 -22,-20 -24,-17 C-25,-13 -23,-7 -18,-3 C-13,0 -6,1 -1,-3Z" fill={mid} opacity="0.55" />
      {/* Inner color gradient — lighter toward body */}
      <path d="M-1,-4 C-3,-7 -7,-11 -11,-14 C-14,-16 -18,-16 -19,-14 C-19,-11 -16,-7 -12,-4 C-8,-2 -4,-2 -1,-4Z" fill={light} opacity="0.5" />
      {/* Pale highlight — closest to body */}
      <path d="M-1,-4 C-2,-6 -5,-9 -8,-11 C-10,-12 -12,-11 -12,-9 C-11,-7 -8,-5 -5,-4 C-3,-3 -2,-3 -1,-4Z" fill={pale} opacity="0.55" />
      {/* Dark outer margin — painted edge */}
      <path d="M-1,-2 C-4,-5 -9,-11 -14,-16 C-18,-19 -23,-21 -26,-18" fill="none" stroke={dark} strokeWidth="0.5" opacity="0.25" />
      <path d="M-26,-18 C-28,-13 -25,-6 -20,-2 C-14,2 -7,2 -1,-2" fill="none" stroke={dark} strokeWidth="0.35" opacity="0.15" />

      {/* ── RIGHT FOREWING — slightly different curve ── */}
      <path d="M1,-2 C4,-5 9,-11 13,-16 C17,-19 22,-21 25,-18 C27,-13 24,-6 19,-2 C13,2 6,2 1,-2Z" fill={mid} opacity="0.3" />
      <path d="M1,-3 C3,-6 8,-12 12,-16 C16,-19 21,-20 23,-17 C24,-13 22,-7 17,-3 C12,0 5,1 1,-3Z" fill={mid} opacity="0.55" />
      <path d="M1,-4 C3,-7 7,-11 10,-14 C13,-16 17,-16 18,-14 C18,-11 15,-7 11,-4 C7,-2 3,-2 1,-4Z" fill={light} opacity="0.5" />
      <path d="M1,-4 C2,-6 5,-9 7,-11 C9,-12 11,-11 11,-9 C10,-7 7,-5 4,-4 C3,-3 2,-3 1,-4Z" fill={pale} opacity="0.55" />
      <path d="M1,-2 C4,-5 9,-11 13,-16 C17,-19 22,-21 25,-18" fill="none" stroke={dark} strokeWidth="0.5" opacity="0.25" />
      <path d="M25,-18 C27,-13 24,-6 19,-2 C13,2 6,2 1,-2" fill="none" stroke={dark} strokeWidth="0.35" opacity="0.15" />

      {/* ── Forewing veins — organic, not perfectly symmetric ── */}
      <path d="M-1,-4 C-5,-8 -12,-13 -18,-16" stroke={dark} strokeWidth="0.2" fill="none" opacity="0.18" />
      <path d="M-1,-4 C-3,-9 -7,-15 -10,-18" stroke={dark} strokeWidth="0.18" fill="none" opacity="0.14" />
      <path d="M-1,-3 C-6,-5 -14,-5 -22,-3" stroke={dark} strokeWidth="0.15" fill="none" opacity="0.1" />
      <path d="M1,-4 C5,-8 11,-13 17,-16" stroke={dark} strokeWidth="0.2" fill="none" opacity="0.18" />
      <path d="M1,-4 C3,-9 6,-15 9,-18" stroke={dark} strokeWidth="0.18" fill="none" opacity="0.14" />
      <path d="M1,-3 C6,-5 13,-5 21,-3" stroke={dark} strokeWidth="0.15" fill="none" opacity="0.1" />

      {/* ── LEFT HINDWING — rounder, softer ── */}
      <path d="M-1,0 C-3,3 -8,7 -13,10 C-16,12 -18,11 -18,8 C-17,4 -13,0 -8,-1 C-4,-1 -2,-1 -1,0Z" fill={mid} opacity="0.45" />
      <path d="M-1,0 C-2,2 -6,5 -10,7 C-12,8 -14,7 -13,5 C-12,3 -8,1 -5,0 C-3,0 -2,0 -1,0Z" fill={light} opacity="0.4" />
      <path d="M-1,0 C-3,3 -8,7 -13,10 C-16,12 -18,11 -18,8" fill="none" stroke={dark} strokeWidth="0.35" opacity="0.2" />

      {/* ── RIGHT HINDWING ── */}
      <path d="M1,0 C3,3 8,7 12,10 C15,12 17,11 17,8 C16,4 12,0 7,-1 C3,-1 2,-1 1,0Z" fill={mid} opacity="0.45" />
      <path d="M1,0 C2,2 5,5 9,7 C11,8 13,7 12,5 C11,3 7,1 4,0 C3,0 2,0 1,0Z" fill={light} opacity="0.4" />
      <path d="M1,0 C3,3 8,7 12,10 C15,12 17,11 17,8" fill="none" stroke={dark} strokeWidth="0.35" opacity="0.2" />

      {/* Hindwing veins */}
      <path d="M-1,0 C-4,3 -9,6 -14,9" stroke={dark} strokeWidth="0.15" fill="none" opacity="0.14" />
      <path d="M1,0 C4,3 8,6 13,9" stroke={dark} strokeWidth="0.15" fill="none" opacity="0.14" />

      {/* ── Body — slender, tapered ── */}
      <path d="M0,5 C-0.6,4 -0.8,1 -0.9,-2 C-1,-4 -0.8,-6 0,-7 C0.8,-6 1,-4 0.9,-2 C0.8,1 0.6,4 0,5Z" fill="#5a4030" opacity="0.85" />
      {/* Subtle segment lines */}
      <path d="M-0.5,3 L0.5,3" stroke="#7a6050" strokeWidth="0.15" fill="none" opacity="0.25" />
      <path d="M-0.6,1 L0.6,1" stroke="#7a6050" strokeWidth="0.15" fill="none" opacity="0.25" />
      <path d="M-0.6,-1 L0.6,-1" stroke="#7a6050" strokeWidth="0.15" fill="none" opacity="0.25" />
      <path d="M-0.5,-3 L0.5,-3" stroke="#7a6050" strokeWidth="0.15" fill="none" opacity="0.2" />
      {/* Head — small oval */}
      <ellipse cx="0" cy="-7.8" rx="1" ry="1.2" fill="#4a3528" opacity="0.85" />
      {/* Antennae — delicate, gracefully curving */}
      <path d="M-0.2,-9 C-0.8,-11 -2.5,-14.5 -4.5,-17 C-5.5,-18.5 -6.2,-19 -6.5,-19.2" stroke="#5a4535" strokeWidth="0.25" fill="none" opacity="0.6" />
      <path d="M0.2,-9 C0.8,-11 2.5,-14.5 4.5,-17 C5.5,-18.5 6.2,-19 6.5,-19.2" stroke="#5a4535" strokeWidth="0.25" fill="none" opacity="0.6" />
      {/* Tiny antenna tips */}
      <circle cx="-6.5" cy="-19.2" r="0.4" fill="#5a4535" opacity="0.6" />
      <circle cx="6.5" cy="-19.2" r="0.4" fill="#5a4535" opacity="0.6" />
    </g>
  );
}

function Leaf({ cx, cy, size = 1, rotation = 0, shade = 0 }: { cx: number; cy: number; size?: number; rotation?: number; shade?: number }) {
  // Round/oval soft leaves like the reference — not pointy
  const fills = ["#6a8a55", "#78a065", "#5a7a45"][shade] || "#6a8a55";
  const dark = ["#4a6a3a", "#5b7a4a", "#3a5a2a"][shade] || "#4a6a3a";
  return (
    <g transform={`translate(${cx},${cy}) scale(${size}) rotate(${rotation})`} filter="url(#watercolor-leaf)">
      {/* Soft round oval leaf — like reference */}
      <ellipse cx="0" cy="-11" rx="7" ry="12" fill={fills} opacity="0.6" />
      {/* Lighter half for depth */}
      <ellipse cx="1.5" cy="-11" rx="4" ry="10" fill={fills} opacity="0.18" />
      {/* Center vein */}
      <path d="M0,-1 L0,-20" stroke={dark} strokeWidth="0.35" opacity="0.25" fill="none" />
      {/* Curved side veins */}
      <path d="M0,-6 C-2,-8 -4,-10 -5,-11" stroke={dark} strokeWidth="0.2" opacity="0.18" fill="none" />
      <path d="M0,-6 C2,-8 4,-10 5,-11" stroke={dark} strokeWidth="0.2" opacity="0.18" fill="none" />
      <path d="M0,-12 C-2,-14 -3.5,-15 -4.5,-16" stroke={dark} strokeWidth="0.2" opacity="0.18" fill="none" />
      <path d="M0,-12 C2,-14 3.5,-15 4.5,-16" stroke={dark} strokeWidth="0.2" opacity="0.18" fill="none" />
    </g>
  );
}

function TinyYellowFlower({ cx, cy, size = 1 }: { cx: number; cy: number; size?: number }) {
  // Small loose yellow accent blooms like in the reference — watercolor splashy
  return (
    <g transform={`translate(${cx},${cy}) scale(${size})`} filter="url(#watercolor-soft)" opacity="0.85">
      {/* Small round petals — like little buttercup blooms */}
      {[0, 72, 144, 216, 288].map(a => (
        <ellipse key={a} cx="0" cy="-5" rx="2.5" ry="5" fill="#edd888" opacity="0.8" transform={`rotate(${a})`} />
      ))}
      <circle r="2" fill="#d0b030" />
      <circle r="1.2" fill="#dcc048" opacity="0.8" />
    </g>
  );
}

function LeafSprig({ cx, cy, size = 1, rotation = 0 }: { cx: number; cy: number; size?: number; rotation?: number }) {
  // Small branching twig with multiple tiny round leaves — like the reference filler
  return (
    <g transform={`translate(${cx},${cy}) scale(${size}) rotate(${rotation})`} filter="url(#watercolor-leaf)" opacity="0.75">
      {/* Main thin branch */}
      <path d="M0,0 C-1,-5 -2,-12 -1,-20" stroke="#6a8a5a" strokeWidth="0.5" fill="none" />
      {/* Side twigs */}
      <path d="M-1,-6 C-4,-8 -6,-9 -7,-9" stroke="#6a8a5a" strokeWidth="0.35" fill="none" />
      <path d="M-1.5,-10 C1,-12 3,-13 4,-13" stroke="#6a8a5a" strokeWidth="0.35" fill="none" />
      <path d="M-1,-14 C-3,-16 -5,-17 -6,-16.5" stroke="#6a8a5a" strokeWidth="0.35" fill="none" />
      <path d="M-1,-17 C1,-19 2,-20 3,-19.5" stroke="#6a8a5a" strokeWidth="0.3" fill="none" />
      {/* Tiny round leaves on twigs */}
      <ellipse cx="-7" cy="-9" rx="3.5" ry="4" fill="#7a9a62" opacity="0.5" />
      <ellipse cx="4.5" cy="-13.5" rx="3" ry="3.5" fill="#6a8a50" opacity="0.45" />
      <ellipse cx="-6.5" cy="-17" rx="3.2" ry="3.8" fill="#7a9a62" opacity="0.5" />
      <ellipse cx="3.5" cy="-20" rx="2.5" ry="3.2" fill="#6a8a50" opacity="0.45" />
      <ellipse cx="-1" cy="-20" rx="2.5" ry="3" fill="#80a068" opacity="0.4" />
      {/* Leaf at tip */}
      <ellipse cx="-1.5" cy="-22" rx="2" ry="3" fill="#8aaa70" opacity="0.35" transform="rotate(-10 -1.5 -22)" />
    </g>
  );
}

function Stem({ d, width = 1.5 }: { d: string; width?: number }) {
  return <path d={d} stroke="#5a7a4a" strokeWidth={width} fill="none" filter="url(#watercolor-leaf)" />;
}

/* ── Compositions ── */

function FloralCornerTopLeft() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 270" fill="none">
      {/* Stems */}
      <Stem d="M10 270 Q25 200 40 150 Q50 120 42 75" width={1.5} />
      <Stem d="M0 230 Q35 160 65 120 Q85 95 80 55" width={1.2} />
      <Stem d="M25 270 Q50 200 80 160 Q95 140 110 110" width={1} />
      <Stem d="M55 270 Q65 225 90 195" width={0.8} />
      <Stem d="M80 270 Q100 240 125 215" width={0.7} />
      {/* Large featured flowers */}
      <Cosmos cx={42} cy={70} size={1.2} hue={0} />
      <WildRose cx={90} cy={48} size={0.85} />
      <Cosmos cx={20} cy={120} size={0.85} hue={1} />
      <Daisy cx={75} cy={95} size={0.85} />
      <Sunflower cx={130} cy={35} size={0.7} />
      {/* Medium flowers */}
      <SmallBlossom cx={120} cy={70} size={0.7} color="#f5d8a8" />
      <SmallBlossom cx={55} cy={155} size={0.6} color="#e8c4c4" />
      <Cosmos cx={110} cy={110} size={0.55} hue={2} />
      {/* Buds */}
      <Bud cx={100} cy={88} size={0.75} color="#e8b4b8" rotation={-20} />
      <Bud cx={15} cy={175} size={0.6} color="#dba0a8" rotation={15} />
      <Bud cx={65} cy={135} size={0.5} color="#f0c8cc" rotation={-10} />
      <Bud cx={140} cy={55} size={0.45} color="#e0a8b0" rotation={-35} />
      <Bud cx={38} cy={195} size={0.5} color="#d8a0a8" rotation={20} />
      {/* Yellow accent flowers */}
      <TinyYellowFlower cx={110} cy={45} size={0.85} />
      <TinyYellowFlower cx={140} cy={60} size={0.65} />
      <TinyYellowFlower cx={95} cy={60} size={0.55} />
      <TinyYellowFlower cx={125} cy={85} size={0.5} />
      <TinyYellowFlower cx={60} cy={50} size={0.45} />
      <TinyYellowFlower cx={85} cy={130} size={0.5} />
      <TinyYellowFlower cx={35} cy={100} size={0.4} />
      {/* Leaves */}
      <Leaf cx={55} cy={105} size={0.9} rotation={-40} shade={0} />
      <Leaf cx={18} cy={155} size={0.8} rotation={20} shade={1} />
      <Leaf cx={70} cy={80} size={0.65} rotation={-55} shade={2} />
      <Leaf cx={40} cy={185} size={0.6} rotation={30} shade={0} />
      <Leaf cx={90} cy={115} size={0.55} rotation={-25} shade={1} />
      <Leaf cx={115} cy={95} size={0.5} rotation={-15} shade={2} />
      <Leaf cx={25} cy={210} size={0.55} rotation={15} shade={1} />
      {/* Leaf sprigs */}
      <LeafSprig cx={125} cy={50} size={0.75} rotation={20} />
      <LeafSprig cx={78} cy={108} size={0.6} rotation={-30} />
      <LeafSprig cx={30} cy={170} size={0.6} rotation={10} />
      <LeafSprig cx={105} cy={100} size={0.5} rotation={-15} />
      <LeafSprig cx={50} cy={220} size={0.5} rotation={25} />
    </svg>
  );
}

function FloralCornerTopRight() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 270" fill="none" style={{ transform: "scaleX(-1)" }}>
      <Stem d="M10 270 Q25 200 40 150 Q50 120 42 75" width={1.5} />
      <Stem d="M0 230 Q35 160 65 120 Q85 95 80 55" width={1.2} />
      <Stem d="M25 270 Q50 200 80 160" width={1} />
      <Stem d="M55 270 Q70 230 95 200" width={0.8} />
      {/* Main flowers */}
      <WildRose cx={42} cy={68} size={0.95} />
      <Daisy cx={85} cy={45} size={0.9} />
      <Cosmos cx={25} cy={125} size={0.8} hue={2} />
      <Sunflower cx={120} cy={38} size={0.7} />
      <Cosmos cx={100} cy={95} size={0.6} hue={0} />
      {/* Medium flowers */}
      <SmallBlossom cx={110} cy={68} size={0.65} color="#e8c4c4" />
      <SmallBlossom cx={60} cy={150} size={0.55} color="#f0c8c8" />
      {/* Buds */}
      <Bud cx={130} cy={55} size={0.6} color="#f0c0c8" rotation={-30} />
      <Bud cx={15} cy={178} size={0.55} color="#dba0a8" rotation={10} />
      <Bud cx={75} cy={120} size={0.5} color="#e8b0b8" rotation={-15} />
      <Bud cx={45} cy={195} size={0.45} color="#d8a0a8" rotation={20} />
      {/* Yellow accents */}
      <TinyYellowFlower cx={118} cy={50} size={0.75} />
      <TinyYellowFlower cx={95} cy={62} size={0.55} />
      <TinyYellowFlower cx={135} cy={72} size={0.45} />
      <TinyYellowFlower cx={70} cy={55} size={0.5} />
      <TinyYellowFlower cx={50} cy={100} size={0.45} />
      <TinyYellowFlower cx={90} cy={115} size={0.4} />
      {/* Leaves */}
      <Leaf cx={60} cy={100} size={0.9} rotation={-35} shade={0} />
      <Leaf cx={20} cy={158} size={0.8} rotation={15} shade={1} />
      <Leaf cx={78} cy={65} size={0.6} rotation={-50} shade={2} />
      <Leaf cx={105} cy={82} size={0.55} rotation={-20} shade={0} />
      <Leaf cx={35} cy={185} size={0.55} rotation={25} shade={1} />
      {/* Sprigs */}
      <LeafSprig cx={125} cy={58} size={0.65} rotation={-15} />
      <LeafSprig cx={35} cy={165} size={0.55} rotation={25} />
      <LeafSprig cx={90} cy={105} size={0.5} rotation={-20} />
      {/* Bee buzzing near the daisy */}
      <Bee cx={115} cy={38} size={0.55} rotation={-30} />
    </svg>
  );
}

function FloralBottom() {
  return (
    <svg className="w-full h-full" viewBox="0 0 400 320" fill="none" preserveAspectRatio="xMidYMax meet">
      {/* Vine stems weaving through */}
      <Stem d="M-10 220 Q40 195 90 205 Q140 215 190 200 Q240 185 290 202 Q340 215 410 205" width={1.5} />
      <Stem d="M-10 248 Q50 225 100 235 Q150 245 200 230 Q250 218 300 235 Q350 245 410 235" width={1.2} />
      <Stem d="M15 265 Q55 240 95 248 Q135 258 175 245" width={1} />
      <Stem d="M225 250 Q265 235 305 245 Q345 255 385 242" width={1} />
      <Stem d="M40 285 Q60 260 80 250" width={0.8} />
      <Stem d="M320 285 Q340 262 360 252" width={0.8} />
      {/* Large featured flowers — prominent pink roses on sides */}
      <WildRose cx={45} cy={230} size={1.8} />
      <WildRose cx={355} cy={235} size={1.7} />
      <WildRose cx={130} cy={245} size={1.1} />
      <WildRose cx={270} cy={248} size={1.05} />
      {/* Cosmos scattered */}
      <Cosmos cx={95} cy={210} size={1.0} hue={0} />
      <Cosmos cx={200} cy={220} size={0.95} hue={2} />
      <Cosmos cx={305} cy={212} size={0.9} hue={1} />
      <Cosmos cx={165} cy={258} size={0.7} hue={0} />
      <Cosmos cx={240} cy={260} size={0.65} hue={2} />
      {/* Daisies and sunflowers */}
      <Daisy cx={175} cy={232} size={0.8} />
      <Daisy cx={225} cy={255} size={0.65} />
      <Sunflower cx={240} cy={205} size={0.8} />
      <Sunflower cx={80} cy={250} size={0.65} />
      {/* Small blossoms filling gaps */}
      <SmallBlossom cx={115} cy={210} size={0.65} color="#e8b4b8" />
      <SmallBlossom cx={285} cy={205} size={0.6} color="#f5d8a8" />
      <SmallBlossom cx={195} cy={248} size={0.5} color="#f0c8cc" />
      <SmallBlossom cx={315} cy={240} size={0.55} color="#e8c0c0" />
      <SmallBlossom cx={65} cy={242} size={0.5} color="#dbb0b0" />
      <SmallBlossom cx={155} cy={255} size={0.45} color="#e8c4c4" />
      {/* Buds */}
      <Bud cx={108} cy={218} size={0.65} color="#e8b4b8" rotation={-10} />
      <Bud cx={292} cy={210} size={0.6} color="#dba0a8" rotation={15} />
      <Bud cx={210} cy={258} size={0.5} color="#e0a8b0" rotation={-5} />
      <Bud cx={38} cy={248} size={0.55} color="#d8a0a8" rotation={25} />
      <Bud cx={365} cy={242} size={0.5} color="#e8b4b8" rotation={-15} />
      {/* Yellow accents scattered throughout */}
      <TinyYellowFlower cx={130} cy={190} size={0.65} />
      <TinyYellowFlower cx={270} cy={188} size={0.6} />
      <TinyYellowFlower cx={190} cy={200} size={0.5} />
      <TinyYellowFlower cx={220} cy={215} size={0.55} />
      <TinyYellowFlower cx={145} cy={215} size={0.45} />
      <TinyYellowFlower cx={310} cy={220} size={0.5} />
      <TinyYellowFlower cx={75} cy={215} size={0.45} />
      <TinyYellowFlower cx={250} cy={245} size={0.4} />
      {/* Dense leaves */}
      <Leaf cx={75} cy={205} size={1} rotation={30} shade={0} />
      <Leaf cx={125} cy={200} size={0.8} rotation={-20} shade={1} />
      <Leaf cx={178} cy={218} size={0.8} rotation={40} shade={2} />
      <Leaf cx={218} cy={200} size={0.7} rotation={-30} shade={1} />
      <Leaf cx={315} cy={210} size={1} rotation={25} shade={0} />
      <Leaf cx={375} cy={218} size={0.8} rotation={-15} shade={2} />
      <Leaf cx={50} cy={240} size={0.7} rotation={45} shade={1} />
      <Leaf cx={148} cy={240} size={0.65} rotation={-35} shade={0} />
      <Leaf cx={255} cy={235} size={0.7} rotation={20} shade={2} />
      <Leaf cx={340} cy={240} size={0.65} rotation={-25} shade={1} />
      {/* Sprigs */}
      <LeafSprig cx={95} cy={200} size={0.7} rotation={-20} />
      <LeafSprig cx={160} cy={225} size={0.55} rotation={15} />
      <LeafSprig cx={240} cy={220} size={0.6} rotation={-10} />
      <LeafSprig cx={305} cy={205} size={0.65} rotation={20} />
      <LeafSprig cx={45} cy={225} size={0.5} rotation={35} />
      <LeafSprig cx={365} cy={230} size={0.5} rotation={-25} />
      {/* Butterflies */}
      {/* Butterflies — grey painted lady + gold monarch like reference */}
      <Butterfly cx={30} cy={178} size={1} rotation={-15} variant={2} />
      <Butterfly cx={100} cy={188} size={0.85} rotation={8} variant={0} />
      <Butterfly cx={370} cy={180} size={0.9} rotation={10} variant={1} />
      {/* Bee near top-right flowers */}
      <Bee cx={340} cy={170} size={0.7} rotation={-25} />
    </svg>
  );
}

function FloralSideLeft() {
  return (
    <svg className="w-full h-full" viewBox="0 0 65 450" fill="none">
      {/* Main vine */}
      <Stem d="M12 450 Q20 370 16 290 Q10 210 24 130 Q28 80 18 20" width={0.8} />
      {/* Dense leaves along vine */}
      <Leaf cx={18} cy={60} size={0.6} rotation={25} shade={0} />
      <Leaf cx={22} cy={100} size={0.55} rotation={-20} shade={1} />
      <Leaf cx={14} cy={140} size={0.6} rotation={35} shade={2} />
      <Leaf cx={20} cy={180} size={0.55} rotation={-15} shade={0} />
      <Leaf cx={12} cy={220} size={0.6} rotation={30} shade={1} />
      <Leaf cx={18} cy={260} size={0.55} rotation={-25} shade={2} />
      <Leaf cx={14} cy={300} size={0.55} rotation={20} shade={0} />
      <Leaf cx={20} cy={340} size={0.5} rotation={-15} shade={1} />
      <Leaf cx={16} cy={380} size={0.5} rotation={25} shade={2} />
      <Leaf cx={12} cy={415} size={0.45} rotation={-10} shade={0} />
      {/* Small flowers along vine */}
      <SmallBlossom cx={20} cy={90} size={0.5} color="#e0a8b0" />
      <TinyYellowFlower cx={24} cy={150} size={0.45} />
      <Bud cx={16} cy={200} size={0.4} color="#e8b4b8" rotation={15} />
      <SmallBlossom cx={14} cy={270} size={0.45} color="#d8a0a8" />
      <TinyYellowFlower cx={22} cy={320} size={0.4} />
      <Bud cx={18} cy={360} size={0.35} color="#e0a8b0" rotation={-10} />
      <TinyYellowFlower cx={16} cy={400} size={0.35} />
    </svg>
  );
}

function FloralSideRight() {
  return (
    <svg className="w-full h-full" viewBox="0 0 65 450" fill="none">
      {/* Main vine */}
      <Stem d="M12 450 Q20 370 16 290 Q10 210 24 130 Q28 80 18 20" width={0.8} />
      {/* Dense leaves along vine */}
      <Leaf cx={18} cy={55} size={0.55} rotation={-20} shade={1} />
      <Leaf cx={22} cy={95} size={0.6} rotation={30} shade={0} />
      <Leaf cx={14} cy={135} size={0.55} rotation={-25} shade={2} />
      <Leaf cx={20} cy={175} size={0.6} rotation={20} shade={1} />
      <Leaf cx={12} cy={215} size={0.55} rotation={-15} shade={0} />
      <Leaf cx={18} cy={255} size={0.55} rotation={30} shade={2} />
      <Leaf cx={14} cy={295} size={0.55} rotation={-20} shade={1} />
      <Leaf cx={20} cy={335} size={0.5} rotation={15} shade={0} />
      <Leaf cx={16} cy={375} size={0.5} rotation={-25} shade={2} />
      <Leaf cx={12} cy={410} size={0.45} rotation={10} shade={1} />
      {/* Small flowers along vine */}
      <TinyYellowFlower cx={24} cy={80} size={0.4} />
      <SmallBlossom cx={16} cy={155} size={0.45} color="#d8a0a8" />
      <Bud cx={20} cy={235} size={0.4} color="#e0a8b0" rotation={-15} />
      <TinyYellowFlower cx={14} cy={280} size={0.45} />
      <SmallBlossom cx={22} cy={350} size={0.45} color="#e8b4b8" />
      <Bud cx={16} cy={400} size={0.35} color="#d8a0a8" rotation={10} />
    </svg>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const petalsRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<HTMLDivElement>(null);

  /* ── GSAP falling petal loop ── */
  const startPetalLoop = useCallback(() => {
    if (!petalsRef.current) return;
    const colors = ["#e8a0a0", "#f0c0c8", "#f5d8d0", "#e8c4c4", "#d8a0a8", "#f0d8a8"];
    const els = petalsRef.current.children;
    Array.from(els).forEach((el) => {
      const loop = () => {
        const startX = Math.random() * 100;
        const size = 8 + Math.random() * 10;
        gsap.set(el, {
          left: `${startX}%`,
          top: -20,
          width: size,
          height: size,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          opacity: 0,
          rotation: 0,
          scale: 0.5,
        });
        gsap.to(el, {
          y: window.innerHeight + 40,
          x: `random(-40, 40)`,
          rotation: `random(60, 180)`,
          opacity: 0.5,
          scale: 0.9,
          duration: `random(10, 18)`,
          ease: "sine.in",
          onComplete: loop,
          modifiers: {
            opacity: (val: string) => {
              const progress = gsap.getProperty(el, "y") as number / window.innerHeight;
              if (progress < 0.15) return String(progress * 4);
              if (progress > 0.65) return String((1 - progress) * 2.5);
              return val;
            },
          },
        });
      };
      gsap.delayedCall(2 + Math.random() * 6, loop);
    });
  }, []);

  /* ── GSAP sparkle loop ── */
  const startSparkles = useCallback(() => {
    if (!sparklesRef.current) return;
    const els = sparklesRef.current.children;
    Array.from(els).forEach((el) => {
      const twinkle = () => {
        gsap.set(el, {
          left: `${5 + Math.random() * 90}%`,
          top: `${5 + Math.random() * 90}%`,
          scale: 0,
          opacity: 0,
        });
        gsap.to(el, {
          scale: 1,
          opacity: 0.7,
          duration: 1,
          ease: "sine.inOut",
          yoyo: true,
          repeat: 1,
          onComplete: () => { gsap.delayedCall(2 + Math.random() * 4, twinkle); },
        });
      };
      gsap.delayedCall(2 + Math.random() * 5, twinkle);
    });
  }, []);

  /* ── Master GSAP timeline — elegant soft reveals ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      /* — Flowers fade in softly with gentle scale — */
      tl.from(".floral-top-left", {
        opacity: 0,
        scale: 0.85,
        filter: "blur(4px)",
        transformOrigin: "top left",
        duration: 2,
        ease: "power1.out",
      }, 0);

      tl.from(".floral-top-right", {
        opacity: 0,
        scale: 0.85,
        filter: "blur(4px)",
        transformOrigin: "top right",
        duration: 2,
        ease: "power1.out",
      }, 0.3);

      /* — Bottom glides up gracefully — */
      tl.from(".floral-bottom", {
        yPercent: 30,
        opacity: 0,
        duration: 2,
        ease: "power2.out",
      }, 0.5);

      /* — Side vines fade in and grow — */
      tl.from(".floral-vine-left", {
        opacity: 0,
        y: 30,
        duration: 1.8,
        ease: "power2.out",
      }, 0.6);

      tl.from(".floral-vine-right", {
        opacity: 0,
        y: 30,
        duration: 1.8,
        ease: "power2.out",
      }, 0.8);

      /* — Content card fades in — */
      tl.from(".content-card", {
        opacity: 0,
        y: 20,
        duration: 1.2,
        ease: "power2.out",
        clearProps: "opacity",
      }, 1.2);

      /* — BABY letters fade up gracefully, staggered — */
      tl.from(".baby-letter", {
        opacity: 0,
        y: 12,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
      }, 1.6);

      /* — "in bloom" gentle reveal — */
      tl.from(".text-inbloom", {
        opacity: 0,
        y: 8,
        duration: 0.9,
        ease: "power2.out",
      }, 2.1);

      /* — Divider line grows from center — */
      tl.from(".divider-line", {
        scaleX: 0,
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
      }, 2.4);

      /* — Text lines cascade softly — */
      tl.from(".text-cascade", {
        opacity: 0,
        y: 8,
        duration: 0.7,
        stagger: 0.2,
        ease: "power2.out",
      }, 2.6);

      /* — Buttons fade up — */
      tl.from(".btn-animate", {
        opacity: 0,
        y: 12,
        duration: 0.8,
        stagger: 0.18,
        ease: "power2.out",
        clearProps: "all",
      }, 3.0);

      /* ─── Continuous ambient — slow, dreamy ─── */

      gsap.to(".floral-top-left", {
        rotation: 0.5,
        x: 0.8,
        duration: 6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 4,
        transformOrigin: "top left",
      });

      gsap.to(".floral-top-right", {
        rotation: -0.5,
        x: -0.8,
        duration: 7,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 4.5,
        transformOrigin: "top right",
      });

      gsap.to(".floral-bottom", {
        scaleX: 1.008,
        scaleY: 1.01,
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 4,
        transformOrigin: "bottom center",
      });

      gsap.to(".floral-vine-left", {
        x: 1,
        duration: 6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 4,
      });

      gsap.to(".floral-vine-right", {
        x: -1,
        duration: 6.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 4.5,
      });

    }, containerRef);

    /* Start particle systems */
    startPetalLoop();
    startSparkles();

    return () => ctx.revert();
  }, [startPetalLoop, startSparkles]);

  return (
    <div ref={containerRef} className="min-h-screen bg-cream relative overflow-hidden flex flex-col items-center justify-center">
      <WatercolorFilters />

      {/* Floral elements with GSAP class hooks */}
      <div className="floral-top-left absolute top-0 left-0 w-56 h-64">
        <FloralCornerTopLeft />
      </div>
      <div className="floral-top-right absolute top-0 right-0 w-56 h-64">
        <FloralCornerTopRight />
      </div>
      <div className="floral-vine-left absolute left-0 top-1/3 -translate-y-1/3 w-16 h-[28rem]">
        <FloralSideLeft />
      </div>
      <div className="floral-vine-right absolute right-0 top-1/3 -translate-y-1/3 w-16 h-[28rem]" style={{ transform: "scaleX(-1) translateY(-33%)" }}>
        <FloralSideRight />
      </div>
      <div className="floral-bottom absolute bottom-0 left-0 w-full h-80">
        <FloralBottom />
      </div>

      {/* Falling petal particles — 20 empty divs animated by GSAP */}
      <div ref={petalsRef} className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="petal-particle absolute" />
        ))}
      </div>

      {/* Sparkle dots */}
      <div ref={sparklesRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
        {Array.from({ length: 16 }, (_, i) => (
          <div key={i} className="sparkle-dot" style={{ width: 4 + Math.random() * 4, height: 4 + Math.random() * 4 }} />
        ))}
      </div>

      {/* Main content */}
      <div className="content-card relative z-10 flex flex-col items-center px-8 py-12">
        <div className="relative w-full max-w-xs">
          <div className="bg-blush/40 rounded-t-[120px] rounded-b-lg px-8 pt-14 pb-10 border border-blush-dark/20">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-sage tracking-[0.25em]" style={{ fontFamily: "var(--font-serif)" }}>
                {"BABY".split("").map((letter, i) => (
                  <span key={i} className="baby-letter inline-block">{letter}</span>
                ))}
              </h1>
              <p className="text-inbloom text-4xl text-sage-light mt-2" style={{ fontFamily: "var(--font-calligraphy)" }}>
                in bloom
              </p>
              <div className="divider-line w-20 h-px bg-sage/30 mx-auto mt-5 mb-4" />
              <p className="text-cascade text-sage text-base tracking-wide" style={{ fontFamily: "var(--font-serif)" }}>
                celebrating the arrival of
              </p>
              <p className="text-cascade text-sage text-2xl mt-3" style={{ fontFamily: "var(--font-calligraphy)" }}>
                {t("home.subtitle")}
              </p>
              <p className="text-cascade text-sage/60 text-sm mt-3" style={{ fontFamily: "var(--font-serif)" }}>
                {t("home.date")}
              </p>
            </div>
            <div className="mt-8 space-y-3">
              <Link href="/photos" className="btn-animate block w-full py-3.5 bg-white/60 backdrop-blur-sm rounded-xl text-center text-sage font-semibold text-base border border-blush-dark/20 hover:bg-white/80 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm" style={{ fontFamily: "var(--font-serif)" }}>
                {t("home.cta.photos")}
              </Link>
              <Link href="/game" className="btn-animate block w-full py-3.5 bg-sage/90 rounded-xl text-center text-cream font-semibold text-base hover:bg-sage hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm" style={{ fontFamily: "var(--font-serif)" }}>
                {t("home.cta.game")}
              </Link>
              <Link href="/capsule" className="btn-animate block w-full py-3.5 bg-blush/80 backdrop-blur-sm rounded-xl text-center text-sage font-semibold text-base border border-blush-dark/20 hover:bg-blush hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm" style={{ fontFamily: "var(--font-serif)" }}>
                {t("home.cta.capsule")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
