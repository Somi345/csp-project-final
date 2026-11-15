export type UserRole = 'Village Agriculture Coordinator' | 'System Administrator';

export interface CoordinatorProfile {
  name: string;
  role: UserRole;
  badgeId: string;
  designation?: string;
  employeeCode?: string;
  department?: string;
  villageCluster: string;
  mandal: string;
  district: string;
  state: string;
  phone: string;
  email: string;
}

export type Gender = 'Male' | 'Female' | 'Other';
export type FarmerStatus = 'Active' | 'Inactive';

export interface Farmer {
  id: string; // e.g. FMR-AP-0101
  fullName: string;
  fatherSpouseName: string;
  age: number;
  gender: Gender;
  phone: string;
  aadhaarMasked: string; // e.g. XXXX-XXXX-4819
  village: string;
  mandal: string;
  district: string;
  state: string;
  landAreaAcres: number;
  soilType: string;
  waterSource: string;
  primaryCrop: string;
  cropVariety: string;
  registrationDate: string; // YYYY-MM-DD
  status: FarmerStatus;
  notes?: string;
  updatedAt?: string; // ISO 8601 update timestamp
}

export type CropCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
export type GrowthStage = 
  | 'Sowing / Germination'
  | 'Vegetative'
  | 'Flowering'
  | 'Grain / Pod Formation'
  | 'Maturity / Harvesting';

export type WaterAvailability = 'Abundant' | 'Adequate' | 'Deficit' | 'Severe Scarcity';

export interface MonthlySurvey {
  id: string; // SRV-2024-XXX
  farmerId: string;
  farmerName: string;
  village: string;
  surveyDate: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  crop: string;
  cropVariety: string;
  growthStage: GrowthStage;
  cropCondition: CropCondition;
  diseaseSymptoms: string;
  pestDetails: string;
  waterAvailability: WaterAvailability;
  fertilizerUsed: string;
  weatherCondition?: string;
  cropImageUrl?: string;
  remarks: string;
  coordinatorNotes: string;
  hasDiseaseAlert: boolean;
  createdAt: string;
}

export type SeverityLevel = 'Low' | 'Moderate' | 'High' | 'Severe';
export type HealthStatus = 'Under Observation' | 'Treatment Prescribed' | 'Recovered' | 'Escalated to Emergency';

export interface CropHealthRecord {
  id: string; // HLT-2024-XXX
  farmerId: string;
  farmerName: string;
  village: string;
  surveyId?: string;
  crop: string;
  cropVariety: string;
  observationDate: string;
  symptoms: string;
  detectedCondition: string;
  severity: SeverityLevel;
  coordinatorObservation: string;
  aiAssisted: boolean;
  aiConfidenceScore?: number;
  aiRecommendation?: {
    diagnosis: string;
    fertilizerRecommendation: string;
    pesticideRecommendation: string;
    culturalCareSuggestions: string;
    irrigationSuggestions: string;
    disclaimer: string;
  };
  treatmentPrescribed: string;
  followUpDate?: string;
  status: HealthStatus;
}

export type EmergencyPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type EmergencyStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface EmergencyCase {
  id: string; // EMG-2024-XXX
  farmerId: string;
  farmerName: string;
  village: string;
  contactPhone: string;
  problemType: 
    | 'Severe Pest Outbreak' 
    | 'Sudden Fungal Wilt' 
    | 'Water Logging / Flood' 
    | 'Drought Stress' 
    | 'Nutrient Deficiency Crisis' 
    | 'Crop Damage by Wildlife'
    | 'Other Crop Emergency';
  crop: string;
  problemDescription: string;
  cropImageUrl?: string;
  priority: EmergencyPriority;
  status: EmergencyStatus;
  solution?: string;
  medicinePrescribed?: string;
  fertilizerRecommended?: string;
  followUpDate?: string;
  coordinatorNotes: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export type SchemeCode = 'PM-KISAN' | 'RYTHU-BHAROSA' | 'PMFBY-INSURANCE' | 'FERT-SUBSIDY' | 'KCC-LOAN';
export type SchemeApplicationStatus = 'Eligible' | 'Applied' | 'Pending' | 'Approved' | 'Rejected' | 'Not Eligible';

export type InsuranceClaimStatus = 
  | 'Not Reported'
  | 'Reported'
  | 'Under Assessment'
  | 'Approved'
  | 'Rejected'
  | 'Payment Pending'
  | 'Paid';

export interface CropInsuranceClaimHistoryItem {
  id: string;
  date: string;
  action: string;
  status: InsuranceClaimStatus;
  notes: string;
  amount?: number;
  updatedBy: string;
}

export interface CropInsuranceRecord {
  id: string; // e.g. INS-2024-001
  farmerId: string;
  farmerName: string;
  village: string;
  crop: string;
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'Whole Year';
  insuranceScheme: string; // e.g. 'PMFBY (Pradhan Mantri Fasal Bima Yojana)'
  insuredLandAreaAcres: number;
  premiumStatus: 'Paid' | 'Subsidized' | 'Pending';
  damageType?: string; // e.g. 'Unseasonal Rain / Hailstorm', 'Pest Outbreak', 'Drought', 'Flood / Waterlogging'
  damageDate?: string;
  damageDescription?: string;
  supportingImageUrl?: string;
  claimApplicationDate?: string;
  claimStatus: InsuranceClaimStatus;
  approvedClaimAmount?: number; // In INR, recorded officially
  paymentStatus: 'Unpaid' | 'Pending Disbursal' | 'Disbursed / Paid';
  coordinatorRemarks: string;
  claimHistory?: CropInsuranceClaimHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface GovernmentScheme {
  id: string;
  code: SchemeCode;
  name: string;
  department: string;
  description: string;
  benefitDetails: string;
  eligibilityCriteria: string;
  rules?: string[];
  documentsRequired?: string[];
}

export type SchemeInfo = GovernmentScheme;

export interface SchemeEnrollment {
  id: string; // SCH-2024-XXX
  farmerId: string;
  farmerName: string;
  village: string;
  schemeCode: SchemeCode;
  schemeName: string;
  applicationStatus: SchemeApplicationStatus;
  appliedDate?: string;
  verificationStatus: 'Pending Verification' | 'Field Verified' | 'Rejected';
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  benefitReceived?: string;
  disbursementDate?: string;
  notes: string;
  updatedAt: string;
}

export type NotificationType = 'emergency' | 'survey' | 'scheme' | 'health' | 'info' | 'success' | 'warning' | 'danger';

export interface SystemNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  targetTab?: NavigationTab;
  targetModule?: string;
  targetId?: string;
}

export type NotificationItem = SystemNotification;

export type NavigationTab = 
  | 'dashboard'
  | 'farmers'
  | 'surveys'
  | 'cropHealth'
  | 'emergencies'
  | 'schemes'
  | 'reports'
  | 'notifications'
  | 'settings'
  | 'home';

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  module: string;
  actor: string;
}

export interface AppSettings {
  authEnabled: boolean;
  offlineMode: boolean;
  aiServiceConfigured: boolean;
  maxUploadSizeBytes: number;
  selectedVillageFilter: string;
  coordinatorProfile: CoordinatorProfile;
}
