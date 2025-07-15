"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { Order } from "@/firebase/schemas/ordersSchemas";
import { Product, ProductWithId } from "@/firebase/schemas/productsSchemas";
import { Offer } from "@/firebase/schemas/offersSchemas";
import { getImageUrl } from "@/server-actions/images/images";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { extractSizeFromTitle } from "../../../helpers/extractSizeFromTitle";
import axios from "axios";

interface OrderLineItemDisplayProps {
  lineItems: Order["lineItems"];
}

export function OrderLineItemDisplay({ lineItems }: OrderLineItemDisplayProps) {
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>(
    {}
  );

  const sizes: Record<string, string | null> = {};
  lineItems.forEach((item) => {
    sizes[item.offer.id] = extractSizeFromTitle(item.offer.name || "");
  });

  useEffect(() => {
    const fetchThumbnails = async () => {
      const newThumbnailUrls: Record<string, string> = {};

      for (const item of lineItems) {
        if (thumbnailUrls[item.offer.id]) {
          // Już mamy URL dla tej oferty
          continue;
        }

        try {
          // const offerDoc = await axios.get(`/api/offers/${item.offer.id}`);
          // console.log(offerDoc.data);
          // if (offerDoc.data?.thumbnail) {
          //   // Zamień ścieżkę na URL
          //   const imageUrl = await getImageUrl(offerDoc.data.thumbnail);
          //   if (imageUrl) {
          //     newThumbnailUrls[item.offer.id] = imageUrl;
          //   }
          // }
        } catch (error) {
          console.error(
            `Błąd podczas pobierania miniaturki dla oferty ${item.offer.id}:`,
            error
          );
        }
      }

      // Aktualizuj stan tylko jeśli są nowe URL-e
      if (Object.keys(newThumbnailUrls).length > 0) {
        setThumbnailUrls((prev) => ({ ...prev, ...newThumbnailUrls }));
      }
    };

    fetchThumbnails();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {lineItems.map((item, index) => (
        <div
          key={item.id || index}
          className="flex items-center gap-3 p-2 border rounded-md"
        >
          <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            {thumbnailUrls[item.offer.id] ? (
              <Image
                src={thumbnailUrls[item.offer.id]}
                alt="Product"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-full h-full p-2 text-gray-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {item.offer.signature}
              {sizes[item.offer.id] && (
                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {sizes[item.offer.id]}
                </span>
              )}
            </p>
          </div>

          <div className="text-right text-sm">
            <div className="font-medium">
              {item.quantity}x {item.price.amount} {item.price.currency}
            </div>
            {item.originalPrice.amount !== item.price.amount && (
              <div className="text-xs text-gray-500 line-through">
                {item.originalPrice.amount} {item.originalPrice.currency}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
