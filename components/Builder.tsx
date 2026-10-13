"use client";

import { useEffect, useRef, useState } from "react";
import BouquetSVG, { FlowerIcon } from "./BouquetSVG";
import { encodeBouquet } from "@/lib/codec";
import {
  Bouquet,
  CardTheme,
  CARD_THEMES,
  CARD_THEME_ORDER,
  Flower,
  FlowerType,
  FLOWER_META,
  FLOWER_ORDER,
  MAX_FLOWERS,
  MAX_MSG,
  MAX_NAME,
  PRESETS,
  SUGGESTED_SONGS,
  StickerId,
  STICKER_META,
  STICKER_ORDER,
  WrapId,
  WRAPS,
  WRAP_ORDER,
} from "@/lib/constants";
import { playFlowerPop, playRustle, setSoundMuted } from "@/lib/audio";
import {
  Flower as FlowerLucide,
  Gift,
  Mail,
  Send,
  Volume2,
  VolumeX,
  X,
  Copy,
  Share2,
  ExternalLink,
  Shuffle,
  Trash2,
  Check,
  Plus,
  Music,
  Coffee,
} from "lucide-react";

const STARTER: Flower[] = [
  { t: "rose", c: 0 },
  { t: "tulip", c: 0 },
  { t: "daisy", c: 0 },
  { t: "sunflower", c: 0 },
  { t: "lily", c: 1 },
];

type StepTab = "flowers" | "wrap" | "letter" | "send";

