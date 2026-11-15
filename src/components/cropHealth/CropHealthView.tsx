import React, { useState } from 'react';
import { 
  Stethoscope, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ShieldAlert, 
  Upload, 
  Save, 
  Info,
  Calendar,
  User,
  Sprout
} from 'lucide-react';
import { Farmer, CropHealthRecord } from '../../types';
import { AIService, CropAnalysisOutput, MANDATORY_AGRI_DISCLAIMER } from '../../services/aiService';
import { Badge } from '../common/Badge';

interface CropHealthViewProps {
  farmers: Farmer[];
  healthRecords: CropHealthRecord[];
  onSaveHealthRecord: (record: CropHealthRecord) => void;
}

export const CropHealthView: React.FC<CropHealthViewProps> = ({
  farmers,
  healthRecords,
  onSaveHealthRecord
}) => {
  const aiStatus = AIService.getStatusMessage();

  // Diagnostic form state
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>(farmers[0]?.id || '');
  const [crop, setCrop] = useState<string>(farmers[0]?.primaryCrop || 'Paddy');
  const [variety, setVariety] = useState<string>(farmers[0]?.cropVariety || '');
  const [symptoms, setSymptoms] = useState<string>('');
  const [growthStage, setGrowthStage] = useState<string>('Vegetative');
  const [coordinatorObservation, setCoordinatorObservation] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<CropAnalysisOutput | null>(null);
  const [treatmentPrescribed, setTreatmentPrescribed] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleFarmerChange = (id: string) => {
    setSelectedFarmerId(id);
    const f = farmers.find(farm => farm.id === id);
    if (f) {
      setCrop(f.primaryCrop);
      setVariety(f.cropVariety);
    }
  };

  const handleRunDiagnosis = async () => {
    if (!symptoms.trim()) {
      alert('Please enter observed crop symptoms before running diagnostic evaluation.');
      return;
    }

    setIsAnalyzing(true);
    setDiagnosticResult(null);
    setSaveSuccessMsg(null);

    try {
      // Analyze with proper AIService architecture
      const result = await AIService.analyzeObservation({
        crop,
        cropVariety: variety,
        symptoms,
        growthStage
      });
      setDiagnosticResult(result);
      setTreatmentPrescribed(`${result.pesticideRecommendation} | ${result.fertilizerRecommendation}`);
    } catch (err) {
      console.error('Diagnosis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToDatabase = () => {
    const farmer = farmers.find(f => f.id === selectedFarmerId);
    if (!farmer || !diagnosticResult) return;

    const newRecord: CropHealthRecord = {
      id: `HLT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      farmerId: farmer.id,
      farmerName: farmer.fullName,
      village: farmer.village,
      crop,
      cropVariety: variety || 'Standard Regional',
      observationDate: new Date().toISOString().slice(0, 10),
      symptoms,
      detectedCondition: diagnosticResult.diagnosis,
      severity: diagnosticResult.status === 'configured' && diagnosticResult.confidenceScore && diagnosticResult.confidenceScore > 0.85 ? 'High' : 'Moderate',
      coordinatorObservation: coordinatorObservation || 'Diagnostic inspection conducted via FWMS Agronomy Service.',
      aiAssisted: diagnosticResult.isAiGenerated,
      aiConfidenceScore: diagnosticResult.confidenceScore,
      aiRecommendation: {
        diagnosis: diagnosticResult.diagnosis,
        fertilizerRecommendation: diagnosticResult.fertilizerRecommendation,
        pesticideRecommendation: diagnosticResult.pesticideRecommendation,
        culturalCareSuggestions: diagnosticResult.cropCareSuggestions,
        irrigationSuggestions: diagnosticResult.irrigationSuggestions,
        disclaimer: diagnosticResult.disclaimer
      },
      treatmentPrescribed: treatmentPrescribed || diagnosticResult.pesticideRecommendation,
      followUpDate,
      status: 'Treatment Prescribed'
    };

    onSaveHealthRecord(newRecord);
    setSaveSuccessMsg(`Health record ${newRecord.id} successfully recorded in cluster database.`);
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Service Architecture Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Crop Health & Diagnostic Workbench</h2>
          <p className="text-xs text-slate-500">
            Field pathogen identification, agronomic recommendations, and treatment tracking
          </p>
        </div>

        {/* AI Service Status Pill */}
        <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
          aiStatus.isConfigured 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className={`h-2.5 w-2.5 rounded-full ${aiStatus.isConfigured ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`} />
          <span>{aiStatus.message}</span>
        </div>
      </div>

      {/* Honest Architectural Status Banner */}
      {!aiStatus.isConfigured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-950">AI analysis service is currently unavailable.</h4>
              <p className="mt-0.5 leading-relaxed text-amber-800">
                A live external AI model API is not configured in this environment. FWMS operates with verified <strong>Agronomic Reference Knowledge Base</strong> (covering Rice Blast, Bacterial Leaf Blight, Chilli Leaf Curl, Cotton Pink Bollworm, and Fall Armyworm) as decision support without simulated confidence scores or fabricated diagnoses.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic Workbench Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-blue-700" />
              <span>Record Crop Observation</span>
            </h3>
            <p className="text-xs text-slate-500">Enter field symptoms observed by coordinator</p>
          </div>

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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Crop *</label>
              <input
                type="text"
                value={crop}
                onChange={e => setCrop(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Crop Variety</label>
              <input
                type="text"
                value={variety}
                onChange={e => setVariety(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Growth Stage</label>
            <select
              value={growthStage}
              onChange={e => setGrowthStage(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            >
              <option value="Sowing / Germination">Sowing / Germination</option>
              <option value="Vegetative">Vegetative</option>
              <option value="Flowering">Flowering</option>
              <option value="Grain / Pod Formation">Grain / Pod Formation</option>
              <option value="Maturity / Harvesting">Maturity / Harvesting</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Observed Foliar / Stem / Root Symptoms *</label>
            <textarea
              rows={3}
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              placeholder="e.g. Leaf upward curling, stunted internodes, flower dropping, thrips beneath leaf..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Coordinator Field Remarks</label>
            <textarea
              rows={2}
              value={coordinatorObservation}
              onChange={e => setCoordinatorObservation(e.target.value)}
              placeholder="Local temperature, drainage backwash, or adjacent field conditions..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <button
            onClick={handleRunDiagnosis}
            disabled={isAnalyzing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 py-2.5 px-4 text-xs font-bold text-white shadow-xs hover:bg-blue-800 disabled:opacity-60 transition-colors"
          >
            {isAnalyzing ? (
              <span>Evaluating Agronomic Knowledge Base...</span>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Run Diagnostic Analysis</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Diagnostic & Treatment Output (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Diagnostic Assessment & Treatment Plan</h3>
                <p className="text-xs text-slate-500">Separation of coordinator observation vs system recommendation</p>
              </div>
              {diagnosticResult && (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600">
                  {diagnosticResult.modelIdentifier}
                </span>
              )}
            </div>

            {saveSuccessMsg && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {!diagnosticResult ? (
              <div className="py-16 text-center text-xs text-slate-400">
                <Stethoscope className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                Select a farmer, describe the observed crop symptoms on the left, and click "Run Diagnostic Analysis".
              </div>
            ) : (
              <div className="mt-4 space-y-4 text-xs">
                {/* Diagnosis Box */}
                <div className="rounded-lg bg-blue-50/70 border border-blue-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                      Identified Condition
                    </span>
                    <Badge variant={diagnosticResult.status === 'configured' ? 'info' : 'secondary'}>
                      {diagnosticResult.status === 'configured' ? 'AI Diagnostic Model' : 'Heuristic Ruleset'}
                    </Badge>
                  </div>
                  <h4 className="mt-1 text-base font-bold text-slate-900">{diagnosticResult.diagnosis}</h4>
                  <p className="mt-1 text-slate-600 leading-relaxed">{diagnosticResult.diseaseDescription}</p>
                </div>

                {/* Recommendations Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                    <span className="font-bold text-slate-900">Recommended Pesticide / Spray:</span>
                    <p className="mt-1 text-slate-700">{diagnosticResult.pesticideRecommendation}</p>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                    <span className="font-bold text-slate-900">Nutritional / Fertilizer Adjustment:</span>
                    <p className="mt-1 text-slate-700">{diagnosticResult.fertilizerRecommendation}</p>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                    <span className="font-bold text-slate-900">Cultural & Field Sanitation:</span>
                    <p className="mt-1 text-slate-700">{diagnosticResult.cropCareSuggestions}</p>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                    <span className="font-bold text-slate-900">Irrigation Advice:</span>
                    <p className="mt-1 text-slate-700">{diagnosticResult.irrigationSuggestions}</p>
                  </div>
                </div>

                {/* Mandatory Disclaimer */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900 flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>{MANDATORY_AGRI_DISCLAIMER}</span>
                </div>

                {/* Follow-up & Prescription form */}
                <div className="rounded-lg border border-slate-200 p-3 bg-white space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Official Treatment Prescribed by Coordinator</label>
                    <input
                      type="text"
                      value={treatmentPrescribed}
                      onChange={e => setTreatmentPrescribed(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                    />
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
              </div>
            )}
          </div>

          {diagnosticResult && (
            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
              <button
                onClick={handleSaveToDatabase}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save to Cluster Health Records</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Historical Crop Health Records */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Cluster Crop Health & Disease Registry</h3>
        {healthRecords.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No crop health records registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID & Date</th>
                  <th className="px-4 py-3">Farmer & Location</th>
                  <th className="px-4 py-3">Crop</th>
                  <th className="px-4 py-3">Diagnosed Condition</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Treatment Prescribed</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {healthRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{rec.id}</div>
                      <div className="text-[11px] text-slate-400">{rec.observationDate}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{rec.farmerName}</div>
                      <div className="text-[11px] text-slate-400">{rec.village}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">{rec.crop}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{rec.detectedCondition}</td>
                    <td className="px-4 py-3">
                      <Badge variant={rec.severity === 'Severe' || rec.severity === 'High' ? 'danger' : 'warning'}>
                        {rec.severity}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 truncate max-w-[200px] text-slate-600">{rec.treatmentPrescribed}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{rec.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
