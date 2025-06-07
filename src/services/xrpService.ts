
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Types for XRP-related data
 */
export interface XrpTransaction {
  txid: string;
  type: 'sent' | 'received';
  amount: number;
  confirmations: number;
  time: string;
  otherAddress: string;
}

export interface WalletInfo {
  address: string;
  balance: number;
  balanceXRP: string;
  transactions: XrpTransaction[];
  network: string;
}

/**
 * Get XRP wallet information for a user
 */
export const getWalletInfo = async (userId: string): Promise<WalletInfo | null> => {
  try {
    console.log('Fetching wallet info for user:', userId);
    
    const { data, error } = await supabase.functions.invoke('xrp-service', {
      body: {
        action: 'getWalletInfo',
        payload: { userId }
      }
    });
    
    if (error) {
      console.error('Error fetching wallet info:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Error in getWalletInfo:', err);
    return null;
  }
};

/**
 * Generate a new XRP testnet address
 */
export const generateAddress = async (userId: string, forShop: boolean = false): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('xrp-service', {
      body: {
        action: 'generateAddress',
        payload: { 
          userId,
          forShop
        }
      }
    });
    
    if (error) {
      console.error('Error generating address:', error);
      return null;
    }
    
    return data.address;
  } catch (err) {
    console.error('Error in generateAddress:', err);
    return null;
  }
};

/**
 * Create an XRP transaction for a purchase
 */
export const createTransaction = async (
  userId: string, 
  productId: string, 
  amount: number,
  shopId: string,
  recipientAddress: string
): Promise<{success: boolean, txHash?: string, error?: string}> => {
  try {
    const { data, error } = await supabase.functions.invoke('xrp-service', {
      body: {
        action: 'createTransaction',
        payload: { 
          userId,
          productId,
          amount,
          shopId,
          recipientAddress
        }
      }
    });
    
    if (error) {
      console.error('Error creating transaction:', error);
      return { success: false, error: error.message };
    }
    
    if (data.error) {
      return { success: false, error: data.error };
    }
    
    return { 
      success: true, 
      txHash: data.txHash 
    };
  } catch (err: any) {
    console.error('Error in createTransaction:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Verify the status of an XRP transaction
 */
export const verifyTransaction = async (txHash: string): Promise<{confirmed: boolean, confirmations: number}> => {
  try {
    const { data, error } = await supabase.functions.invoke('xrp-service', {
      body: {
        action: 'verifyTransaction',
        payload: { txHash }
      }
    });
    
    if (error) {
      console.error('Error verifying transaction:', error);
      return { confirmed: false, confirmations: 0 };
    }
    
    return {
      confirmed: data.confirmed,
      confirmations: data.confirmations
    };
  } catch (err) {
    console.error('Error in verifyTransaction:', err);
    return { confirmed: false, confirmations: 0 };
  }
};

/**
 * Request testnet XRP from a faucet
 */
export const requestFromFaucet = async (address: string): Promise<{success: boolean, message?: string}> => {
  try {
    const { data, error } = await supabase.functions.invoke('xrp-service', {
      body: {
        action: 'getTestnetFaucet',
        payload: { address }
      }
    });
    
    if (error) {
      console.error('Error requesting from faucet:', error);
      return { success: false };
    }
    
    toast.success('Testnet XRP requested successfully!');
    return {
      success: true,
      message: data.message
    };
  } catch (err) {
    console.error('Error in requestFromFaucet:', err);
    toast.error('Failed to request testnet XRP');
    return { success: false };
  }
};

/**
 * Get balance from an XRP address
 */
export const getBalanceFromAddress = async (address: string): Promise<{balance: number} | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('xrp-service', {
      body: {
        action: 'getBalanceFromAddress',
        payload: { address }
      }
    });
    
    if (error) {
      console.error('Error getting balance from address:', error);
      return null;
    }
    
    return {
      balance: data.balance
    };
  } catch (err) {
    console.error('Error in getBalanceFromAddress:', err);
    return null;
  }
};
