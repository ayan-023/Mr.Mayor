/**
 * MR. MAYOR - Global TypeScript Type Definitions
 */

export type UserRole =
  | 'COMMISSIONER'
  | 'NODAL_OFFICER'
  | 'DEPT_HEAD'
  | 'EXECUTIVE_ENGINEER'
  | 'ASSISTANT_ENGINEER'
  | 'JUNIOR_ENGINEER'
  | 'INSPECTOR'
  | 'CONTRACTOR'
  | 'CITIZEN'
  | 'ADMIN';

export type DepartmentName =
  | 'Roads / PWD'
  | 'Water & Sewerage'
  | 'Drainage Department'
  | 'Electricity (DISCOM)'
  | 'Telecom & Digital'
  | 'City Gas Distribution'
  | 'Traffic Police Authority'
  | 'Smart City & Urban Planning'
  | 'Independent Contractor'
  | 'General Public'
  | 'Administration';

export type Jurisdiction =
  | 'Citywide'
  | 'Central Zone'
  | 'North Zone'
  | 'South Zone'
  | 'East Zone'
  | 'West Zone'
  | 'Ring Corridor';

export interface UserVerificationDocument {
  docType: string;
  docNumber: string;
  verifiedAt: string;
  verifiedBy: string;
  fileName?: string;
  fileSize?: string;
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  department: DepartmentName | 'Administration' | 'General Public' | 'Independent Contractor';
  jurisdiction: Jurisdiction;
  permissions: string[];
  avatar?: string;
  phone?: string;
  empCode?: string;
  cadre?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'LOCKED_2FA';
  securityClearance?: 'TOP_SECRET_MUNICIPAL' | 'GAZETTED_OFFICIAL' | 'CONTRACTOR_VETTED' | 'CITIZEN';
  twoFactorEnforced?: boolean;
  tempPassword?: string;
  issuedAt?: string;
  issuedBy?: string;
  documents?: UserVerificationDocument[];
  financialSanctionCeilingINR?: number;
  digitalSignatureId?: string;
  policeClearanceRef?: string;
}

export type RoadCategory =
  | 'National Highway'
  | 'State Highway'
  | 'Major Arterial'
  | 'Major Road'
  | 'Collector Road'
  | 'Local Road'
  | 'Heritage Corridor';

export type RoadSurface = 'Asphalt' | 'Concrete' | 'Paver Blocks' | 'Bituminous Mastic';
export type RoadCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
export type TrafficClass = 'Very High' | 'High' | 'Medium' | 'Low';
export type ProtectionStatus = 'NORMAL' | 'PROTECTED' | 'SPECIAL_APPROVAL_REQUIRED' | 'EMERGENCY_OVERRIDE';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Road {
  id: string;
  code: string;
  name: string;
  category: RoadCategory;
  ownerAuthority: string;
  jurisdiction: Jurisdiction;
  widthMeters: number;
  lanes: number;
  surfaceType: RoadSurface;
  condition: RoadCondition;
  trafficClass: TrafficClass;
  lastResurfacedDate: string;
  protectionPeriodDays: number;
  protectionExpiryDate: string;
  protectionStatus: ProtectionStatus;
  geometry: LatLng[];
  lengthKm: number;
  activeWorkCount: number;
  historicalExcavationsCount: number;
}

export type InfrastructureType =
  | 'Water Pipeline'
  | 'Sewer Main'
  | 'Stormwater Drainage'
  | 'Electric 33kV/11kV'
  | 'Telecom OFC Duct'
  | 'PNG Gas Pipeline'
  | 'Metro Utility Conduit';

export interface InfrastructureAsset {
  id: string;
  assetType: InfrastructureType;
  ownerDepartment: DepartmentName;
  roadId: string;
  roadName: string;
  geometry: LatLng[];
  depthMeters: number;
  material: string;
  capacityOrDiameter: string;
  installationYear: number;
  condition: 'Good' | 'Fair' | 'Critical';
  lastInspectionDate: string;
  pressureOrVoltage?: string;
}

