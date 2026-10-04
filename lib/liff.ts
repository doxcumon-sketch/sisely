/**
 * LIFF = the site running inside the LINE app. Set NEXT_PUBLIC_LIFF_ID (from LINE Developers → the LINE Login channel →
 * LIFF tab) and the "เข้าสู่ระบบด้วย LINE" button opens SISE inside LINE and signs the member in there, with no
 * hop through the phone's default browser. The ID is public (it appears in every LIFF URL), not a secret.
 */
export const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID?.trim() || "";
export const liffUrl = (returnTo: string) => `https://liff.line.me/${LIFF_ID}?returnTo=${encodeURIComponent(returnTo)}`;
