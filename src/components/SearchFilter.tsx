import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import type { TWSProduct } from '../lib/tws';

interface SearchFilterProps {
    products: TWSProduct[];
    onFilter: (filtered: TWSProduct[]) => void;
}

type SortOption = 'score' | 'price-low' | 'price-high' | 'name';
type TierFilter = 'all' | string;
const easeOut = [0.22, 1, 0.36, 1] as const;

// Custom hook for debounced value
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

export default function SearchFilter({ products, onFilter }: SearchFilterProps) {
    const [search, setSearch] = React.useState('');
    const [tier, setTier] = React.useState<TierFilter>('all');
    const [sort, setSort] = React.useState<SortOption>('score');

    // Debounce search input for better performance
    const debouncedSearch = useDebounce(search, 300);

    const tierOrder = ['SS', 'S', 'A++', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'E'];
    const tiers: TierFilter[] = React.useMemo(() => {
        const unique = new Set(products.map((p) => p.tier).filter(Boolean));
        const sorted = tierOrder.filter((t) => unique.has(t));
        return ['all', ...sorted];
    }, [products]);

    const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
        {
            value: 'score',
            label: 'Best Score',
            icon: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
        },
        {
            value: 'price-low',
            label: 'Price: Low to High',
            icon: <path d="M12 20V10M18 20V4M6 20v-4" strokeLinecap="round" strokeLinejoin="round" />
        },
        {
            value: 'price-high',
            label: 'Price: High to Low',
            icon: <path d="M12 20V10M6 20V4M18 20v-4" strokeLinecap="round" strokeLinejoin="round" />
        },
        {
            value: 'name',
            label: 'Name A-Z',
            icon: <path d="M3 6h18M3 12h12M3 18h6" strokeLinecap="round" strokeLinejoin="round" />
        },
    ];

    const filteredCount = React.useMemo(() => {
        let filtered = [...products];

        if (debouncedSearch.trim()) {
            const query = debouncedSearch.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.highlights.toLowerCase().includes(query) ||
                    p.reviewSummary.toLowerCase().includes(query) ||
                    p.soundTuning.toLowerCase().includes(query)
            );
        }

        if (tier !== 'all') {
            filtered = filtered.filter((p) => p.tier?.toUpperCase().startsWith(tier));
        }

        return filtered.length;
    }, [debouncedSearch, tier, products]);

    React.useEffect(() => {
        let filtered = [...products];

        if (debouncedSearch.trim()) {
            const query = debouncedSearch.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.highlights.toLowerCase().includes(query) ||
                    p.reviewSummary.toLowerCase().includes(query) ||
                    p.soundTuning.toLowerCase().includes(query)
            );
        }

        if (tier !== 'all') {
            filtered = filtered.filter((p) => p.tier?.toUpperCase().startsWith(tier));
        }

        switch (sort) {
            case 'score':
                filtered.sort((a, b) => (b.overallSoundScore ?? 0) - (a.overallSoundScore ?? 0));
                break;
            case 'price-low':
                filtered.sort((a, b) => (a.priceIdr ?? Infinity) - (b.priceIdr ?? Infinity));
                break;
            case 'price-high':
                filtered.sort((a, b) => (b.priceIdr ?? 0) - (a.priceIdr ?? 0));
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        onFilter(filtered);
    }, [debouncedSearch, tier, sort, products, onFilter]);

    const clearSearch = () => setSearch('');

    return (
        <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut }}
        >
            {/* Main Search Bar */}
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
                            placeholder="Search by name, sound signature, or features..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-12 py-3.5 text-sm text-mist placeholder:text-white/30 transition-all duration-200 focus:border-limelight/40 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-limelight/20"
                            aria-label="Search earbuds"
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

                    {/* Sort Dropdown - Desktop */}
                    <div className="hidden lg:block relative min-w-[200px]">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortOption)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-mist appearance-none cursor-pointer transition-all duration-200 focus:border-limelight/40 focus:outline-none focus:ring-2 focus:ring-limelight/20 pr-10"
                            aria-label="Sort products"
                        >
                            {sortOptions.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-night text-mist">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    {/* Results Count */}
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-limelight/10 border border-limelight/20">
                        <span className="text-2xl font-bold text-limelight">{filteredCount}</span>
                        <span className="text-xs text-limelight/70 uppercase tracking-wider">results</span>
                    </div>
                </div>
            </div>

            {/* Tier Filter Pills */}
            <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Filter by tier:</span>
                <div className="flex gap-1.5 flex-wrap">
                    {tiers.slice(0, 8).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTier(t)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${tier === t
                                    ? 'bg-limelight text-ink'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                }`}
                            aria-pressed={tier === t}
                        >
                            {t === 'all' ? 'All Tiers' : t}
                        </button>
                    ))}
                </div>

                {/* Mobile Sort & Results */}
                <div className="lg:hidden flex items-center gap-3 ml-auto">
                    <span className="text-sm text-white/50">
                        <span className="font-bold text-limelight">{filteredCount}</span> found
                    </span>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortOption)}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-mist appearance-none cursor-pointer transition-all duration-200 focus:border-limelight/40 focus:outline-none pr-7 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.4)%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.5rem_center]"
                        aria-label="Sort"
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-night">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </motion.div>
    );
}
