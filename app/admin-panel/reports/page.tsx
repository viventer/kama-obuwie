import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import DownloadAllegroCustomersButton from "@/components/adminPanel/reports/DownloadAllegroCustomersButton";

export default function ReportsPage() {
  return (
    <section>
      <SubpageHeading text="Raporty" />
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
        Eksport do 5000 ostatnich unikalnych klientów (deduplikacja po adresie
        e-mail), którzy złożyli zamówienie na koncie Allegro AL1. Kolumny: First
        Name, Last Name, Country (zawsze PL), Zip, Email, Phone.
      </p>
      <DownloadAllegroCustomersButton />
    </section>
  );
}
