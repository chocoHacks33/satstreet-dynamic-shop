
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
