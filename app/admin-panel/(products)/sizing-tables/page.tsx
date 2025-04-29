import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import SizingTablesDataTable from "@/components/adminPanel/products/SizingTablesDataTable";
import { SizingTable } from "@/firebase/schemas/products";
import { getDocumentsFromAdminDB } from "@/server-actions/helpers";

export default async function page() {
  const sizingTables = (await getDocumentsFromAdminDB(
    "sizingTables"
  )) as SizingTable[];

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
