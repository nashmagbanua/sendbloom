"use client";

import React, { useMemo, useState } from "react";
import BouquetSVG from "./BouquetSVG";
import { Flower, WrapId, FLOWER_META, WRAPS } from "../lib/constants";
import { getFlowerAsset, getWrapAssets, getBouquetPositions, FOLIAGE_ASSET } from "../lib/realistic-assets";

interface RealisticBouquetProps {
  flowers: Flower[];
  wrap: WrapId;
  className?: string;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}

export function RealisticBouquet({
  flowers,
  wrap,
  className = "",
  size = "md",
}: RealisticBouquetProps) {
  // Fail-safe flag: if any realistic asset fails to load, gracefully fallback to BouquetSVG
  const [hasError, setHasError] = useState(false);

  // Ensure we have at least 1 flower safely
  const safeFlowers = useMemo(() => {
    if (!flowers || flowers.length === 0) {
      return [{ t: "rose" as const, c: 0 }];
    }
    return flowers.slice(0, 9);
  }, [flowers]);

  const wrapAssets = useMemo(() => getWrapAssets(wrap), [wrap]);
  const positions = useMemo(() => getBouquetPositions(safeFlowers), [safeFlowers]);

  // Proportional responsive sizing that fits within stage-svg-box and reveal views
  const sizeStyles = {
    sm: "w-full max-w-[200px] aspect-[500/670]",
    md: "w-full max-w-[280px] aspect-[500/670] max-h-[260px]",
    lg: "w-full max-w-[340px] aspect-[500/670]",
  }[size];

  // If any image fails or error occurs, gracefully fallback to original rock-solid SVG bouquet
  if (hasError) {
    return (
      <div className={`relative flex items-center justify-center mx-auto ${sizeStyles} ${className}`}>
        <BouquetSVG data={{ f: safeFlowers, w: wrap }} animated={false} />
      </div>
    );
  }

  // Description for accessibility
  const description = safeFlowers
    .map((f) => FLOWER_META[f.t]?.label || f.t)
    .join(", ");

  return (
    <div
      className={`relative select-none flex items-center justify-center mx-auto overflow-visible ${sizeStyles} ${className}`}
      role="img"
      aria-label={`Makatotohanang bouquet: ${description}`}
    >
      {/* Soft Florist Ambient Backlight Glow */}
      <div
        className="absolute inset-0 -top-4 rounded-full opacity-30 blur-2xl pointer-events-none transition-colors duration-500"
        style={{
          background: `radial-gradient(circle, ${WRAPS[wrap]?.color || "#ffd166"} 0%, rgba(255,255,255,0) 70%)`,
        }}
      />

      {/* Main Bouquet Composition Stage */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Layer 0: Wrap Paper Cone (Back Layer) */}
        <img
          src={wrapAssets.full}
          alt=""
          width={500}
          height={670}
          className="absolute inset-0 w-full h-full object-contain filter drop-shadow(0 12px 24px rgba(0,0,0,0.22)) pointer-events-none"
          loading="eager"
          onError={() => setHasError(true)}
        />

        {/* Layer 1: Lush Florist Greenery / Eucalyptus (Behind Blooms) */}
        <div
          className="absolute pointer-events-none w-[78%] h-[50%] top-[4%] left-[11%] opacity-90"
          style={{ zIndex: 2 }}
        >
          {/* Left eucalyptus branch */}
          <div
            className="absolute -left-[8%] top-[8%] w-[52%] aspect-square transform -rotate-25 scale-90 filter drop-shadow(0 4px 10px rgba(0,0,0,0.3))"
            style={{ willChange: "transform" }}
          >
            <img
              src={FOLIAGE_ASSET}
              alt=""
              width={200}
              height={200}
              className="w-full h-full object-contain"
              loading="eager"
              onError={() => setHasError(true)}
            />
          </div>
          {/* Right eucalyptus branch */}
          <div
            className="absolute -right-[8%] top-[6%] w-[52%] aspect-square transform rotate-28 scale-95 scale-x-[-1] filter drop-shadow(0 4px 10px rgba(0,0,0,0.3))"
            style={{ willChange: "transform" }}
          >
            <img
              src={FOLIAGE_ASSET}
              alt=""
              width={200}
              height={200}
              className="w-full h-full object-contain"
              loading="eager"
              onError={() => setHasError(true)}
            />
          </div>
        </div>

        {/* Layer 2: Flower Blooms Stage */}
        {safeFlowers.map((flower, idx) => {
          const pos = positions[idx] || {
            xPct: 50,
            yPct: 26,
            widthPct: 34,
            scale: 1,
            rotate: 0,
            zIndex: 10,
          };
          const flowerSrc = getFlowerAsset(flower.t, flower.c);

          return (
            <div
              key={`${flower.t}-${flower.c}-${idx}`}
              className="absolute pointer-events-none transition-transform duration-300 ease-out"
              style={{
                width: `${pos.widthPct}%`,
                left: `${pos.xPct}%`,
                top: `${pos.yPct}%`,
                transform: `translate(-50%, -50%) rotate(${pos.rotate}deg) scale(${pos.scale})`,
                zIndex: pos.zIndex,
                willChange: "transform",
              }}
            >
              <img
                src={flowerSrc}
                alt={FLOWER_META[flower.t]?.label || flower.t}
                width={180}
                height={180}
                className="w-full h-auto object-contain filter drop-shadow(0 6px 14px rgba(0,0,0,0.35)) select-none"
                loading="eager"
                onError={() => setHasError(true)}
              />
            </div>
          );
        })}

        {/* Layer 3: Wrap Front Sleeve & Ribbon Bow (Front Pocket Overlay) */}
        <img
          src={wrapAssets.front}
          alt=""
          width={500}
          height={670}
          className="absolute inset-0 w-full h-full object-contain filter drop-shadow(0 6px 14px rgba(0,0,0,0.18)) pointer-events-none"
          style={{ zIndex: 20 }}
          loading="eager"
          onError={() => setHasError(true)}
        />

        {/* Subtle realistic gloss highlight over ribbon */}
        <div
          className="absolute pointer-events-none w-[42%] h-[7%] top-[51%] left-1/2 -translate-x-1/2 rounded-full opacity-20 blur-sm"
          style={{
            zIndex: 25,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)",
          }}
        />
      </div>
    </div>
  );
}
