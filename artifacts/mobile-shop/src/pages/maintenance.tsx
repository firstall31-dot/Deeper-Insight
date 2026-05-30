import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Wrench, Edit2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useListMaintenance, useCreateMaintenance, useUpdateMaintenance,
  getListMaintenanceQueryKey, type MaintenanceOrder,
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
import { MaintenanceForm } from '@/components/forms/maintenance-form';

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
  received:      { label: 'Received',      variant: 'secondary', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  inspecting:    { label: 'Inspecting',    variant: 'outline',   color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  repairing:     { label: 'Repairing',     variant: 'default',   color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  waiting_parts: { label: 'Waiting Parts', variant: 'outline',   color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  repaired:      { label: 'Repaired',      variant: 'default',   color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  delivered:     { label: 'Delivered',     variant: 'secondary', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
};

const SORT_OPTIONS = [
  { label: 'Ticket #', value: 'ticketNumber' },
  { label: 'Customer', value: 'customerName' },
  { label: 'Status', value: 'status' },
  { label: 'Date', value: 'createdAt' },
];
const STATUSES = Object.entries(STATUS_MAP).map(([v, s]) => ({ label: s.label, value: v }));

export default function Maintenance() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const { data: raw, isLoading } = useListMaintenance();
  const createMutation = useCreateMaintenance();
  const updateMutation = useUpdateMaintenance();

  const ts = useTableState(raw, { storageKey: 'maintenance', pageSize: 15 });
  const [createOpen, setCreateOpen] = useState(false);
  const [updateItem, setUpdateItem] = useState<MaintenanceOrder | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getListMaintenanceQueryKey() });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreate = async (data: any) => {
    try {
      await createMutation.mutateAsync({ data });
      toast.success('Maintenance ticket created');
      await invalidate();
      setCreateOpen(false);
    } catch { toast.error('Failed to create ticket'); }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdate = async (data: any) => {
    if (!updateItem) return;
    try {
      await updateMutation.mutateAsync({ id: updateItem.id, data });
      toast.success('Ticket updated');
      await invalidate();
      setUpdateItem(null);
    } catch { toast.error('Failed to update ticket'); }
  };

  return (
    <PageWrapper>
      <PageHeader icon={Wrench} title={t('nav.maintenance')} onAdd={() => setCreateOpen(true)} />

      <DataToolbar
        search={ts.search} onSearch={ts.setSearch}
        view={ts.view} onView={ts.setView}
        sort={ts.sort} sortDir={ts.sortDir} onSort={ts.setSort} sortOptions={SORT_OPTIONS}
        filterConfigs={[{ key: 'status', label: 'Status', options: STATUSES }]}
        filters={ts.filters} onFilter={ts.setFilter} onClearFilters={ts.clearFilters}
        hasActiveFilters={ts.hasActiveFilters} total={ts.total}
      />

      {ts.view === 'table' ? (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="ps-4 w-32">Ticket #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Est.</TableHead>
                  <TableHead className="text-right">Final</TableHead>
                  <TableHead className="w-16 pe-4" />
                </TableRow>
                {isLoading && <TableSkeleton cols={8} rows={8} />}
              </TableHeader>
              <TableBody>
                {ts.data.map(o => (
                  <TableRow key={o.id} className="group">
                    <TableCell className="ps-4 font-mono text-xs font-semibold">{o.ticketNumber}</TableCell>
                    <TableCell>
                      <p className="font-medium">{o.customerName}</p>
                      <p className="text-xs text-muted-foreground">{o.customerPhone}</p>
                    </TableCell>
                    <TableCell className="text-sm">{[o.deviceBrand, o.deviceType].filter(Boolean).join(' ')}</TableCell>
                    <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">{o.issue}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_MAP[o.status]?.color ?? ''}`}>
                        {STATUS_MAP[o.status]?.label ?? o.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm">{o.estimatedCost?.toLocaleString() ?? '—'} {o.estimatedCost ? 'EGP' : ''}</TableCell>
                    <TableCell className="text-right font-semibold">{o.finalCost?.toLocaleString() ?? '—'} {o.finalCost ? 'EGP' : ''}</TableCell>
                    <TableCell className="pe-4">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setUpdateItem(o)}><Edit2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && ts.data.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No maintenance orders found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({length:6}).map((_,i) => <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></CardContent></Card>)
            : ts.data.map(o => (
                <Card key={o.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="font-mono text-xs font-semibold">{o.ticketNumber}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_MAP[o.status]?.color ?? ''}`}>{STATUS_MAP[o.status]?.label ?? o.status}</span>
                    </div>
                    <p className="font-semibold">{o.customerName}</p>
                    <p className="text-xs text-muted-foreground">{o.customerPhone}</p>
                    <p className="text-sm">{[o.deviceBrand, o.deviceType].filter(Boolean).join(' ')}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{o.issue}</p>
                    <div className="flex gap-2 text-sm pt-1">
                      {o.estimatedCost && <span className="text-muted-foreground">Est: <span className="font-medium">{o.estimatedCost.toLocaleString()} EGP</span></span>}
                      {o.finalCost && <span className="text-green-700 font-semibold">Final: {o.finalCost.toLocaleString()} EGP</span>}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-1" onClick={() => setUpdateItem(o)}><Edit2 className="h-3 w-3"/>Update Status</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          {!isLoading && ts.data.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No maintenance orders found</div>}
        </div>
      )}

      <DataPagination page={ts.page} totalPages={ts.totalPages} total={ts.total} pageSize={ts.pageSize} onPage={ts.setPage} />

      <FormModal open={createOpen} onOpenChange={setCreateOpen} title="New Maintenance Ticket" size="lg">
        <MaintenanceForm mode="create" onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} isLoading={createMutation.isPending} />
      </FormModal>

      <FormModal open={updateItem !== null} onOpenChange={o => !o && setUpdateItem(null)} title={`Update Ticket ${updateItem?.ticketNumber ?? ''}`}>
        <MaintenanceForm mode="update" defaultValues={updateItem ?? undefined} onSubmit={handleUpdate} onCancel={() => setUpdateItem(null)} isLoading={updateMutation.isPending} />
      </FormModal>
    </PageWrapper>
  );
}
