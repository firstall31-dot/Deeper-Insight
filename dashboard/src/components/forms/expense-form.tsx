import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = [
  { value: 'rent', label: 'Rent' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'water', label: 'Water' },
  { value: 'internet', label: 'Internet' },
  { value: 'salaries', label: 'Salaries' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'other', label: 'Other' },
];

interface FormData { category: string; amount: number; date: string; notes: string; }

interface ExpenseFormProps {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ExpenseForm({ defaultValues, onSubmit, onCancel, isLoading }: ExpenseFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<FormData>({
    category: defaultValues?.category ?? '',
    amount: defaultValues?.amount ?? 0,
    date: defaultValues?.date ?? today,
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
    if (!form.category) e.category = 'Required';
    if (form.amount <= 0) e.amount = 'Must be > 0';
    if (!form.date) e.date = 'Required';
    setErrors(e);
    if (!Object.keys(e).length) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div>
        <Label>Category *</Label>
        <Select value={form.category} onValueChange={v => set('category', v)}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Amount (EGP) *</Label>
          <Input type="number" min={0} step="0.01" className="mt-1" value={form.amount} onChange={e => set('amount', +e.target.value)} />
          {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
        </div>
        <div>
          <Label>Date *</Label>
          <Input type="date" className="mt-1" value={form.date} onChange={e => set('date', e.target.value)} />
          {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
        </div>
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea className="mt-1 resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes..." />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving…' : 'Add Expense'}</Button>
      </div>
    </form>
  );
}
