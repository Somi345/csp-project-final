import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, UserCheck, Info } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Farmer, CoordinatorProfile } from '../../types';

interface FarmerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (farmer: Farmer) => Promise<boolean | void> | void;
  initialFarmer?: Farmer | null;
  coordinator?: CoordinatorProfile;
}

const VILLAGES = ['Kankipadu', 'Gudivada', 'Vuyyuru', 'Nuzvid', 'Penamaluru'];
const CROPS = ['Paddy', 'Chilli', 'Cotton', 'Maize', 'Groundnut', 'Sugarcane'];
const SOIL_TYPES = ['Alluvial Clay Loam', 'Black Cotton Soil', 'Red Sandy Loam', 'Heavy Clay Soil', 'Sandy Loam'];
const WATER_SOURCES = ['Canal Irrigation', 'Borewell & Canal', 'Borewell', 'Drip Irrigation & Farm Pond', 'Rainfed & Supplementary Well'];

export const FarmerFormModal: React.FC<FarmerFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialFarmer,
  coordinator
}) => {
  const [formData, setFormData] = useState<Partial<Farmer>>({
    fullName: '',
    fatherSpouseName: '',
    age: 45,
    gender: 'Male',
    phone: '',
    aadhaarMasked: '',
    village: 'Kankipadu',
    mandal: 'Kankipadu Mandal',
    district: 'Krishna District',
    state: 'Andhra Pradesh',
    landAreaAcres: 3.0,
    soilType: 'Alluvial Clay Loam',
    waterSource: 'Canal Irrigation',
    primaryCrop: 'Paddy',
    cropVariety: '',
    status: 'Active',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialFarmer) {
      setFormData({ ...initialFarmer });
    } else {
      setFormData({
        fullName: '',
        fatherSpouseName: '',
        age: 45,
        gender: 'Male',
        phone: '',
        aadhaarMasked: 'XXXX-XXXX-' + Math.floor(1000 + Math.random() * 9000),
        village: 'Kankipadu',
        mandal: 'Kankipadu Mandal',
        district: 'Krishna District',
        state: 'Andhra Pradesh',
        landAreaAcres: 3.0,
        soilType: 'Alluvial Clay Loam',
        waterSource: 'Canal Irrigation',
        primaryCrop: 'Paddy',
        cropVariety: 'BPT 5204 (Samba Mahsuri)',
        status: 'Active',
        notes: ''
      });
    }
    setErrors({});
    setBackendError(null);
  }, [initialFarmer, isOpen]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.fullName?.trim()) errs.fullName = 'Full Name is required.';
    if (!formData.fatherSpouseName?.trim()) errs.fatherSpouseName = 'Father / Spouse Name is required.';
    if (!formData.age || formData.age < 18 || formData.age > 100) errs.age = 'Age must be between 18 and 100.';
    if (!formData.phone?.trim() || formData.phone.length < 10) errs.phone = 'Valid contact phone number with at least 10 digits is required.';
    if (!formData.landAreaAcres || formData.landAreaAcres <= 0) errs.landAreaAcres = 'Land area must be greater than 0.';
    if (!formData.primaryCrop) errs.primaryCrop = 'Primary Crop is required.';
    if (!formData.village) errs.village = 'Village is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackendError(null);
    if (!validate()) return;

    const farmerToSave: Farmer = {
      id: initialFarmer ? initialFarmer.id : `FMR-AP-0${Math.floor(100 + Math.random() * 900)}`,
      fullName: formData.fullName!.trim(),
      fatherSpouseName: formData.fatherSpouseName!.trim(),
      age: Number(formData.age),
      gender: formData.gender as any,
      phone: formData.phone!.trim(),
      aadhaarMasked: formData.aadhaarMasked!.includes('XXXX-XXXX-') 
        ? formData.aadhaarMasked! 
        : `XXXX-XXXX-${formData.aadhaarMasked!.slice(-4)}`,
      village: formData.village!,
      mandal: `${formData.village} Mandal`,
      district: 'Krishna District',
      state: 'Andhra Pradesh',
      landAreaAcres: Number(formData.landAreaAcres),
      soilType: formData.soilType || 'Alluvial Clay Loam',
      waterSource: formData.waterSource || 'Canal Irrigation',
      primaryCrop: formData.primaryCrop || 'Paddy',
      cropVariety: formData.cropVariety || 'Standard Regional Variety',
      registrationDate: initialFarmer ? initialFarmer.registrationDate : new Date().toISOString().slice(0, 10),
      status: formData.status as any,
      notes: formData.notes,
      updatedAt: new Date().toISOString()
    };

    try {
      setIsSubmitting(true);
      const res = await onSave(farmerToSave);
      if (res !== false) {
        onClose();
      }
    } catch (err: any) {
      setBackendError(err.message || 'Failed to update farmer record via backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialFarmer ? `Edit Farmer Record (${initialFarmer.id})` : 'Register New Farmer'}
      subtitle={
        initialFarmer 
          ? "Authorized update by Village Agriculture Coordinator • Historical survey & welfare records preserved" 
          : "Enter verified landholder and crop details for the village agriculture register"
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Coordinator Authorization & Retention Notice */}
        <div className="rounded-lg bg-blue-50/80 border border-blue-200 p-3 text-xs text-blue-900 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-[11px] leading-relaxed">
            <div className="font-semibold flex items-center gap-1.5">
              <span>Authorization Check:</span>
              <span className="text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">
                {coordinator?.role || 'Village Agriculture Coordinator'}
              </span>
            </div>
            <p className="text-blue-800">
              Permanent deletion is prohibited by policy. To halt active service without breaking historical linkages to surveys, emergency cases, or scheme disbursements, change <strong>Registration Status</strong> to <em>Inactive</em>.
            </p>
          </div>
        </div>

        {/* Backend / Authorization Error Message */}
        {backendError && (
          <div className="rounded-lg bg-rose-50 border border-rose-300 p-3 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Backend Authorization / Validation Error</p>
              <p className="mt-0.5 text-[11px]">{backendError}</p>
            </div>
          </div>
        )}

        {/* Row 1: Name & Father/Spouse */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Full Name *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Venkata Ramana Rao M."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
            {errors.fullName && <p className="mt-1 text-[11px] text-rose-600">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Father / Spouse Name *</label>
            <input
              type="text"
              value={formData.fatherSpouseName}
              onChange={e => setFormData({ ...formData, fatherSpouseName: e.target.value })}
              placeholder="e.g. Satyanarayana Murthy"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
            {errors.fatherSpouseName && <p className="mt-1 text-[11px] text-rose-600">{errors.fatherSpouseName}</p>}
          </div>
        </div>

        {/* Row 2: Age, Gender, Phone, Masked Aadhaar */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Age *</label>
            <input
              type="number"
              value={formData.age}
              onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
            {errors.age && <p className="mt-1 text-[11px] text-rose-600">{errors.age}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Gender</label>
            <select
              value={formData.gender}
              onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Phone *</label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98480 34120"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
            {errors.phone && <p className="mt-1 text-[11px] text-rose-600">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Masked Aadhaar</label>
            <input
              type="text"
              value={formData.aadhaarMasked}
              onChange={e => setFormData({ ...formData, aadhaarMasked: e.target.value })}
              placeholder="XXXX-XXXX-4819"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs bg-slate-50 focus:border-blue-500 focus:outline-hidden font-mono"
            />
            <p className="mt-0.5 text-[10px] text-slate-400">Strictly masked for privacy</p>
          </div>
        </div>

        {/* Row 3: Location */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Village *</label>
            <select
              value={formData.village}
              onChange={e => setFormData({ ...formData, village: e.target.value, mandal: `${e.target.value} Mandal` })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            >
              {VILLAGES.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Mandal</label>
            <input
              type="text"
              readOnly
              value={formData.mandal}
              className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">District & State</label>
            <input
              type="text"
              readOnly
              value="Krishna District, Andhra Pradesh"
              className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500"
            />
          </div>
        </div>

        {/* Row 4: Land & Agronomic Details */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Land Area (Acres) *</label>
            <input
              type="number"
              step="0.1"
              value={formData.landAreaAcres}
              onChange={e => setFormData({ ...formData, landAreaAcres: parseFloat(e.target.value) || 0 })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
            {errors.landAreaAcres && <p className="mt-1 text-[11px] text-rose-600">{errors.landAreaAcres}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Soil Type</label>
            <select
              value={formData.soilType}
              onChange={e => setFormData({ ...formData, soilType: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            >
              {SOIL_TYPES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Water Source</label>
            <select
              value={formData.waterSource}
              onChange={e => setFormData({ ...formData, waterSource: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            >
              {WATER_SOURCES.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 5: Crop & Status */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Primary Crop *</label>
            <select
              value={formData.primaryCrop}
              onChange={e => setFormData({ ...formData, primaryCrop: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            >
              {CROPS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Crop Variety</label>
            <input
              type="text"
              value={formData.cropVariety}
              onChange={e => setFormData({ ...formData, cropVariety: e.target.value })}
              placeholder="e.g. BPT 5204 (Samba Mahsuri)"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Registration Status *
            </label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden font-semibold"
            >
              <option value="Active">Active (In Current Service)</option>
              <option value="Inactive">Inactive (Suspended - Preserves History)</option>
            </select>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Use Inactive instead of deletion to retain history.
            </p>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">Coordinator Field Notes</label>
          <textarea
            rows={2}
            value={formData.notes || ''}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Special soil characteristics, tenant arrangement, or micro-irrigation status..."
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <div className="text-[11px] text-slate-500">
            {initialFarmer?.registrationDate && (
              <span>Registered on: <strong>{initialFarmer.registrationDate}</strong></span>
            )}
            {initialFarmer?.updatedAt && (
              <span className="ml-2 font-mono text-[10px] text-slate-400">
                (Last: {new Date(initialFarmer.updatedAt).toLocaleDateString()})
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : initialFarmer ? 'Save Changes' : 'Register Farmer'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

