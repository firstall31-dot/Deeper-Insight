import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FormData {
  brand: string; model: string; color: string; storage: string;
  imei1: string; imei2: string; serialNumber: string;
  condition: 'new' | 'used'; purchaseDate: string;
  purchasePrice: number; salePrice: number;
}

interface DeviceFormProps {
  defaultValues?: any;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeviceForm({ defaultValues, onSubmit, onCancel, isLoading }: DeviceFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<FormData>({
    brand: defaultValues?.brand ?? '',
    model: defaultValues?.model ?? '',
    color: defaultValues?.color ?? '',
    storage: defaultValues?.storage ?? '',
    imei1: defaultValues?.imei1 ?? '',
    imei2: defaultValues?.imei2 ?? '',
    serialNumber: defaultValues?.serialNumber ?? '',
    condition: defaultValues?.condition ?? 'new',
    purchaseDate: defaultValues?.purchaseDate ?? today,
    purchasePrice: defaultValues?.purchasePrice ?? 0,
    salePrice: defaultValues?.salePrice ?? 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!form.brand.trim()) e.brand = 'Required';
    if (!form.model.trim()) e.model = 'Required';
    if (!form.imei1.trim()) e.imei1 = 'Required';
    if (!form.purchaseDate) e.purchaseDate = 'Required';
    if (form.purchasePrice <= 0) e.purchasePrice = 'Must be > 0';
    setErrors(e);
    if (!Object.keys(e).length) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Brand *</Label>
          <Input className="mt-1" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Samsung" />
          {errors.brand && <p className="text-xs text-destructive mt-1">{errors.brand}</p>}
        </div>
        <div>
          <Label>Model *</Label>
          <Input className="mt-1" value={form.model} onChange={e => set('model', e.target.value)} placeholder="Galaxy A55" />
          {errors.model && <p className="text-xs text-destructive mt-1">{errors.model}</p>}
        </div>
        <div>
          <Label>Color</Label>
          <Input className="mt-1" value={form.color} onChange={e => set('color', e.target.value)} placeholder="Black" />
        </div>
        <div>
          <Label>Storage</Label>
          <Input className="mt-1" value={form.storage} onChange={e => set('storage', e.target.value)} placeholder="128GB" />
        </div>
        <div>
          <Label>Condition *</Label>
          <Select value={form.condition} onValueChange={v => set('condition', v as 'new' | 'used')}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="used">Used</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Purchase Date *</Label>
          <Input type="date" className="mt-1" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} />
          {errors.purchaseDate && <p className="text-xs text-destructive mt-1">{errors.purchaseDate}</p>}
        </div>
        <div className="col-span-2">
          <Label>IMEI 1 *</Label>
          <Input className="mt-1 font-mono" value={form.imei1} onChange={e => set('imei1', e.target.value)} placeholder="354587000000000" maxLength={15} />
          {errors.imei1 && <p className="text-xs text-destructive mt-1">{errors.imei1}</p>}
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label>IMEI 2</Label>
          <Input className="mt-1 font-mono" value={form.imei2} onChange={e => set('imei2', e.target.value)} placeholder="Optional" maxLength={15} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label>Serial Number</Label>
          <Input className="mt-1 font-mono" value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <Label>Purchase Price (EGP) *</Label>
          <Input type="number" min={0} step="0.01" className="mt-1" value={form.purchasePrice} onChange={e => set('purchasePrice', +e.target.value)} />
          {errors.purchasePrice && <p className="text-xs text-destructive mt-1">{errors.purchasePrice}</p>}
        </div>
        <div>
          <Label>Sale Price (EGP)</Label>
          <Input type="number" min={0} step="0.01" className="mt-1" value={form.salePrice} onChange={e => set('salePrice', +e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving…' : defaultValues?.id ? 'Update Device' : 'Add Device'}</Button>
      </div>
    </form>
  );
}
