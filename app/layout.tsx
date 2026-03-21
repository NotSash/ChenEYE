import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./tokens.css";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ConfirmProvider } from "@/components/providers/ConfirmProvider";
import PWAInstallBanner from "@/components/ui/PWAInstallBanner";
import { ServiceWorkerRegistrar } from "@/components/providers/ServiceWorkerRegistrar";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const viewport: Viewport = {
  themeColor: "#EA580C",
};

export const metadata: Metadata = {
  applicationName: "ChenEYE",
  title: "ChenEYE - Report Traffic Violations",
  description: "Report traffic violations anonymously. Help make Chennai's roads safer.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ChenEYE",
  },
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            try {
              var theme = localStorage.getItem('cheneye-theme');
              if (!theme) {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              }
              document.documentElement.setAttribute('data-theme', theme);
              document.documentElement.style.colorScheme = theme;
            } catch(e) {}
          })();
        `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <ConfirmProvider>
                {children}
                <PWAInstallBanner />
                <ServiceWorkerRegistrar />
              </ConfirmProvider>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

