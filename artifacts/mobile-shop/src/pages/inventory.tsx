import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useListProducts, useDeleteProduct, getListProductsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Package, Trash2, Edit } from 'lucide-react';
import { PageHeader, PageWrapper } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function Inventory() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: products, isLoading } = useListProducts({ search });
  const deleteProduct = useDeleteProduct();

  return (
    <PageWrapper>
      <PageHeader
        icon={Package}
        title={t('nav.inventory')}
        onAdd={() => {}}
        search={search}
        onSearch={setSearch}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="ps-4">Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right pe-4">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableSkeleton rows={6} cols={6} />
            ) : (
              <TableBody>
                {products?.length ? products.map((product) => (
                  <TableRow key={product.id} className="group">
                    <TableCell className="ps-4 font-mono text-xs text-muted-foreground">{product.code}</TableCell>
                    <TableCell className="font-medium">
                      {language === 'ar' ? product.nameAr || product.name : product.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{product.category}</TableCell>
                    <TableCell className="text-right">
                      <span className={product.quantity <= product.alertQuantity ? 'text-destructive font-semibold' : 'font-medium'}>
                        {product.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">{product.salePrice.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right pe-4">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(product.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No products found.
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
          deleteProduct.mutate({ id: deleteId }, {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
              toast.success('Product deleted');
              setDeleteId(null);
            },
            onError: () => toast.error('Failed to delete product'),
          });
        }}
        loading={deleteProduct.isPending}
        title="Delete product?"
        description="This will permanently remove the product from inventory."
      />
    </PageWrapper>
  );
}
