"use client";

import { useEffect, useRef, useState } from "react";
import BouquetSVG, { FlowerIcon } from "./BouquetSVG";
import { encodeBouquet, safeLink } from "@/lib/codec";
import {
  Flower,
  FlowerType,
  FLOWER_META,
  FLOWER_ORDER,
  MAX_FLOWERS,
  MAX_MSG,
  MAX_NAME,
  WrapId,
  WRAPS,
  WRAP_ORDER,
} from "@/lib/constants";

const STARTER: Flower[] = [
  { t: "rose", c: 0 },
  { t: "tulip", c: 0 },
  { t: "daisy", c: 0 },
  { t: "sunflower", c: 0 },
  { t: "lily", c: 1 },
];

export default function Builder() {
  const [flowers, setFlowers] = useState<Flower[]>(STARTER);
  const [type, setType] = useState<FlowerType>("rose");
  const [color, setColor] = useState(0);
  const [wrap, setWrap] = useState<WrapId>("kraft");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [msg, setMsg] = useState("");
  const [song, setSong] = useState("");
  const [link, setLink] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  // any edit invalidates the generated link
  useEffect(() => {
    setLink("");
  }, [flowers, wrap, to, from, msg, song]);

  function showToast(t: string) {
    setToast(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }

  function pickType(t: FlowerType) {
    setType(t);
    setColor(0);
  }

  function add() {
    if (flowers.length >= MAX_FLOWERS) {
      showToast(`Hanggang ${MAX_FLOWERS} bulaklak lang po`);
      return;
    }
    setFlowers([...flowers, { t: type, c: color }]);
    try {
      navigator.vibrate?.(15);
    } catch {}
  }

  function randomize() {
    const n = 5 + Math.floor(Math.random() * 5);
    const list: Flower[] = Array.from({ length: n }, () => {
      const t = FLOWER_ORDER[Math.floor(Math.random() * FLOWER_ORDER.length)];
      const c = Math.floor(Math.random() * FLOWER_META[t].colors.length);
      return { t, c };
    });
    setFlowers(list);
    setWrap(WRAP_ORDER[Math.floor(Math.random() * WRAP_ORDER.length)]);
  }

  const songOk = song.trim() === "" || !!safeLink(song);
  const canMake = flowers.length > 0 && songOk;

  function make() {
    if (!canMake) return;
    const code = encodeBouquet({
      to,
      from,
      msg,
      w: wrap,
      f: flowers,
      s: song.trim() ? song : undefined,
    });
    setLink(`${window.location.origin}/b/${code}`);
    setTimeout(() => shareRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      showToast("Nakopya na ang link!");
    } catch {
      showToast("Hindi makopya — pindutin nang matagal ang link");
    }
  }

  async function nativeShare() {
    const text = to ? `May padala ako para kay ${to}` : "May padala ako para sa iyo";
    if (navigator.share) {
      try {
        await navigator.share({ title: "SendBloom", text, url: link });
        return;
      } catch (e: any) {
        if (e?.name === "AbortError") return;
      }
    }
    copy();
  }

  function messenger() {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) {
      copy();
      showToast("Nakopya ang link — i-paste sa Messenger");
      return;
    }
    window.location.href = `fb-messenger://share/?link=${encodeURIComponent(link)}`;
    // if the Messenger app didn't take over, fall back to copying
    setTimeout(() => {
      if (!document.hidden) {
        copy();
        showToast("Nakopya ang link — i-paste sa Messenger");
      }
    }, 1400);
  }

  const colors = FLOWER_META[type].colors;

  return (
    <main className="wrap">
      <header className="top">
        <div className="brand">SendBloom</div>
        <p className="tag">Gumawa ng bouquet. Lagyan ng mensahe. Ipadala.</p>
      </header>

      <div className="stage">
        <div className="stage-card">
          <span className="count">
            {flowers.length}/{MAX_FLOWERS}
          </span>
          {flowers.length > 0 ? (
            <BouquetSVG data={{ f: flowers, w: wrap }} />
          ) : (
            <div className="empty">Wala pang bulaklak. Pumili sa ibaba at pindutin ang “Idagdag”.</div>
          )}
        </div>
      </div>

      <section className="panel">
        <h2>1 · Piliin ang bulaklak</h2>
        <div className="chips">
          {FLOWER_ORDER.map((t) => (
            <button key={t} className="chip" aria-pressed={type === t} onClick={() => pickType(t)}>
              <FlowerIcon type={t} colorIndex={type === t ? color : 0} />
              {FLOWER_META[t].label}
            </button>
          ))}
        </div>
        <div className="swatches" role="group" aria-label="Kulay">
          {colors.map((c, i) => (
            <button
              key={c + i}
              className="swatch"
              aria-pressed={color === i}
              aria-label={`Kulay ${i + 1}`}
              style={{ background: c }}
              onClick={() => setColor(i)}
            />
          ))}
        </div>
        <div className="row">
          <button className="btn" onClick={add}>
            + Idagdag
          </button>
          <button className="btn ghost" onClick={() => setFlowers(flowers.slice(0, -1))} disabled={!flowers.length}>
            Alisin ang huli
          </button>
        </div>
        <div className="row">
          <button className="btn ghost" onClick={randomize}>
            🎲 Ikaw na bahala
          </button>
          <button className="btn ghost" onClick={() => setFlowers([])} disabled={!flowers.length}>
            Burahin lahat
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>2 · Balot</h2>
        <div className="wraps">
          {WRAP_ORDER.map((w) => (
            <button key={w} className="wrapopt" aria-pressed={wrap === w} onClick={() => setWrap(w)}>
              <span className="dot" style={{ background: WRAPS[w].color }} />
              {WRAPS[w].label}
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>3 · Mensahe</h2>
        <label className="field">
          Para kay
          <input
            className="input"
            value={to}
            maxLength={MAX_NAME}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Pangalan ng pagbibigyan"
            autoComplete="off"
          />
        </label>
        <label className="field">
          Mula kay
          <input
            className="input"
            value={from}
            maxLength={MAX_NAME}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Pangalan mo"
            autoComplete="off"
          />
        </label>
        <label className="field">
          Sulat
          <textarea
            className="input"
            value={msg}
            maxLength={MAX_MSG}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Isulat dito ang gusto mong sabihin…"
          />
          <span className="hint">
            <span />
            <span>
              {msg.length}/{MAX_MSG}
            </span>
          </span>
        </label>
        <label className="field">
          Kanta (optional)
          <input
            className="input"
            value={song}
            onChange={(e) => setSong(e.target.value)}
            placeholder="I-paste ang https:// link ng YouTube o Spotify"
            inputMode="url"
            autoComplete="off"
          />
          {!songOk && <span className="hint" style={{ color: "#c43553" }}>Dapat nagsisimula sa https://</span>}
        </label>
      </section>

      <div style={{ marginTop: 16 }}>
        <button className="btn big" style={{ width: "100%" }} onClick={make} disabled={!canMake}>
          Gawin ang link 💐
        </button>
      </div>

      {link && (
        <div className="share" ref={shareRef}>
          <h3>Handa na! 🎉</h3>
          <span className="link">{link}</span>
          <div className="row col">
            <button className="btn" onClick={messenger}>
              Ipadala sa Messenger
            </button>
            <button className="btn ghost" onClick={nativeShare}>
              Iba pang app…
            </button>
            <button className="btn ghost" onClick={copy}>
              Kopyahin ang link
            </button>
            <a className="btn ghost" style={{ textAlign: "center", textDecoration: "none" }} href={`${link}?preview=1`} target="_blank" rel="noopener">
              Tingnan muna
            </a>
          </div>
        </div>
      )}

      <p className="foot">Libre. Walang bayad. Gawa nang may pagmamahal 🌷</p>
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
