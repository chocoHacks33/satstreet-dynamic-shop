import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getWalletInfo } from '@/services/api';
import { useRefreshData } from '@/hooks/useRefreshData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUp, ArrowDown, ShoppingCart } from 'lucide-react';

interface WalletTransactionProps {
  id: string;
  type: 'deposit' | 'withdrawal' | 'purchase';
  amount: number;
  timestamp: string;
  description: string;
}

const Wallet = () => {
  const navigate = useNavigate();
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
    intervalMs: 60000 // Use intervalMs instead of refreshInterval
  });

  const formatSats = (sats: number): string => {
    return new Intl.NumberFormat('en-US').format(sats);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-6">Wallet</h1>
        
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
                        <tr key={transaction.id}>
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
                              {transaction.type === 'deposit' ? '+' : '-'} {formatSats(transaction.amount)} sats
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
      
      <Footer />
    </div>
  );
};

export default Wallet;
