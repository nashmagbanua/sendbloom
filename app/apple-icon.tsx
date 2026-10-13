import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 35% 35%, #f43f5e 0%, #be123c 60%, #881337 100%)",
          borderRadius: "50%",
          border: "10px solid #fecdd3",
          boxShadow: "inset 0 6px 14px rgba(255, 255, 255, 0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: "50%",
            border: "2px dashed rgba(255, 255, 255, 0.4)",
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontSize: 78,
              fontWeight: 900,
              fontFamily: "serif",
              letterSpacing: -3,
              textShadow: "0 4px 10px rgba(0, 0, 0, 0.6)",
            }}
          >
            SB
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
