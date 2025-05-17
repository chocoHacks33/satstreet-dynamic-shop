
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Price in satoshis
  imageUrl: string;
  shopName: string;
  priceInSats: number;
  priceChangePercentage?: number; // Optional field for price changes
  priceHistory: PriceHistoryEntry[]; // Add the missing priceHistory field
}

export interface PriceHistoryEntry {
  timestamp: string;
  price: number;
  explanation: string;
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
      imageUrl: 'https://wacicyiidaysfjdiaeim.supabase.co/storage/v1/object/public/product-images/bitcoin-tshirt.jpg',
      shopName: 'Satoshi\'s Store',
      priceChangePercentage: 2.5,
      priceHistory: [
        {
          timestamp: '2024-05-01T10:00:00Z',
          price: 48000,
          explanation: 'Price increased due to rising Bitcoin value and higher demand for crypto merchandise.'
        },
        {
          timestamp: '2024-05-08T10:00:00Z',
          price: 49000,
          explanation: 'Slight price adjustment following increased material costs.'
        },
        {
          timestamp: '2024-05-15T10:00:00Z',
          price: 50000,
          explanation: 'Current price reflects market demand and Bitcoin exchange rate fluctuations.'
        }
      ]
    },
    {
      id: '2',
      name: 'Bitcoin Mug',
      description: 'A cool Bitcoin Mug',
      price: 25000,
      priceInSats: 25000,
      imageUrl: 'https://wacicyiidaysfjdiaeim.supabase.co/storage/v1/object/public/product-images/bitcoin-mug.jpg',
      shopName: 'Nakamoto Shop',
      priceChangePercentage: -1.2,
      priceHistory: [
        {
          timestamp: '2024-05-01T10:00:00Z',
          price: 27000,
          explanation: 'Initial price based on production costs and market positioning.'
        },
        {
          timestamp: '2024-05-08T10:00:00Z',
          price: 26000,
          explanation: 'Price decreased due to promotional campaign.'
        },
        {
          timestamp: '2024-05-15T10:00:00Z',
          price: 25000,
          explanation: 'Further price reduction to remain competitive in the market.'
        }
      ]
    },
    {
      id: '3',
      name: 'Bitcoin Hat',
      description: 'A cool Bitcoin Hat',
      price: 30000,
      priceInSats: 30000,
      imageUrl: 'https://wacicyiidaysfjdiaeim.supabase.co/storage/v1/object/public/product-images/bitcoin-hat.jpg',
      shopName: 'Satoshi\'s Store',
      priceChangePercentage: 0.5,
      priceHistory: [
        {
          timestamp: '2024-05-01T10:00:00Z',
          price: 29500,
          explanation: 'Initial pricing for new product launch.'
        },
        {
          timestamp: '2024-05-08T10:00:00Z',
          price: 29800,
          explanation: 'Slight price adjustment due to increased shipping costs.'
        },
        {
          timestamp: '2024-05-15T10:00:00Z',
          price: 30000,
          explanation: 'Price increase reflecting higher demand and limited stock.'
        }
      ]
    },
  ];
};

export const getProduct = async (id: string): Promise<Product | undefined> => {
  // Mock implementation
  const products = await getProducts();
  return products.find(product => product.id === id);
};

// Properly export getProductById as an alias for getProduct
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
  productId?: string; // Make productId optional
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
        description: 'Bitcoin Mug',
        productId: '2' // Add productId for purchase transactions
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

// New helper function to upload an image to Supabase storage
export const uploadProductImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);
    
    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }
    
    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadProductImage:', error);
    return null;
  }
};

// Helper function to get the supabase storage URL
export const getProductImageUrl = (imagePath: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(imagePath);
    
  return publicUrl;
};
