"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import DashboardCard from "@/components/adminPanel/dashboard/DashboardCard";
import { ReturnBucketCount } from "@/lib/stats/sales";

const chartConfig = {
  count: { label: "Zwroty", color: "var(--chart-1)" },
} satisfies ChartConfig;

export default function ReturnsWidget({
  buckets,
  error,
  className,
}: {
  buckets: ReturnBucketCount[];
  error: string | null;
  className?: string;
}) {
  return (
    <DashboardCard title="Zwroty" className={className}>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
          <BarChart
            data={buckets}
            layout="vertical"
            margin={{ left: 8, right: 12 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="label"
              type="category"
              width={96}
              tickLine={false}
              axisLine={false}
            />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={4}
              barSize={16}
            />
          </BarChart>
        </ChartContainer>
      )}
    </DashboardCard>
  );
}
