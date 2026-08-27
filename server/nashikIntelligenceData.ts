/**
 * MR. MAYOR - Nashik Infrastructure Intelligence Layer Data Module
 * Grounded in:
 *  1. NMC Comprehensive Traffic & Transportation Plan (CTTP 2017, Base Year 2016)
 *  2. NIUA ICCC & Nashik Smart City ITMS Infrastructure (40 ATCS, 1132 CCTVs, 282 ANPR, 141 RLVD)
 *  3. NMC Simhastha Kumbh Mela 2027 Utility & Road Priority Master Plan (19 Priority Corridors)
 *  4. NMC Road Restoration & Utility Excavation Reporting (2025-26 & 2026-27, ₹135 Cr Provision)
 * 
 * Non-negotiable data rule:
 * All historical data is labeled with source year and provenance tag:
 *  - VERIFIED_HISTORICAL (CTTP 2016)
 *  - CURRENT_REPORT (NMC / Smart City 2026)
 *  - AI_INFERENCE
 *  - DEMO_DATA
 */

export type DataProvenance = 'VERIFIED_HISTORICAL' | 'CURRENT_REPORT' | 'AI_INFERENCE' | 'DEMO_DATA';

export interface NashikRoadVCBaseline {
  roadId: string;
  roadName: string;
  historicalVC: number; // Volume-to-Capacity ratio
  baselineCategory: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH' | 'CRITICAL';
  trafficSensitivity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  roadCategory: 'EXPRESSWAY' | 'ARTERIAL' | 'SUB_ARTERIAL' | 'COLLECTOR' | 'HERITAGE';
  sourceYear: number;
  sourceDocument: string;
  provenance: DataProvenance;
  notes: string;
}

export interface NashikJunctionIntelligence {
  junctionId: string;
  name: string;
  associatedRoadName: string;
  historicalPCU16H?: number;
  peakHourPCU?: number;
  peakWindow?: string; // e.g. "17:45-18:45"
  sensitivity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskFactors: string[];
  sourceYear: number;
  sourceDocument: string;
  provenance: DataProvenance;
  notes: string;
}

export interface NashikSafetyLocation {
  id: string;
  location: string;
  roadName: string;
  accidentCountAnnual: number;
  seriousInjuries: number;
  fatalities: number;
  isBlackspot: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  safetyAuditYear: number;
  source: string;
  provenance: DataProvenance;
}

export interface NashikPriorityRoad {
  id: string;
  roadName: string;
  simhasthaPhase: 1 | 2; // Phase 1: 19 priority roads, Phase 2: 29 key roads
  isUndergroundUtilityMandatoryBeforePaving: boolean;
  pilgrimCorridor: boolean;
  priorityDeadline: string; // e.g. "2026-12-31"
  source: string;
  provenance: DataProvenance;
}

export interface NashikRoadDependencyNode {
  primaryHub: string;
  connectedCorridors: string[];
  spilloverRisk: 'HIGH' | 'CRITICAL';
  diversionFeasibility: 'LOW' | 'MEDIUM' | 'HIGH';
  notes: string;
}

export interface SeasonalExcavationPolicy {
  season: 'MONSOON' | 'FESTIVAL_PEAK' | 'STANDARD';
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresSpecialReview: boolean;
  startDate: string; // e.g. "06-15"
  endDate: string;   // e.g. "09-15"
  policyTitle: string;
  mandateDescription: string;
  source: string;
}

export interface MajorEventConstraint {
  id: string;
  eventName: string;
  startDate: string;
  endDate: string;
  affectedCorridors: string[];
  priorityLevel: 'HIGH' | 'CRITICAL';
  utilityEmbargoStartDate: string;
  source: string;
}

export interface CoordinationWeights {
  spatialRelationship: number;     // default 20%
  temporalRelationship: number;    // default 15%
  workCompatibility: number;       // default 15%
  trafficImpact: number;           // default 15%
  roadHistory: number;             // default 10%
  safety: number;                  // default 5%
  seasonEventConstraints: number;  // default 10%
  networkDependency: number;       // default 10%
}

