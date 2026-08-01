import { cn } from "@/lib/utils";
import type { AdminLevel } from "@/lib/history-access";

export type LevelSwitcherProps = {
  level: AdminLevel;
  onChange: (level: AdminLevel) => void;
  loading?: boolean;
  className?: string;
};

const OPTIONS: { id: AdminLevel; label: string; short: string }[] = [
  { id: "province", label: "Provinsi", short: "Prov" },
  { id: "regency", label: "Kab/Kota", short: "Kab" },
];

export function LevelSwitcher({
  level,
  onChange,
  loading,
  className,
}: LevelSwitcherProps) {
  return (
    <div
      className={cn(
        "pointer-events-auto inline-flex rounded-xl border border-border bg-surface/95 p-0.5 shadow-lg backdrop-blur-md",
        className,
      )}
      role="group"
      aria-label="Level wilayah peta"
    >
      {OPTIONS.map((opt) => {
        const active = level === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            disabled={loading && opt.id === "regency"}
            onClick={() => onChange(opt.id)}
            className={cn(
              "min-h-9 rounded-lg px-3 text-xs font-semibold transition-colors sm:min-h-10 sm:px-3.5",
              active
                ? "bg-accent/15 text-accent"
                : "text-muted-foreground hover:text-fg",
              loading && opt.id === "regency" && "opacity-60",
            )}
            aria-pressed={active}
          >
            {opt.id === "regency" && loading ? "Memuat…" : opt.label}
          </button>
        );
      })}
    </div>
  );
}
