import { useLanguage } from '@/contexts/LanguageContext';
import { useListBankAccounts, useListBankTransactions } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Building2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

function BankTransactions({ accountId }: { accountId: number }) {
  const { data: transactions, isLoading } = useListBankTransactions(accountId);

  if (isLoading) return <Skeleton className="h-20 w-full" />;

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto mt-4">
      {transactions?.slice(-10).reverse().map((tx) => (
        <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
          <div className="flex items-center gap-2">
            {tx.type === 'deposit'
              ? <ArrowDownLeft className="h-4 w-4 text-green-600" />
              : <ArrowUpRight className="h-4 w-4 text-red-600" />}
            <div>
              <div className="text-sm font-medium capitalize">{tx.type}</div>
              <div className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`font-medium ${tx.type === 'deposit' ? 'text-green-700' : 'text-destructive'}`}>
              {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()} EGP
            </div>
            <div className="text-xs text-muted-foreground">Balance: {tx.balanceAfter.toLocaleString()}</div>
          </div>
        </div>
      ))}
      {!transactions?.length && <p className="text-sm text-muted-foreground text-center py-4">No transactions yet.</p>}
    </div>
  );
}

export default function Banks() {
  const { t } = useLanguage();
  const { data: accounts, isLoading } = useListBankAccounts();
  const [selected, setSelected] = useState<number | null>(null);

  const totalBalance = accounts?.reduce((sum, a) => sum + a.balance, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">{t('nav.banks')}</h2>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('common.add')}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Total Bank Balance</div>
          <div className="text-3xl font-bold text-green-700">{totalBalance.toLocaleString()} EGP</div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts?.map((account) => (
            <Card key={account.id}
              className={`cursor-pointer transition-all hover:shadow-md ${selected === account.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelected(selected === account.id ? null : account.id)}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{account.bankName}</CardTitle>
                  {account.instapayNumber && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      InstaPay
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground font-mono">{account.accountNumber}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{account.balance.toLocaleString()} EGP</div>
                {account.iban && <div className="text-xs text-muted-foreground mt-1 font-mono">IBAN: {account.iban}</div>}
                {selected === account.id && (
                  <div>
                    <div className="text-sm font-medium mt-4 mb-2">Recent Transactions</div>
                    <BankTransactions accountId={account.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {!accounts?.length && <p className="text-muted-foreground col-span-2 text-center py-8">No bank accounts found.</p>}
        </div>
      )}
    </div>
  );
}
