import { FlowerType, WrapId, Flower } from "./constants";

export interface FlowerPosition {
  x: number; // percentage offset from center (-50 to 50)
  y: number; // percentage offset from center (-50 to 50)
  scale: number;
  rotate: number; // degrees
  zIndex: number;
}

/**
 * Returns the transparent photorealistic asset URL for a given flower type and color index.
 */
export function getFlowerAsset(type: FlowerType, colorIdx: number): string {
  // Ensure valid colorIdx
  const safeIdx = Math.max(0, Math.floor(colorIdx || 0));
  return `/flowers/${type}_${safeIdx}.webp`;
}

/**
 * Returns the transparent photorealistic wrap sleeve assets (full cone and front lapel overlay).
 */
export function getWrapAssets(wrapId: WrapId): { full: string; front: string } {
  const safeId = wrapId || "kraft";
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
 * Values are calibrated relative to the bouquet flower container:
 * x: percentage offset from center (-40 to 40)
 * y: percentage offset from baseline (-45 to 30)
 * scale: realistic relative scale
 * rotate: subtle natural florist tilt
 * zIndex: layer depth (lower = behind, higher = front)
 */
export const BOUQUET_LAYOUTS: Record<number, FlowerPosition[]> = {
  1: [
    { x: 0, y: -8, scale: 1.15, rotate: 2, zIndex: 10 },
  ],
  2: [
    { x: -16, y: -14, scale: 1.05, rotate: -8, zIndex: 8 },
    { x: 18, y: -2, scale: 1.1, rotate: 7, zIndex: 10 },
  ],
  3: [
    { x: 0, y: -28, scale: 1.02, rotate: -3, zIndex: 6 },
    { x: -24, y: 0, scale: 1.05, rotate: -12, zIndex: 9 },
    { x: 22, y: 4, scale: 1.08, rotate: 10, zIndex: 10 },
  ],
  4: [
    { x: 0, y: -34, scale: 0.98, rotate: 1, zIndex: 5 },
    { x: -26, y: -16, scale: 1.0, rotate: -14, zIndex: 7 },
    { x: 26, y: -12, scale: 1.0, rotate: 12, zIndex: 8 },
    { x: 2, y: 12, scale: 1.12, rotate: -4, zIndex: 12 },
  ],
  5: [
    { x: 0, y: -38, scale: 0.94, rotate: 2, zIndex: 5 },
    { x: -28, y: -20, scale: 0.98, rotate: -16, zIndex: 7 },
    { x: 28, y: -18, scale: 0.98, rotate: 15, zIndex: 8 },
    { x: -18, y: 10, scale: 1.06, rotate: -8, zIndex: 11 },
    { x: 20, y: 14, scale: 1.08, rotate: 9, zIndex: 12 },
  ],
  6: [
    { x: -18, y: -40, scale: 0.92, rotate: -10, zIndex: 5 },
    { x: 18, y: -38, scale: 0.92, rotate: 8, zIndex: 6 },
    { x: -32, y: -14, scale: 0.96, rotate: -18, zIndex: 7 },
    { x: 0, y: -16, scale: 1.02, rotate: 0, zIndex: 9 },
    { x: 32, y: -12, scale: 0.96, rotate: 16, zIndex: 8 },
    { x: 2, y: 18, scale: 1.12, rotate: -3, zIndex: 12 },
  ],
  7: [
    { x: 0, y: -44, scale: 0.92, rotate: 0, zIndex: 4 },
    { x: -28, y: -28, scale: 0.94, rotate: -15, zIndex: 6 },
    { x: 28, y: -26, scale: 0.94, rotate: 14, zIndex: 7 },
    { x: 0, y: -12, scale: 1.04, rotate: 3, zIndex: 9 },
    { x: -34, y: 8, scale: 0.98, rotate: -12, zIndex: 10 },
    { x: 32, y: 10, scale: 0.98, rotate: 11, zIndex: 11 },
    { x: -2, y: 24, scale: 1.1, rotate: -2, zIndex: 13 },
  ],
  8: [
    { x: -16, y: -46, scale: 0.88, rotate: -8, zIndex: 4 },
    { x: 16, y: -44, scale: 0.88, rotate: 9, zIndex: 5 },
    { x: -34, y: -26, scale: 0.94, rotate: -16, zIndex: 6 },
    { x: 0, y: -24, scale: 1.0, rotate: -2, zIndex: 8 },
    { x: 34, y: -22, scale: 0.94, rotate: 15, zIndex: 7 },
    { x: -24, y: 6, scale: 1.02, rotate: -10, zIndex: 10 },
    { x: 24, y: 8, scale: 1.02, rotate: 8, zIndex: 11 },
    { x: 0, y: 26, scale: 1.12, rotate: 3, zIndex: 13 },
  ],
  9: [
    { x: 0, y: -50, scale: 0.88, rotate: 2, zIndex: 4 },
    { x: -28, y: -38, scale: 0.9, rotate: -14, zIndex: 5 },
    { x: 28, y: -36, scale: 0.9, rotate: 12, zIndex: 6 },
    { x: -36, y: -12, scale: 0.94, rotate: -18, zIndex: 7 },
    { x: 0, y: -16, scale: 1.02, rotate: -1, zIndex: 9 },
    { x: 36, y: -10, scale: 0.94, rotate: 16, zIndex: 8 },
    { x: -22, y: 14, scale: 1.05, rotate: -8, zIndex: 11 },
    { x: 22, y: 16, scale: 1.05, rotate: 10, zIndex: 12 },
    { x: 0, y: 28, scale: 1.14, rotate: 1, zIndex: 14 },
  ],
};

/**
 * Returns layout positions for a specific bouquet flower array.
 */
export function getBouquetPositions(flowers: Flower[]): FlowerPosition[] {
  const count = Math.min(9, Math.max(1, flowers.length));
  const baseLayout = BOUQUET_LAYOUTS[count] || BOUQUET_LAYOUTS[1];
  return baseLayout.slice(0, flowers.length);
}
