import type { CSSProperties, ReactElement } from "react";
import { Bouquet, FLOWER_META, FlowerType, MAX_FLOWERS, WRAPS } from "./constants";

/* All helpers here return plain intrinsic SVG elements (no custom components),
   so the same drawing works in the browser AND inside next/og ImageResponse. */

export function shade(hex: string, amt: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const target = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  r = Math.round(r + (target - r) * p);
  g = Math.round(g + (target - g) * p);
  b = Math.round(b + (target - b) * p);
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

const SW = 0.035;

function ring(
  n: number,
  off: number,
  rx: number,
  ry: number,
  rot: number,
  fill: string,
  stroke: string,
  tag: string
) {
  return Array.from({ length: n }, (_, i) => (
    <ellipse
      key={`${tag}${i}`}
      cx={0}
      cy={-off}
      rx={rx}
      ry={ry}
      fill={fill}
      stroke={stroke}
      strokeWidth={SW}
      transform={`rotate(${rot + (i * 360) / n})`}
    />
  ));
}

/** A flower head drawn around (0,0) with a radius of roughly 1 unit. */
export function flowerHead(type: FlowerType, color: string): ReactElement {
  const dark = shade(color, -0.22);
  const light = shade(color, 0.2);

  switch (type) {
    case "rose":
      return (
        <g>
          {ring(7, 0.6, 0.4, 0.5, 0, color, dark, "a")}
          {ring(6, 0.42, 0.3, 0.4, 25, light, dark, "b")}
          {ring(5, 0.26, 0.22, 0.3, 10, color, dark, "c")}
          <circle r={0.17} fill={dark} />
          <path
            d="M0,0 m-0.09,0 a0.09,0.09 0 1,1 0.09,0.09"
            fill="none"
            stroke={light}
            strokeWidth={0.04}
            strokeLinecap="round"
          />
        </g>
      );

    case "tulip":
      return (
        <g transform="translate(0,-0.1)">
          <path
            d="M-0.1,0.75 C-0.85,0.3 -0.9,-0.55 -0.55,-1 C-0.3,-0.75 -0.15,-0.2 -0.1,0.75Z"
            fill={light}
            stroke={dark}
            strokeWidth={SW}
            strokeLinejoin="round"
          />
          <path
            d="M0.1,0.75 C0.85,0.3 0.9,-0.55 0.55,-1 C0.3,-0.75 0.15,-0.2 0.1,0.75Z"
            fill={light}
            stroke={dark}
            strokeWidth={SW}
            strokeLinejoin="round"
          />
          <path
            d="M0,-1.15 C0.5,-0.75 0.55,-0.1 0,0.8 C-0.55,-0.1 -0.5,-0.75 0,-1.15Z"
            fill={color}
            stroke={dark}
            strokeWidth={SW}
            strokeLinejoin="round"
          />
        </g>
      );

    case "daisy": {
      const stroke = shade(color, -0.18);
      return (
        <g>
          {ring(14, 0.58, 0.13, 0.46, 0, color, stroke, "a")}
          {ring(14, 0.5, 0.12, 0.4, 360 / 28, shade(color, 0.08), stroke, "b")}
          <circle r={0.3} fill="#ffc233" stroke="#e09f1f" strokeWidth={SW} />
          <circle cx={-0.08} cy={-0.07} r={0.05} fill="#e09f1f" />
          <circle cx={0.09} cy={0.04} r={0.05} fill="#e09f1f" />
          <circle cx={-0.02} cy={0.11} r={0.04} fill="#e09f1f" />
        </g>
      );
    }

    case "sunflower": {
      const dots = Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI * 2) / 12;
        const rr = i % 2 ? 0.16 : 0.27;
        return <circle key={i} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr} r={0.035} fill="#3a2410" />;
      });
      return (
        <g>
          {ring(18, 0.78, 0.14, 0.4, 0, color, dark, "a")}
          {ring(18, 0.68, 0.14, 0.38, 10, light, dark, "b")}
          <circle r={0.46} fill="#5b3a1a" stroke="#3a2410" strokeWidth={SW} />
          <circle r={0.32} fill="#7a4b22" />
          {dots}
        </g>
      );
    }

    case "lily": {
      const petals = Array.from({ length: 6 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 60})`}>
          <path
            d="M0,0 C0.32,-0.35 0.26,-0.88 0,-1.2 C-0.26,-0.88 -0.32,-0.35 0,0Z"
            fill={i % 2 ? light : color}
            stroke={dark}
            strokeWidth={SW}
            strokeLinejoin="round"
          />
          <path d="M0,-0.08 L0,-0.85" stroke={dark} strokeWidth={0.025} opacity={0.6} strokeLinecap="round" />
        </g>
      ));
      const stamens = Array.from({ length: 5 }, (_, i) => {
        const a = (-90 + (i - 2) * 22) * (Math.PI / 180);
        const x = Math.cos(a) * 0.5;
        const y = Math.sin(a) * 0.5;
        return (
          <g key={i}>
            <line x1={0} y1={0} x2={x} y2={y} stroke="#8a5a2b" strokeWidth={0.03} strokeLinecap="round" />
            <circle cx={x} cy={y} r={0.055} fill="#ff7b00" />
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

const LAYOUTS: Record<number, number[][]> = {
  1: [[150, 160]],
  2: [[112, 165], [188, 165]],
  3: [[150, 112], [105, 178], [195, 178]],
  4: [[150, 100], [98, 160], [202, 160], [150, 205]],
  5: [[150, 92], [95, 150], [205, 150], [122, 205], [178, 205]],
  6: [[112, 98], [188, 98], [68, 162], [150, 152], [232, 162], [150, 220]],
  7: [[150, 84], [100, 124], [200, 124], [66, 186], [150, 172], [234, 186], [150, 236]],
  8: [[112, 90], [188, 90], [66, 146], [150, 136], [234, 146], [102, 202], [198, 202], [150, 248]],
  9: [[150, 80], [100, 116], [200, 116], [62, 172], [150, 160], [238, 172], [100, 218], [200, 218], [150, 256]],
};

const HEAD_R: Record<number, number> = { 1: 46, 2: 42, 3: 38, 4: 35, 5: 33, 6: 31, 7: 29, 8: 28, 9: 27 };

export type BouquetOpts = {
  width?: number | string;
  height?: number | string;
  /** adds CSS class names/delays for the bloom animation (browser only) */
  animated?: boolean;
  className?: string;
  onFlowerClick?: (index: number) => void;
  selectedFlowerIndex?: number | null;
};

export function bouquetSvg(b: Pick<Bouquet, "f" | "w">, o: BouquetOpts = {}): ReactElement {
  const n = Math.max(0, Math.min(b.f.length, MAX_FLOWERS));
  const pts = n > 0 ? LAYOUTS[n] : [];
  const r = HEAD_R[n] || 40;
  const wrap = WRAPS[b.w] || WRAPS.kraft;
  const an = !!o.animated;
  const AX = 150;
  const AY = 335;

  // back leaves fanned out behind the stems
  const leafAngles = [-52, -34, -16, 0, 16, 34, 52];
  const leaves = leafAngles.map((a, i) => {
    const style: CSSProperties | undefined = an
      ? { transformOrigin: `${AX}px ${AY}px`, animationDelay: `${0.05 + i * 0.05}s` }
      : undefined;
    return (
      <g key={`lf${i}`} className={`${an ? "bl-leaf" : ""} leaf-sway leaf-sway-${i % 2}`} style={style}>
        <path
          d="M0,0 C24,-40 24,-112 0,-156 C-24,-112 -24,-40 0,0Z"
          transform={`translate(${AX} ${AY}) rotate(${a}) scale(${1 - Math.abs(a) / 220})`}
          fill={i % 2 ? "#3f9a5f" : "#2f7f4c"}
        />
      </g>
    );
  });

  const stems = pts.map(([x, y], i) => {
    const style: CSSProperties | undefined = an ? { animationDelay: `${0.25 + i * 0.1}s` } : undefined;
    return (
      <path
        key={`st${i}`}
        d={`M${AX},${AY} Q${(AX + x) / 2},${(AY + y) / 2 + 28} ${x},${y}`}
        fill="none"
        stroke="#3b8a52"
        strokeWidth={4.5}
        strokeLinecap="round"
        pathLength={an ? 1 : undefined}
        className={an ? "bl-stem" : undefined}
        style={style}
      />
    );
  });

  // lower heads are drawn last so they overlap the ones behind
  const order = pts.map((_, i) => i).sort((a, c) => pts[a][1] - pts[c][1]);
  const heads = order.map((i, drawIdx) => {
    const [x, y] = pts[i];
    const fl = b.f[i];
    const color = FLOWER_META[fl.t].colors[fl.c] ?? FLOWER_META[fl.t].colors[0];
    const rot = ((i * 37) % 40) - 20;
    const isSelected = o.selectedFlowerIndex === i;
    const style: CSSProperties | undefined = an
      ? { transformOrigin: `${x}px ${y}px`, animationDelay: `${0.7 + drawIdx * 0.13}s` }
      : undefined;
    const swayClass = `flower-sway flower-sway-${i % 4}`;
    return (
      <g
        key={`hd${i}`}
        className={`${an ? "bl-head" : ""} ${swayClass} ${o.onFlowerClick ? "flower-head-interactive" : ""}`}
        style={{ ...style, cursor: o.onFlowerClick ? "pointer" : undefined }}
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
      <g className={an ? "bl-wrap" : undefined}>
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