export type ProjectStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'VALIDATING'
  | 'CONFLICT_DETECTED'
  | 'COORDINATION'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PERMITTED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'WORK_COMPLETED'
  | 'INSPECTION'
  | 'RESTORATION'
  | 'RESTORATION_INSPECTION'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type TrafficImpact = 'Low' | 'Medium' | 'High' | 'Severe';
export type ProjectPriority = 'Routine' | 'Planned' | 'High Priority' | 'Emergency';

export interface ProjectDocument {
  id: string;
  title: string;
  type: 'DPR' | 'BOQ' | 'Engineering Drawing' | 'Traffic Plan' | 'Restoration Plan' | 'Safety Plan';
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  url?: string;
}

export interface WorkProgressLog {
  id: string;
  projectId: string;
  date: string;
  timestamp: string;
  progressPercentage: number;
  currentWorkPhase: string;
  workDoneComment: string;
  metersCompleted?: number;
  laborCount?: number;
  equipmentOnSite?: string;
  siteCondition?: string;
  photoUrls?: string[];
  loggedBy: string;
  loggedByRole?: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  department: DepartmentName;
  projectType: string;
  description: string;
  roadId: string;
  roadName: string;
  geometry: LatLng[];
  startCoordinates: LatLng;
  endCoordinates: LatLng;
  lengthMeters: number;
  requiredStartDate: string;
  requiredCompletionDate: string;
  expectedExcavationDurationDays: number;
  excavationWidthMeters: number;
  excavationDepthMeters: number;
  affectedAreaSqMeters: number;
  estimatedCostINR: number;
  estimatedExcavationCostINR: number;
  estimatedRestorationCostINR: number;
  trafficImpact: TrafficImpact;
  priority: ProjectPriority;
  isEmergency: boolean;
  emergencyReason?: string;
  contractorId?: string;
  contractorName?: string;
  status: ProjectStatus;
  documents: ProjectDocument[];
  submittedBy: string;
  submittedByDesignation: string;
  submittedAt: string;
  clusterId?: string;
  permitId?: string;
  conflictScore?: number;
  conflictSeverity?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  progressPercentage: number;
  currentWorkPhase?: string;
  progressLogs?: WorkProgressLog[];
  lastProgressUpdate?: string;
}

export interface Conflict {
  id: string;
  projectAId: string;
  projectAName: string;
  projectADept: DepartmentName;
  projectBId: string;
  projectBName: string;
  projectBDept: DepartmentName;
  roadId: string;
  roadName: string;
  spatialOverlapPct: number;
  spatialOverlapDistanceMeters: number;
  temporalOverlapDays: number;
  conflictScore: number;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  reasons: string[];
  status: 'DETECTED' | 'IN_COORDINATION' | 'RESOLVED' | 'OVERRIDDEN';
  createdAt: string;
  conflictType?: string;
  description?: string;
  recommendedResolution?: string;
}

export interface CoordinationCluster {
  id: string;
  clusterCode: string;
  name: string;
  roadId: string;
  roadName: string;
  projectIds: string[];
  projects: Project[];
  recommendedWindowStart: string;
  recommendedWindowEnd: string;
  recommendedSequence: string[];
  excavationsAvoided: number;
  restorationsAvoided: number;
  estimatedCostSavedINR: number;
  trafficDisruptionReductionPct: number;
  aiConfidence: number;
  aiReasoning: string[];
  status: 'PROPOSED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  departmentApprovals: Record<string, {
    approved: boolean;
    officer: string;
    designation: string;
    timestamp: string;
    notes?: string;
  }>;
  rejectionHistory?: Array<{
    rejectedBy: string;
    designation: string;
    department: string;
    reason: string;
    timestamp: string;
  }>;
  createdAt: string;
}

export type WorkCompatibilityType =
  | 'DIRECTLY_COMPATIBLE'
  | 'SEQUENTIALLY_COMPATIBLE'
  | 'CONDITIONALLY_COMPATIBLE'
  | 'NOT_COMPATIBLE';

