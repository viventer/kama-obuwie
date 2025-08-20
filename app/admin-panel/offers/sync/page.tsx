"use client";

import { Button } from "@/components/ui/button";
import { syncAllegroOffers } from "@/server-actions/allegro/syncOffers";

export default function page() {
  return (
    <Button
      onClick={async () => {
        console.log("Syncing Allegro offers...");
        await syncAllegroOffers();
        console.log("Finished sync");
      }}
    >
      Synchronizuj oferty z Allegro
    </Button>
  );
}
