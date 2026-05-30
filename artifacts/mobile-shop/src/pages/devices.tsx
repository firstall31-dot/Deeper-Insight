import { useLanguage } from '@/contexts/LanguageContext';
import { useListDevices } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Smartphone } from 'lucide-react';
import { useState } from 'react';

export default function Devices() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const { data: devices, isLoading } = useListDevices({ search });

  const conditionColor: Record<string, string> = {
    new: 'bg-green-100 text-green-800',
    used: 'bg-yellow-100 text-yellow-800',
    refurbished: 'bg-blue-100 text-blue-800',
    damaged: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Smartphone className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">{t('nav.devices')}</h2>
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
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand / Model</TableHead>
                  <TableHead>IMEI</TableHead>
                  <TableHead>Storage</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead className="text-right">Purchase Price</TableHead>
                  <TableHead className="text-right">Sale Price</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices?.length ? devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.brand} {device.model}</TableCell>
                    <TableCell className="font-mono text-xs">
                      <div>{device.imei1}</div>
                      {device.imei2 && <div className="text-muted-foreground">{device.imei2}</div>}
                    </TableCell>
                    <TableCell>{device.storage ?? '—'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${conditionColor[device.condition] ?? ''}`}>
                        {device.condition}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{device.purchasePrice.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right">{device.salePrice?.toLocaleString() ?? '—'} EGP</TableCell>
                    <TableCell>
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
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
