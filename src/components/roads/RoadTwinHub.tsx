/**
 * MR. MAYOR - Road Registry & Digital Twin Hub (Editorial Aesthetic)
 * Displays road infrastructure profile, surfacing history, "Do Not Dig" protection embargoes,
 * underground utility density, and historical cuts with full manual creation support.
 */

import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import {
  Route,
  ShieldCheck,
  Layers,
  Search,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  HardHat,
} from 'lucide-react';
import { Road, InfrastructureAsset, Project, CitizenComplaint } from '../../types';
import { api } from '../../services/api';

interface RoadTwinHubProps {
  roads: Road[];
  onSelectRoadOnMap?: (road: Road) => void;
  onRefreshData?: () => void;
}

export const RoadTwinHub: React.FC<RoadTwinHubProps> = ({ roads, onSelectRoadOnMap, onRefreshData }) => {
  const [selectedRoadId, setSelectedRoadId] = useState<string>(roads[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);
  const [roadData, setRoadData] = useState<{
    road: Road;
    utilities: InfrastructureAsset[];
    activeProjects: Project[];
    upcomingProjects: Project[];
    historicalProjects: any[];
    complaints: CitizenComplaint[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isAddRoadOpen, setIsAddRoadOpen] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Road Form State
  const [newRoad, setNewRoad] = useState({
    name: '',
    code: '',
    ward: 'Ward 01',
    zone: 'East Zone',
    category: 'ARTERIAL' as const,
    surfaceType: 'BITUMINOUS_CONCRETE',
    lanes: 4,
    widthMeters: 18,
    lengthKm: 2.5,
    trafficClass: 'HIGH_DENSITY_COMMERCIAL' as const,
    protectionStatus: 'PROTECTED' as const,
    protectionExpiryDate: '2028-03-31',
    startIntersection: '',
    endIntersection: '',
  });

  // New Asset Form State
  const [newAsset, setNewAsset] = useState({
    assetType: 'OPTICAL_FIBER' as const,
    ownerDepartment: 'TELECOM_BBNL',
    depthMeters: 1.5,
    capacityOrDiameter: '48-Core High Speed Duct',
    condition: 'EXCELLENT' as const,
    installationYear: 2024,
  });

  useEffect(() => {
    if (!selectedRoadId && roads.length > 0) {
      setSelectedRoadId(roads[0].id);
    }
  }, [roads, selectedRoadId]);

  useEffect(() => {
    async function loadRoadDetails() {
      if (!selectedRoadId) {
        setRoadData(null);
        return;
      }
      setIsLoading(true);
      try {
        const res = await api.getRoadDetails(selectedRoadId);
        setRoadData(res);
      } catch (err) {
        console.error('Failed to load road details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRoadDetails();
  }, [selectedRoadId]);

  const filteredRoads = useMemo(() => {
    const sTerm = deferredSearch.trim().toLowerCase();
    if (!sTerm) return roads;
    return roads.filter((r) => {
      return (
        (r.name || '').toLowerCase().includes(sTerm) ||
        (r.code || '').toLowerCase().includes(sTerm) ||
        (r.ward || '').toLowerCase().includes(sTerm)
      );
    });
  }, [roads, deferredSearch]);

  const handleCreateRoad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoad.name.trim() || !newRoad.code.trim()) {
      alert('Please provide road name and corridor code.');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await api.createRoad(newRoad);
      setIsAddRoadOpen(false);
      if (onRefreshData) onRefreshData();
      if (created?.road?.id) {
        setSelectedRoadId(created.road.id);
      }
      setNewRoad({
        name: '',
        code: '',
        ward: 'Ward 01',
        zone: 'East Zone',
        category: 'ARTERIAL',
        surfaceType: 'BITUMINOUS_CONCRETE',
        lanes: 4,
        widthMeters: 18,
        lengthKm: 2.5,
        trafficClass: 'HIGH_DENSITY_COMMERCIAL',
        protectionStatus: 'PROTECTED',
        protectionExpiryDate: '2028-03-31',
        startIntersection: '',
        endIntersection: '',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to create road');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoadId) return;
    setIsSubmitting(true);
    try {
      await api.createAsset({
        ...newAsset,
        roadId: selectedRoadId,
      });
      setIsAddAssetOpen(false);
      // Reload road details
      const res = await api.getRoadDetails(selectedRoadId);
      setRoadData(res);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to register utility asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-2xl p-6 md:p-8 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8A8A8A] mb-1">
            CIVIL ARTERIAL CORRIDORS
          </div>
          <h1 className="text-xl md:text-2xl font-serif-editorial font-bold text-[#1A1A1A] flex items-center gap-2">
            Road Infrastructure Registry & Digital Twin
          </h1>
          <p className="text-xs text-[#5A5A5A] mt-1">
            Lifecycle tracking, "Do Not Dig" embargo protection, subsurface asset mapping, and excavation audit
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-[#F0EEEB] text-[#1A1A1A] border border-[#1A1A1A]/10 text-[10px] uppercase tracking-wider font-bold font-mono">
            {roads.length} Corridors
          </span>
          <button
            onClick={() => setIsAddRoadOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Register New Road
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Road Selector & Search */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search road or ward..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg pl-9 pr-3 py-2 text-xs text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>

          {roads.length === 0 ? (
            <div className="p-6 bg-[#FDFCFB] border border-dashed border-[#1A1A1A]/15 rounded-xl text-center space-y-3">
              <Route className="w-8 h-8 text-[#8A8A8A] mx-auto opacity-50" />
              <div className="text-xs font-bold text-[#1A1A1A]">No Roads Registered</div>
              <p className="text-[11px] text-[#737373]">
                Start building your city's digital twin by manually registering your first road corridor.
              </p>
              <button
                onClick={() => setIsAddRoadOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#1A1A1A] text-white text-xs font-medium cursor-pointer"
              >
                + Add Corridor
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredRoads.map((r) => {
                const isSelected = r.id === selectedRoadId;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRoadId(r.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-[#FFFFFF] border-[#1A1A1A] shadow-sm ring-1 ring-[#1A1A1A]'
                        : 'bg-[#FDFCFB] border-[#1A1A1A]/10 hover:bg-[#FFFFFF]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-[#737373] font-bold">{r.code}</span>
                        <h4 className="font-serif-editorial font-bold text-[#1A1A1A] text-sm mt-0.5">{r.name}</h4>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          r.protectionStatus === 'PROTECTED'
                            ? 'bg-[#EEF5F0] text-[#2E6B4F] border border-[#2E6B4F]/30'
                            : 'bg-[#F0EEEB] text-[#1A1A1A] border border-[#1A1A1A]/10'
                        }`}
                      >
                        {r.protectionStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#737373]">
                      <span>{r.category} • {r.lanes} Lanes</span>
                      <span>{r.lengthKm} km</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected Road Digital Twin Profile */}
        <div className="lg:col-span-2 space-y-6">
          {roadData ? (
            <div className="bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-2xl p-6 md:p-8 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1A1A1A]/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#737373] font-bold">{roadData.road.code}</span>
                    <span className="text-xs text-[#737373]">{roadData.road.ward} • Zone {roadData.road.zone}</span>
                  </div>
                  <h2 className="text-xl font-serif-editorial font-bold text-[#1A1A1A] mt-1">
                    {roadData.road.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {roadData.road.protectionStatus === 'PROTECTED' ? (
                    <div className="px-3 py-1.5 rounded-lg bg-[#EEF5F0] text-[#2E6B4F] border border-[#2E6B4F]/30 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#2E6B4F]" />
                      <span>DO NOT DIG (Protected until {roadData.road.protectionExpiryDate})</span>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-lg bg-[#F0EEEB] text-[#1A1A1A] border border-[#1A1A1A]/10 text-[10px] uppercase tracking-wider font-semibold">
                      Open for Permitted Works
                    </div>
                  )}
                </div>
              </div>

              {/* Road KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-[#FDFCFB] border border-[#1A1A1A]/10">
                  <span className="text-[9px] uppercase tracking-wider text-[#8A8A8A]">Total Length</span>
                  <div className="font-bold text-[#1A1A1A] mt-0.5">{roadData.road.lengthKm} km</div>
                </div>

                <div className="p-4 rounded-xl bg-[#FDFCFB] border border-[#1A1A1A]/10">
                  <span className="text-[9px] uppercase tracking-wider text-[#8A8A8A]">Right of Way (RoW)</span>
                  <div className="font-bold text-[#1A1A1A] mt-0.5">{roadData.road.widthMeters} meters</div>
                </div>

                <div className="p-4 rounded-xl bg-[#FDFCFB] border border-[#1A1A1A]/10">
                  <span className="text-[9px] uppercase tracking-wider text-[#8A8A8A]">Surface Type</span>
                  <div className="font-bold text-[#1A1A1A] mt-0.5">{roadData.road.surfaceType.replace(/_/g, ' ')}</div>
                </div>

                <div className="p-4 rounded-xl bg-[#FDFCFB] border border-[#1A1A1A]/10">
                  <span className="text-[9px] uppercase tracking-wider text-[#8A8A8A]">Traffic Sensitivity</span>
                  <div className="font-bold text-[#A35C28] mt-0.5">{roadData.road.trafficClass.replace(/_/g, ' ')}</div>
                </div>
              </div>

              {/* Subsurface Utilities Mapping */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#1A1A1A]" />
                    <h3 className="font-serif-editorial font-bold text-[#1A1A1A] text-sm">
                      Underground Utilities Embedded in Corridor ({roadData.utilities.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsAddAssetOpen(true)}
                    className="px-2.5 py-1 rounded bg-[#F0EEEB] hover:bg-[#E5E2DC] text-[#1A1A1A] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors border border-[#1A1A1A]/10"
                  >
                    <Plus className="w-3 h-3" /> Add Utility
                  </button>
                </div>

                {roadData.utilities.length === 0 ? (
                  <div className="p-5 bg-[#FDFCFB] rounded-xl border border-dashed border-[#1A1A1A]/15 text-center text-xs text-[#737373]">
                    No underground assets recorded on this road yet. Click "+ Add Utility" to log telecom, water, gas, or power conduits.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {roadData.utilities.map((util) => (
                      <div
                        key={util.id}
                        className="p-3.5 rounded-xl bg-[#FDFCFB] border border-[#1A1A1A]/10 flex items-start justify-between"
                      >
                        <div>
                          <div className="font-semibold text-[#1A1A1A]">{util.assetType.replace(/_/g, ' ')}</div>
                          <div className="text-[11px] text-[#737373] mt-0.5">
                            {util.capacityOrDiameter} (Depth: {util.depthMeters}m)
                          </div>
                          <div className="text-[10px] text-[#2B4C6F] mt-0.5 font-medium">{util.ownerDepartment.replace(/_/g, ' ')}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#F0EEEB] text-[#1A1A1A] uppercase tracking-wider border border-[#1A1A1A]/10">
                          {util.condition}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active & Planned Excavations */}
              <div className="space-y-3 pt-2">
                <h3 className="font-serif-editorial font-bold text-[#1A1A1A] text-sm">
                  Active & Planned Excavation Projects on this Corridor
                </h3>

                <div className="space-y-2">
                  {roadData.activeProjects.length === 0 && roadData.upcomingProjects.length === 0 ? (
                    <div className="py-6 text-center text-[#8A8A8A] text-xs">
                      No active or pending excavations registered on this road corridor.
                    </div>
                  ) : (
                    [...roadData.activeProjects, ...roadData.upcomingProjects].map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl bg-[#FDFCFB] border border-[#1A1A1A]/10 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-[#1A1A1A]">{p.name}</div>
                          <div className="text-[11px] text-[#737373]">
                            {p.department.replace(/_/g, ' ')} • Window: {p.requiredStartDate} to {p.requiredCompletionDate}
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            p.status === 'CONFLICT_DETECTED'
                              ? 'bg-[#FAF0E6] text-[#A35C28] border border-[#A35C28]/30'
                              : 'bg-[#EDF2F7] text-[#2B4C6F] border border-[#2B4C6F]/30'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-2xl p-12 text-center text-[#8A8A8A] space-y-3 shadow-2xs">
              <Route className="w-12 h-12 mx-auto opacity-40 text-[#1A1A1A]" />
              <h3 className="font-serif-editorial font-bold text-lg text-[#1A1A1A]">
                Select a Road Corridor
              </h3>
              <p className="text-xs text-[#737373] max-w-sm mx-auto">
                Select a corridor from the left pane or click "Register New Road" above to start populating your city's municipal digital twin.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: REGISTER NEW ROAD */}
      {isAddRoadOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <div>
                <h3 className="font-serif-editorial font-bold text-lg text-[#1A1A1A]">
                  Register Road Corridor
                </h3>
                <p className="text-xs text-[#737373]">
                  Add an arterial or collector road into the municipal infrastructure digital twin.
                </p>
              </div>
              <button
                onClick={() => setIsAddRoadOpen(false)}
                className="p-1 rounded-md hover:bg-[#F0EEEB] text-[#8A8A8A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoad} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#8A8A8A] mb-1">
                    Road Name / Corridor
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. M.G. Road Arterial"
                    value={newRoad.name}
                    onChange={(e) => setNewRoad({ ...newRoad, name: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#8A8A8A] mb-1">
                    Road Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RD-MUM-01"
                    value={newRoad.code}
                    onChange={(e) => setNewRoad({ ...newRoad, code: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#8A8A8A] mb-1">
                    Ward / Division
                  </label>
                  <input
                    type="text"
                    value={newRoad.ward}
                    onChange={(e) => setNewRoad({ ...newRoad, ward: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#8A8A8A] mb-1">
                    Category
                  </label>
                  <select
                    value={newRoad.category}
                    onChange={(e) => setNewRoad({ ...newRoad, category: e.target.value as any })}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  >
                    <option value="ARTERIAL">Arterial Road</option>
                    <option value="SUB_ARTERIAL">Sub-Arterial Road</option>
                    <option value="COLLECTOR">Collector Street</option>
                    <option value="LOCAL_COMMERCIAL">Local Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#8A8A8A] mb-1">
                    Surface Material
                  </label>
                  <select
                    value={newRoad.surfaceType}
                    onChange={(e) => setNewRoad({ ...newRoad, surfaceType: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  >
                    <option value="BITUMINOUS_CONCRETE">Bituminous Concrete (Asphalt)</option>
                    <option value="M40_PAVEMENT_QUALITY_CONCRETE">M40 Pavement Quality Concrete (PQC)</option>
                    <option value="INTERLOCKING_CONCRETE_BLOCKS">Interlocking Concrete Paver</option>
                    <option value="MICRO_SURFACING">Micro-Surfaced Asphalt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#8A8A8A] mb-1">
                    Length (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRoad.lengthKm}
                    onChange={(e) => setNewRoad({ ...newRoad, lengthKm: parseFloat(e.target.value) || 1 })}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#8A8A8A] mb-1">
                    Right of Way Width (m)
                  </label>
                  <input
                    type="number"
                    value={newRoad.widthMeters}
                    onChange={(e) => setNewRoad({ ...newRoad, widthMeters: parseFloat(e.target.value) || 12 })}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#8A8A8A] mb-1">
                    Protection Status
                  </label>
                  <select
                    value={newRoad.protectionStatus}
                    onChange={(e) => setNewRoad({ ...newRoad, protectionStatus: e.target.value as any })}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  >
                    <option value="PROTECTED">PROTECTED ("Do Not Dig" Embargo)</option>
                    <option value="PERMITTED">PERMITTED (Open for Works)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#8A8A8A] mb-1">
                    Protection Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newRoad.protectionExpiryDate}
                    onChange={(e) => setNewRoad({ ...newRoad, protectionExpiryDate: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1A1A1A]/10">
                <button
                  type="button"
                  onClick={() => setIsAddRoadOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#F0EEEB] hover:bg-[#E5E2DC] text-[#1A1A1A] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#333333] text-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register Corridor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD UTILITY ASSET */}
      {isAddAssetOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <div>
                <h3 className="font-serif-editorial font-bold text-lg text-[#1A1A1A]">
                  Register Subsurface Utility
                </h3>
                <p className="text-xs text-[#737373]">
                  Embed an underground utility line into this road corridor.
                </p>
              </div>
              <button
                onClick={() => setIsAddAssetOpen(false)}
                className="p-1 rounded-md hover:bg-[#F0EEEB] text-[#8A8A8A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#8A8A8A] mb-1">
                  Utility Type
                </label>
                <select
                  value={newAsset.assetType}
                  onChange={(e) => setNewAsset({ ...newAsset, assetType: e.target.value as any })}
                  className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none"
                >
                  <option value="OPTICAL_FIBER">Optical Fiber / Telecom Conduit</option>
                  <option value="WATER_MAIN">Potable Water Main</option>
                  <option value="SEWER_LINE">Underground Sewerage / Stormwater</option>
                  <option value="GAS_PIPELINE">City Gas Pipeline (CGD)</option>
                  <option value="POWER_CABLE_HT">High-Tension (HT) Underground Power</option>
                  <option value="POWER_CABLE_LT">Low-Tension (LT) Underground Power</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#8A8A8A] mb-1">
                  Owner Department / Agency
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Municipal Water Works / Jio Telecom"
                  value={newAsset.ownerDepartment}
                  onChange={(e) => setNewAsset({ ...newAsset, ownerDepartment: e.target.value })}
                  className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#8A8A8A] mb-1">
                    Depth (meters)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAsset.depthMeters}
                    onChange={(e) => setNewAsset({ ...newAsset, depthMeters: parseFloat(e.target.value) || 1 })}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#8A8A8A] mb-1">
                    Condition
                  </label>
                  <select
                    value={newAsset.condition}
                    onChange={(e) => setNewAsset({ ...newAsset, condition: e.target.value as any })}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none"
                  >
                    <option value="EXCELLENT">EXCELLENT</option>
                    <option value="GOOD">GOOD</option>
                    <option value="FAIR">FAIR</option>
                    <option value="CRITICAL_REPAIR_NEEDED">CRITICAL REPAIR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#8A8A8A] mb-1">
                  Capacity / Duct Diameter Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. 300mm Cast Iron Pipe, 4-Way HDPE Duct"
                  value={newAsset.capacityOrDiameter}
                  onChange={(e) => setNewAsset({ ...newAsset, capacityOrDiameter: e.target.value })}
                  className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1A1A1A]/10">
                <button
                  type="button"
                  onClick={() => setIsAddAssetOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#F0EEEB] hover:bg-[#E5E2DC] text-[#1A1A1A] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#333333] text-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Embedding...' : 'Save Utility Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
