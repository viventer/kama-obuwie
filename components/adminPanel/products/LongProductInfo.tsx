"use client";

import {
  CategoryWithId,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import createDOMPurify from "dompurify";
import parse from "html-react-parser";
import { ReactNode, useEffect, useState } from "react";

export default function LongProductInfo({
  product,
  category,
  matchingCategories,
}: {
  product: ProductWithId;
  category: CategoryWithId;
  matchingCategories?: string[];
}) {
  const [content, setContent] = useState<ReactNode>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const DOMPurify = createDOMPurify(window as any);
    const clean = DOMPurify.sanitize(product.otherInfo || "");
    setContent(parse(clean));
  }, [product.otherInfo]);

  const parameters = {
    ...product.parameters.required,
    ...product.parameters.optional,
  };

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold mb-2">Kategorie</h2>
        {category?.name && (
          <p>
            <b>Główna:</b> {category.name}
          </p>
        )}
        {matchingCategories && matchingCategories.length > 0 && (
          <p>
            <b>Pasujące:</b> {matchingCategories.join(", ")}
          </p>
        )}
      </div>
      {product.features && product.features.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-2">Cechy:</h2>
          <ul className="list-disc pl-5">
            {product.features.map((feature, index) => (
              <li key={index} className="mb-1">
                <p>{feature}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {product.otherInfo && (
        <div>
          <h2 className="text-lg font-bold mb-2">Inne informacje</h2>
          <div>{content}</div>
        </div>
      )}
      {parameters && Object.keys(parameters).length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-2">Parametry</h2>
          <ul className="list-disc pl-5">
            {Object.entries(parameters).map(([key, value]) => (
              <li key={key} className="mb-1">
                <p>
                  <b>{key}:</b> {value}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
