import { useEffect } from "react";
import useSWR from "swr";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/firebase/firebase";

type User = {
  uid: string;
  email?: string;
  name?: string;
  role?: string;
  connectedAccounts: {
    AL1: boolean;
    AL2: boolean;
  };
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
      // Spróbuj odświeżyć token przed przekierowaniem
      const currentUser = auth.currentUser;
      if (currentUser && path.startsWith("/admin-panel")) {
        try {
          const freshToken = await currentUser.getIdToken(true);
          await fetch("/api/auth/refresh/firebase-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: freshToken }),
            credentials: "include",
          });

          // Spróbuj ponownie po odświeżeniu
          const retryRes = await fetch(url, {
            credentials: "include",
            redirect: "manual",
          });

          if (retryRes.status === 401) {
            router.push("/admin-auth/login");
            return { user: null };
          }

          if (retryRes.status === 403) {
            router.push("/admin-auth/allegro-connect");
            return { user: null };
          }

          const retryData = await retryRes.json();

          // Sprawdź połączone konta Allegro po ponownym żądaniu
          if (
            retryData.user &&
            (!retryData.user.connectedAccounts?.AL1 ||
              !retryData.user.connectedAccounts?.AL2) &&
            path.startsWith("/admin-panel")
          ) {
            router.push("/admin-auth/allegro-connect");
            return retryData;
          }

          // Sprawdź status weryfikacji użytkownika po ponownym żądaniu
          if (
            path.startsWith("/admin-panel/") &&
            retryData.user?.role === "UNVERIFIED"
          ) {
            router.push("/admin-auth/unauthorized");
          }

          return retryData;
        } catch (error) {
          console.error("Token refresh failed:", error);
          router.push("/admin-auth/login");
          return { user: null };
        }
      } else if (path.startsWith("/admin-panel")) {
        router.push("/admin-auth/login");
        return { user: null };
      }
    }

    if (res.status === 403 && path.startsWith("/admin-panel")) {
      router.push("/admin-auth/allegro-connect");
      return { user: null };
    }

    const userData = await res.json();

    // Sprawdź połączone konta Allegro
    if (
      userData.user &&
      (!userData.user.connectedAccounts?.AL1 ||
        !userData.user.connectedAccounts?.AL2) &&
      path.startsWith("/admin-panel")
    ) {
      router.push("/admin-auth/allegro-connect");
      return userData;
    }

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
