import { bouquetSvg, flowerHead, BouquetOpts } from "@/lib/bouquet";
import type { Bouquet, FlowerType } from "@/lib/constants";
import { FLOWER_META } from "@/lib/constants";

export default function BouquetSVG({ data, ...opts }: { data: Pick<Bouquet, "f" | "w"> } & BouquetOpts) {
  return bouquetSvg(data, opts);
}

/** Small round icon of a single flower, used in the picker. */
export function FlowerIcon({ type, colorIndex = 0, size = 44 }: { type: FlowerType; colorIndex?: number; size?: number }) {
  const colors = FLOWER_META[type].colors;
  const color = colors[Math.min(colorIndex, colors.length - 1)];
  return (
    <svg viewBox="-1.3 -1.3 2.6 2.6" width={size} height={size} aria-hidden="true">
      {flowerHead(type, color)}
    </svg>
  );
}
