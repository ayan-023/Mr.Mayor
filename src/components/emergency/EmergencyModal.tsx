/**
 * MR. MAYOR - Emergency Excavation Fast-Track Protocol Modal (Editorial Aesthetic)
 */

import React, { useState } from 'react';
import {
  X,
  Flame,
} from 'lucide-react';
import { Road } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  roads: Road[];
  onEmergencyCreated: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  roads,
  onEmergencyCreated,
}) => {
  const { currentUser } = useAuth();
  const [selectedRoadId, setSelectedRoadId] = useState(roads[0]?.id || 'RD-001');
  const [emergencyReason, setEmergencyReason] = useState('Major 450mm DI Water Main Burst - Severe Flooding');
  const [description, setDescription] = useState('Critical water feeder burst causing road subsidence and disruption to 45,000 residents. Immediate excavation required.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.requestEmergencyExcavation({
        roadId: selectedRoadId,
        department: currentUser?.department || 'Water & Sewerage',
        emergencyReason,
        officerName: currentUser?.name || 'Emergency Duty Engineer',
        description,
      });
      alert('Emergency Road Opening Protocol Activated! Instant QR permit issued and Traffic Police DCP notified.');
      onEmergencyCreated();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to activate emergency protocol');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1A1A1A]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-[#1A1A1A]/10 bg-[#FAF0E6]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#1A1A1A] text-[#FDFCFB]">
              <Flame className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#A35C28]">STATUTORY EMERGENCY OVERRIDE</span>
              <h2 className="text-lg font-serif-editorial font-bold text-[#1A1A1A]">
                Emergency Road Opening Protocol
              </h2>
              <p className="text-xs text-[#5A5A5A]">
                Fast-track bypass for catastrophic pipe bursts, gas leaks, and high-voltage electrical faults
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8A8A8A] hover:text-[#1A1A1A] p-1 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-[#FAF0E6]/50 border border-[#A35C28]/25 text-[#1A1A1A] space-y-1">
            <strong className="text-[#A35C28] text-xs uppercase tracking-wider">Emergency Protocol Conditions:</strong>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#5A5A5A] font-serif-editorial">
              <li>Instant temporary digital permit generated without standard 7-day multi-agency queue.</li>
              <li>Traffic Police Control Room & Municipal Commissioner automatically alerted.</li>
              <li>Compaction & emergency patch restoration must be completed within 48 hours.</li>
            </ul>
          </div>

          <div>
            <label className="block text-[#737373] font-medium mb-1">Affected Road Corridor *</label>
            <select
              value={selectedRoadId}
              onChange={(e) => setSelectedRoadId(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-2.5 text-xs text-[#1A1A1A] focus:outline-none"
            >
              {roads.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.ward})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#737373] font-medium mb-1">Emergency Nature & Fault Type *</label>
            <select
              value={emergencyReason}
              onChange={(e) => setEmergencyReason(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-2.5 text-xs text-[#1A1A1A] focus:outline-none"
            >
              <option value="Major 450mm DI Water Main Burst - Severe Flooding">Major 450mm DI Water Main Burst - Severe Flooding</option>
              <option value="Underground Gas Pipeline Leakage Risk">Underground PNG Gas Pipeline Leakage Risk</option>
              <option value="33kV High Voltage Underground Cable Tripping / Fire">33kV High Voltage Cable Tripping / Fire</option>
              <option value="Major Storm Sewer Collapse / Road Cave-in">Major Storm Sewer Collapse / Road Cave-in</option>
            </select>
          </div>

          <div>
            <label className="block text-[#737373] font-medium mb-1">Immediate Safety & Engineering Description *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-2.5 text-xs text-[#1A1A1A] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1A1A1A]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F0EEEB] text-[#1A1A1A] border border-[#1A1A1A]/15 text-[10px] uppercase tracking-wider font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-[10px] uppercase tracking-wider shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              {isSubmitting ? 'Activating Emergency Protocol...' : 'Authorize Emergency Road Opening'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
