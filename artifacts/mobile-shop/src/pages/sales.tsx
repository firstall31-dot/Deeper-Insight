import { useLanguage } from '@/contexts/LanguageContext';
import { useListSales } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Cash',
  vodafone_cash: 'Vodafone Cash',
  etisalat_cash: 'Etisalat Cash',
  we_pay: 'WE Pay',
  instapay: 'InstaPay',
  bank_transfer: 'Bank Transfer',
};

const PAYMENT_COLORS: Record<string, string> = {
  cash: 'bg-green-100 text-green-800',
  vodafone_cash: 'bg-red-100 text-red-800',
  etisalat_cash: 'bg-orange-100 text-orange-800',
  we_pay: 'bg-purple-100 text-purple-800',
  instapay: 'bg-blue-100 text-blue-800',
  bank_transfer: 'bg-gray-100 text-gray-800',
};

export default function Sales() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const { data: sales, isLoading } = useListSales({ search });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">{t('nav.sales')}</h2>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Invoice
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
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales?.length ? sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono text-sm font-medium">{sale.invoiceNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium">{sale.customerName}</div>
                      {sale.customerPhone && <div className="text-xs text-muted-foreground">{sale.customerPhone}</div>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_COLORS[sale.paymentMethod] ?? ''}`}>
                        {PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">{sale.total.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right text-green-700">{sale.paidAmount.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right">
                      <span className={sale.dueAmount > 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
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
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
