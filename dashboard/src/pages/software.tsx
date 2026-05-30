import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Code2, Edit2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useListSoftwareServices, useCreateSoftwareService, useUpdateSoftwareService,
  getListSoftwareServicesQueryKey, type SoftwareService,
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
import { SoftwareForm } from '@/components/forms/software-form';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary', in_progress: 'default', done: 'outline',
};
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending', in_progress: 'In Progress', done: 'Done',
};

const SORT_OPTIONS = [
  { label: 'Service Type', value: 'serviceType' },
  { label: 'Customer', value: 'customerName' },
  { label: 'Status', value: 'status' },
  { label: 'Date', value: 'createdAt' },
  { label: 'Sale Price', value: 'salePrice', numeric: true },
];

export default function Software() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const { data: raw, isLoading } = useListSoftwareServices();
  const createMutation = useCreateSoftwareService();
  const updateMutation = useUpdateSoftwareService();

  const ts = useTableState(raw, { storageKey: 'software', pageSize: 15 });
  const [modal, setModal] = useState<{ open: boolean; item?: SoftwareService }>({ open: false });

  const invalidate = () => qc.invalidateQueries({ queryKey: getListSoftwareServicesQueryKey() });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    try {
      if (modal.item) {
        await updateMutation.mutateAsync({ id: modal.item.id, data });
        toast.success('Service updated');
      } else {
        await createMutation.mutateAsync({ data });
        toast.success('Service added');
      }
      await invalidate();
      setModal({ open: false });
    } catch { toast.error('Failed to save service'); }
  };

  return (
    <PageWrapper>
      <PageHeader icon={Code2} title={t('nav.software')} onAdd={() => setModal({ open: true })} />

      <DataToolbar
        search={ts.search} onSearch={ts.setSearch}
        view={ts.view} onView={ts.setView}
        sort={ts.sort} sortDir={ts.sortDir} onSort={ts.setSort} sortOptions={SORT_OPTIONS}
        filterConfigs={[{ key: 'status', label: 'Status', options: Object.entries(STATUS_LABEL).map(([v,l]) => ({ label: l, value: v })) }]}
        filters={ts.filters} onFilter={ts.setFilter} onClearFilters={ts.clearFilters}
        hasActiveFilters={ts.hasActiveFilters} total={ts.total}
      />

      {ts.view === 'table' ? (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="ps-4">Service Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Sale Price</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-16 pe-4" />
                </TableRow>
                {isLoading && <TableSkeleton cols={8} rows={8} />}
              </TableHeader>
              <TableBody>
                {ts.data.map(s => (
                  <TableRow key={s.id} className="group">
                    <TableCell className="ps-4 font-medium">{s.serviceType}</TableCell>
                    <TableCell>
                      <p className="font-medium">{s.customerName}</p>
                      <p className="text-xs text-muted-foreground">{s.customerPhone}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {[s.deviceBrand, s.deviceModel].filter(Boolean).join(' ') || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[s.status] ?? 'secondary'}>{STATUS_LABEL[s.status] ?? s.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{s.cost.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right font-semibold">{s.salePrice.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="pe-4">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setModal({ open: true, item: s })}><Edit2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && ts.data.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No software services found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({length:6}).map((_,i) => <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></CardContent></Card>)
            : ts.data.map(s => (
                <Card key={s.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-sm">{s.serviceType}</p>
                      <Badge variant={STATUS_VARIANT[s.status] ?? 'secondary'} className="text-xs">{STATUS_LABEL[s.status] ?? s.status}</Badge>
                    </div>
                    <p className="font-medium text-sm">{s.customerName}</p>
                    <p className="text-xs text-muted-foreground">{s.customerPhone}</p>
                    {(s.deviceBrand || s.deviceModel) && <p className="text-xs text-muted-foreground">{[s.deviceBrand, s.deviceModel].filter(Boolean).join(' ')}</p>}
                    <div className="flex justify-between text-sm pt-1">
                      <span className="text-muted-foreground">Sale: <span className="font-semibold text-foreground">{s.salePrice.toLocaleString()} EGP</span></span>
                      <span className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-1" onClick={() => setModal({ open: true, item: s })}><Edit2 className="h-3 w-3"/>Edit</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          {!isLoading && ts.data.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No software services found</div>}
        </div>
      )}

      <DataPagination page={ts.page} totalPages={ts.totalPages} total={ts.total} pageSize={ts.pageSize} onPage={ts.setPage} />

      <FormModal open={modal.open} onOpenChange={o => !o && setModal({ open: false })} title={modal.item ? 'Edit Service' : 'Add Service'} size="lg">
        <SoftwareForm defaultValues={modal.item} onSubmit={handleSubmit} onCancel={() => setModal({ open: false })} isLoading={createMutation.isPending || updateMutation.isPending} />
      </FormModal>
    </PageWrapper>
  );
}
