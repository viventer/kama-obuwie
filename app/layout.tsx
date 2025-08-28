import type { Metadata } from "next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ConfirmDialogProvider } from "@/app/providers/ConfirmDialogProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { FullPageLoaderProvider } from "@/components/adminPanel/global/FullPageLoader";
import { DialogWindowProvider } from "@/components/providers/DialogWindowProvider";
import GlobalDialogWindow from "@/components/adminPanel/global/GlobalDialogWindow";

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
  title: "kama-obuwie",
  description:
    "Obuwie dla całej rodziny w jednym miejscu. Wygodne buty na każdą okazję - od sportowych po eleganckie. Znajdź idealne buty dla siebie!",
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
        className={`${ubuntuSans.variable} ${ubuntuMono.variable} antialiased font-sans bg-background text-text max-h-screen`}
      >
        <ConfirmDialogProvider>
          <AuthProvider>
            <FullPageLoaderProvider>
              <DialogWindowProvider>
                {children}
                <GlobalDialogWindow />
              </DialogWindowProvider>
            </FullPageLoaderProvider>
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
