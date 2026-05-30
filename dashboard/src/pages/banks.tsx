import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useListBankAccounts, useListBankTransactions } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { PageHeader, PageWrapper } from '@/components/ui/page-header';

function BankTransactions({ accountId }: { accountId: number }) {
  const { data: transactions, isLoading } = useListBankTransactions(accountId);
  if (isLoading) return <Skeleton className="h-20 w-full mt-3" />;
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto mt-3">
      {transactions?.slice(-10).reverse().map((tx) => {
        const isDeposit = tx.type === 'deposit';
        return (
          <div key={tx.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
            <div className="flex items-center gap-2">
              {isDeposit
                ? <ArrowDownLeft className="h-3.5 w-3.5 text-green-600" />
                : <ArrowUpRight className="h-3.5 w-3.5 text-red-600" />}
              <div>
                <div className="text-xs font-medium capitalize">{tx.type}</div>
                <div className="text-[11px] text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${isDeposit ? 'text-green-700' : 'text-destructive'}`}>
                {isDeposit ? '+' : '-'}{tx.amount.toLocaleString()} EGP
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

export default function Banks() {
  const { t } = useLanguage();
  const { data: accounts, isLoading } = useListBankAccounts();
  const [selected, setSelected] = useState<number | null>(null);

  const totalBalance = accounts?.reduce((sum, a) => sum + a.balance, 0) ?? 0;

  return (
    <PageWrapper>
      <PageHeader
        icon={Building2}
        title={t('nav.banks')}
        onAdd={() => {}}
      />

      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="text-sm text-muted-foreground">Total Bank Balance</div>
          <div className="text-3xl font-bold text-green-700 mt-1">{totalBalance.toLocaleString()} EGP</div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts?.map((account) => (
            <Card
              key={account.id}
              className={`cursor-pointer transition-all hover:shadow-md ${selected === account.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelected(selected === account.id ? null : account.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{account.bankName}</CardTitle>
                  {account.instapayNumber && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      InstaPay
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground font-mono">{account.accountNumber}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{account.balance.toLocaleString()} EGP</div>
                {account.iban && (
                  <div className="text-xs text-muted-foreground mt-1 font-mono">IBAN: {account.iban}</div>
                )}
                {selected === account.id && (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3 mb-1">Recent Transactions</div>
                    <BankTransactions accountId={account.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {!accounts?.length && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              No bank accounts found. Add your first account.
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
