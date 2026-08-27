/**
 * MR. MAYOR - Flagship 3-Agency AI Coordination Story Walkthrough Modal
 * Updated to reflect the AI Infrastructure Analysis Center & 9 Core Governance Questions (Spec Sections 1 - 68)
 */

import React, { useState } from 'react';
import {
  X,
  Zap,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FileCheck,
  TrendingDown,
  Layers,
  Calendar,
  IndianRupee,
  ShieldCheck,
  ArrowRight,
  Printer,
} from 'lucide-react';

interface MasterDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tabId: string) => void;
}

export const MasterDemoModal: React.FC<MasterDemoModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      stepNumber: 1,
      badge: 'THE UNCOORDINATED PROBLEM',
      badgeColor: 'bg-red-50 text-red-800 border-red-200',
      title: 'Phase 1: Three Departmental Silos on Gangapur Road',
      subtitle: '3 agencies independently schedule uncoordinated excavations within 60 days on the same corridor.',
      content: (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-red-50/40 border border-red-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-red-950 text-sm">3 Independent Road-Opening Requests Submitted:</h4>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                Corridor: Gangapur Road (CBS to Someshwar)
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div>
                  <strong className="text-blue-900">1. Water & Sewerage Department:</strong> 450mm Feeder Pipeline
                  <div className="text-[11px] text-slate-500 font-mono">Window: Oct 01 - Oct 15 • Cost: ₹64.5 Lakhs</div>
                </div>
                <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  1.8m Depth
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div>
                  <strong className="text-emerald-900">2. Drainage Department:</strong> Stormwater Reinforced Box Culvert
                  <div className="text-[11px] text-slate-500 font-mono">Window: Oct 20 - Nov 05 • Cost: ₹88.0 Lakhs</div>
                </div>
                <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  2.6m Depth
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div>
                  <strong className="text-purple-900">3. City Gas & Telecom (MNGL / OFC):</strong> PNG Distribution Grid & 5G Ducts
                  <div className="text-[11px] text-slate-500 font-mono">Window: Nov 10 - Nov 25 • Cost: ₹42.0 Lakhs</div>
                </div>
                <span className="font-mono text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  1.4m Depth
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-100/70 border border-red-300 text-[11px] text-red-950 font-medium space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-red-900">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>The Traditional Municipal Failure:</span>
              </div>
              <p>
                Without MR. MAYOR, Gangapur Road would be dug and resurfaced <strong>3 consecutive times</strong>, destroying newly laid Bituminous Concrete, causing <strong>45 days of commuter gridlock</strong> at Canada Corner, and wasting <strong>₹92.26 Lakhs</strong> of taxpayer funds in duplicate restorations.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      stepNumber: 2,
      badge: 'AI ANALYTICAL DISCOVERY',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      title: 'Phase 2: What Did MR. MAYOR Analyze?',
      subtitle: 'The AI Engine evaluates spatial-temporal overlap, CTTP 2016 traffic baseline, and ₹135 Cr moratorium.',
      content: (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Grounded Engineering Evaluation</span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider">
                Clash Score: 94 / 100
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Spatial analysis calculated an <strong>82% polyline corridor overlap (1,200m)</strong> along Gangapur Road. The AI synthesized multiple government data streams:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">CTTP 2016 Baseline</span>
                <div className="font-bold text-slate-900">V/C = 0.88 (High Pressure)</div>
                <div className="text-[10px] text-slate-500">Canada Corner: 32,802 PCU (Peak 17:45-18:45)</div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Road Moratorium Policy</span>
                <div className="font-bold text-red-700">₹135 Cr Protected Corridor</div>
                <div className="text-[10px] text-slate-500">Resurfaced &lt;180 days ago • Ban on repeated cuts</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
              <div className="text-slate-900 font-bold flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Automated System Actions:
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Blocked uncoordinated individual road-opening permits under MMCA 1949 Section 197.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Synthesized statutory Analysis Dossier: <code className="text-blue-700 font-mono font-bold">ANA-2026-NSKGAS003</code>.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Generated 3 candidate execution models (Plan A, Plan B, Plan C).</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      stepNumber: 3,
      badge: 'AI PROPOSED SOLUTION',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      title: 'Phase 3: Geotechnical Depth Hierarchy & Single Window',
      subtitle: 'Plan A: A single synchronized 24-day joint trenching window with strict depth sequencing.',
      content: (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-emerald-950 text-sm">
                  Recommended Strategy: Plan A (Single 24-Day Window)
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-600 text-white uppercase">
                Depth-Ordered
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Utilities are strictly ordered from deepest to shallowest to avoid destructive undercutting and settlement risks:
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-white border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">1</span>
                  <span className="font-bold text-slate-900">Days 01-08: Drainage Box Culvert</span>
                </div>
                <span className="text-blue-700 font-bold">2.6m Depth (Deepest)</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">2</span>
                  <span className="font-bold text-slate-900">Days 09-15: Water 450mm DI Feeder Main</span>
                </div>
                <span className="text-blue-700 font-bold">1.8m Depth</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">3</span>
                  <span className="font-bold text-slate-900">Days 16-20: City Gas PNG Grid & Telecom 5G</span>
                </div>
                <span className="text-blue-700 font-bold">1.4m & 0.9m Depth</span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 flex items-center justify-between text-emerald-950 font-sans">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-bold">Days 21-24: Compaction QC & Unified Bituminous Concrete Resurfacing</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 font-mono">95%+ Proctor Density</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      stepNumber: 4,
      badge: 'QUANTIFIED IMPACT',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
      title: 'Phase 4: What Will It Save? (The Demonstrable ROI)',
      subtitle: 'Quantified taxpayer savings, eliminated road excavations, and reduced traffic disruption.',
      content: (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 text-xs shadow-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900 text-sm">Demonstrable Public Governance Impact</span>
              <span className="font-bold text-emerald-700 text-sm font-mono">Total Saved: ₹92.26 Lakhs</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Avoided Cuts</div>
                <div className="text-xl font-bold text-blue-700 font-mono mt-1">7 Eliminated</div>
                <div className="text-[10px] text-slate-500">Down from 8 separate cuts</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Avoided Restorations</div>
                <div className="text-xl font-bold text-emerald-700 font-mono mt-1">7 Patches</div>
                <div className="text-[10px] text-slate-500">Replaced by 1 joint seal</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Traffic Disruption</div>
                <div className="text-xl font-bold text-purple-700 font-mono mt-1">-65% Delay</div>
                <div className="text-[10px] text-slate-500">Single off-peak detour</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Funds Saved</div>
                <div className="text-xl font-bold text-emerald-700 font-mono mt-1">₹92.26 L</div>
                <div className="text-[10px] text-slate-500">Net municipal savings</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Statutory Decision Order:</strong> Accepted and bound under Maharashtra Municipal Corporations Act (MMCA 1949) Section 197.
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      stepNumber: 5,
      badge: 'OFFICIAL REPORT STUDIO',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      title: 'Phase 5: Official Report Studio & Quality Inspection',
      subtitle: 'Print Gazette-styled official reports or switch into the dedicated AI Infrastructure Analysis Center.',
      content: (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950 text-white space-y-4 text-xs shadow-md">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-400" />
                <h4 className="font-bold text-white text-sm">
                  Official Municipal Report Generated (ANA-2026-NSKGAS003)
                </h4>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                MR. MAYOR provides 4 standardized, role-scoped export formats: Full Municipal Coordination Report, Department Action Schedule, Field QC Inspection Sheet, and Public Traffic Advisory.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                <strong className="text-white block">Full Municipal Gazette</strong>
                <span className="text-slate-400">Contains full 9 questions, CTTP traffic analysis, and financial ledgers.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                <strong className="text-white block">Field QC Inspection Sheet</strong>
                <span className="text-slate-400">95%+ Proctor Density compaction checklists for site auditors.</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono">
                Digital Hash: NMC-AUTH-VALID • Act: MMCA 1949 / Sec 197 Certified
              </span>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToTab('ai-analysis');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Launch AI Analysis Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm font-bold">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600">
                  FLAGSHIP 3-AGENCY COORDINATION DEMO
                </span>
                <span className={`px-2 py-0.2 rounded text-[9px] font-bold border ${steps[currentStep].badgeColor}`}>
                  {steps[currentStep].badge}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                MR. MAYOR — Urban Infrastructure Intelligence
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-900">{steps[currentStep].title}</h3>
            <p className="text-xs text-slate-500">{steps[currentStep].subtitle}</p>
          </div>

          {steps[currentStep].content}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-30 shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {/* Step Indicators */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStep ? 'bg-blue-600 w-6' : 'bg-slate-300 w-2 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Next Phase</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onNavigateToTab('ai-analysis');
              }}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Launch AI Analysis Center →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
