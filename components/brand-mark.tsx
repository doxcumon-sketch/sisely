/**
 * SISE mark: an eight-petal lamduan (Sisaket's flower) set inside a silk-weave lozenge, in white-to-orchid on electric violet.
 * Pure SVG (no hooks, no fonts) so it also renders inside ImageResponse for the favicon and PWA icons.
 */
export function BrandMark({ size = 32, bare = false }: { size?: number; bare?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="bm-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7357ff" />
          <stop offset="1" stopColor="#2a1580" />
        </linearGradient>
        <linearGradient id="bm-rose" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ffa3c0" />
        </linearGradient>
      </defs>
      {!bare && <rect width="100" height="100" fill="url(#bm-bg)" />}
      <polygon points="50,9 91,50 50,91 9,50" fill="none" stroke="url(#bm-rose)" strokeWidth="2" />
      <polygon points="50,17 83,50 50,83 17,50" fill="none" stroke="#ffd1e3" strokeOpacity="0.45" strokeWidth="1" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <ellipse key={i} cx="50" cy="35" rx="6.4" ry="14" fill="url(#bm-rose)" fillOpacity={i % 2 ? 0.7 : 1} transform={`rotate(${i * 45} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="5.5" fill="#4326c8" />
      <circle cx="50" cy="50" r="2.2" fill="#ffffff" />
    </svg>
  );
}
