import { CSSProperties, ReactElement } from "react";
import type { Bouquet, FlowerType } from "./constants";
import { FLOWER_META, MAX_FLOWERS, WRAPS } from "./constants";

function shade(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent * 100);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

/**
 * Florist-grade botanical flower heads with multi-layered petal depth,
 * organic natural curves, highlights, and botanical realism.
 */
export function flowerHead(t: FlowerType, color: string): ReactElement {
  const dark = shade(color, -0.25);
  const deep = shade(color, -0.45);
  const light = shade(color, 0.22);
  const soft = shade(color, 0.38);

  switch (t) {
    case "rose": {
      // English garden rose (David Austin style) - lush spiraling layered petals with velvety depth
      return (
        <g className="botanical-rose">
          {/* Calyx sepals peeking underneath */}
          <path d="M-0.9,0.7 Q-1.3,1.1 -1.4,0.8 Q-1,0.4 -0.5,0.4 Z" fill="#2d6a4f" opacity={0.85} />
          <path d="M0.9,0.7 Q1.3,1.1 1.4,0.8 Q1,0.4 0.5,0.4 Z" fill="#2d6a4f" opacity={0.85} />
          <path d="M0,0.9 Q0,1.4 -0.2,1.6 Q-0.1,1.1 0,0.9 Z" fill="#1b4332" opacity={0.9} />

          {/* Tier 1: Outer guard petals (softly curved flaring rims) */}
          <path
            d="M-1.15,-0.2 C-1.4,0.6 -0.6,1.3 0,1.25 C0.6,1.3 1.4,0.6 1.15,-0.2 C1.35,-0.8 0.6,-1.35 0,-1.3 C-0.6,-1.35 -1.35,-0.8 -1.15,-0.2Z"
            fill={dark}
          />
          <path
            d="M-1.05,-0.6 C-1.35,0.1 -0.9,1.0 -0.2,1.1 C-0.8,0.7 -1.0,-0.1 -0.95,-0.6Z"
            fill={deep}
            opacity={0.35}
          />

          {/* Tier 2: Mid cup petals with natural petal overlap */}
          <path
            d="M-0.9,0.35 C-1.1,-0.45 -0.35,-1.05 0.35,-1.0 C0.9,-0.95 1.1,-0.35 0.9,0.35 C0.7,1.0 -0.7,1.05 -0.9,0.35Z"
            fill={color}
          />
          <path
            d="M-0.85,0.15 C-0.95,-0.4 0.4,-0.9 0.75,-0.45 C0.95,0.25 -0.4,0.85 -0.85,0.15Z"
            fill={light}
          />
          <path
            d="M0.8,-0.25 C0.95,0.35 -0.2,0.9 -0.65,0.5 C-0.85,0.1 0.35,-0.75 0.8,-0.25Z"
            fill={color}
          />

          {/* Tier 3: Intermediate nested petals */}
          <path
            d="M-0.6,-0.3 C-0.8,0.2 -0.2,0.65 0.3,0.55 C0.7,0.45 0.7,-0.2 0.3,-0.5 C-0.1,-0.75 -0.45,-0.65 -0.6,-0.3Z"
            fill={dark}
          />
          <path
            d="M-0.5,0.2 C-0.7,-0.2 0.1,-0.6 0.5,-0.3 C0.7,0.2 -0.1,0.55 -0.5,0.2Z"
            fill={light}
          />

          {/* Tier 4: Inner tight spiral heart */}
          <path
            d="M-0.35,-0.1 C-0.5,-0.45 0.25,-0.55 0.4,-0.2 C0.5,0.15 -0.15,0.45 -0.35,-0.1Z"
            fill={dark}
          />
          <path
            d="M-0.25,0.05 C-0.35,-0.25 0.1,-0.4 0.25,-0.15 C0.35,0.1 -0.1,0.25 -0.25,0.05Z"
            fill={light}
          />
          <path
            d="M-0.15,-0.08 C-0.25,-0.25 0.08,-0.28 0.2,-0.12 C0.24,0.08 -0.08,0.16 -0.15,-0.08Z"
            fill={deep}
          />
          <circle cx={-0.02} cy={-0.04} r={0.1} fill={deep} />

          {/* Delicate petal rim highlights (silky texture) */}
          <path d="M-0.85,-0.45 Q0,-0.9 0.7,-0.4" fill="none" stroke={soft} strokeWidth={0.06} strokeLinecap="round" opacity={0.7} />
          <path d="M-0.6,0.55 Q0,0.9 0.65,0.35" fill="none" stroke={light} strokeWidth={0.05} strokeLinecap="round" opacity={0.65} />
          <path d="M-0.3,-0.4 Q0.2,-0.55 0.4,-0.3" fill="none" stroke={soft} strokeWidth={0.04} strokeLinecap="round" opacity={0.8} />
        </g>
      );
    }
    case "tulip": {
      // Parisian flared French tulip with silky, overlapping cupped petals & sheen
      return (
        <g className="botanical-tulip" transform="translate(0 0.05)">
          {/* Calyx & stem base joint */}
          <path d="M-0.22,0.95 Q0,1.3 0.22,0.95 Q0,0.7 -0.22,0.95 Z" fill="#2d6a4f" />

          {/* Back petal silhouette */}
          <path
            d="M-0.35,-1.05 C-0.1,-1.25 0.1,-1.25 0.35,-1.05 C0.55,-0.3 0.25,0.55 0,0.85 C-0.25,0.55 -0.55,-0.3 -0.35,-1.05Z"
            fill={deep}
          />

          {/* Left wrapping petal */}
          <path
            d="M-0.9,-0.75 C-1.15,0.25 -0.45,1.1 0,1.1 C-0.35,0.6 -0.65,-0.15 -0.55,-0.9 C-0.7,-0.9 -0.85,-0.85 -0.9,-0.75Z"
            fill={dark}
          />
          {/* Right wrapping petal */}
          <path
            d="M0.9,-0.75 C1.15,0.25 0.45,1.1 0,1.1 C0.35,0.6 0.65,-0.15 0.55,-0.9 C0.7,-0.9 0.85,-0.85 0.9,-0.75Z"
            fill={dark}
          />

          {/* Main front left petal */}
          <path
            d="M-0.8,-0.85 C-1.0,0.2 -0.25,1.02 0,1.05 C-0.15,0.5 -0.35,-0.25 -0.1,-0.95 C-0.45,-0.95 -0.7,-0.92 -0.8,-0.85Z"
            fill={color}
          />
          {/* Main front right petal with satin sheen */}
          <path
            d="M0.8,-0.85 C1.0,0.2 0.25,1.02 0,1.05 C0.15,0.5 0.35,-0.25 0.1,-0.95 C0.45,-0.95 0.7,-0.92 0.8,-0.85Z"
            fill={light}
          />

          {/* Center petal ridge with soft satin sheen */}
          <path
            d="M-0.22,-0.98 C-0.28,0.25 0,0.92 0,1.0 C0,0.92 0.28,0.25 0.22,-0.98 C0.06,-0.75 -0.06,-0.75 -0.22,-0.98Z"
            fill={soft}
            opacity={0.88}
          />
          {/* Silk sheen line */}
          <path d="M-0.04,-0.8 L-0.04,0.55" stroke="#ffffff" strokeWidth={0.06} opacity={0.45} strokeLinecap="round" />
          <path d="M0.12,-0.6 L0.12,0.4" stroke={soft} strokeWidth={0.04} opacity={0.6} strokeLinecap="round" />
        </g>
      );
    }
    case "daisy": {
      // Botanical Gerbera / Field daisy with dual-tier radiating slender petals and golden floret core
      const petalsBack = Array.from({ length: 16 }, (_, i) => {
        const a = (i * 360) / 16 + 11.25;
        return (
          <path
            key={`db-${i}`}
            d="M0,0 C-0.16,-0.45 -0.2,-0.95 0,-1.15 C0.2,-0.95 0.16,-0.45 0,0Z"
            fill={dark}
            transform={`rotate(${a})`}
            opacity={0.9}
          />
        );
      });
      const petalsFront = Array.from({ length: 16 }, (_, i) => {
        const a = (i * 360) / 16;
        return (
          <g key={`df-${i}`} transform={`rotate(${a})`}>
            <path
              d="M0,0 C-0.18,-0.42 -0.2,-0.92 -0.04,-1.2 C0,-1.24 0.04,-1.24 0.04,-1.2 C0.2,-0.92 0.18,-0.42 0,0Z"
              fill={color}
            />
            {/* Center petal spine highlight */}
            <path d="M0,-0.15 L0,-1.02" stroke={light} strokeWidth={0.035} strokeLinecap="round" opacity={0.65} />
          </g>
        );
      });

      return (
        <g className="botanical-daisy">
          {petalsBack}
          {petalsFront}
          {/* Central disc florets */}
          <circle r={0.38} fill="#9c4221" />
          <circle r={0.32} fill="#d97706" />
          <circle r={0.24} fill="#f59e0b" />
          <circle r={0.16} fill="#fbbf24" />
          {/* Seed florets stipple dots */}
          <circle cx={-0.12} cy={-0.08} r={0.04} fill="#78350f" />
          <circle cx={0.09} cy={-0.11} r={0.04} fill="#78350f" />
          <circle cx={-0.05} cy={0.12} r={0.04} fill="#78350f" />
          <circle cx={0.12} cy={0.06} r={0.04} fill="#78350f" />
          <circle cx={0} cy={0} r={0.05} fill="#fef08a" />
          {/* Golden pollen ring */}
          <circle r={0.34} fill="none" stroke="#fef08a" strokeWidth={0.025} strokeDasharray="0.04 0.04" opacity={0.8} />
        </g>
      );
    }
    case "sunflower": {
      // Botanical Helianthus sunflower with vibrant double-layer ray florets and deep chocolate seed core
      const petalsBack = Array.from({ length: 20 }, (_, i) => {
        const a = (i * 360) / 20 + 9;
        return (
          <path
            key={`sb-${i}`}
            d="M0,-0.18 L0.22,-0.75 Q0.24,-1.22 0,-1.36 Q-0.24,-1.22 -0.22,-0.75 Z"
            fill="#d97706"
            transform={`rotate(${a})`}
          />
        );
      });
      const petalsFront = Array.from({ length: 20 }, (_, i) => {
        const a = (i * 360) / 20;
        return (
          <g key={`sf-${i}`} transform={`rotate(${a})`}>
            <path
              d="M0,-0.18 L0.2,-0.72 Q0.22,-1.14 0,-1.28 Q-0.22,-1.14 -0.2,-0.72 Z"
              fill="#fbbf24"
            />
            <path d="M0,-0.28 L0,-1.05" stroke="#fef08a" strokeWidth={0.04} strokeLinecap="round" opacity={0.65} />
          </g>
        );
      });

      return (
        <g className="botanical-sunflower">
          {petalsBack}
          {petalsFront}
          {/* Concentric botanical seed head */}
          <circle r={0.5} fill="#271306" />
          <circle r={0.44} fill="#451a03" />
          <circle r={0.37} fill="#78350f" stroke="#92400e" strokeWidth={0.03} strokeDasharray="0.06 0.05" />
          <circle r={0.27} fill="#381907" stroke="#b45309" strokeWidth={0.03} strokeDasharray="0.05 0.05" />
          <circle r={0.15} fill="#1c0b02" />
          {/* Golden pollen ring */}
          <circle r={0.46} fill="none" stroke="#fbbf24" strokeWidth={0.028} strokeDasharray="0.04 0.04" />
          <circle r={0.34} fill="none" stroke="#f59e0b" strokeWidth={0.02} strokeDasharray="0.03 0.04" opacity={0.7} />
        </g>
      );
    }
    case "lily": {
      // Regal Stargazer lily with curved reflexed petals, freckles, and prominent stamens & anthers
      const petals = [0, 60, 120, 180, 240, 300].map((a, i) => {
        const isBack = i % 2 !== 0;
        return (
          <g key={`lp-${i}`} transform={`rotate(${a})`}>
            <path
              d="M0,0 C0.48,-0.4 0.54,-1.25 0,-1.48 C-0.54,-1.25 -0.48,-0.4 0,0Z"
              fill={isBack ? dark : color}
            />
            {/* Center petal spine rib */}
            <path d="M0,-0.1 L0,-1.32" stroke={isBack ? deep : light} strokeWidth={0.05} strokeLinecap="round" />
            {/* Throat speckles */}
            <circle cx={-0.12} cy={-0.38} r={0.035} fill={deep} />
            <circle cx={0.12} cy={-0.42} r={0.035} fill={deep} />
            <circle cx={-0.08} cy={-0.58} r={0.03} fill={deep} />
            <circle cx={0.07} cy={-0.64} r={0.03} fill={deep} />
            <circle cx={-0.05} cy={-0.82} r={0.025} fill={deep} />
            <circle cx={0.06} cy={-0.86} r={0.025} fill={deep} />
          </g>
        );
      });

      const stamens = [30, 90, 150, 210, 270, 330].map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const x = Math.sin(rad) * 0.65;
        const y = -Math.cos(rad) * 0.65;
        return (
          <g key={`st-${i}`}>
            <line x1={0} y1={0} x2={x} y2={y} stroke="#65a30d" strokeWidth={0.04} strokeLinecap="round" />
            {/* Pollen anther */}
            <ellipse
              cx={x}
              cy={y}
              rx={0.1}
              ry={0.05}
              fill="#b45309"
              stroke="#78350f"
              strokeWidth={0.015}
              transform={`rotate(${a + 90} ${x} ${y})`}
            />
          </g>
        );
      });

      return (
        <g className="botanical-lily">
          {petals}
          {stamens}
          {/* Pistil stigma core */}
          <circle cx={0} cy={0} r={0.11} fill="#4d7c0f" />
          <circle cx={0} cy={0} r={0.07} fill="#a3e635" />
        </g>
      );
    }
  }
}