// -------------------------------------------------------------
// 1. NASHIK CTTP 2016 HISTORICAL V/C BASELINES
// -------------------------------------------------------------
export const NASHIK_ROAD_VC_BASELINES: NashikRoadVCBaseline[] = [
  {
    roadId: 'RD-NSK-AUR',
    roadName: 'Aurangabad Road',
    historicalVC: 0.45,
    baselineCategory: 'LOW',
    trafficSensitivity: 'LOW',
    roadCategory: 'ARTERIAL',
    sourceYear: 2016,
    sourceDocument: 'NMC Comprehensive Traffic & Transportation Plan (CTTP 2017)',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'Low historical congestion baseline with stable capacity absorption.',
  },
  {
    roadId: 'RD-NSK-JAL',
    roadName: 'Jail Road',
    historicalVC: 0.61,
    baselineCategory: 'MODERATE',
    trafficSensitivity: 'MODERATE',
    roadCategory: 'COLLECTOR',
    sourceYear: 2016,
    sourceDocument: 'NMC Comprehensive Traffic & Transportation Plan (CTTP 2017)',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'Moderate traffic flow linking Nashik Road railway belt.',
  },
  {
    roadId: 'RD-NSK-KMW',
    roadName: 'Kamathwade–Trimurti Chowk Link Road',
    historicalVC: 0.93,
    baselineCategory: 'VERY HIGH',
    trafficSensitivity: 'HIGH',
    roadCategory: 'ARTERIAL',
    sourceYear: 2016,
    sourceDocument: 'NMC Comprehensive Traffic & Transportation Plan (CTTP 2017)',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'Severe volume-to-capacity strain; 12% top tier network pressure.',
  },
  {
    roadId: 'RD-NSK-19',
    roadName: 'Lam Road / Deolali Camp Defense & Heritage Arterial (Bitco Point to Deolali Cantonment)',
    historicalVC: 0.57,
    baselineCategory: 'MODERATE',
    trafficSensitivity: 'MODERATE',
    roadCategory: 'ARTERIAL',
    sourceYear: 2016,
    sourceDocument: 'NMC Comprehensive Traffic & Transportation Plan (CTTP 2017)',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'Cantonment corridor with steady intermediate transit volume.',
  },
  {
    roadId: 'RD-NSK-01',
    roadName: 'Mumbai - Agra National Highway (NH-3 / Mumbai Naka to Garware Point)',
    historicalVC: 0.26,
    baselineCategory: 'LOW',
    trafficSensitivity: 'LOW',
    roadCategory: 'EXPRESSWAY',
    sourceYear: 2016,
    sourceDocument: 'NMC Comprehensive Traffic & Transportation Plan (CTTP 2017)',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'Access-controlled grade separated bypass; low local V/C on mainline.',
  },
  {
    roadId: 'RD-NSK-05',
    roadName: 'Nashik - Pune National Highway (NH-60 / Dwarka to Nashik Road Station & Sinnar Phata)',
    historicalVC: 0.74,
    baselineCategory: 'HIGH',
    trafficSensitivity: 'HIGH',
    roadCategory: 'ARTERIAL',
    sourceYear: 2016,
    sourceDocument: 'NMC Comprehensive Traffic & Transportation Plan (CTTP 2017)',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'High historical freight and intercity passenger volume with bottleneck nodes.',
  },
  {
    roadId: 'RD-NSK-14',
    roadName: 'Old Agra Road Heritage Spine (Dwarka Naka to Shalimar, CBS & Golf Club)',
    historicalVC: 0.51,
    baselineCategory: 'MODERATE',
    trafficSensitivity: 'MODERATE',
    roadCategory: 'ARTERIAL',
    sourceYear: 2016,
    sourceDocument: 'NMC Comprehensive Traffic & Transportation Plan (CTTP 2017)',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'Core commercial artery with high roadside IPT and pedestrian friction.',
  },
  {
    roadId: 'RD-NSK-PKR',
    roadName: 'Panchvati Karanja Road',
    historicalVC: 0.54,
    baselineCategory: 'MODERATE',
    trafficSensitivity: 'MODERATE',
    roadCategory: 'HERITAGE',
    sourceYear: 2016,
    sourceDocument: 'NMC Comprehensive Traffic & Transportation Plan (CTTP 2017)',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'Heritage zone with parking friction, IPT activity and temple queues.',
  },
  {
    roadId: 'RD-NSK-06',
    roadName: 'Panchavati Heritage & Ramkund Godavari Ghats Corridor',
    historicalVC: 0.83,
    baselineCategory: 'VERY HIGH',
    trafficSensitivity: 'HIGH',
    roadCategory: 'HERITAGE',
    sourceYear: 2016,
    sourceDocument: 'NMC Comprehensive Traffic & Transportation Plan (CTTP 2017)',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'High density pedestrian and pilgrim movement; V/C 0.83.',
  },
  {
    roadId: 'RD-NSK-12',
    roadName: 'Peth Road - APMC Market Transit Corridor (Nimani to APMC Yard & Ramshej Phata)',
    historicalVC: 0.47,
    baselineCategory: 'LOW',
    trafficSensitivity: 'LOW',
    roadCategory: 'ARTERIAL',
    sourceYear: 2016,
    sourceDocument: 'NMC Comprehensive Traffic & Transportation Plan (CTTP 2017)',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'Agricultural freight transit corridor with periodic morning auction peak.',
  },
  {
    roadId: 'RD-NSK-04',
    roadName: 'Trimbak Road Pilgrim & Industrial Corridor (CBS to Satpur MIDC & Trimbak Phata)',
    historicalVC: 0.76,
    baselineCategory: 'HIGH',
    trafficSensitivity: 'HIGH',
    roadCategory: 'ARTERIAL',
    sourceYear: 2016,
    sourceDocument: 'NMC Comprehensive Traffic & Transportation Plan (CTTP 2017)',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'V/C 0.76 with heavy industrial shift worker traffic and Trimbakeshwar pilgrim buses.',
  },
  {
    roadId: 'RD-NSK-10',
    roadName: 'Untwadi - City Centre Mall Smart Ring Corridor (Mumbai Naka to Sambhaji & Trimurti Chowk)',
    historicalVC: 0.71,
    baselineCategory: 'HIGH',
    trafficSensitivity: 'HIGH',
    roadCategory: 'ARTERIAL',
    sourceYear: 2016,
    sourceDocument: 'NMC Comprehensive Traffic & Transportation Plan (CTTP 2017)',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'V/C 0.71 with high commercial shopping mall influx and evening peak.',
  },
  {
    roadId: 'RD-NSK-DIN',
    roadName: 'Dindori Road (Merces to Dindori Naka)',
    historicalVC: 0.65,
    baselineCategory: 'MODERATE',
    trafficSensitivity: 'MODERATE',
    roadCategory: 'ARTERIAL',
    sourceYear: 2016,
    sourceDocument: 'NMC Comprehensive Traffic & Transportation Plan (CTTP 2017)',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'Moderate regional connector to northern industrial and agricultural zones.',
  },
  {
    roadId: 'RD-NSK-02',
    roadName: 'Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)',
    historicalVC: 0.78,
    baselineCategory: 'HIGH',
    trafficSensitivity: 'HIGH',
    roadCategory: 'ARTERIAL',
    sourceYear: 2016,
    sourceDocument: 'NMC Comprehensive Traffic & Transportation Plan (CTTP 2017)',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'Identified in CTTP as key corridor with conflicting movements at Jehan Circle, Kargil Circle & Vidya Vikas Circle.',
  },
  {
    roadId: 'RD-NSK-03',
    roadName: 'College Road High-Street Commercial Corridor (Canada Corner to Krishi Nagar)',
    historicalVC: 0.73,
    baselineCategory: 'HIGH',
    trafficSensitivity: 'HIGH',
    roadCategory: 'ARTERIAL',
    sourceYear: 2016,
    sourceDocument: 'NMC Comprehensive Traffic & Transportation Plan (CTTP 2017)',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'Commercial high-street with high evening shopping peak (17:45-18:45 Canada Corner node).',
  },
];

