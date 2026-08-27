import React from 'react';
import {
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import { ExecutionStrategy } from '../../types';

interface WorkflowLifecycleBannerProps {
  status: string;
  strategy?: ExecutionStrategy;
  caseNumber?: string;
  roadName?: string;
  departmentsCount?: number;
  projectsCount?: number;
  currentActorRole?: string;
  currentActorDepartment?: string;
  nextActionText?: string;
  onRefresh?: () => void;
}

export const WorkflowLifecycleBanner: React.FC<WorkflowLifecycleBannerProps> = ({
  status,
  strategy = 'COORDINATED',
  caseNumber,
  roadName,
  departmentsCount = 1,
  projectsCount = 1,
  currentActorRole = 'Executive Engineer',
  currentActorDepartment = 'Owning Department',
  nextActionText,
  onRefresh,
}) => {
  // Ordered Canonical Lifecycle Steps
  const LIFECYCLE_STEPS = [
    { key: 'SUBMISSION', label: '1. Proposal', desc: 'Project Registered' },
    { key: 'ANALYSIS', label: '2. AI Analysis', desc: 'Candidates & Risks' },
    { key: 'TECH_REVIEW', label: '3. Tech Review', desc: 'Concurrence & Strategy' },
    { key: 'LEADERSHIP', label: '4. Leadership', desc: 'Statutory Approval' },
    { key: 'CONTRACTOR', label: '5. Contractor', desc: 'EPC Allocation' },
    { key: 'EXECUTION', label: '6. Stage Execution', desc: '6 Gated Stages' },
    { key: 'QC_GATE', label: '7. Stage QC', desc: 'Inspector Pass' },
    { key: 'CLOSURE', label: '8. Road Twin', desc: 'History Updated' },
  ];

  // Map arbitrary status to current step index
  const getStepIndex = (s: string): number => {
    switch (s) {
      case 'DRAFT':
      case 'SUBMITTED':
      case 'PROPOSED':
        return 0;
      case 'SYSTEM_ANALYSIS':
      case 'AI_ANALYSIS_READY':
      case 'AI_ANALYZED':
      case 'DETECTED':
        return 1;
      case 'TECHNICAL_REVIEW':
      case 'UNDER_TECHNICAL_REVIEW':
      case 'COORDINATION_DECISION':
      case 'TECHNICAL_PROPOSAL':
        return 2;
      case 'LEADERSHIP_REVIEW':
      case 'AWAITING_HIGHER_AUTHORITY':
      case 'UNDER_REVIEW':
        return 3;
      case 'APPROVED':
      case 'CONTRACTOR_ALLOCATION':
      case 'CONTRACTOR_ALLOCATED':
      case 'PERMIT_READY':
      case 'PERMITTED':
      case 'PERMIT_ISSUED':
      case 'SCHEDULED':
        return 4;
      case 'IN_PROGRESS':
      case 'IN_EXECUTION':
      case 'STAGE_COMPLETED':
        return 5;
      case 'QC_PENDING':
      case 'QC_IN_PROGRESS':
      case 'QC_PASSED':
      case 'REWORK_REQUIRED':
      case 'ALL_STAGES_COMPLETED':
      case 'FINAL_QC':
      case 'RESTORATION':
      case 'RESTORATION_QC':
        return 6;
      case 'COMPLETED':
      case 'CLOSED':
        return 7;
      default:
        return 2;
    }
  };

  const currentStepIdx = getStepIndex(status);

  // Strategy Styling Badge
  const getStrategyBadge = (strat: ExecutionStrategy) => {
    switch (strat) {
      case 'COORDINATED':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-600',
          label: 'COORDINATED / JOINT DIGGING',
          desc: `${projectsCount} Projects • ${departmentsCount} Depts in Single Trench`,
        };
      case 'STANDALONE':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-300',
          dot: 'bg-blue-600',
          label: 'STANDALONE EXCAVATION',
          desc: 'Individual Departmental Trench',
        };
      case 'HOLD':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          dot: 'bg-amber-600',
          label: 'ON HOLD / RE-ANALYSIS',
          desc: 'Requires Inter-Agency Alignment',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-800 border-slate-300',
          dot: 'bg-slate-500',
          label: 'STRATEGY EVALUATION',
          desc: 'Determining Corridor Fit',
        };
    }
  };

  const stratInfo = getStrategyBadge(strategy);

  // Derive Who Needs to Act & Next Step
  const getActionGuidance = () => {
    if (nextActionText) return nextActionText;
    switch (currentStepIdx) {
      case 0:
        return 'System Intelligence running automated subsurface clearance and related project detection.';
      case 1:
        return 'AI Analysis ready: Owning Department Engineer must review candidate plans and select execution strategy.';
      case 2:
        return 'Affected Utility Engineers must grant subsurface concurrence; Owning Engineer to propose plan to Leadership.';
      case 3:
        return 'Municipal Commissioner / Higher Authority review required for statutory budget and road opening sanction.';
      case 4:
        return 'Statutory approval granted: Owning Department must assign verified EPC contractor and issue permit.';
      case 5:
        return 'Contractor executing active stage: GPS check-in and stage completion evidence required.';
      case 6:
        return 'Quality Inspector must conduct stage QC check and sign off pass/fail before subsequent stage unlocks.';
      case 7:
        return 'All stages verified: Road Twin updated with certified completion metrics and restored surface.';
      default:
        return 'Pending municipal workflow action.';
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden mb-6">
      {/* Top Banner: Context & Execution Strategy */}
      <div className="p-4 md:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider font-mono">
              {caseNumber || 'MUNICIPAL WORKFLOW LIFECYCLE'}
            </span>
            {roadName && (
              <span className="text-xs text-slate-300 font-medium truncate max-w-xs md:max-w-md">
                📍 {roadName}
              </span>
            )}
          </div>
          <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
            <span>Status:</span>
            <span className="text-blue-300 font-mono">
              {status.replace(/_/g, ' ')}
            </span>
          </h3>
        </div>

        {/* Prominent Current Execution Strategy Box */}
        <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${stratInfo.bg}`}>
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${stratInfo.dot}`} />
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">
              CURRENT EXECUTION STRATEGY
            </div>
            <div className="text-xs md:text-sm font-extrabold tracking-tight">
              {stratInfo.label}
            </div>
            <div className="text-[10px] font-medium opacity-90">
              {stratInfo.desc}
            </div>
          </div>
        </div>
      </div>

      {/* Middle: 8-Step Interactive Progress Bar */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-200 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[760px] gap-2">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const isPassed = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            const isLocked = idx > currentStepIdx;

            return (
              <div key={step.key} className="flex-1 flex items-center gap-2 relative">
                <div
                  className={`flex-1 p-2.5 rounded-xl border text-center transition-all ${
                    isPassed
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 shadow-2xs'
                      : isCurrent
                      ? 'bg-blue-900 border-blue-900 text-white shadow-md ring-2 ring-blue-400/30'
                      : 'bg-white border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                    {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {isCurrent && <Clock className="w-3.5 h-3.5 text-blue-300 animate-spin" />}
                    {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                    <span className="text-[10px] font-bold tracking-wider uppercase truncate">
                      {step.label}
                    </span>
                  </div>
                  <div
                    className={`text-[9px] truncate ${
                      isCurrent ? 'text-blue-200 font-medium' : isPassed ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {step.desc}
                  </div>
                </div>

                {idx < LIFECYCLE_STEPS.length - 1 && (
                  <ArrowRight
                    className={`w-3.5 h-3.5 shrink-0 ${
                      idx < currentStepIdx ? 'text-emerald-500' : 'text-slate-300'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Information Row: WHO NEEDS TO ACT? & WHAT HAPPENS NEXT? */}
      <div className="p-3.5 md:p-4 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              WHO NEEDS TO ACT?
            </div>
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>{currentActorRole}</span>
              <span className="text-slate-400 font-normal">•</span>
              <span className="text-slate-600 font-medium">{currentActorDepartment}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              WHAT HAPPENS NEXT?
            </div>
            <div className="font-semibold text-slate-700 leading-snug">
              {getActionGuidance()}
            </div>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Refresh Live Status"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        )}
      </div>
    </div>
  );
};
