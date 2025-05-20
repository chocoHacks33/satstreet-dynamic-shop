
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  ShoppingBag, 
  Package, 
  Store, 
  Plus, 
  ExternalLink, 
  Edit, 
  Coins,
  AlertTriangle,
  Check
} from 'lucide-react';
import { 
  getSellerShops, 
  createShop, 
  getSellerProducts, 
  createProduct, 
  updateProduct,
  declareStock,
  getProductDeclarations,
  Shop,
  Product,
  ProductDeclaration
} from '@/services/api';

const SellerDashboard = () => {
  const { user, isAuthenticated, isSeller } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const [declarations, setDeclarations] = useState<Record<string, ProductDeclaration[]>>({});

  // New shop form state
  const [newShopName, setNewShopName] = useState<string>('');
  const [newShopDescription, setNewShopDescription] = useState<string>('');
  const [newShopBtcAddress, setNewShopBtcAddress] = useState<string>('');
  const [isCreatingShop, setIsCreatingShop] = useState<boolean>(false);

  // New product form state
  const [newProductName, setNewProductName] = useState<string>('');
  const [newProductDescription, setNewProductDescription] = useState<string>('');
  const [newProductPrice, setNewProductPrice] = useState<string>('');
  const [newProductStock, setNewProductStock] = useState<string>('');
  const [isCreatingProduct, setIsCreatingProduct] = useState<boolean>(false);

  // Stock declaration state
  const [declaringStock, setDeclaringStock] = useState<boolean>(false);
  const [productToUpdate, setProductToUpdate] = useState<Product | null>(null);
  const [newStockCount, setNewStockCount] = useState<string>('');

  // Redirect if not authenticated or not a seller
  useEffect(() => {
    if (isAuthenticated === false) {
      navigate('/login');
      return;
    }

    if (isAuthenticated && !isSeller) {
      toast.error('You need to be a seller to access this page');
      navigate('/');
    }
  }, [isAuthenticated, isSeller, navigate]);

  // Load seller data
  useEffect(() => {
    const loadSellerData = async () => {
      if (!isAuthenticated || !isSeller) return;
      
      setIsLoading(true);
      try {
        const shopData = await getSellerShops();
        setShops(shopData);
        
        if (shopData.length > 0) {
          const firstShop = shopData[0];
          setActiveShop(firstShop);
          
          // Load products for the first shop
          const productsData = await getSellerProducts(firstShop.id);
          setProducts(productsData);
          
          // Load declarations for each product
          const declarationsMap: Record<string, ProductDeclaration[]> = {};
          for (const product of productsData) {
            const productDeclarations = await getProductDeclarations(product.id);
            declarationsMap[product.id] = productDeclarations;
          }
          setDeclarations(declarationsMap);
        }
      } catch (error) {
        console.error('Error loading seller data:', error);
        toast.error('Failed to load seller data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSellerData();
  }, [isAuthenticated, isSeller]);

  const handleCreateShop = async () => {
    if (!newShopName) {
      toast.error('Shop name is required');
      return;
    }

    setIsCreatingShop(true);
    try {
      const shop = await createShop({
        shopName: newShopName,
        description: newShopDescription,
        publicBitcoinAddress: newShopBtcAddress
      });

      if (shop) {
        setShops([...shops, shop]);
        setActiveShop(shop);
        setProducts([]);
        setNewShopName('');
        setNewShopDescription('');
        setNewShopBtcAddress('');
        toast.success('Shop created successfully');
      } else {
        toast.error('Failed to create shop');
      }
    } catch (error) {
      console.error('Error creating shop:', error);
      toast.error('Failed to create shop');
    } finally {
      setIsCreatingShop(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!activeShop) {
      toast.error('Please select a shop first');
      return;
    }

    if (!newProductName || !newProductPrice) {
      toast.error('Product name and price are required');
      return;
    }

    const priceInSats = parseInt(newProductPrice);
    const stockCount = parseInt(newProductStock || '10');

    if (isNaN(priceInSats) || priceInSats <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsCreatingProduct(true);
    try {
      const product = await createProduct({
        name: newProductName,
        description: newProductDescription,
        priceInSats,
        shopName: activeShop.shopName,
        shopId: activeShop.id,
        stockCount
      });

      if (product) {
        setProducts([...products, product]);
        setNewProductName('');
        setNewProductDescription('');
        setNewProductPrice('');
        setNewProductStock('');
        toast.success('Product created successfully');
      } else {
        toast.error('Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const handleDeclareStock = async () => {
    if (!productToUpdate) {
      toast.error('No product selected');
      return;
    }

    const stockCount = parseInt(newStockCount);
    if (isNaN(stockCount) || stockCount < 0) {
      toast.error('Please enter a valid stock count');
      return;
    }

    setDeclaringStock(true);
    try {
      const declaration = await declareStock(productToUpdate.id, stockCount);
      
      if (declaration) {
        // Update the product in the list
        const updatedProducts = products.map(p => 
          p.id === productToUpdate.id ? { ...p, stockCount } : p
        );
        setProducts(updatedProducts);
        
        // Update declarations list
        const currentDeclarations = declarations[productToUpdate.id] || [];
        setDeclarations({
          ...declarations,
          [productToUpdate.id]: [declaration, ...currentDeclarations]
        });
        
        setProductToUpdate(null);
        setNewStockCount('');
        toast.success('Stock declared successfully');
        
        // Show blockchain submission toast
        toast.info('Submitting stock declaration to Bitcoin blockchain...', {
          duration: 4000,
        });
        
        // After 5 seconds, show confirmation toast to simulate blockchain confirmation
        setTimeout(() => {
          toast.success('Stock declaration confirmed on Bitcoin blockchain', {
            duration: 5000,
          });
        }, 5000);
      } else {
        toast.error('Failed to declare stock');
      }
    } catch (error) {
      console.error('Error declaring stock:', error);
      toast.error('Failed to declare stock');
    } finally {
      setDeclaringStock(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bitcoin mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading seller dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Seller Dashboard</h1>
              <p className="text-muted-foreground">Manage your shops and products</p>
            </div>

            <div className="space-y-2">
              <Button 
                variant={activeTab === "overview" ? "default" : "ghost"}
                className={`w-full justify-start ${activeTab === "overview" ? "bg-bitcoin hover:bg-bitcoin-dark" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                <Store className="mr-2 h-4 w-4" />
                Overview
              </Button>
              
              <Button 
                variant={activeTab === "products" ? "default" : "ghost"}
                className={`w-full justify-start ${activeTab === "products" ? "bg-bitcoin hover:bg-bitcoin-dark" : ""}`}
                onClick={() => setActiveTab("products")}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Products
              </Button>
              
              <Button 
                variant={activeTab === "inventory" ? "default" : "ghost"}
                className={`w-full justify-start ${activeTab === "inventory" ? "bg-bitcoin hover:bg-bitcoin-dark" : ""}`}
                onClick={() => setActiveTab("inventory")}
              >
                <Package className="mr-2 h-4 w-4" />
                Inventory
              </Button>
              
              <Button 
                variant={activeTab === "earnings" ? "default" : "ghost"}
                className={`w-full justify-start ${activeTab === "earnings" ? "bg-bitcoin hover:bg-bitcoin-dark" : ""}`}
                onClick={() => setActiveTab("earnings")}
              >
                <Coins className="mr-2 h-4 w-4" />
                Earnings
              </Button>
            </div>
            
            {shops.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-medium mb-2">Your Shops</h3>
                <div className="space-y-1">
                  {shops.map(shop => (
                    <Button 
                      key={shop.id}
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start ${activeShop?.id === shop.id ? 'bg-satstreet-light' : ''}`}
                      onClick={() => setActiveShop(shop)}
                    >
                      {shop.shopName}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {shops.length === 0 && (
              <div className="mt-8">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Get Started</CardTitle>
                    <CardDescription>Create your first shop to begin selling</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full bg-bitcoin hover:bg-bitcoin-dark"
                      onClick={() => setActiveTab("overview")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Shop
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Shop Overview</h2>
                
                {activeShop ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>{activeShop.shopName}</CardTitle>
                      <CardDescription>
                        {activeShop.description || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium">Shop Statistics</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                            <div className="bg-satstreet-light p-4 rounded-lg">
                              <p className="text-sm text-muted-foreground">Total Products</p>
                              <p className="text-2xl font-bold">
                                {products.filter(p => p.shopId === activeShop.id).length}
                              </p>
                            </div>
                            <div className="bg-satstreet-light p-4 rounded-lg">
                              <p className="text-sm text-muted-foreground">Total Stock</p>
                              <p className="text-2xl font-bold">
                                {products
                                  .filter(p => p.shopId === activeShop.id)
                                  .reduce((sum, p) => sum + p.stockCount, 0)}
                              </p>
                            </div>
                            <div className="bg-satstreet-light p-4 rounded-lg">
                              <p className="text-sm text-muted-foreground">Bitcoin Address</p>
                              <p className="text-xs font-mono truncate">
                                {activeShop.publicBitcoinAddress || 'Not set'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="default" 
                        onClick={() => setActiveTab("products")}
                        className="bg-bitcoin hover:bg-bitcoin-dark"
                      >
                        Manage Products
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Create New Shop</CardTitle>
                      <CardDescription>
                        Set up your shop to start selling on SatStreet
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="shop-name">Shop Name</Label>
                          <Input 
                            id="shop-name" 
                            value={newShopName} 
                            onChange={(e) => setNewShopName(e.target.value)}
                            placeholder="My Amazing Shop" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shop-description">Description</Label>
                          <Textarea 
                            id="shop-description"
                            value={newShopDescription}
                            onChange={(e) => setNewShopDescription(e.target.value)}
                            placeholder="Describe what you sell..."
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="btc-address">Bitcoin Address (Optional)</Label>
                          <Input 
                            id="btc-address" 
                            value={newShopBtcAddress}
                            onChange={(e) => setNewShopBtcAddress(e.target.value)}
                            placeholder="Your BTC address for payments" 
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={handleCreateShop}
                        className="bg-bitcoin hover:bg-bitcoin-dark"
                        disabled={isCreatingShop}
                      >
                        {isCreatingShop ? 'Creating...' : 'Create Shop'}
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                {activeShop && products.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-medium mb-4">Recent Products</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products
                        .filter(p => p.shopId === activeShop.id)
                        .slice(0, 3)
                        .map(product => (
                          <Card key={product.id}>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">{product.name}</CardTitle>
                              <CardDescription className="text-xs line-clamp-2">
                                {product.description || 'No description'}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between">
                                <div>
                                  <p className="text-sm text-muted-foreground">Price</p>
                                  <p className="font-mono">{product.priceInSats.toLocaleString()} sats</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Stock</p>
                                  <p>{product.stockCount}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Products</h2>
                  
                  {activeShop && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-bitcoin hover:bg-bitcoin-dark">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Product
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Product</DialogTitle>
                          <DialogDescription>
                            Add a new product to your shop
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="product-name">Product Name</Label>
                            <Input 
                              id="product-name" 
                              value={newProductName}
                              onChange={(e) => setNewProductName(e.target.value)}
                              placeholder="Product Name" 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="product-description">Description</Label>
                            <Textarea 
                              id="product-description"
                              value={newProductDescription}
                              onChange={(e) => setNewProductDescription(e.target.value)}
                              placeholder="Product description..."
                              rows={3}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="product-price">Price (sats)</Label>
                              <Input 
                                id="product-price"
                                type="number"
                                value={newProductPrice}
                                onChange={(e) => setNewProductPrice(e.target.value)}
                                placeholder="10000" 
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="product-stock">Initial Stock</Label>
                              <Input 
                                id="product-stock"
                                type="number"
                                value={newProductStock}
                                onChange={(e) => setNewProductStock(e.target.value)}
                                placeholder="10" 
                              />
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button 
                            onClick={handleCreateProduct}
                            className="bg-bitcoin hover:bg-bitcoin-dark"
                            disabled={isCreatingProduct}
                          >
                            {isCreatingProduct ? 'Creating...' : 'Create Product'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                {!activeShop && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Shop Selected</h3>
                      <p className="text-center text-muted-foreground mb-4">
                        Please create a shop or select an existing one to manage products
                      </p>
                      <Button 
                        onClick={() => setActiveTab("overview")}
                        className="bg-bitcoin hover:bg-bitcoin-dark"
                      >
                        Set Up Shop
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {activeShop && (
                  <>
                    {products.length === 0 ? (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <Package className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Products Yet</h3>
                          <p className="text-center text-muted-foreground mb-4">
                            You haven't created any products for {activeShop.shopName} yet
                          </p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="bg-bitcoin hover:bg-bitcoin-dark">
                                <Plus className="mr-2 h-4 w-4" />
                                Add First Product
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              {/* Same content as the Add Product dialog */}
                              <DialogHeader>
                                <DialogTitle>Create New Product</DialogTitle>
                                <DialogDescription>
                                  Add a new product to your shop
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="product-name">Product Name</Label>
                                  <Input 
                                    id="product-name" 
                                    value={newProductName}
                                    onChange={(e) => setNewProductName(e.target.value)}
                                    placeholder="Product Name" 
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="product-description">Description</Label>
                                  <Textarea 
                                    id="product-description"
                                    value={newProductDescription}
                                    onChange={(e) => setNewProductDescription(e.target.value)}
                                    placeholder="Product description..."
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="product-price">Price (sats)</Label>
                                    <Input 
                                      id="product-price"
                                      type="number"
                                      value={newProductPrice}
                                      onChange={(e) => setNewProductPrice(e.target.value)}
                                      placeholder="10000" 
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="product-stock">Initial Stock</Label>
                                    <Input 
                                      id="product-stock"
                                      type="number"
                                      value={newProductStock}
                                      onChange={(e) => setNewProductStock(e.target.value)}
                                      placeholder="10" 
                                    />
                                  </div>
                                </div>
                              </div>

                              <DialogFooter>
                                <Button 
                                  onClick={handleCreateProduct}
                                  className="bg-bitcoin hover:bg-bitcoin-dark"
                                  disabled={isCreatingProduct}
                                >
                                  {isCreatingProduct ? 'Creating...' : 'Create Product'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                      </Card>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Price (sats)</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.filter(p => p.shopId === activeShop.id).map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell>{product.priceInSats.toLocaleString()}</TableCell>
                              <TableCell>{product.stockCount}</TableCell>
                              <TableCell>
                                {new Date(product.priceHistory[0]?.timestamp || Date.now()).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => {
                                      // View detail
                                      navigate(`/product/${product.id}`);
                                    }}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => {
                                      // Edit product - placeholder for now
                                      toast.info('Edit functionality coming soon');
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Inventory Tab */}
            {activeTab === "inventory" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Inventory Management</h2>

                {!activeShop && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Shop Selected</h3>
                      <p className="text-center text-muted-foreground mb-4">
                        Please create a shop or select an existing one to manage inventory
                      </p>
                      <Button 
                        onClick={() => setActiveTab("overview")}
                        className="bg-bitcoin hover:bg-bitcoin-dark"
                      >
                        Set Up Shop
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {activeShop && products.length === 0 && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Products Yet</h3>
                      <p className="text-center text-muted-foreground mb-4">
                        You need to create products before you can manage inventory
                      </p>
                      <Button 
                        onClick={() => setActiveTab("products")}
                        className="bg-bitcoin hover:bg-bitcoin-dark"
                      >
                        Create Products
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {activeShop && products.length > 0 && (
                  <>
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle>Declare Stock on Bitcoin Blockchain</CardTitle>
                        <CardDescription>
                          Update product inventory and commit to the blockchain for transparency
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4 text-sm">
                          Declaring your stock on the blockchain creates transparent and verifiable inventory records that your customers can trust. Each declaration is recorded with a transaction on the Bitcoin blockchain.
                        </p>
                        
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Current Stock</TableHead>
                              <TableHead>Last Declaration</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {products.filter(p => p.shopId === activeShop.id).map((product) => {
                              const productDeclarations = declarations[product.id] || [];
                              const lastDeclaration = productDeclarations[0]; 
                              return (
                                <TableRow key={product.id}>
                                  <TableCell className="font-medium">{product.name}</TableCell>
                                  <TableCell>{product.stockCount}</TableCell>
                                  <TableCell>
                                    {lastDeclaration ? (
                                      <div className="flex items-center">
                                        <span className="mr-2">{lastDeclaration.declaredStock}</span>
                                        {lastDeclaration.blockchainTxStatus === 'confirmed' ? (
                                          <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                          <span className="text-xs text-yellow-500">Pending</span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">Never</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => {
                                            setProductToUpdate(product);
                                            setNewStockCount(product.stockCount.toString());
                                          }}
                                          className="text-xs"
                                        >
                                          Declare Stock
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Declare Stock on Blockchain</DialogTitle>
                                          <DialogDescription>
                                            Update stock count for {productToUpdate?.name}
                                          </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-4 py-4">
                                          <div className="space-y-2">
                                            <Label htmlFor="stock-count">Stock Count</Label>
                                            <Input 
                                              id="stock-count" 
                                              type="number"
                                              value={newStockCount}
                                              onChange={(e) => setNewStockCount(e.target.value)}
                                            />
                                          </div>
                                          
                                          <div className="rounded-md bg-satstreet-light p-4">
                                            <div className="flex">
                                              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                                              <div className="text-sm">
                                                <h4 className="font-medium">Important Information</h4>
                                                <p className="text-xs">
                                                  Declaring stock will update the inventory and create a permanent record on the Bitcoin blockchain. This is a transparent commitment to your customers about available stock.
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        <DialogFooter>
                                          <Button 
                                            onClick={handleDeclareStock}
                                            className="bg-bitcoin hover:bg-bitcoin-dark"
                                            disabled={declaringStock}
                                          >
                                            {declaringStock ? 'Processing...' : 'Confirm Declaration'}
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <h3 className="text-xl font-medium mb-4">Declaration History</h3>
                    
                    {Object.keys(declarations).length === 0 ? (
                      <p className="text-muted-foreground">No declarations yet</p>
                    ) : (
                      <Card>
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Stock Declared</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Transaction ID</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.entries(declarations).flatMap(([productId, productDeclarations]) => {
                                const product = products.find(p => p.id === productId);
                                if (!product) return [];
                                
                                return productDeclarations.map(declaration => (
                                  <TableRow key={declaration.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{declaration.declaredStock}</TableCell>
                                    <TableCell>
                                      {new Date(declaration.declarationDate).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        declaration.blockchainTxStatus === 'confirmed' 
                                          ? 'bg-green-500/10 text-green-500' 
                                          : 'bg-yellow-500/10 text-yellow-500'
                                      }`}>
                                        {declaration.blockchainTxStatus === 'confirmed' ? 'Confirmed' : 'Pending'}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      {declaration.blockchainTxId ? (
                                        <div className="flex items-center">
                                          <span className="text-xs font-mono truncate w-24">{declaration.blockchainTxId?.substring(0, 10)}...</span>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => {
                                              window.open(`https://btc.tokenview.io/en/tx/${declaration.blockchainTxId}`, '_blank');
                                            }}
                                            className="h-6 w-6 ml-1"
                                          >
                                            <ExternalLink className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">Processing...</span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ));
                              })}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Earnings Tab */}
            {activeTab === "earnings" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Earnings</h2>
                
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Wallet Balance</CardTitle>
                    <CardDescription>Your shop earnings in sats</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-mono">10,000 sats</div>
                    <p className="text-muted-foreground mt-2">Available for withdrawal</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="default"
                      className="bg-bitcoin hover:bg-bitcoin-dark"
                      onClick={() => toast.info('Withdrawal feature coming soon')}
                    >
                      Withdraw to Bitcoin Wallet
                    </Button>
                  </CardFooter>
                </Card>
                
                <h3 className="text-xl font-medium mb-4">Transaction History</h3>
                
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount (sats)</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>2025-05-19</TableCell>
                          <TableCell>Sale</TableCell>
                          <TableCell className="font-mono text-green-500">+10,000</TableCell>
                          <TableCell>Example Product</TableCell>
                          <TableCell>
                            <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs">
                              Completed
                            </span>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SellerDashboard;