export interface CandidateCoordinationPlan {
  planId: 'PLAN_A' | 'PLAN_B' | 'PLAN_C';
  planName: string;
  isRecommended: boolean;
  strategySummary: string;
  startDate: string;
  endDate: string;
  totalDurationDays: number;
  sequenceSteps: string[];
  excavationEventsCount: number;
  restorationEventsCount: number;
  trafficDisruptionReductionPct: number;
  projectDelayDays: number;
  dependencySatisfied: boolean;
  estimatedFinancialSavingINR: number;
  score: number;
  pros: string[];
  cons: string[];
}

export type DataProvenanceTag = 'VERIFIED_HISTORICAL' | 'CURRENT_REPORT' | 'AI_INFERENCE' | 'DEMO_DATA';

export interface NashikSensitiveJunctionReport {
  junctionId: string;
  name: string;
  peakWindow: string;
  peakHourPCU?: number;
  sensitivity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskFactors: string[];
  hasPeakHourOverlap: boolean;
  overlapWarning?: string;
  sourceDocument: string;
  provenance: DataProvenanceTag;
}

export interface NashikSafetyReport {
  location: string;
  accidentCountAnnual: number;
  seriousInjuries: number;
  fatalities: number;
  isBlackspot: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  provenance: DataProvenanceTag;
}

export interface NashikIntelligenceReport {
  roadName: string;
  historicalVC: number;
  vcCategory: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH' | 'CRITICAL';
  trafficPressureScore: number; // 0-100 normalized
  sourceYear: number;
  sourceDocument: string;
  
  sensitiveJunctions: NashikSensitiveJunctionReport[];
  safetyLocations: NashikSafetyReport[];
  
  isSimhasthaPriorityRoad: boolean;
  simhasthaPhase?: number;
  simhasthaDeadline?: string;
  
  isMonsoonRestrictionActive: boolean;
  monsoonAdvisory?: string;
  
  daysSinceLastRestored?: number;
  reworkRiskLevel: 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  reworkAdvisory?: string;
  
  dependencyHub?: string;
  connectedCorridors: string[];
  networkSpilloverRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  dataBasisSummary: {
    cttpBaseline: string;
    trafficSurveySource: string;
    smartCityITMSStatus: string;
    roadHistorySource: string;
    provenanceTags: Record<string, DataProvenanceTag>;
  };
}

export interface FactorScoreBreakdown {
  spatialRelationship: number;     // 20%
  temporalRelationship: number;    // 15%
  workCompatibility: number;       // 15%
  trafficImpact: number;           // 15%
  roadHistory: number;             // 10%
  safety: number;                  // 5%
  seasonEventConstraints: number;  // 10%
  networkDependency: number;       // 10%
  totalCalculatedScore: number;    // 0-100
  // Detailed sub-scores for legacy UI compatibility
  spatialOverlapScore?: number;
  temporalOverlapScore?: number;
  nearbyProximityScore?: number;
  recentRestorationScore?: number;
  trafficSensitivityScore?: number;
  criticalRoadScore?: number;
  workCompatibilityScore?: number;
  sharedExcavationScore?: number;
}

export interface AICoordinationAnalysisResult {
  projectId: string;
  projectCode: string;
  projectName: string;
  department: DepartmentName;
  roadId: string;
  roadName: string;
  isEmergency: boolean;
  proximityThresholdMeters: number;
  
  hasRelationship: boolean;
  conflictType: 'CONFLICT' | 'COORDINATION_OPPORTUNITY' | 'NONE';
  coordinationPriority: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  overallScore: number;
  scoreBreakdown: FactorScoreBreakdown;
  
  nashikIntelligence: NashikIntelligenceReport;
  
  relatedProjects: Array<{
    id: string;
    code: string;
    name: string;
    department: DepartmentName;
    startDate: string;
    endDate: string;
    depthMeters: number;
    spatialRelationship: string;
    temporalRelationship: string;
    overlapDays: number;
    distanceMeters: number;
    compatibility: WorkCompatibilityType;
  }>;
  
