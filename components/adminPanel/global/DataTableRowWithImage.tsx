import { TableCell, TableRow } from "@/components/ui/table";
import { CellContext, flexRender, Row } from "@tanstack/react-table";

export default function DataTableRowWithImage<T>({
  row,
  imageUrlAttribute,
}: {
  row: Row<T>;
  imageUrlAttribute: keyof T;
}) {
  const imageUrl: string = row.original[imageUrlAttribute] as string;
  const checkboxCell = row
    .getVisibleCells()
    .find((cell) => cell.column.id === "select");
  const checkboxCellColumnDef = checkboxCell?.column.columnDef.cell;
  const checkboxCellContext = checkboxCell?.getContext() as CellContext<T, T>;
  const actionsCell = row
    .getVisibleCells()
    .find((cell) => cell.column.id === "actions");
  const actionsCellColumnDef = actionsCell?.column.columnDef.cell;
  const actionsCellContext = actionsCell?.getContext() as CellContext<T, T>;

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
        {flexRender(checkboxCellColumnDef, checkboxCellContext)}
      </TableCell>
      <TableCell className="flex items-center gap-4">
        <img
          src={imageUrl}
          alt="Product Image"
          className="w-24 h-24 object-cover"
        />
        <section className="w-full">
          {row.getVisibleCells().map((cell) => {
            const parameterName = cell.column.columnDef.header as string;
            if (typeof parameterName !== "string") {
              return null;
            }
            return (
              <p key={cell.id}>
                <b>{parameterName}: </b>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </p>
            );
          })}
        </section>
      </TableCell>
      <TableCell>
        {flexRender(actionsCellColumnDef, actionsCellContext)}
      </TableCell>
    </TableRow>
  );
}
