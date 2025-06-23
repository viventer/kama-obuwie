"use client";

import { ReactNode, useEffect } from "react";
import { SWRConfig } from "swr";
import { onIdTokenChanged } from "firebase/auth";
import axios from "axios";
import { auth } from "@/firebase/firebase";

type Props = { children: ReactNode };

export function AuthProvider({ children }: Props) {
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const freshToken = await user.getIdToken(true);
          await axios.post("/api/auth/refresh/firebase-token", {
            idToken: freshToken,
          });
        } catch (err) {
          console.error("Nie udało się odświeżyć sesji na serwerze:", err);
        }
      }
    });

    const interval = setInterval(async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const freshToken = await user.getIdToken(true);
          await axios.post("/api/auth/refresh/firebase-token", {
            idToken: freshToken,
          });
        } catch (err) {
          console.error(
            "Automatyczne odświeżanie tokena nie powiodło się:",
            err
          );
        }
      }
    }, 50 * 60 * 1000); // 50 minut

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => fetch(url).then((res) => res.json()),
        refreshInterval: 60 * 60 * 1000, // co godzinę
      }}
    >
      {children}
    </SWRConfig>
  );
}
