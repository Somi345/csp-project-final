import React from 'react';
import { Modal } from '../common/Modal';
import { MonthlySurvey } from '../../types';
import { Badge } from '../common/Badge';
import { 
  Calendar, 
  MapPin, 
  Sprout, 
  Droplet, 
  AlertTriangle, 
  CheckCircle, 
  User 
} from 'lucide-react';

interface SurveyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: MonthlySurvey | null;
}

export const SurveyDetailModal: React.FC<SurveyDetailModalProps> = ({
  isOpen,
  onClose,
  survey
}) => {
  if (!survey) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Monthly Survey Record: ${survey.id}`}
      subtitle={`Conducted on ${survey.surveyDate} by Village Agriculture Coordinator`}
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs text-slate-700">
        {/* Top Info Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-blue-50/70 p-4 border border-blue-100">
          <div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-700" />
              <span className="font-bold text-sm text-slate-900">{survey.farmerName}</span>
              <span className="font-mono text-[11px] text-slate-500">({survey.farmerId})</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-slate-600 text-[11px]">
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              <span>Village: {survey.village}</span>
              <span>•</span>
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              <span>Period: {survey.month}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={
              survey.cropCondition === 'Excellent' || survey.cropCondition === 'Good' ? 'success' :
              survey.cropCondition === 'Fair' ? 'warning' : 'danger'
            }>
              Condition: {survey.cropCondition}
            </Badge>
            {survey.hasDiseaseAlert && (
              <Badge variant="danger">Disease Alert</Badge>
            )}
          </div>
        </div>

        {/* Agronomic Details Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <span className="text-[10px] uppercase font-bold text-slate-400">Crop & Variety</span>
            <div className="mt-1 font-bold text-slate-900">{survey.crop}</div>
            <div className="text-[11px] text-slate-500">{survey.cropVariety}</div>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <span className="text-[10px] uppercase font-bold text-slate-400">Growth Stage</span>
            <div className="mt-1 font-bold text-slate-900">{survey.growthStage}</div>
            <div className="text-[11px] text-slate-500">Field Phenology</div>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <span className="text-[10px] uppercase font-bold text-slate-400">Water Availability</span>
            <div className="mt-1 font-bold text-slate-900 flex items-center gap-1">
              <Droplet className="h-3.5 w-3.5 text-blue-600" />
              {survey.waterAvailability}
            </div>
            <div className="text-[11px] text-slate-500">Hydration Status</div>
          </div>
        </div>

        {/* Fertilizer & Weather */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
            <span className="font-bold text-slate-800">Fertilizer & Nutrition Applied:</span>
            <p className="mt-1 text-slate-600">{survey.fertilizerUsed || 'None logged for this cycle'}</p>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
            <span className="font-bold text-slate-800">Weather & Micro-climate:</span>
            <p className="mt-1 text-slate-600">{survey.weatherCondition || 'Normal regional weather'}</p>
          </div>
        </div>

        {/* Disease / Pest Section */}
        {(survey.diseaseSymptoms || survey.pestDetails) && (
          <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-4">
            <div className="flex items-center gap-1.5 font-bold text-rose-900 mb-2">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <span>Disease & Pest Observations</span>
            </div>
            {survey.diseaseSymptoms && (
              <div className="mb-2">
                <span className="font-semibold text-rose-900">Symptoms:</span>
                <p className="text-rose-800 mt-0.5">{survey.diseaseSymptoms}</p>
              </div>
            )}
            {survey.pestDetails && (
              <div>
                <span className="font-semibold text-rose-900">Pest Infestation:</span>
                <p className="text-rose-800 mt-0.5">{survey.pestDetails}</p>
              </div>
            )}
          </div>
        )}

        {/* Photo if present */}
        {survey.cropImageUrl && (
          <div>
            <span className="font-bold text-slate-800">Field Photograph:</span>
            <div className="mt-1.5 max-h-48 overflow-hidden rounded-lg border border-slate-200">
              <img 
                src={survey.cropImageUrl} 
                alt="Field Survey Observation" 
                className="w-full object-cover max-h-48"
              />
            </div>
          </div>
        )}

        {/* Coordinator Notes */}
        <div className="rounded-lg border border-slate-200 bg-white p-3.5">
          <span className="font-bold text-slate-800">Coordinator Advisory & Field Notes:</span>
          <p className="mt-1 text-slate-600 leading-relaxed">
            {survey.coordinatorNotes || 'No specific chemical recommendations or notes recorded.'}
          </p>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-[11px] text-slate-400">
          <span>Survey Record ID: {survey.id}</span>
          <span>Logged At: {new Date(survey.createdAt).toLocaleString()}</span>
        </div>
      </div>
    </Modal>
  );
};
