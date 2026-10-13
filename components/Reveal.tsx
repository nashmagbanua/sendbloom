"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import BouquetSVG from "./BouquetSVG";
import {
  Bouquet,
  CARD_THEMES,
  FLOWER_META,
  STICKER_META,
} from "@/lib/constants";
import {
  playBloomCelebration,
  playMelodicBackground,
  playRustle,
  playSealBreak,
  stopMelodicBackground,
} from "@/lib/audio";
import {
  Heart,
  Music,
  Volume2,
  VolumeX,
} from "lucide-react";

type PetalSpec = {
  left: number;
  size: number;
  dur: number;
  delay: number;
  color: string;
  drift: number;
};

function makePetals(data: Bouquet): PetalSpec[] {
  const palette = data.f.map((fl) => FLOWER_META[fl.t].colors[fl.c] ?? "#ff8fa3");
  return Array.from({ length: 22 }, (_, i) => ({
    left: Math.random() * 100,
    size: 12 + Math.random() * 14,
    dur: 5 + Math.random() * 5,
    delay: 0.5 + Math.random() * 5,
    color: palette[i % palette.length],
    drift: (Math.random() - 0.5) * 160,
  }));
}

const CONFETTI_COLORS = [
  "#ff8fa3",
  "#ffd166",
  "#ffffff",
  "#c77dff",
  "#ff5d8f",
  "#9be7c4",
  "#ffb703",
  "#f72585",
  "#4cc9f0",
];

