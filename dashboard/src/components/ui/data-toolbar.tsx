import { Search, LayoutList, LayoutGrid, SlidersHorizontal, X, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ViewMode, SortDir, SortOption, FilterOption } from '@/hooks/use-table-state';

interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface DataToolbarProps {
  search: string;
  onSearch: (v: string) => void;
  view: ViewMode;
  onView: (v: ViewMode) => void;
  sort?: string;
  sortDir?: SortDir;
  onSort?: (field: string) => void;
  sortOptions?: SortOption[];
  filterConfigs?: FilterConfig[];
  filters?: Record<string, string>;
  onFilter?: (key: string, value: string) => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  total?: number;
  pageSize?: number;
  page?: number;
}

export function DataToolbar({
  search,
  onSearch,
  view,
  onView,
  sort,
  sortDir,
  onSort,
  sortOptions = [],
  filterConfigs = [],
  filters = {},
  onFilter,
  onClearFilters,
  hasActiveFilters,
  total,
}: DataToolbarProps) {
  const { t, language } = useLanguage();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[160px] max-w-sm">
          <Search
            className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none`}
          />
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={e => onSearch(e.target.value)}
            className={`h-9 ${language === 'ar' ? 'pr-9' : 'pl-9'}`}
          />
          {search && (
            <button
              onClick={() => onSearch('')}
              className={`absolute ${language === 'ar' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 h-5 w-5 rounded-sm flex items-center justify-center text-muted-foreground hover:text-foreground`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        {sortOptions.length > 0 && onSort && (
          <Select
            value={sort ?? ''}
            onValueChange={onSort}
          >
            <SelectTrigger className="h-9 w-auto min-w-[130px] gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Sort by" />
              {sort && sortDir && (
                sortDir === 'asc'
                  ? <ChevronUp className="h-3 w-3 text-muted-foreground ms-auto" />
                  : <ChevronDown className="h-3 w-3 text-muted-foreground ms-auto" />
              )}
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Filters */}
        {filterConfigs.map(fc => (
          <Select
            key={fc.key}
            value={filters[fc.key] ?? ''}
            onValueChange={v => onFilter?.(fc.key, v === '_all' ? '' : v)}
          >
            <SelectTrigger className="h-9 w-auto min-w-[110px]">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0 me-1" />
              <SelectValue placeholder={fc.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All {fc.label}</SelectItem>
              {fc.options.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-9 gap-1.5 text-muted-foreground">
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Count */}
        {total !== undefined && (
          <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1 px-2">
            <Badge variant="secondary" className="font-mono text-[11px] h-5 px-1.5">{total}</Badge>
            records
          </span>
        )}

        {/* View toggle */}
        <div className="flex items-center border rounded-lg overflow-hidden divide-x divide-border h-9">
          <button
            onClick={() => onView('table')}
            className={`flex items-center justify-center h-9 w-9 transition-colors ${
              view === 'table' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
            title="Table view"
          >
            <LayoutList className="h-4 w-4" />
          </button>
          <button
            onClick={() => onView('card')}
            className={`flex items-center justify-center h-9 w-9 transition-colors ${
              view === 'card' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
            title="Card view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
