/**
 * MR. MAYOR - Multi-Agency Joint Trench Coordination Hub
 * Provides interactive coordination cluster management, cross-section trench depth visualizer,
 * joint scheduling timeline, shared cost allocation, and multi-agency consensus sign-off.
 */

import React, { useState } from 'react';
import {
  GitMerge,
  Sparkles,
  Layers,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  TrendingDown,
  Building,
  Check,
} from 'lucide-react';
import { CoordinationCluster, Project } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface CoordinationHubProps {
  clusters: CoordinationCluster[];
  onRefreshData: () => void;
  onSelectProject?: (project: Project) => void;
}

export const CoordinationHub: React.FC<CoordinationHubProps> = ({
  clusters,
  onRefreshData,
  onSelectProject,
}) => {
  const { currentUser } = useAuth();
  const [selectedClusterId, setSelectedClusterId] = useState<string>(
    clusters[0]?.id || ''
  );
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');

  const activeCluster = clusters.find((c) => c.id === selectedClusterId) || clusters[0];

  const handleAIReanalyze = async () => {
    if (!activeCluster) return;
    setIsAnalyzingAI(true);
    try {
      const res = await api.analyzeAICoordination(
        activeCluster.roadId,
        activeCluster.projects.map((p) => p.id)
      );
      setAiResult(res);
    } catch (err) {
      console.error('AI Re-analysis failed:', err);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleApproveCluster = async () => {
    if (!activeCluster || !currentUser) return;
    setIsApproving(true);
    try {
      await api.approveCluster(activeCluster.id, {
        department: currentUser.department,
        officer: currentUser.name,
        designation: currentUser.designation,
        notes: approvalNotes || 'Consensus granted for joint trenching alignment and shared restoration costs.',
      });
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to record approval');
    } finally {
      setIsApproving(false);
    }
  };

  // Derive cluster stats
  const projects = activeCluster?.projects || [];
  const costAllocations = (activeCluster as any)?.costAllocation ||
    (projects.length > 0
      ? projects.map((proj, idx, arr) => {
          const totalRestoration = projects.reduce((sum, p) => sum + (p?.estimatedRestorationCostINR || 2000000), 0);
          const sharePct = Math.round(100 / (arr.length || 1));
          const singleSharedCost = Math.round(totalRestoration * 0.45);
          const allocatedCost = Math.round((singleSharedCost * sharePct) / 100);
          const savings = Math.max(0, (proj?.estimatedRestorationCostINR || 2000000) - allocatedCost);
          return {
            department: proj?.department || `Agency ${idx + 1}`,
            sharePercentage: sharePct,
            allocatedCostINR: allocatedCost,
            savingsINR: savings,
          };
        })
      : [
          { department: 'Water & Sewerage', sharePercentage: 35, allocatedCostINR: 900000, savingsINR: 1100000 },
          { department: 'City Gas Distribution', sharePercentage: 35, allocatedCostINR: 900000, savingsINR: 1100000 },
          { department: 'Electricity (DISCOM)', sharePercentage: 30, allocatedCostINR: 800000, savingsINR: 950000 },
        ]);

  const approvalsList = Array.isArray(activeCluster?.departmentApprovals)
    ? activeCluster.departmentApprovals
    : Object.entries(activeCluster?.departmentApprovals || {}).map(([dept, data]: [string, any]) => ({
        department: dept,
        status: data?.approved ? 'APPROVED' : 'PENDING',
        approvedBy: data?.officer,
        approvedByDesignation: data?.designation,
        timestamp: data?.timestamp,
        notes: data?.notes,
      }));

  const signedCount = approvalsList.filter((a: any) => a.status === 'APPROVED' || a.approved).length;
  const totalCount = approvalsList.length || (activeCluster?.projects?.length || 1);

  const isApexOfficer =
    currentUser?.role === 'COMMISSIONER' ||
    currentUser?.role === 'NODAL_OFFICER' ||
    currentUser?.role === 'ADMIN';

  const involvedDepts: string[] = Array.from(
    new Set([
      ...(activeCluster?.projects?.map((p) => p.department).filter(Boolean) || []),
      ...Object.keys(activeCluster?.departmentApprovals || {}),
    ])
  );

  const isInvolvedDepartment =
    isApexOfficer ||
    involvedDepts.some(
      (dept) =>
        dept === currentUser?.department ||
        (typeof dept === 'string' &&
          typeof currentUser?.department === 'string' &&
          dept.includes(currentUser.department))
    );

  const myDeptApproval = approvalsList.find(
    (a: any) =>
      a.department === currentUser?.department ||
      a.approvedBy === currentUser?.name
  );

  const hasAlreadyApproved = myDeptApproval && myDeptApproval.status === 'APPROVED';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider flex items-center gap-1.5">
              <GitMerge className="w-3.5 h-3.5 text-blue-600" /> Joint Trench Coordination
            </span>
            <span className="text-xs text-slate-500">Trench Synchronization & Shared Resurfacing</span>
          </div>
          <h1 className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Inter-Departmental Joint Digging Hub
          </h1>
          <p className="text-xs md:text-sm text-slate-600 max-w-2xl mt-1">
            Eliminate repetitive road cutting by synchronizing Water, Drainage, Telecom, Gas, and Power works into a single shared trenching window.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleAIReanalyze}
            disabled={isAnalyzingAI || !activeCluster}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-white" />
            {isAnalyzingAI ? 'Optimizing Schedule...' : 'Re-Optimize Joint Schedule'}
          </button>
        </div>
      </div>

      {/* Main Cluster Selector & Details */}
      {clusters.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
            <GitMerge className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-bold text-xl text-slate-900">
              No Active Coordination Clusters
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              When multiple municipal utilities submit excavation proposals with overlapping dates or road alignments, the Mr. Mayor Conflict Engine automatically synthesizes them into joint coordination clusters here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Cluster List */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">
              Active Coordination Clusters ({clusters.length})
            </h3>

            <div className="space-y-3">
              {clusters.map((cluster) => {
                const isSelected = cluster.id === activeCluster?.id;
                return (
                  <div
                    key={cluster.id}
                    onClick={() => setSelectedClusterId(cluster.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-white border-blue-600 shadow-sm ring-1 ring-blue-600'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                          {cluster.clusterCode}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1 leading-snug">
                          {cluster.name}
                        </h4>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                          cluster.status === 'ACCEPTED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {cluster.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      Corridor: <span className="text-slate-900 font-semibold">{cluster.roadName}</span>
                    </p>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                      <span className="text-slate-500">{cluster.projects?.length || 0} Utilities Synced</span>
                      <span className="font-bold text-emerald-700">
                        Saved: ₹{((cluster.estimatedCostSavedINR || 0) / 10000000).toFixed(2)} Cr
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (2 cols): Selected Cluster Deep Dive */}
          {activeCluster && (
            <div className="lg:col-span-2 space-y-6">
              {/* Cluster Header & AI Synthesis */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                      {activeCluster.roadName} • {activeCluster.clusterCode}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mt-2">
                      {activeCluster.name}
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Unified Excavation Window</div>
                    <div className="text-xs font-bold text-slate-900 font-mono mt-0.5 flex items-center gap-1.5 justify-end">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{activeCluster.recommendedWindowStart} → {activeCluster.recommendedWindowEnd}</span>
                    </div>
                  </div>
                </div>

                {/* AI Strategy Box */}
                <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-blue-800 uppercase text-[10px] tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>AI Multi-Utility Coordination Strategy</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed text-xs">
                    {aiResult?.jointSchedulingStrategy ||
                      aiResult?.executiveSummary ||
                      (activeCluster as any)?.aiRecommendation?.jointSchedulingStrategy ||
                      activeCluster.aiReasoning?.[0] ||
                      'Consolidates multi-department excavation proposals into a single 22-day coordinated window, eliminating repetitive road surface cuts.'}
                  </p>
                  <div className="text-xs text-slate-600 pt-1">
                    <strong className="text-slate-900">Restoration Policy: </strong>
                    {aiResult?.restorationStrategy ||
                      (activeCluster as any)?.aiRecommendation?.restorationStrategy ||
                      'Single continuous Bituminous Concrete (BC) resurfacing with 95%+ Proctor compaction testing and joint trench backfilling.'}
                  </div>
                </div>

                {/* SYNCHRONIZED UTILITY WORK PACKAGES */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-blue-600" />
                      <h3 className="font-bold text-slate-900 text-sm">
                        Synchronized Infrastructure Projects ({projects.length})
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold">1 Coordinated Dig • 1 Restoration</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-bold text-slate-900 truncate">{proj.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span className="font-semibold text-slate-700">{proj.department}</span>
                            <span>•</span>
                            <span className="font-mono">{proj.code}</span>
                          </div>
                        </div>
                        {onSelectProject && (
                          <button
                            onClick={() => onSelectProject(proj)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Analysis Center →</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* DEPTH-WISE CROSS-SECTION TRENCH VISUALIZER */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <h3 className="font-bold text-slate-900 text-sm">
                        Underground Depth-Wise Trench Sequencing
                      </h3>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">IRC:SP:55 & NMC Standard</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 font-mono text-xs">
                    {/* Top Layer: Road Surface */}
                    <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                      <span className="text-slate-900 font-bold">0.0m - 0.2m: Bituminous Concrete (BC) & WMM Surface</span>
                      <span className="text-emerald-700 text-[10px] font-sans font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Single Uniform Resurfacing</span>
                    </div>

                    {/* Shallow Utility */}
                    <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-between">
                      <span className="text-purple-900 font-semibold">0.8m - 1.2m: Telecom 5G OFC Ducts & Smart City Sensors</span>
                      <span className="text-purple-700 text-[10px] font-sans font-medium">Telecom & BharatNet</span>
                    </div>

                    {/* Power Utility */}
                    <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-between">
                      <span className="text-yellow-900 font-semibold">1.5m - 1.8m: MSEDCL 33kV Power Distribution Cables</span>
                      <span className="text-yellow-800 text-[10px] font-sans font-medium">Electricity Grid (MSEDCL)</span>
                    </div>

                    {/* Mid Gas Utility */}
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
                      <span className="text-amber-900 font-semibold">1.8m - 2.0m: MNGL PNG Medium-Pressure MDPE Gas Pipelines</span>
                      <span className="text-amber-800 text-[10px] font-sans font-medium">MNGL City Gas</span>
                    </div>

                    {/* Deepest Utility */}
                    <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-between">
                      <span className="text-sky-900 font-semibold">2.4m - 3.2m: 1200mm Potable Water Main & Gravity Drainage</span>
                      <span className="text-sky-800 text-[10px] font-sans font-medium">Water & Sewerage Board</span>
                    </div>
                  </div>
                </div>

                {/* SHARED COST ALLOCATION MATRIX */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-emerald-600" />
                      <h3 className="font-bold text-slate-900 text-sm">
                        Shared Restoration Cost Allocation
                      </h3>
                    </div>
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Net Municipal Savings: ₹{((activeCluster.estimatedCostSavedINR || 38200000) / 10000000).toFixed(2)} Cr
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {costAllocations.map((alloc: any) => (
                      <div
                        key={alloc.department}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
                      >
                        <div className="font-bold text-slate-900 text-xs">{alloc.department}</div>
                        <div className="text-[10px] text-slate-500">Share Ratio: {alloc.sharePercentage}%</div>
                        <div className="font-bold text-slate-900 text-sm">
                          Allocated: ₹{(alloc.allocatedCostINR / 100000).toFixed(2)} L
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          <span>Saved: ₹{(alloc.savingsINR / 100000).toFixed(2)} L</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MULTI-AGENCY SIGN-OFF & CONSENSUS BOARD */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <h3 className="font-bold text-slate-900 text-sm">
                        Inter-Agency Consensus & Approvals
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">
                      {signedCount} of {totalCount} Signed
                    </span>
                  </div>

                  <div className="space-y-2">
                    {approvalsList.map((appr: any) => (
                      <div
                        key={appr.department}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{appr.department}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {appr.approvedBy ? `Signed by: ${appr.approvedBy} (${appr.approvedByDesignation || 'Officer'})` : 'Awaiting sign-off'}
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            appr.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {appr.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Role-Based Consensus Action */}
                  {currentUser?.role === 'CONTRACTOR' || currentUser?.role === 'CITIZEN' ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-900">Consensus Progress Tracking:</span> As a registered contractor/citizen, you have read-only visibility into multi-agency joint trench consensus. Sign-offs are executed by departmental directors.
                      </div>
                    </div>
                  ) : hasAlreadyApproved ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-xs text-emerald-900">
                            Departmental Consensus Approved
                          </div>
                          <div className="text-[11px] text-emerald-700">
                            Signed by {myDeptApproval?.approvedBy || currentUser?.name} ({myDeptApproval?.approvedByDesignation || currentUser?.designation})
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                        Approved & Sealed
                      </span>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs text-slate-600">
                        Sign consensus as <strong className="text-slate-900">{currentUser?.name}</strong> ({currentUser?.designation})
                      </div>
                      <button
                        onClick={handleApproveCluster}
                        disabled={isApproving}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        {isApproving ? 'Recording Sign-off...' : 'Grant Multi-Agency Approval'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
