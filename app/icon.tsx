import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
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
          border: "2px solid #fecdd3",
          boxShadow: "inset 0 1px 3px rgba(255, 255, 255, 0.4)",
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: 16,
            fontWeight: 900,
            fontFamily: "serif",
            letterSpacing: -1,
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
          }}
        >
          SB
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
