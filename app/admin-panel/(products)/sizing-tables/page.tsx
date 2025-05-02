import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import SizingTablesDataTable from "@/components/adminPanel/products/SizingTablesDataTable";
import { SizingTableWithId } from "@/firebase/schemas/products";
import { getDocumentsFromAdminDB } from "@/server-actions/helpers";

export default async function SizingTablesPage() {
  const sizingTables = await getDocumentsFromAdminDB<SizingTableWithId>(
    "sizingTables"
  );

  return (
    <>
      <SubpageHeading text="Tabele rozmiarów" />

      {sizingTables ? (
        <SizingTablesDataTable data={sizingTables} />
      ) : (
        <p>Brak tabel rozmiarów</p>
      )}
    </>
  );
}
