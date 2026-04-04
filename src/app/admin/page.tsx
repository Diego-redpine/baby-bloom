"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { GuestAvatar } from "@/components/GuestAvatar";

interface GuestRecord {
  id: string;
  name: string;
  avatar_url: string | null;
  avatar_color: string | null;
}

interface Photo {
  id: string;
  photo_url: string;
  guest_id: string | null;
  guest_name: string | null;
  created_at: string;
}

interface Vote {
  id: string;
  guest_id: string;
  guest_name: string;
  question_key: string;
  answer: string;
}

interface CapsuleMessage {
  id: string;
  guest_id: string;
  guest_name: string;
  media_type: "video" | "audio";
  storage_path: string;
  duration_seconds: number | null;
  created_at: string;
}

const questions = [
  { key: "first_word", label: "What will her first word be?", type: "freetext" },
  { key: "mamas_or_daddys", label: "Mama's girl or Daddy's girl?", type: "thisorthat", options: ["Mama's girl", "Daddy's girl"] },
  { key: "hair_amount", label: "How much hair is she coming in with?", type: "multiplechoice", options: ["Completely bald", "A little fuzz", "A full head", "Enough for a bow already"] },
  { key: "personality", label: "Calm and chill or Loud and dramatic?", type: "thisorthat", options: ["Calm and chill", "Loud and dramatic"] },
  { key: "career", label: "What will she be when she grows up?", type: "freetext" },
  { key: "trouble_age", label: "How old will she be when she gives her parents the most trouble?", type: "multiplechoice", options: ["Terrible twos", "Moody middle school", "Teenage years", "She'll be an angel forever"] },
  { key: "sleep_pattern", label: "Night owl or Early bird?", type: "thisorthat", options: ["Night owl", "Early bird"] },
  { key: "advice", label: "Leave her one piece of advice she'll need someday.", type: "freetext" },
];

