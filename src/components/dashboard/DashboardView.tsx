import React, { useMemo } from 'react';
import { 
  Users, 
  ClipboardCheck, 
  AlertTriangle, 
  Landmark, 
  PlusCircle, 
  ChevronRight,
  Phone,
  ArrowRight,
  Clock,
  Stethoscope,
  ShieldAlert,
  CalendarClock,
  ShieldCheck
} from 'lucide-react';
import { 
  Farmer, 
  MonthlySurvey, 
  CropHealthRecord, 
  EmergencyCase, 
  SchemeEnrollment, 
  CropInsuranceRecord,
  SystemNotification, 
  ActivityLog, 
  CoordinatorProfile 
} from '../../types';
import { StatCard } from '../common/StatCard';
import { DashboardCharts } from './DashboardCharts';
import { Badge } from '../common/Badge';

interface DashboardViewProps {
  coordinator: CoordinatorProfile;
  farmers: Farmer[];
  surveys: MonthlySurvey[];
  healthRecords: CropHealthRecord[];
  emergencies: EmergencyCase[];
  schemes: SchemeEnrollment[];
  insuranceRecords: CropInsuranceRecord[];
  notifications: SystemNotification[];
  activities: ActivityLog[];
  onNavigate: (module: any, param?: any) => void;
  onOpenNewSurvey: () => void;
  onOpenNewFarmer: () => void;
  onOpenNewEmergency: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  coordinator,
  farmers,
  surveys,
  healthRecords,
  emergencies,
  schemes,
  insuranceRecords,
  notifications,
  activities,
  onNavigate,
  onOpenNewSurvey,
  onOpenNewFarmer,
  onOpenNewEmergency
}) => {
  // Current month string YYYY-MM
  const currentMonthStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, []);

  // 1. Dynamic aggregations directly derived from database records
  const totalFarmers = farmers.length;
  const activeVillagesCount = useMemo(() => new Set(farmers.map(f => f.village)).size, [farmers]);

  const currentMonthSurveys = useMemo(() => {
    return surveys.filter(s => s.month === currentMonthStr || s.surveyDate.startsWith(currentMonthStr));
  }, [surveys, currentMonthStr]);

  const surveyedFarmerIdsThisMonth = useMemo(() => {
    return new Set(currentMonthSurveys.map(s => s.farmerId));
  }, [currentMonthSurveys]);

  // Farmers who have not had a survey recorded for this month
  const pendingSurveysCount = useMemo(() => {
    return farmers.filter(f => f.status === 'Active' && !surveyedFarmerIdsThisMonth.has(f.id)).length;
  }, [farmers, surveyedFarmerIdsThisMonth]);

  const openEmergencyCases = useMemo(() => {
    return emergencies.filter(e => e.status === 'Open' || e.status === 'In Progress');
  }, [emergencies]);

  // Breakdown for pending applications: Schemes vs Insurance
  const pendingSchemesCount = useMemo(() => {
    return schemes.filter(s => s.applicationStatus === 'Applied' || s.applicationStatus === 'Pending').length;
  }, [schemes]);

  const pendingInsuranceCount = useMemo(() => {
    return insuranceRecords.filter(i => 
      i.claimStatus === 'Reported' || 
      i.claimStatus === 'Under Assessment' || 
      i.claimStatus === 'Payment Pending'
    ).length;
  }, [insuranceRecords]);

  const pendingApplicationsTotal = pendingSchemesCount + pendingInsuranceCount;

  // "Needs Attention" queue - Max 5 preview records
  const attentionItems = useMemo(() => {
    const list: Array<{
      farmer: Farmer;
      reason: string;
      urgency: 'critical' | 'warning' | 'info';
      actionLabel: string;
      targetModule: string;
      targetId?: string;
    }> = [];

    // 1. Critical emergencies first
    openEmergencyCases.forEach(emg => {
      const f = farmers.find(farm => farm.id === emg.farmerId);
      if (f) {
        list.push({
          farmer: f,
          reason: `Emergency: ${emg.problemType} on ${emg.crop}`,
          urgency: emg.priority === 'Critical' ? 'critical' : 'warning',
          actionLabel: 'Review',
          targetModule: 'emergencies',
          targetId: emg.id
        });
      }
    });

    // 2. Reported insurance damage claims requiring assessment
    insuranceRecords
      .filter(i => i.claimStatus === 'Reported' || i.claimStatus === 'Under Assessment')
      .forEach(ins => {
        const f = farmers.find(farm => farm.id === ins.farmerId);
        if (f && !list.some(item => item.farmer.id === f.id)) {
          list.push({
            farmer: f,
            reason: `Crop Insurance Claim: ${ins.crop} (${ins.damageType || 'Assessment Due'})`,
            urgency: 'warning',
            actionLabel: 'Assess Claim',
            targetModule: 'schemes',
            targetId: 'insurance'
          });
        }
      });

    // 3. High-severity crop health issues
    healthRecords
      .filter(h => h.severity === 'High' && h.status === 'Treatment Prescribed')
      .forEach(h => {
        const f = farmers.find(farm => farm.id === h.farmerId);
        if (f && !list.some(item => item.farmer.id === f.id)) {
          list.push({
            farmer: f,
            reason: `Crop Health: ${h.detectedCondition} follow-up scheduled`,
            urgency: 'warning',
            actionLabel: 'View Health',
            targetModule: 'cropHealth',
            targetId: h.id
          });
        }
      });

    // 4. Pending surveys for this month
    farmers
      .filter(f => f.status === 'Active' && !surveyedFarmerIdsThisMonth.has(f.id))
      .slice(0, 3)
      .forEach(f => {
        if (!list.some(item => item.farmer.id === f.id)) {
          list.push({
            farmer: f,
            reason: `Field survey pending for current month`,
            urgency: 'info',
            actionLabel: 'Record Survey',
            targetModule: 'surveys'
          });
        }
      });

    return list.slice(0, 5);
  }, [farmers, openEmergencyCases, insuranceRecords, healthRecords, surveyedFarmerIdsThisMonth]);

  // Recent activities - Max 5 preview records
  const recentActivitiesPreview = useMemo(() => {
    return activities.slice(0, 5);
  }, [activities]);

  return (
    <div className="space-y-6">
      {/* Title & Quick Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Dashboard</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Overview of farmers, field surveys, emergency cases, and scheme applications.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="dash-quick-survey-btn"
            onClick={onOpenNewSurvey}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
          >
            <ClipboardCheck className="h-4 w-4" />
            <span>Conduct Survey</span>
          </button>

          <button
            id="dash-quick-emergency-btn"
            onClick={onOpenNewEmergency}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-800 transition-colors"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Report Emergency</span>
          </button>

          <button
            id="dash-quick-farmer-btn"
            onClick={onOpenNewFarmer}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Register Farmer</span>
          </button>
        </div>
      </div>

      {/* 1. Four Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Farmers */}
        <StatCard
          id="stat-total-farmers"
          title="Total Farmers"
          value={totalFarmers}
          subtitle={`${activeVillagesCount} villages registered`}
          icon={Users}
          iconColor="text-blue-700"
          iconBg="bg-blue-50"
          onClick={() => onNavigate('farmers')}
        />

        {/* Card 2: Pending Surveys */}
        <StatCard
          id="stat-pending-surveys"
          title="Pending Surveys"
          value={pendingSurveysCount}
          subtitle={`${currentMonthSurveys.length} surveys completed this month`}
          icon={ClipboardCheck}
          iconColor="text-amber-700"
          iconBg="bg-amber-50"
          badge={{
            text: pendingSurveysCount > 0 ? `${pendingSurveysCount} Pending` : 'All Completed',
            variant: pendingSurveysCount > 0 ? 'negative' : 'positive'
          }}
          onClick={() => onNavigate('surveys')}
        />

        {/* Card 3: Open Emergencies */}
        <StatCard
          id="stat-open-emergencies"
          title="Open Emergencies"
          value={openEmergencyCases.length}
          subtitle={openEmergencyCases.length === 1 ? '1 case needs field visit' : `${openEmergencyCases.length} cases need field visit`}
          icon={AlertTriangle}
          iconColor="text-rose-700"
          iconBg="bg-rose-50"
          badge={{
            text: openEmergencyCases.length > 0 ? 'Action Required' : 'All Clear',
            variant: openEmergencyCases.length > 0 ? 'urgent' : 'positive'
          }}
          onClick={() => onNavigate('emergencies')}
        />

        {/* Card 4: Pending Applications with simple breakdown */}
        <StatCard
          id="stat-pending-applications"
          title="Pending Applications"
          value={pendingApplicationsTotal}
          breakdown={[
            { label: 'Scheme Applications', count: pendingSchemesCount },
            { label: 'Insurance Claims', count: pendingInsuranceCount }
          ]}
          subtitle={`${schemes.length} total schemes • ${insuranceRecords.length} insurance policies`}
          icon={Landmark}
          iconColor="text-indigo-700"
          iconBg="bg-indigo-50"
          badge={{
            text: pendingApplicationsTotal > 0 ? `${pendingApplicationsTotal} Pending` : 'Up to Date',
            variant: pendingApplicationsTotal > 0 ? 'negative' : 'positive'
          }}
          onClick={() => onNavigate('schemes', 'insurance')}
        />
      </div>

      {/* 2. Needs Attention & Recent Activities (Max 5 Preview Records each with View All) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Needs Attention */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Needs Attention</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {attentionItems.length}
                </span>
              </div>
              <button
                onClick={() => onNavigate('emergencies')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {attentionItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No immediate items require attention today.
                </div>
              ) : (
                attentionItems.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2.5 hover:bg-slate-50/60 px-1 rounded-lg transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-bold text-xs ${
                        item.urgency === 'critical' ? 'bg-rose-100 text-rose-700' :
                        item.urgency === 'warning' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.urgency === 'critical' ? <ShieldAlert className="h-3.5 w-3.5" /> :
                         item.urgency === 'warning' ? <Stethoscope className="h-3.5 w-3.5" /> :
                         <CalendarClock className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{item.farmer.fullName}</span>
                          <span className="text-[11px] text-slate-400">({item.farmer.village})</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{item.reason}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate(item.targetModule, item.targetId)}
                      className="self-end sm:self-center inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-blue-700 transition-colors shrink-0"
                    >
                      <span>{item.actionLabel}</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Recent Activities</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {recentActivitiesPreview.length}
                </span>
              </div>
              <button
                onClick={() => onNavigate('settings')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {recentActivitiesPreview.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No recent activities recorded yet.
                </div>
              ) : (
                recentActivitiesPreview.map(act => (
                  <div key={act.id} className="py-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{act.action}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-slate-600 line-clamp-1">{act.description}</p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="rounded bg-slate-100 px-1.5 py-0.2 font-medium text-slate-600">
                        {act.module}
                      </span>
                      <span>By: {act.actor}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Crop Distribution & Survey Status Charts */}
      <DashboardCharts
        farmers={farmers}
        surveys={surveys}
      />
    </div>
  );
};
