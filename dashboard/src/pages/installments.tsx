import { useLanguage } from '@/contexts/LanguageContext';
import { useListInstallments } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import { PageHeader, PageWrapper } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/table-skeleton';

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active:    'default',
  completed: 'outline',
  overdue:   'destructive',
  cancelled: 'secondary',
};

export default function Installments() {
  const { t } = useLanguage();
  const { data: installments, isLoading } = useListInstallments();

  return (
    <PageWrapper>
      <PageHeader
        icon={CreditCard}
        title={t('nav.installments')}
        onAdd={() => {}}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="ps-4">Customer</TableHead>
                <TableHead>Device</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Down Payment</TableHead>
                <TableHead className="text-right">Installment</TableHead>
                <TableHead className="text-center">Progress</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead className="pe-4">{t('common.status')}</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableSkeleton rows={5} cols={8} />
            ) : (
              <TableBody>
                {installments?.length ? installments.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell className="ps-4">
                      <div className="font-medium">{inst.customerName}</div>
                      <div className="text-xs text-muted-foreground">{inst.customerPhone}</div>
                    </TableCell>
                    <TableCell>{inst.deviceName}</TableCell>
                    <TableCell className="text-right">{inst.totalAmount.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right">{inst.downPayment.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right">{inst.installmentAmount.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-medium">{inst.paidInstallments} / {inst.totalInstallments}</span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(inst.paidInstallments / inst.totalInstallments) * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={inst.remainingAmount > 0 ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                        {inst.remainingAmount.toLocaleString()} EGP
                      </span>
                    </TableCell>
                    <TableCell className="pe-4">
                      <Badge variant={STATUS_COLORS[inst.status] ?? 'secondary'}>{inst.status}</Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No installments found.</TableCell>
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
