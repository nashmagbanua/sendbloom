"use client";

import React, { useMemo } from "react";
import Image from "next/image";
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
  // Ensure we have at least 1 flower safely
  const safeFlowers = useMemo(() => {
    if (!flowers || flowers.length === 0) {
      return [{ t: "rose" as const, c: 0 }];
    }
    return flowers.slice(0, 9);
  }, [flowers]);

  const wrapAssets = useMemo(() => getWrapAssets(wrap), [wrap]);
  const positions = useMemo(() => getBouquetPositions(safeFlowers), [safeFlowers]);

  // Proportional responsive sizing
  const sizeStyles = {
    sm: "w-full max-w-[220px] aspect-[3/4]",
    md: "w-full max-w-[340px] aspect-[3/4]",
    lg: "w-full max-w-[420px] aspect-[3/4]",
  }[size];

  // Description for accessibility
  const description = useMemo(() => {
    const counts: Record<string, number> = {};
    safeFlowers.forEach((f) => {
      const name = FLOWER_META[f.t]?.label || f.t;
      counts[name] = (counts[name] || 0) + 1;
    });
    const summary = Object.entries(counts)
      .map(([name, count]) => `${count} ${name}`)
      .join(", ");
    const wrapName = WRAPS[wrap]?.label || wrap;
    return `Makatotohanang bouquet na may ${summary} sa ${wrapName} na balot`;
  }, [safeFlowers, wrap]);

  return (
    <div
      className={`relative select-none flex items-center justify-center mx-auto overflow-visible ${sizeStyles} ${className}`}
      role="img"
      aria-label={description}
    >
      {/* Soft Florist Ambient Backlight Glow */}
      <div
        className="absolute inset-0 -top-6 rounded-full opacity-35 blur-3xl pointer-events-none transition-colors duration-700"
        style={{
          background: `radial-gradient(circle, ${WRAPS[wrap]?.color || "#ffd166"} 0%, rgba(255,255,255,0) 70%)`,
        }}
      />

      {/* Main Bouquet Composition Stage */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Layer 0: Wrap Paper Cone (Back Layer) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src={wrapAssets.full}
            alt=""
            fill
            sizes="(max-width: 640px) 340px, 420px"
            className="object-contain filter drop-shadow(0 14px 28px rgba(0, 0, 0, 0.22))"
            priority
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Layer 1: Lush Florist Greenery / Eucalyptus (Behind Blooms) */}
        <div className="absolute z-1 pointer-events-none w-[74%] h-[55%] top-[5%] left-[13%] opacity-90">
          {/* Left eucalyptus branch */}
          <div
            className="absolute -left-[10%] top-[4%] w-[55%] aspect-square transform -rotate-25 scale-90 filter drop-shadow(0 6px 12px rgba(0,0,0,0.3)) opacity-90"
            style={{ willChange: "transform" }}
          >
            <Image
              src={FOLIAGE_ASSET}
              alt=""
              fill
              sizes="150px"
              className="object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Right eucalyptus branch */}
          <div
            className="absolute -right-[10%] top-[2%] w-[55%] aspect-square transform rotate-30 scale-95 scale-x-[-1] filter drop-shadow(0 6px 12px rgba(0,0,0,0.3)) opacity-85"
            style={{ willChange: "transform" }}
          >
            <Image
              src={FOLIAGE_ASSET}
              alt=""
              fill
              sizes="150px"
              className="object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Layer 2: Flower Blooms Stage */}
        {/* Flowers positioned between top cone edge and throat */}
        <div className="absolute top-[8%] left-[6%] right-[6%] h-[50%] z-5 pointer-events-none">
          {safeFlowers.map((flower, idx) => {
            const pos = positions[idx] || { x: 0, y: 0, scale: 1, rotate: 0, zIndex: 10 };
            const flowerSrc = getFlowerAsset(flower.t, flower.c);

            return (
              <div
                key={`${flower.t}-${flower.c}-${idx}`}
                className="absolute transition-transform duration-500 ease-out"
                style={{
                  width: "40%",
                  aspectRatio: "1/1",
                  left: `calc(50% + ${pos.x * 0.9}%)`,
                  top: `calc(50% + ${pos.y * 0.9}%)`,
                  transform: `translate(-50%, -50%) rotate(${pos.rotate}deg) scale(${pos.scale})`,
                  zIndex: pos.zIndex,
                  willChange: "transform",
                }}
              >
                <div className="relative w-full h-full filter drop-shadow(0 8px 16px rgba(0,0,0,0.38))">
                  <Image
                    src={flowerSrc}
                    alt={`${FLOWER_META[flower.t]?.label || flower.t}`}
                    fill
                    sizes="160px"
                    className="object-contain hover:scale-105 transition-transform duration-300"
                    priority={idx < 4}
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Layer 3: Wrap Front Sleeve & Ribbon Bow (Front Layer) */}
        {/* Placed on top (z-index 20) so flower bases are tucked naturally inside the cone! */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <Image
            src={wrapAssets.front}
            alt=""
            fill
            sizes="(max-width: 640px) 340px, 420px"
            className="object-contain filter drop-shadow(0 6px 14px rgba(0,0,0,0.18))"
            priority
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Subtle realistic gloss / sheen highlight over ribbon */}
        <div
          className="absolute z-25 pointer-events-none w-[42%] h-[8%] top-[50%] left-1/2 -translate-x-1/2 rounded-full opacity-20 blur-md"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
          }}
        />
      </div>
    </div>
  );
}
