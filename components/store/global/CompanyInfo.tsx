import { Button } from "@/components/ui/button";
import { companyData } from "@/lib/constants";
import Link from "next/link";

export default function CompanyInfo({ className }: { className?: string }) {
  return (
    <article className={className}>
      <h3 className="font-medium text-lg mb-2">Dane firmy</h3>
      <div className="mb-2">
        <p>{companyData.name}</p>
        <p>{companyData.street}</p>
        <p>
          {companyData.postalCode} {companyData.city}
        </p>
        <p>NIP: {companyData.nip}</p>
        <p>REGON: {companyData.regon}</p>
      </div>
      <div className="mb-4">
        <p>{companyData.phone}</p>
        <p>{companyData.email}</p>
      </div>
      <Link href="/info/about">
        <Button variant="outline">Więcej informacji o sklepie</Button>
      </Link>
    </article>
  );
}
