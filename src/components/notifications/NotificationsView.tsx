import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  ClipboardCheck, 
  Landmark, 
  Stethoscope, 
  Clock, 
  Filter 
} from 'lucide-react';
import { NotificationItem, NavigationTab } from '../../types';
import { Badge } from '../common/Badge';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigate
}) => {
  const [filterType, setFilterType] = useState<string>('All');

  const filtered = notifications.filter(n => {
    if (filterType === 'All') return true;
    if (filterType === 'Unread') return !n.isRead;
    return n.type.toLowerCase() === filterType.toLowerCase();
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="h-4 w-4 text-rose-600" />;
      case 'survey':
        return <ClipboardCheck className="h-4 w-4 text-emerald-600" />;
      case 'scheme':
        return <Landmark className="h-4 w-4 text-blue-600" />;
      case 'health':
        return <Stethoscope className="h-4 w-4 text-amber-600" />;
      default:
        return <Bell className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Cluster Alerts & Action Items</h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-700 px-2 py-0.5 text-xs font-bold text-white">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Real-time field notifications, upcoming survey schedules, and critical emergency alerts
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <CheckCheck className="h-4 w-4 text-emerald-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {['All', 'Unread', 'emergency', 'survey', 'health', 'scheme'].map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`rounded-lg px-3 py-1.5 capitalize transition-colors ${
              filterType === t
                ? 'bg-blue-700 text-white font-bold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t === 'Unread' ? `Unread (${unreadCount})` : t}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <Bell className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            No notifications found under this filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(notif => (
              <div
                key={notif.id}
                className={`p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  notif.isRead ? 'bg-white' : 'bg-blue-50/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-slate-100 p-2 shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-slate-900">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(notif.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {notif.targetTab && (
                    <button
                      onClick={() => onNavigate(notif.targetTab!)}
                      className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                    >
                      View Details
                    </button>
                  )}
                  {!notif.isRead && (
                    <button
                      onClick={() => onMarkAsRead(notif.id)}
                      className="rounded-md p-1 text-slate-400 hover:text-blue-700"
                      title="Mark as Read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
