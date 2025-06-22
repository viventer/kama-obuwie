import useSWR from "swr";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

type User = {
  uid: string;
  email?: string;
  name?: string;
  role?: string;
  isAllegroConnected?: boolean;
} | null;

export function useUser() {
  const router = useRouter();
  const path = usePathname();

  const fetcher = (url: string) =>
    fetch(url, { credentials: "include", redirect: "manual" }).then(
      async (res) => {
        if (res.status === 401 && path.includes("/admin-panel")) {
          router.push("/admin-auth/login");
          return { user: null };
        }
        if (res.status === 403 && path.includes("/admin-panel")) {
          router.push("/admin-auth/allegro-connect");
          return { user: null };
        }
        return res.json();
      }
    );

  const { data, error } = useSWR<{ user: User }>("/api/auth/me", fetcher);

  const loading = !error && !data;

  return {
    user: data?.user ?? null,
    loading,
    error,
  };
}
