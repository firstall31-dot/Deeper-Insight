import { useLanguage } from '@/contexts/LanguageContext';
import { useListExpenses, useDeleteExpense, getListExpensesQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Receipt, Trash2 } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  rent: 'Rent',
  electricity: 'Electricity',
  water: 'Water',
  internet: 'Internet',
  salaries: 'Salaries',
  supplies: 'Supplies',
  maintenance: 'Maintenance',
  other: 'Other',
};

export default function Expenses() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: expenses, isLoading } = useListExpenses();
  const deleteExpense = useDeleteExpense();

  const handleDelete = (id: number) => {
    if (confirm('Delete this expense?')) {
      deleteExpense.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() }),
      });
    }
  };

  const total = expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Receipt className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">{t('nav.expenses')}</h2>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('common.add')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Expenses</div>
            <div className="text-2xl font-bold text-destructive mt-1">{total.toLocaleString()} EGP</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses?.length ? expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {CATEGORY_LABELS[expense.category] ?? expense.category}
                      </span>
                    </TableCell>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{expense.notes ?? '—'}</TableCell>
                    <TableCell className="text-right font-medium text-destructive">{expense.amount.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(expense.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No expenses found.</TableCell>
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