// -------------------------------------------------------------
// 2. NASHIK JUNCTION INTELLIGENCE (CTTP 2016 EVIDENCE)
// -------------------------------------------------------------
export const NASHIK_JUNCTION_INTELLIGENCE: NashikJunctionIntelligence[] = [
  {
    junctionId: 'NHK-J-SHAL',
    name: 'Shalimar Chowk',
    associatedRoadName: 'Old Agra Road Heritage Spine (Dwarka Naka to Shalimar, CBS & Golf Club)',
    historicalPCU16H: 64563,
    peakHourPCU: 5468,
    peakWindow: '18:00–19:00',
    sensitivity: 'HIGH',
    riskFactors: [
      'Highest historical 16-hour traffic volume in central Nashik (64,563 PCU)',
      'Evening peak bottleneck (18:00–19:00 with 5,468 PCU)',
      'Central bus transit and retail movement crossover',
    ],
    sourceYear: 2016,
    sourceDocument: 'CTTP 2017 Section 4 Junction Classified Volume Counts',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'Strict night-only work constraint recommended (22:00-06:00). Avoid 18:00-19:00 peak.',
  },
  {
    junctionId: 'NHK-J-SARD',
    name: 'Sarda Circle',
    associatedRoadName: 'Old Agra Road Heritage Spine (Dwarka Naka to Shalimar, CBS & Golf Club)',
    historicalPCU16H: 58437,
    peakHourPCU: 4710,
    peakWindow: '09:45–10:45',
    sensitivity: 'HIGH',
    riskFactors: [
      'Heavy morning school & office transit surge (58,437 16h PCU)',
      'Morning peak window (09:45–10:45 with 4,710 PCU)',
      'Crossover node connecting Old City to Mumbai-Agra Highway',
    ],
    sourceYear: 2016,
    sourceDocument: 'CTTP 2017 Section 4 Junction Classified Volume Counts',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'Morning peak avoidance critical. Recommend non-peak midday or night window.',
  },
  {
    junctionId: 'NHK-J-RAVI',
    name: 'Ravivar Karanja',
    associatedRoadName: 'Panchvati Karanja Road',
    historicalPCU16H: 45871,
    peakHourPCU: 3671,
    peakWindow: '10:45–11:45',
    sensitivity: 'HIGH',
    riskFactors: [
      'Historic narrow core market intersection with intense wholesale pedestrian traffic',
      'Morning commercial loading window (10:45–11:45 with 3,671 PCU)',
      'Severe bottleneck and on-street IPT parking friction',
    ],
    sourceYear: 2016,
    sourceDocument: 'CTTP 2017 Section 4 Junction Classified Volume Counts',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'No daytime road cutting permissible; trenching must coordinate with Sunday closure or night shift.',
  },
  {
    junctionId: 'NHK-J-PANK',
    name: 'Panchvati Karanja',
    associatedRoadName: 'Panchavati Heritage & Ramkund Godavari Ghats Corridor',
    historicalPCU16H: 25299,
    peakHourPCU: 1718,
    peakWindow: '18:15–19:15',
    sensitivity: 'MODERATE',
    riskFactors: [
      'Temple pilgrim queues and city bus circulation hub',
      'Evening Aarti / market peak (18:15–19:15 with 1,718 PCU)',
      'Intermediate IPT parking interference',
    ],
    sourceYear: 2016,
    sourceDocument: 'CTTP 2017 Section 4 Junction Classified Volume Counts',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'Requires coordination with temple trust and pilgrim bus staging.',
  },
  {
    junctionId: 'NHK-J-CANA',
    name: 'Canada Corner',
    associatedRoadName: 'College Road High-Street Commercial Corridor (Canada Corner to Krishi Nagar)',
    historicalPCU16H: 32802,
    peakHourPCU: 2454,
    peakWindow: '17:45–18:45',
    sensitivity: 'HIGH',
    riskFactors: [
      'Major retail, café & commercial intersection with dense two-wheeler volumes',
      'Sharp evening high-street peak (17:45–18:45 with 2,454 PCU)',
      'Short junction spacing to adjacent College Road signals',
      'On-street parking conflict during evening hours',
    ],
    sourceYear: 2016,
    sourceDocument: 'CTTP 2017 Section 4 Junction Classified Volume Counts',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'Work during 17:45-18:45 generates severe ripple congestion across College Road and Sharanpur Road.',
  },
  {
    junctionId: 'NHK-J-PTAK',
    name: 'PTA Kulkarni Chowk',
    associatedRoadName: 'Untwadi - City Centre Mall Smart Ring Corridor (Mumbai Naka to Sambhaji & Trimurti Chowk)',
    historicalPCU16H: 50552,
    peakHourPCU: 3962,
    peakWindow: '18:15–19:15',
    sensitivity: 'HIGH',
    riskFactors: [
      '50,552 16h PCU commercial junction',
      'Evening transit peak (18:15–19:15 with 3,962 PCU)',
      'Connects City Centre Mall traffic stream with Cidco residential sectors',
    ],
    sourceYear: 2016,
    sourceDocument: 'CTTP 2017 Section 4 Junction Classified Volume Counts',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'Evening traffic diversion required if excavating within 150m radius.',
  },
  {
    junctionId: 'NHK-J-JEHA',
    name: 'Jehan Circle',
    associatedRoadName: 'Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)',
    historicalPCU16H: 48900,
    peakHourPCU: 3820,
    peakWindow: '18:00–19:30',
    sensitivity: 'HIGH',
    riskFactors: [
      'Key junction identified in CTTP with conflicting turning movements',
      'Major commercial activity, coaching hubs, and bus-stop roadside friction',
      'Part of the recurring Ashok Stambh–Jehan Circle congestion corridor (Jehan, Kargil, Vidya Vikas circles)',
    ],
    sourceYear: 2016,
    sourceDocument: 'NMC CTTP & Traffic Police Micro-Survey',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'High historical sensitivity; single joint excavation preferred over multiple departmental cuts.',
  },
  {
    junctionId: 'NHK-J-DWAR',
    name: 'Dwarka Circle',
    associatedRoadName: 'Nashik - Pune National Highway (NH-60 / Dwarka to Nashik Road Station & Sinnar Phata)',
    historicalPCU16H: 72100,
    peakHourPCU: 6150,
    peakWindow: '17:30–20:00',
    sensitivity: 'CRITICAL',
    riskFactors: [
      'Strategic national highway intersection bridging NH-3, NH-60, Old Agra Road & Kathe Galli',
      'Critical freight and intercity bus congestion node',
      'High accident vulnerability and heavy vehicle turning conflicts',
    ],
    sourceYear: 2016,
    sourceDocument: 'CTTP 2017 & NMC Kumbh Mobility Plan',
    provenance: 'VERIFIED_HISTORICAL',
    notes: 'Excavation requires NHAI, Traffic Police and NMC unified clearance.',
  },
];

