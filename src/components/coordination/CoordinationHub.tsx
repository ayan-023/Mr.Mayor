/**
 * MR. MAYOR - Multi-Agency Joint Digging & Coordination Case Hub
 * Centralizes all coordination cases, AI multi-candidate planning, department concurrence,
 * leadership approval packages, contractor allocation, stage-based execution, and QC gating.
 */

import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  FileCheck2,
  HardHat,
  UserCheck,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Lock,
  Plus,
  XCircle,
  Eye,
  FileText,
} from 'lucide-react';
import { CoordinationCase, Project, ExecutionStrategy } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { WorkflowLifecycleBanner } from '../common/WorkflowLifecycleBanner';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface CoordinationHubProps {
  clusters?: any[];
  onRefreshData: () => void;
  onSelectProject?: (project: Project) => void;
}

export const CoordinationHub: React.FC<CoordinationHubProps> = ({
  onRefreshData,
  onSelectProject,
}) => {
  const { currentUser } = useAuth();
  const [cases, setCases] = useState<CoordinationCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AI_PLANS' | 'TECH_REVIEW' | 'LEADERSHIP' | 'CONTRACTOR' | 'EXECUTION_QC' | 'AUDIT'>('OVERVIEW');

  // Interactive Form States
  const [strategyReason, setStrategyReason] = useState<string>('');
  const [concurrenceNotes, setConcurrenceNotes] = useState<string>('');
  const [leadershipRemarks, setLeadershipRemarks] = useState<string>('');
  const [selectedContractorId, setSelectedContractorId] = useState<string>('CTR-NSK-01');
  const [stageNotes, setStageNotes] = useState<string>('');
  const [qcRemarks, setQcRemarks] = useState<string>('');
  const [contractorsList, setContractorsList] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load coordination cases from API
  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const [casesRes, contractorsRes] = await Promise.all([
        api.getCoordinationCases(true),
        api.getContractors(),
      ]);
      const loadedCases = casesRes.cases || [];
      setCases(loadedCases);
      setContractorsList(contractorsRes.contractors || []);
      if (loadedCases.length > 0 && !selectedCaseId) {
        setSelectedCaseId(loadedCases[0].id);
      }
    } catch (err: any) {
      console.error('Failed to fetch coordination cases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const activeCase = cases.find((c) => c.id === selectedCaseId || c.caseNumber === selectedCaseId) || cases[0];

  // RBAC checks
  const isCommissionerOrLeadership =
    currentUser?.role === 'COMMISSIONER' ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'NODAL_OFFICER';

  const isExecutiveEngineer =
    currentUser?.role === 'EXECUTIVE_ENGINEER' ||
    currentUser?.role === 'DEPT_HEAD';

  const isInspector = currentUser?.role === 'INSPECTOR';
  const isContractor = currentUser?.role === 'CONTRACTOR';

  // Check if current user's department is the owner of this case
  const isCaseOwner = activeCase?.participatingDepartments?.some(
    (d) => d.isOwner && (d.departmentName === currentUser?.department || currentUser?.role === 'COMMISSIONER' || currentUser?.role === 'ADMIN')
  );

  // Handlers for Workflow State Transitions
  const handleSelectStrategy = async (strategy: ExecutionStrategy, planId: 'PLAN_A' | 'PLAN_B' | 'PLAN_C') => {
    if (!activeCase || !currentUser) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      await api.recordCaseStrategy(activeCase.id, {
        strategy,
        planId,
        userId: currentUser.id,
        reason: strategyReason || `Execution strategy ${strategy} selected by ${currentUser.name}`,
      });
      setFeedback({ type: 'success', message: `Strategy ${strategy} confirmed. Case updated to Technical Review.` });
      await fetchCases();
      onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to record strategy' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGrantConcurrence = async (status: 'CONCURRED' | 'CONCERNS_RAISED' | 'REJECTED') => {
    if (!activeCase || !currentUser) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      await api.recordDepartmentConcurrence(activeCase.id, {
        departmentName: currentUser.department,
        status,
        notes: concurrenceNotes || `Subsurface technical concurrence recorded as ${status} by ${currentUser.name}`,
        userId: currentUser.id,
      });
      setFeedback({ type: 'success', message: `Departmental concurrence recorded as ${status}.` });
      await fetchCases();
      onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to record concurrence' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProposeToLeadership = async () => {
    if (!activeCase || !currentUser) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      await api.proposeCaseToLeadership(activeCase.id, {
        userId: currentUser.id,
        notes: 'Technical review concluded. Submitted for statutory leadership sanction.',
      });
      setFeedback({ type: 'success', message: 'Coordination Case proposed to Leadership for sanction.' });
      await fetchCases();
      onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit proposal' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLeadershipDecision = async (decision: 'APPROVED' | 'REJECTED' | 'RETURNED_FOR_REVISION') => {
    if (!activeCase || !currentUser) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      await api.recordLeadershipDecision(activeCase.id, {
        decision,
        remarks: leadershipRemarks || `Statutory ${decision} order issued by ${currentUser.name} (${currentUser.designation})`,
        userId: currentUser.id,
      });
      setFeedback({ type: 'success', message: `Leadership decision recorded: ${decision}` });
      await fetchCases();
      onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to record leadership decision' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAllocateContractor = async () => {
    if (!activeCase || !currentUser) return;
    const selectedContractor = contractorsList.find((c) => c.contractorId === selectedContractorId) || contractorsList[0];
    setIsProcessing(true);
    setFeedback(null);
    try {
      await api.allocateContractor(activeCase.id, {
        contractorId: selectedContractor?.contractorId || 'CTR-NSK-01',
        contractorName: selectedContractor?.contractorName || 'M/s InfraTech Construction Ltd.',
        specialization: selectedContractor?.specialization || 'Multi-Utility Micro-Trenching',
        workScope: `Single-window excavation and shared pipe/cable laying along ${activeCase.roadName}`,
        userId: currentUser.id,
      });
      setFeedback({ type: 'success', message: 'Contractor assigned and mobilized. Permit is now active.' });
      await fetchCases();
      onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to assign contractor' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContractorCompleteStage = async (stageId: string) => {
    if (!activeCase || !currentUser) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      await api.updateExecutionStage(activeCase.id, stageId, {
        status: 'COMPLETED_PENDING_QC',
        notes: stageNotes || 'Stage work completed as per engineering drawings. Ready for QC inspection.',
        photos: ['https://images.unsplash.com/photo-1541888946425-d0fbb180c5f2?w=800'],
        userId: currentUser.id,
      });
      setFeedback({ type: 'success', message: 'Stage marked complete. QC inspection requested!' });
      await fetchCases();
      onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update stage' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssignQCInspector = async (stageId: string) => {
    if (!activeCase || !currentUser) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      await api.assignStageQC(activeCase.id, stageId, {
        inspectorId: 'usr-nsk-05',
        inspectorName: 'Er. Mahesh Patil (Senior Quality & Safety Inspector)',
        userId: currentUser.id,
      });
      setFeedback({ type: 'success', message: 'QC Inspector Er. Mahesh Patil assigned to stage inspection.' });
      await fetchCases();
      onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to assign inspector' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecordQCDecision = async (stageId: string, result: 'PASS' | 'FAIL') => {
    if (!activeCase || !currentUser) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      await api.recordStageQCDecision(activeCase.id, stageId, {
        result,
        remarks: qcRemarks || (result === 'PASS' ? 'Compaction density > 95% and barricades fully verified. Passed.' : 'Compaction density below 90%. Rework ordered on sub-base layer.'),
        checklist: [
          { item: 'Approved Depth & Alignment Alignment Verified', passed: result === 'PASS' },
          { item: 'Utility Clearance & Pipe Bedding Integrity', passed: result === 'PASS' },
          { item: 'Compaction Density Test (MoRTH Spec)', passed: result === 'PASS' },
          { item: 'IRC:SP:55 Safety Barricading & Flasher Lights', passed: true },
        ],
        userId: currentUser.id,
      });
      setFeedback({
        type: 'success',
        message: result === 'PASS' ? 'Stage QC PASSED. Next stage unlocked!' : 'Stage QC FAILED. Rework notice issued to contractor.',
      });
      await fetchCases();
      onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to record QC result' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalizeClosure = async () => {
    if (!activeCase || !currentUser) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      await api.finalizeCaseClosure(activeCase.id, {
        userId: currentUser.id,
      });
      setFeedback({ type: 'success', message: 'Project closed and verified outcomes committed to Digital Road Twin history!' });
      await fetchCases();
      onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to close case' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-600 font-bold tracking-wide">
          Loading Municipal Coordination Cases & Live Lifecycles...
        </p>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
        <GitMerge className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Coordination Cases Found</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Coordination opportunities are automatically clustered when related projects are submitted along the same corridor.
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 pb-16">
        {/* Top Header Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200 uppercase font-mono">
                SINGLE-WINDOW MUNICIPAL HUB
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {cases.length} Registered Cases
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <GitMerge className="w-6 h-6 text-blue-900" />
              <span>Joint Digging & Coordination Cases</span>
            </h1>
          </div>

          {/* Quick Case Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Active Case:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 cursor-pointer shadow-2xs focus:ring-2 focus:ring-blue-900"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} • {c.corridorName.slice(0, 35)}...
                </option>
              ))}
            </select>
            <button
              onClick={fetchCases}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Refresh Cases"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Universal Workflow Lifecycle Banner */}
        {activeCase && (
          <WorkflowLifecycleBanner
            status={activeCase.status}
            strategy={activeCase.selectedStrategy || activeCase.recommendedStrategy}
            caseNumber={activeCase.caseNumber}
            roadName={activeCase.roadName}
            departmentsCount={activeCase.participatingDepartments?.length || 1}
            projectsCount={activeCase.relatedProjectIds?.length || 1}
            currentActorRole={
              activeCase.status === 'LEADERSHIP_REVIEW'
                ? 'Municipal Commissioner (IAS)'
                : activeCase.status === 'CONTRACTOR_ALLOCATED' || activeCase.status === 'APPROVED'
                ? 'Executive Engineer (Owning Dept)'
                : activeCase.status === 'IN_EXECUTION'
                ? 'Assigned EPC Contractor'
                : activeCase.status.includes('QC')
                ? 'Quality & Safety Inspector'
                : 'Utility Executive Engineer'
            }
            currentActorDepartment={
              activeCase.status === 'LEADERSHIP_REVIEW'
                ? 'Municipal Leadership & Higher Authority'
                : activeCase.participatingDepartments?.find((d) => d.isOwner)?.departmentName || 'Lead Utility Dept'
            }
            onRefresh={fetchCases}
          />
        )}

        {/* Unified Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
          {[
            { id: 'OVERVIEW', label: 'Case Overview & GIS', icon: Layers },
            { id: 'AI_PLANS', label: 'AI Candidate Plans', icon: Sparkles },
            { id: 'TECH_REVIEW', label: 'Technical Review & Concurrence', icon: UserCheck },
            { id: 'LEADERSHIP', label: 'Leadership Sanction Package', icon: ShieldCheck },
            { id: 'CONTRACTOR', label: 'Contractor Allocation', icon: HardHat },
            { id: 'EXECUTION_QC', label: 'Stage Execution & QC Gate', icon: FileCheck2 },
            { id: 'AUDIT', label: 'Audit Timeline', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-300' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & GIS */}
        {activeTab === 'OVERVIEW' && activeCase && (
          <div className="space-y-6 animate-in fade-in">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-500">CORRIDOR PROJECTS</div>
                <div className="text-xl font-black text-slate-900 mt-1">
                  {activeCase.relatedProjectIds?.length || 1} Projects
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {activeCase.participatingDepartments?.length || 1} Departments
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-500">PROJECTED SAVINGS</div>
                <div className="text-xl font-black text-emerald-700 mt-1">
                  ₹{(activeCase.projectedCostSavedINR / 100000).toFixed(1)} Lakhs
                </div>
                <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                  {activeCase.projectedExcavationsAvoided} Redundant Cuts Avoided
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-500">TRAFFIC MITIGATION</div>
                <div className="text-xl font-black text-blue-900 mt-1">
                  {activeCase.trafficDisruptionReductionPct}% Delay Reduction
                </div>
                <div className="text-[10px] text-blue-600 font-medium mt-0.5">
                  CTTP 2016 Baseline Model
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-500">EXECUTION WINDOW</div>
                <div className="text-xl font-black text-slate-900 mt-1">
                  {activeCase.executionWindow?.durationDays || 60} Days
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Unified Single-Window Window
                </div>
              </div>
            </div>

            {/* Participating Departments & Concurrence Matrix */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-900" />
                    <span>Participating Municipal Utility Agencies & Concurrence Status</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Explicit department ownership vs technical concurrence recorded for subsurface pipe/cable layout.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activeCase.participatingDepartments?.map((dept, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      dept.isOwner
                        ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {dept.departmentName}
                      </span>
                      {dept.isOwner && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-200 text-blue-900">
                          LEAD OWNER
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="text-slate-400">Officer:</span>
                        <span className="font-semibold text-slate-800">{dept.officerName || 'Designated EE'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="text-slate-400">Designation:</span>
                        <span className="text-slate-700">{dept.officerDesignation || 'Executive Engineer'}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Concurrence:</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            dept.concurrenceStatus === 'CONCURRED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : dept.concurrenceStatus === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {dept.concurrenceStatus}
                        </span>
                      </div>
                      {dept.concurrenceNotes && (
                        <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200/40">
                          "{dept.concurrenceNotes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Depth Cross-Section & Execution Sequence */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-900" />
                <span>Geotechnical Subsurface Cross-Section & Depth Ordering</span>
              </h3>
              <p className="text-xs text-slate-500">
                Layered depth sequence ensures deepest utilities are installed first, completely preventing re-excavation.
              </p>

              <div className="space-y-2.5">
                {activeCase.executionSequence?.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <span className="font-semibold text-slate-800 flex-1">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI CANDIDATE PLANS */}
        {activeTab === 'AI_PLANS' && activeCase && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-bold">AI Multi-Candidate Coordination Analysis</h3>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-300/30">
                  {activeCase.aiConfidence}% CONFIDENCE
                </span>
              </div>
              <p className="text-xs text-slate-200 max-w-3xl leading-relaxed">
                {activeCase.aiSummary}
              </p>
            </div>

            {/* Candidate Plans Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {activeCase.candidatePlans?.map((plan) => {
                const isSelected = activeCase.selectedPlanId === plan.planId;
                return (
                  <div
                    key={plan.planId}
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-white border-blue-900 ring-2 ring-blue-900 shadow-md'
                        : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-800">
                          {plan.planId}
                        </span>
                        {plan.isRecommended && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-700" />
                            RECOMMENDED
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {plan.planName}
                      </h4>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {plan.strategySummary}
                      </p>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Duration:</span>
                          <span className="font-bold text-slate-800">{plan.totalDurationDays} Days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Road Cuts:</span>
                          <span className="font-bold text-slate-800">{plan.excavationEventsCount} Cuts</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Financial Saving:</span>
                          <span className="font-bold text-emerald-700">₹{(plan.estimatedFinancialSavingINR / 100000).toFixed(1)}L</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Traffic Delay Cut:</span>
                          <span className="font-bold text-blue-900">{plan.trafficDisruptionReductionPct}%</span>
                        </div>
                      </div>

                      {/* Pros & Cons */}
                      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase">Advantages:</span>
                          {plan.pros?.map((p, i) => (
                            <div key={i} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{p}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-rose-700 uppercase">Risks:</span>
                          {plan.cons?.map((c, i) => (
                            <div key={i} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                              <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                              <span>{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    {isCaseOwner && (
                      <div className="pt-4 mt-4 border-t border-slate-100">
                        <button
                          onClick={() =>
                            handleSelectStrategy(
                              plan.planId === 'PLAN_A' || plan.planId === 'PLAN_B' ? 'COORDINATED' : 'STANDALONE',
                              plan.planId
                            )
                          }
                          disabled={isProcessing}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-900 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Current Selected Plan</span>
                            </>
                          ) : (
                            <>
                              <span>Select {plan.planId} Strategy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: TECHNICAL REVIEW & CONCURRENCE */}
        {activeTab === 'TECH_REVIEW' && activeCase && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-900" />
                  <span>Technical Engineer Decision & Departmental Concurrence Workspace</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Owning department engineer sets the technical strategy; affected utility engineers review subsurface clearance.
                </p>
              </div>

              {/* Action 1: Affected Department Concurrence */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Affected Utility Clearance (Current User: {currentUser?.department})
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Logged as {currentUser?.name} ({currentUser?.designation})
                  </span>
                </div>

                <textarea
                  value={concurrenceNotes}
                  onChange={(e) => setConcurrenceNotes(e.target.value)}
                  placeholder="Enter technical notes regarding pipeline alignment, GPR verification, or depth clearances..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-900 resize-none h-20"
                />

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => handleGrantConcurrence('CONCURRED')}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Grant Subsurface Concurrence</span>
                  </button>
                  <button
                    onClick={() => handleGrantConcurrence('CONCERNS_RAISED')}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Raise Utility Concern</span>
                  </button>
                  <button
                    onClick={() => handleGrantConcurrence('REJECTED')}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Object / Reject Alignment</span>
                  </button>
                </div>
              </div>

              {/* Action 2: Lead Owning Engineer Propose to Leadership */}
              {isCaseOwner && (
                <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 space-y-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-blue-950">
                      Lead Department Technical Approval & Proposal to Leadership
                    </span>
                    <p className="text-xs text-blue-800">
                      As the lead utility owner ({activeCase.participatingDepartments?.find((d) => d.isOwner)?.departmentName}), you have statutory authority to forward this joint excavation dossier to the Municipal Commissioner for final sanction.
                    </p>
                  </div>

                  <button
                    onClick={handleProposeToLeadership}
                    disabled={isProcessing || activeCase.status === 'LEADERSHIP_REVIEW'}
                    className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Propose Coordinated Package to Leadership</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: LEADERSHIP SANCTION PACKAGE */}
        {activeTab === 'LEADERSHIP' && activeCase && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200 uppercase font-mono">
                    STATUTORY HIGHER AUTHORITY REVIEW
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Municipal Commissioner & Higher Authority Decision Dossier
                  </h3>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400">Current Status:</span>
                  <div className="font-bold text-slate-800">{activeCase.status}</div>
                </div>
              </div>

              {/* Dossier Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800">Proposed Strategy & Financials</div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Selected Strategy:</span>
                    <span className="font-bold text-blue-900">{activeCase.selectedStrategy} ({activeCase.selectedPlanId})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Public Budget Savings:</span>
                    <span className="font-bold text-emerald-700">₹{(activeCase.projectedCostSavedINR / 100000).toFixed(1)} Lakhs</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Avoided Road Cuts:</span>
                    <span className="font-bold text-slate-800">{activeCase.projectedExcavationsAvoided} Cuts</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800">Department Concurrence Matrix</div>
                  {activeCase.participatingDepartments?.map((d, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-600">{d.departmentName}:</span>
                      <span className="font-bold text-emerald-700">{d.concurrenceStatus}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commissioner Decision Action */}
              {isCommissionerOrLeadership ? (
                <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-purple-950">
                      Authority Sanction Order (Dr. Pravin Gedam IAS / Higher Authority)
                    </span>
                    <p className="text-xs text-purple-900">
                      Issuing approval authorizes single-window contractor mobilization, permit issuance, and binding cost-sharing.
                    </p>
                  </div>

                  <textarea
                    value={leadershipRemarks}
                    onChange={(e) => setLeadershipRemarks(e.target.value)}
                    placeholder="Enter statutory sanction order remarks, special traffic conditions, or revision instructions..."
                    className="w-full p-3 rounded-xl border border-purple-300 text-xs bg-white focus:ring-2 focus:ring-purple-900 resize-none h-20"
                  />

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleLeadershipDecision('APPROVED')}
                      disabled={isProcessing}
                      className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Grant Statutory Approval</span>
                    </button>
                    <button
                      onClick={() => handleLeadershipDecision('RETURNED_FOR_REVISION')}
                      disabled={isProcessing}
                      className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Return for Modification</span>
                    </button>
                    <button
                      onClick={() => handleLeadershipDecision('REJECTED')}
                      disabled={isProcessing}
                      className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Application</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Statutory approval actions are restricted to Municipal Commissioner & Higher Authority.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: CONTRACTOR ALLOCATION */}
        {activeTab === 'CONTRACTOR' && activeCase && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HardHat className="w-4 h-4 text-blue-900" />
                  <span>Verified EPC Contractor Allocation & Site Mobilization</span>
                </h3>
                <p className="text-xs text-slate-500">
                  After leadership approval, the lead owning engineer assigns a vetted contractor to execute the single-window trench.
                </p>
              </div>

              {/* Current Allocation Record */}
              {activeCase.contractorAllocations && activeCase.contractorAllocations.length > 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">Assigned EPC Contractor:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">
                      MOBILIZED
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {activeCase.contractorAllocations[0].contractorName} ({activeCase.contractorAllocations[0].contractorId})
                  </div>
                  <p className="text-slate-600">
                    Scope: {activeCase.contractorAllocations[0].workScope}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  No contractor currently assigned. Select a verified contractor below to mobilize the corridor.
                </div>
              )}

              {/* Assignment Form */}
              {(isCaseOwner || isCommissionerOrLeadership) && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <label className="font-bold text-slate-800">Select Verified Municipal Contractor:</label>
                  <select
                    value={selectedContractorId}
                    onChange={(e) => setSelectedContractorId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 cursor-pointer"
                  >
                    {contractorsList.map((c) => (
                      <option key={c.contractorId} value={c.contractorId}>
                        {c.contractorName} • {c.specialization} ({c.capacity})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleAllocateContractor}
                    disabled={isProcessing}
                    className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <HardHat className="w-4 h-4" />
                    <span>Assign Contractor & Activate Road Opening Permit</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: STAGE EXECUTION & QC GATE */}
        {activeTab === 'EXECUTION_QC' && activeCase && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-blue-900" />
                    <span>6-Stage Execution & Hard Quality Control (QC) Gate</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Contractors complete stages sequentially. A failed QC locks the workflow and requires verified rework.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {activeCase.status === 'ALL_STAGES_COMPLETED' && (
                    <button
                      onClick={handleFinalizeClosure}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify Final Restoration & Commit Road History</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Stages List */}
              <div className="space-y-4">
                {activeCase.stages?.map((stage, idx) => {
                  const isCurrentActive = stage.status === 'IN_PROGRESS' || stage.status === 'COMPLETED_PENDING_QC' || stage.status === 'QC_IN_PROGRESS' || stage.status === 'REWORK_REQUIRED';
                  return (
                    <div
                      key={stage.stageId}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        stage.status === 'QC_PASSED'
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : stage.status === 'REWORK_REQUIRED'
                          ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-300'
                          : isCurrentActive
                          ? 'bg-white border-blue-900 ring-2 ring-blue-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {stage.sequence}
                          </span>
                          <span className="font-bold text-xs text-slate-900">
                            {stage.name}
                          </span>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                            stage.status === 'QC_PASSED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : stage.status === 'REWORK_REQUIRED'
                              ? 'bg-rose-100 text-rose-800'
                              : stage.status === 'COMPLETED_PENDING_QC'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {stage.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">
                        {stage.workDoneNotes}
                      </p>

                      {/* Interactive Controls based on Role */}
                      <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                        {/* Contractor Action */}
                        {(isContractor || isCaseOwner || isCommissionerOrLeadership) && stage.status !== 'QC_PASSED' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleContractorCompleteStage(stage.stageId)}
                              disabled={isProcessing}
                              className="px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-bold text-[11px] cursor-pointer"
                            >
                              Mark Stage Complete & Request QC
                            </button>
                          </div>
                        )}

                        {/* QC Assignment Action */}
                        {(isCaseOwner || isCommissionerOrLeadership) && stage.status === 'COMPLETED_PENDING_QC' && (
                          <button
                            onClick={() => handleAssignQCInspector(stage.stageId)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Assign QC Inspector (Er. Mahesh Patil)
                          </button>
                        )}

                        {/* Inspector Action (PASS / FAIL) */}
                        {(isInspector || isCommissionerOrLeadership || isCaseOwner) &&
                          (stage.status === 'QC_IN_PROGRESS' || stage.status === 'COMPLETED_PENDING_QC' || stage.status === 'REWORK_REQUIRED') && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleRecordQCDecision(stage.stageId, 'PASS')}
                                disabled={isProcessing}
                                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>QC Pass (Unlock Next)</span>
                              </button>
                              <button
                                onClick={() => handleRecordQCDecision(stage.stageId, 'FAIL')}
                                disabled={isProcessing}
                                className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>QC Fail (Demand Rework)</span>
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: AUDIT TIMELINE */}
        {activeTab === 'AUDIT' && activeCase && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-900" />
                  <span>Immutable Coordination Case & Statutory Decision Ledger</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Every transition, strategy change, concurrence, and QC test is cryptographically logged with actor IDs.
                </p>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {activeCase.auditTimeline?.map((ev, i) => (
                  <div key={ev.id || i} className="relative space-y-1 text-xs">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-900 ring-4 ring-white" />
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{ev.action.replace(/_/g, ' ')}</span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {new Date(ev.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-slate-600 font-medium">
                      By {ev.actorName} ({ev.actorRole} • {ev.actorDepartment})
                    </div>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-[11px]">
                      {ev.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};
