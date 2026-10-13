export type FlowerType = "rose" | "tulip" | "daisy" | "sunflower" | "lily";
export type WrapId = "kraft" | "rose" | "mint" | "night";
export type Flower = { t: FlowerType; c: number };

export type StickerId = "heart" | "sparkles" | "butterfly" | "ribbon" | "cupid";
export type CardTheme = "classic" | "parchment" | "romantic" | "midnight";

export type Bouquet = {
  to: string;
  from: string;
  msg: string;
  w: WrapId;
  f: Flower[];
  /** optional legacy https link to a song */
  s?: string;
  /** song title for automatic search & play */
  st?: string;
  /** song artist for automatic search & play */
  sa?: string;
  /** optional sticker on note or seal */
  k?: StickerId;
  /** optional stationery theme */
  c?: CardTheme;
};

export const MAX_FLOWERS = 9;
export const MAX_NAME = 30;
export const MAX_MSG = 240;
export const MAX_LINK = 300;
export const MAX_SONG_TEXT = 60;

export const SUGGESTED_SONGS = [
  { title: "Palagi", artist: "TJ Monterde" },
  { title: "Pasilyo", artist: "SunKissed Lola" },
  { title: "Dilaw", artist: "Maki" },
  { title: "Until I Found You", artist: "Stephen Sanchez" },
  { title: "Ikaw at Ako", artist: "Moira Dela Torre" },
  { title: "Tahanan", artist: "Adie" },
  { title: "Golden Hour", artist: "JVKE" },
  { title: "Misteryoso", artist: "Cup of Joe" },
];

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

export const STICKER_META: Record<StickerId, { label: string; icon: string }> = {
  heart: { label: "Puso", icon: "💖" },
  sparkles: { label: "Kutitap", icon: "✨" },
  butterfly: { label: "Paru-paro", icon: "🦋" },
  ribbon: { label: "Laso", icon: "🎀" },
  cupid: { label: "Kupido", icon: "💘" },
};
export const STICKER_ORDER: StickerId[] = ["heart", "sparkles", "butterfly", "ribbon", "cupid"];

export const CARD_THEMES: Record<CardTheme, { label: string; bg: string; text: string; border: string; accent: string }> = {
  classic: { label: "Klasiko", bg: "#fffaf3", text: "#4a2c36", border: "#f0d9d9", accent: "#c43553" },
  parchment: { label: "Vintage", bg: "#f7efe1", text: "#422817", border: "#decbaf", accent: "#8c5627" },
  romantic: { label: "Kilig", bg: "#fff0f3", text: "#521b2d", border: "#ffccd5", accent: "#e8506a" },
  midnight: { label: "Gabi", bg: "#1f1d36", text: "#e9d5ff", border: "#3f3b6c", accent: "#ffd166" },
};
export const CARD_THEME_ORDER: CardTheme[] = ["classic", "parchment", "romantic", "midnight"];

export type Preset = {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  wrap: WrapId;
  flowers: Flower[];
  cardTheme: CardTheme;
  sticker: StickerId;
  defaultMsg?: string;
};

export const PRESETS: Preset[] = [
  {
    id: "birthday",
    name: "Pang-Birthday 🎂",
    emoji: "🎂",
    desc: "Matingkad na sunflower at daisies para sa kaarawan",
    wrap: "kraft",
    cardTheme: "classic",
    sticker: "sparkles",
    defaultMsg: "Maligayang Kaarawan! Nawa'y mapuno ng ngiti, ligaya, at pagpapala ang iyong espesyal na araw! 🌻✨",
    flowers: [
      { t: "sunflower", c: 0 },
      { t: "sunflower", c: 0 },
      { t: "sunflower", c: 1 },
      { t: "daisy", c: 0 },
      { t: "daisy", c: 3 },
      { t: "tulip", c: 1 },
    ],
  },
  {
    id: "anniversary",
    name: "Anniversary / Valentine's 💖",
    emoji: "💖",
    desc: "Pulang rosas at matamis na tulips ng pag-ibig",
    wrap: "rose",
    cardTheme: "romantic",
    sticker: "heart",
    defaultMsg: "Happy Anniversary / Valentine's! Salamat sa bawat araw na kasama kita. Ikaw ang laging tinitibok ng puso ko! 🌹",
    flowers: [
      { t: "rose", c: 0 },
      { t: "rose", c: 0 },
      { t: "rose", c: 1 },
      { t: "tulip", c: 0 },
      { t: "tulip", c: 4 },
      { t: "daisy", c: 0 },
    ],
  },
  {
    id: "sorry",
    name: "Pang-Sorry / Patawad 🥺",
    emoji: "🥺",
    desc: "Malinis na puting liryo at pastel daisies",
    wrap: "mint",
    cardTheme: "classic",
    sticker: "butterfly",
    defaultMsg: "Patawad po. Hindi ko sinasadyang masaktan ka. Napakahalaga mo sa akin at nais kong ayusin ang lahat.",
    flowers: [
      { t: "lily", c: 0 },
      { t: "lily", c: 1 },
      { t: "daisy", c: 0 },
      { t: "daisy", c: 1 },
      { t: "tulip", c: 2 },
      { t: "rose", c: 2 },
    ],
  },
  {
    id: "ldr",
    name: "Pang-Long Distance (LDR) ✈️",
    emoji: "✈️",
    desc: "Bulaklak na hindi nalalanta kahit malayo ka",
    wrap: "night",
    cardTheme: "midnight",
    sticker: "sparkles",
    defaultMsg: "Kahit libo-libong kilometro ang layo natin, palagi kang nasa isip at puso ko. Bulaklak ito na kailanman ay hindi malalanta! 💐",
    flowers: [
      { t: "rose", c: 4 },
      { t: "tulip", c: 3 },
      { t: "lily", c: 3 },
      { t: "daisy", c: 2 },
      { t: "rose", c: 0 },
      { t: "tulip", c: 0 },
    ],
  },
  {
    id: "surprise",
    name: "Surpresa / Walang Okasyon 🌸",
    emoji: "🌸",
    desc: "Pampasaya lang para mapangiti ang araw mo",
    wrap: "rose",
    cardTheme: "romantic",
    sticker: "ribbon",
    defaultMsg: "Walang espesyal na okasyon—naisipan lang kitang padalhan ng bulaklak para ipaalala na espesyal ka sa akin araw-araw! 😊",
    flowers: [
      { t: "rose", c: 1 },
      { t: "tulip", c: 0 },
      { t: "daisy", c: 0 },
      { t: "sunflower", c: 0 },
      { t: "lily", c: 1 },
    ],
  },
];
