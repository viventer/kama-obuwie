"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/useToast";
import { auth, googleAuthProvider } from "@/firebase/firebase";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Loader from "../global/Loader";
import axios from "axios";
import GoogleIcon from "@/components/icons/GoogleIcon";
import { useUser } from "@/hooks/useUser";

export default function LoginForm() {
  const { showToast } = useToast();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  useEffect(() => {
    if (!userLoading && user) {
      router.replace("/admin-panel");
      showToast("Jesteś już zalogowany.");
    }
  }, [user]);

  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      setIsLoading(true);
      const user = result.user;
      if (!user) throw new Error("Brak użytkownika po logowaniu");

      const token = await user.getIdToken(true);
      const resp = await axios.post("/api/auth/login", { idToken: token });
      if (resp.status === 401) {
        showToast("Błąd autoryzacji. Spróbuj ponownie.", "error");
        setIsLoading(false);
        return;
      }

      router.replace("/admin-panel");
      showToast("Pomyślnie zalogowano.", "success");
    } catch (error) {
      console.error(error);
      showToast("Błąd logowania.", "error");

      setIsLoading(false);
    }
  };

  if (isLoading || userLoading) {
    return <Loader />;
  }

  return (
    <Card className="w-full max-w-[600px]">
      <CardHeader>
        <CardTitle className="text-text">Zaloguj się</CardTitle>
        <CardDescription>
          Logowanie jest wymagane aby uzyskać dostęp do admin panelu.
        </CardDescription>
      </CardHeader>
      <CardContent className="my-2">
        <button
          onClick={handleGoogleSignIn}
          className="text-l border-[0.1rem] border-solid border-primary flex items-center gap-2 px-3 py-2 rounded-md hover:border-accent text-text"
        >
          <GoogleIcon className="w-5 h-5" />
          Kontynuuj przez Google
        </button>
      </CardContent>
    </Card>
  );
}