/* ── Tab button ── */
function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-5 rounded-xl font-semibold text-sm transition-all ${
        active
          ? "bg-sage text-cream shadow-sm"
          : "bg-blush-light text-sage/60 hover:text-sage"
      }`}
    >
      {label}
    </button>
  );
}

/* ── Percentage bar for This or That / Multiple Choice ── */
function PercentBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-sage font-medium">{label}</span>
        <span className="text-sage/50">{count} vote{count !== 1 ? "s" : ""} ({pct}%)</span>
      </div>
      <div className="h-3 bg-blush-light rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<"photos" | "game" | "capsule">("photos");
  const [guests, setGuests] = useState<GuestRecord[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [capsules, setCapsules] = useState<CapsuleMessage[]>([]);
  const [capsuleUrls, setCapsuleUrls] = useState<Record<string, string>>({});
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [guestsRes, photosRes, votesRes, capsulesRes] = await Promise.all([
        supabase.from("babyshower_guests").select("*").order("created_at"),
        supabase.from("babyshower_photos").select("*").order("created_at", { ascending: false }),
        supabase.from("babyshower_game_votes").select("*").order("created_at"),
        supabase.from("babyshower_capsule_messages").select("*").order("created_at"),
      ]);
      if (guestsRes.data) setGuests(guestsRes.data);
      if (photosRes.data) setPhotos(photosRes.data);
      if (votesRes.data) setVotes(votesRes.data);
      if (capsulesRes.data) {
        setCapsules(capsulesRes.data);
        // Resolve public URLs for capsule playback
        const urls: Record<string, string> = {};
        for (const c of capsulesRes.data) {
          const { data } = supabase.storage
            .from("babyshower-capsule")
            .getPublicUrl(c.storage_path);
          if (data?.publicUrl) urls[c.id] = data.publicUrl;
        }
        setCapsuleUrls(urls);
      }
    }
    load();
  }, []);

  function getGuest(guestId: string | null): GuestRecord | undefined {
    return guests.find((g) => g.id === guestId);
  }

  // Count unique game players
  const uniquePlayers = new Set(votes.map((v) => v.guest_id)).size;

  return (
    <div className="min-h-screen bg-cream px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="text-sage/50 text-sm">&larr; Back to Home</Link>
          <h1 className="text-2xl font-bold text-sage mt-2" style={{ fontFamily: "var(--font-serif)" }}>
            Admin Dashboard
          </h1>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button onClick={() => setTab("photos")} className={`rounded-xl p-4 text-center transition-all ${tab === "photos" ? "bg-sage text-cream shadow-md" : "bg-white shadow-sm"}`}>
            <p className={`text-3xl font-bold ${tab === "photos" ? "text-cream" : "text-sage"}`}>{photos.length}</p>
            <p className={`text-xs mt-1 ${tab === "photos" ? "text-cream/70" : "text-sage/60"}`}>Photos</p>
          </button>
          <button onClick={() => setTab("game")} className={`rounded-xl p-4 text-center transition-all ${tab === "game" ? "bg-sage text-cream shadow-md" : "bg-white shadow-sm"}`}>
            <p className={`text-3xl font-bold ${tab === "game" ? "text-cream" : "text-sage"}`}>{uniquePlayers}</p>
            <p className={`text-xs mt-1 ${tab === "game" ? "text-cream/70" : "text-sage/60"}`}>Players</p>
          </button>
          <button onClick={() => setTab("capsule")} className={`rounded-xl p-4 text-center transition-all ${tab === "capsule" ? "bg-sage text-cream shadow-md" : "bg-white shadow-sm"}`}>
            <p className={`text-3xl font-bold ${tab === "capsule" ? "text-cream" : "text-sage"}`}>{capsules.length}</p>
            <p className={`text-xs mt-1 ${tab === "capsule" ? "text-cream/70" : "text-sage/60"}`}>Capsules</p>
          </button>
        </div>

        {/* Guest count */}
        <p className="text-center text-sage/40 text-xs mb-6">{guests.length} guest{guests.length !== 1 ? "s" : ""} registered</p>

        {/* Tab bar */}
        <div className="flex gap-2 mb-6 justify-center">
          <Tab label="Photos" active={tab === "photos"} onClick={() => setTab("photos")} />
          <Tab label="Game Results" active={tab === "game"} onClick={() => setTab("game")} />
          <Tab label="Time Capsule" active={tab === "capsule"} onClick={() => setTab("capsule")} />
        </div>

        {/* ═══════════ PHOTOS TAB ═══════════ */}
        {tab === "photos" && (
          <div>
            {photos.length === 0 ? (
              <p className="text-center text-sage/40 py-12">No photos yet</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((photo) => {
                  const photoGuest = getGuest(photo.guest_id);
                  return (
                    <button
                      key={photo.id}
                      onClick={() => setViewPhoto(photo.photo_url)}
                      className="bg-white rounded-lg shadow-sm p-1.5 pb-2 hover:shadow-md transition-shadow text-left"
                    >
                      <div className="aspect-square rounded overflow-hidden">
                        <img src={photo.photo_url} alt="Memory" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center gap-1.5 pt-1.5 px-0.5">
                        {photoGuest && <GuestAvatar guest={photoGuest} size={16} />}
                        <span className="text-[10px] text-sage/60 truncate">{photo.guest_name || "Guest"}</span>
                        <span className="text-[9px] text-sage/30 ml-auto whitespace-nowrap">
                          {new Date(photo.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ GAME RESULTS TAB ═══════════ */}
        {tab === "game" && (
          <div className="space-y-6">
            {votes.length === 0 ? (
              <p className="text-center text-sage/40 py-12">No game responses yet</p>
            ) : (
              questions.map((q) => {
                const qVotes = votes.filter((v) => v.question_key === q.key);
                const total = qVotes.length;

                return (
                  <div key={q.key} className="bg-white rounded-xl p-5 shadow-sm">
                    <h3 className="font-bold text-sage mb-3" style={{ fontFamily: "var(--font-serif)" }}>
                      {q.label}
                    </h3>

                    {/* This or That — percentage bars */}
                    {q.type === "thisorthat" && q.options && (
                      <div>
                        {q.options.map((opt, i) => {
                          const count = qVotes.filter((v) => v.answer === opt).length;
                          return (
                            <PercentBar
                              key={opt}
                              label={opt}
                              count={count}
                              total={total}
                              color={i === 0 ? "#d4a0a0" : "#4a7c44"}
                            />
                          );
                        })}
                        <p className="text-[10px] text-sage/40 mt-2">{total} vote{total !== 1 ? "s" : ""}</p>
                      </div>
                    )}

                    {/* Multiple Choice — percentage bars */}
                    {q.type === "multiplechoice" && q.options && (
                      <div>
                        {q.options.map((opt, i) => {
                          const count = qVotes.filter((v) => v.answer === opt).length;
                          const colors = ["#2d5a27", "#4a7c44", "#c9a84c", "#d4a0a0"];
                          return (
                            <PercentBar
                              key={opt}
                              label={opt}
                              count={count}
                              total={total}
                              color={colors[i]}
                            />
                          );
                        })}
                        <p className="text-[10px] text-sage/40 mt-2">{total} response{total !== 1 ? "s" : ""}</p>
                      </div>
                    )}

                    {/* Free Text — profile icon grid */}
                    {q.type === "freetext" && (
                      <div>
                        {qVotes.length === 0 ? (
                          <p className="text-sage/40 text-sm">No answers yet</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {qVotes.map((v) => {
                              const vGuest = getGuest(v.guest_id);
                              return (
                                <div key={v.guest_id} className="flex items-start gap-2 py-2 px-3 bg-cream rounded-lg">
                                  {vGuest ? (
                                    <GuestAvatar guest={vGuest} size={24} />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-sage/10 flex items-center justify-center text-sage text-[10px] font-bold shrink-0">
                                      {v.guest_name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-[10px] text-sage/50">{v.guest_name}</p>
                                    <p className="text-sm text-sage">{v.answer}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <p className="text-[10px] text-sage/40 mt-2">{total} response{total !== 1 ? "s" : ""}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ═══════════ TIME CAPSULE TAB ═══════════ */}
        {tab === "capsule" && (
          <div>
            {capsules.length === 0 ? (
              <p className="text-center text-sage/40 py-12">No messages yet</p>
            ) : (
              <div className="space-y-4">
                {capsules.map((c) => {
                  const cGuest = getGuest(c.guest_id);
                  const signedUrl = capsuleUrls[c.id];
                  const mins = c.duration_seconds ? Math.floor(c.duration_seconds / 60) : 0;
                  const secs = c.duration_seconds ? c.duration_seconds % 60 : 0;

                  return (
                    <div key={c.id} className="bg-white rounded-2xl p-5 shadow-md border border-blush/20">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-4">
                        {cGuest ? (
                          <GuestAvatar guest={cGuest} size={44} />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-sage/10 flex items-center justify-center text-sage font-bold text-base">
                            {c.guest_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-bold text-sage text-base">{c.guest_name}</p>
                          <div className="flex items-center gap-2 text-xs text-sage/50">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.media_type === "video" ? "bg-sage/10 text-sage" : "bg-blush/30 text-sage/70"}`}>
                              {c.media_type === "video" ? "Video" : "Voice"}
                            </span>
                            {c.duration_seconds != null && (
                              <span>{mins}:{secs.toString().padStart(2, "0")}</span>
                            )}
                            <span className="ml-auto">{new Date(c.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Playback */}
                      {signedUrl ? (
                        c.media_type === "video" ? (
                          <video
                            src={signedUrl}
                            controls
                            playsInline
                            className="w-full rounded-xl bg-black"
                            style={{ maxHeight: 360 }}
                          />
                        ) : (
                          <audio src={signedUrl} controls className="w-full" />
                        )
                      ) : (
                        <p className="text-sage/40 text-sm animate-pulse">Loading media...</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Fullscreen photo viewer */}
        {viewPhoto && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setViewPhoto(null)}
          >
            <img src={viewPhoto} alt="Full size" className="max-w-full max-h-full rounded-xl" />
          </div>
        )}
      </div>
    </div>
  );
}
