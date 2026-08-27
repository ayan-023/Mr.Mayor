/**
 * MR. MAYOR - Project Registry & Public Road Construction Tracker
 * Displays registered road projects with real-time verified Progress Bars for all authorities
 * and a dedicated, citizen-friendly "What is Being Done & Live Progress" view for the public.
 */

import React, { useState, useMemo, useDeferredValue } from 'react';
import {
  Folders,
  Plus,
  Search,
  AlertTriangle,
  Lock,
  ArrowRight,
  Clock,
  HardHat,
  Calendar,
  Layers,
  MapPin,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Project, ProjectStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ProjectListProps {
  projects: Project[];
  onOpenCreateModal: () => void;
  onSelectProject: (project: Project) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onOpenCreateModal,
  onSelectProject,
}) => {
  const { currentUser } = useAuth();
  const isCitizen = currentUser?.role === 'CITIZEN';

  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Strictly check if the user is a designated Utility Director or Municipal Infrastructure Lead
  const isUtilityDirector = Boolean(
    currentUser &&
      (currentUser.role === 'EXECUTIVE_ENGINEER' ||
        currentUser.role === 'DEPT_HEAD' ||
        currentUser.role === 'NODAL_OFFICER' ||
        currentUser.role === 'COMMISSIONER' ||
        currentUser.role === 'ADMIN') &&
      currentUser.department !== 'Traffic Police Authority' &&
      currentUser.department !== 'Independent Contractor' &&
      currentUser.department !== 'General Public'
  );

  const filteredProjects = useMemo(() => {
    const sTerm = deferredSearch.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesSearch =
        !sTerm ||
        (p.name || '').toLowerCase().includes(sTerm) ||
        (p.code || '').toLowerCase().includes(sTerm) ||
        (p.roadName || '').toLowerCase().includes(sTerm) ||
        (p.department || '').toLowerCase().includes(sTerm) ||
        (p.description || '').toLowerCase().includes(sTerm);

      const matchesDept = selectedDept === 'ALL' || p.department === selectedDept;
      const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [projects, deferredSearch, selectedDept, selectedStatus]);

  const departments = [
    'ALL',
    'Roads / PWD',
    'Water & Sewerage',
    'Drainage Department',
    'Electricity (DISCOM)',
    'Telecom & Digital',
    'City Gas Distribution',
  ];

  const statuses = [
    'ALL',
    'PROPOSED',
    'ANALYSIS_READY',
    'TECHNICAL_APPROVED',
    'APPROVED',
    'PERMIT_ISSUED',
    'IN_PROGRESS',
    'COMPLETED',
  ];

  const getStatusBadge = (status: ProjectStatus, severity?: string) => {
    switch (status) {
      case 'PROPOSED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-800 border border-slate-300 uppercase tracking-wider">
            Proposed (Pre-Analysis)
          </span>
        );
      case 'ANALYSIS_READY':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-900 border border-blue-200 flex items-center gap-1 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-blue-700" /> Analysis Ready
          </span>
        );
      case 'UNDER_TECHNICAL_REVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 text-purple-800 border border-purple-200 uppercase tracking-wider">
            Technical Review
          </span>
        );
      case 'TECHNICAL_APPROVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-900 border border-amber-300 uppercase tracking-wider">
            Technically Approved
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Sanctioned
          </span>
        );
      case 'PERMIT_ISSUED':
      case 'PERMITTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
            Permit Issued
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> In Progress
          </span>
        );
      case 'WORK_COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-teal-50 text-teal-800 border border-teal-200 uppercase tracking-wider">
            Work Completed (QC Due)
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
            Closed & Protected
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider">
            Rejected
          </span>
        );
      case 'MODIFICATION_REQUESTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
            Modification Requested
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
              INFRASTRUCTURE REGISTRY
            </span>
            <span className="text-xs text-slate-500 font-mono">{filteredProjects.length} Corridors Active</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Municipal Infrastructure Proposals & Projects</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time project tracking across all utility departments, road ownership divisions, and contractor execution stages.
          </p>
        </div>

        {isUtilityDirector && (
          <button
            onClick={onOpenCreateModal}
            className="px-5 py-2.5 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-950 transition-all shadow-xs flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Propose New Project</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects, corridors, contractors..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-900"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-hidden focus:border-blue-900"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'ALL' ? 'All Departments' : d}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-hidden focus:border-blue-900"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <Folders className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No Projects Found</h3>
            <p className="text-xs text-slate-500">No project proposals match your search and filter criteria.</p>
          </div>
        ) : (
          filteredProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProject(p)}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-900/50 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {p.code}
                  </span>
                  {getStatusBadge(p.status, p.conflictSeverity)}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{p.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{p.roadName}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                    <span>Progress</span>
                    <strong className="text-blue-900">{p.progressPercentage || 0}%</strong>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-900 rounded-full transition-all duration-300"
                      style={{ width: `${p.progressPercentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-700 truncate max-w-[150px]">{p.department}</span>
                <span className="font-bold text-slate-900 font-mono">
                  ₹{((p.estimatedCostINR || 2000000) / 100000).toFixed(1)}L
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
