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

// This function enhances product data with more realistic names and descriptions if needed
const enhanceProductData = (product: any): Product => {
  // Map of realistic product names and descriptions by ID
  const productEnhancements: Record<string, {name?: string, description?: string, shop?: string}> = {
    // You can add specific product IDs here when you know them
    "default": {
      // These will only be used if the database doesn't have good values
      name: "Bitcoin Hardware Wallet",
      description: "Secure cold storage solution for your Bitcoin with advanced encryption and easy backup options. Compatible with all major exchanges and wallet software.",
      shop: "CryptoSecure"
    }
  };

  // Check if product has a realistic name and description already
  const isNameGeneric = !product.name || product.name.includes("Product") || product.name.length < 5;
  const isDescriptionGeneric = !product.description || product.description.includes("Description") || product.description.length < 20;
  const isShopNameGeneric = !product.shop_name || product.shop_name.includes("Shop") || product.shop_name.length < 5;
  
  // Use enhancement data if product data seems generic
  const enhancement = productEnhancements[product.id] || productEnhancements.default;
  
  return {
    id: product.id,
    name: isNameGeneric ? enhancement.name : product.name,
    description: isDescriptionGeneric ? enhancement.description : (product.description || ""),
    price: product.price,
    priceInSats: product.price,
    imageUrl: product.imageUrl || '/placeholder.svg',
    shopName: isShopNameGeneric ? enhancement.shop : product.shop_name,
    priceChangePercentage: product.priceChangePercentage || 0,
    priceHistory: product.priceHistory || []
  };
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    // Fetch products from Supabase
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) throw productsError;
    if (!products) return [];

    // Map of realistic product data for demo purposes
    // This will ensure we have good looking product data while developing
    const productTemplates = [
      {
        name: "Trezor Model T Hardware Wallet",
        description: "Premium Bitcoin hardware wallet with touchscreen display. Keep your crypto secure with state-of-the-art encryption. Features a built-in password manager and supports over 1,000 cryptocurrencies.",
        shop: "CryptoVault Store"
      },
      {
        name: "Bitcoin Node Kit - Raspberry Pi Edition",
        description: "Run your own full Bitcoin node with this pre-configured Raspberry Pi kit. Includes 1TB SSD, case, and pre-loaded software. Contribute to network security while verifying your own transactions.",
        shop: "NodeMasters"
      },
      {
        name: "Satoshi's Vision T-Shirt",
        description: "Premium cotton t-shirt featuring the original Bitcoin whitepaper design. Available in multiple sizes with durable screen printing that won't fade after washing.",
        shop: "Crypto Apparel"
      },
      {
        name: "Bitcoin: The Future of Money - Hardcover Book",
        description: "Best-selling guide to understanding Bitcoin and its revolutionary technology. Written by leading experts with simple explanations of complex concepts. Includes investment strategies and technical insights.",
        shop: "Crypto Literature"
      },
      {
        name: "Lightning Network Coffee Mug",
        description: "Ceramic mug featuring Lightning Network design that reveals the network graph when filled with hot liquid. Microwave and dishwasher safe with ergonomic handle.",
        shop: "BitcoinHome"
      },
      {
        name: "Cold Storage Backup Plates - Stainless Steel",
        description: "Fire and water resistant stainless steel plates for secure backup of your wallet recovery phrases. Includes punch tool and comes in a tamper-evident package.",
        shop: "Security Essentials"
      },
      {
        name: "Blockchain Analytics Pro Subscription",
        description: "Annual subscription to advanced Bitcoin blockchain analysis tools. Track transactions, monitor wallet activity, and generate tax reports with our intuitive dashboard.",
        shop: "CryptoMetrics"
      },
      {
        name: "Mining Rig Cooling System",
        description: "High-efficiency cooling solution designed specifically for Bitcoin mining hardware. Reduces operating temperature by up to 35% and extends equipment lifespan.",
        shop: "MiningSupplies"
      }
    ];

    // Transform products and add additional data
    const transformedProducts = await Promise.all(products.map(async (product, index) => {
      // Pick a template based on product index
      const template = productTemplates[index % productTemplates.length];
      
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
      
      // Calculate price change percentage based on the most recent previous price
      let priceChangePercentage = 0;
      if (priceHistory && priceHistory.length >= 2) {
        const previousPrice = priceHistory[priceHistory.length - 2].price; // Second-to-last entry
        const currentPrice = product.price;
        priceChangePercentage = ((currentPrice - previousPrice) / previousPrice) * 100;
      }

      // Transform price history to match our interface
      const formattedPriceHistory = (priceHistory || []).map(entry => ({
        timestamp: entry.timestamp,
        price: entry.price,
        explanation: entry.explanation || ''
      }));

      // Use realistic product data from templates
      const isNameGeneric = !product.name || product.name.includes("Product") || product.name.length < 5;
      const isDescriptionGeneric = !product.description || product.description.includes("Description") || product.description.length < 20;
      const isShopNameGeneric = !product.shop_name || product.shop_name.includes("Shop") || product.shop_name.length < 5;

      return {
        id: product.id,
        name: isNameGeneric ? template.name : product.name,
        description: isDescriptionGeneric ? template.description : (product.description || ''),
        price: product.price,
        priceInSats: product.price,
        imageUrl,
        shopName: isShopNameGeneric ? template.shop : product.shop_name,
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
    
    // Calculate price change percentage based on the most recent previous price
    let priceChangePercentage = 0;
    if (priceHistory && priceHistory.length >= 2) {
      const previousPrice = priceHistory[priceHistory.length - 2].price; // Second-to-last entry
      const currentPrice = product.price;
      priceChangePercentage = ((currentPrice - previousPrice) / previousPrice) * 100;
    }

    // Transform price history to match our interface
    const formattedPriceHistory = (priceHistory || []).map(entry => ({
      timestamp: entry.timestamp,
      price: entry.price,
      explanation: entry.explanation || ''
    }));

    // Realistic product data templates
    const productTemplates = [
      {
        name: "Trezor Model T Hardware Wallet",
        description: "Premium Bitcoin hardware wallet with touchscreen display. Keep your crypto secure with state-of-the-art encryption. Features a built-in password manager and supports over 1,000 cryptocurrencies.",
        shop: "CryptoVault Store"
      },
      {
        name: "Bitcoin Node Kit - Raspberry Pi Edition",
        description: "Run your own full Bitcoin node with this pre-configured Raspberry Pi kit. Includes 1TB SSD, case, and pre-loaded software. Contribute to network security while verifying your own transactions.",
        shop: "NodeMasters"
      },
      {
        name: "Satoshi's Vision T-Shirt",
        description: "Premium cotton t-shirt featuring the original Bitcoin whitepaper design. Available in multiple sizes with durable screen printing that won't fade after washing.",
        shop: "Crypto Apparel"
      },
      {
        name: "Lightning Network Coffee Mug",
        description: "Ceramic mug featuring Lightning Network design that reveals the network graph when filled with hot liquid. Microwave and dishwasher safe with ergonomic handle.",
        shop: "BitcoinHome"
      },
      {
        name: "Cold Storage Backup Plates - Stainless Steel",
        description: "Fire and water resistant stainless steel plates for secure backup of your wallet recovery phrases. Includes punch tool and comes in a tamper-evident package.",
        shop: "Security Essentials"
      }
    ];
    
    // Choose a template based on some characteristic of the product to ensure consistency
    const templateIndex = (product.id.charCodeAt(0) + product.id.charCodeAt(1)) % productTemplates.length;
    const template = productTemplates[templateIndex];
    
    // Check if product has a realistic name and description
    const isNameGeneric = !product.name || product.name.includes("Product") || product.name.length < 5;
    const isDescriptionGeneric = !product.description || product.description.includes("Description") || product.description.length < 20;
    const isShopNameGeneric = !product.shop_name || product.shop_name.includes("Shop") || product.shop_name.length < 5;

    return {
      id: product.id,
      name: isNameGeneric ? template.name : product.name,
      description: isDescriptionGeneric ? template.description : (product.description || ''),
      price: product.price,
      priceInSats: product.price,
      imageUrl,
      shopName: isShopNameGeneric ? template.shop : product.shop_name,
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
    
    // Upload file to storage - updated bucket name to "product-images-2"
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images-2')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return null;
    }
    
    // Get the public URL for the file - updated bucket name to "product-images-2"
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

// Helper function to get the supabase storage URL - updated bucket name to "product-images-2"
export const getProductImageUrl = (imagePath: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from('product-images-2')
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
