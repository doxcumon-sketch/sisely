/**
 * SISE mark: an eight-petal lamduan (Sisaket's flower) set inside a silk-weave lozenge, in rose gold on bordeaux.
 * Pure SVG (no hooks, no fonts) so it also renders inside ImageResponse for the favicon and PWA icons.
 */
export function BrandMark({ size = 32, bare = false }: { size?: number; bare?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="bm-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a2d52" />
          <stop offset="1" stopColor="#3a0f22" />
        </linearGradient>
        <linearGradient id="bm-rose" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe3d4" />
          <stop offset="1" stopColor="#d79475" />
        </linearGradient>
      </defs>
      {!bare && <rect width="100" height="100" fill="url(#bm-bg)" />}
      <polygon points="50,9 91,50 50,91 9,50" fill="none" stroke="url(#bm-rose)" strokeWidth="2" />
      <polygon points="50,17 83,50 50,83 17,50" fill="none" stroke="#e8b9a0" strokeOpacity="0.45" strokeWidth="1" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <ellipse key={i} cx="50" cy="35" rx="6.4" ry="14" fill="url(#bm-rose)" fillOpacity={i % 2 ? 0.7 : 1} transform={`rotate(${i * 45} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="5.5" fill="#6e1f3d" />
      <circle cx="50" cy="50" r="2.2" fill="#fbe3d4" />
    </svg>
  );
}
