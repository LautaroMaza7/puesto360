export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  image?: string;
  srcUrl?: string;
}

export interface Order {
  id: string;
  orderId: string;
  status: string;
  total: number;
  createdAt: any;
  items: OrderItem[];
  userId: string;
  deliveryInfo?: {
    address: string;
    city: string;
    postalCode: string;
    deliveryMethod: string;
  };
  paymentId?: string;
  collectionId?: string;
  paymentStatus?: string;
  updatedAt?: Date;
} 