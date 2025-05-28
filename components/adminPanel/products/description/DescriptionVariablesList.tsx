"use client";

import { DescriptionVariables } from "@/firebase/schemas/productsSchemas";
import { useToast } from "@/hooks/useToast";

export default function DescriptionVariablesList() {
  const { showToast } = useToast();

  return (
    <section className="mb-4">
      <h3 className="font-medium mb-2">Zmienne opisu</h3>
      <ul className="list-none flex gap-4 bg-primary/10 rounded-sm px-2 py-1 scrollbar overflow-x-auto text-nowrap">
        {DescriptionVariables.map((variable) => (
          <li key={variable}>
            <button
              className="font-medium hover:text-accent hover:cursor-pointer active:text-accent/85"
              onClick={() => {
                navigator.clipboard.writeText(`{${variable}}`);
                showToast("Zmienna została skopiowana do schowka", "success");
              }}
            >
              {`{${variable}}`}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
