import { TableCell, TableRow } from "@/components/ui/table";
import { CellContext, flexRender, Row } from "@tanstack/react-table";
import { ImageIcon } from "lucide-react";

import { useEffect, useState } from "react";

import { getImageUrl } from "@/server-actions/files/files";
import Image from "next/image";
import { isValidUrl } from "../../offers/helpers/validation";

export default function DataTableRowWithImage<T>({
  row,
  imageAttribute,
  imageFolderPath,
  isReadyAttribute,
  onRowClick,
  additionalContent,
}: {
  row: Row<T>;
  imageAttribute: keyof T;
  imageFolderPath?: string;
  isReadyAttribute?: keyof T;
  onRowClick?: (row: Row<T>) => void;
  additionalContent?: (row: T) => React.ReactNode;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    if (isValidUrl(row.original[imageAttribute])) {
      setImageUrl(row.original[imageAttribute] as string);
      return;
    }

    const imageFilePath = row.original[imageAttribute] as string;
    if (!imageFilePath) return;
    if (isReadyAttribute) {
      const isReadyValue = row.original[isReadyAttribute] as boolean;
      setIsReady(isReadyValue);
    }

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
      className="flex items-center gap-2 hover:bg-muted/50 transition-colors"
      onClick={(e) => {
        const target = e.target as HTMLElement;

        // Sprawdź czy użytkownik zaznacza tekst
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          return;
        }

        // Sprawdź czy kliknięto na elementy, które nie powinny wywołać akcji wiersza
        if (
          target.closest("button") ||
          target.closest("[role='menu']") ||
          target.closest("[data-ignore-row-click]") ||
          target.closest("[data-selectable-text]")
        ) {
          return;
        }

        row.toggleExpanded();
        if (onRowClick) {
          onRowClick(row);
        }
      }}
    >
      <TableCell className="cursor-pointer">
        {flexRender(checkboxCellColumnDef, checkboxCellContext)}
      </TableCell>
      <TableCell className="flex items-center gap-4 min-w-[200px] cursor-pointer">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Product Image"
            width={128}
            height={128}
            className={`size-16 sm:size-32 object-contain bg-primary/15 border-b-[0.2rem] ${
              isReady
                ? "border-b-success"
                : isReadyAttribute
                ? "border-b-destructive"
                : "border-b-primary"
            } border-l-solid`}
          />
        ) : (
          <ImageIcon className="min-w-16 h-16 sm:min-w-32 sm:h-32" />
        )}
        <section className="w-full pr-12" data-selectable-text>
          {row.getVisibleCells().map((cell) => {
            const parameterName = cell.column.columnDef.header as string;
            if (typeof parameterName !== "string") {
              return null;
            }
            return (
              <p key={cell.id} className="select-text cursor-text">
                <b className="max-[400px]:hidden">{parameterName}: </b>
                <span className="select-text">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </span>
              </p>
            );
          })}
        </section>
      </TableCell>
      {additionalContent && (
        <TableCell>{additionalContent(row.original)}</TableCell>
      )}
      <TableCell className="block cursor-pointer">
        {flexRender(actionsCellColumnDef, actionsCellContext)}
      </TableCell>
    </TableRow>
  );
}
