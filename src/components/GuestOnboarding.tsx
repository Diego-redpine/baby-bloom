"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { saveGuest, AVATAR_COLORS, type Guest } from "@/lib/guest";
import { GuestAvatar } from "./GuestAvatar";
import { Facehash } from "facehash";
import { useLanguage } from "@/lib/LanguageContext";

export function GuestOnboarding({ onComplete }: { onComplete: (guest: Guest) => void }) {
  const { t } = useLanguage();
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
      alert(t("common.uploadFailed"));
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("babyshower-photos").getPublicUrl(fileName);
    setCustomUrl(publicUrl);
    setAvatarType("custom");
    setUploading(false);
  }

  const [finishing, setFinishing] = useState(false);

  async function handleFinish() {
    if (finishing) return;
    setFinishing(true);
    const { data, error } = await supabase
      .from("babyshower_guests")
      .insert({
        name: name.trim(),
        avatar_url: avatarType === "custom" ? customUrl : null,
        avatar_color: avatarType === "default" ? selectedColor : null,
      })
      .select()
      .single();

    if (error || !data) {
      alert(t("common.somethingWrong"));
      setFinishing(false);
      return;
    }

    const guest: Guest = {
      id: data.id,
      name: data.name,
      avatar_url: data.avatar_url,
      avatar_color: data.avatar_color,
    };
    saveGuest(guest);
    onComplete(guest);
  }

  if (step === "name") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6">
        <div className="text-4xl mb-4" style={{ fontFamily: "var(--font-calligraphy)", color: "#d4a0a0" }}>*</div>
        <h1 className="text-2xl font-bold text-sage mb-2" style={{ fontFamily: "var(--font-serif)" }}>{t("onboarding.welcome")}</h1>
        <p className="text-sage/60 text-sm mb-8 text-center">
          {t("onboarding.enterName")}
        </p>
        <input
          type="text"
          placeholder={t("onboarding.namePlaceholder")}
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
          {t("onboarding.next")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-bold text-sage mb-2" style={{ fontFamily: "var(--font-serif)" }}>{t("onboarding.chooseLook")}</h1>
      <p className="text-sage/60 text-sm mb-6 text-center">
        {t("onboarding.pickColor")}
      </p>

      {/* Preview */}
      <div className="mb-6">
        <GuestAvatar
          guest={{ name, avatar_url: avatarType === "custom" ? customUrl : null, avatar_color: selectedColor }}
          size={80}
        />
      </div>

      {/* Color options — 8 grid */}
      <p className="text-sage/50 text-xs mb-3 uppercase tracking-wider">{t("onboarding.defaultAvatars")}</p>
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
      <p className="text-sage/50 text-xs mb-3 uppercase tracking-wider">{t("onboarding.orUseOwn")}</p>
      <label className="cursor-pointer mb-6">
        <div className={`py-2.5 px-6 rounded-xl text-center text-sm font-semibold transition-all ${
          avatarType === "custom" && customUrl
            ? "bg-sage text-cream"
            : "bg-blush text-sage border border-blush-dark/20"
        }`}>
          {uploading ? t("onboarding.uploading") : customUrl ? t("onboarding.photoUploaded") : t("onboarding.uploadPhoto")}
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
        disabled={finishing}
        className="w-full max-w-xs py-3 bg-sage text-cream font-semibold rounded-xl transition-opacity disabled:opacity-40"
      >
        {finishing ? t("onboarding.settingUp") : t("onboarding.letsGo")}
      </button>
    </div>
  );
}
