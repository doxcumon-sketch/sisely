import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(140deg,#0f1916,#1d4a40)", color: "#d8ae56", fontSize: 110, fontWeight: 700 }}>
        S
      </div>
    ),
    size,
  );
}
