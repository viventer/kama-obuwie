"use client";

import { makeFilePublic } from "@/server-actions/images/images";
import { useEffect } from "react";

export default function page() {
  useEffect(() => {
    (async () => {
      // await makeFilePublic("other/jak_dobrac_rozmiar (1).jpg");
    })();
  });

  return <div>ap home</div>;
}
