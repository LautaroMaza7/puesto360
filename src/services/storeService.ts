import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { Store } from "@/types/store";

export async function createStore(storeData: Partial<Store>, userId: string): Promise<Store | null> {
  try {
    const storesRef = collection(db, "stores");
    const storeRef = doc(storesRef);

    const newStore: Store = {
      id: storeRef.id,
      ...storeData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: 'active',
      totalSales: 0,
      totalProducts: 0,
      rating: 0,
      ownerId: userId,
    } as Store;

    await setDoc(storeRef, newStore);
    return newStore;
  } catch (error) {
    console.error("Error creating store:", error);
    return null;
  }
}

export async function getStoreById(storeId: string): Promise<Store | null> {
  try {
    const storeRef = doc(db, "stores", storeId);
    const storeSnap = await getDoc(storeRef);

    if (storeSnap.exists()) {
      return {
        id: storeRef.id,
        ...storeSnap.data(),
      } as Store;
    }

    return null;
  } catch (error) {
    console.error("Error getting store:", error);
    return null;
  }
}

export async function getStoreByOwnerId(ownerId: string): Promise<Store | null> {
  try {
    const storesRef = collection(db, "stores");
    const q = query(storesRef, where("ownerId", "==", ownerId), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as Store;
  } catch (error) {
    console.error("Error fetching store by owner:", error);
    throw error;
  }
}

export async function updateStore(storeId: string, storeData: Partial<Store>): Promise<boolean> {
  try {
    const storeRef = doc(db, "stores", storeId);
    await updateDoc(storeRef, {
      ...storeData,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error("Error updating store:", error);
    return false;
  }
}

export async function getTopStores(limitCount: number = 10): Promise<Store[]> {
  try {
    const storesRef = collection(db, "stores");
    const q = query(
      storesRef,
      where("status", "==", "active"),
      orderBy("totalSales", "desc"),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Store);
  } catch (error) {
    console.error("Error fetching top stores:", error);
    throw error;
  }
}

export async function getAllStores(): Promise<Store[]> {
  try {
    const storesRef = collection(db, "stores");
    const storesSnap = await getDocs(storesRef);
    const stores: Store[] = [];

    storesSnap.forEach((doc) => {
      stores.push({
        id: doc.id,
        ...doc.data(),
      } as Store);
    });

    return stores;
  } catch (error) {
    console.error("Error getting stores:", error);
    return [];
  }
} 