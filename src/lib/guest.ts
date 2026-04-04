// Cookie-based guest identity — no auth required
import { supabase } from "./supabase";

const GUEST_KEY = "babybloom_guest";

export interface Guest {
  id: string;
  name: string;
  avatar_url: string | null;
  avatar_color: string | null;
}

export function getGuest(): Guest | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Validate that the stored guest still exists in Supabase
// Returns the guest if valid, null if stale (and clears localStorage)
export async function getValidatedGuest(): Promise<Guest | null> {
  const guest = getGuest();
  if (!guest) return null;

  const { data } = await supabase
    .from("babyshower_guests")
    .select("id")
    .eq("id", guest.id)
    .limit(1);

  if (!data || data.length === 0) {
    // Guest was deleted from DB — clear stale identity
    clearGuest();
    return null;
  }
  return guest;
}

export function saveGuest(guest: Guest) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
}

export function clearGuest() {
  localStorage.removeItem(GUEST_KEY);
}

// 8 color palettes for facehash default avatars
export const AVATAR_COLORS = [
  { name: "Blush", colors: ["#e8a0a0", "#d88080", "#f0c0c0", "#c07070"] },
  { name: "Sage", colors: ["#7a9a6a", "#5a7a4a", "#a0c090", "#4a6a3a"] },
  { name: "Lavender", colors: ["#a088c0", "#8068a0", "#c0a8d8", "#685088"] },
  { name: "Gold", colors: ["#c8a840", "#a88820", "#e0c868", "#907018"] },
  { name: "Sky", colors: ["#70a8d0", "#5088b0", "#98c8e8", "#386898"] },
  { name: "Coral", colors: ["#e08870", "#c06850", "#f0a890", "#a05038"] },
  { name: "Plum", colors: ["#9070a0", "#705080", "#b090c0", "#503860"] },
  { name: "Mint", colors: ["#70b8a0", "#509880", "#98d8c0", "#387868"] },
];
