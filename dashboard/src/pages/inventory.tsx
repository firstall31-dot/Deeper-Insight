import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Package, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct,
  getListProductsQueryKey, type Product,
} from '@workspace/api-client-react';
import { useTableState } from '@/hooks/use-table-state';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader, PageWrapper } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataToolbar } from '@/components/ui/data-toolbar';
import { DataPagination } from '@/components/ui/data-pagination';
import { FormModal } from '@/components/ui/form-modal';
import { ProductForm } from '@/components/forms/product-form';

const SORT_OPTIONS = [
  { label: 'Name', value: 'name' },
  { label: 'Code', value: 'code' },
  { label: 'Category', value: 'category' },
  { label: 'Quantity', value: 'quantity', numeric: true },
  { label: 'Sale Price', value: 'salePrice', numeric: true },
];
const CATEGORIES = ['mobiles_new','mobiles_used','accessories','cases','chargers','headphones','cables','powerbanks','screens','batteries','tools','other'];

export default function Inventory() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const { data: raw, isLoading } = useListProducts();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const ts = useTableState(raw, { storageKey: 'inventory', pageSize: 15 });
  const [modal, setModal] = useState<{ open: boolean; item?: Product }>({ open: false });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getListProductsQueryKey() });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    try {
      if (modal.item) {
        await updateMutation.mutateAsync({ id: modal.item.id, data });
        toast.success('Product updated');
      } else {
        await createMutation.mutateAsync({ data });
        toast.success('Product added');
      }
      await invalidate();
      setModal({ open: false });
    } catch { toast.error('Failed to save product'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast.success('Product deleted');
      await invalidate();
    } catch { toast.error('Failed to delete product'); }
    finally { setDeleteId(null); }
  };

  return (
    <PageWrapper>
      <PageHeader icon={Package} title={t('nav.inventory')} onAdd={() => setModal({ open: true })} />

      <DataToolbar
        search={ts.search} onSearch={ts.setSearch}
        view={ts.view} onView={ts.setView}
        sort={ts.sort} sortDir={ts.sortDir} onSort={ts.setSort} sortOptions={SORT_OPTIONS}
        filterConfigs={[{ key: 'category', label: 'Category', options: CATEGORIES.map(c => ({ label: c.replace(/_/g,' '), value: c })) }]}
        filters={ts.filters} onFilter={ts.setFilter} onClearFilters={ts.clearFilters}
        hasActiveFilters={ts.hasActiveFilters} total={ts.total}
      />

      {ts.view === 'table' ? (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="ps-4 w-28">Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right w-20">Qty</TableHead>
                  <TableHead className="text-right w-32">Purchase</TableHead>
                  <TableHead className="text-right w-32">Sale Price</TableHead>
                  <TableHead className="w-20 pe-4" />
                </TableRow>
                {isLoading && <TableSkeleton cols={7} rows={10} />}
              </TableHeader>
              <TableBody>
                {ts.data.map(p => (
                  <TableRow key={p.id} className="group">
                    <TableCell className="ps-4 font-mono text-xs text-muted-foreground">{p.code}</TableCell>
                    <TableCell>
                      <p className="font-medium">{p.name}</p>
                      {p.nameAr && <p className="text-xs text-muted-foreground" dir="rtl">{p.nameAr}</p>}
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs capitalize">{p.category.replace(/_/g,' ')}</Badge></TableCell>
                    <TableCell className="text-right">
                      <span className={`font-semibold ${p.quantity <= p.alertQuantity ? 'text-destructive' : ''}`}>
                        {p.quantity <= p.alertQuantity && <AlertTriangle className="inline h-3 w-3 me-0.5 mb-0.5" />}
                        {p.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">{p.purchasePrice.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right font-semibold">{p.salePrice.toLocaleString()} EGP</TableCell>
                    <TableCell className="pe-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setModal({ open: true, item: p })}><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && ts.data.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No products found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({length:8}).map((_,i) => (
                <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-6 w-1/3 mt-2" /></CardContent></Card>
              ))
            : ts.data.map(p => (
                <Card key={p.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{p.code}</p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0 capitalize">{p.category.replace(/_/g,' ')}</Badge>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className={`text-lg font-bold ${p.quantity <= p.alertQuantity ? 'text-destructive' : ''}`}>
                        {p.quantity} <span className="text-xs font-normal text-muted-foreground">units</span>
                      </span>
                      <span className="font-semibold text-sm">{p.salePrice.toLocaleString()} EGP</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1" onClick={() => setModal({ open: true, item: p })}><Edit2 className="h-3 w-3"/>Edit</Button>
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1 text-destructive border-destructive/30" onClick={() => setDeleteId(p.id)}><Trash2 className="h-3 w-3"/>Del</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          {!isLoading && ts.data.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No products found</div>}
        </div>
      )}

      <DataPagination page={ts.page} totalPages={ts.totalPages} total={ts.total} pageSize={ts.pageSize} onPage={ts.setPage} />

      <FormModal open={modal.open} onOpenChange={o => !o && setModal({ open: false })} title={modal.item ? 'Edit Product' : 'Add Product'} size="lg">
        <ProductForm defaultValues={modal.item} onSubmit={handleSubmit} onCancel={() => setModal({ open: false })} isLoading={createMutation.isPending || updateMutation.isPending} />
      </FormModal>

      <ConfirmDialog
        open={deleteId !== null} onOpenChange={o => !o && setDeleteId(null)}
        onConfirm={handleDelete} loading={deleteMutation.isPending}
        title="Delete product?" description="This will permanently remove the product from inventory."
      />
    </PageWrapper>
  );
}