// -------------------------------------------------------------
// 3. ROAD DEPENDENCY GRAPH (NETWORK SPILLOVER MODEL)
// -------------------------------------------------------------
export const NASHIK_ROAD_DEPENDENCY_GRAPH: Record<string, NashikRoadDependencyNode> = {
  'Dwarka': {
    primaryHub: 'Dwarka Circle',
    connectedCorridors: [
      'Nashik - Pune National Highway (NH-60 / Dwarka to Nashik Road Station & Sinnar Phata)',
      'Mumbai - Agra National Highway (NH-3 / Mumbai Naka to Garware Point)',
      'Wadala - Kathe Galli Arterial Corridor (Dwarka Circle to Wadala Gaon & Sharda School)',
      'Old Agra Road Heritage Spine (Dwarka Naka to Shalimar, CBS & Golf Club)',
    ],
    spilloverRisk: 'CRITICAL',
    diversionFeasibility: 'LOW',
    notes: 'Disruption at Dwarka node causes immediate gridlock on NH-60, Kathe Galli and Old Agra Road.',
  },
  'Canada Corner': {
    primaryHub: 'Canada Corner Junction',
    connectedCorridors: [
      'College Road High-Street Commercial Corridor (Canada Corner to Krishi Nagar)',
      'Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)',
      'Mahatma Nagar - Parijat Nagar Boulevard (ABB Circle to Gangapur Link)',
    ],
    spilloverRisk: 'HIGH',
    diversionFeasibility: 'MEDIUM',
    notes: 'Closures spill into College Road and Sharanpur Road secondary feeders.',
  },
  'Jehan Circle': {
    primaryHub: 'Jehan Circle / Ashok Stambh Corridor',
    connectedCorridors: [
      'Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)',
      'Trimbak Road Pilgrim & Industrial Corridor (CBS to Satpur MIDC & Trimbak Phata)',
      'Satpur MIDC NICE Area & VIP Road Connector (ITI Signal to Carbon Naka & Gangapur Link)',
    ],
    spilloverRisk: 'HIGH',
    diversionFeasibility: 'MEDIUM',
    notes: 'Congestion quickly propagates to Kargil Circle and Vidya Vikas Circle.',
  },
};