  roadContext: {
    roadCategory: string;
    trafficClass: string;
    trafficSensitivity: 'High' | 'Medium' | 'Low';
    isProtected: boolean;
    protectionExpiryDate?: string;
    daysSinceLastResurfaced?: number;
    moratoriumActive: boolean;
    lastExcavationDept?: string;
  };
  
  candidatePlans: CandidateCoordinationPlan[];
  selectedPlan: CandidateCoordinationPlan;
  
  impactSummary: {
    excavationsAvoided: number;
    restorationsAvoided: number;
    trafficDisruptionReductionPct: number;
    estimatedCostSavedINR: number;
    baselineExcavations: number;
    coordinatedExcavations: number;
    baselineRestorations: number;
    coordinatedRestorations: number;
  };
  
  aiExplanation: string;
  reasoningFactors: string[];
  aiConfidencePct: number;
  risksAndMitigations: Array<{ risk: string; mitigation: string }>;
  
  clusterId?: string;
  clusterCode?: string;
}

export type AnalysisSensitivityLevel = 'PUBLIC' | 'INTERNAL' | 'RESTRICTED' | 'CONFIDENTIAL';

export interface DepartmentActionItem {
  department: DepartmentName;
  projectCode: string;
  projectName: string;
  depthHierarchyOrder: number;
  depthMeters: number;
  trenchDimensions: string;
  mobilizationDate: string;
  completionDate: string;
  preRequisites: string[];
  safetyMandates: string[];
  postInstallationQC: string[];
}

export interface InfrastructureAnalysisReport {
  analysisId: string;
  version: string;
  sensitivity: AnalysisSensitivityLevel;
  generatedAt: string;
  generatedBy: string;
  generatedByRole: string;
  projectId: string;
  project: Project;
  problemStatement: {
    headline: string;
    riskSummary: string;
    duplicateDigsRisk: string;
    monsoonSafetyRisk?: string;
    trafficGridlockRisk: string;
    pavementDestructionCost: string;
  };
  whatWasAnalyzed: {
    corridorName: string;
    totalLengthMeters: number;
    historicalVC: number;
    vcCategory: string;
    junctionSensitivities: string[];
    recentRestorationStatus: string;
    simhasthaKumbhMandate?: string;
    monsoonPolicyStatus: string;
  };
  conflictsFound: Array<{
    clashId: string;
    pair: string;
    severity: string;
    spatialOverlap: string;
    temporalOverlap: string;
    hazardSummary: string;
  }>;
  aiProposedSolution: {
    selectedPlanId: 'PLAN_A' | 'PLAN_B' | 'PLAN_C';
    planName: string;
    summary: string;
    windowDates: string;
    durationDays: number;
    depthSequence: string[];
    singleRestorationType: string;
  };
  whyThisSolution: {
    engineeringJustification: string;
    geotechnicalSafety: string;
    scoreExplanation: string;
  };
  whatWillItSave: {
    excavationsEliminated: number;
    restorationsEliminated: number;
    trafficDisruptionReductionPct: number;
    costSavingsINR: number;
    costSavingsLakhs: string;
  };
  risksAndMitigations: Array<{ risk: string; mitigation: string }>;
  departmentActionChecklist: DepartmentActionItem[];
  approvalRecommendation: {
    statutoryApprovalRecommended: boolean;
    recommendedDesignation: string;
    statutoryActReference: string;
    conditions: string[];
  };
  auditMetadata: {
    sourceCity: string;
    dataProvenance: string;
    auditHash: string;
  };
}

export interface QualityInspectorOperationalView {
  projectId: string;
  projectCode: string;
  roadName: string;
  approvedWorkWindow: string;
  assignedDepartment: string;
  contractor: string;
  depthMeters: number;
  inspectionChecklist: Array<{ item: string; mandatory: boolean; checked: boolean }>;
  safetyRequirements: string[];
}

