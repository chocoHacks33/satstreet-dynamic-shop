
// This file contains API calls to fetch data from the backend

export interface Product {
  id: string;
  name: string;
  description: string;
  shopName: string;
  imageUrl: string;
  priceInSats: number;
  priceChangePercentage: number; // negative for decrease, positive for increase
  priceHistory: {
    timestamp: number;
    price: number;
    explanation: string;
  }[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  walletBalance: number;
}

export interface WalletTransaction {
  id: string;
  timestamp: number;
  amount: number;
  type: 'purchase' | 'deposit' | 'withdrawal';
  description: string;
  productId?: string;
}

export interface WalletInfo {
  publicKey: string;
  balance: number;
  transactions: WalletTransaction[];
}

// Mock data for development
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Bitcoin Hoodie',
    description: 'Premium Bitcoin-themed hoodie with embroidered logo',
    shopName: 'Crypto Apparel',
    imageUrl: '/placeholder.svg',
    priceInSats: 120000,
    priceChangePercentage: 2.5,
    priceHistory: Array.from({ length: 24 }, (_, i) => ({
      timestamp: Date.now() - (24 - i) * 3600000,
      price: 120000 + Math.sin(i/3) * 10000,
      explanation: `Price ${i % 2 === 0 ? 'increased' : 'decreased'} due to market demand and Bitcoin price fluctuations.`
    }))
  },
  {
    id: '2',
    name: 'Hardware Wallet',
    description: 'Secure cold storage for your Bitcoin',
    shopName: 'Secure Crypto',
    imageUrl: '/placeholder.svg',
    priceInSats: 450000,
    priceChangePercentage: -1.8,
    priceHistory: Array.from({ length: 24 }, (_, i) => ({
      timestamp: Date.now() - (24 - i) * 3600000,
      price: 450000 + Math.cos(i/4) * 20000,
      explanation: `Price adjusted based on supplier costs and competitive market analysis.`
    }))
  },
  {
    id: '3',
    name: 'Bitcoin Art Print',
    description: 'Limited edition Bitcoin artwork',
    shopName: 'Crypto Art Collection',
    imageUrl: '/placeholder.svg',
    priceInSats: 85000,
    priceChangePercentage: 5.7,
    priceHistory: Array.from({ length: 24 }, (_, i) => ({
      timestamp: Date.now() - (24 - i) * 3600000,
      price: 85000 + Math.sin(i/2) * 8000,
      explanation: `Price increased due to limited supply and high collector demand.`
    }))
  },
  {
    id: '4',
    name: 'Mining Equipment',
    description: 'Professional Bitcoin mining hardware',
    shopName: 'Mining Solutions',
    imageUrl: '/placeholder.svg',
    priceInSats: 3200000,
    priceChangePercentage: -3.2,
    priceHistory: Array.from({ length: 24 }, (_, i) => ({
      timestamp: Date.now() - (24 - i) * 3600000,
      price: 3200000 + Math.sin(i/5) * 100000,
      explanation: `Price decreased due to new inventory and technological improvements.`
    }))
  },
  {
    id: '5',
    name: 'Bitcoin Book Bundle',
    description: 'Collection of essential Bitcoin reading',
    shopName: 'Crypto Library',
    imageUrl: '/placeholder.svg',
    priceInSats: 65000,
    priceChangePercentage: 1.1,
    priceHistory: Array.from({ length: 24 }, (_, i) => ({
      timestamp: Date.now() - (24 - i) * 3600000,
      price: 65000 + Math.cos(i/3) * 5000,
      explanation: `Price adjusted to reflect current Bitcoin exchange rates and publishing costs.`
    }))
  },
  {
    id: '6',
    name: 'Crypto Conference Ticket',
    description: 'Entry to annual Bitcoin conference',
    shopName: 'Crypto Events',
    imageUrl: '/placeholder.svg',
    priceInSats: 180000,
    priceChangePercentage: 8.5,
    priceHistory: Array.from({ length: 24 }, (_, i) => ({
      timestamp: Date.now() - (24 - i) * 3600000,
      price: 180000 + Math.sin(i/2) * 20000,
      explanation: `Price increased due to limited ticket availability as event date approaches.`
    }))
  }
];

// Function to simulate API calls with delays
const simulateApiCall = <T>(data: T, delay = 500): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

// API functions
export const getProducts = async (): Promise<Product[]> => {
  try {
    // In a real app, this would be: const response = await fetch('/api/products');
    return await simulateApiCall(mockProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  try {
    // In a real app, this would be: const response = await fetch(`/api/products/${id}`);
    const product = mockProducts.find(p => p.id === id);
    return await simulateApiCall(product);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

// Mock user for development
const mockUser: User = {
  id: 'user1',
  username: 'satoshi',
  email: 'satoshi@example.com',
  walletBalance: 2500000
};

export const login = async (username: string, password: string): Promise<User> => {
  try {
    // In a real app, this would verify credentials
    if (username && password) {
      return await simulateApiCall(mockUser);
    }
    throw new Error('Invalid credentials');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const loginWithGoogle = async (): Promise<User> => {
  try {
    // In a real app, this would handle OAuth
    return await simulateApiCall(mockUser, 1000);
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

// Mock wallet for development
const mockWallet: WalletInfo = {
  publicKey: 'bc1q84nw6xn8cr6q9yxl5a73ekcm3qxwl3wscvr9eq',
  balance: 2500000,
  transactions: [
    {
      id: 'tx1',
      timestamp: Date.now() - 86400000,
      amount: -120000,
      type: 'purchase',
      description: 'Bitcoin Hoodie',
      productId: '1'
    },
    {
      id: 'tx2',
      timestamp: Date.now() - 172800000,
      amount: 500000,
      type: 'deposit',
      description: 'Deposit from external wallet'
    },
    {
      id: 'tx3',
      timestamp: Date.now() - 259200000,
      amount: -65000,
      type: 'purchase',
      description: 'Bitcoin Book Bundle',
      productId: '5'
    }
  ]
};

export const getWalletInfo = async (): Promise<WalletInfo> => {
  try {
    // In a real app, this would fetch from the API
    return await simulateApiCall(mockWallet);
  } catch (error) {
    console.error('Error fetching wallet info:', error);
    throw error;
  }
};
