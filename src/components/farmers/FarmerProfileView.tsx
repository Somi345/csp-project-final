import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  ClipboardCheck, 
  AlertTriangle, 
  Stethoscope, 
  Landmark, 
  Edit3, 
  PlusCircle, 
  Sprout, 
  FileText,
  Clock,
  Power,
  RotateCcw,
  Lock,
  UserCheck
} from 'lucide-react';
import { 
  Farmer, 
  MonthlySurvey, 
  CropHealthRecord, 
  EmergencyCase, 
  SchemeEnrollment, 
  CropInsuranceRecord,
  ActivityLog,
  CoordinatorProfile 
} from '../../types';
import { Badge } from '../common/Badge';

interface FarmerProfileViewProps {
  farmer: Farmer;
  coordinator: CoordinatorProfile;
  surveys: MonthlySurvey[];
  healthRecords: CropHealthRecord[];
  emergencies: EmergencyCase[];
  schemes: SchemeEnrollment[];
  insuranceRecords?: CropInsuranceRecord[];
  activities: ActivityLog[];
  onBack: () => void;
  onEdit: (farmer: Farmer) => void;
  onToggleStatus?: (farmer: Farmer) => void;
  onNewSurvey: (farmer: Farmer) => void;
  onNewEmergency: (farmer: Farmer) => void;
  onViewSurvey: (survey: MonthlySurvey) => void;
}

