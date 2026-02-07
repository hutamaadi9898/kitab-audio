import * as React from 'react';
import { motion } from 'framer-motion';

import { cn } from '../../lib/utils';

interface ScoreBarProps {
    label: string;
    value: number | null;
    maxValue?: number;
    delay?: number;
    showLabel?: boolean;
}

const easeOut = [0.22, 1, 0.36, 1] as const;

const getScoreColor = (value: number, max: number): string => {
    const percentage = (value / max) * 100;
    if (percentage >= 90) return 'bg-gradient-to-r from-limelight to-limelight/80';
    if (percentage >= 80) return 'bg-gradient-to-r from-emerald-400 to-emerald-500';
    if (percentage >= 70) return 'bg-gradient-to-r from-cobalt to-cobalt/80';
    if (percentage >= 60) return 'bg-gradient-to-r from-amber-400 to-amber-500';
    return 'bg-gradient-to-r from-white/40 to-white/30';
};

export function ScoreBar({
    label,
    value,
    maxValue = 11,
    delay = 0,
    showLabel = true
}: ScoreBarProps) {
    const displayValue = value === null || !Number.isFinite(value) ? null : value;
    const percentage = displayValue !== null ? (displayValue / maxValue) * 100 : 0;

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                {showLabel && (
                    <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                        {label}
                    </span>
                )}
                <span className={cn(
                    "text-sm font-semibold tabular-nums",
                    displayValue !== null ? "text-mist" : "text-white/30"
                )}>
                    {displayValue !== null ? displayValue.toFixed(1) : '—'}
                </span>
            </div>
            <div className="score-bar">
                <motion.div
                    className={cn(
                        "score-bar-fill",
                        displayValue !== null ? getScoreColor(displayValue, maxValue) : "bg-white/10"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{
                        duration: 0.8,
                        delay: delay,
                        ease: easeOut
                    }}
                />
            </div>
        </div>
    );
}

interface ScoreGridProps {
    scores: Array<{ label: string; value: number | null }>;
    columns?: 2 | 3 | 4;
}

export function ScoreGrid({ scores, columns = 2 }: ScoreGridProps) {
    const gridCols = {
        2: 'grid-cols-2',
        3: 'grid-cols-2 md:grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-4',
    };

    return (
        <div className={cn("grid gap-4", gridCols[columns])}>
            {scores.map((score, index) => (
                <ScoreBar
                    key={score.label}
                    label={score.label}
                    value={score.value}
                    delay={index * 0.05}
                />
            ))}
        </div>
    );
}
