"use client";

import { AVATAR_COLORS } from "@/lib/guest";
import { Facehash } from "facehash";

export function GuestAvatar({ guest, size = 40 }: { guest: { name: string; avatar_url?: string | null; avatar_color?: string | null }; size?: number }) {
  if (guest.avatar_url) {
    return (
      <img
        src={guest.avatar_url}
        alt={guest.name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const palette = AVATAR_COLORS.find(c => c.name === guest.avatar_color) || AVATAR_COLORS[0];
  return (
    <div className="rounded-full overflow-hidden" style={{ width: size, height: size }}>
      <Facehash
        name={guest.name}
        size={size}
        colors={palette.colors}
        intensity3d="medium"
        style={{ borderRadius: "50%" }}
      />
    </div>
  );
}
