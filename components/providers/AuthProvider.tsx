"use client";

import { auth } from "@/firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Automatyczne odświeżanie tokenu co 50 minut (przed wygaśnięciem)
        const refreshInterval = setInterval(async () => {
          try {
            const newToken = await firebaseUser.getIdToken(true);
            // Aktualizuj token w sesji
            await fetch("/api/auth/refresh/firebase-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken: newToken }),
              credentials: "include",
            });
          } catch (error) {
            console.error("Token refresh failed:", error);
          }
        }, 50 * 60 * 1000); // 50 minut

        // Cleanup interval when component unmounts or user changes
        return () => clearInterval(refreshInterval);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
