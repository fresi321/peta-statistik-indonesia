import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { ownerLogin } from "@/lib/owner/api";
import { writeOwnerSession } from "@/lib/owner/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/owner/login")({
  head: () => ({
    meta: [
      { title: "Owner Login · Peta Statistik Indonesia" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OwnerLoginPage,
});

function OwnerLoginPage() {
  const nav = useNavigate();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await ownerLogin({ data: { pin } });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      writeOwnerSession({
        token: res.token,
        expiresAt: res.expiresAt,
        role: "owner",
      });
      await nav({ to: "/owner" });
    } catch {
      setError("Gagal masuk. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface-elevated">
            <Shield className="size-4 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-fg">
              Owner login
            </h1>
            <p className="text-xs text-muted-foreground">
              Monitoring data & kesehatan web
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="owner-pin"
              className="mb-1.5 block text-xs font-medium text-muted-foreground"
            >
              PIN owner
            </label>
            <Input
              id="owner-pin"
              type="password"
              autoComplete="current-password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Masukkan PIN"
              required
              className="font-mono"
            />
          </div>
          {error && (
            <p className="text-xs text-danger" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading || !pin}>
            {loading ? "Memeriksa…" : "Masuk dashboard"}
          </Button>
        </form>

        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
          Login ini terpisah dari akun pengunjung. Di sandbox, PIN demo:{" "}
          <code className="text-fg">peta-owner-2026</code>. Produksi: set{" "}
          <code className="text-fg">OWNER_DASHBOARD_PIN</code>.
        </p>
        <p className="mt-3 text-center text-xs">
          <Link to="/" className="text-accent hover:underline">
            ← Kembali ke peta
          </Link>
        </p>
      </div>
    </main>
  );
}
