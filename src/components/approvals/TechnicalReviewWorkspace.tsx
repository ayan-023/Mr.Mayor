import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  Layers,
  Calendar,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingDown,
  Sparkles,
  MapPin,
  Car,
  Activity,
  Award,
  Check,
  Send,
  RotateCcw,
  Ban,
  FileCheck,
} from 'lucide-react';
import {
  Project,
  CandidateCoordinationPlan,
  InfrastructureAnalysisReport,
  DepartmentName,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { WorkflowLifecycleBanner } from '../common/WorkflowLifecycleBanner';

interface TechnicalReviewWorkspaceProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const TechnicalReviewWorkspace: React.FC<TechnicalReviewWorkspaceProps> = ({
  project,
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const { currentUser } = useAuth();
  const [selectedPlanId, setSelectedPlanId] = useState<'PLAN_A' | 'PLAN_B' | 'PLAN_C'>('PLAN_A');
  const [reviewComment, setReviewComment] = useState(
    'Depth hierarchy (Drainage > Water > Gas > Telecom) verified against geotechnical safety norms. Single road-opening window approved with 95%+ Proctor Density compaction condition.'
  );
  const [customCondition, setCustomCondition] = useState('');
  const [conditions, setConditions] = useState<string[]>([
    'Mandatory nocturnal excavation (22:00-06:00) at Canada Corner & Jehan Circle nodes',
    'Laser grade alignment and 95%+ Proctor Density compaction test before bituminous paving',
    '3-Year pavement protection moratorium upon final verification sign-off',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'decision' | 'plans' | 'depth'>('decision');

  if (!isOpen) return null;

  const isHigherAuthority = ['COMMISSIONER', 'ADMIN'].includes(currentUser.role);
  const isTechnicalAuthority = ['EXECUTIVE_ENGINEER', 'NODAL_OFFICER', 'DEPT_HEAD', 'ADMIN'].includes(currentUser.role);

  const isProjectOwner = currentUser?.department === project.department || ['COMMISSIONER', 'ADMIN'].includes(currentUser?.role);
  const isAffectedConcurrence = !isProjectOwner && ['EXECUTIVE_ENGINEER', 'DEPT_HEAD'].includes(currentUser?.role);


  const planA = project.planVersions?.[0]?.candidatePlans?.find((p) => p.planId === 'PLAN_A') || {
    planId: 'PLAN_A',
    planName: 'Plan A: Unified Multi-Agency Single Window (Recommended)',
    isRecommended: true,
    strategySummary: `Consolidates all department excavations on ${project.roadName} into ONE joint 24-day coordinated window, finishing with ONE high-grade Bituminous Concrete restoration.`,
    startDate: project.requiredStartDate,
    endDate: project.requiredCompletionDate,
    totalDurationDays: 24,
    excavationEventsCount: 1,
    restorationEventsCount: 1,
    trafficDisruptionReductionPct: 65,
    estimatedFinancialSavingINR: Math.round((project.estimatedCostINR || 2000000) * 0.45),
    sequenceSteps: [
      'Traffic Police Marshals & LED Arrow Diversion Barricading (Off-Peak Mobilization)',
      `Step 1: Drainage Department — Box Culvert (Depth: 2.6m)`,
      `Step 2: Water Supply — Trunk Feeder (Depth: 1.8m)`,
      `Step 3: City Gas & Telecom — OFC / PNG Grid (Depth: 1.2m)`,
      'Joint Multi-Agency Pre-Backfill Laser & Pressure Leak Inspection',
      'Graded Granular Sub-base (GSB) Layering & 95%+ Proctor Density Compaction Testing',
      `Single Unified Bituminous Concrete (BC) Resurfacing & Mastic Asphalt Seal (${project.roadName})`,
    ],
    pros: [
      'Eliminates duplicate road cuttings',
      `Saves estimated ₹${Math.round(((project.estimatedCostINR || 2000000) * 0.45) / 100000)} Lakhs in public resurfacing`,
      '65% traffic delay reduction with single off-peak barricading',
    ],
    cons: ['Requires multi-contractor synchronized mobilization on same date'],
  };

  const planB = project.planVersions?.[0]?.candidatePlans?.find((p) => p.planId === 'PLAN_B') || {
    planId: 'PLAN_B',
    planName: 'Plan B: Phased Sequential Micro-Windows',
    isRecommended: false,
    strategySummary: 'Executes deep civil trenching first, followed by shallow utility micro-trenching in two separate micro-windows.',
    startDate: project.requiredStartDate,
    endDate: project.requiredCompletionDate,
    totalDurationDays: 38,
    excavationEventsCount: 2,
    restorationEventsCount: 2,
    trafficDisruptionReductionPct: 40,
    estimatedFinancialSavingINR: Math.round((project.estimatedCostINR || 2000000) * 0.25),
    sequenceSteps: [
      'Phase 1: Deep Utility Trenching (Drainage & Water Supply Trunk)',
      'Phase 1 Compaction & Temporary Cold Mix Base Layer',
      'Phase 2: Shallow Conduits (Telecom OFC & Power Feeder)',
      'Final Joint Bituminous Concrete Resurfacing & Mastic Seal',
    ],
    pros: ['Easier multi-contractor staging without simultaneous trench congestion'],
    cons: ['2 separate road closures instead of 1', 'Lower financial savings'],
  };

  const handleAddCondition = () => {
    if (customCondition.trim()) {
      setConditions([...conditions, customCondition.trim()]);
      setCustomCondition('');
    }
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleSubmitTechnicalReview = async (decision: 'APPROVE' | 'REQUEST_MODIFICATION' | 'REJECT' | 'FORWARD_HIGHER') => {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/projects/${project.id}/technical-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          comment: reviewComment,
          conditions,
          selectedPlanId,
          reviewerName: currentUser.name,
          reviewerRole: currentUser.designation || currentUser.role,
          reviewerDepartment: currentUser.department,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setSuccessMessage(
          decision === 'APPROVE' || decision === 'FORWARD_HIGHER'
            ? 'Technical Approval Granted! Project forwarded to Municipal Commissioner / Higher Authority Queue.'
            : decision === 'REQUEST_MODIFICATION'
            ? 'Modification Requested. Notification dispatched to Project Department.'
            : 'Project Proposal Rejected.'
        );
        setTimeout(() => {
          if (onRefreshData) onRefreshData();
          onClose();
        }, 1800);
      }
    } catch (err) {
      console.error('Failed to submit technical review', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitHigherApproval = async (decision: 'APPROVE' | 'REJECT' | 'RETURN_FOR_MODIFICATION') => {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/projects/${project.id}/higher-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          comment: reviewComment,
          conditions,
          approverName: currentUser.name,
          approverDesignation: currentUser.designation || 'Municipal Commissioner',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setSuccessMessage(
          decision === 'APPROVE'
            ? 'Statutory Sanction Granted! Digital QR Permit is now ready for issuance.'
            : 'Project Decision Recorded.'
        );
        setTimeout(() => {
          if (onRefreshData) onRefreshData();
          onClose();
        }, 1800);
      }
    } catch (err) {
      console.error('Failed to submit higher approval', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-900 text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                  {isHigherAuthority ? 'HIGHER AUTHORITY STATUTORY REVIEW' : 'TECHNICAL ENGINEERING REVIEW WORKSPACE'}
                </span>
                <span className="text-xs font-mono text-slate-500">{project.code}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 leading-tight mt-0.5">
                {project.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-white flex gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('decision')}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'decision'
                ? 'border-blue-900 text-blue-900 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Decision Support Dossier</span>
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'plans'
                ? 'border-blue-900 text-blue-900 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Candidate Plans (A vs B)</span>
          </button>
          <button
            onClick={() => setActiveTab('depth')}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'depth'
                ? 'border-blue-900 text-blue-900 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Depth Hierarchy & Pavement Cross-Section</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/40">
          {isSuccess ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs animate-in zoom-in">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Decision Successfully Recorded</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">{successMessage}</p>
            </div>
          ) : (
            <>
              {/* 1. Core Summary Banner */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Affected Corridor</div>
                  <div className="text-sm font-bold text-slate-900 truncate">{project.roadName}</div>
                  <div className="text-[11px] text-blue-700 font-medium">Road Authority: {project.responsibleRoadAuthority || 'PWD / NMC'}</div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Recommendation</div>
                  <div className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>COORDINATED EXCAVATION</span>
                  </div>
                  <div className="text-[11px] text-slate-500">Confidence: 94% • High Evidence</div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Projected Public Savings</div>
                  <div className="text-sm font-bold text-slate-900">
                    ₹{((planA.estimatedFinancialSavingINR || 9226000) / 100000).toFixed(1)} Lakhs
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium">2 Duplicate Digs Avoided</div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Traffic Mitigation</div>
                  <div className="text-sm font-bold text-slate-900">65% Disruption Cut</div>
                  <div className="text-[11px] text-slate-500">Night window (22:00-06:00)</div>
                </div>
              </div>

              {/* 2. TAB: Decision View */}
              {activeTab === 'decision' && (
                <div className="space-y-6">
                  {/* AI Explainability Box */}
                  <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-800" />
                        <h4 className="font-bold text-blue-950 text-sm">Why MR. MAYOR Recommends Joint Digging:</h4>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                        90-Day Lookahead Window Match
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-blue-100 text-slate-700 space-y-1">
                        <strong className="text-blue-950 block">1. 3 Multi-Agency Proposals on Same Corridor:</strong>
                        <span>Water & Sewerage (450mm DI), Drainage (Box Culvert), and Telecom/Gas are scheduled within 45 days of each other along {project.roadName}.</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-blue-100 text-slate-700 space-y-1">
                        <strong className="text-blue-950 block">2. Geotechnical Depth Compatibility:</strong>
                        <span>Drainage (2.6m) precedes Water (1.8m) and Telecom (1.2m), allowing single trench layering without utility line clashes.</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-blue-100 text-slate-700 space-y-1">
                        <strong className="text-blue-950 block">3. Pavement Integrity & Moratorium:</strong>
                        <span>Eliminates 3 separate asphalt patches in favor of ONE unified Bituminous Concrete (BC) resurfacing with a 3-year protection moratorium.</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-blue-100 text-slate-700 space-y-1">
                        <strong className="text-blue-950 block">4. CTTP 2016 V/C 1.14 Traffic Baseline:</strong>
                        <span>Corridor operates above capacity. Consolidating work into 24 nocturnal days prevents 45+ days of commuter gridlock.</span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Selection */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm">Select Execution Plan for Sanction:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        onClick={() => setSelectedPlanId('PLAN_A')}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          selectedPlanId === 'PLAN_A'
                            ? 'border-blue-900 bg-blue-50/40 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900">Plan A: Single Joint Window</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            RECOMMENDED
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mb-3">{planA.strategySummary}</p>
                        <div className="flex items-center justify-between text-xs font-mono text-slate-700 pt-2 border-t border-slate-100">
                          <span>Duration: 24 Days</span>
                          <span className="font-bold text-emerald-700">Savings: ₹92.3 Lakhs</span>
                        </div>
                      </div>

                      <div
                        onClick={() => setSelectedPlanId('PLAN_B')}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          selectedPlanId === 'PLAN_B'
                            ? 'border-blue-900 bg-blue-50/40 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900">Plan B: Phased Micro-Windows</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            ALTERNATIVE
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mb-3">{planB.strategySummary}</p>
                        <div className="flex items-center justify-between text-xs font-mono text-slate-700 pt-2 border-t border-slate-100">
                          <span>Duration: 38 Days</span>
                          <span className="font-bold text-blue-700">Savings: ₹50.7 Lakhs</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conditions & Directives */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between">
                      <span>Mandatory Engineering Directives & Statutory Conditions:</span>
                      <span className="text-xs font-normal text-slate-500 font-mono">{conditions.length} active conditions</span>
                    </h4>

                    <div className="space-y-2">
                      {conditions.map((cond, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-slate-800">{cond}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveCondition(idx)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customCondition}
                        onChange={(e) => setCustomCondition(e.target.value)}
                        placeholder="Add custom engineering constraint or traffic condition..."
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900 bg-white"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCondition()}
                      />
                      <button
                        onClick={handleAddCondition}
                        className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
                      >
                        Add Directive
                      </button>
                    </div>
                  </div>

                  {/* Review Comments */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-900 block">
                      Authority Review Remarks & Statutory Justification:
                    </label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900 bg-white text-slate-800 font-sans"
                    />
                  </div>
                </div>
              )}

              {/* 3. TAB: Candidate Plans */}
              {activeTab === 'plans' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm">Plan A: Detailed Multi-Agency Execution Sequence</h4>
                    <div className="space-y-2">
                      {planA.sequenceSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                          <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-slate-800 font-medium">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. TAB: Depth Hierarchy */}
              {activeTab === 'depth' && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm">Standard Subsurface Geotechnical Depth Hierarchy (NMC Norms):</h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                      <span className="font-bold">Layer 0: Surface Pavement</span>
                      <span className="font-mono text-slate-300">40mm DBM + 30mm BC Asphalt Seal</span>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 flex items-center justify-between">
                      <span className="font-bold">Layer 1: Shallow Conduits (0.8m - 1.2m)</span>
                      <span className="font-mono text-purple-800">Telecom 5G OFC Ducts & Low Voltage Power</span>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between">
                      <span className="font-bold">Layer 2: Gas Distribution (1.2m - 1.5m)</span>
                      <span className="font-mono text-amber-800">PNG Steel Pipeline with Warning Mesh</span>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 flex items-center justify-between">
                      <span className="font-bold">Layer 3: Potable Water Supply (1.5m - 2.0m)</span>
                      <span className="font-mono text-blue-800">450mm Ductile Iron (DI) Feeder Trunk</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
                      <span className="font-bold">Layer 4: Deep Underground Drainage (&gt;2.5m)</span>
                      <span className="font-mono text-emerald-800">RCC Box Culvert & Gravity Sewer Mains</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!isSuccess && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Responsible Reviewer: <strong className="text-slate-800">{currentUser.name} ({currentUser.role})</strong>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              {isHigherAuthority ? (
                <>
                  <button
                    onClick={() => handleSubmitHigherApproval('REJECT')}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors"
                  >
                    Reject Proposal
                  </button>
                  <button
                    onClick={() => handleSubmitHigherApproval('APPROVE')}
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Grant Statutory Sanction & Approve</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleSubmitTechnicalReview('REQUEST_MODIFICATION')}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl text-xs font-bold transition-colors"
                  >
                    Request Plan Modification
                  </button>
                  <button
                    onClick={() => handleSubmitTechnicalReview('APPROVE')}
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-900 text-white hover:bg-blue-950 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Forward to Commissioner</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
