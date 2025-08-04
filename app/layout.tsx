import type { Metadata } from "next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ConfirmDialogProvider } from "@/app/providers/ConfirmDialogProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { FullPageLoaderProvider } from "@/components/adminPanel/global/FullPageLoader";

const ubuntuSans = Ubuntu({
  variable: "--font-ubuntu-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const ubuntuMono = Ubuntu_Mono({
  variable: "--font-ubuntu-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "kama-obuwie - AP",
  description: "Aplikacja do zarządzania sklepem",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pl"
      className="scrollbar scrollbar-track-transparent scrollbar-thumb-primary overflow-hidden"
    >
      <body
        className={`${ubuntuSans.variable} ${ubuntuMono.variable} antialiased font-sans bg-background text-text max-h-screen overflow-auto scrollbar  [scrollbar-gutter:stable]`}
      >
        <ConfirmDialogProvider>
          <AuthProvider>
            <FullPageLoaderProvider>{children}</FullPageLoaderProvider>
          </AuthProvider>
          <Toaster
            toastOptions={{
              unstyled: true,
              className:
                "bg-background flex gap-2 backdrop-blur-[0.2rem] items-center border-[0.1rem]  px-4 py-3 rounded-lg",
            }}
          />
        </ConfirmDialogProvider>
      </body>
    </html>
  );
}
