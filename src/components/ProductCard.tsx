
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PriceIndicator from './PriceIndicator';
import { Product } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  
  const handleViewProduct = () => {
    navigate(`/product/${product.id}`);
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
  };

  return (
    <Card 
      onClick={handleViewProduct}
      className="overflow-hidden border-satstreet-light hover:border-bitcoin/50 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-satstreet-medium"
    >
      <div className="aspect-square overflow-hidden bg-satstreet-dark/50">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{product.shopName}</div>
        <h3 className="font-medium text-lg mt-1">{product.name}</h3>
        <div className="mt-2">
          <PriceIndicator 
            priceInSats={product.priceInSats} 
            priceChangePercentage={product.priceChangePercentage}
          />
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewProduct}
          className="text-xs"
        >
          View Details
        </Button>
        <Button 
          variant="default" 
          size="sm"
          onClick={handleAddToCart}
          className="text-xs bg-bitcoin hover:bg-bitcoin-dark"
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
