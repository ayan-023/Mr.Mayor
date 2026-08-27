/**
 * MR. MAYOR - Field Quality Control & AI Photo Inspection Hub (Editorial Aesthetic)
 */

import React, { useState } from 'react';
import {
  Eye,
  Sparkles,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { Inspection, Project } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface InspectionsHubProps {
  inspections: Inspection[];
  projects: Project[];
  onRefreshData: () => void;
}

export const InspectionsHub: React.FC<InspectionsHubProps> = ({
  inspections,
  projects,
  onRefreshData,
}) => {
  const { currentUser } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [stage, setStage] = useState('Backfilling & Compaction');
  const [overallRating, setOverallRating] = useState('SATISFACTORY');
  const [barricadesCompliant, setBarricadesCompliant] = useState(true);
  const [trafficDiversionActive, setTrafficDiversionActive] = useState(true);
  const [compactionTestPassed, setCompactionTestPassed] = useState(true);
  const [compactionDensityPct, setCompactionDensityPct] = useState(96.4);
  const [notes, setNotes] = useState('');

  // AI Photo Inspection State
  const [aiPhotoType, setAiPhotoType] = useState('Backfill Compaction Layer');
  const [aiNotes, setAiNotes] = useState('Compaction test done with 10-ton tandem roller. Granular sub-base layer.');
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInspectAI = async () => {
    setIsAnalyzingAI(true);
    try {
      const selectedProj = projects.find((p) => p.id === selectedProjectId);
      const res = await api.inspectPhotosAI(
        aiPhotoType,
        aiNotes,
        selectedProj?.roadName || 'Gangapur Road'
      );
      setAiAnalysisResult(res);
    } catch (err: any) {
      alert(err.message || 'AI Photo analysis failed');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProj = projects.find((p) => p.id === selectedProjectId);
    if (!selectedProj) return;

    setIsSubmitting(true);
    try {
      await api.submitInspection({
        projectId: selectedProj.id,
        projectName: selectedProj.name,
        roadId: selectedProj.roadId,
        roadName: selectedProj.roadName,
        stage,
        overallRating,
        barricadesCompliant,
        trafficDiversionActive,
        compactionTestPassed,
        compactionDensityPercentage: compactionDensityPct,
        notes: notes || 'Inspection conducted as per IRC SP:98 and Municipal Quality Manual.',
        inspectorName: currentUser?.name || 'Authorized Quality Inspector',
        inspectorDesignation: currentUser?.designation || 'Quality Control Officer',
        photoUrls: ['/inspections/sample1.jpg'],
        aiDefectFlags: aiAnalysisResult?.defectsDetected || [],
      });
      onRefreshData();
      alert('Inspection logged and verified with AI QC analysis!');
    } catch (err: any) {
      alert(err.message || 'Failed to submit inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-2xl p-6 md:p-8 shadow-2xs flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8A8A8A] mb-1">
            CIVIL ENGINEERING QUALITY ASSURANCE
          </div>
          <h1 className="text-xl md:text-2xl font-serif-editorial font-bold text-[#1A1A1A] flex items-center gap-2">
            Field Quality Control & AI Photo Inspections
          </h1>
          <p className="text-xs text-[#5A5A5A] mt-1">
            Enforcing compaction standards (95%+ Proctor Density), safety barricading, and computer vision QC
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#F0EEEB] text-[#1A1A1A] border border-[#1A1A1A]/10 text-[10px] uppercase tracking-wider font-bold font-mono">
          {inspections.length} Audits Completed
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Inspections Log */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.18em]">
            Completed Field Inspections ({inspections.length})
          </h3>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {inspections.map((insp) => (
              <div
                key={insp.id}
                className="p-4 rounded-xl bg-[#FFFFFF] border border-[#1A1A1A]/10 space-y-1.5 text-xs shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-[#1A1A1A]">{insp.stage}</span>
                    <div className="text-[11px] text-[#737373]">{insp.projectName}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      insp.overallRating === 'EXCELLENT' || insp.overallRating === 'SATISFACTORY'
                        ? 'bg-[#EEF5F0] text-[#2E6B4F] border border-[#2E6B4F]/30'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {insp.overallRating}
                  </span>
                </div>

                <div className="text-[11px] text-[#5A5A5A]">
                  Compaction: <strong className="text-[#2E6B4F] font-mono">{insp.compactionDensityPercentage || 95}%</strong>
                </div>

                <div className="text-[10px] text-[#8A8A8A] pt-1.5 border-t border-[#1A1A1A]/5 flex justify-between font-serif-editorial">
                  <span>Inspector: {insp.inspectorName}</span>
                  <span>{insp.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: New Inspection Form & Gemini AI Visual Analyzer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gemini AI Photo Analyzer Box */}
          <div className="bg-[#FAF0E6]/50 border border-[#A35C28]/25 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-[#A35C28] text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                Gemini Vision AI Photo QC & Barricade Analyzer
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-[#FFFFFF] text-[#A35C28] border border-[#A35C28]/30 font-bold uppercase">
                CV Model
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#737373] text-[11px] mb-1">Inspection Photo Stage</label>
                <select
                  value={aiPhotoType}
                  onChange={(e) => setAiPhotoType(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-2.5 text-[#1A1A1A] focus:outline-none"
                >
                  <option value="Pre-Excavation Baseline">Pre-Excavation Baseline</option>
                  <option value="Trench Barricade & Warning Signage">Trench Barricade & Warning Signage</option>
                  <option value="Backfill Compaction Layer">Backfill Compaction Layer</option>
                  <option value="Final Bituminous Surface Restoration">Final Bituminous Surface Restoration</option>
                </select>
              </div>

              <div>
                <label className="block text-[#737373] text-[11px] mb-1">Site Observation Notes</label>
                <input
                  type="text"
                  value={aiNotes}
                  onChange={(e) => setAiNotes(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-2.5 text-[#1A1A1A] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleInspectAI}
              disabled={isAnalyzingAI}
              className="px-4 py-2.5 rounded-lg bg-[#1A1A1A] hover:bg-[#333333] text-[#FDFCFB] font-bold text-[10px] uppercase tracking-wider shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5" />
              {isAnalyzingAI ? 'Analyzing...' : 'Run Instant AI Photo QC Analysis'}
            </button>

            {aiAnalysisResult && (
              <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#1A1A1A]/10 space-y-2 text-xs animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-serif-editorial font-bold text-[#1A1A1A] text-sm">AI Quality Score: {aiAnalysisResult.qualityScore}/100</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#EEF5F0] text-[#2E6B4F] border border-[#2E6B4F]/30 uppercase">
                    Compliance: {aiAnalysisResult.compactionCompliance}
                  </span>
                </div>
                <p className="text-[#5A5A5A] text-[11px] font-serif-editorial">{aiAnalysisResult.analysis}</p>
                <div className="text-[11px] text-[#A35C28] font-semibold">
                  Safety Barricade Status: {aiAnalysisResult.barricadeStatus}
                </div>
              </div>
            )}
          </div>

          {/* Form to submit official inspection */}
          <form onSubmit={handleSubmitInspection} className="bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-2xl p-6 md:p-8 shadow-2xs space-y-4 text-xs">
            <h3 className="font-serif-editorial font-bold text-[#1A1A1A] text-lg">Log Official Quality Inspection</h3>

            <div>
              <label className="block text-[#737373] mb-1">Target Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-2.5 text-[#1A1A1A] focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.roadName} • {p.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#737373] mb-1">Inspection Stage</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-2 text-[#1A1A1A] focus:outline-none"
                >
                  <option value="Pre-Excavation Baseline">Pre-Excavation Baseline</option>
                  <option value="Trench Shoring & Safety">Trench Shoring & Safety</option>
                  <option value="Backfilling & Compaction">Backfilling & Compaction</option>
                  <option value="Final Surface Quality QC">Final Surface Quality QC</option>
                </select>
              </div>

              <div>
                <label className="block text-[#737373] mb-1">Overall Rating</label>
                <select
                  value={overallRating}
                  onChange={(e) => setOverallRating(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-2 text-[#1A1A1A] focus:outline-none"
                >
                  <option value="EXCELLENT">EXCELLENT</option>
                  <option value="SATISFACTORY">SATISFACTORY</option>
                  <option value="NEEDS_IMPROVEMENT">NEEDS IMPROVEMENT</option>
                  <option value="DEFECTIVE">DEFECTIVE (Non-Compliant)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#737373] mb-1">Proctor Compaction %</label>
                <input
                  type="number"
                  step="0.1"
                  value={compactionDensityPct}
                  onChange={(e) => setCompactionDensityPct(Number(e.target.value))}
                  className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-2 text-[#1A1A1A] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 p-3 rounded-lg bg-[#FDFCFB] border border-[#1A1A1A]/10 text-[#1A1A1A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={barricadesCompliant}
                  onChange={(e) => setBarricadesCompliant(e.target.checked)}
                  className="rounded border-[#1A1A1A]/20 accent-[#1A1A1A]"
                />
                <span className="text-xs">Safety Barricading & Blinkers Verified</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-lg bg-[#FDFCFB] border border-[#1A1A1A]/10 text-[#1A1A1A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={trafficDiversionActive}
                  onChange={(e) => setTrafficDiversionActive(e.target.checked)}
                  className="rounded border-[#1A1A1A]/20 accent-[#1A1A1A]"
                />
                <span className="text-xs">Traffic Police Approved Detour Active</span>
              </label>
            </div>

            <div>
              <label className="block text-[#737373] mb-1">Inspector Technical Remarks</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter field observations, compaction test results, and compliance sign-off..."
                className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-2.5 text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg bg-[#1A1A1A] hover:bg-[#333333] text-[#FDFCFB] font-bold text-[10px] uppercase tracking-widest shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E6B4F]" />
                {isSubmitting ? 'Recording Inspection...' : 'Record Verified Inspection Sign-off'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
