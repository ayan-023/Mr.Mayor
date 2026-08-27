/**
 * MR. MAYOR - Approvals Queue & Multi-Stakeholder Routing Component (Editorial Aesthetic)
 */

import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldCheck,
  Clock,
  Lock,
} from 'lucide-react';
import { ApprovalWorkflow } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface ApprovalsQueueProps {
  workflows: ApprovalWorkflow[];
  onRefreshData: () => void;
}

export const ApprovalsQueue: React.FC<ApprovalsQueueProps> = ({ workflows, onRefreshData }) => {
  const { currentUser } = useAuth();
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(workflows[0] || null);
  const [remarks, setRemarks] = useState('');
  const [overrideAI, setOverrideAI] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Determine current pending step
  const currentStep = selectedWorkflow
    ? selectedWorkflow.steps[selectedWorkflow.currentStepIndex] || selectedWorkflow.steps[selectedWorkflow.steps.length - 1]
    : null;

  const isOverallApproved = selectedWorkflow?.overallStatus === 'APPROVED';
  const isOverallRejected = selectedWorkflow?.overallStatus === 'REJECTED';

  // Check if the authenticated user is the designated authority for the pending step
  const isAuthorizedForCurrentStep = () => {
    if (!currentUser || !currentStep) return false;
    if (currentUser.role === 'CONTRACTOR' || currentUser.role === 'CITIZEN') return false;

    // Apex leadership can sign any municipal clearance
    if (
      currentUser.role === 'COMMISSIONER' ||
      currentUser.role === 'NODAL_OFFICER' ||
      currentUser.role === 'ADMIN'
    ) {
      return true;
    }

    const reqRole = (currentStep as any).roleRequired;
    const reqDept = (currentStep as any).departmentRequired || (currentStep as any).department;

    if (reqRole && reqRole === currentUser.role) return true;
    if (reqDept && reqDept === currentUser.department) return true;

    // Traffic Police DCP
    if (
      currentUser.department === 'Traffic Police Authority' &&
      (reqRole === 'TRAFFIC_DCP' ||
        (typeof reqDept === 'string' && reqDept.includes('Traffic')) ||
        currentUser.id === 'USR-006')
    ) {
      return true;
    }

    // PWD Road Authority
    if (
      currentUser.department === 'Roads / PWD' &&
      (reqRole === 'SUPERINTENDING_ENGINEER' ||
        (typeof reqDept === 'string' && (reqDept.includes('PWD') || reqDept.includes('Roads'))) ||
        currentUser.id === 'USR-007')
    ) {
      return true;
    }

    // Utility Engineers
    if (
      (currentUser.role === 'EXECUTIVE_ENGINEER' || currentUser.role === 'DEPT_HEAD') &&
      reqDept === currentUser.department
    ) {
      return true;
    }

    return false;
  };

  const handleAction = async (action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED') => {
    if (!selectedWorkflow || !currentUser) return;
    if (overrideAI && !overrideReason.trim()) {
      alert('Please provide a senior engineering justification for overriding AI recommendation.');
      return;
    }

    setIsProcessing(true);
    try {
      await api.takeApprovalAction(selectedWorkflow.id, {
        action,
        approverName: currentUser.name,
        designation: currentUser.designation,
        remarks: remarks || `Action ${action} by ${currentUser.name} (${currentUser.designation})`,
        overrideAI,
        overrideReason: overrideAI ? overrideReason : undefined,
      });
      setRemarks('');
      setOverrideAI(false);
      setOverrideReason('');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Approval action failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-2xl p-6 md:p-8 shadow-2xs flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8A8A8A] mb-1">
            MUNICIPAL STAKEHOLDER DIRECTORY
          </div>
          <h1 className="text-xl md:text-2xl font-serif-editorial font-bold text-[#1A1A1A] flex items-center gap-2">
            Inter-Agency Approval & Sanction Queue
          </h1>
          <p className="text-xs text-[#5A5A5A] mt-1">
            Coordinated sign-offs across Road Authority, Traffic Police DCP, PWD, and Utility Boards
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#FAF0E6] text-[#A35C28] border border-[#A35C28]/30 text-[10px] uppercase tracking-wider font-bold font-mono">
          {workflows.filter((w) => w.overallStatus === 'PENDING').length} Pending Requests
        </span>
      </div>

      {/* Workflows Grid */}
      {workflows.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-2xl p-12 text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#FAF0E6] text-[#A35C28] flex items-center justify-center mx-auto border border-[#A35C28]/20">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-serif-editorial font-bold text-xl text-[#1A1A1A]">
              No Clearance Workflows Pending
            </h3>
            <p className="text-xs text-[#737373] leading-relaxed">
              When excavation proposals are submitted by utility agencies, they will be sequenced into multi-stage approval workflows (Ward Engineer, Traffic Police DCP, Municipal Commissioner) here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left List */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.18em]">
              Workflows Requiring Action
            </h3>

            <div className="space-y-3">
              {workflows.map((wf) => {
                const isSelected = wf.id === selectedWorkflow?.id;
                return (
                  <div
                    key={wf.id}
                    onClick={() => setSelectedWorkflow(wf)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-[#FFFFFF] border-[#1A1A1A] shadow-sm ring-1 ring-[#1A1A1A]'
                        : 'bg-[#FDFCFB] border-[#1A1A1A]/10 hover:bg-[#FFFFFF]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-[#737373]">#{wf.id}</span>
                        <h4 className="font-serif-editorial font-bold text-[#1A1A1A] text-sm mt-0.5">{wf.projectName}</h4>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          wf.overallStatus === 'APPROVED'
                            ? 'bg-[#EEF5F0] text-[#2E6B4F] border border-[#2E6B4F]/30'
                            : wf.overallStatus === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-[#FAF0E6] text-[#A35C28] border border-[#A35C28]/30'
                        }`}
                      >
                        {wf.overallStatus}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#737373]">
                      Dept: <span className="text-[#1A1A1A] font-medium">{wf.department}</span>
                    </p>

                    <div className="text-[10px] text-[#8A8A8A] pt-2 border-t border-[#1A1A1A]/5 flex justify-between">
                      <span>Current Step: {`${wf.currentStepIndex + 1} of ${wf.steps.length}`}</span>
                      <span>Created: {new Date(wf.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Detail & Action Box */}
          {selectedWorkflow && (
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-2xl p-6 md:p-8 shadow-2xs space-y-6">
              <div className="flex items-start justify-between border-b border-[#1A1A1A]/10 pb-4">
                <div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#F0EEEB] text-[#1A1A1A] uppercase tracking-wider">
                    Workflow #{selectedWorkflow.id}
                  </span>
                  <h2 className="text-xl font-serif-editorial font-bold text-[#1A1A1A] mt-1.5">
                    {selectedWorkflow.projectName}
                  </h2>
                  <p className="text-xs text-[#737373]">{selectedWorkflow.department}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    selectedWorkflow.overallStatus === 'APPROVED'
                      ? 'bg-[#EEF5F0] text-[#2E6B4F] border border-[#2E6B4F]/30'
                      : 'bg-[#FAF0E6] text-[#A35C28] border border-[#A35C28]/30'
                  }`}
                >
                  {selectedWorkflow.overallStatus}
                </span>
              </div>

              {/* Sequential Steps List */}
              <div className="space-y-3">
                <h3 className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider">Sequential Stakeholder Sign-offs</h3>
                {selectedWorkflow.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="p-4 rounded-xl bg-[#FDFCFB] border border-[#1A1A1A]/10 flex items-start justify-between text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5 text-xs ${
                          step.status === 'APPROVED'
                            ? 'bg-[#2E6B4F] text-white'
                            : step.status === 'REJECTED'
                            ? 'bg-rose-600 text-white'
                            : 'bg-[#F0EEEB] text-[#1A1A1A]'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-[#1A1A1A]">
                          {(step as any).stepName || (step as any).stakeholderName || 'Authorization Step'} (
                          {(step as any).departmentRequired || (step as any).department || 'Municipal Authority'}
                          )
                        </div>
                        <div className="text-[11px] text-[#737373]">
                          {(step as any).approverName
                            ? `Approved by ${(step as any).approverName} (${(step as any).approverDesignation || (step as any).roleRequired || 'Officer'})`
                            : `Role Required: ${(step as any).roleRequired || (step as any).designation || 'Signatory'}`}
                        </div>
                        {step.remarks && (
                          <div className="text-[11px] text-[#5A5A5A] mt-1 italic font-serif-editorial">
                            "{step.remarks}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          step.status === 'APPROVED'
                            ? 'bg-[#EEF5F0] text-[#2E6B4F] border border-[#2E6B4F]/30'
                            : step.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-[#FAF0E6] text-[#A35C28] border border-[#A35C28]/30'
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Decision Box - Strictly Role-Based */}
              {currentUser?.role === 'CONTRACTOR' || currentUser?.role === 'CITIZEN' ? (
                /* Contractor or Public View - Read-only Progress */
                <div className="pt-6 border-t border-[#1A1A1A]/10">
                  <div className="p-4 rounded-xl bg-[#F7F6F3] border border-[#1A1A1A]/10 text-xs flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#2E6B4F] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[#1A1A1A]">Statutory Clearance Progress Tracker</div>
                      <div className="text-[11px] text-[#737373] mt-0.5">
                        {currentUser.role === 'CONTRACTOR'
                          ? 'As an authorized Contractor, you have read-only visibility into statutory multi-agency clearances. Clearance approval buttons are strictly restricted to designated Municipal & Traffic Directors.'
                          : 'Public Gazette Record: Tracking statutory inter-agency utility clearances.'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : isOverallApproved ? (
                /* Already Approved - Button disappears, shows Approved seal */
                <div className="pt-6 border-t border-[#1A1A1A]/10">
                  <div className="p-5 rounded-2xl bg-[#EEF5F0] border border-[#2E6B4F]/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#2E6B4F] font-bold text-xs uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" />
                        Official Municipal Sanction Granted
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-[#2E6B4F] text-white text-[9px] font-bold uppercase tracking-widest font-mono">
                        APPROVED & SEALED
                      </span>
                    </div>
                    <p className="text-xs text-[#2E6B4F]/90">
                      All mandatory stakeholder approvals, traffic diversions, and joint utility consensus sign-offs have been completed. This project is authorized for Road Opening Permit issuance.
                    </p>
                  </div>
                </div>
              ) : isOverallRejected ? (
                /* Rejected State */
                <div className="pt-6 border-t border-[#1A1A1A]/10">
                  <div className="p-5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                      <XCircle className="w-4 h-4 text-rose-700" />
                      Sanction Request Rejected
                    </div>
                    <p className="text-xs text-rose-800">
                      This project clearance request was formally rejected by municipal authorities. Re-submission with revised alignment is required.
                    </p>
                  </div>
                </div>
              ) : isAuthorizedForCurrentStep() ? (
                /* Authorized Authority - Pending Action */
                <div className="pt-6 border-t border-[#1A1A1A]/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[#1A1A1A] text-xs">
                      Take Approval Decision as <span className="font-serif-editorial text-sm">{currentUser?.name}</span> ({currentUser?.designation})
                    </h3>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#A35C28] bg-[#FAF0E6] px-2 py-0.5 rounded border border-[#A35C28]/30">
                      Authority Action Required
                    </span>
                  </div>

                  <div>
                    <label className="block text-[#737373] text-xs mb-1">Remarks & Technical Comments</label>
                    <textarea
                      rows={2}
                      placeholder="Enter official engineering observations or approval conditions..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-3 text-xs text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none focus:border-[#1A1A1A]"
                    />
                  </div>

                  {/* AI Override Checkbox */}
                  <div className="p-4 rounded-xl bg-[#FAF0E6]/50 border border-[#A35C28]/25 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#A35C28] select-none">
                      <input
                        type="checkbox"
                        checked={overrideAI}
                        onChange={(e) => setOverrideAI(e.target.checked)}
                        className="rounded border-[#1A1A1A]/20 accent-[#A35C28]"
                      />
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Senior Override AI Recommendation (Requires Reason)</span>
                    </label>

                    {overrideAI && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Mandatory engineering justification for overriding AI suggestion..."
                          value={overrideReason}
                          onChange={(e) => setOverrideReason(e.target.value)}
                          className="w-full bg-[#FFFFFF] border border-[#A35C28]/40 rounded-lg p-2.5 text-xs text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Decision Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleAction('REJECTED')}
                      disabled={isProcessing}
                      className="px-4 py-2.5 rounded-lg bg-[#FAF0E6] hover:bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject Request
                    </button>
                    <button
                      onClick={() => handleAction('APPROVED')}
                      disabled={isProcessing}
                      className="px-5 py-2.5 rounded-lg bg-[#1A1A1A] hover:bg-[#333333] text-[#FDFCFB] font-bold text-[10px] uppercase tracking-widest shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2E6B4F]" /> Grant Official Approval
                    </button>
                  </div>
                </div>
              ) : (
                /* Other Authority - Pending on another department */
                <div className="pt-6 border-t border-[#1A1A1A]/10 space-y-2">
                  <div className="p-4 rounded-xl bg-[#FAF0E6]/60 border border-[#A35C28]/25 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-[#A35C28] font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      Pending Clearance from: {(currentStep as any)?.stepName || (currentStep as any)?.departmentRequired || (currentStep as any)?.roleRequired}
                    </div>
                    <p className="text-[11px] text-[#737373]">
                      You are logged in as <span className="font-semibold text-[#1A1A1A]">{currentUser?.name}</span> ({currentUser?.designation}). Approval actions for this specific milestone are assigned to the required authority desk.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);
};
