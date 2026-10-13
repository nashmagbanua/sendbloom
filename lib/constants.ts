export type FlowerType = "rose" | "tulip" | "daisy" | "sunflower" | "lily";
export type WrapId = "kraft" | "rose" | "mint" | "night";
export type Flower = { t: FlowerType; c: number };

export type Bouquet = {
  to: string;
  from: string;
  msg: string;
  w: WrapId;
  f: Flower[];
  /** optional https link to a song (YouTube, Spotify, ...) */
  s?: string;
};

export const MAX_FLOWERS = 9;
export const MAX_NAME = 30;
export const MAX_MSG = 240;
export const MAX_LINK = 300;

export const FLOWER_ORDER: FlowerType[] = ["rose", "tulip", "daisy", "sunflower", "lily"];

export const FLOWER_META: Record<FlowerType, { label: string; code: string; colors: string[] }> = {
  rose: { label: "Rosas", code: "r", colors: ["#e63956", "#ff8fa3", "#fff1f2", "#f4a261", "#b5179e"] },
  tulip: { label: "Tulip", code: "t", colors: ["#ff5d8f", "#ffd166", "#ffffff", "#9b5de5", "#ef476f"] },
  daisy: { label: "Daisy", code: "d", colors: ["#ffffff", "#ffe0ea", "#d8c4f0", "#ffe08a"] },
  sunflower: { label: "Sunflower", code: "s", colors: ["#ffc300", "#ff9f1c"] },
  lily: { label: "Liryo", code: "l", colors: ["#ffffff", "#ffafcc", "#ff8a3d", "#c77dff"] },
};

export const WRAPS: Record<WrapId, { label: string; color: string; fold: string; ribbon: string }> = {
  kraft: { label: "Kraft", color: "#d9b38c", fold: "#f1d9bd", ribbon: "#e8506a" },
  rose: { label: "Rosas", color: "#f4a9b8", fold: "#ffd6df", ribbon: "#ffffff" },
  mint: { label: "Mint", color: "#9fd8c3", fold: "#d4f1e6", ribbon: "#ff8fa3" },
  night: { label: "Gabi", color: "#3b3a5c", fold: "#6a68a0", ribbon: "#ffc857" },
};

export const WRAP_ORDER: WrapId[] = ["kraft", "rose", "mint", "night"];