export interface PublicProjectStatusSummary {
  projectId: string;
  projectCode: string;
  roadName: string;
  publicStatus: string;
  expectedTimeline: string;
  trafficAdvisory: string;
  departmentInvolved: string;
}

export interface ApprovalStep {
  id: string;
  stepName: string;
  roleRequired: UserRole | string;
  departmentRequired: DepartmentName | 'Traffic Authority' | 'Road Authority' | 'Municipal Authority';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'SKIPPED';
  approverName?: string;
  approverDesignation?: string;
  actionDate?: string;
  remarks?: string;
  overrideAI?: boolean;
  overrideReason?: string;
}

export interface ApprovalWorkflow {
  id: string;
  projectId: string;
  projectName: string;
  department: DepartmentName;
  currentStepIndex: number;
  steps: ApprovalStep[];
  overallStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_REVISION';
  updatedAt: string;
}

export interface RoadOpeningPermit {
  id: string;
  permitNumber: string;
  projectId: string;
  projectName: string;
  clusterId?: string;
  department: DepartmentName;
  roadId: string;
  roadName: string;
  contractorName: string;
  contractorContact: string;
  approvedGeometry: LatLng[];
  validFrom: string;
  validTo: string;
  excavationDimensions: {
    lengthMeters: number;
    widthMeters: number;
    depthMeters: number;
    totalAreaSqM: number;
  };
  trafficConditions: string[];
  safetyGuidelines: string[];
  restorationDeadline: string;
  securityDepositINR: number;
  qrCodeDataUrl: string;
  status: 'ISSUED' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'COMPLETED' | 'REVOKED';
  issuedBy: string;
  issuedByDesignation: string;
  issuedAt: string;
}

export interface InspectionPhoto {
  id: string;
  photoType: 'BEFORE_WORK' | 'DURING_WORK' | 'INFRA_INSTALLED' | 'BACKFILL' | 'RESTORATION' | 'FINAL_ROAD';
  url: string;
  timestamp: string;
  gps: LatLng;
  uploadedBy: string;
  aiAnalysis?: {
    flags: string[];
    riskScore: number;
    surfaceDiscontinuityDetected: boolean;
    barricadeCompliance: boolean;
  };
}

export interface Inspection {
  id: string;
  projectId: string;
  projectName: string;
  permitId: string;
  permitNumber: string;
  inspectionType: 'PRE_COMMENCEMENT' | 'IN_PROGRESS_SAFETY' | 'POST_INFRASTRUCTURE' | 'RESTORATION_QC' | 'FINAL_CLEARANCE';
  inspectorId: string;
  inspectorName: string;
  inspectorDesignation: string;
  result: 'PENDING' | 'PASS' | 'FAIL' | 'CORRECTION_REQUIRED';
  remarks: string;
  aiFlags: Array<{
    issue: string;
    confidence: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    suggestion: string;
  }>;
  photos: InspectionPhoto[];
  inspectedAt: string;
}

export interface RestorationRecord {
  id: string;
  projectId: string;
  permitId: string;
  roadId: string;
  roadName: string;
  contractorName: string;
  restorationDate: string;
  methodUsed: string;
  layerThicknessMm: number;
  compactionTestPassed: boolean;
  surfaceIntegrityScore: number;
  protectionPeriodDays: number;
  protectionExpiryDate: string;
  inspectorSignature: string;
  status: 'SUBMITTED' | 'VERIFIED_PASS' | 'REWORK_ORDERED';
}

export interface RoadWorkHistoryItem {
  id: string;
  roadId: string;
  roadName: string;
  date: string;
  projectId: string;
  projectName: string;
  department: DepartmentName;
  infrastructureType: string;
  excavationDurationDays: number;
  completionDate: string;
  restorationDate: string;
  inspectionResult: string;
  contractor: string;
  documentsCount: number;
}

