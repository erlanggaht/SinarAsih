import type { ReactNode } from "react";

export function PanelStatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit?: ReactNode;
}) {
  return (
    <div className="min-w-0 border border-border bg-card p-4 text-card-foreground sm:p-5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-2xl font-semibold wrap-anywhere tabular-nums sm:text-3xl">
          {new Intl.NumberFormat("id-ID").format(value)}
        </span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </dd>
    </div>
  );
}
