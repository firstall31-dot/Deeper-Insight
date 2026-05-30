import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useListMaintenance } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wrench } from 'lucide-react';
import { PageHeader, PageWrapper } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/table-skeleton';

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  received:   { label: 'Received',   variant: 'secondary' },
  diagnosing: { label: 'Diagnosing', variant: 'outline' },
  repairing:  { label: 'Repairing',  variant: 'default' },
  repaired:   { label: 'Repaired',   variant: 'default' },
  delivered:  { label: 'Delivered',  variant: 'secondary' },
  cancelled:  { label: 'Cancelled',  variant: 'destructive' },
};

export default function Maintenance() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const { data: orders, isLoading } = useListMaintenance({ search });

  return (
    <PageWrapper>
      <PageHeader
        icon={Wrench}
        title={t('nav.maintenance')}
        onAdd={() => {}}
        search={search}
        onSearch={setSearch}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="ps-4">Ticket #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">Est. Cost</TableHead>
                <TableHead className="text-right pe-4">Final Cost</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableSkeleton rows={5} cols={7} />
            ) : (
              <TableBody>
                {orders?.length ? orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="ps-4 font-mono text-xs font-medium">{order.ticketNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                    </TableCell>
                    <TableCell>{order.deviceBrand} {order.deviceType}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-sm text-muted-foreground">{order.issue}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_MAP[order.status]?.variant ?? 'secondary'}>
                        {STATUS_MAP[order.status]?.label ?? order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{order.estimatedCost?.toLocaleString() ?? '—'} EGP</TableCell>
                    <TableCell className="text-right font-medium pe-4">{order.finalCost?.toLocaleString() ?? '—'} EGP</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No maintenance orders found.
                    </TableCell>
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
