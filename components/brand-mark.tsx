/**
 * SISE monogram: a single champagne "S" on a black tile. Plain styled boxes (no SVG text, no hooks) so it renders
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
        background: "linear-gradient(145deg, #1b1915 0%, #0b0b0c 100%)",
        color: "#d8bd8d",
        fontSize: Math.round(size * 0.62),
        fontWeight: 600,
        letterSpacing: -2,
        lineHeight: 1,
        fontFamily: "Georgia, serif",
      }}
    >
      S
    </div>
  );
}
