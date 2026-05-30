import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SERVICE_TYPES = ['Flashing','Unlocking','iCloud Bypass','Screen Repair','Battery Replacement','Data Recovery','Software Update','IMEI Repair','Other'];
const STATUSES = [{ value: 'pending', label: 'Pending' },{ value: 'in_progress', label: 'In Progress' },{ value: 'done', label: 'Done' }];

interface FormData {
  serviceType: string; customerName: string; customerPhone: string;
  deviceBrand: string; deviceModel: string; cost: number; salePrice: number;
  status: string; notes: string;
}

interface SoftwareFormProps {
  defaultValues?: any;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SoftwareForm({ defaultValues, onSubmit, onCancel, isLoading }: SoftwareFormProps) {
  const [form, setForm] = useState<FormData>({
    serviceType: defaultValues?.serviceType ?? '',
    customerName: defaultValues?.customerName ?? '',
    customerPhone: defaultValues?.customerPhone ?? '',
    deviceBrand: defaultValues?.deviceBrand ?? '',
    deviceModel: defaultValues?.deviceModel ?? '',
    cost: defaultValues?.cost ?? 0,
    salePrice: defaultValues?.salePrice ?? 0,
    status: defaultValues?.status ?? 'pending',
    notes: defaultValues?.notes ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!form.serviceType) e.serviceType = 'Required';
    if (!form.customerName.trim()) e.customerName = 'Required';
    if (!form.customerPhone.trim()) e.customerPhone = 'Required';
    setErrors(e);
    if (!Object.keys(e).length) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>Service Type *</Label>
          <Select value={form.serviceType} onValueChange={v => set('serviceType', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select service" /></SelectTrigger>
            <SelectContent>{SERVICE_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          {errors.serviceType && <p className="text-xs text-destructive mt-1">{errors.serviceType}</p>}
        </div>
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
          <Label>Device Brand</Label>
          <Input className="mt-1" value={form.deviceBrand} onChange={e => set('deviceBrand', e.target.value)} placeholder="Samsung" />
        </div>
        <div>
          <Label>Device Model</Label>
          <Input className="mt-1" value={form.deviceModel} onChange={e => set('deviceModel', e.target.value)} placeholder="Galaxy A55" />
        </div>
        <div>
          <Label>Cost (EGP)</Label>
          <Input type="number" min={0} className="mt-1" value={form.cost} onChange={e => set('cost', +e.target.value)} />
        </div>
        <div>
          <Label>Sale Price (EGP)</Label>
          <Input type="number" min={0} className="mt-1" value={form.salePrice} onChange={e => set('salePrice', +e.target.value)} />
        </div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => set('status', v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Label>Notes</Label>
          <Textarea className="mt-1 resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes..." />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving…' : defaultValues?.id ? 'Update Service' : 'Add Service'}</Button>
      </div>
    </form>
  );
}
