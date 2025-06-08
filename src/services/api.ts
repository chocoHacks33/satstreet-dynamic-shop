
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  createdAt: string;
  name: string;
  description: string;
  imageUrl: string;
  priceInSats: number;
  priceChangePercentage: number;
  shopName: string;
  stockCount: number;
  priceHistory: PriceEntry[];
}

export interface PriceEntry {
  timestamp: string;
  price: number;
  explanation: string;
}

// Legacy alias for backward compatibility
export interface PriceHistoryEntry extends PriceEntry {}

export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    // Transform the data to match our Product interface
    const products: Product[] = (data || []).map(product => ({
      id: product.id,
      createdAt: product.created_at,
      name: product.name,
      description: product.description || '',
      imageUrl: '/placeholder.svg', // Default placeholder
      priceInSats: product.price,
      priceChangePercentage: 0, // Will be calculated from price history
      shopName: product.shop_name,
      stockCount: product.stock_count,
      priceHistory: []
    }));

    return products;
  } catch (error) {
    console.error('Error in getProducts:', error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }

    if (!data) return null;

    // Transform the data to match our Product interface
    const product: Product = {
      id: data.id,
      createdAt: data.created_at,
      name: data.name,
      description: data.description || '',
      imageUrl: '/placeholder.svg', // Default placeholder
      priceInSats: data.price,
      priceChangePercentage: 0, // Will be calculated from price history
      shopName: data.shop_name,
      stockCount: data.stock_count,
      priceHistory: []
    };

    return product;
  } catch (error) {
    console.error('Error in getProductById:', error);
    return null;
  }
};

export const getProductImages = async (productId: string): Promise<string[]> => {
  try {
    console.log('Fetching images for product ID:', productId);
    
    const { data, error } = await supabase
      .from('product_images')
      .select('image_path')
      .eq('product_id', productId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching product images:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No images found for product:', productId);
      return [];
    }

    // Get the base URL from supabase client
    const supabaseUrl = supabase.supabaseUrl;
    const validImages = data
      .map(item => {
        if (!item.image_path) return null;
        
        // If it's already a full URL, return as is
        if (item.image_path.startsWith('http')) {
          return item.image_path;
        }
        
        // Construct the full URL for storage bucket images
        return `${supabaseUrl}/storage/v1/object/public/product-images/${item.image_path}`;
      })
      .filter((url): url is string => url !== null);

    console.log('Valid product images found:', validImages);
    return validImages;
  } catch (error) {
    console.error('Error in getProductImages:', error);
    return [];
  }
};

export const getPriceHistory = async (productId: string): Promise<PriceEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('product_id', productId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching price history:', error);
      return [];
    }

    // Transform the data to match our PriceEntry interface
    const priceHistory: PriceEntry[] = (data || []).map(entry => ({
      timestamp: entry.timestamp,
      price: entry.price,
      explanation: entry.explanation || ''
    }));

    return priceHistory;
  } catch (error) {
    console.error('Error in getPriceHistory:', error);
    return [];
  }
};

export const uploadProductImage = async (file: File, productId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    // Insert record into product_images table
    const { error: dbError } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        image_path: filePath
      });

    if (dbError) {
      console.error('Error inserting image record:', dbError);
      return null;
    }

    return `${supabase.supabaseUrl}/storage/v1/object/public/product-images/${filePath}`;
  } catch (error) {
    console.error('Error in uploadProductImage:', error);
    return null;
  }
};
