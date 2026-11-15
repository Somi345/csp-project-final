import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  ShieldCheck, 
  Download, 
  Upload, 
  RefreshCw, 
  Printer, 
  Database, 
  FileText, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { CoordinatorProfile, ActivityLog } from '../../types';
import { StorageService } from '../../services/storageService';
import { ReportService } from '../../services/reportService';

interface SettingsViewProps {
  profile: CoordinatorProfile;
  onUpdateProfile: (updated: CoordinatorProfile) => void;
  activities: ActivityLog[];
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  activities,
  onResetData
}) => {
  const [formData, setFormData] = useState(profile);
  const [profileSaved, setProfileSaved] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportFullBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FWMS-Backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const success = StorageService.importBackupJson(reader.result as string);
        if (success) {
          setImportStatus('Backup successfully restored! Reloading application data...');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setImportStatus('Failed to restore backup. Invalid JSON file format.');
        }
      } catch (err) {
        setImportStatus('Error parsing backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handlePrintFullReport = () => {
    const farmers = StorageService.getFarmers();
    const surveys = StorageService.getSurveys();
    const emergencies = StorageService.getEmergencies();
    const schemes = StorageService.getSchemeEnrollments();
    ReportService.printMonthlyClusterReport(farmers, surveys, emergencies, schemes);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Coordinator Profile & System Settings</h2>
        <p className="text-xs text-slate-500">
          Officer credentials, village cluster jurisdiction, data backups, and audit logs
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Coordinator Profile & Jurisdiction (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <User className="h-4 w-4 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-900">Official Officer Profile</h3>
            </div>

            {profileSaved && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Profile details successfully updated!</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Officer Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Official Employee Code</label>
                  <input
                    type="text"
                    value={formData.employeeCode}
                    onChange={e => setFormData({ ...formData, employeeCode: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Official Mobile / Helpline</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Official Role & Security Level</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden font-medium"
                  >
                    <option value="Village Agriculture Coordinator">Village Agriculture Coordinator (Full Farmer Edit/Update Rights)</option>
                    <option value="System Administrator">System Administrator (Read-Only / Protected Audit Mode)</option>
                  </select>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Backend authorization strictly validates that only Village Agriculture Coordinators can update farmer profiles.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Official Badge ID</label>
                  <input
                    type="text"
                    value={formData.badgeId}
                    onChange={e => setFormData({ ...formData, badgeId: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-mono bg-slate-50 focus:border-blue-500 focus:outline-hidden"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">Government officer identity credentials</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Official Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  Assigned Administrative Jurisdiction
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Cluster / Mandal</span>
                    <input
                      type="text"
                      value={formData.mandal}
                      onChange={e => setFormData({ ...formData, mandal: e.target.value })}
                      className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">District</span>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={e => setFormData({ ...formData, district: e.target.value })}
                      className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">State</span>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                      className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-700 px-4 py-2 font-bold text-white hover:bg-blue-800 shadow-xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Audit Logs */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-600" />
              <span>Coordinator Action Audit Trail</span>
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {activities.slice(0, 10).map(act => (
                <div key={act.id} className="text-xs border-b border-slate-100 pb-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{act.action}</span>
                    <span className="text-[10px] text-slate-400">{new Date(act.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{act.description}</p>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    User: {act.actor} • {new Date(act.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Data Management & Reports (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Official Printable Report Card */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-blue-900">
              <Printer className="h-5 w-5 text-blue-700" />
              <h3 className="text-sm font-bold">Printable Official Cluster Report</h3>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              Generate a clean, standardized, printable government dossier compiling village farmer registers, survey findings, emergency cases, and scheme enrollments.
            </p>
            <button
              onClick={handlePrintFullReport}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Generate & Print Report</span>
            </button>
          </div>

          {/* Backup & Restore Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Database className="h-4 w-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Database Backup & Portability</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Export the entire village database (farmers, surveys, emergencies, and schemes) into a portable JSON snapshot for record-keeping or device migration.
            </p>

            <button
              onClick={handleExportBackup}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Download className="h-4 w-4 text-blue-700" />
              <span>Export Full JSON Backup</span>
            </button>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Restore from Backup File</label>
              <label className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">
                <Upload className="h-4 w-4 text-slate-500" />
                <span>Upload JSON File to Restore</span>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
              {importStatus && (
                <p className="mt-1.5 text-xs text-blue-800 font-medium">{importStatus}</p>
              )}
            </div>
          </div>

          {/* Reset Demo Data Card */}
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-rose-900">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <h3 className="text-sm font-bold">Reset Demo Dataset</h3>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              Restore the original Andhra Pradesh agricultural seed data (farmers in Kankipadu cluster, real surveys, and schemes).
            </p>
            <button
              onClick={() => {
                if (window.confirm('Reset all FWMS data back to the default synthetic Andhra Pradesh demo dataset? Any new records will be overwritten.')) {
                  onResetData();
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 shadow-2xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Demo Seed Records</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
