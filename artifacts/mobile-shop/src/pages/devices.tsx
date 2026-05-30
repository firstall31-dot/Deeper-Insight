import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useListDevices } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Smartphone } from 'lucide-react';
import { PageHeader, PageWrapper } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/table-skeleton';

const CONDITION_STYLE: Record<string, string> = {
  new:         'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  used:        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  refurbished: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  damaged:     'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function Devices() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const { data: devices, isLoading } = useListDevices({ search });

  return (
    <PageWrapper>
      <PageHeader
        icon={Smartphone}
        title={t('nav.devices')}
        onAdd={() => {}}
        search={search}
        onSearch={setSearch}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="ps-4">Brand / Model</TableHead>
                <TableHead>IMEI</TableHead>
                <TableHead>Storage</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead className="text-right">Purchase</TableHead>
                <TableHead className="text-right">Sale Price</TableHead>
                <TableHead className="pe-4">{t('common.status')}</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableSkeleton rows={6} cols={7} />
            ) : (
              <TableBody>
                {devices?.length ? devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="ps-4 font-medium">{device.brand} {device.model}</TableCell>
                    <TableCell className="font-mono text-xs">
                      <div>{device.imei1}</div>
                      {device.imei2 && <div className="text-muted-foreground">{device.imei2}</div>}
                    </TableCell>
                    <TableCell>{device.storage ?? '—'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CONDITION_STYLE[device.condition] ?? ''}`}>
                        {device.condition}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{device.purchasePrice.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right">{device.salePrice?.toLocaleString() ?? '—'} EGP</TableCell>
                    <TableCell className="pe-4">
                      <Badge variant={device.sold ? 'secondary' : 'default'}>
                        {device.sold ? 'Sold' : 'Available'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No devices found.</TableCell>
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
