"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DashboardCard from "@/components/adminPanel/dashboard/DashboardCard";
import {
  addChannels,
  filterSalesPeriod,
  formatAov,
  formatGrosze,
  formatMargin,
  SalesDailyPoint,
  SalesPeriod,
  SalesChannelTotals,
} from "@/lib/stats/sales";

const PERIODS: { value: SalesPeriod; label: string }[] = [
  { value: "today", label: "Dziś" },
  { value: "yesterday", label: "Wczoraj" },
  { value: "7d", label: "7 dni" },
  { value: "30d", label: "30 dni" },
];

function sumPeriod(points: SalesDailyPoint[]) {
  return points.reduce(
    (total, point) => ({
      DTC: addChannels(total.DTC, point.DTC),
      AL1: addChannels(total.AL1, point.AL1),
      AL2: addChannels(total.AL2, point.AL2),
    }),
    {
      DTC: { revenue: 0, cogs: 0, orders: 0, cogsEstimatedOrders: 0 },
      AL1: { revenue: 0, cogs: 0, orders: 0, cogsEstimatedOrders: 0 },
      AL2: { revenue: 0, cogs: 0, orders: 0, cogsEstimatedOrders: 0 },
    },
  );
}

export default function SalesStatsWidget({
  today,
  points,
}: {
  today: string;
  points: SalesDailyPoint[];
}) {
  const [period, setPeriod] = useState<SalesPeriod>("today");
  const totals = sumPeriod(filterSalesPeriod(points, period, today));
  const allegro = addChannels(totals.AL1, totals.AL2);
  const combined = addChannels(totals.DTC, allegro);

  const rows: { label: string; totals: SalesChannelTotals }[] = [
    { label: "DTC", totals: totals.DTC },
    { label: "Allegro", totals: allegro },
    { label: "Razem", totals: combined },
  ];

  return (
    <DashboardCard
      title="Statystyki sprzedaży"
      action={
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          value={period}
          onValueChange={(value) => {
            if (value) setPeriod(value as SalesPeriod);
          }}
        >
          {PERIODS.map((item) => (
            <ToggleGroupItem key={item.value} value={item.value}>
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kanał</TableHead>
            <TableHead>Przychód</TableHead>
            <TableHead>Zamówienia</TableHead>
            <TableHead>AOV</TableHead>
            <TableHead>Marża brutto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.label}>
              <TableCell className="font-medium">{row.label}</TableCell>
              <TableCell>{formatGrosze(row.totals.revenue)}</TableCell>
              <TableCell>{row.totals.orders}</TableCell>
              <TableCell>
                {formatAov(row.totals.revenue, row.totals.orders)}
              </TableCell>
              <TableCell>
                {formatMargin(row.totals.revenue, row.totals.cogs)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {combined.cogsEstimatedOrders > 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Część marży jest oszacowana: dla pozycji bez ceny zakupu przyjęto
          koszt = 50% ceny sprzedaży ({combined.cogsEstimatedOrders}{" "}
          {combined.cogsEstimatedOrders === 1 ? "zamówienie" : "zamówień"}).
        </p>
      ) : null}
    </DashboardCard>
  );
}
