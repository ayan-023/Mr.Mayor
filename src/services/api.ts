/**
 * MR. MAYOR - Frontend API Client
 */

import {
  User,
  Road,
  InfrastructureAsset,
  Project,
  Conflict,
  CoordinationCluster,
  ApprovalWorkflow,
  RoadOpeningPermit,
  Inspection,
  WorkProgressLog,
  CitizenComplaint,
  CityAnalyticsSummary,
  AuditLogItem,
  SystemNotification,
  SystemSettingsConfig,
  CityPortalConfig,
  CityConnectionRequest,
  AICoordinationAnalysisResult,
  InfrastructureAnalysisReport,
} from '../types/index';

const API_BASE = '/api';

// In-memory response cache & in-flight request deduplication map
const apiCache = new Map<string, { data: any; timestamp: number }>();
const inflightRequests = new Map<string, Promise<any>>();
const DEFAULT_CACHE_TTL = 8000; // 8 seconds TTL for GET queries

export function clearApiCache() {
  apiCache.clear();
}

async function fetchJson<T>(url: string, options?: RequestInit, bypassCache = false): Promise<T> {
  const method = (options?.method || 'GET').toUpperCase();
  const cacheKey = `${method}:${url}`;

  // Serve from cache if GET request is recent
  if (method === 'GET' && !bypassCache) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < DEFAULT_CACHE_TTL) {
      return cached.data as T;
    }

    // Deduplicate identical simultaneous in-flight GET requests
    if (inflightRequests.has(cacheKey)) {
      return inflightRequests.get(cacheKey) as Promise<T>;
    }
  }

  const requestPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP error ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();

      if (method === 'GET') {
        apiCache.set(cacheKey, { data: json, timestamp: Date.now() });
      } else {
        // Any mutation (POST, PUT, DELETE) clears cached reference data so UI updates immediately
        apiCache.clear();
      }

      return json;
    } finally {
      inflightRequests.delete(cacheKey);
    }
  })();

  if (method === 'GET' && !bypassCache) {
    inflightRequests.set(cacheKey, requestPromise);
  }

  return requestPromise;
}

