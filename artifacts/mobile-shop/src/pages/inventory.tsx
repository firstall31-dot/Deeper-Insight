import { useLanguage } from '@/contexts/LanguageContext';
import { useListProducts, useDeleteProduct, getListProductsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';

export default function Inventory() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  
  const { data: products, isLoading } = useListProducts({ search });
  const deleteProduct = useDeleteProduct();

  const handleDelete = (id: number) => {
    if (confirm(t('common.delete'))) {
      deleteProduct.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">{t('nav.inventory')}</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('common.add')}
        </Button>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center">
            <div className="relative w-full max-w-sm">
              <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
              <Input
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={language === 'ar' ? 'pr-9' : 'pl-9'}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.length ? products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.code}</TableCell>
                    <TableCell>{language === 'ar' ? product.nameAr || product.name : product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={product.quantity <= product.alertQuantity ? 'text-destructive' : ''}>
                        {product.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{product.salePrice.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No products found.
                    </TableCell>
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