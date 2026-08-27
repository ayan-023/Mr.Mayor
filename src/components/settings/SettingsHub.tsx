/**
 * MR. MAYOR - System Settings & Municipal Rules Configuration (Editorial Aesthetic)
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Save,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { SystemSettingsConfig } from '../../types';
import { api } from '../../services/api';

interface SettingsHubProps {
  settings: SystemSettingsConfig;
  onRefreshSettings: () => void;
}

export const SettingsHub: React.FC<SettingsHubProps> = ({ settings, onRefreshSettings }) => {
  const [formData, setFormData] = useState<SystemSettingsConfig>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSettings(formData);
      onRefreshSettings();
      alert('System rules and municipal configuration updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-2xl p-6 md:p-8 shadow-2xs flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8A8A8A] mb-1">
            STATUTORY POLICIES & ENGINE PARAMETERS
          </div>
          <h1 className="text-xl md:text-2xl font-serif-editorial font-bold text-[#1A1A1A] flex items-center gap-2">
            Administration & Municipal Rules Configuration
          </h1>
          <p className="text-xs text-[#5A5A5A] mt-1">
            Define road embargo durations, AI conflict scoring weights, and penalty rate multipliers
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* Section 1: Road Protection & Embargo Policy */}
        <div className="bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-2xl p-6 md:p-8 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center gap-2 font-serif-editorial font-bold text-[#1A1A1A] text-base border-b border-[#1A1A1A]/10 pb-3">
            <ShieldCheck className="w-4 h-4 text-[#2E6B4F]" />
            1. "Do Not Dig" Road Protection & Moratorium Rules
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#737373] font-medium mb-1">
                Post-Restoration "Do Not Dig" Embargo (Days)
              </label>
              <input
                type="number"
                value={formData.roadProtectionMoratoriumDays}
                onChange={(e) =>
                  setFormData({ ...formData, roadProtectionMoratoriumDays: Number(e.target.value) })
                }
                className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-2.5 text-xs text-[#1A1A1A] focus:outline-none"
              />
              <p className="text-[11px] text-[#8A8A8A] mt-1 font-serif-editorial">
                Period after resurfacing during which routine excavation permits are strictly forbidden.
              </p>
            </div>

            <div>
              <label className="block text-[#737373] font-medium mb-1">
                Monsoon Excavation Moratorium
              </label>
              <input
                type="text"
                value={formData.monsoonMoratoriumPeriod}
                onChange={(e) =>
                  setFormData({ ...formData, monsoonMoratoriumPeriod: e.target.value })
                }
                className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-2.5 text-xs text-[#1A1A1A] focus:outline-none"
              />
              <p className="text-[11px] text-[#8A8A8A] mt-1 font-serif-editorial">
                Citywide seasonal ban on open trenching to prevent flooding and cave-ins.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: AI Conflict Engine Parameters */}
        <div className="bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-2xl p-6 md:p-8 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center gap-2 font-serif-editorial font-bold text-[#1A1A1A] text-base border-b border-[#1A1A1A]/10 pb-3">
            <Sparkles className="w-4 h-4 text-[#A35C28]" />
            2. GIS Conflict Detection & Scoring Weights
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#737373] font-medium mb-1">
                Spatial Overlap Weight (0 - 1.0)
              </label>
              <input
                type="number"
                step="0.05"
                value={formData.conflictSpatialWeight}
                onChange={(e) =>
                  setFormData({ ...formData, conflictSpatialWeight: Number(e.target.value) })
                }
                className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-2.5 text-xs text-[#1A1A1A] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[#737373] font-medium mb-1">
                Temporal Collision Weight (0 - 1.0)
              </label>
              <input
                type="number"
                step="0.05"
                value={formData.conflictTemporalWeight}
                onChange={(e) =>
                  setFormData({ ...formData, conflictTemporalWeight: Number(e.target.value) })
                }
                className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-2.5 text-xs text-[#1A1A1A] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[#737373] font-medium mb-1">
                Traffic Sensitivity Weight (0 - 1.0)
              </label>
              <input
                type="number"
                step="0.05"
                value={formData.conflictTrafficWeight}
                onChange={(e) =>
                  setFormData({ ...formData, conflictTrafficWeight: Number(e.target.value) })
                }
                className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-2.5 text-xs text-[#1A1A1A] focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Financial & Penalty Rules */}
        <div className="bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-2xl p-6 md:p-8 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center gap-2 font-serif-editorial font-bold text-[#1A1A1A] text-base border-b border-[#1A1A1A]/10 pb-3">
            <Sliders className="w-4 h-4 text-[#1A1A1A]" />
            3. Financial Security Deposits & Penalty Rules
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#737373] font-medium mb-1">
                Security Deposit (% of Restoration Cost)
              </label>
              <input
                type="number"
                value={formData.securityDepositPercentage}
                onChange={(e) =>
                  setFormData({ ...formData, securityDepositPercentage: Number(e.target.value) })
                }
                className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-2.5 text-xs text-[#1A1A1A] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[#737373] font-medium mb-1">
                Unauthorized Cut Penalty Multiplier
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.penaltyMultiplierForUnauthorizedCut}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    penaltyMultiplierForUnauthorizedCut: Number(e.target.value),
                  })
                }
                className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-2.5 text-xs text-[#1A1A1A] focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg bg-[#1A1A1A] hover:bg-[#333333] text-[#FDFCFB] font-bold text-[10px] uppercase tracking-widest shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving Changes...' : 'Save Municipal Rules'}
          </button>
        </div>
      </form>
    </div>
  );
};
