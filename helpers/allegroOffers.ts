import type {
  AllegroOfferDescription,
  AllegroOfferParameters,
} from "@/firebase/schemas/offersSchemas";
import {
  type Description,
  DescriptionVariables,
} from "@/firebase/schemas/productsSchemas";
import type { DescriptionVariable } from "@/firebase/schemas/productsSchemas";

export const normalizeAllegroParamName = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[łŁ]/g, "l")
    .replace(/[ąĄ]/g, "a")
    .replace(/[ćĆ]/g, "c")
    .replace(/[ęĘ]/g, "e")
    .replace(/[ńŃ]/g, "n")
    .replace(/[óÓ]/g, "o")
    .replace(/[śŚ]/g, "s")
    .replace(/[żŻ]/g, "z")
    .replace(/[źŹ]/g, "z");
};

export const removeDynamicSizeAndInsoleParameters = (
  parameters: AllegroOfferParameters
): AllegroOfferParameters => {
  return parameters.filter((p) => {
    const name = typeof p?.name === "string" ? p.name : "";
    const normalized = normalizeAllegroParamName(name);
    if (normalized === "rozmiar") return false;
    if (normalized.includes("dlugosc wkladki")) return false;
    return true;
  });
};

export const replaceVariablesInAllegroOfferDescription = (params: {
  description: AllegroOfferDescription;
  variableValues: Record<string, string>;
}): AllegroOfferDescription => {
  const { description, variableValues } = params;

  const replaceInText = (text: string): string => {
    let result = text;

    // Prosta podmiana zmiennych w formacie {nazwa}
    result = result.replace(/\{rozmiar\}/g, variableValues["rozmiar"] ?? "");
    result = result.replace(
      /\{długość wkładki\}/g,
      variableValues["długość wkładki"] ?? ""
    );

    return result;
  };

  return {
    sections: description.sections.map((section) => ({
      items: section.items.map((item) => {
        if (item.type !== "TEXT" || typeof item.content !== "string") {
          return item;
        }
        return {
          ...item,
          content: replaceInText(item.content),
        };
      }),
    })),
  };
};

function stripWrapperParagraphs(text: string): string {
  return text.replace(/<p>\s*{rozmiarówka}\s*<\/p>/g, "{rozmiarówka}");
}

function replaceDescriptionVariables(
  text: string,
  values: Record<DescriptionVariable, string>
): string {
  let result = stripWrapperParagraphs(text);

  for (const variable of DescriptionVariables) {
    const regex = new RegExp(`{${variable}}`, "g");
    result = result.replace(regex, values[variable] ?? "");
  }

  return result;
}

export async function convertToAllegroDescription(
  description: Description,
  imagesUrls: string[],
  variableValues: Record<string, string>
): Promise<{
  sections: Array<{
    items: Array<{ type: "TEXT" | "IMAGE"; content?: string; url?: string }>;
  }>;
}> {
  const sections: Array<{
    items: Array<{ type: "TEXT" | "IMAGE"; content?: string; url?: string }>;
  }> = [];

  for (const row of description) {
    const items: Array<{
      type: "TEXT" | "IMAGE";
      content?: string;
      url?: string;
    }> = [];

    for (let idx = 0; idx < row.elementsTypes.length; idx++) {
      const type = row.elementsTypes[idx];
      const element = row.elements[idx];

      if (type === "text") {
        const raw = element.content ?? "";
        let content = replaceDescriptionVariables(
          raw,
          variableValues as Record<DescriptionVariable, string>
        );
        content = content
          .replace(/<strong>/g, "<b>")
          .replace(/<\/strong>/g, "</b>")
          .replace(/<br\s*\/?>/gi, "");

        if (content) {
          items.push({ type: "TEXT", content });
        }
      } else if (type === "image") {
        const key = element.image!;
        let url: string;

        if (key === "rozmiarówka") {
          url = imagesUrls[imagesUrls.length - 1];
        } else {
          const index = parseInt(key, 10);
          url = imagesUrls[index - 1];
        }

        items.push({ type: "IMAGE", url });
      }
    }

    sections.push({ items });
  }

  return { sections };
}
