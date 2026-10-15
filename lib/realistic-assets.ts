import { FlowerType, WrapId, Flower } from "./constants";

export interface FlowerPosition {
  xPct: number; // percentage from left of bouquet stage (0 to 100)
  yPct: number; // percentage from top of bouquet stage (0 to 100)
  widthPct: number; // width percentage relative to container width
  rotate: number; // degrees tilt
  zIndex: number;
}

const MAX_COLORS: Record<FlowerType, number> = {
  rose: 5,
  tulip: 5,
  daisy: 4,
  sunflower: 2,
  lily: 4,
};

const VALID_WRAPS: WrapId[] = ["kraft", "rose", "mint", "night"];

/**
 * Returns the transparent photorealistic asset URL for a given flower type and color index.
 */
export function getFlowerAsset(type: FlowerType, colorIdx: number): string {
  const safeType: FlowerType = MAX_COLORS[type] ? type : "rose";
  const max = MAX_COLORS[safeType];
  const safeIdx = Math.min(max - 1, Math.max(0, Math.floor(colorIdx || 0)));
  return `/flowers/${safeType}_${safeIdx}.webp`;
}

/**
 * Returns the transparent photorealistic wrap sleeve assets (full cone and front lapel overlay).
 */
export function getWrapAssets(wrapId: WrapId): { full: string; front: string } {
  const safeId = VALID_WRAPS.includes(wrapId) ? wrapId : "kraft";
  return {
    full: `/wraps/wrap_${safeId}_full.webp`,
    front: `/wraps/wrap_${safeId}_front.webp`,
  };
}

/**
 * Realistic foliage accent asset
 */
export const FOLIAGE_ASSET = "/flowers/foliage_eucalyptus.webp";

/**
 * Deterministic florist composition layouts for 1 to 9 flowers.
 * Coordinates are mapped to the 500x670 bouquet container:
 * - Back collar opening: y ~90 to 220 (13% to 33%)
 * - Front wrap collar starts at y ~255 (38%)
 * - Flowers flare outward naturally with stems tucking into the wrap throat
 */
export const REALISTIC_BOUQUET_LAYOUTS: Record<number, FlowerPosition[]> = {
  1: [
    { xPct: 50, yPct: 26.1, widthPct: 42, rotate: 0, zIndex: 10 },
  ],
  2: [
    { xPct: 41, yPct: 26.9, widthPct: 38, rotate: -8, zIndex: 8 },
    { xPct: 59, yPct: 26.9, widthPct: 38, rotate: 8, zIndex: 10 },
  ],
  3: [
    { xPct: 50, yPct: 20.9, widthPct: 36, rotate: 0, zIndex: 7 },
    { xPct: 39, yPct: 29.1, widthPct: 37, rotate: -8, zIndex: 9 },
    { xPct: 61, yPct: 29.1, widthPct: 37, rotate: 8, zIndex: 10 },
  ],
  4: [
    { xPct: 42, yPct: 21.6, widthPct: 33, rotate: -6, zIndex: 6 },
    { xPct: 58, yPct: 21.6, widthPct: 33, rotate: 6, zIndex: 7 },
    { xPct: 35, yPct: 30.6, widthPct: 35, rotate: -10, zIndex: 9 },
    { xPct: 65, yPct: 30.6, widthPct: 35, rotate: 10, zIndex: 10 },
  ],
  5: [
    { xPct: 50, yPct: 18.7, widthPct: 31, rotate: 0, zIndex: 6 },
    { xPct: 36, yPct: 24.6, widthPct: 32, rotate: -10, zIndex: 7 },
    { xPct: 64, yPct: 24.6, widthPct: 32, rotate: 10, zIndex: 8 },
    { xPct: 42, yPct: 32.1, widthPct: 33, rotate: -6, zIndex: 10 },
    { xPct: 58, yPct: 32.1, widthPct: 33, rotate: 6, zIndex: 11 },
  ],
  6: [
    { xPct: 42, yPct: 17.9, widthPct: 30, rotate: -6, zIndex: 6 },
    { xPct: 58, yPct: 17.9, widthPct: 30, rotate: 6, zIndex: 7 },
    { xPct: 31, yPct: 24.6, widthPct: 31, rotate: -12, zIndex: 8 },
    { xPct: 69, yPct: 24.6, widthPct: 31, rotate: 12, zIndex: 9 },
    { xPct: 41, yPct: 32.1, widthPct: 32, rotate: -5, zIndex: 11 },
    { xPct: 59, yPct: 32.1, widthPct: 32, rotate: 5, zIndex: 12 },
  ],
  7: [
    { xPct: 50, yPct: 15.7, widthPct: 29, rotate: 0, zIndex: 5 },
    { xPct: 36, yPct: 20.9, widthPct: 29.6, rotate: -8, zIndex: 6 },
    { xPct: 64, yPct: 20.9, widthPct: 29.6, rotate: 8, zIndex: 7 },
    { xPct: 50, yPct: 24.6, widthPct: 30.4, rotate: 0, zIndex: 8 },
    { xPct: 30, yPct: 28.4, widthPct: 30, rotate: -12, zIndex: 9 },
    { xPct: 70, yPct: 28.4, widthPct: 30, rotate: 12, zIndex: 10 },
    { xPct: 50, yPct: 32.8, widthPct: 32, rotate: 2, zIndex: 12 },
  ],
  8: [
    { xPct: 41, yPct: 15.7, widthPct: 28.4, rotate: -6, zIndex: 5 },
    { xPct: 59, yPct: 15.7, widthPct: 28.4, rotate: 6, zIndex: 6 },
    { xPct: 30, yPct: 22.4, widthPct: 29.2, rotate: -12, zIndex: 7 },
    { xPct: 50, yPct: 22.4, widthPct: 30, rotate: 0, zIndex: 8 },
    { xPct: 70, yPct: 22.4, widthPct: 29.2, rotate: 12, zIndex: 9 },
    { xPct: 39, yPct: 30.6, widthPct: 31, rotate: -7, zIndex: 11 },
    { xPct: 61, yPct: 30.6, widthPct: 31, rotate: 7, zIndex: 12 },
    { xPct: 50, yPct: 32.8, widthPct: 31.6, rotate: 0, zIndex: 13 },
  ],
  9: [
    { xPct: 50, yPct: 14.2, widthPct: 29, rotate: 0, zIndex: 5 },
    { xPct: 38, yPct: 17.9, widthPct: 29, rotate: -10, zIndex: 6 },
    { xPct: 62, yPct: 17.9, widthPct: 29, rotate: 10, zIndex: 7 },
    { xPct: 29, yPct: 24.6, widthPct: 30, rotate: -14, zIndex: 8 },
    { xPct: 50, yPct: 23.1, widthPct: 31, rotate: 0, zIndex: 9 },
    { xPct: 71, yPct: 24.6, widthPct: 30, rotate: 14, zIndex: 10 },
    { xPct: 37, yPct: 32.1, widthPct: 31, rotate: -8, zIndex: 11 },
    { xPct: 50, yPct: 32.8, widthPct: 32, rotate: 2, zIndex: 12 },
    { xPct: 63, yPct: 32.1, widthPct: 31, rotate: 8, zIndex: 13 },
  ],
};

/**
 * Returns layout positions for a specific bouquet flower array.
 */
export function getBouquetPositions(flowers: Flower[]): FlowerPosition[] {
  const count = Math.min(9, Math.max(1, flowers.length));
  const baseLayout = REALISTIC_BOUQUET_LAYOUTS[count] || REALISTIC_BOUQUET_LAYOUTS[1];
  return baseLayout.slice(0, flowers.length);
}
