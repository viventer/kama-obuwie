"use client";

import LinkText from "@/components/adminPanel/global/LinkText";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { CategoryWithId } from "@/firebase/schemas/productsSchemas";
import React from "react";

export default function NavOptionContent({
  subcategories,
}: {
  subcategories: CategoryWithId[];
}) {
  return (
    <div className="grid w-full max-w-[600px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] text-wrap">
      {subcategories.map((category) => (
        <NavigationMenuLink key={category.id} asChild>
          <LinkText
            href={`/listing?categoryId=${encodeURIComponent(category.id)}`}
          >
            {category.name}
          </LinkText>
        </NavigationMenuLink>
      ))}
    </div>
  );
}
