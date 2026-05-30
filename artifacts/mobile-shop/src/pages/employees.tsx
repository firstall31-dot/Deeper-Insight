import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useListEmployees, useDeleteEmployee, getListEmployeesQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCircle, Trash2, Edit } from 'lucide-react';
import { PageHeader, PageWrapper } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function Employees() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: employees, isLoading } = useListEmployees();
  const deleteEmployee = useDeleteEmployee();

  return (
    <PageWrapper>
      <PageHeader
        icon={UserCircle}
        title={t('nav.employees')}
        onAdd={() => {}}
      />

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
                <TableHead className="text-right">Net</TableHead>
                <TableHead className="text-right pe-4">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableSkeleton rows={4} cols={8} />
            ) : (
              <TableBody>
                {employees?.length ? employees.map((emp) => {
                  const net = emp.salary - (emp.advances ?? 0) - (emp.deductions ?? 0);
                  return (
                    <TableRow key={emp.id} className="group">
                      <TableCell className="ps-4 font-medium">{emp.name}</TableCell>
                      <TableCell>{emp.phone ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{emp.role}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{emp.salary.toLocaleString()} EGP</TableCell>
                      <TableCell className="text-right text-destructive">{(emp.advances ?? 0).toLocaleString()} EGP</TableCell>
                      <TableCell className="text-right text-destructive">{(emp.deductions ?? 0).toLocaleString()} EGP</TableCell>
                      <TableCell className="text-right font-semibold">
                        <span className={net < 0 ? 'text-destructive' : ''}>{net.toLocaleString()} EGP</span>
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
                            onClick={() => setDeleteId(emp.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No employees found.
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
          deleteEmployee.mutate({ id: deleteId }, {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: getListEmployeesQueryKey() });
              toast.success('Employee deleted');
              setDeleteId(null);
            },
            onError: () => toast.error('Failed to delete employee'),
          });
        }}
        loading={deleteEmployee.isPending}
        title="Delete employee?"
        description="This will permanently remove the employee record."
      />
    </PageWrapper>
  );
}
