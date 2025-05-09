import { TableCell, TableRow } from "@/components/ui/table";
import { CellContext, flexRender, Row } from "@tanstack/react-table";
import { ImageIcon } from "lucide-react";

import { useEffect, useState } from "react";

import { getImageUrl } from "@/server-actions/images/images";

export default function DataTableRowWithImage<T>({
  row,
  imageAttribute,
  imageFolderPath,
}: {
  row: Row<T>;
  imageAttribute: keyof T;
  imageFolderPath: string;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const imageFilePath = row.original[imageAttribute] as string;
    if (!imageFilePath) return;

    (async () => {
      const url = await getImageUrl(imageFilePath);
      if (url) {
        setImageUrl(url);
      }
    })();
  }, [row.original, imageAttribute, imageFolderPath]);

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
      className="cursor-pointer flex items-center gap-2 "
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
      <TableCell className="flex items-center gap-4 min-w-[200px]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Product Image"
            className="size-16 sm:size-32 object-contain"
          />
        ) : (
          <ImageIcon className="min-w-16 h-16 sm:min-w-32 sm:h-32" />
        )}
        <section className="w-full pr-12">
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
      </TableCell>
      <TableCell className="block">
        {flexRender(actionsCellColumnDef, actionsCellContext)}
      </TableCell>
    </TableRow>
  );
}
