import type { Metadata } from "next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";
import { ConfirmDialogProvider } from "@/app/providers/ConfirmDialogProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { FullPageLoaderProvider } from "@/components/adminPanel/global/FullPageLoader";
import { DialogWindowProvider } from "@/app/providers/DialogWindowProvider";
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
  title: "Kama Obuwie",
  description:
    "Obuwie dla całej rodziny w jednym miejscu. Wygodne buty na każdą okazję - od sportowych po eleganckie. Znajdź idealne buty dla siebie!",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";
  const googleTagManagerId = "GTM-W5BW5CCQ";

  return (
    <html
      lang="pl"
      className="scrollbar scrollbar-track-transparent scrollbar-thumb-secondary"
    >
      <head>
        {isProduction ? (
          <>
            <Script id="gtm-script" strategy="afterInteractive">
              {`
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${googleTagManagerId}');
              `.trim()}
            </Script>
            <meta
              name="google-site-verification"
              content="9Ud0WgGabcpBktv5pzGZ3nP51iLK9GslHEo-s1j8WZk"
            />
          </>
        ) : (
          <meta
            name="google-site-verification"
            content="q2HwT7PPwI-INPFKZgq-biCl3lUX7luJe4MX0lkrN8M"
          />
        )}
      </head>
      <body
        className={`${ubuntuSans.variable} ${ubuntuMono.variable} antialiased font-sans bg-background text-text max-h-screen`}
      >
        {isProduction ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        ) : null}
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
                "bg-background flex gap-2 backdrop-blur-[0.2rem] items-center border-[0.1rem]  px-4 py-3 rounded-xs",
            }}
          />
        </ConfirmDialogProvider>
      </body>
    </html>
  );
}
