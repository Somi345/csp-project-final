import React, { useState, useEffect, useCallback } from 'react';
import { 
  Farmer, 
  MonthlySurvey, 
  CropHealthRecord, 
  EmergencyCase, 
  SchemeEnrollment, 
  CropInsuranceRecord,
  NotificationItem, 
  ActivityLog, 
  CoordinatorProfile,
  NavigationTab 
} from './types';
import { StorageService } from './services/storageService';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavModule } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { DashboardView } from './components/dashboard/DashboardView';
import { FarmerListView } from './components/farmers/FarmerListView';
import { FarmerProfileView } from './components/farmers/FarmerProfileView';
import { FarmerFormModal } from './components/farmers/FarmerFormModal';
import { SurveyListView } from './components/surveys/SurveyListView';
import { SurveyFormModal } from './components/surveys/SurveyFormModal';
import { SurveyDetailModal } from './components/surveys/SurveyDetailModal';
import { CropHealthView } from './components/cropHealth/CropHealthView';
import { EmergencyListView } from './components/emergencies/EmergencyListView';
import { EmergencyFormModal } from './components/emergencies/EmergencyFormModal';
import { EmergencyDetailModal } from './components/emergencies/EmergencyDetailModal';
import { SchemesView } from './components/schemes/SchemesView';
import { ReportsView } from './components/reports/ReportsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { SettingsView } from './components/settings/SettingsView';
import { SystemOverviewView } from './components/home/SystemOverviewView';

