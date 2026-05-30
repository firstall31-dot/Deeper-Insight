import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUSES = [
  { value: 'received',      label: 'Received' },
  { value: 'inspecting',    label: 'Inspecting' },
  { value: 'repairing',     label: 'Repairing' },
  { value: 'waiting_parts', label: 'Waiting Parts' },
  { value: 'repaired',      label: 'Repaired' },
  { value: 'delivered',     label: 'Delivered' },
];

interface CreateData {
  customerName: string; customerPhone: string; deviceType: string; deviceBrand: string;
  issue: string; password: string; estimatedCost: number; notes: string;
}

interface UpdateData {
  status: string; estimatedCost: number; finalCost: number; notes: string;
}

interface MaintenanceFormProps {
  mode?: 'create' | 'update';
  defaultValues?: Partial<CreateData & UpdateData & { id: number; status: string }>;
  onSubmit: (data: CreateData | UpdateData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MaintenanceForm({ mode = 'create', defaultValues, onSubmit, onCancel, isLoading }: MaintenanceFormProps) {
  const [form, setForm] = useState({
    customerName: defaultValues?.customerName ?? '',
    customerPhone: defaultValues?.customerPhone ?? '',
    deviceType: defaultValues?.deviceType ?? '',
    deviceBrand: defaultValues?.deviceBrand ?? '',
    issue: defaultValues?.issue ?? '',
    password: defaultValues?.password ?? '',
    estimatedCost: defaultValues?.estimatedCost ?? 0,
    finalCost: defaultValues?.finalCost ?? 0,
    notes: defaultValues?.notes ?? '',
    status: defaultValues?.status ?? 'received',
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
      if (!form.customerName.trim()) e.customerName = 'Required';
      if (!form.customerPhone.trim()) e.customerPhone = 'Required';
      if (!form.deviceType.trim()) e.deviceType = 'Required';
      if (!form.issue.trim()) e.issue = 'Required';
    }
    setErrors(e);
    if (!Object.keys(e).length) {
      if (mode === 'update') {
        onSubmit({ status: form.status, estimatedCost: form.estimatedCost, finalCost: form.finalCost, notes: form.notes });
      } else {
        onSubmit({ customerName: form.customerName, customerPhone: form.customerPhone, deviceType: form.deviceType, deviceBrand: form.deviceBrand, issue: form.issue, password: form.password, estimatedCost: form.estimatedCost, notes: form.notes });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {mode === 'update' ? (
        <>
          <div>
            <Label>Status *</Label>
            <Select value={form.status} onValueChange={v => set('status', v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Estimated Cost (EGP)</Label>
              <Input type="number" min={0} className="mt-1" value={form.estimatedCost} onChange={e => set('estimatedCost', +e.target.value)} />
            </div>
            <div>
              <Label>Final Cost (EGP)</Label>
              <Input type="number" min={0} className="mt-1" value={form.finalCost} onChange={e => set('finalCost', +e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea className="mt-1 resize-none" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Customer Name *</Label>
              <Input className="mt-1" value={form.customerName} onChange={e => set('customerName', e.target.value)} placeholder="Ahmed Mohamed" />
              {errors.customerName && <p className="text-xs text-destructive mt-1">{errors.customerName}</p>}
            </div>
            <div>
              <Label>Customer Phone *</Label>
              <Input className="mt-1" value={form.customerPhone} onChange={e => set('customerPhone', e.target.value)} placeholder="01234567890" />
              {errors.customerPhone && <p className="text-xs text-destructive mt-1">{errors.customerPhone}</p>}
            </div>
            <div>
              <Label>Device Type *</Label>
              <Input className="mt-1" value={form.deviceType} onChange={e => set('deviceType', e.target.value)} placeholder="Mobile / Tablet / Laptop" />
              {errors.deviceType && <p className="text-xs text-destructive mt-1">{errors.deviceType}</p>}
            </div>
            <div>
              <Label>Device Brand</Label>
              <Input className="mt-1" value={form.deviceBrand} onChange={e => set('deviceBrand', e.target.value)} placeholder="Samsung / Apple / Xiaomi" />
            </div>
            <div className="col-span-2">
              <Label>Issue Description *</Label>
              <Textarea className="mt-1 resize-none" rows={2} value={form.issue} onChange={e => set('issue', e.target.value)} placeholder="Screen cracked, battery not charging..." />
              {errors.issue && <p className="text-xs text-destructive mt-1">{errors.issue}</p>}
            </div>
            <div>
              <Label>Device Password</Label>
              <Input className="mt-1" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <Label>Estimated Cost (EGP)</Label>
              <Input type="number" min={0} className="mt-1" value={form.estimatedCost} onChange={e => set('estimatedCost', +e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea className="mt-1 resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes..." />
            </div>
          </div>
        </>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving…' : mode === 'update' ? 'Update Status' : 'Create Ticket'}</Button>
      </div>
    </form>
  );
}
