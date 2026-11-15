import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Table, 
  Users, 
  ClipboardCheck, 
  AlertTriangle, 
  Landmark 
} from 'lucide-react';
import { Farmer, MonthlySurvey, EmergencyCase, SchemeEnrollment, CropHealthRecord, CropInsuranceRecord } from '../../types';
import { ReportService } from '../../services/reportService';
import { Shield, Stethoscope } from 'lucide-react';

interface ReportsViewProps {
  farmers: Farmer[];
  surveys: MonthlySurvey[];
  healthRecords?: CropHealthRecord[];
  emergencies: EmergencyCase[];
  schemes: SchemeEnrollment[];
  insuranceRecords?: CropInsuranceRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  farmers,
  surveys,
  healthRecords = [],
  emergencies,
  schemes,
  insuranceRecords = []
}) => {
  const [selectedVillage, setSelectedVillage] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState('All');

  const villages = Array.from(new Set(farmers.map(f => f.village))).sort();
  const crops = Array.from(new Set(farmers.map(f => f.primaryCrop))).sort();

  const filteredFarmers = farmers.filter(f => 
    (selectedVillage === 'All' || f.village === selectedVillage) &&
    (selectedCrop === 'All' || f.primaryCrop === selectedCrop)
  );
  const filteredSurveys = surveys.filter(s => 
    (selectedVillage === 'All' || s.village === selectedVillage) &&
    (selectedCrop === 'All' || s.crop === selectedCrop)
  );
  const filteredEmergencies = emergencies.filter(e => 
    (selectedVillage === 'All' || e.village === selectedVillage) &&
    (selectedCrop === 'All' || e.crop === selectedCrop)
  );
  const filteredSchemes = schemes.filter(s => 
    (selectedVillage === 'All' || s.village === selectedVillage)
  );
  const filteredHealth = healthRecords.filter(h => 
    (selectedVillage === 'All' || h.village === selectedVillage) &&
    (selectedCrop === 'All' || h.crop === selectedCrop)
  );
  const filteredInsurance = insuranceRecords.filter(i => 
    (selectedVillage === 'All' || i.village === selectedVillage) &&
    (selectedCrop === 'All' || i.crop === selectedCrop)
  );

  const handlePrint = () => {
    ReportService.printMonthlyClusterReport(filteredFarmers, filteredSurveys, filteredEmergencies, filteredSchemes);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Official Reports & Data Exports</h2>
          <p className="text-xs text-slate-500">
            Generate verifiable government dossiers, village crop registries, and standard CSV spreadsheets
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition-colors"
        >
          <Printer className="h-4 w-4" />
          <span>Print Official Cluster Dossier</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-700" />
          <span className="text-xs font-semibold text-slate-700">Village:</span>
          <select
            value={selectedVillage}
            onChange={e => setSelectedVillage(e.target.value)}
            className="rounded-md border border-slate-300 py-1.5 px-3 text-xs focus:border-blue-500 focus:outline-hidden"
          >
            <option value="All">All Villages ({farmers.length} Farmers)</option>
            {villages.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Crop:</span>
          <select
            value={selectedCrop}
            onChange={e => setSelectedCrop(e.target.value)}
            className="rounded-md border border-slate-300 py-1.5 px-3 text-xs focus:border-blue-500 focus:outline-hidden"
          >
            <option value="All">All Crops</option>
            {crops.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {(selectedVillage !== 'All' || selectedCrop !== 'All') && (
          <button
            onClick={() => {
              setSelectedVillage('All');
              setSelectedCrop('All');
            }}
            className="text-xs text-blue-700 hover:underline font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Printable Report Preview Card */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
              Coordinator Dossier
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
              Comprehensive Village Agriculture Coordination Report
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Pre-formatted for printing, sub-divisional review, or archival. Includes farmer totals, surveys, active emergencies, and welfare/insurance delivery status with formal coordinator endorsement.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition-colors shrink-0"
          >
            <Printer className="h-4 w-4" />
            <span>Generate & Print Report</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5 text-xs">
          <div className="rounded-lg bg-white p-3 border border-blue-100">
            <span className="text-slate-500 text-[11px]">Farmers in Scope:</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{filteredFarmers.length}</div>
          </div>

          <div className="rounded-lg bg-white p-3 border border-blue-100">
            <span className="text-slate-500 text-[11px]">Surveys in Scope:</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{filteredSurveys.length}</div>
          </div>

          <div className="rounded-lg bg-white p-3 border border-blue-100">
            <span className="text-slate-500 text-[11px]">Crop Health Obs:</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{filteredHealth.length}</div>
          </div>

          <div className="rounded-lg bg-white p-3 border border-blue-100">
            <span className="text-slate-500 text-[11px]">Emergencies in Scope:</span>
            <div className="text-lg font-bold text-rose-700 mt-0.5">{filteredEmergencies.length}</div>
          </div>

          <div className="rounded-lg bg-white p-3 border border-blue-100">
            <span className="text-slate-500 text-[11px]">Insurance Policies:</span>
            <div className="text-lg font-bold text-emerald-700 mt-0.5">{filteredInsurance.length}</div>
          </div>
        </div>
      </div>

      {/* CSV Spreadsheet Exports Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Table className="h-4 w-4 text-emerald-700" />
          <span>Standard Data Export Spreadsheets (CSV)</span>
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. Farmers CSV */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Users className="h-4 w-4 text-blue-700" />
                <span>Farmers Directory CSV</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Full list of landholders, contact numbers, masked Aadhaar, soil categories, and primary crop varieties.
              </p>
              <div className="mt-3 text-xs font-semibold text-slate-700">
                {filteredFarmers.length} records in scope
              </div>
            </div>

            <button
              onClick={() => ReportService.exportFarmersCsv(filteredFarmers)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              <Download className="h-4 w-4 text-blue-700" />
              <span>Download Farmers CSV</span>
            </button>
          </div>

          {/* 2. Surveys CSV */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ClipboardCheck className="h-4 w-4 text-emerald-700" />
                <span>Monthly Surveys CSV</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Chronological field survey entries with growth stages, crop condition scores, fertilizer inputs, and disease alerts.
              </p>
              <div className="mt-3 text-xs font-semibold text-slate-700">
                {filteredSurveys.length} inspections in scope
              </div>
            </div>

            <button
              onClick={() => ReportService.exportSurveysCsv(filteredSurveys)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              <Download className="h-4 w-4 text-emerald-700" />
              <span>Download Surveys CSV</span>
            </button>
          </div>

          {/* 3. Crop Health Observations CSV */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Stethoscope className="h-4 w-4 text-indigo-700" />
                <span>Crop Health Observations CSV</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Diagnostic observations, symptom records, prescribed agronomic treatments, and follow-up schedules.
              </p>
              <div className="mt-3 text-xs font-semibold text-slate-700">
                {filteredHealth.length} health records in scope
              </div>
            </div>

            <button
              onClick={() => ReportService.exportCropHealthCsv(filteredHealth)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              <Download className="h-4 w-4 text-indigo-700" />
              <span>Download Crop Health CSV</span>
            </button>
          </div>

          {/* 4. Emergencies CSV */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <AlertTriangle className="h-4 w-4 text-rose-700" />
                <span>Emergency Issues Log CSV</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Emergency incidents tracking priority, problem types, prescribed medicines, follow-up dates, and resolution status.
              </p>
              <div className="mt-3 text-xs font-semibold text-slate-700">
                {filteredEmergencies.length} cases in scope
              </div>
            </div>

            <button
              onClick={() => ReportService.exportEmergenciesCsv(filteredEmergencies)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              <Download className="h-4 w-4 text-rose-700" />
              <span>Download Emergencies CSV</span>
            </button>
          </div>

          {/* 5. Welfare Schemes CSV */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Landmark className="h-4 w-4 text-blue-700" />
                <span>Welfare Schemes CSV</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Beneficiary applications, verification status, and DBT benefit disbursal references.
              </p>
              <div className="mt-3 text-xs font-semibold text-slate-700">
                {filteredSchemes.length} applications in scope
              </div>
            </div>

            <button
              onClick={() => ReportService.exportSchemesCsv(filteredSchemes)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              <Download className="h-4 w-4 text-blue-700" />
              <span>Download Schemes CSV</span>
            </button>
          </div>

          {/* 6. Crop Insurance CSV */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Shield className="h-4 w-4 text-emerald-700" />
                <span>Crop Insurance Tracking CSV</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Insured areas, damage type assessments, official claim status, and approved compensation tracking.
              </p>
              <div className="mt-3 text-xs font-semibold text-slate-700">
                {filteredInsurance.length} policies in scope
              </div>
            </div>

            <button
              onClick={() => ReportService.exportInsuranceCsv(filteredInsurance)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              <Download className="h-4 w-4 text-emerald-700" />
              <span>Download Insurance CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
