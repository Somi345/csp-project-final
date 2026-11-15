import React from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <span>Farmer Welfare Management System (FWMS)</span>
              <span className="rounded-xs bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">v2.4 Production-Quality</span>
            </div>
            <p className="mt-1 text-slate-500 text-[11px]">
              A centralized digital coordination and record-management portal for Village Agriculture Coordinators.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <span>Database Connected</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              <span>Demonstration Sample Data</span>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4 text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Farmer Welfare Management System (FWMS) &bull; Community Service Project</span>
          <span>Notice: Records displayed are simulated sample data for academic project validation. Aadhaar numbers are masked.</span>
        </div>
      </div>
    </footer>
  );
};
