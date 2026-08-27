/**
 * MR. MAYOR - Express API Routes
 */

import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { analyzeProjectConflicts } from './conflictEngine.js';
import { runAICoordinationEngine } from './coordinationEngine.js';
import { generateAICoordinationPlan, analyzeInspectionPhotosWithAI } from './aiService.js';
import { validateGeofence } from './spatial.js';
import QRCode from 'qrcode';
import {
  User,
  Road,
  Project,
  CoordinationCluster,
  ApprovalWorkflow,
  ApprovalStep,
  RoadOpeningPermit,
  Inspection,
  RestorationRecord,
  RoadWorkHistoryItem,
  WorkProgressLog,
  CitizenComplaint,
  CityAnalyticsSummary,
  DepartmentName,
} from '../src/types/index.js';
import {
  NASHIK_ROAD_VC_BASELINES,
  NASHIK_JUNCTION_INTELLIGENCE,
  NASHIK_SIMHASTHA_PRIORITY_ROADS,
  NASHIK_SAFETY_LOCATIONS,
  NASHIK_SEASONAL_POLICY,
  NASHIK_ROAD_DEPENDENCY_GRAPH,
  NASHIK_ITMS_INFRASTRUCTURE,
  DEFAULT_COORDINATION_WEIGHTS,
  resolveRoadAuthority,
} from './nashikIntelligenceData.js';
import {
  generateOfficialInfrastructureAnalysis,
  authorizeAndFilterAnalysis,
} from './analysisGenerator.js';

export const apiRouter = Router();

// ==========================================
// 0. CITIES & MUNICIPAL PORTALS
// ==========================================
apiRouter.get('/cities', (req: Request, res: Response) => {
  res.json({
    cities: db.getCities(),
    activeCity: db.getActiveCity(),
    activeCityId: db.getActiveCityId(),
  });
});

apiRouter.get('/cities/active', (req: Request, res: Response) => {
  res.json({ city: db.getActiveCity() });
});

apiRouter.post('/cities/switch', (req: Request, res: Response) => {
  const { cityId } = req.body;
  const switched = db.switchCity(cityId);
  if (!switched) {
    return res.status(404).json({ error: `City with ID ${cityId} not found` });
  }
  res.json({ success: true, city: switched, activeCityId: db.getActiveCityId() });
});

apiRouter.post('/cities/create', (req: Request, res: Response) => {
  try {
    const newCity = db.createCityPortal(req.body);
    res.status(201).json({ success: true, city: newCity });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to initialize municipal city portal' });
  }
});