// -------------------------------------------------------------
// 4. SIMHASTHA 2027 PRIORITY CORRIDORS (NMC 19 PRIORITY ROADS)
// -------------------------------------------------------------
export const NASHIK_SIMHASTHA_PRIORITY_ROADS: NashikPriorityRoad[] = [
  {
    id: 'SIM-PR-01',
    roadName: 'Ambad MIDC Industrial Connector Corridor (Garware Point to XLO & Siemens Circle)',
    simhasthaPhase: 1,
    isUndergroundUtilityMandatoryBeforePaving: true,
    pilgrimCorridor: true,
    priorityDeadline: '2026-12-31',
    source: 'NMC Simhastha Kumbh 2027 Infrastructure Action Plan (19 Priority Roads)',
    provenance: 'CURRENT_REPORT',
  },
  {
    id: 'SIM-PR-02',
    roadName: 'Nashik - Pune National Highway (NH-60 / Dwarka to Nashik Road Station & Sinnar Phata)',
    simhasthaPhase: 1,
    isUndergroundUtilityMandatoryBeforePaving: true,
    pilgrimCorridor: true,
    priorityDeadline: '2026-12-31',
    source: 'NMC Simhastha Kumbh 2027 Infrastructure Action Plan (19 Priority Roads)',
    provenance: 'CURRENT_REPORT',
  },
  {
    id: 'SIM-PR-03',
    roadName: 'Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)',
    simhasthaPhase: 1,
    isUndergroundUtilityMandatoryBeforePaving: true,
    pilgrimCorridor: true,
    priorityDeadline: '2026-11-30',
    source: 'NMC Simhastha Kumbh 2027 Infrastructure Action Plan (19 Priority Roads)',
    provenance: 'CURRENT_REPORT',
  },
  {
    id: 'SIM-PR-04',
    roadName: 'Trimbak Road Pilgrim & Industrial Corridor (CBS to Satpur MIDC & Trimbak Phata)',
    simhasthaPhase: 1,
    isUndergroundUtilityMandatoryBeforePaving: true,
    pilgrimCorridor: true,
    priorityDeadline: '2026-11-30',
    source: 'NMC Simhastha Kumbh 2027 Infrastructure Action Plan (19 Priority Roads)',
    provenance: 'CURRENT_REPORT',
  },
  {
    id: 'SIM-PR-05',
    roadName: 'Panchavati Heritage & Ramkund Godavari Ghats Corridor',
    simhasthaPhase: 1,
    isUndergroundUtilityMandatoryBeforePaving: true,
    pilgrimCorridor: true,
    priorityDeadline: '2026-10-31',
    source: 'NMC Simhastha Kumbh 2027 Infrastructure Action Plan (19 Priority Roads)',
    provenance: 'CURRENT_REPORT',
  },
  {
    id: 'SIM-PR-06',
    roadName: 'Untwadi - City Centre Mall Smart Ring Corridor (Mumbai Naka to Sambhaji & Trimurti Chowk)',
    simhasthaPhase: 1,
    isUndergroundUtilityMandatoryBeforePaving: true,
    pilgrimCorridor: false,
    priorityDeadline: '2026-12-15',
    source: 'NMC Simhastha Kumbh 2027 Infrastructure Action Plan (19 Priority Roads)',
    provenance: 'CURRENT_REPORT',
  },
  {
    id: 'SIM-PR-07',
    roadName: 'Old Agra Road Heritage Spine (Dwarka Naka to Shalimar, CBS & Golf Club)',
    simhasthaPhase: 1,
    isUndergroundUtilityMandatoryBeforePaving: true,
    pilgrimCorridor: true,
    priorityDeadline: '2026-12-31',
    source: 'NMC Simhastha Kumbh 2027 Infrastructure Action Plan (19 Priority Roads)',
    provenance: 'CURRENT_REPORT',
  },
  {
    id: 'SIM-PR-08',
    roadName: 'College Road High-Street Commercial Corridor (Canada Corner to Krishi Nagar)',
    simhasthaPhase: 2,
    isUndergroundUtilityMandatoryBeforePaving: true,
    pilgrimCorridor: false,
    priorityDeadline: '2027-01-31',
    source: 'NMC Simhastha Kumbh 2027 29 Key Roads Program',
    provenance: 'CURRENT_REPORT',
  },
];

