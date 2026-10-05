import Image from "next/image";
import { COVER_PHOTOS, type SceneId } from "@/lib/covers";

/**
 * A full-bleed image slot. It renders the registered artwork for a scene id (lib/covers.ts); drop a real photograph
 * into /public/covers with the same file name and every slot using that scene upgrades at once.
 * No scene registered → a warm duotone placeholder, so layouts never break.
 */
export function Photo({ scene, alt, sizes = "100vw", priority, className }: { scene: SceneId; alt?: string; sizes?: string; priority?: boolean; className?: string }) {
  const p = COVER_PHOTOS.find((x) => x.scene === scene);
  if (!p) return <div className="cover tone-ink absolute inset-0" aria-hidden="true" data-photo-slot={scene} />;
  return <Image src={p.src} alt={alt ?? p.alt} fill sizes={sizes} quality={90} priority={priority} className={className ?? "object-cover"} data-photo-slot={scene} />;
}
