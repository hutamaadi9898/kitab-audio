import * as React from 'react';
import { motion } from 'framer-motion';

import { cn } from '../../lib/utils';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] animate-shimmer rounded',
                className
            )}
        />
    );
}

export function SkeletonCard() {
    return (
        <motion.div
            className="h-full flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-slate/80 to-graphite border border-white/[0.06]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Image placeholder */}
            <div className="relative aspect-square bg-gradient-to-br from-graphite via-slate to-night">
                <Skeleton className="absolute inset-0" />
                {/* Tier badge skeleton */}
                <div className="absolute top-4 right-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                </div>
            </div>

            {/* Content area */}
            <div className="flex-1 flex flex-col bg-mist rounded-t-3xl -mt-6 relative z-10 p-5">
                {/* Title skeleton */}
                <Skeleton className="h-5 w-3/4 rounded-lg" />
                <Skeleton className="h-5 w-1/2 mt-2 rounded-lg" />

                {/* Badges skeleton */}
                <div className="flex gap-1.5 mt-3">
                    <Skeleton className="h-5 w-16 rounded" />
                    <Skeleton className="h-5 w-20 rounded" />
                </div>

                {/* Description skeleton */}
                <div className="mt-4 space-y-2 flex-1">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-3 w-4/5 rounded" />
                </div>

                {/* Footer skeleton */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-ink/5">
                    <div>
                        <Skeleton className="h-3 w-12 rounded mb-1" />
                        <Skeleton className="h-6 w-24 rounded" />
                    </div>
                    <Skeleton className="h-10 w-20 rounded-xl" />
                </div>
            </div>
        </motion.div>
    );
}

interface SkeletonGridProps {
    count?: number;
}

export function SkeletonGrid({ count = 8 }: SkeletonGridProps) {
    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
