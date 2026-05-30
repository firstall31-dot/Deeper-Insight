import { useLanguage } from '@/contexts/LanguageContext';
import { useGetFawryBalance, useListFawryTransactions } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Zap, TrendingUp, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const SERVICE_LABELS: Record<string, string> = {
  recharge: 'Phone Recharge',
  recharge_card: 'Recharge Card',
  electricity: 'Electricity Bill',
  water: 'Water Bill',
  gas: 'Gas Bill',
  internet: 'Internet Bill',
  other: 'Other',
};

export default function Fawry() {
  const { t } = useLanguage();
  const { data: balance, isLoading: balanceLoading } = useGetFawryBalance();
  const { data: transactions, isLoading: txLoading } = useListFawryTransactions();

  const todayProfit = transactions
    ?.filter(tx => {
      const today = new Date();
      const txDate = new Date(tx.createdAt);
      return txDate.toDateString() === today.toDateString();
    })
    .reduce((sum, tx) => sum + tx.profit, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">{t('nav.fawry')}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Balance
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Transaction
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-green-600" />
              Total Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold text-green-700">{(balance?.received ?? 0).toLocaleString()} EGP</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-red-600" />
              Total Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold text-destructive">{(balance?.used ?? 0).toLocaleString()} EGP</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold">{(balance?.remaining ?? 0).toLocaleString()} EGP</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Today's Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{todayProfit.toLocaleString()} EGP</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Customer Phone</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.slice().reverse().map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {SERVICE_LABELS[tx.serviceType] ?? tx.serviceType}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{tx.customerPhone ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{tx.notes ?? '—'}</TableCell>
                    <TableCell className="text-right font-medium">{tx.amount.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right text-green-700 font-medium">+{tx.profit.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {!transactions?.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No transactions yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
