import useSWR from "swr";

type User = {
  uid: string;
  email?: string;
  name?: string;
  role?: string;
  isAllegroConnected?: boolean;
} | null;

export function useUser() {
  const { data, error } = useSWR<{ user: User }>(
    "/api/auth/me",
    (url: string) => fetch(url).then((res) => res.json())
  );
  return {
    user: data?.user ?? null,
    loading: !error && !data,
    error,
  };
}
