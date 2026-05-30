import { useState, useMemo, useCallback } from 'react';

export type ViewMode = 'table' | 'card';
export type SortDir = 'asc' | 'desc';

export interface SortOption {
  label: string;
  value: string;
  numeric?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
}

interface UseTableStateOptions {
  pageSize?: number;
  storageKey?: string;
  defaultSort?: string;
  defaultView?: ViewMode;
}

export function useTableState<T extends object>(
  data: T[] | undefined,
  options: UseTableStateOptions = {}
) {
  const { pageSize = 15, storageKey, defaultSort = '', defaultView = 'table' } = options;

  const [search, setSearchRaw] = useState('');
  const [sort, setSortRaw] = useState(defaultSort);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPageRaw] = useState(1);
  const [view, setViewRaw] = useState<ViewMode>(() => {
    if (storageKey) {
      return (localStorage.getItem(`tbl:${storageKey}`) as ViewMode) ?? defaultView;
    }
    return defaultView;
  });

  const setSearch = useCallback((v: string) => {
    setSearchRaw(v);
    setPageRaw(1);
  }, []);

  const setSort = useCallback((field: string) => {
    setSortRaw(prev => {
      if (prev === field) {
        setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        return field;
      }
      setSortDir('asc');
      return field;
    });
    setPageRaw(1);
  }, []);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters(prev =>
      value ? { ...prev, [key]: value } : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key))
    );
    setPageRaw(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchRaw('');
    setPageRaw(1);
  }, []);

  const setView = useCallback((v: ViewMode) => {
    setViewRaw(v);
    if (storageKey) localStorage.setItem(`tbl:${storageKey}`, v);
  }, [storageKey]);

  const setPage = useCallback((p: number) => setPageRaw(p), []);

  const processed = useMemo(() => {
    let result = data ?? [];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(item =>
        Object.values(item).some(v => v !== null && v !== undefined && String(v).toLowerCase().includes(q))
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => String((item as Record<string, unknown>)[key]) === value);
      }
    });

    if (sort) {
      result = [...result].sort((a, b) => {
        const va = (a as Record<string, unknown>)[sort];
        const vb = (b as Record<string, unknown>)[sort];
        const cmp =
          typeof va === 'number' && typeof vb === 'number'
            ? va - vb
            : String(va ?? '').localeCompare(String(vb ?? ''), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [data, search, filters, sort, sortDir]);

  const total = processed.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedData = processed.slice((safePage - 1) * pageSize, safePage * pageSize);

  return {
    search,
    setSearch,
    sort,
    sortDir,
    setSort,
    filters,
    setFilter,
    clearFilters,
    view,
    setView,
    page: safePage,
    setPage,
    pageSize,
    total,
    totalPages,
    data: pagedData,
    allData: processed,
    hasActiveFilters: !!search || Object.values(filters).some(Boolean),
  } as const;
}