export const FarmerProfileView: React.FC<FarmerProfileViewProps> = ({
  farmer,
  coordinator,
  surveys,
  healthRecords,
  emergencies,
  schemes,
  insuranceRecords = [],
  activities,
  onBack,
  onEdit,
  onToggleStatus,
  onNewSurvey,
  onNewEmergency,
  onViewSurvey
}) => {
  const [activeTab, setActiveTab] = useState<'surveys' | 'health' | 'emergencies' | 'schemes' | 'insurance' | 'activity'>('surveys');

  const isCoordinator = coordinator.role === 'Village Agriculture Coordinator';

  const farmerSurveys = surveys.filter(s => s.farmerId === farmer.id);
  const farmerHealth = healthRecords.filter(h => h.farmerId === farmer.id);
  const farmerEmergencies = emergencies.filter(e => e.farmerId === farmer.id);
  const farmerSchemes = schemes.filter(s => s.farmerId === farmer.id);
  const farmerInsurance = insuranceRecords.filter(i => i.farmerId === farmer.id);
  const farmerActivities = activities.filter(a => a.description.toLowerCase().includes(farmer.fullName.toLowerCase()) || a.description.includes(farmer.id));

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Farmers</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Coordinator Authorized Edit Button */}
          {isCoordinator ? (
            <button
              onClick={() => onEdit(farmer)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
              title="Edit Profile (Village Agriculture Coordinator Only)"
            >
              <Edit3 className="h-3.5 w-3.5 text-blue-700" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <span 
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400"
              title="Edit restricted to authenticated Village Agriculture Coordinator"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Edit Restricted</span>
            </span>
          )}

          {/* Quick Status Toggle Button */}
          {isCoordinator && onToggleStatus && (
            farmer.status === 'Active' ? (
              <button
                onClick={() => onToggleStatus(farmer)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-2xs hover:bg-amber-100 transition-colors"
                title="Mark farmer Inactive (preserves all surveys, health, emergencies, and schemes)"
              >
                <Power className="h-3.5 w-3.5 text-amber-600" />
                <span>Mark Inactive</span>
              </button>
            ) : (
              <button
                onClick={() => onToggleStatus(farmer)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs hover:bg-emerald-100 transition-colors"
                title="Reactivate farmer profile"
              >
                <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                <span>Reactivate Profile</span>
              </button>
            )
          )}

          <button
            onClick={() => onNewSurvey(farmer)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800"
          >
            <ClipboardCheck className="h-3.5 w-3.5" />
            <span>Conduct Survey</span>
          </button>

          <button
            onClick={() => onNewEmergency(farmer)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-800"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Report Emergency</span>
          </button>
        </div>
      </div>

      {/* Preservation & Retention Policy Notice */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900 shadow-2xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-700 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            <strong>Historical Integrity Enforced:</strong> Permanent deletion is disabled. All {farmerSurveys.length} survey records, {farmerHealth.length} crop health observations, {farmerEmergencies.length} emergency incidents, and {farmerSchemes.length} welfare scheme applications remain permanently linked.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-1 font-semibold text-[10px] text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200 shrink-0">
          <UserCheck className="h-3 w-3" />
          <span>VAC Authorized</span>
        </div>
      </div>

      {/* Main Farmer Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-xl font-bold text-white shadow-xs">
              {farmer.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-900">{farmer.fullName}</h2>
                <Badge variant={farmer.status === 'Active' ? 'success' : 'neutral'}>
                  {farmer.status}
                </Badge>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-600">
                  {farmer.id}
                </span>
                {farmer.status === 'Inactive' && (
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 uppercase">
                    Suspended from Active Use
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-slate-500">
                S/o or W/o <strong className="text-slate-700">{farmer.fatherSpouseName}</strong> • {farmer.age} yrs • {farmer.gender}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1 text-slate-700">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  {farmer.village}, {farmer.mandal}, {farmer.district}
                </span>
                <span className="flex items-center gap-1 text-slate-700">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  {farmer.phone}
                </span>
                <span className="flex items-center gap-1 font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-700" />
                  Aadhaar: {farmer.aadhaarMasked}
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  Registered: {farmer.registrationDate}
                </span>
                {farmer.updatedAt && (
                  <span className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    Last Updated: {new Date(farmer.updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Agricultural Parameters Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-100 pt-5">
          <div className="rounded-lg bg-slate-50 p-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Primary Crop & Variety</span>
            <div className="mt-1 text-sm font-bold text-slate-900 flex items-center gap-1">
              <Sprout className="h-4 w-4 text-emerald-600" />
              {farmer.primaryCrop}
            </div>
            <div className="text-xs text-slate-500 truncate">{farmer.cropVariety}</div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Land Holding</span>
            <div className="mt-1 text-sm font-bold text-slate-900">{farmer.landAreaAcres} Acres</div>
            <div className="text-xs text-slate-500">Verified Field Size</div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Soil Characteristic</span>
            <div className="mt-1 text-sm font-bold text-slate-900">{farmer.soilType}</div>
            <div className="text-xs text-slate-500">Regional Soil Registry</div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Irrigation Source</span>
            <div className="mt-1 text-sm font-bold text-slate-900">{farmer.waterSource}</div>
            <div className="text-xs text-slate-500">Water Infrastructure</div>
          </div>
        </div>

        {farmer.notes && (
          <div className="mt-4 rounded-lg bg-blue-50/50 border border-blue-100 p-3 text-xs text-blue-900">
            <strong>Coordinator Notes:</strong> {farmer.notes}
          </div>
        )}
      </div>

      {/* Tabs for Interconnected Modules */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('surveys')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'surveys'
                ? 'border-blue-700 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardCheck className="h-4 w-4" />
            <span>Monthly Surveys ({farmerSurveys.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'health'
                ? 'border-blue-700 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="h-4 w-4" />
            <span>Crop Health & Diagnoses ({farmerHealth.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('emergencies')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'emergencies'
                ? 'border-blue-700 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Emergency Cases ({farmerEmergencies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('schemes')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'schemes'
                ? 'border-blue-700 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Landmark className="h-4 w-4" />
            <span>Welfare Schemes ({farmerSchemes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('insurance')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'insurance'
                ? 'border-blue-700 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Crop Insurance ({farmerInsurance.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-blue-700 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Activities ({farmerActivities.length})</span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Surveys Content */}
      {activeTab === 'surveys' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Survey History for {farmer.fullName}</h3>
            <button
              onClick={() => onNewSurvey(farmer)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-800"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Log New Survey</span>
            </button>
          </div>

          {farmerSurveys.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No monthly surveys recorded yet for this farmer.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {farmerSurveys.map(s => (
                <div key={s.id} className="py-4 hover:bg-slate-50/60 p-2 rounded-lg transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">Survey Date: {s.surveyDate}</span>
                        <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-800">
                          {s.month}
                        </span>
                        <Badge variant={
                          s.cropCondition === 'Excellent' || s.cropCondition === 'Good' ? 'success' :
                          s.cropCondition === 'Fair' ? 'warning' : 'danger'
                        }>
                          Condition: {s.cropCondition}
                        </Badge>
                        {s.hasDiseaseAlert && (
                          <Badge variant="danger">Disease Alert</Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        Crop: <strong>{s.crop} ({s.cropVariety})</strong> • Growth Stage: <strong>{s.growthStage}</strong> • Water: <strong>{s.waterAvailability}</strong>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Fertilizer: {s.fertilizerUsed || 'None reported'}
                      </p>
                      {s.diseaseSymptoms && (
                        <p className="mt-1 text-xs text-rose-700 bg-rose-50 p-2 rounded border border-rose-100">
                          <strong>Symptoms:</strong> {s.diseaseSymptoms}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onViewSurvey(s)}
                      className="self-start sm:self-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                    >
                      View Full Survey
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Health & Diagnoses */}
      {activeTab === 'health' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Crop Health & Disease Observations</h3>
          {farmerHealth.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No disease alerts or health observations recorded.
            </div>
          ) : (
            <div className="space-y-4">
              {farmerHealth.map(h => (
                <div key={h.id} className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{h.detectedCondition}</span>
                      <Badge variant={h.severity === 'Severe' || h.severity === 'High' ? 'danger' : 'warning'}>
                        Severity: {h.severity}
                      </Badge>
                      <Badge variant="info">{h.status}</Badge>
                    </div>
                    <span className="text-xs text-slate-500">{h.observationDate}</span>
                  </div>

                  <div className="mt-2 text-xs text-slate-600">
                    <strong>Symptoms:</strong> {h.symptoms}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    <strong>Coordinator Observation:</strong> {h.coordinatorObservation}
                  </div>
                  <div className="mt-1 text-xs text-emerald-800 bg-emerald-50/70 p-2 rounded border border-emerald-100">
                    <strong>Prescribed Treatment:</strong> {h.treatmentPrescribed}
                  </div>

                  {h.aiRecommendation && (
                    <div className="mt-3 rounded border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-900">
                      <div className="font-bold flex items-center gap-1.5 text-blue-800">
                        <Stethoscope className="h-4 w-4" />
                        AI-Assisted Diagnostic Reference
                      </div>
                      <p className="mt-1"><strong>Recommendation:</strong> {h.aiRecommendation.pesticideRecommendation}</p>
                      <p className="mt-0.5 text-[10px] text-blue-700 italic">
                        {h.aiRecommendation.disclaimer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Emergency Cases */}
      {activeTab === 'emergencies' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Crop Emergencies for {farmer.fullName}</h3>
            <button
              onClick={() => onNewEmergency(farmer)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-rose-800"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Report Emergency</span>
            </button>
          </div>

          {farmerEmergencies.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No emergency cases registered for this farmer.
            </div>
          ) : (
            <div className="space-y-3">
              {farmerEmergencies.map(e => (
                <div key={e.id} className="rounded-lg border border-slate-200 p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{e.id} - {e.problemType}</span>
                      <Badge variant={e.priority === 'Critical' ? 'danger' : e.priority === 'High' ? 'warning' : 'info'}>
                        {e.priority} Priority
                      </Badge>
                      <Badge variant={e.status === 'Resolved' ? 'success' : e.status === 'In Progress' ? 'warning' : 'danger'}>
                        {e.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400">Logged: {new Date(e.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p className="mt-2 text-xs text-slate-700">{e.problemDescription}</p>

                  {e.solution && (
                    <div className="mt-2 text-xs bg-slate-50 p-2 rounded border border-slate-200">
                      <strong>Prescribed Solution:</strong> {e.solution}
                      {e.medicinePrescribed && <div><strong>Medicine:</strong> {e.medicinePrescribed}</div>}
                    </div>
                  )}

                  {e.followUpDate && (
                    <div className="mt-2 text-xs text-amber-800 font-medium">
                      Follow-up Scheduled: {e.followUpDate}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Government Schemes */}
      {activeTab === 'schemes' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Government Scheme Enrollments</h3>
          {farmerSchemes.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No government scheme applications tracked yet for this farmer.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {farmerSchemes.map(sch => (
                <div key={sch.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{sch.schemeName}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {sch.schemeCode}
                      </span>
                      <Badge variant={sch.applicationStatus === 'Approved' ? 'success' : sch.applicationStatus === 'Pending' ? 'warning' : 'primary'}>
                        {sch.applicationStatus}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Verification: <strong>{sch.verificationStatus}</strong> • Benefit: <strong className="text-emerald-700">{sch.benefitReceived || 'Pending'}</strong>
                    </p>
                    {sch.notes && <p className="mt-0.5 text-xs text-slate-400">Notes: {sch.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Crop Insurance History */}
      {activeTab === 'insurance' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Crop Insurance & Damage Claim History</h3>
          {farmerInsurance.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No crop insurance policies registered for this farmer yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {farmerInsurance.map(ins => (
                <div key={ins.id} className="py-3.5 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{ins.id} - {ins.insuranceScheme}</span>
                      <Badge variant={ins.claimStatus === 'Approved' || ins.claimStatus === 'Paid' ? 'success' : ins.claimStatus === 'Rejected' ? 'danger' : 'warning'}>
                        Claim: {ins.claimStatus}
                      </Badge>
                      <Badge variant={ins.paymentStatus === 'Disbursed / Paid' ? 'success' : 'neutral'}>
                        Payment: {ins.paymentStatus}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-slate-400">Registered: {ins.createdAt.slice(0, 10)}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Insured Crop & Season</span>
                      <strong className="text-slate-800">{ins.crop} ({ins.season})</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Insured Area</span>
                      <strong className="text-slate-800">{ins.insuredLandAreaAcres} Acres</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Premium Status</span>
                      <strong className="text-slate-800">{ins.premiumStatus}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Approved Compensation</span>
                      <strong className="text-emerald-700">
                        {ins.approvedClaimAmount !== undefined ? `₹${ins.approvedClaimAmount.toLocaleString('en-IN')}` : 'Pending Assessment'}
                      </strong>
                    </div>
                  </div>

                  {ins.damageType && (
                    <div className="text-xs text-slate-600 bg-amber-50/60 p-2 rounded border border-amber-100">
                      <strong>Reported Damage:</strong> {ins.damageType} on {ins.damageDate}
                      {ins.damageDescription && <p className="mt-0.5 text-slate-500">{ins.damageDescription}</p>}
                    </div>
                  )}

                  {ins.coordinatorRemarks && (
                    <div className="text-xs text-slate-500">
                      <strong>Remarks:</strong> {ins.coordinatorRemarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Recent Activities */}
      {activeTab === 'activity' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Field Activity Audit Log</h3>
          {farmerActivities.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No recent field activity entries for this farmer.
            </div>
          ) : (
            <div className="space-y-3">
              {farmerActivities.map(act => (
                <div key={act.id} className="flex items-start gap-3 text-xs border-b border-slate-100 pb-2.5">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-600"></div>
                  <div>
                    <div className="font-bold text-slate-800">{act.action}</div>
                    <p className="text-slate-600">{act.description}</p>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(act.timestamp).toLocaleString()} • {act.actor}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
