"use client";

import { ReactNode } from "react";
import { SWRConfig } from "swr";

type Props = { children: ReactNode };

export function AuthProvider({ children }: Props) {
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
