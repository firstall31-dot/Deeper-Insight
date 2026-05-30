import { useLanguage } from '@/contexts/LanguageContext';
import { useListWallets, useListBankAccounts, useGetFawryBalance, useListSales } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Landmark, Wallet, Zap, Banknote, TrendingUp } from 'lucide-react';

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Cash',
  vodafone_cash: 'Vodafone Cash',
  etisalat_cash: 'Etisalat Cash',
  we_pay: 'WE Pay',
  instapay: 'InstaPay',
  bank_transfer: 'Bank Transfer',
};

const PAYMENT_COLORS: Record<string, string> = {
  cash: 'bg-green-100 text-green-800',
  vodafone_cash: 'bg-red-100 text-red-800',
  etisalat_cash: 'bg-orange-100 text-orange-800',
  we_pay: 'bg-purple-100 text-purple-800',
  instapay: 'bg-blue-100 text-blue-800',
  bank_transfer: 'bg-gray-100 text-gray-800',
};

export default function Treasury() {
  const { t } = useLanguage();
  const { data: wallets, isLoading: wLoading } = useListWallets();
  const { data: banks, isLoading: bLoading } = useListBankAccounts();
  const { data: fawry, isLoading: fLoading } = useGetFawryBalance();
  const { data: sales, isLoading: sLoading } = useListSales();

  const isLoading = wLoading || bLoading || fLoading || sLoading;

  const walletsTotal = wallets?.reduce((s, w) => s + w.balance, 0) ?? 0;
  const banksTotal = banks?.reduce((s, b) => s + b.balance, 0) ?? 0;
  const fawryBalance = fawry?.remaining ?? 0;

  // Revenue breakdown by payment method
  const paymentMethods = ["cash", "vodafone_cash", "etisalat_cash", "we_pay", "instapay", "bank_transfer"];
  const revenueByMethod = paymentMethods.map(method => ({
    method,
    total: sales?.filter(s => s.paymentMethod === method).reduce((sum, s) => sum + s.total, 0) ?? 0,
  })).filter(m => m.total > 0);

  const cashRevenue = revenueByMethod.find(m => m.method === 'cash')?.total ?? 0;
  const grandTotal = walletsTotal + banksTotal + fawryBalance;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Landmark className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight">Treasury</h2>
      </div>

      {/* Grand Total */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground">Total Financial Position</div>
          {isLoading ? <Skeleton className="h-10 w-48 mt-2" /> : (
            <div className="text-4xl font-bold text-primary mt-1">{grandTotal.toLocaleString()} EGP</div>
          )}
          <div className="text-xs text-muted-foreground mt-1">Wallets + Banks + Fawry remaining</div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Wallets */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-600" />
              Digital Wallets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wLoading ? <Skeleton className="h-8 w-32" /> : (
              <>
                <div className="text-2xl font-bold text-green-700">{walletsTotal.toLocaleString()} EGP</div>
                <div className="mt-2 space-y-1">
                  {wallets?.map(w => (
                    <div key={w.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{w.name}</span>
                      <span className="font-medium">{w.balance.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bank Accounts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Landmark className="h-4 w-4 text-purple-600" />
              Bank Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bLoading ? <Skeleton className="h-8 w-32" /> : (
              <>
                <div className="text-2xl font-bold text-green-700">{banksTotal.toLocaleString()} EGP</div>
                <div className="mt-2 space-y-1">
                  {banks?.map(b => (
                    <div key={b.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{b.bankName}</span>
                      <span className="font-medium">{b.balance.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Fawry */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              Fawry Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fLoading ? <Skeleton className="h-8 w-32" /> : (
              <>
                <div className="text-2xl font-bold text-green-700">{fawryBalance.toLocaleString()} EGP</div>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Received</span>
                    <span>{(fawry?.received ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Used</span>
                    <span className="text-destructive">{(fawry?.used ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Revenue by Payment Method (All Time)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : (
            <div className="space-y-3">
              {revenueByMethod.map(({ method, total }) => {
                const maxTotal = Math.max(...revenueByMethod.map(m => m.total), 1);
                const pct = (total / maxTotal) * 100;
                return (
                  <div key={method} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_COLORS[method]}`}>
                        {PAYMENT_LABELS[method]}
                      </span>
                      <span className="font-medium">{total.toLocaleString()} EGP</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {revenueByMethod.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No sales data yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cash on Hand */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-green-600" />
            Cash Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sLoading ? <Skeleton className="h-12 w-48" /> : (
            <>
              <div className="text-3xl font-bold text-green-700">{cashRevenue.toLocaleString()} EGP</div>
              <div className="text-sm text-muted-foreground mt-1">Total cash collected from sales</div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
