/**
 * MR. MAYOR - Infrastructure Analysis Center Generator & RBAC Authorization Engine
 * Implements Sections 46 - 68 of the Municipal Governance Specification.
 * 
 * Answers the 9 Core Governance Questions:
 *  1. PROJECT
 *  2. WHAT IS THE PROBLEM?
 *  3. WHAT DID MR. MAYOR ANALYZE?
 *  4. WHAT CONFLICTS WERE FOUND?
 *  5. WHAT DOES THE AI PROPOSE?
 *  6. WHY THIS SOLUTION?
 *  7. WHAT WILL IT SAVE?
 *  8. WHAT ARE THE RISKS & MITIGATIONS?
 *  9. WHAT SHOULD EACH DEPARTMENT DO?
 *  10. OFFICIAL ANALYSIS REPORT WITH AUDIT TRAIL
 */

import {
  Project,
  Road,
  InfrastructureAsset,
  User,
  InfrastructureAnalysisReport,
  DepartmentActionItem,
  QualityInspectorOperationalView,
  PublicProjectStatusSummary,
  DepartmentName,
} from '../src/types/index.js';

import { runAICoordinationEngine } from './coordinationEngine.js';
import { resolveRoadAuthority } from './nashikIntelligenceData.js';

export function generateOfficialInfrastructureAnalysis(
  project: Project,
  allProjects: Project[],
  roads: Road[],
  assets: InfrastructureAsset[],
  user?: User
): InfrastructureAnalysisReport {
  const coordResult = runAICoordinationEngine(project, allProjects, roads, assets, 100);
  const road = roads.find((r) => r.id === project.roadId) || {
    id: project.roadId || 'ROAD-NSK-01',
    name: project.roadName,
    trafficClass: 'High',
  } as Road;

  const clusterProjects = [
    project,
    ...allProjects.filter((p) =>
      coordResult.relatedProjects.some((rp) => rp.id === p.id)
    ),
  ];

  const uniqueDepts = Array.from(new Set(clusterProjects.map((p) => p.department)));
  const analysisId = `ANA-2026-${project.code ? project.code.replace(/[^a-zA-Z0-9]/g, '') : project.id.slice(-4)}`;

  // 1. WHAT IS THE PROBLEM?
  const isMultipleProjects = clusterProjects.length > 1;
  const problemStatement = {
    headline: isMultipleProjects
      ? `High-Risk Uncoordinated Road Openings on ${project.roadName}`
      : `Independent Utility Excavation Assessment on ${project.roadName}`,
    riskSummary: isMultipleProjects
      ? `${clusterProjects.length} agencies (${uniqueDepts.join(', ')}) have submitted separate road cutting requests along ${project.roadName} within overlapping timeframes. Without central coordination, this road will be repeatedly dug up, destroying pavement integrity, creating severe traffic gridlocks, and risking catastrophic subsurface utility ruptures.`
      : `Standalone excavation planned on ${project.roadName}. Requires strict traffic marshal deployment, depth verification, and compaction testing under NMC standard specifications.`,
    duplicateDigsRisk: isMultipleProjects
      ? `${clusterProjects.length} separate road cuttings and ${clusterProjects.length} separate asphalt patches will cause cumulative sub-base structural failure.`
      : 'Single excavation with required 3-year pavement protection moratorium upon completion.',
    monsoonSafetyRisk: coordResult.nashikIntelligence.isMonsoonRestrictionActive
      ? 'CRITICAL MONSOON RISK: Excavation dates overlap the NMC Monsoon Embargo (15 June – 15 Sept). Open trenches risk severe waterlogging, soil collapse, and public road hazards.'
      : undefined,
    trafficGridlockRisk: `CTTP 2016 historical V/C ratio of ${coordResult.nashikIntelligence.historicalVC} indicates high corridor pressure. Uncoordinated lane closures will cause up to 45-minute traffic delays.`,
    pavementDestructionCost: `Estimated duplicate restoration wastage of ₹${(coordResult.impactSummary.estimatedCostSavedINR / 100000).toFixed(1)} Lakhs if executed independently.`,
  };

  // 2. WHAT DID MR. MAYOR ANALYZE?
  const whatWasAnalyzed = {
    corridorName: project.roadName,
    totalLengthMeters: project.lengthMeters || 3800,
    historicalVC: coordResult.nashikIntelligence.historicalVC,
    vcCategory: coordResult.nashikIntelligence.vcCategory,
    junctionSensitivities: coordResult.nashikIntelligence.sensitiveJunctions.map(
      (j) => `${j.name} (Peak: ${j.peakWindow}${j.peakHourPCU ? ', ' + j.peakHourPCU + ' PCU' : ''})`
    ),
    recentRestorationStatus: `${coordResult.nashikIntelligence.reworkRiskLevel} Rework Risk (${coordResult.nashikIntelligence.daysSinceLastRestored || 120} days since last resurfacing, ₹135 Cr NMC Mandate)`,
    simhasthaKumbhMandate: coordResult.nashikIntelligence.isSimhasthaPriorityRoad
      ? `Simhastha 2027 Phase ${coordResult.nashikIntelligence.simhasthaPhase || 1} Priority Corridor: Utility undergrounding mandatory before 6-lane road laying.`
      : undefined,
    monsoonPolicyStatus: coordResult.nashikIntelligence.isMonsoonRestrictionActive
      ? 'Section 197 MMC Act Monsoon Embargo Active (Emergency Joint Trench Review Required)'
      : 'Standard Fair-Weather Excavation Window Permitted',
  };

  // 3. WHAT CONFLICTS WERE FOUND?
  const conflictsFound = coordResult.relatedProjects.map((rp, idx) => ({
    clashId: `CLASH-${idx + 1}`,
    pair: `${project.department} & ${rp.department}`,
    severity: coordResult.overallScore >= 75 ? 'CRITICAL' : 'HIGH',
    spatialOverlap: rp.spatialRelationship,
    temporalOverlap: rp.temporalRelationship,
    hazardSummary: `Simultaneous trenching along ${project.roadName}. Deep ${project.department} excavation (${project.excavationDepthMeters || 1.8}m) clashes with ${rp.department} ducting (${rp.depthMeters}m).`,
  }));

  // 4. WHAT DOES THE AI PROPOSE?
  const selectedPlan = coordResult.candidatePlans[0];
  const aiProposedSolution = {
    selectedPlanId: selectedPlan.planId,
    planName: selectedPlan.planName,
    summary: selectedPlan.strategySummary,
    windowDates: `${selectedPlan.startDate} to ${selectedPlan.endDate}`,
    durationDays: selectedPlan.totalDurationDays,
    depthSequence: selectedPlan.sequenceSteps,
    singleRestorationType: `Unified 50mm Bituminous Concrete (BC) resurfacing + Mastic Asphalt Joint Seal on ${project.roadName}`,
  };

  // 5. WHY THIS SOLUTION?
  const whyThisSolution = {
    engineeringJustification: `Consolidating all ${clusterProjects.length} departmental projects into ONE 24-day window reduces total road closure time by 65%. Applying strict depth-wise sequencing (deepest to shallowest) guarantees no utility cuts into previously installed infrastructure.`,
    geotechnicalSafety: 'Enforces mandatory 95%+ Proctor Density laser compaction test before final bituminous layer to prevent pothole formation and road sinking.',
    scoreExplanation: `Composite Coordination Score: ${coordResult.overallScore}/100. Factors: Spatial (${coordResult.scoreBreakdown.spatialRelationship}/20), Temporal (${coordResult.scoreBreakdown.temporalRelationship}/15), Compatibility (${coordResult.scoreBreakdown.workCompatibility}/15), Traffic Impact (${coordResult.scoreBreakdown.trafficImpact}/15), Road History (${coordResult.scoreBreakdown.roadHistory}/10), Simhastha/Season (${coordResult.scoreBreakdown.seasonEventConstraints}/10).`,
  };

  // 6. WHAT WILL IT SAVE?
  const whatWillItSave = {
    excavationsEliminated: coordResult.impactSummary.excavationsAvoided,
    restorationsEliminated: coordResult.impactSummary.restorationsAvoided,
    trafficDisruptionReductionPct: coordResult.impactSummary.trafficDisruptionReductionPct,
    costSavingsINR: coordResult.impactSummary.estimatedCostSavedINR,
    costSavingsLakhs: (coordResult.impactSummary.estimatedCostSavedINR / 100000).toFixed(1),
  };

  // 7. WHAT SHOULD EACH DEPARTMENT DO?
  const departmentActionChecklist: DepartmentActionItem[] = clusterProjects.map((p, idx) => {
    let depthOrder = 5;
    let preReqs: string[] = ['Traffic Police NOC & Off-peak LED arrow signage'];
    let safetyMandates: string[] = ['Hard barricades with reflective retro-tapes', 'Gas / utility sensor checks'];
    let qcTests: string[] = ['Laser grade alignment', '95%+ Proctor Density compaction'];

    if (p.department === 'Drainage Department') {
      depthOrder = 1;
      preReqs.push('Dewatering pump setup and trench shoring verification');
      safetyMandates.push('Continuous toxic gas monitoring (H2S / CH4)');
      qcTests.push('Hydrostatic leak test & slope gradient laser survey');
    } else if (p.department === 'Water & Sewerage') {
      depthOrder = 2;
      preReqs.push('Trunk pipeline pressure isolation certificate');
      safetyMandates.push('Safety shoring along adjacent gas mains');
      qcTests.push('10 bar hydrostatic pressure test');
    } else if (p.department === 'City Gas Distribution') {
      depthOrder = 3;
      preReqs.push('Warning tape mesh & nitrogen purge certification');
      safetyMandates.push('Explosion-proof tools & emergency shutoff valves on site');
      qcTests.push('Electrofusion joint inspection & pneumatic test');
    } else if (p.department === 'Electricity (DISCOM)') {
      depthOrder = 4;
      preReqs.push('Feeder line outage approval & cable route locator');
      safetyMandates.push('High-voltage insulation mats & earthing pit inspection');
      qcTests.push('High-potential insulation resistance test');
    } else if (p.department === 'Telecom & Digital') {
      depthOrder = 5;
      preReqs.push('Micro-trenching duct route alignment with PWD');
      safetyMandates.push('No open pit overnight; continuous backfill');
      qcTests.push('OTDR fiber attenuation test & duct ball test');
    } else {
      depthOrder = 6;
      preReqs.push('All utility sign-offs and compaction certificates');
      safetyMandates.push('Night-time paving marshals and hot bitumen safety');
      qcTests.push('Core cutter thickness test & surface roughness index (IRI)');
    }

    return {
      department: p.department as DepartmentName,
      projectCode: p.code,
      projectName: p.name,
      depthHierarchyOrder: depthOrder,
      depthMeters: p.excavationDepthMeters || (depthOrder === 1 ? 2.8 : depthOrder === 2 ? 1.8 : 1.0),
      trenchDimensions: `${p.lengthMeters || 1200}m (L) × ${p.excavationWidthMeters || 1.2}m (W) × ${p.excavationDepthMeters || 1.5}m (D)`,
      mobilizationDate: selectedPlan.startDate,
      completionDate: selectedPlan.endDate,
      preRequisites: preReqs,
      safetyMandates: safetyMandates,
      postInstallationQC: qcTests,
    };
  });

  // Sort department action checklist by geotechnical depth hierarchy
  departmentActionChecklist.sort((a, b) => a.depthHierarchyOrder - b.depthHierarchyOrder);

  // 8. STATUTORY APPROVAL RECOMMENDATION (RESOLVED FROM ROAD OWNERSHIP)
  const roadAuthority = resolveRoadAuthority(road.name, road.ownerAgency);
  const approvalRecommendation = {
    statutoryApprovalRecommended: true,
    recommendedDesignation: roadAuthority.approverDesignation,
    statutoryActReference: roadAuthority.statutoryAct,
    conditions: [
      'All utility contractors must sign the Joint Trenching Charter prior to site mobilization.',
      'Work must be restricted to nocturnal hours (22:00 to 06:00) at sensitive junction nodes.',
      `Mandatory joint pre-backfill inspection by ${roadAuthority.agency} Executive Engineers.`,
      'Zero open earth trenches permitted during monsoon rain warnings.',
    ],
  };

  return {
    analysisId,
    version: '1.2',
    sensitivity: 'RESTRICTED',
    generatedAt: new Date().toISOString(),
    generatedBy: user?.name || 'Municipal AI Coordination Engine',
    generatedByRole: user?.designation || user?.role || 'Top Authority',
    projectId: project.id,
    project,
    problemStatement,
    whatWasAnalyzed,
    conflictsFound,
    aiProposedSolution,
    whyThisSolution,
    whatWillItSave,
    risksAndMitigations: coordResult.risksAndMitigations,
    departmentActionChecklist,
    approvalRecommendation,
    auditMetadata: {
      sourceCity: 'Nashik Municipal Corporation (NMC)',
      dataProvenance: 'CTTP 2016 Base Year V/C Baselines + NMC 2026-27 Restoration Master Plan',
      auditHash: `NMC-HASH-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 10000)}`,
    },
  };
}

