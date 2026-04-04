"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getGuest, type Guest } from "@/lib/guest";
import { GuestOnboarding } from "@/components/GuestOnboarding";
import { useLanguage } from "@/lib/LanguageContext";

interface Question {
  key: string;
  label: string;
  type: "freetext" | "thisorthat" | "multiplechoice";
  options?: string[];
}

const questions: Question[] = [
  { key: "first_word", label: "What will her first word be?", type: "freetext" },
  { key: "mamas_or_daddys", label: "Mama's girl or Daddy's girl?", type: "thisorthat", options: ["Mama's girl", "Daddy's girl"] },
  { key: "hair_amount", label: "How much hair is she coming in with?", type: "multiplechoice", options: ["Completely bald", "A little fuzz", "A full head", "Enough for a bow already"] },
  { key: "personality", label: "Calm and chill or Loud and dramatic?", type: "thisorthat", options: ["Calm and chill", "Loud and dramatic"] },
  { key: "career", label: "What will she be when she grows up?", type: "freetext" },
  { key: "trouble_age", label: "How old will she be when she gives her parents the most trouble?", type: "multiplechoice", options: ["Terrible twos", "Moody middle school", "Teenage years", "She'll be an angel forever"] },
  { key: "sleep_pattern", label: "Night owl or Early bird?", type: "thisorthat", options: ["Night owl", "Early bird"] },
  { key: "advice", label: "Leave her one piece of advice she'll need someday.", type: "freetext" },
];

interface Vote {
  guest_id: string;
  guest_name: string;
  question_key: string;
  answer: string;
}

interface GuestRecord {
  id: string;
  name: string;
  avatar_color: string | null;
}

function getQuestionLabel(key: string, t: (k: any) => string): string {
  return t(`game.q.${key}` as any);
}
function getOptionLabel(questionKey: string, optionIndex: number, t: (k: any) => string): string {
  const suffix = ["a", "b", "c", "d"][optionIndex];
  return t(`game.q.${questionKey}.${suffix}` as any);
}

