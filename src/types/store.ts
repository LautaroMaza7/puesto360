import { Timestamp } from "firebase/firestore";

export interface Store {
  id: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  ownerId: string;
  status: "active" | "inactive" | "suspended";
  address: string;
  city: string;
  phone: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  settings: {
    shippingEnabled: boolean;
  };
  totalProducts: number;
  totalSales: number;
  rating: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
} 