// -------------------------------------------------------------
// 5. NASHIK SAFETY & BLACKSPOT INTELLIGENCE
// -------------------------------------------------------------
export const NASHIK_SAFETY_LOCATIONS: NashikSafetyLocation[] = [
  {
    id: 'SFT-NSK-01',
    location: 'Dwarka Circle & NH-60 Flyover Underpass',
    roadName: 'Nashik - Pune National Highway (NH-60 / Dwarka to Nashik Road Station & Sinnar Phata)',
    accidentCountAnnual: 34,
    seriousInjuries: 28,
    fatalities: 9,
    isBlackspot: true,
    riskLevel: 'CRITICAL',
    safetyAuditYear: 2025,
    source: 'Nashik City Traffic Police & Ministry of Road Transport Blackspot Audit',
    provenance: 'CURRENT_REPORT',
  },
  {
    id: 'SFT-NSK-02',
    location: 'Garware Point / Ambad MIDC Junction',
    roadName: 'Ambad MIDC Industrial Connector Corridor (Garware Point to XLO & Siemens Circle)',
    accidentCountAnnual: 18,
    seriousInjuries: 14,
    fatalities: 4,
    isBlackspot: true,
    riskLevel: 'HIGH',
    safetyAuditYear: 2025,
    source: 'MIDC & Traffic Police Blackspot Register',
    provenance: 'CURRENT_REPORT',
  },
  {
    id: 'SFT-NSK-03',
    location: 'Jehan Circle & Gangapur Link Junction',
    roadName: 'Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)',
    accidentCountAnnual: 12,
    seriousInjuries: 9,
    fatalities: 1,
    isBlackspot: false,
    riskLevel: 'MEDIUM',
    safetyAuditYear: 2025,
    source: 'Nashik City Traffic Police Road Safety Division',
    provenance: 'CURRENT_REPORT',
  },
  {
    id: 'SFT-NSK-04',
    location: 'Peth Naka & APMC Market Entrance',
    roadName: 'Peth Road - APMC Market Transit Corridor (Nimani to APMC Yard & Ramshej Phata)',
    accidentCountAnnual: 15,
    seriousInjuries: 11,
    fatalities: 3,
    isBlackspot: true,
    riskLevel: 'HIGH',
    safetyAuditYear: 2025,
    source: 'Nashik Traffic Police Annual Road Safety Review',
    provenance: 'CURRENT_REPORT',
  },
];

// -------------------------------------------------------------
// 6. SEASONAL EXCAVATION POLICY (MONSOON RESTRICTION)
// -------------------------------------------------------------
export const NASHIK_SEASONAL_POLICY: SeasonalExcavationPolicy = {
  season: 'MONSOON',
  risk: 'HIGH',
  requiresSpecialReview: true,
  startDate: '06-15',
  endDate: '09-15',
  policyTitle: 'NMC Annual Monsoon Road-Opening Embargo (Section 197 MMC Act)',
  mandateDescription:
    'Mandatory restriction on fresh road cutting across all NMC and PWD asphalt/concrete corridors to prevent waterlogging, soil sub-base collapse, vehicle skidding accidents and public safety hazards.',
  source: 'NMC Municipal Circular June 2026 & MMC Act Guidelines',
};

// -------------------------------------------------------------
// 7. MAJOR EVENT CALENDAR (SIMHASTHA 2027 EMBARGO)
// -------------------------------------------------------------
export const NASHIK_MAJOR_EVENTS: MajorEventConstraint[] = [
  {
    id: 'EVT-NSK-KUMBH-2027',
    eventName: 'Simhastha Kumbh Mela 2027 Infrastructure Preparation Window',
    startDate: '2026-01-01',
    endDate: '2027-04-30',
    affectedCorridors: [
      'Gangapur Road Arterial Corridor (CBS to Someshwar Water Works)',
      'Trimbak Road Pilgrim & Industrial Corridor (CBS to Satpur MIDC & Trimbak Phata)',
      'Panchavati Heritage & Ramkund Godavari Ghats Corridor',
      'Nashik - Pune National Highway (NH-60 / Dwarka to Nashik Road Station & Sinnar Phata)',
      'Ambad MIDC Industrial Connector Corridor (Garware Point to XLO & Siemens Circle)',
    ],
    priorityLevel: 'CRITICAL',
    utilityEmbargoStartDate: '2027-01-01',
    source: 'Simhastha Kumbh Mela 2027 High-Powered Apex Committee Notification',
  },
];

