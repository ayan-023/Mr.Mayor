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
    'SUBMITTED',
    'CONFLICT_DETECTED',
    'PENDING_APPROVAL',
    'APPROVED',
    'PERMITTED',
    'IN_PROGRESS',
    'COMPLETED',
  ];

  const getStatusBadge = (status: ProjectStatus, severity?: string) => {
    switch (status) {
      case 'CONFLICT_DETECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Conflict ({severity || 'HIGH'})
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> In Progress
          </span>
        );
      case 'APPROVED':
      case 'PERMITTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
            {status}
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
            Completed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Create Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1 flex items-center gap-1.5">
            {isCitizen ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Civic Road Infrastructure Tracker</span>
              </>
            ) : (
              <span>Civil Infrastructure Registry</span>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            {isCitizen ? 'Road Construction & Live Progress' : 'Infrastructure Projects'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {isCitizen
              ? 'Real-time public updates on which roads are undergoing infrastructure works, what is being done, and live completion progress.'
              : 'All registered road, water, drainage, and gas excavation projects with automated clash detection & progress tracking.'}
          </p>
        </div>

        {isUtilityDirector ? (
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Propose New Work</span>
          </button>
        ) : (
          <div className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium flex items-center gap-1.5 shrink-0">
            <Lock className="w-3.5 h-3.5" />
            <span>{isCitizen ? 'Citizen Public Feed' : 'Directory View Mode'}</span>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={isCitizen ? 'Search road, what is being done, or area...' : 'Search project name, road, code...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs"
          />
        </div>

        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-2xs font-medium"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                Dept: {dept}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-2xs font-medium"
          >
            {statuses.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CITIZEN-FOCUSED VIEW: Cards Grid with "What is Being Done" & Progress */}
      {isCitizen ? (
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
              No road construction projects found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => onSelectProject(proj)}
                  className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3.5 flex flex-col justify-between"
                >
                  {/* Top: Road Corridor & Status */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{proj.roadName}</span>
                      </div>
                      {getStatusBadge(proj.status, proj.conflictSeverity)}
                    </div>

                    <h3 className="font-bold text-base text-slate-900 leading-snug">
                      {proj.name}
                    </h3>

                    {/* What is being done description */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        What Is Being Done:
                      </div>
                      <p className="text-slate-700 leading-relaxed line-clamp-2">
                        {proj.description || `${proj.projectType} works along ${proj.lengthMeters}m corridor.`}
                      </p>
                      <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between border-t border-slate-200/60">
                        <span>Utility: <strong className="text-slate-800">{proj.department}</strong></span>
                        <span>Length: <strong className="text-slate-800">{proj.lengthMeters}m</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Construction Progress Bar */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-blue-900 font-bold">Construction Progress</span>
                      <span className="text-blue-700 font-bold font-mono text-sm">
                        {proj.progressPercentage || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${proj.progressPercentage || 0}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-600 pt-0.5 flex items-center justify-between">
                      <span>Phase: <strong className="text-slate-900">{proj.currentWorkPhase || 'Site Setup'}</strong></span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {proj.requiredCompletionDate ? `Opening: ${proj.requiredCompletionDate}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Dates & Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{proj.requiredStartDate} → {proj.requiredCompletionDate}</span>
                    </div>

                    <span className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1">
                      Inspect Details <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* OFFICIAL / CONTRACTOR VIEW: Table Layout with Full Metrics */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-900">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[9px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Code / Project</th>
                  <th className="py-3.5 px-3">Department</th>
                  <th className="py-3.5 px-3">Road Corridor</th>
                  <th className="py-3.5 px-3">Construction Progress</th>
                  <th className="py-3.5 px-3">Est. Budget</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      No infrastructure projects found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((proj) => (
                    <tr
                      key={proj.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => onSelectProject(proj)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 line-clamp-1">{proj.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">{proj.code}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-800">{proj.department}</span>
                        <div className="text-[10px] text-slate-500">{proj.projectType}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-slate-800 font-medium">{proj.roadName}</span>
                        <div className="text-[10px] text-slate-500">{proj.lengthMeters}m alignment</div>
                      </td>

                      {/* Verified Construction Progress Bar Column */}
                      <td className="py-3.5 px-3 min-w-[170px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500 font-medium truncate max-w-[100px]">
                              {proj.currentWorkPhase || 'Site Setup'}
                            </span>
                            <span className="font-bold text-slate-900 font-mono">
                              {proj.progressPercentage || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${proj.progressPercentage || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-slate-900 text-sm">
                        ₹{(proj.estimatedCostINR / 10000000).toFixed(2)} Cr
                      </td>
                      <td className="py-3.5 px-3">
                        {getStatusBadge(proj.status, proj.conflictSeverity)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProject(proj);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-[10px] font-bold border border-blue-200 hover:border-blue-600 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                            title="Run AI Infrastructure Coordination Analysis"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>AI Engine</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProject(proj);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-900 text-slate-700 hover:text-white text-[10px] font-bold border border-slate-200 hover:border-slate-900 transition-all cursor-pointer shadow-2xs"
                          >
                            Inspect →
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
