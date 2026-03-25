"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const questions = [
  { key: "birth_date", label: "When will the baby be born?", type: "date", icon: "" },
  { key: "birth_weight", label: "How much will the baby weigh?", type: "text", placeholder: "e.g. 7 lbs 4 oz", icon: "" },
  { key: "baby_name", label: "What will baby's name be?", type: "text", placeholder: "Your guess...", icon: "" },
  { key: "looks_like", label: "Who will baby look like?", type: "text", placeholder: "Mom, Dad, or...", icon: "" },
  { key: "birth_time", label: "What time will baby be born?", type: "time", icon: "" },
];

export default function GamePage() {
  const [step, setStep] = useState(0); // 0 = name entry, 1-5 = questions, 6 = done
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    await supabase.from("babyshower_guesses").insert({
      guest_name: name,
      ...answers,
    });
    setStep(questions.length + 1);
    setSubmitting(false);
  }

  // Name entry
  if (step === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6">
        <Link href="/" className="absolute top-6 left-6 text-sage/50 text-sm">&larr; Back</Link>
        <div className="w-10 h-10 rounded-full bg-sage/10 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-sage mb-2">Baby Guessing Game</h1>
        <p className="text-sage/60 text-sm mb-8 text-center">
          Answer 5 questions about the baby!
        </p>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full max-w-xs py-3 px-4 rounded-xl border-2 border-blush bg-white text-sage text-center text-lg focus:outline-none focus:border-sage transition-colors"
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
        <div className="w-12 h-12 rounded-full bg-blush mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-sage mb-2">Thanks, {name}!</h1>
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
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6">
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
      <div className="w-full max-w-xs bg-white rounded-2xl shadow-lg p-6 text-center">
        <div className="text-4xl mb-3">{q.icon}</div>
        <h2 className="text-lg font-bold text-sage mb-4">{q.label}</h2>

        {q.type === "date" ? (
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
          />
        )}
      </div>

      {/* Navigation */}
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
    </div>
  );
}
