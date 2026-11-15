import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  PlusCircle, 
  Search, 
  Clock, 
  Edit3, 
  FileText, 
  CheckCircle2, 
  IndianRupee,
  User,
  Info,
  Eye,
  Sprout,
  Shield,
  Upload,
  Image as ImageIcon,
  History
} from 'lucide-react';
import { CropInsuranceRecord, Farmer, InsuranceClaimStatus } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface CropInsuranceSectionProps {
  insuranceRecords: CropInsuranceRecord[];
  farmers: Farmer[];
  onSaveInsuranceRecord: (record: CropInsuranceRecord) => void;
}

const CLAIM_STATUS_COLORS: Record<InsuranceClaimStatus, 'neutral' | 'info' | 'warning' | 'success' | 'danger'> = {
  'Not Reported': 'neutral',
  'Reported': 'info',
  'Under Assessment': 'warning',
  'Approved': 'success',
  'Rejected': 'danger',
  'Payment Pending': 'warning',
  'Paid': 'success'
};

const DAMAGE_TYPES = [
  'Unseasonal Rain / Hailstorm',
  'Flood / Waterlogging',
  'Drought / Dry Spell',
  'Pest Outbreak',
  'Severe Fungal Blight',
  'Cyclone / High Wind Velocity',
  'Other Non-preventable Loss'
];

