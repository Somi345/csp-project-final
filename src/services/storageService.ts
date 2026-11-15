import { 
  Farmer, 
  MonthlySurvey, 
  CropHealthRecord, 
  EmergencyCase, 
  GovernmentScheme, 
  SchemeEnrollment, 
  CropInsuranceRecord,
  SystemNotification, 
  ActivityLog, 
  AppSettings,
  CoordinatorProfile 
} from '../types';
import { 
  INITIAL_FARMERS, 
  INITIAL_SURVEYS, 
  INITIAL_HEALTH_RECORDS, 
  INITIAL_EMERGENCIES, 
  INITIAL_SCHEME_ENROLLMENTS, 
  INITIAL_INSURANCE_RECORDS,
  INITIAL_NOTIFICATIONS, 
  INITIAL_ACTIVITY_LOGS, 
  DEFAULT_COORDINATOR,
  GOVERNMENT_SCHEMES_CATALOG 
} from '../data/seedData';

const KEYS = {
  FARMERS: 'fwms_farmers_v1',
  SURVEYS: 'fwms_surveys_v1',
  HEALTH_RECORDS: 'fwms_health_v1',
  EMERGENCIES: 'fwms_emergencies_v1',
  SCHEME_ENROLLMENTS: 'fwms_scheme_enrollments_v1',
  INSURANCE_RECORDS: 'fwms_insurance_records_v1',
  NOTIFICATIONS: 'fwms_notifications_v1',
  ACTIVITIES: 'fwms_activities_v1',
  SETTINGS: 'fwms_settings_v1'
};

const DEFAULT_SETTINGS: AppSettings = {
  authEnabled: false, // Development Access Mode enabled by default as per requirements
  offlineMode: false,
  aiServiceConfigured: false, // Clean declaration: awaiting live Gemini/vision API key
  maxUploadSizeBytes: 5 * 1024 * 1024, // 5MB safe limit
  selectedVillageFilter: 'All',
  coordinatorProfile: DEFAULT_COORDINATOR
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error('Listener callback error', e);
    }
  });
}

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`Failed reading ${key} from localStorage, using fallback:`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notify();
  } catch (err) {
    console.error(`Failed writing ${key} to localStorage:`, err);
  }
}

