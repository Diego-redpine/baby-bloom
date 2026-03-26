"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getGuest, saveGuest, clearGuest, AVATAR_COLORS, type Guest } from "@/lib/guest";
import { Facehash } from "facehash";

interface Photo {
  id: string;
  photo_url: string;
  guest_id: string | null;
  guest_name: string | null;
  created_at: string;
}

interface GuestRecord {
  id: string;
  name: string;
  avatar_url: string | null;
  avatar_color: string | null;
}

/* ── Avatar component ── */
function GuestAvatar({ guest, size = 40 }: { guest: { name: string; avatar_url?: string | null; avatar_color?: string | null }; size?: number }) {
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

/* ── Onboarding flow ── */
function GuestOnboarding({ onComplete }: { onComplete: (guest: Guest) => void }) {
  const [step, setStep] = useState<"name" | "avatar">("name");
  const [name, setName] = useState("");
  const [avatarType, setAvatarType] = useState<"default" | "custom">("default");
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0].name);
  const [customUrl, setCustomUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `avatar-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("babyshower-photos").upload(fileName, file);
    if (error) {
      alert("Upload failed, try again!");
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("babyshower-photos").getPublicUrl(fileName);
    setCustomUrl(publicUrl);
    setAvatarType("custom");
    setUploading(false);
  }

  async function handleFinish() {
    const { data } = await supabase
      .from("babyshower_guests")
      .insert({
        name,
        avatar_url: avatarType === "custom" ? customUrl : null,
        avatar_color: avatarType === "default" ? selectedColor : null,
      })
      .select()
      .single();

    if (data) {
      const guest: Guest = {
        id: data.id,
        name: data.name,
        avatar_url: data.avatar_url,
        avatar_color: data.avatar_color,
      };
      saveGuest(guest);
      onComplete(guest);
    }
  }

  if (step === "name") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6">
        <div className="text-4xl mb-4" style={{ fontFamily: "var(--font-calligraphy)", color: "#d4a0a0" }}>*</div>
        <h1 className="text-2xl font-bold text-sage mb-2" style={{ fontFamily: "var(--font-serif)" }}>Welcome</h1>
        <p className="text-sage/60 text-sm mb-8 text-center">
          Enter your name to start sharing memories
        </p>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full max-w-xs py-3 px-4 rounded-xl border-2 border-blush bg-white text-sage text-center text-lg focus:outline-none focus:border-sage transition-colors"
          autoFocus
        />
        <button
          onClick={() => name.trim() && setStep("avatar")}
          disabled={!name.trim()}
          className="mt-4 w-full max-w-xs py-3 bg-sage text-cream font-semibold rounded-xl disabled:opacity-40 transition-opacity"
        >
          Next
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-bold text-sage mb-2" style={{ fontFamily: "var(--font-serif)" }}>Choose your look</h1>
      <p className="text-sage/60 text-sm mb-6 text-center">
        Pick a color or upload a photo
      </p>

      {/* Preview */}
      <div className="mb-6">
        <GuestAvatar
          guest={{ name, avatar_url: avatarType === "custom" ? customUrl : null, avatar_color: selectedColor }}
          size={80}
        />
      </div>

      {/* Color options — 8 grid */}
      <p className="text-sage/50 text-xs mb-3 uppercase tracking-wider">Default avatars</p>
      <div className="grid grid-cols-4 gap-3 mb-6">
        {AVATAR_COLORS.map((c) => (
          <button
            key={c.name}
            onClick={() => { setSelectedColor(c.name); setAvatarType("default"); }}
            className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${
              avatarType === "default" && selectedColor === c.name
                ? "border-sage scale-110 shadow-md"
                : "border-transparent"
            }`}
          >
            <Facehash name={name || "Guest"} size={52} colors={c.colors} intensity3d="medium" style={{ borderRadius: "50%" }} />
          </button>
        ))}
      </div>

      {/* Upload option */}
      <p className="text-sage/50 text-xs mb-3 uppercase tracking-wider">Or use your own</p>
      <label className="cursor-pointer mb-6">
        <div className={`py-2.5 px-6 rounded-xl text-center text-sm font-semibold transition-all ${
          avatarType === "custom" && customUrl
            ? "bg-sage text-cream"
            : "bg-blush text-sage border border-blush-dark/20"
        }`}>
          {uploading ? "Uploading..." : customUrl ? "Photo uploaded" : "Upload Photo"}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
          disabled={uploading}
        />
      </label>

      <button
        onClick={handleFinish}
        className="w-full max-w-xs py-3 bg-sage text-cream font-semibold rounded-xl transition-opacity"
      >
        Let&apos;s Go!
      </button>
    </div>
  );
}

