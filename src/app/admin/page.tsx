"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Guess {
  id: string;
  guest_name: string;
  birth_date: string | null;
  birth_weight: string | null;
  baby_name: string | null;
  looks_like: string | null;
  birth_time: string | null;
}

export default function AdminPage() {
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [photoCount, setPhotoCount] = useState(0);
  const [realAnswers, setRealAnswers] = useState({
    birth_date: "",
    birth_weight: "",
    baby_name: "",
    looks_like: "",
    birth_time: "",
  });

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("babyshower_guesses")
        .select("*")
        .order("created_at");
      if (data) setGuesses(data);

      const { count } = await supabase
        .from("babyshower_photos")
        .select("*", { count: "exact", head: true });
      setPhotoCount(count || 0);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-cream px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-sage">Admin Dashboard</h1>
          <p className="text-sage/60 text-sm mt-1">Baby in Bloom</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center shadow">
            <p className="text-3xl font-bold text-sage">{guesses.length}</p>
            <p className="text-sage/60 text-sm">Guesses</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow">
            <p className="text-3xl font-bold text-sage">{photoCount}</p>
            <p className="text-sage/60 text-sm">Photos</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex gap-3 mb-8">
          <Link
            href="/reveal"
            className="flex-1 py-3 bg-sage text-cream font-semibold rounded-xl text-center"
          >
            Open Reveal Screen
          </Link>
          <Link
            href="/photos"
            className="flex-1 py-3 bg-blush text-sage font-semibold rounded-xl text-center"
          >
            View Photos
          </Link>
        </div>

        {/* Real answers (for post-birth scoring) */}
        <div className="bg-white rounded-xl p-6 shadow mb-8">
          <h2 className="font-bold text-sage mb-4">
            Enter Real Answers (after baby is born)
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-sage/60">Birth Date</label>
              <input
                type="date"
                value={realAnswers.birth_date}
                onChange={(e) =>
                  setRealAnswers((p) => ({ ...p, birth_date: e.target.value }))
                }
                className="w-full py-2 px-3 rounded-lg border border-blush text-sage"
              />
            </div>
            <div>
              <label className="text-sm text-sage/60">Birth Weight</label>
              <input
                type="text"
                placeholder="e.g. 7 lbs 4 oz"
                value={realAnswers.birth_weight}
                onChange={(e) =>
                  setRealAnswers((p) => ({ ...p, birth_weight: e.target.value }))
                }
                className="w-full py-2 px-3 rounded-lg border border-blush text-sage"
              />
            </div>
            <div>
              <label className="text-sm text-sage/60">Baby Name</label>
              <input
                type="text"
                value={realAnswers.baby_name}
                onChange={(e) =>
                  setRealAnswers((p) => ({ ...p, baby_name: e.target.value }))
                }
                className="w-full py-2 px-3 rounded-lg border border-blush text-sage"
              />
            </div>
            <div>
              <label className="text-sm text-sage/60">Looks Like</label>
              <input
                type="text"
                value={realAnswers.looks_like}
                onChange={(e) =>
                  setRealAnswers((p) => ({ ...p, looks_like: e.target.value }))
                }
                className="w-full py-2 px-3 rounded-lg border border-blush text-sage"
              />
            </div>
            <div>
              <label className="text-sm text-sage/60">Birth Time</label>
              <input
                type="time"
                value={realAnswers.birth_time}
                onChange={(e) =>
                  setRealAnswers((p) => ({ ...p, birth_time: e.target.value }))
                }
                className="w-full py-2 px-3 rounded-lg border border-blush text-sage"
              />
            </div>
          </div>
        </div>

        {/* All guesses table */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="font-bold text-sage mb-4">All Guesses</h2>
          {guesses.length === 0 ? (
            <p className="text-sage/40 text-center">No guesses yet</p>
          ) : (
            <div className="space-y-4">
              {guesses.map((g) => (
                <div key={g.id} className="border-b border-blush-light pb-3">
                  <p className="font-bold text-sage">{g.guest_name}</p>
                  <div className="grid grid-cols-2 gap-1 text-sm text-sage/70 mt-1">
                    <span>📅 {g.birth_date || "—"}</span>
                    <span>⚖️ {g.birth_weight || "—"}</span>
                    <span>💝 {g.baby_name || "—"}</span>
                    <span>👶 {g.looks_like || "—"}</span>
                    <span>🕐 {g.birth_time || "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
