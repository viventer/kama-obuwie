"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ColumnFiltersState,
  ExpandedState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  ColumnName,
  getDataTableColumns,
  TableAction,
} from "@/lib/dataTableColumns";
import { Fragment, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DataTable<T extends { id: string }>({
  data,
  columnNames,
  actions,
  renderRowSubComponent,
}: {
  data: T[];
  columnNames: ColumnName<T>[];
  actions: TableAction[];
  renderRowSubComponent?: (row: T) => React.ReactNode;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const basicColumns = getDataTableColumns<T>(columnNames, actions);

  const table = useReactTable({
    data,
    columns: basicColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      expanded,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const isExpanded = row.getIsExpanded();
                return (
                  <Fragment key={row.id}>
                    <TableRow
                      data-state={isExpanded ? "expanded" : undefined}
                      className="cursor-pointer"
                      onClick={(e) => {
                        // Prevent toggling when clicking on buttons or dropdowns
                        const target = e.target as HTMLElement;
                        if (
                          target.closest("button") ||
                          target.closest("[role='menu']") ||
                          target.closest("[data-ignore-row-click]")
                        ) {
                          return;
                        }
                        row.toggleExpanded();
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    {isExpanded && renderRowSubComponent && (
                      <TableRow>
                        <TableCell colSpan={basicColumns.length}>
                          {renderRowSubComponent(row.original)}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={basicColumns.length}
                  className="h-24 text-center"
                >
                  Brak wyników.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          wybrano {table.getFilteredSelectedRowModel().rows.length} z{" "}
          {table.getFilteredRowModel().rows.length} rzędów.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
