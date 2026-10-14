"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import BouquetSVG from "./BouquetSVG";
import {
  Bouquet,
  CARD_THEMES,
  CLOSINGS,
  FLOWER_META,
  SALUTATIONS,
  STICKER_META,
} from "@/lib/constants";
import {
  getSoundMuted,
  playBloomCelebration,
  playMelodicBackground,
  playRustle,
  playSealBreak,
  setSoundMuted,
  stopMelodicBackground,
} from "@/lib/audio";
import { Heart, Music, Volume2, VolumeX, RotateCcw, Share2 } from "lucide-react";

type PetalSpec = {
  left: number;
  size: number;
  dur: number;
  delay: number;
  color: string;
  drift: number;
};

type Stage = 0 | 1 | 2 | 3 | 4 | 5;

function makePetals(data: Bouquet, count: number): PetalSpec[] {
  const palette = data.f.map((fl) => FLOWER_META[fl.t].colors[fl.c] ?? "#ff8fa3");
  return Array.from({ length: count }, (_, i) => ({
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

function isLowEnd(): boolean {
  try {
    return (
      (typeof navigator !== "undefined" &&
        typeof navigator.hardwareConcurrency === "number" &&
        navigator.hardwareConcurrency <= 4) ||
      false
    );
  } catch {
    return false;
  }
}

export default function Reveal({
  data,
  preview = false,
}: {
  data: Bouquet;
  preview?: boolean;
}) {
  const [stage, setStage] = useState<Stage>(0);
  const [flash, setFlash] = useState(false);
  const [typed, setTyped] = useState("");
  const [showSig, setShowSig] = useState(false);
  const [letterNudge, setLetterNudge] = useState(false);
  const [runId, setRunId] = useState(0);
  const [petals, setPetals] = useState<PetalSpec[]>([]);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [playingLabel, setPlayingLabel] = useState("");
  const [usingSynth, setUsingSynth] = useState(false);
  const [liveMsg, setLiveMsg] = useState("");

  const [resolvedSong, setResolvedSong] = useState<{
    audioUrl?: string;
    title?: string;
    artist?: string;
  } | null>(null);

  const songPromiseRef = useRef<Promise<typeof resolvedSong> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduced = useRef(false);
  const lowEnd = useRef(false);
  const typingCancel = useRef(false);
  const fadeInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lowEnd.current = isLowEnd();
    const petalCount = reduced.current ? 0 : lowEnd.current ? 10 : 22;
    setPetals(makePetals(data, petalCount));
    setIsAudioMuted(getSoundMuted());

    const title = data.st || "";
    const artist = data.sa || "";

    if (title || artist) {
      const p = fetch(
        `/api/song?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`
      )
        .then((r) => r.json())
        .then((res) => {
          if (res.found && res.audioUrl) {
            const song = {
              audioUrl: res.audioUrl as string,
              title: (res.title || title) as string,
              artist: (res.artist || artist) as string,
            };
            setResolvedSong(song);
            if (audioRef.current) {
              audioRef.current.src = song.audioUrl;
            }
            return song;
          }
          return null;
        })
        .catch(() => null);
      songPromiseRef.current = p;
    }

    return () => {
      clearTimers();
      cancelAnimationFrame(rafRef.current);
      stopMelodicBackground();
      if (fadeInterval.current) clearInterval(fadeInterval.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [data, clearTimers]);

  const burstConfetti = useCallback(() => {
    if (reduced.current) return;
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

    const count = lowEnd.current ? 60 : 160;
    const parts = Array.from({ length: count }, () => {
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

  const fadeInAudio = useCallback((el: HTMLAudioElement) => {
    el.volume = 0;
    el.loop = true;
    const target = 0.45;
    if (fadeInterval.current) clearInterval(fadeInterval.current);
    fadeInterval.current = setInterval(() => {
      if (!el) return;
      if (el.volume < target - 0.02) {
        el.volume = Math.min(target, el.volume + 0.04);
      } else {
        el.volume = target;
        if (fadeInterval.current) {
          clearInterval(fadeInterval.current);
          fadeInterval.current = null;
        }
      }
    }, 80);

    // Soft crossfade near the 30s preview end instead of hard loop
    const onTime = () => {
      if (!el.duration || !isFinite(el.duration)) return;
      const remaining = el.duration - el.currentTime;
      if (remaining < 1.2 && remaining > 0) {
        el.volume = Math.max(0.05, target * (remaining / 1.2));
      } else if (el.currentTime < 0.8 && el.volume < target) {
        el.volume = Math.min(target, el.volume + 0.08);
      }
    };
    el.removeEventListener("timeupdate", onTime);
    el.addEventListener("timeupdate", onTime);
  }, []);

  const startMusic = useCallback(
    async (song: { audioUrl?: string; title?: string; artist?: string } | null) => {
      setIsPlayingMusic(true);
      const audioEl = audioRef.current;
      if (song?.audioUrl && audioEl) {
        try {
          if (audioEl.src !== song.audioUrl) audioEl.src = song.audioUrl;
          audioEl.muted = getSoundMuted();
          fadeInAudio(audioEl);
          await audioEl.play();
          setUsingSynth(false);
          const label = [song.title, song.artist].filter(Boolean).join(" · ");
          setPlayingLabel(label || data.st || "Kanta");
          return;
        } catch {
          // fall through to synth
        }
      }
      setUsingSynth(true);
      setPlayingLabel("Himig ng Pag-ibig");
      if (!getSoundMuted()) playMelodicBackground();
    },
    [data.st, fadeInAudio]
  );

  const openEnvelope = async () => {
    if (stage !== 0) return;

    playSealBreak();
    try {
      navigator.vibrate?.([30, 50, 40]);
    } catch {}

    setStage(1);
    setLiveMsg("Binuksan ang envelope. Lumilitaw ang bouquet.");
    setFlash(!reduced.current);
    later(() => setFlash(false), reduced.current ? 200 : 700);
    playBloomCelebration();
    if (!reduced.current) burstConfetti();

    // Wait up to ~2s for pending song fetch, then play real song or synth
    let song = resolvedSong;
    if (!song && songPromiseRef.current) {
      try {
        song = await Promise.race([
          songPromiseRef.current,
          new Promise<null>((r) => setTimeout(() => r(null), 2000)),
        ]);
      } catch {
        song = null;
      }
    }
    await startMusic(song);

    // Stage 2: breathe ~2.5s
    later(() => {
      setStage(2);
      setLiveMsg("Nagbubukad ang mga bulaklak.");
    }, reduced.current ? 400 : 2500);

    // Stage 3: second seal appears
    later(() => {
      setStage(3);
      setLiveMsg("May sulat pa. Pindutin ang selyo.");
      later(() => setLetterNudge(true), 6000);
    }, reduced.current ? 600 : 2800);
  };

  const openLetter = () => {
    if (stage < 3) return;
    setLetterNudge(false);
    playRustle();
    try {
      navigator.vibrate?.([20, 30]);
    } catch {}

    setStage(4);
    setLiveMsg("Binubuksan ang sulat.");
    typingCancel.current = false;

    const full = data.msg || "";
    const salId = data.sal && data.sal in SALUTATIONS ? data.sal : "mahal";
    // salutation is shown separately; body types out

    if (!full || reduced.current) {
      setTyped(full);
      later(() => {
        setShowSig(true);
        setStage(5);
        setLiveMsg("Natapos ang sulat.");
      }, 400);
      return;
    }

    let i = 0;
    const step = () => {
      if (typingCancel.current) {
        setTyped(full);
        setShowSig(true);
        setStage(5);
        return;
      }
      const nextChar = full[i];
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) {
        later(() => {
          setShowSig(true);
          setStage(5);
          setLiveMsg("Natapos ang sulat.");
        }, 500);
        return;
      }
      const pause =
        nextChar === "." || nextChar === "!" || nextChar === "?"
          ? 180
          : nextChar === ","
            ? 90
            : 28;
      later(step, pause);
    };
    later(step, 350);
  };

  const finishTyping = () => {
    if (stage !== 4) return;
    typingCancel.current = true;
    setTyped(data.msg || "");
    setShowSig(true);
    setStage(5);
    setLiveMsg("Natapos ang sulat.");
  };

  const toggleMute = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    setSoundMuted(next);
    if (audioRef.current) {
      audioRef.current.muted = next;
    }
    if (next) {
      stopMelodicBackground();
    } else if (usingSynth && isPlayingMusic) {
      playMelodicBackground();
    }
  };

  const replay = () => {
    clearTimers();
    cancelAnimationFrame(rafRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    stopMelodicBackground();
    typingCancel.current = true;
    setStage(0);
    setFlash(false);
    setTyped("");
    setShowSig(false);
    setLetterNudge(false);
    setIsPlayingMusic(false);
    setUsingSynth(false);
    setPlayingLabel("");
    setLiveMsg("Handa nang buksan muli.");
    setRunId((n) => n + 1);
    const petalCount = reduced.current ? 0 : lowEnd.current ? 10 : 22;
    setPetals(makePetals(data, petalCount));
  };

  const thankShare = async () => {
    const text = "Natanggap ko na ang bulaklak mo, salamat! 💐";
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "SendBloom", text, url });
        return;
      } catch (e: unknown) {
        if (e && typeof e === "object" && "name" in e && (e as { name: string }).name === "AbortError")
          return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setLiveMsg("Nakopya ang mensahe ng pasasalamat.");
    } catch {
      setLiveMsg("Hindi makopya. I-share nang manual.");
    }
  };

  const currentTheme = CARD_THEMES[data.c || "classic"] || CARD_THEMES.classic;
  const stickerItem = STICKER_META[data.k || "heart"] || STICKER_META.heart;
  const salId = data.sal && data.sal in SALUTATIONS ? data.sal : "mahal";
  const cloId = data.clo && data.clo in CLOSINGS ? data.clo : "nagmamahal";
  const salutationText = SALUTATIONS[salId].template(data.to || "");
  const closingText = CLOSINGS[cloId].text;

  const reportEmail = process.env.NEXT_PUBLIC_REPORT_EMAIL || "";

  return (
    <div className="reveal-page-wrapper">
      <audio ref={audioRef} preload="auto" style={{ display: "none" }} />

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMsg}
      </div>

      {/* Floating Petals — stages 1+ */}
      {stage >= 1 &&
        !reduced.current &&
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

      <canvas ref={canvasRef} className="reveal-confetti-canvas" aria-hidden />

      <div className="reveal-ambient-glow" aria-hidden />

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

      <div className="revealed-content-stage">
        {flash && <div className="reveal-flash-effect" aria-hidden />}

        {/* Header always visible */}
        <div className="recipient-greeting-header">
          <span className="greeting-sub">May padala para kay</span>
          <h1 className="greeting-title">{data.to ? data.to : "sa Iyo"}</h1>
          {data.from && (
            <span className="from-label from-label-block">mula kay {data.from}</span>
          )}
        </div>

        {/* STAGE 0: sealed envelope only — NO bouquet */}
        {stage === 0 && (
          <div className="sealed-envelope-stage">
            <div className="envelope-illustration" aria-hidden>
              <div className="envelope-body">
                <div className="envelope-flap" />
              </div>
            </div>
            <button
              type="button"
              className="wax-seal-badge pulse-seal"
              onClick={openEnvelope}
              aria-label="Pindutin ang selyo para buksan ang padala"
            >
              <span className="seal-emblem">{stickerItem.icon}</span>
            </button>
            <span className="seal-hint-label">
              Pindutin ang selyo para buksan ang padala 💌
            </span>
          </div>
        )}

        {/* STAGE 1+: bouquet blooms */}
        {stage >= 1 && (
          <div
            className={`blooming-bouquet-display ${stage === 1 ? "bouquet-rising" : ""}`}
          >
            <BouquetSVG
              data={{ f: data.f, w: data.w }}
              animated={stage === 1 && !reduced.current}
            />
          </div>
        )}

        {/* Now playing */}
        {stage >= 1 && isPlayingMusic && (
          <div className="subtle-now-playing-badge">
            <button
              type="button"
              onClick={toggleMute}
              className="music-mute-toggle-btn"
              title={isAudioMuted ? "I-unmute" : "I-mute"}
              aria-label={isAudioMuted ? "I-unmute ang tunog" : "I-mute ang tunog"}
            >
              <Music size={14} className={usingSynth ? undefined : "music-spin-icon"} />
              <span>
                Tumutugtog: {playingLabel || "Himig ng Pag-ibig"}
              </span>
              {isAudioMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
          </div>
        )}

        {/* STAGE 3+: second seal for letter */}
        {stage >= 3 && stage < 4 && (
          <div className={`letter-seal-stage ${letterNudge ? "letter-nudge" : ""}`}>
            <button
              type="button"
              className="letter-seal-btn pulse-seal"
              onClick={openLetter}
              aria-label="Pindutin para basahin ang sulat"
            >
              <span className="seal-emblem small-seal">{stickerItem.icon}</span>
            </button>
            <span className="seal-hint-label">
              May sulat pa para sa&apos;yo 💌
              {letterNudge && (
                <span className="nudge-extra"> — Pindutin dito</span>
              )}
            </span>
          </div>
        )}

        {/* STAGE 4+: letter */}
        {stage >= 4 && (
          <div
            className={`handwritten-letter-card ${stage === 4 ? "letter-unfolding" : ""}`}
            style={{
              background: currentTheme.bg,
              color: currentTheme.text,
              borderColor: currentTheme.border,
            }}
            onClick={finishTyping}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") finishTyping();
            }}
            aria-label="Sulat. Pindutin para tapusin agad ang pagsulat."
          >
            <div className="letter-stamp-corner" title={stickerItem.label}>
              {stickerItem.icon}
            </div>

            {salutationText && (
              <div className="letter-to-line" style={{ color: currentTheme.accent }}>
                {salutationText}
              </div>
            )}

            {data.msg && (
              <div className="letter-body-text">
                {typed}
                {stage === 4 && typed.length < (data.msg || "").length && (
                  <span className="typing-cursor">|</span>
                )}
              </div>
            )}

            {showSig && (closingText || data.from) && (
              <div
                className="letter-signature-line letter-sig-fade"
                style={{ color: currentTheme.accent }}
              >
                {closingText && (
                  <>
                    {closingText}
                    <br />
                  </>
                )}
                {data.from && <span>{data.from}</span>}
              </div>
            )}
          </div>
        )}

        {/* STAGE 5: actions */}
        {stage >= 5 && (
          <div className="reveal-footer-actions">
            <button type="button" className="action-pill-btn secondary" onClick={replay}>
              <RotateCcw size={15} />
              Ulitin
            </button>
            <button type="button" className="action-pill-btn secondary" onClick={thankShare}>
              <Share2 size={15} />
              Magpasalamat
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="action-pill-btn primary"
            >
              <Heart size={15} className="heart-icon-filled" />
              Gumawa rin ng sarili mo
            </a>
          </div>
        )}

        {reportEmail && stage >= 0 && (
          <div className="report-bouquet-link">
            <a
              href={`mailto:${reportEmail}?subject=${encodeURIComponent(
                "I-report ang SendBloom bouquet"
              )}&body=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.href : ""
              )}`}
            >
              I-report ang bouquet na ito
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
