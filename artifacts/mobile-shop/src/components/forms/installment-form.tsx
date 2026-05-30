import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Customer } from '@workspace/api-client-react';

interface CreateData {
  customerId: number; deviceName: string; totalAmount: number; downPayment: number;
  installmentAmount: number; totalInstallments: number; startDate: string;
}

interface UpdateData { paidInstallments: number; status: string; }

interface InstallmentFormProps {
  mode?: 'create' | 'update';
  customers?: Customer[];
  defaultValues?: Partial<CreateData & UpdateData & { id: number; totalInstallments: number; paidInstallments: number; status: string }>;
  onSubmit: (data: CreateData | UpdateData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function InstallmentForm({ mode = 'create', customers = [], defaultValues, onSubmit, onCancel, isLoading }: InstallmentFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    customerId: defaultValues?.customerId ?? 0,
    deviceName: defaultValues?.deviceName ?? '',
    totalAmount: defaultValues?.totalAmount ?? 0,
    downPayment: defaultValues?.downPayment ?? 0,
    installmentAmount: defaultValues?.installmentAmount ?? 0,
    totalInstallments: defaultValues?.totalInstallments ?? 12,
    startDate: today,
    paidInstallments: defaultValues?.paidInstallments ?? 0,
    status: defaultValues?.status ?? 'active',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (mode === 'create') {
      if (!form.customerId) e.customerId = 'Required';
      if (!form.deviceName.trim()) e.deviceName = 'Required';
      if (form.totalAmount <= 0) e.totalAmount = 'Must be > 0';
      if (form.installmentAmount <= 0) e.installmentAmount = 'Must be > 0';
      if (form.totalInstallments <= 0) e.totalInstallments = 'Must be > 0';
    }
    setErrors(e);
    if (!Object.keys(e).length) {
      if (mode === 'update') {
        onSubmit({ paidInstallments: form.paidInstallments, status: form.status });
      } else {
        onSubmit({ customerId: form.customerId, deviceName: form.deviceName, totalAmount: form.totalAmount, downPayment: form.downPayment, installmentAmount: form.installmentAmount, totalInstallments: form.totalInstallments, startDate: form.startDate });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {mode === 'update' ? (
        <>
          <div>
            <Label>Installments Paid</Label>
            <Input type="number" min={0} max={defaultValues?.totalInstallments} className="mt-1" value={form.paidInstallments} onChange={e => set('paidInstallments', +e.target.value)} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => set('status', v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      ) : (
        <>
          <div>
            <Label>Customer *</Label>
            <Select value={form.customerId ? String(form.customerId) : ''} onValueChange={v => set('customerId', +v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>
                {customers.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name} – {c.phone}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.customerId && <p className="text-xs text-destructive mt-1">{errors.customerId}</p>}
          </div>
          <div>
            <Label>Device Name *</Label>
            <Input className="mt-1" value={form.deviceName} onChange={e => set('deviceName', e.target.value)} placeholder="iPhone 15 Pro Max 256GB" />
            {errors.deviceName && <p className="text-xs text-destructive mt-1">{errors.deviceName}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Total Amount (EGP) *</Label>
              <Input type="number" min={0} className="mt-1" value={form.totalAmount} onChange={e => set('totalAmount', +e.target.value)} />
              {errors.totalAmount && <p className="text-xs text-destructive mt-1">{errors.totalAmount}</p>}
            </div>
            <div>
              <Label>Down Payment (EGP)</Label>
              <Input type="number" min={0} className="mt-1" value={form.downPayment} onChange={e => set('downPayment', +e.target.value)} />
            </div>
            <div>
              <Label>Monthly Amount (EGP) *</Label>
              <Input type="number" min={0} className="mt-1" value={form.installmentAmount} onChange={e => set('installmentAmount', +e.target.value)} />
              {errors.installmentAmount && <p className="text-xs text-destructive mt-1">{errors.installmentAmount}</p>}
            </div>
            <div>
              <Label>Total Months *</Label>
              <Input type="number" min={1} max={60} className="mt-1" value={form.totalInstallments} onChange={e => set('totalInstallments', +e.target.value)} />
              {errors.totalInstallments && <p className="text-xs text-destructive mt-1">{errors.totalInstallments}</p>}
            </div>
            <div className="col-span-2">
              <Label>Start Date</Label>
              <Input type="date" className="mt-1" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            </div>
          </div>
        </>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving…' : mode === 'update' ? 'Update Plan' : 'Create Plan'}</Button>
      </div>
    </form>
  );
}
