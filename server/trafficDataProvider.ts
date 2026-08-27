/**
 * MR. MAYOR - TrafficDataProvider Interface Implementation
 * Compliant with NIUA ICCC / Nashik Smart City ITMS specification (Section 10).
 * 
 * Non-negotiable rule:
 * Clearly flags that live feeds are simulated against historical Nashik baselines (CTTP 2016)
 * and ITMS ATCS capacity models.
 */

import {
  NASHIK_ROAD_VC_BASELINES,
  NASHIK_JUNCTION_INTELLIGENCE,
  DataProvenance
} from './nashikIntelligenceData.js';

export interface TrafficCondition {
  roadId: string;
  roadName: string;
  vcRatio: number;
  trafficLoad: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH' | 'CRITICAL';
  estimatedHourlyPCU: number;
  timeProfile: 'MORNING_PEAK' | 'AFTERNOON' | 'EVENING_PEAK' | 'NIGHT';
  isLiveFeedAvailable: boolean;
  dataSource: DataProvenance;
  sourceAttribution: string;
  timestamp: string;
}

export interface JunctionLoad {
  junctionId: string;
  junctionName: string;
  associatedRoad: string;
  currentPCUPerHour: number;
  peakHourPCU: number;
  peakWindow: string;
  sensitivity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  activeSignalMode: 'ATCS_DYNAMIC_SYNC' | 'FIXED_TIME_PLAN';
  dataSource: DataProvenance;
  sourceAttribution: string;
  timestamp: string;
}

export interface AverageSpeed {
  roadId: string;
  roadName: string;
  freeFlowSpeedKmh: number;
  estimatedCurrentSpeedKmh: number;
  speedDropPercentage: number;
  dataSource: DataProvenance;
  sourceAttribution: string;
  timestamp: string;
}

export interface IncidentData {
  incidentId: string;
  location: string;
  type: 'CONSTRUCTION_RESTRICTION' | 'MONSOON_ALERT' | 'KUMBH_PRIORITY_CORRIDOR' | 'BLACKSPOT_CAUTION';
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  activeFrom: string;
  dataSource: DataProvenance;
  sourceAttribution: string;
}

export interface TrafficDataProvider {
  getTrafficCondition(roadId: string, timestamp?: string): Promise<TrafficCondition>;
  getJunctionLoad(junctionId: string, timestamp?: string): Promise<JunctionLoad>;
  getAverageSpeed(roadId: string, timestamp?: string): Promise<AverageSpeed>;
  getIncidentData(location: string): Promise<IncidentData[]>;
}

export class NashikITMSTrafficDataProvider implements TrafficDataProvider {
  public async getTrafficCondition(roadId: string, timestamp?: string): Promise<TrafficCondition> {
    const baseline = NASHIK_ROAD_VC_BASELINES.find(
      (r) => r.roadId === roadId || r.roadName.toLowerCase().includes(roadId.toLowerCase())
    ) || NASHIK_ROAD_VC_BASELINES[0];

    const currentHour = timestamp ? new Date(timestamp).getHours() : new Date().getHours();
    let timeProfile: TrafficCondition['timeProfile'] = 'AFTERNOON';
    let pcuMultiplier = 1.0;

    if (currentHour >= 7 && currentHour < 11) {
      timeProfile = 'MORNING_PEAK';
      pcuMultiplier = 1.35;
    } else if (currentHour >= 11 && currentHour < 17) {
      timeProfile = 'AFTERNOON';
      pcuMultiplier = 0.9;
    } else if (currentHour >= 17 && currentHour < 22) {
      timeProfile = 'EVENING_PEAK';
      pcuMultiplier = 1.45;
    } else {
      timeProfile = 'NIGHT';
      pcuMultiplier = 0.35;
    }

    const estimatedHourlyPCU = Math.round(2200 * baseline.historicalVC * pcuMultiplier);

    return {
      roadId: baseline.roadId,
      roadName: baseline.roadName,
      vcRatio: baseline.historicalVC,
      trafficLoad: baseline.baselineCategory,
      estimatedHourlyPCU,
      timeProfile,
      isLiveFeedAvailable: false, // Explicitly state no live stream claimed
      dataSource: baseline.provenance,
      sourceAttribution: 'CTTP 2017 (Base Year 2016) / Smart City ATCS Baseline Model',
      timestamp: timestamp || new Date().toISOString(),
    };
  }

