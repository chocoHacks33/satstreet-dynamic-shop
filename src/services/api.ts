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
  shopId?: string;
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
  
  try {
    // Check for product images in the database table regardless of bucket status
    const { data: productImages, error } = await supabase
      .from('product_images')
      .select('image_path')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    console.log('Product images database query result:', { productImages, error });

    if (error) {
      console.error('Error fetching product images from database:', error);
      return getPlaceholderImages();
    }

    if (!productImages || productImages.length === 0) {
      console.log('No product images found in database for product', productId);
      return getPlaceholderImages();
    }
    
    // Generate direct URLs for the website - bypassing storage bucket issues
    // Use hard-coded valid image URLs that will work for the demo
    const publicPath = 'https://wacicyiidaysfjdiaeim.supabase.co/storage/v1/object/public/product-images-2/';
    
    // Log the supabase URL for verification (not using projectRef which doesn't exist)
    console.log('Using Supabase URL:', supabase.supabaseUrl);
    
    // Process the image paths to create proper URLs
    const processedImages = productImages.map(img => {
      // If the image path is already a full URL, use it
      if (img.image_path.startsWith('http')) {
        return img.image_path;
      }
      
      // Otherwise, construct the URL directly using the known pattern
      const fullUrl = `${publicPath}${encodeURIComponent(img.image_path)}`;
      console.log(`Generated URL for ${img.image_path}:`, fullUrl);
      return fullUrl;
    });
    
    // Return the processed images or fallback to placeholders if all are invalid
    const validImages = processedImages.filter(url => url && !url.includes('undefined'));
    return validImages.length > 0 ? validImages : getPlaceholderImages();
  } catch (err) {
    console.error('Unexpected error in getProductImages:', err);
    return getPlaceholderImages();
  }
};

// Helper function to get placeholder images
const getPlaceholderImages = (): string[] => {
  console.log('Using placeholder images as fallback');
  return [
    getRandomPlaceholder(),
    getRandomPlaceholder(),
    getRandomPlaceholder()
  ];
};

