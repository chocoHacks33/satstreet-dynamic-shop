
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Price in satoshis
  imageUrl: string;
  shopName: string; // Added to match ProductCard component
  priceInSats: number; // Added to match ProductCard component
  priceChangePercentage?: number; // Optional field for price changes
}

export const getProducts = async (): Promise<Product[]> => {
  // Mock implementation
  return [
    {
      id: '1',
      name: 'Bitcoin T-Shirt',
      description: 'A cool Bitcoin T-Shirt',
      price: 50000,
      priceInSats: 50000,
      imageUrl: '/placeholder.svg',
      shopName: 'Satoshi\'s Store',
      priceChangePercentage: 2.5,
    },
    {
      id: '2',
      name: 'Bitcoin Mug',
      description: 'A cool Bitcoin Mug',
      price: 25000,
      priceInSats: 25000,
      imageUrl: '/placeholder.svg',
      shopName: 'Nakamoto Shop',
      priceChangePercentage: -1.2,
    },
    {
      id: '3',
      name: 'Bitcoin Hat',
      description: 'A cool Bitcoin Hat',
      price: 30000,
      priceInSats: 30000,
      imageUrl: '/placeholder.svg',
      shopName: 'Satoshi\'s Store',
      priceChangePercentage: 0.5,
    },
  ];
};

export const getProduct = async (id: string): Promise<Product | undefined> => {
  // Mock implementation
  const products = await getProducts();
  return products.find(product => product.id === id);
};

// Alias for getProduct to match usage in ProductDetail component
export const getProductById = getProduct;

export interface User {
  id: string;
  username: string;
  email: string;
  walletBalance: number;
}

// Mock implementation
export const getWalletBalance = async (): Promise<number> => {
  return 2500000; // 2.5M sats ~ 1 BTC
};

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'purchase';
  amount: number;
  timestamp: string;
  description: string;
}

// Mock implementation for wallet info
export const getWalletInfo = async (): Promise<{
  balance: number;
  publicKey: string;
  transactions: WalletTransaction[];
}> => {
  return {
    balance: 2500000,
    publicKey: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    transactions: [
      {
        id: '1',
        type: 'deposit',
        amount: 100000,
        timestamp: '2024-05-15T10:30:00Z',
        description: 'Deposit from Exchange'
      },
      {
        id: '2',
        type: 'purchase',
        amount: -25000,
        timestamp: '2024-05-14T15:45:00Z',
        description: 'Bitcoin Mug'
      },
      {
        id: '3',
        type: 'deposit',
        amount: 50000,
        timestamp: '2024-05-10T09:15:00Z',
        description: 'Lightning Payment'
      }
    ]
  };
};

// These functions will be replaced by Supabase auth
export const login = async (email: string, password: string): Promise<User> => {
  // This is a mock implementation that will be replaced by Supabase auth
  return {
    id: '1',
    username: 'satoshi',
    email: email,
    walletBalance: 2500000 // 2.5M sats ~ 1 BTC
  };
};