export default function Reveal({
  data,
  preview = false,
}: {
  data: Bouquet;
  preview?: boolean;
}) {
  const [opened, setOpened] = useState(false);
  const [flash, setFlash] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [typed, setTyped] = useState("");
  const [runId] = useState(0);
  const [petals, setPetals] = useState<PetalSpec[]>([]);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const [resolvedSong, setResolvedSong] = useState<{
    audioUrl?: string;
    title?: string;
    artist?: string;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPetals(makePetals(data));

    // Pre-resolve song audio stream immediately on mount
    const title = data.st || "";
    const artist = data.sa || "";

    if (title || artist) {
      fetch(`/api/song?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.found && res.audioUrl) {
            setResolvedSong({
              audioUrl: res.audioUrl,
              title: res.title || title,
              artist: res.artist || artist,
            });
            if (audioRef.current) {
              audioRef.current.src = res.audioUrl;
            }
          }
        })
        .catch(() => {});
    }

    return () => {
      timers.current.forEach(clearTimeout);
      cancelAnimationFrame(rafRef.current);
      stopMelodicBackground();
    };
  }, [data]);

  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }, []);

  const burstConfetti = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const parts = Array.from({ length: 190 }, () => {
      const a = Math.random() * Math.PI * 2;
      const sp = 6 + Math.random() * 15;
      return {
        x: W / 2,
        y: H * 0.42,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 7.5,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 5,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.5,
        c: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        round: Math.random() < 0.4,
      };
    });

    cancelAnimationFrame(rafRef.current);
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of parts) {
        p.vy += 0.28;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y < H + 30) {
          alive++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.c;
          if (p.round) {
            ctx.beginPath();
            ctx.arc(0, 0, p.h, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          }
          ctx.restore();
        }
      }
      if (alive > 0) rafRef.current = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const openGift = () => {
    if (opened) return;

    // 1. Break wax seal & play snap sound
    playSealBreak();
    setTimeout(playRustle, 180);
    try {
      navigator.vibrate?.([30, 50, 40]);
    } catch {}

    // 2. Play music immediately within user tap handler
    setIsPlayingMusic(true);
    const audioEl = audioRef.current;
    if (audioEl && (audioEl.src || resolvedSong?.audioUrl)) {
      if (!audioEl.src && resolvedSong?.audioUrl) {
        audioEl.src = resolvedSong.audioUrl;
      }
      audioEl.play().catch(() => {
        // Fallback to synthesized melody if external audio is blocked
        playMelodicBackground();
      });
    } else {
      // Play sweet synthesized acoustic chord melody
      playMelodicBackground();
    }

    // 3. Trigger reveal animations & confetti
    setOpened(true);
    setFlash(true);
    later(() => setFlash(false), 700);
    playBloomCelebration();

    if (!reduced.current) {
      burstConfetti();
    }

    // 4. Reveal handwritten letter with typing effect
    later(() => {
      setShowNote(true);
      const full = data.msg || "";
      if (!full || reduced.current) {
        setTyped(full);
        return;
      }
      let i = 0;
      const step = () => {
        i += 2;
        setTyped(full.slice(0, i));
        if (i < full.length) later(step, 24);
      };
      step();
    }, 700);
  };

  const toggleMute = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
    if (nextMuted) {
      stopMelodicBackground();
    }
  };

  const currentTheme = CARD_THEMES[data.c || "classic"] || CARD_THEMES.classic;
  const stickerItem = STICKER_META[data.k || "heart"] || STICKER_META.heart;

  return (
    <div className="reveal-page-wrapper">
      {/* Hidden audio element for instant music playback upon wax seal tap */}
      <audio
        ref={audioRef}
        preload="auto"
        loop
        style={{ display: "none" }}
      />

      {/* Floating Petals */}
      {opened &&
        petals.map((p, i) => (
          <span
            key={`pet-${runId}-${i}`}
            className="petal"
            style={
              {
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size * 1.3}px`,
                background: `radial-gradient(ellipse at 35% 35%, ${p.color}, #a02040)`,
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
                "--drift": `${p.drift}px`,
              } as React.CSSProperties
            }
          />
        ))}

      {/* Confetti Canvas */}
      <canvas ref={canvasRef} className="reveal-confetti-canvas" />

      {/* Subtle Glow Backdrop */}
      <div className="reveal-ambient-glow" />

      {/* Preview indicator if preview mode */}
      {preview && (
        <div className="reveal-top-bar">
          <div className="preview-indicator-badge">
            <span>👁️ Preview Mode</span>
            <Link href="/" className="preview-return-link">
              Bumalik sa Paggawa ➔
            </Link>
          </div>
        </div>
      )}

      {/* MAIN PRESENTATION CONTAINER */}
      <div className="revealed-content-stage">
        {flash && <div className="reveal-flash-effect" />}

        {/* Recipient Header */}
        <div className="recipient-greeting-header">
          <span className="greeting-sub">May espesyal na padala para kay</span>
          <h1 className="greeting-title">{data.to ? data.to : "sa Iyo"} 💐</h1>
          {data.from && (
            <span className="from-label block mt-1 opacity-80">mula kay {data.from}</span>
          )}
        </div>

        {/* Full Bouquet (Always prominently visible upon opening the link, never hidden!) */}
        <div className="blooming-bouquet-display mt-2">
          <BouquetSVG data={{ f: data.f, w: data.w }} animated={false} />
        </div>

        {/* WAX SEAL (Selyo) on envelope/card (Unopened state) */}
        {!opened && (
          <div className="wax-seal-hero-wrap mt-4">
            <button
              type="button"
              className="wax-seal-badge pulse-seal"
              onClick={openGift}
              aria-label="Pindutin ang wax seal para basahin ang liham"
            >
              <span className="seal-emblem">{stickerItem.icon}</span>
            </button>
            <span className="seal-hint-label mt-2">
              Pindutin ang Wax Seal para basahin ang liham 💌
            </span>
          </div>
        )}

        {/* Now Playing Music Indicator (Plays immediately upon tapping wax seal) */}
        {opened && isPlayingMusic && (
          <div className="subtle-now-playing-badge mt-3">
            <button
              type="button"
              onClick={toggleMute}
              className="music-mute-toggle-btn inline-flex items-center gap-1.5"
              title={isAudioMuted ? "I-unmute" : "I-mute"}
            >
              <Music size={14} className="inline animate-spin" />
              <span>
                Tumutugtog: {resolvedSong?.title || data.st || "Himig ng Pag-ibig"}
                {(resolvedSong?.artist || data.sa) ? ` · ${resolvedSong?.artist || data.sa}` : ""}
              </span>
              {isAudioMuted ? <VolumeX size={13} className="ml-1" /> : <Volume2 size={13} className="ml-1" />}
            </button>
          </div>
        )}

        {/* Handwritten Letter (Revealed upon tapping wax seal) */}
        {opened && showNote && (data.msg || data.from || data.to) && (
          <div
            className="handwritten-letter-card"
            style={{
              background: currentTheme.bg,
              color: currentTheme.text,
              borderColor: currentTheme.border,
            }}
          >
            <div className="letter-stamp-corner" title={stickerItem.label}>
              {stickerItem.icon}
            </div>

            {data.to && (
              <div
                className="letter-to-line"
                style={{ color: currentTheme.accent }}
              >
                Mahal kong {data.to},
              </div>
            )}

            {data.msg && (
              <div className="letter-body-text">
                {typed}
                {typed.length < (data.msg || "").length && (
                  <span className="typing-cursor">|</span>
                )}
              </div>
            )}

            {data.from && (
              <div
                className="letter-signature-line"
                style={{ color: currentTheme.accent }}
              >
                Nagmamahal,<br />
                <span>{data.from}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions: Opens new browser tab to make their own bouquet */}
        {opened && (
          <div className="reveal-footer-actions">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="action-pill-btn primary"
            >
              <Heart size={15} className="inline mr-1 text-pink-500 fill-pink-500" />
              Gumawa rin ng Sariling Bouquet ➔
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
