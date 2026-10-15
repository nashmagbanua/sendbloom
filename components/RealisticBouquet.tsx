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

  // Sizing: Strict 500/670 aspect ratio container so all layers are locked together
  const sizeStyles = {
    sm: "w-full max-w-[190px]",
    md: "w-full max-w-[260px]",
    lg: "w-full max-w-[340px]",
  }[size];

  // If any image fails or error occurs, gracefully fallback to original rock-solid SVG bouquet
  if (hasError) {
    return (
      <div className={`relative flex items-center justify-center mx-auto ${sizeStyles} aspect-[500/670] ${className}`}>
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
      className={`relative select-none mx-auto ${sizeStyles} aspect-[500/670] ${className}`}
      role="img"
      aria-label={`Makatotohanang bouquet: ${description}`}
    >
      {/* Soft Florist Ambient Backlight Glow */}
      <div
        className="absolute inset-x-4 top-2 h-1/2 rounded-full opacity-25 blur-2xl pointer-events-none transition-colors duration-500"
        style={{
          background: `radial-gradient(circle, ${WRAPS[wrap]?.color || "#ffd166"} 0%, rgba(255,255,255,0) 70%)`,
        }}
      />

      {/* ONE Shared 500x670 Stage: All layers occupy exact coordinates on this canvas */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Layer 0: Wrap Paper Cone (Back Layer) */}
        <img
          src={wrapAssets.full}
          alt=""
          width={500}
          height={670}
          className="absolute inset-0 w-full h-full object-fill filter drop-shadow(0 14px 28px rgba(0,0,0,0.22)) pointer-events-none select-none"
          loading="eager"
          onError={() => setHasError(true)}
        />

        {/* Layer 1: Left Eucalyptus foliage branch (shoulder framing) */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "20%",
            top: "13%",
            width: "32%",
            transform: "translate(-50%, -50%) rotate(-12deg)",
            zIndex: 2,
          }}
        >
          <img
            src={FOLIAGE_ASSET}
            alt=""
            width={180}
            height={180}
            className="w-full h-auto object-contain filter drop-shadow(0 4px 10px rgba(0,0,0,0.25))"
            loading="eager"
            onError={() => setHasError(true)}
          />
        </div>

        {/* Layer 1: Right Eucalyptus foliage branch (shoulder framing) */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "80%",
            top: "13%",
            width: "32%",
            transform: "translate(-50%, -50%) scaleX(-1) rotate(-12deg)",
            zIndex: 2,
          }}
        >
          <img
            src={FOLIAGE_ASSET}
            alt=""
            width={180}
            height={180}
            className="w-full h-auto object-contain filter drop-shadow(0 4px 10px rgba(0,0,0,0.25))"
            loading="eager"
            onError={() => setHasError(true)}
          />
        </div>

        {/* Layer 2: Flower Blooms Stage */}
        {safeFlowers.map((flower, idx) => {
          const pos = positions[idx] || {
            xPct: 50,
            yPct: 26,
            widthPct: 38,
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
                transform: `translate(-50%, -50%) rotate(${pos.rotate}deg)`,
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

        {/* Layer 3: Wrap Front Sleeve & Ribbon Bow (Front Lapel Overlay) */}
        <img
          src={wrapAssets.front}
          alt=""
          width={500}
          height={670}
          className="absolute inset-0 w-full h-full object-fill filter drop-shadow(0 6px 14px rgba(0,0,0,0.18)) pointer-events-none select-none"
          style={{ zIndex: 20 }}
          loading="eager"
          onError={() => setHasError(true)}
        />
      </div>
    </div>
  );
}