export default function GamePage() {
  const { t, lang } = useLanguage();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState(0); // 0 = name entry, 1-8 = questions, 9 = results
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [flashValue, setFlashValue] = useState<string | null>(null);

  // Results state
  const [votes, setVotes] = useState<Vote[]>([]);
  const [guests, setGuests] = useState<GuestRecord[]>([]);

  useEffect(() => {
    async function init() {
      const existing = getGuest();
      if (existing) {
        setGuest(existing);
        setName(existing.name);
        // Check if guest already submitted votes
        const { data } = await supabase
          .from("babyshower_game_votes")
          .select("id")
          .eq("guest_id", existing.id)
          .limit(1);
        if (data && data.length > 0) {
          setStep(questions.length + 1); // Go straight to results
        } else {
          setStep(1);
        }
      }
      setLoaded(true);
    }
    init();
  }, []);

  const fetchResults = useCallback(async () => {
    const [votesRes, guestsRes] = await Promise.all([
      supabase.from("babyshower_game_votes").select("*"),
      supabase.from("babyshower_guests").select("*"),
    ]);
    if (votesRes.data) setVotes(votesRes.data);
    if (guestsRes.data) setGuests(guestsRes.data);
  }, []);

  // Realtime subscription for results
  useEffect(() => {
    if (step !== questions.length + 1) return;

    fetchResults();

    const channel = supabase
      .channel("game-votes-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "babyshower_game_votes" },
        () => {
          fetchResults();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [step, fetchResults]);

  async function handleSubmitWithAnswers(ans: Record<string, string>) {
    if (!guest) return;
    setSubmitting(true);
    const rows = questions
      .filter((q) => ans[q.key]?.trim())
      .map((q) => ({
        guest_id: guest.id,
        guest_name: guest.name,
        question_key: q.key,
        answer: ans[q.key],
      }));
    if (rows.length === 0) {
      alert(t("common.answerOne"));
      setSubmitting(false);
      return;
    }
    const { error } = await supabase.from("babyshower_game_votes").insert(rows);
    if (error) {
      alert(t("common.submitError"));
      setSubmitting(false);
      return;
    }
    setStep(questions.length + 1);
    setSubmitting(false);
  }

  async function handleSubmit() {
    if (!guest) return;
    setSubmitting(true);
    const rows = questions
      .filter((q) => answers[q.key]?.trim())
      .map((q) => ({
        guest_id: guest.id,
        guest_name: guest.name,
        question_key: q.key,
        answer: answers[q.key],
      }));
    if (rows.length === 0) {
      alert(t("common.answerOne"));
      setSubmitting(false);
      return;
    }
    const { error } = await supabase.from("babyshower_game_votes").insert(rows);
    if (error) {
      alert(t("common.submitError"));
      setSubmitting(false);
      return;
    }
    setStep(questions.length + 1);
    setSubmitting(false);
  }

  function handleThisOrThatSelect(key: string, value: string) {
    setFlashValue(value);
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    setTimeout(() => {
      setFlashValue(null);
      if (step === questions.length) {
        // Last question — submit instead of advancing
        setStep((s) => s); // stay, handleSubmit will advance
        handleSubmitWithAnswers(updated);
      } else {
        setStep((s) => s + 1);
      }
    }, 600);
  }

  function handleMultipleChoiceSelect(key: string, value: string) {
    setFlashValue(value);
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    setTimeout(() => {
      setFlashValue(null);
      if (step === questions.length) {
        handleSubmitWithAnswers(updated);
      } else {
        setStep((s) => s + 1);
      }
    }, 400);
  }

  if (!loaded) return null;

  // --- Onboarding (no guest identity) ---
  if (step === 0) {
    return (
      <GuestOnboarding onComplete={(g) => {
        setGuest(g);
        setName(g.name);
        setStep(1);
      }} />
    );
  }

  // --- Results screen ---
  if (step > questions.length) {
    return <ResultsScreen votes={votes} guests={guests} name={name} t={t} />;
  }

  // --- Question flow ---
  const q = questions[step - 1];
  const currentAnswer = answers[q.key] || "";

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5">
      {/* Progress */}
      <div className="w-full max-w-xs mb-8">
        <div className="flex justify-between text-xs text-sage/50 mb-2 uppercase tracking-wider">
          <span className="truncate max-w-[140px]">{name}</span>
          <span>{step} {t("game.of")} {questions.length}</span>
        </div>
        <div className="h-2 bg-blush-light rounded-full overflow-hidden">
          <div
            className="h-full bg-sage rounded-full transition-all duration-500"
            style={{ width: `${(step / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="w-full max-w-xs bg-white rounded-2xl shadow-lg p-5 text-center">
        <h2 className="text-lg font-bold text-sage mb-4" style={{ fontFamily: "var(--font-serif)" }}>{getQuestionLabel(q.key, t)}</h2>

        {q.type === "thisorthat" && q.options && (
          <div className="flex gap-3">
            {q.options.map((option, i) => {
              const isFlashing = flashValue === option;
              const flashColor = i === 0
                ? "bg-pink-400 text-white scale-105 shadow-md"
                : "bg-blue-400 text-white scale-105 shadow-md";
              return (
                <button
                  key={option}
                  onClick={() => handleThisOrThatSelect(q.key, option)}
                  disabled={flashValue !== null}
                  className={`flex-1 py-4 rounded-xl font-semibold text-base transition-all duration-300 ${
                    isFlashing
                      ? flashColor
                      : "bg-cream text-sage border-2 border-blush"
                  }`}
                >
                  {getOptionLabel(q.key, i, t)}
                </button>
              );
            })}
          </div>
        )}

        {q.type === "multiplechoice" && q.options && (
          <div className="flex flex-col gap-3">
            {q.options.map((option, i) => {
              const isSelected = flashValue === option;
              return (
                <button
                  key={option}
                  onClick={() => handleMultipleChoiceSelect(q.key, option)}
                  disabled={flashValue !== null}
                  className={`w-full py-3 rounded-xl border-2 text-left px-4 transition-all duration-300 ${
                    isSelected
                      ? "bg-sage text-cream border-sage"
                      : "border-blush bg-cream text-sage"
                  }`}
                >
                  {getOptionLabel(q.key, i, t)}
                </button>
              );
            })}
          </div>
        )}

        {q.type === "freetext" && (
          <input
            type="text"
            placeholder={t("game.placeholder")}
            value={currentAnswer}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))
            }
            className="w-full py-3 px-4 rounded-xl border-2 border-blush bg-cream text-sage text-center focus:outline-none focus:border-sage transition-colors"
            autoFocus
          />
        )}
      </div>

      {/* Navigation for freetext */}
      {q.type === "freetext" && (
        <div className="flex gap-3 mt-6 w-full max-w-xs">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 bg-blush-light text-sage font-semibold rounded-xl"
            >
              {t("game.back")}
            </button>
          )}
          {step < questions.length ? (
            <button
              onClick={() => currentAnswer.trim() && setStep(step + 1)}
              disabled={!currentAnswer.trim()}
              className="flex-1 py-3 bg-sage text-cream font-semibold rounded-xl disabled:opacity-40 transition-opacity"
            >
              {t("game.next")}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!currentAnswer.trim() || submitting}
              className="flex-1 py-3 bg-sage text-cream font-semibold rounded-xl disabled:opacity-40 transition-opacity"
            >
              {submitting ? t("game.submitting") : t("game.submit")}
            </button>
          )}
        </div>
      )}

      {/* Back button for non-freetext (when not flashing) */}
      {q.type !== "freetext" && step > 1 && !flashValue && (
        <div className="flex gap-3 mt-6 w-full max-w-xs">
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3 bg-blush-light text-sage font-semibold rounded-xl"
          >
            {t("game.back")}
          </button>
        </div>
      )}
    </div>
  );
}

// --- Results Screen Component ---

function ResultsScreen({
  votes,
  guests,
  name,
  t,
}: {
  votes: Vote[];
  guests: GuestRecord[];
  name: string;
  t: (key: any) => string;
}) {
  // Build a map of guest names to their initial + color
  const guestMap = new Map<string, { initial: string; color: string }>();
  guests.forEach((g) => {
    guestMap.set(g.name, {
      initial: g.name.charAt(0).toUpperCase(),
      color: g.avatar_color || "#2d5a27",
    });
  });

  // Group votes by question key
  const votesByQuestion = new Map<string, Vote[]>();
  votes.forEach((v) => {
    const existing = votesByQuestion.get(v.question_key) || [];
    existing.push(v);
    votesByQuestion.set(v.question_key, existing);
  });

  return (
    <div className="min-h-screen bg-cream px-5 py-10">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-sage/50 text-sm">&larr; {t("common.back")}</Link>

        <div className="text-center mt-4 mb-8">
          <h1 className="text-2xl font-bold text-sage" style={{ fontFamily: "var(--font-serif)" }}>
            {t("game.results")}
          </h1>
          <p className="text-sage/60 text-sm mt-2">{t("game.responses")}</p>
        </div>

        <div className="space-y-6">
          {questions.map((q) => {
            const qVotes = votesByQuestion.get(q.key) || [];
            return (
              <div key={q.key} className="bg-white rounded-2xl shadow-lg p-5">
                <h3 className="text-lg font-bold text-sage mb-4" style={{ fontFamily: "var(--font-serif)" }}>
                  {getQuestionLabel(q.key, t)}
                </h3>
                {q.type === "thisorthat" && q.options && (
                  <ThisOrThatResult votes={qVotes} options={q.options} questionKey={q.key} t={t} />
                )}
                {q.type === "multiplechoice" && q.options && (
                  <MultipleChoiceResult votes={qVotes} options={q.options} questionKey={q.key} t={t} />
                )}
                {q.type === "freetext" && (
                  <FreetextResult votes={qVotes} guestMap={guestMap} t={t} />
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8 mb-4">
          <Link
            href="/"
            className="inline-block py-3 px-8 bg-blush text-sage font-semibold rounded-xl"
          >
            {t("game.backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- Result Sub-Components ---

function ThisOrThatResult({ votes, options, questionKey, t }: { votes: Vote[]; options: string[]; questionKey: string; t: (key: any) => string }) {
  const total = votes.length;
  const countA = votes.filter((v) => v.answer === options[0]).length;
  const countB = total - countA;
  const pctA = total > 0 ? Math.round((countA / total) * 100) : 50;
  const pctB = 100 - pctA;

  return (
    <div>
      <div className="flex justify-between text-xs text-sage/50 uppercase tracking-wider mb-2">
        <span>{getOptionLabel(questionKey, 0, t)}</span>
        <span>{getOptionLabel(questionKey, 1, t)}</span>
      </div>
      <div className="h-8 bg-blush-light rounded-full overflow-hidden flex">
        <div
          className="h-full bg-pink-400 rounded-l-full flex items-center justify-center text-white text-xs font-semibold transition-all duration-700"
          style={{ width: `${pctA}%`, minWidth: total > 0 ? "2rem" : undefined }}
        >
          {total > 0 && `${pctA}%`}
        </div>
        <div
          className="h-full bg-blue-400 rounded-r-full flex items-center justify-center text-white text-xs font-semibold transition-all duration-700"
          style={{ width: `${pctB}%`, minWidth: total > 0 ? "2rem" : undefined }}
        >
          {total > 0 && `${pctB}%`}
        </div>
      </div>
      <div className="flex justify-between text-xs text-sage/50 mt-1">
        <span>{countA} {t("game.votes")}</span>
        <span>{countB} {t("game.votes")}</span>
      </div>
    </div>
  );
}

function MultipleChoiceResult({ votes, options, questionKey, t }: { votes: Vote[]; options: string[]; questionKey: string; t: (key: any) => string }) {
  const total = votes.length;
  const counts = options.map((opt) => votes.filter((v) => v.answer === opt).length);
  const maxCount = Math.max(...counts, 1);

  return (
    <div className="space-y-3">
      {options.map((opt, i) => {
        const count = counts[i];
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const barWidth = total > 0 ? Math.max((count / maxCount) * 100, 4) : 4;
        return (
          <div key={opt}>
            <div className="flex justify-between text-sm text-sage mb-1">
              <span>{getOptionLabel(questionKey, i, t)}</span>
              <span className="text-sage/50 text-xs">{count} ({pct}%)</span>
            </div>
            <div className="h-3 bg-blush-light rounded-full overflow-hidden">
              <div
                className="h-full bg-sage rounded-full transition-all duration-700"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FreetextResult({
  votes,
  guestMap,
  t,
}: {
  votes: Vote[];
  guestMap: Map<string, { initial: string; color: string }>;
  t: (key: any) => string;
}) {
  if (votes.length === 0) {
    return <p className="text-sage/40 text-sm">{t("game.noAnswers")}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {votes.map((v, i) => {
        const guestInfo = guestMap.get(v.guest_name);
        const initial = guestInfo?.initial || v.guest_name.charAt(0).toUpperCase();
        return (
          <div key={`${v.guest_name}-${i}`} className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-sage">{initial}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sage text-sm leading-snug break-words">{v.answer}</p>
              <p className="text-sage/40 text-xs">{v.guest_name}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
