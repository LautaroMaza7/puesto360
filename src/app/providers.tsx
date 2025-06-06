// app/providers.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "../lib/store";
import { PersistGate } from "redux-persist/integration/react";
import SpinnerbLoader from "@/components/ui/SpinnerbLoader/index";
import { SWRConfig } from 'swr';
import { AuthProvider } from "@/context/AuthContext";
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'
import { useRouter } from 'next/navigation'

type Props = {
  children: React.ReactNode;
};

const Providers = ({ children }: Props) => {
  const { store, persistor } = makeStore();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <SessionProvider>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          dedupingInterval: 60000,
        }}
      >
        <AuthProvider>
          <Provider store={store}>
            <PersistGate
              loading={
                <div className="flex items-center justify-center h-96">
                  <SpinnerbLoader className="w-10 border-2 border-gray-300 border-r-gray-600" />
                </div>
              }
              persistor={persistor}
            >
              {children}
              <Toaster 
                position="bottom-left"
                duration={3000}
                expand={false}
                richColors
                closeButton
                style={{
                  bottom: '1rem',
                  left: '1rem',
                  right: 'auto'
                }}
              />
            </PersistGate>
          </Provider>
        </AuthProvider>
      </SWRConfig>
    </SessionProvider>
  );
};

export default Providers;
