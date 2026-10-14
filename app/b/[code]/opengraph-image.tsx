import { ImageResponse } from "next/og";
import { decodeBouquet } from "@/lib/codec";
import { bouquetSvg } from "@/lib/bouquet";
import { CARD_THEMES } from "@/lib/constants";

export const alt = "Digital bouquet mula sa SendBloom";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = decodeBouquet(code);

  const to = data?.to ? data.to : "";
  const from = data?.from ? data.from : "";
  const theme = data?.c && data.c in CARD_THEMES ? CARD_THEMES[data.c] : null;

  const bg = theme
    ? `linear-gradient(135deg, ${theme.bg} 0%, ${theme.border} 55%, ${theme.accent} 130%)`
    : "linear-gradient(135deg, #3d1545 0%, #7a2f68 55%, #e8506a 130%)";
  const textColor = theme?.text || "#ffffff";
  const badgeBg = theme ? "#ffffff" : "#ffffff";
  const badgeColor = theme?.accent || "#c43553";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: bg,
          color: textColor,
          padding: 56,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 420,
            height: 560,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {data
            ? bouquetSvg(
                { f: data.f, w: data.w },
                { width: 400, height: 560, forImage: true }
              )
            : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 48, maxWidth: 600 }}>
          <div style={{ display: "flex", fontSize: 34, opacity: 0.85 }}>May padala para kay</div>
          <div
            style={{
              display: "flex",
              fontSize: to.length > 14 ? 72 : 100,
              fontWeight: 800,
              lineHeight: 1.05,
              marginTop: 8,
            }}
          >
            {to || "sa iyo"}
          </div>
          {from ? (
            <div style={{ display: "flex", fontSize: 34, opacity: 0.85, marginTop: 20 }}>
              {`mula kay ${from}`}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              marginTop: 40,
              alignSelf: "flex-start",
              background: badgeBg,
              color: badgeColor,
              fontSize: 32,
              fontWeight: 700,
              padding: "16px 34px",
              borderRadius: 999,
            }}
          >
            Digital Bouquet
          </div>
          <div style={{ display: "flex", marginTop: 36, fontSize: 26, opacity: 0.7 }}>SendBloom</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
