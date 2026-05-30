import { useLanguage } from '@/contexts/LanguageContext';
import { useListMaintenance } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Wrench } from 'lucide-react';
import { useState } from 'react';

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  received:   { label: 'Received',   variant: 'secondary' },
  diagnosing: { label: 'Diagnosing', variant: 'outline' },
  repairing:  { label: 'Repairing',  variant: 'default' },
  repaired:   { label: 'Repaired',   variant: 'default' },
  delivered:  { label: 'Delivered',  variant: 'secondary' },
  cancelled:  { label: 'Cancelled',  variant: 'destructive' },
};

export default function Maintenance() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const { data: orders, isLoading } = useListMaintenance({ search });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">{t('nav.maintenance')}</h2>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('common.add')}
        </Button>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="relative w-full max-w-sm">
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
            <Input
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={language === 'ar' ? 'pr-9' : 'pl-9'}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead className="text-right">Est. Cost</TableHead>
                  <TableHead className="text-right">Final Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.length ? orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm font-medium">{order.ticketNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                    </TableCell>
                    <TableCell>{order.deviceBrand} {order.deviceType}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{order.issue}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_MAP[order.status]?.variant ?? 'secondary'}>
                        {STATUS_MAP[order.status]?.label ?? order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{order.estimatedCost?.toLocaleString() ?? '—'} EGP</TableCell>
                    <TableCell className="text-right font-medium">{order.finalCost?.toLocaleString() ?? '—'} EGP</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No maintenance orders.</TableCell>
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
