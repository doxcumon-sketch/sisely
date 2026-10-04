import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  return NextResponse.json({ ok: true, data: user }, { headers: { "cache-control": "no-store" } });
}
