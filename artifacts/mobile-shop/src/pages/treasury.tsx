import { useLanguage } from '@/contexts/LanguageContext';
import { useListWallets, useListBankAccounts, useGetFawryBalance, useListSales } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Landmark, Wallet, Zap, Banknote, TrendingUp } from 'lucide-react';
import { paymentLabel, paymentBadgeClass } from '@/lib/payment';
import { PageWrapper } from '@/components/ui/page-header';

const PAYMENT_METHODS = ['cash', 'vodafone_cash', 'etisalat_cash', 'we_pay', 'instapay', 'bank_transfer'] as const;

export default function Treasury() {
  const { t } = useLanguage();
  const { data: wallets, isLoading: wLoading } = useListWallets();
  const { data: banks,   isLoading: bLoading } = useListBankAccounts();
  const { data: fawry,   isLoading: fLoading } = useGetFawryBalance();
  const { data: sales,   isLoading: sLoading } = useListSales();

  const isLoading = wLoading || bLoading || fLoading || sLoading;

  const walletsTotal  = wallets?.reduce((s, w) => s + w.balance, 0) ?? 0;
  const banksTotal    = banks?.reduce((s, b) => s + b.balance, 0) ?? 0;
  const fawryBalance  = fawry?.remaining ?? 0;

  const revenueByMethod = PAYMENT_METHODS
    .map(method => ({
      method,
      total: sales?.filter(s => s.paymentMethod === method).reduce((sum, s) => sum + s.total, 0) ?? 0,
    }))
    .filter(m => m.total > 0);

  const cashRevenue = revenueByMethod.find(m => m.method === 'cash')?.total ?? 0;
  const grandTotal  = walletsTotal + banksTotal + fawryBalance;

  return (
    <PageWrapper>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 shrink-0">
          <Landmark className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Treasury</h1>
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
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-primary" />
            Revenue by Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : revenueByMethod.length > 0 ? (
            <div className="space-y-3">
              {revenueByMethod.map(({ method, total }) => {
                const maxTotal = Math.max(...revenueByMethod.map(m => m.total), 1);
                const pct = (total / maxTotal) * 100;
                return (
                  <div key={method} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentBadgeClass(method)}`}>
                        {paymentLabel(method)}
                      </span>
                      <span className="font-medium">{total.toLocaleString()} EGP</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No sales data yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Cash Revenue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
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
    </PageWrapper>
  );
}
