"use client";

import { PolarGrid, RadialBar, RadialBarChart } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import DashboardCard from "@/components/adminPanel/dashboard/DashboardCard";
import { ProductStageCount } from "@/lib/stats/sales";

const chartConfig = {
  stage: { label: "Produkty", color: "var(--chart-1)" },
} satisfies ChartConfig;

function StageRadial({
  stage,
  total,
}: {
  stage: ProductStageCount;
  total: number;
}) {
  const ratio = total > 0 ? stage.count / total : 0;
  // Recharts nie buduje osi kąta bez RadialBar, a PolarGrid czyta z niej cx.
  // Kąt 0 (start === end) też zostawia oś pustą, więc zero dostaje ślad poniżej piksela.
  const sweep = ratio > 0 ? ratio * 360 : 0.001;

  return (
    <div className="flex min-w-0 flex-col items-center">
      <div className="relative mx-auto h-[92px] w-full max-w-[92px]">
        <ChartContainer
          config={chartConfig}
          className="aspect-square h-full w-full"
        >
          <RadialBarChart
            data={[{ stage: stage.stage, value: ratio > 0 ? stage.count : 1 }]}
            startAngle={90}
            endAngle={90 - sweep}
            innerRadius={28}
            outerRadius={42}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-transparent"
              polarRadius={[38, 32]}
            />
            <RadialBar
              dataKey="value"
              cornerRadius={6}
              fill={ratio > 0 ? "var(--color-stage)" : "transparent"}
              background={{ fill: "transparent" }}
            />
          </RadialBarChart>
        </ChartContainer>
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-lg font-medium">
          {stage.count}
        </span>
      </div>
      <p className="text-center text-xs text-muted-foreground">{stage.label}</p>
    </div>
  );
}

export default function ProductStagesWidget({
  stages,
  className,
}: {
  stages: ProductStageCount[];
  className?: string;
}) {
  const total = stages.reduce((sum, stage) => sum + stage.count, 0);

  return (
    <DashboardCard title="Produkty" className={className}>
      <div className="grid grid-cols-3 gap-2">
        {stages.map((stage) => (
          <StageRadial key={stage.stage} stage={stage} total={total} />
        ))}
      </div>
    </DashboardCard>
  );
}
