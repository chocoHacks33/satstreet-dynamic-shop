
import { ArrowUp, ArrowDown } from 'lucide-react';

interface PriceIndicatorProps {
  priceInSats: number;
  priceChangePercentage: number;
  size?: 'sm' | 'md' | 'lg';
}

const PriceIndicator = ({ 
  priceInSats, 
  priceChangePercentage, 
  size = 'md' 
}: PriceIndicatorProps) => {
  const isPositive = priceChangePercentage >= 0;
  const absChange = Math.abs(priceChangePercentage);
  
  // Color intensity based on the percentage change
  const getColorIntensity = () => {
    if (absChange < 1) return 'text-muted-foreground';
    if (absChange < 3) return isPositive ? 'text-green-600' : 'text-red-600';
    if (absChange < 5) return isPositive ? 'text-green-700' : 'text-red-700';
    return isPositive ? 'text-green-800' : 'text-red-800';
  };

  const iconSize = {
    sm: 14,
    md: 16,
    lg: 20
  }[size];

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];

  const Arrow = isPositive ? ArrowUp : ArrowDown;
  
  return (
    <div className={`flex items-center ${getColorIntensity()}`}>
      <span className={`font-mono font-medium ${textSizeClasses}`}>
        {priceInSats.toLocaleString()} XRP
      </span>
      <div className="flex items-center ml-2">
        <Arrow size={iconSize} className="mr-1" />
        <span className={`${textSizeClasses}`}>{absChange.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export default PriceIndicator;
