import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, limit } from "firebase/firestore";
import { Store } from "@/types/store";

export async function createStore(storeData: Omit<Store, 'id'>): Promise<Store> {
  try {
    const storeRef = doc(collection(db, "stores"));
    const newStore: Store = {
      id: storeRef.id,
      ...storeData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      totalSales: 0,
      totalProducts: 0,
      rating: 0
    };

    await setDoc(storeRef, newStore);
    return newStore;
  } catch (error) {
    console.error("Error creating store:", error);
    throw error;
  }
}

export async function getStoreById(storeId: string): Promise<Store | null> {
  try {
    const storeRef = doc(db, "stores", storeId);
    const storeDoc = await getDoc(storeRef);

    if (!storeDoc.exists()) {
      return null;
    }

    return storeDoc.data() as Store;
  } catch (error) {
    console.error("Error fetching store:", error);
    throw error;
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

export async function updateStore(storeId: string, updateData: Partial<Store>): Promise<void> {
  try {
    const storeRef = doc(db, "stores", storeId);
    await updateDoc(storeRef, {
      ...updateData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error updating store:", error);
    throw error;
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