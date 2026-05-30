import { useLanguage } from '@/contexts/LanguageContext';
import { useListWallets, useListWalletTransactions } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

const COMPANY_COLORS: Record<string, string> = {
  vodafone: 'bg-red-100 text-red-800',
  etisalat: 'bg-orange-100 text-orange-800',
  we: 'bg-yellow-100 text-yellow-800',
  instapay: 'bg-blue-100 text-blue-800',
  other: 'bg-gray-100 text-gray-800',
};

function WalletTransactions({ walletId }: { walletId: number }) {
  const { data: transactions, isLoading } = useListWalletTransactions(walletId);

  if (isLoading) return <Skeleton className="h-20 w-full" />;

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {transactions?.slice(-10).reverse().map((tx) => (
        <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
          <div className="flex items-center gap-2">
            {tx.type === 'deposit' || tx.type === 'receive'
              ? <ArrowDownLeft className="h-4 w-4 text-green-600" />
              : <ArrowUpRight className="h-4 w-4 text-red-600" />}
            <div>
              <div className="text-sm font-medium capitalize">{tx.type}</div>
              <div className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`font-medium ${tx.type === 'deposit' || tx.type === 'receive' ? 'text-green-700' : 'text-destructive'}`}>
              {tx.type === 'deposit' || tx.type === 'receive' ? '+' : '-'}{tx.amount.toLocaleString()} EGP
            </div>
            <div className="text-xs text-muted-foreground">Balance: {tx.balanceAfter.toLocaleString()}</div>
          </div>
        </div>
      ))}
      {!transactions?.length && <p className="text-sm text-muted-foreground text-center py-4">No transactions yet.</p>}
    </div>
  );
}

export default function Wallets() {
  const { t } = useLanguage();
  const { data: wallets, isLoading } = useListWallets();
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null);

  const totalBalance = wallets?.reduce((sum, w) => sum + w.balance, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">{t('nav.wallets')}</h2>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('common.add')}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Total Balance</div>
          <div className="text-3xl font-bold text-green-700">{totalBalance.toLocaleString()} EGP</div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wallets?.map((wallet) => (
            <Card key={wallet.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedWallet === wallet.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedWallet(selectedWallet === wallet.id ? null : wallet.id)}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{wallet.name}</CardTitle>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${COMPANY_COLORS[wallet.company] ?? COMPANY_COLORS.other}`}>
                    {wallet.company}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">{wallet.phoneNumber}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{wallet.balance.toLocaleString()} EGP</div>
                {selectedWallet === wallet.id && (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Recent Transactions</div>
                    <WalletTransactions walletId={wallet.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {!wallets?.length && <p className="text-muted-foreground col-span-2 text-center py-8">No wallets found.</p>}
        </div>
      )}
    </div>
  );
}
