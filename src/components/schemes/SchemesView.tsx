import React, { useState, useMemo, useEffect } from 'react';
import { 
  Landmark, 
  CheckCircle2, 
  PlusCircle, 
  FileText, 
  Search, 
  UserCheck, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Shield
} from 'lucide-react';
import { GovernmentScheme, SchemeEnrollment, CropInsuranceRecord, Farmer, SchemeApplicationStatus } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { CropInsuranceSection } from './CropInsuranceSection';

interface SchemesViewProps {
  schemes: GovernmentScheme[];
  enrollments: SchemeEnrollment[];
  insuranceRecords: CropInsuranceRecord[];
  farmers: Farmer[];
  initialTab?: 'schemes' | 'insurance' | 'catalog' | 'enrollments';
  onTabChange?: (tab: 'schemes' | 'insurance' | 'catalog' | 'enrollments') => void;
  onSaveEnrollment: (enrollment: SchemeEnrollment) => void;
  onUpdateEnrollment: (enrollment: SchemeEnrollment) => void;
  onSaveInsuranceRecord: (record: CropInsuranceRecord) => void;
}

export const SchemesView: React.FC<SchemesViewProps> = ({
  schemes,
  enrollments,
  insuranceRecords,
  farmers,
  initialTab = 'schemes',
  onTabChange,
  onSaveEnrollment,
  onUpdateEnrollment,
  onSaveInsuranceRecord
}) => {
  // Top-level Section: 'schemes' (Government Schemes) or 'insurance' (Crop Insurance)
  const [activeSection, setActiveSection] = useState<'schemes' | 'insurance'>(
    initialTab === 'insurance' ? 'insurance' : 'schemes'
  );

  // Sub-view inside Government Schemes: 'applications' or 'catalog'
  const [schemesSubView, setSchemesSubView] = useState<'applications' | 'catalog'>('applications');

  useEffect(() => {
    if (initialTab === 'insurance') {
      setActiveSection('insurance');
    } else if (initialTab === 'catalog') {
      setActiveSection('schemes');
      setSchemesSubView('catalog');
    } else if (initialTab === 'enrollments' || initialTab === 'schemes') {
      setActiveSection('schemes');
      setSchemesSubView('applications');
    }
  }, [initialTab]);

  const [selectedSchemeForFilter, setSelectedSchemeForFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSchemeCode, setExpandedSchemeCode] = useState<string | null>(schemes[0]?.code || null);

  // Enroll Modal state
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollFarmerId, setEnrollFarmerId] = useState(farmers[0]?.id || '');
  const [enrollSchemeCode, setEnrollSchemeCode] = useState<GovernmentScheme['code']>(schemes[0]?.code || 'PM-KISAN');
  const [enrollNotes, setEnrollNotes] = useState('');

  // Update Status Modal state
  const [editingEnrollment, setEditingEnrollment] = useState<SchemeEnrollment | null>(null);
  const [editAppStatus, setEditAppStatus] = useState<SchemeApplicationStatus>('Applied');
  const [editVerifyStatus, setEditVerifyStatus] = useState<SchemeEnrollment['verificationStatus']>('Pending Verification');
  const [editBenefit, setEditBenefit] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Filtered enrollments
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(e => {
      const matchSearch =
        e.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.schemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchScheme = selectedSchemeForFilter === 'All' || e.schemeCode === selectedSchemeForFilter;
      return matchSearch && matchScheme;
    });
  }, [enrollments, searchTerm, selectedSchemeForFilter]);

  const handleSectionSwitch = (section: 'schemes' | 'insurance') => {
    setActiveSection(section);
    onTabChange?.(section);
  };

  const handleOpenEnrollModal = (preSchemeCode?: string) => {
    if (preSchemeCode) setEnrollSchemeCode(preSchemeCode as GovernmentScheme['code']);
    setEnrollNotes('');
    setIsEnrollModalOpen(true);
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const farmer = farmers.find(f => f.id === enrollFarmerId);
    const scheme = schemes.find(s => s.code === enrollSchemeCode);
    if (!farmer || !scheme) return;

    const newEnrollment: SchemeEnrollment = {
      id: `SCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      schemeCode: scheme.code,
      schemeName: scheme.name,
      farmerId: farmer.id,
      farmerName: farmer.fullName,
      village: farmer.village,
      appliedDate: new Date().toISOString().slice(0, 10),
      applicationStatus: 'Applied',
      verificationStatus: 'Pending Verification',
      approvalStatus: 'Pending',
      benefitReceived: undefined,
      notes: enrollNotes.trim() || 'Applied via Village Agriculture Coordinator',
      updatedAt: new Date().toISOString()
    };

    onSaveEnrollment(newEnrollment);
    setIsEnrollModalOpen(false);
  };

  const handleOpenEditEnrollment = (enr: SchemeEnrollment) => {
    setEditingEnrollment(enr);
    setEditAppStatus(enr.applicationStatus);
    setEditVerifyStatus(enr.verificationStatus);
    setEditBenefit(enr.benefitReceived || '');
    setEditNotes(enr.notes || '');
  };

  const handleSaveEditEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEnrollment) return;

    const updated: SchemeEnrollment = {
      ...editingEnrollment,
      applicationStatus: editAppStatus,
      verificationStatus: editVerifyStatus,
      approvalStatus: editAppStatus === 'Approved' ? 'Approved' : editAppStatus === 'Rejected' ? 'Rejected' : 'Pending',
      benefitReceived: editBenefit.trim() || undefined,
      disbursementDate: editAppStatus === 'Approved' ? new Date().toISOString().slice(0, 10) : editingEnrollment.disbursementDate,
      notes: editNotes.trim() || editingEnrollment.notes,
      updatedAt: new Date().toISOString()
    };

    onUpdateEnrollment(updated);
    setEditingEnrollment(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Schemes & Insurance</h2>
          <p className="text-xs text-slate-500">
            Manage government welfare schemes and crop insurance records
          </p>
        </div>

        {activeSection === 'schemes' && (
          <button
            onClick={() => handleOpenEnrollModal()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition-colors shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Scheme Application</span>
          </button>
        )}
      </div>

      {/* Two Clearly Separated Main Sections: A. Government Schemes | B. Crop Insurance */}
      <div className="flex border-b border-slate-200 text-sm font-semibold">
        <button
          id="section-gov-schemes"
          onClick={() => handleSectionSwitch('schemes')}
          className={`flex items-center gap-2 border-b-2 py-3 px-6 transition-colors ${
            activeSection === 'schemes'
              ? 'border-blue-700 text-blue-700 bg-blue-50/40 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Landmark className="h-4 w-4" />
          <span>Government Schemes</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            activeSection === 'schemes' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {enrollments.length}
          </span>
        </button>

        <button
          id="section-crop-insurance"
          onClick={() => handleSectionSwitch('insurance')}
          className={`flex items-center gap-2 border-b-2 py-3 px-6 transition-colors ${
            activeSection === 'insurance'
              ? 'border-blue-700 text-blue-700 bg-blue-50/40 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Crop Insurance</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            activeSection === 'insurance' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {insuranceRecords.length}
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SECTION A: GOVERNMENT SCHEMES                             */}
      {/* ========================================================= */}
      {activeSection === 'schemes' && (
        <div className="space-y-4">
          {/* Sub-navigation inside Government Schemes */}
          <div className="flex items-center justify-between gap-3 bg-slate-100 p-1.5 rounded-lg w-fit text-xs font-medium">
            <button
              onClick={() => setSchemesSubView('applications')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                schemesSubView === 'applications'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Welfare Applications ({enrollments.length})
            </button>
            <button
              onClick={() => setSchemesSubView('catalog')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                schemesSubView === 'catalog'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Schemes Catalog ({schemes.length})
            </button>
          </div>

          {/* Sub-view 1: Welfare Applications */}
          {schemesSubView === 'applications' && (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:grid-cols-3">
                <div className="relative sm:col-span-1">
                  <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search farmer, scheme, or ID..."
                    className="w-full rounded-md border border-slate-300 py-1.5 pr-3 pl-9 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={selectedSchemeForFilter}
                    onChange={e => setSelectedSchemeForFilter(e.target.value)}
                    className="w-full rounded-md border border-slate-300 py-1.5 px-3 text-xs focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="All">All Schemes ({enrollments.length} total applications)</option>
                    {schemes.map(s => (
                      <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Enrollments Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Application ID</th>
                        <th className="px-4 py-3">Farmer & Village</th>
                        <th className="px-4 py-3">Scheme</th>
                        <th className="px-4 py-3">Application Status</th>
                        <th className="px-4 py-3">Verification</th>
                        <th className="px-4 py-3">Benefit Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredEnrollments.map(enr => (
                        <tr key={enr.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3.5 font-bold font-mono text-slate-900">{enr.id}</td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-900">{enr.farmerName}</div>
                            <div className="text-[11px] text-slate-400">{enr.village} • {enr.farmerId}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-800">{enr.schemeName}</div>
                            <div className="text-[11px] text-slate-400">{enr.schemeCode}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge variant={
                              enr.applicationStatus === 'Approved' ? 'success' :
                              enr.applicationStatus === 'Rejected' ? 'danger' : 'warning'
                            }>
                              {enr.applicationStatus}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge variant={enr.verificationStatus === 'Field Verified' ? 'success' : 'neutral'}>
                              {enr.verificationStatus}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 font-medium text-emerald-800">
                            {enr.benefitReceived || 'Pending Disbursal'}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => handleOpenEditEnrollment(enr)}
                              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Update Status
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredEnrollments.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                            No application records match the search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Sub-view 2: Schemes Catalog */}
          {schemesSubView === 'catalog' && (
            <div className="space-y-3">
              {schemes.map(sch => {
                const isExpanded = expandedSchemeCode === sch.code;
                const enrollCount = enrollments.filter(e => e.schemeCode === sch.code).length;

                return (
                  <div 
                    key={sch.id}
                    className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all"
                  >
                    <div 
                      onClick={() => setExpandedSchemeCode(isExpanded ? null : sch.code)}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-bold text-xs">
                          <Landmark className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900">{sch.name}</h3>
                            <span className="rounded-xs bg-blue-100 px-1.5 py-0.2 font-mono text-[10px] font-bold text-blue-800">
                              {sch.code}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600 max-w-3xl">{sch.description}</p>
                          <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                            <span><strong>Department:</strong> {sch.department}</span>
                            <span>•</span>
                            <span><strong>Benefits:</strong> {sch.benefitDetails}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-xs font-bold text-slate-900">{enrollCount} Farmers</div>
                          <div className="text-[10px] text-slate-400">Enrolled</div>
                        </div>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleOpenEnrollModal(sch.code);
                          }}
                          className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Enroll Farmer
                        </button>

                        <div className="text-slate-400 p-1">
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-200 bg-slate-50/60 p-5 text-xs space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="rounded-lg border border-slate-200 bg-white p-4">
                            <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              <span>Eligibility Criteria</span>
                            </h4>
                            <p className="text-slate-600 leading-relaxed">
                              {sch.eligibilityCriteria}
                            </p>
                          </div>

                          <div className="rounded-lg border border-slate-200 bg-white p-4">
                            <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span>Required Documents</span>
                            </h4>
                            <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                              {(sch.documentsRequired || ['Aadhaar Card (UIDAI Linked)', 'Land Ownership Passbook (1-B Namuna)', 'Bank Passbook with NPCI Seeding', 'e-Crop Cultivation Certificate']).map((doc: string, idx: number) => (
                                <li key={idx} className="leading-relaxed">{doc}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION B: CROP INSURANCE                                 */}
      {/* ========================================================= */}
      {activeSection === 'insurance' && (
        <CropInsuranceSection
          insuranceRecords={insuranceRecords}
          farmers={farmers}
          onSaveInsuranceRecord={onSaveInsuranceRecord}
        />
      )}

      {/* Enroll Farmer Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll Farmer in Welfare Scheme"
        subtitle="Submit farmer application for agricultural assistance"
        maxWidth="md"
      >
        <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Select Scheme *</label>
            <select
              value={enrollSchemeCode}
              onChange={e => setEnrollSchemeCode(e.target.value as GovernmentScheme['code'])}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
            >
              {schemes.map(s => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Select Farmer *</label>
            <select
              value={enrollFarmerId}
              onChange={e => setEnrollFarmerId(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            >
              {farmers.map(f => (
                <option key={f.id} value={f.id}>
                  {f.fullName} ({f.village}) - {f.landAreaAcres} Acres
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Coordinator Verification Notes</label>
            <textarea
              rows={2}
              value={enrollNotes}
              onChange={e => setEnrollNotes(e.target.value)}
              placeholder="e.g. Land documents and Aadhaar eKYC verified in village panchayat..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setIsEnrollModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-5 py-2 font-bold text-white hover:bg-blue-800"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Enrollment Status Modal */}
      {editingEnrollment && (
        <Modal
          isOpen={Boolean(editingEnrollment)}
          onClose={() => setEditingEnrollment(null)}
          title={`Update Application: ${editingEnrollment.id}`}
          subtitle={`${editingEnrollment.farmerName} • ${editingEnrollment.schemeName}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveEditEnrollment} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Application Status</label>
              <select
                value={editAppStatus}
                onChange={e => setEditAppStatus(e.target.value as any)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-bold focus:border-blue-500 focus:outline-hidden"
              >
                <option value="Applied">Applied</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved (Sanctioned)</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Verification Status</label>
              <select
                value={editVerifyStatus}
                onChange={e => setEditVerifyStatus(e.target.value as any)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              >
                <option value="Pending Verification">Pending Verification</option>
                <option value="Field Verified">Field Verified by Coordinator</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Benefit Amount / Description</label>
              <input
                type="text"
                value={editBenefit}
                onChange={e => setEditBenefit(e.target.value)}
                placeholder="e.g. ₹2,000 Installment credited"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Remarks / Reference</label>
              <input
                type="text"
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="e.g. UTR # AP0928120392 or voucher code"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setEditingEnrollment(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-5 py-2 font-bold text-white hover:bg-blue-800"
              >
                Save Updates
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
