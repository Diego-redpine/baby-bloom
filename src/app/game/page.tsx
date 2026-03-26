"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getGuest, type Guest } from "@/lib/guest";

const questions = [
  { key: "birth_date", label: "When will the baby be born?", type: "date" },
  { key: "birth_weight", label: "How much will the baby weigh?", type: "text", placeholder: "e.g. 7 lbs 4 oz" },
  { key: "baby_name", label: "What will baby's name be?", type: "text", placeholder: "Your guess..." },
  { key: "looks_like", label: "Who will the baby look like more?", type: "choice" },
  { key: "birth_time", label: "What time will baby be born?", type: "time" },
];

export default function GamePage() {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState(0); // 0 = name entry (if no guest), 1-5 = questions, 6 = done
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [choiceFlash, setChoiceFlash] = useState<string | null>(null);

  // Check for existing guest identity on mount
  useEffect(() => {
    const existing = getGuest();
    if (existing) {
      setGuest(existing);
      setName(existing.name);
      setStep(1); // Skip name entry, go straight to questions
    }
    setLoaded(true);
  }, []);

  async function handleSubmit() {
    setSubmitting(true);
    await supabase.from("babyshower_guesses").insert({
      guest_name: name,
      ...answers,
    });
    setStep(questions.length + 1);
    setSubmitting(false);
  }

  function handleChoiceSelect(value: string) {
    setChoiceFlash(value);
    setAnswers((prev) => ({ ...prev, looks_like: value }));
    // Flash the color briefly, then advance
    setTimeout(() => {
      setChoiceFlash(null);
      setStep(step + 1);
    }, 600);
  }

  if (!loaded) return null;

  // Name entry — only shown if no existing guest identity
  if (step === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5">
        <Link href="/" className="absolute top-6 left-6 text-sage/50 text-sm">&larr; Back</Link>
        <div className="w-10 h-10 rounded-full bg-sage/10 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-sage mb-2" style={{ fontFamily: "var(--font-serif)" }}>Baby Guessing Game</h1>
        <p className="text-sage/60 text-sm mb-8 text-center">
          Answer 5 questions about the baby!
        </p>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full max-w-xs py-3 px-4 rounded-xl border-2 border-blush bg-white text-sage text-center text-lg focus:outline-none focus:border-sage transition-colors"
          autoFocus
        />
        <button
          onClick={() => name.trim() && setStep(1)}
          disabled={!name.trim()}
          className="mt-4 w-full max-w-xs py-3 bg-sage text-cream font-semibold rounded-xl disabled:opacity-40 transition-opacity"
        >
          Let&apos;s Go!
        </button>
      </div>
    );
  }

  // Done screen
  if (step > questions.length) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 className="text-2xl font-bold text-sage mb-2" style={{ fontFamily: "var(--font-serif)" }}>Thanks, {name}!</h1>
        <p className="text-sage/60 mb-8">
          Your guesses have been submitted. We&apos;ll reveal the results at the party!
        </p>
        <Link
          href="/"
          className="py-3 px-8 bg-blush text-sage font-semibold rounded-xl"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  // Question cards
  const q = questions[step - 1];
  const currentAnswer = answers[q.key] || "";

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5">
      {/* Progress */}
      <div className="w-full max-w-xs mb-8">
        <div className="flex justify-between text-xs text-sage/50 mb-2">
          <span>{name}</span>
          <span>{step} of {questions.length}</span>
        </div>
        <div className="h-2 bg-blush-light rounded-full overflow-hidden">
          <div
            className="h-full bg-sage rounded-full transition-all duration-500"
            style={{ width: `${(step / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="w-full max-w-xs bg-white rounded-2xl shadow-lg p-5 text-center overflow-hidden">
        <h2 className="text-lg font-bold text-sage mb-4" style={{ fontFamily: "var(--font-serif)" }}>{q.label}</h2>

        {q.type === "choice" ? (
          /* Adamary or Juan — A/B choice with color flash */
          <div className="flex gap-3">
            <button
              onClick={() => handleChoiceSelect("Adamary")}
              disabled={choiceFlash !== null}
              className={`flex-1 py-4 rounded-xl font-semibold text-base transition-all duration-300 ${
                choiceFlash === "Adamary"
                  ? "bg-pink-400 text-white scale-105 shadow-md"
                  : currentAnswer === "Adamary"
                  ? "bg-pink-100 text-pink-700 border-2 border-pink-300"
                  : "bg-cream text-sage border-2 border-blush hover:border-pink-300"
              }`}
            >
              Adamary
            </button>
            <button
              onClick={() => handleChoiceSelect("Juan")}
              disabled={choiceFlash !== null}
              className={`flex-1 py-4 rounded-xl font-semibold text-base transition-all duration-300 ${
                choiceFlash === "Juan"
                  ? "bg-blue-400 text-white scale-105 shadow-md"
                  : currentAnswer === "Juan"
                  ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                  : "bg-cream text-sage border-2 border-blush hover:border-blue-300"
              }`}
            >
              Juan
            </button>
          </div>
        ) : q.type === "date" ? (
          <input
            type="date"
            value={currentAnswer}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))
            }
            className="w-full py-3 px-4 rounded-xl border-2 border-blush bg-cream text-sage text-center focus:outline-none focus:border-sage transition-colors"
          />
        ) : q.type === "time" ? (
          <input
            type="time"
            value={currentAnswer}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))
            }
            className="w-full py-3 px-4 rounded-xl border-2 border-blush bg-cream text-sage text-center focus:outline-none focus:border-sage transition-colors"
          />
        ) : (
          <input
            type="text"
            placeholder={q.placeholder}
            value={currentAnswer}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))
            }
            className="w-full py-3 px-4 rounded-xl border-2 border-blush bg-cream text-sage text-center focus:outline-none focus:border-sage transition-colors"
            autoFocus
          />
        )}
      </div>

      {/* Navigation — hidden during choice flash, and skip Next for choice type */}
      {q.type !== "choice" && (
        <div className="flex gap-3 mt-6 w-full max-w-xs">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 bg-blush-light text-sage font-semibold rounded-xl"
            >
              Back
            </button>
          )}
          {step < questions.length ? (
            <button
              onClick={() => currentAnswer.trim() && setStep(step + 1)}
              disabled={!currentAnswer.trim()}
              className="flex-1 py-3 bg-sage text-cream font-semibold rounded-xl disabled:opacity-40 transition-opacity"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!currentAnswer.trim() || submitting}
              className="flex-1 py-3 bg-sage text-cream font-semibold rounded-xl disabled:opacity-40 transition-opacity"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      )}

      {/* Back button still available during choice question */}
      {q.type === "choice" && step > 1 && !choiceFlash && (
        <div className="flex gap-3 mt-6 w-full max-w-xs">
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3 bg-blush-light text-sage font-semibold rounded-xl"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
