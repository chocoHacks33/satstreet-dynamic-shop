
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// XRP testnet API endpoints
const XRPL_TESTNET_API = "https://s.altnet.rippletest.net:51234";
const BITHOMP_API = "https://test.bithomp.com/api/v2";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle different XRP-related actions
    switch (action) {
      case 'getWalletInfo':
        return handleGetWalletInfo(payload, supabase);
      
      case 'generateAddress':
        return handleGenerateAddress(payload, supabase);
      
      case 'createTransaction':
        return handleCreateTransaction(payload, supabase);
        
      case 'verifyTransaction':
        return handleVerifyTransaction(payload, supabase);
        
      case 'getTestnetFaucet':
        return handleGetTestnetFaucet(payload);
        
      case 'getBalanceFromAddress':
        return handleGetBalanceFromAddress(payload);
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Get wallet information including balance and transactions
async function handleGetWalletInfo(payload: any, supabase: any) {
  const { userId } = payload;
  
  try {
    // Get user's wallet address from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('xrp_address, wallet_balance')
      .eq('id', userId)
      .single();
    
    if (profileError) throw profileError;
    
    // If user has no XRP address yet, generate one
    if (!profileData.xrp_address) {
      // Generate a testnet address (in real app, would use XRP wallet derivation)
      const testnetAddress = `r${Array.from({length: 25}, () => "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[Math.floor(Math.random() * 58)]).join('')}`;
      
      // Update user profile with the new address
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ xrp_address: testnetAddress })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      profileData.xrp_address = testnetAddress;
    }
    
    // Get mock transaction history
    const recentTransactions = await getMockTransactions(profileData.xrp_address, 5);
    
    return new Response(
      JSON.stringify({
        address: profileData.xrp_address,
        balance: profileData.wallet_balance || 0,
        balanceXRP: ((profileData.wallet_balance || 0) / 1000000).toFixed(6),
        transactions: recentTransactions,
        network: 'testnet'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting wallet info:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Generate a new XRP testnet address
async function handleGenerateAddress(payload: any, supabase: any) {
  const { userId, forShop } = payload;
  
  try {
    // Generate a testnet address
    const testnetAddress = `r${Array.from({length: 25}, () => "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[Math.floor(Math.random() * 58)]).join('')}`;
    
    if (forShop) {
      // If generating for a shop, update seller_shops table
      const { data: shopData, error: shopError } = await supabase
        .from('seller_shops')
        .update({ public_xrp_address: testnetAddress })
        .eq('owner_id', userId)
        .select()
        .single();
        
      if (shopError) throw shopError;
      
      return new Response(
        JSON.stringify({ 
          address: testnetAddress,
          shopId: shopData.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // If generating for a user, update profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ xrp_address: testnetAddress })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      return new Response(
        JSON.stringify({ address: testnetAddress }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error generating address:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Create a simulated XRP transaction for purchases
async function handleCreateTransaction(payload: any, supabase: any) {
  const { 
    userId, 
    productId, 
    amount, // in drops (1 XRP = 1,000,000 drops)
    recipientAddress,
    shopId
  } = payload;
  
  try {
    // Get user's wallet balance
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();
      
    if (userError) throw userError;
    
    const amountInDrops = amount * 1000000; // Convert XRP to drops
    
    // Check if user has enough balance
    if (userData.wallet_balance < amountInDrops) {
      return new Response(
        JSON.stringify({ error: 'Insufficient balance', code: 'INSUFFICIENT_FUNDS' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate a random transaction hash for the testnet transaction
    const txHash = Array.from({length: 64}, () => "0123456789ABCDEF"[Math.floor(Math.random() * 16)]).join('');
    
    // Update user's balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ wallet_balance: userData.wallet_balance - amountInDrops })
      .eq('id', userId);
      
    if (updateError) throw updateError;
    
    // Record transaction in xrp_transactions table
    const { error: txError } = await supabase
      .from('xrp_transactions')
      .insert({
        user_id: userId,
        product_id: productId,
        shop_id: shopId,
        amount: amountInDrops,
        tx_hash: txHash,
        status: 'confirmed',
        type: 'purchase',
        recipient_address: recipientAddress
      });
      
    if (txError) {
      console.error('Error recording transaction:', txError);
      // If transaction record fails, revert the balance change
      await supabase
        .from('profiles')
        .update({ wallet_balance: userData.wallet_balance })
        .eq('id', userId);
        
      throw txError;
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        txHash: txHash,
        amount: amountInDrops,
        balanceAfter: userData.wallet_balance - amountInDrops
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating transaction:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Verify an XRP transaction's status
async function handleVerifyTransaction(payload: any, supabase: any) {
  const { txHash } = payload;
  
  try {
    const { data: txData, error: txError } = await supabase
      .from('xrp_transactions')
      .select('*')
      .eq('tx_hash', txHash)
      .single();
      
    if (txError) {
      // If transaction not found, simulate ledger API call
      const simulatedResponse = {
        confirmed: Math.random() > 0.3, // 70% chance of being confirmed
        confirmations: Math.floor(Math.random() * 10),
        ledger_index: Math.floor(Date.now() / 1000 / 4), // Rough ledger estimate
        time: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 3600)
      };
      
      return new Response(
        JSON.stringify(simulatedResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({
        confirmed: txData.status === 'confirmed',
        confirmations: txData.status === 'confirmed' ? 10 : Math.floor(Math.random() * 5),
        ledger_index: Math.floor(Date.now() / 1000 / 4),
        time: Math.floor(new Date(txData.created_at).getTime() / 1000)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Request testnet XRP from a faucet (simulated)
async function handleGetTestnetFaucet(payload: any) {
  const { address } = payload;
  
  try {
    return new Response(
      JSON.stringify({
        success: true,
        txHash: Array.from({length: 64}, () => "0123456789ABCDEF"[Math.floor(Math.random() * 16)]).join(''),
        amount: 1000000, // 1 XRP in drops
        message: 'Testnet XRP has been sent to your address'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error requesting from faucet:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Get balance from an XRP address
async function handleGetBalanceFromAddress(payload: any) {
  const { address } = payload;
  
  try {
    return new Response(
      JSON.stringify({
        address: address,
        balance: Math.floor(Math.random() * 10000000), // Random drops amount
        txCount: Math.floor(Math.random() * 20)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting balance:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Helper function to generate mock XRP transactions
async function getMockTransactions(address: string, count: number = 5) {
  const transactions = [];
  const currentTime = Date.now();
  
  for (let i = 0; i < count; i++) {
    const isIncoming = Math.random() > 0.5;
    const amount = Math.floor(Math.random() * 10000000) + 100000; // Between 0.1 and 10 XRP in drops
    
    transactions.push({
      txid: Array.from({length: 64}, () => "0123456789ABCDEF"[Math.floor(Math.random() * 16)]).join(''),
      type: isIncoming ? 'received' : 'sent',
      amount: isIncoming ? amount : -amount,
      confirmations: Math.floor(Math.random() * 20) + 1,
      time: new Date(currentTime - (i * 86400000 * Math.random())).toISOString(),
      otherAddress: `r${Array.from({length: 25}, () => "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[Math.floor(Math.random() * 58)]).join('')}`,
    });
  }
  
  return transactions;
}
