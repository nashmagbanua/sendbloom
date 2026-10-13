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

export function flowerHead(t: FlowerType, color: string): ReactElement {
  switch (t) {
    case "rose": {
      const dark = shade(color, -0.22);
      const light = shade(color, 0.22);
      return (
        <g>
          <circle r={1.05} fill={dark} />
          <path d="M-0.85,0.2 C-0.95,-0.65 0.7,-0.9 0.85,-0.15 C0.95,0.65 -0.65,0.9 -0.85,0.2Z" fill={color} />
          <path d="M-0.6,-0.1 C-0.7,-0.6 0.5,-0.7 0.6,-0.15 C0.7,0.4 -0.4,0.65 -0.6,-0.1Z" fill={light} />
          <path d="M-0.35,-0.05 C-0.45,-0.35 0.35,-0.4 0.4,-0.05 C0.45,0.3 -0.25,0.35 -0.35,-0.05Z" fill={dark} />
          <circle cx={-0.05} cy={-0.02} r={0.16} fill={shade(color, -0.35)} />
        </g>
      );
    }
    case "tulip": {
      const dark = shade(color, -0.18);
      const light = shade(color, 0.18);
      return (
        <g transform="translate(0 0.1)">
          <path d="M-0.9,-0.6 C-1,0.55 -0.3,1.05 0,1.1 C0.3,1.05 1,0.55 0.9,-0.6 C0.65,-0.35 0.35,0.1 0,-0.1 C-0.35,0.1 -0.65,-0.35 -0.9,-0.6Z" fill={dark} />
          <path d="M-0.7,-0.75 C-0.8,0.3 -0.2,0.9 0,0.95 C0.2,0.9 0.8,0.3 0.7,-0.75 C0.5,-0.45 0.2,0 0,-0.2 C-0.2,0 -0.5,-0.45 -0.7,-0.75Z" fill={color} />
          <path d="M-0.28,-0.95 C-0.28,0.2 0.28,0.2 0.28,-0.95 C0.1,-0.8 -0.1,-0.8 -0.28,-0.95Z" fill={light} />
        </g>
      );
    }
    case "daisy": {
      const petals = Array.from({ length: 12 }, (_, i) => {
        const a = (i * 360) / 12;
        return (
          <ellipse
            key={i}
            cx={0}
            cy={-0.72}
            rx={0.2}
            ry={0.44}
            fill={color}
            stroke="#f0d5db"
            strokeWidth={0.03}
            transform={`rotate(${a})`}
          />
        );
      });
      return (
        <g>
          {petals}
          <circle r={0.34} fill="#f4a261" />
          <circle r={0.28} fill="#e76f51" />
          <circle r={0.2} fill="#ffb703" />
        </g>
      );
    }
    case "sunflower": {
      const petals1 = Array.from({ length: 16 }, (_, i) => {
        const a = (i * 360) / 16;
        return (
          <path
            key={`p1-${i}`}
            d="M0,-0.35 L0.18,-0.78 Q0.2,-1.08 0,-1.2 Q-0.2,-1.08 -0.18,-0.78 Z"
            fill={shade(color, -0.1)}
            transform={`rotate(${a})`}
          />
        );
      });
      const petals2 = Array.from({ length: 16 }, (_, i) => {
        const a = (i * 360) / 16 + 11.25;
        return (
          <path
            key={`p2-${i}`}
            d="M0,-0.35 L0.16,-0.72 Q0.18,-0.98 0,-1.12 Q-0.18,-0.98 -0.16,-0.72 Z"
            fill={color}
            transform={`rotate(${a})`}
          />
        );
      });
      return (
        <g>
          {petals1}
          {petals2}
          <circle r={0.46} fill="#4a2810" />
          <circle r={0.38} fill="#2f1706" />
          <circle r={0.32} fill="#5c3417" stroke="#220e03" strokeWidth={0.04} strokeDasharray="0.08 0.08" />
        </g>
      );
    }
    case "lily": {
      const dark = shade(color, -0.18);
      const light = shade(color, 0.2);
      const petals = [0, 60, 120, 180, 240, 300].map((a, i) => (
        <path
          key={i}
          d="M0,0 C0.35,-0.4 0.45,-1.15 0,-1.35 C-0.45,-1.15 -0.35,-0.4 0,0Z"
          fill={i % 2 === 0 ? color : light}
          stroke={dark}
          strokeWidth={0.03}
          transform={`rotate(${a})`}
        />
      ));
      const stamens = [30, 90, 150, 210, 270, 330].map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const x = Math.sin(rad) * 0.55;
        const y = -Math.cos(rad) * 0.55;
        return (
          <g key={`st-${i}`}>
            <line x1={0} y1={0} x2={x} y2={y} stroke="#606c38" strokeWidth={0.04} />
            <circle cx={x} cy={y} r={0.07} fill="#bc6c25" />
          </g>
        );
      });
      return (
        <g>
          {petals}
          {stamens}
        </g>
      );
    }
  }
}

