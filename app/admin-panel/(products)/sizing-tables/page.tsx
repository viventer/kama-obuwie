import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import { DataTableDemo } from "@/components/adminPanel/products/SizingTablesList";
import { SizingTable } from "@/firebase/schemas/products";
import { getDocumentsFromAdminDB } from "@/server-actions/helpers";

export default async function page() {
  const sizingTables = (await getDocumentsFromAdminDB(
    "sizingTables"
  )) as SizingTable[];

  return (
    <>
      <SubpageHeading text="Tabele rozmiarów" />
      {/* <SearchBar placeholder="Szukaj tabeli rozmiarów" /> */}
      {sizingTables ? (
        <DataTableDemo data={sizingTables} />
      ) : (
        <p>Brak tabel rozmiarów</p>
      )}
    </>
  );
}
