/**
 * MR. MAYOR - Enterprise Government Infrastructure Platform Navigation Bar
 * Designed with clean, human-crafted UI patterns, crisp typography, and intuitive controls.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  LogOut,
  MapPin,
  ChevronDown,
  Search,
  Shield,
  Fingerprint,
  Mail,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SystemNotification, CityPortalConfig } from '../../types';

interface HeaderProps {
  onOpenEmergencyModal: () => void;
  onOpenAuditDrawer: () => void;
  onOpenNotifications: () => void;
  notifications: SystemNotification[];
  activeTab: string;
  activeCity?: CityPortalConfig | null;
  onOpenCityModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenEmergencyModal,
  onOpenAuditDrawer,
  onOpenNotifications,
  notifications,
  activeCity,
  onOpenCityModal,
}) => {
  const { currentUser, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'COMMISSIONER':
        return { label: 'Commissioner & CEO', color: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'NODAL_OFFICER':
      case 'ADMIN':
        return { label: 'Nodal Officer', color: 'bg-blue-100 text-blue-900 border-blue-200' };
      case 'EXECUTIVE_ENGINEER':
      case 'DEPT_HEAD':
        return { label: 'Executive Engineer', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
      case 'INSPECTOR':
        return { label: 'QC Inspector', color: 'bg-orange-100 text-orange-900 border-orange-200' };
      case 'CONTRACTOR':
        return { label: 'Class-A Contractor', color: 'bg-slate-200 text-slate-900 border-slate-300' };
      case 'CITIZEN':
      default:
        return { label: 'Citizen', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
  };

  const getBriefLevelAndDept = (role?: string, dept?: string) => {
    let level = 'Official';
    switch (role) {
      case 'COMMISSIONER':
        level = 'Commissioner';
        break;
      case 'NODAL_OFFICER':
      case 'ADMIN':
        level = 'Nodal Officer';
        break;
      case 'EXECUTIVE_ENGINEER':
      case 'DEPT_HEAD':
        level = 'Executive Engineer';
        break;
      case 'INSPECTOR':
        level = 'QC Inspector';
        break;
      case 'CONTRACTOR':
        level = 'Contractor';
        break;
      case 'CITIZEN':
        level = 'Citizen Forum';
        break;
    }

    let briefDept = dept || '';
    if (dept === 'Smart City & Urban Planning') briefDept = 'Smart City';
    else if (dept === 'Water & Sewerage') briefDept = 'Water Works';
    else if (dept === 'City Gas Distribution') briefDept = 'City Gas';
    else if (dept === 'Electricity (DISCOM)') briefDept = 'Power (MSEDCL)';
    else if (dept === 'Roads / PWD') briefDept = 'Roads / PWD';
    else if (dept === 'Telecom & Digital') briefDept = 'Telecom 5G';
    else if (dept === 'Drainage Department') briefDept = 'Drainage';
    else if (dept === 'Traffic Police Authority') briefDept = 'Traffic Police';
    else if (dept === 'Independent Contractor') briefDept = 'Class-A EPC';
    else if (dept === 'General Public') briefDept = 'Public Forum';

    return { level, briefDept };
  };

  const briefBadge = getBriefLevelAndDept(currentUser?.role, currentUser?.department);
  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 select-none">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Brand & Brief Level/Department Badge */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-1 ring-slate-800 shrink-0">
              <span className="tracking-tight text-base font-extrabold text-blue-400">M</span>
              <span className="tracking-tight text-xs font-bold text-white -ml-0.5">M</span>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-slate-900 leading-none">
                  MR. MAYOR
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 leading-none">
                  GovTech
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-normal block mt-0.5 leading-none">
                Urban Infrastructure Platform
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden md:block" />

          {/* Brief Level & Department Badge */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ring-2 ring-emerald-100" />
              <span className="text-xs font-bold text-slate-900">
                {briefBadge.level}
              </span>
              <span className="text-slate-300 font-bold">·</span>
              <span className="text-xs font-medium text-slate-600">
                {briefBadge.briefDept}
              </span>
            </div>
          ) : activeCity ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-left">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-semibold text-slate-900 truncate max-w-[120px] sm:max-w-[180px]">
                  {activeCity.name}
                </span>
                <span className="text-[10px] font-medium text-slate-500 hidden sm:inline">
                  ({activeCity.state})
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search roads, projects, permits, contractors... (Press ⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg pl-9 pr-12 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Quick Actions & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Icon with Badge */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* User Account Capsule & Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            >
              {/* Initials Avatar */}
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>

              {/* Name & Role */}
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[130px]">
                  {currentUser?.name}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight truncate max-w-[130px]">
                  {currentUser?.designation || currentUser?.department}
                </div>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* Active User Info */}
                <div className="px-4 py-2.5 border-b border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Authenticated Session
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 truncate">{currentUser?.name}</div>
                    <div className="text-xs text-slate-600 truncate">{currentUser?.designation}</div>
                  </div>
                  <div className="text-[11px] font-mono text-blue-600 font-semibold">
                    Code: {currentUser?.empCode || currentUser?.id}
                  </div>
                </div>

                {/* Statutory Security Clearance Details */}
                <div className="px-4 py-2 text-[11px] space-y-1 border-b border-slate-100 text-slate-500">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <Fingerprint className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>2FA Security Token Active</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{currentUser?.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{currentUser?.jurisdiction || 'Citywide Jurisdiction'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sign Out & Lock Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
