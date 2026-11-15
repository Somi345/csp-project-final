import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Stethoscope, 
  AlertTriangle, 
  Landmark, 
  FileText, 
  Bell, 
  Settings, 
  Info,
  X
} from 'lucide-react';

export type NavModule = 
  | 'dashboard'
  | 'farmers'
  | 'surveys'
  | 'cropHealth'
  | 'emergencies'
  | 'schemes'
  | 'reports'
  | 'notifications'
  | 'settings'
  | 'home';

interface SidebarProps {
  activeModule: NavModule;
  onSelectModule: (module: NavModule) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  counts: {
    farmers: number;
    surveys: number;
    emergenciesOpen: number;
    notificationsUnread: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isOpenMobile,
  onCloseMobile,
  counts
}) => {
  const menuItems: Array<{
    id: NavModule;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'farmers', label: 'Farmer Management', icon: Users, badge: counts.farmers },
    { id: 'surveys', label: 'Monthly Surveys', icon: ClipboardList, badge: counts.surveys },
    { id: 'cropHealth', label: 'Crop Health / AI Diagnosis', icon: Stethoscope },
    { 
      id: 'emergencies', 
      label: 'Emergency Cases', 
      icon: AlertTriangle, 
      badge: counts.emergenciesOpen > 0 ? counts.emergenciesOpen : undefined,
      badgeColor: 'bg-rose-100 text-rose-700'
    },
    { id: 'schemes', label: 'Schemes & Insurance', icon: Landmark },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      badge: counts.notificationsUnread > 0 ? counts.notificationsUnread : undefined,
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    { id: 'settings', label: 'Settings & Config', icon: Settings },
    { id: 'home', label: 'System Overview', icon: Info }
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 bg-white border-r border-slate-200">
      <div>
        {/* Mobile close button */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 lg:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation Menu</span>
          <button 
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-2 px-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Coordinator Operations
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  onSelectModule(item.id as NavModule);
                  onCloseMobile();
                }}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      item.badgeColor || (isActive ? 'bg-blue-200 text-blue-900' : 'bg-slate-100 text-slate-600')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Field Officer Badge & Quick Tip */}
      <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-blue-900">
          <span className="h-2 w-2 rounded-full bg-blue-600"></span>
          <span>Field Coordinator Mode</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-blue-700">
          Conduct monthly surveys, document pest attacks, and record emergency follow-ups directly in the field.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-84px)] sticky top-[84px] overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-72 max-w-xs h-full bg-white shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
