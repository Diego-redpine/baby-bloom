"use client";

import { useState, useEffect } from "react";
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

const questionLabels = [
  { key: "birth_date", label: "When will baby be born?", icon: "📅" },
  { key: "birth_weight", label: "How much will baby weigh?", icon: "⚖️" },
  { key: "baby_name", label: "What will baby's name be?", icon: "💝" },
  { key: "looks_like", label: "Who will baby look like?", icon: "👶" },
  { key: "birth_time", label: "What time will baby be born?", icon: "🕐" },
];

export default function RevealPage() {
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("babyshower_guesses")
        .select("*")
        .order("created_at");
      if (data) setGuesses(data);
    }
    load();
  }, []);

  const q = questionLabels[currentQ];

  return (
    <div className="min-h-screen bg-sage flex flex-col items-center justify-center px-6 py-12">
      {/* Title */}
      <div className="text-center mb-8">
        <p className="text-cream/60 text-sm tracking-widest uppercase">Baby in Bloom</p>
        <h1 className="text-3xl font-bold text-cream mt-1">Guessing Game Results</h1>
      </div>

      {/* Question indicator */}
      <div className="flex gap-2 mb-8">
        {questionLabels.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrentQ(i); setRevealed(false); }}
            className={`w-10 h-10 rounded-full font-bold transition-all ${
              i === currentQ
                ? "bg-cream text-sage scale-110"
                : i < currentQ
                ? "bg-cream/40 text-sage"
                : "bg-sage-light text-cream/60"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="text-5xl mb-3">{q.icon}</div>
        <h2 className="text-xl font-bold text-sage mb-6">{q.label}</h2>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="py-3 px-8 bg-blush text-sage font-bold rounded-xl text-lg hover:bg-blush-dark transition-colors"
          >
            Reveal Answers!
          </button>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {guesses.map((g) => (
              <div
                key={g.id}
                className="flex justify-between items-center py-3 px-4 bg-cream rounded-xl"
              >
                <span className="font-semibold text-sage">{g.guest_name}</span>
                <span className="text-sage/70">
                  {g[q.key as keyof Guess] || "—"}
                </span>
              </div>
            ))}
            {guesses.length === 0 && (
              <p className="text-sage/40">No guesses yet!</p>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {currentQ > 0 && (
          <button
            onClick={() => { setCurrentQ(currentQ - 1); setRevealed(false); }}
            className="py-3 px-6 bg-cream/20 text-cream font-semibold rounded-xl"
          >
            &larr; Previous
          </button>
        )}
        {currentQ < questionLabels.length - 1 && (
          <button
            onClick={() => { setCurrentQ(currentQ + 1); setRevealed(false); }}
            className="py-3 px-6 bg-cream text-sage font-semibold rounded-xl"
          >
            Next &rarr;
          </button>
        )}
      </div>

      <p className="mt-8 text-cream/40 text-xs">
        {guesses.length} guests have played
      </p>
    </div>
  );
}
