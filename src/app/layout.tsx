import type { Metadata } from "next";
import "@/styles/globals.css";
import { satoshi } from "@/styles/fonts";
import RootLayoutClient from "./root-layout-client";
import Providers from "./providers";
import { cn } from "@/lib/utils";
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TUCS.DRINKS",
  description: "Descubre bebidas que elevan tu experiencia",
  keywords: ["bebidas", "alcohol", "licores", "vinos", "cervezas"],
  authors: [{ name: "TucsDrinks" }],
  creator: "TucsDrinks",
  publisher: "TucsDrinks",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://tucsdrinks.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "TUCS.DRINKS",
    description: "Descubre bebidas que elevan tu experiencia",
    url: "https://tucs.drinks",
    siteName: "TUCS.DRINKS",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: 'summary_large_image',
    title: "TucsDrinks | Bebidas y Licores Premium",
    description: "Descubre nuestra exclusiva selección de bebidas y licores premium. Envíos a domicilio, ofertas especiales y la mejor experiencia en bebidas alcohólicas.",
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={cn(satoshi.variable)}>
      <body className={cn("min-h-screen bg-white antialiased")}>
        <ClerkProvider
          appearance={{
            baseTheme: undefined,
            variables: {
              colorPrimary: '#000000',
              colorText: '#000000',
              colorBackground: '#ffffff',
              colorInputBackground: '#ffffff',
              colorInputText: '#000000',
            },
          }}
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
          <Providers>
            <RootLayoutClient>{children}</RootLayoutClient>
          </Providers>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}