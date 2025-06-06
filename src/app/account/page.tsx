"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AccountPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in");
    }
  }, [isSignedIn, router]);

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Mi Cuenta</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p>Email: {user?.emailAddresses[0]?.emailAddress}</p>
        <p>Nombre: {user?.firstName} {user?.lastName}</p>
      </div>
    </div>
  );
} 