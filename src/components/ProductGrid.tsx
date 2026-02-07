import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import type { TWSProduct } from '../lib/tws';
import SearchFilter from './SearchFilter';

const easeOut = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: easeOut,
    },
  },
};

const formatPrice = (value: number | null): string =>
  value === null
    ? '—'
    : `Rp ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value)}`;

// Tier badge colors - clean gradient styling
const getTierStyles = (tier: string): string => {
  const t = tier?.toUpperCase?.() || '';
  if (t === 'SS' || t === 'SSS') return 'bg-gradient-to-br from-amber-400 to-yellow-500 text-ink';
  if (t === 'S') return 'bg-gradient-to-br from-slate-300 to-slate-400 text-ink';
  if (t.startsWith('A')) return 'bg-gradient-to-br from-orange-400 to-amber-500 text-ink';
  if (t.startsWith('B')) return 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white';
  return 'bg-white/10 text-white/70 border border-white/20';
};

const displayValue = (value: string): string => (value && value !== '-' ? value : '—');

interface ProductGridProps {
  products: TWSProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [filteredProducts, setFilteredProducts] = React.useState<TWSProduct[]>(products);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFilter = React.useCallback((filtered: TWSProduct[]) => {
    setIsLoading(true);
    // Small delay to show loading transition
    setTimeout(() => {
      setFilteredProducts(filtered);
      setIsLoading(false);
    }, 150);
  }, []);

  return (
    <div className="space-y-6">
      <SearchFilter products={products} onFilter={handleFilter} />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="inline-flex items-center gap-3 text-white/50">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm">Filtering...</span>
            </div>
          </motion.div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            key="empty"
            className="text-center py-20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-white/50 text-lg font-medium">No earbuds found</p>
            <p className="text-white/30 text-sm mt-2">Try adjusting your search or filters</p>
          </motion.div>
        ) : (
          <motion.div
            key={`grid-${filteredProducts.length}`}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {filteredProducts.map((product: TWSProduct) => (
              <motion.article
                key={product.slug}
                variants={item}
                className="group"
              >
                <a
                  href={`/product/${product.slug}`}
                  className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-limelight/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-3xl"
                  aria-label={`View details for ${product.name}`}
                >
                  <div className="h-full flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-slate/80 to-graphite border border-white/[0.06] transition-all duration-300 group-hover:border-white/[0.15] group-hover:shadow-card-hover group-hover:-translate-y-1.5 group-active:scale-[0.98]">

                    {/* Image placeholder area */}
                    <div className="relative aspect-square bg-gradient-to-br from-graphite via-slate to-night flex items-center justify-center overflow-hidden">
                      {/* Animated gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-br from-limelight/0 to-limelight/0 group-hover:from-limelight/5 group-hover:to-transparent transition-all duration-500" />

                      {/* Tier badge - top right */}
                      <div className="absolute top-4 right-4 z-10">
                        <span
                          className={`inline-flex items-center justify-center w-11 h-11 rounded-full text-xs font-bold transition-transform duration-300 group-hover:scale-105 ${getTierStyles(product.tier)}`}
                        >
                          {product.tier}
                        </span>
                      </div>

                      {/* Earbuds icon placeholder with scale animation */}
                      <svg
                        className="w-24 h-24 text-white/15 group-hover:text-white/25 transition-all duration-500 group-hover:scale-110"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 3a9 9 0 0 0-9 9v7c0 1.1.9 2 2 2h4v-8H5v-1a7 7 0 0 1 14 0v1h-4v8h4c1.1 0 2-.9 2-2v-7a9 9 0 0 0-9-9z" />
                      </svg>
                    </div>

                    {/* Content area - white card */}
                    <div className="flex-1 flex flex-col bg-mist rounded-t-3xl -mt-6 relative z-10 p-5">
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-ink leading-tight line-clamp-2 group-hover:text-limelight-dim transition-colors duration-200">
                        {product.name}
                      </h3>

                      {/* Mini badges */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide bg-ink/5 text-ink/70 border border-ink/10">
                          VFM {product.pricePerformance}
                        </span>
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide bg-ink/5 text-ink/70 border border-ink/10">
                          {displayValue(product.soundTuning)}
                        </span>
                      </div>

                      {/* Description */}
                      <div className="mt-3 space-y-1.5 flex-1">
                        <p className="text-[10px] uppercase tracking-widest text-ink/40 font-medium">Highlights</p>
                        <p className="text-sm font-medium text-ink line-clamp-1">
                          {displayValue(product.highlights || product.reviewSummary)}
                        </p>
                        <p className="text-xs text-ink/60 line-clamp-2 leading-relaxed">
                          {displayValue(product.reviewSummary)}
                        </p>
                      </div>

                      {/* Footer: Price + CTA */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-ink/[0.06]">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-ink/40 font-medium mb-0.5">Price</p>
                          <p className="text-base font-bold text-ink">{formatPrice(product.priceIdr)}</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 bg-ink text-mist px-4 py-2.5 rounded-xl text-sm font-semibold group-hover:bg-limelight group-hover:text-ink transition-all duration-200 group-hover:shadow-lg">
                          View
                          <svg
                            className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            aria-hidden="true"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              </motion.article>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      {!isLoading && filteredProducts.length > 0 && (
        <motion.p
          className="text-center text-xs text-white/30 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Showing <span className="font-semibold text-white/50">{filteredProducts.length}</span> of <span className="font-semibold text-white/50">{products.length}</span> earbuds
        </motion.p>
      )}
    </div>
  );
}
