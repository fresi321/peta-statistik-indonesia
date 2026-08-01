import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Repeat,
} from "lucide-react";
import type { PlaybackSpeed } from "@/hooks/useHistoryPlayback";
import { cn } from "@/lib/utils";

export type HistoryTimelineProps = {
  years: number[];
  yearIndex: number;
  year: number;
  playing: boolean;
  speed: PlaybackSpeed;
  loop: boolean;
  onTogglePlay: () => void;
  onStepPrev: () => void;
  onStepNext: () => void;
  onScrub: (index: number) => void;
  onSpeedChange: (s: PlaybackSpeed) => void;
  onLoopChange: (v: boolean) => void;
  className?: string;
};

const SPEEDS: PlaybackSpeed[] = [1, 2, 4];

export function HistoryTimeline({
  years,
  yearIndex,
  year,
  playing,
  speed,
  loop,
  onTogglePlay,
  onStepPrev,
  onStepNext,
  onScrub,
  onSpeedChange,
  onLoopChange,
  className,
}: HistoryTimelineProps) {
  if (years.length === 0) return null;

  const first = years[0]!;
  const last = years[years.length - 1]!;
  const atStart = yearIndex <= 0;
  const atEnd = yearIndex >= years.length - 1;

  return (
    <div
      className={cn(
        "pointer-events-auto rounded-xl border border-border bg-surface/95 px-2.5 py-2 shadow-lg backdrop-blur-md sm:px-3",
        className,
      )}
      role="group"
      aria-label={`Pemutar data historis, tahun ${year}`}
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onStepPrev}
          disabled={atStart}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-fg disabled:opacity-35 sm:size-10"
          aria-label="Tahun sebelumnya"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>

        <button
          type="button"
          onClick={onTogglePlay}
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors sm:size-11",
            playing
              ? "border-accent/40 bg-accent/15 text-accent"
              : "border-border bg-surface-elevated text-fg hover:border-accent/30",
          )}
          aria-label={playing ? "Jeda" : "Putar"}
          aria-pressed={playing}
        >
          {playing ? (
            <Pause className="size-4 fill-current" aria-hidden />
          ) : (
            <Play className="size-4 fill-current" aria-hidden />
          )}
        </button>

        <button
          type="button"
          onClick={onStepNext}
          disabled={atEnd && !loop}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-fg disabled:opacity-35 sm:size-10"
          aria-label="Tahun berikutnya"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>

        <div className="min-w-0 flex-1 px-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm font-semibold tabular-nums text-fg sm:text-base">
              {year}
            </span>
            <span className="hidden font-mono text-[10px] tabular-nums text-muted-foreground sm:inline">
              {first}–{last}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={years.length - 1}
            step={1}
            value={yearIndex}
            onChange={(e) => onScrub(Number(e.target.value))}
            className="history-scrubber mt-1 w-full"
            aria-label="Geser ke tahun"
            aria-valuemin={first}
            aria-valuemax={last}
            aria-valuenow={year}
            aria-valuetext={`Tahun ${year}`}
          />
        </div>

        <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-border bg-surface-elevated p-0.5">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSpeedChange(s)}
              className={cn(
                "min-h-8 min-w-8 rounded-md px-1.5 text-[10px] font-semibold tabular-nums transition-colors sm:min-h-9 sm:min-w-9 sm:text-[11px]",
                speed === s
                  ? "bg-accent/15 text-accent"
                  : "text-muted-foreground hover:text-fg",
              )}
              aria-label={`Kecepatan ${s}×`}
              aria-pressed={speed === s}
            >
              {s}×
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onLoopChange(!loop)}
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors sm:size-10",
            loop
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-border text-muted-foreground hover:text-fg",
          )}
          aria-label={loop ? "Ulang aktif" : "Ulang nonaktif"}
          aria-pressed={loop}
          title="Ulang deret"
        >
          <Repeat className="size-3.5" aria-hidden />
        </button>
      </div>

      <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">
        Putar deret tahun · legenda tetap (skala bersama)
      </p>
    </div>
  );
}
