"use client"

import TopBanner from "@/components/layout/Banner/TopBanner";
import TopNavbar from "@/components/layout/Navbar/TopNavbar";
import Footer from "@/components/layout/Footer";
import { usePathname } from 'next/navigation';
import { FilterProvider } from "@/context/FilterContext";
import { ToastProvider } from "@/context/ToastContext";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import Providers from "./providers";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <body>
      <Providers>
        <FilterProvider>
          <ToastProvider>
            <ServiceWorkerRegistration />
            {!isAdminRoute && (
              <>
                <TopBanner />
                <TopNavbar />
              </>
            )}
            <main className="min-h-screen">
              {children}
            </main>
            {!isAdminRoute && <Footer />}
            <Toaster />
          </ToastProvider>
        </FilterProvider>
      </Providers>
    </body>
  );
} 