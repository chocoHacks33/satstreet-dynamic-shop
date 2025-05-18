
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getWalletInfo, getProductById, Product } from '@/services/api';
import { useRefreshData } from '@/hooks/useRefreshData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUp, ArrowDown, ShoppingCart, ExternalLink, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface WalletTransactionProps {
  id: string;
  type: 'deposit' | 'withdrawal' | 'purchase';
  amount: number;
  timestamp: string;
  description: string;
  productId?: string;
}

interface TransactionDetailsProps {
  transaction: WalletTransactionProps;
  onClose: () => void;
}

const TransactionDetails = ({ transaction, onClose }: TransactionDetailsProps) => {
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (transaction.type === 'purchase' && transaction.productId) {
        setIsLoading(true);
        try {
          const productData = await getProductById(transaction.productId);
          if (productData) {
            setProduct(productData);
          }
        } catch (error) {
          console.error('Error fetching product details:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProductDetails();
  }, [transaction]);

  const formatSats = (sats: number): string => {
    return new Intl.NumberFormat('en-US').format(Math.abs(sats));
  };

  const goToProduct = () => {
    if (product) {
      onClose();
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogDescription>
          {new Date(transaction.timestamp).toLocaleString()}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Type:</span>
          <span className="flex items-center">
            {transaction.type === 'deposit' && <ArrowUp className="w-4 h-4 mr-1 text-green-500" />}
            {transaction.type === 'withdrawal' && <ArrowDown className="w-4 h-4 mr-1 text-red-500" />}
            {transaction.type === 'purchase' && <ShoppingCart className="w-4 h-4 mr-1 text-blue-500" />}
            {transaction.type}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium">Amount:</span>
          <span className={transaction.amount > 0 ? "text-green-500" : "text-red-500"}>
            {transaction.amount > 0 ? "+" : "-"} {formatSats(transaction.amount)} sats
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium">Description:</span>
          <span>{transaction.description}</span>
        </div>
        
        {transaction.type === 'purchase' && transaction.productId && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Product Details:</h4>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            ) : product ? (
              <div className="bg-satstreet-dark p-3 rounded-md">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-16 w-16 rounded overflow-hidden">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium">{product.name}</h5>
                    <p className="text-sm text-muted-foreground">{product.shopName}</p>
                    <p className="text-sm">{formatSats(product.price)} sats</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 w-full flex items-center"
                  onClick={goToProduct}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View Product
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Product no longer available</p>
            )}
          </div>
        )}
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const AddFundsDialog = ({ onSuccess }: { onSuccess: () => void }) => {
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddFunds = () => {
    setIsLoading(true);
    
    // This is just a mock implementation as we don't have a real payment system
    setTimeout(() => {
      toast.success(`Added ${amount} sats to your wallet`);
      setIsLoading(false);
      setAmount('');
      onSuccess();
    }, 1000);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add Funds to Wallet</DialogTitle>
        <DialogDescription>
          Enter the amount in sats you want to add to your wallet
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">Amount (sats)</label>
          <Input
            id="amount"
            type="number"
            placeholder="10000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Note: This is a demo application. No actual funds will be transferred.</p>
        </div>
      </div>
      
      <DialogFooter>
        <Button 
          onClick={handleAddFunds}
          disabled={!amount || isLoading || parseInt(amount) <= 0}
          className="bg-bitcoin hover:bg-bitcoin-dark"
        >
          {isLoading ? 'Processing...' : 'Add Funds'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const Wallet = () => {
  const navigate = useNavigate();
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransactionProps | null>(null);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [walletInfo, setWalletInfo] = useState<{
    balance: number;
    publicKey: string;
    transactions: WalletTransactionProps[];
  }>({
    balance: 0,
    publicKey: '',
    transactions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchWalletInfo = async () => {
    setIsLoading(true);
    try {
      const walletData = await getWalletInfo();
      setWalletInfo(walletData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch wallet info');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWalletInfo();
  }, []);
  
  const { 
    isRefreshing, 
    formattedTimeUntilRefresh,
    refreshData
  } = useRefreshData({ 
    onRefresh: fetchWalletInfo,
    intervalMs: 60000 
  });

  const formatSats = (sats: number): string => {
    return new Intl.NumberFormat('en-US').format(sats);
  };

  const handleTransactionClick = (transaction: WalletTransactionProps) => {
    setSelectedTransaction(transaction);
    setIsTransactionDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Wallet</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-bitcoin hover:bg-bitcoin-dark">
                <Plus className="mr-2 h-4 w-4" /> Add Funds
              </Button>
            </DialogTrigger>
            <AddFundsDialog onSuccess={fetchWalletInfo} />
          </Dialog>
        </div>
        
        {isLoading ? (
          <>
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
          </>
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : (
          <>
            <div className="bg-satstreet-medium p-6 rounded-lg border border-satstreet-light mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Balance</h2>
                <div className="text-sm text-muted-foreground flex items-center">
                  <span>Next update in: {formattedTimeUntilRefresh}</span>
                  {isRefreshing && <span className="ml-2 animate-spin">⟳</span>}
                </div>
              </div>
              <p className="text-3xl font-bold">{formatSats(walletInfo.balance)} sats</p>
              <p className="text-sm text-muted-foreground mt-2">
                Public Key: {walletInfo.publicKey}
              </p>
            </div>
            
            <div className="bg-satstreet-medium p-6 rounded-lg border border-satstreet-light">
              <h2 className="text-xl font-semibold mb-4">Transactions</h2>
              {walletInfo.transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-satstreet-light">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-satstreet-light">
                      {walletInfo.transactions.map((transaction) => (
                        <tr 
                          key={transaction.id}
                          className="hover:bg-satstreet-dark/50 cursor-pointer transition-colors"
                          onClick={() => handleTransactionClick(transaction)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-foreground">
                              {transaction.type === 'deposit' && <ArrowUp className="inline-block w-4 h-4 mr-1 text-green-500" />}
                              {transaction.type === 'withdrawal' && <ArrowDown className="inline-block w-4 h-4 mr-1 text-red-500" />}
                              {transaction.type === 'purchase' && <ShoppingCart className="inline-block w-4 h-4 mr-1 text-blue-500" />}
                              {transaction.type}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-foreground">
                              {transaction.amount > 0 ? "+" : "-"} {formatSats(Math.abs(transaction.amount))} sats
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-foreground">{transaction.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-muted-foreground">
                              {new Date(transaction.timestamp).toLocaleString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No transactions found.</p>
              )}
            </div>
          </>
        )}
      </div>
      
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        {selectedTransaction && (
          <TransactionDetails 
            transaction={selectedTransaction}
            onClose={() => setIsTransactionDialogOpen(false)}
          />
        )}
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Wallet;
