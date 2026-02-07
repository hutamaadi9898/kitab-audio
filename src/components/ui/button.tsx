import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold uppercase tracking-[0.2em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-limelight/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-limelight text-ink shadow-glow hover:-translate-y-0.5',
        outline: 'border border-white/20 bg-white/5 text-white hover:border-limelight/60',
        ghost: 'text-white/70 hover:text-white'
      },
      size: {
        sm: 'h-9 px-4 text-[11px]',
        md: 'h-11 px-6 text-[11px]',
        lg: 'h-12 px-7 text-xs'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);

Button.displayName = 'Button';

export { buttonVariants };