export default function Builder() {
  const [flowers, setFlowers] = useState<Flower[]>(STARTER);
  const [type, setType] = useState<FlowerType>("rose");
  const [color, setColor] = useState(0);
  const [wrap, setWrap] = useState<WrapId>("kraft");
  const [cardTheme, setCardTheme] = useState<CardTheme>("classic");
  const [sticker, setSticker] = useState<StickerId>("heart");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [msg, setMsg] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [link, setLink] = useState("");
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState<StepTab>("flowers");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [selectedFlowerIndex, setSelectedFlowerIndex] = useState<number | null>(null);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [copiedGCash, setCopiedGCash] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // Clear link when bouquet details change
  useEffect(() => {
    setLink("");
    setCopied(false);
  }, [flowers, wrap, cardTheme, sticker, to, from, msg, songTitle, songArtist]);

  function showToast(text: string) {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2800);
  }

  function toggleSound() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setSoundMuted(!next);
    showToast(next ? "Tunog: On 🔊" : "Naka-mute 🔇");
  }

  function pickType(t: FlowerType) {
    setType(t);
    setColor(0);
    if (selectedFlowerIndex !== null && flowers[selectedFlowerIndex]) {
      setFlowers((prev) =>
        prev.map((fl, idx) => (idx === selectedFlowerIndex ? { ...fl, t, c: 0 } : fl))
      );
      showToast(`Pinalitan ang bulaklak sa ${FLOWER_META[t].label}!`);
    }
    if (soundEnabled) playRustle();
  }

  function handleColorPick(i: number) {
    setColor(i);
    if (selectedFlowerIndex !== null && flowers[selectedFlowerIndex]) {
      setFlowers((prev) =>
        prev.map((fl, idx) => (idx === selectedFlowerIndex ? { ...fl, c: i } : fl))
      );
      showToast(`Pinalitan ang kulay ng bulaklak! ✨`);
    }
    if (soundEnabled) playFlowerPop(i);
  }

  function addFlowerOfType(t: FlowerType, cIdx = 0) {
    if (flowers.length >= MAX_FLOWERS) {
      showToast(`Hanggang ${MAX_FLOWERS} bulaklak lang po ang kasya sa bouquet`);
      return;
    }
    setFlowers((prev) => [...prev, { t, c: cIdx }]);
    setSelectedPresetId(null);
    setSelectedFlowerIndex(flowers.length);
    if (soundEnabled) playFlowerPop(flowers.length);
    try {
      navigator.vibrate?.(15);
    } catch {}
    showToast(`Idinagdag ang ${FLOWER_META[t].label}! 🌸`);
  }

  function addCurrentFlower() {
    addFlowerOfType(type, color);
  }

  function removeFlower(index: number) {
    setFlowers((prev) => prev.filter((_, i) => i !== index));
    setSelectedPresetId(null);
    setSelectedFlowerIndex(null);
    if (soundEnabled) playRustle();
  }

  function randomizeBouquet() {
    const count = 5 + Math.floor(Math.random() * 5);
    const list: Flower[] = Array.from({ length: count }, () => {
      const t = FLOWER_ORDER[Math.floor(Math.random() * FLOWER_ORDER.length)];
      const c = Math.floor(Math.random() * FLOWER_META[t].colors.length);
      return { t, c };
    });
    setFlowers(list);
    setWrap(WRAP_ORDER[Math.floor(Math.random() * WRAP_ORDER.length)]);
    setSelectedPresetId(null);
    setSelectedFlowerIndex(null);
    if (soundEnabled) playFlowerPop(3);
    showToast("Nabagong bouquet! 🎲");
  }

  function applyPreset(p: typeof PRESETS[0]) {
    setFlowers([...p.flowers]);
    setWrap(p.wrap);
    setCardTheme(p.cardTheme);
    setSticker(p.sticker);
    setSelectedPresetId(p.id);
    setSelectedFlowerIndex(null);
    if (p.defaultMsg) {
      setMsg(p.defaultMsg);
    }
    if (soundEnabled) playFlowerPop(4);
    showToast(`Inilapat ang preset para sa ${p.name}! ✨`);
  }

  function validateAndProceedToWrap() {
    if (flowers.length === 0) {
      showToast("Pumili muna ng kahit isang bulaklak 🌸");
      return;
    }
    setActiveTab("wrap");
    if (soundEnabled) playRustle();
  }

  function validateAndProceedToLetter() {
    setActiveTab("letter");
    if (soundEnabled) playRustle();
  }

  function generateLink() {
    if (!to.trim()) {
      setTriedSubmit(true);
      setActiveTab("letter");
      showToast("Pakilagay ang pangalan sa 'Para kay' bago magpatuloy ✍️");
      return;
    }
    if (!from.trim()) {
      setTriedSubmit(true);
      setActiveTab("letter");
      showToast("Pakilagay ang iyong pangalan sa 'Mula kay' bago magpatuloy ✍️");
      return;
    }
    if (flowers.length === 0) {
      setActiveTab("flowers");
      showToast("Maglagay muna ng bulaklak sa iyong bouquet 🌸");
      return;
    }

    const bouquetData: Bouquet = {
      to: to.trim(),
      from: from.trim(),
      msg: msg.trim(),
      w: wrap,
      f: flowers,
      st: songTitle.trim() || undefined,
      sa: songArtist.trim() || undefined,
      k: sticker,
      c: cardTheme,
    };
    const code = encodeBouquet(bouquetData);
    const url = `${window.location.origin}/b/${code}`;
    setLink(url);
    setActiveTab("send");
    if (soundEnabled) playFlowerPop(5);
    showToast("Handa na ang iyong link! 💌");
  }

  async function copyLink() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      showToast("Nakopya na ang link sa clipboard! 📋");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      showToast("Pindutin nang matagal ang text box para kopyahin");
    }
  }

  async function nativeShare() {
    if (!link) return;
    const text = to.trim()
      ? `May espesyal na digital bouquet para kay ${to} 💐`
      : "May espesyal na digital bouquet para sa iyo 💐";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "SendBloom Bouquet", text, url: link });
        return;
      } catch (e: any) {
        if (e?.name === "AbortError") return;
      }
    }
    copyLink();
  }

  /**
   * Directly target Messenger without blocking delays.
   * Works smoothly on iOS Safari / WebKit and Android.
   */
  function messengerShare() {
    if (!link) return;

    // Immediately copy link in background (no await so transient gesture is preserved)
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }

    const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const text = `May espesyal na digital bouquet para kay ${to.trim() || "sa iyo"} 💐`;

    // 1. On iOS: Calling navigator.share directly during the click gesture natively displays
    // the system share card where Messenger is prominently listed at the top!
    if (isIOS && typeof navigator !== "undefined" && navigator.share) {
      try {
        navigator.share({
          title: "SendBloom Bouquet",
          text,
          url: link,
        }).catch((err: any) => {
          if (err?.name !== "AbortError") {
            // Fallback to fb-messenger scheme
            window.location.href = `fb-messenger://share?link=${encodeURIComponent(link)}`;
          }
        });
        showToast("Binubuksan ang Messenger... 💬");
        return;
      } catch {}
    }

    const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      showToast("Binubuksan ang Messenger app... 💬");
      window.location.href = `fb-messenger://share?link=${encodeURIComponent(link)}`;
    } else {
      showToast("Binubuksan ang Messenger... 💬");
      window.open(
        `https://www.facebook.com/dialog/send?link=${encodeURIComponent(link)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(link)}`,
        "_blank"
      );
    }
  }

  function copyGCashNumber() {
    const gcashNumber = "0956 0757 315";
    navigator.clipboard?.writeText(gcashNumber.replace(/\s+/g, "")).catch(() => {});
    setCopiedGCash(true);
    showToast("Nakopya ang GCash number! 💙");
    setTimeout(() => setCopiedGCash(false), 2500);
  }

  const colors = FLOWER_META[type].colors;

  return (
    <main className="builder-container">
      {/* Header: Clean, modern brand identity (No "libre para sa lahat") */}
      <header className="builder-header">
        <div className="header-left">
          <h1 className="brand-title">SendBloom</h1>
          <p className="brand-subtitle">Bulaklak na hindi nalalanta</p>
        </div>
        <button
          type="button"
          className="sound-toggle-btn"
          onClick={toggleSound}
          aria-label={soundEnabled ? "I-mute ang tunog" : "I-on ang tunog"}
          title={soundEnabled ? "Mute" : "Unmute"}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </header>

      {/* Bouquet Stage */}
      <section className="builder-stage-wrapper">
        <div className="builder-stage-card">
          <div className="stage-top-bar">
            <span className="flower-meter">
              🌸 {flowers.length}/{MAX_FLOWERS} Bulaklak
            </span>
            <span className="wrap-badge-hint">
              Balot: {WRAPS[wrap].label}
            </span>
          </div>

          <div className="stage-svg-box">
            {flowers.length > 0 ? (
              <BouquetSVG
                data={{ f: flowers, w: wrap }}
                onFlowerClick={(idx) => {
                  setSelectedFlowerIndex(idx);
                  const fl = flowers[idx];
                  if (fl) {
                    setType(fl.t);
                    setColor(fl.c);
                    if (soundEnabled) playFlowerPop(idx);
                  }
                }}
                selectedFlowerIndex={selectedFlowerIndex}
              />
            ) : (
              <div className="empty-stage">
                <p>Walang laman ang bouquet.</p>
                <span>Pumili ng bulaklak sa ibaba at pindutin ang “+ Idagdag”.</span>
              </div>
            )}
          </div>

          {selectedFlowerIndex !== null && flowers[selectedFlowerIndex] && (
            <div className="selected-flower-bar">
              <span className="selected-flower-info">
                Pinili: <strong>{FLOWER_META[flowers[selectedFlowerIndex].t].label}</strong> (Pindutin ang kulay sa ibaba para palitan)
              </span>
              <div className="selected-flower-actions">
                <button
                  type="button"
                  className="selected-flower-del"
                  onClick={() => removeFlower(selectedFlowerIndex)}
                  title="Alisin ang bulaklak"
                >
                  <Trash2 size={13} className="inline mr-1" /> Alisin
                </button>
                <button
                  type="button"
                  className="selected-flower-close"
                  onClick={() => setSelectedFlowerIndex(null)}
                  title="Isara"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Current Flowers List in Tray */}
          {flowers.length > 0 && (
            <div className="flower-tray-scroll">
              <span className="tray-title">Laman ({flowers.length}/{MAX_FLOWERS}):</span>
              <div className="tray-list">
                {flowers.map((fl, idx) => (
                  <div
                    key={`${fl.t}-${fl.c}-${idx}`}
                    className={`tray-chip ${selectedFlowerIndex === idx ? "active-tray-chip" : ""}`}
                    onClick={() => {
                      setSelectedFlowerIndex(idx);
                      setType(fl.t);
                      setColor(fl.c);
                      if (soundEnabled) playFlowerPop(idx);
                    }}
                  >
                    <span
                      className="tray-chip-dot"
                      style={{ background: FLOWER_META[fl.t].colors[fl.c] }}
                    />
                    <span className="tray-chip-name">{FLOWER_META[fl.t].label}</span>
                    <button
                      type="button"
                      className="tray-chip-del"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFlower(idx);
                      }}
                      aria-label={`Alisin ang ${FLOWER_META[fl.t].label} #${idx + 1}`}
                      title="Alisin"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Navigation Tabs */}
      <nav className="builder-tabs" aria-label="Mga hakbang sa paggawa">
        <button
          type="button"
          className={`tab-btn ${activeTab === "flowers" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("flowers");
            if (soundEnabled) playRustle();
          }}
        >
          <FlowerLucide size={17} />
          <span>1. Bulaklak</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "wrap" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("wrap");
            if (soundEnabled) playRustle();
          }}
        >
          <Gift size={17} />
          <span>2. Balot</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "letter" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("letter");
            if (soundEnabled) playRustle();
          }}
        >
          <Mail size={17} />
          <span>3. Sulat</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "send" ? "active" : ""}`}
          onClick={() => {
            // Guard: Cannot proceed to Send tab if required fields in Letter are empty!
            if (!to.trim() || !from.trim()) {
              setTriedSubmit(true);
              setActiveTab("letter");
              showToast("Pakilagay muna ang 'Para kay' at 'Mula kay' bago magpadala ✍️");
              return;
            }
            if (!link) {
              generateLink();
            } else {
              setActiveTab("send");
              if (soundEnabled) playRustle();
            }
          }}
        >
          <Send size={17} />
          <span>4. Ipadala</span>
        </button>
      </nav>

      {/* Tab Panels */}
      <div className="tab-content-area">
        {/* TAB 1: MGA BULAKLAK AT PRESETS */}
        {activeTab === "flowers" && (
          <div className="tab-pane">
            {/* Occasion Presets (Mother's Day, Father's Day, Teacher's Day, etc.) */}
            <div className="presets-box">
              <div className="section-label">Mabilisang Presets Ayon sa Okasyon</div>
              <div className="presets-grid">
                {PRESETS.map((p) => {
                  const isSelected = selectedPresetId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`preset-card ${isSelected ? "selected-preset" : ""}`}
                      onClick={() => applyPreset(p)}
                    >
                      <span className="preset-emoji">{p.emoji}</span>
                      <div className="preset-text">
                        <strong className="preset-name">
                          {p.name} {isSelected && "✓"}
                        </strong>
                        <span className="preset-desc">{p.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Flower Picker */}
            <div className="custom-flower-box">
              <div className="section-label">Pumili ng Bulaklak na Idadagdag</div>
              <div className="flower-type-grid">
                {FLOWER_ORDER.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`flower-chip ${type === t ? "active" : ""}`}
                    aria-pressed={type === t}
                    onClick={() => pickType(t)}
                  >
                    <FlowerIcon type={t} colorIndex={type === t ? color : 0} size={38} />
                    <span className="chip-name">{FLOWER_META[t].label}</span>
                  </button>
                ))}
              </div>

              {/* Color Swatches */}
              <div className="section-label mt-4">
                Piliin ang Kulay {selectedFlowerIndex !== null ? "(Palitan ang napiling bulaklak)" : `ng ${FLOWER_META[type].label}`}
              </div>
              <div className="swatches-row" role="group" aria-label="Kulay ng bulaklak">
                {colors.map((c, i) => (
                  <button
                    key={c + i}
                    type="button"
                    className={`color-swatch-btn ${color === i ? "active" : ""}`}
                    aria-pressed={color === i}
                    aria-label={`Kulay #${i + 1}`}
                    style={{ background: c }}
                    onClick={() => handleColorPick(i)}
                  />
                ))}
              </div>

              {/* Add Flower Button */}
              <div className="actions-row">
                <button
                  type="button"
                  className="primary-btn pulse-glow"
                  onClick={addCurrentFlower}
                  disabled={flowers.length >= MAX_FLOWERS}
                >
                  <Plus size={18} className="inline mr-1" />
                  Idagdag ang {FLOWER_META[type].label} sa Bouquet
                </button>
              </div>

              <div className="actions-row mt-3">
                <button type="button" className="secondary-btn" onClick={randomizeBouquet}>
                  <Shuffle size={15} className="inline mr-1" /> 🎲 Ikaw na Bahala
                </button>
                <button
                  type="button"
                  className="secondary-btn danger"
                  onClick={() => {
                    setFlowers([]);
                    setSelectedPresetId(null);
                    if (soundEnabled) playRustle();
                  }}
                  disabled={!flowers.length}
                >
                  <Trash2 size={15} className="inline mr-1" /> Burahin Lahat
                </button>
              </div>

              {/* Step Button */}
              <button
                type="button"
                className="step-next-btn mt-4"
                onClick={validateAndProceedToWrap}
              >
                Susunod: Balot at Estilo ➔
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: BALOT */}
        {activeTab === "wrap" && (
          <div className="tab-pane">
            <div className="section-label">Piliin ang Kulay at Estilo ng Balot</div>
            <div className="wraps-selector-grid">
              {WRAP_ORDER.map((w) => (
                <button
                  key={w}
                  type="button"
                  className={`wrap-option-card ${wrap === w ? "active" : ""}`}
                  aria-pressed={wrap === w}
                  onClick={() => {
                    setWrap(w);
                    if (soundEnabled) playRustle();
                  }}
                >
                  <div
                    className="wrap-preview-swatch"
                    style={{ background: WRAPS[w].color }}
                  >
                    <span
                      className="wrap-ribbon-line"
                      style={{ background: WRAPS[w].ribbon }}
                    />
                  </div>
                  <strong className="wrap-name">{WRAPS[w].label}</strong>
                  <span className="wrap-hint">
                    Laso: {WRAPS[w].ribbon.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>

            <div className="actions-row mt-6">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setActiveTab("flowers")}
              >
                ⬅ Bulaklak
              </button>
              <button
                type="button"
                className="step-next-btn"
                onClick={validateAndProceedToLetter}
              >
                Susunod: Sulat at Kanta ➔
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SULAT AT KANTA */}
        {activeTab === "letter" && (
          <div className="tab-pane">
            <div className="section-label">Disenyo ng Papel ng Sulat</div>
            <div className="themes-grid">
              {CARD_THEME_ORDER.map((themeId) => {
                const item = CARD_THEMES[themeId];
                return (
                  <button
                    key={themeId}
                    type="button"
                    className={`theme-card ${cardTheme === themeId ? "active" : ""}`}
                    style={{ background: item.bg, color: item.text, borderColor: item.border }}
                    onClick={() => {
                      setCardTheme(themeId);
                      if (soundEnabled) playRustle();
                    }}
                  >
                    <span className="theme-name">{item.label}</span>
                    <span className="theme-dot" style={{ background: item.accent }} />
                  </button>
                );
              })}
            </div>

            <div className="section-label mt-4">Wax Seal / Sticker sa Sobre</div>
            <div className="stickers-row">
              {STICKER_ORDER.map((sId) => (
                <button
                  key={sId}
                  type="button"
                  className={`sticker-btn ${sticker === sId ? "active" : ""}`}
                  onClick={() => {
                    setSticker(sId);
                    if (soundEnabled) playFlowerPop(1);
                  }}
                >
                  <span className="sticker-icon">{STICKER_META[sId].icon}</span>
                  <span className="sticker-label">{STICKER_META[sId].label}</span>
                </button>
              ))}
            </div>

            <div className="fields-group mt-4">
              {/* Para kay (REQUIRED - CANNOT PROCEED WITHOUT IT) */}
              <label className="input-field">
                <div className="field-header-row">
                  <span className="field-label">Para kay:</span>
                  <span className="field-required-tag">* Kinakailangan</span>
                </div>
                <input
                  type="text"
                  className={`text-input ${triedSubmit && !to.trim() ? "input-field-error" : ""}`}
                  placeholder="Pangalan o Palayaw (hal. Maria, Mahal ko, Nanay)..."
                  value={to}
                  maxLength={MAX_NAME}
                  onChange={(e) => setTo(e.target.value)}
                />
                {triedSubmit && !to.trim() && (
                  <span className="field-error-hint">⚠️ Kinakailangan ilagay ang pangalan sa &ldquo;Para kay&rdquo;</span>
                )}
              </label>

              {/* Mensahe */}
              <label className="input-field mt-3">
                <span className="field-label">Ang Iyong Sulat / Mensahe:</span>
                <textarea
                  className="textarea-input"
                  rows={4}
                  placeholder="Isulat ang iyong liham..."
                  value={msg}
                  maxLength={MAX_MSG}
                  onChange={(e) => setMsg(e.target.value)}
                />
                <div className="char-count">
                  {msg.length}/{MAX_MSG} titik
                </div>
              </label>

              {/* Mula kay (REQUIRED - CANNOT PROCEED WITHOUT IT) */}
              <label className="input-field mt-3">
                <div className="field-header-row">
                  <span className="field-label">Mula kay:</span>
                  <span className="field-required-tag">* Kinakailangan</span>
                </div>
                <input
                  type="text"
                  className={`text-input ${triedSubmit && !from.trim() ? "input-field-error" : ""}`}
                  placeholder="Pangalan mo (hal. Juan, Anak mo, Secret Admirer)..."
                  value={from}
                  maxLength={MAX_NAME}
                  onChange={(e) => setFrom(e.target.value)}
                />
                {triedSubmit && !from.trim() && (
                  <span className="field-error-hint">⚠️ Kinakailangan ilagay ang iyong pangalan sa &ldquo;Mula kay&rdquo;</span>
                )}
              </label>

              {/* Kalakip na Kanta na may Dropdown */}
              <div className="song-selector-section mt-4">
                <span className="field-label flex items-center gap-1">
                  <Music size={15} className="text-rose-500 inline mr-1" />
                  Kalakip na Kanta:
                </span>
                <span className="field-sub-hint">
                  Pumili sa drop-down ng mga sikat na kanta, o i-type ang sariling pamagat:
                </span>

                {/* Song Selection Dropdown */}
                <div className="song-dropdown-container mt-2">
                  <select
                    className="song-dropdown-select"
                    value={
                      SUGGESTED_SONGS.some((s) => s.title === songTitle && s.artist === songArtist)
                        ? `${songTitle} - ${songArtist}`
                        : ""
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const found = SUGGESTED_SONGS.find((s) => `${s.title} - ${s.artist}` === val);
                      if (found) {
                        setSongTitle(found.title);
                        setSongArtist(found.artist);
                        showToast(`Napiling kanta: ${found.title} 🎵`);
                      }
                    }}
                  >
                    <option value="">-- Pumili sa mga Sikat na Kanta --</option>
                    {SUGGESTED_SONGS.map((item) => (
                      <option key={`${item.title}-${item.artist}`} value={`${item.title} - ${item.artist}`}>
                        🎵 {item.title} — {item.artist}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="song-inputs-row mt-3">
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Pamagat ng Kanta"
                    value={songTitle}
                    maxLength={60}
                    onChange={(e) => setSongTitle(e.target.value)}
                  />
                  <input
                    type="text"
                    className="text-input mt-2"
                    placeholder="Mang-aawit / Artist (Opsyonal)"
                    value={songArtist}
                    maxLength={50}
                    onChange={(e) => setSongArtist(e.target.value)}
                  />
                </div>

                {songTitle.trim() && (
                  <span className="field-success-text mt-1 block">
                    ✓ Awtomatikong tutugtog ang &ldquo;{songTitle}&rdquo; pagkapindot ng Seal!
                  </span>
                )}
              </div>
            </div>

            <div className="actions-row mt-6">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setActiveTab("wrap")}
              >
                ⬅ Balot
              </button>
              <button
                type="button"
                className="step-next-btn"
                onClick={generateLink}
              >
                Tapusin at Gumawa ng Link ➔
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: IPADALA (MESSENGER & SHARE) */}
        {activeTab === "send" && (
          <div className="tab-pane">
            {!link ? (
              <div className="ready-generate-card">
                <div className="ready-icon">💌</div>
                <h3>Kulang pa ang detalye ng sulat</h3>
                <p>
                  Kailangan may nakalagay sa &ldquo;Para kay&rdquo; at &ldquo;Mula kay&rdquo; bago mabuo ang bouquet link.
                </p>
                <button
                  type="button"
                  className="primary-btn big-send-btn pulse-glow"
                  onClick={() => setActiveTab("letter")}
                >
                  <Mail size={18} className="inline mr-2" />
                  Punan ang Sulat (Para kay / Mula kay)
                </button>
              </div>
            ) : (
              <div className="share-results-card">
                <div className="share-badge">
                  <Check size={16} className="inline mr-1" /> Handa Nang Ipadala!
                </div>
                <h3 className="share-title">Nagawa na ang Digital Bouquet!</h3>
                <p className="share-desc">
                  Ipadala ito sa Messenger o chat. Pagkabukas ng selyo, maririnig ang kanta kasabay ng iyong liham at lumilipad na confetti!
                </p>

                {/* Link Box */}
                <div className="link-copy-container">
                  <input
                    type="text"
                    readOnly
                    className="generated-link-input"
                    value={link}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    type="button"
                    className={`copy-btn ${copied ? "copied" : ""}`}
                    onClick={copyLink}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? "Nakopya!" : "Kopyahin"}</span>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="share-buttons-stack">
                  <button
                    type="button"
                    className="messenger-btn"
                    onClick={messengerShare}
                  >
                    💬 Ipadala sa Messenger
                  </button>

                  <button
                    type="button"
                    className="native-share-btn"
                    onClick={nativeShare}
                  >
                    <Share2 size={16} className="inline mr-2" />
                    I-share (SMS, Telegram, IG, etc.)
                  </button>

                  <a
                    href={link + "?preview=1"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="preview-btn"
                  >
                    <ExternalLink size={16} className="inline mr-2" />
                    Tingnan ang Preview ng Tatanggap
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="floating-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}

      {/* Footer: Updated with SendBloom · Digital bouquet & Buy us coffee */}
      <footer className="builder-footer">
        <p className="footer-brand">SendBloom · Digital bouquet</p>
        <button
          type="button"
          className="coffee-footer-btn"
          onClick={() => setShowCoffeeModal(true)}
        >
          <Coffee size={14} className="inline mr-1.5 text-amber-600" />
          Buy us coffee
        </button>
      </footer>

      {/* Buy Us Coffee GCash Modal */}
      {showCoffeeModal && (
        <div
          className="coffee-modal-overlay"
          onClick={() => setShowCoffeeModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="coffee-modal-title"
        >
          <div className="coffee-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="coffee-modal-close"
              onClick={() => setShowCoffeeModal(false)}
              aria-label="Isara"
            >
              ✕
            </button>

            <div className="coffee-modal-header">
              <div className="coffee-icon-badge">☕</div>
              <h3 id="coffee-modal-title" className="coffee-modal-title">Buy Us a Coffee</h3>
              <p className="coffee-modal-desc">
                Salamat sa pagsuporta sa SendBloom! Ang inyong tulong ay malaking bagay upang mapanatiling mabilis, maayos, at patuloy na makapaghatid ng ligaya sa pamamagitan ng digital bouquets.
              </p>
            </div>

            {/* GCash Card */}
            <div className="gcash-card">
              <div className="gcash-top-bar">
                <span className="gcash-logo-text">G) GCash</span>
                <span className="gcash-scan-tag">Scan to Pay</span>
              </div>

              {/* QR Code SVG Placeholder */}
              <div className="gcash-qr-container">
                <svg
                  viewBox="0 0 200 200"
                  width="180"
                  height="180"
                  className="gcash-qr-svg"
                  role="img"
                  aria-label="GCash QR Code Placeholder"
                >
                  {/* Outer Background */}
                  <rect width="200" height="200" fill="#ffffff" rx="12" />

                  {/* Corner Position Detection Squares (Top-Left) */}
                  <rect x="20" y="20" width="46" height="46" rx="6" fill="#007dfe" />
                  <rect x="26" y="26" width="34" height="34" rx="4" fill="#ffffff" />
                  <rect x="32" y="32" width="22" height="22" rx="3" fill="#007dfe" />

                  {/* Corner Position Detection Squares (Top-Right) */}
                  <rect x="134" y="20" width="46" height="46" rx="6" fill="#007dfe" />
                  <rect x="140" y="26" width="34" height="34" rx="4" fill="#ffffff" />
                  <rect x="146" y="32" width="22" height="22" rx="3" fill="#007dfe" />

                  {/* Corner Position Detection Squares (Bottom-Left) */}
                  <rect x="20" y="134" width="46" height="46" rx="6" fill="#007dfe" />
                  <rect x="26" y="140" width="34" height="34" rx="4" fill="#ffffff" />
                  <rect x="32" y="146" width="22" height="22" rx="3" fill="#007dfe" />

                  {/* QR Matrix Bits */}
                  <rect x="74" y="22" width="8" height="8" fill="#1e293b" />
                  <rect x="88" y="22" width="8" height="8" fill="#1e293b" />
                  <rect x="102" y="22" width="8" height="8" fill="#1e293b" />
                  <rect x="116" y="22" width="8" height="8" fill="#1e293b" />

                  <rect x="74" y="36" width="8" height="8" fill="#1e293b" />
                  <rect x="102" y="36" width="8" height="8" fill="#1e293b" />

                  <rect x="88" y="50" width="8" height="8" fill="#1e293b" />
                  <rect x="116" y="50" width="8" height="8" fill="#1e293b" />

                  <rect x="22" y="74" width="8" height="8" fill="#1e293b" />
                  <rect x="36" y="74" width="8" height="8" fill="#1e293b" />
                  <rect x="50" y="74" width="8" height="8" fill="#1e293b" />
                  <rect x="64" y="74" width="8" height="8" fill="#1e293b" />
                  <rect x="78" y="74" width="8" height="8" fill="#1e293b" />
                  <rect x="122" y="74" width="8" height="8" fill="#1e293b" />
                  <rect x="150" y="74" width="8" height="8" fill="#1e293b" />
                  <rect x="164" y="74" width="8" height="8" fill="#1e293b" />

                  <rect x="22" y="88" width="8" height="8" fill="#1e293b" />
                  <rect x="50" y="88" width="8" height="8" fill="#1e293b" />
                  <rect x="136" y="88" width="8" height="8" fill="#1e293b" />
                  <rect x="164" y="88" width="8" height="8" fill="#1e293b" />

                  <rect x="22" y="102" width="8" height="8" fill="#1e293b" />
                  <rect x="36" y="102" width="8" height="8" fill="#1e293b" />
                  <rect x="64" y="102" width="8" height="8" fill="#1e293b" />
                  <rect x="122" y="102" width="8" height="8" fill="#1e293b" />
                  <rect x="150" y="102" width="8" height="8" fill="#1e293b" />

                  <rect x="74" y="122" width="8" height="8" fill="#1e293b" />
                  <rect x="102" y="122" width="8" height="8" fill="#1e293b" />
                  <rect x="116" y="122" width="8" height="8" fill="#1e293b" />
                  <rect x="150" y="122" width="8" height="8" fill="#1e293b" />

                  <rect x="74" y="136" width="8" height="8" fill="#1e293b" />
                  <rect x="88" y="136" width="8" height="8" fill="#1e293b" />
                  <rect x="136" y="136" width="8" height="8" fill="#1e293b" />
                  <rect x="164" y="136" width="8" height="8" fill="#1e293b" />

                  <rect x="88" y="150" width="8" height="8" fill="#1e293b" />
                  <rect x="102" y="150" width="8" height="8" fill="#1e293b" />
                  <rect x="122" y="150" width="8" height="8" fill="#1e293b" />

                  <rect x="74" y="164" width="8" height="8" fill="#1e293b" />
                  <rect x="116" y="164" width="8" height="8" fill="#1e293b" />
                  <rect x="136" y="164" width="8" height="8" fill="#1e293b" />
                  <rect x="164" y="164" width="8" height="8" fill="#1e293b" />

                  {/* Center GCash Shield Badge */}
                  <rect x="82" y="82" width="36" height="36" rx="8" fill="#007dfe" stroke="#ffffff" strokeWidth="3" />
                  <text x="100" y="104" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold" fontFamily="sans-serif">
                    G
                  </text>
                </svg>
              </div>

              {/* Account Details */}
              <div className="gcash-info-box">
                <span className="gcash-account-name">SendBloom Dev (Nash M.)</span>
                <span className="gcash-account-number">0956 0757 315</span>
              </div>

              <button
                type="button"
                className="gcash-copy-btn"
                onClick={copyGCashNumber}
              >
                {copiedGCash ? <Check size={15} className="inline mr-1" /> : <Copy size={15} className="inline mr-1" />}
                {copiedGCash ? "Nakopya na ang GCash Number!" : "Kopyahin ang GCash Number"}
              </button>
            </div>

            <button
              type="button"
              className="coffee-modal-done-btn"
              onClick={() => setShowCoffeeModal(false)}
            >
              Isara
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
