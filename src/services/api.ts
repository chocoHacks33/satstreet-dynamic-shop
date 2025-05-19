
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description: string;
  priceInSats: number;
  shopName: string;
  imageUrl: string;
  priceChangePercentage: number;
  priceHistory: PriceHistoryEntry[];
  stockCount: number;
}

export interface PriceHistoryEntry {
  timestamp: string;
  price: number;
  explanation: string;
}

export const getProducts = async (): Promise<Product[]> => {
  // Fetch products from Supabase
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      price_history:price_history(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  // Transform the data to match our Product interface
  return products.map(product => {
    // Calculate price change percentage based on price history
    const priceHistory = product.price_history || [];
    let priceChangePercentage = 0;

    if (priceHistory.length > 1) {
      const currentPrice = product.price;
      const previousPrice = priceHistory[priceHistory.length - 2]?.price || currentPrice;
      priceChangePercentage = previousPrice !== 0 ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      priceInSats: product.price,
      shopName: product.shop_name,
      imageUrl: `/images/product${(Math.floor(Math.random() * 6) + 1)}.webp`, // Placeholder image
      priceChangePercentage: parseFloat(priceChangePercentage.toFixed(2)),
      priceHistory: (product.price_history || []).map((history: any) => ({
        timestamp: history.timestamp,
        price: history.price,
        explanation: history.explanation || ''
      })),
      stockCount: product.stock_count || 0
    };
  });
};

export const getProductById = async (id: string): Promise<Product | null> => {
  // Fetch a single product by ID from Supabase
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      price_history:price_history(*)
    `)
    .eq('id', id)
    .single();

  if (error || !product) {
    console.error('Error fetching product by ID:', error);
    return null;
  }

  // Calculate price change percentage
  const priceHistory = product.price_history || [];
  let priceChangePercentage = 0;

  if (priceHistory.length > 1) {
    const currentPrice = product.price;
    const previousPrice = priceHistory[priceHistory.length - 2]?.price || currentPrice;
    priceChangePercentage = previousPrice !== 0 ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;
  }

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    priceInSats: product.price,
    shopName: product.shop_name,
    imageUrl: `/images/product${(Math.floor(Math.random() * 6) + 1)}.webp`, // Placeholder image
    priceChangePercentage: parseFloat(priceChangePercentage.toFixed(2)),
    priceHistory: (product.price_history || []).map((history: any) => ({
      timestamp: history.timestamp,
      price: history.price,
      explanation: history.explanation || ''
    })),
    stockCount: product.stock_count || 0
  };
};

export const getProductImages = async (productId: string): Promise<string[]> => {
  console.log('Fetching product images for product ID:', productId);
  
  // Check if there are real product images in Supabase
  const { data: productImages, error } = await supabase
    .from('product_images')
    .select('image_path')
    .eq('product_id', productId)
    .order('display_order', { ascending: true });

  console.log('Product images result:', { productImages, error });

  if (!error && productImages && productImages.length > 0) {
    console.log('Found product images:', productImages);
    return productImages.map(img => img.image_path);
  }

  console.log('No product images found, using placeholders');
  // Return placeholder images if no real images found
  return [
    `/images/product${Math.floor(Math.random() * 6) + 1}.webp`,
    `/images/product${Math.floor(Math.random() * 6) + 1}.webp`,
    `/images/product${Math.floor(Math.random() * 6) + 1}.webp`
  ];
};

// Helper function for Wallet page
export const getWalletInfo = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('wallet_balance, username')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching wallet info:', error);
    return { 
      balance: 0, 
      username: 'User',
      publicKey: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      transactions: [] 
    };
  }
  
  // Mock transactions for demonstration with proper literal types
  const mockTransactions = [
    {
      id: '1',
      type: 'deposit' as 'deposit',  // Using type assertion to specify literal type
      amount: 50000,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      description: 'Initial deposit'
    },
    {
      id: '2',
      type: 'purchase' as 'purchase',  // Using type assertion to specify literal type
      amount: -12500,
      timestamp: new Date(Date.now() - 43200000).toISOString(),
      description: 'Purchase of UltraFlex Running Shoes',
      productId: 'bf01fe26-f74d-4655-91ff-e32d257fc41d'
    },
    {
      id: '3',
      type: 'deposit' as 'deposit',  // Using type assertion to specify literal type
      amount: 25000,
      timestamp: new Date(Date.now() - 21600000).toISOString(),
      description: 'Lightning payment received'
    }
  ];
  
  return { 
    balance: data?.wallet_balance || 0, 
    username: data?.username || 'User',
    publicKey: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
    transactions: mockTransactions
  };
};

// Helper function for ImageUploader component
export const uploadProductImage = async (file: File, productId: string) => {
  const fileExt = file.name.split('.').pop();
  const filePath = `${productId}/${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);
    
  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    return null;
  }
  
  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);
    
  // Save the image reference to the product_images table
  const { error: insertError } = await supabase.from('product_images').insert({
    product_id: productId,
    image_path: data.publicUrl,
    is_primary: false
  });
  
  if (insertError) {
    console.error('Error saving image reference:', insertError);
  }
  
  return data.publicUrl;
};
