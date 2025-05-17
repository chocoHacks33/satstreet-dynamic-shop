
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getWalletInfo, WalletTransaction } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const Wallet = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [copiedKey, setCopiedKey] = useState(false);

  // Fetch wallet info with react-query
  const { 
    data: walletInfo, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['wallet'],
    queryFn: getWalletInfo,
    enabled: isAuthenticated
  });

  // Handle unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex-grow flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-8">
            Please login to access your wallet
          </p>
          <Button 
            onClick={() => navigate('/login')}
            className="bg-bitcoin hover:bg-bitcoin-dark"
          >
            Login
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <h1 className="text-2xl font-bold mb-8">Your Wallet</h1>
          <div className="grid gap-8">
            <div className="bg-satstreet-medium p-6 rounded-lg border border-satstreet-light">
              <Skeleton className="h-8 w-1/4 mb-4" />
              <Skeleton className="h-6 w-full mb-6" />
              <Skeleton className="h-16 w-full" />
            </div>
            <div className="bg-satstreet-medium p-6 rounded-lg border border-satstreet-light">
              <Skeleton className="h-8 w-1/3 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full mr-4" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Handle error state
  if (error || !walletInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex-grow flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4 text-red-500">
            Could Not Load Wallet
          </h1>
          <p className="text-muted-foreground mb-8">
            Sorry, we couldn't access your wallet information
          </p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-bitcoin hover:bg-bitcoin-dark"
          >
            Back to Home
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletInfo.publicKey);
    setCopiedKey(true);
    toast({
      title: 'Public Key Copied',
      description: 'Your wallet address has been copied to clipboard',
    });
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Format transaction date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get appropriate icon for transaction type
  const getTransactionIcon = (type: WalletTransaction['type']): string => {
    switch (type) {
      case 'purchase': return '🛒';
      case 'deposit': return '⬇️';
      case 'withdrawal': return '⬆️';
      default: return '💰';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-2xl font-bold mb-8">Your Wallet</h1>
        
        <div className="grid gap-8">
          {/* Balance Card */}
          <div className="bg-satstreet-medium p-6 rounded-lg border border-satstreet-light">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Balance</h2>
              <span className="text-3xl font-mono text-bitcoin font-bold">
                {walletInfo.balance.toLocaleString()} sats
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Your Public Key</p>
                <div className="flex items-center">
                  <div className="bg-satstreet-light p-3 rounded-l-md border border-r-0 border-satstreet-light flex-1 font-mono text-sm truncate">
                    {walletInfo.publicKey}
                  </div>
                  <Button 
                    onClick={copyToClipboard} 
                    className={`rounded-l-none border border-l-0 ${
                      copiedKey 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-bitcoin hover:bg-bitcoin-dark'
                    }`}
                  >
                    {copiedKey ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <h3 className="font-medium text-foreground mb-2">How to Add Funds</h3>
                <p className="mb-2">
                  To add Bitcoin to your SatStreet wallet, send BTC to the public key above. 
                  The transfer usually completes within 10-30 minutes.
                </p>
                <p>
                  New to Bitcoin? We recommend using exchanges like Coinbase, Binance, or 
                  Kraken to purchase Bitcoin and transfer it to your SatStreet wallet.
                </p>
              </div>
            </div>
          </div>
          
          {/* Transactions */}
          <div className="bg-satstreet-medium p-6 rounded-lg border border-satstreet-light">
            <h2 className="text-xl font-medium mb-6">Transaction History</h2>
            
            <Tabs defaultValue="all">
              <TabsList className="bg-satstreet-light mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="purchases">Purchases</TabsTrigger>
                <TabsTrigger value="deposits">Deposits</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <TransactionsList transactions={walletInfo.transactions} />
              </TabsContent>
              
              <TabsContent value="purchases">
                <TransactionsList 
                  transactions={walletInfo.transactions.filter(tx => tx.type === 'purchase')} 
                />
              </TabsContent>
              
              <TabsContent value="deposits">
                <TransactionsList 
                  transactions={walletInfo.transactions.filter(tx => tx.type === 'deposit')} 
                />
              </TabsContent>
              
              <TabsContent value="withdrawals">
                <TransactionsList 
                  transactions={walletInfo.transactions.filter(tx => tx.type === 'withdrawal')} 
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

interface TransactionsListProps {
  transactions: WalletTransaction[];
}

const TransactionsList = ({ transactions }: TransactionsListProps) => {
  const navigate = useNavigate();
  
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    );
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    });
  };

  const getTransactionIcon = (type: WalletTransaction['type']): string => {
    switch (type) {
      case 'purchase': return '🛒';
      case 'deposit': return '⬇️';
      case 'withdrawal': return '⬆️';
      default: return '💰';
    }
  };
  
  const viewProduct = (productId?: string) => {
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  return (
    <div className="space-y-4">
      {transactions.map(transaction => (
        <div key={transaction.id} className="bg-satstreet-light p-4 rounded-md">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-satstreet-medium flex items-center justify-center text-xl">
              {getTransactionIcon(transaction.type)}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {transaction.description}
                    {transaction.productId && (
                      <Button 
                        variant="link" 
                        className="text-bitcoin p-0 h-auto ml-1 text-xs"
                        onClick={() => viewProduct(transaction.productId)}
                      >
                        View
                      </Button>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transaction.timestamp)}
                  </p>
                </div>
                <div className={`font-mono font-medium ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} sats
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Wallet;
