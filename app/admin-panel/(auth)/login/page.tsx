import AuthForm from "@/components/AuthForm";
import { getAuthToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Auth() {
  const token = await getAuthToken();
  if (token) {
    redirect("/");
  }

  return <AuthForm />;
}
