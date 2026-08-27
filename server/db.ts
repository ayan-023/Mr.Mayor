/**
 * MR. MAYOR - Full Database & State Engine (Manual / Zero Sample Data Mode)
 * Stores users, roads, assets, projects, conflicts, clusters, workflows, permits, inspections, complaints, audit logs.
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
  RestorationRecord,
  RoadWorkHistoryItem,
  WorkProgressLog,
  CitizenComplaint,
  SystemNotification,
  AuditLogItem,
  SystemSettingsConfig,
  CityPortalConfig,
  CityConnectionRequest,
  CoordinationCase,
  ProjectExecutionStage,
  ContractorAllocationRecord,
  DepartmentConcurrenceRecord,
  AuditTimelineEvent,
  ExecutionStrategy,
  DepartmentName,
} from '../src/types/index.js';

export interface DatabaseState {
  users: User[];
  roads: Road[];
  assets: InfrastructureAsset[];
  projects: Project[];
  conflicts: Conflict[];
  clusters: CoordinationCluster[];
  coordinationCases: CoordinationCase[];
  contractors: any[];
  workflows: ApprovalWorkflow[];
  permits: RoadOpeningPermit[];
  inspections: Inspection[];
  restorations: RestorationRecord[];
  history: RoadWorkHistoryItem[];
  complaints: CitizenComplaint[];
  notifications: SystemNotification[];
  auditLogs: AuditLogItem[];
  settings: SystemSettingsConfig;
}


export function generateDefaultExecutionStages(roadName?: string): ProjectExecutionStage[] {
  return [
    {
      stageId: 'STAGE-1-PREP',
      name: 'Site Preparation & Safety Barricading',
      sequence: 1,
      status: 'NOT_STARTED',
      workDoneNotes: 'Erect IRC:SP:55 compliant retro-reflective barricades, solar flashers, and traffic diversion signages.',
    },
    {
      stageId: 'STAGE-2-TRENCH',
      name: 'Trench Excavation & Subsurface Clearance',
      sequence: 2,
      status: 'NOT_STARTED',
      workDoneNotes: 'Micro-trenching / JCB saw-cutting along approved alignment with GPR subsurface radar scanning.',
    },
    {
      stageId: 'STAGE-3-INSTALL',
      name: 'Utility Infrastructure Installation & Jointing',
      sequence: 3,
      status: 'NOT_STARTED',
      workDoneNotes: 'Laying approved conduits / ductile iron water mains / MDPE gas pipes at specified statutory depths.',
    },
    {
      stageId: 'STAGE-4-TEST',
      name: 'Hydrostatic / Continuity Testing & Inspection',
      sequence: 4,
      status: 'NOT_STARTED',
      workDoneNotes: 'Pressure testing, optical OTDR continuity test, and joint integrity sign-off.',
    },
    {
      stageId: 'STAGE-5-BACKFILL',
      name: 'Layered Backfilling & 95%+ Proctor Compaction',
      sequence: 5,
      status: 'NOT_STARTED',
      workDoneNotes: 'Granular sub-base (GSB) layering with plate compactor and heavy tandem roller testing.',
    },
    {
      stageId: 'STAGE-6-RESTORE',
      name: 'Pavement Surface Restoration & Asphalting',
      sequence: 6,
      status: 'NOT_STARTED',
      workDoneNotes: 'Bituminous concrete / M40 grade cement concrete surface relaying and road reopening.',
    },
  ];
}

export const INITIAL_CONTRACTORS = [
  {
    contractorId: 'CTR-NSK-01',
    contractorName: 'M/s InfraTech Construction Ltd.',
    specialization: 'Multi-Utility Micro-Trenching & Smart City OFC',
    capacity: '8 Active Teams',
    activeProjectsCount: 2,
    rating: 4.8,
    complianceScore: 98,
    phone: '+91 98221 44550',
    email: 'ops@infratech-nashik.in',
  },
  {
    contractorId: 'CTR-NSK-02',
    contractorName: 'Ashoka Buildcon Ltd. (Nashik)',
    specialization: 'Highway Expansion & PWD Bituminous Road Restoration',
    capacity: '15 Heavy Machinery Crews',
    activeProjectsCount: 3,
    rating: 4.9,
    complianceScore: 99,
    phone: '+91 253 222 6677',
    email: 'projects@ashokabuildcon.com',
  },
  {
    contractorId: 'CTR-NSK-03',
    contractorName: 'M/s Godavari Deep Utilities & Trenching',
    specialization: 'Deep Water Mains (2.5m+) & Heavy Stormwater Culverts',
    capacity: '6 Hydraulic Excavator Units',
    activeProjectsCount: 1,
    rating: 4.7,
    complianceScore: 95,
    phone: '+91 94222 88991',
    email: 'contracts@godavariutilities.in',
  },
  {
    contractorId: 'CTR-NSK-04',
    contractorName: 'M/s Western Gas Infrastructure Services',
    specialization: 'High-Safety MDPE Gas Pipelines & Fusion Jointing',
    capacity: '5 Specialized Fusion Teams',
    activeProjectsCount: 1,
    rating: 4.9,
    complianceScore: 99,
    phone: '+91 98900 11223',
    email: 'gas.projects@westerngas.in',
  },
];

export const INITIAL_COORDINATION_CASES: CoordinationCase[] = [
  {
    id: 'cc-nsk-001',
    caseNumber: 'CC-NSK-2026-001',
    corridorName: 'Gangapur Road Multi-Agency Coordination Corridor',
    roadId: 'RD-NSK-02',
    roadName: 'Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)',
    status: 'AI_ANALYZED',
    primaryProjectId: 'PROJ-NSK-2026-04',
    primaryProjectName: 'Gangapur Road 400mm Feeder Pipeline Replacement',
    relatedProjectIds: ['PROJ-NSK-2026-03', 'PROJ-NSK-2026-04', 'PROJ-NSK-2026-05'],
    participatingDepartments: [
      {
        departmentId: 'DEPT-WATER',
        departmentName: 'Water & Sewerage',
        isOwner: true,
        concurrenceStatus: 'PENDING',
        officerName: 'Er. Sanjay Shinde',
        officerDesignation: 'Executive Engineer (Water Supply)',
        officerUserId: 'usr-nsk-03',
        concurrenceNotes: 'Lead utility owner. 400mm DI water main requiring 2.5m depth bedding.',
      },
      {
        departmentId: 'DEPT-GAS',
        departmentName: 'City Gas Distribution',
        isOwner: false,
        concurrenceStatus: 'PENDING',
        officerName: 'Er. Prashant Wagh',
        officerDesignation: 'CPM (MNGL Gas)',
        officerUserId: 'usr-nsk-03c',
        concurrenceNotes: '125mm MDPE gas line at 1.8m depth, offset 0.8m from water line.',
      },
      {
        departmentId: 'DEPT-TELECOM',
        departmentName: 'Telecom & Digital',
        isOwner: false,
        concurrenceStatus: 'PENDING',
        officerName: 'Er. Priya Sharma',
        officerDesignation: 'Chief Telecom Officer (BSNL)',
        officerUserId: 'usr-nsk-03d',
        concurrenceNotes: '8-way HDPE telecom duct at 1.2m depth.',
      },
    ],
    recommendedStrategy: 'COORDINATED',
    selectedStrategy: 'COORDINATED',
    strategyDecisionReason: 'High temporal overlap (45 days) and spatial collinearity on Gangapur Road corridor. Single-trench joint excavation avoids 2 independent road cuts and saves ₹1.26 Cr.',
    executionWindow: {
      startDate: '2026-08-01T00:00:00.000Z',
      endDate: '2026-09-25T00:00:00.000Z',
      durationDays: 55,
    },
    executionSequence: [
      'Stage 1: Common Corridor Safety Barricading & Traffic Diversion (PWD & Traffic Police)',
      'Stage 2: Single-Window Deep Trench Excavation (Water & Drainage - 2.5m depth)',
      'Stage 3: 400mm Water Main Laying & Bedding (Water Supply)',
      'Stage 4: Intermediate Backfill & Gas Pipeline Installation (MNGL - 1.8m depth)',
      'Stage 5: Upper Trench Backfill & Telecom 8-Way OFC Duct Laying (BSNL - 1.2m depth)',
      'Stage 6: Final 95%+ Proctor Compaction & Unified Asphalt Pavement Restoration (PWD)',
    ],
    candidatePlans: [
      {
        planId: 'PLAN_A',
        planName: 'Plan A: Unified Multi-Agency Single-Window Excavation (Recommended)',
        isRecommended: true,
        strategySummary: 'Shared single trench, sequential depth laying from deepest (Water 2.5m) to shallowest (Telecom 1.2m), followed by a single M40 bituminous restoration.',
        startDate: '2026-08-01',
        endDate: '2026-09-25',
        totalDurationDays: 55,
        sequenceSteps: [
          'Unified Trench Excavation (0 to 2.5m depth)',
          'Water Pipe Laying (2.5m)',
          'Intermediate Backfill & Gas Pipe Laying (1.8m)',
          'Telecom Duct Installation (1.2m)',
          'Single Unified Road Surface Restoration',
        ],
        excavationEventsCount: 1,
        restorationEventsCount: 1,
        trafficDisruptionReductionPct: 62,
        projectDelayDays: 0,
        dependencySatisfied: true,
        estimatedFinancialSavingINR: 12590000,
        score: 96,
        pros: [
          'Saves ₹1.26 Cr in public restoration budget',
          'Eliminates 2 redundant road cuts',
          'Reduces citizen disruption period by 62%',
          'Single consolidated contractor mobilization',
        ],
        cons: [
          'Requires tight inter-agency alignment and common daily standups',
        ],
      },
      {
        planId: 'PLAN_B',
        planName: 'Plan B: Phased Sequential Excavation with Immediate Trench Sharing',
        isRecommended: false,
        strategySummary: 'Water supply excavates first; Gas and Telecom join immediately before backfilling.',
        startDate: '2026-08-01',
        endDate: '2026-10-15',
        totalDurationDays: 75,
        sequenceSteps: [
          'Water Main Trenching & Laying',
          'Gas Pipeline Installation',
          'Telecom OFC Laying',
          'Final Restoration',
        ],
        excavationEventsCount: 2,
        restorationEventsCount: 1,
        trafficDisruptionReductionPct: 38,
        projectDelayDays: 20,
        dependencySatisfied: true,
        estimatedFinancialSavingINR: 6800000,
        score: 74,
        pros: [
          'Less dependency on simultaneous start date',
          'Saves 1 restoration event',
        ],
        cons: [
          'Higher total corridor closure duration (75 days vs 55 days)',
          'Lower overall financial savings',
        ],
      },
      {
        planId: 'PLAN_C',
        planName: 'Plan C: Isolated Standalone Excavation (Uncoordinated)',
        isRecommended: false,
        strategySummary: 'Each utility digs and restores independently across 6 months.',
        startDate: '2026-08-01',
        endDate: '2027-02-15',
        totalDurationDays: 195,
        sequenceSteps: [
          'Water Dig & Restore (Aug - Sep)',
          'Gas Dig & Restore (Oct - Nov)',
          'Telecom Dig & Restore (Dec - Jan)',
        ],
        excavationEventsCount: 3,
        restorationEventsCount: 3,
        trafficDisruptionReductionPct: 0,
        projectDelayDays: 0,
        dependencySatisfied: false,
        estimatedFinancialSavingINR: 0,
        score: 25,
        pros: ['Autonomous execution without cross-department coordination meetings'],
        cons: [
          'Severe road destruction: 3 repeated excavations within 6 months',
          'Violates NMC 1-year Road Protection Moratorium',
          'High risk of accidental utility strikes and citizen outrage',
        ],
      },
    ],
    selectedPlanId: 'PLAN_A',
    aiConfidence: 94,
    aiSummary: 'Optimal coordination candidate: 3 statutory agencies with collinear trench alignment on Gangapur Road corridor. Single-trench execution eliminates ₹1.26 Cr in repeated restoration expenditure.',
    projectedCostSavedINR: 12590000,
    projectedExcavationsAvoided: 2,
    verifiedCostSavedINR: 0,
    verifiedExcavationsAvoided: 0,
    trafficDisruptionReductionPct: 62,
    dataLimitations: [
      'Traffic volume model based on CTTP 2016 baseline (V/C 1.14 on Gangapur Road).',
      'Geotechnical depth cross-section subject to on-site GPR radar verification during Stage 2.',
    ],
    stages: generateDefaultExecutionStages('Gangapur Road'),
    contractorAllocations: [],
    qcInspections: [],
    auditTimeline: [
      {
        id: 'AUD-CC-01',
        timestamp: '2026-08-20T10:00:00.000Z',
        actorId: 'SYSTEM',
        actorName: 'MR. MAYOR Coordination Engine',
        actorRole: 'SYSTEM_INTELLIGENCE',
        actorDepartment: 'Smart City & Urban Planning',
        stage: 'SYSTEM_ANALYSIS',
        action: 'COORDINATION_OPPORTUNITY_DETECTED',
        details: 'Cluster relationship identified for Water (PROJ-NSK-2026-04), Gas (PROJ-NSK-2026-03), and Telecom (PROJ-NSK-2026-05) on Gangapur Road.',
        badgeColor: 'blue',
      },
      {
        id: 'AUD-CC-02',
        timestamp: '2026-08-20T10:05:00.000Z',
        actorId: 'SYSTEM',
        actorName: 'Gemini Civil Engineering Engine',
        actorRole: 'AI_ANALYST',
        actorDepartment: 'Smart City & Urban Planning',
        stage: 'AI_ANALYSIS',
        action: 'CANDIDATE_PLANS_SYNTHESIZED',
        details: 'Synthesized Plan A (Unified Coordinated), Plan B (Phased), and Plan C (Standalone). Plan A recommended with 94% confidence.',
        badgeColor: 'indigo',
      },
    ],
    createdAt: '2026-08-20T10:00:00.000Z',
    createdBy: 'SYSTEM_COORDINATION_ENGINE',
    updatedAt: '2026-08-20T10:05:00.000Z',
  },
];

// All users initialized to empty array for manual entry
const INITIAL_USERS: User[] = [
  // 1. Municipal Leadership & Statutory Authorities
  {
    "id": "usr-nsk-01",
    "name": "Dr. Pravin Gedam (IAS)",
    "email": "commissioner@bbmp.gov.in",
    "role": "COMMISSIONER",
    "designation": "Municipal Commissioner & CEO",
    "department": "Smart City & Urban Planning",
    "jurisdiction": "Citywide",
    "permissions": [
      "project.view",
      "project.approve",
      "project.reject",
      "coordination.view",
      "coordination.approve",
      "permit.revoke",
      "road.edit",
      "analytics.view",
      "audit.view",
      "users.manage"
    ],
    "phone": "+91 253 257 5631"
  },
  {
    "id": "usr-nsk-01b",
    "name": "Shri. Pradeep Choudhary",
    "email": "addl.commissioner@nmc.gov.in",
    "role": "COMMISSIONER",
    "designation": "Additional Municipal Commissioner (City Infrastructure)",
    "department": "Smart City & Urban Planning",
    "jurisdiction": "Citywide",
    "permissions": [
      "project.view",
      "project.approve",
      "coordination.view",
      "coordination.approve",
      "permit.revoke",
      "road.edit",
      "analytics.view",
      "audit.view"
    ],
    "phone": "+91 253 257 8890"
  },
  {
    "id": "usr-nsk-02",
    "name": "Er. Rajesh Kulkarni",
    "email": "nodal.officer@nmc.gov.in",
    "role": "NODAL_OFFICER",
    "designation": "Chief City Infrastructure Nodal Officer",
    "department": "Smart City & Urban Planning",
    "jurisdiction": "Citywide",
    "permissions": [
      "project.view",
      "project.edit",
      "coordination.view",
      "coordination.create",
      "coordination.approve",
      "permit.create",
      "permit.view",
      "inspection.approve",
      "analytics.view",
      "audit.view",
      "road.edit"
    ],
    "phone": "+91 98220 44812"
  },

  // 2. Specialized Utility Executive Engineers
  {
    "id": "usr-nsk-03",
    "name": "Er. Sanjay Shinde",
    "email": "ee.water@bbmp.gov.in",
    "role": "EXECUTIVE_ENGINEER",
    "designation": "Executive Engineer (Water Supply & Sewerage)",
    "department": "Water & Sewerage",
    "jurisdiction": "Citywide",
    "permissions": [
      "project.view",
      "project.create",
      "coordination.view",
      "permit.view"
    ],
    "phone": "+91 94222 18903"
  },
  {
    "id": "usr-nsk-03b",
    "name": "Er. Deepak Jadhav",
    "email": "se.power@msedcl.in",
    "role": "EXECUTIVE_ENGINEER",
    "designation": "Superintending Engineer (MSEDCL 33kV Power Distribution)",
    "department": "Electricity (DISCOM)",
    "jurisdiction": "Central Zone",
    "permissions": [
      "project.view",
      "project.create",
      "coordination.view",
      "permit.view"
    ],
    "phone": "+91 98224 55102"
  },
  {
    "id": "usr-nsk-03c",
    "name": "Er. Prashant Wagh",
    "email": "cpm.gas@mngl.in",
    "role": "EXECUTIVE_ENGINEER",
    "designation": "Chief Project Manager (MNGL City Gas Distribution)",
    "department": "City Gas Distribution",
    "jurisdiction": "West Zone",
    "permissions": [
      "project.view",
      "project.create",
      "coordination.view",
      "permit.view"
    ],
    "phone": "+91 98901 77334"
  },
  {
    "id": "usr-nsk-04",
    "name": "Er. Nitin Rajput",
    "email": "se.pwd@nmc.gov.in",
    "role": "DEPT_HEAD",
    "designation": "Superintending Engineer (Roads & Bridges - PWD)",
    "department": "Roads / PWD",
    "jurisdiction": "Citywide",
    "permissions": [
      "project.view",
      "project.create",
      "coordination.view",
      "permit.create",
      "permit.view"
    ],
    "phone": "+91 98505 67231"
  },
  {
    "id": "usr-nsk-03d",
    "name": "Er. Priya Sharma",
    "email": "telecom.nodal@bsnl.in",
    "role": "EXECUTIVE_ENGINEER",
    "designation": "Chief Telecom & OFC Officer (BharatNet / Smart City)",
    "department": "Telecom & Digital",
    "jurisdiction": "Citywide",
    "permissions": [
      "project.view",
      "project.create",
      "coordination.view",
      "permit.view"
    ],
    "phone": "+91 94220 88711"
  },
  {
    "id": "usr-nsk-03e",
    "name": "Er. Sunil Gaikwad",
    "email": "ee.drainage@nmc.gov.in",
    "role": "EXECUTIVE_ENGINEER",
    "designation": "Executive Engineer (Stormwater Drainage & Culverts)",
    "department": "Drainage Department",
    "jurisdiction": "North Zone",
    "permissions": [
      "project.view",
      "project.create",
      "coordination.view",
      "permit.view"
    ],
    "phone": "+91 98229 33418"
  },
  {
    "id": "usr-nsk-03f",
    "name": "DCP Sandeep Patil",
    "email": "dcp.traffic@nashikpolice.gov.in",
    "role": "DEPT_HEAD",
    "designation": "Deputy Commissioner of Police (Traffic Management)",
    "department": "Traffic Police Authority",
    "jurisdiction": "Citywide",
    "permissions": [
      "project.view",
      "coordination.view",
      "permit.view"
    ],
    "phone": "+91 253 230 5233"
  },

  // 3. Quality & Safety QC Inspectors
  {
    "id": "usr-nsk-05",
    "name": "Er. Mahesh Patil",
    "email": "inspector.qc@bbmp.gov.in",
    "role": "INSPECTOR",
    "designation": "Senior Quality & Safety Inspector (Proctor Compaction Lead)",
    "department": "Roads / PWD",
    "jurisdiction": "West Zone",
    "permissions": [
      "inspection.create",
      "inspection.view",
      "permit.view",
      "complaint.view"
    ],
    "phone": "+91 97631 88920"
  },
  {
    "id": "usr-nsk-05b",
    "name": "Er. Kavita Jadhav",
    "email": "safety.auditor@nmc.gov.in",
    "role": "INSPECTOR",
    "designation": "Ward Safety & Barricade Compliance Auditor",
    "department": "Roads / PWD",
    "jurisdiction": "Central Zone",
    "permissions": [
      "inspection.create",
      "inspection.view",
      "permit.view",
      "complaint.view"
    ],
    "phone": "+91 98902 44109"
  },

  // 4. Class-A Registered Contractors
  {
    "id": "usr-nsk-06",
    "name": "Er. Nilesh Bafna",
    "email": "contractor.infra@buildcon.in",
    "role": "CONTRACTOR",
    "designation": "Project Director (Ashoka Buildcon Ltd. - NH-60 Widening)",
    "department": "Independent Contractor",
    "jurisdiction": "South Zone",
    "permissions": [
      "permit.view",
      "project.view"
    ],
    "phone": "+91 98230 55109"
  },
  {
    "id": "usr-nsk-06b",
    "name": "Er. Sunil Mahajan",
    "email": "project.head@larsentoubro.com",
    "role": "CONTRACTOR",
    "designation": "Senior Project Manager (L&T Construction - Ring Road Lead)",
    "department": "Independent Contractor",
    "jurisdiction": "Ring Corridor",
    "permissions": [
      "permit.view",
      "project.view"
    ],
    "phone": "+91 98221 44550"
  },
  {
    "id": "usr-nsk-06c",
    "name": "Er. Anand Deshmukh",
    "email": "director@eagleinfra.in",
    "role": "CONTRACTOR",
    "designation": "Executive Director (Eagle Infra India Ltd. - Utility Pipelines)",
    "department": "Independent Contractor",
    "jurisdiction": "West Zone",
    "permissions": [
      "permit.view",
      "project.view"
    ],
    "phone": "+91 98501 33209"
  },

  // 5. Citizen & Resident Forum
  {
    "id": "usr-nsk-07",
    "name": "Adv. Swati Deshmukh",
    "email": "citizen.volunteer@gmail.com",
    "role": "CITIZEN",
    "designation": "President, Nashik Road Safety & Citizen Forum",
    "department": "General Public",
    "jurisdiction": "Citywide",
    "permissions": [
      "complaint.create",
      "complaint.view",
      "road.view"
    ],
    "phone": "+91 98901 22345"
  },
  {
    "id": "usr-nsk-07b",
    "name": "Rohit Kadam",
    "email": "rohit.kadam@outlook.com",
    "role": "CITIZEN",
    "designation": "Resident & Road Quality Activist (College Road Ward)",
    "department": "General Public",
    "jurisdiction": "West Zone",
    "permissions": [
      "complaint.create",
      "complaint.view",
      "road.view"
    ],
    "phone": "+91 98224 99102"
  }
];

// Comprehensive Sample Corridors of Nashik across all municipal zones
const INITIAL_ROADS: Road[] = [
  {
    id: 'RD-NSK-01',
    code: 'NSK-NH-001',
    name: 'Mumbai - Agra National Highway (NH-3 / NH-848 Corridor)',
    category: 'National Highway',
    ownerAuthority: 'National Highways Authority of India (NHAI) & NMC',
    jurisdiction: 'Ring Corridor',
    widthMeters: 45,
    lanes: 6,
    surfaceType: 'Bituminous Mastic',
    condition: 'Good',
    trafficClass: 'Very High',
    lastResurfacedDate: '2025-11-15T00:00:00.000Z',
    protectionPeriodDays: 365,
    protectionExpiryDate: '2026-11-15T00:00:00.000Z',
    protectionStatus: 'PROTECTED',
    geometry: [
      { lat: 19.9402, lng: 73.758 },
      { lat: 19.9654, lng: 73.778 },
      { lat: 19.984, lng: 73.7885 },
      { lat: 19.9882, lng: 73.7924 },
      { lat: 20.005, lng: 73.805 },
      { lat: 20.021, lng: 73.821 },
      { lat: 20.038, lng: 73.842 },
    ],
    lengthKm: 12.8,
    activeWorkCount: 1,
    historicalExcavationsCount: 14,
  },
  {
    id: 'RD-NSK-02',
    code: 'NSK-ART-002',
    name: 'Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)',
    category: 'Major Arterial',
    ownerAuthority: 'Nashik Municipal Corporation (NMC)',
    jurisdiction: 'West Zone',
    widthMeters: 30,
    lanes: 4,
    surfaceType: 'Concrete',
    condition: 'Excellent',
    trafficClass: 'High',
    lastResurfacedDate: '2026-01-10T00:00:00.000Z',
    protectionPeriodDays: 730,
    protectionExpiryDate: '2028-01-10T00:00:00.000Z',
    protectionStatus: 'PROTECTED',
    geometry: [
      { lat: 19.9975, lng: 73.785 },
      { lat: 20.0062, lng: 73.7745 },
      { lat: 20.0145, lng: 73.761 },
      { lat: 20.022, lng: 73.746 },
      { lat: 20.031, lng: 73.732 },
      { lat: 20.0395, lng: 73.718 },
    ],
    lengthKm: 7.2,
    activeWorkCount: 0,
    historicalExcavationsCount: 8,
  },
  {
    id: 'RD-NSK-03',
    code: 'NSK-RD-003',
    name: 'College Road High-Street Commercial Corridor (Canada Corner to Krishi Nagar)',
    category: 'Major Road',
    ownerAuthority: 'Nashik Municipal Corporation (NMC)',
    jurisdiction: 'West Zone',
    widthMeters: 24,
    lanes: 4,
    surfaceType: 'Asphalt',
    condition: 'Good',
    trafficClass: 'High',
    lastResurfacedDate: '2025-05-20T00:00:00.000Z',
    protectionPeriodDays: 180,
    protectionExpiryDate: '2025-11-20T00:00:00.000Z',
    protectionStatus: 'NORMAL',
    geometry: [
      { lat: 19.999, lng: 73.776 },
      { lat: 20.004, lng: 73.768 },
      { lat: 20.0085, lng: 73.7595 },
      { lat: 20.012, lng: 73.751 },
    ],
    lengthKm: 3.4,
    activeWorkCount: 1,
    historicalExcavationsCount: 19,
  },
  {
    id: 'RD-NSK-04',
    code: 'NSK-SH-004',
    name: 'Trimbak Road Pilgrim & Industrial Corridor (CBS to Satpur MIDC & Trimbak Phata)',
    category: 'State Highway',
    ownerAuthority: 'Maharashtra PWD & NMC',
    jurisdiction: 'West Zone',
    widthMeters: 36,
    lanes: 6,
    surfaceType: 'Concrete',
    condition: 'Excellent',
    trafficClass: 'Very High',
    lastResurfacedDate: '2025-12-01T00:00:00.000Z',
    protectionPeriodDays: 365,
    protectionExpiryDate: '2026-12-01T00:00:00.000Z',
    protectionStatus: 'PROTECTED',
    geometry: [
      { lat: 19.998, lng: 73.784 },
      { lat: 19.991, lng: 73.771 },
      { lat: 19.983, lng: 73.752 },
      { lat: 19.974, lng: 73.731 },
      { lat: 19.965, lng: 73.708 },
    ],
    lengthKm: 8.5,
    activeWorkCount: 2,
    historicalExcavationsCount: 22,
  },
  {
    id: 'RD-NSK-05',
    code: 'NSK-NH-005',
    name: 'Nashik - Pune National Highway (NH-60 / Dwarka to Nashik Road Station & Sinnar Phata)',
    category: 'National Highway',
    ownerAuthority: 'National Highways Authority of India (NHAI)',
    jurisdiction: 'South Zone',
    widthMeters: 45,
    lanes: 6,
    surfaceType: 'Bituminous Mastic',
    condition: 'Good',
    trafficClass: 'Very High',
    lastResurfacedDate: '2025-08-15T00:00:00.000Z',
    protectionPeriodDays: 365,
    protectionExpiryDate: '2026-08-15T00:00:00.000Z',
    protectionStatus: 'SPECIAL_APPROVAL_REQUIRED',
    geometry: [
      { lat: 19.9882, lng: 73.7924 },
      { lat: 19.976, lng: 73.806 },
      { lat: 19.963, lng: 73.821 },
      { lat: 19.951, lng: 73.834 },
      { lat: 19.94, lng: 73.847 },
    ],
    lengthKm: 9.1,
    activeWorkCount: 0,
    historicalExcavationsCount: 16,
  },
  {
    id: 'RD-NSK-06',
    code: 'NSK-HRT-006',
    name: 'Panchavati Heritage & Ramkund Godavari Ghats Corridor',
    category: 'Heritage Corridor',
    ownerAuthority: 'Nashik Smart City Development Corp (NSSCDCL) & NMC',
    jurisdiction: 'North Zone',
    widthMeters: 18,
    lanes: 2,
    surfaceType: 'Paver Blocks',
    condition: 'Good',
    trafficClass: 'Medium',
    lastResurfacedDate: '2025-09-01T00:00:00.000Z',
    protectionPeriodDays: 365,
    protectionExpiryDate: '2026-09-01T00:00:00.000Z',
    protectionStatus: 'SPECIAL_APPROVAL_REQUIRED',
    geometry: [
      { lat: 20.0055, lng: 73.792 },
      { lat: 20.009, lng: 73.795 },
      { lat: 20.0125, lng: 73.799 },
      { lat: 20.015, lng: 73.803 },
    ],
    lengthKm: 2.2,
    activeWorkCount: 0,
    historicalExcavationsCount: 6,
  },
  {
    id: 'RD-NSK-07',
    code: 'NSK-SH-007',
    name: 'Dindori Road Multi-Utility Corridor (Panchavati to MERI & Mhasrul Naka)',
    category: 'State Highway',
    ownerAuthority: 'Maharashtra PWD',
    jurisdiction: 'North Zone',
    widthMeters: 30,
    lanes: 4,
    surfaceType: 'Asphalt',
    condition: 'Fair',
    trafficClass: 'High',
    lastResurfacedDate: '2024-11-20T00:00:00.000Z',
    protectionPeriodDays: 180,
    protectionExpiryDate: '2025-05-20T00:00:00.000Z',
    protectionStatus: 'NORMAL',
    geometry: [
      { lat: 20.015, lng: 73.803 },
      { lat: 20.031, lng: 73.811 },
      { lat: 20.049, lng: 73.819 },
      { lat: 20.068, lng: 73.826 },
    ],
    lengthKm: 6.4,
    activeWorkCount: 1,
    historicalExcavationsCount: 25,
  },
  {
    id: 'RD-NSK-08',
    code: 'NSK-ART-008',
    name: 'Jail Road - Nashik Road Station Arterial (Datta Mandir to Dasak Bridge)',
    category: 'Major Arterial',
    ownerAuthority: 'Nashik Municipal Corporation (NMC)',
    jurisdiction: 'South Zone',
    widthMeters: 24,
    lanes: 4,
    surfaceType: 'Concrete',
    condition: 'Good',
    trafficClass: 'High',
    lastResurfacedDate: '2025-10-05T00:00:00.000Z',
    protectionPeriodDays: 365,
    protectionExpiryDate: '2026-10-05T00:00:00.000Z',
    protectionStatus: 'PROTECTED',
    geometry: [
      { lat: 19.951, lng: 73.834 },
      { lat: 19.959, lng: 73.844 },
      { lat: 19.967, lng: 73.855 },
      { lat: 19.974, lng: 73.864 },
    ],
    lengthKm: 4.8,
    activeWorkCount: 0,
    historicalExcavationsCount: 11,
  },
  {
    id: 'RD-NSK-09',
    code: 'NSK-IND-009',
    name: 'Ambad MIDC Industrial Connector Corridor (Garware Point to XLO & Siemens Circle)',
    category: 'Major Arterial',
    ownerAuthority: 'MIDC & NMC',
    jurisdiction: 'South Zone',
    widthMeters: 32,
    lanes: 4,
    surfaceType: 'Concrete',
    condition: 'Excellent',
    trafficClass: 'High',
    lastResurfacedDate: '2026-01-25T00:00:00.000Z',
    protectionPeriodDays: 365,
    protectionExpiryDate: '2027-01-25T00:00:00.000Z',
    protectionStatus: 'PROTECTED',
    geometry: [
      { lat: 19.945, lng: 73.748 },
      { lat: 19.948, lng: 73.736 },
      { lat: 19.953, lng: 73.724 },
      { lat: 19.961, lng: 73.715 },
    ],
    lengthKm: 5.6,
    activeWorkCount: 0,
    historicalExcavationsCount: 9,
  },
  {
    id: 'RD-NSK-10',
    code: 'NSK-ART-010',
    name: 'Untwadi - City Centre Mall Smart Ring Corridor (Mumbai Naka to Sambhaji & Trimurti Chowk)',
    category: 'Major Arterial',
    ownerAuthority: 'Nashik Municipal Corporation (NMC)',
    jurisdiction: 'Central Zone',
    widthMeters: 30,
    lanes: 4,
    surfaceType: 'Concrete',
    condition: 'Excellent',
    trafficClass: 'High',
    lastResurfacedDate: '2025-11-30T00:00:00.000Z',
    protectionPeriodDays: 365,
    protectionExpiryDate: '2026-11-30T00:00:00.000Z',
    protectionStatus: 'PROTECTED',
    geometry: [
      { lat: 19.984, lng: 73.7885 },
      { lat: 19.982, lng: 73.774 },
      { lat: 19.978, lng: 73.761 },
      { lat: 19.973, lng: 73.748 },
      { lat: 19.968, lng: 73.738 },
    ],
    lengthKm: 5.8,
    activeWorkCount: 1,
    historicalExcavationsCount: 15,
  },
  {
    id: 'RD-NSK-11',
    code: 'NSK-ART-011',
    name: 'Indira Nagar Jogging Track & 100-Ft Ring Road Corridor (Lekha Nagar to Pathardi Gaon)',
    category: 'Major Arterial',
    ownerAuthority: 'Nashik Municipal Corporation (NMC)',
    jurisdiction: 'South Zone',
    widthMeters: 30,
    lanes: 4,
    surfaceType: 'Asphalt',
    condition: 'Good',
    trafficClass: 'Medium',
    lastResurfacedDate: '2025-04-12T00:00:00.000Z',
    protectionPeriodDays: 180,
    protectionExpiryDate: '2025-10-12T00:00:00.000Z',
    protectionStatus: 'NORMAL',
    geometry: [
      { lat: 19.9654, lng: 73.778 },
      { lat: 19.96, lng: 73.766 },
      { lat: 19.955, lng: 73.754 },
      { lat: 19.947, lng: 73.743 },
    ],
    lengthKm: 4.6,
    activeWorkCount: 0,
    historicalExcavationsCount: 12,
  },
  {
    id: 'RD-NSK-12',
    code: 'NSK-ART-012',
    name: 'Peth Road - APMC Market Transit Corridor (Nimani to APMC Yard & Ramshej Phata)',
    category: 'Major Arterial',
    ownerAuthority: 'Nashik Municipal Corporation (NMC)',
    jurisdiction: 'North Zone',
    widthMeters: 28,
    lanes: 4,
    surfaceType: 'Asphalt',
    condition: 'Fair',
    trafficClass: 'High',
    lastResurfacedDate: '2024-12-10T00:00:00.000Z',
    protectionPeriodDays: 180,
    protectionExpiryDate: '2025-06-10T00:00:00.000Z',
    protectionStatus: 'NORMAL',
    geometry: [
      { lat: 20.015, lng: 73.803 },
      { lat: 20.024, lng: 73.794 },
      { lat: 20.035, lng: 73.785 },
      { lat: 20.052, lng: 73.772 },
    ],
    lengthKm: 5.2,
    activeWorkCount: 0,
    historicalExcavationsCount: 18,
  },
  {
    id: 'RD-NSK-13',
    code: 'NSK-COL-013',
    name: 'Mahatma Nagar - Parijat Nagar Boulevard (ABB Circle to Gangapur Link)',
    category: 'Collector Road',
    ownerAuthority: 'Nashik Municipal Corporation (NMC)',
    jurisdiction: 'West Zone',
    widthMeters: 20,
    lanes: 2,
    surfaceType: 'Asphalt',
    condition: 'Good',
    trafficClass: 'Medium',
    lastResurfacedDate: '2025-07-15T00:00:00.000Z',
    protectionPeriodDays: 180,
    protectionExpiryDate: '2026-01-15T00:00:00.000Z',
    protectionStatus: 'NORMAL',
    geometry: [
      { lat: 19.991, lng: 73.771 },
      { lat: 19.998, lng: 73.762 },
      { lat: 20.005, lng: 73.756 },
      { lat: 20.0145, lng: 73.761 },
    ],
    lengthKm: 3.5,
    activeWorkCount: 0,
    historicalExcavationsCount: 7,
  },
  {
    id: 'RD-NSK-14',
    code: 'NSK-ART-014',
    name: 'Old Agra Road Heritage Spine (Dwarka Naka to Shalimar, CBS & Golf Club)',
    category: 'Major Arterial',
    ownerAuthority: 'Nashik Municipal Corporation (NMC)',
    jurisdiction: 'Central Zone',
    widthMeters: 24,
    lanes: 4,
    surfaceType: 'Asphalt',
    condition: 'Good',
    trafficClass: 'Very High',
    lastResurfacedDate: '2025-10-20T00:00:00.000Z',
    protectionPeriodDays: 365,
    protectionExpiryDate: '2026-10-20T00:00:00.000Z',
    protectionStatus: 'PROTECTED',
    geometry: [
      { lat: 19.9882, lng: 73.7924 },
      { lat: 19.993, lng: 73.789 },
      { lat: 19.9975, lng: 73.785 },
      { lat: 19.9995, lng: 73.779 },
      { lat: 20.001, lng: 73.772 },
    ],
    lengthKm: 3.2,
    activeWorkCount: 0,
    historicalExcavationsCount: 31,
  },
  {
    id: 'RD-NSK-15',
    code: 'NSK-RD-015',
    name: 'Sharanpur Road & Kulkarni Baug Smart Corridor (Canada Corner to Rajiv Gandhi Bhavan NMC HQ)',
    category: 'Major Road',
    ownerAuthority: 'Nashik Municipal Corporation (NMC)',
    jurisdiction: 'Central Zone',
    widthMeters: 22,
    lanes: 2,
    surfaceType: 'Concrete',
    condition: 'Excellent',
    trafficClass: 'High',
    lastResurfacedDate: '2025-12-15T00:00:00.000Z',
    protectionPeriodDays: 365,
    protectionExpiryDate: '2026-12-15T00:00:00.000Z',
    protectionStatus: 'PROTECTED',
    geometry: [
      { lat: 19.999, lng: 73.776 },
      { lat: 19.995, lng: 73.779 },
      { lat: 19.991, lng: 73.781 },
      { lat: 19.986, lng: 73.783 },
    ],
    lengthKm: 2.1,
    activeWorkCount: 0,
    historicalExcavationsCount: 13,
  },
  {
    id: 'RD-NSK-16',
    code: 'NSK-RD-016',
    name: 'CIDCO Pawan Nagar - Trimurti Chowk Spine (Uttam Nagar to CIDCO Bus Stand)',
    category: 'Major Road',
    ownerAuthority: 'Nashik Municipal Corporation (NMC)',
    jurisdiction: 'South Zone',
    widthMeters: 24,
    lanes: 4,
    surfaceType: 'Concrete',
    condition: 'Good',
    trafficClass: 'High',
    lastResurfacedDate: '2025-06-01T00:00:00.000Z',
    protectionPeriodDays: 180,
    protectionExpiryDate: '2025-12-01T00:00:00.000Z',
    protectionStatus: 'NORMAL',
    geometry: [
      { lat: 19.96, lng: 73.738 },
      { lat: 19.965, lng: 73.743 },
      { lat: 19.968, lng: 73.748 },
      { lat: 19.973, lng: 73.754 },
    ],
    lengthKm: 2.8,
    activeWorkCount: 0,
    historicalExcavationsCount: 17,
  },
  {
    id: 'RD-NSK-17',
    code: 'NSK-RD-017',
    name: 'Ashoka Marg - Bhabha Nagar Utility Corridor (Mumbai Highway to Wadala Road)',
    category: 'Major Road',
    ownerAuthority: 'Nashik Municipal Corporation (NMC)',
    jurisdiction: 'East Zone',
    widthMeters: 24,
    lanes: 4,
    surfaceType: 'Concrete',
    condition: 'Excellent',
    trafficClass: 'Medium',
    lastResurfacedDate: '2026-02-01T00:00:00.000Z',
    protectionPeriodDays: 365,
    protectionExpiryDate: '2027-02-01T00:00:00.000Z',
    protectionStatus: 'PROTECTED',
    geometry: [
      { lat: 19.984, lng: 73.7885 },
      { lat: 19.978, lng: 73.796 },
      { lat: 19.971, lng: 73.805 },
      { lat: 19.966, lng: 73.813 },
    ],
    lengthKm: 3.6,
    activeWorkCount: 0,
    historicalExcavationsCount: 5,
  },
  {
    id: 'RD-NSK-18',
    code: 'NSK-RD-018',
    name: 'Someshwar Water Works - Anandwalli Riverbank Drive (Anandwalli to Gangapur Dam)',
    category: 'Major Road',
    ownerAuthority: 'Water Resources Dept & NMC',
    jurisdiction: 'West Zone',
    widthMeters: 20,
    lanes: 2,
    surfaceType: 'Asphalt',
    condition: 'Good',
    trafficClass: 'Low',
    lastResurfacedDate: '2025-03-10T00:00:00.000Z',
    protectionPeriodDays: 180,
    protectionExpiryDate: '2025-09-10T00:00:00.000Z',
    protectionStatus: 'NORMAL',
    geometry: [
      { lat: 20.0145, lng: 73.761 },
      { lat: 20.021, lng: 73.749 },
      { lat: 20.029, lng: 73.735 },
      { lat: 20.0395, lng: 73.718 },
    ],
    lengthKm: 5.1,
    activeWorkCount: 0,
    historicalExcavationsCount: 4,
  },
  {
    id: 'RD-NSK-19',
    code: 'NSK-ART-019',
    name: 'Lam Road / Deolali Camp Defense & Heritage Arterial (Bitco Point to Deolali Cantonment)',
    category: 'Major Arterial',
    ownerAuthority: 'Cantonment Board & Maharashtra PWD',
    jurisdiction: 'South Zone',
    widthMeters: 24,
    lanes: 2,
    surfaceType: 'Bituminous Mastic',
    condition: 'Good',
    trafficClass: 'Medium',
    lastResurfacedDate: '2025-09-15T00:00:00.000Z',
    protectionPeriodDays: 365,
    protectionExpiryDate: '2026-09-15T00:00:00.000Z',
    protectionStatus: 'SPECIAL_APPROVAL_REQUIRED',
    geometry: [
      { lat: 19.951, lng: 73.834 },
      { lat: 19.938, lng: 73.837 },
      { lat: 19.924, lng: 73.839 },
      { lat: 19.91, lng: 73.842 },
    ],
    lengthKm: 4.9,
    activeWorkCount: 0,
    historicalExcavationsCount: 3,
  },
  {
    id: 'RD-NSK-20',
    code: 'NSK-COL-020',
    name: 'Makhmalabad Link Road Corridor (Malegaon Stand to Makhmalabad Gaon)',
    category: 'Collector Road',
    ownerAuthority: 'Nashik Municipal Corporation (NMC)',
    jurisdiction: 'North Zone',
    widthMeters: 20,
    lanes: 2,
    surfaceType: 'Asphalt',
    condition: 'Fair',
    trafficClass: 'Medium',
    lastResurfacedDate: '2024-10-05T00:00:00.000Z',
    protectionPeriodDays: 180,
    protectionExpiryDate: '2025-04-05T00:00:00.000Z',
    protectionStatus: 'NORMAL',
    geometry: [
      { lat: 20.009, lng: 73.795 },
      { lat: 20.02, lng: 73.788 },
      { lat: 20.033, lng: 73.781 },
      { lat: 20.046, lng: 73.775 },
    ],
    lengthKm: 4.4,
    activeWorkCount: 0,
    historicalExcavationsCount: 14,
  },
  {
    id: 'RD-NSK-21',
    code: 'NSK-RD-021',
    name: 'Wadala - Kathe Galli Arterial Corridor (Dwarka Circle to Wadala Gaon & Sharda School)',
    category: 'Major Road',
    ownerAuthority: 'Nashik Municipal Corporation (NMC)',
    jurisdiction: 'East Zone',
    widthMeters: 22,
    lanes: 2,
    surfaceType: 'Asphalt',
    condition: 'Fair',
    trafficClass: 'High',
    lastResurfacedDate: '2025-01-20T00:00:00.000Z',
    protectionPeriodDays: 180,
    protectionExpiryDate: '2025-07-20T00:00:00.000Z',
    protectionStatus: 'NORMAL',
    geometry: [
      { lat: 19.9882, lng: 73.7924 },
      { lat: 19.981, lng: 73.798 },
      { lat: 19.974, lng: 73.805 },
      { lat: 19.969, lng: 73.811 },
    ],
    lengthKm: 2.9,
    activeWorkCount: 0,
    historicalExcavationsCount: 16,
  },
  {
    id: 'RD-NSK-22',
    code: 'NSK-IND-022',
    name: 'Satpur MIDC NICE Area & VIP Road Connector (ITI Signal to Carbon Naka & Gangapur Link)',
    category: 'Major Road',
    ownerAuthority: 'MIDC & NMC',
    jurisdiction: 'West Zone',
    widthMeters: 24,
    lanes: 4,
    surfaceType: 'Concrete',
    condition: 'Excellent',
    trafficClass: 'High',
    lastResurfacedDate: '2025-11-05T00:00:00.000Z',
    protectionPeriodDays: 365,
    protectionExpiryDate: '2026-11-05T00:00:00.000Z',
    protectionStatus: 'PROTECTED',
    geometry: [
      { lat: 19.974, lng: 73.731 },
      { lat: 19.982, lng: 73.735 },
      { lat: 19.992, lng: 73.741 },
      { lat: 20.005, lng: 73.756 },
    ],
    lengthKm: 4.1,
    activeWorkCount: 0,
    historicalExcavationsCount: 10,
  },
  {
    id: 'RD-NSK-23',
    code: 'NSK-HRT-023',
    name: 'Panchavati Godavari Riverside Promenade & Talkuteshwar Ring',
    category: 'Heritage Corridor',
    ownerAuthority: 'Nashik Smart City Development Corp (NSSCDCL) & NMC',
    jurisdiction: 'North Zone',
    widthMeters: 18,
    lanes: 2,
    surfaceType: 'Paver Blocks',
    condition: 'Excellent',
    trafficClass: 'Low',
    lastResurfacedDate: '2025-12-20T00:00:00.000Z',
    protectionPeriodDays: 365,
    protectionExpiryDate: '2026-12-20T00:00:00.000Z',
    protectionStatus: 'PROTECTED',
    geometry: [
      { lat: 20.001, lng: 73.787 },
      { lat: 20.0055, lng: 73.792 },
      { lat: 20.008, lng: 73.798 },
      { lat: 20.005, lng: 73.805 },
    ],
    lengthKm: 2.4,
    activeWorkCount: 0,
    historicalExcavationsCount: 2,
  },
  {
    id: 'RD-NSK-24',
    code: 'NSK-COL-024',
    name: 'Govind Nagar - Karmaveer Bhaurao Patil (KBP) Ring Link (City Centre Mall to Mumbai Highway)',
    category: 'Collector Road',
    ownerAuthority: 'Nashik Municipal Corporation (NMC)',
    jurisdiction: 'Central Zone',
    widthMeters: 24,
    lanes: 4,
    surfaceType: 'Concrete',
    condition: 'Good',
    trafficClass: 'Medium',
    lastResurfacedDate: '2025-08-01T00:00:00.000Z',
    protectionPeriodDays: 365,
    protectionExpiryDate: '2026-08-01T00:00:00.000Z',
    protectionStatus: 'PROTECTED',
    geometry: [
      { lat: 19.978, lng: 73.761 },
      { lat: 19.972, lng: 73.766 },
      { lat: 19.9654, lng: 73.778 },
    ],
    lengthKm: 2.3,
    activeWorkCount: 0,
    historicalExcavationsCount: 8,
  },
  {
    id: 'RD-NSK-25',
    code: 'NSK-RD-025',
    name: 'Pathardi Phata - Wadner Gaon Sub-Arterial (Pathardi Phata to Guru Gobind Singh College)',
    category: 'Major Road',
    ownerAuthority: 'Nashik Municipal Corporation (NMC)',
    jurisdiction: 'South Zone',
    widthMeters: 20,
    lanes: 2,
    surfaceType: 'Asphalt',
    condition: 'Fair',
    trafficClass: 'Medium',
    lastResurfacedDate: '2024-09-10T00:00:00.000Z',
    protectionPeriodDays: 180,
    protectionExpiryDate: '2025-03-10T00:00:00.000Z',
    protectionStatus: 'NORMAL',
    geometry: [
      { lat: 19.9402, lng: 73.758 },
      { lat: 19.935, lng: 73.769 },
      { lat: 19.929, lng: 73.782 },
      { lat: 19.922, lng: 73.795 },
    ],
    lengthKm: 4.5,
    activeWorkCount: 0,
    historicalExcavationsCount: 11,
  },
  {
    id: 'RD-NSK-26',
    code: 'NSK-ART-026',
    name: 'Muktidham - Artillery Centre Ring Arterial (Muktidham Mandir to Sinnar Phata)',
    category: 'Major Arterial',
    ownerAuthority: 'Nashik Municipal Corporation (NMC)',
    jurisdiction: 'South Zone',
    widthMeters: 24,
    lanes: 4,
    surfaceType: 'Concrete',
    condition: 'Good',
    trafficClass: 'High',
    lastResurfacedDate: '2025-07-25T00:00:00.000Z',
    protectionPeriodDays: 365,
    protectionExpiryDate: '2026-07-25T00:00:00.000Z',
    protectionStatus: 'PROTECTED',
    geometry: [
      { lat: 19.951, lng: 73.834 },
      { lat: 19.946, lng: 73.828 },
      { lat: 19.939, lng: 73.835 },
      { lat: 19.94, lng: 73.847 },
    ],
    lengthKm: 3.1,
    activeWorkCount: 0,
    historicalExcavationsCount: 9,
  },
  {
    id: 'RD-NSK-27',
    code: 'NSK-RD-027',
    name: 'MERI - Rasbihari Ring Connector Road (MERI Main Gate to Adgaon Naka NH-3)',
    category: 'Major Road',
    ownerAuthority: 'Nashik Municipal Corporation (NMC)',
    jurisdiction: 'North Zone',
    widthMeters: 24,
    lanes: 4,
    surfaceType: 'Asphalt',
    condition: 'Good',
    trafficClass: 'Medium',
    lastResurfacedDate: '2025-06-15T00:00:00.000Z',
    protectionPeriodDays: 180,
    protectionExpiryDate: '2025-12-15T00:00:00.000Z',
    protectionStatus: 'NORMAL',
    geometry: [
      { lat: 20.031, lng: 73.811 },
      { lat: 20.034, lng: 73.824 },
      { lat: 20.038, lng: 73.842 },
    ],
    lengthKm: 3.7,
    activeWorkCount: 0,
    historicalExcavationsCount: 6,
  },
  {
    id: 'RD-NSK-28',
    code: 'NSK-NH-028',
    name: 'Adgaon - Ozar HAL Airport Express Highway Corridor (Adgaon to Ozar Airport Approach)',
    category: 'National Highway',
    ownerAuthority: 'National Highways Authority of India (NHAI) & PWD',
    jurisdiction: 'Ring Corridor',
    widthMeters: 60,
    lanes: 6,
    surfaceType: 'Bituminous Mastic',
    condition: 'Excellent',
    trafficClass: 'Very High',
    lastResurfacedDate: '2026-01-05T00:00:00.000Z',
    protectionPeriodDays: 730,
    protectionExpiryDate: '2028-01-05T00:00:00.000Z',
    protectionStatus: 'PROTECTED',
    geometry: [
      { lat: 20.038, lng: 73.842 },
      { lat: 20.052, lng: 73.865 },
      { lat: 20.069, lng: 73.892 },
      { lat: 20.088, lng: 73.921 },
    ],
    lengthKm: 9.8,
    activeWorkCount: 0,
    historicalExcavationsCount: 4,
  },
];

// Underground Infrastructure Assets along Nashik Corridors
const INITIAL_ASSETS: InfrastructureAsset[] = [
  {
    id: 'AST-NSK-01',
    assetType: 'Water Pipeline',
    ownerDepartment: 'Water & Sewerage',
    roadId: 'RD-NSK-02',
    roadName: 'Gangapur Road Arterial Corridor',
    geometry: [
      { lat: 20.0395, lng: 73.718 },
      { lat: 20.031, lng: 73.732 },
      { lat: 20.022, lng: 73.746 },
      { lat: 20.0145, lng: 73.761 },
      { lat: 20.0062, lng: 73.7745 },
      { lat: 19.9975, lng: 73.785 },
    ],
    depthMeters: 2.4,
    material: 'Mild Steel (MS) Mortar Lined',
    capacityOrDiameter: '1200 mm Trunk Transmission',
    installationYear: 2021,
    condition: 'Good',
    lastInspectionDate: '2025-11-10T00:00:00.000Z',
    pressureOrVoltage: '8.5 Bar',
  },
  {
    id: 'AST-NSK-02',
    assetType: 'Sewer Main',
    ownerDepartment: 'Drainage Department',
    roadId: 'RD-NSK-04',
    roadName: 'Trimbak Road Pilgrim & Industrial Corridor',
    geometry: [
      { lat: 19.998, lng: 73.784 },
      { lat: 19.991, lng: 73.771 },
      { lat: 19.983, lng: 73.752 },
      { lat: 19.974, lng: 73.731 },
    ],
    depthMeters: 3.2,
    material: 'Reinforced Cement Concrete (RCC NP4)',
    capacityOrDiameter: '900 mm Gravity Trunk Sewer',
    installationYear: 2019,
    condition: 'Fair',
    lastInspectionDate: '2025-10-18T00:00:00.000Z',
  },
  {
    id: 'AST-NSK-03',
    assetType: 'Electric 33kV/11kV',
    ownerDepartment: 'Electricity (DISCOM)',
    roadId: 'RD-NSK-10',
    roadName: 'Untwadi - City Centre Mall Smart Ring Corridor',
    geometry: [
      { lat: 19.984, lng: 73.7885 },
      { lat: 19.982, lng: 73.774 },
      { lat: 19.978, lng: 73.761 },
      { lat: 19.973, lng: 73.748 },
    ],
    depthMeters: 1.6,
    material: 'XLPE Armored Copper Cable in HDPE Duct',
    capacityOrDiameter: '33 kV Underground Feeder Ring',
    installationYear: 2023,
    condition: 'Good',
    lastInspectionDate: '2026-01-12T00:00:00.000Z',
    pressureOrVoltage: '33 kV / 50 Hz',
  },
  {
    id: 'AST-NSK-04',
    assetType: 'Telecom OFC Duct',
    ownerDepartment: 'Telecom & Digital',
    roadId: 'RD-NSK-03',
    roadName: 'College Road High-Street Commercial Corridor',
    geometry: [
      { lat: 19.999, lng: 73.776 },
      { lat: 20.004, lng: 73.768 },
      { lat: 20.0085, lng: 73.7595 },
      { lat: 20.012, lng: 73.751 },
    ],
    depthMeters: 1.2,
    material: '4-Way PLB HDPE Duct Quad',
    capacityOrDiameter: '96-Core Armored Fiber Backhaul',
    installationYear: 2022,
    condition: 'Good',
    lastInspectionDate: '2025-12-05T00:00:00.000Z',
  },
  {
    id: 'AST-NSK-05',
    assetType: 'PNG Gas Pipeline',
    ownerDepartment: 'City Gas Distribution',
    roadId: 'RD-NSK-09',
    roadName: 'Ambad MIDC Industrial Connector Corridor',
    geometry: [
      { lat: 19.945, lng: 73.748 },
      { lat: 19.948, lng: 73.736 },
      { lat: 19.953, lng: 73.724 },
      { lat: 19.961, lng: 73.715 },
    ],
    depthMeters: 1.8,
    material: 'Carbon Steel API 5L Grade B with 3LPE Coating',
    capacityOrDiameter: '8-Inch Medium Pressure Gas Main',
    installationYear: 2021,
    condition: 'Good',
    lastInspectionDate: '2026-01-20T00:00:00.000Z',
    pressureOrVoltage: '19 Bar MP',
  },
  {
    id: 'AST-NSK-06',
    assetType: 'Water Pipeline',
    ownerDepartment: 'Water & Sewerage',
    roadId: 'RD-NSK-05',
    roadName: 'Nashik - Pune National Highway (NH-60 Corridor)',
    geometry: [
      { lat: 19.9882, lng: 73.7924 },
      { lat: 19.976, lng: 73.806 },
      { lat: 19.963, lng: 73.821 },
      { lat: 19.951, lng: 73.834 },
    ],
    depthMeters: 2.1,
    material: 'Ductile Iron (DI K9)',
    capacityOrDiameter: '600 mm Feeder Line to Nashik Road ESR',
    installationYear: 2020,
    condition: 'Good',
    lastInspectionDate: '2025-11-28T00:00:00.000Z',
    pressureOrVoltage: '6.0 Bar',
  },
  {
    id: 'AST-NSK-07',
    assetType: 'Telecom OFC Duct',
    ownerDepartment: 'Telecom & Digital',
    roadId: 'RD-NSK-01',
    roadName: 'Mumbai - Agra National Highway Corridor',
    geometry: [
      { lat: 19.9402, lng: 73.758 },
      { lat: 19.9654, lng: 73.778 },
      { lat: 19.984, lng: 73.7885 },
      { lat: 19.9882, lng: 73.7924 },
      { lat: 20.005, lng: 73.805 },
    ],
    depthMeters: 1.5,
    material: '6-Way Telecom HDPE Conduit',
    capacityOrDiameter: '288-Core Smart City Surveillance & 5G Backbone',
    installationYear: 2023,
    condition: 'Good',
    lastInspectionDate: '2026-02-05T00:00:00.000Z',
  },
  {
    id: 'AST-NSK-08',
    assetType: 'Electric 33kV/11kV',
    ownerDepartment: 'Electricity (DISCOM)',
    roadId: 'RD-NSK-15',
    roadName: 'Sharanpur Road & Kulkarni Baug Smart Corridor',
    geometry: [
      { lat: 19.999, lng: 73.776 },
      { lat: 19.995, lng: 73.779 },
      { lat: 19.991, lng: 73.781 },
      { lat: 19.986, lng: 73.783 },
    ],
    depthMeters: 1.4,
    material: '11kV 3-Core Cross-Linked Polyethylene Cable',
    capacityOrDiameter: '11 kV Municipal HQ Substation Feeder',
    installationYear: 2024,
    condition: 'Good',
    lastInspectionDate: '2026-01-30T00:00:00.000Z',
    pressureOrVoltage: '11 kV',
  },
  {
    id: 'AST-NSK-09',
    assetType: 'PNG Gas Pipeline',
    ownerDepartment: 'City Gas Distribution',
    roadId: 'RD-NSK-13',
    roadName: 'Mahatma Nagar - Parijat Nagar Boulevard',
    geometry: [
      { lat: 19.991, lng: 73.771 },
      { lat: 19.998, lng: 73.762 },
      { lat: 20.005, lng: 73.756 },
    ],
    depthMeters: 1.5,
    material: 'Medium Density Polyethylene (MDPE PE-100)',
    capacityOrDiameter: '125 mm Domestic Reticulated PNG Loop',
    installationYear: 2023,
    condition: 'Good',
    lastInspectionDate: '2025-12-18T00:00:00.000Z',
    pressureOrVoltage: '4 Bar LP',
  },
  {
    id: 'AST-NSK-10',
    assetType: 'Stormwater Drainage',
    ownerDepartment: 'Drainage Department',
    roadId: 'RD-NSK-21',
    roadName: 'Wadala - Kathe Galli Arterial Corridor',
    geometry: [
      { lat: 19.9882, lng: 73.7924 },
      { lat: 19.981, lng: 73.798 },
      { lat: 19.974, lng: 73.805 },
    ],
    depthMeters: 2.2,
    material: 'Reinforced Concrete Precast Box Culvert',
    capacityOrDiameter: '1500 mm x 1200 mm Stormwater Conduit',
    installationYear: 2022,
    condition: 'Good',
    lastInspectionDate: '2025-09-22T00:00:00.000Z',
  },
];
const INITIAL_PROJECTS: Project[] = [
  {
    "id": "PROJ-NSK-2026-01",
    "code": "NSK-KMB-001",
    "name": "Simhastha Kumbh 2027 66-km Outer Ring Road (Parikrama Marg Phase-1)",
    "department": "Roads / PWD",
    "projectType": "6-Lane Access-Controlled Expressway Widening & Service Corridors",
    "description": "Construction of 6-lane bypass connecting Mumbai-Agra NH-3 (Garware Point) through Ambad MIDC to Satpur for Kumbh 2027 pilgrim transit.",
    "roadId": "RD-NSK-09",
    "roadName": "Ambad MIDC Industrial Connector Corridor (Garware Point to XLO & Siemens Circle)",
    "geometry": [
      {
        "lat": 19.945,
        "lng": 73.748
      },
      {
        "lat": 19.948,
        "lng": 73.736
      },
      {
        "lat": 19.953,
        "lng": 73.724
      },
      {
        "lat": 19.961,
        "lng": 73.715
      }
    ],
    "startCoordinates": {
      "lat": 19.945,
      "lng": 73.748
    },
    "endCoordinates": {
      "lat": 19.961,
      "lng": 73.715
    },
    "lengthMeters": 5600,
    "requiredStartDate": "2026-01-15T00:00:00.000Z",
    "requiredCompletionDate": "2027-03-31T00:00:00.000Z",
    "expectedExcavationDurationDays": 180,
    "excavationWidthMeters": 4.5,
    "excavationDepthMeters": 2.2,
    "affectedAreaSqMeters": 25200,
    "estimatedCostINR": 39540000000,
    "estimatedExcavationCostINR": 8820000,
    "estimatedRestorationCostINR": 16380000,
    "trafficImpact": "High",
    "priority": "High Priority",
    "isEmergency": false,
    "contractorId": "CTR-NSK-01",
    "contractorName": "L&T Infrastructure Construction Ltd. & MSRDC",
    "status": "IN_PROGRESS",
    "documents": [
      {
        "id": "DOC-NSK-01",
        "title": "Detailed Project Report (DPR) - Nashik Parikrama Marg",
        "type": "DPR",
        "fileName": "DPR_Nashik_Ring_Road_Kumbh2027.pdf",
        "fileSize": "14.8 MB",
        "uploadedAt": "2026-01-10T10:30:00.000Z",
        "uploadedBy": "Er. Nitin Rajput"
      }
    ],
    "submittedBy": "Er. Nitin Rajput",
    "submittedByDesignation": "Superintending Engineer (PWD)",
    "submittedAt": "2026-01-05T09:15:00.000Z",
    "progressPercentage": 35,
    "currentWorkPhase": "Granular Sub-base (GSB) Layering & Stormwater Precast Box Culvert Trenching"
  },
  {
    "id": "PROJ-NSK-2026-02",
    "code": "NSK-NH-002",
    "name": "Dwarka to Datta Mandir 10-Lane Highway Widening & Utility Relocation",
    "department": "Roads / PWD",
    "projectType": "10-Lane NH-60 Expansion, Service Road Excavation & Stormwater Drain",
    "description": "Widening of Nashik-Pune Highway stretch from Dwarka Circle to Datta Mandir into a 10-lane corridor to ease massive pilgrim bottleneck.",
    "roadId": "RD-NSK-05",
    "roadName": "Nashik - Pune National Highway (NH-60 / Dwarka to Nashik Road Station & Sinnar Phata)",
    "geometry": [
      {
        "lat": 19.9882,
        "lng": 73.7924
      },
      {
        "lat": 19.976,
        "lng": 73.806
      },
      {
        "lat": 19.963,
        "lng": 73.821
      }
    ],
    "startCoordinates": {
      "lat": 19.9882,
      "lng": 73.7924
    },
    "endCoordinates": {
      "lat": 19.963,
      "lng": 73.821
    },
    "lengthMeters": 4200,
    "requiredStartDate": "2026-02-01T00:00:00.000Z",
    "requiredCompletionDate": "2026-12-31T00:00:00.000Z",
    "expectedExcavationDurationDays": 120,
    "excavationWidthMeters": 3.5,
    "excavationDepthMeters": 2.8,
    "affectedAreaSqMeters": 14700,
    "estimatedCostINR": 1800000000,
    "estimatedExcavationCostINR": 5145000,
    "estimatedRestorationCostINR": 9555000,
    "trafficImpact": "Severe",
    "priority": "High Priority",
    "isEmergency": false,
    "contractorId": "CTR-NSK-02",
    "contractorName": "Ashoka Buildcon Ltd. (Nashik)",
    "status": "IN_PROGRESS",
    "documents": [
      {
        "id": "DOC-NSK-02",
        "title": "Traffic Diversion & Staging Blueprint - Dwarka 10-Lane",
        "type": "Traffic Plan",
        "fileName": "Dwarka_10Lane_Traffic_Diversion.pdf",
        "fileSize": "8.2 MB",
        "uploadedAt": "2026-01-20T14:00:00.000Z",
        "uploadedBy": "Er. Rajesh Kulkarni"
      }
    ],
    "submittedBy": "Er. Rajesh Kulkarni",
    "submittedByDesignation": "Chief City Infrastructure Nodal Officer",
    "submittedAt": "2026-01-18T11:00:00.000Z",
    "progressPercentage": 42,
    "currentWorkPhase": "Service Road Earthmoving & Subsurface Water Main Shifting"
  },
  {
    "id": "PROJ-NSK-2026-03",
    "code": "NSK-GAS-003",
    "name": "MNGL Medium-Pressure City Gas Distribution Grid (Gangapur Road & Sirin Meadows)",
    "department": "City Gas Distribution",
    "projectType": "125mm MDPE Domestic PNG Reticulation & Safety Isolation Valves",
    "description": "Laying reticulated PNG gas pipelines along Gangapur Road corridor to fulfill NMC two-month connection directive with enhanced saw-cut safety.",
    "roadId": "RD-NSK-02",
    "roadName": "Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)",
    "geometry": [
      {
        "lat": 19.9975,
        "lng": 73.785
      },
      {
        "lat": 20.0062,
        "lng": 73.7745
      },
      {
        "lat": 20.0145,
        "lng": 73.761
      }
    ],
    "startCoordinates": {
      "lat": 19.9975,
      "lng": 73.785
    },
    "endCoordinates": {
      "lat": 20.0145,
      "lng": 73.761
    },
    "lengthMeters": 3800,
    "requiredStartDate": "2026-08-01T00:00:00.000Z",
    "requiredCompletionDate": "2026-10-30T00:00:00.000Z",
    "expectedExcavationDurationDays": 45,
    "excavationWidthMeters": 0.8,
    "excavationDepthMeters": 1.8,
    "affectedAreaSqMeters": 3040,
    "estimatedCostINR": 480000000,
    "estimatedExcavationCostINR": 1064000,
    "estimatedRestorationCostINR": 1976000,
    "trafficImpact": "High",
    "priority": "Planned",
    "isEmergency": false,
    "contractorId": "CTR-NSK-03",
    "contractorName": "Eagle Infra India Ltd. / MNGL Works",
    "status": "CONFLICT_DETECTED",
    "documents": [
      {
        "id": "DOC-NSK-03",
        "title": "MNGL Safe Trenching & Pipeline Isolation Drawing",
        "type": "Engineering Drawing",
        "fileName": "MNGL_Gangapur_Trenching_Drawings.pdf",
        "fileSize": "5.4 MB",
        "uploadedAt": "2026-07-25T16:20:00.000Z",
        "uploadedBy": "Er. Prashant Wagh"
      }
    ],
    "submittedBy": "Er. Prashant Wagh",
    "submittedByDesignation": "Chief Project Manager (MNGL)",
    "submittedAt": "2026-07-20T10:00:00.000Z",
    "progressPercentage": 15,
    "currentWorkPhase": "Trench Saw-Cutting & Shoring Preparation"
  },
  {
    "id": "PROJ-NSK-2026-04",
    "code": "NSK-ELE-004",
    "name": "MSEDCL 33kV Underground Ring Feeder Cabling (Gangapur Road & College Road)",
    "department": "Electricity (DISCOM)",
    "projectType": "33kV XLPE Underground Armored Power Cabling & Overhead Wire Removal",
    "description": "Conversion of overhead electricity wires into high-reliability 33kV underground ring feeder along Gangapur Road to prevent monsoon tripping.",
    "roadId": "RD-NSK-02",
    "roadName": "Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)",
    "geometry": [
      {
        "lat": 19.9975,
        "lng": 73.785
      },
      {
        "lat": 20.0062,
        "lng": 73.7745
      },
      {
        "lat": 20.0145,
        "lng": 73.761
      }
    ],
    "startCoordinates": {
      "lat": 19.9975,
      "lng": 73.785
    },
    "endCoordinates": {
      "lat": 20.0145,
      "lng": 73.761
    },
    "lengthMeters": 3800,
    "requiredStartDate": "2026-08-15T00:00:00.000Z",
    "requiredCompletionDate": "2026-11-15T00:00:00.000Z",
    "expectedExcavationDurationDays": 60,
    "excavationWidthMeters": 1,
    "excavationDepthMeters": 1.5,
    "affectedAreaSqMeters": 3800,
    "estimatedCostINR": 650000000,
    "estimatedExcavationCostINR": 1330000,
    "estimatedRestorationCostINR": 2470000,
    "trafficImpact": "High",
    "priority": "Planned",
    "isEmergency": false,
    "contractorId": "CTR-NSK-04",
    "contractorName": "Sterling & Wilson Powergen Pvt Ltd.",
    "status": "CONFLICT_DETECTED",
    "documents": [],
    "submittedBy": "Er. Deepak Jadhav",
    "submittedByDesignation": "Superintending Engineer (MSEDCL)",
    "submittedAt": "2026-07-28T14:30:00.000Z",
    "progressPercentage": 10,
    "currentWorkPhase": "Route Inspection & Substation Feeder Tie-In"
  },
  {
    "id": "PROJ-NSK-2026-05",
    "code": "NSK-WTR-005",
    "name": "Someshwar - Panchavati 1200mm Water Trunk Transmission Line Upgrade",
    "department": "Water & Sewerage",
    "projectType": "1200mm Mild Steel Mortar Lined Water Trunk Replacement",
    "description": "Replacement of critical 1200mm bulk water supply transmission main from Someshwar Water Works along Gangapur Road for Kumbh 2027 water surge.",
    "roadId": "RD-NSK-02",
    "roadName": "Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)",
    "geometry": [
      {
        "lat": 19.9975,
        "lng": 73.785
      },
      {
        "lat": 20.0062,
        "lng": 73.7745
      },
      {
        "lat": 20.0145,
        "lng": 73.761
      }
    ],
    "startCoordinates": {
      "lat": 19.9975,
      "lng": 73.785
    },
    "endCoordinates": {
      "lat": 20.0145,
      "lng": 73.761
    },
    "lengthMeters": 3800,
    "requiredStartDate": "2026-08-10T00:00:00.000Z",
    "requiredCompletionDate": "2026-11-30T00:00:00.000Z",
    "expectedExcavationDurationDays": 75,
    "excavationWidthMeters": 2,
    "excavationDepthMeters": 2.4,
    "affectedAreaSqMeters": 7600,
    "estimatedCostINR": 1120000000,
    "estimatedExcavationCostINR": 2660000,
    "estimatedRestorationCostINR": 4940000,
    "trafficImpact": "High",
    "priority": "High Priority",
    "isEmergency": false,
    "contractorId": "CTR-NSK-05",
    "contractorName": "NCC Infrastructure Ltd.",
    "status": "CONFLICT_DETECTED",
    "documents": [],
    "submittedBy": "Er. Sanjay Shinde",
    "submittedByDesignation": "Executive Engineer (Water & Sewerage)",
    "submittedAt": "2026-07-22T11:45:00.000Z",
    "progressPercentage": 20,
    "currentWorkPhase": "Pipe Stockpile Mobilization & Deep Trench Shoring"
  },
  {
    "id": "PROJ-NSK-2026-06",
    "code": "NSK-RST-006",
    "name": "Rs 135-Crore Post-Monsoon Road & Colony Resurfacing (Cidco Trimurti Chowk)",
    "department": "Roads / PWD",
    "projectType": "High-Durability Bituminous Concrete (BC) & Micro-Surfacing Overhaul",
    "description": "Comprehensive road makeover project covering internal colony roads in Cidco, Pawan Nagar, and Trimurti Chowk following utility repairs.",
    "roadId": "RD-NSK-10",
    "roadName": "Untwadi - City Centre Mall Smart Ring Corridor (Mumbai Naka to Sambhaji & Trimurti Chowk)",
    "geometry": [
      {
        "lat": 19.984,
        "lng": 73.7885
      },
      {
        "lat": 19.982,
        "lng": 73.774
      },
      {
        "lat": 19.978,
        "lng": 73.761
      }
    ],
    "startCoordinates": {
      "lat": 19.984,
      "lng": 73.7885
    },
    "endCoordinates": {
      "lat": 19.978,
      "lng": 73.761
    },
    "lengthMeters": 2800,
    "requiredStartDate": "2026-07-01T00:00:00.000Z",
    "requiredCompletionDate": "2026-10-15T00:00:00.000Z",
    "expectedExcavationDurationDays": 60,
    "excavationWidthMeters": 12,
    "excavationDepthMeters": 0.4,
    "affectedAreaSqMeters": 33600,
    "estimatedCostINR": 380000000,
    "estimatedExcavationCostINR": 11760000,
    "estimatedRestorationCostINR": 21840000,
    "trafficImpact": "Medium",
    "priority": "Routine",
    "isEmergency": false,
    "contractorId": "CTR-NSK-06",
    "contractorName": "Shree Swami Samarth Builders & Developers",
    "status": "IN_PROGRESS",
    "documents": [],
    "submittedBy": "Er. Nitin Rajput",
    "submittedByDesignation": "Superintending Engineer (PWD)",
    "submittedAt": "2026-06-25T15:00:00.000Z",
    "progressPercentage": 55,
    "currentWorkPhase": "Bituminous Concrete (BC) Asphalt Paver Laying & Roll Compaction"
  },
  {
    "id": "PROJ-NSK-2026-07",
    "code": "NSK-HRT-007",
    "name": "Godavari Riverfront Pilgrimage Promenade & Ramkund Ghats (Kumbh 2027)",
    "department": "Smart City & Urban Planning",
    "projectType": "Heritage Stone Paving, Riverfront Retaining Wall & Pedestrianization",
    "description": "Upgrading the sacred Ramkund ghats and pilgrimage promenade in Panchavati with anti-skid stone pavers, LED illumination and stormwater channels.",
    "roadId": "RD-NSK-06",
    "roadName": "Panchavati Heritage & Ramkund Godavari Ghats Corridor",
    "geometry": [
      {
        "lat": 20.004,
        "lng": 73.791
      },
      {
        "lat": 20.001,
        "lng": 73.787
      },
      {
        "lat": 19.998,
        "lng": 73.784
      }
    ],
    "startCoordinates": {
      "lat": 20.004,
      "lng": 73.791
    },
    "endCoordinates": {
      "lat": 19.998,
      "lng": 73.784
    },
    "lengthMeters": 1800,
    "requiredStartDate": "2025-10-01T00:00:00.000Z",
    "requiredCompletionDate": "2026-12-31T00:00:00.000Z",
    "expectedExcavationDurationDays": 150,
    "excavationWidthMeters": 6,
    "excavationDepthMeters": 1.2,
    "affectedAreaSqMeters": 10800,
    "estimatedCostINR": 950000000,
    "estimatedExcavationCostINR": 3780000,
    "estimatedRestorationCostINR": 7020000,
    "trafficImpact": "Medium",
    "priority": "High Priority",
    "isEmergency": false,
    "contractorId": "CTR-NSK-07",
    "contractorName": "Shapoorji Pallonji EPC Ltd. & NSSCDCL",
    "status": "IN_PROGRESS",
    "documents": [],
    "submittedBy": "Er. Rajesh Kulkarni",
    "submittedByDesignation": "Chief City Infrastructure Nodal Officer",
    "submittedAt": "2025-09-20T12:00:00.000Z",
    "progressPercentage": 68,
    "currentWorkPhase": "Ghat Paver Stone Laying & Heritage Lamppost Installation"
  },
  {
    "id": "PROJ-NSK-2026-08",
    "code": "NSK-TRM-008",
    "name": "Trimbak Road 4-Lane Concrete Widening & Satpur Industrial Corridor Upgrade",
    "department": "Roads / PWD",
    "projectType": "White-Topping Cement Concrete (PQC) Dual Carriage & Heavy Vehicle Lanes",
    "description": "Four-laning of Trimbak Road from CBS to Satpur MIDC & Trimbak Phata to facilitate heavy industrial freight and pilgrimage buses to Trimbakeshwar.",
    "roadId": "RD-NSK-04",
    "roadName": "Trimbak Road Pilgrim & Industrial Corridor (CBS to Satpur MIDC & Trimbak Phata)",
    "geometry": [
      {
        "lat": 19.998,
        "lng": 73.784
      },
      {
        "lat": 19.991,
        "lng": 73.771
      },
      {
        "lat": 19.983,
        "lng": 73.752
      },
      {
        "lat": 19.974,
        "lng": 73.731
      }
    ],
    "startCoordinates": {
      "lat": 19.998,
      "lng": 73.784
    },
    "endCoordinates": {
      "lat": 19.974,
      "lng": 73.731
    },
    "lengthMeters": 8500,
    "requiredStartDate": "2026-01-10T00:00:00.000Z",
    "requiredCompletionDate": "2026-11-30T00:00:00.000Z",
    "expectedExcavationDurationDays": 140,
    "excavationWidthMeters": 18,
    "excavationDepthMeters": 0.8,
    "affectedAreaSqMeters": 153000,
    "estimatedCostINR": 1450000000,
    "estimatedExcavationCostINR": 53550000,
    "estimatedRestorationCostINR": 99450000,
    "trafficImpact": "High",
    "priority": "Planned",
    "isEmergency": false,
    "contractorId": "CTR-NSK-02",
    "contractorName": "Ashoka Buildcon Ltd.",
    "status": "IN_PROGRESS",
    "documents": [],
    "submittedBy": "Er. Nitin Rajput",
    "submittedByDesignation": "Superintending Engineer (PWD)",
    "submittedAt": "2025-12-28T10:00:00.000Z",
    "progressPercentage": 48,
    "currentWorkPhase": "Pavement Quality Concrete (PQC) Slip-Form Paving"
  },
  {
    "id": "PROJ-NSK-2026-09",
    "code": "NSK-TEL-009",
    "name": "BSNL / BharatNet 5G Smart City Optical Fiber Backhaul Ring (College Road)",
    "department": "Telecom & Digital",
    "projectType": "Micro-Trenching 4-Way PLB HDPE Conduit for Smart City CCTV Surveillance",
    "description": "Laying 96-core optical fiber network along College Road to connect 240+ Kumbh security surveillance cameras to the Integrated Command Center.",
    "roadId": "RD-NSK-03",
    "roadName": "College Road High-Street Commercial Corridor (Canada Corner to Krishi Nagar)",
    "geometry": [
      {
        "lat": 19.999,
        "lng": 73.776
      },
      {
        "lat": 20.004,
        "lng": 73.768
      },
      {
        "lat": 20.0085,
        "lng": 73.7595
      }
    ],
    "startCoordinates": {
      "lat": 19.999,
      "lng": 73.776
    },
    "endCoordinates": {
      "lat": 20.0085,
      "lng": 73.7595
    },
    "lengthMeters": 2400,
    "requiredStartDate": "2026-09-01T00:00:00.000Z",
    "requiredCompletionDate": "2026-10-31T00:00:00.000Z",
    "expectedExcavationDurationDays": 30,
    "excavationWidthMeters": 0.4,
    "excavationDepthMeters": 1,
    "affectedAreaSqMeters": 960,
    "estimatedCostINR": 240000000,
    "estimatedExcavationCostINR": 336000,
    "estimatedRestorationCostINR": 624000,
    "trafficImpact": "Medium",
    "priority": "Routine",
    "isEmergency": false,
    "contractorId": "CTR-NSK-08",
    "contractorName": "HFCL Telecom Infrastructure Ltd.",
    "status": "SUBMITTED",
    "documents": [],
    "submittedBy": "Er. Rajesh Kulkarni",
    "submittedByDesignation": "Chief Nodal Officer",
    "submittedAt": "2026-08-10T15:30:00.000Z",
    "progressPercentage": 0,
    "currentWorkPhase": "Awaiting Nodal Coordination Approval"
  },
  {
    "id": "PROJ-NSK-2026-10",
    "code": "NSK-DRN-010",
    "name": "Indira Nagar 100-Ft Ring Road Stormwater Drain & Cross-Culvert Upgrade",
    "department": "Drainage Department",
    "projectType": "Precast RCC NP4 Stormwater Culvert & Silt Chamber Construction",
    "description": "Installation of 1500mm RCC box drainage culverts along Lekha Nagar and Pathardi Gaon link to eliminate perennial monsoon flooding.",
    "roadId": "RD-NSK-11",
    "roadName": "Indira Nagar Jogging Track & 100-Ft Ring Road Corridor (Lekha Nagar to Pathardi Gaon)",
    "geometry": [
      {
        "lat": 19.9654,
        "lng": 73.778
      },
      {
        "lat": 19.96,
        "lng": 73.766
      },
      {
        "lat": 19.955,
        "lng": 73.754
      }
    ],
    "startCoordinates": {
      "lat": 19.9654,
      "lng": 73.778
    },
    "endCoordinates": {
      "lat": 19.955,
      "lng": 73.754
    },
    "lengthMeters": 3200,
    "requiredStartDate": "2026-03-01T00:00:00.000Z",
    "requiredCompletionDate": "2026-07-20T00:00:00.000Z",
    "expectedExcavationDurationDays": 90,
    "excavationWidthMeters": 1.6,
    "excavationDepthMeters": 2.2,
    "affectedAreaSqMeters": 5120,
    "estimatedCostINR": 320000000,
    "estimatedExcavationCostINR": 1792000,
    "estimatedRestorationCostINR": 3328000,
    "trafficImpact": "Medium",
    "priority": "Planned",
    "isEmergency": false,
    "contractorId": "CTR-NSK-09",
    "contractorName": "B.G. Shirke Construction Technology",
    "status": "COMPLETED",
    "documents": [],
    "submittedBy": "Er. Nitin Rajput",
    "submittedByDesignation": "Superintending Engineer (PWD)",
    "submittedAt": "2026-02-15T09:00:00.000Z",
    "progressPercentage": 100,
    "currentWorkPhase": "Project Fully Completed & Restored"
  },
  {
    "id": "PRJ-104",
    "code": "WTR-104",
    "name": "Gangapur Road Water Pipeline Replacement",
    "department": "Water & Sewerage",
    "projectType": "600mm DI Potable Water Pipeline Replacement",
    "description": "Essential replacement of aging drinking water transmission pipeline along Gangapur Road corridor before Kumbh Mela.",
    "roadId": "RD-NSK-02",
    "roadName": "Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)",
    "geometry": [
      { "lat": 19.9975, "lng": 73.785 },
      { "lat": 20.0062, "lng": 73.7745 },
      { "lat": 20.0145, "lng": 73.761 }
    ],
    "startCoordinates": { "lat": 19.9975, "lng": 73.785 },
    "endCoordinates": { "lat": 20.0145, "lng": 73.761 },
    "lengthMeters": 2400,
    "requiredStartDate": "2026-08-01T00:00:00.000Z",
    "requiredCompletionDate": "2026-08-15T00:00:00.000Z",
    "expectedExcavationDurationDays": 15,
    "excavationWidthMeters": 1.2,
    "excavationDepthMeters": 1.8,
    "affectedAreaSqMeters": 2880,
    "estimatedCostINR": 18500000,
    "estimatedExcavationCostINR": 850000,
    "estimatedRestorationCostINR": 1450000,
    "trafficImpact": "High",
    "priority": "Planned",
    "isEmergency": false,
    "contractorId": "CTR-NSK-01",
    "contractorName": "Patil Infrastructure & Pipelines Ltd.",
    "status": "SUBMITTED",
    "documents": [],
    "submittedBy": "Er. Sanjay Shinde",
    "submittedByDesignation": "Executive Engineer (Water & Sewerage)",
    "submittedAt": "2026-07-20T09:00:00.000Z",
    "progressPercentage": 0,
    "currentWorkPhase": "AI Coordination Analysis & Multi-Utility Review"
  },
  {
    "id": "PRJ-105",
    "code": "DRN-105",
    "name": "Gangapur Road Stormwater Drainage Improvement",
    "department": "Drainage Department",
    "projectType": "1400mm Precast Box Culvert & Silt Trap Construction",
    "description": "Deep stormwater trunk culvert installation along Gangapur Road to eliminate monsoon water-logging at key junctions.",
    "roadId": "RD-NSK-02",
    "roadName": "Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)",
    "geometry": [
      { "lat": 19.9975, "lng": 73.785 },
      { "lat": 20.0062, "lng": 73.7745 },
      { "lat": 20.0145, "lng": 73.761 }
    ],
    "startCoordinates": { "lat": 19.9975, "lng": 73.785 },
    "endCoordinates": { "lat": 20.0145, "lng": 73.761 },
    "lengthMeters": 2400,
    "requiredStartDate": "2026-08-10T00:00:00.000Z",
    "requiredCompletionDate": "2026-08-25T00:00:00.000Z",
    "expectedExcavationDurationDays": 16,
    "excavationWidthMeters": 1.6,
    "excavationDepthMeters": 2.6,
    "affectedAreaSqMeters": 3840,
    "estimatedCostINR": 22000000,
    "estimatedExcavationCostINR": 1150000,
    "estimatedRestorationCostINR": 1900000,
    "trafficImpact": "High",
    "priority": "Planned",
    "isEmergency": false,
    "contractorId": "CTR-NSK-02",
    "contractorName": "Eagle Infra India Ltd.",
    "status": "SUBMITTED",
    "documents": [],
    "submittedBy": "Er. Sunil Gaikwad",
    "submittedByDesignation": "Executive Engineer (Drainage)",
    "submittedAt": "2026-07-22T10:30:00.000Z",
    "progressPercentage": 0,
    "currentWorkPhase": "AI Coordination Analysis & Multi-Utility Review"
  },
  {
    "id": "PRJ-106",
    "code": "TEL-106",
    "name": "Gangapur Road 5G BharatNet OFC Installation",
    "department": "Telecom & Digital",
    "projectType": "Micro-Trenching 4-Way PLB HDPE Duct & 96-Core OFC",
    "description": "Laying BharatNet 5G telecom optical fiber ducts along Gangapur Road for smart traffic signals and high-speed corridor connectivity.",
    "roadId": "RD-NSK-02",
    "roadName": "Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)",
    "geometry": [
      { "lat": 19.9975, "lng": 73.785 },
      { "lat": 20.0062, "lng": 73.7745 },
      { "lat": 20.0145, "lng": 73.761 }
    ],
    "startCoordinates": { "lat": 19.9975, "lng": 73.785 },
    "endCoordinates": { "lat": 20.0145, "lng": 73.761 },
    "lengthMeters": 2400,
    "requiredStartDate": "2026-08-18T00:00:00.000Z",
    "requiredCompletionDate": "2026-08-30T00:00:00.000Z",
    "expectedExcavationDurationDays": 13,
    "excavationWidthMeters": 0.4,
    "excavationDepthMeters": 0.9,
    "affectedAreaSqMeters": 960,
    "estimatedCostINR": 8500000,
    "estimatedExcavationCostINR": 420000,
    "estimatedRestorationCostINR": 750000,
    "trafficImpact": "Medium",
    "priority": "Planned",
    "isEmergency": false,
    "contractorId": "CTR-NSK-03",
    "contractorName": "HFCL Telecom Ltd.",
    "status": "SUBMITTED",
    "documents": [],
    "submittedBy": "Er. Priya Sharma",
    "submittedByDesignation": "Chief Telecom Officer",
    "submittedAt": "2026-07-25T14:00:00.000Z",
    "progressPercentage": 0,
    "currentWorkPhase": "AI Coordination Analysis & Multi-Utility Review"
  }
];
const INITIAL_CONFLICTS: Conflict[] = [
  {
    "id": "CONF-NSK-01",
    "projectAId": "PROJ-NSK-2026-03",
    "projectAName": "MNGL Medium-Pressure City Gas Distribution Grid (Gangapur Road & Sirin Meadows)",
    "projectADept": "City Gas Distribution",
    "projectBId": "PROJ-NSK-2026-04",
    "projectBName": "MSEDCL 33kV Underground Ring Feeder Cabling (Gangapur Road & College Road)",
    "projectBDept": "Electricity (DISCOM)",
    "roadId": "RD-NSK-02",
    "roadName": "Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)",
    "spatialOverlapPct": 100,
    "spatialOverlapDistanceMeters": 3800,
    "temporalOverlapDays": 45,
    "conflictScore": 92,
    "severity": "CRITICAL",
    "reasons": [
      "Simultaneous excavation along 3.8km of high-traffic Gangapur Road arterial near Sirin Meadows & Jehan Circle.",
      "Critical danger of power cable heavy drilling rupturing proposed 125mm PNG gas main (History of 2026 gas leak accidents).",
      "Uncoordinated digs will destroy newly laid asphalt surface twice in 3 months."
    ],
    "status": "IN_COORDINATION",
    "createdAt": "2026-08-01T10:00:00.000Z"
  },
  {
    "id": "CONF-NSK-02",
    "projectAId": "PROJ-NSK-2026-03",
    "projectAName": "MNGL Medium-Pressure City Gas Distribution Grid (Gangapur Road & Sirin Meadows)",
    "projectADept": "City Gas Distribution",
    "projectBId": "PROJ-NSK-2026-05",
    "projectBName": "Someshwar - Panchavati 1200mm Water Trunk Transmission Line Upgrade",
    "projectBDept": "Water & Sewerage",
    "roadId": "RD-NSK-02",
    "roadName": "Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)",
    "spatialOverlapPct": 100,
    "spatialOverlapDistanceMeters": 3800,
    "temporalOverlapDays": 60,
    "conflictScore": 88,
    "severity": "HIGH",
    "reasons": [
      "Deep 2.4m water trunk trench directly adjacent to 1.8m gas pipeline alignment.",
      "Excavation shoring must be shared to prevent soil cave-in along residential corridor."
    ],
    "status": "IN_COORDINATION",
    "createdAt": "2026-08-05T11:30:00.000Z"
  }
];
const INITIAL_CLUSTERS: CoordinationCluster[] = [
  {
    "id": "CLUST-NSK-001",
    "clusterCode": "CLUST-GANGAPUR-2026",
    "name": "Gangapur Road Multi-Agency Kumbh Excavation Corridor (MNGL Gas + MSEDCL Power + NMC Water)",
    "roadId": "RD-NSK-02",
    "roadName": "Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)",
    "projectIds": [
      "PROJ-NSK-2026-03",
      "PROJ-NSK-2026-04",
      "PROJ-NSK-2026-05"
    ],
    "projects": [
      {
        "id": "PROJ-NSK-2026-03",
        "code": "NSK-GAS-003",
        "name": "MNGL Medium-Pressure City Gas Distribution Grid (Gangapur Road & Sirin Meadows)",
        "department": "City Gas Distribution",
        "projectType": "125mm MDPE Domestic PNG Reticulation & Safety Isolation Valves",
        "description": "Laying reticulated PNG gas pipelines along Gangapur Road corridor to fulfill NMC two-month connection directive with enhanced saw-cut safety.",
        "roadId": "RD-NSK-02",
        "roadName": "Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)",
        "geometry": [
          {
            "lat": 19.9975,
            "lng": 73.785
          },
          {
            "lat": 20.0062,
            "lng": 73.7745
          },
          {
            "lat": 20.0145,
            "lng": 73.761
          }
        ],
        "startCoordinates": {
          "lat": 19.9975,
          "lng": 73.785
        },
        "endCoordinates": {
          "lat": 20.0145,
          "lng": 73.761
        },
        "lengthMeters": 3800,
        "requiredStartDate": "2026-08-01T00:00:00.000Z",
        "requiredCompletionDate": "2026-10-30T00:00:00.000Z",
        "expectedExcavationDurationDays": 45,
        "excavationWidthMeters": 0.8,
        "excavationDepthMeters": 1.8,
        "affectedAreaSqMeters": 3040,
        "estimatedCostINR": 480000000,
        "estimatedExcavationCostINR": 1064000,
        "estimatedRestorationCostINR": 1976000,
        "trafficImpact": "High",
        "priority": "Planned",
        "isEmergency": false,
        "contractorId": "CTR-NSK-03",
        "contractorName": "Eagle Infra India Ltd. / MNGL Works",
        "status": "CONFLICT_DETECTED",
        "documents": [
          {
            "id": "DOC-NSK-03",
            "title": "MNGL Safe Trenching & Pipeline Isolation Drawing",
            "type": "Engineering Drawing",
            "fileName": "MNGL_Gangapur_Trenching_Drawings.pdf",
            "fileSize": "5.4 MB",
            "uploadedAt": "2026-07-25T16:20:00.000Z",
            "uploadedBy": "Er. Prashant Wagh"
          }
        ],
        "submittedBy": "Er. Prashant Wagh",
        "submittedByDesignation": "Chief Project Manager (MNGL)",
        "submittedAt": "2026-07-20T10:00:00.000Z",
        "progressPercentage": 15,
        "currentWorkPhase": "Trench Saw-Cutting & Shoring Preparation"
      },
      {
        "id": "PROJ-NSK-2026-04",
        "code": "NSK-ELE-004",
        "name": "MSEDCL 33kV Underground Ring Feeder Cabling (Gangapur Road & College Road)",
        "department": "Electricity (DISCOM)",
        "projectType": "33kV XLPE Underground Armored Power Cabling & Overhead Wire Removal",
        "description": "Conversion of overhead electricity wires into high-reliability 33kV underground ring feeder along Gangapur Road to prevent monsoon tripping.",
        "roadId": "RD-NSK-02",
        "roadName": "Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)",
        "geometry": [
          {
            "lat": 19.9975,
            "lng": 73.785
          },
          {
            "lat": 20.0062,
            "lng": 73.7745
          },
          {
            "lat": 20.0145,
            "lng": 73.761
          }
        ],
        "startCoordinates": {
          "lat": 19.9975,
          "lng": 73.785
        },
        "endCoordinates": {
          "lat": 20.0145,
          "lng": 73.761
        },
        "lengthMeters": 3800,
        "requiredStartDate": "2026-08-15T00:00:00.000Z",
        "requiredCompletionDate": "2026-11-15T00:00:00.000Z",
        "expectedExcavationDurationDays": 60,
        "excavationWidthMeters": 1,
        "excavationDepthMeters": 1.5,
        "affectedAreaSqMeters": 3800,
        "estimatedCostINR": 650000000,
        "estimatedExcavationCostINR": 1330000,
        "estimatedRestorationCostINR": 2470000,
        "trafficImpact": "High",
        "priority": "Planned",
        "isEmergency": false,
        "contractorId": "CTR-NSK-04",
        "contractorName": "Sterling & Wilson Powergen Pvt Ltd.",
        "status": "CONFLICT_DETECTED",
        "documents": [],
        "submittedBy": "Er. Deepak Jadhav",
        "submittedByDesignation": "Superintending Engineer (MSEDCL)",
        "submittedAt": "2026-07-28T14:30:00.000Z",
        "progressPercentage": 10,
        "currentWorkPhase": "Route Inspection & Substation Feeder Tie-In"
      },
      {
        "id": "PROJ-NSK-2026-05",
        "code": "NSK-WTR-005",
        "name": "Someshwar - Panchavati 1200mm Water Trunk Transmission Line Upgrade",
        "department": "Water & Sewerage",
        "projectType": "1200mm Mild Steel Mortar Lined Water Trunk Replacement",
        "description": "Replacement of critical 1200mm bulk water supply transmission main from Someshwar Water Works along Gangapur Road for Kumbh 2027 water surge.",
        "roadId": "RD-NSK-02",
        "roadName": "Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)",
        "geometry": [
          {
            "lat": 19.9975,
            "lng": 73.785
          },
          {
            "lat": 20.0062,
            "lng": 73.7745
          },
          {
            "lat": 20.0145,
            "lng": 73.761
          }
        ],
        "startCoordinates": {
          "lat": 19.9975,
          "lng": 73.785
        },
        "endCoordinates": {
          "lat": 20.0145,
          "lng": 73.761
        },
        "lengthMeters": 3800,
        "requiredStartDate": "2026-08-10T00:00:00.000Z",
        "requiredCompletionDate": "2026-11-30T00:00:00.000Z",
        "expectedExcavationDurationDays": 75,
        "excavationWidthMeters": 2,
        "excavationDepthMeters": 2.4,
        "affectedAreaSqMeters": 7600,
        "estimatedCostINR": 1120000000,
        "estimatedExcavationCostINR": 2660000,
        "estimatedRestorationCostINR": 4940000,
        "trafficImpact": "High",
        "priority": "High Priority",
        "isEmergency": false,
        "contractorId": "CTR-NSK-05",
        "contractorName": "NCC Infrastructure Ltd.",
        "status": "CONFLICT_DETECTED",
        "documents": [],
        "submittedBy": "Er. Sanjay Shinde",
        "submittedByDesignation": "Executive Engineer (Water & Sewerage)",
        "submittedAt": "2026-07-22T11:45:00.000Z",
        "progressPercentage": 20,
        "currentWorkPhase": "Pipe Stockpile Mobilization & Deep Trench Shoring"
      }
    ],
    "recommendedWindowStart": "2026-09-01",
    "recommendedWindowEnd": "2026-09-22",
    "recommendedSequence": [
      "Phase 0: Deploy Traffic Police Diversion & LED Arrow Barricading at CBS & Jehan Circle",
      "Phase 1: Deep Trenching (2.4m Depth) - Lay 1200mm Mild Steel Water Trunk Line (NMC Water)",
      "Phase 2: Intermediate Trenching (1.8m Depth) - Lay 125mm MDPE PNG Gas Pipeline with Warning Mesh (MNGL)",
      "Phase 3: Utility Ducting (1.5m Depth) - Lay 33kV XLPE Power Cable in HDPE Conduits (MSEDCL)",
      "Phase 4: Graded Granular Sub-base (GSB) Backfill & 95%+ Proctor Density Compaction Test",
      "Phase 5: Single Unified Bituminous Concrete (BC) Asphalt Resurfacing & 24-Month Defect Lock"
    ],
    "excavationsAvoided": 2,
    "restorationsAvoided": 2,
    "estimatedCostSavedINR": 38200000,
    "trafficDisruptionReductionPct": 65,
    "aiConfidence": 0.94,
    "aiReasoning": [
      "Consolidates 3 distinct departmental excavations along Gangapur Road into a single 22-day synchronized window.",
      "Saves ₹3.82 Crores by sharing earthmoving machinery, trench shoring, and conducting 1 unified asphalt resurfacing.",
      "Eliminates the high risk of gas pipeline rupture during subsequent power cable excavations.",
      "Reduces commuter traffic delay by 65% across KBT Circle, BYK College, and Someshwar approach."
    ],
    "status": "ACCEPTED",
    "departmentApprovals": {
      "Water & Sewerage": {
        "approved": true,
        "officer": "Er. Sanjay Shinde",
        "designation": "Executive Engineer (Water Supply)",
        "timestamp": "2026-08-20T10:30:00.000Z",
        "notes": "Agreed to lay deep water trunk first and supervise shared trench backfill."
      },
      "City Gas Distribution": {
        "approved": true,
        "officer": "Er. Prashant Wagh",
        "designation": "Chief Project Manager (MNGL)",
        "timestamp": "2026-08-21T14:15:00.000Z",
        "notes": "Compliant with NMC two-month ultimatum; gas line warning tiles will be embedded."
      },
      "Electricity (DISCOM)": {
        "approved": true,
        "officer": "Er. Deepak Jadhav",
        "designation": "Superintending Engineer (MSEDCL)",
        "timestamp": "2026-08-22T11:00:00.000Z",
        "notes": "Concurred with 1.5m upper utility duct positioning."
      },
      "Roads / PWD": {
        "approved": true,
        "officer": "Er. Nitin Rajput",
        "designation": "Superintending Engineer (PWD)",
        "timestamp": "2026-08-23T09:45:00.000Z",
        "notes": "Single final asphalt resurfacing authorized under Section 313."
      }
    },
    "createdAt": "2026-08-18T12:00:00.000Z"
  }
];
const INITIAL_WORKFLOWS: ApprovalWorkflow[] = [
  {
    "id": "WF-NSK-01",
    "projectId": "PROJ-NSK-2026-03",
    "projectName": "MNGL Medium-Pressure City Gas Distribution Grid (Gangapur Road & Sirin Meadows)",
    "department": "City Gas Distribution",
    "currentStepIndex": 1,
    "steps": [
      {
        "id": "STP-01",
        "stepName": "Technical Spatial & Conflict Verification",
        "roleRequired": "NODAL_OFFICER",
        "departmentRequired": "Smart City & Urban Planning",
        "status": "APPROVED",
        "approverName": "Er. Rajesh Kulkarni",
        "approverDesignation": "Chief Nodal Officer",
        "actionDate": "2026-07-26T11:00:00.000Z",
        "remarks": "Conflict detected with MSEDCL & Water Main. Transferred to Joint Coordination Cluster CLUST-GANGAPUR-2026."
      },
      {
        "id": "STP-02",
        "stepName": "Multi-Agency Joint Coordination Endorsement",
        "roleRequired": "EXECUTIVE_ENGINEER",
        "departmentRequired": "Water & Sewerage",
        "status": "APPROVED",
        "approverName": "Er. Sanjay Shinde",
        "approverDesignation": "Executive Engineer (Water)",
        "actionDate": "2026-08-20T10:30:00.000Z",
        "remarks": "Accepted 22-day synchronized excavation window."
      },
      {
        "id": "STP-03",
        "stepName": "Traffic Police NOC Clearance",
        "roleRequired": "TRAFFIC_POLICE",
        "departmentRequired": "Traffic Authority",
        "status": "APPROVED",
        "approverName": "DCP Sandeep Patil",
        "approverDesignation": "DCP Traffic",
        "actionDate": "2026-08-22T16:00:00.000Z",
        "remarks": "Diversion via Someshwar link road approved."
      },
      {
        "id": "STP-04",
        "stepName": "Apex Statutory Road Opening Permit Sanction",
        "roleRequired": "COMMISSIONER",
        "departmentRequired": "Municipal Authority",
        "status": "PENDING"
      }
    ],
    "overallStatus": "PENDING",
    "updatedAt": "2026-08-23T10:00:00.000Z"
  }
];
const INITIAL_PERMITS: RoadOpeningPermit[] = [
  {
    "id": "PERMIT-NSK-2026-01",
    "permitNumber": "ROP-NMC-2026-0881",
    "projectId": "PROJ-NSK-2026-01",
    "projectName": "Simhastha Kumbh 2027 66-km Outer Ring Road (Parikrama Marg Phase-1)",
    "department": "Roads / PWD",
    "roadId": "RD-NSK-09",
    "roadName": "Ambad MIDC Industrial Connector Corridor (Garware Point to XLO & Siemens Circle)",
    "contractorName": "L&T Infrastructure Construction Ltd.",
    "contractorContact": "Er. Sunil Mahajan (+91 98221 44550)",
    "approvedGeometry": [
      {
        "lat": 19.945,
        "lng": 73.748
      },
      {
        "lat": 19.948,
        "lng": 73.736
      },
      {
        "lat": 19.953,
        "lng": 73.724
      },
      {
        "lat": 19.961,
        "lng": 73.715
      }
    ],
    "validFrom": "2026-01-15T00:00:00.000Z",
    "validTo": "2027-03-31T00:00:00.000Z",
    "excavationDimensions": {
      "lengthMeters": 5600,
      "widthMeters": 4.5,
      "depthMeters": 2.2,
      "totalAreaSqM": 25200
    },
    "trafficConditions": [
      "Heavy freight movement permitted via single lane from 09:00 PM to 06:00 AM.",
      "Mandatory deployment of 6 certified Traffic Marshals with illuminated batons.",
      "Continuous LED directional arrow boards at Garware & XLO Circles."
    ],
    "safetyGuidelines": [
      "Continuous double-tier steel barricading (2.0m height) along active excavation.",
      "Mandatory daily water sprinkling to suppress dust.",
      "Hard hats, high-vis reflective jackets, and steel-toe boots mandatory for all labor."
    ],
    "restorationDeadline": "2027-04-15T00:00:00.000Z",
    "securityDepositINR": 16380000,
    "qrCodeDataUrl": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"><rect width=\"100\" height=\"100\" fill=\"white\"/><text x=\"10\" y=\"50\" font-size=\"10\" fill=\"black\">NMC-ROP-0881</text></svg>",
    "status": "ACTIVE",
    "issuedBy": "Dr. Pravin Gedam (IAS)",
    "issuedByDesignation": "Municipal Commissioner & CEO",
    "issuedAt": "2026-01-12T14:30:00.000Z"
  },
  {
    "id": "PERMIT-NSK-2026-02",
    "permitNumber": "ROP-NMC-2026-0892",
    "projectId": "PROJ-NSK-2026-02",
    "projectName": "Dwarka to Datta Mandir 10-Lane Highway Widening & Utility Relocation",
    "department": "Roads / PWD",
    "roadId": "RD-NSK-05",
    "roadName": "Nashik - Pune National Highway (NH-60 / Dwarka to Nashik Road Station & Sinnar Phata)",
    "contractorName": "Ashoka Buildcon Ltd.",
    "contractorContact": "Er. Nilesh Bafna (+91 98230 55109)",
    "approvedGeometry": [
      {
        "lat": 19.9882,
        "lng": 73.7924
      },
      {
        "lat": 19.976,
        "lng": 73.806
      },
      {
        "lat": 19.963,
        "lng": 73.821
      }
    ],
    "validFrom": "2026-02-01T00:00:00.000Z",
    "validTo": "2026-12-31T00:00:00.000Z",
    "excavationDimensions": {
      "lengthMeters": 4200,
      "widthMeters": 3.5,
      "depthMeters": 2.8,
      "totalAreaSqM": 14700
    },
    "trafficConditions": [
      "Excavation restricted to off-peak night hours (10:30 PM - 05:30 AM).",
      "Dwarka Circle rotary to remain completely open with active traffic police escort."
    ],
    "safetyGuidelines": [
      "Retro-reflective warning signage 100m in advance of work zone.",
      "Emergency vehicle corridor to be maintained 24x7."
    ],
    "restorationDeadline": "2027-01-15T00:00:00.000Z",
    "securityDepositINR": 9555000,
    "qrCodeDataUrl": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"><rect width=\"100\" height=\"100\" fill=\"white\"/><text x=\"10\" y=\"50\" font-size=\"10\" fill=\"black\">NMC-ROP-0892</text></svg>",
    "status": "ACTIVE",
    "issuedBy": "Dr. Pravin Gedam (IAS)",
    "issuedByDesignation": "Municipal Commissioner & CEO",
    "issuedAt": "2026-01-25T16:00:00.000Z"
  }
];
const INITIAL_HISTORY: RoadWorkHistoryItem[] = [];
const INITIAL_COMPLAINTS: CitizenComplaint[] = [
  {
    "id": "CMP-NSK-001",
    "complaintNumber": "NMC-GRV-2026-8812",
    "roadId": "RD-NSK-02",
    "roadName": "Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)",
    "category": "UNPAVED_POTHOLE_AFTER_WORK",
    "description": "Gas pipeline digging near Sirin Meadows left an unbarricaded open ditch and loose mud. Heavy traffic jam near BYK Circle during school rush hours.",
    "location": {
      "lat": 20.0062,
      "lng": 73.7745
    },
    "status": "ACTION_TAKEN",
    "priority": "HIGH",
    "linkedProjectId": "PROJ-NSK-2026-03",
    "linkedDepartment": "City Gas Distribution",
    "linkedContractor": "Eagle Infra India Ltd.",
    "citizenName": "Adv. Swati Deshmukh",
    "citizenPhone": "+91 98901 22345",
    "reportedAt": "2026-08-20T08:30:00.000Z",
    "assignedOfficer": "Er. Mahesh Patil",
    "assignedOfficerDesignation": "Senior Quality & Safety Inspector",
    "mayorActionNotice": "Nodal Officer directed contractor to deploy LED barricades within 2 hours under penalty warning.",
    "actionTakenNotes": "LED barricading deployed; loose gravel leveled and compacted with GSB.",
    "resolvedAt": "2026-08-21T17:00:00.000Z"
  },
  {
    "id": "CMP-NSK-002",
    "complaintNumber": "NMC-GRV-2026-8819",
    "roadId": "RD-NSK-03",
    "roadName": "College Road High-Street Commercial Corridor (Canada Corner to Krishi Nagar)",
    "category": "UNPAVED_POTHOLE_AFTER_WORK",
    "description": "Uneven road surface and deep trench cut opposite Canada Corner Big Bazaar causing two-wheelers to skid in the evening.",
    "location": {
      "lat": 19.999,
      "lng": 73.776
    },
    "status": "RESOLVED",
    "priority": "NORMAL",
    "linkedDepartment": "Roads / PWD",
    "citizenName": "Rohit Kadam",
    "citizenPhone": "+91 98224 99102",
    "reportedAt": "2026-08-18T19:15:00.000Z",
    "assignedOfficer": "Er. Mahesh Patil",
    "assignedOfficerDesignation": "Senior Quality & Safety Inspector",
    "actionTakenNotes": "Cold mix mastic asphalt patch applied. Surface leveled.",
    "resolvedAt": "2026-08-19T14:30:00.000Z"
  },
  {
    "id": "CMP-NSK-003",
    "complaintNumber": "NMC-GRV-2026-8834",
    "roadId": "RD-NSK-05",
    "roadName": "Nashik - Pune National Highway (NH-60 / Dwarka to Nashik Road Station & Sinnar Phata)",
    "category": "MISSING_BARRICADES_HAZARD",
    "description": "Heavy dust and lack of water sprinkling during 10-lane widening work near Dwarka Circle. Zero visibility for commuters.",
    "location": {
      "lat": 19.9882,
      "lng": 73.7924
    },
    "status": "UNDER_INVESTIGATION",
    "priority": "CRITICAL_HAZARD",
    "linkedProjectId": "PROJ-NSK-2026-02",
    "linkedDepartment": "Roads / PWD",
    "linkedContractor": "Ashoka Buildcon Ltd.",
    "citizenName": "Vikas Sonawane",
    "citizenPhone": "+91 94227 33410",
    "reportedAt": "2026-08-24T11:00:00.000Z",
    "assignedOfficer": "Er. Rajesh Kulkarni",
    "assignedOfficerDesignation": "Chief Nodal Officer",
    "mayorActionNotice": "Issued show-cause notice to Ashoka Buildcon for mandatory twice-daily water sprinkling and dust nets."
  }
];
const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    "id": "NOTIF-NSK-01",
    "targetRole": "ALL",
    "title": "Simhastha Kumbh Mela 2027 Infrastructure Fast-Track Mandate",
    "message": "NMC & MoHUA directive: All 28 Kumbh Mela arterial road stretches must complete joint trench consolidation before March 2027.",
    "type": "EMERGENCY",
    "timestamp": "2026-08-26T17:08:03.512Z",
    "isRead": false
  },
  {
    "id": "NOTIF-NSK-02",
    "targetRole": "COMMISSIONER",
    "title": "AI Trench Consolidation: ₹3.82 Crore Saved on Gangapur Road",
    "message": "MR. MAYOR AI Coordinator successfully synchronized MNGL Gas, MSEDCL Power, and NMC Water Works into Cluster CLUST-GANGAPUR-2026.",
    "type": "COORDINATION",
    "timestamp": "2026-08-26T13:08:03.513Z",
    "isRead": false
  }
];
const INITIAL_AUDIT_LOGS: AuditLogItem[] = [];

const INITIAL_SETTINGS: SystemSettingsConfig = {
  defaultProtectionDays: 180,
  seniorApprovalThresholdINR: 5000000,
  highTrafficAutoTrafficAuthority: true,
  conflictWeights: {
    sameRoad: 30,
    geometryOverlap: 30,
    proximityBuffer: 15,
    timeOverlap: 20,
    recentRestoration: 20,
    highTrafficSensitivity: 10,
    compatibleWorkBonus: 15,
  },
  excavationCostPerSqM: 350,
  restorationCostPerSqM: 650,
};

export const INITIAL_CITIES: CityPortalConfig[] = [
  {
    id: 'nashik',
    name: 'Nashik',
    state: 'Maharashtra',
    district: 'Nashik',
    corporationName: 'Nashik Municipal Corporation (NMC)',
    corporationType: 'MUNICIPAL_CORPORATION',
    cityAccessCode: 'NMC-MH-2026-HQ',
    coordinates: { lat: 19.9975, lng: 73.7898 },
    commissionerName: 'Dr. Pravin Gedam (IAS)',
    nodalOfficerName: 'Er. Rajesh Kulkarni',
    wardCount: 122,
    activeWards: ['Ward 1 - Panchavati', 'Ward 2 - CIDCO', 'Ward 3 - Nashik Road', 'Ward 4 - Satpur', 'Ward 5 - Old City'],
    totalRoadsKm: 1420,
    createdDate: '2026-01-01T00:00:00.000Z',
    departmentConnectionCodes: {
      pwd: 'PWD-MH-8821',
      water: 'WTR-MH-3392',
      electricity: 'ELE-MH-7714',
      gas: 'GAS-MH-4419',
      telecom: 'TEL-MH-9930',
      traffic: 'TRF-MH-1108',
      contractor: 'CTR-MH-5520',
    },
    isProductionActive: true,
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    district: 'Pune',
    corporationName: 'Pune Municipal Corporation (PMC)',
    corporationType: 'MUNICIPAL_CORPORATION',
    cityAccessCode: 'PMC-MH-2026-HQ',
    coordinates: { lat: 18.5204, lng: 73.8567 },
    commissionerName: 'Vikram Kumar (IAS)',
    nodalOfficerName: 'Er. Srinivas Kandul',
    wardCount: 164,
    activeWards: ['Ward 1 - Shivajinagar', 'Ward 2 - Kothrud', 'Ward 3 - Baner-Balewadi', 'Ward 4 - Hadapsar', 'Ward 5 - Viman Nagar'],
    totalRoadsKm: 2150,
    createdDate: '2026-01-15T00:00:00.000Z',
    departmentConnectionCodes: {
      pwd: 'PWD-PUN-8101',
      water: 'WTR-PUN-3204',
      electricity: 'ELE-PUN-7110',
      gas: 'GAS-PUN-4099',
      telecom: 'TEL-PUN-9122',
      traffic: 'TRF-PUN-1044',
      contractor: 'CTR-PUN-5188',
    },
    isProductionActive: true,
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    corporationName: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    corporationType: 'MUNICIPAL_CORPORATION',
    cityAccessCode: 'BBMP-KA-2026-HQ',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    commissionerName: 'Tushar Giri Nath (IAS)',
    nodalOfficerName: 'Er. B.S. Prahlad',
    wardCount: 198,
    activeWards: ['Ward 1 - East Zone', 'Ward 2 - West Zone', 'Ward 3 - South Zone', 'Ward 4 - Mahadevapura', 'Ward 5 - Bommanahalli'],
    totalRoadsKm: 13800,
    createdDate: '2026-02-01T00:00:00.000Z',
    departmentConnectionCodes: {
      pwd: 'PWD-BLR-8902',
      water: 'BWSSB-JOIN-3011',
      electricity: 'BESCOM-JOIN-7401',
      gas: 'GAIL-JOIN-4122',
      telecom: 'TEL-BLR-9801',
      traffic: 'BTP-JOIN-1209',
      contractor: 'CTR-BLR-5904',
    },
    isProductionActive: true,
  },
  {
    id: 'lucknow',
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    corporationName: 'Lucknow Nagar Nigam (LNN)',
    corporationType: 'NAGAR_NIGAM',
    cityAccessCode: 'LNN-UP-2026-HQ',
    coordinates: { lat: 26.8467, lng: 80.9462 },
    commissionerName: 'Inderjit Singh (IAS)',
    nodalOfficerName: 'Er. Mahesh Verma',
    wardCount: 110,
    activeWards: ['Ward 1 - Hazratganj', 'Ward 2 - Gomti Nagar', 'Ward 3 - Alambagh', 'Ward 4 - Chowk', 'Ward 5 - Indira Nagar'],
    totalRoadsKm: 3400,
    createdDate: '2026-02-10T00:00:00.000Z',
    departmentConnectionCodes: {
      pwd: 'PWD-LKO-8221',
      water: 'JAL-LKO-3199',
      electricity: 'MVVNL-JOIN-7332',
      gas: 'GAS-LKO-4551',
      telecom: 'TEL-LKO-9118',
      traffic: 'TRF-LKO-1330',
      contractor: 'CTR-LKO-5412',
    },
    isProductionActive: true,
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    district: 'Ahmedabad',
    corporationName: 'Amdavad Municipal Corporation (AMC)',
    corporationType: 'MUNICIPAL_CORPORATION',
    cityAccessCode: 'AMC-GJ-2026-HQ',
    coordinates: { lat: 23.0225, lng: 72.5714 },
    commissionerName: 'M. Thennarasan (IAS)',
    nodalOfficerName: 'Er. Hitesh Contractor',
    wardCount: 192,
    activeWards: ['Ward 1 - West Zone', 'Ward 2 - North West Zone', 'Ward 3 - South Zone', 'Ward 4 - Central Zone', 'Ward 5 - East Zone'],
    totalRoadsKm: 3800,
    createdDate: '2026-02-15T00:00:00.000Z',
    departmentConnectionCodes: {
      pwd: 'PWD-AMD-8334',
      water: 'WTR-AMD-3401',
      electricity: 'UGVCL-JOIN-7550',
      gas: 'GAS-AMD-4601',
      telecom: 'TEL-AMD-9221',
      traffic: 'TRF-AMD-1442',
      contractor: 'CTR-AMD-5610',
    },
    isProductionActive: true,
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    district: 'Jaipur',
    corporationName: 'Jaipur Municipal Corporation (Greater & Heritage)',
    corporationType: 'NAGAR_NIGAM',
    cityAccessCode: 'JMC-RJ-2026-HQ',
    coordinates: { lat: 26.9124, lng: 75.7873 },
    commissionerName: 'Mahendra Soni (IAS)',
    nodalOfficerName: 'Er. Anil Singhal',
    wardCount: 150,
    activeWards: ['Ward 1 - Heritage Walled City', 'Ward 2 - Mansarovar', 'Ward 3 - Vaishali Nagar', 'Ward 4 - Malviya Nagar', 'Ward 5 - Sanganer'],
    totalRoadsKm: 2900,
    createdDate: '2026-02-20T00:00:00.000Z',
    departmentConnectionCodes: {
      pwd: 'PWD-JAI-8445',
      water: 'PHED-JOIN-3512',
      electricity: 'JVVNL-JOIN-7661',
      gas: 'GAS-JAI-4712',
      telecom: 'TEL-JAI-9332',
      traffic: 'TRF-JAI-1553',
      contractor: 'CTR-JAI-5721',
    },
    isProductionActive: true,
  },
];

// Helper to build a completely clean dataset for any Indian city
export function buildCityDataset(city: CityPortalConfig): DatabaseState {
  return {
    users: INITIAL_USERS,
    roads: [],
    assets: [],
    projects: [],
    conflicts: [],
    clusters: [],
    coordinationCases: [],
    contractors: INITIAL_CONTRACTORS,
    workflows: [],
    permits: [],
    inspections: [
  {
    "id": "INSP-NSK-01",
    "projectId": "PROJ-NSK-2026-02",
    "projectName": "Dwarka to Datta Mandir 10-Lane Highway Widening & Utility Relocation",
    "permitId": "PERMIT-NSK-2026-02",
    "permitNumber": "ROP-NMC-2026-0892",
    "inspectionType": "IN_PROGRESS_SAFETY",
    "inspectorId": "usr-nsk-05",
    "inspectorName": "Er. Mahesh Patil",
    "inspectorDesignation": "Senior Quality & Safety Inspector",
    "result": "PASS",
    "remarks": "Trench shoring and barricades verified on NH-60 near Upanagar. Proctor density compaction test passed at 96.2%.",
    "aiFlags": [],
    "photos": [
      {
        "id": "PHT-01",
        "photoType": "DURING_WORK",
        "url": "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f2?w=800",
        "timestamp": "2026-08-22T14:30:00.000Z",
        "gps": {
          "lat": 19.976,
          "lng": 73.806
        },
        "uploadedBy": "Er. Mahesh Patil"
      }
    ],
    "inspectedAt": "2026-08-22T15:00:00.000Z"
  }
],
    restorations: [],
    history: [],
    complaints: [],
    notifications: [],
    auditLogs: [
      {
        id: `AUD-${city.id}-01`,
        timestamp: new Date().toISOString(),
        userId: 'USR-001',
        userName: city.commissionerName || 'Municipal Commissioner',
        role: 'COMMISSIONER',
        department: 'Smart City & Urban Planning',
        action: 'CITY_PORTAL_INITIALIZED',
        entity: 'CityPortal',
        entityId: city.id,
        ipAddress: '127.0.0.1',
        newValue: `${city.corporationName} workspace initialized for manual data entry.`,
      },
    ],
    settings: INITIAL_SETTINGS,
  };
}

class DatabaseManager {
  private state: DatabaseState;
  private cities: CityPortalConfig[];
  private activeCityId: string;
  private cityStateMap: Map<string, DatabaseState>;

  constructor() {
    this.cities = [...INITIAL_CITIES];
    this.activeCityId = 'nashik';
    this.cityStateMap = new Map();

    // Initialize initial base state
    this.state = {
      users: INITIAL_USERS,
      roads: INITIAL_ROADS,
      assets: INITIAL_ASSETS,
      projects: INITIAL_PROJECTS,
      conflicts: INITIAL_CONFLICTS,
      clusters: INITIAL_CLUSTERS,
      coordinationCases: INITIAL_COORDINATION_CASES,
      contractors: INITIAL_CONTRACTORS,
      workflows: INITIAL_WORKFLOWS,
      permits: INITIAL_PERMITS,
      inspections: [
  {
    "id": "INSP-NSK-01",
    "projectId": "PROJ-NSK-2026-02",
    "projectName": "Dwarka to Datta Mandir 10-Lane Highway Widening & Utility Relocation",
    "permitId": "PERMIT-NSK-2026-02",
    "permitNumber": "ROP-NMC-2026-0892",
    "inspectionType": "IN_PROGRESS_SAFETY",
    "inspectorId": "usr-nsk-05",
    "inspectorName": "Er. Mahesh Patil",
    "inspectorDesignation": "Senior Quality & Safety Inspector",
    "result": "PASS",
    "remarks": "Trench shoring and barricades verified on NH-60 near Upanagar. Proctor density compaction test passed at 96.2%.",
    "aiFlags": [],
    "photos": [
      {
        "id": "PHT-01",
        "photoType": "DURING_WORK",
        "url": "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f2?w=800",
        "timestamp": "2026-08-22T14:30:00.000Z",
        "gps": {
          "lat": 19.976,
          "lng": 73.806
        },
        "uploadedBy": "Er. Mahesh Patil"
      }
    ],
    "inspectedAt": "2026-08-22T15:00:00.000Z"
  }
],
      restorations: [],
      history: INITIAL_HISTORY,
      complaints: INITIAL_COMPLAINTS,
      notifications: INITIAL_NOTIFICATIONS,
      auditLogs: INITIAL_AUDIT_LOGS,
      settings: INITIAL_SETTINGS,
    };

    this.cityStateMap.set('nashik', this.state);

    // Pre-initialize other cities cleanly
    for (const city of this.cities) {
      if (city.id !== 'nashik') {
        this.cityStateMap.set(city.id, buildCityDataset(city));
      }
    }
  }

  // ==========================================
  // CITY PORTAL & MULTI-CITY LOGIC
  // ==========================================
  public getCities(): CityPortalConfig[] {
    return this.cities;
  }

  public getActiveCityId(): string {
    return this.activeCityId;
  }

  public getActiveCity(): CityPortalConfig {
    return this.cities.find((c) => c.id === this.activeCityId) || this.cities[0];
  }

  public switchCity(cityId: string): CityPortalConfig | undefined {
    const targetCity = this.cities.find((c) => c.id === cityId);
    if (!targetCity) return undefined;

    // Save current active state
    this.cityStateMap.set(this.activeCityId, this.state);

    // Load or generate target city state
    let targetState = this.cityStateMap.get(cityId);
    if (!targetState) {
      targetState = buildCityDataset(targetCity);
      this.cityStateMap.set(cityId, targetState);
    }

    this.activeCityId = cityId;
    this.state = targetState;

    this.logAudit({
      userId: 'USR-001',
      userName: targetCity.commissionerName || 'System Admin',
      role: 'COMMISSIONER',
      department: 'Smart City & Urban Planning',
      action: 'CITY_SWITCHED',
      entity: 'CityPortal',
      entityId: cityId,
      ipAddress: '127.0.0.1',
      newValue: `Active Municipal Workspace switched to ${targetCity.corporationName} (${targetCity.state})`,
    });

    return targetCity;
  }

  public createCityPortal(config: Partial<CityPortalConfig>): CityPortalConfig {
    const id = (config.name || `city-${Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 16);
    
    const stateCode = (config.state || 'IN').substring(0, 2).toUpperCase();
    const cityCodeAbbr = (config.name || 'CIT').substring(0, 3).toUpperCase();
    const cityAccessCode = `MUNI-${stateCode}-${cityCodeAbbr}-2026-HQ`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    const newCity: CityPortalConfig = {
      id,
      name: config.name || 'New Municipal City',
      state: config.state || 'Maharashtra',
      district: config.district || config.name || 'Central District',
      corporationName: config.corporationName || `${config.name || 'City'} Municipal Corporation`,
      corporationType: config.corporationType || 'MUNICIPAL_CORPORATION',
      cityAccessCode,
      coordinates: config.coordinates || { lat: 20.0, lng: 77.0 },
      commissionerName: config.commissionerName || 'Municipal Commissioner (IAS)',
      nodalOfficerName: config.nodalOfficerName || 'Chief Infrastructure Nodal Officer',
      wardCount: config.wardCount || 80,
      activeWards: config.activeWards || ['Ward 1 - Administrative Zone', 'Ward 2 - Commercial Corridor', 'Ward 3 - Residential West', 'Ward 4 - Industrial East'],
      totalRoadsKm: config.totalRoadsKm || 1200,
      createdDate: new Date().toISOString(),
      departmentConnectionCodes: {
        pwd: `PWD-${cityCodeAbbr}-${randomSuffix}`,
        water: `WTR-${cityCodeAbbr}-${randomSuffix + 1}`,
        electricity: `ELE-${cityCodeAbbr}-${randomSuffix + 2}`,
        gas: `GAS-${cityCodeAbbr}-${randomSuffix + 3}`,
        telecom: `TEL-${cityCodeAbbr}-${randomSuffix + 4}`,
        traffic: `TRF-${cityCodeAbbr}-${randomSuffix + 5}`,
        contractor: `CTR-${cityCodeAbbr}-${randomSuffix + 6}`,
      },
      isProductionActive: true,
    };

    this.cities.unshift(newCity);
    const cityDataset = buildCityDataset(newCity);
    this.cityStateMap.set(id, cityDataset);
    
    // Automatically switch to the newly created city
    this.switchCity(id);

    return newCity;
  }

  public connectWithCode(req: CityConnectionRequest): { success: boolean; city?: CityPortalConfig; user?: User; message: string } {
    const cleanCode = (req.cityAccessCode || '').trim().toUpperCase();

    // Check if matching city by cityAccessCode or any department connection code
    const matchingCity = this.cities.find((c) => {
      if (c.cityAccessCode.toUpperCase() === cleanCode) return true;
      const deptCodes = Object.values(c.departmentConnectionCodes).map((k) => k.toUpperCase());
      return deptCodes.includes(cleanCode);
    });

    if (!matchingCity) {
      return {
        success: false,
        message: 'Invalid City Access Code or Department Join Token. Please check and retry.',
      };
    }

    // Switch to this city
    this.switchCity(matchingCity.id);

    // Register or retrieve connected authority user
    const newUser: User = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: req.authorityName || 'Connected Municipal Authority',
      email: req.authorityEmail || 'authority@citycorp.gov.in',
      role: 'NODAL_OFFICER',
      designation: req.authorityDesignation || 'Connected Authority Engineer',
      department: req.department || 'Smart City & Urban Planning',
      jurisdiction: 'Citywide',
      permissions: ['project.view', 'project.create', 'coordination.view', 'road.view'],
    };

    this.state.users.push(newUser);

    this.logAudit({
      userId: newUser.id,
      userName: newUser.name,
      role: newUser.role,
      department: newUser.department,
      action: 'AUTHORITY_CONNECTED_WITH_CODE',
      entity: 'CityPortal',
      entityId: matchingCity.id,
      ipAddress: '127.0.0.1',
      newValue: `Authority ${newUser.name} connected to ${matchingCity.corporationName} using access code ${cleanCode}`,
    });

    return {
      success: true,
      city: matchingCity,
      user: newUser,
      message: `Successfully connected to ${matchingCity.corporationName}!`,
    };
  }

  public getState(): DatabaseState {
    return this.state;
  }

  // Users
  public getUsers(): User[] {
    return this.state.users;
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public addUser(user: User): User {
    if (!user.id) {
      user.id = `USR-${Date.now().toString().slice(-4)}`;
    }
    const existingIdx = this.state.users.findIndex((u) => u.id === user.id || (user.email && u.email === user.email));
    if (existingIdx >= 0) {
      this.state.users[existingIdx] = { ...this.state.users[existingIdx], ...user };
      return this.state.users[existingIdx];
    }
    this.state.users.push(user);
    return user;
  }

  public updateUser(user: User): User {
    const idx = this.state.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      this.state.users[idx] = { ...this.state.users[idx], ...user };
      return this.state.users[idx];
    }
    this.state.users.push(user);
    return user;
  }

  public deleteUser(id: string): boolean {
    const prevLen = this.state.users.length;
    this.state.users = this.state.users.filter((u) => u.id !== id);
    return this.state.users.length < prevLen;
  }

  // Roads
  public getRoads(): Road[] {
    return this.state.roads;
  }

  public getRoadById(id: string): Road | undefined {
    return this.state.roads.find((r) => r.id === id);
  }

  public updateRoad(road: Road): void {
    const idx = this.state.roads.findIndex((r) => r.id === road.id);
    if (idx >= 0) this.state.roads[idx] = road;
    else this.state.roads.push(road);
  }

  // Assets
  public getAssets(): InfrastructureAsset[] {
    return this.state.assets;
  }

  public addAsset(asset: InfrastructureAsset): void {
    this.state.assets.push(asset);
  }

  // Projects
  public getProjects(): Project[] {
    return this.state.projects;
  }

  public getProjectById(id: string): Project | undefined {
    return this.state.projects.find((p) => p.id === id);
  }

  public saveProject(project: Project): void {
    const idx = this.state.projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      this.state.projects[idx] = project;
    } else {
      this.state.projects.push(project);
    }
  }

  // Conflicts
  public getConflicts(): Conflict[] {
    return this.state.conflicts;
  }

  public saveConflicts(conflicts: Conflict[]): void {
    conflicts.forEach((c) => {
      const idx = this.state.conflicts.findIndex((existing) => existing.id === c.id);
      if (idx >= 0) this.state.conflicts[idx] = c;
      else this.state.conflicts.push(c);
    });
  }

  // Clusters
  public getClusters(): CoordinationCluster[] {
    return this.state.clusters;
  }

  public getClusterById(id: string): CoordinationCluster | undefined {
    return this.state.clusters.find((c) => c.id === id);
  }

  public saveCluster(cluster: CoordinationCluster): void {
    const idx = this.state.clusters.findIndex((c) => c.id === cluster.id);
    if (idx >= 0) this.state.clusters[idx] = cluster;
    else this.state.clusters.push(cluster);
  }

  // Workflows
  public getWorkflows(): ApprovalWorkflow[] {
    return this.state.workflows;
  }

  public getWorkflowByProjectId(projectId: string): ApprovalWorkflow | undefined {
    return this.state.workflows.find((w) => w.projectId === projectId);
  }

  public saveWorkflow(workflow: ApprovalWorkflow): void {
    const idx = this.state.workflows.findIndex((w) => w.id === workflow.id);
    if (idx >= 0) this.state.workflows[idx] = workflow;
    else this.state.workflows.push(workflow);
  }

  // Permits
  public getPermits(): RoadOpeningPermit[] {
    return this.state.permits;
  }

  public getPermitById(id: string): RoadOpeningPermit | undefined {
    return this.state.permits.find((p) => p.id === id);
  }

  public savePermit(permit: RoadOpeningPermit): void {
    const idx = this.state.permits.findIndex((p) => p.id === permit.id);
    if (idx >= 0) this.state.permits[idx] = permit;
    else this.state.permits.push(permit);
  }

  // Inspections
  public getInspections(): Inspection[] {
    return this.state.inspections;
  }

  public saveInspection(inspection: Inspection): void {
    const idx = this.state.inspections.findIndex((i) => i.id === inspection.id);
    if (idx >= 0) this.state.inspections[idx] = inspection;
    else this.state.inspections.push(inspection);
  }

  // Restorations
  public getRestorations(): RestorationRecord[] {
    return this.state.restorations;
  }

  public saveRestoration(rec: RestorationRecord): void {
    const idx = this.state.restorations.findIndex((r) => r.id === rec.id);
    if (idx >= 0) this.state.restorations[idx] = rec;
    else this.state.restorations.push(rec);
  }

  // Road Work History
  public getHistory(): RoadWorkHistoryItem[] {
    return this.state.history;
  }

  public addHistoryItem(item: RoadWorkHistoryItem): void {
    this.state.history.unshift(item);
  }

  // Complaints
  public getComplaints(): CitizenComplaint[] {
    return this.state.complaints;
  }

  public getComplaintById(id: string): CitizenComplaint | undefined {
    return this.state.complaints.find((c) => c.id === id || c.complaintNumber === id);
  }

  public saveComplaint(complaint: CitizenComplaint): void {
    const idx = this.state.complaints.findIndex((c) => c.id === complaint.id);
    if (idx >= 0) this.state.complaints[idx] = complaint;
    else this.state.complaints.unshift(complaint);
  }

  public addProgressLog(projectId: string, log: WorkProgressLog): void {
    const project = this.getProjectById(projectId);
    if (project) {
      if (!project.progressLogs) project.progressLogs = [];
      project.progressLogs.unshift(log);
      project.progressPercentage = log.progressPercentage;
      project.currentWorkPhase = log.currentWorkPhase;
      project.lastProgressUpdate = log.timestamp;
      this.saveProject(project);
    }
  }

  // Notifications
  public getNotifications(): SystemNotification[] {
    return this.state.notifications;
  }

  public addNotification(notification: SystemNotification): void {
    this.state.notifications.unshift(notification);
  }

  public markNotificationRead(id: string): void {
    const n = this.state.notifications.find((notif) => notif.id === id);
    if (n) n.isRead = true;
  }

  // Audit Logs
  public getAuditLogs(): AuditLogItem[] {
    return this.state.auditLogs;
  }

  public logAudit(log: Omit<AuditLogItem, 'id' | 'timestamp'>): void {
    const entry: AuditLogItem = {
      ...log,
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(entry);
  }

  // Settings
  public getSettings(): SystemSettingsConfig {
    return this.state.settings;
  }

  public updateSettings(settings: SystemSettingsConfig): void {
    this.state.settings = settings;
  }

  // ============================================================
  // COORDINATION CASES & UNIFIED WORKFLOW METHODS
  // ============================================================

  public getCoordinationCases(): CoordinationCase[] {
    return this.state.coordinationCases || INITIAL_COORDINATION_CASES;
  }

  public getCoordinationCaseById(id: string): CoordinationCase | undefined {
    return (this.state.coordinationCases || INITIAL_COORDINATION_CASES).find(
      (c) => c.id === id || c.caseNumber === id || c.primaryProjectId === id || c.relatedProjectIds.includes(id)
    );
  }

  public getContractors(): any[] {
    return this.state.contractors || INITIAL_CONTRACTORS;
  }

  public createCoordinationCase(data: Partial<CoordinationCase>): CoordinationCase {
    const newCase: CoordinationCase = {
      id: data.id || `cc-nsk-${Date.now()}`,
      caseNumber: data.caseNumber || `CC-NSK-2026-${String((this.state.coordinationCases || []).length + 1).padStart(3, '0')}`,
      corridorName: data.corridorName || 'Multi-Agency Corridor',
      roadId: data.roadId || 'RD-NSK-01',
      roadName: data.roadName || 'City Corridor',
      status: data.status || 'DETECTED',
      primaryProjectId: data.primaryProjectId || '',
      primaryProjectName: data.primaryProjectName || '',
      relatedProjectIds: data.relatedProjectIds || [],
      participatingDepartments: data.participatingDepartments || [],
      recommendedStrategy: data.recommendedStrategy || 'COORDINATED',
      selectedStrategy: data.selectedStrategy || 'COORDINATED',
      strategyDecisionReason: data.strategyDecisionReason || '',
      executionWindow: data.executionWindow || {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
        durationDays: 60,
      },
      executionSequence: data.executionSequence || [],
      candidatePlans: data.candidatePlans || [],
      selectedPlanId: data.selectedPlanId || 'PLAN_A',
      aiConfidence: data.aiConfidence || 90,
      projectedCostSavedINR: data.projectedCostSavedINR || 0,
      projectedExcavationsAvoided: data.projectedExcavationsAvoided || 0,
      verifiedCostSavedINR: 0,
      verifiedExcavationsAvoided: 0,
      trafficDisruptionReductionPct: data.trafficDisruptionReductionPct || 50,
      dataLimitations: data.dataLimitations || [],
      stages: data.stages || generateDefaultExecutionStages(data.roadName),
      contractorAllocations: data.contractorAllocations || [],
      qcInspections: data.qcInspections || [],
      auditTimeline: [
        {
          id: `AUD-CC-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorId: 'SYSTEM',
          actorName: 'Coordination Engine',
          actorRole: 'SYSTEM_INTELLIGENCE',
          actorDepartment: 'Smart City & Urban Planning',
          stage: 'SYSTEM_ANALYSIS',
          action: 'CASE_INITIALIZED',
          details: `Coordination case ${data.caseNumber} created with ${data.relatedProjectIds?.length || 1} related projects.`,
          badgeColor: 'blue',
        },
      ],
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy || 'SYSTEM',
      updatedAt: new Date().toISOString(),
    };

    if (!this.state.coordinationCases) {
      this.state.coordinationCases = [];
    }
    this.state.coordinationCases.unshift(newCase);
    return newCase;
  }

  public recordStrategyDecision(
    caseId: string,
    strategy: ExecutionStrategy,
    planId: 'PLAN_A' | 'PLAN_B' | 'PLAN_C',
    user: User,
    reason?: string
  ): CoordinationCase | undefined {
    const c = this.getCoordinationCaseById(caseId);
    if (!c) return undefined;

    c.selectedStrategy = strategy;
    c.selectedPlanId = planId;
    c.strategyDecisionReason = reason || `Strategy ${strategy} confirmed by ${user.name} (${user.designation}).`;
    c.status = 'UNDER_TECHNICAL_REVIEW';
    c.technicalDecision = {
      decision: strategy === 'COORDINATED' ? 'PROCEED_COORDINATED' : strategy === 'STANDALONE' ? 'PROCEED_STANDALONE' : 'HOLD_REANALYZE',
      reviewerId: user.id,
      reviewerName: user.name,
      reviewerRole: user.role,
      reviewerDepartment: user.department as DepartmentName,
      timestamp: new Date().toISOString(),
      notes: reason || 'Technical review completed.',
    };

    c.auditTimeline.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      actorDepartment: user.department,
      stage: 'TECHNICAL_REVIEW',
      action: 'STRATEGY_DECISION_RECORDED',
      details: `Selected strategy: ${strategy} (${planId}). Reason: ${reason || 'Aligned with corridor schedule'}`,
      badgeColor: 'amber',
    });

    for (const projId of [c.primaryProjectId, ...c.relatedProjectIds]) {
      const proj = this.getProjectById(projId);
      if (proj) {
        proj.executionStrategy = strategy;
        proj.coordinationCaseId = c.id;
        proj.coordinationCaseNumber = c.caseNumber;
        proj.status = 'UNDER_TECHNICAL_REVIEW';
      }
    }

    c.updatedAt = new Date().toISOString();
    return c;
  }

  public recordDepartmentConcurrence(
    caseId: string,
    departmentName: string,
    status: 'CONCURRED' | 'CONCERNS_RAISED' | 'REJECTED',
    notes: string,
    user: User
  ): CoordinationCase | undefined {
    const c = this.getCoordinationCaseById(caseId);
    if (!c) return undefined;

    const deptRecord = c.participatingDepartments.find(
      (d) => d.departmentName.toLowerCase() === departmentName.toLowerCase() || d.departmentId === departmentName
    );

    if (deptRecord) {
      deptRecord.concurrenceStatus = status;
      deptRecord.officerName = user.name;
      deptRecord.officerDesignation = user.designation;
      deptRecord.officerUserId = user.id;
      deptRecord.concurrenceNotes = notes;
      deptRecord.timestamp = new Date().toISOString();
    } else {
      c.participatingDepartments.push({
        departmentId: `DEPT-${Date.now()}`,
        departmentName: departmentName as DepartmentName,
        isOwner: false,
        concurrenceStatus: status,
        officerName: user.name,
        officerDesignation: user.designation,
        officerUserId: user.id,
        concurrenceNotes: notes,
        timestamp: new Date().toISOString(),
      });
    }

    c.auditTimeline.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      actorDepartment: user.department,
      stage: 'TECHNICAL_REVIEW',
      action: 'DEPARTMENTAL_CONCURRENCE_LOGGED',
      details: `${departmentName} concurrence status: ${status}. Note: ${notes}`,
      badgeColor: status === 'CONCURRED' ? 'green' : status === 'REJECTED' ? 'red' : 'amber',
    });

    c.updatedAt = new Date().toISOString();
    return c;
  }

  public proposeLeadership(caseId: string, user: User, notes?: string): CoordinationCase | undefined {
    const c = this.getCoordinationCaseById(caseId);
    if (!c) return undefined;

    c.status = 'LEADERSHIP_REVIEW';
    if (c.technicalDecision) {
      c.technicalDecision.notes = notes || c.technicalDecision.notes;
    }

    c.auditTimeline.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      actorDepartment: user.department,
      stage: 'TECHNICAL_PROPOSAL',
      action: 'PROPOSED_TO_LEADERSHIP',
      details: `Formal statutory decision dossier submitted to Municipal Commissioner / Higher Authority by ${user.name}.`,
      badgeColor: 'purple',
    });

    for (const projId of [c.primaryProjectId, ...c.relatedProjectIds]) {
      const proj = this.getProjectById(projId);
      if (proj) {
        proj.status = 'AWAITING_HIGHER_AUTHORITY';
      }
    }

    this.addNotification({
      id: `NOTIF-${Date.now()}`,
      title: `Leadership Review Required: ${c.caseNumber}`,
      message: `Multi-agency coordination package on ${c.roadName} submitted by ${user.name} (${user.department}) ready for statutory sanction.`,
      type: 'APPROVAL',
      link: '/approvals',
      isRead: false,
      timestamp: new Date().toISOString(),
      targetRole: 'COMMISSIONER',
    });

    c.updatedAt = new Date().toISOString();
    return c;
  }

  public recordLeadershipDecision(
    caseId: string,
    decision: 'APPROVED' | 'REJECTED' | 'RETURNED_FOR_REVISION',
    remarks: string,
    user: User,
    signatureStamp?: string
  ): CoordinationCase | undefined {
    const c = this.getCoordinationCaseById(caseId);
    if (!c) return undefined;

    const newStatus = decision === 'APPROVED' ? 'APPROVED' : decision === 'REJECTED' ? 'REJECTED' : 'UNDER_TECHNICAL_REVIEW';
    c.status = newStatus;

    c.leadershipDecision = {
      decision,
      approverId: user.id,
      approverName: user.name,
      approverRole: user.role,
      designation: user.designation,
      timestamp: new Date().toISOString(),
      remarks: remarks || 'Statutory approval granted.',
      digitalSignatureStamp: signatureStamp || `DIG-SIG-${user.id}-${Date.now()}`,
    };

    c.auditTimeline.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      actorDepartment: user.department,
      stage: 'LEADERSHIP_REVIEW',
      action: `LEADERSHIP_${decision}`,
      details: `Statutory leadership order recorded by ${user.name} (${user.designation}). Remarks: ${remarks}`,
      badgeColor: decision === 'APPROVED' ? 'emerald' : decision === 'REJECTED' ? 'rose' : 'amber',
    });

    for (const projId of [c.primaryProjectId, ...c.relatedProjectIds]) {
      const proj = this.getProjectById(projId);
      if (proj) {
        if (decision === 'APPROVED') {
          proj.status = 'APPROVED';
        } else if (decision === 'REJECTED') {
          proj.status = 'REJECTED';
        } else {
          proj.status = 'MODIFICATION_REQUESTED';
        }
      }
    }

    if (decision === 'APPROVED') {
      this.addNotification({
        id: `NOTIF-${Date.now()}`,
        title: `Coordination Case Approved: ${c.caseNumber}`,
        message: `Sanction granted by ${user.name}. Contractor allocation and permit issuance now active.`,
        type: 'PERMIT',
        link: '/contractor',
        isRead: false,
        timestamp: new Date().toISOString(),
        targetRole: 'EXECUTIVE_ENGINEER',
      });
    }

    c.updatedAt = new Date().toISOString();
    return c;
  }

  public allocateContractor(
    caseOrProjId: string,
    allocation: ContractorAllocationRecord,
    user: User
  ): { success: boolean; entity: any } {
    const c = this.getCoordinationCaseById(caseOrProjId);
    const proj = this.getProjectById(caseOrProjId);

    if (c) {
      if (!c.contractorAllocations) c.contractorAllocations = [];
      c.contractorAllocations.push(allocation);
      c.status = 'CONTRACTOR_ALLOCATED';

      c.auditTimeline.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        actorDepartment: user.department,
        stage: 'CONTRACTOR_ALLOCATION',
        action: 'CONTRACTOR_ASSIGNED',
        details: `Assigned EPC Contractor ${allocation.contractorName} (${allocation.contractorId}) for scope: ${allocation.workScope}`,
        badgeColor: 'blue',
      });

      for (const pId of [c.primaryProjectId, ...c.relatedProjectIds]) {
        const p = this.getProjectById(pId);
        if (p) {
          p.contractorId = allocation.contractorId;
          p.contractorName = allocation.contractorName;
          p.status = 'PERMIT_READY';
        }
      }

      c.updatedAt = new Date().toISOString();
      return { success: true, entity: c };
    }

    if (proj) {
      proj.contractorId = allocation.contractorId;
      proj.contractorName = allocation.contractorName;
      proj.status = 'PERMIT_READY';
      proj.contractorAllocation = allocation;
      return { success: true, entity: proj };
    }

    return { success: false, entity: null };
  }

  public updateExecutionStage(
    caseOrProjId: string,
    stageId: string,
    status: 'IN_PROGRESS' | 'COMPLETED_PENDING_QC',
    notes: string,
    photos: string[],
    user: User
  ): { success: boolean; stage: any } {
    const c = this.getCoordinationCaseById(caseOrProjId);
    const targetStages = c ? c.stages : this.getProjectById(caseOrProjId)?.executionStages;

    if (!targetStages) {
      return { success: false, stage: null };
    }

    const st = targetStages.find((s) => s.stageId === stageId);
    if (!st) return { success: false, stage: null };

    st.status = status;
    st.workDoneNotes = notes || st.workDoneNotes;
    if (photos && photos.length > 0) {
      st.evidencePhotos = photos;
    }

    if (status === 'IN_PROGRESS' && !st.startedAt) {
      st.startedAt = new Date().toISOString();
      if (c) c.status = 'IN_EXECUTION';
    }

    if (status === 'COMPLETED_PENDING_QC') {
      st.completedAt = new Date().toISOString();
      st.completedBy = user.name;

      if (c) {
        c.auditTimeline.unshift({
          id: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorId: user.id,
          actorName: user.name,
          actorRole: user.role,
          actorDepartment: user.department,
          stage: 'STAGE_EXECUTION',
          action: 'STAGE_COMPLETED_PENDING_QC',
          details: `Stage ${st.sequence}: ${st.name} submitted by contractor. QC verification requested.`,
          badgeColor: 'amber',
        });
      }

      this.addNotification({
        id: `NOTIF-${Date.now()}`,
        title: `QC Required: Stage ${st.sequence} (${st.name})`,
        message: `Field inspection required on ${c?.roadName || 'Corridor'} for Stage ${st.sequence}.`,
        type: 'INSPECTION',
        link: '/inspections',
        isRead: false,
        timestamp: new Date().toISOString(),
        targetRole: 'INSPECTOR',
      });
    }

    if (c) c.updatedAt = new Date().toISOString();
    return { success: true, stage: st };
  }

  public assignStageQC(
    caseOrProjId: string,
    stageId: string,
    inspectorId: string,
    inspectorName: string,
    user: User
  ): { success: boolean; stage: any } {
    const c = this.getCoordinationCaseById(caseOrProjId);
    const targetStages = c ? c.stages : this.getProjectById(caseOrProjId)?.executionStages;
    if (!targetStages) return { success: false, stage: null };

    const st = targetStages.find((s) => s.stageId === stageId);
    if (!st) return { success: false, stage: null };

    st.status = 'QC_IN_PROGRESS';
    st.qcInspectorId = inspectorId;
    st.qcInspectorName = inspectorName;
    st.qcAssignedAt = new Date().toISOString();

    if (c) {
      c.auditTimeline.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        actorDepartment: user.department,
        stage: 'QC_INSPECTION',
        action: 'QC_INSPECTOR_ASSIGNED',
        details: `Assigned Quality Inspector ${inspectorName} (${inspectorId}) for Stage ${st.sequence} verification.`,
        badgeColor: 'blue',
      });
      c.updatedAt = new Date().toISOString();
    }

    return { success: true, stage: st };
  }

  public recordStageQCDecision(
    caseOrProjId: string,
    stageId: string,
    result: 'PASS' | 'FAIL',
    remarks: string,
    checklist: any[],
    user: User
  ): { success: boolean; stage: any; nextStageUnlocked: boolean; allCompleted: boolean } {
    const c = this.getCoordinationCaseById(caseOrProjId);
    const targetStages = c ? c.stages : this.getProjectById(caseOrProjId)?.executionStages;
    if (!targetStages) return { success: false, stage: null, nextStageUnlocked: false, allCompleted: false };

    const stIndex = targetStages.findIndex((s) => s.stageId === stageId);
    if (stIndex === -1) return { success: false, stage: null, nextStageUnlocked: false, allCompleted: false };

    const st = targetStages[stIndex];
    st.qcResult = result;
    st.qcRemarks = remarks;
    st.qcCompletedAt = new Date().toISOString();
    st.qcInspectorName = user.name;
    st.qcChecklist = checklist || [];

    let nextStageUnlocked = false;
    let allCompleted = false;

    if (result === 'PASS') {
      st.status = 'QC_PASSED';

      if (stIndex + 1 < targetStages.length) {
        targetStages[stIndex + 1].status = 'NOT_STARTED';
        nextStageUnlocked = true;
      } else {
        allCompleted = true;
        if (c) c.status = 'ALL_STAGES_COMPLETED';
      }

      if (c) {
        c.auditTimeline.unshift({
          id: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorId: user.id,
          actorName: user.name,
          actorRole: user.role,
          actorDepartment: user.department,
          stage: 'QC_INSPECTION',
          action: 'STAGE_QC_PASSED',
          details: `Stage ${st.sequence} (${st.name}) PASSED QC by ${user.name}. ${nextStageUnlocked ? 'Next stage unlocked.' : 'All execution stages completed!'}`,
          badgeColor: 'emerald',
        });
      }
    } else {
      st.status = 'REWORK_REQUIRED';

      if (c) {
        c.auditTimeline.unshift({
          id: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorId: user.id,
          actorName: user.name,
          actorRole: user.role,
          actorDepartment: user.department,
          stage: 'QC_INSPECTION',
          action: 'STAGE_QC_FAILED_REWORK_REQUIRED',
          details: `Stage ${st.sequence} FAILED QC: ${remarks}. Contractor correction required.`,
          badgeColor: 'rose',
        });
      }

      this.addNotification({
        id: `NOTIF-${Date.now()}`,
        title: `REWORK REQUIRED: Stage ${st.sequence}`,
        message: `QC Failure on ${c?.roadName || 'Corridor'}. Defects: ${remarks}`,
        type: 'INSPECTION',
        link: '/contractor',
        isRead: false,
        timestamp: new Date().toISOString(),
        targetRole: 'CONTRACTOR',
      });
    }

    if (c) c.updatedAt = new Date().toISOString();
    return { success: true, stage: st, nextStageUnlocked, allCompleted };
  }

  public finalizeProjectAndRoadHistory(caseOrProjId: string, user: User): { success: boolean; historyItem: any } {
    const c = this.getCoordinationCaseById(caseOrProjId);
    const proj = this.getProjectById(caseOrProjId);

    const roadId = c?.roadId || proj?.roadId || 'RD-NSK-02';
    const roadName = c?.roadName || proj?.roadName || 'Corridor';

    const historyItem: RoadWorkHistoryItem = {
      id: `HIST-${Date.now()}`,
      roadId,
      roadName,
      date: new Date().toISOString(),
      projectId: c?.primaryProjectId || proj?.id || 'PROJ-01',
      projectName: c?.corridorName || proj?.name || 'Infrastructure Work',
      department: (c ? 'Smart City & Urban Planning' : proj?.department) as DepartmentName,
      infrastructureType: c ? 'Multi-Utility Joint Trench' : (proj?.projectType || 'Utility Trench'),
      excavationDurationDays: c ? c.executionWindow.durationDays : (proj?.expectedExcavationDurationDays || 30),
      completionDate: new Date().toISOString(),
      restorationDate: new Date().toISOString(),
      inspectionResult: 'FINAL_QC_PASSED_100%_COMPLIANT',
      contractor: c?.contractorAllocations?.[0]?.contractorName || proj?.contractorName || 'M/s InfraTech',
      documentsCount: 4,
    };

    if (!this.state.history) this.state.history = [];
    this.state.history.unshift(historyItem);

    if (c) {
      c.status = 'CLOSED';
      c.verifiedCostSavedINR = c.projectedCostSavedINR;
      c.verifiedExcavationsAvoided = c.projectedExcavationsAvoided;
      c.auditTimeline.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        actorDepartment: user.department,
        stage: 'PROJECT_CLOSURE',
        action: 'PROJECT_CLOSED_AND_ROAD_HISTORY_COMMITTED',
        details: `All stages verified. Final restoration QC passed. Digital Road Twin history updated with ₹${(c.verifiedCostSavedINR / 100000).toFixed(1)} Lakhs verified savings.`,
        badgeColor: 'emerald',
      });
      c.updatedAt = new Date().toISOString();
    }

    if (proj) {
      proj.status = 'COMPLETED';
    }

    return { success: true, historyItem };
  }

}

export const db = new DatabaseManager();
