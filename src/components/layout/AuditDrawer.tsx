/**
 * MR. MAYOR - Audit Trail & Decisions Log Drawer (Editorial Aesthetic)
 */

import React, { useState, useMemo, useDeferredValue } from 'react';
import { X, Search, Activity, UserCheck } from 'lucide-react';
import { AuditLogItem } from '../../types';

interface AuditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogItem[];
}

export const AuditDrawer: React.FC<AuditDrawerProps> = ({ isOpen, onClose, logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);
  const [selectedEntity, setSelectedEntity] = useState<string>('ALL');

  const filteredLogs = useMemo(() => {
    const sTerm = deferredSearch.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesSearch =
        !sTerm ||
        (log.action || '').toLowerCase().includes(sTerm) ||
        (log.userName || '').toLowerCase().includes(sTerm) ||
        (log.entity || '').toLowerCase().includes(sTerm) ||
        (log.reason && log.reason.toLowerCase().includes(sTerm)) ||
        (log.newValue && log.newValue.toLowerCase().includes(sTerm));

      const matchesEntity = selectedEntity === 'ALL' || log.entity === selectedEntity;
      return matchesSearch && matchesEntity;
    });
  }, [logs, deferredSearch, selectedEntity]);

  if (!isOpen) return null;

  const entities = ['ALL', 'Project', 'CoordinationCluster', 'ApprovalWorkflow', 'RoadOpeningPermit', 'Inspection', 'User'];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-2xl bg-[#FDFCFB] border-l border-[#1A1A1A]/15 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-[#1A1A1A]/10 flex items-center justify-between bg-[#FFFFFF]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#F7F6F3] text-[#1A1A1A] border border-[#1A1A1A]/10">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif-editorial font-bold text-[#1A1A1A]">
                Municipal Audit Trail & Decisions Log
              </h2>
              <p className="text-[11px] text-[#737373]">
                Immutable record of all approvals, AI overrides, permit actions, and QC inspections
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

        {/* Filters */}
        <div className="p-4 border-b border-[#1A1A1A]/10 bg-[#F7F6F3]/60 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search action, officer, project, or justification reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg pl-9 pr-3 py-2 text-xs text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {entities.map((ent) => (
              <button
                key={ent}
                onClick={() => setSelectedEntity(ent)}
                className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedEntity === ent
                    ? 'bg-[#1A1A1A] text-[#FDFCFB]'
                    : 'bg-[#FFFFFF] text-[#5A5A5A] border border-[#1A1A1A]/10 hover:bg-[#F0EEEB] hover:text-[#1A1A1A]'
                }`}
              >
                {ent}
              </button>
            ))}
          </div>
        </div>

        {/* Log Entries List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FDFCFB]">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-[#8A8A8A] text-xs">
              No audit records match the current filter.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isAiOverride = log.reason && log.reason.includes('[AI OVERRIDE]');
              return (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all bg-[#FFFFFF] ${
                    isAiOverride
                      ? 'border-[#A35C28]/40 shadow-xs'
                      : 'border-[#1A1A1A]/10 hover:border-[#1A1A1A]/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#F0EEEB] text-[#1A1A1A] uppercase tracking-wider border border-[#1A1A1A]/10">
                        {(log.action || '').replace(/_/g, ' ')}
                      </span>
                      <span className="text-[#737373] text-[11px]">
                        {log.entity} • #{log.entityId}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8A8A8A] font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[#1A1A1A] font-medium">
                    <UserCheck className="w-3.5 h-3.5 text-[#2E6B4F]" />
                    <span>{log.userName}</span>
                    <span className="text-[#737373] text-[11px]">({log.role} - {log.department})</span>
                  </div>

                  {log.newValue && (
                    <div className="p-2 rounded bg-[#F7F6F3] border border-[#1A1A1A]/10 font-mono text-[11px] text-[#1A1A1A]">
                      {log.newValue}
                    </div>
                  )}

                  {log.reason && (
                    <div className="text-[11px] text-[#5A5A5A] italic">
                      <span className="font-semibold text-[#1A1A1A] not-italic">Justification: </span>
                      {log.reason}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
