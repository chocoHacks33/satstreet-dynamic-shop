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
      name: "Ledger Nano X Bitcoin Hardware Wallet",
      description: "The most secure cold storage solution with Bluetooth connectivity. Store, manage and exchange your Bitcoin with peace of mind. Certified CC EAL5+ secure chip.",
      shop: "BitDefense Solutions"
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
        name: "Trezor Model T Bitcoin Wallet",
        description: "Premium hardware wallet with color touchscreen display and USB-C. Store Bitcoin and 1,800+ other cryptocurrencies with military-grade security. Includes recovery seed backup cards.",
        shop: "CryptoVault Direct"
      },
      {
        name: "Umbrel Home Bitcoin Node",
        description: "All-in-one Bitcoin & Lightning Network node with 2TB SSD storage. Sync the entire blockchain while maintaining privacy. Includes preconfigured BTCPay Server and Mempool Explorer.",
        shop: "NodeWorks"
      },
      {
        name: "COLDCARD Mk4 Secure Bitcoin Wallet",
        description: "Ultra-secure, air-gapped hardware wallet with physical anti-tampering protections. Includes PIN protection, duress PIN option, and encrypted microSD backup. Made for serious Bitcoin HODLers.",
        shop: "Coinkite Official"
      },
      {
        name: "Bitcoin & Lightning Network Engineering Handbook",
        description: "Comprehensive 450-page guide covering Bitcoin protocol development, Lightning Network implementation, and smart contract security. Includes code examples and practical exercises.",
        shop: "Chaincode Labs Publishing"
      },
      {
        name: "Blockstream Jade Hardware Wallet",
        description: "Open-source Bitcoin hardware wallet with color screen and QR scanner. Supports multisignature setups and Liquid assets. Compact form factor with long battery life.",
        shop: "Blockstream Store"
      },
      {
        name: "Strike Lightning Payment Terminal",
        description: "Accept Bitcoin payments instantly through Lightning Network with zero fees. Includes integrated touchscreen POS system compatible with major accounting software. No chargebacks ever.",
        shop: "Lightning Solutions"
      },
      {
        name: "BitBox02 Bitcoin-only Edition",
        description: "Minimalist Swiss-made hardware wallet with OLED display. Includes invisible touch sensors and secure chip. Designed specifically for Bitcoin with simplified interface.",
        shop: "Shift Crypto"
      },
      {
        name: "Samourai Wallet Steel Recovery Seed Backup",
        description: "Fire, water, and corrosion-resistant stainless steel plate for secure BIP39 seed storage. Punch tool included for permanent word recording. Tested to withstand temperatures up to 1,400°C.",
        shop: "SeedSafe"
      },
      {
        name: "Bitcoin Core Contributor Signature T-Shirt",
        description: "Limited edition organic cotton t-shirt featuring signatures from top Bitcoin developers. Available in black with subtle orange highlights. All proceeds support open-source development.",
        shop: "CypherThreads"
      },
      {
        name: "Lightning Network Desk Sculpture",
        description: "Handcrafted aluminum channel network visualization that lights up via USB power. Each sculpture represents actual Lightning Network topology and is unique. Includes certificate of authenticity.",
        shop: "Crypto Sculptures"
      },
      {
        name: "Raspiblitz Lightning Node DIY Kit",
        description: "Complete kit to build your own Bitcoin & Lightning full node with Raspberry Pi 4 (8GB), LCD display, and 1TB SSD. Pre-loaded with Bitcoin Core and LND software.",
        shop: "DIY Bitcoin Hardware"
      },
      {
        name: "El Salvador Bitcoin Beach Photo Book",
        description: "Hardcover coffee table book documenting Bitcoin adoption in El Zonte. Features 120 pages of professional photography and interviews with local business owners and community leaders.",
        shop: "Bitcoin Archive Press"
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
        name: "Trezor Model T Bitcoin Wallet",
        description: "Premium hardware wallet with color touchscreen display and USB-C. Store Bitcoin and 1,800+ other cryptocurrencies with military-grade security. Includes recovery seed backup cards and premium packaging. Compatible with Windows, macOS, Linux and Android devices. Updates automatically with latest security features.",
        shop: "CryptoVault Direct"
      },
      {
        name: "Umbrel Home Bitcoin Node",
        description: "All-in-one Bitcoin & Lightning Network node with 2TB SSD storage. Sync the entire blockchain while maintaining privacy. Includes preconfigured BTCPay Server and Mempool Explorer. Runs on low power consumption with automatic updates. Includes built-in Tor support for enhanced privacy.",
        shop: "NodeWorks"
      },
      {
        name: "COLDCARD Mk4 Secure Bitcoin Wallet",
        description: "Ultra-secure, air-gapped hardware wallet with physical anti-tampering protections. Includes PIN protection, duress PIN option, and encrypted microSD backup. Made for serious Bitcoin HODLers. Features secure element chip and open-source firmware that can be verified before use.",
        shop: "Coinkite Official"
      },
      {
        name: "Blockstream Jade Hardware Wallet",
        description: "Open-source Bitcoin hardware wallet with color screen and QR scanner. Supports multisignature setups and Liquid assets. Compact form factor with long battery life. Includes USB-C cable and protective case. Works with popular wallet software like Electrum and Sparrow.",
        shop: "Blockstream Store"
      },
      {
        name: "BitBox02 Bitcoin-only Edition",
        description: "Minimalist Swiss-made hardware wallet with OLED display. Includes invisible touch sensors and secure chip. Designed specifically for Bitcoin with simplified interface. Features BIP39 passphrase support and microSD slot for backups. Manufactured in Switzerland with strict quality controls.",
        shop: "Shift Crypto"
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