  public async getJunctionLoad(junctionId: string, timestamp?: string): Promise<JunctionLoad> {
    const junc = NASHIK_JUNCTION_INTELLIGENCE.find(
      (j) => j.junctionId === junctionId || j.name.toLowerCase().includes(junctionId.toLowerCase())
    ) || NASHIK_JUNCTION_INTELLIGENCE[0];

    return {
      junctionId: junc.junctionId,
      junctionName: junc.name,
      associatedRoad: junc.associatedRoadName,
      currentPCUPerHour: junc.peakHourPCU || 3200,
      peakHourPCU: junc.peakHourPCU || 3200,
      peakWindow: junc.peakWindow || '17:45–18:45',
      sensitivity: junc.sensitivity,
      activeSignalMode: 'ATCS_DYNAMIC_SYNC',
      dataSource: junc.provenance,
      sourceAttribution: junc.sourceDocument,
      timestamp: timestamp || new Date().toISOString(),
    };
  }

  public async getAverageSpeed(roadId: string, timestamp?: string): Promise<AverageSpeed> {
    const baseline = NASHIK_ROAD_VC_BASELINES.find(
      (r) => r.roadId === roadId || r.roadName.toLowerCase().includes(roadId.toLowerCase())
    ) || NASHIK_ROAD_VC_BASELINES[0];

    const freeFlowSpeedKmh = baseline.roadCategory === 'EXPRESSWAY' ? 80 : 50;
    const dropFactor = baseline.historicalVC * 0.45;
    const estimatedCurrentSpeedKmh = Math.round(freeFlowSpeedKmh * (1 - dropFactor));

    return {
      roadId: baseline.roadId,
      roadName: baseline.roadName,
      freeFlowSpeedKmh,
      estimatedCurrentSpeedKmh,
      speedDropPercentage: Math.round(dropFactor * 100),
      dataSource: baseline.provenance,
      sourceAttribution: 'CTTP 2016 Corridor Speed-Delay Survey & Simulation',
      timestamp: timestamp || new Date().toISOString(),
    };
  }

  public async getIncidentData(location: string): Promise<IncidentData[]> {
    const incidents: IncidentData[] = [
      {
        incidentId: 'INC-NSK-01',
        location: 'Jehan Circle & Gangapur Road',
        type: 'CONSTRUCTION_RESTRICTION',
        severity: 'HIGH',
        description: 'Simhastha 2027 Priority Corridor — Underground utility depth synchronization in effect.',
        activeFrom: '2026-01-01',
        dataSource: 'CURRENT_REPORT',
        sourceAttribution: 'NMC Simhastha 2027 Utility Action Plan',
      },
      {
        incidentId: 'INC-NSK-02',
        location: 'Dwarka Circle',
        type: 'BLACKSPOT_CAUTION',
        severity: 'CRITICAL',
        description: 'Designated Road Safety Blackspot (34 annual accidents) — Unified barrier diversion mandatory.',
        activeFrom: '2025-06-01',
        dataSource: 'CURRENT_REPORT',
        sourceAttribution: 'Nashik Traffic Police Road Safety Division',
      },
      {
        incidentId: 'INC-NSK-03',
        location: 'Citywide Corridors',
        type: 'MONSOON_ALERT',
        severity: 'HIGH',
        description: 'NMC Annual Monsoon Excavation Embargo active (15 June – 15 Sept) — Special review required.',
        activeFrom: '2026-06-15',
        dataSource: 'CURRENT_REPORT',
        sourceAttribution: 'NMC Section 197 Circular',
      },
    ];

    return incidents.filter(
      (inc) => !location || inc.location.toLowerCase().includes(location.toLowerCase()) || inc.location.includes('Citywide')
    );
  }
}

export const defaultTrafficDataProvider = new NashikITMSTrafficDataProvider();
