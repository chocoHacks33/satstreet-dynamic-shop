export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export const getProducts = async (): Promise<Product[]> => {
  // Mock implementation
  return [
    {
      id: '1',
      name: 'Bitcoin T-Shirt',
      description: 'A cool Bitcoin T-Shirt',
      price: 50000,
      imageUrl: '/placeholder.svg',
    },
    {
      id: '2',
      name: 'Bitcoin Mug',
      description: 'A cool Bitcoin Mug',
      price: 25000,
      imageUrl: '/placeholder.svg',
    },
    {
      id: '3',
      name: 'Bitcoin Hat',
      description: 'A cool Bitcoin Hat',
      price: 30000,
      imageUrl: '/placeholder.svg',
    },
  ];
};

export const getProduct = async (id: string): Promise<Product | undefined> => {
  // Mock implementation
  const products = await getProducts();
  return products.find(product => product.id === id);
};

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

export const loginWithGoogle = async (): Promise<User> => {
  // This is a mock implementation that will be replaced by Supabase auth
  return {
    id: '1',
    username: 'satoshi',
    email: 'satoshi@example.com',
    walletBalance: 2500000 // 2.5M sats ~ 1 BTC
  };
};
