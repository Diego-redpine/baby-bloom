"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getValidatedGuest, clearGuest, type Guest } from "@/lib/guest";
import { GuestAvatar } from "@/components/GuestAvatar";
import { GuestOnboarding } from "@/components/GuestOnboarding";
import { useLanguage } from "@/lib/LanguageContext";

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


/* ── Main Photos Page ── */
export default function PhotosPage() {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [guests, setGuests] = useState<GuestRecord[]>([]);
  const [filterGuest, setFilterGuest] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  async function downloadPhoto(url: string, name: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      // CORS fallback — open in new tab so user can save manually
      window.open(url, "_blank");
    }
  }

  // Check for existing guest identity (validate against DB)
  useEffect(() => {
    async function init() {
      const validated = await getValidatedGuest();
      setGuest(validated);
      setLoaded(true);
    }
    init();
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
      alert(t("common.uploadFailed"));
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("babyshower-photos").getPublicUrl(fileName);
    const { data: newPhoto, error: insertError } = await supabase.from("babyshower_photos").insert({
      photo_url: publicUrl,
      guest_id: guest.id,
      guest_name: guest.name,
    }).select().single();
    if (insertError || !newPhoto) {
      alert(t("common.somethingWrong"));
      // Clean up orphaned file
      await supabase.storage.from("babyshower-photos").remove([fileName]);
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
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

  async function saveAllPhotos() {
    setSavingAll(true);
    try {
      for (let i = 0; i < displayPhotos.length; i++) {
        const photo = displayPhotos[i];
        const ext = photo.photo_url.split(".").pop()?.split("?")[0] || "jpg";
        await downloadPhoto(photo.photo_url, `photo_${i + 1}.${ext}`);
        if (i < displayPhotos.length - 1) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    } catch {
      alert(t("photos.saveFailed"));
    } finally {
      setSavingAll(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream px-4 pb-36">
      {/* Header — sticky so page context is always visible */}
      <div className="sticky top-0 z-20 bg-cream pt-4 pb-3 text-center">
        <div className="flex items-center justify-between px-1">
          <Link href="/" className="text-sage/50 text-sm">&larr; {t("photos.back")}</Link>
          <h1 className="text-lg font-bold text-sage" style={{ fontFamily: "var(--font-serif)" }}>{t("photos.title")}</h1>
          <button
            onClick={() => { clearGuest(); setGuest(null); }}
            className="text-sage/40 text-[10px]"
          >
            {t("photos.notYou")}
          </button>
        </div>
        {displayPhotos.length > 0 && (
          <button
            onClick={saveAllPhotos}
            disabled={savingAll}
            className="mt-2 py-2 px-5 bg-sage text-cream text-sm font-semibold rounded-xl disabled:opacity-40 transition-opacity"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {savingAll ? t("photos.saving") : t("photos.saveAll")}
          </button>
        )}
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
              <span className="text-[9px] text-sage/60 w-14 text-center">{t("photos.everyone")}</span>
            </button>
          </div>
        </div>
      )}

      {/* Photo grid — polaroid style */}
      {displayPhotos.length === 0 ? (
        <div className="text-center text-sage/40 mt-16">
          <p className="text-sage/20 text-5xl mb-3" style={{ fontFamily: "var(--font-calligraphy)" }}>~</p>
          <p>{t("photos.noPhotos")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          {displayPhotos.map((photo) => {
            const photoGuest = getPhotoGuest(photo);
            return (
              <div
                key={photo.id}
                className="bg-white rounded-lg shadow-md p-2 pb-2.5 hover:shadow-lg transition-shadow"
              >
                {/* Photo — tap to view fullscreen */}
                <div
                  className="aspect-square rounded overflow-hidden cursor-pointer"
                  onClick={() => setViewPhoto(photo.photo_url)}
                >
                  <img
                    src={photo.photo_url}
                    alt="Memory"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Polaroid bottom — avatar + download */}
                <div className="pt-1.5 px-0.5 flex items-center justify-between">
                  <div>
                    {photoGuest && <GuestAvatar guest={photoGuest} size={20} />}
                  </div>
                  <button
                    onClick={() => {
                      const ext = photo.photo_url.split(".").pop()?.split("?")[0] || "jpg";
                      downloadPhoto(photo.photo_url, `photo.${ext}`);
                    }}
                    className="text-[10px] text-sage/40 hover:text-sage/70 font-semibold transition-colors min-h-[44px] min-w-[44px] flex items-center justify-end"
                  >
                    {t("photos.save")}
                  </button>
                </div>
              </div>
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
              <span className="animate-pulse">{t("onboarding.uploading")}</span>
            ) : (
              t("photos.takePhoto")
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
