import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWalletInfo } from '@/services/api';
import { useRefreshData } from '@/hooks/useRefreshData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Copy, ArrowUpRight, ArrowDownLeft, ShoppingBag } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the balance chart
const balanceData = [
  { date: '2024-05-01', balance: 2000000 },
  { date: '2024-05-02', balance: 2050000 },
  { date: '2024-05-03', balance: 2030000 },
  { date: '2024-05-04', balance: 2100000 },
  { date: '2024-05-05', balance: 2200000 },
  { date: '2024-05-06', balance: 2150000 },
  { date: '2024-05-07', balance: 2300000 },
  { date: '2024-05-08', balance: 2250000 },
  { date: '2024-05-09', balance: 2400000 },
  { date: '2024-05-10', balance: 2350000 },
  { date: '2024-05-11', balance: 2450000 },
  { date: '2024-05-12', balance: 2500000 },
];

const formatter = (value: number) => `${value.toLocaleString()} sats`;

const Wallet = () => {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  
  // Fetch wallet info
  const { 
    data: walletInfo, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['walletInfo'],
    queryFn: getWalletInfo
  });
  
  // Set up automatic refresh
  const { 
    isRefreshing,
    formattedTimeUntilRefresh 
  } = useRefreshData({
    onRefresh: refetch,
    refreshInterval: 60000 // 1 minute
  });
  
  const handleCopyAddress = () => {
    if (walletInfo?.publicKey) {
      navigator.clipboard.writeText(walletInfo.publicKey);
      toast({
        title: "Address copied",
        description: "Bitcoin address copied to clipboard"
      });
    }
  };
  
  const handleDeposit = () => {
    toast({
      title: "Deposit initiated",
      description: `Deposit of ${depositAmount} sats will be processed shortly.`
    });
    setDepositAmount('');
  };
  
  const handleWithdraw = () => {
    toast({
      title: "Withdrawal initiated",
      description: `Withdrawal of ${withdrawAmount} sats to ${withdrawAddress} will be processed shortly.`
    });
    setWithdrawAmount('');
    setWithdrawAddress('');
  };
  
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'purchase':
        return <ShoppingBag className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };
  
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-500';
      case 'withdrawal':
      case 'purchase':
        return 'text-red-500';
      default:
        return '';
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <h1 className="text-3xl font-bold mb-6">Wallet</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Skeleton className="h-64 w-full mb-6" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full mb-6" />
              <Skeleton className="h-64 w-full" />
            </div>
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Wallet</h1>
          <div className="text-xs text-muted-foreground flex items-center">
            <span>Next update in: {formattedTimeUntilRefresh}</span>
            {isRefreshing && <span className="ml-2 animate-spin">⟳</span>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="md:col-span-2">
            {/* Balance Card */}
            <Card className="mb-6 bg-satstreet-medium border-satstreet-light">
              <CardHeader>
                <CardTitle>Balance</CardTitle>
                <CardDescription>Your current wallet balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="text-3xl font-bold text-bitcoin mb-4">
                    {walletInfo?.balance.toLocaleString()} sats
                  </div>
                  
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={balanceData}>
                        <defs>
                          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
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
                          tickFormatter={formatter}
                        />
                        <Tooltip 
                          formatter={formatter}
                          contentStyle={{ 
                            backgroundColor: '#1A1E2C', 
                            borderColor: '#2D3348' 
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="balance" 
                          stroke="#F7931A" 
                          fillOpacity={1}
                          fill="url(#colorBalance)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Transactions */}
            <Card className="bg-satstreet-medium border-satstreet-light">
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>Your recent wallet activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {walletInfo?.transactions.map((transaction) => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-satstreet-light"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-satstreet-dark rounded-full">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(transaction.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className={`font-mono font-bold ${getTransactionColor(transaction.type)}`}>
                        {transaction.amount > 0 ? '+' : ''}
                        {formatter(Number(transaction.amount))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div>
            {/* Receive Card */}
            <Card className="mb-6 bg-satstreet-medium border-satstreet-light">
              <CardHeader>
                <CardTitle>Receive Bitcoin</CardTitle>
                <CardDescription>Your Bitcoin address</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-satstreet-dark rounded-lg border border-satstreet-light mb-4">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-sm truncate mr-2">
                      {walletInfo?.publicKey}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleCopyAddress}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-satstreet-dark rounded-lg border border-satstreet-light p-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-2">QR Code</div>
                    <div className="w-32 h-32 bg-white mx-auto"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Deposit/Withdraw Card */}
            <Card className="bg-satstreet-medium border-satstreet-light">
              <CardHeader>
                <CardTitle>Manage Funds</CardTitle>
                <CardDescription>Deposit or withdraw sats</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="deposit">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="deposit">Deposit</TabsTrigger>
                    <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="deposit">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="depositAmount">Amount (sats)</Label>
                        <Input 
                          id="depositAmount" 
                          type="number" 
                          placeholder="100000"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                        />
                      </div>
                      <Button 
                        className="w-full bg-bitcoin hover:bg-bitcoin-dark"
                        onClick={handleDeposit}
                        disabled={!depositAmount}
                      >
                        Deposit
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="withdraw">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="withdrawAmount">Amount (sats)</Label>
                        <Input 
                          id="withdrawAmount" 
                          type="number" 
                          placeholder="100000"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="withdrawAddress">Bitcoin Address</Label>
                        <Input 
                          id="withdrawAddress" 
                          placeholder="1A1zP1..."
                          value={withdrawAddress}
                          onChange={(e) => setWithdrawAddress(e.target.value)}
                        />
                      </div>
                      <Button 
                        className="w-full bg-bitcoin hover:bg-bitcoin-dark"
                        onClick={handleWithdraw}
                        disabled={!withdrawAmount || !withdrawAddress}
                      >
                        Withdraw
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Wallet;
