import IconButton from "@/components/adminPanel/global/IconButton";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import React from "react";

export default function SearchBar({ placeholder }: { placeholder?: string }) {
  return (
    <div className="flex items-center justify-center w-full max-w-xl bg-foreground/10 rounded-md border border-primary focus-within:border-secondary">
      <Input
        placeholder={placeholder || "Szukaj"}
        className="w-full border-none focus-visible:ring-0"
      />
      <IconButton className="p-2">
        <SearchIcon className="size-6" />
      </IconButton>
    </div>
  );
}
