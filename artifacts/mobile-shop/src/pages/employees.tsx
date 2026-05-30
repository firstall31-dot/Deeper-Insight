import { useLanguage } from '@/contexts/LanguageContext';
import { useListEmployees, useDeleteEmployee, getListEmployeesQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Users, Trash2, Edit } from 'lucide-react';

export default function Employees() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: employees, isLoading } = useListEmployees();
  const deleteEmployee = useDeleteEmployee();

  const handleDelete = (id: number) => {
    if (confirm('Delete this employee?')) {
      deleteEmployee.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListEmployeesQueryKey() }),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">{t('nav.employees')}</h2>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('common.add')}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Salary</TableHead>
                  <TableHead className="text-right">Advances</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees?.length ? employees.map((emp) => {
                  const net = emp.salary - (emp.advances ?? 0) - (emp.deductions ?? 0);
                  return (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell>{emp.phone ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{emp.role}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{emp.salary.toLocaleString()} EGP</TableCell>
                      <TableCell className="text-right text-destructive">{(emp.advances ?? 0).toLocaleString()} EGP</TableCell>
                      <TableCell className="text-right text-destructive">{(emp.deductions ?? 0).toLocaleString()} EGP</TableCell>
                      <TableCell className="text-right font-medium">{net.toLocaleString()} EGP</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(emp.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No employees found.</TableCell>
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
