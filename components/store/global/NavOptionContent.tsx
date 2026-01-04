"use client";

import LinkText from "@/components/adminPanel/global/LinkText";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { analytics } from "@/firebase/firebase";
import { CategoryWithId } from "@/firebase/schemas/productsSchemas";
import { logEvent } from "firebase/analytics";
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
            onClick={() => {
              if (analytics) {
                logEvent(analytics, "view_item_list", {
                  item_list_id: category.id,
                  item_list_name: category.name,
                  from: "nav",
                });
              }
            }}
          >
            {category.name}
          </LinkText>
        </NavigationMenuLink>
      ))}
    </div>
  );
}
