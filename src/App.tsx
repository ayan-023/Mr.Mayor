/**
 * MR. MAYOR - Urban Infrastructure Coordination & Excavation Management Platform
 * Main React Application Root Component (Editorial Aesthetic)
 */

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CityCommandCenter } from './components/dashboard/CityCommandCenter';
import { AuthorityLoginPortal } from './components/auth/AuthorityLoginPortal';
import { CityOnboardingModal } from './components/city/CityOnboardingModal';
import { api } from './services/api';
import {
  Road,
  Project,
  InfrastructureAsset,
  CoordinationCluster,
  ApprovalWorkflow,
  RoadOpeningPermit,
  Inspection,
  CitizenComplaint,
  CityAnalyticsSummary,
  AuditLogItem,
  SystemNotification,
  SystemSettingsConfig,
  CityPortalConfig,
  UserRole,
  User,
} from './types';

// Lazy load secondary views to reduce initial bundle payload and boost rendering speed
const GisMap = lazy(() =>
  import('./components/gis/GisMap').then((m) => ({ default: m.GisMap }))
);
const ProjectList = lazy(() =>
  import('./components/projects/ProjectList').then((m) => ({ default: m.ProjectList }))
);
const AIAnalysisCenterView = lazy(() =>
  import('./components/coordination/AIAnalysisCenterView').then((m) => ({ default: m.AIAnalysisCenterView }))
);
const CoordinationHub = lazy(() =>
  import('./components/coordination/CoordinationHub').then((m) => ({ default: m.CoordinationHub }))
);
const ApprovalsQueue = lazy(() =>
  import('./components/approvals/ApprovalsQueue').then((m) => ({ default: m.ApprovalsQueue }))
);
const PermitsHub = lazy(() =>
  import('./components/permits/PermitsHub').then((m) => ({ default: m.PermitsHub }))
);
const RoadTwinHub = lazy(() =>
  import('./components/roads/RoadTwinHub').then((m) => ({ default: m.RoadTwinHub }))
);
const ContractorPortal = lazy(() =>
  import('./components/contractor/ContractorPortal').then((m) => ({ default: m.ContractorPortal }))
);
const InspectionsHub = lazy(() =>
  import('./components/inspections/InspectionsHub').then((m) => ({ default: m.InspectionsHub }))
);
const CitizenPortal = lazy(() =>
  import('./components/citizen/CitizenPortal').then((m) => ({ default: m.CitizenPortal }))
);
const AnalyticsView = lazy(() =>
  import('./components/analytics/AnalyticsView').then((m) => ({ default: m.AnalyticsView }))
);
const SettingsHub = lazy(() =>
  import('./components/settings/SettingsHub').then((m) => ({ default: m.SettingsHub }))
);
const AdminPortal = lazy(() =>
  import('./components/admin/AdminPortal').then((m) => ({ default: m.AdminPortal }))
);

// Lazy load modals & drawers
const AuditDrawer = lazy(() =>
  import('./components/layout/AuditDrawer').then((m) => ({ default: m.AuditDrawer }))
);
const NotificationDrawer = lazy(() =>
  import('./components/layout/NotificationDrawer').then((m) => ({ default: m.NotificationDrawer }))
);
const ProjectCreateModal = lazy(() =>
  import('./components/projects/ProjectCreateModal').then((m) => ({ default: m.ProjectCreateModal }))
);
const ProjectDetailModal = lazy(() =>
  import('./components/projects/ProjectDetailModal').then((m) => ({ default: m.ProjectDetailModal }))
);
const EmergencyModal = lazy(() =>
  import('./components/emergency/EmergencyModal').then((m) => ({ default: m.EmergencyModal }))
);
const MasterDemoModal = lazy(() =>
  import('./components/demo/MasterDemoModal').then((m) => ({ default: m.MasterDemoModal }))
);

// Lightweight modern suspense fallback
const TabLoadingFallback = () => (
  <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-12 text-slate-800">
    <div className="w-10 h-10 rounded-xl bg-blue-600 animate-pulse flex items-center justify-center font-bold text-white text-base mb-3 shadow-sm">
      M
    </div>
    <span className="text-xs font-semibold text-slate-500">Loading workspace...</span>
  </div>
);

