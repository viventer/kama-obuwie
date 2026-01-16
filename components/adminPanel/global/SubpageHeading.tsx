import { Card } from "@/components/ui/card";

export default function SubpageHeading({ text }: { text: string }) {
  return (
    <Card className="bg-foreground/10 rounded-sm rounded-b-none border-0 border-b-brand border-b-2 px-4 md:px-8 py-1 md:py-2 mb-4 flex items-center gap-4 w-fit ">
      <h2 className="text-lg md:text-xl font-semibold capitalize">{text}</h2>
    </Card>
  );
}
