import "server-only";
import { randomBytes } from "node:crypto";
import { authorizeUrl } from "@/lib/server/line";
import { sign } from "@/lib/server/session";

/** One-time OAuth state for LINE Login: the authorize URL plus the signed httpOnly cookie that the callback checks. */
export function beginLine(origin: string, returnTo: string) {
  const state = randomBytes(16).toString("base64url");
  const nonce = randomBytes(16).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ state, nonce, returnTo, exp: Date.now() + 10 * 60_000 })).toString("base64url");
  return {
    url: authorizeUrl(origin, state, nonce),
    cookie: {
      name: "sise_oauth",
      value: `${payload}.${sign(payload)}`,
      options: {
        httpOnly: true,
        sameSite: "lax" as const, // must survive the redirect back from access.line.me
        secure: process.env.NODE_ENV === "production",
        path: "/api/auth/line",
        maxAge: 600,
      },
    },
  };
}
