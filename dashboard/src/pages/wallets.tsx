import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useListWallets, useListWalletTransactions } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader, PageWrapper } from '@/components/ui/page-header';

const COMPANY_COLORS: Record<string, string> = {
  vodafone: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  etisalat: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  we:       'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  instapay: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  other:    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

function WalletTransactions({ walletId }: { walletId: number }) {
  const { data: transactions, isLoading } = useListWalletTransactions(walletId);
  if (isLoading) return <Skeleton className="h-20 w-full mt-3" />;
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto mt-3">
      {transactions?.slice(-10).reverse().map((tx) => {
        const isCredit = tx.type === 'deposit' || tx.type === 'receive';
        return (
          <div key={tx.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
            <div className="flex items-center gap-2">
              {isCredit
                ? <ArrowDownLeft className="h-3.5 w-3.5 text-green-600" />
                : <ArrowUpRight className="h-3.5 w-3.5 text-red-600" />}
              <div>
                <div className="text-xs font-medium capitalize">{tx.type}</div>
                <div className="text-[11px] text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${isCredit ? 'text-green-700' : 'text-destructive'}`}>
                {isCredit ? '+' : '-'}{tx.amount.toLocaleString()} EGP
              </div>
              <div className="text-[11px] text-muted-foreground">Bal: {tx.balanceAfter.toLocaleString()}</div>
            </div>
          </div>
        );
      })}
      {!transactions?.length && (
        <p className="text-xs text-muted-foreground text-center py-3">No transactions yet.</p>
      )}
    </div>
  );
}

export default function Wallets() {
  const { t } = useLanguage();
  const { data: wallets, isLoading } = useListWallets();
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null);

  const totalBalance = wallets?.reduce((sum, w) => sum + w.balance, 0) ?? 0;

  return (
    <PageWrapper>
      <PageHeader
        icon={Wallet}
        title={t('nav.wallets')}
        onAdd={() => {}}
      />

      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="text-sm text-muted-foreground">Total Balance</div>
          <div className="text-3xl font-bold text-green-700 mt-1">{totalBalance.toLocaleString()} EGP</div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wallets?.map((wallet) => (
            <Card
              key={wallet.id}
              className={`cursor-pointer transition-all hover:shadow-md ${selectedWallet === wallet.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedWallet(selectedWallet === wallet.id ? null : wallet.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{wallet.name}</CardTitle>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${COMPANY_COLORS[wallet.company] ?? COMPANY_COLORS.other}`}>
                    {wallet.company}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">{wallet.phoneNumber}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{wallet.balance.toLocaleString()} EGP</div>
                {selectedWallet === wallet.id && (
                  <div className="mt-1">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3 mb-1">Recent Transactions</div>
                    <WalletTransactions walletId={wallet.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {!wallets?.length && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              No wallets found. Add your first wallet.
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
