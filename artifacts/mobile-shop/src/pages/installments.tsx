import { useLanguage } from '@/contexts/LanguageContext';
import { useListInstallments } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, CreditCard } from 'lucide-react';

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  completed: 'outline',
  overdue: 'destructive',
  cancelled: 'secondary',
};

export default function Installments() {
  const { t } = useLanguage();
  const { data: installments, isLoading } = useListInstallments();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">{t('nav.installments')}</h2>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('common.add')}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Down Payment</TableHead>
                  <TableHead className="text-right">Installment</TableHead>
                  <TableHead className="text-center">Progress</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {installments?.length ? installments.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell>
                      <div className="font-medium">{inst.customerName}</div>
                      <div className="text-xs text-muted-foreground">{inst.customerPhone}</div>
                    </TableCell>
                    <TableCell>{inst.deviceName}</TableCell>
                    <TableCell className="text-right">{inst.totalAmount.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right">{inst.downPayment.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right">{inst.installmentAmount.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-medium">
                        {inst.paidInstallments} / {inst.totalInstallments}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={inst.remainingAmount > 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                        {inst.remainingAmount.toLocaleString()} EGP
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[inst.status] ?? 'secondary'}>{inst.status}</Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No installments found.</TableCell>
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
