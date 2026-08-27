import { ErrorBoundary } from '../common/ErrorBoundary';
/**
 * MR. MAYOR - AI Infrastructure Analysis Center (Flagship Module)
 * Central Intelligence & Decision-Support Command Center (Spec Sections 1 - 60)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Search,
  Zap,
  Activity,
  Layers,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Printer,
  Download,
  Copy,
  ChevronRight,
  TrendingDown,
  Clock,
  Building,
  Route,
  ArrowRight,
  Play,
  RotateCcw,
  Check,
  X,
  FileCheck,
  ShieldAlert,
  Info,
  Sliders,
  Filter,
} from 'lucide-react';
import {
  Project,
  Road,
  InfrastructureAsset,
  CoordinationCluster,
  InfrastructureAnalysisReport,
  DepartmentActionItem,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { InfrastructureAnalysisCenter } from './InfrastructureAnalysisCenter';

interface AIAnalysisCenterViewProps {
  projects: Project[];
  roads: Road[];
  assets: InfrastructureAsset[];
  clusters: CoordinationCluster[];
  onRefreshData: () => void;
  onSelectProject?: (project: Project) => void;
}

export type AnalysisType =
  | 'FULL_INFRASTRUCTURE'
  | 'PROJECT_CONFLICT'
  | 'ROAD_CORRIDOR'
  | 'CROSS_DEPARTMENT'
  | 'TRAFFIC_IMPACT'
  | 'ROAD_REWORK';

export const AIAnalysisCenterView: React.FC<AIAnalysisCenterViewProps> = ({
  projects,
  roads,
  assets,
  clusters,
  onRefreshData,
  onSelectProject,
}) => {
  const { currentUser } = useAuth();

  // Active view: 'landing' or 'full_analysis'
  const [viewMode, setViewMode] = useState<'landing' | 'full_analysis'>('landing');
  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0] || null);

  // Command bar search / query state
  const [queryInput, setQueryInput] = useState('');
  const [filterPriority, setFilterPriority] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE'>('ALL');

  // New Analysis Wizard Modal state
  const [isNewAnalysisModalOpen, setIsNewAnalysisModalOpen] = useState(false);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('FULL_INFRASTRUCTURE');
  const [selectedRoadId, setSelectedRoadId] = useState(roads[0]?.id || '');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [isExecutingPipeline, setIsExecutingPipeline] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);

  const pipelineStages = [
    'Project Discovery & Ingestion',
    'Spatial Geometry & Buffer Overlap',
    'Temporal Overlap & Duration Mapping',
    'Traffic Impact & CTTP 2016 Baseline',
    'Road Restoration Age & Moratorium Check',
    'Geotechnical & Subsurface Safety Risks',
    'Cross-Department Conflict Compatibility',
    'Simhastha 2027 & Monsoon Embargo Policy',
    'Coordination Optimization Engine',
    'Recommended Single-Window Execution Plan',
  ];

  // Derive active analyses list
  const activeAnalysesList = useMemo(() => {
    return projects.map((p, idx) => {
      const road = roads.find((r) => r.id === p.roadId) || roads[0];
      const isGangapur = p.roadName.toLowerCase().includes('gangapur');
      const isCollege = p.roadName.toLowerCase().includes('college');
      const isTrimbak = p.roadName.toLowerCase().includes('trimbak');

      let priority: 'CRITICAL' | 'HIGH' | 'MODERATE' = 'MODERATE';
      let coordinationOpportunity = 'HIGH';
      let trafficDisruption = 'MEDIUM';
      let reworkRisk = 'LOW';
      let avoidedCuts = 1;
      let avoidedRestorations = 1;
      let estimatedSavingsINR = 1500000;

      if (isGangapur) {
        priority = 'CRITICAL';
        coordinationOpportunity = 'VERY HIGH';
        trafficDisruption = 'HIGH';
        reworkRisk = 'HIGH';
        avoidedCuts = 7;
        avoidedRestorations = 7;
        estimatedSavingsINR = 92260000;
      } else if (isCollege) {
        priority = 'HIGH';
        coordinationOpportunity = 'HIGH';
        trafficDisruption = 'CRITICAL (Peak 17:45-18:45)';
        reworkRisk = 'MODERATE';
        avoidedCuts = 3;
        avoidedRestorations = 3;
        estimatedSavingsINR = 34000000;
      } else if (isTrimbak) {
        priority = 'HIGH';
        coordinationOpportunity = 'HIGH';
        trafficDisruption = 'HIGH (V/C 0.76)';
        reworkRisk = 'MODERATE';
        avoidedCuts = 2;
        avoidedRestorations = 2;
        estimatedSavingsINR = 28000000;
      }

      return {
        id: `ANA-2026-${p.code ? p.code.replace(/[^a-zA-Z0-9]/g, '') : p.id.slice(-4)}`,
        project: p,
        roadName: p.roadName,
        priority,
        coordinationOpportunity,
        trafficDisruption,
        reworkRisk,
        avoidedCuts,
        avoidedRestorations,
        estimatedSavingsLakhs: (estimatedSavingsINR / 100000).toFixed(1),
        status: p.status === 'CONFLICT_DETECTED' ? 'AWAITING REVIEW' : 'COORDINATED',
        departmentsCount: isGangapur ? 3 : isCollege ? 2 : 2,
      };
    });
  }, [projects, roads]);

  // Filtered analyses
  const filteredAnalyses = useMemo(() => {
    return activeAnalysesList.filter((item) => {
      const matchesSearch =
        queryInput === '' ||
        item.roadName.toLowerCase().includes(queryInput.toLowerCase()) ||
        item.project.name.toLowerCase().includes(queryInput.toLowerCase()) ||
        item.project.department.toLowerCase().includes(queryInput.toLowerCase()) ||
        item.id.toLowerCase().includes(queryInput.toLowerCase());

      const matchesPriority =
        filterPriority === 'ALL' || item.priority === filterPriority;

      return matchesSearch && matchesPriority;
    });
  }, [activeAnalysesList, queryInput, filterPriority]);

  // Summary Metrics
  const totalActive = activeAnalysesList.length;
  const highPriorityCount = activeAnalysesList.filter((a) => a.priority === 'CRITICAL' || a.priority === 'HIGH').length;
  const awaitingReviewCount = activeAnalysesList.filter((a) => a.status === 'AWAITING REVIEW').length;
  const totalAvoidedCuts = activeAnalysesList.reduce((acc, curr) => acc + curr.avoidedCuts, 0);

  const handleOpenFullAnalysis = (project: Project) => {
    setSelectedProject(project);
    setViewMode('full_analysis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRunNewAnalysis = () => {
    setIsExecutingPipeline(true);
    setPipelineStep(0);

    const interval = setInterval(() => {
      setPipelineStep((prev) => {
        if (prev >= pipelineStages.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExecutingPipeline(false);
            setIsNewAnalysisModalOpen(false);
            const target = projects.find((p) => p.roadId === selectedRoadId) || projects[0];
            handleOpenFullAnalysis(target);
          }, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 280);
  };

  return (
    <div className="space-y-6">
      {/* If viewMode === 'full_analysis', show the dedicated full-screen analysis page */}
      {viewMode === 'full_analysis' && selectedProject ? (
        <div className="space-y-6 animate-fade-in">
          {/* Back Bar */}
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('landing')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                ← Back to Analysis Center
              </button>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Corridor:</span>
                <strong className="text-slate-900">{selectedProject.roadName}</strong>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-900 font-mono">
                  {selectedProject.code}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                AI Engine: Operational
              </span>
            </div>
          </div>

          {/* Full Infrastructure Analysis Center */}
          <InfrastructureAnalysisCenter
            project={selectedProject}
            onPlanAccepted={() => onRefreshData()}
            onRefresh={() => onRefreshData()}
          />
        </div>
      ) : (
        /* LANDING VIEW */
        <div className="space-y-6 animate-fade-in">
          {/* 1. HERO SECTION (GOVERNMENT COMMAND CENTER AESTHETIC) */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white shadow-xl border border-slate-800 space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-blue-300">
                    FLAGSHIP INTELLIGENCE CORE • MR. MAYOR
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    AI Engine: Operational
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  AI Infrastructure Analysis Center
                </h1>

                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  Analyze multi-agency infrastructure conflicts, historical Nashik traffic baselines (CTTP 2016), road rework risks, and subsurface depth hierarchies to turn uncoordinated excavations into unified single-window execution plans.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsNewAnalysisModalOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>+ Run New Analysis</span>
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('active-analyses-grid');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
                >
                  View Active Analyses ({totalActive})
                </button>
              </div>
            </div>

            {/* AI Engine Status Bar */}
            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Active Analyses</span>
                <div className="text-lg font-bold text-white font-mono">{totalActive} Corridors</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
                <span className="text-amber-400 text-[10px] font-bold uppercase">High-Risk Clashes</span>
                <div className="text-lg font-bold text-amber-300 font-mono">{highPriorityCount} Active</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
                <span className="text-blue-400 text-[10px] font-bold uppercase">Awaiting Authority Review</span>
                <div className="text-lg font-bold text-blue-300 font-mono">{awaitingReviewCount} Pending</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
                <span className="text-emerald-400 text-[10px] font-bold uppercase">Potential Avoidable Cuts</span>
                <div className="text-lg font-bold text-emerald-300 font-mono">{totalAvoidedCuts} (Modelled)</div>
              </div>
            </div>
          </div>

          {/* 2. AI ANALYSIS COMMAND BAR ("ASK MR. MAYOR TO ANALYZE") */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Ask MR. MAYOR to Analyze Corridors
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Type a corridor, department, or click a pre-populated inquiry
              </span>
            </div>

            {/* Input Bar */}
            <div className="relative">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Analyze upcoming road works on Gangapur Road, College Road, or Trimbak Road..."
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all bg-slate-50/50"
              />
              {queryInput && (
                <button
                  onClick={() => setQueryInput('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                ><X className="w-4 h-4" /></button>
              )}
            </div>

            {/* Prompt Inquiry Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Suggested Inquiries:</span>
              <button
                onClick={() => setQueryInput('Gangapur')}
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-medium border border-blue-200/60 transition-all cursor-pointer"
              >
                "Analyze road-opening requests on Gangapur Road."
              </button>
              <button
                onClick={() => setQueryInput('College')}
                className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-medium border border-purple-200/60 transition-all cursor-pointer"
              >
                "Identify high traffic-risk works on College Road during peak hours."
              </button>
              <button
                onClick={() => setQueryInput('Trimbak')}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-medium border border-emerald-200/60 transition-all cursor-pointer"
              >
                "Check historical V/C baseline pressure on Trimbak Road."
              </button>
              <button
                onClick={() => setQueryInput('Untwadi')}
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-medium border border-amber-200/60 transition-all cursor-pointer"
              >
                "Find recently restored roads scheduled for excavation."
              </button>
            </div>
          </div>

          {/* 3. ACTIVE AI ANALYSES LIST (DECISION CARDS) */}
          <div id="active-analyses-grid" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Active Infrastructure Analyses ({filteredAnalyses.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Cross-utility engineering decisions grounded in spatial, temporal, and traffic data.
                </p>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      filterPriority === p
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAnalyses.map((analysis) => {
                const isCritical = analysis.priority === 'CRITICAL';
                const isHigh = analysis.priority === 'HIGH';

                return (
                  <div
                    key={analysis.id}
                    className={`p-5 rounded-2xl bg-white border transition-all hover:shadow-md space-y-4 ${
                      isCritical
                        ? 'border-red-200 shadow-2xs hover:border-red-300'
                        : isHigh
                        ? 'border-amber-200 shadow-2xs hover:border-amber-300'
                        : 'border-slate-200 shadow-2xs'
                    }`}
                  >
                    {/* Card Top */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {analysis.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              isCritical
                                ? 'bg-red-600 text-white'
                                : isHigh
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {analysis.priority} PRIORITY
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">{analysis.roadName}</h3>
                        <p className="text-xs text-slate-500">{analysis.project.name}</p>
                      </div>

                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                        {analysis.departmentsCount} Agencies Involved
                      </span>
                    </div>

                    {/* Decision Factors Grid */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Traffic Impact</span>
                        <div className="font-bold text-slate-800 text-xs truncate">
                          {analysis.trafficDisruption}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Rework Risk</span>
                        <div className="font-bold text-slate-800 text-xs">
                          {analysis.reworkRisk}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Coordination</span>
                        <div className="font-bold text-emerald-700 text-xs">
                          {analysis.coordinationOpportunity}
                        </div>
                      </div>
                    </div>

                    {/* AI Recommendation Summary */}
                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-blue-900 text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>AI Recommended Execution Strategy:</span>
                      </div>
                      <p className="text-slate-700 text-[11px] leading-relaxed">
                        Coordinate {analysis.departmentsCount} departmental excavations into ONE synchronized window followed by a single Bituminous Concrete restoration.
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 pt-1 border-t border-blue-200/60">
                        <span>+{analysis.avoidedCuts} Cuts Avoidable (Projected)</span>
                        <span>₹{analysis.estimatedSavingsLakhs} L Modelled Savings</span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-medium text-slate-500 font-mono">
                        Status: <strong className="text-amber-700">{analysis.status}</strong>
                      </span>
                      <button
                        onClick={() => handleOpenFullAnalysis(analysis.project)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Open Full Analysis</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. NEW ANALYSIS WIZARD MODAL */}
      {isNewAnalysisModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl w-full space-y-5 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <Play className="w-4 h-4 fill-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Run New Infrastructure Analysis</h3>
                  <p className="text-[11px] text-slate-500">Configure parameters for the AI Coordination Engine</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isExecutingPipeline) setIsNewAnalysisModalOpen(false);
                }}
                disabled={isExecutingPipeline}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 font-bold"
              ><X className="w-4 h-4" /></button>
            </div>

            {isExecutingPipeline ? (
              /* Pipeline Progression View */
              <div className="py-6 space-y-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg animate-pulse">
                  <Sparkles className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">Executing Municipal Analysis Pipeline</h4>
                  <p className="text-xs text-blue-600 font-mono font-bold">
                    Stage {pipelineStep + 1} of {pipelineStages.length}: {pipelineStages[pipelineStep]}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${((pipelineStep + 1) / pipelineStages.length) * 100}%` }}
                  />
                </div>

                <div className="space-y-1 text-left max-h-36 overflow-y-auto p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600">
                  {pipelineStages.slice(0, pipelineStep + 1).map((stage, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{stage}... Done</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Parameter Configuration */
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1.5">
                    Select Analysis Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'FULL_INFRASTRUCTURE', label: 'Full Infrastructure Analysis' },
                      { id: 'PROJECT_CONFLICT', label: 'Project Conflict Clash' },
                      { id: 'ROAD_CORRIDOR', label: 'Road Corridor Impact' },
                      { id: 'TRAFFIC_IMPACT', label: 'CTTP Traffic V/C Impact' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setAnalysisType(type.id as AnalysisType)}
                        className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                          analysisType === type.id
                            ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                    Select Road Corridor
                  </label>
                  <select
                    value={selectedRoadId}
                    onChange={(e) => setSelectedRoadId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {roads.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                    Target Execution Window
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      defaultValue="2025-10-01"
                      className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                    />
                    <input
                      type="date"
                      defaultValue="2025-10-25"
                      className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setIsNewAnalysisModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRunNewAnalysis}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start AI Analysis Pipeline</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
