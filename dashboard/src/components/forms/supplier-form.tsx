import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FormData { name: string; phone: string; address: string; }

interface SupplierFormProps {
  defaultValues?: any;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SupplierForm({ defaultValues, onSubmit, onCancel, isLoading }: SupplierFormProps) {
  const [form, setForm] = useState<FormData>({
    name: defaultValues?.name ?? '',
    phone: defaultValues?.phone ?? '',
    address: defaultValues?.address ?? '',
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
      <div>
        <Label>Supplier Name *</Label>
        <Input className="mt-1" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Al-Nour Trading" />
        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
      </div>
      <div>
        <Label>Phone *</Label>
        <Input className="mt-1" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="01234567890" />
        {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
      </div>
      <div>
        <Label>Address</Label>
        <Textarea className="mt-1 resize-none" rows={2} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Cairo, Egypt" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving…' : defaultValues?.id ? 'Update Supplier' : 'Add Supplier'}</Button>
      </div>
    </form>
  );
}
