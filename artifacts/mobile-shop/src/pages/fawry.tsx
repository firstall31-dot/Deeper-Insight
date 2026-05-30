import { useLanguage } from '@/contexts/LanguageContext';
import { useGetFawryBalance, useListFawryTransactions } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Zap, TrendingUp, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { PageHeader, PageWrapper } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/table-skeleton';

const SERVICE_LABELS: Record<string, string> = {
  recharge:       'Phone Recharge',
  recharge_card:  'Recharge Card',
  electricity:    'Electricity Bill',
  water:          'Water Bill',
  gas:            'Gas Bill',
  internet:       'Internet Bill',
  other:          'Other',
};

export default function Fawry() {
  const { t } = useLanguage();
  const { data: balance,      isLoading: balanceLoading } = useGetFawryBalance();
  const { data: transactions, isLoading: txLoading }      = useListFawryTransactions();

  const todayProfit = transactions
    ?.filter(tx => new Date(tx.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, tx) => sum + tx.profit, 0) ?? 0;

  return (
    <PageWrapper>
      <PageHeader
        icon={Zap}
        title={t('nav.fawry')}
      >
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Balance
        </Button>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Transaction
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Received',    value: balance?.received,  color: 'text-green-700', icon: ArrowDownLeft, iconColor: 'text-green-600' },
          { label: 'Total Used',        value: balance?.used,      color: 'text-destructive', icon: ArrowUpRight, iconColor: 'text-red-600' },
          { label: 'Remaining Balance', value: balance?.remaining, color: '', icon: null, iconColor: '' },
          { label: "Today's Profit",    value: todayProfit,        color: 'text-green-700', icon: TrendingUp, iconColor: 'text-green-600' },
        ].map(({ label, value, color, icon: Icon, iconColor }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                {Icon && <Icon className={`h-4 w-4 ${iconColor}`} />}
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {balanceLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className={`text-2xl font-bold ${color}`}>
                  {(value ?? 0).toLocaleString()} EGP
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="ps-4">Service</TableHead>
                <TableHead>Customer Phone</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="pe-4">Date</TableHead>
              </TableRow>
            </TableHeader>
            {txLoading ? (
              <TableSkeleton rows={5} cols={6} />
            ) : (
              <TableBody>
                {transactions?.slice().reverse().map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="ps-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        {SERVICE_LABELS[tx.serviceType] ?? tx.serviceType}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{tx.customerPhone ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{tx.notes ?? '—'}</TableCell>
                    <TableCell className="text-right font-medium">{tx.amount.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right text-green-700 font-medium">+{tx.profit.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-sm text-muted-foreground pe-4">
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
            )}
          </Table>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
