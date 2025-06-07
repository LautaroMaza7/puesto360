import type { Metadata } from "next";
import "@/styles/globals.css";
import { satoshi } from "@/styles/fonts";
import RootLayoutClient from "./root-layout-client";
import Providers from "./providers";
import { cn } from "@/lib/utils";
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import UserInitializer from "@/components/auth/UserInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Puesto360",
  description: "Plataforma integral para la gestión de comercios textiles",
  keywords: ["textil", "comercio", "gestión", "administración", "negocios", "retail"],
  authors: [{ name: "Puesto360" }],
  creator: "Puesto360",
  publisher: "Puesto360",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://puesto360.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Puesto360",
    description: "Plataforma integral para la gestión de comercios textiles",
    url: "https://puesto360.com",
    siteName: "Puesto360",
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
    title: "Puesto360 | Gestión de Comercios Textiles",
    description: "Optimiza tu negocio textil con nuestra plataforma integral de gestión. Administración eficiente, control de inventario y más.",
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
    <html lang="es" className={cn(satoshi.variable)}>
      <body className={cn("min-h-screen bg-white antialiased")}>
          <UserInitializer />
        <Providers>
          <RootLayoutClient>{children}</RootLayoutClient>
        </Providers>
          <Toaster />
      </body>
    </html>
    </ClerkProvider>
  );
}