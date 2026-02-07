import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import type { DatasetMeta, DatasetRow } from '../lib/datasets';

const easeOut = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.12,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: easeOut,
    },
  },
};

const formatValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
};

const parseNumeric = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const normalized = String(value).replace(/,/g, '').replace(/[^0-9.-]/g, '');
  const numberValue = Number(normalized);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const formatPrice = (value: string | number | null | undefined): string => {
  const numeric = parseNumeric(value);
  if (numeric === null) return formatValue(value);
  return `Rp ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(numeric)}`;
};

const isBadgeKey = (key: string): boolean =>
  key === 'price_performance' || ['tier', 'rank', 'value'].some((token) => key.includes(token));

const pickHighlightKey = (columns: DatasetMeta['columns']): string | null => {
  const reviewKey = columns.find((column) =>
    ['review', 'notes', 'fitur', 'soundtest'].some((token) => column.key.includes(token))
  )?.key;
  return reviewKey ?? null;
};

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

interface DatasetCardGridProps {
  dataset: DatasetMeta;
  rows: DatasetRow[];
}

export default function DatasetCardGrid({ dataset, rows }: DatasetCardGridProps) {
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState<'name' | 'price-low' | 'price-high'>('name');

  const debouncedSearch = useDebounce(search, 300);

  const primaryKey = dataset.primaryColumn ?? dataset.columns[0]?.key ?? '';
  const priceKey = dataset.priceColumn ?? '';
  const highlightKey = pickHighlightKey(dataset.columns);

  const badgeKeys = dataset.columns
    .filter((column) => isBadgeKey(column.key))
    .map((column) => column.key)
    .slice(0, 2);

  const filteredRows = React.useMemo(() => {
    let items = [...rows];

    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      items = items.filter((row) =>
        dataset.columns.some((column) => {
          const value = row[column.key];
          return value !== null && value !== undefined && String(value).toLowerCase().includes(query);
        })
      );
    }

    switch (sort) {
      case 'price-low':
        if (priceKey) {
          items.sort(
            (a, b) => (parseNumeric(a[priceKey]) ?? Infinity) - (parseNumeric(b[priceKey]) ?? Infinity)
          );
        }
        break;
      case 'price-high':
        if (priceKey) {
          items.sort(
            (a, b) => (parseNumeric(b[priceKey]) ?? 0) - (parseNumeric(a[priceKey]) ?? 0)
          );
        }
        break;
      default:
        items.sort((a, b) => formatValue(a[primaryKey]).localeCompare(formatValue(b[primaryKey])));
        break;
    }

    return items;
  }, [rows, debouncedSearch, sort, dataset.columns, primaryKey, priceKey]);

  const sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    ...(priceKey
      ? [
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
      ]
      : []),
  ];

  const clearSearch = () => setSearch('');

  return (
    <div className="space-y-6">
      {/* Search Bar - Matching TWS Style */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeOut }}
      >
        <div className="glass-panel p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder={`Search ${dataset.label}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-12 py-3.5 text-sm text-mist placeholder:text-white/30 transition-all duration-200 focus:border-limelight/40 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-limelight/20"
                aria-label={`Search ${dataset.label}`}
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-colors"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    aria-label="Clear search"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Sort Dropdown */}
            <div className="relative min-w-[180px]">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-mist appearance-none cursor-pointer transition-all duration-200 focus:border-limelight/40 focus:outline-none focus:ring-2 focus:ring-limelight/20 pr-10"
                aria-label="Sort"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-night text-mist">
                    {option.label}
                  </option>
                ))}
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Results Count */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-limelight/10 border border-limelight/20">
              <span className="text-2xl font-bold text-limelight">{filteredRows.length}</span>
              <span className="text-xs text-limelight/70 uppercase tracking-wider">results</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {filteredRows.length === 0 ? (
          <motion.div
            key="empty"
            className="text-center py-20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-white/50 text-lg font-medium">No entries found</p>
            <p className="text-white/30 text-sm mt-2">Try adjusting your search</p>
          </motion.div>
        ) : (
          <motion.div
            key={`grid-${filteredRows.length}`}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {filteredRows.map((row, index) => {
              const name = formatValue(row[primaryKey]);
              const price = priceKey ? formatPrice(row[priceKey]) : '—';
              const summary = highlightKey ? formatValue(row[highlightKey]) : '';
              const href = dataset.hasSlug && row.slug ? `/dataset/${dataset.key}/${row.slug}` : undefined;

              return (
                <motion.article key={`${row.slug ?? index}-${index}`} variants={item} className="group">
                  <a
                    href={href}
                    className={`block h-full ${href ? 'focus:outline-none focus-visible:ring-2 focus-visible:ring-limelight/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-3xl' : ''}`}
                  >
                    <div className="h-full flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-slate/80 to-graphite border border-white/[0.06] transition-all duration-300 group-hover:border-white/[0.15] group-hover:shadow-card-hover group-hover:-translate-y-1.5 group-active:scale-[0.98]">
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-graphite via-slate to-night flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-br from-limelight/0 to-limelight/0 group-hover:from-limelight/5 group-hover:to-transparent transition-all duration-500" />
                        <div className="absolute top-4 right-4 z-10">
                          <span className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70">
                            {dataset.label}
                          </span>
                        </div>
                        <svg className="w-20 h-20 text-white/15 group-hover:text-white/25 transition-all duration-500 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 3a9 9 0 0 0-9 9v7c0 1.1.9 2 2 2h4v-8H5v-1a7 7 0 0 1 14 0v1h-4v8h4c1.1 0 2-.9 2-2v-7a9 9 0 0 0-9-9z" />
                        </svg>
                      </div>

                      <div className="flex-1 flex flex-col bg-mist rounded-t-3xl -mt-6 relative z-10 p-5">
                        <h3 className="text-lg font-semibold text-ink leading-tight line-clamp-2 group-hover:text-limelight-dim transition-colors duration-200">
                          {name}
                        </h3>

                        {badgeKeys.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {badgeKeys.map((key) => (
                              <span
                                key={key}
                                className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide bg-ink/5 text-ink/70 border border-ink/10"
                              >
                                {formatValue(row[key])}
                              </span>
                            ))}
                          </div>
                        )}

                        {summary && summary !== '—' && (
                          <p className="text-xs text-ink/60 line-clamp-2 leading-relaxed mt-3">
                            {summary}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-ink/[0.06]">
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-ink/40 font-medium mb-0.5">Price</p>
                            <p className="text-base font-bold text-ink">{price}</p>
                          </div>
                          {href && (
                            <span className="inline-flex items-center gap-1.5 bg-ink text-mist px-4 py-2.5 rounded-xl text-sm font-semibold group-hover:bg-limelight group-hover:text-ink transition-all duration-200 group-hover:shadow-lg">
                              View
                              <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </a>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count footer */}
      {filteredRows.length > 0 && (
        <motion.p
          className="text-center text-xs text-white/30 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Showing <span className="font-semibold text-white/50">{filteredRows.length}</span> of <span className="font-semibold text-white/50">{rows.length}</span> entries
        </motion.p>
      )}
    </div>
  );
}