export const api = {
  // Auth & Authority Users
  getUsers: (bypassCache = true) => fetchJson<{ users: User[] }>('/auth/users', undefined, bypassCache),
  createUser: async (user: Partial<User>) => {
    clearApiCache();
    return fetchJson<{ success: boolean; user: User }>('/auth/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },
  updateUser: async (id: string, user: Partial<User>) => {
    clearApiCache();
    return fetchJson<{ success: boolean; user: User }>(`/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  },
  resetUserPassword: async (id: string) => {
    clearApiCache();
    return fetchJson<{ success: boolean; tempPassword: string; user: User }>(`/auth/users/${id}/reset-password`, {
      method: 'POST',
    });
  },
  toggleUserStatus: async (id: string) => {
    clearApiCache();
    return fetchJson<{ success: boolean; status: 'ACTIVE' | 'SUSPENDED'; user: User }>(`/auth/users/${id}/toggle-status`, {
      method: 'POST',
    });
  },
  deleteUser: async (id: string) => {
    clearApiCache();
    return fetchJson<{ success: boolean }>(`/auth/users/${id}`, {
      method: 'DELETE',
    });
  },
  login: (data: { email?: string; userId?: string }) =>
    fetchJson<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Roads
  getRoads: () => fetchJson<{ roads: Road[] }>('/roads'),
  getRoadDetails: (id: string) =>
    fetchJson<{
      road: Road;
      utilities: InfrastructureAsset[];
      activeProjects: Project[];
      upcomingProjects: Project[];
      historicalProjects: any[];
      complaints: CitizenComplaint[];
    }>(`/roads/${id}`),
  createRoad: (road: Partial<Road>) =>
    fetchJson<{ success: boolean; road: Road }>('/roads', {
      method: 'POST',
      body: JSON.stringify(road),
    }),

  // Assets
  getAssets: () => fetchJson<{ assets: InfrastructureAsset[] }>('/assets'),
  createAsset: (asset: Partial<InfrastructureAsset>) =>
    fetchJson<{ success: boolean; asset: InfrastructureAsset }>('/assets', {
      method: 'POST',
      body: JSON.stringify(asset),
    }),

  // Projects
  getProjects: () => fetchJson<{ projects: Project[] }>('/projects'),
  getProjectDetails: (id: string) =>
    fetchJson<{
      project: Project;
      workflow?: ApprovalWorkflow;
      conflicts: Conflict[];
      cluster?: CoordinationCluster;
      permit?: RoadOpeningPermit;
      inspections: Inspection[];
    }>(`/projects/${id}`),
  createProject: (project: Partial<Project>) =>
    fetchJson<{
      success: boolean;
      project: Project;
      conflictAnalysis: any;
      workflow: ApprovalWorkflow;
    }>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    }),
  startProjectWork: (id: string, contractorGps?: { lat: number; lng: number }, contractorName?: string) =>
    fetchJson<{ success: boolean; project: Project }>(`/projects/${id}/start`, {
      method: 'POST',
      body: JSON.stringify({ contractorGps, contractorName }),
    }),
  updateProjectProgress: (
    id: string,
    progressPercentageOrData:
      | number
      | {
          progressPercentage: number;
          currentWorkPhase?: string;
          notes?: string;
          workDoneComment?: string;
          metersCompleted?: number;
          laborCount?: number;
          equipmentOnSite?: string;
          siteCondition?: string;
          photoUrls?: string[];
          loggedBy?: string;
          loggedByRole?: string;
        },
    currentWorkPhase?: string,
    workDoneComment?: string,
    extraData?: {
      metersCompleted?: number;
      laborCount?: number;
      equipmentOnSite?: string;
      siteCondition?: string;
      photoUrls?: string[];
      loggedBy?: string;
      loggedByRole?: string;
    }
  ) => {
    let payload: any;
    if (typeof progressPercentageOrData === 'number') {
      payload = {
        progressPercentage: progressPercentageOrData,
        currentWorkPhase,
        workDoneComment,
        ...extraData,
      };
    } else {
      payload = progressPercentageOrData;
    }
    return fetchJson<{ success: boolean; project: Project; progressLog?: WorkProgressLog }>(
      `/projects/${id}/progress`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },
  getProjectProgressLogs: (id: string) =>
    fetchJson<{ progressLogs: WorkProgressLog[] }>(`/projects/${id}/progress-logs`),
  requestInspection: (data: { projectId: string; stage: string; contractorNotes?: string }) =>
    fetchJson<{ success: boolean; message: string }>('/inspections/request', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Conflicts
  getConflicts: () => fetchJson<{ conflicts: Conflict[] }>('/conflicts'),
  analyzeConflicts: (project: Partial<Project>) =>
    fetchJson<any>('/conflicts/analyze', {
      method: 'POST',
      body: JSON.stringify(project),
    }),

  // Coordination Clusters
  getClusters: () => fetchJson<{ clusters: CoordinationCluster[] }>('/coordination/clusters'),
  getClusterDetails: (id: string) => fetchJson<{ cluster: CoordinationCluster }>(`/coordination/clusters/${id}`),
  approveCluster: (
    id: string,
    data: { department: string; officer: string; designation: string; notes?: string }
  ) =>
    fetchJson<{ success: boolean; cluster: CoordinationCluster }>(`/coordination/clusters/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Advanced AI Infrastructure Coordination Engine
  analyzeProjectCoordination: (projectIdOrData: string | Partial<Project>, proximityThresholdMeters = 100) => {
    const payload =
      typeof projectIdOrData === 'string'
        ? { projectId: projectIdOrData, proximityThresholdMeters }
        : { project: projectIdOrData, proximityThresholdMeters };
    return fetchJson<AICoordinationAnalysisResult>('/coordination/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  acceptCoordinationPlan: (data: {
    projectId: string;
    planId: string;
    notes?: string;
    officer?: string;
    designation?: string;
    department?: string;
  }) => {
    clearApiCache();
    return fetchJson<{ success: boolean; cluster: CoordinationCluster; analysis: AICoordinationAnalysisResult }>(
      '/coordination/accept-plan',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },
  rejectCoordinationPlan: (data: {
    projectId: string;
    planId: string;
    reason: string;
    officer?: string;
    designation?: string;
    department?: string;
  }) => {
    clearApiCache();
    return fetchJson<{ success: boolean; message: string }>('/coordination/reject-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  modifyCoordinationPlan: (data: {
    projectId: string;
    planId?: string;
    customStartDate?: string;
    customEndDate?: string;
    customSequence?: string[];
    notes?: string;
    officer?: string;
  }) => {
    clearApiCache();
    return fetchJson<{ success: boolean; message: string }>('/coordination/modify-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getNashikIntelligence: () => fetchJson<any>('/coordination/nashik-intelligence'),
  getNashikTestCases: () => fetchJson<{ testCases: any[] }>('/coordination/test-cases'),

  // Infrastructure Analysis Center & RBAC
  getInfrastructureAnalysis: (projectId: string, userId?: string) =>
    fetchJson<{
      success: boolean;
      accessLevel: 'FULL' | 'DEPARTMENT_SCOPED' | 'INSPECTOR_OPERATIONAL' | 'FIELD_STAFF' | 'PUBLIC';
      sensitivity: string;
      report: any;
    }>(`/analysis/${projectId}${userId ? `?userId=${userId}` : ''}`, {
      headers: userId ? { 'x-user-id': userId } : {},
    }),

  generateOfficialMunicipalReport: (projectId: string, reportType?: string, userId?: string) =>
    fetchJson<{
      success: boolean;
      reportType: string;
      analysisId: string;
      version: string;
      generatedAt: string;
      generatedBy: string;
      report: InfrastructureAnalysisReport;
    }>(`/analysis/${projectId}/generate-report`, {
      method: 'POST',
      body: JSON.stringify({ reportType, userId }),
      headers: userId ? { 'x-user-id': userId } : {},
    }),

  // AI Services
  analyzeAICoordination: (roadId: string, projectIds: string[]) =>
    fetchJson<any>('/ai/analyze-coordination', {
      method: 'POST',
      body: JSON.stringify({ roadId, projectIds }),
    }),
  inspectPhotosAI: (photoType: string, notes: string, roadName: string) =>
    fetchJson<any>('/ai/inspect-photos', {
      method: 'POST',
      body: JSON.stringify({ photoType, notes, roadName }),
    }),
  predictFutureWork: (roadId: string) =>
    fetchJson<any>('/ai/predict-future-work', {
      method: 'POST',
      body: JSON.stringify({ roadId }),
    }),

  // Approvals
  getWorkflows: () => fetchJson<{ workflows: ApprovalWorkflow[] }>('/approvals'),
  takeApprovalAction: (
    workflowId: string,
    data: {
      action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
      approverName: string;
      designation: string;
      remarks?: string;
      overrideAI?: boolean;
      overrideReason?: string;
    }
  ) =>
    fetchJson<{ success: boolean; workflow: ApprovalWorkflow }>(`/approvals/${workflowId}/action`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Permits
  getPermits: () => fetchJson<{ permits: RoadOpeningPermit[] }>('/permits'),
  getPermitDetails: (id: string) => fetchJson<{ permit: RoadOpeningPermit }>(`/permits/${id}`),
  generatePermit: (projectId: string, issuedBy?: string, issuedByDesignation?: string) =>
    fetchJson<{ success: boolean; permit: RoadOpeningPermit }>('/permits/generate', {
      method: 'POST',
      body: JSON.stringify({ projectId, issuedBy, issuedByDesignation }),
    }),
  validatePermitGps: (permitId: string, currentGps: { lat: number; lng: number }) =>
    fetchJson<{
      permitNumber: string;
      isValid: boolean;
      distanceToApprovedCorridorMeters: number;
      status: string;
    }>('/permits/validate-gps', {
      method: 'POST',
      body: JSON.stringify({ permitId, currentGps }),
    }),

  // Inspections
  getInspections: () => fetchJson<{ inspections: Inspection[] }>('/inspections'),
  submitInspection: (inspectionData: any) =>
    fetchJson<{ success: boolean; inspection: Inspection; aiFlags: any }>('/inspections', {
      method: 'POST',
      body: JSON.stringify(inspectionData),
    }),

  // Citizen Complaints
  getComplaints: () => fetchJson<{ complaints: CitizenComplaint[] }>('/complaints'),
  submitComplaint: (complaintData: any) =>
    fetchJson<{ success: boolean; complaint: CitizenComplaint }>('/complaints', {
      method: 'POST',
      body: JSON.stringify(complaintData),
    }),
  actOnComplaint: (
    id: string,
    actionData: {
      status?: 'OPEN' | 'UNDER_INVESTIGATION' | 'ACTION_TAKEN' | 'RESOLVED';
      assignedOfficer?: string;
      assignedOfficerDesignation?: string;
      actionTakenNotes?: string;
      mayorActionNotice?: string;
      actionBy?: string;
      actionByRole?: string;
    }
  ) =>
    fetchJson<{ success: boolean; complaint: CitizenComplaint }>(`/complaints/${id}/action`, {
      method: 'POST',
      body: JSON.stringify(actionData),
    }),

  // Analytics
  getAnalytics: () => fetchJson<{ summary: CityAnalyticsSummary }>('/analytics'),

  // Audit Logs & Notifications
  getAuditLogs: () => fetchJson<{ auditLogs: AuditLogItem[] }>('/audit-logs'),
  getNotifications: () => fetchJson<{ notifications: SystemNotification[] }>('/notifications'),
  markNotificationRead: (id: string) =>
    fetchJson<{ success: boolean }>(`/notifications/${id}/read`, { method: 'POST' }),

  // Settings
  getSettings: () => fetchJson<{ settings: SystemSettingsConfig }>('/settings'),
  updateSettings: (settings: SystemSettingsConfig) =>
    fetchJson<{ success: boolean; settings: SystemSettingsConfig }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Emergency
  requestEmergencyExcavation: (data: {
    roadId: string;
    department: string;
    emergencyReason: string;
    officerName: string;
    description: string;
  }) =>
    fetchJson<{ success: boolean; project: Project; permit: RoadOpeningPermit }>('/emergency/request', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Cities & Portals
  getCities: () =>
    fetchJson<{ cities: CityPortalConfig[]; activeCity: CityPortalConfig; activeCityId: string }>('/cities', undefined, true),
  getActiveCity: () =>
    fetchJson<{ city: CityPortalConfig }>('/cities/active', undefined, true),
  switchCity: (cityId: string) => {
    clearApiCache();
    return fetchJson<{ success: boolean; city: CityPortalConfig; activeCityId: string }>('/cities/switch', {
      method: 'POST',
      body: JSON.stringify({ cityId }),
    });
  },
  createCityPortal: (config: Partial<CityPortalConfig>) => {
    clearApiCache();
    return fetchJson<{ success: boolean; city: CityPortalConfig }>('/cities/create', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },
  connectWithCityCode: (data: CityConnectionRequest) => {
    clearApiCache();
    return fetchJson<{ success: boolean; city?: CityPortalConfig; user?: User; message: string }>('/cities/connect-with-code', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
