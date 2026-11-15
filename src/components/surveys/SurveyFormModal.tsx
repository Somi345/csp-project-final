import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Farmer, MonthlySurvey, GrowthStage, CropCondition, WaterAvailability } from '../../types';
import { StorageService } from '../../services/storageService';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SurveyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (survey: MonthlySurvey) => void;
  farmers: Farmer[];
  preselectedFarmer?: Farmer | null;
}

const GROWTH_STAGES: GrowthStage[] = [
  'Sowing / Germination',
  'Vegetative',
  'Flowering',
  'Grain / Pod Formation',
  'Maturity / Harvesting'
];

const CROP_CONDITIONS: CropCondition[] = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'];
const WATER_CONDITIONS: WaterAvailability[] = ['Abundant', 'Adequate', 'Deficit', 'Severe Scarcity'];

export const SurveyFormModal: React.FC<SurveyFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  farmers,
  preselectedFarmer
}) => {
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
  const [surveyDate, setSurveyDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [crop, setCrop] = useState<string>('');
  const [cropVariety, setCropVariety] = useState<string>('');
  const [growthStage, setGrowthStage] = useState<GrowthStage>('Vegetative');
  const [cropCondition, setCropCondition] = useState<CropCondition>('Good');
  const [diseaseSymptoms, setDiseaseSymptoms] = useState<string>('');
  const [pestDetails, setPestDetails] = useState<string>('');
  const [waterAvailability, setWaterAvailability] = useState<WaterAvailability>('Adequate');
  const [fertilizerUsed, setFertilizerUsed] = useState<string>('');
  const [weatherCondition, setWeatherCondition] = useState<string>('Normal sunny weather, seasonal humidity');
  const [remarks, setRemarks] = useState<string>('');
  const [coordinatorNotes, setCoordinatorNotes] = useState<string>('');
  const [cropImageUrl, setCropImageUrl] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedFarmer) {
      setSelectedFarmerId(preselectedFarmer.id);
      setCrop(preselectedFarmer.primaryCrop);
      setCropVariety(preselectedFarmer.cropVariety);
    } else if (farmers.length > 0 && !selectedFarmerId) {
      setSelectedFarmerId(farmers[0].id);
      setCrop(farmers[0].primaryCrop);
      setCropVariety(farmers[0].cropVariety);
    }
  }, [preselectedFarmer, farmers]);

  // When farmer or month changes, check for duplicate survey
  useEffect(() => {
    if (!selectedFarmerId || !month) return;
    const exists = StorageService.checkSurveyExists(selectedFarmerId, month);
    if (exists) {
      setDuplicateWarning(`Note: A survey for this farmer for ${month} already exists. Submitting another will record an additional inspection entry.`);
    } else {
      setDuplicateWarning(null);
    }
  }, [selectedFarmerId, month]);

  const handleFarmerChange = (farmerId: string) => {
    setSelectedFarmerId(farmerId);
    const found = farmers.find(f => f.id === farmerId);
    if (found) {
      setCrop(found.primaryCrop);
      setCropVariety(found.cropVariety);
    }
  };

  // Secure Image File Upload with validation (format, size, extension)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'File size exceeds maximum 5MB limit.' });
      return;
    }

    // Validate extension / MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrors({ ...errors, image: 'Invalid image format. Allowed: JPG, PNG, WEBP.' });
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
    if (!selectedFarmerId) errs.farmer = 'Please select a farmer.';
    if (!surveyDate) errs.surveyDate = 'Survey date is required.';
    if (!crop.trim()) errs.crop = 'Crop name is required.';
    if (!growthStage) errs.growthStage = 'Growth stage is required.';
    if (!cropCondition) errs.cropCondition = 'Crop condition is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const farmer = farmers.find(f => f.id === selectedFarmerId);
    if (!farmer) return;

    const hasDiseaseAlert = cropCondition === 'Poor' || cropCondition === 'Critical' || Boolean(diseaseSymptoms.trim());

    const newSurvey: MonthlySurvey = {
      id: `SRV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      farmerId: farmer.id,
      farmerName: farmer.fullName,
      village: farmer.village,
      surveyDate,
      month: surveyDate.slice(0, 7),
      crop: crop.trim(),
      cropVariety: cropVariety.trim() || 'Standard Regional',
      growthStage,
      cropCondition,
      diseaseSymptoms: diseaseSymptoms.trim(),
      pestDetails: pestDetails.trim(),
      waterAvailability,
      fertilizerUsed: fertilizerUsed.trim(),
      weatherCondition: weatherCondition.trim(),
      cropImageUrl: cropImageUrl || undefined,
      remarks: remarks.trim(),
      coordinatorNotes: coordinatorNotes.trim(),
      hasDiseaseAlert,
      createdAt: new Date().toISOString()
    };

    onSave(newSurvey);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Conduct Monthly Crop Survey"
      subtitle="Record verified field conditions, growth stage, pest alerts, and inputs"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {duplicateWarning && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <span>{duplicateWarning}</span>
          </div>
        )}

        {/* Row 1: Farmer & Survey Date */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Select Farmer *</label>
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
            <label className="block text-xs font-semibold text-slate-700">Survey Date *</label>
            <input
              type="date"
              value={surveyDate}
              onChange={e => {
                setSurveyDate(e.target.value);
                setMonth(e.target.value.slice(0, 7));
              }}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
            {errors.surveyDate && <p className="mt-1 text-[11px] text-rose-600">{errors.surveyDate}</p>}
          </div>
        </div>

        {/* Row 2: Crop, Variety, Stage */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Crop *</label>
            <input
              type="text"
              value={crop}
              onChange={e => setCrop(e.target.value)}
              placeholder="e.g. Paddy, Chilli"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Crop Variety</label>
            <input
              type="text"
              value={cropVariety}
              onChange={e => setCropVariety(e.target.value)}
              placeholder="e.g. BPT 5204"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Growth Stage *</label>
            <select
              value={growthStage}
              onChange={e => setGrowthStage(e.target.value as any)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            >
              {GROWTH_STAGES.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Overall Crop Condition & Water */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Overall Crop Condition *</label>
            <select
              value={cropCondition}
              onChange={e => setCropCondition(e.target.value as any)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            >
              {CROP_CONDITIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Water Availability</label>
            <select
              value={waterAvailability}
              onChange={e => setWaterAvailability(e.target.value as any)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            >
              {WATER_CONDITIONS.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 4: Disease Symptoms & Pest Details */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Disease / Deficiency Symptoms</label>
            <textarea
              rows={2}
              value={diseaseSymptoms}
              onChange={e => setDiseaseSymptoms(e.target.value)}
              placeholder="e.g. Leaf spot, yellowing veins, bacterial lesions..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Pest Infestation Details</label>
            <textarea
              rows={2}
              value={pestDetails}
              onChange={e => setPestDetails(e.target.value)}
              placeholder="e.g. Stem borer, sucking pests, aphids count..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Row 5: Fertilizer & Weather */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Fertilizer & Chemicals Used</label>
            <input
              type="text"
              value={fertilizerUsed}
              onChange={e => setFertilizerUsed(e.target.value)}
              placeholder="e.g. Urea (45kg), DAP (50kg), Potash"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Weather Observations</label>
            <input
              type="text"
              value={weatherCondition}
              onChange={e => setWeatherCondition(e.target.value)}
              placeholder="e.g. Sunny, 32°C, moderate humidity"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Secure Crop Photograph Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">Crop Photograph (Optional)</label>
          <div className="mt-1 flex items-center gap-3">
            <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
              <Upload className="h-4 w-4 text-slate-500" />
              <span>Choose Image (Max 5MB)</span>
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
          {errors.image && <p className="mt-1 text-[11px] text-rose-600">{errors.image}</p>}
        </div>

        {/* Coordinator Field Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">Coordinator Field Remarks & Advisory Given</label>
          <textarea
            rows={2}
            value={coordinatorNotes}
            onChange={e => setCoordinatorNotes(e.target.value)}
            placeholder="Official advice given to farmer regarding pest sprays, drainage, or fertilizer top-dressing..."
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        {/* Modal Actions */}
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
            className="rounded-lg bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800"
          >
            Submit Monthly Survey
          </button>
        </div>
      </form>
    </Modal>
  );
};