function MainApp() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Core municipal state loaded from server
  const [availableCities, setAvailableCities] = useState<CityPortalConfig[]>([]);
  const [activeCity, setActiveCity] = useState<CityPortalConfig | null>(null);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const [roads, setRoads] = useState<Road[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assets, setAssets] = useState<InfrastructureAsset[]>([]);
  const [clusters, setClusters] = useState<CoordinationCluster[]>([]);
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [permits, setPermits] = useState<RoadOpeningPermit[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]);
  const [analytics, setAnalytics] = useState<CityAnalyticsSummary | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [settings, setSettings] = useState<SystemSettingsConfig | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Modals & Drawers state
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isMasterDemoModalOpen, setIsMasterDemoModalOpen] = useState(false);
  const [inspectedProject, setInspectedProject] = useState<Project | null>(null);

  // Load all municipal data from API
  const refreshAllData = useCallback(async () => {
    try {
      const [
        citiesRes,
        roadsRes,
        projectsRes,
        assetsRes,
        clustersRes,
        workflowsRes,
        permitsRes,
        inspectionsRes,
        complaintsRes,
        analyticsRes,
        auditLogsRes,
        notificationsRes,
        settingsRes,
      ] = await Promise.all([
        api.getCities(),
        api.getRoads(),
        api.getProjects(),
        api.getAssets(),
        api.getClusters(),
        api.getWorkflows(),
        api.getPermits(),
        api.getInspections(),
        api.getComplaints(),
        api.getAnalytics(),
        api.getAuditLogs(),
        api.getNotifications(),
        api.getSettings(),
      ]);

      if (citiesRes) {
        setAvailableCities(citiesRes.cities || []);
        setActiveCity(citiesRes.activeCity || null);
      }

      setRoads(roadsRes.roads || []);
      setProjects(projectsRes.projects || []);
      setAssets(assetsRes.assets || []);
      setClusters(clustersRes.clusters || []);
      setWorkflows(workflowsRes.workflows || []);
      setPermits(permitsRes.permits || []);
      setInspections(inspectionsRes.inspections || []);
      setComplaints(complaintsRes.complaints || []);
      setAnalytics(analyticsRes.summary || null);
      setAuditLogs(auditLogsRes.auditLogs || []);
      setNotifications(notificationsRes.notifications || []);
      setSettings(settingsRes.settings || null);
    } catch (err) {
      console.error('Error refreshing municipal data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCityChanged = useCallback(async (newCity: CityPortalConfig) => {
    setIsLoading(true);
    try {
      await api.switchCity(newCity.id);
      setActiveCity(newCity);
      await refreshAllData();
    } catch (err) {
      console.error('Failed to switch city:', err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshAllData]);

  const handleCityCreated = useCallback(async (newCity: CityPortalConfig) => {
    setAvailableCities((prev) => [...prev.filter((c) => c.id !== newCity.id), newCity]);
    setActiveCity(newCity);
    await refreshAllData();
  }, [refreshAllData]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const handleMarkNotificationRead = useCallback(async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const getAllowedTabsForUser = (user: User | null): string[] => {
    if (!user) return ['dashboard'];
    const role = user.role;
    const dept = user.department;

    switch (role) {
      case 'COMMISSIONER':
        return [
          'dashboard',
          'map',
          'projects',
          'ai-analysis',
          'coordination',
          'approvals',
          'permits',
          'roads',
          'assets',
          'contractor',
          'inspections',
          'citizen',
          'analytics',
          'admin',
          'settings',
        ];
      case 'NODAL_OFFICER':
      case 'ADMIN':
        return [
          'dashboard',
          'map',
          'projects',
          'ai-analysis',
          'coordination',
          'approvals',
          'permits',
          'roads',
          'assets',
          'contractor',
          'inspections',
          'citizen',
          'analytics',
          'admin',
          'settings',
        ];
      case 'EXECUTIVE_ENGINEER':
      case 'DEPT_HEAD':
        return [
          'dashboard',
          'map',
          'projects',
          'ai-analysis',
          'coordination',
          'approvals',
          'permits',
          'roads',
          'assets',
          'inspections',
          'citizen',
          'analytics',
          'settings',
        ];
      case 'INSPECTOR':
        return ['dashboard', 'map', 'projects', 'coordination', 'inspections', 'permits', 'roads', 'citizen', 'analytics'];
      case 'CONTRACTOR':
        return ['dashboard', 'map', 'projects', 'coordination', 'contractor', 'permits', 'roads', 'inspections'];
      case 'CITIZEN':
        return ['citizen', 'map', 'analytics'];
      default:
        return ['dashboard', 'map', 'projects', 'coordination'];
    }
  };

  useEffect(() => {
    if (currentUser) {
      const allowed = getAllowedTabsForUser(currentUser);
      if (Array.isArray(allowed) && !allowed.includes(activeTab)) {
        setActiveTab(allowed[0] || 'dashboard');
      }
    }
  }, [currentUser, activeTab]);

  const handleLoginSuccess = (role: UserRole) => {
    if (currentUser) {
      const allowed = getAllowedTabsForUser(currentUser);
      if (Array.isArray(allowed)) {
        setActiveTab(allowed[0] || 'dashboard');
      }
    } else {
      switch (role) {
        case 'COMMISSIONER':
        case 'NODAL_OFFICER':
        case 'ADMIN':
          setActiveTab('dashboard');
          break;
        case 'EXECUTIVE_ENGINEER':
        case 'DEPT_HEAD':
          setActiveTab('coordination');
          break;
        case 'INSPECTOR':
          setActiveTab('inspections');
          break;
        case 'CONTRACTOR':
          setActiveTab('contractor');
          break;
        case 'CITIZEN':
          setActiveTab('citizen');
          break;
        default:
          setActiveTab('dashboard');
          break;
      }
    }
  };

  const pendingApprovalsCount = useMemo(
    () => workflows.filter((w) => w.overallStatus === 'PENDING').length,
    [workflows]
  );
  const activeConflictsCount = useMemo(
    () => projects.filter((p) => p.status === 'CONFLICT_DETECTED').length,
    [projects]
  );

  if (isLoading || !analytics || !settings) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 animate-pulse flex items-center justify-center font-bold text-white shadow-lg mb-4 text-xl">
          M
        </div>
        <div className="text-base font-bold text-slate-900">MR. MAYOR Platform</div>
        <div className="text-xs text-slate-500 mt-1">Bootstrapping GIS layers & conflict engine...</div>
      </div>
    );
  }

  // If user is not authenticated / logged out, show dedicated Authority Login Portal
  if (!currentUser) {
    return (
      <>
        <AuthorityLoginPortal
          onLoginSuccess={handleLoginSuccess}
          activeCity={activeCity}
          availableCities={availableCities}
          onSelectCity={handleCityChanged}
          onOpenCityOnboarding={() => setIsCityModalOpen(true)}
        />
        <CityOnboardingModal
          isOpen={isCityModalOpen}
          onClose={() => setIsCityModalOpen(false)}
          availableCities={availableCities}
          activeCity={activeCity}
          onCityChanged={handleCityChanged}
          onCityCreated={handleCityCreated}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        notifications={notifications}
        activeCity={activeCity}
        onOpenCityModal={() => setIsCityModalOpen(true)}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onOpenAuditDrawer={() => setIsAuditDrawerOpen(true)}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
      />

      {/* Body Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          pendingApprovalsCount={pendingApprovalsCount}
          activeConflictsCount={activeConflictsCount}
        />

        {/* Main Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Suspense fallback={<TabLoadingFallback />}>
            {activeTab === 'dashboard' && (
              <CityCommandCenter
                analytics={analytics}
                clusters={clusters}
                activeProjects={projects.filter((p) => p.status === 'IN_PROGRESS')}
                roads={roads}
                complaints={complaints}
                onRefreshData={refreshAllData}
                onNavigate={(tab) => setActiveTab(tab)}
                onOpenMasterDemo={() => setIsMasterDemoModalOpen(true)}
              />
            )}

            {activeTab === 'map' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                      CARTOGRAPHIC & SPATIAL ENGINE
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                      City Infrastructure GIS Digital Map
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Layered interactive visualization of roads, subsurface utilities, active excavations, and protected corridors
                    </p>
                  </div>
                </div>
                <GisMap
                  roads={roads}
                  projects={projects}
                  assets={assets}
                  onSelectRoad={() => {
                    setActiveTab('roads');
                  }}
                  onSelectProject={(proj) => {
                    setInspectedProject(proj);
                  }}
                  onNavigateToTab={(tabId) => {
                    setActiveTab(tabId);
                  }}
                  heightClass="h-[calc(100vh-16rem)] min-h-[500px]"
                />
              </div>
            )}

            {activeTab === 'projects' && (
              <ProjectList
                projects={projects}
                onOpenCreateModal={() => setIsCreateProjectModalOpen(true)}
                onSelectProject={(proj) => setInspectedProject(proj)}
              />
            )}

            {activeTab === 'ai-analysis' && (
              <AIAnalysisCenterView
                projects={projects}
                roads={roads}
                assets={assets}
                clusters={clusters}
                onRefreshData={refreshAllData}
                onSelectProject={(proj) => setInspectedProject(proj)}
              />
            )}

            {activeTab === 'coordination' && (
              <CoordinationHub
                clusters={clusters}
                onRefreshData={refreshAllData}
                onSelectProject={(proj) => setInspectedProject(proj)}
              />
            )}

            {activeTab === 'approvals' && (
              <ApprovalsQueue workflows={workflows} onRefreshData={refreshAllData} />
            )}

            {activeTab === 'permits' && (
              <PermitsHub permits={permits} onRefreshData={refreshAllData} />
            )}

            {activeTab === 'roads' && (
              <RoadTwinHub
                roads={roads}
                onSelectRoadOnMap={() => {
                  setActiveTab('map');
                }}
              />
            )}

            {activeTab === 'assets' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                    MUNICIPAL ASSET REGISTER
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                    Subsurface Utility Infrastructure Assets
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Underground pipelines, high-voltage cables, drainage culverts, and fiber ducts registered across city corridors
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2.5 text-xs shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-sm text-slate-900">{asset.assetType}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                          {asset.ownerDepartment}
                        </span>
                      </div>
                      <div className="text-slate-600">
                        Capacity: <strong className="text-slate-900">{asset.capacityOrDiameter}</strong> • Depth: <strong className="text-slate-900">{asset.depthMeters}m</strong>
                      </div>
                      <div className="text-slate-500 text-[11px]">Material: {asset.material}</div>
                      <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                        <span>Condition: <strong className="text-slate-700">{asset.condition}</strong></span>
                        <span>Installed: {asset.installationYear}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'contractor' && (
              <ContractorPortal projects={projects} onRefreshData={refreshAllData} />
            )}

            {activeTab === 'inspections' && (
              <InspectionsHub
                inspections={inspections}
                projects={projects}
                onRefreshData={refreshAllData}
              />
            )}

            {activeTab === 'citizen' && (
              <CitizenPortal
                complaints={complaints}
                roads={roads}
                projects={projects}
                onRefreshData={refreshAllData}
                onSelectProject={(proj) => setInspectedProject(proj)}
              />
            )}

            {activeTab === 'analytics' && <AnalyticsView analytics={analytics} />}

            {activeTab === 'admin' && <AdminPortal onRefreshData={refreshAllData} />}

            {activeTab === 'settings' && (
              <SettingsHub settings={settings} onRefreshSettings={refreshAllData} />
            )}
          </Suspense>
        </main>
      </div>

      {/* Drawers & Modals rendered lazily */}
      <Suspense fallback={null}>
        {isAuditDrawerOpen && (
          <AuditDrawer
            isOpen={isAuditDrawerOpen}
            onClose={() => setIsAuditDrawerOpen(false)}
            logs={auditLogs}
          />
        )}

        {isNotificationDrawerOpen && (
          <NotificationDrawer
            isOpen={isNotificationDrawerOpen}
            onClose={() => setIsNotificationDrawerOpen(false)}
            notifications={notifications}
            onMarkRead={handleMarkNotificationRead}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {isCreateProjectModalOpen && (
          <ProjectCreateModal
            isOpen={isCreateProjectModalOpen}
            onClose={() => setIsCreateProjectModalOpen(false)}
            roads={roads}
            onProjectCreated={(newProj) => {
              refreshAllData();
              setInspectedProject(newProj);
            }}
          />
        )}

        {inspectedProject && (
          <ProjectDetailModal
            isOpen={!!inspectedProject}
            onClose={() => setInspectedProject(null)}
            project={inspectedProject}
            onRefreshData={refreshAllData}
          />
        )}

        {isEmergencyModalOpen && (
          <EmergencyModal
            isOpen={isEmergencyModalOpen}
            onClose={() => setIsEmergencyModalOpen(false)}
            roads={roads}
            onEmergencyCreated={refreshAllData}
          />
        )}

        {isMasterDemoModalOpen && (
          <MasterDemoModal
            isOpen={isMasterDemoModalOpen}
            onClose={() => setIsMasterDemoModalOpen(false)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        <CityOnboardingModal
          isOpen={isCityModalOpen}
          onClose={() => setIsCityModalOpen(false)}
          availableCities={availableCities}
          activeCity={activeCity}
          onCityChanged={handleCityChanged}
          onCityCreated={handleCityCreated}
        />
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
