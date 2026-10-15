import { FlowerType, WrapId, Flower } from "./constants";

export interface FlowerPosition {
  xPct: number; // percentage from left of bouquet stage (0 to 100)
  yPct: number; // percentage from top of bouquet stage (0 to 100)
  widthPct: number; // width percentage relative to container width
  scale: number;
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
 * - Back collar opening: yPct ~12% to ~36%
 * - Front wrap collar starts at yPct ~35.4%
 * - Flowers flare outward naturally with stems tucking into the wrap throat
 */
export const REALISTIC_BOUQUET_LAYOUTS: Record<number, FlowerPosition[]> = {
  1: [
    { xPct: 50, yPct: 26, widthPct: 38, scale: 1.1, rotate: 2, zIndex: 10 },
  ],
  2: [
    { xPct: 40, yPct: 25, widthPct: 34, scale: 1.05, rotate: -8, zIndex: 9 },
    { xPct: 60, yPct: 27, widthPct: 35, scale: 1.08, rotate: 7, zIndex: 10 },
  ],
  3: [
    { xPct: 50, yPct: 21, widthPct: 33, scale: 1.02, rotate: -2, zIndex: 8 },
    { xPct: 35, yPct: 28, widthPct: 34, scale: 1.06, rotate: -10, zIndex: 10 },
    { xPct: 65, yPct: 28, widthPct: 34, scale: 1.06, rotate: 10, zIndex: 11 },
  ],
  4: [
    { xPct: 42, yPct: 20, widthPct: 31, scale: 1.0, rotate: -6, zIndex: 7 },
    { xPct: 58, yPct: 20, widthPct: 31, scale: 1.0, rotate: 6, zIndex: 8 },
    { xPct: 33, yPct: 28, widthPct: 33, scale: 1.05, rotate: -12, zIndex: 10 },
    { xPct: 67, yPct: 28, widthPct: 33, scale: 1.05, rotate: 12, zIndex: 11 },
  ],
  5: [
    { xPct: 50, yPct: 18, widthPct: 30, scale: 0.98, rotate: 2, zIndex: 6 },
    { xPct: 34, yPct: 23, widthPct: 31, scale: 1.02, rotate: -12, zIndex: 8 },
    { xPct: 66, yPct: 23, widthPct: 31, scale: 1.02, rotate: 12, zIndex: 9 },
    { xPct: 41, yPct: 30, widthPct: 33, scale: 1.06, rotate: -6, zIndex: 11 },
    { xPct: 59, yPct: 30, widthPct: 33, scale: 1.06, rotate: 7, zIndex: 12 },
  ],
  6: [
    { xPct: 41, yPct: 18, widthPct: 29, scale: 0.96, rotate: -6, zIndex: 6 },
    { xPct: 59, yPct: 18, widthPct: 29, scale: 0.96, rotate: 6, zIndex: 7 },
    { xPct: 28, yPct: 24, widthPct: 30, scale: 1.0, rotate: -15, zIndex: 8 },
    { xPct: 72, yPct: 24, widthPct: 30, scale: 1.0, rotate: 15, zIndex: 9 },
    { xPct: 40, yPct: 30, widthPct: 32, scale: 1.05, rotate: -5, zIndex: 11 },
    { xPct: 60, yPct: 30, widthPct: 32, scale: 1.05, rotate: 6, zIndex: 12 },
  ],
  7: [
    { xPct: 50, yPct: 16, widthPct: 28, scale: 0.94, rotate: 1, zIndex: 5 },
    { xPct: 34, yPct: 20, widthPct: 29, scale: 0.98, rotate: -10, zIndex: 7 },
    { xPct: 66, yPct: 20, widthPct: 29, scale: 0.98, rotate: 10, zIndex: 8 },
    { xPct: 50, yPct: 25, widthPct: 30, scale: 1.02, rotate: 0, zIndex: 9 },
    { xPct: 26, yPct: 27, widthPct: 29, scale: 1.0, rotate: -16, zIndex: 10 },
    { xPct: 74, yPct: 27, widthPct: 29, scale: 1.0, rotate: 16, zIndex: 11 },
    { xPct: 50, yPct: 31, widthPct: 32, scale: 1.06, rotate: 2, zIndex: 13 },
  ],
  8: [
    { xPct: 40, yPct: 16, widthPct: 27, scale: 0.92, rotate: -7, zIndex: 5 },
    { xPct: 60, yPct: 16, widthPct: 27, scale: 0.92, rotate: 7, zIndex: 6 },
    { xPct: 27, yPct: 22, widthPct: 28, scale: 0.96, rotate: -14, zIndex: 7 },
    { xPct: 50, yPct: 22, widthPct: 29, scale: 1.0, rotate: 0, zIndex: 8 },
    { xPct: 73, yPct: 22, widthPct: 28, scale: 0.96, rotate: 14, zIndex: 9 },
    { xPct: 33, yPct: 29, widthPct: 31, scale: 1.04, rotate: -8, zIndex: 11 },
    { xPct: 67, yPct: 29, widthPct: 31, scale: 1.04, rotate: 8, zIndex: 12 },
    { xPct: 50, yPct: 32, widthPct: 32, scale: 1.06, rotate: 1, zIndex: 13 },
  ],
  9: [
    { xPct: 50, yPct: 14, widthPct: 26, scale: 0.9, rotate: 0, zIndex: 5 },
    { xPct: 33, yPct: 18, widthPct: 27, scale: 0.94, rotate: -11, zIndex: 6 },
    { xPct: 67, yPct: 18, widthPct: 27, scale: 0.94, rotate: 11, zIndex: 7 },
    { xPct: 24, yPct: 24, widthPct: 28, scale: 0.97, rotate: -16, zIndex: 8 },
    { xPct: 50, yPct: 23, widthPct: 29, scale: 1.0, rotate: 2, zIndex: 9 },
    { xPct: 76, yPct: 24, widthPct: 28, scale: 0.97, rotate: 16, zIndex: 10 },
    { xPct: 33, yPct: 30, widthPct: 30, scale: 1.03, rotate: -7, zIndex: 11 },
    { xPct: 67, yPct: 30, widthPct: 30, scale: 1.03, rotate: 7, zIndex: 12 },
    { xPct: 50, yPct: 32, widthPct: 31, scale: 1.06, rotate: -1, zIndex: 13 },
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
