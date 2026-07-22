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
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
  ColumnDef,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  ColumnName,
  getDataTableColumns,
  TableAction,
} from "@/lib/dataTableColumns";
import { Dispatch, Fragment, ReactNode, SetStateAction, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import DataTableRow from "./DataTableRow";
import DataTableRowWithImage from "./DataTableRowWithImage";

export function DataTable<T extends { id: string }>({
  data,
  columnNames,
  actions,
  searchColumns,
  renderRowSubComponent,
  searchPlaceholder = "Szukaj",
  hasImages = false,
  imageAttribute,
  imageFolderPath,
  isReadyAttribute,
  onRowClick,
  maxSelectable,
  onSelectionChange,
  disableSelection = false,
  additionalContent,
  filterColumns,
  defaultHiddenColumnIds,
  renderToolbarFilters,
  columnFilters: controlledColumnFilters,
  onColumnFiltersChange,
}: {
  data: T[];
  columnNames: ColumnName<T>[];
  actions?: TableAction[];
  searchColumns: (keyof T)[];
  renderRowSubComponent?: (row: T) => React.ReactNode;
  searchPlaceholder?: string;
  hasImages?: boolean;
  imageAttribute?: keyof T;
  imageFolderPath?: string;
  isReadyAttribute?: keyof T;
  onRowClick?: (row: T) => void;
  maxSelectable?: number;
  onSelectionChange?: (selected: T[]) => void;
  disableSelection?: boolean;
  additionalContent?: (row: T) => React.ReactNode;
  filterColumns?: ColumnDef<T>[];
  defaultHiddenColumnIds?: string[];
  renderToolbarFilters?: (ctx: {
    setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
  }) => ReactNode;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: Dispatch<SetStateAction<ColumnFiltersState>>;
}) {
  const [pagination, setPagination] = useState<{
    pageIndex: number;
    pageSize: number;
  }>({
    pageIndex: 0,
    pageSize: hasImages ? 10 : 30,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [internalColumnFilters, setInternalColumnFilters] =
    useState<ColumnFiltersState>([]);
  const columnFilters = controlledColumnFilters ?? internalColumnFilters;
  const setColumnFilters = onColumnFiltersChange ?? setInternalColumnFilters;
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const globalFilterFn = (
    row: Row<T>,
    columnId: string,
    filterValue: string,
  ) => {
    return searchColumns.some((colKey) => {
      const cellValue = row.getValue(colKey as string);
      if (cellValue == null) return false;
      return String(cellValue)
        .toLowerCase()
        .includes(filterValue.toLowerCase().trim());
    });
  };

  const basicColumns = getDataTableColumns<T>(columnNames, actions);

  const selectionColumn: ColumnDef<T, any> = {
    id: "select",
    header: () => null,
    cell: ({ row }) => {
      const isChecked = !!rowSelection[row.id];

      return (
        <Checkbox
          checked={isChecked}
          onCheckedChange={(value) => {
            if (value) {
              // Jeśli zaznaczamy wiersz
              if (maxSelectable === 1) {
                setRowSelection({ [row.id]: true });
                onSelectionChange?.([row.original]);
              } else {
                setRowSelection((prev) => {
                  const next = { ...prev, [row.id]: true };
                  const selectedObjs = data.filter((item) =>
                    Object.keys(next).includes(item.id),
                  );
                  onSelectionChange?.(selectedObjs);
                  return next;
                });
              }
            } else {
              // Jeśli odznaczamy wiersz
              if (maxSelectable === 1) {
                setRowSelection({});
                onSelectionChange?.([]);
              } else {
                setRowSelection((prev) => {
                  const copy = { ...prev };
                  delete copy[row.id];
                  const selectedObjs = data.filter((item) =>
                    Object.keys(copy).includes(item.id),
                  );
                  onSelectionChange?.(selectedObjs);
                  return copy;
                });
              }
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
    size: 40,
  };

  const dataColumns = disableSelection
    ? basicColumns
    : [selectionColumn, ...basicColumns];
  const allColumns = [...(filterColumns ?? []), ...dataColumns];

  const hiddenColumnVisibility = Object.fromEntries(
    (defaultHiddenColumnIds ?? []).map((id) => [id, false]),
  );

  const table = useReactTable({
    data,
    columns: allColumns,
    getRowId: (row) => row.id, // Dodano getRowId
    state: {
      globalFilter,
      sorting,
      columnFilters,
      columnVisibility: {
        ...columnVisibility,
        ...hiddenColumnVisibility,
      },
      expanded,
      pagination,
      rowSelection,
    },
    globalFilterFn,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="w-full max-h-[70svh]">
      <div className="flex items-center py-4 gap-4 flex-wrap">
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        {renderToolbarFilters?.({ setColumnFilters })}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Kolumny <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide() && column.id !== "select")
              .map((column) => {
                const title = column.columnDef.header as string;
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {title}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        className={`rounded-md border max-h-[45svh] overflow-y-auto scrollbar ${
          hasImages ? "overflow-x-hidden" : "overflow-x-auto"
        }`}
      >
        <Table
          className={hasImages ? "table-fixed" : undefined}
          containerClassName={hasImages ? "overflow-x-hidden" : undefined}
        >
          {!hasImages && (
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.index}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
          )}

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  {hasImages && imageAttribute ? (
                    <DataTableRowWithImage<T>
                      row={row}
                      imageAttribute={imageAttribute}
                      imageFolderPath={imageFolderPath}
                      isReadyAttribute={isReadyAttribute}
                      onRowClick={() => onRowClick?.(row.original)}
                      additionalContent={additionalContent}
                    />
                  ) : (
                    <DataTableRow<T>
                      row={row}
                      onRowClick={() => onRowClick?.(row.original)}
                    />
                  )}

                  {row.getIsExpanded() && renderRowSubComponent && (
                    <TableRow>
                      <TableCell colSpan={allColumns.length}>
                        {renderRowSubComponent(row.original)}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
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
        {!disableSelection && (
          <div className="flex-1 text-sm text-muted-foreground">
            wybrano {table.getSelectedRowModel().rows.length} z{" "}
            {table.getFilteredRowModel().rows.length} rzędów.
          </div>
        )}
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
