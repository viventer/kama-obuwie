"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import DashboardCard from "@/components/adminPanel/dashboard/DashboardCard";
import { cn } from "@/lib/utils";
import {
  buildSalesChartSeries,
  formatPln,
  formatPlnAxis,
  SalesDailyPoint,
} from "@/lib/stats/sales";

const splitConfig = {
  allegro: { label: "Allegro", color: "var(--chart-2)" },
  dtc: { label: "DTC", color: "var(--chart-1)" },
} satisfies ChartConfig;

const totalConfig = {
  total: { label: "Razem", color: "var(--chart-1)" },
} satisfies ChartConfig;

type Range = 7 | 30;
type Mode = "split" | "total";

function seriesLabel(name: string | number | undefined): string {
  const key = String(name ?? "");
  if (key in splitConfig) {
    return splitConfig[key as keyof typeof splitConfig].label;
  }
  if (key in totalConfig) {
    return totalConfig[key as keyof typeof totalConfig].label;
  }
  return key;
}

export default function SalesValueChartWidget({
  today,
  points,
  className,
}: {
  today: string;
  points: SalesDailyPoint[];
  className?: string;
}) {
  const [range, setRange] = useState<Range>(7);
  const [mode, setMode] = useState<Mode>("split");
  const series = buildSalesChartSeries(points, range, today);
  const hasData = series.some((point) => point.total > 0);
  const config = mode === "split" ? splitConfig : totalConfig;

  return (
    <DashboardCard
      title="Wartość sprzedaży"
      className={cn("xl:min-h-0", className)}
      contentClassName="xl:flex xl:min-h-0 xl:flex-1 xl:flex-col"
      action={
        <div className="flex flex-wrap justify-end gap-2">
          <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            value={mode}
            onValueChange={(value) => {
              if (value === "split" || value === "total") setMode(value);
            }}
          >
            <ToggleGroupItem value="split">Podział</ToggleGroupItem>
            <ToggleGroupItem value="total">Razem</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            value={String(range)}
            onValueChange={(value) => {
              if (value === "7" || value === "30") setRange(Number(value) as Range);
            }}
          >
            <ToggleGroupItem value="7">7 dni</ToggleGroupItem>
            <ToggleGroupItem value="30">30 dni</ToggleGroupItem>
          </ToggleGroup>
        </div>
      }
    >
      {hasData ? (
        <ChartContainer
          config={config}
          className="aspect-auto h-[280px] w-full xl:h-auto xl:min-h-[280px] xl:flex-1"
        >
          {range === 7 ? (
            <BarChart data={series} margin={{ left: 4, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(value: number) => formatPlnAxis(value)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          {seriesLabel(name)}
                        </span>
                        <span className="font-mono font-medium tabular-nums">
                          {formatPln(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              {mode === "split" ? (
                <>
                  <Bar dataKey="allegro" fill="var(--color-allegro)" radius={4} />
                  <Bar dataKey="dtc" fill="var(--color-dtc)" radius={4} />
                </>
              ) : (
                <Bar dataKey="total" fill="var(--color-total)" radius={4} />
              )}
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          ) : (
            <LineChart data={series} margin={{ left: 4, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(value: number) => formatPlnAxis(value)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          {seriesLabel(name)}
                        </span>
                        <span className="font-mono font-medium tabular-nums">
                          {formatPln(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              {mode === "split" ? (
                <>
                  <Line
                    dataKey="allegro"
                    type="monotone"
                    stroke="var(--color-allegro)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="dtc"
                    type="monotone"
                    stroke="var(--color-dtc)"
                    strokeWidth={2}
                    dot={false}
                  />
                </>
              ) : (
                <Line
                  dataKey="total"
                  type="monotone"
                  stroke="var(--color-total)"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          )}
        </ChartContainer>
      ) : (
        <p className="py-16 text-center text-sm text-muted-foreground xl:flex xl:flex-1 xl:items-center xl:justify-center">
          Brak danych sprzedażowych w tym okresie.
        </p>
      )}
    </DashboardCard>
  );
}