// Ensure initial database seeding
export function initDatabase(): void {
  if (!localStorage.getItem(KEYS.FARMERS)) {
    setStored(KEYS.FARMERS, INITIAL_FARMERS);
  }
  if (!localStorage.getItem(KEYS.SURVEYS)) {
    setStored(KEYS.SURVEYS, INITIAL_SURVEYS);
  }
  if (!localStorage.getItem(KEYS.HEALTH_RECORDS)) {
    setStored(KEYS.HEALTH_RECORDS, INITIAL_HEALTH_RECORDS);
  }
  if (!localStorage.getItem(KEYS.EMERGENCIES)) {
    setStored(KEYS.EMERGENCIES, INITIAL_EMERGENCIES);
  }
  if (!localStorage.getItem(KEYS.SCHEME_ENROLLMENTS)) {
    setStored(KEYS.SCHEME_ENROLLMENTS, INITIAL_SCHEME_ENROLLMENTS);
  }
  if (!localStorage.getItem(KEYS.INSURANCE_RECORDS)) {
    setStored(KEYS.INSURANCE_RECORDS, INITIAL_INSURANCE_RECORDS);
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    setStored(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
  if (!localStorage.getItem(KEYS.ACTIVITIES)) {
    setStored(KEYS.ACTIVITIES, INITIAL_ACTIVITY_LOGS);
  }
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    setStored(KEYS.SETTINGS, DEFAULT_SETTINGS);
  }
}

export const StorageService = {
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  // ---------------- FARMERS ----------------
  getFarmers(): Farmer[] {
    return getStored<Farmer[]>(KEYS.FARMERS, INITIAL_FARMERS);
  },

  getFarmerById(id: string): Farmer | undefined {
    return this.getFarmers().find(f => f.id === id);
  },

  saveFarmer(farmer: Farmer): Farmer {
    const list = this.getFarmers();
    const idx = list.findIndex(f => f.id === farmer.id);
    const nowIso = new Date().toISOString();
    let updated: Farmer[];
    let farmerWithTimestamp: Farmer;

    if (idx >= 0) {
      farmerWithTimestamp = {
        ...farmer,
        updatedAt: nowIso
      };
      updated = [...list];
      updated[idx] = farmerWithTimestamp;
      this.logActivity('Farmer Updated', `Profile updated for ${farmer.fullName} (${farmer.village}) [Status: ${farmer.status}]`, 'Farmers');
    } else {
      farmerWithTimestamp = {
        ...farmer,
        registrationDate: farmer.registrationDate || nowIso.slice(0, 10),
        updatedAt: nowIso
      };
      updated = [farmerWithTimestamp, ...list];
      this.logActivity('Farmer Registered', `New farmer registered: ${farmer.fullName} (${farmer.village})`, 'Farmers');
    }
    setStored(KEYS.FARMERS, updated);

    // Asynchronous background synchronization to backend
    const currentCoordinator = this.getCoordinatorProfile();
    this.syncFarmerToBackend(farmerWithTimestamp, idx >= 0, currentCoordinator).catch(err => {
      console.warn('Backend sync note:', err.message);
    });

    return farmerWithTimestamp;
  },

  async syncFarmerToBackend(farmer: Farmer, isUpdate: boolean, coordinator: CoordinatorProfile): Promise<Farmer> {
    const endpoint = isUpdate ? `/api/farmers/${farmer.id}` : '/api/farmers';
    const method = isUpdate ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': coordinator.role,
          'x-coordinator-badge': coordinator.badgeId,
          'Authorization': `Bearer ${coordinator.badgeId}`
        },
        body: JSON.stringify(farmer)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errorData.error || `Backend operation failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      return data.farmer || farmer;
    } catch (err: any) {
      console.error('Backend farmer sync error:', err.message);
      throw err;
    }
  },

  async saveFarmerViaBackend(farmer: Farmer, coordinator: CoordinatorProfile): Promise<Farmer> {
    const isUpdate = this.getFarmers().some(f => f.id === farmer.id);
    const resFarmer = await this.syncFarmerToBackend(farmer, isUpdate, coordinator);

    // Save verified response in persistent state
    const list = this.getFarmers();
    const idx = list.findIndex(f => f.id === resFarmer.id);
    let updated: Farmer[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = resFarmer;
      this.logActivity('Farmer Updated via Backend', `Coordinator ${coordinator.name} updated ${resFarmer.fullName}`, 'Farmers');
    } else {
      updated = [resFarmer, ...list];
      this.logActivity('Farmer Registered via Backend', `Coordinator ${coordinator.name} registered ${resFarmer.fullName}`, 'Farmers');
    }
    setStored(KEYS.FARMERS, updated);
    return resFarmer;
  },

  async updateFarmerStatusViaBackend(id: string, newStatus: 'Active' | 'Inactive', coordinator: CoordinatorProfile): Promise<Farmer> {
    try {
      const res = await fetch(`/api/farmers/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': coordinator.role,
          'x-coordinator-badge': coordinator.badgeId,
          'Authorization': `Bearer ${coordinator.badgeId}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errJson.error || `Failed to update status on backend.`);
      }

      const data = await res.json();
      const updatedFarmer: Farmer = data.farmer;

      // Update local storage while strictly preserving all related history
      const list = this.getFarmers();
      const idx = list.findIndex(f => f.id === id);
      if (idx >= 0) {
        const updatedList = [...list];
        updatedList[idx] = updatedFarmer;
        setStored(KEYS.FARMERS, updatedList);
      }

      this.logActivity(
        'Farmer Status Updated',
        `Farmer ${updatedFarmer.fullName} (${id}) status changed to "${newStatus}". All historical surveys, emergencies, and welfare records preserved.`,
        'Farmers'
      );

      return updatedFarmer;
    } catch (err: any) {
      // Local fallback with preserved history if network is isolated
      const list = this.getFarmers();
      const idx = list.findIndex(f => f.id === id);
      if (idx >= 0) {
        const updatedFarmer: Farmer = {
          ...list[idx],
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
        const updatedList = [...list];
        updatedList[idx] = updatedFarmer;
        setStored(KEYS.FARMERS, updatedList);
        this.logActivity(
          'Farmer Status Updated (Offline)',
          `Farmer ${updatedFarmer.fullName} (${id}) status changed to "${newStatus}". All history preserved.`,
          'Farmers'
        );
        return updatedFarmer;
      }
      throw err;
    }
  },

  // Permanent deletion is strictly prohibited
  deleteFarmer(id: string): boolean {
    console.error(`Attempt to delete farmer ${id} blocked. Permanent deletion is strictly prohibited to preserve historical survey, crop-health, emergency, and welfare records.`);
    throw new Error('Permanent deletion of farmer records is prohibited. Update farmer status to "Inactive" instead to preserve history.');
  },

  // ---------------- SURVEYS ----------------
  getSurveys(): MonthlySurvey[] {
    return getStored<MonthlySurvey[]>(KEYS.SURVEYS, INITIAL_SURVEYS);
  },

  getSurveysByFarmer(farmerId: string): MonthlySurvey[] {
    return this.getSurveys().filter(s => s.farmerId === farmerId);
  },

  checkSurveyExists(farmerId: string, month: string): boolean {
    return this.getSurveys().some(s => s.farmerId === farmerId && s.month === month);
  },

  saveSurvey(survey: MonthlySurvey): void {
    const list = this.getSurveys();
    const idx = list.findIndex(s => s.id === survey.id);
    let updated: MonthlySurvey[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = survey;
      this.logActivity('Survey Updated', `Updated survey ${survey.id} for ${survey.farmerName}`, 'Monthly Survey');
    } else {
      updated = [survey, ...list];
      this.logActivity('Survey Completed', `Recorded ${survey.month} survey for ${survey.farmerName} (${survey.crop})`, 'Monthly Survey');
      
      // If disease alert detected, log notification
      if (survey.hasDiseaseAlert) {
        this.addNotification({
          id: `NOTIF-${Date.now()}`,
          type: 'warning',
          title: `Crop Condition Alert: ${survey.crop}`,
          message: `${survey.farmerName} in ${survey.village}: ${survey.diseaseSymptoms || 'Adverse symptoms reported'}`,
          timestamp: new Date().toISOString(),
          isRead: false,
          targetTab: 'surveys',
          targetModule: 'surveys',
          targetId: survey.id
        });
      }
    }
    setStored(KEYS.SURVEYS, updated);
  },

  // ---------------- CROP HEALTH ----------------
  getHealthRecords(): CropHealthRecord[] {
    return getStored<CropHealthRecord[]>(KEYS.HEALTH_RECORDS, INITIAL_HEALTH_RECORDS);
  },

  getCropHealthRecords(): CropHealthRecord[] {
    return this.getHealthRecords();
  },

  getHealthRecordsByFarmer(farmerId: string): CropHealthRecord[] {
    return this.getHealthRecords().filter(h => h.farmerId === farmerId);
  },

  saveHealthRecord(record: CropHealthRecord): void {
    const list = this.getHealthRecords();
    const idx = list.findIndex(h => h.id === record.id);
    let updated: CropHealthRecord[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = record;
      this.logActivity('Health Observation Updated', `Updated record for ${record.farmerName} (${record.detectedCondition})`, 'Crop Health');
    } else {
      updated = [record, ...list];
      this.logActivity('Disease Diagnosed', `Recorded diagnosis of ${record.detectedCondition} for ${record.farmerName}`, 'Crop Health');
    }
    setStored(KEYS.HEALTH_RECORDS, updated);
  },

  saveCropHealthRecord(record: CropHealthRecord): void {
    this.saveHealthRecord(record);
  },

  // ---------------- EMERGENCIES ----------------
  getEmergencies(): EmergencyCase[] {
    return getStored<EmergencyCase[]>(KEYS.EMERGENCIES, INITIAL_EMERGENCIES);
  },

  getEmergencyById(id: string): EmergencyCase | undefined {
    return this.getEmergencies().find(e => e.id === id);
  },

  getEmergenciesByFarmer(farmerId: string): EmergencyCase[] {
    return this.getEmergencies().filter(e => e.farmerId === farmerId);
  },

  saveEmergency(emergency: EmergencyCase): void {
    const list = this.getEmergencies();
    const idx = list.findIndex(e => e.id === emergency.id);
    let updated: EmergencyCase[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = { ...emergency, updatedAt: new Date().toISOString() };
      this.logActivity('Emergency Case Updated', `Updated status to "${emergency.status}" for case ${emergency.id} (${emergency.farmerName})`, 'Emergencies');
    } else {
      updated = [emergency, ...list];
      this.logActivity('Emergency Case Created', `Logged emergency ${emergency.id} [${emergency.priority}] for ${emergency.farmerName}`, 'Emergencies');

      // Create notification
      this.addNotification({
        id: `NOTIF-${Date.now()}`,
        type: emergency.priority === 'Critical' ? 'emergency' : 'warning',
        title: `Emergency Case Logged: ${emergency.problemType}`,
        message: `${emergency.farmerName} (${emergency.village}) reported urgent issue with ${emergency.crop}. Priority: ${emergency.priority}.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        targetTab: 'emergencies',
        targetModule: 'emergencies',
        targetId: emergency.id
      });
    }
    setStored(KEYS.EMERGENCIES, updated);
  },

  // ---------------- GOVERNMENT SCHEMES ----------------
  getSchemeCatalog(): GovernmentScheme[] {
    return GOVERNMENT_SCHEMES_CATALOG;
  },

  getAvailableSchemes(): GovernmentScheme[] {
    return this.getSchemeCatalog();
  },

  getSchemeEnrollments(): SchemeEnrollment[] {
    return getStored<SchemeEnrollment[]>(KEYS.SCHEME_ENROLLMENTS, INITIAL_SCHEME_ENROLLMENTS);
  },

  getSchemeEnrollmentsByFarmer(farmerId: string): SchemeEnrollment[] {
    return this.getSchemeEnrollments().filter(s => s.farmerId === farmerId);
  },

  saveSchemeEnrollment(enrollment: SchemeEnrollment): void {
    const list = this.getSchemeEnrollments();
    const idx = list.findIndex(s => s.id === enrollment.id);
    let updated: SchemeEnrollment[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = { ...enrollment, updatedAt: new Date().toISOString() };
      this.logActivity('Scheme Status Updated', `Updated ${enrollment.schemeCode} for ${enrollment.farmerName} to ${enrollment.applicationStatus}`, 'Government Schemes');
    } else {
      updated = [enrollment, ...list];
      this.logActivity('Scheme Application Logged', `Enrolled ${enrollment.farmerName} in ${enrollment.schemeCode}`, 'Government Schemes');
    }
    setStored(KEYS.SCHEME_ENROLLMENTS, updated);
  },

  // ---------------- CROP INSURANCE TRACKING ----------------
  getInsuranceRecords(): CropInsuranceRecord[] {
    return getStored<CropInsuranceRecord[]>(KEYS.INSURANCE_RECORDS, INITIAL_INSURANCE_RECORDS);
  },

  getInsuranceRecordsByFarmer(farmerId: string): CropInsuranceRecord[] {
    return this.getInsuranceRecords().filter(r => r.farmerId === farmerId);
  },

  getInsuranceRecordById(id: string): CropInsuranceRecord | undefined {
    return this.getInsuranceRecords().find(r => r.id === id);
  },

  saveInsuranceRecord(record: CropInsuranceRecord): void {
    const list = this.getInsuranceRecords();
    const idx = list.findIndex(r => r.id === record.id);
    let updated: CropInsuranceRecord[];
    const nowIso = new Date().toISOString();

    if (idx >= 0) {
      const prev = list[idx];
      updated = [...list];
      updated[idx] = { ...record, updatedAt: nowIso };
      this.logActivity(
        'Insurance Claim Updated',
        `Insurance case ${record.id} (${record.farmerName} - ${record.crop}) claim status: "${record.claimStatus}"`,
        'Crop Insurance'
      );

      // Trigger notification if claim status changed
      if (prev.claimStatus !== record.claimStatus) {
        this.addNotification({
          id: `NOTIF-INS-${Date.now()}`,
          type: record.claimStatus === 'Approved' ? 'success' : record.claimStatus === 'Rejected' ? 'warning' : 'info',
          title: `Crop Insurance Claim: ${record.claimStatus}`,
          message: `${record.farmerName} (${record.village}) claim for ${record.crop} is now "${record.claimStatus}". Approved compensation: ${record.approvedClaimAmount ? '₹' + record.approvedClaimAmount.toLocaleString('en-IN') : 'Under assessment'}.`,
          timestamp: nowIso,
          isRead: false,
          targetTab: 'schemes',
          targetModule: 'schemes',
          targetId: record.id
        });
      }
    } else {
      updated = [{ ...record, createdAt: record.createdAt || nowIso, updatedAt: nowIso }, ...list];
      this.logActivity(
        'Insurance Record Created',
        `Registered crop insurance for ${record.farmerName} (${record.crop} - ${record.season})`,
        'Crop Insurance'
      );
    }
    setStored(KEYS.INSURANCE_RECORDS, updated);

    // Sync to backend DB
    try {
      const isUpdate = idx >= 0;
      const coord = this.getCoordinatorProfile();
      const endpoint = isUpdate ? `/api/insurance/${record.id}` : '/api/insurance';
      const method = isUpdate ? 'PUT' : 'POST';
      fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': coord.role,
          'x-coordinator-badge': coord.badgeId,
          'Authorization': `Bearer ${coord.badgeId}`
        },
        body: JSON.stringify(record)
      }).catch(err => {
        console.warn('Backend insurance sync notice:', err.message);
      });
    } catch (e) {
      // Non-blocking
    }
  },

  // ---------------- NOTIFICATIONS ----------------
  getNotifications(): SystemNotification[] {
    return getStored<SystemNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  addNotification(notif: SystemNotification): void {
    const list = this.getNotifications();
    setStored(KEYS.NOTIFICATIONS, [notif, ...list]);
  },

  markNotificationAsRead(id: string): void {
    const list = this.getNotifications();
    const updated = list.map(n => n.id === id ? { ...n, isRead: true } : n);
    setStored(KEYS.NOTIFICATIONS, updated);
  },

  markAllNotificationsAsRead(): void {
    const list = this.getNotifications();
    const updated = list.map(n => ({ ...n, isRead: true }));
    setStored(KEYS.NOTIFICATIONS, updated);
  },

  // ---------------- ACTIVITY LOGS ----------------
  getActivities(): ActivityLog[] {
    return getStored<ActivityLog[]>(KEYS.ACTIVITIES, INITIAL_ACTIVITY_LOGS);
  },

  getActivityLogs(): ActivityLog[] {
    return this.getActivities();
  },

  logActivity(action: string, description: string, module: string): void {
    const settings = this.getSettings();
    const actor = `${settings.coordinatorProfile.name} (VAC)`;
    const newLog: ActivityLog = {
      id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      description,
      timestamp: new Date().toISOString(),
      module,
      actor
    };
    const list = this.getActivities();
    setStored(KEYS.ACTIVITIES, [newLog, ...list.slice(0, 49)]); // keep recent 50
  },

  // ---------------- SETTINGS, PROFILE & RESET ----------------
  getSettings(): AppSettings {
    return getStored<AppSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  getCoordinatorProfile(): CoordinatorProfile {
    return this.getSettings().coordinatorProfile || DEFAULT_COORDINATOR;
  },

  saveCoordinatorProfile(profile: CoordinatorProfile): void {
    const current = this.getSettings();
    this.saveSettings({ ...current, coordinatorProfile: profile });
    this.logActivity('Profile Updated', `Updated coordinator profile for ${profile.name}`, 'Settings');
  },

  saveSettings(settings: AppSettings): void {
    setStored(KEYS.SETTINGS, settings);
  },

  exportFullBackupJson(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      farmers: this.getFarmers(),
      surveys: this.getSurveys(),
      healthRecords: this.getHealthRecords(),
      emergencies: this.getEmergencies(),
      schemeEnrollments: this.getSchemeEnrollments(),
      insuranceRecords: this.getInsuranceRecords(),
      notifications: this.getNotifications(),
      activities: this.getActivities(),
      settings: this.getSettings()
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.farmers)) {
        return false;
      }
      if (Array.isArray(data.farmers)) setStored(KEYS.FARMERS, data.farmers);
      if (Array.isArray(data.surveys)) setStored(KEYS.SURVEYS, data.surveys);
      if (Array.isArray(data.healthRecords)) setStored(KEYS.HEALTH_RECORDS, data.healthRecords);
      if (Array.isArray(data.emergencies)) setStored(KEYS.EMERGENCIES, data.emergencies);
      if (Array.isArray(data.schemeEnrollments)) setStored(KEYS.SCHEME_ENROLLMENTS, data.schemeEnrollments);
      if (Array.isArray(data.insuranceRecords)) setStored(KEYS.INSURANCE_RECORDS, data.insuranceRecords);
      if (Array.isArray(data.notifications)) setStored(KEYS.NOTIFICATIONS, data.notifications);
      if (Array.isArray(data.activities)) setStored(KEYS.ACTIVITIES, data.activities);
      if (data.settings) setStored(KEYS.SETTINGS, data.settings);

      this.logActivity('Backup Restored', 'Restored complete database snapshot from imported file', 'Settings');
      return true;
    } catch (err) {
      console.error('Error importing backup:', err);
      return false;
    }
  },

  resetToSyntheticDemonstrationData(): void {
    setStored(KEYS.FARMERS, INITIAL_FARMERS);
    setStored(KEYS.SURVEYS, INITIAL_SURVEYS);
    setStored(KEYS.HEALTH_RECORDS, INITIAL_HEALTH_RECORDS);
    setStored(KEYS.EMERGENCIES, INITIAL_EMERGENCIES);
    setStored(KEYS.SCHEME_ENROLLMENTS, INITIAL_SCHEME_ENROLLMENTS);
    setStored(KEYS.INSURANCE_RECORDS, INITIAL_INSURANCE_RECORDS);
    setStored(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    setStored(KEYS.ACTIVITIES, INITIAL_ACTIVITY_LOGS);
    setStored(KEYS.SETTINGS, DEFAULT_SETTINGS);
    this.logActivity('Database Reset', 'Reset all records to standard demonstration data', 'Settings');
  },

  resetToSeedData(): void {
    this.resetToSyntheticDemonstrationData();
  }
};
