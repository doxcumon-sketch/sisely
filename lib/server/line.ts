import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { Tone } from "../../generated/prisma/client";

// Values pasted into hosting dashboards often carry stray whitespace/tabs; trim them.
const channelId = () => (process.env.LINE_CHANNEL_ID ?? "").trim();
const channelSecret = () => (process.env.LINE_CHANNEL_SECRET ?? "").trim();

export const lineConfigured = () => !!channelId() && !!channelSecret();

export type LineProfile = { sub: string; name: string; picture?: string };

const TONES: Tone[] = ["jade", "laterite", "gold", "indigo", "plum", "sky", "ink"];

export function authorizeUrl(origin: string, state: string, nonce: string): string {
  const u = new URL("https://access.line.me/oauth2/v2.1/authorize");
  u.searchParams.set("response_type", "code");
  u.searchParams.set("client_id", channelId());
  u.searchParams.set("redirect_uri", `${origin}/api/auth/line/callback`);
  u.searchParams.set("state", state);
  u.searchParams.set("scope", "profile openid");
  u.searchParams.set("nonce", nonce);
  return u.toString();
}

/** Exchange the authorization code, then let LINE verify the id_token (signature, audience, expiry, nonce). */
export async function fetchLineProfile(code: string, origin: string, nonce: string): Promise<LineProfile> {
  const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${origin}/api/auth/line/callback`,
      client_id: channelId(),
      client_secret: channelSecret(),
    }),
    cache: "no-store",
  });
  if (!tokenRes.ok) throw new Error(`LINE token exchange failed (${tokenRes.status})`);
  const { id_token } = (await tokenRes.json()) as { id_token?: string };
  if (!id_token) throw new Error("LINE did not return an id_token");

  const verifyRes = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ id_token, client_id: channelId(), nonce }),
    cache: "no-store",
  });
  if (!verifyRes.ok) throw new Error(`LINE id_token verification failed (${verifyRes.status})`);
  const claims = (await verifyRes.json()) as { sub?: string; name?: string; picture?: string };
  if (!claims.sub) throw new Error("LINE id_token missing sub");
  return { sub: claims.sub, name: claims.name?.trim() || "สมาชิก SISE", picture: claims.picture };
}

function slugify(name: string): string {
  const latin = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return latin.slice(0, 14) || "member";
}

/** Find or create the member for a LINE account. Profile photo/name refresh on every login. */
export async function upsertLineUser(p: LineProfile) {
  const existing = await prisma.user.findUnique({ where: { lineUserId: p.sub } });
  if (existing) {
    // A photo the member uploaded themselves is never replaced by their LINE picture.
    return prisma.user.update({ where: { id: existing.id }, data: { pictureUrl: existing.avatarCustom ? existing.pictureUrl : (p.picture ?? existing.pictureUrl), lastSeenAt: new Date() } });
  }
  for (let i = 0; i < 5; i++) {
    const handle = `${slugify(p.name)}${randomBytes(2).toString("hex")}`;
    try {
      return await prisma.user.create({
        data: { lineUserId: p.sub, handle, name: p.name, pictureUrl: p.picture, tone: TONES[Math.floor(Math.random() * TONES.length)] },
      });
    } catch (e) {
      if ((e as { code?: string }).code !== "P2002") throw e; // handle collision: retry
    }
  }
  throw new Error("could not allocate handle");
}