export default function App() {
  // Navigation & View State
  const [activeModule, setActiveModule] = useState<NavModule>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Entities & Database State
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [surveys, setSurveys] = useState<MonthlySurvey[]>([]);
  const [healthRecords, setHealthRecords] = useState<CropHealthRecord[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyCase[]>([]);
  const [schemes, setSchemes] = useState<SchemeEnrollment[]>([]);
  const [insuranceRecords, setInsuranceRecords] = useState<CropInsuranceRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [coordinator, setCoordinator] = useState<CoordinatorProfile>(StorageService.getCoordinatorProfile());

  // Deep View & Modal States
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [isFarmerModalOpen, setIsFarmerModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [schemesTab, setSchemesTab] = useState<'catalog' | 'enrollments' | 'insurance' | 'schemes'>('catalog');

  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [surveyPreselectedFarmer, setSurveyPreselectedFarmer] = useState<Farmer | null>(null);
  const [viewingSurvey, setViewingSurvey] = useState<MonthlySurvey | null>(null);

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyPreselectedFarmer, setEmergencyPreselectedFarmer] = useState<Farmer | null>(null);
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyCase | null>(null);

  // Load all data from StorageService
  const refreshData = useCallback(() => {
    setFarmers(StorageService.getFarmers());
    setSurveys(StorageService.getSurveys());
    setHealthRecords(StorageService.getCropHealthRecords());
    setEmergencies(StorageService.getEmergencies());
    setSchemes(StorageService.getSchemeEnrollments());
    setInsuranceRecords(StorageService.getInsuranceRecords());
    setNotifications(StorageService.getNotifications());
    setActivities(StorageService.getActivityLogs());
    setCoordinator(StorageService.getCoordinatorProfile());
  }, []);

  useEffect(() => {
    refreshData();
    const unsubscribe = StorageService.subscribe(refreshData);
    return () => unsubscribe();
  }, [refreshData]);

  // Keep selectedFarmer updated if farmers array changes
  useEffect(() => {
    if (selectedFarmer) {
      const updated = farmers.find(f => f.id === selectedFarmer.id);
      if (updated) setSelectedFarmer(updated);
    }
  }, [farmers]);

  // Quick Action / Navigation handlers
  const handleNavigate = (module: NavModule | string, param?: any) => {
    if (module !== 'farmers') {
      setSelectedFarmer(null);
    }
    setActiveModule(module as NavModule);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Handle deep navigation by target ID
    if (param) {
      if (module === 'emergencies') {
        const found = emergencies.find(e => e.id === param);
        if (found) setSelectedEmergency(found);
      } else if (module === 'surveys') {
        const found = surveys.find(s => s.id === param);
        if (found) setViewingSurvey(found);
      } else if (module === 'farmers') {
        const found = farmers.find(f => f.id === param);
        if (found) setSelectedFarmer(found);
      } else if (module === 'schemes' && (param === 'insurance' || param === 'enrollments' || param === 'catalog')) {
        setSchemesTab(param);
      }
    }
  };

  // Farmer Actions
  const handleSaveFarmer = async (farmer: Farmer) => {
    try {
      const saved = await StorageService.saveFarmerViaBackend(farmer, coordinator);
      refreshData();
      setIsFarmerModalOpen(false);
      setEditingFarmer(null);
      if (selectedFarmer?.id === farmer.id) {
        setSelectedFarmer(saved);
      }
    } catch (err: any) {
      console.error('Save farmer error:', err);
      throw err;
    }
  };

  const handleToggleFarmerStatus = async (farmer: Farmer) => {
    const nextStatus = farmer.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const updated = await StorageService.updateFarmerStatusViaBackend(farmer.id, nextStatus, coordinator);
      refreshData();
      if (selectedFarmer?.id === farmer.id) {
        setSelectedFarmer(updated);
      }
    } catch (err: any) {
      console.error('Failed to toggle farmer status:', err);
    }
  };

  const handleOpenRegisterFarmer = () => {
    setEditingFarmer(null);
    setIsFarmerModalOpen(true);
  };

  const handleOpenEditFarmer = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    setIsFarmerModalOpen(true);
  };

  // Survey Actions
  const handleOpenNewSurvey = (forFarmer?: Farmer) => {
    setSurveyPreselectedFarmer(forFarmer || null);
    setIsSurveyModalOpen(true);
  };

  const handleSaveSurvey = (survey: MonthlySurvey) => {
    StorageService.saveSurvey(survey);
    setIsSurveyModalOpen(false);
  };

  // Emergency Actions
  const handleOpenNewEmergency = (forFarmer?: Farmer) => {
    setEmergencyPreselectedFarmer(forFarmer || null);
    setIsEmergencyModalOpen(true);
  };

  const handleSaveEmergency = (emergency: EmergencyCase) => {
    StorageService.saveEmergency(emergency);
    setIsEmergencyModalOpen(false);
  };

  const handleUpdateEmergency = (updated: EmergencyCase) => {
    StorageService.saveEmergency(updated);
    setSelectedEmergency(updated);
  };

  // Crop Health Action
  const handleSaveHealthRecord = (record: CropHealthRecord) => {
    StorageService.saveCropHealthRecord(record);
  };

  // Scheme Actions
  const handleSaveEnrollment = (enr: SchemeEnrollment) => {
    StorageService.saveSchemeEnrollment(enr);
  };

  const handleUpdateEnrollment = (enr: SchemeEnrollment) => {
    StorageService.saveSchemeEnrollment(enr);
  };

  // Crop Insurance Actions
  const handleSaveInsuranceRecord = (record: CropInsuranceRecord) => {
    StorageService.saveInsuranceRecord(record);
    refreshData();
  };

  // Notification Actions
  const handleMarkNotificationAsRead = (id: string) => {
    StorageService.markNotificationAsRead(id);
  };

  const handleMarkAllNotificationsAsRead = () => {
    StorageService.markAllNotificationsAsRead();
  };

  // Profile Action
  const handleUpdateProfile = (updatedProfile: CoordinatorProfile) => {
    StorageService.saveCoordinatorProfile(updatedProfile);
  };

  // Reset Data Action
  const handleResetData = () => {
    StorageService.resetToSeedData();
    refreshData();
    setSelectedFarmer(null);
    setSelectedEmergency(null);
    setViewingSurvey(null);
    setActiveModule('dashboard');
  };

  // Derived counts for sidebar badges
  const sidebarCounts = {
    farmers: farmers.length,
    surveys: surveys.length,
    emergenciesOpen: emergencies.filter(e => e.status === 'Open' || e.status === 'In Progress').length,
    notificationsUnread: notifications.filter(n => !n.isRead).length
  };

  const availableSchemesCatalog = StorageService.getAvailableSchemes();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased font-sans">
      {/* Top Government Navigation Header */}
      <Navbar
        coordinator={coordinator}
        unreadNotificationsCount={sidebarCounts.notificationsUnread}
        onOpenNotifications={() => handleNavigate('notifications')}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        authEnabled={true}
        activeModule={activeModule}
        onSelectModule={handleNavigate}
      />

      {/* Main Body Workspace */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 gap-6">
        {/* Responsive Sidebar */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={handleNavigate}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          counts={sidebarCounts}
        />

        {/* Dynamic Main Stage View */}
        <main className="flex-1 min-w-0">
          {/* Module 1: Dashboard View */}
          {activeModule === 'dashboard' && (
            <DashboardView
              coordinator={coordinator}
              farmers={farmers}
              surveys={surveys}
              healthRecords={healthRecords}
              emergencies={emergencies}
              schemes={schemes}
              insuranceRecords={insuranceRecords}
              notifications={notifications as any}
              activities={activities}
              onNavigate={handleNavigate}
              onOpenNewSurvey={() => handleOpenNewSurvey()}
              onOpenNewFarmer={handleOpenRegisterFarmer}
              onOpenNewEmergency={() => handleOpenNewEmergency()}
            />
          )}

          {/* Module 2: Farmer Management (List or Detailed Profile) */}
          {activeModule === 'farmers' && (
            selectedFarmer ? (
              <FarmerProfileView
                farmer={selectedFarmer}
                coordinator={coordinator}
                surveys={surveys}
                healthRecords={healthRecords}
                emergencies={emergencies}
                schemes={schemes}
                insuranceRecords={insuranceRecords}
                activities={activities}
                onBack={() => setSelectedFarmer(null)}
                onEdit={handleOpenEditFarmer}
                onToggleStatus={handleToggleFarmerStatus}
                onNewSurvey={f => handleOpenNewSurvey(f)}
                onNewEmergency={f => handleOpenNewEmergency(f)}
                onViewSurvey={s => setViewingSurvey(s)}
              />
            ) : (
              <FarmerListView
                farmers={farmers}
                coordinator={coordinator}
                onSelectFarmer={f => setSelectedFarmer(f)}
                onOpenCreateModal={handleOpenRegisterFarmer}
                onEditFarmer={handleOpenEditFarmer}
                onToggleFarmerStatus={handleToggleFarmerStatus}
              />
            )
          )}

          {/* Module 3: Monthly Surveys View */}
          {activeModule === 'surveys' && (
            <SurveyListView
              surveys={surveys}
              farmers={farmers}
              onOpenCreateSurvey={() => handleOpenNewSurvey()}
              onViewSurvey={s => setViewingSurvey(s)}
            />
          )}

          {/* Module 4: Crop Health & AI Diagnostic Workbench */}
          {activeModule === 'cropHealth' && (
            <CropHealthView
              farmers={farmers}
              healthRecords={healthRecords}
              onSaveHealthRecord={handleSaveHealthRecord}
            />
          )}

          {/* Module 5: Emergency Issues Queue */}
          {activeModule === 'emergencies' && (
            <EmergencyListView
              emergencies={emergencies}
              farmers={farmers}
              onOpenCreateEmergency={() => handleOpenNewEmergency()}
              onSelectEmergency={emg => setSelectedEmergency(emg)}
            />
          )}

          {/* Module 6: Government Schemes & DBT */}
          {activeModule === 'schemes' && (
            <SchemesView
              schemes={availableSchemesCatalog}
              enrollments={schemes}
              insuranceRecords={insuranceRecords}
              farmers={farmers}
              initialTab={schemesTab}
              onTabChange={setSchemesTab}
              onSaveEnrollment={handleSaveEnrollment}
              onUpdateEnrollment={handleUpdateEnrollment}
              onSaveInsuranceRecord={handleSaveInsuranceRecord}
            />
          )}

          {/* Module 7: Official Reports & Data Exports */}
          {activeModule === 'reports' && (
            <ReportsView
              farmers={farmers}
              surveys={surveys}
              healthRecords={healthRecords}
              emergencies={emergencies}
              schemes={schemes}
              insuranceRecords={insuranceRecords}
            />
          )}

          {/* Module 8: Notifications & Alerts */}
          {activeModule === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onMarkAsRead={handleMarkNotificationAsRead}
              onMarkAllAsRead={handleMarkAllNotificationsAsRead}
              onNavigate={handleNavigate}
            />
          )}

          {/* Module 9: Coordinator Settings & Backups */}
          {activeModule === 'settings' && (
            <SettingsView
              profile={coordinator}
              onUpdateProfile={handleUpdateProfile}
              activities={activities}
              onResetData={handleResetData}
            />
          )}

          {/* Module 10: System Overview / Home */}
          {activeModule === 'home' && (
            <SystemOverviewView onNavigate={handleNavigate} />
          )}
        </main>
      </div>

      {/* Persistent Official Gov Portal Footer */}
      <Footer />

      {/* Global Modals */}
      {/* 1. Register / Edit Farmer Modal */}
      <FarmerFormModal
        isOpen={isFarmerModalOpen}
        onClose={() => {
          setIsFarmerModalOpen(false);
          setEditingFarmer(null);
        }}
        onSave={handleSaveFarmer}
        initialFarmer={editingFarmer}
        coordinator={coordinator}
      />

      {/* 2. Monthly Survey Form Modal */}
      <SurveyFormModal
        isOpen={isSurveyModalOpen}
        onClose={() => {
          setIsSurveyModalOpen(false);
          setSurveyPreselectedFarmer(null);
        }}
        onSave={handleSaveSurvey}
        farmers={farmers}
        preselectedFarmer={surveyPreselectedFarmer}
      />

      {/* 3. Survey Detail Modal */}
      <SurveyDetailModal
        isOpen={Boolean(viewingSurvey)}
        onClose={() => setViewingSurvey(null)}
        survey={viewingSurvey}
      />

      {/* 4. Emergency Incident Form Modal */}
      <EmergencyFormModal
        isOpen={isEmergencyModalOpen}
        onClose={() => {
          setIsEmergencyModalOpen(false);
          setEmergencyPreselectedFarmer(null);
        }}
        onSave={handleSaveEmergency}
        farmers={farmers}
        preselectedFarmer={emergencyPreselectedFarmer}
      />

      {/* 5. Emergency Detail & Lifecycle Response Modal */}
      <EmergencyDetailModal
        isOpen={Boolean(selectedEmergency)}
        onClose={() => setSelectedEmergency(null)}
        emergency={selectedEmergency}
        onUpdate={handleUpdateEmergency}
      />
    </div>
  );
}
