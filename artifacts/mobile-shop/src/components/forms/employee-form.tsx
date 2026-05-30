import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ROLES = ['Manager','Sales Representative','Technician','Cashier','Accountant','Security','Other'];

interface FormData {
  name: string; phone: string; role: string; salary: number;
  advances: number; deductions: number;
}

interface EmployeeFormProps {
  defaultValues?: Partial<FormData & { id: number }>;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EmployeeForm({ defaultValues, onSubmit, onCancel, isLoading }: EmployeeFormProps) {
  const [form, setForm] = useState<FormData>({
    name: defaultValues?.name ?? '',
    phone: defaultValues?.phone ?? '',
    role: defaultValues?.role ?? '',
    salary: defaultValues?.salary ?? 0,
    advances: defaultValues?.advances ?? 0,
    deductions: defaultValues?.deductions ?? 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.role) e.role = 'Required';
    if (form.salary <= 0) e.salary = 'Must be > 0';
    setErrors(e);
    if (!Object.keys(e).length) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <Label>Full Name *</Label>
          <Input className="mt-1" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Omar Hassan" />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label>Phone *</Label>
          <Input className="mt-1" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="01234567890" />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
        </div>
        <div className="col-span-2">
          <Label>Role *</Label>
          <Select value={form.role} onValueChange={v => set('role', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select role" /></SelectTrigger>
            <SelectContent>
              {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.role && <p className="text-xs text-destructive mt-1">{errors.role}</p>}
        </div>
        <div>
          <Label>Monthly Salary (EGP) *</Label>
          <Input type="number" min={0} className="mt-1" value={form.salary} onChange={e => set('salary', +e.target.value)} />
          {errors.salary && <p className="text-xs text-destructive mt-1">{errors.salary}</p>}
        </div>
        <div>
          <Label>Advances (EGP)</Label>
          <Input type="number" min={0} className="mt-1" value={form.advances} onChange={e => set('advances', +e.target.value)} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label>Deductions (EGP)</Label>
          <Input type="number" min={0} className="mt-1" value={form.deductions} onChange={e => set('deductions', +e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving…' : defaultValues?.id ? 'Update Employee' : 'Add Employee'}</Button>
      </div>
    </form>
  );
}
