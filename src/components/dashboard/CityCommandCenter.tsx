/**
 * MR. MAYOR - Modern, Clean & User-Friendly City Command Center
 * Grounded in Data Truthfulness, Provenance Badges, and Zero-State Architecture.
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  GitMerge,
  ShieldCheck,
  Clock,
  IndianRupee,
  Layers,
  HardHat,
  ArrowUpRight,
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
  MessageSquareWarning,
  AlertCircle,
  Eye,
  FileCheck2,
  MapPin,
  ArrowRight,
  Check,
  CheckCircle,
  Info,
} from 'lucide-react';
import { CityAnalyticsSummary, Project, CoordinationCluster, Road, CitizenComplaint } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface CityCommandCenterProps {
  analytics: CityAnalyticsSummary;
  clusters: CoordinationCluster[];
  activeProjects: Project[];
  roads: Road[];
  complaints?: CitizenComplaint[];
  onRefreshData?: () => void;
  onNavigate: (tabId: string) => void;
  onOpenMasterDemo?: () => void;
}

export const CityCommandCenter: React.FC<CityCommandCenterProps> = ({
  analytics,
  clusters,
  activeProjects,
  roads,
  complaints = [],
  onRefreshData,
  onNavigate,
  onOpenMasterDemo,
}) => {
  const { currentUser } = useAuth();
  const [actingComplaintId, setActingComplaintId] = useState<string | null>(null);

  const canAccessAIAnalysis =
    currentUser &&
    ['COMMISSIONER', 'NODAL_OFFICER', 'ADMIN', 'DEPT_HEAD', 'EXECUTIVE_ENGINEER'].includes(currentUser.role);

  const handleQuickMayorAction = async (complaintId: string, actionType: 'INSPECTION' | 'BARRICADE_NOTICE' | 'RESOLVE') => {
    setActingComplaintId(complaintId);
    try {
      if (actionType === 'INSPECTION') {
        await api.actOnComplaint(complaintId, {
          status: 'UNDER_INVESTIGATION',
          assignedOfficer: 'Er. Mahesh Patil',
          assignedOfficerDesignation: 'Senior Quality Inspector',
          mayorActionNotice: 'Mayor Direct Order: Quality Inspection Squad dispatched for on-site trench verification.',
          actionBy: 'Municipal Commissioner / Mayor',
          actionByRole: 'COMMISSIONER',
        });
      } else if (actionType === 'BARRICADE_NOTICE') {
        await api.actOnComplaint(complaintId, {
          status: 'ACTION_TAKEN',
          mayorActionNotice: 'Executive Directive: 24-Hour Notice served for IRC:SP:55 reflective barricading & warning lights.',
          actionTakenNotes: 'Show-cause notice served to project contractor.',
          actionBy: 'Municipal Commissioner / Mayor',
          actionByRole: 'COMMISSIONER',
        });
      } else if (actionType === 'RESOLVE') {
        await api.actOnComplaint(complaintId, {
          status: 'RESOLVED',
          actionTakenNotes: 'Verified on-site by municipal ward supervisor. Rectification completed.',
          actionBy: 'Municipal Commissioner / Mayor',
          actionByRole: 'COMMISSIONER',
        });
      }
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update complaint');
    } finally {
      setActingComplaintId(null);
    }
  };

  const openComplaints = complaints.filter((c) => c.status === 'OPEN' || c.status === 'UNDER_INVESTIGATION');
  const criticalComplaints = complaints.filter((c) => c.priority === 'CRITICAL_HAZARD');
  const verifiedSavings = analytics.verifiedSavingsINR || 0;
  const projectedSavings = analytics.projectedSavingsINR || 0;
  const verifiedAvoided = analytics.verifiedExcavationsAvoided || 0;
  const projectedAvoided = analytics.projectedExcavationsAvoided || 0;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Welcome Card with Environment State */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                Operational System Live
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Nashik Municipal Corporation
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              City Infrastructure Command Center
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Detect underground utility conflicts before digging, synchronize multi-agency trenching schedules, issue digital QR permits, and manage citizen grievances in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenMasterDemo && (
              <button
                onClick={onOpenMasterDemo}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
              >
                <Zap className="w-4 h-4 text-amber-400 fill-current" />
                <span>3-Agency Demo</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('map')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <span>Open GIS Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Hero KPI Cards with Truthful Visual Labels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost Saved */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span className="font-semibold text-slate-700">Public Budget Saved</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-emerald-700 mt-2 tracking-tight">
              {verifiedSavings > 0 ? `₹${(verifiedSavings / 10000000).toFixed(2)} Cr` : '₹0'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {verifiedSavings > 0
                ? 'Verified completed savings'
                : 'No verified savings recorded yet'}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] flex items-center justify-between text-slate-500">
            <span className="font-medium">Projected: ₹{(projectedSavings / 100000).toFixed(1)} L</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[9px] uppercase">
              Modelled Estimate
            </span>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span className="font-semibold text-slate-700">Active Road Works</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                <HardHat className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
              {activeProjects.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {activeProjects.length > 0 ? `${activeProjects.length} Corridors with ongoing digs` : 'No active road works'}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] flex items-center justify-between text-slate-500">
            <span className="font-medium">Total Ingested: {analytics.totalProjects || 0}</span>
            <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-mono text-[9px] uppercase">
              Operational
            </span>
          </div>
        </div>

        {/* Utility Clashes / Avoided Digs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span className="font-semibold text-slate-700">Excavations Avoided</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <GitMerge className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-amber-700 mt-2 tracking-tight">
              {verifiedAvoided > 0 ? `${verifiedAvoided} Cuts` : '0 Cuts'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {verifiedAvoided > 0
                ? 'Verified duplicate cuts eliminated'
                : 'No completed coordination outcomes yet'}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] flex items-center justify-between text-slate-500">
            <span className="font-medium">{projectedAvoided} Potential Avoidable</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-mono text-[9px] uppercase">
              Projected
            </span>
          </div>
        </div>

        {/* Citizen Grievances */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span className="font-semibold text-slate-700">Citizen Grievances</span>
              <div className="p-2 rounded-xl bg-red-50 text-red-700 border border-red-200">
                <MessageSquareWarning className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
              {openComplaints.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {openComplaints.length > 0 ? `${openComplaints.length} Open grievances requiring review` : 'No open grievances'}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] flex items-center justify-between text-slate-500">
            <span className="font-medium">{criticalComplaints.length} High Severity Hazards</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[9px] uppercase">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Flagship AI Analysis Hero Promo Banner (Authority Only) */}
      {canAccessAIAnalysis && (
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                AI Decision Support
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
              AI Infrastructure Analysis Center
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Multi-agency conflict detection, traffic baseline assessment (CTTP 2016), depth hierarchy ordering, and official coordination reports.
            </p>
          </div>
          <button
            onClick={() => onNavigate('ai-analysis')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0 border border-blue-500"
          >
            <span>Open AI Analysis Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid: Coordinated Clusters vs Citizen Grievance Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Coordinated Corridors */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Active Coordinated Corridors</h3>
              <p className="text-xs text-slate-500">Multi-agency joint trenching plans</p>
            </div>
            <button
              onClick={() => onNavigate('coordination')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {clusters.length === 0 ? (
            <div className="p-8 text-center space-y-3 bg-slate-50 rounded-xl border border-slate-100">
              <GitMerge className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-xs font-bold text-slate-700">No Coordination Clusters Active</div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                No overlapping road excavations detected yet. Submit project proposals to detect clashes.
              </p>
              <button
                onClick={() => onNavigate('projects')}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer"
              >
                + Propose Project
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {clusters.slice(0, 3).map((cluster) => (
                <div
                  key={cluster.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 hover:bg-white transition-all space-y-2 cursor-pointer"
                  onClick={() => onNavigate('coordination')}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <span>{cluster.roadName}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {cluster.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {cluster.projects?.length || 0} Participating Agencies • Scheduled Window: {cluster.recommendedWindowStart} to {cluster.recommendedWindowEnd}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-700">
                        ₹{(cluster.estimatedCostSavedINR / 100000).toFixed(1)} L
                      </div>
                      <div className="text-[9px] text-slate-400">Modelled Savings</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Citizen Grievances Feed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Citizen Reports</h3>
              <p className="text-xs text-slate-500">Live grievance queue</p>
            </div>
            <button
              onClick={() => onNavigate('citizen')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {openComplaints.length === 0 ? (
            <div className="p-8 text-center space-y-2 bg-slate-50 rounded-xl border border-slate-100">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-xs font-bold text-slate-700">No Open Grievances</div>
              <p className="text-[11px] text-slate-500">All citizen complaints resolved.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {openComplaints.slice(0, 3).map((comp) => (
                <div key={comp.id} className="p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div className="font-bold text-slate-900">{comp.roadName}</div>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-50 text-red-700 border border-red-200">
                      {comp.category}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] line-clamp-2">{comp.description}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleQuickMayorAction(comp.id, 'INSPECTION')}
                      disabled={actingComplaintId === comp.id}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold cursor-pointer"
                    >
                      Dispatch Squad
                    </button>
                    <button
                      onClick={() => handleQuickMayorAction(comp.id, 'RESOLVE')}
                      disabled={actingComplaintId === comp.id}
                      className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
