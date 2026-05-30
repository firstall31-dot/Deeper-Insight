import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useListCustomers, useDeleteCustomer, getListCustomersQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Users, Trash2, Edit } from 'lucide-react';
import { PageHeader, PageWrapper } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function Customers() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: customers, isLoading } = useListCustomers({ search });
  const deleteCustomer = useDeleteCustomer();

  return (
    <PageWrapper>
      <PageHeader
        icon={Users}
        title={t('nav.customers')}
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
                <TableHead className="text-right">Debt</TableHead>
                <TableHead className="text-right pe-4">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableSkeleton rows={6} cols={4} />
            ) : (
              <TableBody>
                {customers?.length ? customers.map((customer) => (
                  <TableRow key={customer.id} className="group">
                    <TableCell className="ps-4 font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      <span className={(customer.totalDebt ?? 0) > 0 ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                        {(customer.totalDebt ?? 0).toLocaleString()} EGP
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
                          onClick={() => setDeleteId(customer.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No customers found.
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
          deleteCustomer.mutate({ id: deleteId }, {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
              toast.success('Customer deleted');
              setDeleteId(null);
            },
            onError: () => toast.error('Failed to delete customer'),
          });
        }}
        loading={deleteCustomer.isPending}
        title="Delete customer?"
        description="This will permanently remove the customer record."
      />
    </PageWrapper>
  );
}
