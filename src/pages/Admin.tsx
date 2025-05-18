
import React from 'react';
import { triggerPriceUpdate } from '@/services/priceService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Admin = () => {
  const [isUpdating, setIsUpdating] = React.useState(false);
  
  const handleUpdatePrices = async () => {
    setIsUpdating(true);
    try {
      await triggerPriceUpdate();
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Price Management</CardTitle>
              <CardDescription>
                Manually trigger price updates for all products
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This will generate new prices for all products based on market conditions 
                and record them in the price history.
              </p>
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={handleUpdatePrices}
                disabled={isUpdating}
                className="w-full"
              >
                {isUpdating ? 'Updating Prices...' : 'Update All Prices Now'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Admin;