apiRouter.post('/cities/connect-with-code', (req: Request, res: Response) => {
  const result = db.connectWithCode(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.json(result);
});

// ==========================================
// 1. AUTH & USERS
// ==========================================
apiRouter.get('/auth/users', (req: Request, res: Response) => {
  res.json({ users: db.getUsers() });
});

apiRouter.post('/auth/users', (req: Request, res: Response) => {
  const userData: Partial<User> = req.body;
  if (!userData.name || !userData.role) {
    return res.status(400).json({ error: 'Officer Name and Role are required' });
  }

  const role = userData.role;
  let permissions = userData.permissions || [];
  if (!permissions.length) {
    switch (role) {
      case 'COMMISSIONER':
        permissions = [
          'project.view', 'project.approve', 'project.reject', 'coordination.view',
          'coordination.approve', 'permit.revoke', 'road.edit', 'analytics.view',
          'audit.view', 'users.manage'
        ];
        break;
      case 'NODAL_OFFICER':
      case 'ADMIN':
        permissions = [
          'project.view', 'project.edit', 'coordination.view', 'coordination.create',
          'coordination.approve', 'permit.create', 'permit.view', 'inspection.approve',
          'analytics.view', 'audit.view', 'road.edit'
        ];
        break;
      case 'EXECUTIVE_ENGINEER':
      case 'DEPT_HEAD':
        permissions = [
          'project.create', 'project.view', 'project.edit', 'project.submit',
          'coordination.view', 'coordination.approve', 'permit.view', 'road.view'
        ];
        break;
      case 'INSPECTOR':
        permissions = ['inspection.create', 'inspection.approve', 'project.view', 'permit.view', 'road.view'];
        break;
      case 'CONTRACTOR':
        permissions = ['project.view', 'permit.view', 'inspection.create'];
        break;
      case 'CITIZEN':
      default:
        permissions = ['project.view', 'road.view'];
        break;
    }
  }

  const newUser: User = {
    id: userData.id || `USR-${Date.now().toString().slice(-4)}`,
    name: userData.name,
    email: userData.email || `${userData.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@citycorp.gov.in`,
    role: userData.role,
    designation: userData.designation || `${userData.role} Officer`,
    department: userData.department || 'Smart City & Urban Planning',
    jurisdiction: userData.jurisdiction || 'Citywide',
    phone: userData.phone || '+91 98000 00000',
    empCode: userData.empCode || `NMC-${userData.role.slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
    cadre: userData.cadre || 'Gazetted Civil Services Cadre',
    status: userData.status || 'ACTIVE',
    securityClearance: userData.securityClearance || (userData.role === 'COMMISSIONER' || userData.role === 'NODAL_OFFICER' ? 'TOP_SECRET_MUNICIPAL' : 'GAZETTED_OFFICIAL'),
    twoFactorEnforced: userData.twoFactorEnforced !== undefined ? userData.twoFactorEnforced : true,
    tempPassword: userData.tempPassword || `Parichay#${Math.floor(100000 + Math.random() * 900000)}`,
    issuedAt: userData.issuedAt || new Date().toISOString(),
    issuedBy: userData.issuedBy || 'NMC IT Directorate (GovIAM)',
    documents: userData.documents || [
      {
        docType: 'Aadhaar / Government Photo ID',
        docNumber: `AADHAAR-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'NIC e-Pramaan Gateway',
        status: 'VERIFIED',
      },
      {
        docType: 'Gazette Appointment Order / Class-A License',
        docNumber: `GOV-MH-APPT-${Math.floor(10000 + Math.random() * 90000)}`,
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'Municipal Administration Dept',
        status: 'VERIFIED',
      },
    ],
    financialSanctionCeilingINR: userData.financialSanctionCeilingINR || (userData.role === 'COMMISSIONER' ? 500000000 : userData.role === 'EXECUTIVE_ENGINEER' ? 50000000 : 0),
    digitalSignatureId: userData.digitalSignatureId || `DSC-SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    policeClearanceRef: userData.policeClearanceRef || `POL-VET-${Math.floor(100000 + Math.random() * 900000)}`,
    permissions,
  };

  const savedUser = db.addUser(newUser);

  db.logAudit({
    userId: savedUser.id,
    userName: savedUser.name,
    role: savedUser.role,
    department: savedUser.department,
    action: 'AUTHORITY_REGISTERED',
    entity: 'User',
    entityId: savedUser.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Official Government Credential issued for ${savedUser.name} (${savedUser.designation} · ${savedUser.empCode}) with 2FA Enforced.`,
  });

  res.status(201).json({ success: true, user: savedUser });
});

apiRouter.post('/auth/users/:id/reset-password', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Authority user not found' });

  const newTempPassword = `Parichay#${Math.floor(100000 + Math.random() * 900000)}`;
  const updated = db.updateUser({ ...user, tempPassword: newTempPassword });

  db.logAudit({
    userId: user.id,
    userName: user.name,
    role: user.role,
    department: user.department,
    action: 'CREDENTIAL_RESET',
    entity: 'User',
    entityId: user.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Temporary One-Time Password re-issued for ${user.name} (${user.empCode || user.id})`,
  });

  res.json({ success: true, tempPassword: newTempPassword, user: updated });
});

apiRouter.post('/auth/users/:id/toggle-status', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Authority user not found' });

  const newStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
  const updated = db.updateUser({ ...user, status: newStatus });

  db.logAudit({
    userId: user.id,
    userName: user.name,
    role: user.role,
    department: user.department,
    action: newStatus === 'SUSPENDED' ? 'CREDENTIAL_REVOKED' : 'CREDENTIAL_RESTORED',
    entity: 'User',
    entityId: user.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `User access status changed to ${newStatus} for ${user.name}`,
  });

  res.json({ success: true, status: newStatus, user: updated });
});

apiRouter.put('/auth/users/:id', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Authority user not found' });

  const updated = db.updateUser({ ...user, ...req.body, id: user.id });
  res.json({ success: true, user: updated });
});

apiRouter.delete('/auth/users/:id', (req: Request, res: Response) => {
  const deleted = db.deleteUser(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Authority user not found' });
  res.json({ success: true });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, userId } = req.body;
  const user = userId ? db.getUserById(userId) : db.getUsers().find((u) => u.email === email || u.id === email);
  if (!user) {
    return res.status(404).json({ error: 'User not found in system directory' });
  }
  db.logAudit({
    userId: user.id,
    userName: user.name,
    role: user.role,
    department: user.department,
    action: 'USER_LOGIN',
    entity: 'User',
    entityId: user.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Session authenticated for ${user.designation}`,
  });
  res.json({ user, token: `jwt-sim-${user.id}-${Date.now()}` });
});

// ==========================================
// 2. ROADS & DIGITAL TWIN
// ==========================================
apiRouter.get('/roads', (req: Request, res: Response) => {
  res.json({ roads: db.getRoads() });
});

apiRouter.post('/roads', (req: Request, res: Response) => {
  const road: Road = req.body;
  if (!road.id) road.id = `RD-${Date.now().toString().slice(-4)}`;
  if (!road.code) road.code = `RD-COR-${Math.floor(100 + Math.random() * 900)}`;
  if (!road.protectionStatus) road.protectionStatus = 'NORMAL';
  if (!road.activeWorkCount) road.activeWorkCount = 0;
  if (!road.historicalExcavationsCount) road.historicalExcavationsCount = 0;
  
  db.updateRoad(road);
  db.logAudit({
    userId: 'USR-001',
    userName: 'Municipal Administrator',
    role: 'COMMISSIONER',
    department: 'Smart City & Urban Planning',
    action: 'ROAD_REGISTERED',
    entity: 'Road',
    entityId: road.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Road Corridor ${road.name} (${road.category}) registered manually in Municipal Digital Twin.`,
  });

  res.json({ success: true, road });
});

apiRouter.get('/roads/:id', (req: Request, res: Response) => {
  const road = db.getRoadById(req.params.id);
  if (!road) return res.status(404).json({ error: 'Road corridor not found' });
  
  const utilities = db.getAssets().filter((a) => a.roadId === road.id);
  const activeProjects = db.getProjects().filter((p) => p.roadId === road.id && p.status === 'IN_PROGRESS');
  const upcomingProjects = db.getProjects().filter((p) => p.roadId === road.id && p.status !== 'COMPLETED' && p.status !== 'IN_PROGRESS');
  const historicalProjects = db.getHistory().filter((h) => h.roadId === road.id);
  const complaints = db.getComplaints().filter((c) => c.roadId === road.id);

  res.json({
    road,
    utilities,
    activeProjects,
    upcomingProjects,
    historicalProjects,
    complaints,
  });
});

// ==========================================
// 3. INFRASTRUCTURE ASSETS
// ==========================================
apiRouter.get('/assets', (req: Request, res: Response) => {
  res.json({ assets: db.getAssets() });
});

apiRouter.post('/assets', (req: Request, res: Response) => {
  const asset = req.body;
  if (!asset.id) asset.id = `AST-${Date.now()}`;
  db.addAsset(asset);
  res.json({ success: true, asset });
});

// ==========================================
// 4. PROJECTS & SUBMISSIONS
// ==========================================
apiRouter.get('/projects', (req: Request, res: Response) => {
  res.json({ projects: db.getProjects() });
});

apiRouter.get('/projects/:id', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  
  const workflow = db.getWorkflowByProjectId(project.id);
  const conflicts = db.getConflicts().filter((c) => c.projectAId === project.id || c.projectBId === project.id);
  const cluster = project.clusterId ? db.getClusterById(project.clusterId) : undefined;
  const permit = project.permitId ? db.getPermitById(project.permitId) : undefined;
  const inspections = db.getInspections().filter((i) => i.projectId === project.id);

  res.json({
    project,
    workflow,
    conflicts,
    cluster,
    permit,
    inspections,
  });
});

apiRouter.post('/projects', async (req: Request, res: Response) => {
  const p: Project = req.body;
  if (!p.id) p.id = `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`;
  if (!p.code) p.code = `${(p.department || 'PWD').substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  p.submittedAt = new Date().toISOString();
  p.progressPercentage = 0;
  
  // Section 1 & 3: Strictly PROPOSED on submission (NO JOINT DIGGING DECISION BEFORE ANALYSIS)
  p.status = 'PROPOSED';
  p.aiAnalysisStatus = 'NOT_ANALYZED';
  p.jointPlanStatus = 'NOT_PROPOSED';
  p.activePlanVersion = 1;

  // Resolve road authority from road ownership metadata
  const road = db.getRoadById(p.roadId) || db.getRoads().find(r => r.name === p.roadName) || db.getRoads()[0];
  const roadAuth = resolveRoadAuthority(p.roadName || road?.name || '', road?.ownerAgency);
  p.responsibleRoadAuthority = roadAuth.agency;
  p.responsibleApproverRole = roadAuth.approverRole;
  p.responsibleApproverName = roadAuth.approverName;

  // Pre-Analysis Check Dataset Creation (Section 4)
  const existingActive = db.getProjects().filter(other => other.roadId === p.roadId && other.status === 'IN_PROGRESS');
  const plannedOnCorridor = db.getProjects().filter(other => other.roadId === p.roadId && other.id !== p.id);
  const daysSinceResurfaced = road?.daysSinceLastResurfaced || 120;
  
  p.preAnalysisCheck = {
    roadOwnership: roadAuth.agency as any,
    responsibleRoadAuthorityName: roadAuth.agency,
    responsibleRoadAuthorityRole: roadAuth.approverRole,
    responsibleApproverDesignation: roadAuth.approverDesignation,
    existingActiveProjectsCount: existingActive.length,
    plannedProjectsCount: plannedOnCorridor.length,
    recentRestorationsCount: daysSinceResurfaced <= 365 ? 1 : 0,
    reworkRisk: daysSinceResurfaced <= 90 ? 'CRITICAL' : daysSinceResurfaced <= 180 ? 'HIGH' : 'LOW',
    isMonsoonEmbargoActive: false,
    isSimhasthaCorridor: (p.roadName || '').toLowerCase().includes('gangapur') || (p.roadName || '').toLowerCase().includes('trimbak'),
    trafficSensitivity: road?.trafficClass === 'High' ? 'HIGH' : 'MODERATE',
    sensitiveJunctions: ['Canada Corner', 'Jehan Circle', 'Shalimar Junction'],
    earlyWarningAlerts: daysSinceResurfaced <= 180 ? [`Recent restoration (${daysSinceResurfaced} days ago) on ${p.roadName}. Rework risk alert active.`] : [],
  };

  // Initialize Workflow Stages (Section 61)
  p.workflowStages = [
    {
      stageId: 'STAGE-01-PROPOSED',
      stageName: 'Project Proposal Submitted',
      actorName: p.submittedBy || 'Department Officer',
      actorRole: 'ENGINEER',
      actorDepartment: p.department,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      comment: `Project proposal registered for ${p.department} along ${p.roadName}. Responsible Road Authority: ${roadAuth.agency} (${roadAuth.approverName}).`,
    },
    {
      stageId: 'STAGE-02-PRECHECK',
      stageName: 'Automatic Pre-Analysis Check',
      actorName: 'MR. MAYOR Intelligent Pre-Check Engine',
      actorRole: 'SYSTEM',
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      comment: `Verified road ownership (${roadAuth.agency}), ${plannedOnCorridor.length} corridor projects, rework risk: ${p.preAnalysisCheck.reworkRisk}.`,
    },
    {
      stageId: 'STAGE-03-AI-ANALYSIS',
      stageName: 'AI Corridor Lookahead Analysis',
      actorName: 'AI Infrastructure Coordination Engine',
      actorRole: 'SYSTEM',
      timestamp: '',
      status: 'PENDING',
      comment: 'Awaiting AI 90-day lookahead corridor multi-project analysis.',
    },
    {
      stageId: 'STAGE-04-TECH-REVIEW',
      stageName: 'Technical Engineering Review',
      actorName: roadAuth.approverName,
      actorRole: roadAuth.approverRole,
      actorDepartment: roadAuth.agency,
      timestamp: '',
      status: 'PENDING',
      comment: `Assigned to ${roadAuth.approverDesignation}.`,
    },
    {
      stageId: 'STAGE-05-HIGHER-APPROVAL',
      stageName: 'Higher Authority Review & Sanction',
      actorName: 'Dr. Pravin Gedam (IAS)',
      actorRole: 'COMMISSIONER',
      actorDepartment: 'Smart City & Urban Planning',
      timestamp: '',
      status: 'PENDING',
    },
    {
      stageId: 'STAGE-06-PERMIT',
      stageName: 'Digital Permit Issuance',
      actorName: 'Nodal Permitting Officer',
      actorRole: 'NODAL_OFFICER',
      timestamp: '',
      status: 'PENDING',
    },
    {
      stageId: 'STAGE-07-EXECUTION',
      stageName: 'Field Execution',
      actorName: p.proposedContractor || 'Assigned Contractor',
      actorRole: 'CONTRACTOR',
      timestamp: '',
      status: 'PENDING',
    },
    {
      stageId: 'STAGE-08-INSPECTION',
      stageName: 'Field QC & Compaction Inspection',
      actorName: 'Er. Kavita Jadhav',
      actorRole: 'INSPECTOR',
      timestamp: '',
      status: 'PENDING',
    },
    {
      stageId: 'STAGE-09-RESTORATION',
      stageName: 'Pavement Resurfacing & Restoration',
      actorName: 'PWD / NMC Road Restoration Division',
      actorRole: 'EXECUTIVE_ENGINEER',
      timestamp: '',
      status: 'PENDING',
    },
    {
      stageId: 'STAGE-10-CLOSURE',
      stageName: 'Restoration Verification & Pavement Protection',
      actorName: roadAuth.approverName,
      actorRole: roadAuth.approverRole,
      timestamp: '',
      status: 'PENDING',
    },
  ];

  db.saveProject(p);

  // Notify Responsible Technical Approver
  db.addNotification({
    id: `NOTIF-${Date.now()}`,
    targetRole: roadAuth.approverRole as any,
    title: `New Project Proposed: ${p.name}`,
    message: `${p.department} submitted a new excavation proposal on ${p.roadName}. Initial pre-check passed. AI Analysis ready to run.`,
    type: 'PROJECT',
    link: `/projects?id=${p.id}`,
    isRead: false,
    timestamp: new Date().toISOString(),
  });

  db.logAudit({
    userId: p.submittedBy || 'Authorized Officer',
    userName: p.submittedBy || 'Authorized Officer',
    role: 'ENGINEER',
    department: p.department,
    action: 'PROJECT_SUBMITTED',
    entity: 'Project',
    entityId: p.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Project ${p.code}: ${p.name} proposed on ${p.roadName}. Status: PROPOSED.`,
    reason: p.description,
  });

  res.status(201).json({ success: true, project: p });
});

// ==========================================
// 5. CONFLICTS & ANALYSIS
// ==========================================
apiRouter.get('/conflicts', (req: Request, res: Response) => {
  res.json({ conflicts: db.getConflicts() });
});

apiRouter.post('/conflicts/analyze', (req: Request, res: Response) => {
  const project: Project = req.body;
  const result = analyzeProjectConflicts(project, db.getProjects(), db.getRoads(), db.getAssets());
  res.json(result);
});

// ==========================================
// 6. COORDINATION CLUSTERS
// ==========================================
apiRouter.get('/coordination/clusters', (req: Request, res: Response) => {
  res.json({ clusters: db.getClusters() });
});

apiRouter.get('/coordination/clusters/:id', (req: Request, res: Response) => {
  const cluster = db.getClusterById(req.params.id);
  if (!cluster) return res.status(404).json({ error: 'Cluster not found' });
  res.json({ cluster });
});

apiRouter.post('/coordination/clusters/:id/approve', (req: Request, res: Response) => {
  const { department, officer, designation, notes } = req.body;
  const cluster = db.getClusterById(req.params.id);
  if (!cluster) return res.status(404).json({ error: 'Cluster not found' });

  cluster.departmentApprovals[department] = {
    approved: true,
    officer: officer || 'Authorized Signatory',
    designation: designation || 'Executive Engineer',
    timestamp: new Date().toISOString(),
    notes: notes || 'Coordination terms accepted.',
  };

  // Check if all involved departments have approved
  const involvedDepts = Array.from(new Set(cluster.projects.map((p) => p.department)));
  const allApproved = involvedDepts.every((dept) => cluster.departmentApprovals[dept]?.approved);

  if (allApproved) {
    cluster.status = 'ACCEPTED';
    cluster.projects.forEach((p) => {
      p.status = 'PENDING_APPROVAL';
      db.saveProject(p);
    });

    db.addNotification({
      id: `NOTIF-${Date.now()}`,
      targetRole: 'ALL',
      title: 'Coordination Cluster Fully Accepted',
      message: `All departments have signed agreement for ${cluster.name}. Ready for final authorization & permit generation.`,
      type: 'COORDINATION',
      link: '/coordination',
      isRead: false,
      timestamp: new Date().toISOString(),
    });
  }

  db.saveCluster(cluster);

  db.logAudit({
    userId: officer || 'System',
    userName: officer || 'Department Head',
    role: 'DEPT_HEAD',
    department,
    action: 'COORDINATION_AGREEMENT_SIGNED',
    entity: 'CoordinationCluster',
    entityId: cluster.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Approved by ${department} (${officer})`,
    reason: notes,
  });

  res.json({ success: true, cluster });
});

// ==========================================
// 6B. ADVANCED AI COORDINATION ENGINE (CORE INTELLIGENCE)
// ==========================================
apiRouter.post('/coordination/analyze', (req: Request, res: Response) => {
  const { projectId, proximityThresholdMeters, project: rawProject } = req.body;
  let target = rawProject as Project;
  if (projectId) {
    const found = db.getProjectById(projectId);
    if (found) target = found;
  }
  if (!target) {
    return res.status(400).json({ error: 'Project data or valid projectId required' });
  }

  const threshold = Number(proximityThresholdMeters) || 100;
  const result = runAICoordinationEngine(
    target,
    db.getProjects(),
    db.getRoads(),
    db.getAssets(),
    threshold
  );

  res.json(result);
});

apiRouter.post('/coordination/accept-plan', (req: Request, res: Response) => {
  const { projectId, planId, notes, officer, designation, department } = req.body;
  const target = db.getProjectById(projectId);
  if (!target) return res.status(404).json({ error: 'Project not found' });

  const analysis = runAICoordinationEngine(
    target,
    db.getProjects(),
    db.getRoads(),
    db.getAssets()
  );

  const chosenPlan =
    analysis.candidatePlans.find((p) => p.planId === planId) || analysis.selectedPlan;
  const clusterProjectIds = [target.id, ...analysis.relatedProjects.map((rp) => rp.id)];
  const clusterProjects = db.getProjects().filter((p) => clusterProjectIds.includes(p.id));

  const clusterId = target.clusterId || `CLUST-${Date.now()}`;
  const clusterCode = `CC-2026-${Math.floor(100 + Math.random() * 900)}`;

  const cluster: CoordinationCluster = {
    id: clusterId,
    clusterCode,
    name: `Multi-Agency Joint Dig: ${target.roadName}`,
    roadId: target.roadId,
    roadName: target.roadName,
    projectIds: clusterProjects.map((p) => p.id),
    projects: clusterProjects,
    recommendedWindowStart: chosenPlan.startDate,
    recommendedWindowEnd: chosenPlan.endDate,
    recommendedSequence: chosenPlan.sequenceSteps,
    excavationsAvoided: analysis.impactSummary.excavationsAvoided,
    restorationsAvoided: analysis.impactSummary.restorationsAvoided,
    estimatedCostSavedINR: chosenPlan.estimatedFinancialSavingINR,
    trafficDisruptionReductionPct: chosenPlan.trafficDisruptionReductionPct,
    aiConfidence: analysis.aiConfidencePct / 100,
    aiReasoning: analysis.reasoningFactors,
    status: 'ACCEPTED',
    departmentApprovals: {
      [department || target.department]: {
        approved: true,
        officer: officer || target.submittedBy || 'Authorized Officer',
        designation: designation || target.submittedByDesignation || 'Executive Engineer',
        timestamp: new Date().toISOString(),
        notes: notes || `Accepted ${chosenPlan.planName} for synchronized execution.`,
      },
    },
    createdAt: new Date().toISOString(),
  };

  db.saveCluster(cluster);

  clusterProjects.forEach((p) => {
    p.clusterId = cluster.id;
    p.status = 'PENDING_APPROVAL';
    db.saveProject(p);
  });

  db.logAudit({
    userId: officer || target.submittedBy,
    userName: officer || target.submittedBy,
    role: 'DEPT_HEAD',
    department: department || target.department,
    action: 'COORDINATION_PLAN_ACCEPTED',
    entity: 'CoordinationCluster',
    entityId: cluster.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Plan ${chosenPlan.planName} accepted. ${clusterProjects.length} projects synchronized.`,
    reason: notes || 'Officer accepted AI Infrastructure Coordination Plan.',
  });

  db.addNotification({
    id: `NOTIF-${Date.now()}`,
    targetRole: 'ALL',
    title: 'Coordinated Infrastructure Plan Activated',
    message: `${chosenPlan.planName} on ${target.roadName} has been approved for multi-agency execution.`,
    type: 'COORDINATION',
    link: '/coordination',
    isRead: false,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, cluster, analysis });
});

apiRouter.post('/coordination/reject-plan', (req: Request, res: Response) => {
  const { projectId, planId, reason, officer, designation, department } = req.body;
  const target = db.getProjectById(projectId);
  if (!target) return res.status(404).json({ error: 'Project not found' });

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'A valid statutory reason is required for rejection.' });
  }

  if (target.clusterId) {
    const cluster = db.getClusterById(target.clusterId);
    if (cluster) {
      if (!cluster.rejectionHistory) cluster.rejectionHistory = [];
      cluster.rejectionHistory.push({
        rejectedBy: officer || 'Official',
        designation: designation || 'Executive Engineer',
        department: department || target.department,
        reason,
        timestamp: new Date().toISOString(),
      });
      cluster.status = 'UNDER_REVIEW';
      db.saveCluster(cluster);
    }
  }

  db.logAudit({
    userId: officer || 'Officer',
    userName: officer || 'Officer',
    role: 'DEPT_HEAD',
    department: department || target.department,
    action: 'COORDINATION_PLAN_REJECTED',
    entity: 'Project',
    entityId: target.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Plan ${planId} rejected by officer.`,
    reason,
  });

  res.json({ success: true, message: 'Rejection reason recorded in municipal coordination dossier.' });
});

apiRouter.post('/coordination/modify-plan', (req: Request, res: Response) => {
  const { projectId, customStartDate, customEndDate, customSequence, notes, officer } = req.body;
  const target = db.getProjectById(projectId);
  if (!target) return res.status(404).json({ error: 'Project not found' });

  if (target.clusterId) {
    const cluster = db.getClusterById(target.clusterId);
    if (cluster) {
      if (customStartDate) cluster.recommendedWindowStart = customStartDate;
      if (customEndDate) cluster.recommendedWindowEnd = customEndDate;
      if (Array.isArray(customSequence) && customSequence.length > 0) {
        cluster.recommendedSequence = customSequence;
      }
      cluster.status = 'PROPOSED';
      db.saveCluster(cluster);
    }
  }

  db.logAudit({
    userId: officer || 'Officer',
    userName: officer || 'Officer',
    role: 'DEPT_HEAD',
    department: target.department,
    action: 'COORDINATION_PLAN_MODIFIED',
    entity: 'Project',
    entityId: target.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Custom dates: ${customStartDate} to ${customEndDate}`,
    reason: notes || 'Officer modified AI coordination parameters.',
  });

  res.json({ success: true, message: 'Coordinated execution schedule updated successfully.' });
});

// ==========================================
// 6B. INFRASTRUCTURE ANALYSIS CENTER & RBAC (SPEC SECTIONS 46 - 68)
// ==========================================

apiRouter.get('/analysis/:projectId', (req: Request, res: Response) => {
  const { projectId } = req.params;
  const project = db.getProjectById(projectId);
  if (!project) {
    return res.status(404).json({ error: 'ACCESS RESTRICTED: Project not found or inaccessible.' });
  }

  // Extract user from header or query for RBAC
  const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
  const user = userId ? db.getUserById(userId) : undefined;

  const fullReport = generateOfficialInfrastructureAnalysis(
    project,
    db.getProjects(),
    db.getRoads(),
    db.getAssets(),
    user
  );

  const authDecision = authorizeAndFilterAnalysis(fullReport, user, projectId);

  if (!authDecision.authorized || authDecision.accessLevel === 'DENIED') {
    return res.status(403).json({
      error: authDecision.error || 'ACCESS RESTRICTED: This information is available only to authorized personnel.',
    });
  }

  // Audit Logging (Section 63)
  if (user) {
    db.logAudit({
      userId: user.id,
      userName: user.name,
      role: user.role,
      department: user.department,
      action: 'INFRASTRUCTURE_ANALYSIS_VIEWED',
      entity: 'InfrastructureAnalysis',
      entityId: fullReport.analysisId,
      ipAddress: req.ip || '127.0.0.1',
      newValue: `Analysis ${fullReport.analysisId} viewed with ${authDecision.accessLevel} access scope.`,
      reason: 'User accessed Infrastructure Analysis Center.',
    });
  }

  res.json({
    success: true,
    accessLevel: authDecision.accessLevel,
    sensitivity: fullReport.sensitivity,
    report: authDecision.sanitizedPayload,
  });
});

apiRouter.post('/analysis/:projectId/generate-report', (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { reportType = 'INTERNAL_COORDINATION_REPORT', userId } = req.body;
  const project = db.getProjectById(projectId);
  if (!project) {
    return res.status(404).json({ error: 'ACCESS RESTRICTED: Project not found.' });
  }

  // Look up user by ID (or fallback to Commissioner for top-level authority preview)
  const user = userId ? db.getUserById(userId) : db.getUsers().find((u) => u.role === 'COMMISSIONER') || db.getUsers()[0];
  
  // Specific role restrictions based on report sensitivity
  if (reportType === 'INTERNAL_COORDINATION_REPORT') {
    if (user.role === 'CITIZEN') {
      return res.status(403).json({
        error: 'ACCESS RESTRICTED: The Full Municipal Strategic Analysis is restricted to authorized authorities (Mayor, Municipal Commissioner, Nodal Officer, Department Heads & Engineers). Citizens may generate the Public Project Status report.',
      });
    }
  }

  const fullReport = generateOfficialInfrastructureAnalysis(
    project,
    db.getProjects(),
    db.getRoads(),
    db.getAssets(),
    user
  );

  // Log report generation audit trail (Section 64)
  db.logAudit({
    userId: user.id,
    userName: user.name,
    role: user.role,
    department: user.department,
    action: 'MUNICIPAL_REPORT_GENERATED',
    entity: 'InfrastructureAnalysisReport',
    entityId: fullReport.analysisId,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Generated ${reportType || 'Internal Coordination Report'} (Ver ${fullReport.version}) for ${project.roadName}`,
    reason: `Official municipal export by ${user.name} (${user.designation})`,
  });

  res.json({
    success: true,
    reportType: reportType || 'INTERNAL_COORDINATION_REPORT',
    analysisId: fullReport.analysisId,
    version: fullReport.version,
    generatedAt: new Date().toISOString(),
    generatedBy: `${user.name} (${user.designation})`,
    report: fullReport,
  });
});

apiRouter.get('/coordination/nashik-intelligence', (req: Request, res: Response) => {
  res.json({
    vcBaselines: NASHIK_ROAD_VC_BASELINES,
    junctionIntelligence: NASHIK_JUNCTION_INTELLIGENCE,
    simhasthaPriorityRoads: NASHIK_SIMHASTHA_PRIORITY_ROADS,
    safetyLocations: NASHIK_SAFETY_LOCATIONS,
    seasonalPolicy: NASHIK_SEASONAL_POLICY,
    roadDependencies: NASHIK_ROAD_DEPENDENCY_GRAPH,
    itmsInfrastructure: NASHIK_ITMS_INFRASTRUCTURE,
    defaultWeights: DEFAULT_COORDINATION_WEIGHTS,
  });
});

apiRouter.get('/coordination/test-cases', (req: Request, res: Response) => {
  const allProjects = db.getProjects();
  const allRoads = db.getRoads();
  const allAssets = db.getAssets();

  // Test 1: Water + Drainage + Telecom on Gangapur Road, overlapping windows -> HIGH COORDINATION OPPORTUNITY
  const test1Target = allProjects.find((p) => p.id === 'PRJ-104') || allProjects[0];
  const test1Result = runAICoordinationEngine(test1Target, allProjects, allRoads, allAssets, 100);

  // Test 2: College Road work during 17:45-18:45 -> HIGH TRAFFIC WARNING
  const test2Target = allProjects.find((p) => p.roadName.toLowerCase().includes('college')) || allProjects[1];
  const test2Result = runAICoordinationEngine(test2Target, allProjects, allRoads, allAssets, 100);

  // Test 3: Trimbak Road, historical V/C 0.76 -> HIGH HISTORICAL TRAFFIC PRESSURE
  const test3Target = allProjects.find((p) => p.roadName.toLowerCase().includes('trimbak')) || allProjects[2];
  const test3Result = runAICoordinationEngine(test3Target, allProjects, allRoads, allAssets, 100);

  // Test 4: Recently restored road (age <= 30 days) -> HIGH/CRITICAL REWORK RISK
  const baseRoad = allRoads.find((r) => r.name.toLowerCase().includes('untwadi') || r.id === 'RD-NSK-10') || allRoads[0];
  const test4Road: Road = {
    ...baseRoad,
    id: 'RD-NSK-FRESH-01',
    name: 'Untwadi Ring Road (Recently Restored Segment)',
    lastResurfacedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    protectionStatus: 'PROTECTED',
  };
  const test4MockProject: Project = {
    id: 'TEST-PRJ-REWORK',
    code: 'TEST-04',
    name: 'Urgent Valve Relocation on Freshly Restored Untwadi Ring Road',
    department: 'Water & Sewerage',
    projectType: 'Distribution Valve Replacement',
    description: 'Proposed excavation on road resurfaced 25 days ago.',
    roadId: test4Road.id,
    roadName: test4Road.name,
    geometry: test4Road.geometry,
    startCoordinates: test4Road.geometry[0],
    endCoordinates: test4Road.geometry[test4Road.geometry.length - 1],
    lengthMeters: 400,
    requiredStartDate: '2026-08-28T00:00:00.000Z',
    requiredCompletionDate: '2026-09-10T00:00:00.000Z',
    expectedExcavationDurationDays: 13,
    excavationWidthMeters: 1.2,
    excavationDepthMeters: 1.8,
    affectedAreaSqMeters: 480,
    estimatedCostINR: 1200000,
    estimatedExcavationCostINR: 200000,
    estimatedRestorationCostINR: 400000,
    trafficImpact: 'High',
    priority: 'Planned',
    isEmergency: false,
    contractorId: 'CTR-NSK-01',
    contractorName: 'Patil Infra',
    status: 'SUBMITTED',
    documents: [],
    submittedBy: 'Er. Sanjay Shinde',
    submittedByDesignation: 'Executive Engineer',
    submittedAt: new Date().toISOString(),
    progressPercentage: 0,
    currentWorkPhase: 'Planning',
  };
  const test4Result = runAICoordinationEngine(test4MockProject, allProjects, [test4Road, ...allRoads], allAssets, 100);

  // Test 5: Priority event road with incomplete utilities -> CRITICAL COORDINATION ALERT
  const test5Road = allRoads.find((r) => r.name.toLowerCase().includes('ambad midc') || r.id === 'RD-NSK-09') || allRoads[0];
  const test5MockProject: Project = {
    id: 'TEST-PRJ-SIMHASTHA',
    code: 'TEST-05',
    name: 'Kumbh Transit Fiber Trunk Installation (Ambad MIDC Parikrama Marg)',
    department: 'Telecom & Digital',
    projectType: 'High-Density 96-Core Fiber Trunk',
    description: 'Underground telecom conduit before 6-lane Simhastha Parikrama Marg final bituminous surfacing.',
    roadId: test5Road.id,
    roadName: test5Road.name,
    geometry: test5Road.geometry,
    startCoordinates: test5Road.geometry[0],
    endCoordinates: test5Road.geometry[test5Road.geometry.length - 1],
    lengthMeters: 1200,
    requiredStartDate: '2026-09-01T00:00:00.000Z',
    requiredCompletionDate: '2026-10-15T00:00:00.000Z',
    expectedExcavationDurationDays: 45,
    excavationWidthMeters: 0.6,
    excavationDepthMeters: 1.0,
    affectedAreaSqMeters: 720,
    estimatedCostINR: 4500000,
    estimatedExcavationCostINR: 350000,
    estimatedRestorationCostINR: 650000,
    trafficImpact: 'High',
    priority: 'High Priority',
    isEmergency: false,
    contractorId: 'CTR-NSK-03',
    contractorName: 'HFCL',
    status: 'SUBMITTED',
    documents: [],
    submittedBy: 'Er. Priya Sharma',
    submittedByDesignation: 'Chief Telecom Officer',
    submittedAt: new Date().toISOString(),
    progressPercentage: 0,
    currentWorkPhase: 'Planning',
  };
  const test5Result = runAICoordinationEngine(test5MockProject, allProjects, allRoads, allAssets, 100);

  res.json({
    testCases: [
      {
        testNumber: 1,
        testName: 'Water + Drainage + Telecom on Gangapur Road',
        inputDescription: 'PRJ-104 (Water), PRJ-105 (Drainage), PRJ-106 (Telecom) on Gangapur Road with overlapping windows',
        expectedOutcome: 'HIGH COORDINATION OPPORTUNITY',
        actualPriority: test1Result.coordinationPriority,
        actualConflictType: test1Result.conflictType,
        overallScore: test1Result.overallScore,
        excavationsAvoided: test1Result.impactSummary.excavationsAvoided,
        restorationsAvoided: test1Result.impactSummary.restorationsAvoided,
        financialSavedLakhs: (test1Result.impactSummary.estimatedCostSavedINR / 100000).toFixed(1),
        result: test1Result,
      },
      {
        testNumber: 2,
        testName: 'College Road work during Canada Corner peak',
        inputDescription: 'College Road commercial corridor work overlapping Canada Corner 17:45-18:45 peak',
        expectedOutcome: 'HIGH TRAFFIC WARNING',
        trafficWarning: test2Result.nashikIntelligence.sensitiveJunctions.find((j) => j.junctionId === 'NHK-J-CANA')?.overlapWarning || 'HIGH TRAFFIC WARNING: Work overlaps Canada Corner 17:45-18:45 peak.',
        peakWindow: '17:45–18:45',
        peakHourPCU: 2454,
        result: test2Result,
      },
      {
        testNumber: 3,
        testName: 'Trimbak Road historical V/C evaluation',
        inputDescription: 'Trimbak Road industrial corridor, CTTP 2016 historical V/C 0.76',
        expectedOutcome: 'HIGH HISTORICAL TRAFFIC PRESSURE',
        historicalVC: test3Result.nashikIntelligence.historicalVC,
        vcCategory: test3Result.nashikIntelligence.vcCategory,
        trafficPressureScore: test3Result.nashikIntelligence.trafficPressureScore,
        sourceDocument: test3Result.nashikIntelligence.sourceDocument,
        result: test3Result,
      },
      {
        testNumber: 4,
        testName: 'Recently restored road (age <= 30 days)',
        inputDescription: 'Road resurfaced <= 30 days ago, testing rework prevention logic',
        expectedOutcome: 'HIGH/CRITICAL REWORK RISK',
        reworkRiskLevel: test4Result.nashikIntelligence.reworkRiskLevel,
        daysSinceRestored: test4Result.nashikIntelligence.daysSinceLastRestored,
        reworkAdvisory: test4Result.nashikIntelligence.reworkAdvisory,
        result: test4Result,
      },
      {
        testNumber: 5,
        testName: 'Simhastha Kumbh 2027 Priority Road with Incomplete Utilities',
        inputDescription: 'Ambad MIDC Parikrama Marg (Phase 1 Kumbh Priority Road)',
        expectedOutcome: 'CRITICAL COORDINATION ALERT',
        isSimhasthaPriorityRoad: test5Result.nashikIntelligence.isSimhasthaPriorityRoad,
        simhasthaPhase: test5Result.nashikIntelligence.simhasthaPhase,
        coordinationPriority: test5Result.coordinationPriority,
        result: test5Result,
      },
    ],
  });
});

// ==========================================
// 7. AI INFRASTRUCTURE COORDINATOR & INSPECTIONS
// ==========================================
apiRouter.post('/ai/analyze-coordination', async (req: Request, res: Response) => {
  const { roadId, projectIds } = req.body;
  const road = db.getRoadById(roadId) || db.getRoads()[0];
  const pIds = Array.isArray(projectIds) ? projectIds : [];
  const projects = db.getProjects().filter((p) => pIds.includes(p.id));
  const assets = db.getAssets().filter((a) => a.roadId === road.id);

  const plan = await generateAICoordinationPlan(road, projects, assets);
  res.json(plan);
});

apiRouter.post('/ai/inspect-photos', async (req: Request, res: Response) => {
  const { photoType, notes, roadName } = req.body;
  const result = await analyzeInspectionPhotosWithAI(photoType, notes || 'Site inspection review', roadName || 'City Road');
  res.json(result);
});

apiRouter.post('/ai/predict-future-work', async (req: Request, res: Response) => {
  const { roadId } = req.body;
  const road = db.getRoadById(roadId) || db.getRoads()[0];
  const history = db.getHistory().filter((h) => h.roadId === road.id);
  const assets = db.getAssets().filter((a) => a.roadId === road.id);

  res.json({
    roadName: road.name,
    recommendation: `Proactive Coordination Alert: ${road.name} is scheduled for periodic resurfacing in ~45 days. Water Supply pipeline feeder (${assets[0]?.capacityOrDiameter || 'DI Main'}) is 8+ years old. Recommend executing pipeline joints replacement BEFORE applying fresh asphalt wearing course to prevent post-surfacing cuts.`,
    potentialSavingsINR: 3200000,
    confidence: 0.91,
  });
});

// ==========================================
// 8. APPROVAL WORKFLOWS
// ==========================================
apiRouter.get('/approvals', (req: Request, res: Response) => {
  res.json({ workflows: db.getWorkflows() });
});

apiRouter.post('/approvals/:id/action', (req: Request, res: Response) => {
  const { action, approverName, designation, remarks, overrideAI, overrideReason } = req.body;
  const workflow = db.getWorkflows().find((w) => w.id === req.params.id);
  if (!workflow) return res.status(404).json({ error: 'Approval workflow not found' });

  const currentStep = workflow.steps[workflow.currentStepIndex];
  if (!currentStep) return res.status(400).json({ error: 'No active step in workflow' });

  currentStep.status = action; // 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'
  currentStep.approverName = approverName;
  currentStep.approverDesignation = designation;
  currentStep.actionDate = new Date().toISOString();
  currentStep.remarks = remarks;
  currentStep.overrideAI = overrideAI;
  currentStep.overrideReason = overrideReason;

  if (action === 'APPROVED') {
    if (workflow.currentStepIndex < workflow.steps.length - 1) {
      workflow.currentStepIndex += 1;
    } else {
      // Complete all approvals -> generate permit!
      workflow.overallStatus = 'APPROVED';
      const project = db.getProjectById(workflow.projectId);
      if (project) {
        project.status = 'APPROVED';
        db.saveProject(project);
      }
    }
  } else if (action === 'REJECTED') {
    workflow.overallStatus = 'REJECTED';
    const project = db.getProjectById(workflow.projectId);
    if (project) {
      project.status = 'REJECTED';
      db.saveProject(project);
    }
  }

  workflow.updatedAt = new Date().toISOString();
  db.saveWorkflow(workflow);

  db.logAudit({
    userId: approverName || 'Officer',
    userName: approverName || 'Approver',
    role: designation || 'Approving Authority',
    department: workflow.department,
    action: `WORKFLOW_STEP_${action}`,
    entity: 'ApprovalWorkflow',
    entityId: workflow.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Step ${currentStep.stepName}: ${action}`,
    reason: overrideAI ? `[AI OVERRIDE]: ${overrideReason} | ${remarks}` : remarks,
  });

  res.json({ success: true, workflow });
});

// ==========================================
// 9. DIGITAL ROAD OPENING PERMITS (ROP)
// ==========================================
apiRouter.get('/permits', (req: Request, res: Response) => {
  res.json({ permits: db.getPermits() });
});

apiRouter.get('/permits/:id', (req: Request, res: Response) => {
  const permit = db.getPermitById(req.params.id);
  if (!permit) return res.status(404).json({ error: 'Permit not found' });
  res.json({ permit });
});

apiRouter.post('/permits/generate', async (req: Request, res: Response) => {
  const { projectId, issuedBy, issuedByDesignation } = req.body;
  const project = db.getProjectById(projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const permitNum = `ROP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const permitId = `PERMIT-${permitNum}`;

  // Generate live digital QR code payload
  const qrPayload = JSON.stringify({
    permitNumber: permitNum,
    projectCode: project.code,
    department: project.department,
    road: project.roadName,
    validUntil: project.requiredCompletionDate,
    authorizedBy: issuedBy || 'Municipal Authority',
    verificationUrl: `https://mr-mayor.gov.in/verify/${permitNum}`,
  });

  const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
    margin: 1,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });

  const permit: RoadOpeningPermit = {
    id: permitId,
    permitNumber: permitNum,
    projectId: project.id,
    projectName: project.name,
    clusterId: project.clusterId,
    department: project.department,
    roadId: project.roadId,
    roadName: project.roadName,
    contractorName: project.contractorName || 'M/s InfraTech Constr.',
    contractorContact: '+91 98230 11009',
    approvedGeometry: project.geometry,
    validFrom: project.requiredStartDate,
    validTo: project.requiredCompletionDate,
    excavationDimensions: {
      lengthMeters: project.lengthMeters,
      widthMeters: project.excavationWidthMeters,
      depthMeters: project.excavationDepthMeters,
      totalAreaSqM: project.affectedAreaSqMeters,
    },
    trafficConditions: [
      'Maintain pedestrian walkway and safety bridge across open trench.',
      'Night blinking safety beacons and retro-reflective barricades mandatory.',
      'Peak hour excavation halted between 08:30-11:00 and 17:30-20:30 hrs.',
    ],
    safetyGuidelines: [
      'Trench shoring required for excavation depth exceeding 1.5 meters.',
      'Keep heavy machinery clear of existing utility markers.',
      'Daily site clearance of excavated mud and debris.',
    ],
    restorationDeadline: project.requiredCompletionDate,
    securityDepositINR: Math.round(project.estimatedRestorationCostINR * 1.1),
    qrCodeDataUrl,
    status: 'ISSUED',
    issuedBy: issuedBy || 'Er. Rajesh Kulkarni',
    issuedByDesignation: issuedByDesignation || 'Chief City Nodal Officer',
    issuedAt: new Date().toISOString(),
  };

  db.savePermit(permit);
  project.permitId = permit.id;
  project.status = 'PERMITTED';
  db.saveProject(project);

  db.logAudit({
    userId: issuedBy || 'System',
    userName: issuedBy || 'Authorized Officer',
    role: 'NODAL_OFFICER',
    department: project.department,
    action: 'ROAD_OPENING_PERMIT_ISSUED',
    entity: 'RoadOpeningPermit',
    entityId: permit.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Permit ${permit.permitNumber} issued for ${project.name}`,
    reason: 'Formal approval workflow completed.',
  });

  res.json({ success: true, permit });
});

apiRouter.post('/permits/validate-gps', (req: Request, res: Response) => {
  const { permitId, currentGps } = req.body;
  const permit = db.getPermitById(permitId);
  if (!permit) return res.status(404).json({ error: 'Permit not found' });

  const validation = validateGeofence(currentGps, permit.approvedGeometry, 60);
  res.json({
    permitNumber: permit.permitNumber,
    isValid: validation.isValid,
    distanceToApprovedCorridorMeters: validation.distanceToApprovedRouteMeters,
    status: validation.isValid ? 'WITHIN_APPROVED_GEOFENCE' : 'GEOLOCATION_MISMATCH_WARNING',
  });
});

// ==========================================
// 10. CONTRACTOR EXECUTION & PROGRESS
// ==========================================
apiRouter.post('/projects/:id/start', (req: Request, res: Response) => {
  const { contractorGps, contractorName } = req.body;
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const permit = project.permitId ? db.getPermitById(project.permitId) : undefined;
  if (permit && contractorGps) {
    const geo = validateGeofence(contractorGps, permit.approvedGeometry, 75);
    if (!geo.isValid) {
      return res.status(400).json({
        error: `GPS Mismatch: Current location is ${geo.distanceToApprovedRouteMeters}m away from the permitted corridor. Excavation outside permitted boundary is prohibited.`,
      });
    }
  }

  project.status = 'IN_PROGRESS';
  project.progressPercentage = 10;
  project.currentWorkPhase = 'Site Barricading & Trench Excavation';
  db.saveProject(project);

  if (permit) {
    permit.status = 'ACTIVE';
    db.savePermit(permit);
  }

  // Update Road Active Work Count
  const road = db.getRoadById(project.roadId);
  if (road) {
    road.activeWorkCount += 1;
    db.updateRoad(road);
  }

  db.logAudit({
    userId: contractorName || 'Contractor',
    userName: contractorName || project.contractorName || 'Contractor',
    role: 'CONTRACTOR',
    department: project.department,
    action: 'WORK_COMMENCED',
    entity: 'Project',
    entityId: project.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Status changed to IN_PROGRESS. Progress: 10%`,
  });

  res.json({ success: true, project });
});

apiRouter.post('/projects/:id/progress', (req: Request, res: Response) => {
  const {
    progressPercentage,
    currentWorkPhase,
    notes,
    workDoneComment,
    metersCompleted,
    laborCount,
    equipmentOnSite,
    siteCondition,
    photoUrls,
    loggedBy,
  } = req.body;
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const pct = typeof progressPercentage === 'number' ? progressPercentage : project.progressPercentage;
  const phase = currentWorkPhase || project.currentWorkPhase || 'Work Execution';
  const comment = workDoneComment || notes || 'Daily field progress update submitted by contractor.';
  const author = loggedBy || project.contractorName || 'Contractor Field Lead';

  const progressLog: WorkProgressLog = {
    id: `WLOG-${Date.now()}`,
    projectId: project.id,
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    progressPercentage: pct,
    currentWorkPhase: phase,
    workDoneComment: comment,
    metersCompleted: metersCompleted ? Number(metersCompleted) : undefined,
    laborCount: laborCount ? Number(laborCount) : undefined,
    equipmentOnSite: equipmentOnSite || undefined,
    siteCondition: siteCondition || undefined,
    photoUrls: photoUrls || [],
    loggedBy: author,
    loggedByRole: 'CONTRACTOR',
  };

  db.addProgressLog(project.id, progressLog);

  if (pct >= 100) {
    project.status = 'WORK_COMPLETED';
    db.saveProject(project);
  }

  // Create notification for Municipal Engineers & Commissioner
  db.addNotification({
    id: `NOTIF-${Date.now()}`,
    targetRole: 'ALL',
    title: `Work Progress Logged: ${project.code}`,
    message: `${author} updated ${project.name} to ${pct}% completion (${phase}): "${comment.slice(0, 80)}..."`,
    type: 'EXTENSION',
    link: '/projects',
    isRead: false,
    timestamp: new Date().toISOString(),
  });

  db.logAudit({
    userId: author,
    userName: author,
    role: 'CONTRACTOR',
    department: project.department,
    action: 'WORK_PROGRESS_LOGGED',
    entity: 'Project',
    entityId: project.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Progress: ${pct}% | Phase: ${phase} | Comment: ${comment}`,
    reason: 'Contractor Measurement & Daily Progress update',
  });

  res.json({ success: true, project: db.getProjectById(req.params.id), progressLog });
});

apiRouter.get('/projects/:id/progress-logs', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json({ progressLogs: project.progressLogs || [] });
});

// ==========================================
// 11. INSPECTION & RESTORATION MODULE
// ==========================================
apiRouter.get('/inspections', (req: Request, res: Response) => {
  res.json({ inspections: db.getInspections() });
});

apiRouter.post('/inspections', async (req: Request, res: Response) => {
  const { projectId, permitId, inspectionType, inspectorId, inspectorName, inspectorDesignation, result, remarks, photos } = req.body;
  const project = db.getProjectById(projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  // AI Quality Inspection Analysis
  const aiFlags = await analyzeInspectionPhotosWithAI(inspectionType, remarks || 'Physical site inspection', project.roadName);

  const inspection: Inspection = {
    id: `INSP-${Date.now()}`,
    projectId,
    projectName: project.name,
    permitId: permitId || project.permitId || 'PERMIT-GEN',
    permitNumber: permitId || 'ROP-2026-0038',
    inspectionType: inspectionType || 'RESTORATION_QC',
    inspectorId: inspectorId || 'USR-008',
    inspectorName: inspectorName || 'Er. Sachin More',
    inspectorDesignation: inspectorDesignation || 'Senior Quality Inspector',
    result: result || 'PASS',
    remarks: remarks || 'Site inspected. Trench properly backfilled and leveled.',
    aiFlags: aiFlags.flags,
    photos: photos || [],
    inspectedAt: new Date().toISOString(),
  };

  db.saveInspection(inspection);

  if (result === 'PASS' && (inspectionType === 'RESTORATION_QC' || inspectionType === 'FINAL_CLEARANCE')) {
    project.status = 'COMPLETED';
    project.progressPercentage = 100;
    db.saveProject(project);

    // Update Road Protection & History
    const road = db.getRoadById(project.roadId);
    if (road) {
      road.activeWorkCount = Math.max(0, road.activeWorkCount - 1);
      road.historicalExcavationsCount += 1;
      road.lastResurfacedDate = new Date().toISOString().split('T')[0];
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 180);
      road.protectionExpiryDate = expiry.toISOString().split('T')[0];
      road.protectionStatus = 'PROTECTED';
      db.updateRoad(road);

      // Add to digital road work history
      const historyItem: RoadWorkHistoryItem = {
        id: `HIST-${Date.now()}`,
        roadId: road.id,
        roadName: road.name,
        date: new Date().toISOString().split('T')[0],
        projectId: project.id,
        projectName: project.name,
        department: project.department,
        infrastructureType: project.projectType,
        excavationDurationDays: project.expectedExcavationDurationDays,
        completionDate: new Date().toISOString().split('T')[0],
        restorationDate: new Date().toISOString().split('T')[0],
        inspectionResult: `PASS (Inspector: ${inspectorName})`,
        contractor: project.contractorName || 'M/s InfraTech Constr.',
        documentsCount: project.documents.length,
      };
      db.addHistoryItem(historyItem);
    }
  }

  db.logAudit({
    userId: inspectorId || 'Inspector',
    userName: inspectorName || 'Quality Inspector',
    role: 'INSPECTOR',
    department: project.department,
    action: `INSPECTION_${result}`,
    entity: 'Inspection',
    entityId: inspection.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Result: ${result}. Project: ${project.name}`,
    reason: remarks,
  });

  res.json({ success: true, inspection, aiFlags });
});

apiRouter.post('/inspections/request', (req: Request, res: Response) => {
  const { projectId, stage, contractorNotes } = req.body;
  const project = db.getProjectById(projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // Create notification for Municipal Quality cell & Mayor
  db.addNotification({
    id: `NOTIF-${Date.now()}`,
    targetRole: 'COMMISSIONER',
    targetUserId: 'USR-001',
    title: `Inspection Requested: ${project.name}`,
    message: contractorNotes || `Contractor requested formal QC inspection at stage: ${stage}`,
    type: 'INSPECTION',
    timestamp: new Date().toISOString(),
    isRead: false,
    link: `/projects`,
  });

  db.logAudit({
    userId: project.contractorName || 'Contractor',
    userName: project.contractorName || 'Contractor Agency',
    role: 'CONTRACTOR',
    department: project.department,
    action: 'INSPECTION_REQUESTED',
    entity: 'Project',
    entityId: project.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Stage: ${stage}. Progress: ${project.progressPercentage}%`,
    reason: contractorNotes,
  });

  res.json({ success: true, message: 'Inspection request routed to Municipal Quality Cell.' });
});

// ==========================================
// 12. CITIZEN PORTAL & COMPLAINTS
// ==========================================
apiRouter.get('/complaints', (req: Request, res: Response) => {
  res.json({ complaints: db.getComplaints() });
});

apiRouter.post('/complaints', (req: Request, res: Response) => {
  const { roadId, roadName, category, complaintType, description, photoUrl, location, citizenName, citizenPhone, priority } = req.body;
  const complaintNum = `CMP-2026-${Math.floor(100 + Math.random() * 900)}`;

  // Automatically find active project on road
  const activeProj = db.getProjects().find((p) => p.roadId === roadId || p.status === 'IN_PROGRESS');

  const resolvedCategory = category || 'UNAUTHORIZED_EXCAVATION';
  const assignedPriority = priority || (resolvedCategory === 'MISSING_BARRICADES_HAZARD' || resolvedCategory === 'UNAUTHORIZED_EXCAVATION' ? 'CRITICAL_HAZARD' : 'HIGH');

  const complaint: CitizenComplaint = {
    id: complaintNum,
    complaintNumber: complaintNum,
    roadId: roadId || 'RD-001',
    roadName: roadName || 'Gangapur Road Corridor',
    category: resolvedCategory,
    complaintType: complaintType || (resolvedCategory ? resolvedCategory.replace(/_/g, ' ') : 'General Road Grievance'),
    description: description || 'Citizen reported municipal grievance.',
    photoUrl,
    location: location || { lat: 19.9985, lng: 73.765 },
    status: 'OPEN',
    priority: assignedPriority,
    linkedProjectId: activeProj?.id,
    linkedDepartment: activeProj?.department || 'Roads / PWD',
    linkedContractor: activeProj?.contractorName || 'M/s InfraTech Constr.',
    citizenName: citizenName || 'Concerned Citizen',
    citizenPhone: citizenPhone || '+91 98230 00000',
    reportedAt: new Date().toISOString(),
  };

  db.saveComplaint(complaint);

  db.addNotification({
    id: `NOTIF-${Date.now()}`,
    targetRole: 'ALL',
    title: `Citizen Grievance Logged: ${complaint.complaintNumber}`,
    message: `${(complaint.category || complaint.complaintType || 'Grievance').replace(/_/g, ' ')} on ${complaint.roadName}. Priority: ${assignedPriority}. Escalated to Mayor / Nodal Authority.`,
    type: 'COMPLAINT',
    link: '/complaints',
    isRead: false,
    timestamp: new Date().toISOString(),
  });

  db.logAudit({
    userId: citizenPhone || 'Citizen',
    userName: citizenName || 'Citizen',
    role: 'CITIZEN',
    department: complaint.linkedDepartment,
    action: 'COMPLAINT_FILED',
    entity: 'CitizenComplaint',
    entityId: complaint.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Complaint ${complaint.complaintNumber} filed for ${complaint.roadName}: ${complaint.description}`,
    reason: 'Public grievance submission',
  });

  res.json({ success: true, complaint });
});

apiRouter.post('/complaints/:id/action', (req: Request, res: Response) => {
  const { status, assignedOfficer, assignedOfficerDesignation, actionTakenNotes, mayorActionNotice, actionBy, actionByRole } = req.body;
  const complaint = db.getComplaintById(req.params.id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  if (status) complaint.status = status;
  if (assignedOfficer) complaint.assignedOfficer = assignedOfficer;
  if (assignedOfficerDesignation) complaint.assignedOfficerDesignation = assignedOfficerDesignation;
  if (actionTakenNotes) complaint.actionTakenNotes = actionTakenNotes;
  if (mayorActionNotice) complaint.mayorActionNotice = mayorActionNotice;
  if (status === 'RESOLVED') {
    complaint.resolvedAt = new Date().toISOString();
  }

  db.saveComplaint(complaint);

  const actor = actionBy || 'Municipal Commissioner / Mayor';
  const role = actionByRole || 'COMMISSIONER';

  db.logAudit({
    userId: actor,
    userName: actor,
    role: role as any,
    department: complaint.linkedDepartment,
    action: `COMPLAINT_STATUS_${complaint.status}`,
    entity: 'CitizenComplaint',
    entityId: complaint.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Status: ${complaint.status} | Officer: ${complaint.assignedOfficer || 'N/A'} | Notice: ${mayorActionNotice || actionTakenNotes || 'Updated'}`,
    reason: 'Executive Grievance Redressal Action',
  });

  db.addNotification({
    id: `NOTIF-${Date.now()}`,
    targetRole: 'ALL',
    title: `Grievance Action: ${complaint.complaintNumber}`,
    message: `${actor} marked grievance on ${complaint.roadName} as ${complaint.status}. ${mayorActionNotice ? `Notice: "${mayorActionNotice}"` : ''}`,
    type: 'COMPLAINT',
    link: '/complaints',
    isRead: false,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, complaint });
});

// ==========================================
// 13. CITY COMMAND CENTER & ANALYTICS
// ==========================================
apiRouter.get('/analytics', (req: Request, res: Response) => {
  const projects = db.getProjects();
  const clusters = db.getClusters();
  const complaints = db.getComplaints();
  const roads = db.getRoads();
  const workflows = db.getWorkflows();

  const activeProjects = projects.filter((p) => p.status === 'IN_PROGRESS');
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED');
  
  // Verified outcomes: ONLY calculated from projects that have actually completed in coordinated mode
  const verifiedCoordinatedProjects = completedProjects.filter((p) => clusters.some((c) => c.projectIds.includes(p.id)));
  const verifiedSavingsINR = verifiedCoordinatedProjects.reduce((acc, p) => acc + (p.estimatedCostINR * 0.15), 0);
  const verifiedExcavationsAvoided = verifiedCoordinatedProjects.length;

  // Projected outcomes: calculated dynamically from active AI coordination clusters
  const projectedSavingsINR = clusters.reduce((acc, c) => acc + (c.estimatedCostSavedINR || 0), 0);
  const projectedExcavationsAvoided = clusters.reduce((acc, c) => acc + (c.excavationsAvoided || 0), 0);
  const restorationsAvoided = clusters.reduce((acc, c) => acc + (c.restorationsAvoided || 0), 0);

  const departments: DepartmentName[] = [
    'Water & Sewerage',
    'Drainage Department',
    'Telecom & Digital',
    'Electricity (DISCOM)',
    'Roads / PWD',
    'City Gas Distribution',
  ];

  const departmentPerformance = departments.map((dept) => {
    const deptProjects = projects.filter((p) => p.department === dept);
    const coordinated = deptProjects.filter(
      (p) => p.status === 'COORDINATION' || clusters.some((c) => c.projectIds.includes(p.id))
    ).length;
    return {
      department: dept,
      totalProjects: deptProjects.length,
      coordinatedProjects: coordinated,
      complianceScore: deptProjects.length > 0 ? Math.round((coordinated / deptProjects.length) * 100) : 100,
      avgDelayDays: 0,
    };
  });

  const summary: CityAnalyticsSummary = {
    totalProjects: projects.length,
    activeProjects: activeProjects.length,
    completedProjects: completedProjects.length,
    pendingApprovals: workflows.filter((w) => w.overallStatus === 'PENDING').length,
    highRiskProjects: projects.filter((p) => p.conflictSeverity === 'CRITICAL' || p.conflictSeverity === 'HIGH').length,
    coordinationClustersCount: clusters.length,
    activeExcavationsCount: activeProjects.length,
    recentlyRestoredRoadsCount: roads.filter((r) => r.protectionStatus === 'PROTECTED').length,
    emergencyProjectsCount: projects.filter((p) => p.isEmergency).length,
    delayedProjectsCount: 0,
    openComplaintsCount: complaints.filter((c) => c.status === 'OPEN' || c.status === 'UNDER_INVESTIGATION').length,
    verifiedSavingsINR,
    projectedSavingsINR,
    totalEstimatedSavingsINR: verifiedSavingsINR,
    verifiedExcavationsAvoided,
    projectedExcavationsAvoided,
    excavationsAvoided: verifiedExcavationsAvoided,
    restorationsAvoided,
    trafficDisruptionReductionPct: clusters.length > 0 ? 54 : 0,
    modelledTrafficDisruptionReductionPct: clusters.length > 0 ? 54 : 0,
    avgApprovalHours: 18.5,
    avgRestorationDays: 2.8,
    departmentPerformance,
  };

  res.json({ summary });
});

// ==========================================
// 14. AUDIT LOGS & NOTIFICATIONS
// ==========================================
apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  res.json({ auditLogs: db.getAuditLogs() });
});

apiRouter.get('/notifications', (req: Request, res: Response) => {
  res.json({ notifications: db.getNotifications() });
});

apiRouter.post('/notifications/:id/read', (req: Request, res: Response) => {
  db.markNotificationRead(req.params.id);
  res.json({ success: true });
});

// ==========================================
// 15. SYSTEM SETTINGS
// ==========================================
apiRouter.get('/settings', (req: Request, res: Response) => {
  res.json({ settings: db.getSettings() });
});

apiRouter.put('/settings', (req: Request, res: Response) => {
  db.updateSettings(req.body);
  res.json({ success: true, settings: db.getSettings() });
});

// ==========================================
// 15B. AUDIT TRAIL LOGS
// ==========================================
apiRouter.get('/audit', (req: Request, res: Response) => {
  res.json({ logs: db.getAuditLogs() });
});

apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  res.json({ logs: db.getAuditLogs() });
});

// ==========================================
// 16. EMERGENCY EXCAVATION FAST-TRACK
// ==========================================
apiRouter.post('/emergency/request', async (req: Request, res: Response) => {
  const { roadId, department, emergencyReason, officerName, description } = req.body;
  const road = db.getRoadById(roadId) || db.getRoads()[0];

  const projId = `EMERG-${Date.now()}`;
  const emergencyProject: Project = {
    id: projId,
    code: `EMG-${Math.floor(100 + Math.random() * 900)}`,
    name: `EMERGENCY: ${emergencyReason} (${road.name})`,
    department: department || 'Water & Sewerage',
    projectType: 'Emergency Repair',
    description: description || `Critical emergency response authorized for ${emergencyReason}.`,
    roadId: road.id,
    roadName: road.name,
    geometry: road.geometry.slice(0, 2),
    startCoordinates: road.geometry[0],
    endCoordinates: road.geometry[1],
    lengthMeters: 150,
    requiredStartDate: new Date().toISOString().split('T')[0],
    requiredCompletionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    expectedExcavationDurationDays: 3,
    excavationWidthMeters: 2.0,
    excavationDepthMeters: 2.5,
    affectedAreaSqMeters: 300,
    estimatedCostINR: 850000,
    estimatedExcavationCostINR: 250000,
    estimatedRestorationCostINR: 350000,
    trafficImpact: 'Severe',
    priority: 'Emergency',
    isEmergency: true,
    emergencyReason,
    contractorName: 'Quick Response Disaster Team (Municipal Corp)',
    status: 'PERMITTED',
    documents: [],
    submittedBy: officerName || 'Emergency Nodal Desk',
    submittedByDesignation: 'Executive Engineer (On-Duty)',
    submittedAt: new Date().toISOString(),
    progressPercentage: 20,
    currentWorkPhase: 'Immediate Excavation & Utility Isolation',
  };

  db.saveProject(emergencyProject);

  // Fast-track temporary permit
  const permitNum = `ROP-EMG-${Math.floor(1000 + Math.random() * 9000)}`;
  const permit: RoadOpeningPermit = {
    id: `PERMIT-${permitNum}`,
    permitNumber: permitNum,
    projectId: emergencyProject.id,
    projectName: emergencyProject.name,
    department: emergencyProject.department,
    roadId: road.id,
    roadName: road.name,
    contractorName: emergencyProject.contractorName!,
    contractorContact: 'Emergency Hotline: 112 / 1077',
    approvedGeometry: emergencyProject.geometry,
    validFrom: emergencyProject.requiredStartDate,
    validTo: emergencyProject.requiredCompletionDate,
    excavationDimensions: {
      lengthMeters: 150,
      widthMeters: 2.0,
      depthMeters: 2.5,
      totalAreaSqM: 300,
    },
    trafficConditions: ['Emergency flashers active.', 'Traffic police immediate diversion deployment.'],
    safetyGuidelines: ['Heavy steel trench shielding and safety ropes.'],
    restorationDeadline: emergencyProject.requiredCompletionDate,
    securityDepositINR: 0,
    qrCodeDataUrl: '',
    status: 'ACTIVE',
    issuedBy: 'Commissioner Emergency Fast-Track Protocol',
    issuedByDesignation: 'Municipal Authority',
    issuedAt: new Date().toISOString(),
  };

  db.savePermit(permit);
  emergencyProject.permitId = permit.id;
  db.saveProject(emergencyProject);

  db.addNotification({
    id: `NOTIF-${Date.now()}`,
    targetRole: 'ALL',
    title: `EMERGENCY EXCAVATION: ${emergencyReason}`,
    message: `Immediate emergency opening authorized on ${road.name} by ${department}. Traffic authorities alerted.`,
    type: 'EMERGENCY',
    link: '/projects',
    isRead: false,
    timestamp: new Date().toISOString(),
  });

  db.logAudit({
    userId: officerName || 'Duty Officer',
    userName: officerName || 'Emergency Control',
    role: 'NODAL_OFFICER',
    department: department || 'Water & Sewerage',
    action: 'EMERGENCY_EXCAVATION_AUTHORIZED',
    entity: 'Project',
    entityId: emergencyProject.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Fast-track Permit ${permitNum} issued for ${emergencyReason}`,
    reason: description,
  });

  res.json({ success: true, project: emergencyProject, permit });
});

// ==========================================
// 4B. COMPREHENSIVE DECISION & APPROVAL WORKFLOW ENDPOINTS
// ==========================================

// 1. TRIGGER AI CORRIDOR ANALYSIS
apiRouter.post('/projects/:id/analyze', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const allProjects = db.getProjects();
  const roads = db.getRoads();
  const assets = db.getAssets();

  const analysisReport = generateOfficialInfrastructureAnalysis(project, allProjects, roads, assets);
  const coordResult = runAICoordinationEngine(project, allProjects, roads, assets, 100);

  project.status = 'ANALYSIS_READY';
  project.aiAnalysisStatus = 'ANALYSIS_READY';
  project.jointPlanStatus = coordResult.relatedProjects.length > 0 ? 'AI_RECOMMENDED' : 'NOT_PROPOSED';
  project.aiRecommendation = coordResult.relatedProjects.length > 0 ? 'COORDINATE_JOINT_DIG' : 'PROCEED_SEPARATELY';
  
  // Create Plan Version 1
  project.planVersions = [
    {
      planId: `PLAN-${project.code}-V1`,
      version: 1,
      author: 'MR. MAYOR AI Coordination Engine',
      authorRole: 'SYSTEM',
      authorDepartment: 'Smart City & Urban Planning',
      status: project.jointPlanStatus,
      modificationSummary: `Initial AI multi-project corridor lookahead plan (${coordResult.relatedProjects.length + 1} projects analyzed).`,
      timestamp: new Date().toISOString(),
      selectedPlanId: 'PLAN_A',
      candidatePlans: coordResult.candidatePlans,
      recalculatedSavingsINR: coordResult.impactSummary.estimatedCostSavedINR,
    }
  ];

  // Update Workflow Stage 3 (AI Analysis)
  if (project.workflowStages) {
    const stg3 = project.workflowStages.find(s => s.stageId === 'STAGE-03-AI-ANALYSIS');
    if (stg3) {
      stg3.status = 'COMPLETED';
      stg3.timestamp = new Date().toISOString();
      stg3.comment = `AI analyzed corridor ${project.roadName}. Identified ${coordResult.relatedProjects.length} related projects. Recommendation: ${project.aiRecommendation}.`;
    }
    const stg4 = project.workflowStages.find(s => s.stageId === 'STAGE-04-TECH-REVIEW');
    if (stg4) stg4.status = 'IN_PROGRESS';
  }

  db.saveProject(project);

  // Notify Technical Authority
  const roadAuth = resolveRoadAuthority(project.roadName, undefined);
  db.addNotification({
    id: `NOTIF-${Date.now()}`,
    targetRole: roadAuth.approverRole as any,
    title: `AI Analysis Ready: ${project.name}`,
    message: `AI has generated a coordination plan for ${project.name} on ${project.roadName}. Technical Engineering Review required.`,
    type: 'COORDINATION',
    link: `/approvals?id=${project.id}`,
    isRead: false,
    timestamp: new Date().toISOString(),
  });

  db.logAudit({
    userId: 'SYSTEM_AI',
    userName: 'MR. MAYOR AI Engine',
    role: 'SYSTEM' as any,
    department: 'Smart City & Urban Planning',
    action: 'AI_ANALYSIS_COMPLETED',
    entity: 'Project',
    entityId: project.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `AI Analysis completed for ${project.code}. Recommendation: ${project.aiRecommendation}. Plan Version: v1.`,
  });

  res.json({
    success: true,
    project,
    analysisReport,
    coordinationResult: coordResult,
  });
});

// 2. SUBMIT TECHNICAL ENGINEERING REVIEW (FIRST APPROVER)
apiRouter.post('/projects/:id/technical-review', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const { decision, comment, conditions, selectedPlanId, reviewerName, reviewerRole, reviewerDepartment, modificationsRequested } = req.body;

  project.technicalReview = {
    projectId: project.id,
    decision,
    comment: comment || 'Technical engineering specifications, depth hierarchy, and compaction standards verified.',
    conditions: conditions || ['Work must follow nocturnal excavation window (22:00-06:00)', 'Mandatory joint pre-backfill laser test'],
    modificationsRequested,
    selectedPlanId: selectedPlanId || 'PLAN_A',
    reviewedBy: reviewerName || project.responsibleApproverName || 'Er. Sanjay Patil',
    reviewerDesignation: reviewerRole || 'Executive Engineer',
    reviewerDepartment: reviewerDepartment || project.responsibleRoadAuthority || 'Roads / PWD',
    reviewedAt: new Date().toISOString(),
  };

  if (decision === 'APPROVE' || decision === 'FORWARD_HIGHER') {
    project.status = 'TECHNICAL_APPROVED';
    project.jointPlanStatus = 'TECHNICALLY_APPROVED';
    
    // Update Workflow Stages
    if (project.workflowStages) {
      const stg4 = project.workflowStages.find(s => s.stageId === 'STAGE-04-TECH-REVIEW');
      if (stg4) {
        stg4.status = 'COMPLETED';
        stg4.timestamp = new Date().toISOString();
        stg4.actorName = project.technicalReview.reviewedBy;
        stg4.comment = project.technicalReview.comment;
        stg4.conditions = project.technicalReview.conditions;
      }
      const stg5 = project.workflowStages.find(s => s.stageId === 'STAGE-05-HIGHER-APPROVAL');
      if (stg5) stg5.status = 'IN_PROGRESS';
    }

    // Immediately notify Higher Authority (Commissioner / Additional Commissioner)
    db.addNotification({
      id: `NOTIF-${Date.now()}`,
      targetRole: 'COMMISSIONER',
      title: `Technical Approval Completed: ${project.name}`,
      message: `${project.technicalReview.reviewedBy} (${project.technicalReview.reviewerDepartment}) has approved the proposed coordination plan on ${project.roadName}. Higher Authority final sanction required.`,
      type: 'APPROVAL',
      link: `/approvals?id=${project.id}`,
      isRead: false,
      timestamp: new Date().toISOString(),
    });
  } else if (decision === 'REQUEST_MODIFICATION') {
    project.status = 'MODIFICATION_REQUESTED';
    project.jointPlanStatus = 'MODIFIED';

    if (project.workflowStages) {
      const stg4 = project.workflowStages.find(s => s.stageId === 'STAGE-04-TECH-REVIEW');
      if (stg4) {
        stg4.status = 'REJECTED';
        stg4.comment = `Modification requested: ${modificationsRequested || comment}`;
      }
    }

    db.addNotification({
      id: `NOTIF-${Date.now()}`,
      targetRole: 'ENGINEER',
      title: `Modification Requested: ${project.name}`,
      message: `Technical Authority requested plan modifications for ${project.name}: ${modificationsRequested || comment}`,
      type: 'PROJECT',
      link: `/projects?id=${project.id}`,
      isRead: false,
      timestamp: new Date().toISOString(),
    });
  } else {
    project.status = 'REJECTED';
    project.jointPlanStatus = 'REJECTED';
  }

  db.saveProject(project);

  db.logAudit({
    userId: project.technicalReview.reviewedBy,
    userName: project.technicalReview.reviewedBy,
    role: project.technicalReview.reviewerDesignation as any,
    department: project.technicalReview.reviewerDepartment,
    action: `TECHNICAL_REVIEW_${decision}`,
    entity: 'Project',
    entityId: project.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Technical Authority decision: ${decision} by ${project.technicalReview.reviewedBy}. Comment: ${comment}`,
  });

  res.json({ success: true, project });
});

// 3. SUBMIT HIGHER AUTHORITY REVIEW & SANCTION
apiRouter.post('/projects/:id/higher-approval', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const { decision, comment, conditions, approverName, approverDesignation } = req.body;

  const stamp = `GOVT-MAHA-NMC-AUTH-${Date.now().toString(36).toUpperCase()}-DIGITAL-SIGN`;

  project.higherAuthorityApproval = {
    projectId: project.id,
    decision,
    comment: comment || 'Sanctioned under Section 197 & 198 of the MMC Act 1949 with mandatory Dig-Once single road-opening enforcement.',
    conditions: conditions || [
      'Strict adherence to depth hierarchy (Drainage -> Water -> Telecom)',
      'Single unified Bituminous Concrete restoration with 3-year moratorium',
      'Nocturnal execution at sensitive junction nodes'
    ],
    digitalSignatureStamp: stamp,
    approvedBy: approverName || 'Dr. Pravin Gedam (IAS)',
    approverDesignation: approverDesignation || 'Municipal Commissioner & CEO',
    approvedAt: new Date().toISOString(),
  };

  if (decision === 'APPROVE') {
    project.status = 'APPROVED';
    project.jointPlanStatus = 'APPROVED';
    
    // Update Workflow Stages
    if (project.workflowStages) {
      const stg5 = project.workflowStages.find(s => s.stageId === 'STAGE-05-HIGHER-APPROVAL');
      if (stg5) {
        stg5.status = 'COMPLETED';
        stg5.timestamp = new Date().toISOString();
        stg5.actorName = project.higherAuthorityApproval.approvedBy;
        stg5.comment = project.higherAuthorityApproval.comment;
        stg5.conditions = project.higherAuthorityApproval.conditions;
      }
      const stg6 = project.workflowStages.find(s => s.stageId === 'STAGE-06-PERMIT');
      if (stg6) stg6.status = 'IN_PROGRESS';
    }

    // Notify Nodal Officer, Contractor, and Department Engineers
    db.addNotification({
      id: `NOTIF-${Date.now()}`,
      targetRole: 'ALL',
      title: `Project Officially Sanctioned: ${project.name}`,
      message: `${project.name} on ${project.roadName} has received statutory approval from ${project.higherAuthorityApproval.approvedBy}. Digital Permit can now be generated.`,
      type: 'APPROVAL',
      link: `/permits?projectId=${project.id}`,
      isRead: false,
      timestamp: new Date().toISOString(),
    });
  } else {
    project.status = 'REJECTED';
    project.jointPlanStatus = 'REJECTED';
  }

  db.saveProject(project);

  db.logAudit({
    userId: project.higherAuthorityApproval.approvedBy,
    userName: project.higherAuthorityApproval.approvedBy,
    role: 'COMMISSIONER',
    department: 'Smart City & Urban Planning',
    action: `HIGHER_AUTHORITY_${decision}`,
    entity: 'Project',
    entityId: project.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Statutory Sanction granted for ${project.code} by ${project.higherAuthorityApproval.approvedBy}. Digital Stamp: ${stamp}`,
  });

  res.json({ success: true, project });
});

// 4. MODIFY PLAN (CREATE PLAN VERSION 2)
apiRouter.post('/projects/:id/modify-plan', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const { modificationsSummary, selectedPlanId, authorName, authorRole, conditions } = req.body;

  const currentVersion = project.activePlanVersion || 1;
  const newVersionNum = currentVersion + 1;

  const newPlanVersion: any = {
    planId: `PLAN-${project.code}-V${newVersionNum}`,
    version: newVersionNum,
    author: authorName || 'Er. Rajesh Kulkarni (Nodal Officer)',
    authorRole: authorRole || 'NODAL_OFFICER',
    authorDepartment: 'Smart City & Urban Planning',
    status: 'MODIFIED',
    modificationSummary: modificationsSummary || `Authority modification applied: Adjusted execution sequencing and department windows.`,
    timestamp: new Date().toISOString(),
    selectedPlanId: selectedPlanId || 'PLAN_B',
    candidatePlans: project.planVersions?.[0]?.candidatePlans || [],
    recalculatedSavingsINR: Math.round((project.estimatedCostINR || 2000000) * 0.45),
    conditions: conditions || ['Staggered micro-windows enforced'],
  };

  if (!project.planVersions) project.planVersions = [];
  project.planVersions.unshift(newPlanVersion);
  project.activePlanVersion = newVersionNum;
  project.jointPlanStatus = 'MODIFIED';
  project.status = 'UNDER_TECHNICAL_REVIEW';

  db.saveProject(project);

  db.logAudit({
    userId: authorName || 'Authorized Officer',
    userName: authorName || 'Authorized Officer',
    role: authorRole || 'NODAL_OFFICER',
    department: 'Smart City & Urban Planning',
    action: 'PLAN_VERSION_MODIFIED',
    entity: 'Project',
    entityId: project.id,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Plan v${newVersionNum} created for ${project.code}. ${newPlanVersion.modificationSummary}`,
  });

  res.json({ success: true, project, newPlanVersion });
});

// 5. ISSUE DIGITAL ROAD OPENING PERMIT WITH QR CODE
apiRouter.post('/projects/:id/permit/issue', async (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const permitNumber = `PERMIT-NSK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const appBaseUrl = process.env.APP_URL || 'http://localhost:3000';
  const qrVerificationUrl = `${appBaseUrl}/verify-permit?number=${permitNumber}&project=${project.code}`;
  const qrCodeDataUrl = await QRCode.toDataURL(qrVerificationUrl);

  const permit: RoadOpeningPermit = {
    id: `PRM-${Date.now()}`,
    permitNumber,
    projectId: project.id,
    projectName: project.name,
    department: project.department,
    roadId: project.roadId,
    roadName: project.roadName,
    contractorName: project.proposedContractor || 'Approved Municipal Contractor',
    contractorContact: '+91 98230 11223',
    approvedGeometry: project.geometry || [],
    validFrom: project.requiredStartDate,
    validTo: project.requiredCompletionDate,
    approvedStartDate: project.requiredStartDate,
    approvedEndDate: project.requiredCompletionDate,
    excavationDimensions: {
      lengthMeters: project.lengthMeters || 1200,
      widthMeters: project.excavationWidthMeters || 1.2,
      depthMeters: project.excavationDepthMeters || 1.8,
      totalAreaSqM: (project.lengthMeters || 1200) * (project.excavationWidthMeters || 1.2),
    },
    maxTrenchLengthMeters: project.lengthMeters || 1200,
    maxTrenchWidthMeters: project.excavationWidthMeters || 1.2,
    maxTrenchDepthMeters: project.excavationDepthMeters || 1.8,
    status: 'ACTIVE',
    qrCodeDataUrl,
    issuedAt: new Date().toISOString(),
    issuedBy: 'Dr. Pravin Gedam (IAS)',
    issuedByDesignation: 'Municipal Commissioner & CEO',
    restorationDeadline: project.requiredCompletionDate,
    securityDepositINR: Math.round((project.estimatedCostINR || 2000000) * 0.15),
    safetyGuidelines: [
      'Hard barricading with retro-reflective tape mandatory',
      'Gas and underground utility sensor sweeps before mechanical digging',
      'Laser grade compaction check before asphalt sealing'
    ],
    trafficConditions: [
      'Work restricted to nocturnal hours (22:00 to 06:00)',
      'Retro-reflective hard barricades with solar flashing blinkers mandatory',
      'Dedicated traffic marshals at Canada Corner & Jehan Circle'
    ],
    restorationConditions: [
      '95%+ Proctor Density compaction test before bituminous paving',
      'Unified 40mm DBM + 30mm BC full-width asphalt seal',
      '3-Year pavement protection moratorium upon verification'
    ],
  };

  db.savePermit(permit);
  project.permitId = permit.id;
  project.status = 'PERMIT_ISSUED';

  if (project.workflowStages) {
    const stg6 = project.workflowStages.find(s => s.stageId === 'STAGE-06-PERMIT');
    if (stg6) {
      stg6.status = 'COMPLETED';
      stg6.timestamp = new Date().toISOString();
      stg6.comment = `Digital QR Permit ${permitNumber} issued.`;
    }
    const stg7 = project.workflowStages.find(s => s.stageId === 'STAGE-07-EXECUTION');
    if (stg7) stg7.status = 'IN_PROGRESS';
  }

  db.saveProject(project);

  db.addNotification({
    id: `NOTIF-${Date.now()}`,
    targetRole: 'CONTRACTOR',
    title: `Digital Permit Issued: ${permitNumber}`,
    message: `Road opening permit for ${project.name} on ${project.roadName} has been generated with verified QR code.`,
    type: 'PERMIT',
    link: `/permits?id=${permit.id}`,
    isRead: false,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, permit, project });
});

// 6. PROACTIVE AI ROAD INTELLIGENCE & CORRIDOR ALERTS (SECTION 26-31)
apiRouter.get('/coordination/proactive-alerts', (req: Request, res: Response) => {
  const roads = db.getRoads();
  const projects = db.getProjects();
  const alerts: any[] = [];

  roads.forEach((road) => {
    const corridorProjects = projects.filter(
      (p) => p.roadId === road.id || p.roadName.toLowerCase().includes(road.name.toLowerCase())
    );

    // 1. Recent Restoration Moratorium Alert (Section 31)
    if (road.daysSinceLastResurfaced && road.daysSinceLastResurfaced <= 180) {
      const activeOrProposed = corridorProjects.filter(p => p.status === 'PROPOSED' || p.status === 'IN_PROGRESS');
      if (activeOrProposed.length > 0) {
        alerts.push({
          id: `ALERT-RESTORE-${road.id}`,
          corridorName: road.name,
          type: 'RECENT_RESTORATION_CONFLICT',
          severity: road.daysSinceLastResurfaced <= 90 ? 'CRITICAL' : 'HIGH',
          title: `Recent Restoration Moratorium Conflict on ${road.name}`,
          description: `Road was resurfaced ${road.daysSinceLastResurfaced} days ago. ${activeOrProposed.length} new excavation(s) proposed. High rework risk under ₹135 Cr NMC Restoration Policy.`,
          evidence: [
            `Pavement age: ${road.daysSinceLastResurfaced} days (Moratorium active)`,
            `Affected projects: ${activeOrProposed.map(p => p.code).join(', ')}`,
            `Traffic Class: ${road.trafficClass}`,
          ],
          affectedProjects: activeOrProposed.map(p => ({ id: p.id, name: p.name, department: p.department, dates: `${p.requiredStartDate} to ${p.requiredCompletionDate}` })),
          suggestedAction: 'Mandate Trenchless Micro-Tunneling (HDD) or require Municipal Commissioner special exception review.',
          createdAt: new Date().toISOString(),
        });
      }
    }

    // 2. Dig-Once 3+ Project Coordination Opportunity (Section 28-29)
    if (corridorProjects.length >= 2) {
      const activeAndProposed = corridorProjects.filter(p => p.status === 'PROPOSED' || p.status === 'ANALYSIS_READY' || p.status === 'UNDER_TECHNICAL_REVIEW');
      if (activeAndProposed.length >= 2) {
        alerts.push({
          id: `ALERT-DIGONCE-${road.id}`,
          corridorName: road.name,
          type: 'DIG_ONCE_OPPORTUNITY',
          severity: 'HIGH',
          title: `Dig-Once Multi-Agency Opportunity on ${road.name}`,
          description: `${activeAndProposed.length} department excavations detected on ${road.name} within the 90-day lookahead window. Consolidate into ONE coordinated road opening before restoration.`,
          evidence: [
            `Departments involved: ${Array.from(new Set(activeAndProposed.map(p => p.department))).join(', ')}`,
            `Projects: ${activeAndProposed.map(p => p.name).join(' | ')}`,
            `Estimated avoidance: ${activeAndProposed.length - 1} duplicate road cuttings`,
          ],
          affectedProjects: activeAndProposed.map(p => ({ id: p.id, name: p.name, department: p.department, dates: `${p.requiredStartDate} to ${p.requiredCompletionDate}` })),
          suggestedAction: 'Open AI Infrastructure Analysis Center and propose single joint digging window.',
          createdAt: new Date().toISOString(),
        });
      }
    }
  });

  res.json({ alerts, totalAlerts: alerts.length });
});

// 7. INFRASTRUCTURE ANALYSIS CENTER & OFFICIAL REPORT ROUTES (SECTIONS 46-68)
apiRouter.get('/analysis/:projectId', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const allProjects = db.getProjects();
  const roads = db.getRoads();
  const assets = db.getAssets();

  const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || 'USR-001';
  const users = db.getUsers();
  const user = users.find((u) => u.id === userId) || users[0];

  const fullReport = generateOfficialInfrastructureAnalysis(project, allProjects, roads, assets, user);
  const authResult = authorizeAndFilterAnalysis(fullReport, user, project.id);

  if (!authResult.authorized) {
    return res.json({
      success: false,
      accessLevel: authResult.accessLevel,
      sensitivity: fullReport.sensitivity,
      report: null,
      error: authResult.error,
    });
  }

  res.json({
    success: true,
    accessLevel: authResult.accessLevel,
    sensitivity: fullReport.sensitivity,
    report: authResult.sanitizedPayload || fullReport,
  });
});

apiRouter.post('/analysis/:projectId/generate-report', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const allProjects = db.getProjects();
  const roads = db.getRoads();
  const assets = db.getAssets();

  const { reportType, userId } = req.body;
  const users = db.getUsers();
  const user = users.find((u) => u.id === userId) || users[0];

  const fullReport = generateOfficialInfrastructureAnalysis(project, allProjects, roads, assets, user);

  // Log report generation in audit trail
  db.logAudit({
    userId: user.id,
    userName: user.name,
    role: user.role,
    department: user.department,
    action: 'GENERATE_OFFICIAL_REPORT',
    entity: 'InfrastructureAnalysisReport',
    entityId: fullReport.analysisId,
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Generated ${reportType || 'INTERNAL_COORDINATION_REPORT'} for ${project.code} (${project.name})`,
  });

  res.json({
    success: true,
    reportType: reportType || 'INTERNAL_COORDINATION_REPORT',
    analysisId: fullReport.analysisId,
    version: fullReport.version,
    generatedAt: new Date().toISOString(),
    generatedBy: user.name,
    report: fullReport,
  });
});

apiRouter.post('/coordination/reject-plan', (req: Request, res: Response) => {
  const { projectId, planId, reason, officer, designation, department } = req.body;
  const project = db.getProjectById(projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  project.status = 'REJECTED';
  project.jointPlanStatus = 'REJECTED';

  db.logAudit({
    userId: 'USR-REJECT',
    userName: officer || 'Authority Officer',
    role: designation || 'EXECUTIVE_ENGINEER',
    department: department || 'Municipal Administration',
    action: 'REJECT_COORDINATION_PLAN',
    entity: 'CoordinationPlan',
    entityId: planId || 'PLAN_A',
    ipAddress: req.ip || '127.0.0.1',
    newValue: `Coordination recommendation rejected for ${project.code}. Reason: ${reason || 'Authority rejection'}`,
  });

  res.json({ success: true, message: 'Coordination plan rejection logged in audit ledger.' });
});



// ============================================================
// COORDINATION CASES & COMPLETE MUNICIPAL LIFECYCLE API ROUTES
// ============================================================

// 1. Get all coordination cases
apiRouter.get('/coordination-cases', (req: Request, res: Response) => {
  const cases = db.getCoordinationCases();
  res.json({ success: true, count: cases.length, cases });
});

// 2. Get specific coordination case
apiRouter.get('/coordination-cases/:id', (req: Request, res: Response) => {
  const c = db.getCoordinationCaseById(req.params.id);
  if (!c) return res.status(404).json({ error: 'Coordination case not found' });
  
  // Hydrate related projects
  const relatedProjects = (c.relatedProjectIds || []).map((id) => db.getProjectById(id)).filter(Boolean);
  res.json({ success: true, case: { ...c, relatedProjects } });
});

// 3. Create or register a coordination case
apiRouter.post('/coordination-cases', (req: Request, res: Response) => {
  try {
    const created = db.createCoordinationCase(req.body);
    res.status(201).json({ success: true, case: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create coordination case' });
  }
});

// 4. Get all verified contractors
apiRouter.get('/contractors', (req: Request, res: Response) => {
  const contractors = db.getContractors();
  res.json({ success: true, count: contractors.length, contractors });
});

// 5. Record Technical Strategy Decision (Owning Engineer / Technical Review)
apiRouter.post('/coordination-cases/:id/strategy', (req: Request, res: Response) => {
  const { strategy, planId, userId, reason } = req.body;
  const users = db.getUsers();
  const user = users.find((u) => u.id === userId) || users[0];

  const updated = db.recordStrategyDecision(
    req.params.id,
    strategy,
    planId || 'PLAN_A',
    user,
    reason
  );

  if (!updated) return res.status(404).json({ error: 'Coordination case not found' });
  res.json({ success: true, message: 'Technical strategy decision recorded.', case: updated });
});

// 6. Record Departmental Concurrence (Affected Utility Clearance)
apiRouter.post('/coordination-cases/:id/concurrence', (req: Request, res: Response) => {
  const { departmentName, status, notes, userId } = req.body;
  const users = db.getUsers();
  const user = users.find((u) => u.id === userId) || users[0];

  const updated = db.recordDepartmentConcurrence(
    req.params.id,
    departmentName || user.department,
    status || 'CONCURRED',
    notes || 'Technical clearance granted for underground utility alignment.',
    user
  );

  if (!updated) return res.status(404).json({ error: 'Coordination case not found' });
  res.json({ success: true, message: 'Departmental concurrence logged.', case: updated });
});

// 7. Propose to Leadership
apiRouter.post('/coordination-cases/:id/propose-leadership', (req: Request, res: Response) => {
  const { userId, notes } = req.body;
  const users = db.getUsers();
  const user = users.find((u) => u.id === userId) || users[0];

  const updated = db.proposeLeadership(req.params.id, user, notes);
  if (!updated) return res.status(404).json({ error: 'Coordination case not found' });
  res.json({ success: true, message: 'Package submitted to Higher Authority / Leadership Review.', case: updated });
});

// 8. Leadership Approval / Rejection / Revision
apiRouter.post('/coordination-cases/:id/leadership-decision', (req: Request, res: Response) => {
  const { decision, remarks, userId, signatureStamp } = req.body;
  const users = db.getUsers();
  const user = users.find((u) => u.id === userId) || users[0];

  const updated = db.recordLeadershipDecision(
    req.params.id,
    decision || 'APPROVED',
    remarks || 'Statutory sanction approved.',
    user,
    signatureStamp
  );

  if (!updated) return res.status(404).json({ error: 'Coordination case not found' });
  res.json({ success: true, message: `Leadership decision recorded: ${decision}`, case: updated });
});

// 9. Allocate Contractor
apiRouter.post('/coordination-cases/:id/allocate-contractor', (req: Request, res: Response) => {
  const { contractorId, contractorName, specialization, workScope, userId } = req.body;
  const users = db.getUsers();
  const user = users.find((u) => u.id === userId) || users[0];

  const allocation = {
    contractorId: contractorId || 'CTR-NSK-01',
    contractorName: contractorName || 'M/s InfraTech Construction Ltd.',
    specialization: specialization || 'Multi-Utility Micro-Trenching',
    assignedAt: new Date().toISOString(),
    assignedBy: user.name,
    workScope: workScope || 'Complete corridor trenching, utility laying, and bituminous road restoration.',
    status: 'ASSIGNED' as const,
  };

  const result = db.allocateContractor(req.params.id, allocation, user);
  if (!result.success) return res.status(404).json({ error: 'Case or project not found' });
  res.json({ success: true, message: 'Contractor assigned and mobilized.', entity: result.entity });
});

// 10. Update Execution Stage (Contractor progress or complete pending QC)
apiRouter.post('/coordination-cases/:id/stages/:stageId/update', (req: Request, res: Response) => {
  const { status, notes, photos, userId } = req.body;
  const users = db.getUsers();
  const user = users.find((u) => u.id === userId) || users[0];

  const result = db.updateExecutionStage(
    req.params.id,
    req.params.stageId,
    status || 'COMPLETED_PENDING_QC',
    notes || '',
    photos || [],
    user
  );

  if (!result.success) return res.status(404).json({ error: 'Stage or case not found' });
  res.json({ success: true, message: 'Stage progress updated.', stage: result.stage });
});

// 11. Assign Stage QC Inspector
apiRouter.post('/coordination-cases/:id/stages/:stageId/assign-qc', (req: Request, res: Response) => {
  const { inspectorId, inspectorName, userId } = req.body;
  const users = db.getUsers();
  const user = users.find((u) => u.id === userId) || users[0];

  const result = db.assignStageQC(
    req.params.id,
    req.params.stageId,
    inspectorId || 'usr-nsk-05',
    inspectorName || 'Er. Mahesh Patil (Senior QC Inspector)',
    user
  );

  if (!result.success) return res.status(404).json({ error: 'Stage or case not found' });
  res.json({ success: true, message: 'QC Inspector assigned to stage.', stage: result.stage });
});

// 12. Record Stage QC Decision (Pass or Fail / Rework)
apiRouter.post('/coordination-cases/:id/stages/:stageId/qc-decision', (req: Request, res: Response) => {
  const { result, remarks, checklist, userId } = req.body;
  const users = db.getUsers();
  const user = users.find((u) => u.id === userId) || users[0];

  const qcResult = db.recordStageQCDecision(
    req.params.id,
    req.params.stageId,
    result || 'PASS',
    remarks || 'Inspection passed in accordance with civil engineering specifications.',
    checklist || [],
    user
  );

  if (!qcResult.success) return res.status(404).json({ error: 'Stage or case not found' });
  res.json({
    success: true,
    message: result === 'PASS' ? 'Stage QC PASSED. Next stage unlocked.' : 'Stage QC FAILED. Rework required.',
    ...qcResult,
  });
});

// 13. Final Closure & Road History Commit
apiRouter.post('/coordination-cases/:id/finalize-closure', (req: Request, res: Response) => {
  const { userId } = req.body;
  const users = db.getUsers();
  const user = users.find((u) => u.id === userId) || users[0];

  const result = db.finalizeProjectAndRoadHistory(req.params.id, user);
  if (!result.success) return res.status(404).json({ error: 'Case or project not found' });
  res.json({
    success: true,
    message: 'Project closed and Digital Road Twin history updated with verified outcome data.',
    historyItem: result.historyItem,
  });
});
