import { SizingTableWithId } from "@/firebase/schemas/productsSchemas";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

interface SizingTableDialogProps {
  sizingTable: SizingTableWithId;
  choosingSizeImageUrl?: string;
}

export default function SizingTableDialog({
  sizingTable,
  choosingSizeImageUrl,
}: SizingTableDialogProps) {
  return (
    <div className="w-full max-h-[60vh] overflow-auto scrollbar px-4">
      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="instructions">
          <AccordionTrigger>Jak dobrać rozmiar?</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <p>
                <b>1.</b>&nbsp;Stojąc na kartce papieru odrysuj kontur stopy.
              </p>
              <p>
                <b>2.</b>&nbsp;Zmierz w centymetrach odległość pomiędzy
                najdalszymi punktami (A).
              </p>
              <p>
                <b>3.</b>&nbsp;Dodaj do wyniku 0,5 cm i porównaj z długościami
                podanymi poniżej:
              </p>
              {choosingSizeImageUrl && (
                <div className="mt-4">
                  <Image
                    src={choosingSizeImageUrl}
                    alt="Instrukcja dobierania rozmiaru"
                    width={300}
                    height={200}
                    className="rounded-lg mx-auto"
                  />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rozmiar</TableHead>
            <TableHead>Długość wkładki (cm)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sizingTable.insoleLengths.map(({ size, insoleLength }) => (
            <TableRow key={size}>
              <TableCell className="font-medium">{size}</TableCell>
              <TableCell>{insoleLength}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
