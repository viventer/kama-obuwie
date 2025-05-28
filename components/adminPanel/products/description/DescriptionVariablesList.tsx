import { DescriptionVariables } from "@/firebase/schemas/productsSchemas";

export default function DescriptionVariablesList() {
  return (
    <section className="mb-4">
      <h3 className="font-medium mb-2">Zmienne opisu</h3>
      <ul className="list-none flex gap-4 bg-primary/10 rounded-sm px-2 py-1">
        {DescriptionVariables.map((variable) => (
          <li key={variable}>
            <button
              className="font-medium hover:text-accent hover:cursor-pointer active:text-accent/85"
              onClick={() => {
                navigator.clipboard.writeText(`{${variable}}`);
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