// ==========================================
// ROLE-BASED ACCESS CONTROL & DATA FILTERING
// ==========================================

export function authorizeAndFilterAnalysis(
  fullReport: InfrastructureAnalysisReport,
  user: User | undefined,
  projectId: string
): {
  authorized: boolean;
  accessLevel: 'FULL' | 'DEPARTMENT_SCOPED' | 'INSPECTOR_OPERATIONAL' | 'FIELD_STAFF' | 'PUBLIC' | 'DENIED';
  sanitizedPayload: any;
  error?: string;
} {
  // If not logged in or CITIZEN role: return PUBLIC view
  if (!user || user.role === 'CITIZEN') {
    const publicSummary: PublicProjectStatusSummary = {
      projectId: fullReport.projectId,
      projectCode: fullReport.project.code,
      roadName: fullReport.project.roadName,
      publicStatus: fullReport.project.status === 'IN_PROGRESS' ? 'UNDER_CONSTRUCTION' : 'PLANNED',
      expectedTimeline: `${fullReport.aiProposedSolution.windowDates} (${fullReport.aiProposedSolution.durationDays} Days)`,
      trafficAdvisory: `Partial traffic diversion on ${fullReport.project.roadName}. Motorists are advised to use alternate bypass routes.`,
      departmentInvolved: fullReport.project.department,
    };
    return {
      authorized: true,
      accessLevel: 'PUBLIC',
      sanitizedPayload: publicSummary,
    };
  }

  const role = user.role;
  const userDept = user.department;

  // 1. TOP AUTHORITIES & TECHNICAL ENGINEERING DECISION MAKERS (Level 1, 2, 3)
  // Commissioner, Nodal Officer, Dept Heads, Executive Engineers, Assistant/Junior Engineers
  if (
    role === 'COMMISSIONER' ||
    role === 'ADMIN' ||
    role === 'NODAL_OFFICER' ||
    role === 'DEPT_HEAD' ||
    role === 'EXECUTIVE_ENGINEER' ||
    role === 'ASSISTANT_ENGINEER' ||
    role === 'JUNIOR_ENGINEER'
  ) {
    return {
      authorized: true,
      accessLevel: 'FULL',
      sanitizedPayload: fullReport,
    };
  }

  // 4. QUALITY INSPECTOR (Level 4: Field Inspection & Compaction Verification)
  if (role === 'INSPECTOR') {
    const inspectorPayload: QualityInspectorOperationalView = {
      projectId: fullReport.projectId,
      projectCode: fullReport.project.code,
      roadName: fullReport.project.roadName,
      approvedWorkWindow: fullReport.aiProposedSolution.windowDates,
      assignedDepartment: fullReport.project.department,
      contractor: fullReport.project.contractorName || 'Assigned EPC Agency',
      depthMeters: fullReport.project.excavationDepthMeters || 1.8,
      inspectionChecklist: [
        { item: 'Trench excavation depth & cross-utility clearance verified with laser level', mandatory: true, checked: false },
        { item: 'Hard safety barricades with reflective warning tape installed', mandatory: true, checked: false },
        { item: 'Traffic diversion marshals and LED directional arrows active', mandatory: true, checked: false },
        { item: 'Granular Sub-Base (GSB) bedding layered to standard thickness', mandatory: true, checked: false },
        { item: '95%+ Proctor Density compaction test conducted and passed', mandatory: true, checked: false },
        { item: 'Trench shoring and side wall stability verified against collapse', mandatory: true, checked: false },
        { item: 'Final Bituminous Concrete (BC) resurfacing flush with existing road surface', mandatory: true, checked: false },
      ],
      safetyRequirements: [
        'Mandatory helmets, high-visibility jackets, and safety boots on site',
        'Gas detection monitor active during underground pipeline excavation',
        'No open unbarricaded excavation pits during overnight hours',
      ],
    };

    return {
      authorized: true,
      accessLevel: 'INSPECTOR_OPERATIONAL',
      sanitizedPayload: inspectorPayload,
    };
  }

  // 5. CONTRACTOR / FIELD STAFF (Level 5)
  if (role === 'CONTRACTOR') {
    return {
      authorized: true,
      accessLevel: 'FIELD_STAFF',
      sanitizedPayload: {
        projectId: fullReport.projectId,
        projectCode: fullReport.project.code,
        roadName: fullReport.project.roadName,
        contractorName: fullReport.project.contractorName,
        assignedWork: fullReport.project.name,
        approvedWindow: fullReport.aiProposedSolution.windowDates,
        depthMeters: fullReport.project.excavationDepthMeters,
        sequenceSteps: fullReport.aiProposedSolution.depthSequence,
        safetyGuidelines: [
          'Strict adherence to permitted working hours (22:00 to 06:00 on arterial corridors)',
          'Barricade alignment must leave at least 1 lane open for emergency vehicles',
          'Submit compaction QC certificate before final road handover',
        ],
      },
    };
  }

  return {
    authorized: false,
    accessLevel: 'DENIED',
    sanitizedPayload: null,
    error: 'ACCESS RESTRICTED: This information is available only to authorized personnel.',
  };
}
