import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Receipt, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useListExpenses, useCreateExpense, useDeleteExpense,
  getListExpensesQueryKey,
} from '@workspace/api-client-react';
import { useTableState } from '@/hooks/use-table-state';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PageHeader, PageWrapper } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataToolbar } from '@/components/ui/data-toolbar';
import { DataPagination } from '@/components/ui/data-pagination';
import { FormModal } from '@/components/ui/form-modal';
import { ExpenseForm } from '@/components/forms/expense-form';

const CATEGORY_LABELS: Record<string, string> = {
  rent:'Rent', electricity:'Electricity', water:'Water', internet:'Internet',
  salaries:'Salaries', supplies:'Supplies', maintenance:'Maintenance', other:'Other',
};
const CATEGORY_COLORS: Record<string, string> = {
  rent:         'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  electricity:  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  water:        'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  internet:     'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  salaries:     'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  supplies:     'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  maintenance:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  other:        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const SORT_OPTIONS = [
  { label: 'Date', value: 'date' },
  { label: 'Category', value: 'category' },
  { label: 'Amount', value: 'amount', numeric: true },
];
const CATEGORIES = Object.keys(CATEGORY_LABELS);

export default function Expenses() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const { data: raw, isLoading } = useListExpenses();
  const createMutation = useCreateExpense();
  const deleteMutation = useDeleteExpense();

  const ts = useTableState(raw, { storageKey: 'expenses', pageSize: 15 });
  const [modal, setModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getListExpensesQueryKey() });

  const total = (raw ?? []).reduce((s, e) => s + e.amount, 0);
  const totalFiltered = ts.allData.reduce((s, e) => s + e.amount, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync({ data });
      toast.success('Expense added');
      await invalidate();
      setModal(false);
    } catch { toast.error('Failed to add expense'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast.success('Expense deleted');
      await invalidate();
    } catch { toast.error('Failed to delete expense'); }
    finally { setDeleteId(null); }
  };

  return (
    <PageWrapper>
      <PageHeader icon={Receipt} title={t('nav.expenses')} onAdd={() => setModal(true)} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold text-destructive mt-1">{total.toLocaleString()} EGP</p>
          </CardContent>
        </Card>
        {ts.hasActiveFilters && (
          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground">Filtered Total</p>
              <p className="text-2xl font-bold text-destructive mt-1">{totalFiltered.toLocaleString()} EGP</p>
            </CardContent>
          </Card>
        )}
      </div>

      <DataToolbar
        search={ts.search} onSearch={ts.setSearch}
        view={ts.view} onView={ts.setView}
        sort={ts.sort} sortDir={ts.sortDir} onSort={ts.setSort} sortOptions={SORT_OPTIONS}
        filterConfigs={[{ key: 'category', label: 'Category', options: CATEGORIES.map(c => ({ label: CATEGORY_LABELS[c], value: c })) }]}
        filters={ts.filters} onFilter={ts.setFilter} onClearFilters={ts.clearFilters}
        hasActiveFilters={ts.hasActiveFilters} total={ts.total}
      />

      {ts.view === 'table' ? (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="ps-4">Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-16 pe-4" />
                </TableRow>
                {isLoading && <TableSkeleton cols={5} rows={8} />}
              </TableHeader>
              <TableBody>
                {ts.data.map(e => (
                  <TableRow key={e.id} className="group">
                    <TableCell className="ps-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[e.category] ?? CATEGORY_COLORS.other}`}>
                        {CATEGORY_LABELS[e.category] ?? e.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.date}</TableCell>
                    <TableCell className="text-muted-foreground text-sm truncate max-w-[200px]">{e.notes ?? '—'}</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">{e.amount.toLocaleString()} EGP</TableCell>
                    <TableCell className="pe-4 text-right">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setDeleteId(e.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && ts.data.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No expenses found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ts.data.map(e => (
            <Card key={e.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[e.category] ?? CATEGORY_COLORS.other}`}>
                    {CATEGORY_LABELS[e.category] ?? e.category}
                  </span>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setDeleteId(e.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xl font-bold text-destructive">{e.amount.toLocaleString()} EGP</p>
                <p className="text-xs text-muted-foreground">{e.date}</p>
                {e.notes && <p className="text-sm text-muted-foreground">{e.notes}</p>}
              </CardContent>
            </Card>
          ))}
          {ts.data.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No expenses found</div>}
        </div>
      )}

      <DataPagination page={ts.page} totalPages={ts.totalPages} total={ts.total} pageSize={ts.pageSize} onPage={ts.setPage} />

      <FormModal open={modal} onOpenChange={setModal} title="Add Expense">
        <ExpenseForm onSubmit={handleSubmit} onCancel={() => setModal(false)} isLoading={createMutation.isPending} />
      </FormModal>

      <ConfirmDialog
        open={deleteId !== null} onOpenChange={o => !o && setDeleteId(null)}
        onConfirm={handleDelete} loading={deleteMutation.isPending}
        title="Delete expense?" description="This will permanently remove this expense record."
      />
    </PageWrapper>
  );
}
