import { useEffect } from "react";
import useSWR from "swr";
import { usePathname, useRouter } from "next/navigation";

type User = {
  uid: string;
  email?: string;
  name?: string;
  role?: string;
} | null;

export function useUser() {
  const router = useRouter();
  const path = usePathname();

  const fetcher = async (url: string) => {
    const res = await fetch(url, {
      credentials: "include",
      redirect: "manual",
    });

    if (res.status === 401) {
      if (path.startsWith("/admin-panel")) {
        router.push("/admin-auth/login");
        return { user: null };
      }
    }

    const userData = await res.json();

    // Sprawdź status weryfikacji użytkownika
    if (
      path.startsWith("/admin-panel/") &&
      userData.user?.role === "UNVERIFIED"
    ) {
      router.push("/admin-auth/unauthorized");
    }

    return userData;
  };

  // dodaj path do klucza, żeby SWR przy nawigacji wywołał fetchera
  const { data, error, mutate } = useSWR<{ user: User }>(
    ["/api/auth/me", path],
    () => fetcher("/api/auth/me"),
    { revalidateOnMount: true }
  );

  // dodatkowo wymuś revalidation również
  useEffect(() => {
    mutate();
  }, [path, mutate]);

  const loading = !error && !data;
  return {
    user: data?.user ?? null,
    loading,
    error,
  };
}
