/**
 * MR. MAYOR - Manual Authority & Officer Registration Modal
 * Allows administrators and officers to manually register department heads,
 * engineers, inspectors, contractors, and citizen volunteers.
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  User,
  Briefcase,
  Building,
  Mail,
  Phone,
  MapPin,
  Lock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, DepartmentName } from '../../types';

interface AuthorityRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered?: (newRole: UserRole) => void;
}

interface RolePreset {
  role: UserRole;
  title: string;
  defaultDesignation: string;
  defaultDepartment: DepartmentName;
  category: 'Leadership' | 'Utility' | 'Enforcement & QC' | 'Execution & Public';
  themeColor: string;
  themeBg: string;
  themeBorder: string;
  badgeLabel: string;
  clearances: string[];
}

const ROLE_PRESETS: RolePreset[] = [
  {
    role: 'COMMISSIONER',
    title: 'Municipal Commissioner & CEO (IAS)',
    defaultDesignation: 'Municipal Commissioner & CEO',
    defaultDepartment: 'Smart City & Urban Planning',
    category: 'Leadership',
    themeColor: '#D97706',
    themeBg: '#FFFBEB',
    themeBorder: 'rgba(217, 119, 6, 0.35)',
    badgeLabel: 'Apex Statutory Clearance',
    clearances: [
      'City Command Center & Executive KPI Summary',
      'Apex Statutory Project Approvals & Dispute Overrides',
      'Citywide GIS Digital Twin & Infrastructure Map',
      'Inter-Agency Cost Savings & Financial Analytics',
      'Statutory Rule & Embargo Policy Controls',
    ],
  },
  {
    role: 'NODAL_OFFICER',
    title: 'Chief City Infrastructure Nodal Officer',
    defaultDesignation: 'Chief City Infrastructure Nodal Officer',
    defaultDepartment: 'Smart City & Urban Planning',
    category: 'Leadership',
    themeColor: '#1E3A8A',
    themeBg: '#EFF6FF',
    themeBorder: 'rgba(30, 58, 138, 0.35)',
    badgeLabel: 'Gati Shakti Coordination Hub',
    clearances: [
      'Multi-Agency Excavation Synchronization Hub',
      'AI-Powered Joint Trench Consolidation Matrix',
      'Digital Road Opening Permits (ROP) Issuance',
      'Full GIS Conflict Detection & Route Coordination',
      'Inspector Work Assignment & Clearance Sign-Off',
    ],
  },
  {
    role: 'EXECUTIVE_ENGINEER',
    title: 'Executive Engineer (Water / Drainage / Power)',
    defaultDesignation: 'Executive Engineer (Water Supply & Sewerage)',
    defaultDepartment: 'Water & Sewerage',
    category: 'Utility',
    themeColor: '#15803D',
    themeBg: '#F0FDF4',
    themeBorder: 'rgba(21, 128, 61, 0.35)',
    badgeLabel: 'Utility Directorate',
    clearances: [
      'Utility Trench Project Pipeline & Submission',
      'Joint Excavation Windows & 55% Cost-Sharing Approvals',
      'Utility Corridor GIS Conflict Alerts & Layer Inspection',
      'Departmental Inter-Agency Clearances (NOCs)',
    ],
  },
  {
    role: 'DEPT_HEAD',
    title: 'Department Head / Superintending Engineer (PWD / Telecom / Gas / Traffic)',
    defaultDesignation: 'Superintending Engineer (Roads / PWD)',
    defaultDepartment: 'Roads / PWD',
    category: 'Utility',
    themeColor: '#15803D',
    themeBg: '#F0FDF4',
    themeBorder: 'rgba(21, 128, 61, 0.35)',
    badgeLabel: 'Infrastructure Directorate',
    clearances: [
      'Digital Road Twin & Moratorium Asset Registration',
      'Multi-Agency Excavation Corridor Vetting',
      'Agency No-Objection Certificate (NOC) Endorsement',
      'Corridor Restoration Standard Compliance',
    ],
  },
  {
    role: 'INSPECTOR',
    title: 'Senior Quality & Safety Inspector',
    defaultDesignation: 'Senior Quality & Safety Inspector',
    defaultDepartment: 'Roads / PWD',
    category: 'Enforcement & QC',
    themeColor: '#D97706',
    themeBg: '#FFFBEB',
    themeBorder: 'rgba(217, 119, 6, 0.35)',
    badgeLabel: 'Site Compliance Directorate',
    clearances: [
      'On-Site Trench Inspection & Geo-Tagged Photo Audit',
      'Surface Restoration Quality Sign-Off & Compaction Test',
      'Violation Penalty Slips & Stop-Work Issuance',
      'Road Quality Rating & Warranty Lock Trigger',
    ],
  },
  {
    role: 'CONTRACTOR',
    title: 'Class-A Registered Contractor',
    defaultDesignation: 'Class-A Registered Contractor',
    defaultDepartment: 'Independent Contractor',
    category: 'Execution & Public',
    themeColor: '#1E3A8A',
    themeBg: '#EFF6FF',
    themeBorder: 'rgba(30, 58, 138, 0.35)',
    badgeLabel: 'Field Execution Tier',
    clearances: [
      'Permit Execution Dashboard & Active Work Log',
      'Daily Trench Progress & Traffic Barricading Updates',
      'Post-Excavation As-Built Utility Upload',
      'Restoration Inspection Request Submission',
    ],
  },
  {
    role: 'CITIZEN',
    title: 'Resident / Road Safety Volunteer',
    defaultDesignation: 'Resident / Road Safety Volunteer',
    defaultDepartment: 'General Public',
    category: 'Execution & Public',
    themeColor: '#475569',
    themeBg: '#F8FAFC',
    themeBorder: 'rgba(71, 85, 105, 0.35)',
    badgeLabel: 'Civic Transparency Portal',
    clearances: [
      'Real-Time Public Excavation Transparency Map',
      'Authorized Permit QR Code Verifier',
      'Report Unauthorized / Abandoned Digging Grievance',
      'Neighborhood Road Work Schedule & Detour Alerts',
    ],
  },
];

export const AuthorityRegisterModal: React.FC<AuthorityRegisterModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
}) => {
  const { registerAuthority } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('EXECUTIVE_ENGINEER');
  const activePreset = ROLE_PRESETS.find((p) => p.role === selectedRole) || ROLE_PRESETS[0];

  const [name, setName] = useState('');
  const [designation, setDesignation] = useState(activePreset.defaultDesignation);
  const [department, setDepartment] = useState<DepartmentName>(activePreset.defaultDepartment);
  const [email, setEmail] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [jurisdiction, setJurisdiction] = useState('Citywide');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('1234');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    const preset = ROLE_PRESETS.find((p) => p.role === role);
    if (preset) {
      setDesignation(preset.defaultDesignation);
      setDepartment(preset.defaultDepartment);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter the Officer / User full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter an official government or contact email.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const generatedId = employeeCode.trim()
        ? `USR-${employeeCode.trim().toUpperCase()}`
        : `USR-${Date.now().toString().slice(-4)}`;

      const registeredUser = await registerAuthority({
        id: generatedId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: selectedRole,
        designation: designation.trim() || activePreset.defaultDesignation,
        department,
        jurisdiction: jurisdiction.trim() || 'Citywide',
        phone: phone.trim() || '+91 98000 00000',
      });

      setIsSubmitting(false);
      onClose();
      if (onRegistered) {
        onRegistered(registeredUser.role);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to register authority profile.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14181F]/60 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-[#FFFFFF] border border-[#14181F]/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#14181F]/10 flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#14181F] text-white flex items-center justify-center font-bold">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-editorial font-bold text-lg text-[#14181F]">
                Register Municipal Authority / Officer
              </h2>
              <p className="text-[11px] text-[#718096]">
                Manually provision department officers, engineers, inspectors, or contractors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#14181F]/5 text-[#718096] hover:text-[#14181F] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FFF5EE] border border-[#E06D28]/35 flex items-center gap-2 text-xs text-[#E06D28]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Clearance Tier & Role */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-bold text-[#4A5568] mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
              <span>1. Select Authority Clearance Tier & Role</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {ROLE_PRESETS.map((preset) => {
                const isSelected = selectedRole === preset.role;
                return (
                  <button
                    key={preset.role}
                    type="button"
                    onClick={() => handleRoleChange(preset.role)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#14181F] shadow-sm ring-1 ring-[#14181F]'
                        : 'border-[#14181F]/15 hover:border-[#14181F]/30 bg-[#FAF9F6]'
                    }`}
                    style={{
                      backgroundColor: isSelected ? preset.themeBg : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{
                          color: preset.themeColor,
                          backgroundColor: '#FFFFFF',
                          border: `1px solid ${preset.themeBorder}`,
                        }}
                      >
                        {preset.category}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#14181F]" />}
                    </div>
                    <div className="font-semibold text-xs text-[#14181F] leading-tight">
                      {preset.title.split('(')[0]}
                    </div>
                    <div className="text-[10px] text-[#718096] mt-0.5">{preset.badgeLabel}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Officer Details Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Officer Name */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#4A5568] mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#718096]" />
                <span>Officer Full Name *</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Er. Sunita Deshmukh"
                className="w-full px-3.5 py-2 rounded-xl border border-[#14181F]/15 bg-[#FAF9F6] text-xs text-[#14181F] focus:outline-none focus:border-[#14181F]"
              />
            </div>

            {/* Official Designation */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#4A5568] mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#718096]" />
                <span>Official Designation *</span>
              </label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Executive Engineer (Water Supply)"
                className="w-full px-3.5 py-2 rounded-xl border border-[#14181F]/15 bg-[#FAF9F6] text-xs text-[#14181F] focus:outline-none focus:border-[#14181F]"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#4A5568] mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#718096]" />
                <span>Department / Directorate *</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as DepartmentName)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#14181F]/15 bg-[#FAF9F6] text-xs text-[#14181F] focus:outline-none focus:border-[#14181F]"
              >
                <option value="Smart City & Urban Planning">Smart City & Urban Planning</option>
                <option value="Water & Sewerage">Water & Sewerage</option>
                <option value="Drainage Department">Drainage Department</option>
                <option value="Roads / PWD">Roads / PWD</option>
                <option value="Telecom & Digital">Telecom & Digital</option>
                <option value="Electricity (DISCOM)">Electricity (DISCOM)</option>
                <option value="City Gas Distribution">City Gas Distribution</option>
                <option value="Traffic Police Authority">Traffic Police Authority</option>
                <option value="Independent Contractor">Independent Contractor</option>
                <option value="General Public">General Public</option>
              </select>
            </div>

            {/* Official Email */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#4A5568] mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#718096]" />
                <span>Official Email / Identity *</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. officer@citycorp.gov.in"
                className="w-full px-3.5 py-2 rounded-xl border border-[#14181F]/15 bg-[#FAF9F6] text-xs text-[#14181F] font-mono focus:outline-none focus:border-[#14181F]"
              />
            </div>

            {/* Employee / Officer Code */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#4A5568] mb-1 flex items-center gap-1.5">
                <span>Employee / Officer Code (Optional)</span>
              </label>
              <input
                type="text"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                placeholder="e.g. MH-PMC-EE-104"
                className="w-full px-3.5 py-2 rounded-xl border border-[#14181F]/15 bg-[#FAF9F6] text-xs text-[#14181F] font-mono focus:outline-none focus:border-[#14181F]"
              />
            </div>

            {/* Jurisdiction / Zone */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#4A5568] mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#718096]" />
                <span>Jurisdiction / Zone / Ward</span>
              </label>
              <input
                type="text"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                placeholder="e.g. Citywide / Central Zone"
                className="w-full px-3.5 py-2 rounded-xl border border-[#14181F]/15 bg-[#FAF9F6] text-xs text-[#14181F] focus:outline-none focus:border-[#14181F]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#4A5568] mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#718096]" />
                <span>Contact Phone</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98230 11003"
                className="w-full px-3.5 py-2 rounded-xl border border-[#14181F]/15 bg-[#FAF9F6] text-xs text-[#14181F] focus:outline-none focus:border-[#14181F]"
              />
            </div>

            {/* Security Passcode */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#4A5568] mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#718096]" />
                <span>Security PIN / Passcode</span>
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-8 digit PIN"
                className="w-full px-3.5 py-2 rounded-xl border border-[#14181F]/15 bg-[#FAF9F6] text-xs text-[#14181F] focus:outline-none focus:border-[#14181F]"
              />
            </div>
          </div>

          {/* Role Clearance Preview Card */}
          <div
            className="p-4 rounded-2xl border transition-colors"
            style={{
              backgroundColor: activePreset.themeBg,
              borderColor: activePreset.themeBorder,
            }}
          >
            <div className="text-[11px] uppercase tracking-wider font-bold text-[#14181F] mb-2 flex items-center gap-1.5">
              <span>Authorized Municipal Capabilities ({activePreset.title.split('(')[0]}):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activePreset.clearances.map((c, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-[#2D3748]">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: activePreset.themeColor }} />
                  <span className="text-[11px] leading-tight">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#14181F]/10 bg-[#FAF9F6] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#14181F]/15 text-xs font-semibold text-[#4A5568] hover:bg-[#FFFFFF] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-[#14181F] hover:bg-[#2D3748] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 shadow-md flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Registering Authority...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Register & Access Workspace</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
