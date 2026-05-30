import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Users, Trash2, Edit2, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useListCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer,
  getListCustomersQueryKey, type Customer,
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
import { CustomerForm } from '@/components/forms/customer-form';

const SORT_OPTIONS = [
  { label: 'Name', value: 'name' },
  { label: 'Phone', value: 'phone' },
  { label: 'Total Debt', value: 'totalDebt', numeric: true },
];

export default function Customers() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const { data: raw, isLoading } = useListCustomers();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const ts = useTableState(raw, { storageKey: 'customers', pageSize: 15 });
  const [modal, setModal] = useState<{ open: boolean; item?: Customer }>({ open: false });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getListCustomersQueryKey() });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    try {
      if (modal.item) {
        await updateMutation.mutateAsync({ id: modal.item.id, data });
        toast.success('Customer updated');
      } else {
        await createMutation.mutateAsync({ data });
        toast.success('Customer added');
      }
      await invalidate();
      setModal({ open: false });
    } catch { toast.error('Failed to save customer'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast.success('Customer deleted');
      await invalidate();
    } catch { toast.error('Failed to delete customer'); }
    finally { setDeleteId(null); }
  };

  return (
    <PageWrapper>
      <PageHeader icon={Users} title={t('nav.customers')} onAdd={() => setModal({ open: true })} />

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
                  <TableHead className="text-right">Total Debt</TableHead>
                  <TableHead className="w-20 pe-4" />
                </TableRow>
                {isLoading && <TableSkeleton cols={5} rows={8} />}
              </TableHeader>
              <TableBody>
                {ts.data.map(c => (
                  <TableRow key={c.id} className="group">
                    <TableCell className="ps-4 font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                    <TableCell className="text-muted-foreground text-sm truncate max-w-[160px]">{c.address ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      <span className={(c.totalDebt ?? 0) > 0 ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                        {(c.totalDebt ?? 0).toLocaleString()} EGP
                      </span>
                    </TableCell>
                    <TableCell className="pe-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setModal({ open: true, item: c })}><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && ts.data.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No customers found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({length:6}).map((_,i) => <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></CardContent></Card>)
            : ts.data.map(c => (
                <Card key={c.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold">{c.name}</p>
                      {(c.totalDebt ?? 0) > 0 && (
                        <span className="text-xs text-destructive font-semibold bg-destructive/10 px-2 py-0.5 rounded-full">
                          {(c.totalDebt ?? 0).toLocaleString()} EGP debt
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Phone className="h-3.5 w-3.5"/>{c.phone}</div>
                    {c.address && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3 w-3"/>{c.address}</div>}
                    <div className="flex gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1" onClick={() => setModal({ open: true, item: c })}><Edit2 className="h-3 w-3"/>Edit</Button>
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1 text-destructive border-destructive/30" onClick={() => setDeleteId(c.id)}><Trash2 className="h-3 w-3"/>Del</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          {!isLoading && ts.data.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No customers found</div>}
        </div>
      )}

      <DataPagination page={ts.page} totalPages={ts.totalPages} total={ts.total} pageSize={ts.pageSize} onPage={ts.setPage} />

      <FormModal open={modal.open} onOpenChange={o => !o && setModal({ open: false })} title={modal.item ? 'Edit Customer' : 'Add Customer'}>
        <CustomerForm defaultValues={modal.item} onSubmit={handleSubmit} onCancel={() => setModal({ open: false })} isLoading={createMutation.isPending || updateMutation.isPending} />
      </FormModal>

      <ConfirmDialog
        open={deleteId !== null} onOpenChange={o => !o && setDeleteId(null)}
        onConfirm={handleDelete} loading={deleteMutation.isPending}
        title="Delete customer?" description="This will permanently remove the customer record."
      />
    </PageWrapper>
  );
}
