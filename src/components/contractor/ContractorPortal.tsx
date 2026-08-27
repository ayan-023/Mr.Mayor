/**
 * MR. MAYOR - Contractor Execution & Work Tracker Portal
 * Comprehensive field management, GPS check-in, and granular "Work Accomplished" logging.
 * STRICT RBAC: Only assigned EPC contractors can submit progress updates.
 * Other roles (Commissioners, Engineers, QC, Citizens) view read-only progress bars.
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  MapPin,
  Clock,
  HardHat,
  Truck,
  Users,
  Ruler,
  FileCheck2,
  Sparkles,
  AlertCircle,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Project, WorkProgressLog } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { WorkflowLifecycleBanner } from '../common/WorkflowLifecycleBanner';
import { api } from '../../services/api';

interface ContractorPortalProps {
  projects: Project[];
  onRefreshData: () => void;
}

export const ContractorPortal: React.FC<ContractorPortalProps> = ({ projects, onRefreshData }) => {
  const { currentUser } = useAuth();
  const isContractor = currentUser?.role === 'CONTRACTOR';

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [contractorGpsLat, setContractorGpsLat] = useState(20.0035);
  const [contractorGpsLng, setContractorGpsLng] = useState(73.7845);
  const [progressPct, setProgressPct] = useState(65);
  const [currentPhase, setCurrentPhase] = useState('Trench Excavation & Bedding');
  const [metersCompleted, setMetersCompleted] = useState(85);
  const [laborCount, setLaborCount] = useState(12);
  const [equipmentOnSite, setEquipmentOnSite] = useState('1x Vermeer Trencher, 1x Mini-Excavator, 1x Plate Compactor');
  const [siteCondition, setSiteCondition] = useState('Dry ground, Class-1 retro-reflective barricades erected, utility clearance verified.');
  const [workDoneComment, setWorkDoneComment] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  useEffect(() => {
    if (selectedProject) {
      setProgressPct(selectedProject.progressPercentage || 0);
      if (selectedProject.currentWorkPhase) {
        setCurrentPhase(selectedProject.currentWorkPhase);
      }
    }
  }, [selectedProject?.id]);

  const handleStartWork = async () => {
    if (!selectedProject || !isContractor) return;
    setIsUpdating(true);
    try {
      await api.startProjectWork(
        selectedProject.id,
        {
          lat: Number(contractorGpsLat),
          lng: Number(contractorGpsLng),
        },
        currentUser?.name || selectedProject.contractorName || 'M/s InfraTech Constr.'
      );
      onRefreshData();
      alert('Site GPS verified and excavation officially activated!');
    } catch (err: any) {
      alert(err.message || 'Failed to start project work');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApplyPresetTemplate = (templateType: string) => {
    if (!isContractor) return;
    switch (templateType) {
      case 'TRENCHING':
        setCurrentPhase('Trench Excavation & Bedding');
        setProgressPct(Math.min(100, (selectedProject?.progressPercentage || 0) + 15));
        setMetersCompleted(90);
        setLaborCount(10);
        setEquipmentOnSite('1x Vermeer Micro-trencher, 1x JCB Backhoe, 1x 5.5T Dumper');
        setSiteCondition('IRC:SP:55 reflective barricades locked. Subsurface GPR radar checked.');
        setWorkDoneComment(
          `Excavated 90 linear meters of trench (depth 1.4m, width 0.6m) along ${selectedProject?.roadName || 'corridor'}. Laid 100mm M-sand bedding compacted to 95% MDD. Zero utility collisions recorded.`
        );
        break;
      case 'LAYING':
        setCurrentPhase('Pipe / Duct / Cable Laying');
        setProgressPct(Math.min(100, (selectedProject?.progressPercentage || 0) + 20));
        setMetersCompleted(120);
        setLaborCount(14);
        setEquipmentOnSite('1x Pipe Fusion Machine, 1x Hydra Crane, 1x Test Pump');
        setSiteCondition('Trench shoring verified. Pipe bedding stable with no water seepage.');
        setWorkDoneComment(
          `Successfully installed 120m of utility conduit with electro-fusion joints. Hydrostatic pressure testing completed at 10.5 bar for 4 hours with zero pressure drop. Joint logs signed.`
        );
        break;
      case 'BACKFILL':
        setCurrentPhase('Granular Backfilling & Layer Compaction');
        setProgressPct(Math.min(100, (selectedProject?.progressPercentage || 0) + 25));
        setMetersCompleted(150);
        setLaborCount(8);
        setEquipmentOnSite('2x Wacker Neuson Plate Compactors, 1x 10T Vibratory Roller, 2x Tippers');
        setSiteCondition('Moisture content optimized. Density test points marked at 30m intervals.');
        setWorkDoneComment(
          `Completed backfilling in 200mm graded GSB layers. Performed core-cutter density tests achieving 98.4% Modified Proctor Density. Requesting municipal inspector for layer sign-off.`
        );
        break;
      case 'RESTORATION':
        setCurrentPhase('Sub-base & Bituminous Restoration');
        setProgressPct(100);
        setMetersCompleted(selectedProject?.lengthMeters || 200);
        setLaborCount(16);
        setEquipmentOnSite('1x Asphalt Paver, 1x Tandem Steel Roller, 1x Bitumen Sprayer');
        setSiteCondition('Tack coat applied uniformly at 0.25 kg/sqm. Ambient temperature 32°C.');
        setWorkDoneComment(
          `Completed 50mm Dense Bituminous Macadam (DBM) and 40mm Bituminous Concrete (BC) wearing course flush with existing road grade. Surface rideability index within IRC standards. Road ready for traffic opening.`
        );
        break;
    }
  };

  const handleUpdateProgress = async () => {
    if (!selectedProject || !isContractor) return;
    if (!workDoneComment.trim()) {
      alert('Please enter a brief description of what work has been completed in this shift.');
      return;
    }

    setIsUpdating(true);
    try {
      await api.updateProjectProgress(
        selectedProject.id,
        progressPct,
        currentPhase,
        workDoneComment,
        {
          metersCompleted: Number(metersCompleted) || 0,
          laborCount: Number(laborCount) || 0,
          equipmentOnSite: equipmentOnSite || 'Standard site equipment',
          siteCondition: siteCondition || 'Satisfactory dry ground',
          loggedBy: currentUser?.name || selectedProject.contractorName || 'Contractor Project Engineer',
          loggedByRole: currentUser?.role || 'CONTRACTOR',
        }
      );
      setShowSuccessBanner(true);
      setTimeout(() => setShowSuccessBanner(false), 5000);
      setWorkDoneComment('');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update progress log');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRequestInspection = async () => {
    if (!selectedProject || !isContractor) return;
    try {
      await api.requestInspection({
        projectId: selectedProject.id,
        stage: 'EXCAVATION_DEPTH_AND_UTILITY_CLEARANCE',
        contractorNotes: `Contractor request for formal QC compaction and alignment inspection on ${selectedProject.roadName}. Progress achieved: ${selectedProject.progressPercentage}%.`,
      });
      alert('Quality & Compaction Inspection Request dispatched to Municipal Quality Cell!');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch inspection request');
    }
  };

  const progressLogs = selectedProject?.progressLogs || [];
  const totalMetersLogged = progressLogs.reduce((acc, log) => acc + (log.metersCompleted || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Universal Workflow Lifecycle Banner */}
      {selectedProject && (
        <WorkflowLifecycleBanner
          status={selectedProject.status}
          strategy={selectedProject.executionStrategy || 'COORDINATED'}
          caseNumber={selectedProject.code}
          roadName={selectedProject.roadName}
          currentActorRole={isContractor ? 'Assigned EPC Contractor' : 'Contractor Project Engineer'}
          currentActorDepartment={selectedProject.department}
          onRefresh={onRefreshData}
        />
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5 text-blue-600" />
              Contractor Work Execution Desk
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Daily Measurement & Progress Book
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            Field Work Progress & Measurement Logging
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            {isContractor
              ? 'Record detailed daily work logs, linear meterage achieved, workforce and equipment deployment, and submit inspection call notices.'
              : 'Live read-only stream of daily excavation progress and material deployment logs verified by on-site EPC contractors.'}
          </p>
        </div>

        {selectedProject && isContractor && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRequestInspection}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <FileCheck2 className="w-4 h-4 text-blue-400" />
              <span>Request QC Inspection</span>
            </button>
          </div>
        )}
      </div>

      {showSuccessBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Progress log saved and synchronized across Mayor & Engineer command centers!</span>
          </div>
          <span className="text-[10px] text-slate-500">Audit entry logged</span>
        </div>
      )}

      {/* Non-Contractor Notice Banner */}
      {!isContractor && (
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex items-center gap-3">
          <Lock className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="text-slate-700">
            <strong className="text-blue-900">Contractor Execution Stream (Read-Only Mode): </strong>
            You are viewing live shift progress as <span className="font-semibold text-slate-900">{currentUser?.name} ({currentUser?.designation})</span>. Daily measurement submissions and shift updates can only be recorded by assigned EPC contractors.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Selector List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
              Registered Infrastructure Corridors ({projects.length})
            </h3>
          </div>

          <div className="space-y-3">
            {projects.map((p) => {
              const isSelected = p.id === selectedProject?.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedProjectId(p.id);
                    setProgressPct(p.progressPercentage || 0);
                    if (p.currentWorkPhase) setCurrentPhase(p.currentWorkPhase);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-white border-blue-600 shadow-sm ring-1 ring-blue-600'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 text-sm truncate max-w-[190px]">
                      {p.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                        p.status === 'IN_PROGRESS'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {(p.status || 'IN_PROGRESS').replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600">
                    Corridor: <span className="text-slate-900 font-semibold">{p.roadName}</span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Progress Accomplished</span>
                      <span className="font-bold text-slate-900 font-mono">{p.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${p.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {p.lastProgressUpdate && (
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Updated: {new Date(p.lastProgressUpdate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Work Done Logging & Measurement Book Form */}
        {selectedProject && (
          <div className="lg:col-span-2 space-y-6">
            {/* Active Project Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {selectedProject.code}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">{selectedProject.name}</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedProject.roadName} • {selectedProject.lengthMeters}m • Contractor:{' '}
                    <strong className="text-slate-800">{selectedProject.contractorName || 'M/s InfraTech Constr.'}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Overall Progress</div>
                  <div className="text-xl font-bold text-blue-600 font-mono mt-0.5">
                    {selectedProject.progressPercentage}%
                  </div>
                </div>
              </div>

              {/* Verified Visual Progress Bar */}
              <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Real-Time Construction Progress</span>
                  <span className="text-slate-900 font-bold font-mono text-sm">{selectedProject.progressPercentage}% Completed</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${selectedProject.progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                  <span>Phase: <strong className="text-slate-800">{selectedProject.currentWorkPhase || 'Pre-Excavation'}</strong></span>
                  <span>Cumulative Linear Metres: <strong className="text-slate-800 font-mono">{totalMetersLogged}m</strong> / {selectedProject.lengthMeters}m</span>
                </div>
              </div>

              {/* Fast Shift Preset Buttons (Contractor Only) */}
              {isContractor && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Quick Shift Log Presets
                    </span>
                    <span className="text-[10px] text-slate-500">Auto-fills measurement entry</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPresetTemplate('TRENCHING')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-colors cursor-pointer text-xs space-y-0.5"
                    >
                      <div className="font-bold text-slate-900 text-xs">1. Trenching</div>
                      <div className="text-[10px] text-slate-500">90m excavated</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetTemplate('LAYING')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-colors cursor-pointer text-xs space-y-0.5"
                    >
                      <div className="font-bold text-slate-900 text-xs">2. Pipe Laying</div>
                      <div className="text-[10px] text-slate-500">120m installed</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetTemplate('BACKFILL')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-colors cursor-pointer text-xs space-y-0.5"
                    >
                      <div className="font-bold text-slate-900 text-xs">3. Backfill</div>
                      <div className="text-[10px] text-slate-500">GSB layers</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetTemplate('RESTORATION')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-colors cursor-pointer text-xs space-y-0.5"
                    >
                      <div className="font-bold text-slate-900 text-xs">4. Resurfacing</div>
                      <div className="text-[10px] text-slate-500">Asphalt finish</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Progress & Milestone Logging Form (Contractor Only) */}
              {isContractor ? (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Log Shift Work Done & Measurement Entry
                    </h3>
                    <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Cumulative: {totalMetersLogged}m completed
                    </span>
                  </div>

                  {/* Progress Slider & Numeric Percentage */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 font-medium">Update Project Completion Percentage</span>
                      <span className="text-slate-900 font-bold font-mono text-base">{progressPct}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={progressPct}
                      onChange={(e) => setProgressPct(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>0% (Mobilization)</span>
                      <span>50% (Pipes/Cables Laid)</span>
                      <span>100% (Bituminous Resurfaced)</span>
                    </div>
                  </div>

                  {/* Phase Selection */}
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-1">Active Work Phase</label>
                    <select
                      value={currentPhase}
                      onChange={(e) => setCurrentPhase(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    >
                      <option value="Pre-Excavation Site Barricading & Setup">Pre-Excavation Site Barricading & Setup</option>
                      <option value="Trench Excavation & Bedding">Trench Excavation & Bedding</option>
                      <option value="Pipe / Duct / Cable Laying">Pipe / Duct / Cable Laying</option>
                      <option value="Jointing & Hydrostatic Pressure Testing">Jointing & Hydrostatic Pressure Testing</option>
                      <option value="Granular Backfilling & Layer Compaction">Granular Backfilling & Layer Compaction</option>
                      <option value="Sub-base & Bituminous Restoration">Sub-base & Bituminous Restoration</option>
                      <option value="Site Cleared & Final Road Handover">Site Cleared & Final Road Handover</option>
                    </select>
                  </div>

                  {/* Granular Metrics: Meters, Labor, Equipment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5 text-blue-600" />
                        Linear Meters Completed This Shift (m)
                      </label>
                      <input
                        type="number"
                        value={metersCompleted}
                        onChange={(e) => setMetersCompleted(Number(e.target.value))}
                        placeholder="e.g. 85"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        Workforce / Labor Deployed On Site
                      </label>
                      <input
                        type="number"
                        value={laborCount}
                        onChange={(e) => setLaborCount(Number(e.target.value))}
                        placeholder="e.g. 12"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-amber-600" />
                        Machinery & Heavy Equipment On Site
                      </label>
                      <input
                        type="text"
                        value={equipmentOnSite}
                        onChange={(e) => setEquipmentOnSite(e.target.value)}
                        placeholder="e.g. 1x Trencher, 1x Roller"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Site Safety & Ground Condition
                      </label>
                      <input
                        type="text"
                        value={siteCondition}
                        onChange={(e) => setSiteCondition(e.target.value)}
                        placeholder="e.g. Dry ground, barricaded"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Detailed "Work Done Till Now" Comment Box */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-900 text-xs font-bold">
                        Work Accomplished Till Now (Detailed Description & Comments) *
                      </label>
                      <span className="text-[10px] text-slate-400">Visible to Mayor & Quality Inspectors</span>
                    </div>
                    <textarea
                      rows={3}
                      required
                      value={workDoneComment}
                      onChange={(e) => setWorkDoneComment(e.target.value)}
                      placeholder="Provide a specific description of what has been constructed/installed, chainage range (e.g. 0+150 to 0+235), depth achieved, test results, or site challenges..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleUpdateProgress}
                      disabled={isUpdating}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      {isUpdating ? 'Recording Measurement Entry...' : 'Submit Work Done & Progress Log'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">Contractor Shift History & Progress Audit</span>
                    <span className="text-[10px] text-slate-500 font-mono">{progressLogs.length} verified logs</span>
                  </div>
                </div>
              )}
            </div>

            {/* Historical Progress Logs Timeline */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Historical Measurement Logs & Daily Work Record
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {progressLogs.length} Logs Filed
                </span>
              </div>

              {progressLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No daily progress logs filed yet for this corridor.
                </div>
              ) : (
                <div className="space-y-3">
                  {progressLogs.map((log: WorkProgressLog, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{log.currentWorkPhase}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                            {log.progressPercentage}% Complete
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-slate-700 leading-relaxed italic">
                        "{log.workDoneComment}"
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 pt-1">
                        <div>Meters: <strong className="text-slate-900 font-mono">+{log.metersCompleted || 0}m</strong></div>
                        <div>Labor: <strong className="text-slate-900 font-mono">{log.laborCount || 0} workers</strong></div>
                        <div className="sm:col-span-2">Machinery: <strong className="text-slate-900">{log.equipmentOnSite || 'Standard'}</strong></div>
                      </div>

                      {log.loggedBy && (
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 flex justify-between">
                          <span>Logged by: <strong className="text-slate-700">{log.loggedBy}</strong> ({log.loggedByRole || 'Contractor'})</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
