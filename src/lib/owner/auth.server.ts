/**
 * Owner PIN gate — server-only. Not end-user auth (Better Auth stays untouched).
 *
 * PIN: process.env.OWNER_DASHBOARD_PIN, fallback demo pin for sandbox preview.
 * Production: set OWNER_DASHBOARD_PIN in the deploy environment (never commit secrets).
 */
import { createHmac, timingSafeEqual } from "node:crypto";

const DEMO_PIN = "peta-owner-2026";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12h

function pinExpected(): string {
  return process.env.OWNER_DASHBOARD_PIN?.trim() || DEMO_PIN;
}

function secret(): string {
  return (
    process.env.OWNER_SESSION_SECRET?.trim() ||
    process.env.BETTER_AUTH_SECRET?.trim() ||
    "psi-owner-dev-secret-change-me"
  );
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function mintOwnerToken(): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `owner:${expiresAt}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return { token: `${expiresAt}.${sig}`, expiresAt };
}

export function verifyOwnerToken(token: string | null | undefined): boolean {
  if (!token || !token.includes(".")) return false;
  const [expStr, sig] = token.split(".");
  const expiresAt = Number(expStr);
  if (!expiresAt || expiresAt < Date.now()) return false;
  const payload = `owner:${expiresAt}`;
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  try {
    return safeEqual(sig, expected);
  } catch {
    return false;
  }
}

export function verifyOwnerPin(pin: string): boolean {
  const expected = pinExpected();
  try {
    return safeEqual(pin, expected);
  } catch {
    return pin === expected;
  }
}

export function isDemoOwnerPin(): boolean {
  return !process.env.OWNER_DASHBOARD_PIN?.trim();
}
