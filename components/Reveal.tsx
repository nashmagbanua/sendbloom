"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  stopMelodicBackground,
} from "@/lib/audio";
import { Heart, RotateCcw, Share2 } from "lucide-react";

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

type Song = { audioUrl?: string; title?: string; artist?: string } | null;

export default function Reveal({
  data,
  preview = false,
}: {
  data: Bouquet;
  preview?: boolean;
}) {
  const [stage, setStage] = useState<Stage>(0);
  const [flash, setFlash] = useState(false);
  const [typedCount, setTypedCount] = useState(0);
  const [showSig, setShowSig] = useState(false);
  const [letterNudge, setLetterNudge] = useState(false);
  const [runId, setRunId] = useState(0);
  const [petals, setPetals] = useState<PetalSpec[]>([]);
  const [, setIsPlayingMusic] = useState(false);
  const [, setPlayingLabel] = useState("");
  const [, setUsingSynth] = useState(false);
  const [liveMsg, setLiveMsg] = useState("");
  const [resolvedSong, setResolvedSong] = useState<Song>(null);

  const songPromiseRef = useRef<Promise<Song> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduced = useRef(false);
  const lowEnd = useRef(false);
  const typingCancel = useRef(false);
  const fadeInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeRef = useRef<(() => void) | null>(null);

  // Emoji-safe character list (so 💖 never gets cut in half while typing)
  const chars = useMemo(() => Array.from(data.msg || ""), [data.msg]);

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

    const audioEl = audioRef.current;
    return () => {
      clearTimers();
      cancelAnimationFrame(rafRef.current);
      stopMelodicBackground();
      if (fadeInterval.current) clearInterval(fadeInterval.current);
      if (audioEl) {
        if (onTimeRef.current) audioEl.removeEventListener("timeupdate", onTimeRef.current);
        audioEl.pause();
        audioEl.src = "";
      }
    };
  }, [data, clearTimers]);

  // Keep the typing cursor visible inside the letter card (the full text space is
  // reserved from the start, so the card never grows while typing).
  useEffect(() => {
    if (stage !== 4) return;
    const card = cardRef.current;
    const cur = cursorRef.current;
    if (!card || !cur) return;
    const bottom = cur.offsetTop + cur.offsetHeight;
    const pad = 28;
    if (bottom > card.scrollTop + card.clientHeight - pad) {
      card.scrollTop = bottom - card.clientHeight + pad;
    }
  }, [typedCount, stage]);

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

    const count = lowEnd.current ? 50 : 110;
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
    let last = performance.now();
    const tick = (now: number) => {
      // delta-time so it looks the same on 60Hz, 90Hz and 120Hz phones
      const dt = Math.min((now - last) / 16.667, 2.5);
      last = now;
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of parts) {
        p.vy += 0.28 * dt;
        p.vx *= Math.pow(0.985, dt);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
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

    // Soft fade near the end of the preview instead of a hard loop.
    // Stored in a ref so the old listener is really removed on replay.
    if (onTimeRef.current) el.removeEventListener("timeupdate", onTimeRef.current);
    const onTime = () => {
      if (!el.duration || !isFinite(el.duration)) return;
      const remaining = el.duration - el.currentTime;
      if (remaining < 1.2 && remaining > 0) {
        el.volume = Math.max(0.05, target * (remaining / 1.2));
      } else if (el.currentTime < 0.8 && el.volume < target) {
        el.volume = Math.min(target, el.volume + 0.08);
      }
    };
    onTimeRef.current = onTime;
    el.addEventListener("timeupdate", onTime);
  }, []);

  const startMusic = useCallback(
    async (song: Song) => {
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

  const openEnvelope = () => {
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

    // Stage timing is scheduled right away. It no longer waits for the song
    // fetch, so the animation looks the same on slow and fast internet.
    later(() => {
      setStage(2);
      setLiveMsg("Nagbubukad ang mga bulaklak.");
    }, reduced.current ? 400 : 2500);

    // Give the bloom a full ~2.7s to be seen before the letter envelope shows
    later(() => {
      setStage(3);
      setLiveMsg("May sulat pa. Pindutin ang selyo.");
      later(() => setLetterNudge(true), 6000);
    }, reduced.current ? 600 : 5200);

    // Music: if the song is already resolved, call play() synchronously inside the
    // tap (iOS / in-app browsers block play() after an await).
    if (resolvedSong) {
      void startMusic(resolvedSong);
    } else {
      void (async () => {
        let song: Song = null;
        if (songPromiseRef.current) {
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
      })();
    }
  };

  const completeLetter = useCallback(() => {
    setShowSig(true);
    setStage(5);
    setLiveMsg("Natapos ang sulat.");
  }, []);

  const openLetter = () => {
    if (stage !== 3) return;
    setLetterNudge(false);
    playRustle();
    try {
      navigator.vibrate?.([20, 30]);
    } catch {}

    setStage(4);
    setLiveMsg("Binubuksan ang sulat.");
    typingCancel.current = false;
    setTypedCount(0);

    if (chars.length === 0 || reduced.current) {
      setTypedCount(chars.length);
      later(completeLetter, 400);
      return;
    }

    // Keep the typing speed such that the whole letter takes about 5-6 seconds max
    const base = Math.max(8, Math.min(28, 5000 / chars.length));
    const scale = base / 28;
    let i = 0;
    const step = () => {
      if (typingCancel.current) return;
      const ch = chars[i];
      i += 1;
      setTypedCount(i);
      if (i >= chars.length) {
        later(completeLetter, 500);
        return;
      }
      const pause =
        ch === "." || ch === "!" || ch === "?"
          ? 180 * scale
          : ch === ","
            ? 90 * scale
            : base;
      later(step, pause);
    };
    // wait for the flap to open and the letter to rise out of the envelope
    later(step, 1200);
  };

  const finishTyping = () => {
    if (stage !== 4) return;
    typingCancel.current = true;
    setTypedCount(chars.length);
    completeLetter();
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
    setTypedCount(0);
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
  const letterOpen = stage >= 4;

  return (
    <div className={`reveal-page-wrapper reveal-stage-${stage}`}>
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

      <div className={`revealed-content-stage stage-${stage}`}>
        {flash && <div className="reveal-flash-effect" aria-hidden />}

        {/* Header only while sealed; hides after opening, returns on "Ulitin" (stage 0) */}
        {stage === 0 && (
          <div className="recipient-greeting-header">
            <span className="greeting-sub">May padala para kay</span>
            <h1 className="greeting-title">{data.to ? data.to : "sa Iyo"}</h1>
            {data.from && (
              <span className="from-label from-label-block">mula kay {data.from}</span>
            )}
          </div>
        )}

        {/* STAGE 0: sealed envelope */}
        {stage === 0 && (
          <div className="sealed-envelope-stage">
            <div className="envelope-illustration">
              <div className="envelope-body" aria-hidden>
                <div className="envelope-flap" />
              </div>
              <button
                type="button"
                className="wax-seal-badge pulse-seal wax-seal-on-flap"
                onClick={openEnvelope}
                aria-label="Pindutin ang selyo para buksan ang padala"
              >
                <span className="seal-emblem">{stickerItem.icon}</span>
              </button>
            </div>
            <span className="seal-hint-label">
              Pindutin ang selyo para buksan ang padala 💌
            </span>
          </div>
        )}

        {/* STAGE 1+: bouquet. It stays on screen the whole time, including after the
            letter opens (it just gets smaller to make room). */}
        {stage >= 1 && (
          <div
            className={`blooming-bouquet-display ${stage === 1 ? "bouquet-rising" : ""} ${
              stage >= 3 ? "bouquet-compact" : ""
            } ${stage >= 4 ? "bouquet-tuck" : ""}`}
          >
            <BouquetSVG data={{ f: data.f, w: data.w }} animated={!reduced.current} />
          </div>
        )}

        {/* STAGE 3+: ONE envelope that stays mounted. At stage 4 its flap opens and the
            letter slides up out of it (same envelope, no swapping of elements). */}
        {stage >= 3 && (
          <div
            className={`letter-scene ${letterOpen ? "is-open" : ""} ${
              letterNudge && stage === 3 ? "letter-nudge" : ""
            } ${reduced.current ? "reduced-motion" : ""}`}
          >
            {/* The letter lives in a slot that grows from 0 to full height */}
            <div className="letter-slot">
              <div className="letter-slot-inner">
                <div className="letter-slot-pad">
                  <div
                    ref={cardRef}
                    className={`handwritten-letter-card letter-theme-${data.c || "classic"}`}
                    data-theme={data.c || "classic"}
                    style={{
                      background: currentTheme.bg,
                      color: currentTheme.text,
                      borderColor: currentTheme.border,
                      borderWidth: 2,
                      borderStyle: "solid",
                      boxShadow:
                        (data.c || "classic") === "midnight"
                          ? "0 16px 40px rgba(0,0,0,0.55)"
                          : "0 16px 36px rgba(0,0,0,0.22)",
                    }}
                    onClick={finishTyping}
                    role="button"
                    tabIndex={letterOpen ? 0 : -1}
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

                    {chars.length > 0 && (
                      <div className="letter-body-text">
                        {chars.slice(0, typedCount).join("")}
                        {stage === 4 && typedCount < chars.length && (
                          <span ref={cursorRef} className="typing-cursor">
                            |
                          </span>
                        )}
                        {/* invisible rest of the text: reserves the final height so the
                            card does not grow (and jump) while typing */}
                        <span className="letter-ghost" aria-hidden>
                          {chars.slice(typedCount).join("")}
                        </span>
                      </div>
                    )}

                    {(closingText || data.from) && (
                      <div
                        className={`letter-signature-line ${
                          showSig ? "letter-sig-fade" : "letter-sig-hidden"
                        }`}
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
                </div>
              </div>
            </div>

            {/* The envelope: back, front pocket, flap, seal */}
            <div className="lt-env" onClick={stage === 3 ? openLetter : undefined}>
              <div className="lt-env-back" aria-hidden />
              <div className="lt-env-front" aria-hidden />
              <div className="lt-env-flap" aria-hidden />
              <button
                type="button"
                className="wax-seal-badge pulse-seal lt-seal"
                aria-label="Pindutin ang selyo para buksan ang sulat"
                tabIndex={stage === 3 ? 0 : -1}
                aria-hidden={stage !== 3}
              >
                <span className="seal-emblem small-seal">{stickerItem.icon}</span>
              </button>
            </div>

            <span className="seal-hint-label lt-hint">
              Pindutin ang selyo para buksan ang sulat 💌
              {letterNudge && <span className="nudge-extra"> — Pindutin dito</span>}
            </span>
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
              Gumawa rin ng digital bouquet
            </a>
          </div>
        )}

        {reportEmail && (
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
