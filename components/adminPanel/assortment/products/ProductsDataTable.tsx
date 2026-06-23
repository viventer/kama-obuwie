"use client";

import {
  CategoryWithId,
  ProductWithId,
  RootCategory,
} from "@/firebase/schemas/productsSchemas";
import { ColumnName, TableAction } from "@/lib/dataTableColumns";
import { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "../../global/data-table/DataTable";
import { useProductTypeContext } from "../ProductsTypeContext";
import CategoryFilterSelector from "./CategoryFilterSelector";
import RootCategoryFilterSelector from "./RootCategoryFilterSelector";

const filterColumns: ColumnDef<ProductWithId>[] = [
  {
    accessorKey: "rootCategory",
    id: "rootCategory",
    header: "Kategoria główna",
    cell: () => null,
    enableSorting: false,
    enableColumnFilter: true,
    enableHiding: false,
    filterFn: "equalsString",
  },
  {
    accessorKey: "categoryId",
    id: "categoryId",
    header: "Kategoria",
    cell: () => null,
    enableSorting: false,
    enableColumnFilter: true,
    enableHiding: false,
    filterFn: "equalsString",
  },
];

export default function ProductsDataTable({
  data,
  categories,
}: {
  data: ProductWithId[] | null;
  categories: CategoryWithId[];
}) {
  const { productType } = useProductTypeContext();
  const [filteredData, setFilteredData] = useState<ProductWithId[] | null>(
    null,
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rootCategoryFilter, setRootCategoryFilter] = useState<
    RootCategory | "all"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");

  const elementaryColumnNames = [
    { attributeName: "brand", displayName: "Marka" },
    { attributeName: "manufacturerCode", displayName: "Kod producenta" },
    { attributeName: "purchasePrice", displayName: "Cena zakupu" },
    { attributeName: "suggestedPrice", displayName: "Cena sugerowana" },
  ];
  const shoesProductColumnNames = [
    ...elementaryColumnNames,
    { attributeName: "colorVariants", displayName: "Warianty" },
  ];
  const [columnNames, setColumnNames] = useState<ColumnName<ProductWithId>[]>(
    elementaryColumnNames,
  );

  const router = useRouter();

  useEffect(() => {
    if (!data) {
      return;
    }

    const newData = data.filter(
      (product) => product.productType === productType,
    );
    setFilteredData(newData);

    if (
      productType === "obuwie" &&
      columnNames.length !== shoesProductColumnNames.length
    ) {
      setColumnNames(shoesProductColumnNames);
    } else if (productType === "akcesoria") {
      setColumnNames(elementaryColumnNames);
    }
  }, [data, productType]);

  useEffect(() => {
    setRootCategoryFilter("all");
    setCategoryFilter("all");
    setColumnFilters([]);
  }, [productType]);

  const handleRootCategoryChange = useCallback(() => {
    setCategoryFilter("all");
    setColumnFilters((prev) =>
      prev.filter((filter) => filter.id !== "categoryId"),
    );
  }, []);

  const toolbarFilters = useMemo(
    () =>
      function renderToolbarFilters({
        setColumnFilters: setTableColumnFilters,
      }: {
        setColumnFilters: typeof setColumnFilters;
      }) {
        return (
          <>
            <RootCategoryFilterSelector
              rootCategoryFilter={rootCategoryFilter}
              setRootCategoryFilter={setRootCategoryFilter}
              setColumnFilters={setTableColumnFilters}
              productType={productType}
              onRootCategoryChange={handleRootCategoryChange}
            />
            <CategoryFilterSelector
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              setColumnFilters={setTableColumnFilters}
              categories={categories}
              rootCategoryFilter={rootCategoryFilter}
              productType={productType}
            />
          </>
        );
      },
    [
      rootCategoryFilter,
      categoryFilter,
      categories,
      productType,
      handleRootCategoryChange,
    ],
  );

  const actions: TableAction[] = [
    {
      name: "Zobacz dane",
      onClick: (id) => {
        window.open(
          `/admin-panel/create-products/product-data/${id}`,
          "_blank",
          "noopener,noreferrer",
        );
      },
    },
    {
      name: "Edytuj parametry",
      onClick: (id) => {
        router.push(`/admin-panel/products/parameters/${id}`);
      },
    },
    {
      name: "Edytuj zdjęcia",
      onClick: (id) => {
        router.push(`/admin-panel/products/images/${id}`);
      },
    },
    {
      name: "Edytuj opis",
      onClick: (id) => {
        router.push(`/admin-panel/products/description/${id}`);
      },
    },
  ];

  return (
    <DataTable
      data={filteredData || []}
      columnNames={columnNames}
      actions={actions}
      searchPlaceholder="Szukaj produktu"
      searchColumns={["brand", "manufacturerCode"]}
      hasImages={true}
      imageAttribute="samplePhoto"
      imageFolderPath={`products/sample-photos/${productType}`}
      filterColumns={filterColumns}
      defaultHiddenColumnIds={["rootCategory", "categoryId"]}
      columnFilters={columnFilters}
      onColumnFiltersChange={setColumnFilters}
      renderToolbarFilters={toolbarFilters}
    />
  );
}
