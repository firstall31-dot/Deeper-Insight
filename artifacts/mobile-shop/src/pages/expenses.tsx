import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useListExpenses, useDeleteExpense, getListExpensesQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Receipt, Trash2 } from 'lucide-react';
import { PageHeader, PageWrapper } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

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
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: expenses, isLoading } = useListExpenses();
  const deleteExpense = useDeleteExpense();

  const total = expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;

  return (
    <PageWrapper>
      <PageHeader
        icon={Receipt}
        title={t('nav.expenses')}
        onAdd={() => {}}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Expenses</div>
            <div className="text-2xl font-bold text-destructive mt-1">{total.toLocaleString()} EGP</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="ps-4">Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right pe-4">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableSkeleton rows={5} cols={5} />
            ) : (
              <TableBody>
                {expenses?.length ? expenses.map((expense) => (
                  <TableRow key={expense.id} className="group">
                    <TableCell className="ps-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                        {CATEGORY_LABELS[expense.category] ?? expense.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{expense.date}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{expense.notes ?? '—'}</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">
                      {expense.amount.toLocaleString()} EGP
                    </TableCell>
                    <TableCell className="text-right pe-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setDeleteId(expense.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No expenses found.
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
          deleteExpense.mutate({ id: deleteId }, {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
              toast.success('Expense deleted');
              setDeleteId(null);
            },
            onError: () => toast.error('Failed to delete expense'),
          });
        }}
        loading={deleteExpense.isPending}
        title="Delete expense?"
        description="This will permanently remove this expense record."
      />
    </PageWrapper>
  );
}
