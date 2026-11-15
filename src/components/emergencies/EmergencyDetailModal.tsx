import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { EmergencyCase, EmergencyStatus } from '../../types';
import { Badge } from '../common/Badge';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  User, 
  Clock, 
  Save 
} from 'lucide-react';

interface EmergencyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergency: EmergencyCase | null;
  onUpdate: (updated: EmergencyCase) => void;
}

export const EmergencyDetailModal: React.FC<EmergencyDetailModalProps> = ({
  isOpen,
  onClose,
  emergency,
  onUpdate
}) => {
  const [status, setStatus] = useState<EmergencyStatus>('Open');
  const [solution, setSolution] = useState('');
  const [medicinePrescribed, setMedicinePrescribed] = useState('');
  const [fertilizerRecommended, setFertilizerRecommended] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [coordinatorNotes, setCoordinatorNotes] = useState('');
  const [saveMsg, setSaveMsg] = useState(false);

  useEffect(() => {
    if (emergency) {
      setStatus(emergency.status);
      setSolution(emergency.solution || '');
      setMedicinePrescribed(emergency.medicinePrescribed || '');
      setFertilizerRecommended(emergency.fertilizerRecommended || '');
      setFollowUpDate(emergency.followUpDate || '');
      setCoordinatorNotes(emergency.coordinatorNotes || '');
      setSaveMsg(false);
    }
  }, [emergency]);

  if (!emergency) return null;

  const handleSave = () => {
    const isNowResolved = status === 'Resolved' && emergency.status !== 'Resolved';
    const updated: EmergencyCase = {
      ...emergency,
      status,
      solution: solution.trim() || undefined,
      medicinePrescribed: medicinePrescribed.trim() || undefined,
      fertilizerRecommended: fertilizerRecommended.trim() || undefined,
      followUpDate: followUpDate || undefined,
      coordinatorNotes: coordinatorNotes.trim(),
      updatedAt: new Date().toISOString(),
      resolvedAt: isNowResolved ? new Date().toISOString() : emergency.resolvedAt
    };

    onUpdate(updated);
    setSaveMsg(true);
    setTimeout(() => {
      setSaveMsg(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Emergency Incident: ${emergency.id}`}
      subtitle={`Logged for ${emergency.farmerName} (${emergency.village}) on ${new Date(emergency.createdAt).toLocaleDateString()}`}
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs text-slate-700">
        {/* Top Priority & Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">{emergency.problemType}</span>
              <Badge variant={emergency.priority === 'Critical' ? 'danger' : emergency.priority === 'High' ? 'warning' : 'primary'}>
                {emergency.priority} Priority
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-blue-700" />
                {emergency.farmerName} ({emergency.farmerId})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                {emergency.contactPhone}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                {emergency.village}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Current Status:</span>
            <Badge variant={
              status === 'Resolved' ? 'success' :
              status === 'In Progress' ? 'warning' :
              status === 'Closed' ? 'neutral' : 'danger'
            }>
              {status}
            </Badge>
          </div>
        </div>

        {/* Problem Description */}
        <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3.5">
          <span className="font-bold text-rose-900">Crop Under Threat: {emergency.crop}</span>
          <p className="mt-1 text-slate-700 leading-relaxed">{emergency.problemDescription}</p>
        </div>

        {/* Image if present */}
        {emergency.cropImageUrl && (
          <div>
            <span className="font-bold text-slate-800">Field Evidence Photo:</span>
            <div className="mt-1.5 max-h-48 overflow-hidden rounded-lg border border-slate-200">
              <img src={emergency.cropImageUrl} alt="Damage" className="w-full object-cover max-h-48" />
            </div>
          </div>
        )}

        {/* Interactive Lifecycle Workflow */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
          <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-700" />
            <span>Update Coordinator Response & Workflow Lifecycle</span>
          </h4>

          {/* Status selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Incident Lifecycle Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs font-bold focus:border-blue-500 focus:outline-hidden"
              >
                <option value="Open">Open (Pending Immediate Inspection)</option>
                <option value="In Progress">In Progress (Treatment / Remedy Prescribed)</option>
                <option value="Resolved">Resolved (Crop Condition Stabilized)</option>
                <option value="Closed">Closed (Field Case Completed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Follow-up Field Inspection Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={e => setFollowUpDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Solutions & Prescriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Prescribed Remedial Solution</label>
              <input
                type="text"
                value={solution}
                onChange={e => setSolution(e.target.value)}
                placeholder="e.g. Drainage canal diverted, sticky traps installed..."
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Prescribed Medicine / Spray</label>
              <input
                type="text"
                value={medicinePrescribed}
                onChange={e => setMedicinePrescribed(e.target.value)}
                placeholder="e.g. Diafenthiuron 50% WP @ 1.25g/L..."
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Nutritional / Fertilizer Recommendation</label>
            <input
              type="text"
              value={fertilizerRecommended}
              onChange={e => setFertilizerRecommended(e.target.value)}
              placeholder="e.g. Foliar spray of Potassium Schoenite, suspend nitrogen..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Coordinator Inspection Log & Notes</label>
            <textarea
              rows={2}
              value={coordinatorNotes}
              onChange={e => setCoordinatorNotes(e.target.value)}
              placeholder="Observations from on-site visit, instructions to farmer..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <div className="text-[11px] text-slate-400">
            Last Updated: {new Date(emergency.updatedAt).toLocaleString()}
          </div>

          <div className="flex items-center gap-2">
            {saveMsg && (
              <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Updated!
              </span>
            )}
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save & Update Case</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
