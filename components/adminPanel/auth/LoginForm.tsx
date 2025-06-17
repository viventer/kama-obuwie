"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/useToast";
import GoogleLogo from "@/icons/GoogleLogo";
import { checkIfNewUser, setAuthToken } from "@/lib/auth";
import { UserType } from "@/lib/dbSchemas";
import { auth, googleAuthProvider } from "@/lib/firebase";
import { createUser, getUserName, getUserPerms } from "@/lib/users";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Loader from "../global/Loader";

export default function LoginForm() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      setIsLoading(true);
      const user = result.user;
      if (!user) throw new Error("Brak użytkownika po logowaniu");

      const token = await user.getIdToken(true);
      await setAuthToken(token);

      const isNewUser = await checkIfNewUser();
      if (isNewUser) {
        const [firstName = "", lastName = ""] =
          user.displayName?.split(" ") || [];
        const userData: UserType = {
          id: user.uid,
          firstName,
          lastName,
          email: user.email || "",
          role: "unverified",
          availableCategories: [],
          createdAt: new Date(),
        };

        await createUser(userData);
        router.replace("/auth/complete-profile");
        return;
      }

      try {
        const { firstName, lastName } = await getUserName(user.uid);
        if (!firstName || !lastName) {
          router.replace("/auth/complete-profile");
          return;
        }

        const { role } = await getUserPerms(user.uid);

        if (role === "unverified") {
          router.replace("/auth/waiting-room");
          return;
        }
      } catch (err) {
        showToast(`Błąd pobierania danych nowego użytkownika: ${err}`, "error");
        return;
      }

      await router.replace("/notes");
      showToast("Pomyślnie zalogowano.", "success");
    } catch (error) {
      console.error(error);
      showToast("Błąd logowania.", "error");

      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-text">Zaloguj się</CardTitle>
        <CardDescription>
          Logowanie jest wymagane aby uzyskać dostęp do notatek.
        </CardDescription>
      </CardHeader>
      <CardContent className="my-2">
        <button
          onClick={handleGoogleSignIn}
          className="text-l border-[0.1rem] border-solid border-primary flex items-center gap-2 px-3 py-2 rounded-md hover:border-accent text-text"
        >
          <GoogleLogo className="size-4" />
          Kontynuuj przez Google
        </button>
      </CardContent>
    </Card>
  );
}
