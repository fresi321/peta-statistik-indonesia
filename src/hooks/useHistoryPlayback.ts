import { useCallback, useEffect, useMemo, useState } from "react";
import type { MetricKey } from "@/data/province-stats";
import {
  getHistoryDomain,
  getHistoryYears,
  hasHistory,
  type AdminLevel,
  type HistoryDomain,
} from "@/lib/history-access";

export type PlaybackSpeed = 1 | 2 | 4;

const INTERVAL_MS: Record<PlaybackSpeed, number> = {
  1: 900,
  2: 500,
  4: 280,
};

/** Slightly slower default interval at kab/kota for path count. */
const REGENCY_INTERVAL_MS: Record<PlaybackSpeed, number> = {
  1: 1000,
  2: 550,
  4: 320,
};

export type HistoryPlayback = {
  enabled: boolean;
  years: number[];
  year: number | null;
  yearIndex: number;
  playing: boolean;
  speed: PlaybackSpeed;
  loop: boolean;
  domain: HistoryDomain | null;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setSpeed: (s: PlaybackSpeed) => void;
  setLoop: (v: boolean) => void;
  stepPrev: () => void;
  stepNext: () => void;
  scrubToIndex: (index: number) => void;
};

/**
 * Discrete year playback for metrics with a history series.
 * On metric/level change: pause and jump to latest year.
 */
export function useHistoryPlayback(
  metric: MetricKey,
  level: AdminLevel = "province",
): HistoryPlayback {
  const enabled = hasHistory(metric, level);
  const years = useMemo(
    () => (enabled ? (getHistoryYears(metric, level) ?? []) : []),
    [metric, level, enabled],
  );
  const domain = useMemo(
    () => (enabled ? getHistoryDomain(metric, level) : null),
    [metric, level, enabled],
  );

  const [yearIndex, setYearIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [loop, setLoop] = useState(true);

  useEffect(() => {
    setPlaying(false);
    if (years.length > 0) {
      setYearIndex(years.length - 1);
    } else {
      setYearIndex(0);
    }
  }, [metric, level, years]);

  useEffect(() => {
    if (!playing || years.length === 0) return;
    const table = level === "regency" ? REGENCY_INTERVAL_MS : INTERVAL_MS;
    const ms = table[speed];
    const id = window.setInterval(() => {
      setYearIndex((i) => {
        if (i >= years.length - 1) {
          if (loop) return 0;
          return i;
        }
        return i + 1;
      });
    }, ms);
    return () => window.clearInterval(id);
  }, [playing, speed, loop, years, level]);

  useEffect(() => {
    if (!playing || loop || years.length === 0) return;
    if (yearIndex >= years.length - 1) {
      setPlaying(false);
    }
  }, [yearIndex, playing, loop, years.length]);

  const year =
    enabled && years.length > 0 ? (years[yearIndex] ?? null) : null;

  const play = useCallback(() => setPlaying(true), []);
  const pause = useCallback(() => setPlaying(false), []);
  const togglePlay = useCallback(() => setPlaying((p) => !p), []);

  const stepPrev = useCallback(() => {
    setPlaying(false);
    setYearIndex((i) => Math.max(0, i - 1));
  }, []);

  const stepNext = useCallback(() => {
    setPlaying(false);
    setYearIndex((i) => {
      if (years.length === 0) return 0;
      return Math.min(years.length - 1, i + 1);
    });
  }, [years.length]);

  const scrubToIndex = useCallback(
    (index: number) => {
      if (years.length === 0) return;
      const clamped = Math.max(0, Math.min(years.length - 1, index));
      setYearIndex(clamped);
    },
    [years.length],
  );

  return {
    enabled,
    years,
    year,
    yearIndex,
    playing,
    speed,
    loop,
    domain,
    play,
    pause,
    togglePlay,
    setSpeed,
    setLoop,
    stepPrev,
    stepNext,
    scrubToIndex,
  };
}
