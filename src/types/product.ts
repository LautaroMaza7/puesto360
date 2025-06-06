export interface Product {
  id: string;
  storeId: string;
  active: boolean;
  category: string;
  createdAt: Date;
  description: string;
  discount: {
    amount: number;
    percentage: number;
  };
  featuredBrand: boolean;
  freeShipping: boolean;
  images: string[];
  name: string;
  newArrival: boolean;
  price: number;
  promos: Array<{
    cantidad: number;
    descuento: number;
    precioFinal: number;
  }>;
  rating: number;
  sales: number;
  specialOffer: boolean;
  srcUrl: string;
  stock: number;
  subcategory: string;
  title: string;
  updatedAt: string;
  videos?: string[];
  externalLinks?: string[];
  specifications?: {
    [key: string]: string | number | boolean;
  };
  shippingInfo?: {
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    shippingClass?: string;
  };
} 