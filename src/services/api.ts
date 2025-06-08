import { supabase } from './supabaseClient';

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

export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data || [];
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

    return data || null;
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
      .select('image_url')
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
        if (!item.image_url) return null;
        
        // If it's already a full URL, return as is
        if (item.image_url.startsWith('http')) {
          return item.image_url;
        }
        
        // Construct the full URL for storage bucket images
        return `${supabaseUrl}/storage/v1/object/public/product-images-2/${item.image_url}`;
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

    return data || [];
  } catch (error) {
    console.error('Error in getPriceHistory:', error);
    return [];
  }
};
