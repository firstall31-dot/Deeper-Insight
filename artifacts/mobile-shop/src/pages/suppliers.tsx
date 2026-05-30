import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useListSuppliers, useDeleteSupplier, getListSuppliersQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Truck, Trash2, Edit } from 'lucide-react';
import { PageHeader, PageWrapper } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function Suppliers() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: suppliers, isLoading } = useListSuppliers({ search });
  const deleteSupplier = useDeleteSupplier();

  return (
    <PageWrapper>
      <PageHeader
        icon={Truck}
        title={t('nav.suppliers')}
        onAdd={() => {}}
        search={search}
        onSearch={setSearch}
      />

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
                <TableHead className="text-right pe-4">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableSkeleton rows={5} cols={6} />
            ) : (
              <TableBody>
                {suppliers?.length ? suppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="group">
                    <TableCell className="ps-4 font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.phone ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{supplier.address ?? '—'}</TableCell>
                    <TableCell className="text-right">{(supplier.totalPurchases ?? 0).toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right">
                      <span className={(supplier.totalDebt ?? 0) > 0 ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                        {(supplier.totalDebt ?? 0).toLocaleString()} EGP
                      </span>
                    </TableCell>
                    <TableCell className="text-right pe-4">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(supplier.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No suppliers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            )}
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          deleteSupplier.mutate({ id: deleteId }, {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: getListSuppliersQueryKey() });
              toast.success('Supplier deleted');
              setDeleteId(null);
            },
            onError: () => toast.error('Failed to delete supplier'),
          });
        }}
        loading={deleteSupplier.isPending}
        title="Delete supplier?"
        description="This will permanently remove the supplier record."
      />
    </PageWrapper>
  );
}
