/**
 * Owner dashboard session (client). Separate from end-user Better Auth.
 * Token is issued by server after PIN check; stored in sessionStorage.
 */

const TOKEN_KEY = "psi_owner_session_v1";
const REVIEW_KEY = "psi_owner_last_review_v1";
const ACK_KEY = "psi_owner_ack_v1";

export type OwnerSession = {
  token: string;
  expiresAt: number;
  role: "owner";
};

export function readOwnerSession(): OwnerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as OwnerSession;
    if (!s?.token || !s.expiresAt || s.expiresAt < Date.now()) {
      sessionStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function writeOwnerSession(s: OwnerSession) {
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(s));
}

export function clearOwnerSession() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function getLastOwnerReview(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REVIEW_KEY);
}

export function markOwnerReview(iso = new Date().toISOString()) {
  localStorage.setItem(REVIEW_KEY, iso);
  return iso;
}

export function getAcknowledgedAlerts(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACK_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function acknowledgeAlert(id: string) {
  const set = new Set(getAcknowledgedAlerts());
  set.add(id);
  localStorage.setItem(ACK_KEY, JSON.stringify([...set]));
}

export function clearAcknowledgedAlerts() {
  localStorage.removeItem(ACK_KEY);
}
