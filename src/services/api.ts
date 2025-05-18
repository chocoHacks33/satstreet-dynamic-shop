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
  try {
    // Fetch products from Supabase
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) throw productsError;
    if (!products) return [];

    // Transform products and add additional data
    const transformedProducts = await Promise.all(products.map(async (product) => {
      // Fetch primary image for each product
      const { data: images, error: imagesError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        .order('is_primary', { ascending: false })
        .order('display_order', { ascending: true })
        .limit(1);

      if (imagesError) console.error('Error fetching images:', imagesError);
      
      const imageUrl = images && images.length > 0 
        ? getProductImageUrl(images[0].image_path)
        : '/placeholder.svg';
      
      // Fetch price history for each product
      const { data: priceHistory, error: historyError } = await supabase
        .from('price_history')
        .select('*')
        .eq('product_id', product.id)
        .order('timestamp', { ascending: true });

      if (historyError) console.error('Error fetching price history:', historyError);
      
      // Calculate price change percentage
      let priceChangePercentage = 0;
      if (priceHistory && priceHistory.length >= 2) {
        const oldestPrice = priceHistory[0].price;
        const currentPrice = product.price;
        priceChangePercentage = ((currentPrice - oldestPrice) / oldestPrice) * 100;
      }

      // Transform price history to match our interface
      const formattedPriceHistory = (priceHistory || []).map(entry => ({
        timestamp: entry.timestamp,
        price: entry.price,
        explanation: entry.explanation || ''
      }));

      return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        priceInSats: product.price, // Price in sats is the same as price
        imageUrl,
        shopName: product.shop_name,
        priceChangePercentage,
        priceHistory: formattedPriceHistory
      };
    }));

    return transformedProducts;
  } catch (error) {
    console.error('Error in getProducts:', error);
    return [];
  }
};

export const getProduct = async (id: string): Promise<Product | undefined> => {
  try {
    // Check if the ID is likely a valid UUID format to avoid database errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.error('Invalid product ID format:', id);
      return undefined;
    }
    
    // Fetch the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (productError) throw productError;
    if (!product) return undefined;
    
    // Fetch product images
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('is_primary', { ascending: false })
      .order('display_order', { ascending: true });

    if (imagesError) console.error('Error fetching images:', imagesError);
    
    const imageUrl = images && images.length > 0 
      ? getProductImageUrl(images[0].image_path)
      : '/placeholder.svg';
    
    // Fetch price history
    const { data: priceHistory, error: historyError } = await supabase
      .from('price_history')
      .select('*')
      .eq('product_id', product.id)
      .order('timestamp', { ascending: true });

    if (historyError) console.error('Error fetching price history:', historyError);
    
    // Calculate price change percentage
    let priceChangePercentage = 0;
    if (priceHistory && priceHistory.length >= 2) {
      const oldestPrice = priceHistory[0].price;
      const currentPrice = product.price;
      priceChangePercentage = ((currentPrice - oldestPrice) / oldestPrice) * 100;
    }

    // Transform price history to match our interface
    const formattedPriceHistory = (priceHistory || []).map(entry => ({
      timestamp: entry.timestamp,
      price: entry.price,
      explanation: entry.explanation || ''
    }));

    return {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      priceInSats: product.price,
      imageUrl,
      shopName: product.shop_name,
      priceChangePercentage,
      priceHistory: formattedPriceHistory
    };
  } catch (error) {
    console.error('Error in getProduct:', error);
    return undefined;
  }
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

// Helper function to upload an image to Supabase storage
export const uploadProductImage = async (file: File, productId: string, isPrimary: boolean = false): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return null;
    }
    
    // Get the public URL for the file
    const publicUrl = getProductImageUrl(filePath);
    
    // Save image reference to product_images table
    const { data: imageData, error: imageError } = await supabase
      .from('product_images')
      .insert([
        { 
          product_id: productId,
          image_path: filePath,
          is_primary: isPrimary,
          display_order: 0
        }
      ]);
    
    if (imageError) {
      console.error('Error saving image reference:', imageError);
      return null;
    }
    
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadProductImage:', error);
    return null;
  }
};

// Helper function to get product images
export const getProductImages = async (productId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('product_images')
      .select('image_path')
      .eq('product_id', productId)
      .order('is_primary', { ascending: false })
      .order('display_order', { ascending: true });
      
    if (error) {
      console.error('Error fetching product images:', error);
      return [];
    }
    
    return data.map(img => getProductImageUrl(img.image_path));
  } catch (error) {
    console.error('Error in getProductImages:', error);
    return [];
  }
};

// Helper function to get the supabase storage URL
export const getProductImageUrl = (imagePath: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(imagePath);
    
  return publicUrl;
};

// Helper function to create a new product
export const createProduct = async (product: Omit<Product, 'id' | 'imageUrl' | 'priceChangePercentage' | 'priceHistory' | 'priceInSats'>): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: product.name,
          description: product.description,
          price: product.price,
          shop_name: product.shopName
        }
      ])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating product:', error);
      return null;
    }
    
    // Add initial price history entry
    const { error: historyError } = await supabase
      .from('price_history')
      .insert([
        {
          product_id: data.id,
          price: product.price,
          explanation: 'Initial product price'
        }
      ]);
      
    if (historyError) {
      console.error('Error creating price history:', historyError);
    }
    
    return data.id;
  } catch (error) {
    console.error('Error in createProduct:', error);
    return null;
  }
};
