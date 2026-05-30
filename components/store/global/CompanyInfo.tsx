import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CompanyInfo({ className }: { className?: string }) {
  return (
    <article className={className}>
      <h3 className="font-medium text-lg mb-2">Dane firmy</h3>
      <div className="mb-2">
        <p>Anna Kamińska - "KAM-A"</p>
        <p>ul. Krzęczków 42a</p>
        <p>32-700 Bochnia</p>
        <p>NIP: 8681255945</p>
      </div>
      <div className="mb-4">
        <p>+48 664 097 737</p>
        <p>kontakt@kama-obuwie.pl</p>
      </div>
      <Link href="/info/about">
        <Button variant="outline">Więcej informacji o sklepie</Button>
      </Link>
    </article>
  );
}
