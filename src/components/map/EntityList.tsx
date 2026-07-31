import { Building2, GraduationCap, Hospital, Landmark, Wheat } from "lucide-react";
import type { EntityList as EntityListData } from "@/data/province-entities";
import { cn } from "@/lib/utils";

const ICONS = {
  university: GraduationCap,
  hospital: Hospital,
  attraction: Landmark,
  commodity: Wheat,
  default: Building2,
} as const;

export function EntityListSection({
  title,
  list,
  icon = "default",
  className,
}: {
  title: string;
  list: EntityListData;
  icon?: keyof typeof ICONS;
  className?: string;
}) {
  const Icon = ICONS[icon] ?? ICONS.default;
  const total = list.total ?? list.items.length;
  const showing = list.items.length;
  const isPartial = total > showing;

  return (
    <section className={cn("mt-4", className)} aria-label={title}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-fg">
          <Icon className="size-3.5 text-accent" aria-hidden />
          {title}
        </h3>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {isPartial ? `${showing} dari ${total}` : `${showing} nama`}
        </span>
      </div>
      <ul className="divide-y divide-border/80 overflow-hidden rounded-xl border border-border bg-bg/50">
        {list.items.map((item, i) => (
          <li
            key={`${item.name}-${i}`}
            className="flex items-start gap-2.5 px-3 py-2.5"
          >
            <span className="mt-0.5 w-5 shrink-0 text-center font-mono text-[10px] tabular-nums text-muted-foreground">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium leading-snug text-fg">
                {item.name}
              </span>
              <span className="mt-0.5 flex flex-wrap gap-x-2 text-[11px] text-muted-foreground">
                {item.type && <span>{item.type}</span>}
                {item.city && <span>· {item.city}</span>}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {list.sourceNote && (
        <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
          {list.sourceNote}
          {isPartial
            ? ` Menampilkan ${showing} entri unggulan dari total ~${total}.`
            : ""}
        </p>
      )}
    </section>
  );
}