// Well-spaced coordinates with no cramped collisions
const LAYOUTS: Record<number, number[][]> = {
  1: [[150, 160]],
  2: [[108, 160], [192, 160]],
  3: [[150, 110], [92, 178], [208, 178]],
  4: [[150, 100], [88, 165], [212, 165], [150, 225]],
  5: [[150, 90], [84, 150], [216, 150], [112, 215], [188, 215]],
  6: [[105, 95], [195, 95], [58, 158], [150, 155], [242, 158], [150, 225]],
  7: [[150, 80], [90, 120], [210, 120], [54, 180], [150, 172], [246, 180], [150, 238]],
  8: [[105, 82], [195, 82], [54, 140], [150, 134], [246, 140], [94, 202], [206, 202], [150, 248]],
  9: [[150, 72], [92, 112], [208, 112], [52, 168], [150, 162], [248, 168], [92, 222], [208, 222], [150, 260]],
};

// Flower radius scaled gracefully to prevent overlapping
const HEAD_R: Record<number, number> = { 1: 42, 2: 36, 3: 32, 4: 29, 5: 26, 6: 24, 7: 22, 8: 21, 9: 20 };

export type BouquetOpts = {
  width?: number | string;
  height?: number | string;
  /** adds gentle sway or bloom animations */
  animated?: boolean;
  className?: string;
  onFlowerClick?: (index: number) => void;
  selectedFlowerIndex?: number | null;
};

export function bouquetSvg(b: Pick<Bouquet, "f" | "w">, o: BouquetOpts = {}): ReactElement {
  const n = Math.max(0, Math.min(b.f.length, MAX_FLOWERS));
  const pts = n > 0 ? LAYOUTS[n] : [];
  const r = HEAD_R[n] || 38;
  const wrap = WRAPS[b.w] || WRAPS.kraft;
  const an = !!o.animated;
  const AX = 150;
  const AY = 335;

  // back leaves fanned out behind stems
  const leafAngles = [-52, -34, -16, 0, 16, 34, 52];
  const leaves = leafAngles.map((a, i) => {
    return (
      <g key={`lf${i}`} className={`leaf-sway leaf-sway-${i % 2}`}>
        <path
          d="M0,0 C24,-40 24,-112 0,-156 C-24,-112 -24,-40 0,0Z"
          transform={`translate(${AX} ${AY}) rotate(${a}) scale(${1 - Math.abs(a) / 220})`}
          fill={i % 2 ? "#3f9a5f" : "#2f7f4c"}
        />
      </g>
    );
  });

  const stems = pts.map(([x, y], i) => {
    return (
      <path
        key={`st${i}`}
        d={`M${AX},${AY} Q${(AX + x) / 2},${(AY + y) / 2 + 28} ${x},${y}`}
        fill="none"
        stroke="#3b8a52"
        strokeWidth={4.5}
        strokeLinecap="round"
      />
    );
  });

  // lower heads drawn last so they overlap naturally without obscuring
  const order = pts.map((_, i) => i).sort((a, c) => pts[a][1] - pts[c][1]);
  const heads = order.map((i) => {
    const [x, y] = pts[i];
    const fl = b.f[i];
    const color = FLOWER_META[fl.t].colors[fl.c] ?? FLOWER_META[fl.t].colors[0];
    const rot = ((i * 37) % 40) - 20;
    const isSelected = o.selectedFlowerIndex === i;
    const swayClass = `flower-sway flower-sway-${i % 4}`;
    return (
      <g
        key={`hd${i}`}
        className={`${swayClass} ${o.onFlowerClick ? "flower-head-interactive" : ""}`}
        style={{ cursor: o.onFlowerClick ? "pointer" : undefined }}
        onClick={o.onFlowerClick ? () => o.onFlowerClick!(i) : undefined}
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

  const darkRibbon = shade(wrap.ribbon, -0.2);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 430"
      width={o.width ?? "100%"}
      height={o.height}
      className={o.className}
      role="img"
      aria-label="Bouquet ng bulaklak"
    >
      {leaves}
      {stems}
      <g>
        <path d="M50,282 L250,282 L177,410 Q150,420 123,410 Z" fill={wrap.color} />
        <path d="M50,282 L150,304 L250,282 L177,410 Q150,420 123,410 Z" fill={wrap.fold} opacity={0.6} />
        <path d="M150,304 L124,410" stroke={shade(wrap.color, -0.15)} strokeWidth={2} opacity={0.5} />
        <path d="M150,304 L176,410" stroke={shade(wrap.color, -0.15)} strokeWidth={2} opacity={0.5} />
        <g transform="translate(150 316)">
          <path d="M-4,6 L-20,48 L-7,41 L0,52 Z" fill={darkRibbon} />
          <path d="M4,6 L20,48 L7,41 L0,52 Z" fill={wrap.ribbon} />
          <ellipse cx={-21} cy={0} rx={23} ry={11} transform="rotate(-18 -21 0)" fill={wrap.ribbon} />
          <ellipse cx={21} cy={0} rx={23} ry={11} transform="rotate(18 21 0)" fill={wrap.ribbon} />
          <circle r={8} fill={darkRibbon} />
        </g>
      </g>
      {heads}
    </svg>
  );
}
