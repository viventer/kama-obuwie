import { TableCell, TableRow } from "@/components/ui/table";
import { flexRender, Row } from "@tanstack/react-table";

export default function DataTableRowWithImage<T>({
  row,
  imageUrl,
}: {
  row: Row<T>;
  imageUrl: string;
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
      }}
    >
      <TableCell>
        <img
          src={imageUrl}
          alt="Product Image"
          className="w-16 h-16 object-cover"
        />
      </TableCell>
      <TableCell>
        {row.getVisibleCells().map((cell) => (
          <TableRow key={cell.id}>
            <p className="font-medium">
              {cell.column.columnDef.header as string}:
            </p>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableRow>
        ))}
      </TableCell>
    </TableRow>
  );
}
