/**
 * MR. MAYOR - Clean Enterprise Sidebar Navigation
 */

import React from 'react';
import {
  LayoutDashboard,
  Map,
  Folders,
  GitMerge,
  FileCheck2,
  FileBadge,
  Route,
  Layers,
  HardHat,
  Eye,
  MessageSquareWarning,
  BarChart3,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface NavItem {
  id: string;
  label: string;
  category: 'OPERATIONS' | 'GOVERNANCE' | 'REGISTRY' | 'PUBLIC';
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  pendingApprovalsCount: number;
  activeConflictsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  pendingApprovalsCount,
  activeConflictsCount,
}) => {
  const { currentUser } = useAuth();

  const allNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Command Center',
      category: 'OPERATIONS',
      icon: LayoutDashboard,
    },
    {
      id: 'map',
      label: 'City GIS Map',
      category: 'OPERATIONS',
      icon: Map,
      badge: 'Live',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'projects',
      label: 'Road Projects',
      category: 'OPERATIONS',
      icon: Folders,
    },
    {
      id: 'ai-analysis',
      label: 'AI Analysis',
      category: 'OPERATIONS',
      icon: Sparkles,
      badge: 'Flagship',
      badgeColor: 'bg-blue-600 text-white font-bold',
    },
    {
      id: 'coordination',
      label: 'Joint Digging Hub',
      category: 'OPERATIONS',
      icon: GitMerge,
      badge: activeConflictsCount > 0 ? `${activeConflictsCount} Clashes` : undefined,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'approvals',
      label: 'Approvals Queue',
      category: 'GOVERNANCE',
      icon: FileCheck2,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'permits',
      label: 'Digital Permits',
      category: 'GOVERNANCE',
      icon: FileBadge,
    },
    {
      id: 'roads',
      label: 'Road Network Twin',
      category: 'REGISTRY',
      icon: Route,
    },
    {
      id: 'assets',
      label: 'Underground Assets',
      category: 'REGISTRY',
      icon: Layers,
    },
    {
      id: 'contractor',
      label: 'Contractor Portal',
      category: 'OPERATIONS',
      icon: HardHat,
    },
    {
      id: 'inspections',
      label: 'Field Inspections',
      category: 'GOVERNANCE',
      icon: Eye,
    },
    {
      id: 'citizen',
      label: 'Citizen Grievances',
      category: 'PUBLIC',
      icon: MessageSquareWarning,
    },
    {
      id: 'analytics',
      label: 'City Savings & Impact',
      category: 'PUBLIC',
      icon: BarChart3,
    },
    {
      id: 'admin',
      label: 'GovIAM Admin Portal',
      category: 'GOVERNANCE',
      icon: ShieldCheck,
      badge: 'Secure',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'settings',
      label: 'Settings & Rules',
      category: 'PUBLIC',
      icon: Settings,
    },
  ];

  // Role-based navigation filtering
  const visibleItems = allNavItems.filter((item) => {
    if (!currentUser) return false;
    const role = currentUser.role;
    const dept = currentUser.department;

    switch (role) {
      case 'COMMISSIONER':
      case 'NODAL_OFFICER':
      case 'ADMIN':
        return [
          'dashboard',
          'map',
          'projects',
          'ai-analysis',
          'coordination',
          'approvals',
          'permits',
          'roads',
          'assets',
          'contractor',
          'inspections',
          'citizen',
          'analytics',
          'admin',
          'settings',
        ].includes(item.id);

      case 'EXECUTIVE_ENGINEER':
      case 'DEPT_HEAD':
        return [
          'dashboard',
          'map',
          'projects',
          'ai-analysis',
          'coordination',
          'approvals',
          'permits',
          'roads',
          'assets',
          'inspections',
          'citizen',
          'analytics',
          'settings',
        ].includes(item.id);

      case 'INSPECTOR':
        return ['dashboard', 'map', 'projects', 'inspections', 'permits', 'roads', 'citizen'].includes(item.id);

      case 'CONTRACTOR':
        return ['dashboard', 'map', 'projects', 'contractor', 'permits', 'roads', 'inspections'].includes(item.id);

      case 'CITIZEN':
        return ['citizen', 'map', 'analytics'].includes(item.id);

      default:
        return ['dashboard', 'map', 'projects'].includes(item.id);
    }
  });

  // Group items by category
  const categories: { key: NavItem['category']; label: string }[] = [
    { key: 'OPERATIONS', label: 'Operations' },
    { key: 'GOVERNANCE', label: 'Governance' },
    { key: 'REGISTRY', label: 'Infrastructure' },
    { key: 'PUBLIC', label: 'Public & Reports' },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0 h-[calc(100vh-4rem)] select-none">
      {/* Scrollable Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {categories.map((cat) => {
          const itemsInCat = visibleItems.filter((i) => i.category === cat.key);
          if (itemsInCat.length === 0) return null;

          return (
            <div key={cat.key} className="space-y-1">
              <div className="px-2.5 pb-1 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                {cat.label}
              </div>

              {itemsInCat.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isActive
                            ? 'bg-white/20 text-white border-white/30'
                            : item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
          <span className="text-[11px] font-medium text-slate-600">All Services Operational</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">v2026.1</span>
      </div>
    </aside>
  );
};
