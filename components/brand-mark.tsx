/**
 * SISE monogram: a single "S" on an ink-to-violet tile. Plain styled boxes (no SVG text, no hooks) so it renders
 * identically in the page and inside ImageResponse for the favicon and PWA icons.
 */
export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(140deg, #14112e 0%, #3a22b8 60%, #7357ff 100%)",
        color: "#ffffff",
        fontSize: Math.round(size * 0.62),
        fontWeight: 800,
        letterSpacing: -2,
        lineHeight: 1,
      }}
    >
      S
    </div>
  );
}
