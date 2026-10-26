"use client";

import { RadialBar, RadialBarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import DashboardCard from "@/components/adminPanel/dashboard/DashboardCard";
import { OrderStatusCount } from "@/lib/stats/sales";

const chartConfig = {
  dtc: { label: "DTC", color: "var(--chart-1)" },
  allegro: { label: "Allegro", color: "var(--chart-2)" },
} satisfies ChartConfig;

function StatusRadial({ count }: { count: OrderStatusCount }) {
  const total = count.dtc + count.allegro;
  const windowed = count.status === "SENT" || count.status === "CANCELLED";

  return (
    <div className="flex min-w-0 flex-col items-center">
      {/* Środek koła jest na dolnej krawędzi, więc SVG ma wysokość półkola, nie pełnego koła. */}
      <div className="relative w-full max-w-[140px]">
        <ChartContainer
          config={chartConfig}
          className="aspect-[2/1] w-full [&_.recharts-surface]:overflow-visible"
        >
          <RadialBarChart
            data={[{ dtc: count.dtc, allegro: count.allegro }]}
            startAngle={180}
            endAngle={0}
            cy="100%"
            innerRadius="115%"
            outerRadius="186%"
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <RadialBar
              dataKey="dtc"
              stackId="channels"
              cornerRadius={4}
              fill="var(--color-dtc)"
              className="stroke-transparent stroke-2"
              background={{ fill: "var(--muted)" }}
            />
            <RadialBar
              dataKey="allegro"
              stackId="channels"
              cornerRadius={4}
              fill="var(--color-allegro)"
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
        <p className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-1 text-center text-xl font-medium tabular-nums leading-none">
          {total}
        </p>
      </div>
      <p className="mt-1.5 text-center text-sm text-muted-foreground">
        {count.label}
        {windowed ? " · 24h" : ""}
      </p>
    </div>
  );
}

export default function OrdersStatusWidget({
  counts,
  error,
}: {
  counts: OrderStatusCount[];
  error: string | null;
}) {
  return (
    <DashboardCard className="gap-0" title="Zamówienia">
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {counts.map((count) => (
              <StatusRadial key={count.status} count={count} />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-end gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-chart-1" />
              DTC
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-chart-2" />
              Allegro
            </span>
          </div>
        </>
      )}
    </DashboardCard>
  );
}
