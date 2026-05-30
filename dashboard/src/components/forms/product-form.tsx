import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = ['mobiles_new','mobiles_used','accessories','cases','chargers','headphones','cables','powerbanks','screens','batteries','tools','other'];

interface FormData {
  name: string; nameAr: string; code: string; category: string; barcode: string;
  purchasePrice: number; salePrice: number; minSalePrice: number; quantity: number; alertQuantity: number;
}

interface ProductFormProps {
  defaultValues?: any;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProductForm({ defaultValues, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [form, setForm] = useState<FormData>({
    name: defaultValues?.name ?? '',
    nameAr: defaultValues?.nameAr ?? '',
    code: defaultValues?.code ?? '',
    category: defaultValues?.category ?? '',
    barcode: defaultValues?.barcode ?? '',
    purchasePrice: defaultValues?.purchasePrice ?? 0,
    salePrice: defaultValues?.salePrice ?? 0,
    minSalePrice: defaultValues?.minSalePrice ?? 0,
    quantity: defaultValues?.quantity ?? 0,
    alertQuantity: defaultValues?.alertQuantity ?? 5,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.code.trim()) e.code = 'Required';
    if (!form.category) e.category = 'Required';
    if (form.salePrice <= 0) e.salePrice = 'Must be > 0';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (ev: React.FormEvent) => { ev.preventDefault(); if (validate()) onSubmit(form); };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <Label>Name (EN) *</Label>
          <Input className="mt-1" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Samsung Galaxy A55" />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label>Name (AR)</Label>
          <Input className="mt-1 text-right" dir="rtl" value={form.nameAr} onChange={e => set('nameAr', e.target.value)} placeholder="سامسونج جالاكسي" />
        </div>
        <div>
          <Label>Code / SKU *</Label>
          <Input className="mt-1 font-mono" value={form.code} onChange={e => set('code', e.target.value)} placeholder="SAM-A55" />
          {errors.code && <p className="text-xs text-destructive mt-1">{errors.code}</p>}
        </div>
        <div>
          <Label>Barcode</Label>
          <Input className="mt-1 font-mono" value={form.barcode} onChange={e => set('barcode', e.target.value)} placeholder="1234567890" />
        </div>
        <div className="col-span-2">
          <Label>Category *</Label>
          <Select value={form.category} onValueChange={v => set('category', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
        </div>
        <div>
          <Label>Purchase Price (EGP)</Label>
          <Input type="number" min={0} step="0.01" className="mt-1" value={form.purchasePrice} onChange={e => set('purchasePrice', +e.target.value)} />
        </div>
        <div>
          <Label>Sale Price (EGP) *</Label>
          <Input type="number" min={0} step="0.01" className="mt-1" value={form.salePrice} onChange={e => set('salePrice', +e.target.value)} />
          {errors.salePrice && <p className="text-xs text-destructive mt-1">{errors.salePrice}</p>}
        </div>
        <div>
          <Label>Min Sale Price (EGP)</Label>
          <Input type="number" min={0} step="0.01" className="mt-1" value={form.minSalePrice} onChange={e => set('minSalePrice', +e.target.value)} />
        </div>
        <div>
          <Label>Quantity</Label>
          <Input type="number" min={0} className="mt-1" value={form.quantity} onChange={e => set('quantity', +e.target.value)} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label>Alert Below Qty</Label>
          <Input type="number" min={0} className="mt-1" value={form.alertQuantity} onChange={e => set('alertQuantity', +e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving…' : defaultValues?.id ? 'Update Product' : 'Add Product'}</Button>
      </div>
    </form>
  );
}
