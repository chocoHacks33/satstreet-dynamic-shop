import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductById, getProductImages } from '@/services/api';
import { useRefreshData } from '@/hooks/useRefreshData';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PriceIndicator from '@/components/PriceIndicator';
import PriceFormula from '@/components/PriceFormula';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from "sonner";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { RefreshCw } from 'lucide-react';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const ChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-satstreet-medium p-4 border border-satstreet-light rounded-md shadow-lg">
        <p className="font-medium text-sm">
          {new Date(data.timestamp).toLocaleString()}
        </p>
        <p className="text-bitcoin font-mono font-bold mt-1">
          {data.price.toLocaleString()} sats
        </p>
        <p className="mt-2 text-xs text-muted-foreground max-w-60">
          {data.explanation}
        </p>
      </div>
    );
  }

  return null;
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [productImages, setProductImages] = useState<string[]>([]);
  
  // Fetch product details with react-query
  const { 
    data: product, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id || ''),
    enabled: !!id
  });
  
  // Fetch product images
  useEffect(() => {
    const loadImages = async () => {
      if (id) {
        const images = await getProductImages(id);
        if (images.length === 0) {
          // If no images, use the main product image or a placeholder
          setProductImages(product?.imageUrl ? [product.imageUrl] : ['/placeholder.svg']);
        } else {
          setProductImages(images);
        }
      }
    };
    
    loadImages();
  }, [id, product]);
  
  // Set up automatic refresh - modify the interval here (30000ms = 30 seconds)
  const { 
    isRefreshing,
    formattedTimeUntilRefresh,
    refreshData
  } = useRefreshData({
    onRefresh: () => {
      console.log('Refreshing product detail from ProductDetail page');
      refetch();
      toast.success("Price updated!", {
        description: "Latest market data has been fetched for this product",
      });
    },
    intervalMs: 300000 // Change this value to modify refresh interval in milliseconds
  });
  
  // Handle manual refresh
  const handleManualRefresh = () => {
    console.log('Manual refresh triggered from product detail');
    refreshData();
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-md" />
            <div>
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/4 mb-6" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-8" />
              <Skeleton className="h-64 w-full mb-6" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-red-500">
              Product Not Found
            </h1>
            <p className="mb-6 text-muted-foreground">
              Sorry, we couldn't find the product you're looking for.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-bitcoin hover:bg-bitcoin-dark"
            >
              Back to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Convert price history for the chart
  const chartData = product.priceHistory.map(entry => ({
    ...entry,
    date: new Date(entry.timestamp).toLocaleDateString()
  }));
  
  const handleAddToCart = () => {
    addItem(product);
  };
  
  // Get the latest price history entry
  const latestHistoryEntry = product.priceHistory.length > 0 
    ? product.priceHistory[product.priceHistory.length - 1] 
    : undefined;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="aspect-square overflow-hidden rounded-lg border border-satstreet-light bg-satstreet-dark/30">
              {productImages.length > 0 ? (
                <Carousel className="w-full">
                  <CarouselContent>
                    {productImages.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-square w-full">
                          <img 
                            src={image} 
                            alt={`${product.name} - image ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="-left-4 bg-satstreet-medium border-satstreet-light" />
                  <CarouselNext className="-right-4 bg-satstreet-medium border-satstreet-light" />
                </Carousel>
              ) : (
                <img 
                  src={product.imageUrl || '/placeholder.svg'} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {productImages.map((image, index) => (
                  <div 
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square cursor-pointer overflow-hidden rounded-md border ${
                      currentImageIndex === index 
                        ? 'border-bitcoin' 
                        : 'border-satstreet-light'
                    }`}
                  >
                    <img 
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">{product.name}</h1>
            </div>
            <p className="text-muted-foreground mb-4">{product.shopName}</p>
            
            <div className="mb-6">
              <PriceIndicator 
                priceInSats={product.priceInSats} 
                priceChangePercentage={product.priceChangePercentage}
                size="lg"
              />
              <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                <span>Next price update in: {formattedTimeUntilRefresh}</span>
                <Button
                  onClick={handleManualRefresh}
                  variant="ghost"
                  size="sm"
                  className={`p-1 rounded-full hover:bg-satstreet-light transition-all ${isRefreshing ? 'animate-spin text-bitcoin' : ''}`}
                  title="Refresh now"
                  disabled={isRefreshing}
                >
                  <RefreshCw size={14} />
                </Button>
              </div>
            </div>
            
            <p className="text-foreground mb-8">{product.description}</p>
            
            {/* Price History Chart */}
            <div className="mb-8 bg-satstreet-medium p-4 rounded-lg border border-satstreet-light">
              <h2 className="text-lg font-medium mb-4">Price History</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F7931A" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#F7931A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D3348" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF" 
                      tick={{fill: '#9CA3AF'}}
                    />
                    <YAxis 
                      stroke="#9CA3AF" 
                      tick={{fill: '#9CA3AF'}}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#F7931A" 
                      fillOpacity={1}
                      fill="url(#colorPrice)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Replace static explanation with animated price formula */}
            <div className="mb-8">
              <PriceFormula 
                currentPrice={product.priceInSats}
                historyEntry={latestHistoryEntry}
                productId={product.id}
              />
            </div>
            
            <Button 
              onClick={handleAddToCart}
              size="lg"
              className="w-full bg-bitcoin hover:bg-bitcoin-dark"
            >
              Add to Cart ({product.priceInSats.toLocaleString()} sats)
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