// Organic layout coordinates with natural florist dome clustering without overlapping
const LAYOUTS: Record<number, number[][]> = {
  1: [[150, 150]],
  2: [[112, 150], [188, 150]],
  3: [[150, 108], [94, 168], [206, 168]],
  4: [[150, 96], [90, 155], [210, 155], [150, 210]],
  5: [[150, 88], [86, 142], [214, 142], [114, 202], [186, 202]],
  6: [[108, 92], [192, 92], [62, 150], [150, 145], [238, 150], [150, 212]],
  7: [[150, 78], [92, 116], [208, 116], [58, 172], [150, 162], [242, 172], [150, 224]],
  8: [[108, 80], [192, 80], [58, 134], [150, 128], [242, 134], [96, 192], [204, 192], [150, 235]],
  9: [[150, 72], [94, 108], [206, 108], [56, 160], [150, 152], [244, 160], [94, 210], [206, 210], [150, 246]],
};

// Calibrated flower radius for balanced florist density
const HEAD_R: Record<number, number> = { 1: 44, 2: 38, 3: 34, 4: 30, 5: 27, 6: 25, 7: 23, 8: 22, 9: 21 };

export type BouquetOpts = {
  width?: number | string;
  height?: number | string;
  animated?: boolean;
  className?: string;
  onFlowerClick?: (index: number) => void;
  selectedFlowerIndex?: number | null;
  /** When true, omit interactive props (className/onClick/cursor) for satori/OG image */
  forImage?: boolean;
};

