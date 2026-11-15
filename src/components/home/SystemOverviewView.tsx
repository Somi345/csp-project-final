import React from 'react';
import { 
  Sprout, 
  Users, 
  ClipboardCheck, 
  Stethoscope, 
  AlertTriangle, 
  Landmark, 
  ShieldCheck, 
  ArrowRight,
  Database,
  CheckCircle2
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface SystemOverviewViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const SystemOverviewView: React.FC<SystemOverviewViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 p-8 text-white shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-700/60 px-3 py-1 text-xs font-semibold text-blue-100 backdrop-blur-xs border border-blue-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>Government of Andhra Pradesh • Department of Agriculture</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Farmer Welfare Management System (FWMS)
          </h1>

          <p className="mt-3 text-sm text-blue-100 leading-relaxed">
            A centralized digital coordination and record-management portal engineered specifically for Village Agriculture Coordinators. Facilitates proactive field surveys, verified landholder records, crop disease management, rapid emergency interventions, and direct government scheme welfare delivery.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-blue-900 shadow-sm hover:bg-blue-50 transition-colors"
            >
              <span>Go to Coordinator Command Center</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onNavigate('farmers')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700/70 border border-blue-400/30 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
            >
              <span>View Farmer Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Core Architectural Pillars Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Module 1 */}
        <div 
          onClick={() => onNavigate('farmers')}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900">Farmer Directory & Records</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Maintain verified landholder records with masked Aadhaar compliance, land area (acres), soil characteristics, and primary crop varieties.
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 group-hover:translate-x-1 transition-transform">
            <span>Explore Farmers</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Module 2 */}
        <div 
          onClick={() => onNavigate('surveys')}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900">Monthly Field Inspections</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Record regular monthly crop surveys, growth stages (sowing to harvest), water availability, fertilizer applications, and foliar symptoms.
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:translate-x-1 transition-transform">
            <span>Review Surveys</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Module 3 */}
        <div 
          onClick={() => onNavigate('cropHealth')}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 group-hover:bg-indigo-700 group-hover:text-white transition-colors">
            <Stethoscope className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900">Crop Health & Diagnostic Workbench</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Honest agronomic architecture: clear separation between coordinator observations and verified agronomic disease recommendations with mandatory disclaimers.
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 group-hover:translate-x-1 transition-transform">
            <span>Open Workbench</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Module 4 */}
        <div 
          onClick={() => onNavigate('emergencies')}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-700 group-hover:bg-rose-700 group-hover:text-white transition-colors">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900">Rapid Emergency Incident Queue</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Prioritized triage for sudden pest outbreaks, fungal wilt, or flood logging. Complete case lifecycle from Open to Follow-up and Resolved.
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-rose-700 group-hover:translate-x-1 transition-transform">
            <span>View Emergency Cases</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Module 5 */}
        <div 
          onClick={() => onNavigate('schemes')}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors">
            <Landmark className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900">Government Schemes & DBT Tracking</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Manage Rythu Bharosa, PM-KISAN, PMFBY crop insurance, and micro-irrigation subsidies with full eligibility verification rules and DBT disbursal logs.
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 group-hover:translate-x-1 transition-transform">
            <span>Manage Schemes</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Module 6 */}
        <div 
          onClick={() => onNavigate('settings')}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white transition-colors">
            <Database className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900">Data Portability & Audit Logs</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Local-first durability with JSON backup export and restore, printable official government dossiers, and coordinator action audit logs.
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-700 group-hover:translate-x-1 transition-transform">
            <span>System Settings</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
