import { useLanguage } from '@/contexts/LanguageContext';
import { useListSoftwareServices } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Code2 } from 'lucide-react';
import { PageHeader, PageWrapper } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/table-skeleton';

const STATUS_MAP: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending:     'secondary',
  in_progress: 'default',
  completed:   'outline',
  cancelled:   'destructive',
};

export default function Software() {
  const { t } = useLanguage();
  const { data: services, isLoading } = useListSoftwareServices();

  return (
    <PageWrapper>
      <PageHeader
        icon={Code2}
        title={t('nav.software')}
        onAdd={() => {}}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="ps-4">Service Type</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Sale Price</TableHead>
                <TableHead className="pe-4">Date</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableSkeleton rows={5} cols={7} />
            ) : (
              <TableBody>
                {services?.length ? services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="ps-4 font-medium">{service.serviceType}</TableCell>
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
                    <TableCell className="text-sm text-muted-foreground pe-4">
                      {new Date(service.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No software services found.</TableCell>
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
