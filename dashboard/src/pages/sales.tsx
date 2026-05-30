import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useListSales } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart } from 'lucide-react';
import { PageHeader, PageWrapper } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { paymentLabel, paymentBadgeClass } from '@/lib/payment';

export default function Sales() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const { data: sales, isLoading } = useListSales({ search });

  return (
    <PageWrapper>
      <PageHeader
        icon={ShoppingCart}
        title={t('nav.sales')}
        onAdd={() => {}}
        addLabel="New Invoice"
        search={search}
        onSearch={setSearch}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="ps-4">Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right pe-4">Due</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableSkeleton rows={6} cols={7} />
            ) : (
              <TableBody>
                {sales?.length ? sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="ps-4 font-mono text-xs font-medium">{sale.invoiceNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium">{sale.customerName}</div>
                      {sale.customerPhone && <div className="text-xs text-muted-foreground">{sale.customerPhone}</div>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentBadgeClass(sale.paymentMethod)}`}>
                        {paymentLabel(sale.paymentMethod)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">{sale.total.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right text-green-700">{sale.paidAmount.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right pe-4">
                      <span className={sale.dueAmount > 0 ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                        {sale.dueAmount.toLocaleString()} EGP
                      </span>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No sales found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            )}
          </Table>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
