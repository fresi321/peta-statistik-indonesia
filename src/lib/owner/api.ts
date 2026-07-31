import { createServerFn } from "@tanstack/react-start";
import {
  isDemoOwnerPin,
  mintOwnerToken,
  verifyOwnerPin,
  verifyOwnerToken,
} from "@/lib/owner/auth.server";

export const ownerLogin = createServerFn({ method: "POST" })
  .validator((data: { pin: string }) => {
    if (!data || typeof data.pin !== "string") {
      throw new Error("PIN wajib diisi");
    }
    return { pin: data.pin.trim() };
  })
  .handler(async ({ data }) => {
    if (!verifyOwnerPin(data.pin)) {
      return { ok: false as const, error: "PIN owner salah" };
    }
    const { token, expiresAt } = mintOwnerToken();
    return {
      ok: true as const,
      token,
      expiresAt,
      demo: isDemoOwnerPin(),
    };
  });

export const ownerVerify = createServerFn({ method: "POST" })
  .validator((data: { token: string }) => ({
    token: String(data?.token ?? ""),
  }))
  .handler(async ({ data }) => {
    const valid = verifyOwnerToken(data.token);
    return { ok: valid as boolean, demo: isDemoOwnerPin() };
  });
