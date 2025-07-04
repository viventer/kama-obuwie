import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import SizingTablesDataTable from "@/components/adminPanel/products/sizing-tables/SizingTablesDataTable";
import { SizingTableWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentsFromAdminDB } from "@/firebase/getters";

export default async function SizingTablesPage() {
  const sizingTables = await getDocumentsFromAdminDB<SizingTableWithId>(
    "sizingTables"
  );

  return (
    <>
      <SubpageHeading text="Tabele rozmiarów" />

      <SizingTablesDataTable data={sizingTables} />
    </>
  );
}