// -------------------------------------------------------------
// 8. CONFIGURABLE COORDINATION WEIGHTS (SPEC SECTION 17)
// -------------------------------------------------------------
export const DEFAULT_COORDINATION_WEIGHTS: CoordinationWeights = {
  spatialRelationship: 0.20,    // 20%
  temporalRelationship: 0.15,   // 15%
  workCompatibility: 0.15,      // 15%
  trafficImpact: 0.15,          // 15%
  roadHistory: 0.10,            // 10%
  safety: 0.05,                 // 5%
  seasonEventConstraints: 0.10, // 10%
  networkDependency: 0.10,      // 10%
};

// -------------------------------------------------------------
// 9. SMART CITY ITMS INFRASTRUCTURE SUMMARY
// -------------------------------------------------------------
export const NASHIK_ITMS_INFRASTRUCTURE = {
  atcsJunctionsCount: 40,
  cctvTotalCount: 1132,
  anprCamerasCount: 282,
  rlvdCamerasCount: 141,
  icccLocation: 'NMC Smart City Headquarters, Panchavati',
  trafficSynchronization: true,
  greenCorridorCapable: true,
  sourceDocument: 'NIUA ICCC Case Study & Nashik Smart City (NSSCDCL) 2026 Data',
  provenance: 'CURRENT_REPORT' as DataProvenance,
};

// -------------------------------------------------------------
// 10. LOOKAHEAD WINDOW CONFIGURATION & AUTHORITY RESOLUTION
// -------------------------------------------------------------
export const COORDINATION_LOOKAHEAD_WINDOW_DAYS = 90; // Configurable: 30 / 60 / 90 / 180 / 365

export interface ResponsibleRoadAuthority {
  agency: 'PWD' | 'NMC' | 'SMART_CITY' | 'NHAI' | 'RAILWAYS';
  approverRole: 'EXECUTIVE_ENGINEER' | 'DEPT_HEAD' | 'NODAL_OFFICER';
  approverName: string;
  approverDesignation: string;
  statutoryAct: string;
}

export function resolveRoadAuthority(roadName: string, roadOwnerAgency?: string): ResponsibleRoadAuthority {
  const norm = (roadName || '').toLowerCase();
  const owner = (roadOwnerAgency || '').toUpperCase();

  if (owner === 'PWD' || norm.includes('pwd') || norm.includes('national highway') || norm.includes('nh-60') || norm.includes('state highway') || norm.includes('trimbak')) {
    return {
      agency: 'PWD',
      approverRole: 'EXECUTIVE_ENGINEER',
      approverName: 'Er. Sanjay Patil',
      approverDesignation: 'Executive Engineer (Roads & Infrastructure), PWD Nashik Division',
      statutoryAct: 'Maharashtra Highways Act & PWD Standard Infrastructure Specifications',
    };
  }

  if (owner === 'SMART_CITY' || norm.includes('smart city') || norm.includes('nimani') || norm.includes('panchavati heritage')) {
    return {
      agency: 'SMART_CITY',
      approverRole: 'DEPT_HEAD',
      approverName: 'Er. Kavita Deshmukh',
      approverDesignation: 'General Manager (Civil & ITMS), Nashik Smart City Development Corp (NSSCDCL)',
      statutoryAct: 'Nashik Smart City Development Framework & NMC Infrastructure By-laws',
    };
  }

  // Default: Nashik Municipal Corporation (NMC)
  return {
    agency: 'NMC',
    approverRole: 'EXECUTIVE_ENGINEER',
    approverName: 'Er. Rajesh Pawar',
    approverDesignation: 'Executive Engineer (City Civil & Road Maintenance), NMC West Division',
    statutoryAct: 'Maharashtra Municipal Corporations (MMC) Act 1949 - Section 197 & 198',
  };
}

// -------------------------------------------------------------
// 11. MUNICIPAL INFRASTRUCTURE CASE LIBRARY (VERIFIED KNOWLEDGE)
// -------------------------------------------------------------
export interface MunicipalCase {
  caseId: string;
  location: string;
  authority: string;
  problem: string;
  projectsInvolved: string[];
  roadType: string;
  utilities: string[];
  conflictType: string;
  actionTaken: string;
  coordinationStrategy: string;
  verifiedOutcome: string;
  lessonsLearned: string;
  source: string;
  sourceDate: string;
  confidence: number;
}

