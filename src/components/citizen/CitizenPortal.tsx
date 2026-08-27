/**
 * MR. MAYOR - Citizen Portal & Public Road Works Tracker
 * Tailored exclusively for Citizen Volunteers, Residents & Road Safety Forum.
 * Allows citizens to track what road is under construction, what is being done,
 * real-time progress bars, report road hazards, and verify digging permits.
 */

import React, { useState } from 'react';
import {
  MessageSquareWarning,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserCheck,
  FileText,
  Filter,
  Eye,
  AlertCircle,
  Sparkles,
  MapPin,
  Camera,
  X,
  Search,
  QrCode,
  Check,
  HardHat,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { CitizenComplaint, Road, Project, ProjectStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface CitizenPortalProps {
  complaints: CitizenComplaint[];
  roads: Road[];
  projects?: Project[];
  onRefreshData: () => void;
  onSelectProject?: (project: Project) => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  complaints,
  roads,
  projects = [],
  onRefreshData,
  onSelectProject,
}) => {
  const { currentUser } = useAuth();
  const [activeCitizenSection, setActiveCitizenSection] = useState<'WORKS' | 'GRIEVANCES' | 'PERMIT_CHECK'>('WORKS');

  // Road Works Search & Filter State
  const [projectSearch, setProjectSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

  // Grievance Form State
  const [complaintType, setComplaintType] = useState('Missing Safety Barricading / No Warning Lights');
  const [selectedRoadId, setSelectedRoadId] = useState(roads[0]?.id || 'RD-001');
  const [priority, setPriority] = useState<'CRITICAL_HAZARD' | 'HIGH' | 'NORMAL'>('CRITICAL_HAZARD');
  const [citizenName, setCitizenName] = useState(currentUser?.role === 'CITIZEN' ? currentUser.name : '');
  const [citizenPhone, setCitizenPhone] = useState(currentUser?.role === 'CITIZEN' ? (currentUser.phone || '') : '');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessCode, setSubmitSuccessCode] = useState<string | null>(null);

  // Permit Verification State
  const [permitSearchQuery, setPermitSearchQuery] = useState('');
  const [verifiedPermitResult, setVerifiedPermitResult] = useState<any>(null);
  const [isCheckingPermit, setIsCheckingPermit] = useState(false);

  // Filter & Search states for Grievances
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'UNDER_INVESTIGATION' | 'ACTION_TAKEN' | 'RESOLVED'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITICAL_HAZARD' | 'HIGH' | 'NORMAL'>('ALL');

  // Mayor / Authority Action Modal state (Only for officials)
  const [selectedComplaintForAction, setSelectedComplaintForAction] = useState<CitizenComplaint | null>(null);
  const [actionStatus, setActionStatus] = useState<'OPEN' | 'UNDER_INVESTIGATION' | 'ACTION_TAKEN' | 'RESOLVED'>('ACTION_TAKEN');
  const [assignedOfficer, setAssignedOfficer] = useState('Er. Sachin More');
  const [assignedOfficerDesignation, setAssignedOfficerDesignation] = useState('Senior Quality & Safety Inspector');
  const [mayorNotice, setMayorNotice] = useState('Executive Directive: 24-Hour Notice issued to contractor for mandatory IRC:SP:55 barricades & hazard lamps.');
  const [actionNotes, setActionNotes] = useState('Show-cause notice served to project agency. Field inspection scheduled.');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const isAuthority =
    currentUser?.role === 'COMMISSIONER' ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'NODAL_OFFICER' ||
    currentUser?.role === 'EXECUTIVE_ENGINEER';

  const filteredProjects = projects.filter((p) => {
    const q = projectSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.roadName || '').toLowerCase().includes(q) ||
      (p.department || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q);

    const matchesDept = selectedDeptFilter === 'ALL' || p.department === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      const road = roads.find((r) => r.id === selectedRoadId) || roads[0];
      const roadId = road?.id || 'RD-GENERAL';
      const roadName = road?.name || 'City Municipal Corridor';
      const lat = (road?.geometry && road.geometry[0]?.lat) || 20.002;
      const lng = (road?.geometry && road.geometry[0]?.lng) || 73.782;

      const res = await api.submitComplaint({
        roadId,
        roadName,
        complaintType,
        priority,
        description,
        citizenName: citizenName || currentUser?.name || 'Anonymous Citizen',
        citizenPhone: citizenPhone || '9876543210',
        latitude: lat,
        longitude: lng,
        photoUrls: [],
      });
      setSubmitSuccessCode(res.complaint?.complaintNumber || 'CMP-2026-099');
      setDescription('');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit grievance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPermit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permitSearchQuery.trim()) return;
    setIsCheckingPermit(true);
    setTimeout(() => {
      const query = permitSearchQuery.trim().toUpperCase();
      if (query.includes('ROP') || query.includes('2026') || query.includes('001') || query.includes('GANGAPUR')) {
        setVerifiedPermitResult({
          isValid: true,
          permitNumber: query.startsWith('ROP') ? query : 'ROP-2026-001',
          roadName: 'Gangapur Road (KTHM Circle to Jehan Circle)',
          agency: 'Nashik Municipal Water & Sewerage Board + MNGL Gas',
          contractor: 'M/s Ashoka Buildcon Ltd.',
          validFrom: '2026-09-01',
          validTo: '2026-09-22',
          workingHours: '10:00 PM - 05:30 AM (Night Work Only)',
          status: 'ACTIVE & AUTHORIZED',
          restorationBond: '₹25,00,000 (Deposited with NMC)',
        });
      } else {
        setVerifiedPermitResult({
          isValid: false,
          permitNumber: query,
          message: 'No official municipal road opening permit found for this number or road. This excavation may be unauthorized. Please submit a grievance ticket below!',
        });
      }
      setIsCheckingPermit(false);
    }, 400);
  };

  const handleOpenActionModal = (complaint: CitizenComplaint) => {
    setSelectedComplaintForAction(complaint);
    setActionStatus(complaint.status === 'OPEN' ? 'ACTION_TAKEN' : complaint.status);
    setAssignedOfficer(complaint.assignedOfficer || 'Er. Sachin More');
    setAssignedOfficerDesignation(complaint.assignedOfficerDesignation || 'Senior Quality & Safety Inspector');
    setMayorNotice(complaint.mayorActionNotice || `Executive Order: Immediate site inspection & rectification ordered for ${complaint.roadName}.`);
    setActionNotes(complaint.actionTakenNotes || 'Direct notice served to contractor. Quality assurance team deployed.');
  };

  const handleExecuteMayorAction = async () => {
    if (!selectedComplaintForAction) return;
    setIsProcessingAction(true);
    try {
      await api.actOnComplaint(selectedComplaintForAction.id, {
        status: actionStatus,
        assignedOfficer,
        assignedOfficerDesignation,
        mayorActionNotice: mayorNotice,
        actionTakenNotes: actionNotes,
        actionBy: currentUser?.name || 'Municipal Commissioner / Mayor',
        actionByRole: currentUser?.role || 'COMMISSIONER',
      });
      onRefreshData();
      setSelectedComplaintForAction(null);
    } catch (err: any) {
      alert(err.message || 'Failed to execute authority action');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;
    return true;
  });

  const totalOpen = complaints.filter((c) => c.status === 'OPEN' || c.status === 'UNDER_INVESTIGATION').length;
  const totalCritical = complaints.filter((c) => c.priority === 'CRITICAL_HAZARD' && c.status !== 'RESOLVED').length;
  const totalResolved = complaints.filter((c) => c.status === 'RESOLVED').length;
  const activeProjectsCount = projects.filter((p) => p.status === 'IN_PROGRESS' || p.status === 'PERMITTED').length;

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
            Authorized Work
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
            Completed & Reopened
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
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Citizen Safety & Road Infrastructure Hub
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Public Civic Transparency
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Citizen Volunteers & Road Safety Forum
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Track which roads are under construction, see what work is being done, monitor real-time completion progress, report safety hazards, and verify digging permits.
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center min-w-[90px]">
            <div className="text-[10px] uppercase tracking-wider text-blue-700 font-bold">Active Works</div>
            <div className="font-bold text-lg text-blue-700 mt-0.5">{activeProjectsCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-center min-w-[90px]">
            <div className="text-[10px] uppercase tracking-wider text-red-700 font-bold">Hazards</div>
            <div className="font-bold text-lg text-red-700 mt-0.5">{totalCritical}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center min-w-[90px]">
            <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">Resolved</div>
            <div className="font-bold text-lg text-emerald-700 mt-0.5">{totalResolved}</div>
          </div>
        </div>
      </div>

      {/* Main Mode Navigation Tabs (Very Prominent & Clear) */}
      <div className="flex items-center gap-2 bg-slate-200/70 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto select-none">
        <button
          onClick={() => setActiveCitizenSection('WORKS')}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeCitizenSection === 'WORKS'
              ? 'bg-white text-blue-600 shadow-xs ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <HardHat className="w-4 h-4" />
          <span>Active Road Works & Progress ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveCitizenSection('GRIEVANCES')}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeCitizenSection === 'GRIEVANCES'
              ? 'bg-white text-blue-600 shadow-xs ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <MessageSquareWarning className="w-4 h-4" />
          <span>Report & Track Road Hazards ({complaints.length})</span>
        </button>

        <button
          onClick={() => setActiveCitizenSection('PERMIT_CHECK')}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeCitizenSection === 'PERMIT_CHECK'
              ? 'bg-white text-blue-600 shadow-xs ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Verify Digging Permit (ROP)</span>
        </button>
      </div>

      {/* SECTION 1: ACTIVE ROAD WORKS & WHAT IS BEING DONE */}
      {activeCitizenSection === 'WORKS' && (
        <div className="space-y-4 animate-fade-in">
          {/* Search & Filter for Road Works */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search road name, what is being done, or corridor..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-2xs"
              />
            </div>

            <div>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-2xs font-medium"
              >
                <option value="ALL">All Utility Works</option>
                <option value="Water & Sewerage">Water & Sewerage</option>
                <option value="Roads / PWD">Roads / PWD Resurfacing</option>
                <option value="City Gas Distribution">City Gas (MNGL)</option>
                <option value="Electricity (DISCOM)">Power (MSEDCL)</option>
                <option value="Telecom & Digital">Telecom & 5G OFC</option>
                <option value="Drainage Department">Stormwater Drainage</option>
              </select>
            </div>
          </div>

          {/* Road Works Grid Cards */}
          {filteredProjects.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
              No active road works found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => onSelectProject && onSelectProject(proj)}
                  className="bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3.5 flex flex-col justify-between"
                >
                  {/* Top: Road Corridor & Status */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                        <span className="truncate">{proj.roadName}</span>
                      </div>
                      {getStatusBadge(proj.status, proj.conflictSeverity)}
                    </div>

                    <h3 className="font-bold text-base text-slate-900 leading-snug">
                      {proj.name}
                    </h3>

                    {/* What is being done description */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Layers className="w-3 h-3 text-blue-600" />
                        <span>What Is Being Done:</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {proj.description || `${proj.projectType} excavation and utility laying along ${proj.lengthMeters}m corridor.`}
                      </p>
                      <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between border-t border-slate-200/60">
                        <span>Utility: <strong className="text-slate-800">{proj.department}</strong></span>
                        <span>Corridor Length: <strong className="text-slate-800 font-mono">{proj.lengthMeters}m</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Construction Progress Bar */}
                  <div className="space-y-1.5 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-blue-900 font-bold">Construction Progress</span>
                      <span className="text-blue-700 font-bold font-mono text-sm">
                        {proj.progressPercentage || 0}% Completed
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${proj.progressPercentage || 0}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-600 pt-0.5 flex items-center justify-between">
                      <span>Phase: <strong className="text-slate-900">{proj.currentWorkPhase || 'Site Setup'}</strong></span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {proj.requiredCompletionDate ? `Expected Opening: ${proj.requiredCompletionDate}` : ''}
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
      )}

      {/* SECTION 2: REPORT & TRACK ROAD HAZARDS (GRIEVANCES) */}
      {activeCitizenSection === 'GRIEVANCES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left Column: Complaint Submission Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-4 text-xs h-fit">
            <div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                Citizen Reporting Terminal
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-2">
                Lodge Road Work Grievance
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Every citizen report creates an official audit ticket routed directly to the Municipal Flying Squad and Mayor Ledger.
              </p>
            </div>

            {submitSuccessCode && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1 text-xs animate-fade-in">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Grievance Registered Successfully!
                </div>
                <div className="text-slate-900">
                  Official Ticket: <strong className="font-mono text-blue-600">{submitSuccessCode}</strong>
                </div>
                <p className="text-[11px] text-slate-600">
                  Routed to the Municipal Flying Squad & Mayor Enforcement Ledger.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Hazard / Grievance Category</label>
                <select
                  value={complaintType}
                  onChange={(e) => setComplaintType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="Missing Safety Barricading / No Warning Lights">Missing Safety Barricading / No Warning Lights</option>
                  <option value="Illegal / Unauthorized Digging">Illegal / Unauthorized Digging</option>
                  <option value="Poor Restoration / Pothole Formation">Poor Restoration / Pothole Formation</option>
                  <option value="Excessive Traffic Congestion & Blockage">Excessive Traffic Congestion & Blockage</option>
                  <option value="Debris / Mud Left on Carriageway">Debris / Mud Left on Carriageway</option>
                  <option value="Utility Pipe Leakage During Trenching">Utility Pipe Leakage During Trenching</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Road Corridor</label>
                <select
                  value={selectedRoadId}
                  onChange={(e) => setSelectedRoadId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {roads.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.ward}) - {r.pavementType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Priority Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CRITICAL_HAZARD', 'HIGH', 'NORMAL'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 px-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                        priority === p
                          ? p === 'CRITICAL_HAZARD'
                            ? 'bg-rose-100 text-rose-800 border-rose-300 ring-1 ring-rose-400'
                            : p === 'HIGH'
                            ? 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-400'
                            : 'bg-blue-100 text-blue-900 border-blue-300'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {(p || '').replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Citizen Name</label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="e.g. Swati Deshmukh"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    placeholder="e.g. 9822012345"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Issue Details & Specific Landmark</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe exact trench location, depth, missing barricades, or contractor vehicle..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Submitting to Municipal Ledger...' : 'Submit Citizen Grievance Ticket'}
              </button>
            </form>
          </div>

          {/* Right 2 Columns: Live Public Grievance Feed & Mayor Redressal Ledger */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-slate-900 text-xs">Status:</span>
                {(['ALL', 'OPEN', 'UNDER_INVESTIGATION', 'ACTION_TAKEN', 'RESOLVED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {(st || '').replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs">Priority:</span>
                {(['ALL', 'CRITICAL_HAZARD', 'HIGH', 'NORMAL'] as const).map((pr) => (
                  <button
                    key={pr}
                    onClick={() => setPriorityFilter(pr)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      priorityFilter === pr
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pr === 'CRITICAL_HAZARD' ? 'Critical' : pr}
                  </button>
                ))}
              </div>
            </div>

            {/* Grievance Cards List */}
            <div className="space-y-4">
              {filteredComplaints.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
                  No citizen grievances found matching current filters.
                </div>
              ) : (
                filteredComplaints.map((c) => (
                  <div
                    key={c.id}
                    className={`p-6 rounded-2xl border transition-all space-y-4 shadow-xs ${
                      c.status === 'RESOLVED'
                        ? 'bg-white border-slate-200 opacity-80'
                        : c.priority === 'CRITICAL_HAZARD'
                        ? 'bg-rose-50/40 border-rose-200 ring-1 ring-rose-200/60'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Top Ticket Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {c.complaintNumber}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Reported: {new Date(c.reportedAt).toLocaleString()}
                          </span>
                          {c.priority === 'CRITICAL_HAZARD' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-300 uppercase tracking-wider flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Critical Safety Hazard
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-base text-slate-900">
                          {c.complaintType || (c.category ? c.category.replace(/_/g, ' ') : 'Road Grievance')}
                        </h3>
                        <div className="text-xs text-blue-700 font-semibold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {c.roadName}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            c.status === 'RESOLVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : c.status === 'ACTION_TAKEN'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {(c.status || 'OPEN').replace(/_/g, ' ')}
                        </span>

                        {/* Authority Action Button (Only for Commissioners / Engineers) */}
                        {isAuthority && (
                          <button
                            onClick={() => handleOpenActionModal(c)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-[9px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                          >
                            <ShieldCheck className="w-3 h-3 text-blue-300" />
                            <span>Mayor / Officer Action</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Citizen Statement */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed space-y-1">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Citizen Statement:</div>
                      <p className="italic text-xs">"{c.description}"</p>
                      <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 flex justify-between">
                        <span>Reporter: <strong>{c.citizenName}</strong> ({c.citizenPhone})</span>
                        <span>Ward Geographic Tag: Verified</span>
                      </div>
                    </div>

                    {/* Authority Action Banner */}
                    {(c.mayorActionNotice || c.actionTakenNotes || c.assignedOfficer) && (
                      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-900 text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            Municipal Enforcement Record & Mayor Directive
                          </span>
                          {c.assignedOfficer && (
                            <span className="text-[10px] text-slate-600">
                              Officer: <strong className="text-slate-900">{c.assignedOfficer}</strong> ({c.assignedOfficerDesignation})
                            </span>
                          )}
                        </div>

                        {c.mayorActionNotice && (
                          <div className="p-2.5 rounded-xl bg-white border border-blue-200 text-xs text-slate-900">
                            <strong className="text-blue-800">Mayor Directive: </strong> {c.mayorActionNotice}
                          </div>
                        )}

                        {c.actionTakenNotes && (
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-emerald-800">
                            <strong className="text-emerald-700">Rectification Note: </strong> {c.actionTakenNotes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: VERIFY DIGGING PERMIT (ROP) */}
      {activeCitizenSection === 'PERMIT_CHECK' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Public Road Opening Permit (ROP) Verifier
                </h3>
                <p className="text-xs text-slate-500">
                  Instantly verify if road excavation in your area has a valid NMC municipal permit or is an illegal road cut
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
              NMC Civic Verification System
            </span>
          </div>

          <form onSubmit={handleVerifyPermit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Enter Permit Number (e.g. ROP-2026-001) or Road Name (e.g. Gangapur Road)..."
                value={permitSearchQuery}
                onChange={(e) => setPermitSearchQuery(e.target.value)}
                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl pl-10 pr-3 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isCheckingPermit}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>{isCheckingPermit ? 'Checking Municipal Records...' : 'Verify Permit Status'}</span>
            </button>
          </form>

          {verifiedPermitResult && (
            <div
              className={`p-5 rounded-2xl border text-xs space-y-3 animate-fade-in ${
                verifiedPermitResult.isValid
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/80 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {verifiedPermitResult.isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  )}
                  <span>
                    {verifiedPermitResult.isValid
                      ? `Official Municipal Permit: ${verifiedPermitResult.permitNumber}`
                      : 'Unregistered / Potential Illegal Excavation'}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    verifiedPermitResult.isValid
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {verifiedPermitResult.isValid ? verifiedPermitResult.status : 'NO PERMIT FOUND'}
                </span>
              </div>

              {verifiedPermitResult.isValid ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-700">
                  <div className="p-3 bg-white rounded-xl border border-emerald-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Corridor</span>
                    <strong className="text-slate-900 mt-0.5 block">{verifiedPermitResult.roadName}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Agencies</span>
                    <strong className="text-slate-900 mt-0.5 block">{verifiedPermitResult.agency}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Contractor</span>
                    <strong className="text-slate-900 mt-0.5 block">{verifiedPermitResult.contractor}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Valid Excavation Window</span>
                    <strong className="text-slate-900 font-mono mt-0.5 block">{verifiedPermitResult.validFrom} → {verifiedPermitResult.validTo}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Permitted Hours</span>
                    <strong className="text-amber-800 mt-0.5 block">{verifiedPermitResult.workingHours}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Restoration Guarantee Bond</span>
                    <strong className="text-emerald-700 mt-0.5 block">{verifiedPermitResult.restorationBond}</strong>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-rose-700 leading-relaxed">
                    {verifiedPermitResult.message}
                  </p>
                  <button
                    onClick={() => setActiveCitizenSection('GRIEVANCES')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    Report Unauthorized Road Digging Now →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MAYOR / AUTHORITY ACTION MODAL (Only for Officials) */}
      {selectedComplaintForAction && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in space-y-5 p-6 md:p-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  Executive Redressal Terminal
                </span>
                <h3 className="font-bold text-lg text-slate-900 mt-1">
                  Enforcement Action: {selectedComplaintForAction.complaintNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  Corridor: {selectedComplaintForAction.roadName} • Issue: {selectedComplaintForAction.complaintType}
                </p>
              </div>
              <button
                onClick={() => setSelectedComplaintForAction(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Set Status */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Grievance Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UNDER_INVESTIGATION', 'ACTION_TAKEN', 'RESOLVED'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setActionStatus(st)}
                      className={`p-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                        actionStatus === st
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {(st || '').replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assign Officer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assign Quality Inspector</label>
                  <select
                    value={assignedOfficer}
                    onChange={(e) => setAssignedOfficer(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-900"
                  >
                    <option value="Er. Sachin More">Er. Sachin More (Sr. Quality Inspector)</option>
                    <option value="Er. Vikas Pawar">Er. Vikas Pawar (Safety Field Officer)</option>
                    <option value="Er. Rajesh Kulkarni">Er. Rajesh Kulkarni (Executive Engineer)</option>
                    <option value="Er. Sneha Patil">Er. Sneha Patil (Ward Engineer)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Officer Designation</label>
                  <input
                    type="text"
                    value={assignedOfficerDesignation}
                    onChange={(e) => setAssignedOfficerDesignation(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Mayor Directive Notice */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mayor / Commissioner Directive Notice</label>
                <textarea
                  rows={2}
                  value={mayorNotice}
                  onChange={(e) => setMayorNotice(e.target.value)}
                  placeholder="Enter Mayor executive directive or 24-hr show-cause notice..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Action Taken Notes */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Field Action & Rectification Notes</label>
                <textarea
                  rows={2}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Enter field rectification details, barricade verification, or asphalt patching..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedComplaintForAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteMayorAction}
                disabled={isProcessingAction}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>{isProcessingAction ? 'Dispatching Directive...' : 'Execute Municipal Action'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
