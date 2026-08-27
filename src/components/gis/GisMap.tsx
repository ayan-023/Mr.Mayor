/**
 * MR. MAYOR - Advanced Municipal Infrastructure Intelligence GIS Map
 * Built with Leaflet, Multi-Layer Vector Overlays, CTTP 2016 Traffic Baselines,
 * Sensitive Junction PCUs, Road History & Moratorium, AI Conflict Corridors,
 * Interactive What-If Simulator, Date Scrubber, and Measurement Tools.
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  Layers,
  Search,
  Eye,
  EyeOff,
  Crosshair,
  ShieldCheck,
  AlertTriangle,
  Route,
  Flame,
  Info,
  Maximize2,
  Minimize2,
  Navigation,
  PenTool,
  Check,
  X,
  Sparkles,
  Sliders,
  Calendar,
  Ruler,
  Printer,
  ChevronRight,
  TrendingDown,
  Building,
  Clock,
  ArrowRight,
  Activity,
  GitMerge,
  Filter,
  Download,
  Share2,
  FileCheck,
  Compass,
} from 'lucide-react';
import { Road, Project, InfrastructureAsset, LatLng } from '../../types';
import { useAuth } from '../../context/AuthContext';

export interface SensitiveJunction {
  id: string;
  name: string;
  lat: number;
  lng: number;
  pcu16h: number;
  peakHour: string;
  sensitivity: 'VERY_HIGH' | 'HIGH' | 'MODERATE';
  corridor: string;
  sourceYear: number;
}

export const NASHIK_SENSITIVE_JUNCTIONS: SensitiveJunction[] = [
  {
    id: 'JNC-01',
    name: 'Canada Corner Junction',
    lat: 20.0035,
    lng: 73.7745,
    pcu16h: 32802,
    peakHour: '17:45 – 18:45',
    sensitivity: 'HIGH',
    corridor: 'Gangapur Road / College Road',
    sourceYear: 2016,
  },
  {
    id: 'JNC-02',
    name: 'Shalimar Chowk',
    lat: 19.9975,
    lng: 73.7898,
    pcu16h: 64563,
    peakHour: '18:00 – 19:00',
    sensitivity: 'VERY_HIGH',
    corridor: 'Main City Central Arterial',
    sourceYear: 2016,
  },
  {
    id: 'JNC-03',
    name: 'Sarda Circle',
    lat: 19.992,
    lng: 73.794,
    pcu16h: 58437,
    peakHour: '09:45 – 10:45',
    sensitivity: 'HIGH',
    corridor: 'Nashik-Pune Road Entry',
    sourceYear: 2016,
  },
  {
    id: 'JNC-04',
    name: 'Ravivar Karanja',
    lat: 20.001,
    lng: 73.7915,
    pcu16h: 45871,
    peakHour: '10:45 – 11:45',
    sensitivity: 'HIGH',
    corridor: 'Heritage Commercial Core',
    sourceYear: 2016,
  },
  {
    id: 'JNC-05',
    name: 'Panchvati Karanja',
    lat: 20.0095,
    lng: 73.7985,
    pcu16h: 25299,
    peakHour: '18:15 – 19:15',
    sensitivity: 'MODERATE',
    corridor: 'Pilgrim Corridor / Godavari Ghat',
    sourceYear: 2016,
  },
  {
    id: 'JNC-06',
    name: 'PTA Kulkarni Chowk',
    lat: 19.994,
    lng: 73.778,
    pcu16h: 50552,
    peakHour: '18:15 – 19:15',
    sensitivity: 'HIGH',
    corridor: 'Sharanpur Road Junction',
    sourceYear: 2016,
  },
  {
    id: 'JNC-07',
    name: 'Jehan Circle (Gangapur Naka)',
    lat: 20.008,
    lng: 73.766,
    pcu16h: 41200,
    peakHour: '18:00 – 19:00',
    sensitivity: 'HIGH',
    corridor: 'Gangapur Road Outer Sector',
    sourceYear: 2016,
  },
  {
    id: 'JNC-08',
    name: 'Trimurti Chowk',
    lat: 19.972,
    lng: 73.758,
    pcu16h: 48900,
    peakHour: '18:30 – 19:30',
    sensitivity: 'HIGH',
    corridor: 'Kamathwade Link Road (V/C 0.93)',
    sourceYear: 2016,
  },
];

interface GisMapProps {
  roads: Road[];
  projects: Project[];
  assets: InfrastructureAsset[];
  onSelectRoad?: (road: Road) => void;
  onSelectProject?: (project: Project) => void;
  onNavigateToTab?: (tabId: string) => void;
  onDrawComplete?: (coordinates: LatLng[]) => void;
  isDrawingMode?: boolean;
  onToggleDrawingMode?: (enabled: boolean) => void;
  heightClass?: string;
}

export const GisMap: React.FC<GisMapProps> = ({
  roads,
  projects,
  assets,
  onSelectRoad,
  onSelectProject,
  onNavigateToTab,
  onDrawComplete,
  isDrawingMode = false,
  onToggleDrawingMode,
  heightClass = 'h-[calc(100vh-14rem)] min-h-[640px]',
}) => {
  const { currentUser } = useAuth();
  const canAccessAIAnalysis =
    currentUser &&
    ['COMMISSIONER', 'NODAL_OFFICER', 'ADMIN', 'DEPT_HEAD', 'EXECUTIVE_ENGINEER'].includes(currentUser.role);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<{ [key: string]: L.LayerGroup }>({});
  const drawLayerRef = useRef<L.Polyline | null>(null);
  const drawnPointsRef = useRef<LatLng[]>([]);

  // Basemap style: 'osm' | 'satellite'
  const [baseMapStyle, setBaseMapStyle] = useState<'osm' | 'satellite'>('osm');
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);

  // Left Panel & Tool Modals
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(true);
  const [isAnalysisMode, setIsAnalysisMode] = useState(false);
  const [isTimelineSliderOpen, setIsTimelineSliderOpen] = useState(false);
  const [timelineDate, setTimelineDate] = useState('2025-10-15');
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measuredDistanceMeters, setMeasuredDistanceMeters] = useState<number | null>(null);
  const measurePointsRef = useRef<L.LatLng[]>([]);

  // Layer Toggles
  const [showRoads, setShowRoads] = useState(true);
  const [showUtilities, setShowUtilities] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showProtectedRoads, setShowProtectedRoads] = useState(true);
  const [showTrafficSensitivities, setShowTrafficSensitivities] = useState(true);
  const [showJunctions, setShowJunctions] = useState(true);
  const [showConflicts, setShowConflicts] = useState(true);
  const [showCoordinationCorridors, setShowCoordinationCorridors] = useState(true);

  // Search & Selection State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedEntityInfo, setSelectedEntityInfo] = useState<{
    type: 'ROAD' | 'PROJECT' | 'JUNCTION' | 'CONFLICT' | 'COORDINATION_CORRIDOR';
    data: any;
  } | null>(null);

  // Filtered Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    const matchedRoads = roads
      .filter((r) => r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q))
      .slice(0, 3)
      .map((r) => ({ type: 'ROAD' as const, label: r.name, sub: `${r.category} • ${r.lanes} Lanes`, data: r }));

    const matchedProjects = projects
      .filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.department.toLowerCase().includes(q))
      .slice(0, 4)
      .map((p) => ({ type: 'PROJECT' as const, label: p.name, sub: `${p.code} • ${p.department}`, data: p }));

    const matchedJunctions = NASHIK_SENSITIVE_JUNCTIONS
      .filter((j) => j.name.toLowerCase().includes(q) || j.corridor.toLowerCase().includes(q))
      .slice(0, 3)
      .map((j) => ({ type: 'JUNCTION' as const, label: j.name, sub: `${j.pcu16h.toLocaleString()} PCU • Peak ${j.peakHour}`, data: j }));

    return [...matchedRoads, ...matchedProjects, ...matchedJunctions];
  }, [searchQuery, roads, projects]);

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered around Nashik Municipal core (Canada Corner / Shalimar area)
    const map = L.map(mapContainerRef.current, {
      center: [20.0025, 73.7780],
      zoom: 14,
      zoomControl: false,
      preferCanvas: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // High quality OpenStreetMap tile server (100% free, zero watermark)
    const tileUrl =
      baseMapStyle === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors, Esri',
      maxZoom: 19,
      crossOrigin: true,
    }).addTo(map);

    baseTileLayerRef.current = tileLayer;

    // Layer groups for precise spatial control
    const roadsGroup = L.layerGroup().addTo(map);
    const utilitiesGroup = L.layerGroup().addTo(map);
    const projectsGroup = L.layerGroup().addTo(map);
    const protectedGroup = L.layerGroup().addTo(map);
    const trafficGroup = L.layerGroup().addTo(map);
    const junctionsGroup = L.layerGroup().addTo(map);
    const conflictsGroup = L.layerGroup().addTo(map);
    const coordinationGroup = L.layerGroup().addTo(map);
    const drawGroup = L.layerGroup().addTo(map);
    const measureGroup = L.layerGroup().addTo(map);

    layersGroupRef.current = {
      roads: roadsGroup,
      utilities: utilitiesGroup,
      projects: projectsGroup,
      protected: protectedGroup,
      traffic: trafficGroup,
      junctions: junctionsGroup,
      conflicts: conflictsGroup,
      coordination: coordinationGroup,
      draw: drawGroup,
      measure: measureGroup,
    };

    mapInstanceRef.current = map;

    // Smooth resize observer for responsive map canvas
    let resizeTimer: number;
    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({ pan: false });
        }
      }, 100);
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      window.clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Tiles (Standard vs Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }

    const tileUrl =
      baseMapStyle === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const newTile = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors, Esri',
      maxZoom: 19,
      crossOrigin: true,
    }).addTo(map);

    baseTileLayerRef.current = newTile;
  }, [baseMapStyle]);

  // Handle Measurement Interactions
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMeasureClick = (e: L.LeafletMouseEvent) => {
      if (!isMeasuring) return;
      const pt = e.latlng;
      measurePointsRef.current.push(pt);

      const mg = layersGroupRef.current.measure;
      if (mg) {
        mg.clearLayers();

        measurePointsRef.current.forEach((p) => {
          L.circleMarker([p.lat, p.lng], {
            radius: 5,
            color: '#4f46e5',
            fillColor: '#818cf8',
            fillOpacity: 1,
            weight: 2,
          }).addTo(mg);
        });

        if (measurePointsRef.current.length > 1) {
          let totalDist = 0;
          for (let i = 0; i < measurePointsRef.current.length - 1; i++) {
            totalDist += measurePointsRef.current[i].distanceTo(measurePointsRef.current[i + 1]);
          }
          setMeasuredDistanceMeters(totalDist);

          L.polyline(measurePointsRef.current, {
            color: '#4f46e5',
            weight: 4,
            dashArray: '6, 6',
          })
            .addTo(mg)
            .bindTooltip(`Total Distance: ${(totalDist / 1000).toFixed(2)} km (${Math.round(totalDist)} m)`, {
              permanent: true,
              direction: 'top',
            });
        }
      }
    };

    map.on('click', handleMeasureClick);
    return () => {
      map.off('click', handleMeasureClick);
    };
  }, [isMeasuring]);

  // Handle Drawing Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleDrawClick = (e: L.LeafletMouseEvent) => {
      if (!isDrawingMode) return;
      const newPt: LatLng = { lat: e.latlng.lat, lng: e.latlng.lng };
      drawnPointsRef.current = [...drawnPointsRef.current, newPt];

      const dg = layersGroupRef.current.draw;
      if (dg) {
        dg.clearLayers();

        drawnPointsRef.current.forEach((pt) => {
          L.circleMarker([pt.lat, pt.lng], {
            radius: 6,
            color: '#2563eb',
            fillColor: '#60a5fa',
            fillOpacity: 1,
            weight: 2,
          }).addTo(dg);
        });

        if (drawnPointsRef.current.length > 1) {
          const latlngs = drawnPointsRef.current.map((p) => [p.lat, p.lng] as [number, number]);
          L.polyline(latlngs, {
            color: '#2563eb',
            weight: 5,
            dashArray: '8, 8',
          }).addTo(dg);
        }
      }
    };

    map.on('click', handleDrawClick);
    return () => {
      map.off('click', handleDrawClick);
    };
  }, [isDrawingMode]);

  // Render Core Map Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersGroupRef.current.roads) return;

    // 1. Road Hierarchy Layer
    const roadsGroup = layersGroupRef.current.roads;
    roadsGroup.clearLayers();
    if (showRoads && !isAnalysisMode) {
      roads.forEach((road) => {
        if (!road.geometry || road.geometry.length < 2) return;
        const latlngs = road.geometry.map((p) => [p.lat, p.lng] as [number, number]);

        const isArterial =
          road.category === 'Major Arterial' ||
          road.category === 'State Highway' ||
          road.category === 'National Highway';

        const color = isArterial ? '#1e293b' : '#64748b';
        const weight = isArterial ? 7 : 4;

        const poly = L.polyline(latlngs, {
          color,
          weight,
          opacity: 0.75,
        }).addTo(roadsGroup);

        poly.on('click', () => {
          setSelectedEntityInfo({ type: 'ROAD', data: road });
          if (onSelectRoad) onSelectRoad(road);
        });

        poly.bindTooltip(
          `<div class="p-1 text-xs"><div class="font-bold text-slate-900">${road.name}</div><div class="text-[10px] text-slate-600">${road.category} • ${road.lanes} Lanes (Width: ${road.widthMeters}m)</div></div>`,
          { sticky: true }
        );
      });
    }

    // 2. Underground Utilities Layer
    const utilitiesGroup = layersGroupRef.current.utilities;
    utilitiesGroup.clearLayers();
    if (showUtilities && !isAnalysisMode) {
      assets.forEach((asset) => {
        if (!asset.geometry || asset.geometry.length < 2) return;
        const latlngs = asset.geometry.map((p) => [p.lat, p.lng] as [number, number]);
        let color = '#0284c7'; // Water Blue
        let dashArray = '4, 4';
        if (asset.assetType === 'Stormwater Drainage') {
          color = '#059669'; // Emerald
          dashArray = '6, 6';
        } else if (asset.assetType === 'Electric 33kV/11kV') {
          color = '#eab308'; // Electric Yellow
          dashArray = '2, 6';
        } else if (asset.assetType === 'Telecom OFC Duct') {
          color = '#a855f7'; // Purple
          dashArray = '8, 4';
        } else if (asset.assetType === 'PNG Gas Pipeline') {
          color = '#f97316'; // Orange Gas
          dashArray = '5, 5';
        }

        const line = L.polyline(latlngs, {
          color,
          weight: 3.5,
          dashArray,
          opacity: 0.85,
        }).addTo(utilitiesGroup);

        line.bindTooltip(
          `<div class="p-1 text-xs"><div class="font-bold text-slate-900">${asset.assetType}</div><div class="text-[10px] text-slate-700">${asset.capacityOrDiameter} (Depth: ${asset.depthMeters}m)</div><div class="text-[10px] text-blue-700">Dept: ${asset.ownerDepartment}</div></div>`,
          { sticky: true }
        );
      });
    }

    // 3. Projects Layer (Timeline-filtered if active)
    const projectsGroup = layersGroupRef.current.projects;
    projectsGroup.clearLayers();
    if (showProjects) {
      projects.forEach((proj) => {
        if (!proj.geometry || proj.geometry.length < 2) return;

        // Timeline Filter Check
        if (isTimelineSliderOpen) {
          const tDate = new Date(timelineDate).getTime();
          const pStart = new Date(proj.startDate).getTime();
          const pEnd = new Date(proj.endDate).getTime();
          if (tDate < pStart || tDate > pEnd) {
            return;
          }
        }

        const latlngs = proj.geometry.map((p) => [p.lat, p.lng] as [number, number]);

        let color = '#2563eb'; // Planned Blue
        let weight = 6;
        let opacity = 0.9;

        if (proj.status === 'IN_PROGRESS') {
          color = '#ef4444'; // Active Dig Red
          weight = 7;
        } else if (proj.status === 'CONFLICT_DETECTED') {
          color = '#f59e0b'; // Conflict Amber
          weight = 6.5;
        } else if (proj.status === 'COMPLETED') {
          color = '#10b981'; // Completed Green
          weight = 5;
        }

        const poly = L.polyline(latlngs, {
          color,
          weight,
          opacity,
        }).addTo(projectsGroup);

        // Marker at Start Point
        const start = proj.geometry[0];
        L.circleMarker([start.lat, start.lng], {
          radius: 5,
          color: '#ffffff',
          fillColor: color,
          fillOpacity: 1,
          weight: 2,
        }).addTo(projectsGroup);

        poly.on('click', () => {
          setSelectedEntityInfo({ type: 'PROJECT', data: proj });
          if (onSelectProject) onSelectProject(proj);
        });

        poly.bindTooltip(
          `<div class="p-1 text-xs">
             <div class="font-bold text-slate-900">${proj.name}</div>
             <div class="text-[10px] text-slate-700 font-semibold">${proj.department} • ₹${(proj.estimatedCostINR / 100000).toFixed(1)} Lakhs</div>
             <div class="text-[10px] font-mono ${
               proj.status === 'CONFLICT_DETECTED' ? 'text-amber-700 font-bold' : 'text-slate-600'
             }">Status: ${proj.status} • ${proj.startDate} to ${proj.endDate}</div>
           </div>`,
          { sticky: true }
        );
      });
    }

    // 4. Protected Roads ("Do Not Dig" / Moratorium) Layer
    const protectedGroup = layersGroupRef.current.protected;
    protectedGroup.clearLayers();
    if (showProtectedRoads) {
      roads
        .filter((r) => r.protectionStatus === 'PROTECTED')
        .forEach((r) => {
          const latlngs = r.geometry.map((p) => [p.lat, p.lng] as [number, number]);
          L.polyline(latlngs, {
            color: '#10b981',
            weight: 9,
            opacity: 0.35,
          }).addTo(protectedGroup);

          const mid = r.geometry[Math.floor(r.geometry.length / 2)];
          if (mid) {
            L.circleMarker([mid.lat, mid.lng], {
              radius: 8,
              color: '#047857',
              fillColor: '#10b981',
              fillOpacity: 1,
              weight: 2,
            })
              .addTo(protectedGroup)
              .bindTooltip(
                `<div class="p-1 text-xs"><div class="font-bold text-emerald-900">Protected Road (₹135 Cr Moratorium Lock)</div>
                 <div class="text-[10px] text-slate-700">Resurfaced: ${r.lastResurfacedDate} • Protected until: ${r.protectionExpiryDate}</div></div>`,
                { permanent: false }
              );
          }
        });
    }

    // 5. Traffic Pressure & CTTP 2016 Baseline Layer
    const trafficGroup = layersGroupRef.current.traffic;
    trafficGroup.clearLayers();
    if (showTrafficSensitivities) {
      roads.forEach((r) => {
        const isGangapur = r.name.toLowerCase().includes('gangapur');
        const isTrimbak = r.name.toLowerCase().includes('trimbak');
        const isPanchvati = r.name.toLowerCase().includes('panchvati');

        let vc = '0.65';
        let vcColor = '#64748b';
        if (isGangapur) {
          vc = '0.88 (High Pressure)';
          vcColor = '#ea580c';
        } else if (isTrimbak) {
          vc = '0.76 (High Pressure)';
          vcColor = '#d97706';
        } else if (isPanchvati) {
          vc = '0.83 (Very High)';
          vcColor = '#dc2626';
        }

        const mid = r.geometry[Math.floor(r.geometry.length / 2)];
        if (mid && (isGangapur || isTrimbak || isPanchvati)) {
          L.circleMarker([mid.lat, mid.lng], {
            radius: 11,
            color: vcColor,
            fillColor: vcColor,
            fillOpacity: 0.25,
            weight: 2,
          })
            .addTo(trafficGroup)
            .bindTooltip(
              `<div class="p-1 text-xs"><div class="font-bold text-slate-900">CTTP 2016 Baseline: ${r.name}</div>
               <div class="text-[10px] text-slate-700 font-mono">Historical V/C: ${vc}</div>
               <div class="text-[9px] font-bold text-slate-500 uppercase">Provenance: Verified Historical NMC Study</div></div>`,
              { permanent: false }
            );
        }
      });
    }

    // 6. Sensitive Junctions Layer
    const junctionsGroup = layersGroupRef.current.junctions;
    junctionsGroup.clearLayers();
    if (showJunctions) {
      NASHIK_SENSITIVE_JUNCTIONS.forEach((jnc) => {
        const markerColor = jnc.sensitivity === 'VERY_HIGH' ? '#dc2626' : jnc.sensitivity === 'HIGH' ? '#ea580c' : '#2563eb';

        const jMarker = L.circleMarker([jnc.lat, jnc.lng], {
          radius: 9,
          color: '#ffffff',
          fillColor: markerColor,
          fillOpacity: 1,
          weight: 2.5,
        }).addTo(junctionsGroup);

        jMarker.on('click', () => {
          setSelectedEntityInfo({ type: 'JUNCTION', data: jnc });
        });

        jMarker.bindTooltip(
          `<div class="p-1.5 text-xs space-y-0.5">
             <div class="font-bold text-slate-900 flex items-center gap-1.5">
               <span class="w-2 h-2 rounded-full" style="background:${markerColor}"></span>
               ${jnc.name}
             </div>
             <div class="text-[11px] text-slate-700 font-mono font-bold">${jnc.pcu16h.toLocaleString()} PCU / 16h</div>
             <div class="text-[10px] text-rose-700 font-semibold">Peak Window: ${jnc.peakHour}</div>
             <div class="text-[9px] text-slate-500 italic">Source: NMC CTTP ${jnc.sourceYear} Baseline</div>
           </div>`,
          { sticky: true }
        );
      });
    }

    // 7. Active AI Conflicts Layer (Animated Clashing Polyline on Gangapur Road)
    const conflictsGroup = layersGroupRef.current.conflicts;
    conflictsGroup.clearLayers();
    if (showConflicts) {
      const gangapurRoad = roads.find((r) => r.name.toLowerCase().includes('gangapur'));
      if (gangapurRoad && gangapurRoad.geometry.length > 2) {
        const latlngs = gangapurRoad.geometry.map((p) => [p.lat, p.lng] as [number, number]);

        const conflictPoly = L.polyline(latlngs, {
          color: '#ef4444',
          weight: 9,
          dashArray: '8, 8',
          opacity: 0.9,
        }).addTo(conflictsGroup);

        conflictPoly.on('click', () => {
          setSelectedEntityInfo({
            type: 'CONFLICT',
            data: {
              corridor: 'Gangapur Road Arterial Corridor',
              clashPair: 'Water DI Feeder (1.8m) / City Gas PNG (1.4m) / Drainage Culvert (2.6m)',
              severity: 'CRITICAL (94/100)',
              spatialOverlap: '82% (1,200m)',
              temporalOverlap: '45 Days Collision',
              analysisId: 'ANA-2026-NSKGAS003',
            },
          });
        });

        conflictPoly.bindTooltip(
          `<div class="p-1.5 text-xs space-y-1">
             <div class="font-bold text-red-900 flex items-center gap-1.5">
               <span class="px-1.5 py-0.2 rounded bg-red-600 text-white font-bold text-[9px]">CLASH DETECTED</span>
               Gangapur Road Corridor
             </div>
             <div class="text-[11px] text-slate-800">3 Agencies Requesting Trenching within 60 Days</div>
             <div class="text-[10px] text-red-700 font-bold">Risk: ₹92.26L Pavement Loss • Canada Corner Gridlock</div>
             <div class="text-[10px] text-blue-700 font-bold underline">Click to view AI Analysis →</div>
           </div>`,
          { sticky: true }
        );
      }
    }

    // 8. AI Coordination Opportunity Layer (Plan A Corridor Overlay)
    const coordinationGroup = layersGroupRef.current.coordination;
    coordinationGroup.clearLayers();
    if (showCoordinationCorridors) {
      const gangapurRoad = roads.find((r) => r.name.toLowerCase().includes('gangapur'));
      if (gangapurRoad && gangapurRoad.geometry.length > 2) {
        const latlngs = gangapurRoad.geometry.map((p) => [p.lat, p.lng] as [number, number]);

        const coordPoly = L.polyline(latlngs, {
          color: '#10b981',
          weight: 12,
          opacity: 0.35,
        }).addTo(coordinationGroup);

        coordPoly.on('click', () => {
          setSelectedEntityInfo({
            type: 'COORDINATION_CORRIDOR',
            data: {
              corridor: 'Gangapur Road (CBS to Someshwar)',
              planName: 'Plan A: Single 24-Day Joint Digging Window',
              avoidedCuts: '7 Cuts Eliminated',
              avoidedRestorations: '7 Patches Replaced by 1 Unified Seal',
              savingsINR: '₹92.26 Lakhs Net Municipal Savings',
              depthSequence: 'Drainage (2.6m) -> Water (1.8m) -> Gas (1.4m) -> Telecom (0.9m) -> PWD Resurfacing',
              analysisId: 'ANA-2026-NSKGAS003',
            },
          });
        });
      }
    }
  }, [
    roads,
    projects,
    assets,
    showRoads,
    showUtilities,
    showProjects,
    showProtectedRoads,
    showTrafficSensitivities,
    showJunctions,
    showConflicts,
    showCoordinationCorridors,
    isAnalysisMode,
    isTimelineSliderOpen,
    timelineDate,
  ]);

  // Zoom to Searched Location
  const handleSearchSelect = (item: any) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (item.type === 'ROAD' && item.data.geometry?.length > 0) {
      const bounds = L.latLngBounds(item.data.geometry.map((p: LatLng) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [60, 60] });
      setSelectedEntityInfo({ type: 'ROAD', data: item.data });
    } else if (item.type === 'PROJECT' && item.data.geometry?.length > 0) {
      const bounds = L.latLngBounds(item.data.geometry.map((p: LatLng) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [60, 60] });
      setSelectedEntityInfo({ type: 'PROJECT', data: item.data });
    } else if (item.type === 'JUNCTION') {
      map.setView([item.data.lat, item.data.lng], 16);
      setSelectedEntityInfo({ type: 'JUNCTION', data: item.data });
    }

    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleResetMeasure = () => {
    measurePointsRef.current = [];
    setMeasuredDistanceMeters(null);
    if (layersGroupRef.current.measure) {
      layersGroupRef.current.measure.clearLayers();
    }
    setIsMeasuring(false);
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 ${heightClass}`}>
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* 1. TOP HEADER & SEARCH TOOLBAR (OVERLAY WITH HIGH Z-INDEX) */}
      <div
        className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none"
        style={{ zIndex: 1100 }}
      >
        {/* Left Search Bar with Dropdown Auto-suggest */}
        <div className="pointer-events-auto relative w-full max-w-md">
          <div className="flex items-center bg-white/95 backdrop-blur-md border border-slate-300 rounded-2xl shadow-xl px-3.5 py-2.5">
            <Search className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
            <input
              type="text"
              placeholder="Search road, project, junction (e.g. Gangapur)..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-900 placeholder-slate-400 focus:outline-none w-full font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1"
              ><X className="w-4 h-4" /></button>
            )}
          </div>

          {/* Categorized Search Results Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white border border-slate-300 rounded-2xl shadow-2xl p-2 space-y-1 text-xs z-50 max-h-72 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSearchSelect(item)}
                  className="p-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        {item.type}
                      </span>
                      {item.label}
                    </div>
                    <div className="text-[11px] text-slate-500">{item.sub}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Top Action Toolbar (Visible, High Contrast, Clickable) */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          {/* Layers Toggle */}
          <button
            onClick={() => setIsLayersPanelOpen((prev) => !prev)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer border ${
              isLayersPanelOpen
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Layers</span>
          </button>

          {/* Analysis Mode Toggle */}
          <button
            onClick={() => setIsAnalysisMode((prev) => !prev)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer border ${
              isAnalysisMode
                ? 'bg-indigo-600 text-white border-indigo-500 animate-pulse'
                : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isAnalysisMode ? 'Analysis Mode Active' : 'Analysis Mode'}</span>
          </button>

          {/* Timeline Date Scrubber Toggle */}
          <button
            onClick={() => setIsTimelineSliderOpen((prev) => !prev)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer border ${
              isTimelineSliderOpen
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-300'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Timeline</span>
          </button>

          {/* Ruler Measurement Tool */}
          <button
            onClick={() => {
              if (isMeasuring) {
                handleResetMeasure();
              } else {
                setIsMeasuring(true);
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer border ${
              isMeasuring
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-300'
            }`}
          >
            <Ruler className="w-3.5 h-3.5 text-amber-600" />
            <span>{isMeasuring ? 'Measuring...' : 'Measure'}</span>
          </button>

          {/* Direct Jump to AI Analysis Center (Authority Only) */}
          {onNavigateToTab && canAccessAIAnalysis && (
            <button
              onClick={() => onNavigateToTab('ai-analysis')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer border border-blue-500"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>AI Analysis Center →</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. TIMELINE DATE SCRUBBER BAR */}
      {isTimelineSliderOpen && (
        <div
          className="absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-md border border-slate-300 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4 text-xs"
          style={{ zIndex: 1100 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block text-xs">Date-Based Excavation Visibility</span>
              <span className="text-[11px] text-slate-500">
                Filtering projects and road openings active on: <strong className="text-blue-700 font-mono">{timelineDate}</strong>
              </span>
            </div>
          </div>

          <div className="flex-1 max-w-md flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-400">Oct 01</span>
            <input
              type="range"
              min="1"
              max="60"
              defaultValue="15"
              onChange={(e) => {
                const day = parseInt(e.target.value);
                const date = new Date(2025, 9, day);
                setTimelineDate(date.toISOString().split('T')[0]);
              }}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <span className="text-[10px] font-mono text-slate-400">Nov 30</span>
          </div>

          <button
            onClick={() => setIsTimelineSliderOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 font-bold"
          ><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* 3. MEASUREMENT PROMPT BANNER */}
      {isMeasuring && (
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-2xl px-5 py-2.5 shadow-2xl text-xs flex items-center gap-3 border border-slate-700"
          style={{ zIndex: 1100 }}
        >
          <Ruler className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>Click points along road corridor to measure distance.</span>
          {measuredDistanceMeters !== null && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-400/30">
              {(measuredDistanceMeters / 1000).toFixed(2)} km
            </span>
          )}
          <button
            onClick={handleResetMeasure}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold"
          >
            Done / Clear
          </button>
        </div>
      )}

      {/* 4. LEFT COLLAPSIBLE LAYER CONTROL PALETTE */}
      {isLayersPanelOpen && (
        <div
          className="absolute top-20 left-4 bg-white/95 backdrop-blur-md border border-slate-300 rounded-3xl p-4 shadow-2xl text-xs space-y-3.5 w-64 max-h-[calc(100%-7rem)] overflow-y-auto animate-fade-in"
          style={{ zIndex: 1050 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Municipal GIS Layers</span>
            </div>
            <button
              onClick={() => setIsLayersPanelOpen(false)}
              className="text-slate-400 hover:text-slate-700 font-bold text-xs"
            ><X className="w-4 h-4" /></button>
          </div>

          {/* Basemap Switch */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Basemap Style</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setBaseMapStyle('osm')}
                className={`p-1.5 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                  baseMapStyle === 'osm'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                OpenStreetMap
              </button>
              <button
                onClick={() => setBaseMapStyle('satellite')}
                className={`p-1.5 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                  baseMapStyle === 'satellite'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Esri Satellite
              </button>
            </div>
          </div>

          {/* Infrastructure & Utilities */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Infrastructure Networks</span>

            <label className="flex items-center justify-between text-slate-700 hover:text-slate-900 cursor-pointer select-none">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span>Road Hierarchy</span>
              </span>
              <input
                type="checkbox"
                checked={showRoads}
                onChange={(e) => setShowRoads(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between text-slate-700 hover:text-slate-900 cursor-pointer select-none">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                <span>Underground Utilities</span>
              </span>
              <input
                type="checkbox"
                checked={showUtilities}
                onChange={(e) => setShowUtilities(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between text-slate-700 hover:text-slate-900 cursor-pointer select-none">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>Active Excavations</span>
              </span>
              <input
                type="checkbox"
                checked={showProjects}
                onChange={(e) => setShowProjects(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>

          {/* Traffic & Sensitive Junctions */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Traffic & Junctions</span>

            <label className="flex items-center justify-between text-slate-700 hover:text-slate-900 cursor-pointer select-none">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                <span>CTTP 2016 V/C Baseline</span>
              </span>
              <input
                type="checkbox"
                checked={showTrafficSensitivities}
                onChange={(e) => setShowTrafficSensitivities(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between text-slate-700 hover:text-slate-900 cursor-pointer select-none">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span>Sensitive Junctions ({NASHIK_SENSITIVE_JUNCTIONS.length})</span>
              </span>
              <input
                type="checkbox"
                checked={showJunctions}
                onChange={(e) => setShowJunctions(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>

          {/* AI Intelligence & Protection */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">AI Intelligence</span>

            <label className="flex items-center justify-between text-slate-700 hover:text-slate-900 cursor-pointer select-none">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span>Utility Clashes</span>
              </span>
              <input
                type="checkbox"
                checked={showConflicts}
                onChange={(e) => setShowConflicts(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between text-slate-700 hover:text-slate-900 cursor-pointer select-none">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>Coordination Opportunities</span>
              </span>
              <input
                type="checkbox"
                checked={showCoordinationCorridors}
                onChange={(e) => setShowCoordinationCorridors(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between text-slate-700 hover:text-slate-900 cursor-pointer select-none">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Protected Roads ("Do Not Dig")</span>
              </span>
              <input
                type="checkbox"
                checked={showProtectedRoads}
                onChange={(e) => setShowProtectedRoads(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      )}

      {/* 5. RIGHT SLIDE-OVER DETAIL PANEL */}
      {selectedEntityInfo && (
        <div
          className="absolute top-20 right-4 bg-white/95 backdrop-blur-md border border-slate-300 rounded-3xl p-5 shadow-2xl w-full max-w-sm text-xs space-y-4 max-h-[calc(100%-7rem)] overflow-y-auto animate-fade-in"
          style={{ zIndex: 1050 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 uppercase tracking-wider border border-slate-200">
                {selectedEntityInfo.type.replace('_', ' ')}
              </span>
              <h3 className="font-bold text-slate-900 text-sm mt-1">
                {selectedEntityInfo.type === 'JUNCTION'
                  ? selectedEntityInfo.data.name
                  : selectedEntityInfo.type === 'CONFLICT'
                  ? selectedEntityInfo.data.corridor
                  : selectedEntityInfo.type === 'COORDINATION_CORRIDOR'
                  ? selectedEntityInfo.data.corridor
                  : selectedEntityInfo.data.name}
              </h3>
            </div>
            <button
              onClick={() => setSelectedEntityInfo(null)}
              className="text-slate-400 hover:text-slate-700 p-1 font-bold"
            ><X className="w-4 h-4" /></button>
          </div>

          {/* ROAD ENTITY DETAILS */}
          {selectedEntityInfo.type === 'ROAD' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Road Class</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedEntityInfo.data.category}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Protection Status</span>
                  <div className="font-bold text-emerald-700 mt-0.5">{selectedEntityInfo.data.protectionStatus}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
                <span className="text-blue-900 font-bold text-[11px] block">CTTP 2016 Traffic Pressure:</span>
                <p className="text-slate-700 text-[11px]">
                  Historical V/C Baseline: <strong>{selectedEntityInfo.data.trafficClass === 'Very High' ? '0.88' : '0.74'}</strong>. Subject to mandatory traffic marshals and off-peak digging hours.
                </p>
              </div>

              {onNavigateToTab && canAccessAIAnalysis && (
                <button
                  onClick={() => onNavigateToTab('ai-analysis')}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze Corridor with AI →</span>
                </button>
              )}
            </div>
          )}

          {/* SENSITIVE JUNCTION DETAILS */}
          {selectedEntityInfo.type === 'JUNCTION' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                  Peak Traffic Load (CTTP 2016 Study)
                </span>
                <div className="text-xl font-bold font-mono text-amber-950">
                  {selectedEntityInfo.data.pcu16h.toLocaleString()} PCU / 16h
                </div>
                <div className="text-[11px] text-amber-800">
                  Daily Peak Congestion: <strong>{selectedEntityInfo.data.peakHour}</strong>
                </div>
              </div>

              <div className="space-y-1 text-slate-600 text-[11px]">
                <div><strong>Corridor: </strong> {selectedEntityInfo.data.corridor}</div>
                <div><strong>Sensitivity Rating: </strong> <span className="font-bold text-red-700">{selectedEntityInfo.data.sensitivity}</span></div>
                <div className="text-[10px] text-slate-400 italic">Data Source: Nashik CTTP {selectedEntityInfo.data.sourceYear} Baseline</div>
              </div>

              {onNavigateToTab && canAccessAIAnalysis && (
                <button
                  onClick={() => onNavigateToTab('ai-analysis')}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>View Junction Impact Analysis →</span>
                </button>
              )}
            </div>
          )}

          {/* CONFLICT DETAILS */}
          {selectedEntityInfo.type === 'CONFLICT' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-1">
                <div className="font-bold text-xs uppercase">{selectedEntityInfo.data.severity}</div>
                <p className="text-[11px] leading-relaxed">{selectedEntityInfo.data.clashPair}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Spatial Overlap</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedEntityInfo.data.spatialOverlap}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Temporal Collision</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedEntityInfo.data.temporalOverlap}</div>
                </div>
              </div>

              {onNavigateToTab && canAccessAIAnalysis && (
                <button
                  onClick={() => onNavigateToTab('ai-analysis')}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Full AI Analysis ({selectedEntityInfo.data.analysisId}) →</span>
                </button>
              )}
            </div>
          )}

          {/* COORDINATION CORRIDOR DETAILS */}
          {selectedEntityInfo.type === 'COORDINATION_CORRIDOR' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{selectedEntityInfo.data.planName}</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  Single synchronized joint trench with depth ordering:
                </p>
                <div className="text-[10px] font-mono text-emerald-900 bg-white/80 p-2 rounded-lg border border-emerald-200">
                  {selectedEntityInfo.data.depthSequence}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Avoided Excavations</span>
                  <div className="font-bold text-blue-700 mt-0.5">{selectedEntityInfo.data.avoidedCuts}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Taxpayer Savings</span>
                  <div className="font-bold text-emerald-700 mt-0.5">{selectedEntityInfo.data.savingsINR}</div>
                </div>
              </div>

              {onNavigateToTab && canAccessAIAnalysis && (
                <button
                  onClick={() => onNavigateToTab('ai-analysis')}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Coordination Dossier ({selectedEntityInfo.data.analysisId}) →</span>
                </button>
              )}
            </div>
          )}

          {/* PROJECT DETAILS */}
          {selectedEntityInfo.type === 'PROJECT' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Department</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedEntityInfo.data.department}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Estimated Cost</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    ₹{(selectedEntityInfo.data.estimatedCostINR / 100000).toFixed(1)} L
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Execution Window</span>
                <div className="font-bold text-slate-900 mt-0.5">
                  {selectedEntityInfo.data.startDate} to {selectedEntityInfo.data.endDate}
                </div>
              </div>

              {onNavigateToTab && canAccessAIAnalysis && (
                <button
                  onClick={() => onNavigateToTab('ai-analysis')}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Inspect AI Coordination Analysis →</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 6. BOTTOM DYNAMIC LEGEND & STATUS BAR */}
      <div
        className="absolute bottom-4 left-4 right-4 pointer-events-none flex flex-wrap items-end justify-between gap-3"
        style={{ zIndex: 1050 }}
      >
        {/* Dynamic Legend */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-300 rounded-2xl p-3 shadow-xl text-[11px] space-y-1.5 max-w-sm hidden sm:block">
          <div className="flex items-center justify-between font-bold text-slate-900 text-[10px] uppercase tracking-wider border-b border-slate-100 pb-1">
            <span>Dynamic GIS Legend</span>
            <span className="text-blue-600 font-mono text-[9px]">NMC CTTP 2016</span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-600 text-[10px]">
            {showRoads && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-slate-800 rounded" />
                <span>Arterial Roads</span>
              </div>
            )}
            {showUtilities && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-sky-600 rounded" />
                <span>Water Main (DI)</span>
              </div>
            )}
            {showUtilities && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-orange-600 rounded" />
                <span>PNG Gas Pipeline</span>
              </div>
            )}
            {showConflicts && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-red-600 rounded animate-pulse" />
                <span className="text-red-700 font-bold">Utility Clash</span>
              </div>
            )}
            {showCoordinationCorridors && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-emerald-600 rounded" />
                <span className="text-emerald-700 font-bold">Plan A Joint Dig</span>
              </div>
            )}
            {showJunctions && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span>Sensitive Junction</span>
              </div>
            )}
          </div>
        </div>

        {/* Provenance Badge */}
        <div className="pointer-events-auto bg-slate-900/90 text-white backdrop-blur-md border border-slate-800 rounded-xl px-3.5 py-1.5 shadow-lg text-[10px] flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>
            Data Provenance: <strong className="text-blue-300">HISTORICAL BASELINE (CTTP 2016)</strong> • Verified Multi-Agency GIS
          </span>
        </div>
      </div>
    </div>
  );
};
