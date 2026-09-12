export default function SizeChip({ label }: { label: string }) {
  return (
    <span className="flex items-center justify-center px-2 py-1 text-sm bg-card/70 rounded-xs">
      {label}
    </span>
  );
}
