import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FormData { name: string; phone: string; address: string; nationalId: string; notes: string; }

interface CustomerFormProps {
  defaultValues?: Partial<FormData & { id: number }>;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CustomerForm({ defaultValues, onSubmit, onCancel, isLoading }: CustomerFormProps) {
  const [form, setForm] = useState<FormData>({
    name: defaultValues?.name ?? '',
    phone: defaultValues?.phone ?? '',
    address: defaultValues?.address ?? '',
    nationalId: defaultValues?.nationalId ?? '',
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
    if (!form.name.trim()) e.name = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    setErrors(e);
    if (!Object.keys(e).length) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <Label>Full Name *</Label>
          <Input className="mt-1" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ahmed Mohamed" />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label>Phone *</Label>
          <Input className="mt-1" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="01234567890" />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
        </div>
        <div className="col-span-2">
          <Label>Address</Label>
          <Input className="mt-1" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Cairo, Egypt" />
        </div>
        <div className="col-span-2">
          <Label>National ID</Label>
          <Input className="mt-1 font-mono" value={form.nationalId} onChange={e => set('nationalId', e.target.value)} placeholder="12345678901234" />
        </div>
        <div className="col-span-2">
          <Label>Notes</Label>
          <Textarea className="mt-1 resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional notes..." />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving…' : defaultValues?.id ? 'Update Customer' : 'Add Customer'}</Button>
      </div>
    </form>
  );
}
