
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProducts, Product } from '@/services/api';
import { useRefreshData } from '@/hooks/useRefreshData';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from "sonner";

const Index = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Fetch products with react-query
  const { 
    data: products, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });
  
  // Set up automatic refresh - shorter interval for demo purposes (30 seconds)
  const { 
    isRefreshing, 
    formattedTimeUntilRefresh,
    refreshData
  } = useRefreshData({
    onRefresh: () => {
      refetch();
      toast.success("Prices updated!", {
        description: "Latest market data has been fetched",
      });
    },
    intervalMs: 30000 // 30 seconds for demo purposes
  });
  
  // Filter products whenever search query or products change
  useEffect(() => {
    if (!products) return;
    
    if (!searchQuery) {
      setFilteredProducts(products);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(query) || 
      product.description.toLowerCase().includes(query) ||
      product.shopName.toLowerCase().includes(query)
    );
    
    setFilteredProducts(filtered);
  }, [products, searchQuery]);
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Loading products...
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-satstreet-light rounded-lg overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-red-500">
              Error Loading Products
            </h1>
            <p className="mb-6 text-muted-foreground">
              Sorry, we couldn't load the product catalog. Please try again later.
            </p>
            <button 
              onClick={() => refreshData()} 
              className="bg-bitcoin hover:bg-bitcoin-dark text-white px-4 py-2 rounded-md"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {searchQuery 
              ? `Search results for "${searchQuery}"` 
              : 'Explore Bitcoin Products'}
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {filteredProducts.length} products available 
              {searchQuery ? ` for "${searchQuery}"` : ''}
            </p>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span>
                Prices update in: {formattedTimeUntilRefresh}
              </span>
              <button 
                onClick={() => refreshData()}
                className={`rounded-full p-1 hover:bg-satstreet-light transition-all ${isRefreshing ? 'animate-spin text-bitcoin' : ''}`}
                title="Refresh now"
              >
                ⟳
              </button>
            </div>
          </div>
        </div>
        
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium mb-2">No products found</h2>
            <p className="text-muted-foreground">
              Try searching for something else or check back later.
            </p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
