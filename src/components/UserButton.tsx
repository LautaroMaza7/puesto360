"use client";

import { useUser } from "@clerk/nextjs";
import { UserButton as ClerkUserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function UserButton() {
  const { user, isSignedIn } = useUser();
  const [storeId, setStoreId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserStore = async () => {
      if (!isSignedIn || !user?.id) return;

      try {
        const storesQuery = query(
          collection(db, "stores"),
          where("ownerId", "==", user.id)
        );

        const querySnapshot = await getDocs(storesQuery);
        if (!querySnapshot.empty) {
          setStoreId(querySnapshot.docs[0].id);
        }
      } catch (error) {
        console.error("Error fetching user store:", error);
      }
    };

    fetchUserStore();
  }, [isSignedIn, user?.id]);

  const handleStoreClick = () => {
    if (storeId) {
      router.push(`/store/${storeId}`);
    } else {
      router.push("/store/new");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {storeId && (
        <button
          onClick={handleStoreClick}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          Mi Tienda
        </button>
      )}
      <ClerkUserButton 
        afterSignOutUrl="/"
        appearance={{
          elements: {
            userButtonAvatarBox: "w-10 h-10",
            userButtonPopoverCard: "shadow-lg",
          }
        }}
      />
    </div>
  );
} 