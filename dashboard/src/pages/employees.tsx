import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { UserCircle, Trash2, Edit2, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useListEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee,
  getListEmployeesQueryKey, type Employee,
} from '@workspace/api-client-react';
import { useTableState } from '@/hooks/use-table-state';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader, PageWrapper } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataToolbar } from '@/components/ui/data-toolbar';
import { DataPagination } from '@/components/ui/data-pagination';
import { FormModal } from '@/components/ui/form-modal';
import { EmployeeForm } from '@/components/forms/employee-form';

const SORT_OPTIONS = [
  { label: 'Name', value: 'name' },
  { label: 'Role', value: 'role' },
  { label: 'Salary', value: 'salary', numeric: true },
];
const ROLES = ['Manager','Sales Representative','Technician','Cashier','Accountant','Security','Other'];

export default function Employees() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const { data: raw, isLoading } = useListEmployees();
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const ts = useTableState(raw, { storageKey: 'employees', pageSize: 15 });
  const [modal, setModal] = useState<{ open: boolean; item?: Employee }>({ open: false });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getListEmployeesQueryKey() });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    try {
      if (modal.item) {
        await updateMutation.mutateAsync({ id: modal.item.id, data });
        toast.success('Employee updated');
      } else {
        await createMutation.mutateAsync({ data });
        toast.success('Employee added');
      }
      await invalidate();
      setModal({ open: false });
    } catch { toast.error('Failed to save employee'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast.success('Employee deleted');
      await invalidate();
    } catch { toast.error('Failed to delete employee'); }
    finally { setDeleteId(null); }
  };

  return (
    <PageWrapper>
      <PageHeader icon={UserCircle} title={t('nav.employees')} onAdd={() => setModal({ open: true })} />

      <DataToolbar
        search={ts.search} onSearch={ts.setSearch}
        view={ts.view} onView={ts.setView}
        sort={ts.sort} sortDir={ts.sortDir} onSort={ts.setSort} sortOptions={SORT_OPTIONS}
        filterConfigs={[{ key: 'role', label: 'Role', options: ROLES.map(r => ({ label: r, value: r })) }]}
        filters={ts.filters} onFilter={ts.setFilter} onClearFilters={ts.clearFilters}
        hasActiveFilters={ts.hasActiveFilters} total={ts.total}
      />

      {ts.view === 'table' ? (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="ps-4">Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Salary</TableHead>
                  <TableHead className="text-right">Advances</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net Pay</TableHead>
                  <TableHead className="w-20 pe-4" />
                </TableRow>
                {isLoading && <TableSkeleton cols={8} rows={6} />}
              </TableHeader>
              <TableBody>
                {ts.data.map(emp => {
                  const net = emp.salary - (emp.advances ?? 0) - (emp.deductions ?? 0);
                  return (
                    <TableRow key={emp.id} className="group">
                      <TableCell className="ps-4 font-medium">{emp.name}</TableCell>
                      <TableCell className="text-muted-foreground">{emp.phone}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{emp.role}</Badge></TableCell>
                      <TableCell className="text-right">{emp.salary.toLocaleString()} EGP</TableCell>
                      <TableCell className="text-right text-amber-600">{(emp.advances ?? 0).toLocaleString()} EGP</TableCell>
                      <TableCell className="text-right text-destructive">{(emp.deductions ?? 0).toLocaleString()} EGP</TableCell>
                      <TableCell className="text-right font-semibold">
                        <span className={net < 0 ? 'text-destructive' : 'text-green-700'}>{net.toLocaleString()} EGP</span>
                      </TableCell>
                      <TableCell className="pe-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setModal({ open: true, item: emp })}><Edit2 className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(emp.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!isLoading && ts.data.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No employees found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({length:4}).map((_,i) => <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></CardContent></Card>)
            : ts.data.map(emp => {
                const net = emp.salary - (emp.advances ?? 0) - (emp.deductions ?? 0);
                return (
                  <Card key={emp.id} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold">{emp.name}</p>
                        <Badge variant="outline" className="text-xs">{emp.role}</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Phone className="h-3.5 w-3.5"/>{emp.phone}</div>
                      <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                        <div><p className="text-xs text-muted-foreground">Salary</p><p className="font-medium">{emp.salary.toLocaleString()} EGP</p></div>
                        <div><p className="text-xs text-muted-foreground">Net Pay</p><p className={`font-semibold ${net < 0 ? 'text-destructive' : 'text-green-700'}`}>{net.toLocaleString()} EGP</p></div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1" onClick={() => setModal({ open: true, item: emp })}><Edit2 className="h-3 w-3"/>Edit</Button>
                        <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1 text-destructive border-destructive/30" onClick={() => setDeleteId(emp.id)}><Trash2 className="h-3 w-3"/>Del</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          {!isLoading && ts.data.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No employees found</div>}
        </div>
      )}

      <DataPagination page={ts.page} totalPages={ts.totalPages} total={ts.total} pageSize={ts.pageSize} onPage={ts.setPage} />

      <FormModal open={modal.open} onOpenChange={o => !o && setModal({ open: false })} title={modal.item ? 'Edit Employee' : 'Add Employee'}>
        <EmployeeForm defaultValues={modal.item} onSubmit={handleSubmit} onCancel={() => setModal({ open: false })} isLoading={createMutation.isPending || updateMutation.isPending} />
      </FormModal>

      <ConfirmDialog
        open={deleteId !== null} onOpenChange={o => !o && setDeleteId(null)}
        onConfirm={handleDelete} loading={deleteMutation.isPending}
        title="Delete employee?" description="This will permanently remove the employee record."
      />
    </PageWrapper>
  );
}
