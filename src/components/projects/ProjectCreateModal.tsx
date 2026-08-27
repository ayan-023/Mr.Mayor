/**
 * MR. MAYOR - Project Registration & Submission Modal (Editorial Aesthetic)
 * Implements full municipal project proposal form with GIS alignment and document attachments.
 */

import React, { useState } from 'react';
import {
  X,
  Folders,
  Calendar,
  IndianRupee,
  Layers,
  AlertTriangle,
  FileText,
  Upload,
  CheckCircle2,
  Sparkles,
  MapPin,
  Flame,
} from 'lucide-react';
import { Road, Project, DepartmentName, TrafficImpact, ProjectPriority, LatLng } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  roads: Road[];
  onProjectCreated: (project: Project) => void;
  presetRoadId?: string;
  presetDepartment?: DepartmentName;
}

export const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  isOpen,
  onClose,
  roads,
  onProjectCreated,
  presetRoadId,
  presetDepartment,
}) => {
  const { currentUser } = useAuth();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState<DepartmentName>(
    presetDepartment || (currentUser?.department as DepartmentName) || 'Water & Sewerage'
  );
  const [projectType, setProjectType] = useState('New Pipeline Laying');
  const [description, setDescription] = useState('');
  const [selectedRoadId, setSelectedRoadId] = useState(presetRoadId || roads[0]?.id || 'RD-001');
  const [requiredStartDate, setRequiredStartDate] = useState('2026-08-01');
  const [requiredCompletionDate, setRequiredCompletionDate] = useState('2026-08-15');
  const [expectedDurationDays, setExpectedDurationDays] = useState(14);
  const [excavationWidth, setExcavationWidth] = useState(1.4);
  const [excavationDepth, setExcavationDepth] = useState(1.8);
  const [estimatedCostINR, setEstimatedCostINR] = useState(6450000);
  const [trafficImpact, setTrafficImpact] = useState<TrafficImpact>('High');
  const [priority, setPriority] = useState<ProjectPriority>('High Priority');
  const [isEmergency, setIsEmergency] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [contractorName, setContractorName] = useState('M/s InfraTech Constr.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const selectedRoad = roads.find((r) => r.id === selectedRoadId) || roads[0];
  const affectedAreaSqM = Math.round(selectedRoad ? selectedRoad.lengthKm * 1000 * excavationWidth * 0.7 : 1500);
  const estimatedExcavationCost = Math.round(affectedAreaSqM * 350);
  const estimatedRestorationCost = Math.round(affectedAreaSqM * 650);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a project title.');
      return;
    }

    if (!selectedRoad) {
      setErrorMsg('No road corridor selected. Please register a road corridor in Road Twin Hub first.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const roadGeo = selectedRoad.geometry || [
        { lat: 20.002, lng: 73.782 },
        { lat: 20.005, lng: 73.788 },
      ];
      const startCoord = roadGeo[0] || { lat: 20.002, lng: 73.782 };
      const endCoord = roadGeo[roadGeo.length - 1] || { lat: 20.005, lng: 73.788 };

      const payload: Partial<Project> = {
        name,
        department,
        projectType,
        description,
        roadId: selectedRoad.id,
        roadName: selectedRoad.name,
        geometry: roadGeo,
        startCoordinates: startCoord,
        endCoordinates: endCoord,
        lengthMeters: Math.round(selectedRoad.lengthKm * 1000 * 0.7),
        requiredStartDate,
        requiredCompletionDate,
        expectedExcavationDurationDays: expectedDurationDays,
        excavationWidthMeters: excavationWidth,
        excavationDepthMeters: excavationDepth,
        affectedAreaSqMeters: affectedAreaSqM,
        estimatedCostINR,
        estimatedExcavationCostINR: estimatedExcavationCost,
        estimatedRestorationCostINR: estimatedRestorationCost,
        trafficImpact,
        priority,
        isEmergency,
        emergencyReason: isEmergency ? emergencyReason : undefined,
        contractorName,
        submittedBy: currentUser?.name || 'Authorized Engineer',
        submittedByDesignation: currentUser?.designation || 'Executive Engineer',
        documents: [
          {
            id: `DOC-${Date.now()}-1`,
            title: 'Detailed Project Report (DPR)',
            type: 'DPR',
            fileName: `DPR_${(name || 'Project').replace(/\s+/g, '_')}.pdf`,
            fileSize: '3.8 MB',
            uploadedAt: new Date().toISOString().split('T')[0],
            uploadedBy: currentUser?.name || 'Engineer',
          },
          {
            id: `DOC-${Date.now()}-2`,
            title: 'Traffic Diversion Scheme',
            type: 'Traffic Plan',
            fileName: 'Traffic_Management_Plan.pdf',
            fileSize: '1.4 MB',
            uploadedAt: new Date().toISOString().split('T')[0],
            uploadedBy: currentUser?.name || 'Engineer',
          },
        ],
      };

      const res = await api.createProject(payload);
      onProjectCreated(res.project);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-[#1A1A1A]/10 flex items-center justify-between bg-[#FDFCFB]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#F0EEEB] text-[#1A1A1A] border border-[#1A1A1A]/10">
              <Folders className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8A8A8A]">
                Official Project Proposal
              </div>
              <h2 className="text-lg md:text-xl font-serif-editorial font-bold text-[#1A1A1A]">
                Register Infrastructure Excavation Project
              </h2>
              <p className="text-xs text-[#737373]">
                Submits proposal to GIS Conflict Engine for multi-department coordination check
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#737373] hover:text-[#1A1A1A] hover:bg-[#F0EEEB] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-xs bg-[#FFFFFF]">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-[#FAF0E6] border border-[#A35C28]/40 text-[#A35C28] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.18em]">
              1. Project Identification
            </h3>

            <div>
              <label className="block text-[#1A1A1A] font-semibold mb-1">Project Name *</label>
              <input
                type="text"
                placeholder="e.g. Gangapur Road 450mm Feeder Pipeline Augmentation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-lg px-3 py-2 text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#1A1A1A] font-semibold mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as DepartmentName)}
                  className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                >
                  <option value="Water & Sewerage">Water & Sewerage</option>
                  <option value="Drainage Department">Drainage Department</option>
                  <option value="Telecom & Digital">Telecom & Digital</option>
                  <option value="Electricity (DISCOM)">Electricity (DISCOM)</option>
                  <option value="City Gas Distribution">City Gas Distribution</option>
                  <option value="Roads / PWD">Roads / PWD</option>
                </select>
              </div>

              <div>
                <label className="block text-[#1A1A1A] font-semibold mb-1">Project Type</label>
                <input
                  type="text"
                  placeholder="e.g. Potable Water Pipeline Laying"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#1A1A1A] font-semibold mb-1">Scope & Engineering Description</label>
              <textarea
                rows={2}
                placeholder="Describe scope, trench method, pipeline diameter, and public purpose..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-lg px-3 py-2 text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>
          </div>

          {/* Section 2: GIS Road Alignment */}
          <div className="space-y-3 pt-4 border-t border-[#1A1A1A]/10">
            <h3 className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.18em]">
              2. Road Corridor & GIS Location
            </h3>

            <div>
              <label className="block text-[#1A1A1A] font-semibold mb-1">Target Road Corridor *</label>
              <select
                value={selectedRoadId}
                onChange={(e) => setSelectedRoadId(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] font-medium"
              >
                {roads.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.category} • {r.protectionStatus})
                  </option>
                ))}
              </select>
            </div>

            {selectedRoad && selectedRoad.protectionStatus === 'PROTECTED' && (
              <div className="p-3 rounded-lg bg-[#EEF5F0] border border-[#2E6B4F]/30 text-[#2E6B4F] text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E6B4F] shrink-0" />
                <span>
                  Notice: Road is under active protection ("Do Not Dig") until {selectedRoad.protectionExpiryDate}. Submission will require special senior approval justification.
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Schedule & Dimensions */}
          <div className="space-y-3 pt-4 border-t border-[#1A1A1A]/10">
            <h3 className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.18em]">
              3. Proposed Window & Excavation Dimensions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#1A1A1A] font-semibold mb-1">Required Start Date</label>
                <input
                  type="date"
                  value={requiredStartDate}
                  onChange={(e) => setRequiredStartDate(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A] font-semibold mb-1">Required Completion Date</label>
                <input
                  type="date"
                  value={requiredCompletionDate}
                  onChange={(e) => setRequiredCompletionDate(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A] font-semibold mb-1">Excavation Days</label>
                <input
                  type="number"
                  min={1}
                  value={expectedDurationDays}
                  onChange={(e) => setExpectedDurationDays(Number(e.target.value))}
                  className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#1A1A1A] font-semibold mb-1">Trench Width (meters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={excavationWidth}
                  onChange={(e) => setExcavationWidth(Number(e.target.value))}
                  className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A] font-semibold mb-1">Trench Depth (meters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={excavationDepth}
                  onChange={(e) => setExcavationDepth(Number(e.target.value))}
                  className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A] font-semibold mb-1">Estimated Budget (₹ INR)</label>
                <input
                  type="number"
                  value={estimatedCostINR}
                  onChange={(e) => setEstimatedCostINR(Number(e.target.value))}
                  className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Traffic & Priority */}
          <div className="space-y-3 pt-4 border-t border-[#1A1A1A]/10">
            <h3 className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.18em]">
              4. Traffic Impact & Contractor
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#1A1A1A] font-semibold mb-1">Traffic Impact</label>
                <select
                  value={trafficImpact}
                  onChange={(e) => setTrafficImpact(e.target.value as TrafficImpact)}
                  className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                >
                  <option value="Low">Low (Pedestrian / Shoulder)</option>
                  <option value="Medium">Medium (Partial Single Lane)</option>
                  <option value="High">High (Major Carriageway Lane Cut)</option>
                  <option value="Severe">Severe (Full Carriageway Closure)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#1A1A1A] font-semibold mb-1">Priority Class</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                  className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                >
                  <option value="Routine">Routine Maintenance</option>
                  <option value="Planned">Planned Capital Project</option>
                  <option value="High Priority">High Priority Mission</option>
                  <option value="Emergency">Emergency Utility Repair</option>
                </select>
              </div>

              <div>
                <label className="block text-[#1A1A1A] font-semibold mb-1">Execution Contractor</label>
                <input
                  type="text"
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-[#1A1A1A]/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-[#F0EEEB] hover:bg-[#E5E3DE] text-[#1A1A1A] text-[10px] uppercase tracking-wider font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-[#1A1A1A] hover:bg-[#333333] text-[#FDFCFB] text-[10px] uppercase tracking-widest font-bold shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FDFCFB]" />
              {isSubmitting ? 'Analyzing GIS Conflicts...' : 'Submit & Analyze Conflicts'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