/* ── Main Photos Page ── */
export default function PhotosPage() {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [guests, setGuests] = useState<GuestRecord[]>([]);
  const [filterGuest, setFilterGuest] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Check for existing guest identity
  useEffect(() => {
    setGuest(getGuest());
    setLoaded(true);
  }, []);

  // Load photos and guests
  const loadData = useCallback(async () => {
    const [photosRes, guestsRes] = await Promise.all([
      supabase.from("babyshower_photos").select("*").order("created_at", { ascending: false }),
      supabase.from("babyshower_guests").select("*").order("created_at", { ascending: false }),
    ]);
    if (photosRes.data) setPhotos(photosRes.data);
    if (guestsRes.data) setGuests(guestsRes.data);
  }, []);

  useEffect(() => {
    if (guest) loadData();
  }, [guest, loadData]);

  // Realtime subscription for new photos — deduplicate by id
  useEffect(() => {
    if (!guest) return;
    const channel = supabase
      .channel("photos-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "babyshower_photos" }, (payload) => {
        const newPhoto = payload.new as Photo;
        setPhotos((prev) => {
          if (prev.some(p => p.id === newPhoto.id)) return prev;
          return [newPhoto, ...prev];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [guest]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !guest) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("babyshower-photos").upload(fileName, file);
    if (error) {
      alert("Upload failed, please try again!");
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("babyshower-photos").getPublicUrl(fileName);
    const { data: newPhoto } = await supabase.from("babyshower_photos").insert({
      photo_url: publicUrl,
      guest_id: guest.id,
      guest_name: guest.name,
    }).select().single();
    if (newPhoto) {
      setPhotos((prev) => [newPhoto, ...prev]);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  // Show onboarding if no guest identity
  if (!loaded) return null;
  if (!guest) {
    return <GuestOnboarding onComplete={(g) => setGuest(g)} />;
  }

  // Get guest record for a photo
  function getPhotoGuest(photo: Photo): GuestRecord | undefined {
    return guests.find(g => g.id === photo.guest_id);
  }

  // Filtered photos
  const displayPhotos = filterGuest
    ? photos.filter(p => p.guest_id === filterGuest)
    : photos;

  return (
    <div className="min-h-screen bg-cream px-4 pb-36">
      {/* Header — sticky so page context is always visible */}
      <div className="sticky top-0 z-20 bg-cream pt-4 pb-3 text-center">
        <div className="flex items-center justify-between px-1">
          <Link href="/" className="text-sage/50 text-sm">&larr; Back</Link>
          <h1 className="text-lg font-bold text-sage" style={{ fontFamily: "var(--font-serif)" }}>Share your memories</h1>
          <button
            onClick={() => { clearGuest(); setGuest(null); }}
            className="text-sage/40 text-[10px]"
          >
            Not you?
          </button>
        </div>
      </div>

      {/* Guest profile avatars — horizontal scroll filter */}
      {guests.length > 0 && (
        <div className="mb-5">
          <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide">
            {/* All filter */}
            {guests.map((g) => (
              <button
                key={g.id}
                onClick={() => setFilterGuest(filterGuest === g.id ? null : g.id)}
                className={`flex flex-col items-center gap-1 flex-shrink-0 transition-all ${filterGuest === g.id ? "opacity-100" : filterGuest ? "opacity-40" : "opacity-80"}`}
              >
                <div className={`rounded-full border-2 p-0.5 ${filterGuest === g.id ? "border-sage" : "border-transparent"}`}>
                  <GuestAvatar guest={g} size={36} />
                </div>
                <span className="text-[9px] text-sage/60 w-14 truncate text-center">{g.name.split(" ")[0]}</span>
              </button>
            ))}
            {/* All filter — at the end */}
            <button
              onClick={() => setFilterGuest(null)}
              className={`flex flex-col items-center gap-1 flex-shrink-0 ${!filterGuest ? "opacity-100" : "opacity-50"}`}
            >
              <div className={`w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center text-sage text-[10px] font-bold border-2 ${!filterGuest ? "border-sage" : "border-transparent"}`}>
                All
              </div>
              <span className="text-[9px] text-sage/60 w-14 text-center">Everyone</span>
            </button>
          </div>
        </div>
      )}

      {/* Photo grid — polaroid style */}
      {displayPhotos.length === 0 ? (
        <div className="text-center text-sage/40 mt-16">
          <p className="text-sage/20 text-5xl mb-3" style={{ fontFamily: "var(--font-calligraphy)" }}>~</p>
          <p>No photos yet &mdash; be the first!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          {displayPhotos.map((photo) => {
            const photoGuest = getPhotoGuest(photo);
            return (
              <button
                key={photo.id}
                onClick={() => setViewPhoto(photo.photo_url)}
                className="bg-white rounded-lg shadow-md p-2 pb-2.5 hover:shadow-lg transition-shadow text-left"
              >
                {/* Photo */}
                <div className="aspect-square rounded overflow-hidden">
                  <img
                    src={photo.photo_url}
                    alt="Memory"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Polaroid bottom — avatar in white space */}
                {photoGuest && (
                  <div className="pt-1.5 pl-0.5">
                    <GuestAvatar guest={photoGuest} size={20} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen viewer */}
      {viewPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setViewPhoto(null)}
        >
          <img src={viewPhoto} alt="Full size" className="max-w-full max-h-full rounded-xl" />
        </div>
      )}

      {/* Floating camera button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
        <label className="cursor-pointer">
          <div className="bg-sage text-cream font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-sage-light transition-all flex items-center gap-2 text-sm">
            {uploading ? (
              <span className="animate-pulse">Uploading...</span>
            ) : (
              "Take a Photo"
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}