export function bouquetSvg(b: Pick<Bouquet, "f" | "w">, o: BouquetOpts = {}): ReactElement {
  const n = Math.max(0, Math.min(b.f.length, MAX_FLOWERS));
  const pts = n > 0 ? LAYOUTS[n] : [];
  const r = HEAD_R[n] || 38;
  const wrap = WRAPS[b.w] || WRAPS.kraft;
  const AX = 150;
  const AY = 315;

  // 1. BACK WRAPPING PAPER (Realistic origami fan-fold backdrop cradling the bouquet)
  const backWrap = (
    <g className="bouquet-back-wrap">
      {/* Outer flared wrapping paper wings */}
      <path
        d="M20,155 C35,100 80,72 150,72 C220,72 265,100 280,155 L215,360 L85,360 Z"
        fill={shade(wrap.color, -0.18)}
      />
      {/* Outer fold shadow / crease lines */}
      <path d="M20,155 Q65,190 95,355" stroke={shade(wrap.color, -0.3)} strokeWidth={1.5} fill="none" opacity={0.4} />
      <path d="M280,155 Q235,190 205,355" stroke={shade(wrap.color, -0.3)} strokeWidth={1.5} fill="none" opacity={0.4} />

      {/* Folded inner tissue paper collar peeking out behind blooms */}
      <path
        d="M44,142 L72,96 L112,125 L150,86 L188,125 L228,96 L256,142 L208,340 L92,340 Z"
        fill={wrap.fold}
        opacity={0.92}
      />
      <path
        d="M60,135 L95,108 L150,122 L205,108 L240,135 L198,330 L102,330 Z"
        fill={shade(wrap.fold, 0.12)}
        opacity={0.65}
      />
    </g>
  );

  // 2. BOTANICAL BACK FOLIAGE (Eucalyptus cinerea leaves with delicate white veins + sprigs)
  const leafAngles = [-52, -34, -17, 0, 17, 34, 52];
  const leaves = leafAngles.map((a, i) => {
    return (
      <g key={`lf${i}`} className={`leaf-sway leaf-sway-${i % 2}`}>
        <path
          d="M0,0 C28,-38 28,-118 0,-162 C-28,-118 -28,-38 0,0Z"
          transform={`translate(${AX} ${AY}) rotate(${a}) scale(${1 - Math.abs(a) / 210})`}
          fill={i % 2 ? "#3f9a5f" : "#2f7f4c"}
        />
        {/* Leaf center vein */}
        <path
          d="M0,0 L0,-155"
          transform={`translate(${AX} ${AY}) rotate(${a}) scale(${1 - Math.abs(a) / 210})`}
          stroke="#1b4332"
          strokeWidth={1.6}
          opacity={0.55}
        />
        {/* Branchlet side veins */}
        <path
          d="M0,-50 L14,-65 M0,-90 L16,-105 M0,-50 L-14,-65 M0,-90 L-16,-105"
          transform={`translate(${AX} ${AY}) rotate(${a}) scale(${1 - Math.abs(a) / 210})`}
          stroke="#1b4332"
          strokeWidth={1.1}
          opacity={0.35}
        />
      </g>
    );
  });

  // Delicate Baby's breath (gypsophila) clusters sprinkling white starry dots
  const fillers = [
    { x: 88, y: 125 },
    { x: 212, y: 125 },
    { x: 62, y: 195 },
    { x: 238, y: 195 },
    { x: 150, y: 118 },
  ].map((pos, idx) => (
    <g key={`fil-${idx}`} opacity={0.88}>
      <circle cx={pos.x} cy={pos.y} r={3.2} fill="#ffffff" />
      <circle cx={pos.x + 6} cy={pos.y - 5} r={2.6} fill="#fffaf0" />
      <circle cx={pos.x - 7} cy={pos.y - 4} r={2.9} fill="#ffffff" />
      <circle cx={pos.x + 5} cy={pos.y + 6} r={2.5} fill="#fff8e7" />
      <circle cx={pos.x - 5} cy={pos.y + 5} r={2.7} fill="#ffffff" />
      <path d={`M${pos.x},${pos.y + 14} L${pos.x},${pos.y - 2}`} stroke="#52796f" strokeWidth={1.1} strokeLinecap="round" />
    </g>
  ));

  // 3. STEMS (Upper stems converging gracefully into waist)
  const stems = pts.map(([x, y], i) => {
    return (
      <path
        key={`st${i}`}
        className={o.animated && !o.forImage ? "bl-stem" : undefined}
        style={
          o.animated && !o.forImage
            ? { animationDelay: `${0.05 + i * 0.06}s` }
            : undefined
        }
        d={`M${AX},${AY} Q${(AX + x) / 2},${(AY + y) / 2 + 25} ${x},${y}`}
        fill="none"
        stroke="#2d6a4f"
        strokeWidth={4.8}
        strokeLinecap="round"
        pathLength={1}
      />
    );
  });

  // Lower stems trimmed and peeking out the bottom wrap cone
  const stemBottoms = (
    <g className="stem-bottoms-bundle">
      <path d="M138,392 L134,424" stroke="#2d6a4f" strokeWidth={4.8} strokeLinecap="round" />
      <path d="M144,395 L142,427" stroke="#1b4332" strokeWidth={5.2} strokeLinecap="round" />
      <path d="M150,396 L151,428" stroke="#2d6a4f" strokeWidth={5.2} strokeLinecap="round" />
      <path d="M156,395 L158,426" stroke="#1b4332" strokeWidth={4.8} strokeLinecap="round" />
      <path d="M162,392 L166,423" stroke="#3f9a5f" strokeWidth={4.6} strokeLinecap="round" />
      {/* Green floral tape tie at bottom bundle */}
      <rect x="133" y="404" width="34" height="6.5" rx="2" fill="#1b4332" opacity={0.92} />
    </g>
  );

  // 4. BLOOMING FLOWER HEADS
  const order = pts.map((_, i) => i).sort((a, c) => pts[a][1] - pts[c][1]);
  const heads = order.map((i) => {
    const [x, y] = pts[i];
    const fl = b.f[i];
    const color = FLOWER_META[fl.t].colors[fl.c] ?? FLOWER_META[fl.t].colors[0];
    const rot = ((i * 37) % 40) - 20;
    const isSelected = !o.forImage && o.selectedFlowerIndex === i;
    const swayClass = o.forImage ? "" : `flower-sway flower-sway-${i % 4}`;
    const bloomClass = o.animated && !o.forImage ? "bl-head" : "";
    const interactive = !o.forImage && !!o.onFlowerClick;
    const cls = o.forImage
      ? undefined
      : [swayClass, bloomClass, interactive ? "flower-head-interactive" : ""]
          .filter(Boolean)
          .join(" ") || undefined;
    return (
      <g
        key={`hd${i}`}
        className={cls}
        style={
          interactive
            ? { cursor: "pointer", animationDelay: o.animated ? `${0.35 + i * 0.12}s` : undefined }
            : o.animated && !o.forImage
              ? { animationDelay: `${0.35 + i * 0.12}s` }
              : undefined
        }
        onClick={interactive ? () => o.onFlowerClick!(i) : undefined}
      >
        {isSelected && (
          <circle
            cx={x}
            cy={y}
            r={r * 1.25}
            fill="none"
            stroke="#e8506a"
            strokeWidth={3}
            strokeDasharray="4 4"
            className="selected-flower-ring"
          />
        )}
        <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r})`}>{flowerHead(fl.t, color)}</g>
      </g>
    );
  });

  // 5. FRONT WRAPPING CONE (Korean/Parisian florist wrap with organic curved collar and satin bow)
  const darkRibbon = shade(wrap.ribbon, -0.25);
  const lightRibbon = shade(wrap.ribbon, 0.25);

  const frontWrap = (
    <g className="bouquet-front-wrap">
      {/* Soft translucent frosted tissue collar peeking above the front paper */}
      <path
        d="M38,262 C70,248 115,260 150,268 C185,260 230,248 262,262 L225,370 L75,370 Z"
        fill={wrap.fold}
        opacity={0.7}
      />
      {/* Left diagonal folding sheet */}
      <path
        d="M36,268 C80,285 132,308 162,318 L138,404 C126,402 120,396 118,390 Z"
        fill={shade(wrap.color, -0.1)}
      />
      {/* Inner tissue peek on left fold */}
      <path
        d="M42,265 C85,280 128,298 154,306 L148,318 C118,308 78,285 42,265 Z"
        fill={wrap.fold}
        opacity={0.85}
      />

      {/* Right diagonal folding sheet (overlapping across the front with natural curved crease) */}
      <path
        d="M264,268 C220,285 168,308 132,318 L162,404 C174,402 180,396 182,390 Z"
        fill={wrap.color}
      />
      {/* Front overlap drop shadow */}
      <path
        d="M132,318 L162,404"
        stroke={shade(wrap.color, -0.3)}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.6}
      />

      {/* Inner tissue peek on right fold */}
      <path
        d="M258,265 C215,280 172,298 144,306 L140,318 C170,308 222,285 258,265 Z"
        fill={wrap.fold}
        opacity={0.85}
      />

      {/* Elegant center wrap fold crease */}
      <path
        d="M150,314 L150,402"
        stroke={shade(wrap.color, -0.22)}
        strokeWidth={1.8}
        opacity={0.45}
      />

      {/* LUXURY SATIN RIBBON BAND & 3D DOUBLE-LOOP BOW */}
      <g transform="translate(150 322)">
        {/* Ribbon waist band */}
        <path
          d="M-38,-4 C-10,5 10,5 38,-4 L34,11 C10,18 -10,18 -34,11 Z"
          fill={wrap.ribbon}
        />
        <path
          d="M-38,-4 C-10,5 10,5 38,-4"
          stroke={lightRibbon}
          strokeWidth={1.6}
          fill="none"
          opacity={0.65}
        />

        {/* Cascading draped ribbon tails */}
        <path
          d="M-9,8 C-26,42 -30,76 -22,100 L-11,94 C-19,72 -16,42 -3,8 Z"
          fill={darkRibbon}
        />
        <path
          d="M9,8 C26,42 30,76 22,100 L11,94 C19,72 16,42 3,8 Z"
          fill={wrap.ribbon}
        />
        {/* Notched ribbon tails */}
        <path d="M-22,100 L-16,96 L-11,94" stroke={darkRibbon} strokeWidth={1.2} fill="none" />
        <path d="M22,100 L16,96 L11,94" stroke={wrap.ribbon} strokeWidth={1.2} fill="none" />

        {/* Left bow loop */}
        <ellipse
          cx={-25}
          cy={2}
          rx={25}
          ry={13}
          transform="rotate(-15 -25 2)"
          fill={wrap.ribbon}
        />
        <ellipse
          cx={-25}
          cy={0}
          rx={18}
          ry={6.5}
          transform="rotate(-15 -25 0)"
          fill={lightRibbon}
          opacity={0.5}
        />

        {/* Right bow loop */}
        <ellipse
          cx={25}
          cy={2}
          rx={25}
          ry={13}
          transform="rotate(15 25 2)"
          fill={wrap.ribbon}
        />
        <ellipse
          cx={25}
          cy={0}
          rx={18}
          ry={6.5}
          transform="rotate(15 25 0)"
          fill={lightRibbon}
          opacity={0.5}
        />

        {/* Center tied knot with glossy highlight */}
        <ellipse cx={0} cy={2} rx={9.5} ry={9.5} fill={darkRibbon} />
        <ellipse cx={-1} cy={0} rx={6.5} ry={6.5} fill={wrap.ribbon} />
        <circle cx={-2.5} cy={-2.5} r={2.2} fill={lightRibbon} opacity={0.7} />
      </g>
    </g>
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 435"
      width={o.width ?? "100%"}
      height={o.height}
      className={o.className}
      role="img"
      aria-label="Bespoke Florist Bouquet ng mga bulaklak"
    >
      {/* Layer 1: Back wrapping paper wings & folded tissue */}
      {backWrap}

      {/* Layer 2: Botanical foliage, eucalyptus leaves & starry baby's breath */}
      {leaves}
      {fillers}

      {/* Layer 3: Bundled flower stems */}
      {stemBottoms}
      {stems}

      {/* Layer 4: Front wrapping paper cone & satin bow */}
      {frontWrap}

      {/* Layer 5: Blooming florist flower heads */}
      {heads}
    </svg>
  );
}
