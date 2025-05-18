
import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Zap, AlertCircle, TrendingUp, Timer, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PriceHistoryEntry } from '@/services/api';

interface PriceFormulaProps {
  currentPrice: number;
  historyEntry?: PriceHistoryEntry;
  productId: string;
  onChartPointSelected?: (entry: PriceHistoryEntry) => void;
}

// Mock coefficients - in a real app these would be retrieved from an ML model
const mockCoefficients = {
  alpha: 0.35,
  beta: 0.25,
  gamma: 0.15,
  delta: 0.05
};

interface PriceComponents {
  basePrice: number;
  lightningDemand: number;
  inventoryFactor: number;
  timeEvent: number;
  loyaltyDiscount: number;
}

const PriceFormula: React.FC<PriceFormulaProps> = ({ 
  currentPrice, 
  historyEntry, 
  productId,
  onChartPointSelected
}) => {
  // Calculate mock values for each component of the formula
  const calculateComponents = (): PriceComponents => {
    // In a real implementation, these would be actual values from your backend
    const basePrice = Math.floor(currentPrice * 0.7);
    
    // Generate values that sum up to the remaining price amount
    const remaining = currentPrice - basePrice;
    
    // Use the explanation to choose which component to emphasize
    const explanation = historyEntry?.explanation || '';
    
    let lightningDemand = Math.floor(remaining * mockCoefficients.alpha);
    let inventoryFactor = Math.floor(remaining * mockCoefficients.beta);
    let timeEvent = Math.floor(remaining * mockCoefficients.gamma);
    let loyaltyDiscount = Math.floor(remaining * mockCoefficients.delta);
    
    // Emphasize different factors based on the explanation
    if (explanation.includes("demand")) {
      lightningDemand += 300;
    } else if (explanation.includes("inventory") || explanation.includes("supply")) {
      inventoryFactor += 300;
    } else if (explanation.includes("event") || explanation.includes("launch")) {
      timeEvent += 300;
    }
    
    // Ensure total adds up to current price
    const calculated = basePrice + lightningDemand + inventoryFactor + timeEvent - loyaltyDiscount;
    const diff = currentPrice - calculated;
    lightningDemand += diff;
    
    return {
      basePrice,
      lightningDemand,
      inventoryFactor,
      timeEvent, 
      loyaltyDiscount
    };
  };
  
  const [components, setComponents] = useState<PriceComponents>(calculateComponents());
  
  // Update components when price or history entry changes
  useEffect(() => {
    setComponents(calculateComponents());
  }, [currentPrice, historyEntry]);
  
  // Animated values
  const animatedBase = useSpring({
    number: components.basePrice,
    from: { number: 0 },
    config: { tension: 80, friction: 14 }
  });
  
  const animatedLightning = useSpring({
    number: components.lightningDemand,
    from: { number: 0 },
    config: { tension: 80, friction: 14 }
  });
  
  const animatedInventory = useSpring({
    number: components.inventoryFactor,
    from: { number: 0 },
    config: { tension: 80, friction: 14 }
  });
  
  const animatedTimeEvent = useSpring({
    number: components.timeEvent,
    from: { number: 0 },
    config: { tension: 80, friction: 14 }
  });
  
  const animatedDiscount = useSpring({
    number: components.loyaltyDiscount,
    from: { number: 0 },
    config: { tension: 80, friction: 14 }
  });
  
  const animatedTotal = useSpring({
    number: currentPrice,
    from: { number: 0 },
    config: { tension: 80, friction: 14 }
  });

  return (
    <TooltipProvider>
      <div className="bg-satstreet-medium p-5 rounded-lg border border-satstreet-light">
        <h3 className="font-semibold mb-4 text-lg flex items-center">
          <span className="mr-2">Pricing Logic</span>
          <HoverCard>
            <HoverCardTrigger asChild>
              <span className="cursor-help">
                <AlertCircle size={16} className="text-muted-foreground" />
              </span>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-satstreet-dark border-satstreet-light">
              <div className="text-sm">
                <p className="font-medium mb-2">How This Price Is Calculated</p>
                <p className="text-muted-foreground">
                  This breakdown shows you how the current price is determined based on 
                  market factors like demand, inventory levels, and special promotions.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </h3>
        
        <div className="font-mono text-base md:text-lg space-y-3">
          {/* Full Formula */}
          <div className="mb-4 font-medium text-center hidden md:block">
            P = B + α(DLN) + β(Sinv) + γ(Tevent) - δ(Ldiscount)
          </div>
          
          {/* Calculated Formula with Values */}
          <div className="flex flex-wrap items-center gap-y-2">
            <div className="font-medium mr-2 text-bitcoin">Price =</div>
            
            {/* Base Price */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="px-2 py-1 mr-1 rounded-md bg-satstreet-dark border border-satstreet-light inline-flex items-center">
                  <animated.div>
                    {animatedBase.number.to(n => Math.floor(n).toLocaleString())}
                  </animated.div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-satstreet-dark border-satstreet-light">
                <p>Base price (starting value)</p>
              </TooltipContent>
            </Tooltip>
            
            <div className="mr-1">+</div>
            
            {/* Lightning Demand */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="group relative">
                  <Link 
                    to={`/lightning/${productId}`}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="px-2 py-1 mr-1 rounded-md bg-satstreet-dark border border-bitcoin/30 inline-flex items-center hover:border-bitcoin transition-colors"
                  >
                    <span className="mr-1 text-xs text-bitcoin">{mockCoefficients.alpha}</span>
                    <span className="mr-1">(</span>
                    <animated.div>
                      {animatedLightning.number.to(n => Math.floor(n).toLocaleString())}
                    </animated.div>
                    <span className="ml-1">)</span>
                    <Zap size={12} className="ml-1 text-bitcoin" />
                  </Link>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-satstreet-dark border-satstreet-light">
                <div className="space-y-2">
                  <p>Market demand from Lightning Network activity</p>
                  <p className="text-xs text-muted-foreground">Click to view transactions in new tab</p>
                </div>
              </TooltipContent>
            </Tooltip>
            
            <div className="mr-1">+</div>
            
            {/* Inventory */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="px-2 py-1 mr-1 rounded-md bg-satstreet-dark border border-blue-500/30 inline-flex items-center">
                  <span className="mr-1 text-xs text-blue-400">{mockCoefficients.beta}</span>
                  <span className="mr-1">(</span>
                  <animated.div>
                    {animatedInventory.number.to(n => Math.floor(n).toLocaleString())}
                  </animated.div>
                  <span className="ml-1">)</span>
                  <TrendingUp size={12} className="ml-1 text-blue-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-satstreet-dark border-satstreet-light">
                <p>Supply adjustment based on current inventory levels</p>
              </TooltipContent>
            </Tooltip>
            
            <div className="mr-1">+</div>
            
            {/* Time Event */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="px-2 py-1 mr-1 rounded-md bg-satstreet-dark border border-purple-500/30 inline-flex items-center">
                  <span className="mr-1 text-xs text-purple-400">{mockCoefficients.gamma}</span>
                  <span className="mr-1">(</span>
                  <animated.div>
                    {animatedTimeEvent.number.to(n => Math.floor(n).toLocaleString())}
                  </animated.div>
                  <span className="ml-1">)</span>
                  <Timer size={12} className="ml-1 text-purple-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-satstreet-dark border-satstreet-light">
                <p>Seasonal factors and special events that affect pricing</p>
              </TooltipContent>
            </Tooltip>
            
            <div className="mr-1">-</div>
            
            {/* Loyalty Discount */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="px-2 py-1 mr-1 rounded-md bg-satstreet-dark border border-red-500/30 inline-flex items-center">
                  <span className="mr-1 text-xs text-red-400">{mockCoefficients.delta}</span>
                  <span className="mr-1">(</span>
                  <animated.div>
                    {animatedDiscount.number.to(n => Math.floor(n).toLocaleString())}
                  </animated.div>
                  <span className="ml-1">)</span>
                  <Heart size={12} className="ml-1 text-red-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-satstreet-dark border-satstreet-light">
                <p>Available discounts and promotional offers</p>
              </TooltipContent>
            </Tooltip>
            
            <div className="ml-2 mr-2">=</div>
            
            {/* Final Price */}
            <div className="px-3 py-1 rounded-md bg-bitcoin/20 border border-bitcoin font-bold inline-flex items-center">
              <animated.div>
                {animatedTotal.number.to(n => Math.floor(n).toLocaleString())}
              </animated.div>
              <span className="ml-1">sats</span>
            </div>
          </div>
        </div>
        
        {/* Explanation */}
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            {historyEntry?.explanation || 
             'Current price is determined by market demand and Bitcoin exchange rate fluctuations.'}
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PriceFormula;
