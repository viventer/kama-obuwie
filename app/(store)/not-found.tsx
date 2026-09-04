import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex justify-center py-16">
      <Card className="w-full max-w-lg gap-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <SearchX className="text-brand" />
            Nie znaleziono strony
          </CardTitle>
          <CardDescription>
            Strona, której szukasz, nie istnieje lub została przeniesiona.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="important" asChild>
            <Link href="/">Strona główna</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
