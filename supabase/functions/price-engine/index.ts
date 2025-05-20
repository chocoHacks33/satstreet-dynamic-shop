
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// For real-world Bitcoin price data
const BITCOIN_PRICE_API = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define market factors that influence prices
interface MarketFactors {
  bitcoinPrice: number;        // Current BTC price in USD
  bitcoinVolatility: number;   // Recent price volatility (0-1)
  networkDemand: number;       // Lightning Network activity factor (0-1)
  marketSentiment: number;     // Overall market sentiment (-1 to 1)
  seasonalFactor: number;      // Seasonal adjustments (0.8-1.2)
  inventoryLevel: number;      // Product inventory level
  promotionActive: boolean;    // Whether a promotion is active
}

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
    
    // Handle different pricing actions
    switch (action) {
      case 'updateAllPrices':
        return await updateAllProductPrices(supabase);
      
      case 'updateProductPrice':
        return await updateProductPrice(payload, supabase);
        
      case 'getMarketFactors':
        return await getMarketFactors();
        
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

// Update prices for all products
async function updateAllProductPrices(supabase: any) {
  try {
    // Get market factors that will influence prices
    const marketFactors = await fetchMarketFactors();
    
    // Get all products from the database
    const { data: products, error } = await supabase
      .from('products')
      .select('*');
      
    if (error) throw error;
    
    // Update each product's price
    const priceUpdates = [];
    const historyEntries = [];
    
    for (const product of products) {
      // Calculate new price using market factors and product-specific attributes
      const { newPrice, explanation } = calculateProductPrice(product, marketFactors);
      
      // Prepare price update
      priceUpdates.push({
        id: product.id,
        price: newPrice,
        updated_at: new Date().toISOString()
      });
      
      // Prepare history entry
      historyEntries.push({
        product_id: product.id,
        price: newPrice,
        explanation: explanation,
        timestamp: new Date().toISOString()
      });
    }
    
    // Update product prices in batch
    const { error: updateError } = await supabase
      .from('products')
      .upsert(priceUpdates);
      
    if (updateError) throw updateError;
    
    // Insert price history entries in batch
    const { error: historyError } = await supabase
      .from('price_history')
      .insert(historyEntries);
      
    if (historyError) throw historyError;
    
    return new Response(
      JSON.stringify({
        success: true,
        updatedProducts: products.length,
        marketFactors: marketFactors,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating all prices:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Update price for a single product
async function updateProductPrice(payload: any, supabase: any) {
  const { productId } = payload;
  
  try {
    // Get market factors
    const marketFactors = await fetchMarketFactors();
    
    // Get the product from database
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
      
    if (error) throw error;
    
    // Calculate new price
    const { newPrice, explanation } = calculateProductPrice(product, marketFactors);
    
    // Update product price
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        price: newPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);
      
    if (updateError) throw updateError;
    
    // Insert price history entry
    const { error: historyError } = await supabase
      .from('price_history')
      .insert({
        product_id: productId,
        price: newPrice,
        explanation: explanation,
        timestamp: new Date().toISOString()
      });
      
    if (historyError) throw historyError;
    
    return new Response(
      JSON.stringify({
        success: true,
        product: product.name,
        oldPrice: product.price,
        newPrice: newPrice,
        explanation: explanation,
        marketFactors: marketFactors,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating product price:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Get current market factors
async function getMarketFactors() {
  try {
    const marketFactors = await fetchMarketFactors();
    
    return new Response(
      JSON.stringify(marketFactors),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting market factors:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Fetch real market factors from external APIs and internal calculations
async function fetchMarketFactors(): Promise<MarketFactors> {
  try {
    // Get real BTC price from CoinGecko API
    let bitcoinPrice = 30000; // Default fallback price
    try {
      const response = await fetch(BITCOIN_PRICE_API);
      const data = await response.json();
      if (data && data.bitcoin && data.bitcoin.usd) {
        bitcoinPrice = data.bitcoin.usd;
      }
    } catch (e) {
      console.error('Error fetching Bitcoin price:', e);
      // Continue with default price
    }
    
    // Calculate or simulate other market factors
    // In a real application, these could be derived from actual market data
    
    // Volatility: use random value but weight toward reality
    const bitcoinVolatility = Math.random() * 0.5 + 0.2; // 0.2 to 0.7
    
    // Network demand based on time of day and day of week
    const date = new Date();
    const hour = date.getUTCHours();
    const day = date.getUTCDay(); // 0 = Sunday
    
    // Higher demand during weekdays and business hours
    const isDuringBusinessHours = hour >= 13 && hour <= 21; // 9 AM to 5 PM EST
    const isWeekday = day >= 1 && day <= 5; // Monday to Friday
    const networkDemand = isDuringBusinessHours && isWeekday 
      ? 0.6 + Math.random() * 0.3 // Higher demand during business hours on weekdays
      : 0.3 + Math.random() * 0.3; // Lower demand otherwise
    
    // Market sentiment derived from price momentum
    // In a real app, this would use actual price data over time
    const marketSentiment = (Math.random() * 2 - 1); // -1 to 1
    
    // Seasonal factor based on month
    const month = date.getUTCMonth(); // 0-11
    // Higher demand in Q4 (holiday season)
    const seasonalFactor = month >= 9 && month <= 11 
      ? 1.0 + (Math.random() * 0.2) // 1.0 to 1.2 during Q4
      : 0.8 + (Math.random() * 0.3); // 0.8 to 1.1 rest of year
    
    // Inventory level - simulated
    const inventoryLevel = Math.floor(Math.random() * 100);
    
    // Random promotion
    const promotionActive = Math.random() > 0.8; // 20% chance of active promotion
    
    return {
      bitcoinPrice,
      bitcoinVolatility,
      networkDemand,
      marketSentiment,
      seasonalFactor,
      inventoryLevel,
      promotionActive
    };
  } catch (error) {
    console.error('Error fetching market factors:', error);
    
    // Return default values if there's an error
    return {
      bitcoinPrice: 30000,
      bitcoinVolatility: 0.3,
      networkDemand: 0.5,
      marketSentiment: 0,
      seasonalFactor: 1.0,
      inventoryLevel: 50,
      promotionActive: false
    };
  }
}

// Calculate new price for a product based on market factors
function calculateProductPrice(product: any, marketFactors: MarketFactors) {
  // Base price components in satoshis
  const basePriceSats = product.price * 0.7; // 70% of current price as base
  
  // Product-specific factors
  const productPopularity = Math.min(1, (product.stock_count > 0 ? 5 / product.stock_count : 0.1));
  const daysInInventory = Math.floor(Math.random() * 30); // Simulate days in inventory
  
  // Calculate price components
  const lightningDemandFactor = marketFactors.networkDemand * 0.35;
  const inventoryAdjustment = (1 - (daysInInventory / 30)) * 0.25;
  const marketSentimentImpact = marketFactors.marketSentiment * 0.15;
  const seasonalImpact = (marketFactors.seasonalFactor - 1) * 0.05;
  const promotionDiscount = marketFactors.promotionActive ? 0.05 : 0;
  
  // Calculate price change percentage
  const priceChangePercentage = 
    lightningDemandFactor +
    inventoryAdjustment + 
    marketSentimentImpact +
    seasonalImpact -
    promotionDiscount;
  
  // Apply price change to base price (limit to ±10% change)
  const limitedChangePercentage = Math.max(-0.1, Math.min(0.1, priceChangePercentage));
  const priceChange = basePriceSats * limitedChangePercentage;
  
  // Calculate new price in satoshis (ensuring minimum value)
  const newPrice = Math.max(1000, Math.round(product.price + priceChange));
  
  // Generate explanation for price change
  let explanation = '';
  if (newPrice > product.price) {
    explanation = `Price increased by ${((newPrice - product.price) / product.price * 100).toFixed(1)}%. `;
    
    // Add more specific explanations based on the factors
    if (lightningDemandFactor > 0.1) {
      explanation += 'High Lightning Network demand. ';
    }
    if (inventoryAdjustment > 0.05) {
      explanation += 'Low inventory levels. ';
    }
    if (marketSentimentImpact > 0) {
      explanation += 'Positive market sentiment. ';
    }
    if (seasonalImpact > 0) {
      explanation += 'Seasonal demand increase. ';
    }
  } else if (newPrice < product.price) {
    explanation = `Price decreased by ${((product.price - newPrice) / product.price * 100).toFixed(1)}%. `;
    
    if (lightningDemandFactor < -0.05) {
      explanation += 'Reduced Lightning Network activity. ';
    }
    if (inventoryAdjustment < -0.05) {
      explanation += 'High inventory levels. ';
    }
    if (marketSentimentImpact < 0) {
      explanation += 'Negative market sentiment. ';
    }
    if (marketFactors.promotionActive) {
      explanation += 'Promotional discount applied. ';
    }
  } else {
    explanation = 'Price remained stable. Market conditions balanced.';
  }
  
  // Add Bitcoin price reference
  explanation += `BTC: $${marketFactors.bitcoinPrice.toLocaleString()}`;
  
  return {
    newPrice,
    explanation
  };
}
