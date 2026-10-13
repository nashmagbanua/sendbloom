"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import BouquetSVG from "./BouquetSVG";
import { Bouquet, FLOWER_META } from "@/lib/constants";

type PetalSpec = { left: number; size: number; dur: number; delay: number; color: string; drift: number };

function makePetals(data: Bouquet): PetalSpec[] {
  const palette = data.f.map((fl) => FLOWER_META[fl.t].colors[fl.c] ?? "#ff8fa3");
  return Array.from({ length: 16 }, (_, i) => ({
    left: Math.random() * 100,
    size: 10 + Math.random() * 12,
    dur: 6 + Math.random() * 6,
    delay: 1.2 + Math.random() * 6,
    color: palette[i % palette.length],
    drift: (Math.random() - 0.5) * 140,
  }));
}

const CONFETTI_COLORS = ["#ff8fa3", "#ffd166", "#ffffff", "#c77dff", "#ff5d8f", "#9be7c4", "#ffb703"];

export default function Reveal({ data, preview = false }: { data: Bouquet; preview?: boolean }) {
  const [opened, setOpened] = useState(false);
  const [flash, setFlash] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [typed, setTyped] = useState("");
  const [runId, setRunId] = useState(0);
  const [petals, setPetals] = useState<PetalSpec[]>([]);

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
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const burst = useCallback(() => {
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

    const parts = Array.from({ length: 170 }, () => {
      const a = Math.random() * Math.PI * 2;
      const sp = 5 + Math.random() * 13;
      return {
        x: W / 2,
        y: H * 0.45,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 7,
        w: 5 + Math.random() * 6,
        h: 3 + Math.random() * 5,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.45,
        c: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        round: Math.random() < 0.4,
      };
    });

    const t0 = performance.now();
    cancelAnimationFrame(rafRef.current);
    const tick = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of parts) {
        p.vy += 0.3;
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
      if (alive > 0 && t - t0 < 4800) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, W, H);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const play = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setOpened(true);
    setShowNote(false);
    setTyped("");
    setRunId((r) => r + 1);

    if (!reduced.current) {
      setFlash(true);
      later(() => setFlash(false), 750);
      burst();
    }
    try {
      navigator.vibrate?.([40, 60, 110]);
    } catch {}
    later(() => setShowNote(true), reduced.current ? 100 : 2100);
  }, [burst, later]);

  // typewriter for the message
  useEffect(() => {
    if (!showNote) return;
    if (reduced.current || !data.msg) {
      setTyped(data.msg);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(data.msg.slice(0, i));
      if (i >= data.msg.length) clearInterval(id);
    }, 32);
    return () => clearInterval(id);
  }, [showNote, data.msg, runId]);

  const to = data.to || "iyo";

  return (
    <div className="rv">
      {preview && (
        <div className="rv-preview-bar">
          <span>Ganito makikita ng pagbibigyan</span>
          <Link href="/">Bumalik</Link>
        </div>
      )}
      <div className="rv-glow" />
      <canvas ref={canvasRef} className="rv-confetti" aria-hidden="true" />
      {flash && <div className="rv-flash" />}

      {!opened && (
        <div className="rv-pre">
          <div className="rv-small">May padala para kay</div>
          <h1 className="rv-to">{to}</h1>
          <div className="rv-gift" aria-hidden="true">
            🎁
          </div>
          <button className="rv-open" onClick={play}>
            Buksan
          </button>
          {data.from && <div className="rv-from">mula kay {data.from}</div>}
        </div>
      )}

      {opened && (
        <>
          {petals.map((p, i) => (
            <span
              key={`${runId}-${i}`}
              className="petal"
              style={
                {
                  left: `${p.left}%`,
                  width: p.size,
                  height: p.size * 1.3,
                  background: p.color,
                  animationDuration: `${p.dur}s`,
                  animationDelay: `${p.delay}s`,
                  ["--drift" as string]: `${p.drift}px`,
                } as React.CSSProperties
              }
            />
          ))}

          <div className="rv-stage" key={`b-${runId}`}>
            <BouquetSVG data={data} animated />
          </div>

          {showNote && (
            <div className="rv-note">
              {data.to && <div className="to">Para kay {data.to},</div>}
              <div className="msg">{typed || (data.msg ? "" : "💐")}</div>
              {data.from && <div className="sig">— {data.from}</div>}
            </div>
          )}

          {showNote && (
            <div className="rv-actions">
              {data.s && (
                <a className="pill solid" href={data.s} target="_blank" rel="noopener noreferrer">
                  🎵 Pakinggan ang kanta
                </a>
              )}
              <button className="pill" onClick={play}>
                ↻ Ulitin
              </button>
              <Link className="pill" href="/">
                Gumawa rin ng sarili mo
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
