export interface Store {
  id: string;
  name: string;
  description: string;
  logo: string;
  banner: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'suspended';
  categories: string[];
  rating: number;
  totalSales: number;
  totalProducts: number;
  contactInfo: {
    email: string;
    phone?: string;
    address?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
  settings: {
    shippingEnabled: boolean;
    customShippingRates?: {
      [key: string]: number;
    };
    returnPolicy?: string;
    termsAndConditions?: string;
  };
} 