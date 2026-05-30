import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Smartphone, Edit2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useListDevices, useCreateDevice, useUpdateDevice,
  getListDevicesQueryKey, type Device,
} from '@workspace/api-client-react';
import { useTableState } from '@/hooks/use-table-state';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader, PageWrapper } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { DataToolbar } from '@/components/ui/data-toolbar';
import { DataPagination } from '@/components/ui/data-pagination';
import { FormModal } from '@/components/ui/form-modal';
import { DeviceForm } from '@/components/forms/device-form';

const CONDITION_CLASS: Record<string, string> = {
  new:  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  used: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const SORT_OPTIONS = [
  { label: 'Brand', value: 'brand' },
  { label: 'Model', value: 'model' },
  { label: 'Purchase Date', value: 'purchaseDate' },
  { label: 'Purchase Price', value: 'purchasePrice', numeric: true },
  { label: 'Sale Price', value: 'salePrice', numeric: true },
];

export default function Devices() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const { data: raw, isLoading } = useListDevices();
  const createMutation = useCreateDevice();
  const updateMutation = useUpdateDevice();

  const ts = useTableState(raw, { storageKey: 'devices', pageSize: 15 });
  const [modal, setModal] = useState<{ open: boolean; item?: Device }>({ open: false });

  const invalidate = () => qc.invalidateQueries({ queryKey: getListDevicesQueryKey() });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    try {
      if (modal.item) {
        await updateMutation.mutateAsync({ id: modal.item.id, data });
        toast.success('Device updated');
      } else {
        await createMutation.mutateAsync({ data });
        toast.success('Device added');
      }
      await invalidate();
      setModal({ open: false });
    } catch { toast.error('Failed to save device'); }
  };

  return (
    <PageWrapper>
      <PageHeader icon={Smartphone} title={t('nav.devices')} onAdd={() => setModal({ open: true })} />

      <DataToolbar
        search={ts.search} onSearch={ts.setSearch}
        view={ts.view} onView={ts.setView}
        sort={ts.sort} sortDir={ts.sortDir} onSort={ts.setSort} sortOptions={SORT_OPTIONS}
        filterConfigs={[
          { key: 'condition', label: 'Condition', options: [{ label: 'New', value: 'new' }, { label: 'Used', value: 'used' }] },
          { key: 'sold', label: 'Status', options: [{ label: 'Available', value: 'false' }, { label: 'Sold', value: 'true' }] },
        ]}
        filters={ts.filters} onFilter={ts.setFilter} onClearFilters={ts.clearFilters}
        hasActiveFilters={ts.hasActiveFilters} total={ts.total}
      />

      {ts.view === 'table' ? (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="ps-4">Brand / Model</TableHead>
                  <TableHead>Color / Storage</TableHead>
                  <TableHead>IMEI</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead className="text-right">Purchase</TableHead>
                  <TableHead className="text-right">Sale Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-16 pe-4" />
                </TableRow>
                {isLoading && <TableSkeleton cols={8} rows={8} />}
              </TableHeader>
              <TableBody>
                {ts.data.map(d => (
                  <TableRow key={d.id} className="group">
                    <TableCell className="ps-4">
                      <p className="font-semibold">{d.brand} {d.model}</p>
                      {d.purchaseDate && <p className="text-xs text-muted-foreground">{d.purchaseDate}</p>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {[d.color, d.storage].filter(Boolean).join(' · ') || '—'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <div>{d.imei1}</div>
                      {d.imei2 && <div className="text-muted-foreground">{d.imei2}</div>}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CONDITION_CLASS[d.condition] ?? ''}`}>{d.condition}</span>
                    </TableCell>
                    <TableCell className="text-right">{d.purchasePrice.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right font-semibold">{d.salePrice?.toLocaleString() ?? '—'} {d.salePrice ? 'EGP' : ''}</TableCell>
                    <TableCell>
                      <Badge variant={d.sold ? 'secondary' : 'default'}>{d.sold ? 'Sold' : 'Available'}</Badge>
                    </TableCell>
                    <TableCell className="pe-4">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setModal({ open: true, item: d })}><Edit2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && ts.data.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No devices found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({length:6}).map((_,i) => <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></CardContent></Card>)
            : ts.data.map(d => (
                <Card key={d.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold">{d.brand} {d.model}</p>
                      <Badge variant={d.sold ? 'secondary' : 'default'} className="text-xs">{d.sold ? 'Sold' : 'Available'}</Badge>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${CONDITION_CLASS[d.condition] ?? ''}`}>{d.condition}</span>
                      {d.storage && <span className="text-muted-foreground">{d.storage}</span>}
                      {d.color && <span className="text-muted-foreground">{d.color}</span>}
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">{d.imei1}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost: <span className="font-medium text-foreground">{d.purchasePrice.toLocaleString()} EGP</span></span>
                      {d.salePrice && <span className="font-semibold text-green-700">{d.salePrice.toLocaleString()} EGP</span>}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-1" onClick={() => setModal({ open: true, item: d })}><Edit2 className="h-3 w-3"/>Edit</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          {!isLoading && ts.data.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No devices found</div>}
        </div>
      )}

      <DataPagination page={ts.page} totalPages={ts.totalPages} total={ts.total} pageSize={ts.pageSize} onPage={ts.setPage} />

      <FormModal open={modal.open} onOpenChange={o => !o && setModal({ open: false })} title={modal.item ? 'Edit Device' : 'Add Device'} size="lg">
        <DeviceForm defaultValues={modal.item} onSubmit={handleSubmit} onCancel={() => setModal({ open: false })} isLoading={createMutation.isPending || updateMutation.isPending} />
      </FormModal>
    </PageWrapper>
  );
}
