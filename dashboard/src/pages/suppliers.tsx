import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Truck, Trash2, Edit2, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useListSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier,
  getListSuppliersQueryKey, type Supplier,
} from '@workspace/api-client-react';
import { useTableState } from '@/hooks/use-table-state';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader, PageWrapper } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataToolbar } from '@/components/ui/data-toolbar';
import { DataPagination } from '@/components/ui/data-pagination';
import { FormModal } from '@/components/ui/form-modal';
import { SupplierForm } from '@/components/forms/supplier-form';

const SORT_OPTIONS = [
  { label: 'Name', value: 'name' },
  { label: 'Total Purchases', value: 'totalPurchases', numeric: true },
  { label: 'Debt', value: 'totalDebt', numeric: true },
];

export default function Suppliers() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const { data: raw, isLoading } = useListSuppliers();
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  const ts = useTableState(raw, { storageKey: 'suppliers', pageSize: 15 });
  const [modal, setModal] = useState<{ open: boolean; item?: Supplier }>({ open: false });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getListSuppliersQueryKey() });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    try {
      if (modal.item) {
        await updateMutation.mutateAsync({ id: modal.item.id, data });
        toast.success('Supplier updated');
      } else {
        await createMutation.mutateAsync({ data });
        toast.success('Supplier added');
      }
      await invalidate();
      setModal({ open: false });
    } catch { toast.error('Failed to save supplier'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast.success('Supplier deleted');
      await invalidate();
    } catch { toast.error('Failed to delete supplier'); }
    finally { setDeleteId(null); }
  };

  return (
    <PageWrapper>
      <PageHeader icon={Truck} title={t('nav.suppliers')} onAdd={() => setModal({ open: true })} />

      <DataToolbar
        search={ts.search} onSearch={ts.setSearch}
        view={ts.view} onView={ts.setView}
        sort={ts.sort} sortDir={ts.sortDir} onSort={ts.setSort} sortOptions={SORT_OPTIONS}
        filters={ts.filters} onFilter={ts.setFilter} onClearFilters={ts.clearFilters}
        hasActiveFilters={ts.hasActiveFilters} total={ts.total}
      />

      {ts.view === 'table' ? (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="ps-4">Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Total Purchases</TableHead>
                  <TableHead className="text-right">Debt</TableHead>
                  <TableHead className="w-20 pe-4" />
                </TableRow>
                {isLoading && <TableSkeleton cols={6} rows={8} />}
              </TableHeader>
              <TableBody>
                {ts.data.map(s => (
                  <TableRow key={s.id} className="group">
                    <TableCell className="ps-4 font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground">{s.phone}</TableCell>
                    <TableCell className="text-muted-foreground text-sm truncate max-w-[160px]">{s.address ?? '—'}</TableCell>
                    <TableCell className="text-right font-medium">{(s.totalPurchases ?? 0).toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right">
                      <span className={(s.totalDebt ?? 0) > 0 ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                        {(s.totalDebt ?? 0).toLocaleString()} EGP
                      </span>
                    </TableCell>
                    <TableCell className="pe-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setModal({ open: true, item: s })}><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && ts.data.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No suppliers found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({length:4}).map((_,i) => <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></CardContent></Card>)
            : ts.data.map(s => (
                <Card key={s.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <p className="font-semibold">{s.name}</p>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Phone className="h-3.5 w-3.5"/>{s.phone}</div>
                    {s.address && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3 w-3"/>{s.address}</div>}
                    <div className="flex justify-between text-sm pt-1">
                      <span className="text-muted-foreground">Purchases: <span className="font-medium text-foreground">{(s.totalPurchases ?? 0).toLocaleString()} EGP</span></span>
                      {(s.totalDebt ?? 0) > 0 && <span className="text-destructive font-semibold">{(s.totalDebt ?? 0).toLocaleString()} EGP debt</span>}
                    </div>
                    <div className="flex gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1" onClick={() => setModal({ open: true, item: s })}><Edit2 className="h-3 w-3"/>Edit</Button>
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1 text-destructive border-destructive/30" onClick={() => setDeleteId(s.id)}><Trash2 className="h-3 w-3"/>Del</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          {!isLoading && ts.data.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No suppliers found</div>}
        </div>
      )}

      <DataPagination page={ts.page} totalPages={ts.totalPages} total={ts.total} pageSize={ts.pageSize} onPage={ts.setPage} />

      <FormModal open={modal.open} onOpenChange={o => !o && setModal({ open: false })} title={modal.item ? 'Edit Supplier' : 'Add Supplier'}>
        <SupplierForm defaultValues={modal.item} onSubmit={handleSubmit} onCancel={() => setModal({ open: false })} isLoading={createMutation.isPending || updateMutation.isPending} />
      </FormModal>

      <ConfirmDialog
        open={deleteId !== null} onOpenChange={o => !o && setDeleteId(null)}
        onConfirm={handleDelete} loading={deleteMutation.isPending}
        title="Delete supplier?" description="This will permanently remove the supplier record."
      />
    </PageWrapper>
  );
}
