"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getGuest, type Guest } from "@/lib/guest";

type Screen = "loading" | "no-profile" | "prompt" | "recording" | "preview" | "submitting" | "done";
type Mode = "video" | "audio";

export default function CapsulePage() {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState<Screen>("loading");
  const [mode, setMode] = useState<Mode>("video");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);

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
      const existing = getGuest();
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
    if (screen === "recording" && mode === "video" && videoPreviewRef.current && streamRef.current) {
      videoPreviewRef.current.srcObject = streamRef.current;
    }
  }, [screen, mode]);

  // Attach recorded blob to playback element
  useEffect(() => {
    if (screen === "preview" && mode === "video" && videoPlaybackRef.current && recordedBlob) {
      videoPlaybackRef.current.src = createTrackedBlobUrl(recordedBlob);
    }
  }, [screen, mode, recordedBlob, createTrackedBlobUrl]);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  async function startRecording(selectedMode: Mode) {
    // Check if browser supports recording at all
    if (typeof MediaRecorder === "undefined") {
      setPermissionError("Recording is not supported in this browser. Please try using Chrome or Safari.");
      return;
    }

    setMode(selectedMode);
    setPermissionError(null);
    setRecordedBlob(null);
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

      const recorderOptions: MediaRecorderOptions = {};
      if (mimeType) {
        recorderOptions.mimeType = mimeType;
      }

      const recorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blobType = detectedMimeTypeRef.current || (selectedMode === "video" ? "video/webm" : "audio/webm");
        const blob = new Blob(chunksRef.current, {
          type: blobType,
        });
        setRecordedBlob(blob);
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
    } catch {
      setPermissionError(
        selectedMode === "video"
          ? "Camera access was denied. Please allow camera and microphone access in your browser settings and try again."
          : "Microphone access was denied. Please allow microphone access in your browser settings and try again."
      );
      setScreen("prompt");
    }
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
    setRecordedBlob(null);
    setDuration(0);
    startRecording(mode);
  }

  function handleBackToPrompt() {
    stopStream();
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
      alert("Upload failed, please try again.");
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
      alert("Something went wrong, please try again.");
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
          &larr; Back
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
          Profile Needed
        </h1>
        <p className="text-sage/60 text-sm mb-8 text-center max-w-xs">
          Please set up your profile first so we know who left this message.
        </p>
        <Link
          href="/photos"
          className="py-3 px-8 bg-sage text-cream font-semibold rounded-xl"
        >
          Set Up Profile
        </Link>
      </div>
    );
  }

  // Prompt + mode selection
  if (screen === "prompt") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5">
        <Link href="/" className="absolute top-6 left-6 text-sage/50 text-sm">
          &larr; Back
        </Link>
        <h1
          className="text-2xl font-bold text-sage mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Time Capsule
        </h1>
        <p className="text-sage/70 text-sm text-center italic max-w-xs mb-8">
          Leave a message for Adamary y Juan. A wish for the baby, a word for
          the parents, whatever you want them to hear when they&apos;re ready to
          open this.
        </p>

        {permissionError && (
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 max-w-xs">
            <p className="text-red-600 text-sm text-center">{permissionError}</p>
          </div>
        )}

        <div className="w-full max-w-xs flex flex-col gap-4">
          <button
            onClick={() => startRecording("video")}
            className="w-full py-4 bg-white rounded-2xl shadow-lg text-sage font-semibold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            Record Video
          </button>
          <button
            onClick={() => startRecording("audio")}
            className="w-full py-4 bg-white rounded-2xl shadow-lg text-sage font-semibold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            Record Voice Message
          </button>
        </div>
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
            <p className="text-sage/60 text-sm">Recording voice message...</p>
          </div>
        )}

        <p className="text-sage text-2xl font-bold tabular-nums mb-6" style={{ fontFamily: "var(--font-serif)" }}>
          {formatTime(duration)}
        </p>

        <button
          onClick={stopRecording}
          className="w-full max-w-xs py-3 bg-red-500 text-white font-semibold rounded-xl active:scale-[0.98] transition-transform"
        >
          Stop Recording
        </button>
      </div>
    );
  }

  // Preview screen
  if (screen === "preview" && recordedBlob) {
    const blobUrl = createTrackedBlobUrl(recordedBlob);
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5">
        {mode === "video" ? (
          <div className="w-full max-w-xs rounded-2xl overflow-hidden shadow-lg mb-6 bg-black">
            <video
              ref={videoPlaybackRef}
              controls
              playsInline
              className="w-full aspect-[3/4] object-cover"
              src={blobUrl}
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
                <p className="text-sage font-semibold text-sm">Voice Message</p>
                <p className="text-sage/50 text-xs">{formatTime(duration)}</p>
              </div>
            </div>
            <audio controls className="w-full" src={blobUrl} />
          </div>
        )}

        <div className="w-full max-w-xs flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-sage text-cream font-semibold rounded-xl active:scale-[0.98] transition-transform"
          >
            Submit
          </button>
          <button
            onClick={handleRetake}
            className="w-full py-3 bg-blush-light text-sage font-semibold rounded-xl active:scale-[0.98] transition-transform"
          >
            Retake
          </button>
          <button
            onClick={handleBackToPrompt}
            className="w-full py-3 bg-blush text-sage font-semibold rounded-xl active:scale-[0.98] transition-transform"
          >
            Back
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
          Saving your message...
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
          Your message has been saved
        </h1>
        <p className="text-sage/60 text-sm mb-8">
          Adamary y Juan will open it when the time is right.
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

  return null;
}
