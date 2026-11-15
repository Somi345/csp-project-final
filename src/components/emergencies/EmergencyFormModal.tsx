import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Farmer, EmergencyCase, EmergencyPriority, EmergencyStatus } from '../../types';
import { AlertTriangle, Upload, CheckCircle2 } from 'lucide-react';

interface EmergencyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (emergency: EmergencyCase) => void;
  farmers: Farmer[];
  preselectedFarmer?: Farmer | null;
}

export const EmergencyFormModal: React.FC<EmergencyFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  farmers,
  preselectedFarmer
}) => {
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
  const [problemType, setProblemType] = useState<EmergencyCase['problemType']>('Severe Pest Outbreak');
  const [crop, setCrop] = useState<string>('');
  const [priority, setPriority] = useState<EmergencyPriority>('High');
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [solution, setSolution] = useState<string>('');
  const [medicinePrescribed, setMedicinePrescribed] = useState<string>('');
  const [fertilizerRecommended, setFertilizerRecommended] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>(
    new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10)
  );
  const [coordinatorNotes, setCoordinatorNotes] = useState<string>('');
  const [cropImageUrl, setCropImageUrl] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (preselectedFarmer) {
      setSelectedFarmerId(preselectedFarmer.id);
      setCrop(preselectedFarmer.primaryCrop);
    } else if (farmers.length > 0 && !selectedFarmerId) {
      setSelectedFarmerId(farmers[0].id);
      setCrop(farmers[0].primaryCrop);
    }
  }, [preselectedFarmer, farmers]);

  const handleFarmerChange = (id: string) => {
    setSelectedFarmerId(id);
    const f = farmers.find(farm => farm.id === id);
    if (f) {
      setCrop(f.primaryCrop);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'File exceeds 5MB limit.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropImageUrl(reader.result as string);
      setImageFileName(file.name);
      setErrors({ ...errors, image: '' });
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!selectedFarmerId) errs.farmer = 'Please select an affected farmer.';
    if (!crop.trim()) errs.crop = 'Crop is required.';
    if (!problemDescription.trim()) errs.problemDescription = 'Please describe the urgent problem in detail.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const farmer = farmers.find(f => f.id === selectedFarmerId);
    if (!farmer) return;

    const newCase: EmergencyCase = {
      id: `EMG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      farmerId: farmer.id,
      farmerName: farmer.fullName,
      village: farmer.village,
      contactPhone: farmer.phone,
      problemType,
      crop: crop.trim(),
      problemDescription: problemDescription.trim(),
      cropImageUrl: cropImageUrl || undefined,
      priority,
      status: 'Open',
      solution: solution.trim() || undefined,
      medicinePrescribed: medicinePrescribed.trim() || undefined,
      fertilizerRecommended: fertilizerRecommended.trim() || undefined,
      followUpDate: followUpDate || undefined,
      coordinatorNotes: coordinatorNotes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(newCase);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Emergency Crop Incident"
      subtitle="Register acute pest outbreaks, sudden fungal wilts, or localized climate shock"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Farmer & Priority */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Affected Farmer *</label>
            <select
              value={selectedFarmerId}
              onChange={e => handleFarmerChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            >
              {farmers.map(f => (
                <option key={f.id} value={f.id}>
                  {f.fullName} ({f.village}) - {f.primaryCrop}
                </option>
              ))}
            </select>
            {errors.farmer && <p className="mt-1 text-[11px] text-rose-600">{errors.farmer}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Emergency Priority *</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-bold focus:border-blue-500 focus:outline-hidden"
            >
              <option value="Critical" className="text-rose-700 font-bold">Critical (Immediate Field Visit within 12h)</option>
              <option value="High" className="text-amber-700 font-bold">High (Inspection within 24h)</option>
              <option value="Medium" className="text-blue-700">Medium (Inspection within 48h)</option>
              <option value="Low" className="text-slate-700">Low (Routine Monitoring)</option>
            </select>
          </div>
        </div>

        {/* Problem Type & Affected Crop */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Problem Classification *</label>
            <select
              value={problemType}
              onChange={e => setProblemType(e.target.value as any)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            >
              <option value="Severe Pest Outbreak">Severe Pest Outbreak (e.g. Bollworm, Thrips)</option>
              <option value="Sudden Fungal Wilt">Sudden Fungal Wilt / Bacterial Blight</option>
              <option value="Water Logging / Flood">Water Logging / Flood Inundation</option>
              <option value="Drought Stress">Drought Stress / Canal Failure</option>
              <option value="Nutrient Deficiency Crisis">Nutrient Deficiency Crisis</option>
              <option value="Crop Damage by Wildlife">Crop Damage by Wildlife (Boar, Cattle)</option>
              <option value="Other Crop Emergency">Other Acute Crop Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Crop Under Threat *</label>
            <input
              type="text"
              value={crop}
              onChange={e => setCrop(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">Emergency Problem Description *</label>
          <textarea
            rows={3}
            value={problemDescription}
            onChange={e => setProblemDescription(e.target.value)}
            placeholder="Describe extent of crop damage, speed of spread, affected acreage, and farmer's urgent report..."
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
          />
          {errors.problemDescription && <p className="mt-1 text-[11px] text-rose-600">{errors.problemDescription}</p>}
        </div>

        {/* Immediate Solution / Medicine Prescribed */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Immediate Remedial Action</label>
            <input
              type="text"
              value={solution}
              onChange={e => setSolution(e.target.value)}
              placeholder="e.g. Drain field water, erect perimeter traps..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Chemical / Medicine Prescribed</label>
            <input
              type="text"
              value={medicinePrescribed}
              onChange={e => setMedicinePrescribed(e.target.value)}
              placeholder="e.g. Diafenthiuron 50% WP @ 1.25g/L..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Fertilizer & Follow-up */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Nutritional Recommendation</label>
            <input
              type="text"
              value={fertilizerRecommended}
              onChange={e => setFertilizerRecommended(e.target.value)}
              placeholder="e.g. Hold nitrogen; apply foliar potash..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Follow-up Field Visit Date</label>
            <input
              type="date"
              value={followUpDate}
              onChange={e => setFollowUpDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Image Attachment */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">Field Damage Photo (Optional)</label>
          <div className="mt-1 flex items-center gap-3">
            <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
              <Upload className="h-4 w-4 text-slate-500" />
              <span>Attach Image (Max 5MB)</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {imageFileName && (
              <span className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {imageFileName}
              </span>
            )}
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-rose-700 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-800"
          >
            Log Emergency Incident
          </button>
        </div>
      </form>
    </Modal>
  );
};
