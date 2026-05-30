import { useLanguage } from '@/contexts/LanguageContext';
import { useListSuppliers, useDeleteSupplier, getListSuppliersQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Truck, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';

export default function Suppliers() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const { data: suppliers, isLoading } = useListSuppliers({ search });
  const deleteSupplier = useDeleteSupplier();

  const handleDelete = (id: number) => {
    if (confirm('Delete this supplier?')) {
      deleteSupplier.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListSuppliersQueryKey() }),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">{t('nav.suppliers')}</h2>
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
            <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Total Purchases</TableHead>
                  <TableHead className="text-right">Debt</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers?.length ? suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.phone ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{supplier.address ?? '—'}</TableCell>
                    <TableCell className="text-right">{(supplier.totalPurchases ?? 0).toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right">
                      <span className={(supplier.totalDebt ?? 0) > 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                        {(supplier.totalDebt ?? 0).toLocaleString()} EGP
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(supplier.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No suppliers found.</TableCell>
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
