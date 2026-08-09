import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: 'emerald' | 'indigo' | 'amber' | 'rose';
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'emerald',
  showPercentage = false,
  size = 'md',
  className = ''
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const barColors = {
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500'
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className={`w-full ${className}`}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-1 text-xs font-semibold text-slate-600">
          <span>Progress</span>
          <span>{clampedProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${barColors[color]}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
