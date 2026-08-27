/**
 * MR. MAYOR - Multi-Dimensional Conflict Detection & Scoring Engine
 */

import { Project, Road, Conflict, InfrastructureAsset } from '../src/types/index.js';
import { calculatePolylineOverlap, pointToPolylineDistanceMeters } from './spatial.js';

export interface ConflictAnalysisResult {
  hasConflict: boolean;
  score: number;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  conflicts: Conflict[];
  reasons: string[];
  affectedStakeholders: string[];
  coordinationOpportunity: boolean;
  estimatedSavingsIfCoordinatedINR: number;
}

/**
 * Evaluates date overlap in days between two date ranges [s1, e1] and [s2, e2]
 */
export function calculateDateOverlapDays(start1: string, end1: string, start2: string, end2: string): number {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();

  const overlapStart = Math.max(s1, s2);
  const overlapEnd = Math.min(e1, e2);

  if (overlapEnd < overlapStart) {
    // Check if within 30 days window (close temporal window)
    const gapDays = Math.round((overlapStart - overlapEnd) / (1000 * 60 * 60 * 24));
    return gapDays <= 30 ? -gapDays : 0; // negative indicates near-future gap
  }

  return Math.round((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Analyzes a new or existing project against all other projects, the road, and existing assets
 */
export function analyzeProjectConflicts(
  targetProject: Project,
  allProjects: Project[],
  roads: Road[],
  assets: InfrastructureAsset[]
): ConflictAnalysisResult {
  const road = roads.find((r) => r.id === targetProject.roadId || r.name.toLowerCase() === targetProject.roadName.toLowerCase());
  const detectedConflicts: Conflict[] = [];
  const aggregateReasons: string[] = [];
  const stakeholdersSet = new Set<string>();

  // Always add default stakeholders
  stakeholdersSet.add('Roads / PWD');
  stakeholdersSet.add(targetProject.department);

  // Check road protection period ("Do Not Dig")
  const isProtected = road && new Date(road.protectionExpiryDate).getTime() > Date.now();
  if (isProtected) {
    aggregateReasons.push(
      `ROAD RECENTLY RESTORED: Protected under "Do Not Dig" policy until ${new Date(
        road.protectionExpiryDate
      ).toLocaleDateString()}. Special justification and Municipal Authority approval required.`
    );
    stakeholdersSet.add('Smart City & Urban Planning');
  }

  // Check Traffic sensitivity
  if (
    targetProject.trafficImpact === 'High' ||
    targetProject.trafficImpact === 'Severe' ||
    (road && (road.trafficClass === 'Very High' || road.category === 'Major Arterial'))
  ) {
    stakeholdersSet.add('Traffic Police Authority');
    aggregateReasons.push(
      `TRAFFIC IMPACT: High-density corridor (${road?.name || targetProject.roadName}) requires mandatory Traffic Police approval & diversion scheme.`
    );
  }

  // Check existing underground assets in corridor
  const nearbyAssets = assets.filter((asset) => {
    if (asset.roadId === targetProject.roadId) return true;
    const dist = pointToPolylineDistanceMeters(targetProject.startCoordinates, asset.geometry);
    return dist < 30;
  });

  nearbyAssets.forEach((asset) => {
    stakeholdersSet.add(asset.ownerDepartment);
    aggregateReasons.push(
      `EXISTING ASSET PROXIMITY: ${asset.assetType} (${asset.capacityOrDiameter}, depth: ${asset.depthMeters}m) owned by ${asset.ownerDepartment} runs along the planned excavation corridor.`
    );
  });

  // Compare against all other active/planned projects
  const candidateProjects = allProjects.filter(
    (p) =>
      p.id !== targetProject.id &&
      p.status !== 'COMPLETED' &&
      p.status !== 'CANCELLED' &&
      p.status !== 'REJECTED'
  );

  let maxPairScore = 0;

  for (const other of candidateProjects) {
    let pairScore = 0;
    const pairReasons: string[] = [];

    const isSameRoad =
      targetProject.roadId === other.roadId ||
      targetProject.roadName.toLowerCase() === other.roadName.toLowerCase();

    if (isSameRoad) {
      pairScore += 30;
      pairReasons.push(`Both projects are proposed on the same corridor: ${targetProject.roadName}`);
    }

    // Spatial overlap calculation
    const spatial = calculatePolylineOverlap(targetProject.geometry, other.geometry, 40);
    if (spatial.overlapPercentage > 15) {
      pairScore += Math.min(30, Math.round((spatial.overlapPercentage / 100) * 30));
      pairReasons.push(
        `High spatial overlap: ${spatial.overlapPercentage}% (${spatial.overlapMeters}m) directly coincident excavation alignment.`
      );
    } else if (spatial.minDistanceMeters <= 50) {
      pairScore += 15;
      pairReasons.push(`Close spatial proximity: within ${spatial.minDistanceMeters}m of ${other.name} (${other.code})`);
    }

    // Temporal overlap
    const dateOverlap = calculateDateOverlapDays(
      targetProject.requiredStartDate,
      targetProject.requiredCompletionDate,
      other.requiredStartDate,
      other.requiredCompletionDate
    );

    if (dateOverlap > 0) {
      pairScore += 20;
      pairReasons.push(`Direct time overlap: ${dateOverlap} days concurrent execution window.`);
    } else if (dateOverlap < 0 && Math.abs(dateOverlap) <= 35) {
      pairScore += 15;
      pairReasons.push(
        `Close temporal proximity: within ${Math.abs(dateOverlap)} days of each other. Opening road twice within a short span would trigger duplicate restoration.`
      );
    }

    // Road protection factor
    if (isProtected) {
      pairScore += 20;
    }

    // High traffic sensitivity factor
    if (road?.trafficClass === 'Very High' || targetProject.trafficImpact === 'High') {
      pairScore += 10;
    }

    // Coordination / Compatible work bonus
    if (targetProject.department !== other.department && (isSameRoad || spatial.overlapPercentage > 20)) {
      pairScore += 15;
      pairReasons.push(
        `Multi-agency coordination opportunity detected: ${targetProject.department} + ${other.department} can execute trenching simultaneously.`
      );
    }

    // Normalize to 0-100
    pairScore = Math.min(100, Math.max(0, pairScore));

    if (pairScore >= 25) {
      let severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
      if (pairScore >= 76) severity = 'CRITICAL';
      else if (pairScore >= 51) severity = 'HIGH';
      else if (pairScore >= 26) severity = 'MODERATE';

      detectedConflicts.push({
        id: `CONF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        projectAId: targetProject.id,
        projectAName: targetProject.name,
        projectADept: targetProject.department,
        projectBId: other.id,
        projectBName: other.name,
        projectBDept: other.department,
        roadId: targetProject.roadId,
        roadName: targetProject.roadName,
        spatialOverlapPct: spatial.overlapPercentage,
        spatialOverlapDistanceMeters: spatial.overlapMeters,
        temporalOverlapDays: dateOverlap > 0 ? dateOverlap : 0,
        conflictScore: pairScore,
        severity,
        reasons: pairReasons,
        status: 'DETECTED',
        createdAt: new Date().toISOString(),
      });

      stakeholdersSet.add(other.department);
      if (pairScore > maxPairScore) {
        maxPairScore = pairScore;
      }
    }
  }

  // Base aggregate score
  let totalScore = maxPairScore;
  if (isProtected && totalScore < 50) totalScore = 50;

  let severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (totalScore >= 76) severity = 'CRITICAL';
  else if (totalScore >= 51) severity = 'HIGH';
  else if (totalScore >= 26) severity = 'MODERATE';

  const coordinationOpportunity = detectedConflicts.length > 0 && totalScore >= 40;
  
  // Calculate estimated savings if coordinated (e.g. avoided excavations & restorations)
  const estimatedSavingsIfCoordinatedINR = coordinationOpportunity
    ? Math.round((targetProject.estimatedExcavationCostINR * 0.45) + (targetProject.estimatedRestorationCostINR * 0.85) + 350000)
    : 0;

  return {
    hasConflict: totalScore >= 26,
    score: totalScore,
    severity,
    conflicts: detectedConflicts,
    reasons: aggregateReasons,
    affectedStakeholders: Array.from(stakeholdersSet),
    coordinationOpportunity,
    estimatedSavingsIfCoordinatedINR,
  };
}
