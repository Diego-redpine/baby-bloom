"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getValidatedGuest, type Guest } from "@/lib/guest";
import { useLanguage } from "@/lib/LanguageContext";

type Screen = "loading" | "no-profile" | "prompt" | "ready" | "recording" | "preview" | "submitting" | "done";
type Mode = "video" | "audio";

export default function CapsulePage() {
  const { t } = useLanguage();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState<Screen>("loading");
  const [mode, setMode] = useState<Mode>("video");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const videoPlaybackRef = useRef<HTMLVideoElement | null>(null);
  const detectedMimeTypeRef = useRef<string>("");
  const blobUrlsRef = useRef<string[]>([]);

  // Revoke all tracked blob URLs
  const revokeBlobUrls = useCallback(() => {
    blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    blobUrlsRef.current = [];
  }, []);

  // Create a blob URL and track it for cleanup
  const createTrackedBlobUrl = useCallback((blob: Blob) => {
    revokeBlobUrls();
    const url = URL.createObjectURL(blob);
    blobUrlsRef.current.push(url);
    return url;
  }, [revokeBlobUrls]);

  // Cleanup helper
  const stopStream = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }, []);

  // Check identity on mount
  useEffect(() => {
    async function init() {
      const existing = await getValidatedGuest();
      if (!existing) {
        setScreen("no-profile");
        setLoaded(true);
        return;
      }
      setGuest(existing);

      // Check if already submitted
      const { data } = await supabase
        .from("babyshower_capsule_messages")
        .select("id")
        .eq("guest_id", existing.id)
        .limit(1);

      if (data && data.length > 0) {
        setScreen("done");
      } else {
        setScreen("prompt");
      }
      setLoaded(true);
    }
    init();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
      revokeBlobUrls();
    };
  }, [stopStream, revokeBlobUrls]);

  // Attach live stream to video preview element
  useEffect(() => {
    if ((screen === "ready" || screen === "recording") && mode === "video" && videoPreviewRef.current && streamRef.current) {
      videoPreviewRef.current.srcObject = streamRef.current;
    }
  }, [screen, mode]);

  // Revoke preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // Step 1: Set up camera/mic stream and go to "ready" screen
  async function prepareStream(selectedMode: Mode) {
    if (typeof MediaRecorder === "undefined") {
      setPermissionError(t("capsule.notSupported"));
      return;
    }

    setMode(selectedMode);
    setPermissionError(null);
    setRecordedBlob(null);
    setPreviewUrl(null);
    setDuration(0);
    chunksRef.current = [];

    const constraints =
      selectedMode === "video"
        ? { video: true, audio: true }
        : { audio: true };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Detect supported MIME type (Safari doesn't support webm)
      let mimeType = "";
      if (selectedMode === "video") {
        if (typeof MediaRecorder.isTypeSupported === "function") {
          if (MediaRecorder.isTypeSupported("video/webm")) {
            mimeType = "video/webm";
          } else if (MediaRecorder.isTypeSupported("video/mp4")) {
            mimeType = "video/mp4";
          }
        }
      } else {
        if (typeof MediaRecorder.isTypeSupported === "function") {
          if (MediaRecorder.isTypeSupported("audio/webm")) {
            mimeType = "audio/webm";
          } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
            mimeType = "audio/mp4";
          } else if (MediaRecorder.isTypeSupported("audio/aac")) {
            mimeType = "audio/aac";
          }
        }
      }
      detectedMimeTypeRef.current = mimeType;

      setScreen("ready");
    } catch {
      setPermissionError(
        selectedMode === "video"
          ? t("capsule.cameraError")
          : t("capsule.micError")
      );
      setScreen("prompt");
    }
  }

  // Step 2: Actually start recording (user taps red button)
  function beginRecording() {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const recorderOptions: MediaRecorderOptions = {};
    if (detectedMimeTypeRef.current) {
      recorderOptions.mimeType = detectedMimeTypeRef.current;
    }

    const recorder = new MediaRecorder(streamRef.current, recorderOptions);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blobType = detectedMimeTypeRef.current || (mode === "video" ? "video/webm" : "audio/webm");
      const blob = new Blob(chunksRef.current, {
        type: blobType,
      });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);
      setPreviewUrl(url);
      setScreen("preview");
    };

    recorder.start();
    setScreen("recording");

    // Start timer with 120s max duration
    const MAX_DURATION = 120;
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setDuration(elapsed);
      if (elapsed >= MAX_DURATION) {
        stopRecording();
      }
    }, 1000);
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }

  function handleRetake() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setRecordedBlob(null);
    setDuration(0);
    prepareStream(mode);
  }

  function handleBackToPrompt() {
    stopStream();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setRecordedBlob(null);
    setDuration(0);
    setPermissionError(null);
    setScreen("prompt");
  }

  async function handleSubmit() {
    if (!recordedBlob || !guest || screen === "submitting") return;
    setScreen("submitting");

    // Determine file extension from detected MIME type
    const mimeToExt: Record<string, string> = {
      "video/webm": "webm",
      "video/mp4": "mp4",
      "audio/webm": "webm",
      "audio/mp4": "mp4",
      "audio/aac": "aac",
    };
    const ext = mimeToExt[detectedMimeTypeRef.current] || "webm";
    const fileName = `capsule-${guest.id}-${Date.now()}.${ext}`;
    const mediaType = mode === "video" ? "video" : "audio";

    const { error: uploadError } = await supabase.storage
      .from("babyshower-capsule")
      .upload(fileName, recordedBlob);

    if (uploadError) {
      alert(t("common.uploadFailed"));
      setScreen("preview");
      return;
    }

    const { error: insertError } = await supabase.from("babyshower_capsule_messages").insert({
      guest_id: guest.id,
      guest_name: guest.name,
      media_type: mediaType,
      storage_path: fileName,
      duration_seconds: duration,
    });

    if (insertError) {
      alert(t("common.somethingWrong"));
      setScreen("preview");
      return;
    }

    setScreen("done");
  }

  if (!loaded) return null;

  // No profile screen
  if (screen === "no-profile") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5">
        <Link href="/" className="absolute top-6 left-6 text-sage/50 text-sm">
          &larr; {t("common.back")}
        </Link>
        <div className="w-14 h-14 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h1
          className="text-2xl font-bold text-sage mb-2"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {t("capsule.noProfile")}
        </h1>
        <p className="text-sage/60 text-sm mb-8 text-center max-w-xs">
          {t("capsule.noProfileDesc")}
        </p>
        <Link
          href="/photos"
          className="py-3 px-8 bg-sage text-cream font-semibold rounded-xl"
        >
          {t("capsule.goToPhotos")}
        </Link>
      </div>
    );
  }

  // Prompt + mode selection
  if (screen === "prompt") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5">
        <Link href="/" className="absolute top-6 left-6 text-sage/50 text-sm">
          &larr; {t("common.back")}
        </Link>
        <h1
          className="text-2xl font-bold text-sage mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {t("capsule.title")}
        </h1>
        <p className="text-sage/70 text-sm text-center italic max-w-xs mb-8">
          {t("capsule.prompt")}
        </p>

        {permissionError && (
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 max-w-xs">
            <p className="text-red-600 text-sm text-center">{permissionError}</p>
          </div>
        )}

        <div className="w-full max-w-xs flex flex-col gap-4">
          <button
            onClick={() => prepareStream("video")}
            className="w-full py-4 bg-white rounded-2xl shadow-lg text-sage font-semibold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            {t("capsule.recordVideo")}
          </button>
          <button
            onClick={() => prepareStream("audio")}
            className="w-full py-4 bg-white rounded-2xl shadow-lg text-sage font-semibold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            {t("capsule.recordVoice")}
          </button>
        </div>
      </div>
    );
  }

  // Ready screen — stream is live, waiting to record
  if (screen === "ready") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5">
        {mode === "video" ? (
          <div className="w-full max-w-xs rounded-2xl overflow-hidden shadow-lg mb-6 bg-black">
            <video
              ref={videoPreviewRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-[3/4] object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>
        ) : (
          <div className="mb-6 flex flex-col items-center">
            <div className="w-28 h-28 rounded-full bg-sage/10 flex items-center justify-center mb-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <p className="text-sage/50 text-sm">{t("capsule.recordVoice")}</p>
          </div>
        )}

        {/* Big red record button */}
        <button
          onClick={beginRecording}
          className="w-16 h-16 rounded-full bg-red-500 border-4 border-white shadow-lg flex items-center justify-center mb-4 hover:scale-105 active:scale-95 transition-transform"
        >
          <div className="w-6 h-6 rounded-full bg-white" />
        </button>
        <p className="text-sage/50 text-xs mb-6">{t("capsule.tapToRecord")}</p>

        <button
          onClick={handleBackToPrompt}
          className="text-sage/50 text-sm"
        >
          &larr; {t("common.back")}
        </button>
      </div>
    );
  }

  // Recording screen
  if (screen === "recording") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5">
        {mode === "video" ? (
          <div className="w-full max-w-xs rounded-2xl overflow-hidden shadow-lg mb-6 bg-black">
            <video
              ref={videoPreviewRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-[3/4] object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>
        ) : (
          <div className="mb-6 flex flex-col items-center">
            <div className="w-28 h-28 rounded-full bg-sage/10 flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-sage/20 animate-pulse flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </div>
            </div>
            <p className="text-sage/60 text-sm">{t("capsule.recording")}</p>
          </div>
        )}

        <p className="text-sage text-2xl font-bold tabular-nums mb-6" style={{ fontFamily: "var(--font-serif)" }}>
          {formatTime(duration)}
        </p>

        <button
          onClick={stopRecording}
          className="w-full max-w-xs py-3 bg-red-500 text-white font-semibold rounded-xl active:scale-[0.98] transition-transform"
        >
          {t("capsule.stopRecording")}
        </button>
      </div>
    );
  }

  // Preview screen
  if (screen === "preview" && recordedBlob && previewUrl) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5">
        {mode === "video" ? (
          <div className="w-full max-w-xs rounded-2xl overflow-hidden shadow-lg mb-6 bg-black">
            <video
              ref={videoPlaybackRef}
              controls
              playsInline
              className="w-full aspect-[3/4] object-cover"
              src={previewUrl}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </div>
              <div>
                <p className="text-sage font-semibold text-sm">{t("capsule.voiceMessage")}</p>
                <p className="text-sage/50 text-xs">{formatTime(duration)}</p>
              </div>
            </div>
            <audio controls className="w-full" src={previewUrl} />
          </div>
        )}

        <div className="w-full max-w-xs flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-sage text-cream font-semibold rounded-xl active:scale-[0.98] transition-transform"
          >
            {t("capsule.submitBtn")}
          </button>
          <button
            onClick={handleRetake}
            className="w-full py-3 bg-blush-light text-sage font-semibold rounded-xl active:scale-[0.98] transition-transform"
          >
            {t("capsule.retake")}
          </button>
          <button
            onClick={handleBackToPrompt}
            className="w-full py-3 bg-blush text-sage font-semibold rounded-xl active:scale-[0.98] transition-transform"
          >
            {t("capsule.changeModeBtn")}
          </button>
        </div>
      </div>
    );
  }

  // Submitting screen
  if (screen === "submitting") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5">
        <p className="text-sage text-lg font-semibold animate-pulse" style={{ fontFamily: "var(--font-serif)" }}>
          {t("capsule.uploading")}
        </p>
      </div>
    );
  }

  // Done screen
  if (screen === "done") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1
          className="text-2xl font-bold text-sage mb-2"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {t("capsule.doneTitle")}
        </h1>
        <p className="text-sage/60 text-sm mb-8">
          {t("capsule.doneSubtitle")}
        </p>
        <Link
          href="/"
          className="py-3 px-8 bg-blush text-sage font-semibold rounded-xl"
        >
          {t("capsule.backHome")}
        </Link>
      </div>
    );
  }

  return null;
}
