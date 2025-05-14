import { TableCell, TableRow } from "@/components/ui/table";
import { flexRender, Row } from "@tanstack/react-table";

export default function DataTableRow<T>({ row }: { row: Row<T> }) {
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
