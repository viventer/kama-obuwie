import { Card } from "@/components/ui/card";

export default function SubpageHeading({ text }: { text: string }) {
  return (
    <Card className="bg-transparent rounded-xs border-0 shadow-none border-b-brand border-b-2 px-2 py-1 mb-4 flex items-center gap-4 w-fit ">
      <h2 className="text-lg md:text-xl font-medium capitalize">{text}</h2>
    </Card>
  );
}
