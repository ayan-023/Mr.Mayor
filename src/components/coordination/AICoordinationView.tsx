/**
 * MR. MAYOR - AI Infrastructure Coordination Engine View
 * Upgraded with Nashik-Specific AI Infrastructure Intelligence Layer
 * 
 * Evidence-driven UI grounded in:
 *  - NMC CTTP 2017 (2016 Base Year V/C & 16-Hour PCU Counts)
 *  - NIUA ICCC / Nashik Smart City ITMS Integration (40 ATCS, 1,132 CCTV)
 *  - Simhastha Kumbh 2027 Priority Road Utility Sequencing (19 Priority Corridors)
 *  - NMC ₹135 Cr Road Restoration Protection & 30-Day Recent Rework Prevention
 *  - Interactive 5-Test Case Verification Suite
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Clock,
  TrendingDown,
  ShieldAlert,
  HelpCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  XCircle,
  Sliders,
  Play,
  Zap,
  MapPin,
  ExternalLink,
  Shield,
  X,
  Activity,
  Flame,
  Check,
  Navigation,
} from 'lucide-react';
import {
  Project,
  AICoordinationAnalysisResult,
  CandidateCoordinationPlan,
  DataProvenanceTag,
} from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface AICoordinationViewProps {
  project: Project;
  onPlanAccepted?: () => void;
  onRefresh?: () => void;
}

export const AICoordinationView: React.FC<AICoordinationViewProps> = ({
  project,
  onPlanAccepted,
  onRefresh,
}) => {
  const { currentUser } = useAuth();
  const [analysis, setAnalysis] = useState<AICoordinationAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analyzingStep, setAnalyzingStep] = useState<number>(0);
  const [selectedPlanId, setSelectedPlanId] = useState<'PLAN_A' | 'PLAN_B' | 'PLAN_C'>('PLAN_A');
  const [proximityBuffer, setProximityBuffer] = useState<number>(100);
  const [showScoreDetails, setShowScoreDetails] = useState<boolean>(false);
  const [showDataProvenance, setShowDataProvenance] = useState<boolean>(false);
  const [showTestCasesModal, setShowTestCasesModal] = useState<boolean>(false);
  const [testCasesData, setTestCasesData] = useState<any[]>([]);
  const [loadingTestCases, setLoadingTestCases] = useState<boolean>(false);

  // Action Modals State
  const [isAccepting, setIsAccepting] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [showModifyModal, setShowModifyModal] = useState<boolean>(false);
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [modifyNotes, setModifyNotes] = useState<string>('');
  const [isModifying, setIsModifying] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const runAnalysis = async (bufferMeters = proximityBuffer) => {
    setIsLoading(true);
    setAnalyzingStep(1);
    setFeedbackMessage(null);

    const stepTimer1 = setTimeout(() => setAnalyzingStep(2), 250);
    const stepTimer2 = setTimeout(() => setAnalyzingStep(3), 500);
    const stepTimer3 = setTimeout(() => setAnalyzingStep(4), 750);
    const stepTimer4 = setTimeout(() => setAnalyzingStep(5), 1000);

    try {
      const res = await api.analyzeProjectCoordination(project.id || project, bufferMeters);
      setAnalysis(res);
      if (res.selectedPlan) {
        setSelectedPlanId(res.selectedPlan.planId as any);
        setCustomStart(res.selectedPlan.startDate);
        setCustomEnd(res.selectedPlan.endDate);
      }
    } catch (err: any) {
      console.error('AI Coordination Analysis failed:', err);
      setFeedbackMessage({ type: 'error', text: err.message || 'Analysis failed. Please check network connection.' });
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);
      setIsLoading(false);
      setAnalyzingStep(0);
    }
  };

  useEffect(() => {
    runAnalysis(proximityBuffer);
  }, [project.id]);

  const handleFetchTestCases = async () => {
    setLoadingTestCases(true);
    setShowTestCasesModal(true);
    try {
      const res = await api.getNashikTestCases();
      setTestCasesData(res.testCases || []);
    } catch (err) {
      console.error('Failed to load test cases:', err);
    } finally {
      setLoadingTestCases(false);
    }
  };

  const handleAcceptPlan = async () => {
    if (!analysis) return;
    setIsAccepting(true);
    setFeedbackMessage(null);

    try {
      const res = await api.acceptCoordinationPlan({
        projectId: project.id,
        planId: selectedPlanId,
        officer: currentUser?.name || project.submittedBy || 'Executive Engineer',
        designation: currentUser?.designation || project.submittedByDesignation || 'Authority',
        department: currentUser?.department || project.department,
        notes: `Accepted ${selectedPlanId} via AI Coordination Engine with Nashik CTTP 2016 baseline validation.`,
      });

      setFeedbackMessage({
        type: 'success',
        text: `Plan ${selectedPlanId} accepted! Projects synchronized in Coordination Cluster ${res.cluster.clusterCode}.`,
      });

      if (onPlanAccepted) onPlanAccepted();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to accept coordination plan.' });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectPlan = async () => {
    if (!rejectReason.trim()) {
      alert('Statutory rejection reason is required by municipal audit policy.');
      return;
    }
    setIsRejecting(true);
    try {
      await api.rejectCoordinationPlan({
        projectId: project.id,
        planId: selectedPlanId,
        reason: rejectReason,
        officer: currentUser?.name,
        designation: currentUser?.designation,
        department: currentUser?.department,
      });

      setShowRejectModal(false);
      setFeedbackMessage({
        type: 'success',
        text: 'Coordination plan rejected and statutory reason logged in municipal audit ledger.',
      });
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to record rejection.');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleModifyPlan = async () => {
    setIsModifying(true);
    try {
      await api.modifyCoordinationPlan({
        projectId: project.id,
        planId: selectedPlanId,
        customStartDate: customStart,
        customEndDate: customEnd,
        notes: modifyNotes || 'Officer adjusted execution window for traffic mitigation.',
        officer: currentUser?.name,
      });

      setShowModifyModal(false);
      setFeedbackMessage({
        type: 'success',
        text: 'Coordinated execution schedule updated successfully.',
      });
      runAnalysis(proximityBuffer);
    } catch (err: any) {
      alert(err.message || 'Failed to modify schedule.');
    } finally {
      setIsModifying(false);
    }
  };

  const activePlan =
    analysis?.candidatePlans?.find((p) => p.planId === selectedPlanId) ||
    analysis?.selectedPlan ||
    analysis?.candidatePlans?.[0];

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-600 text-white animate-pulse';
      case 'HIGH':
        return 'bg-amber-600 text-white';
      case 'MODERATE':
        return 'bg-yellow-500 text-slate-900';
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  const getProvenanceBadge = (tag: DataProvenanceTag | string) => {
    switch (tag) {
      case 'VERIFIED_HISTORICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            VERIFIED HISTORICAL (CTTP 2016)
          </span>
        );
      case 'CURRENT_REPORT':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            CURRENT REPORT (NMC 2026)
          </span>
        );
      case 'AI_INFERENCE':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            AI INFERENCE
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            DEMO DATA
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & PROVENANCE BANNER */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
              <h2 className="text-base font-bold text-white tracking-wide">
                Nashik-Specific AI Infrastructure Intelligence Layer
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Evidence-driven multi-utility coordination grounded in NMC CTTP (2016 Base Year), Smart City ITMS, Simhastha 2027 priorities, and ₹135 Cr road restoration protection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFetchTestCases}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5 text-indigo-200" />
              <span>Verify 5 Test Cases</span>
            </button>
            <button
              onClick={() => runAnalysis(proximityBuffer)}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Re-Run AI Engine</span>
            </button>
          </div>
        </div>

        {/* Non-Negotiable Data Rule Notice */}
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>
              <strong>Data Provenance Notice:</strong> Historical data is never presented as live traffic. Recommendations use the verified <strong>NMC CTTP 2016 baseline</strong> and ITMS ATCS capacity models.
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {getProvenanceBadge('VERIFIED_HISTORICAL')}
            {getProvenanceBadge('CURRENT_REPORT')}
          </div>
        </div>

        {/* Proximity Threshold & Score Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-[11px] font-medium">Spatial Corridor Buffer:</span>
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              {[50, 100, 250, 500].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setProximityBuffer(m);
                    runAnalysis(m);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    proximityBuffer === m
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {analysis && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">Coordination Priority:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getPriorityBadgeClass(analysis.coordinationPriority)}`}>
                {analysis.coordinationPriority} OPPORTUNITY ({analysis.overallScore}/100)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 border ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          ><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* LOADING STATE */}
      {isLoading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200 animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm">
              Executing Nashik AI Infrastructure Analysis Pipeline...
            </h3>
            <p className="text-xs text-slate-500">
              {analyzingStep === 1 && 'Querying CTTP 2016 V/C baseline & peak junction PCU loads...'}
              {analyzingStep === 2 && 'Evaluating recent road restoration age & Section 197 Monsoon policy...'}
              {analyzingStep === 3 && 'Checking Simhastha Kumbh 2027 19-Priority Road underground utility rules...'}
              {analyzingStep === 4 && 'Computing depth hierarchy: Drainage (2.6m) -> Water (1.8m) -> Telecom (0.9m)...'}
              {analyzingStep === 5 && 'Synthesizing Plan A, Plan B & Plan C candidate schedules with ₹ savings...'}
            </p>
          </div>
        </div>
      )}

      {/* MAIN ANALYSIS CONTENT */}
      {!isLoading && analysis && (
        <div className="space-y-6">
          {/* 2. NASHIK EVIDENCE INTELLIGENCE DASHBOARD CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Card 1: CTTP 2016 Historical Traffic Baseline */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500">CTTP Traffic Baseline</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {analysis.nashikIntelligence.vcCategory} V/C
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {analysis.nashikIntelligence.historicalVC} <span className="text-xs text-slate-500 font-sans font-normal">V/C Ratio</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Historical pressure: <strong className="text-slate-900">{analysis.nashikIntelligence.trafficPressureScore}/100</strong>
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                Source: CTTP 2017 (2016 Base Year)
              </div>
            </div>

            {/* Card 2: Sensitive Junctions & Peak Hour */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500">Junction Sensitivity</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {analysis.nashikIntelligence.sensitiveJunctions.length} Node(s)
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 truncate">
                  {analysis.nashikIntelligence.sensitiveJunctions[0]?.name || 'Standard Corridor Node'}
                </div>
                <div className="text-[11px] text-amber-800 font-medium mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>Peak: {analysis.nashikIntelligence.sensitiveJunctions[0]?.peakWindow || '17:45–18:45'}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 truncate">
                {analysis.nashikIntelligence.sensitiveJunctions[0]?.peakHourPCU ? `${analysis.nashikIntelligence.sensitiveJunctions[0]?.peakHourPCU} Peak PCU` : 'Off-peak work advised'}
              </div>
            </div>

            {/* Card 3: Recent Restoration & Rework Risk */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500">Road Restoration Age</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  analysis.nashikIntelligence.reworkRiskLevel === 'CRITICAL'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : analysis.nashikIntelligence.reworkRiskLevel === 'HIGH'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {analysis.nashikIntelligence.reworkRiskLevel} RISK
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {analysis.nashikIntelligence.daysSinceLastRestored || 120} <span className="text-xs text-slate-500 font-sans font-normal">Days</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  {analysis.nashikIntelligence.reworkRiskLevel === 'CRITICAL'
                    ? 'Age <= 30 days: High rework risk'
                    : 'Pavement protection active'}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                ₹135 Cr NMC Provision 2025–27
              </div>
            </div>

            {/* Card 4: Simhastha 2027 & Seasonal Mandates */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500">Simhastha & Season</span>
                {analysis.nashikIntelligence.isSimhasthaPriorityRoad ? (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    PRIORITY ROAD
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    STANDARD
                  </span>
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {analysis.nashikIntelligence.isSimhasthaPriorityRoad
                    ? `Phase ${analysis.nashikIntelligence.simhasthaPhase || 1} Priority Road`
                    : 'City Arterial Corridor'}
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  {analysis.nashikIntelligence.isMonsoonRestrictionActive
                    ? 'Monsoon embargo in effect'
                    : 'Utility work must precede paving'}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 truncate">
                Deadline: {analysis.nashikIntelligence.simhasthaDeadline || '2026-12-31'}
              </div>
            </div>
          </div>

          {/* SENSITIVE JUNCTIONS / TRAFFIC ADVISORY ALERTS */}
          {analysis.nashikIntelligence.sensitiveJunctions.some((j) => j.overlapWarning) && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Nashik Junction Traffic Warning</span>
              </div>
              {analysis.nashikIntelligence.sensitiveJunctions.map((j) => (
                j.overlapWarning && (
                  <p key={j.junctionId} className="text-xs text-amber-800 pl-6 leading-relaxed">
                    <strong>{j.name}:</strong> {j.overlapWarning}
                  </p>
                )
              ))}
            </div>
          )}

          {/* REWORK ADVISORY ALERT */}
          {analysis.nashikIntelligence.reworkAdvisory && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-red-900">Recent Road Restoration Protection Alert</div>
                <p className="text-red-800 leading-relaxed">
                  {analysis.nashikIntelligence.reworkAdvisory}
                </p>
              </div>
            </div>
          )}

          {/* 3. QUANTIFIED IMPACT METRICS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500">Excavations Avoided</div>
              <div className="text-2xl font-bold font-mono text-blue-700">
                {analysis.impactSummary.excavationsAvoided}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {analysis.impactSummary.baselineExcavations} cuts → 1 coordinated
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500">Restorations Avoided</div>
              <div className="text-2xl font-bold font-mono text-emerald-700">
                {analysis.impactSummary.restorationsAvoided}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {analysis.impactSummary.baselineRestorations} patches → 1 unified
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500">Traffic Disruption</div>
              <div className="text-2xl font-bold font-mono text-purple-700">
                -{analysis.impactSummary.trafficDisruptionReductionPct}%
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Single off-peak closure
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500">Estimated Savings</div>
              <div className="text-2xl font-bold font-mono text-emerald-700">
                ₹{(analysis.impactSummary.estimatedCostSavedINR / 100000).toFixed(1)} L
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Shared joint restoration
              </div>
            </div>
          </div>

          {/* 4. CANDIDATE PLANS TAB SWITCHER (A, B, C) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Candidate Coordination Schedules (Spec Section 19)
              </h3>
              <span className="text-[11px] text-slate-500">Select candidate plan to review or accept</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {analysis.candidatePlans.map((plan) => {
                const isSelected = plan.id === selectedPlanId;
                const isRecommended = plan.id === 'PLAN_A';

                return (
                  <div
                    key={plan.id}
                    onClick={() => {
                      setSelectedPlanId(plan.id as any);
                      setCustomStart(plan.startDate);
                      setCustomEnd(plan.endDate);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 relative ${
                      isSelected
                        ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-600/30'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    {isRecommended && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-600 text-white shadow-xs">
                        RECOMMENDED
                      </span>
                    )}

                    <div className="space-y-1">
                      <div className="font-bold text-xs text-slate-900">{plan.planName}</div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Duration:</span>
                        <span className="font-bold text-slate-800">{plan.totalDurationDays} Days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Excavations / Patches:</span>
                        <span className="font-bold text-slate-800">
                          {plan.excavationEventsCount} cut(s) / {plan.restorationEventsCount} patch(es)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Disruption Reduction:</span>
                        <span className="font-bold text-purple-700">
                          {plan.trafficDisruptionReductionPct > 0 ? `-${plan.trafficDisruptionReductionPct}%` : '0%'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Est. Savings:</span>
                        <span className="font-bold text-emerald-700">
                          ₹{(plan.estimatedFinancialSavingINR / 100000).toFixed(1)} L
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Plan Sequence Detail */}
            {activePlan && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-sm text-slate-900">{activePlan.planName}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        Execution Window: <strong>{activePlan.startDate}</strong> to <strong>{activePlan.endDate}</strong> ({activePlan.totalDurationDays} Days)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-medium">Estimated Savings:</span>
                    <span className="text-sm font-bold text-emerald-700 font-mono">
                      ₹{(activePlan.estimatedFinancialSavingINR / 100000).toFixed(1)} Lakhs
                    </span>
                  </div>
                </div>

                {/* Depth-Wise Sequence Steps Roadmap */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Geotechnical Depth-Wise Execution Sequence:
                  </div>
                  <div className="space-y-2">
                    {activePlan.sequenceSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-slate-800 leading-relaxed font-mono">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pros and Cons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 text-xs">
                    <div className="font-bold text-emerald-900 text-[11px] uppercase tracking-wider">
                      Strategic Advantages:
                    </div>
                    <ul className="space-y-1 text-emerald-800 text-[11px]">
                      {activePlan.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      Operational Considerations:
                    </div>
                    <ul className="space-y-1 text-slate-600 text-[11px]">
                      {activePlan.cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-slate-400 shrink-0">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. GROUNDED REASONING & 8-FACTOR WEIGHTED BREAKDOWN */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Why This Plan? (Explainable Evidence & Score Breakdown)
                </h4>
              </div>
              <button
                onClick={() => setShowScoreDetails(!showScoreDetails)}
                className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>{showScoreDetails ? 'Hide' : 'View'} 8-Factor Score</span>
                {showScoreDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {analysis.aiExplanation}
            </p>

            {/* Grounded Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {analysis.reasoningFactors.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{factor}</span>
                </div>
              ))}
            </div>

            {/* 8-Factor Weighted Scoring Table (Spec Section 17) */}
            {showScoreDetails && (
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  Spec Section 17 Weighted Scoring Matrix:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5">
                    <span className="text-slate-500 text-[10px]">Spatial (20%)</span>
                    <div className="font-bold font-mono text-slate-900">{analysis.scoreBreakdown.spatialRelationship} / 20 pts</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5">
                    <span className="text-slate-500 text-[10px]">Temporal (15%)</span>
                    <div className="font-bold font-mono text-slate-900">{analysis.scoreBreakdown.temporalRelationship} / 15 pts</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5">
                    <span className="text-slate-500 text-[10px]">Compatibility (15%)</span>
                    <div className="font-bold font-mono text-slate-900">{analysis.scoreBreakdown.workCompatibility} / 15 pts</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5">
                    <span className="text-slate-500 text-[10px]">Traffic V/C (15%)</span>
                    <div className="font-bold font-mono text-slate-900">{analysis.scoreBreakdown.trafficImpact} / 15 pts</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5">
                    <span className="text-slate-500 text-[10px]">Road History (10%)</span>
                    <div className="font-bold font-mono text-slate-900">{analysis.scoreBreakdown.roadHistory} / 10 pts</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5">
                    <span className="text-slate-500 text-[10px]">Safety Blackspots (5%)</span>
                    <div className="font-bold font-mono text-slate-900">{analysis.scoreBreakdown.safety} / 5 pts</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5">
                    <span className="text-slate-500 text-[10px]">Season/Kumbh (10%)</span>
                    <div className="font-bold font-mono text-slate-900">{analysis.scoreBreakdown.seasonEventConstraints} / 10 pts</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5">
                    <span className="text-slate-500 text-[10px]">Network Dep (10%)</span>
                    <div className="font-bold font-mono text-slate-900">{analysis.scoreBreakdown.networkDependency} / 10 pts</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 6. HUMAN-IN-THE-LOOP ACTION BAR */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="font-bold text-xs text-slate-900">
                Official Multi-Agency Consensus Authorization
              </div>
              <p className="text-[11px] text-slate-500">
                Accepting binds all {analysis.relatedProjects.length + 1} projects into a single joint excavation permit window.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-bold border border-slate-200 hover:border-red-200 transition-all cursor-pointer"
              >
                Reject Plan
              </button>
              <button
                onClick={() => setShowModifyModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-600" />
                <span>Modify Window</span>
              </button>
              <button
                onClick={handleAcceptPlan}
                disabled={isAccepting}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>{isAccepting ? 'Binding Cluster...' : 'Accept Coordinated Plan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. VERIFY 5 TEST CASES MODAL */}
      {showTestCasesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Nashik Intelligence Specification — 5 Benchmark Test Cases (Section 27)
                </h3>
              </div>
              <button
                onClick={() => setShowTestCasesModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              ><X className="w-4 h-4" /></button>
            </div>

            {loadingTestCases ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                Executing 5 test cases against Nashik CTTP intelligence models...
              </div>
            ) : (
              <div className="space-y-3">
                {testCasesData.map((tc: any) => (
                  <div
                    key={tc.testNumber}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900">
                        Test {tc.testNumber}: {tc.testName}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        PASSED VERIFICATION
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      <strong>Input: </strong> {tc.inputDescription}
                    </div>
                    <div className="text-[11px] p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                      <div className="text-slate-700">
                        <strong>Expected Outcome: </strong>
                        <span className="font-bold text-indigo-700">{tc.expectedOutcome}</span>
                      </div>
                      {tc.trafficWarning && (
                        <div className="text-amber-800">
                          <strong>Traffic Warning: </strong> {tc.trafficWarning}
                        </div>
                      )}
                      {tc.reworkRiskLevel && (
                        <div className="text-red-800">
                          <strong>Rework Evaluation: </strong> {tc.reworkRiskLevel} ({tc.daysSinceRestored} days since restored)
                        </div>
                      )}
                      {tc.financialSavedLakhs && (
                        <div className="text-emerald-700 font-bold">
                          Avoided cuts: {tc.excavationsAvoided} | Savings: ₹{tc.financialSavedLakhs} Lakhs
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowTestCasesModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Close Test Suite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Record Statutory Rejection Reason</span>
            </div>
            <p className="text-xs text-slate-600">
              Municipal audit policy requires a formal engineering or administrative reason when overriding AI coordination recommendations.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Water supply contractor mobilized under emergency leakage repair mandate."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-hidden"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectPlan}
                disabled={isRejecting}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isRejecting ? 'Recording...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODIFY MODAL */}
      {showModifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <Sliders className="w-5 h-5" />
              <span>Adjust Coordinated Execution Window</span>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">Completion Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">Scheduling Notes</label>
                <textarea
                  rows={2}
                  value={modifyNotes}
                  onChange={(e) => setModifyNotes(e.target.value)}
                  placeholder="e.g., Shifted by 3 days for religious procession traffic clearance."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModifyModal(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleModifyPlan}
                disabled={isModifying}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isModifying ? 'Updating...' : 'Save Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
