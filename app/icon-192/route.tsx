import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(140deg,#0f1916,#1d4a40)",
          color: "#d8ae56",
          fontSize: 192 * 0.5,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        S
      </div>
    ),
    { width: 192, height: 192 },
  );
}
