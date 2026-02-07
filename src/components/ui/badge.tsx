import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-white/10 bg-white/[0.03] text-white/70',
        glow: 'border-limelight/30 bg-limelight/10 text-limelight shadow-glow-sm',
        ember: 'border-ember/30 bg-ember/10 text-ember',
        cobalt: 'border-cobalt/30 bg-cobalt/10 text-cobalt',
        // Tier-specific variants
        ss: 'border-amber-400/40 bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-300',
        s: 'border-slate-300/30 bg-slate-400/10 text-slate-300',
        a: 'border-orange-400/30 bg-orange-500/10 text-orange-300',
        b: 'border-white/15 bg-white/5 text-white/60',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {
  pulse?: boolean;
}

export function Badge({ className, variant, pulse = false, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant }),
        pulse && 'animate-pulse-glow',
        className
      )}
      {...props}
    />
  );
}

// Helper function to get badge variant based on tier
export function getTierVariant(tier: string): 'ss' | 's' | 'a' | 'b' | 'default' {
  const normalizedTier = tier?.toUpperCase?.() || '';
  if (normalizedTier === 'SS' || normalizedTier === 'SSS') return 'ss';
  if (normalizedTier === 'S') return 's';
  if (normalizedTier.startsWith('A')) return 'a';
  if (normalizedTier.startsWith('B')) return 'b';
  return 'default';
}

export { badgeVariants };
