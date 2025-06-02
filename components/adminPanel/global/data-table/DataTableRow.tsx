import { TableCell, TableRow } from "@/components/ui/table";
import { flexRender, Row } from "@tanstack/react-table";

export default function DataTableRow<T>({
  row,
  onRowClick,
}: {
  row: Row<T>;
  onRowClick?: (row: Row<T>) => void;
}) {
  return (
    <TableRow
      data-state={row.getIsExpanded() ? "expanded" : undefined}
      className="cursor-pointer"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (
          target.closest("button") ||
          target.closest("[role='menu']") ||
          target.closest("[data-ignore-row-click]")
        ) {
          return;
        }
        row.toggleExpanded();
        if (onRowClick) {
          onRowClick(row);
        }
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