export const CropInsuranceSection: React.FC<CropInsuranceSectionProps> = ({
  insuranceRecords,
  farmers,
  onSaveInsuranceRecord
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [seasonFilter, setSeasonFilter] = useState<string>('All');

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<CropInsuranceRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<CropInsuranceRecord | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // New Record State
  const [newFarmerId, setNewFarmerId] = useState(farmers[0]?.id || '');
  const [newCrop, setNewCrop] = useState(farmers[0]?.primaryCrop || 'Paddy');
  const [newSeason, setNewSeason] = useState<CropInsuranceRecord['season']>('Kharif');
  const [newScheme, setNewScheme] = useState('PMFBY (Pradhan Mantri Fasal Bima Yojana)');
  const [newInsuredAcres, setNewInsuredAcres] = useState<number>(farmers[0]?.landAreaAcres || 1);
  const [newPremiumStatus, setNewPremiumStatus] = useState<CropInsuranceRecord['premiumStatus']>('Subsidized');
  const [newHasDamage, setNewHasDamage] = useState(false);
  const [newDamageType, setNewDamageType] = useState(DAMAGE_TYPES[0]);
  const [newDamageDate, setNewDamageDate] = useState(new Date().toISOString().slice(0, 10));
  const [newDamageDesc, setNewDamageDesc] = useState('');
  const [newSupportingImage, setNewSupportingImage] = useState('');
  const [newRemarks, setNewRemarks] = useState('');

  // Edit / Damage Claim State
  const [editClaimStatus, setEditClaimStatus] = useState<InsuranceClaimStatus>('Not Reported');
  const [editDamageType, setEditDamageType] = useState('');
  const [editDamageDate, setEditDamageDate] = useState('');
  const [editDamageDesc, setEditDamageDesc] = useState('');
  const [editSupportingImage, setEditSupportingImage] = useState('');
  const [editClaimAppDate, setEditClaimAppDate] = useState('');
  const [editApprovedAmount, setEditApprovedAmount] = useState<string>('');
  const [editPaymentStatus, setEditPaymentStatus] = useState<CropInsuranceRecord['paymentStatus']>('Unpaid');
  const [editRemarks, setEditRemarks] = useState('');

  // Quick summary statistics directly calculated from actual database records
  const stats = useMemo(() => {
    const totalPolicies = insuranceRecords.length;
    const totalInsuredAcres = insuranceRecords.reduce((acc, r) => acc + (Number(r.insuredLandAreaAcres) || 0), 0);
    const activeClaims = insuranceRecords.filter(r => 
      r.claimStatus === 'Reported' || r.claimStatus === 'Under Assessment' || r.claimStatus === 'Payment Pending'
    ).length;
    const settledClaims = insuranceRecords.filter(r => r.claimStatus === 'Approved' || r.claimStatus === 'Paid').length;
    const totalApprovedCompensation = insuranceRecords.reduce((acc, r) => acc + (Number(r.approvedClaimAmount) || 0), 0);

    return {
      totalPolicies,
      totalInsuredAcres: totalInsuredAcres.toFixed(1),
      activeClaims,
      settledClaims,
      totalApprovedCompensation
    };
  }, [insuranceRecords]);

  // Filtered list
  const filteredRecords = useMemo(() => {
    return insuranceRecords.filter(r => {
      const matchSearch =
        r.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || r.claimStatus === statusFilter;
      const matchSeason = seasonFilter === 'All' || r.season === seasonFilter;
      return matchSearch && matchStatus && matchSeason;
    });
  }, [insuranceRecords, searchTerm, statusFilter, seasonFilter]);

  const showFeedback = (text: string, type: 'success' | 'info' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleFarmerChange = (farmerId: string) => {
    setNewFarmerId(farmerId);
    const f = farmers.find(farm => farm.id === farmerId);
    if (f) {
      setNewCrop(f.primaryCrop);
      setNewInsuredAcres(f.landAreaAcres);
    }
  };

  const handleOpenRegister = () => {
    if (farmers.length > 0) {
      const firstFarmer = farmers[0];
      setNewFarmerId(firstFarmer.id);
      setNewCrop(firstFarmer.primaryCrop);
      setNewInsuredAcres(firstFarmer.landAreaAcres);
    }
    setNewSeason('Kharif');
    setNewScheme('PMFBY (Pradhan Mantri Fasal Bima Yojana)');
    setNewPremiumStatus('Subsidized');
    setNewHasDamage(false);
    setNewDamageType(DAMAGE_TYPES[0]);
    setNewDamageDate(new Date().toISOString().slice(0, 10));
    setNewDamageDesc('');
    setNewSupportingImage('');
    setNewRemarks('');
    setIsRegisterModalOpen(true);
  };

  const handleCreateInsuranceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const farmer = farmers.find(f => f.id === newFarmerId);
    if (!farmer) return;

    const nowIso = new Date().toISOString();
    const todayStr = nowIso.slice(0, 10);

    const historyItem = {
      id: `HIST-${Date.now()}-1`,
      date: todayStr,
      action: newHasDamage ? 'Insurance Policy & Damage Claim Filed' : 'Insurance Policy Registered',
      status: (newHasDamage ? 'Reported' : 'Not Reported') as InsuranceClaimStatus,
      notes: newRemarks.trim() || (newHasDamage ? `Crop damage reported: ${newDamageType}` : 'Initial insurance registration in village cluster.'),
      updatedBy: 'Village Agriculture Coordinator'
    };

    const record: CropInsuranceRecord = {
      id: `INS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      farmerId: farmer.id,
      farmerName: farmer.fullName,
      village: farmer.village,
      crop: newCrop.trim() || farmer.primaryCrop,
      season: newSeason,
      insuranceScheme: newScheme,
      insuredLandAreaAcres: Number(newInsuredAcres) || 1,
      premiumStatus: newPremiumStatus,
      damageType: newHasDamage ? newDamageType : undefined,
      damageDate: newHasDamage ? newDamageDate : undefined,
      damageDescription: newHasDamage ? newDamageDesc.trim() : undefined,
      supportingImageUrl: newHasDamage && newSupportingImage.trim() ? newSupportingImage.trim() : undefined,
      claimApplicationDate: newHasDamage ? todayStr : undefined,
      claimStatus: newHasDamage ? 'Reported' : 'Not Reported',
      approvedClaimAmount: undefined,
      paymentStatus: 'Unpaid',
      coordinatorRemarks: newRemarks.trim() || 'Insurance registered in village cluster registry by coordinator.',
      claimHistory: [historyItem],
      createdAt: nowIso,
      updatedAt: nowIso
    };

    onSaveInsuranceRecord(record);
    setIsRegisterModalOpen(false);
    showFeedback(`Crop insurance policy ${record.id} for ${record.farmerName} registered successfully!`);
  };

  const handleOpenView = (rec: CropInsuranceRecord) => {
    setViewingRecord(rec);
  };

  const handleOpenEdit = (rec: CropInsuranceRecord) => {
    setEditingRecord(rec);
    setEditClaimStatus(rec.claimStatus);
    setEditDamageType(rec.damageType || DAMAGE_TYPES[0]);
    setEditDamageDate(rec.damageDate || new Date().toISOString().slice(0, 10));
    setEditDamageDesc(rec.damageDescription || '');
    setEditSupportingImage(rec.supportingImageUrl || '');
    setEditClaimAppDate(rec.claimApplicationDate || new Date().toISOString().slice(0, 10));
    setEditApprovedAmount(rec.approvedClaimAmount !== undefined ? String(rec.approvedClaimAmount) : '');
    setEditPaymentStatus(rec.paymentStatus);
    setEditRemarks(rec.coordinatorRemarks || '');
  };

  const handleUpdateClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const isClaimActive = editClaimStatus !== 'Not Reported';
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.slice(0, 10);

    const statusChanged = editClaimStatus !== editingRecord.claimStatus;
    const amountChanged = (editApprovedAmount.trim() ? Number(editApprovedAmount) : undefined) !== editingRecord.approvedClaimAmount;
    const paymentChanged = editPaymentStatus !== editingRecord.paymentStatus;

    let actionLabel = 'Record Updated';
    if (statusChanged) {
      actionLabel = `Claim Status: ${editClaimStatus}`;
    } else if (amountChanged) {
      actionLabel = `Approved Relief: ₹${Number(editApprovedAmount).toLocaleString('en-IN')}`;
    } else if (paymentChanged) {
      actionLabel = `Payment Status: ${editPaymentStatus}`;
    }

    const newHistoryEntry = {
      id: `HIST-${Date.now()}`,
      date: todayStr,
      action: actionLabel,
      status: editClaimStatus,
      notes: editRemarks.trim() || editDamageDesc.trim() || 'Claim status updated by coordinator.',
      amount: editApprovedAmount.trim() ? Number(editApprovedAmount) : editingRecord.approvedClaimAmount,
      updatedBy: 'Village Agriculture Coordinator'
    };

    const updatedHistory = Array.isArray(editingRecord.claimHistory)
      ? [...editingRecord.claimHistory, newHistoryEntry]
      : [newHistoryEntry];

    const updated: CropInsuranceRecord = {
      ...editingRecord,
      claimStatus: editClaimStatus,
      damageType: isClaimActive ? editDamageType : undefined,
      damageDate: isClaimActive ? editDamageDate : undefined,
      damageDescription: isClaimActive ? editDamageDesc.trim() : undefined,
      supportingImageUrl: editSupportingImage.trim() ? editSupportingImage.trim() : undefined,
      claimApplicationDate: isClaimActive 
        ? (editClaimAppDate.trim() || editingRecord.claimApplicationDate || todayStr)
        : undefined,
      approvedClaimAmount: editApprovedAmount.trim() ? Number(editApprovedAmount) : undefined,
      paymentStatus: editPaymentStatus,
      coordinatorRemarks: editRemarks.trim() || editingRecord.coordinatorRemarks,
      claimHistory: updatedHistory,
      updatedAt: nowIso
    };

    onSaveInsuranceRecord(updated);
    setEditingRecord(null);
    if (viewingRecord && viewingRecord.id === updated.id) {
      setViewingRecord(updated);
    }
    showFeedback(`Insurance policy ${updated.id} claim status updated to "${updated.claimStatus}".`);
  };

  return (
    <div className="space-y-4">
      {/* Top Notice */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 shadow-2xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-blue-950">Crop Insurance & Claim Tracking</h4>
            <p className="leading-relaxed text-blue-800 text-xs">
              Record and track agricultural crop insurance policies, verified damage reports, claims, and approved compensation for village farmers.
            </p>
            <p className="text-[11px] text-blue-700 font-medium">
              <strong>Notice:</strong> FWMS maintains local coordinator records. Official claim approvals and compensation disbursements reflect orders from agricultural insurance authorities.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 transition-all">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{feedbackMsg.text}</span>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Insured</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">{stats.totalPolicies}</span>
            <span className="text-xs text-slate-400">Policies</span>
          </div>
          <span className="text-[11px] text-slate-500">{stats.totalInsuredAcres} Total Acres</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Active Claims</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-amber-700">{stats.activeClaims}</span>
            <span className="text-xs text-amber-600">Under Review</span>
          </div>
          <span className="text-[11px] text-slate-500">Reported & In Assessment</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Settled / Paid</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-700">{stats.settledClaims}</span>
            <span className="text-xs text-emerald-600">Claims</span>
          </div>
          <span className="text-[11px] text-slate-500">Approved or Disbursed</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">Approved Relief</span>
          <div className="mt-1 text-xl font-bold font-mono text-emerald-700">
            ₹{stats.totalApprovedCompensation.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500">Total Sanctioned Relief</span>
        </div>
      </div>

      {/* Filter and Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search farmer, crop, village, ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="rounded-md border border-slate-300 py-1.5 pr-3 pl-8 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-md border border-slate-300 py-1.5 px-3 text-xs focus:border-blue-500 focus:outline-hidden"
          >
            <option value="All">All Claim Statuses ({insuranceRecords.length})</option>
            <option value="Not Reported">Not Reported</option>
            <option value="Reported">Reported</option>
            <option value="Under Assessment">Under Assessment</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Payment Pending">Payment Pending</option>
            <option value="Paid">Paid</option>
          </select>

          {/* Season Filter */}
          <select
            value={seasonFilter}
            onChange={e => setSeasonFilter(e.target.value)}
            className="rounded-md border border-slate-300 py-1.5 px-3 text-xs focus:border-blue-500 focus:outline-hidden"
          >
            <option value="All">All Seasons</option>
            <option value="Kharif">Kharif</option>
            <option value="Rabi">Rabi</option>
            <option value="Zaid">Zaid</option>
            <option value="Whole Year">Whole Year</option>
          </select>
        </div>

        <button
          onClick={handleOpenRegister}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition-colors shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Register Crop Insurance</span>
        </button>
      </div>

      {/* Insurance Records Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <Shield className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            No crop insurance records match your search or filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Case ID & Farmer</th>
                  <th className="px-4 py-3">Crop & Area</th>
                  <th className="px-4 py-3">Scheme & Season</th>
                  <th className="px-4 py-3">Claim Status</th>
                  <th className="px-4 py-3">Approved Relief</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{rec.farmerName}</div>
                      <div className="text-[11px] text-slate-400">
                        {rec.id} • {rec.village}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{rec.crop}</div>
                      <div className="text-[11px] text-slate-500">{rec.insuredLandAreaAcres} Acres Insured</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-800 truncate max-w-[170px]">{rec.insuranceScheme}</div>
                      <div className="text-[10px] text-slate-400">{rec.season} • {rec.premiumStatus}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge variant={CLAIM_STATUS_COLORS[rec.claimStatus]}>
                        {rec.claimStatus}
                      </Badge>
                      {rec.damageType && (
                        <div className="text-[10px] text-slate-500 mt-1 truncate max-w-[140px]">
                          {rec.damageType}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 font-mono">
                      {rec.approvedClaimAmount !== undefined ? (
                        <span className="font-bold text-emerald-700">
                          ₹{rec.approvedClaimAmount.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending Assessment</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge variant={
                        rec.paymentStatus === 'Disbursed / Paid' ? 'success' :
                        rec.paymentStatus === 'Pending Disbursal' ? 'warning' : 'neutral'
                      }>
                        {rec.paymentStatus}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {/* View Action */}
                        <button
                          onClick={() => handleOpenView(rec)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
                          title="View Policy Details"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-600" />
                          <span>View</span>
                        </button>

                        {/* Update Action */}
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 hover:bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800 transition-colors shadow-2xs"
                          title="Update Crop Damage & Claim Status"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-blue-700" />
                          <span>Update</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: VIEW CROP INSURANCE & CLAIM DOSSIER (Working View) */}
      {/* ============================================================== */}
      {viewingRecord && (
        <Modal
          isOpen={Boolean(viewingRecord)}
          onClose={() => setViewingRecord(null)}
          title={`Crop Insurance Details: ${viewingRecord.id}`}
          subtitle={`${viewingRecord.farmerName} • ${viewingRecord.crop} (${viewingRecord.season})`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Header Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 border border-slate-200 p-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 text-xs">Claim Status:</span>
                <Badge variant={CLAIM_STATUS_COLORS[viewingRecord.claimStatus]}>
                  {viewingRecord.claimStatus}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500">Payment:</span>
                <Badge variant={
                  viewingRecord.paymentStatus === 'Disbursed / Paid' ? 'success' :
                  viewingRecord.paymentStatus === 'Pending Disbursal' ? 'warning' : 'neutral'
                }>
                  {viewingRecord.paymentStatus}
                </Badge>
              </div>
            </div>

            {/* Grid 1: Farmer & Crop Particulars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-blue-700" />
                  <span>Farmer Details</span>
                </div>
                <div className="text-slate-600">
                  <div><strong>Full Name:</strong> {viewingRecord.farmerName}</div>
                  <div><strong>Farmer ID:</strong> <span className="font-mono">{viewingRecord.farmerId}</span></div>
                  <div><strong>Village:</strong> {viewingRecord.village}</div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sprout className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Crop & Land Details</span>
                </div>
                <div className="text-slate-600">
                  <div><strong>Insured Crop:</strong> {viewingRecord.crop}</div>
                  <div><strong>Crop Season:</strong> {viewingRecord.season}</div>
                  <div><strong>Insured Land Area:</strong> <strong>{viewingRecord.insuredLandAreaAcres} Acres</strong></div>
                </div>
              </div>
            </div>

            {/* Grid 2: Scheme & Financial Sanctions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-700" />
                  <span>Insurance Scheme</span>
                </div>
                <div className="text-slate-600">
                  <div><strong>Scheme Name:</strong> {viewingRecord.insuranceScheme}</div>
                  <div><strong>Premium Status:</strong> <span className="font-semibold">{viewingRecord.premiumStatus}</span></div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <IndianRupee className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Relief & Compensation</span>
                </div>
                <div className="text-slate-600">
                  <div><strong>Approved Relief:</strong> {viewingRecord.approvedClaimAmount !== undefined ? (
                    <strong className="text-emerald-700 font-mono text-sm">₹{viewingRecord.approvedClaimAmount.toLocaleString('en-IN')}</strong>
                  ) : (
                    <span className="text-slate-400">Pending Official Sanction</span>
                  )}</div>
                  <div><strong>Payment Status:</strong> {viewingRecord.paymentStatus}</div>
                </div>
              </div>
            </div>

            {/* Damage Details (if reported) */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <span>Reported Crop Damage</span>
              </div>
              {viewingRecord.claimStatus === 'Not Reported' && !viewingRecord.damageType ? (
                <div className="text-slate-500 italic">
                  No crop damage reported under this insurance policy. Normal cultivation in progress.
                </div>
              ) : (
                <div className="space-y-1.5 text-slate-700">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div><strong>Damage Type:</strong> {viewingRecord.damageType || 'Not specified'}</div>
                    <div><strong>Damage Date:</strong> {viewingRecord.damageDate || 'N/A'}</div>
                    <div><strong>Claim Date:</strong> {viewingRecord.claimApplicationDate || 'N/A'}</div>
                  </div>
                  {viewingRecord.damageDescription && (
                    <div className="mt-2 rounded bg-white p-2.5 border border-slate-200">
                      <strong>Damage Description:</strong>
                      <p className="mt-0.5 text-slate-600 leading-relaxed">{viewingRecord.damageDescription}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Supporting Image (if uploaded) */}
            {viewingRecord.supportingImageUrl && (
              <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <ImageIcon className="h-3.5 w-3.5 text-blue-700" />
                  <span>Supporting Damage Photo</span>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center max-h-56">
                  <img
                    src={viewingRecord.supportingImageUrl}
                    alt="Supporting crop damage proof"
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              </div>
            )}

            {/* Claim History Timeline */}
            <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <History className="h-3.5 w-3.5 text-indigo-700" />
                <span>Claim History</span>
              </div>
              {viewingRecord.claimHistory && viewingRecord.claimHistory.length > 0 ? (
                <div className="space-y-2 divide-y divide-slate-100">
                  {viewingRecord.claimHistory.map((item, idx) => (
                    <div key={item.id || idx} className="pt-2 first:pt-0 flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={CLAIM_STATUS_COLORS[item.status] || 'neutral'}>
                            {item.status}
                          </Badge>
                          <span className="font-semibold text-slate-800">{item.action}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">{item.notes}</p>
                        {item.amount !== undefined && (
                          <span className="text-[11px] font-mono font-bold text-emerald-700">
                            Sanctioned Relief: ₹{item.amount.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0 text-[10px] text-slate-400">
                        <div>{item.date}</div>
                        <div>{item.updatedBy || 'Coordinator'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic text-[11px]">No status transitions recorded yet.</p>
              )}
            </div>

            {/* Coordinator Remarks */}
            <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>Coordinator Remarks</span>
              </div>
              <div className="text-slate-600">
                <p className="leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                  {viewingRecord.coordinatorRemarks || 'No additional remarks entered.'}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                  <span><strong>Enrolled:</strong> {new Date(viewingRecord.createdAt).toLocaleString()}</span>
                  <span><strong>Last Updated:</strong> {new Date(viewingRecord.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = viewingRecord;
                  setViewingRecord(null);
                  handleOpenEdit(target);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 font-bold text-white hover:bg-blue-800"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Update Claim</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: REGISTER CROP INSURANCE (Working Add Operation) */}
      {/* ============================================================== */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register Crop Insurance"
        subtitle="Enroll farmer in crop insurance risk coverage"
        maxWidth="md"
      >
        <form onSubmit={handleCreateInsuranceSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Select Farmer *</label>
            <select
              value={newFarmerId}
              onChange={e => handleFarmerChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            >
              {farmers.map(f => (
                <option key={f.id} value={f.id}>
                  {f.fullName} ({f.village}) - {f.primaryCrop} ({f.landAreaAcres} Acres)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Crop *</label>
              <input
                type="text"
                value={newCrop}
                onChange={e => setNewCrop(e.target.value)}
                required
                placeholder="e.g. Paddy, Cotton, Chilli"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Crop Season *</label>
              <select
                value={newSeason}
                onChange={e => setNewSeason(e.target.value as any)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              >
                <option value="Kharif">Kharif</option>
                <option value="Rabi">Rabi</option>
                <option value="Zaid">Zaid</option>
                <option value="Whole Year">Whole Year</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Insurance Scheme *</label>
            <select
              value={newScheme}
              onChange={e => setNewScheme(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            >
              <option value="PMFBY (Pradhan Mantri Fasal Bima Yojana)">PMFBY (Pradhan Mantri Fasal Bima Yojana)</option>
              <option value="Restructured Weather Based Crop Insurance Scheme (RWBCIS)">Restructured Weather Based Crop Insurance Scheme (RWBCIS)</option>
              <option value="Andhra Pradesh State Free Crop Insurance Scheme">Andhra Pradesh State Free Crop Insurance Scheme</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Insured Land Area (Acres) *</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={newInsuredAcres}
                onChange={e => setNewInsuredAcres(parseFloat(e.target.value) || 0)}
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Premium Status</label>
              <select
                value={newPremiumStatus}
                onChange={e => setNewPremiumStatus(e.target.value as any)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              >
                <option value="Subsidized">Subsidized / Free</option>
                <option value="Paid">Paid by Farmer</option>
                <option value="Pending">Payment Pending</option>
              </select>
            </div>
          </div>

          {/* Toggle for Initial Damage Incident */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={newHasDamage}
                onChange={e => setNewHasDamage(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Report Existing Crop Damage for Immediate Assessment</span>
            </label>

            {newHasDamage && (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700">Damage Type *</label>
                    <select
                      value={newDamageType}
                      onChange={e => setNewDamageType(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                    >
                      {DAMAGE_TYPES.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700">Date of Damage *</label>
                    <input
                      type="date"
                      value={newDamageDate}
                      onChange={e => setNewDamageDate(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Damage Description</label>
                  <textarea
                    rows={2}
                    value={newDamageDesc}
                    onChange={e => setNewDamageDesc(e.target.value)}
                    placeholder="Describe flood, pest attack, or hail damage on field..."
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                  />
                </div>

                {/* Supporting Image Upload */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Supporting Damage Photo (Optional)</label>
                  <div className="mt-1 flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700">
                      <Upload className="h-3.5 w-3.5 text-slate-500" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setNewSupportingImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {newSupportingImage && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-emerald-700 font-medium">Photo Attached</span>
                        <button
                          type="button"
                          onClick={() => setNewSupportingImage('')}
                          className="text-[11px] text-rose-600 underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  {newSupportingImage && (
                    <div className="mt-2 w-28 h-20 rounded border border-slate-200 overflow-hidden">
                      <img src={newSupportingImage} alt="Crop damage preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Coordinator Field Remarks</label>
            <textarea
              rows={2}
              value={newRemarks}
              onChange={e => setNewRemarks(e.target.value)}
              placeholder="e.g. Sowing certificate verified in village records..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-5 py-2 font-bold text-white hover:bg-blue-800"
            >
              Save Insurance Record
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 3: UPDATE CLAIM INFORMATION & STATUS (Working Update) */}
      {/* ============================================================== */}
      {editingRecord && (
        <Modal
          isOpen={Boolean(editingRecord)}
          onClose={() => setEditingRecord(null)}
          title={`Update Insurance Claim: ${editingRecord.id}`}
          subtitle={`${editingRecord.farmerName} • ${editingRecord.crop} (${editingRecord.season})`}
          maxWidth="lg"
        >
          <form onSubmit={handleUpdateClaimSubmit} className="space-y-4 text-xs">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-[11px] text-blue-900 flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
              <span>
                Update official claim status, assessment remarks, and approved relief amounts. FWMS preserves historical claim transitions.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Claim Status *</label>
                <select
                  value={editClaimStatus}
                  onChange={e => setEditClaimStatus(e.target.value as InsuranceClaimStatus)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-bold focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="Not Reported">Not Reported (No Damage Claim)</option>
                  <option value="Reported">Reported (Field Damage Logged)</option>
                  <option value="Under Assessment">Under Assessment (CCE in Progress)</option>
                  <option value="Approved">Approved (Sanction Issued)</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Payment Pending">Payment Pending (Sanctioned)</option>
                  <option value="Paid">Paid / Settled to Bank Account</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Payment Status</label>
                <select
                  value={editPaymentStatus}
                  onChange={e => setEditPaymentStatus(e.target.value as any)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="Unpaid">Unpaid / In Process</option>
                  <option value="Pending Disbursal">Pending Disbursal to Bank Account</option>
                  <option value="Disbursed / Paid">Disbursed / Paid (Completed)</option>
                </select>
              </div>
            </div>

            {/* Damage Details (Applicable when claim is reported or active) */}
            {editClaimStatus !== 'Not Reported' && (
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
                <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  <span>Reported Crop Damage Particulars</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700">Damage Type *</label>
                    <select
                      value={editDamageType}
                      onChange={e => setEditDamageType(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                    >
                      {DAMAGE_TYPES.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700">Date Damage Occurred *</label>
                    <input
                      type="date"
                      value={editDamageDate}
                      onChange={e => setEditDamageDate(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700">Claim Application Date</label>
                    <input
                      type="date"
                      value={editClaimAppDate}
                      onChange={e => setEditClaimAppDate(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Damage Assessment Description</label>
                  <textarea
                    rows={2}
                    value={editDamageDesc}
                    onChange={e => setEditDamageDesc(e.target.value)}
                    placeholder="Describe field damage, estimated yield deficit percentage, or inspection observations..."
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs"
                  />
                </div>

                {/* Supporting Damage Photo in Edit Modal */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Supporting Damage Photo</label>
                  <div className="mt-1 flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700">
                      <Upload className="h-3.5 w-3.5 text-slate-500" />
                      <span>{editSupportingImage ? 'Change Photo' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setEditSupportingImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {editSupportingImage && (
                      <button
                        type="button"
                        onClick={() => setEditSupportingImage('')}
                        className="text-[11px] text-rose-600 underline"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                  {editSupportingImage && (
                    <div className="mt-2 w-32 h-24 rounded border border-slate-200 overflow-hidden">
                      <img src={editSupportingImage} alt="Crop damage preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Approved Claim Amount (INR) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Approved Claim Amount (₹ INR)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                placeholder="e.g. 25000 (Enter officially sanctioned amount)"
                value={editApprovedAmount}
                onChange={e => setEditApprovedAmount(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-mono font-semibold focus:border-blue-500 focus:outline-hidden"
              />
              <p className="mt-0.5 text-[10px] text-slate-400">
                Sanctioned relief amount issued by agricultural insurance authorities.
              </p>
            </div>

            {/* Coordinator Remarks & Sanction Order Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">Coordinator Field Remarks / Order No.</label>
              <textarea
                rows={2}
                value={editRemarks}
                onChange={e => setEditRemarks(e.target.value)}
                placeholder="e.g. Sanction order # AP-INS-8891 approved by Mandal Agriculture Officer..."
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-5 py-2 font-bold text-white hover:bg-blue-800"
              >
                Save Insurance Updates
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
