"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import BouquetSVG from "./BouquetSVG";
import MusicPlayer from "./MusicPlayer";
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
  setSoundMuted,
} from "@/lib/audio";
import {
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Share2,
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
  const [flapOpen, setFlapOpen] = useState(false);
  const [flash, setFlash] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [typed, setTyped] = useState("");
  const [runId, setRunId] = useState(0);
  const [petals, setPetals] = useState<PetalSpec[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reactions, setReactions] = useState<{ id: number; x: number; y: number }[]>([]);
  const [reactionCount, setReactionCount] = useState(0);

  const sendHeartReaction = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const newHeart = {
      id: Date.now() + Math.random(),
      x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 60,
      y: rect.top,
    };
    setReactions((prev) => [...prev.slice(-20), newHeart]);
    setReactionCount((c) => c + 1);
    if (soundEnabled) playBloomCelebration();
    try {
      navigator.vibrate?.(25);
    } catch {}
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduced = useRef(false);

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

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setSoundMuted(!next);
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

    // 1. Break wax seal & audio
    if (soundEnabled) {
      playSealBreak();
      setTimeout(playRustle, 180);
    }
    try {
      navigator.vibrate?.([30, 50, 40]);
    } catch {}

    setFlapOpen(true);

    // 2. Open envelope flap, flash, and bloom bouquet
    later(() => {
      setOpened(true);
      setFlash(true);
      later(() => setFlash(false), 700);

      if (soundEnabled) {
        playBloomCelebration();
      }

      if (!reduced.current) {
        burstConfetti();
      }
    }, 450);

    // 3. Reveal handwritten letter with typing effect
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
    }, 1200);
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
    setFlapOpen(false);
    setShowNote(false);
    setFlash(false);
    setTyped("");
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

      {/* Top Controls Bar */}
      <div className="reveal-top-bar">
        {preview && (
          <div className="preview-indicator-badge">
            <span>👁️ Ikaw ay nasa Preview Mode</span>
            <Link href="/" className="preview-return-link">
              Bumalik sa Paggawa ➔
            </Link>
          </div>
        )}
        <div className="controls-right-group">
          <button
            type="button"
            className="sound-control-pill"
            onClick={toggleSound}
            aria-label={soundEnabled ? "I-mute ang tunog" : "I-on ang tunog"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{soundEnabled ? "May Tunog" : "Naka-mute"}</span>
          </button>
        </div>
      </div>

      {/* UNOPENED ENVELOPE STAGE */}
      {!opened && (
        <div className="envelope-hero-box">
          <div className="envelope-recipient-badge">
            <span className="for-label">May espesyal na padala para kay:</span>
            <h1 className="for-name">{data.to ? data.to : "sa Iyo"}</h1>
            {data.from && (
              <span className="from-label">mula kay {data.from}</span>
            )}
          </div>

          {/* Interactive Envelope Container */}
          <div
            className={`interactive-envelope-3d ${flapOpen ? "flap-open" : ""}`}
            onClick={openGift}
            role="button"
            tabIndex={0}
            aria-label="Pindutin para buksan ang sobre"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") openGift();
            }}
          >
            <div className="envelope-back-pocket" />

            <div className="envelope-bouq-peek">
              <BouquetSVG data={{ f: data.f, w: data.w }} />
            </div>

            <div className="envelope-front-pocket" />

            {/* Envelope Top Flap */}
            <div className="envelope-top-flap" />

            {/* Wax Seal / Stamp Button */}
            <div className="wax-seal-button-wrap">
              <button
                type="button"
                className="wax-seal-badge pulse-seal"
                aria-label="Buksan ang wax seal"
              >
                <span className="seal-emblem">{stickerItem.icon}</span>
              </button>
            </div>
          </div>

          <div className="tap-instruction-card">
            <button
              type="button"
              className="open-action-btn pulse-button"
              onClick={openGift}
            >
              <Sparkles size={18} className="inline mr-2" />
              Pindutin para Bumukadkad
            </button>
            <span className="tap-hint-text">
              I-tap ang Wax Seal o ang buton sa itaas
            </span>
          </div>
        </div>
      )}

      {/* OPENED BOUQUET & NOTE STAGE */}
      {opened && (
        <div className="revealed-content-stage">
          {flash && <div className="reveal-flash-effect" />}

          <div className="recipient-greeting-header">
            <span className="greeting-sub">Para kay</span>
            <h1 className="greeting-title">{data.to || "sa Iyo"} 💐</h1>
          </div>

          {/* Flowering Stage */}
          <div className="blooming-bouquet-display">
            <BouquetSVG data={{ f: data.f, w: data.w }} animated={true} />
          </div>

          {/* Music Player (If song attached) */}
          {data.s && (
            <div className="song-widget-wrapper">
              <MusicPlayer url={data.s} />
            </div>
          )}

          {/* Handwritten Letter / Note */}
          {showNote && (data.msg || data.from || data.to) && (
            <div
              className="handwritten-letter-card"
              style={{
                background: currentTheme.bg,
                color: currentTheme.text,
                borderColor: currentTheme.border,
              }}
            >
              <div
                className="letter-stamp-corner"
                title={stickerItem.label}
              >
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

          {/* Interactive Heart Shower Reaction */}
          <div className="reaction-card-box">
            <button
              type="button"
              className="heart-reaction-btn pulse-glow"
              onClick={sendHeartReaction}
              aria-label="Pusuan ang natanggap na bouquet"
            >
              <Heart size={20} className="inline text-rose-500 fill-rose-500 mr-2" />
              <span>Pusuan / I-react ({reactionCount})</span>
            </button>
            <span className="reaction-hint">I-tap para magpadala ng lumilipad na puso! 💖</span>
          </div>

          {/* Action Buttons */}
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
        </div>
      )}

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
