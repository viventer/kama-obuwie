import { TableCell, TableRow } from "@/components/ui/table";
import { CellContext, flexRender, Row } from "@tanstack/react-table";
import { Image } from "lucide-react";

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
      className="cursor-pointer flex items-center gap-2 justify-between px-4"
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
      <div className="flex items-center gap-4">
        <div>{flexRender(checkboxCellColumnDef, checkboxCellContext)}</div>
        <div className="flex items-center gap-4 min-w-[200px]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Product Image"
              className="size-16 sm:size-32 object-cover"
            />
          ) : (
            <Image className="min-w-16 h-16 sm:min-w-32 sm:h-32 text-primary" />
          )}
          <section className="w-full">
            {row.getVisibleCells().map((cell) => {
              const parameterName = cell.column.columnDef.header as string;
              if (typeof parameterName !== "string") {
                return null;
              }
              return (
                <p key={cell.id}>
                  <b className="max-[400px]:hidden">{parameterName}: </b>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </p>
              );
            })}
          </section>
        </div>
      </div>

      <TableCell className="block">
        {flexRender(actionsCellColumnDef, actionsCellContext)}
      </TableCell>
    </TableRow>
  );
}
