import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-800 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
