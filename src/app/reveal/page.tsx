"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

interface Vote {
  id: string;
  guest_id: string;
  guest_name: string;
  question_key: string;
  answer: string;
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

export default function RevealPage() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const { t } = useLanguage();

  function tq(key: string): string {
    return t(`game.q.${key}` as TranslationKey);
  }
  function tOpt(questionKey: string, index: number): string {
    const suffix = ["a", "b", "c", "d"][index];
    return t(`game.q.${questionKey}.${suffix}` as TranslationKey);
  }

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("babyshower_game_votes")
        .select("*")
        .order("created_at");
      if (data) setVotes(data);
    }
    load();

    // Live updates
    const channel = supabase
      .channel("reveal-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "babyshower_game_votes" }, (payload) => {
        const newVote = payload.new as Vote;
        setVotes((prev) => {
          if (prev.some(v => v.id === newVote.id)) return prev;
          return [...prev, newVote];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const q = questions[currentQ];
  const qVotes = votes.filter((v) => v.question_key === q.key);
  const total = qVotes.length;
  const uniquePlayers = new Set(votes.map((v) => v.guest_id)).size;

  return (
    <div className="min-h-screen bg-sage flex flex-col items-center justify-center px-6 py-12">
      {/* Title */}
      <div className="text-center mb-8">
        <p className="text-cream/60 text-sm tracking-widest uppercase">{t("reveal.subtitle")}</p>
        <h1 className="text-3xl font-bold text-cream mt-1" style={{ fontFamily: "var(--font-serif)" }}>
          {t("reveal.title")}
        </h1>
      </div>

      {/* Question indicator */}
      <div className="flex gap-2 mb-8 flex-wrap justify-center">
        {questions.map((_, i) => (
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
        <p className="text-xs text-sage/40 uppercase tracking-wider mb-2">
          {q.type === "thisorthat" ? t("reveal.thisOrThat") : q.type === "multiplechoice" ? t("reveal.multipleChoice") : t("reveal.freeText")}
        </p>
        <h2 className="text-xl font-bold text-sage mb-6" style={{ fontFamily: "var(--font-serif)" }}>{tq(q.key)}</h2>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="py-3 px-8 bg-blush text-sage font-bold rounded-xl text-lg hover:bg-blush-dark transition-colors"
          >
            {t("reveal.reveal")}
          </button>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {/* This or That — percentage bars */}
            {q.type === "thisorthat" && q.options && (
              <div className="space-y-2">
                {q.options.map((opt, i) => {
                  const count = qVotes.filter((v) => v.answer === opt).length;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={opt}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-sage">{tOpt(q.key, i)}</span>
                        <span className="text-sage/50">{count} ({pct}%)</span>
                      </div>
                      <div className="h-4 bg-blush-light rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: i === 0 ? "#d4a0a0" : "#4a7c44" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Multiple Choice — percentage bars */}
            {q.type === "multiplechoice" && q.options && (
              <div className="space-y-2">
                {q.options.map((opt, i) => {
                  const count = qVotes.filter((v) => v.answer === opt).length;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const colors = ["#2d5a27", "#4a7c44", "#c9a84c", "#d4a0a0"];
                  return (
                    <div key={opt}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-sage">{tOpt(q.key, i)}</span>
                        <span className="text-sage/50">{count} ({pct}%)</span>
                      </div>
                      <div className="h-4 bg-blush-light rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: colors[i] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Free Text — guest answers list */}
            {q.type === "freetext" && (
              <div className="space-y-2 text-left">
                {qVotes.length === 0 ? (
                  <p className="text-sage/40 text-center">{t("reveal.noAnswers")}</p>
                ) : (
                  qVotes.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-start gap-2 py-2 px-3 bg-cream rounded-xl"
                    >
                      <div className="w-6 h-6 rounded-full bg-sage/10 flex items-center justify-center text-sage text-[10px] font-bold shrink-0 mt-0.5">
                        {v.guest_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-sage/50">{v.guest_name}</p>
                        <p className="text-sm text-sage break-words">{v.answer}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
            &larr; {t("reveal.previous")}
          </button>
        )}
        {currentQ < questions.length - 1 && (
          <button
            onClick={() => { setCurrentQ(currentQ + 1); setRevealed(false); }}
            className="py-3 px-6 bg-cream text-sage font-semibold rounded-xl"
          >
            {t("reveal.next")} &rarr;
          </button>
        )}
      </div>

      <p className="mt-8 text-cream/40 text-xs">
        {uniquePlayers} {uniquePlayers !== 1 ? t("reveal.guestsPlayed") : t("reveal.guestPlayed")}
      </p>
    </div>
  );
}
