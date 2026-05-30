import { type LucideIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  onAdd?: () => void;
  addLabel?: string;
  search?: string;
  onSearch?: (v: string) => void;
  children?: React.ReactNode;
}

export function PageHeader({
  icon: Icon,
  title,
  onAdd,
  addLabel,
  search,
  onSearch,
  children,
}: PageHeaderProps) {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {children}
          {onAdd && (
            <Button onClick={onAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              {addLabel ?? t('common.add')}
            </Button>
          )}
        </div>
      </div>

      {onSearch !== undefined && (
        <div className="relative w-full max-w-sm">
          <Search
            className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none`}
          />
          <Input
            placeholder={t('common.search')}
            value={search ?? ''}
            onChange={(e) => onSearch(e.target.value)}
            className={language === 'ar' ? 'pr-9' : 'pl-9'}
          />
        </div>
      )}
    </div>
  );
}

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="space-y-6"
    >
      {children}
    </motion.div>
  );
}
