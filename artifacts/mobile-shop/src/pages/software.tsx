import { useLanguage } from '@/contexts/LanguageContext';
import { useListSoftwareServices } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Code2 } from 'lucide-react';

const STATUS_MAP: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  in_progress: 'default',
  completed: 'outline',
  cancelled: 'destructive',
};

export default function Software() {
  const { t } = useLanguage();
  const { data: services, isLoading } = useListSoftwareServices();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Code2 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">{t('nav.software')}</h2>
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
                  <TableHead>Service Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Sale Price</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services?.length ? services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.serviceType}</TableCell>
                    <TableCell>
                      <div>{service.customerName}</div>
                      <div className="text-xs text-muted-foreground">{service.customerPhone}</div>
                    </TableCell>
                    <TableCell>{service.deviceBrand ?? service.deviceModel ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_MAP[service.status] ?? 'secondary'}>{service.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{service.cost.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right font-medium">{service.salePrice.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(service.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No software services found.</TableCell>
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
