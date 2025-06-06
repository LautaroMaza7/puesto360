"use client"

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { initUser } from "@/lib/initUser";

export default function UserInitializer() {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    const initializeUser = async () => {
      if (isSignedIn && user?.id && user?.primaryEmailAddress?.emailAddress) {
        try {
          await initUser(user.id, user.primaryEmailAddress.emailAddress);
        } catch (error) {
          console.error("Error initializing user:", error);
        }
      }
    };

    initializeUser();
  }, [isSignedIn, user]);

  return null;
} 