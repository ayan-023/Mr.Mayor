/**
 * MR. MAYOR - Project Detail & Multi-Tab Inspector Modal
 * Complete comprehensive inspector for single project or clustered coordination.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  QrCode,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  HardHat,
  Ruler,
  Users,
  Truck,
  ShieldCheck,
  Lock,
  ArrowRight,
  ShieldAlert,
  Zap,
  Layers,
  Info,
  Eye,
} from 'lucide-react';
import {
  Project,
  ApprovalWorkflow,
  Conflict,
  CoordinationCluster,
  RoadOpeningPermit,
  Inspection,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AICoordinationView } from '../coordination/AICoordinationView';
import { InfrastructureAnalysisCenter } from '../coordination/InfrastructureAnalysisCenter';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onRefreshData?: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  isOpen,
  onClose,
  project,
  onRefreshData,
}) => {
  const { currentUser } = useAuth();
  const isContractor = currentUser?.role === 'CONTRACTOR';

  const [activeTab, setActiveTab] = useState('overview');
  const [aiViewMode, setAiViewMode] = useState<'decision_report' | 'simulator'>('decision_report');
  const [details, setDetails] = useState<{
    project: Project;
    workflow?: ApprovalWorkflow;
    conflicts: Conflict[];
    cluster?: CoordinationCluster;
    permit?: RoadOpeningPermit;
    inspections: Inspection[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !project) return;
    async function loadDetails() {
      setIsLoading(true);
      try {
        const res = await api.getProjectDetails(project.id);
        setDetails(res);
      } catch (err) {
        console.error('Failed to load project details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDetails();
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const isCitizen = currentUser?.role === 'CITIZEN';
  const isInspector = currentUser?.role === 'INSPECTOR';

  const tabs = isCitizen
    ? [
        { id: 'overview', label: 'Overview' },
        { id: 'ai', label: 'Public Project Status' },
      ]
    : isInspector
    ? [
        { id: 'overview', label: 'Overview' },
        { id: 'inspections', label: `Inspections (${details?.inspections.length || 0})` },
        { id: 'ai', label: 'Field Quality Sheet' },
        { id: 'execution', label: 'Execution Logs' },
      ]
    : [
        { id: 'overview', label: 'Overview' },
        { id: 'conflicts', label: `Conflicts (${details?.conflicts.length || 0})` },
        { id: 'ai', label: 'Infrastructure Analysis' },
        { id: 'approvals', label: 'Approval Steps' },
        { id: 'permit', label: 'Digital Permit (ROP)' },
        { id: 'execution', label: 'Execution & Progress' },
        { id: 'inspections', label: `Inspections (${details?.inspections.length || 0})` },
        { id: 'documents', label: 'Documents' },
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        {/* Modal Top Header */}
        <div className="p-5 md:p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50 shrink-0">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-700 border border-slate-200 font-mono">
                {project.code}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                {project.department}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  project.status === 'CONFLICT_DETECTED'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : project.status === 'IN_PROGRESS'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {project.status}
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900">{project.name}</h2>
            <p className="text-xs text-slate-500">
              Corridor: <span className="text-slate-900 font-semibold">{project.roadName}</span> • Length: {project.lengthMeters}m • Budget: ₹{(project.estimatedCostINR / 10000000).toFixed(2)} Cr
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 border-b border-slate-200 bg-slate-100/70 overflow-x-auto text-xs shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2.5 text-[10px] uppercase tracking-wider font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-900 space-y-4 bg-white">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">Loading project inspector data...</div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Verified Visual Progress Bar */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 font-semibold">Construction Completion Status</span>
                      <span className="text-slate-900 font-bold font-mono text-sm">{project.progressPercentage || 0}% Completed</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${project.progressPercentage || 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>Phase: <strong className="text-slate-800">{project.currentWorkPhase || 'Pre-Excavation Setup'}</strong></span>
                      <span>Contractor: <strong className="text-slate-800">{project.contractorName || 'Assigned EPC Agency'}</strong></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Excavation Window</div>
                      <div className="font-bold text-slate-900 mt-1 font-mono">
                        {project.requiredStartDate} → {project.requiredCompletionDate}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {project.expectedExcavationDurationDays} continuous days
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Trench Geometry</div>
                      <div className="font-bold text-slate-900 mt-1">
                        {project.excavationWidthMeters}m (W) × {project.excavationDepthMeters}m (D)
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Area: {project.affectedAreaSqMeters} m²
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Cost Breakdown</div>
                      <div className="font-bold text-slate-900 text-sm mt-1">
                        ₹{(project.estimatedCostINR / 10000000).toFixed(2)} Cr
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Restoration: ₹{(project.estimatedRestorationCostINR / 100000).toFixed(1)} L
                      </div>
                    </div>
                  </div>

                  {/* Scope Description */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <h3 className="font-bold text-slate-900 text-xs">Scope & Engineering Details</h3>
                    <p className="text-slate-600 leading-relaxed text-xs">{project.description}</p>
                    <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-500 border-t border-slate-200/60">
                      <span>Submitted by: <strong className="text-slate-800">{project.submittedBy}</strong> ({project.submittedByDesignation})</span>
                      <span>Contractor: <strong className="text-slate-800">{project.contractorName}</strong></span>
                      <span>Traffic Impact: <strong className="text-amber-700 font-semibold">{project.trafficImpact}</strong></span>
                    </div>
                  </div>

                  {/* Quick AI Coordination Banner */}
                  {isCitizen ? (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-blue-950 text-white flex flex-wrap items-center justify-between gap-3 shadow-md border border-slate-800">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-blue-400" />
                          <span className="font-bold text-xs text-white">Public Road Infrastructure Status</span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Track planned improvement work and municipal traffic advisories on <strong className="text-white">{project.roadName}</strong>.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('ai')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>View Public Status</span>
                      </button>
                    </div>
                  ) : isInspector ? (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex flex-wrap items-center justify-between gap-3 shadow-md border border-slate-800">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <HardHat className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-xs text-white">Field Quality Inspection & Compaction Checklist</span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Verify excavation depth, safety barricades, and 95%+ Proctor Density compaction on <strong className="text-white">{project.roadName}</strong>.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('ai')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Open Field Inspection Sheet</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-blue-950 text-white flex flex-wrap items-center justify-between gap-3 shadow-md border border-slate-800">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                          <span className="font-bold text-xs text-white">Infrastructure Analysis Center</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                            9-Point Decision Support
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Automatically analyze cross-department projects on <strong className="text-white">{project.roadName}</strong> and generate official municipal coordination reports.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('ai');
                          setAiViewMode('decision_report');
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Open Infrastructure Analysis Center →</span>
                      </button>
                    </div>
                  )}

                  {/* Active Coordination Cluster link if exists */}
                  {details?.cluster && (
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-blue-900">
                            Synchronized in Multi-Agency Cluster: {details.cluster.clusterCode}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-600 text-white uppercase">
                          {details.cluster.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">
                        {(details.cluster as any)?.aiRecommendation?.jointSchedulingStrategy ||
                          details.cluster.aiReasoning?.[0] ||
                          'Unified multi-utility excavation schedule.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CONFLICTS */}
              {activeTab === 'conflicts' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs">
                        Spatial & Subsurface Clash Analysis ({details?.conflicts.length || 0})
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Identifies overlapping utility corridors, simultaneous excavation windows, and geotechnical hazards.
                      </p>
                    </div>
                    {details?.conflicts && details.conflicts.length > 0 && (
                      <button
                        onClick={() => setActiveTab('ai')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Resolve via AI Coordination Engine →</span>
                      </button>
                    )}
                  </div>

                  {(!details?.conflicts || details.conflicts.length === 0) ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <div className="font-bold text-slate-800">Zero Spatial or Subsurface Clashes</div>
                      <p className="text-[11px] text-slate-500">
                        This excavation corridor is completely clear of competing projects or active utility moratoria.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {details.conflicts.map((conf) => {
                        const isCritical = conf.severity === 'CRITICAL';
                        const isHigh = conf.severity === 'HIGH';

                        const conflictingDept =
                          conf.projectBDept && conf.projectBDept !== project.department
                            ? conf.projectBDept
                            : conf.projectADept || 'Other Utility';

                        const conflictingProjectName =
                          conf.projectBName && conf.projectBName !== project.name
                            ? conf.projectBName
                            : conf.projectAName || 'Parallel Infrastructure Work';

                        return (
                          <div
                            key={conf.id}
                            className={`p-4.5 rounded-2xl border transition-all space-y-3 ${
                              isCritical
                                ? 'bg-red-50/40 border-red-200'
                                : isHigh
                                ? 'bg-amber-50/40 border-amber-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            {/* Card Top: Department Clash Badges & Severity */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                <span className="px-2.5 py-0.5 rounded-md font-bold bg-blue-100 text-blue-900 border border-blue-200 font-mono text-[10px]">
                                  {project.department}
                                </span>
                                <span className="text-slate-400 font-bold text-xs">Conflict with</span>
                                <span className="px-2.5 py-0.5 rounded-md font-bold bg-purple-100 text-purple-900 border border-purple-200 font-mono text-[10px]">
                                  {conflictingDept}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {conf.conflictScore && (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-800 font-mono">
                                    Risk Score: {conf.conflictScore}/100
                                  </span>
                                )}
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                    isCritical
                                      ? 'bg-red-600 text-white animate-pulse'
                                      : isHigh
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-yellow-500 text-slate-900'
                                  }`}
                                >
                                  {conf.severity} SEVERITY
                                </span>
                              </div>
                            </div>

                            {/* Conflicting Project Details */}
                            <div className="space-y-1">
                              <div className="font-bold text-xs text-slate-900 leading-snug">
                                {conf.conflictType || `Cross-Utility Clash with ${conflictingProjectName}`}
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed">
                                {conf.description ||
                                  `Simultaneous road excavation detected along ${conf.roadName || project.roadName} between ${project.department} and ${conflictingDept}.`}
                              </p>
                            </div>

                            {/* Clash Dimensions Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 space-y-0.5">
                                <span className="text-[10px] text-slate-500 font-medium">Spatial Overlap</span>
                                <div className="font-bold font-mono text-slate-900">
                                  {conf.spatialOverlapPct || 100}% ({conf.spatialOverlapDistanceMeters || project.lengthMeters}m)
                                </div>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 space-y-0.5">
                                <span className="text-[10px] text-slate-500 font-medium">Temporal Overlap</span>
                                <div className="font-bold font-mono text-slate-900">
                                  {conf.temporalOverlapDays || 45} Overlapping Days
                                </div>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 space-y-0.5 col-span-2 sm:col-span-1">
                                <span className="text-[10px] text-slate-500 font-medium">Corridor Status</span>
                                <div className="font-bold text-amber-700">
                                  {conf.status || 'IN_COORDINATION'}
                                </div>
                              </div>
                            </div>

                            {/* Subsurface Hazard Reasons */}
                            {conf.reasons && conf.reasons.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                                  Identified Subsurface & Safety Hazards:
                                </span>
                                <div className="space-y-1">
                                  {conf.reasons.map((reason, idx) => (
                                    <div
                                      key={idx}
                                      className="p-2 rounded-lg bg-white border border-slate-200 flex items-start gap-2 text-[11px] text-slate-700"
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                      <span className="leading-snug">{reason}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* AI Recommended Resolution Box */}
                            <div className="p-3.5 rounded-xl bg-blue-50/90 border border-blue-200 space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-blue-950 font-bold text-xs">
                                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                  <span>AI Coordinated Engineering Resolution</span>
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white uppercase">
                                  Single Joint Window
                                </span>
                              </div>
                              <p className="text-[11px] text-blue-900/90 leading-relaxed">
                                {conf.recommendedResolution ||
                                  `Consolidate ${project.department} and ${conflictingDept} into a single synchronized excavation window along ${conf.roadName || project.roadName}. Lay deep infrastructure first (${conflictingDept === 'Water & Sewerage' ? 'Water trunk at 2.4m' : 'Gas pipeline at 1.8m'}) followed by shallow lines (${conflictingDept === 'Electricity (DISCOM)' ? 'Power cabling at 1.2m' : 'Telecom ducting at 0.9m'}) and finish with ONE unified Bituminous Concrete road resurfacing.`}
                              </p>
                              <div className="flex justify-end pt-1">
                                <button
                                  onClick={() => setActiveTab('ai')}
                                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>View Synchronized Plan on AI Coordination Tab →</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: INFRASTRUCTURE ANALYSIS CENTER & SIMULATION */}
              {activeTab === 'ai' && (
                <div className="space-y-4">
                  {!isCitizen && !isInspector && (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                        <button
                          onClick={() => setAiViewMode('decision_report')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                            aiViewMode === 'decision_report'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          9-Point Official Municipal Analysis & Report
                        </button>
                        <button
                          onClick={() => setAiViewMode('simulator')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                            aiViewMode === 'simulator'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Live GIS & Multi-Factor Simulator
                        </button>
                      </div>
                    </div>
                  )}

                  {aiViewMode === 'decision_report' || isCitizen || isInspector ? (
                    <InfrastructureAnalysisCenter
                      project={project}
                      onPlanAccepted={() => {
                        if (onRefreshData) onRefreshData();
                      }}
                      onRefresh={() => {
                        if (onRefreshData) onRefreshData();
                      }}
                    />
                  ) : (
                    <AICoordinationView
                      project={project}
                      onPlanAccepted={() => {
                        if (onRefreshData) onRefreshData();
                      }}
                      onRefresh={() => {
                        if (onRefreshData) onRefreshData();
                      }}
                    />
                  )}
                </div>
              )}

              {/* TAB 4: APPROVALS */}
              {activeTab === 'approvals' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-900 text-xs">
                    Multi-Stakeholder Approval Routing Workflow
                  </h3>

                  {details?.workflow ? (
                    <div className="space-y-2.5">
                      {details.workflow.steps.map((step: any, idx) => (
                        <div
                          key={step.id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                                step.status === 'APPROVED'
                                  ? 'bg-emerald-600 text-white'
                                  : step.status === 'REJECTED'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">
                                {step.stepName || step.stakeholderName} ({step.departmentRequired || step.department})
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {step.approverName ? `Approved by ${step.approverName} (${step.approverDesignation || step.roleRequired})` : `Requires ${step.roleRequired} Authorization`}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              step.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {step.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400">
                      Approval workflow pending creation.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: PERMIT */}
              {activeTab === 'permit' && (
                <div className="space-y-4">
                  {details?.permit ? (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                        <div>
                          <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                            Official Municipal Road Opening Permit (ROP)
                          </span>
                          <h3 className="font-bold text-slate-900 text-lg mt-1 font-mono">
                            {details.permit.permitNumber}
                          </h3>
                        </div>
                        <QrCode className="w-10 h-10 text-slate-900" />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold">Permit Holder</span>
                          <div className="font-semibold text-slate-900 mt-0.5">{details.permit.contractorName}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold">Valid Window</span>
                          <div className="font-semibold text-slate-900 mt-0.5 font-mono">
                            {details.permit.validFrom} → {details.permit.validTo}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold">Working Hours</span>
                          <div className="font-semibold text-amber-700 mt-0.5">{details.permit.workingHours}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold">Security Deposit</span>
                          <div className="font-bold text-emerald-700 mt-0.5 text-sm">
                            ₹{(details.permit.securityDepositINR / 100000).toFixed(1)} Lakhs
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      Digital Permit (ROP) will be generated automatically once all multi-department approvals are signed.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: EXECUTION & PROGRESS LOGS */}
              {activeTab === 'execution' && (
                <div className="space-y-4">
                  {/* Verified Progress Banner */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">Total Progress Accomplished</span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Verified EPC Contractor Progress Stream
                        </div>
                      </div>
                      <span className="font-bold text-blue-600 font-mono text-xl">{project.progressPercentage}%</span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${project.progressPercentage}%` }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-1">
                      <span>Current Phase: <strong className="text-slate-900">{project.currentWorkPhase || 'Pre-Excavation Site Setup'}</strong></span>
                      <span>Restoration: <strong className="text-emerald-700 font-semibold">{project.restorationStatus || 'Under Guarantee'}</strong></span>
                    </div>
                  </div>

                  {/* Contractor Daily Work Logs & Shift Comments */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900">
                        Contractor Measurement Book & Work Done Feed ({(project.progressLogs || []).length})
                      </h4>
                      <span className="text-xs text-slate-500">
                        Contractor: <strong className="text-slate-900">{project.contractorName || 'Assigned Agency'}</strong>
                      </span>
                    </div>

                    {(!project.progressLogs || project.progressLogs.length === 0) ? (
                      <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                        No shift progress comments logged yet by the contractor.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {project.progressLogs.map((log: any, idx: number) => (
                          <div key={log.id || idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800">
                                  {log.currentWorkPhase}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(log.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <span className="font-bold text-slate-900 font-mono">{log.progressPercentage}%</span>
                            </div>

                            <p className="text-slate-700 leading-relaxed italic">
                              "{log.workDoneComment}"
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                              {log.metersCompleted ? <span>Meters: <strong className="text-slate-900 font-mono">+{log.metersCompleted}m</strong></span> : null}
                              {log.laborCount ? <span>Workforce: <strong className="text-slate-900 font-mono">{log.laborCount} workers</strong></span> : null}
                              {log.equipmentOnSite ? <span>Machinery: <strong className="text-slate-900">{log.equipmentOnSite}</strong></span> : null}
                              <span>Supervisor: <strong>{log.loggedBy}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: INSPECTIONS */}
              {activeTab === 'inspections' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-xs">
                      Field Inspections & Compaction Tests ({details?.inspections.length || 0})
                    </h3>
                  </div>

                  {(!details?.inspections || details.inspections.length === 0) ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No inspections logged yet.
                    </div>
                  ) : (
                    details.inspections.map((insp) => (
                      <div
                        key={insp.id}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{insp.stage}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {insp.overallRating}
                          </span>
                        </div>
                        <p className="text-slate-600">{insp.notes}</p>
                        <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-200/60">
                          <span>Compaction: <strong className="text-slate-900">{insp.compactionDensityPercentage}%</strong></span>
                          <span>Inspector: <strong className="text-slate-900">{insp.inspectorName}</strong></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 8: DOCUMENTS */}
              {activeTab === 'documents' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Contract & Engineering Blueprints</span>
                    </div>
                    <p className="text-slate-500">
                      Detailed engineering drawings, cross-utility NOC filings, and digital ROP permits archived under Municipal e-Governance records.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
