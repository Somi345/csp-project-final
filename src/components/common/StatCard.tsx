import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id?: string;
  title: string;
  value: number | string;
  subtitle?: string;
  breakdown?: Array<{ label: string; count: number }>;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  badge?: {
    text: string;
    variant: 'positive' | 'negative' | 'neutral' | 'urgent';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  breakdown,
  icon: Icon,
  iconColor = 'text-blue-700',
  iconBg = 'bg-blue-50',
  badge,
  onClick
}) => {
  return (
    <div 
      id={id}
      onClick={onClick}
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-blue-300 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {breakdown && breakdown.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {breakdown.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="text-slate-500">{item.label}:</span>
              <span className="font-bold text-slate-800">{item.count}</span>
              {idx < breakdown.length - 1 && <span className="text-slate-300">•</span>}
            </div>
          ))}
        </div>
      )}

      {(subtitle || badge) && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {badge && (
            <span
              className={`rounded-full px-2 py-0.5 font-medium ${
                badge.variant === 'positive'
                  ? 'bg-emerald-50 text-emerald-700'
                  : badge.variant === 'urgent'
                  ? 'bg-rose-50 text-rose-700'
                  : badge.variant === 'negative'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {badge.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
