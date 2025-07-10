"use client";

import { ReactNode, useEffect } from "react";
import { SWRConfig } from "swr";
import { onIdTokenChanged } from "firebase/auth";
import axios from "axios";
import { auth } from "@/firebase/firebase";

type Props = { children: ReactNode };

export function AuthProvider({ children }: Props) {
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout | null = null;

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const freshToken = await user.getIdToken(true);
          await axios.post("/api/auth/refresh/firebase-token", {
            idToken: freshToken,
          });

          // Ustaw interval odświeżania tokenu co 50 minut
          if (refreshInterval) {
            clearInterval(refreshInterval);
          }

          refreshInterval = setInterval(async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
              try {
                const freshToken = await currentUser.getIdToken(true);
                await axios.post("/api/auth/refresh/firebase-token", {
                  idToken: freshToken,
                });
              } catch (err) {
                console.error("Auto token refresh failed:", err);
              }
            }
          }, 50 * 60 * 1000); // 50 minut
        } catch (err) {
          console.error("Nie udało się odświeżyć sesji na serwerze:", err);
        }
      } else {
        // Użytkownik się wylogował, wyczyść interval
        if (refreshInterval) {
          clearInterval(refreshInterval);
          refreshInterval = null;
        }
      }
    });

    return () => {
      unsubscribe();
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
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
