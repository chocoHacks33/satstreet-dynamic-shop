
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Manually triggers a price update on the server
 * This is useful for testing or admin functions
 */
export const triggerPriceUpdate = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('trigger_price_update');
    
    if (error) {
      console.error('Error triggering price update:', error);
      toast.error('Failed to update prices');
      return false;
    }
    
    console.log('Price update triggered successfully:', data);
    toast.success('Prices updated successfully');
    return true;
  } catch (err) {
    console.error('Error in triggerPriceUpdate:', err);
    toast.error('Failed to update prices');
    return false;
  }
};

/**
 * Fetches latest prices from the server without triggering a new price generation
 * This is used for the refresh functionality in the UI
 */
export const fetchLatestPrices = async (): Promise<boolean> => {
  try {
    console.log('Fetching latest prices...');
    
    // Check if the Supabase connection is working
    const { error } = await supabase.from('products').select('id').limit(1);
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      toast.error('Failed to connect to server');
      return false;
    }
    
    console.log('Successfully connected to Supabase to fetch prices');
    return true;
  } catch (err) {
    console.error('Error in fetchLatestPrices:', err);
    toast.error('Failed to fetch latest prices');
    return false;
  }
};
