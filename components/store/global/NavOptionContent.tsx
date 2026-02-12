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
    <div className="grid !max-w-[600px] gap-3 p-4 md:w-[500px] 2xs:grid-cols-2 lg:w-[600px] text-wrap">
      {subcategories.map((category) => (
        <NavigationMenuLink key={category.id} asChild>
          <LinkText
            href={`/listing/${encodeURIComponent(category.id)}`}
            onClick={() => {
              if (analytics) {
                logEvent(analytics, "view_item_list", {
                  item_list_id: category.id,
                  item_list_name: category.name,
                  from: "nav",
                });
              }
            }}
            className="capitalize decoration-primary/0 hover:decoration-primary/100 transition-all duration-150"
          >
            {category.name}
          </LinkText>
        </NavigationMenuLink>
      ))}
    </div>
  );
}
