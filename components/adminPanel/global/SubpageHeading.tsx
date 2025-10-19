export default function SubpageHeading({ text }: { text: string }) {
  return (
    <div className="bg-foreground/10 rounded-t-md px-8 py-2 mb-6 flex items-center gap-4 w-fit border-b-2 border-b-secondary">
      <h2 className="text-xl font-semibold capitalize">{text}</h2>
    </div>
  );
}
