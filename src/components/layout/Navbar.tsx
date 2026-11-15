import React from 'react';
import { 
  Bell, 
  ShieldCheck, 
  Menu, 
  Sprout, 
  UserCheck
} from 'lucide-react';
import { CoordinatorProfile } from '../../types';

interface NavbarProps {
  coordinator: CoordinatorProfile;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onToggleSidebar: () => void;
  authEnabled: boolean;
  activeModule: string;
  onSelectModule: (module: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  coordinator,
  unreadNotificationsCount,
  onOpenNotifications,
  onToggleSidebar,
  authEnabled,
  onSelectModule
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      {/* Top System Identification Bar */}
      <div className="bg-blue-900 px-4 py-1 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-[11px] font-medium tracking-wide">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>FARMER WELFARE MANAGEMENT SYSTEM (FWMS) • COMMUNITY SERVICE PROJECT</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-blue-200">
            <span>VILLAGE AGRICULTURE COORDINATOR PORTAL</span>
            <span>•</span>
            <span>SUB-DIVISION: {coordinator.villageCluster}</span>
          </div>
        </div>
      </div>

      {/* Main Nav Header */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div 
            onClick={() => onSelectModule('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-white shadow-xs group-hover:bg-blue-800 transition-colors">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900">FWMS</span>
                <span className="hidden sm:inline-block rounded-xs bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 uppercase">
                  Coordinator Portal
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500">Farmer Welfare Management System</p>
            </div>
          </div>
        </div>

        {/* Right Action Icons & Coordinator Profile */}
        <div className="flex items-center gap-3">
          {/* Auth State Pill */}
          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>{authEnabled ? 'Auth Enforced' : 'Dev Access Mode'}</span>
          </div>

          {/* Notifications Bell */}
          <button
            id="navbar-notif-button"
            onClick={onOpenNotifications}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="System Notifications"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Coordinator Pill */}
          <div 
            onClick={() => onSelectModule('settings')}
            className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 p-1.5 pr-3 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-700 text-white font-semibold text-xs">
              SV
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                <span>{coordinator.name}</span>
                <UserCheck className="h-3 w-3 text-blue-600" />
              </div>
              <div className="text-[10px] text-slate-500 font-medium">{coordinator.role}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
