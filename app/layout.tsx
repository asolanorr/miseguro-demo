import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MiSeguro",
  description: "Comparador de seguros de auto para Costa Rica.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} antialiased`}>
      <body>
        <NextIntlClientProvider>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