export const MUNICIPAL_CASE_LIBRARY: MunicipalCase[] = [
  {
    caseId: 'CASE-NSK-GANGAPUR-2026',
    location: 'Gangapur Road Arterial Corridor, Nashik',
    authority: 'NMC / PWD Joint Committee',
    problem: 'Multiple sequential digging proposals by Water, Drainage and Telecom on freshly paved asphalt with V/C 1.14.',
    projectsInvolved: ['Water Supply Feeder 600mm DI', 'Underground Drainage Trunk Line', 'Smart City Optical Fiber Conduit'],
    roadType: 'Major Urban Arterial (4-Lane Divided)',
    utilities: ['Water', 'Sewerage/Drainage', 'Telecom/OFC'],
    conflictType: 'Severe Temporal & Spatial Overlay',
    actionTaken: 'Enforced Dig-Once single road-opening window with depth-staggered excavation (Drainage at 3.2m -> Water at 1.8m -> OFC at 1.0m).',
    coordinationStrategy: 'Single synchronized trench with combined 40mm DBM + 30mm BC full-width restoration.',
    verifiedOutcome: 'Reduced 3 separate road cutting events into 1, cutting traffic disruption by 58% and eliminating redundant asphalt reinstatement.',
    lessonsLearned: 'Compulsory depth hierarchy prevents damage to shallower utility lines while maintaining traffic viability.',
    source: 'NMC Executive Engineering Coordination Dossier 2026',
    sourceDate: '2026-03-12',
    confidence: 0.96,
  },
  {
    caseId: 'CASE-NSK-TRIMBAK-2025',
    location: 'Trimbak Road Pilgrim Corridor (CBS to Satpur)',
    authority: 'PWD Nashik Division',
    problem: 'Gas pipeline proposed 45 days after full bitumen resurfacing under Simhastha Priority Phase-1.',
    projectsInvolved: ['City Gas Distribution Steel Mains', 'PWD Arterial Resurfacing'],
    roadType: 'Heavy Industrial / State Highway Transit Corridor',
    utilities: ['City Gas', 'Road Pavement'],
    conflictType: '3-Year Road Protection Moratorium Clash',
    actionTaken: 'Rejected open-trench excavation. Mandated Horizontal Directional Drilling (HDD / Trenchless micro-tunneling) along road utility duct.',
    coordinationStrategy: 'Zero surface road-cutting condition with mandatory GPR utility survey.',
    verifiedOutcome: 'Pavement integrity preserved 100%, zero pothole formation in subsequent monsoon.',
    lessonsLearned: 'Strict moratorium enforcement with trenchless alternatives protects public capital investments.',
    source: 'Maharashtra PWD Technical Review Committee',
    sourceDate: '2025-11-20',
    confidence: 0.94,
  }
];

// -------------------------------------------------------------
// 12. DETERMINISTIC MUNICIPAL RULE ENGINE DEFINITIONS
// -------------------------------------------------------------
export const MUNICIPAL_RULE_LIBRARY = [
  {
    ruleId: 'RULE-01-ROAD-PROTECTION',
    ruleName: 'RECENT_RESTORATION_MORATORIUM_RULE',
    condition: 'Road resurfaced or restored within past 1,095 days (3 years).',
    action: 'Flag HIGH_REWORK_RISK. Mandate HDD / Trenchless or require Municipal Commissioner special sanction.',
  },
  {
    ruleId: 'RULE-02-TEMPORAL-LOOKAHEAD',
    ruleName: 'TEMPORAL_LOOKAHEAD_COORDINATION_RULE',
    condition: 'Two or more projects proposed on same corridor within 90-day lookahead window.',
    action: 'Cluster into unified Dig-Once opportunity. Generate Plan A (Single Synchronized Window) and Plan B (Sequential Staggered).',
  },
  {
    ruleId: 'RULE-03-MONSOON-EMBARGO',
    ruleName: 'MONSOON_EXCAVATION_RESTRICTION_RULE',
    condition: 'Proposed road-opening date falls between June 15 and September 15.',
    action: 'Block standard approval under Section 197 MMC Act unless marked EMERGENCY_WORK by Municipal Commissioner.',
  },
  {
    ruleId: 'RULE-04-UTILITY-DEPTH-HIERARCHY',
    ruleName: 'UTILITY_DEPTH_HIERARCHY_RULE',
    condition: 'Multiple utilities in same corridor cross-section.',
    action: 'Enforce execution sequence: Drainage (Deepest >2.5m) -> Water (1.5-2.0m) -> Gas (1.2-1.5m) -> Telecom/Power (0.8-1.2m) -> Unified Restoration.',
  },
  {
    ruleId: 'RULE-05-ROAD-OWNERSHIP-AUTHORITY',
    ruleName: 'RESPONSIBLE_ROAD_AUTHORITY_RESOLUTION_RULE',
    condition: 'Project submitted on any city road network.',
    action: 'Determine primary technical reviewer automatically from road ownership (PWD Executive Engineer vs NMC Executive Engineer).',
  }
];
