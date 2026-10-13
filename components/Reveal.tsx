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
  playRustle,
  playSealBreak,
} from "@/lib/audio";
import {
  RotateCcw,
  Heart,
  Music,
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
  const [runId, setRunId] = useState(0);
  const [petals, setPetals] = useState<PetalSpec[]>([]);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [reactions, setReactions] = useState<{ id: number; x: number; y: number }[]>([]);
  const [reactionCount, setReactionCount] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduced = useRef(false);

  // Extract YouTube ID if song is a YouTube link
  let ytId: string | null = null;
  if (data.s) {
    const ytMatch = data.s.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      ytId = ytMatch[1];
    }
  }

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPetals(makePetals(data));
    return () => {
      timers.current.forEach(clearTimeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [data]);

  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }, []);

  const sendHeartReaction = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const newHeart = {
      id: Date.now() + Math.random(),
      x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 60,
      y: rect.top,
    };
    setReactions((prev) => [...prev.slice(-20), newHeart]);
    setReactionCount((c) => c + 1);
    playBloomCelebration();
    try {
      navigator.vibrate?.(25);
    } catch {}
  };

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

    // 2. Play background music immediately
    setIsPlayingMusic(true);

    // 3. Trigger open animations & confetti
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
    }, 800);
  };

  const replay = () => {
    timers.current.forEach(clearTimeout);
    cancelAnimationFrame(rafRef.current);
    const cv = canvasRef.current;
    if (cv) {
      const ctx = cv.getContext("2d");
      ctx?.clearRect(0, 0, cv.width, cv.height);
    }
    setOpened(false);
    setShowNote(false);
    setFlash(false);
    setTyped("");
    setIsPlayingMusic(false);
    setRunId((n) => n + 1);
  };

  const currentTheme = CARD_THEMES[data.c || "classic"] || CARD_THEMES.classic;
  const stickerItem = STICKER_META[data.k || "heart"] || STICKER_META.heart;

  return (
    <div className="reveal-page-wrapper">
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

      {/* Hidden background audio when opened */}
      {isPlayingMusic && ytId && (
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&enablejsapi=1&loop=1`}
          style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
          allow="autoplay"
          title="Background music"
        />
      )}
      {isPlayingMusic && data.s && !ytId && (
        <audio src={data.s} autoPlay loop style={{ display: "none" }} />
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

        {/* Full Bouquet (Always prominently visible, never hidden) */}
        <div className="blooming-bouquet-display mt-2">
          <BouquetSVG data={{ f: data.f, w: data.w }} animated={opened} />
        </div>

        {/* WAX SEAL ON CARD / ENVELOPE BUTTON (Unopened state) */}
        {!opened && (
          <div className="wax-seal-hero-wrap mt-4">
            <button
              type="button"
              className="wax-seal-badge pulse-seal"
              onClick={openGift}
              aria-label="Pindutin ang wax seal para buksan ang sulat"
            >
              <span className="seal-emblem">{stickerItem.icon}</span>
            </button>
            <span className="seal-hint-label mt-2">
              Pindutin ang Wax Seal para basahin ang liham 💌
            </span>
          </div>
        )}

        {/* Now Playing Indicator (Subtle, no ugly video box) */}
        {opened && isPlayingMusic && (
          <div className="subtle-now-playing-badge mt-3">
            <Music size={14} className="inline mr-1 animate-spin" />
            <span>Tumutugtog ang kalakip na kanta 🎶</span>
          </div>
        )}

        {/* Handwritten Letter (Reveals upon tapping wax seal) */}
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

        {/* Heart Reaction Shower (When opened) */}
        {opened && (
          <div className="reaction-card-box">
            <button
              type="button"
              className="heart-reaction-btn pulse-glow"
              onClick={sendHeartReaction}
              aria-label="Pusuan ang natanggap na bouquet"
            >
              <Heart size={18} className="inline text-rose-500 fill-rose-500 mr-2" />
              <span>Pusuan / I-react ({reactionCount})</span>
            </button>
            <span className="reaction-hint">I-tap para magpadala ng lumilipad na puso! 💖</span>
          </div>
        )}

        {/* Footer Actions */}
        {opened && (
          <div className="reveal-footer-actions">
            <button
              type="button"
              className="action-pill-btn secondary"
              onClick={replay}
            >
              <RotateCcw size={15} className="inline mr-1" />
              Buksan Muli
            </button>

            <Link href="/" className="action-pill-btn primary">
              <Heart size={15} className="inline mr-1 text-pink-500" />
              Gumawa rin ng Sariling Bouquet
            </Link>
          </div>
        )}
      </div>

      {/* Floating Reaction Hearts */}
      {reactions.map((h) => (
        <span
          key={h.id}
          className="floating-heart-burst"
          style={{ left: `${h.x}px`, top: `${h.y}px` }}
        >
          💖
        </span>
      ))}
    </div>
  );
}