export interface CitizenComplaint {
  id: string;
  complaintNumber: string;
  roadId: string;
  roadName: string;
  category:
    | 'UNAUTHORIZED_EXCAVATION'
    | 'UNPAVED_POTHOLE_AFTER_WORK'
    | 'MISSING_BARRICADES_HAZARD'
    | 'WATER_LEAK_ROAD_DAMAGE'
    | 'DEBRIS_DUMPING'
    | 'TRAFFIC_JAM_DUE_TO_DIGGING';
  complaintType?: string;
  description: string;
  photoUrl?: string;
  location: LatLng;
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'ACTION_TAKEN' | 'RESOLVED';
  priority?: 'NORMAL' | 'HIGH' | 'CRITICAL_HAZARD';
  linkedProjectId?: string;
  linkedDepartment?: DepartmentName;
  linkedContractor?: string;
  citizenName: string;
  citizenPhone: string;
  reportedAt: string;
  assignedOfficer?: string;
  assignedOfficerDesignation?: string;
  mayorActionNotice?: string;
  actionTakenNotes?: string;
  resolvedAt?: string;
}

export interface SystemNotification {
  id: string;
  targetRole?: UserRole | 'ALL';
  targetDepartment?: DepartmentName | 'ALL';
  targetUserId?: string;
  title: string;
  message: string;
  type: 'CONFLICT' | 'COORDINATION' | 'APPROVAL' | 'PERMIT' | 'EXTENSION' | 'INSPECTION' | 'EMERGENCY' | 'COMPLAINT';
  link?: string;
  isRead: boolean;
  timestamp: string;
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  role: string;
  department: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
}

export interface CityAnalyticsSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingApprovals: number;
  highRiskProjects: number;
  coordinationClustersCount: number;
  activeExcavationsCount: number;
  recentlyRestoredRoadsCount: number;
  emergencyProjectsCount: number;
  delayedProjectsCount: number;
  openComplaintsCount: number;
  
  // Real outcome vs Modelled projection separation
  verifiedSavingsINR: number;
  projectedSavingsINR: number;
  totalEstimatedSavingsINR: number;
  
  verifiedExcavationsAvoided: number;
  projectedExcavationsAvoided: number;
  excavationsAvoided: number;
  restorationsAvoided: number;
  
  trafficDisruptionReductionPct: number;
  modelledTrafficDisruptionReductionPct: number;
  
  avgApprovalHours: number;
  avgRestorationDays: number;
  departmentPerformance: Array<{
    department: DepartmentName;
    totalProjects: number;
    coordinatedProjects: number;
    complianceScore: number;
    avgDelayDays: number;
  }>;
}

export interface SystemSettingsConfig {
  defaultProtectionDays: number;
  seniorApprovalThresholdINR: number;
  highTrafficAutoTrafficAuthority: boolean;
  conflictWeights: {
    sameRoad: number;
    geometryOverlap: number;
    proximityBuffer: number;
    timeOverlap: number;
    recentRestoration: number;
    highTrafficSensitivity: number;
    compatibleWorkBonus: number;
  };
  excavationCostPerSqM: number;
  restorationCostPerSqM: number;
}

export type CorporationType =
  | 'MUNICIPAL_CORPORATION'
  | 'SMART_CITY_SPV'
  | 'NAGAR_NIGAM'
  | 'METROPOLITAN_DEV_AUTHORITY'
  | 'URBAN_LOCAL_BODY';

export interface CityPortalConfig {
  id: string;
  name: string;
  state: string;
  district: string;
  corporationName: string;
  corporationType: CorporationType;
  cityAccessCode: string;
  coordinates: LatLng;
  commissionerName: string;
  nodalOfficerName: string;
  wardCount: number;
  activeWards: string[];
  totalRoadsKm: number;
  createdDate: string;
  departmentConnectionCodes: {
    pwd: string;
    water: string;
    electricity: string;
    gas: string;
    telecom: string;
    traffic: string;
    contractor: string;
  };
  isProductionActive: boolean;
}

export interface CityConnectionRequest {
  cityAccessCode: string;
  departmentKey?: string;
  authorityName: string;
  authorityDesignation: string;
  authorityEmail: string;
  department: DepartmentName | 'Administration' | 'Independent Contractor';
}