// Helper function to get a random placeholder image
const getRandomPlaceholder = (): string => {
  const placeholders = [
    '/images/product1.webp',
    '/images/product2.webp',
    '/images/product3.webp',
    '/images/product4.webp',
    '/images/product5.webp',
    '/images/product6.webp',
    '/placeholder.svg'
  ];
  return placeholders[Math.floor(Math.random() * placeholders.length)];
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

export const uploadProductImage = async (file: File, productId: string) => {
  const fileExt = file.name.split('.').pop();
  const filePath = `${productId}/${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  
  // Check if the bucket exists, if not try to create it
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some(bucket => bucket.name === 'product-images-2')) {
    console.error('Product-images-2 bucket does not exist in storage. Images cannot be uploaded.');
  }
  
  const { error: uploadError } = await supabase.storage
    .from('product-images-2')
    .upload(filePath, file);
    
  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    return null;
  }
  
  const { data } = supabase.storage
    .from('product-images-2')
    .getPublicUrl(filePath);
    
  // Save the image reference to the product_images table
  const { error: insertError } = await supabase.from('product_images').insert({
    product_id: productId,
    image_path: filePath, // Store just the path, not the full URL
    is_primary: false
  });
  
  if (insertError) {
    console.error('Error saving image reference:', insertError);
  }
  
  return data.publicUrl;
};

// New functions for seller functionality

export interface Shop {
  id: string;
  ownerId: string;
  shopName: string;
  description?: string;
  publicBitcoinAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDeclaration {
  id: string;
  productId: string;
  declaredStock: number;
  declarationDate: string;
  blockchainTxId?: string;
  blockchainTxStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export const createShop = async (shop: Omit<Shop, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>): Promise<Shop | null> => {
  const { data, error } = await supabase
    .from('seller_shops')
    .insert({
      shop_name: shop.shopName,
      description: shop.description,
      public_bitcoin_address: shop.publicBitcoinAddress
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating shop:', error);
    return null;
  }

  return {
    id: data.id,
    ownerId: data.owner_id,
    shopName: data.shop_name,
    description: data.description,
    publicBitcoinAddress: data.public_bitcoin_address,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const getSellerShops = async (): Promise<Shop[]> => {
  const { data, error } = await supabase
    .from('seller_shops')
    .select('*');

  if (error) {
    console.error('Error fetching seller shops:', error);
    return [];
  }

  return data.map(shop => ({
    id: shop.id,
    ownerId: shop.owner_id,
    shopName: shop.shop_name,
    description: shop.description,
    publicBitcoinAddress: shop.public_bitcoin_address,
    createdAt: shop.created_at,
    updatedAt: shop.updated_at
  }));
};

export const getSellerProducts = async (shopId: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      price_history:price_history(*)
    `)
    .eq('shop_id', shopId);

  if (error) {
    console.error('Error fetching seller products:', error);
    return [];
  }

  // Transform data similar to getProducts
  return data.map(product => {
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
      shopId: product.shop_id,
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

export const createProduct = async (product: Omit<Product, 'id' | 'imageUrl' | 'priceChangePercentage' | 'priceHistory'>): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: product.name,
      description: product.description,
      price: product.priceInSats,
      shop_name: product.shopName,
      shop_id: product.shopId,
      stock_count: product.stockCount
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating product:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    priceInSats: data.price,
    shopName: data.shop_name,
    shopId: data.shop_id,
    imageUrl: `/images/product${(Math.floor(Math.random() * 6) + 1)}.webp`,
    priceChangePercentage: 0,
    priceHistory: [],
    stockCount: data.stock_count
  };
};

export const updateProduct = async (productId: string, productData: Partial<Product>): Promise<boolean> => {
  const updateData: any = {};
  
  if (productData.name) updateData.name = productData.name;
  if (productData.description) updateData.description = productData.description;
  if (productData.priceInSats) updateData.price = productData.priceInSats;
  if (productData.stockCount !== undefined) updateData.stock_count = productData.stockCount;
  
  const { error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', productId);
  
  if (error) {
    console.error('Error updating product:', error);
    return false;
  }
  
  return true;
};

export const declareStock = async (productId: string, stockCount: number): Promise<ProductDeclaration | null> => {
  // First, update the product stock count
  const updateResult = await updateProduct(productId, { stockCount });

  if (!updateResult) {
    return null;
  }

  // Then create a declaration record
  const { data, error } = await supabase
    .from('product_declarations')
    .insert({
      product_id: productId,
      declared_stock: stockCount,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error declaring stock:', error);
    return null;
  }

  // Simulate blockchain announcement
  // In a real system, this would be an actual blockchain transaction
  setTimeout(async () => {
    // Update with fake blockchain transaction ID
    const txId = 'cb01ea705494ce66d7e5b7cb51bb5b39b8e8ce31e168d1bd7dda253af359cc' + Math.floor(Math.random() * 100);
    
    await supabase
      .from('product_declarations')
      .update({
        blockchain_tx_id: txId,
        blockchain_tx_status: 'confirmed',
      })
      .eq('id', data.id);
  }, 5000);

  return {
    id: data.id,
    productId: data.product_id,
    declaredStock: data.declared_stock,
    declarationDate: data.declaration_date,
    blockchainTxId: data.blockchain_tx_id,
    blockchainTxStatus: data.blockchain_tx_status,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const getProductDeclarations = async (productId: string): Promise<ProductDeclaration[]> => {
  const { data, error } = await supabase
    .from('product_declarations')
    .select('*')
    .eq('product_id', productId)
    .order('declaration_date', { ascending: false });

  if (error) {
    console.error('Error fetching product declarations:', error);
    return [];
  }

  return data.map(declaration => ({
    id: declaration.id,
    productId: declaration.product_id,
    declaredStock: declaration.declared_stock,
    declarationDate: declaration.declaration_date,
    blockchainTxId: declaration.blockchain_tx_id,
    blockchainTxStatus: declaration.blockchain_tx_status,
    createdAt: declaration.created_at,
    updatedAt: declaration.updated_at
  }));
};

export const getUserRole = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user role:', error);
    return null;
  }

  return data.role;
};

export const updateUserRole = async (userId: string, role: 'customer' | 'seller' | 'admin'): Promise<boolean> => {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user role:', error);
    return false;
  }

  return true;
};
