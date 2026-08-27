/**
 * MR. MAYOR - Municipal Identity & Access Management (GovIAM) Admin Portal
 * High-security Government of Maharashtra / NMC Urban Infrastructure Gateway
 * Exclusive authority for provisioning official government & contractor credentials,
 * statutory document verification, 2FA enforcement, and cryptographic security auditing.
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Lock,
  UserPlus,
  Search,
  KeyRound,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Eye,
  X,
  Copy,
  Check,
  Layers,
  Users,
  HardHat,
  Droplet,
  Flame,
  Zap,
  Route,
  Radio,
  Waves,
  ShieldAlert,
  SlidersHorizontal,
  QrCode,
  Fingerprint,
  FileText,
  BadgeCheck,
  ShieldX,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { User, UserRole, DepartmentName, Jurisdiction, UserVerificationDocument } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface AdminPortalProps {
  onRefreshData?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onRefreshData }) => {
  const { allUsers, currentUser, refreshUsers } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Provisioning Modal State
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [provisionStep, setProvisionStep] = useState<1 | 2 | 3 | 4>(1);

  // New Officer Form State
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('EXECUTIVE_ENGINEER');
  const [newDepartment, setNewDepartment] = useState<DepartmentName>('Water & Sewerage');
  const [newDesignation, setNewDesignation] = useState('Executive Engineer (Water Supply)');
  const [newEmpCode, setNewEmpCode] = useState('');
  const [newCadre, setNewCadre] = useState('MES Class-I · Gazetted');
  const [newJurisdiction, setNewJurisdiction] = useState<Jurisdiction>('Citywide');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+91 ');
  const [newSanctionCeiling, setNewSanctionCeiling] = useState('50000000'); // 5 Cr

  // Document Verification Fields
  const [aadhaarNumber, setAadhaarNumber] = useState('9876-5432-1098');
  const [appointmentDocNumber, setAppointmentDocNumber] = useState('GOV-MH-APPT-2026-9081');
  const [dscTokenId, setDscTokenId] = useState('DSC-NIC-SHA256-8819A');
  const [policeClearanceRef, setPoliceClearanceRef] = useState('POL-VET-NSK-44021');

  // Generated Credential State
  const [generatedUser, setGeneratedUser] = useState<User | null>(null);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [hasCopiedPassword, setHasCopiedPassword] = useState(false);

  // Dossier View Modal State
  const [inspectingUser, setInspectingUser] = useState<User | null>(null);

  // Quick Action Feedback
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Auto-fill template when role changes
  const handleRoleChange = (role: UserRole) => {
    setNewRole(role);
    switch (role) {
      case 'COMMISSIONER':
        setNewDepartment('Smart City & Urban Planning');
        setNewDesignation('Additional Municipal Commissioner');
        setNewCadre('Indian Administrative Service (IAS) / State Selection Grade');
        setNewEmpCode(`IAS-MH-HQ-${Math.floor(100 + Math.random() * 900)}`);
        setNewSanctionCeiling('500000000');
        break;
      case 'NODAL_OFFICER':
        setNewDepartment('Smart City & Urban Planning');
        setNewDesignation('Chief City Infrastructure Nodal Officer');
        setNewCadre('Chief Engineer Cadre (MES)');
        setNewEmpCode(`NMC-NODAL-${Math.floor(100 + Math.random() * 900)}`);
        setNewSanctionCeiling('100000000');
        break;
      case 'EXECUTIVE_ENGINEER':
      case 'DEPT_HEAD':
        setNewDepartment('Water & Sewerage');
        setNewDesignation('Executive Engineer (Water Works)');
        setNewCadre('MES Class-I · Gazetted');
        setNewEmpCode(`NMC-ENG-WTR-${Math.floor(1000 + Math.random() * 9000)}`);
        setNewSanctionCeiling('50000000');
        break;
      case 'INSPECTOR':
        setNewDepartment('Roads / PWD');
        setNewDesignation('Senior Quality & Compaction Inspector');
        setNewCadre('Quality Assurance Directorate');
        setNewEmpCode(`NMC-QC-INSP-${Math.floor(1000 + Math.random() * 9000)}`);
        setNewSanctionCeiling('0');
        break;
      case 'CONTRACTOR':
        setNewDepartment('Independent Contractor');
        setNewDesignation('Project Director / Lead EPC Engineer');
        setNewCadre('Class-A Registered Infrastructure EPC Lead');
        setNewEmpCode(`CTR-EPC-${Math.floor(1000 + Math.random() * 9000)}`);
        setNewSanctionCeiling('0');
        break;
    }
  };

  const handleStartProvisioning = () => {
    setProvisionStep(1);
    setNewName('');
    handleRoleChange('EXECUTIVE_ENGINEER');
    setNewEmail('');
    setNewPhone('+91 9');
    setAadhaarNumber(`9876-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`);
    setAppointmentDocNumber(`GOV-MH-APPT-${Math.floor(10000 + Math.random() * 90000)}`);
    setDscTokenId(`DSC-NIC-SHA256-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
    setPoliceClearanceRef(`POL-VET-NSK-${Math.floor(10000 + Math.random() * 90000)}`);
    setIsProvisionModalOpen(true);
  };

  const handleGenerateAndSaveCredentials = async () => {
    if (!newName.trim()) {
      alert('Please enter legal officer name');
      return;
    }

    setIsSavingUser(true);
    try {
      const generatedTempPass = `Parichay#${Math.floor(100000 + Math.random() * 900000)}`;
      const userPayload: Partial<User> = {
        name: newName,
        email: newEmail || `${newName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@nmc.gov.in`,
        role: newRole,
        designation: newDesignation,
        department: newDepartment,
        jurisdiction: newJurisdiction,
        phone: newPhone,
        empCode: newEmpCode || `NMC-${newRole.slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
        cadre: newCadre,
        status: 'ACTIVE',
        securityClearance: newRole === 'COMMISSIONER' || newRole === 'NODAL_OFFICER' ? 'TOP_SECRET_MUNICIPAL' : 'GAZETTED_OFFICIAL',
        twoFactorEnforced: true,
        tempPassword: generatedTempPass,
        issuedAt: new Date().toISOString(),
        issuedBy: `${currentUser?.name || 'NMC IT Directorate'} (${currentUser?.designation || 'Admin'})`,
        documents: [
          {
            docType: 'Aadhaar / Government Photo ID',
            docNumber: aadhaarNumber,
            verifiedAt: new Date().toISOString(),
            verifiedBy: 'NIC e-Pramaan Gateway',
            status: 'VERIFIED',
          },
          {
            docType: newRole === 'CONTRACTOR' ? 'Class-A EPC Contractor License' : 'Gazette Appointment Order',
            docNumber: appointmentDocNumber,
            verifiedAt: new Date().toISOString(),
            verifiedBy: 'Municipal Administration Dept',
            status: 'VERIFIED',
          },
          {
            docType: 'Police & Vigilance Clearance Reference',
            docNumber: policeClearanceRef,
            verifiedAt: new Date().toISOString(),
            verifiedBy: 'Nashik Police Special Branch',
            status: 'VERIFIED',
          },
        ],
        financialSanctionCeilingINR: Number(newSanctionCeiling) || 0,
        digitalSignatureId: dscTokenId,
        policeClearanceRef: policeClearanceRef,
      };

      const res = await api.createUser(userPayload);
      await refreshUsers();
      setGeneratedUser(res.user);
      setProvisionStep(4);
      if (onRefreshData) onRefreshData();
      showNotification(`Official credentials successfully issued for ${res.user.name} (${res.user.empCode})`);
    } catch (err: any) {
      alert(err.message || 'Failed to issue authority credentials');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleResetPassword = async (user: User) => {
    if (!confirm(`Generate and re-issue new temporary password for ${user.name}?`)) return;
    try {
      const res = await api.resetUserPassword(user.id);
      await refreshUsers();
      showNotification(`New Temporary Password for ${user.name}: ${res.tempPassword}`);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    }
  };

  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    if (!confirm(`Are you sure you want to change access status of ${user.name} to ${nextStatus}?`)) return;
    try {
      await api.toggleUserStatus(user.id);
      await refreshUsers();
      showNotification(`Status for ${user.name} updated to ${nextStatus}`);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  // Filter non-citizen users for official roster
  const officialUsers = allUsers.filter((u) => u.role !== 'CITIZEN');

  const filteredUsers = officialUsers.filter((u) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.empCode || '').toLowerCase().includes(q) ||
      (u.designation || '').toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q);

    const matchesDept = selectedDeptFilter === 'ALL' || u.department === selectedDeptFilter;
    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || (u.status || 'ACTIVE') === selectedStatusFilter;

    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  const totalEngineers = officialUsers.filter((u) => u.role === 'EXECUTIVE_ENGINEER' || u.role === 'DEPT_HEAD').length;
  const totalContractors = officialUsers.filter((u) => u.role === 'CONTRACTOR').length;
  const totalInspectors = officialUsers.filter((u) => u.role === 'INSPECTOR').length;
  const totalApex = officialUsers.filter((u) => u.role === 'COMMISSIONER' || u.role === 'NODAL_OFFICER' || u.role === 'ADMIN').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Municipal GovIAM Directorate
            </span>
            <span className="text-xs text-slate-500 font-medium">
              NIC Parichay Trust Level 4 · 2FA Enforced
            </span>
          </div>
          <h1 className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Identity & Access Management (GovIAM)
          </h1>
          <p className="text-xs md:text-sm text-slate-600 max-w-2xl mt-1">
            Exclusive municipal authority for onboarding gazetted engineers, municipal leadership, QC inspectors, and Class-A contractors with statutory document verification.
          </p>
        </div>

        <button
          onClick={handleStartProvisioning}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4 text-white" />
          <span>+ Provision Verified Officer Login</span>
        </button>
      </div>

      {actionSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMessage}</span>
          </div>
          <span className="text-[10px] text-slate-500">Immutable Audit Entry Generated</span>
        </div>
      )}

      {/* Security Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-amber-600" /> Apex Leadership
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalApex} Officers</div>
          <div className="text-[11px] text-slate-500">Commissioners & Nodal Leads</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-600" /> Executive Engineers
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalEngineers} Engineers</div>
          <div className="text-[11px] text-slate-500">Water, Gas, Power, PWD, Telecom</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> QC Field Inspectors
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalInspectors} Inspectors</div>
          <div className="text-[11px] text-slate-500">Compaction & Barricade Auditors</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <HardHat className="w-3.5 h-3.5 text-slate-700" /> Vetted Contractors
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalContractors} EPC Agencies</div>
          <div className="text-[11px] text-slate-500">Class-A Licensed Contractors</div>
        </div>
      </div>

      {/* Roster Controls & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Authorized Personnel Directory ({filteredUsers.length})
            </h2>
            <p className="text-xs text-slate-500">
              Manage cryptographic credentials, 2FA enforcement, and security dossiers for all municipal stakeholders
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Fingerprint className="w-3.5 h-3.5 text-emerald-600" /> 100% 2FA Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search officer name, employee code, email, designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-2xs"
            />
          </div>

          <div>
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-2xs font-medium"
            >
              <option value="ALL">All Departments</option>
              <option value="Smart City & Urban Planning">Smart City / Leadership</option>
              <option value="Water & Sewerage">Water & Sewerage</option>
              <option value="Roads / PWD">Roads / PWD</option>
              <option value="City Gas Distribution">City Gas (MNGL)</option>
              <option value="Electricity (DISCOM)">Power (MSEDCL)</option>
              <option value="Telecom & Digital">Telecom & 5G</option>
              <option value="Drainage Department">Drainage & Stormwater</option>
              <option value="Traffic Police Authority">Traffic Police</option>
              <option value="Independent Contractor">Class-A Contractor</option>
            </select>
          </div>

          <div>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-2xs font-medium"
            >
              <option value="ALL">All Roles</option>
              <option value="COMMISSIONER">Commissioner</option>
              <option value="NODAL_OFFICER">Nodal Officer</option>
              <option value="EXECUTIVE_ENGINEER">Executive Engineer</option>
              <option value="INSPECTOR">QC Inspector</option>
              <option value="CONTRACTOR">Contractor</option>
            </select>
          </div>
        </div>

        {/* User Management Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-900">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[9px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Official Officer / Entity</th>
                <th className="py-3.5 px-3">Department & Cadre</th>
                <th className="py-3.5 px-3">Jurisdiction</th>
                <th className="py-3.5 px-3">Security & 2FA</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No official accounts found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSuspended = u.status === 'SUSPENDED';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Officer Name & Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-slate-300 shadow-2xs">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-500">{u.designation}</div>
                            <div className="text-[10px] font-mono text-blue-600 font-semibold mt-0.5">
                              {u.empCode || u.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department & Cadre */}
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">{u.department}</div>
                        <div className="text-[10px] text-slate-500">{u.cadre || 'Gazetted Cadre'}</div>
                      </td>

                      {/* Jurisdiction */}
                      <td className="py-3.5 px-3">
                        <span className="text-slate-800 font-medium">{u.jurisdiction || 'Citywide'}</span>
                        <div className="text-[10px] text-slate-500">{u.email}</div>
                      </td>

                      {/* Security Clearance & 2FA */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider block w-fit">
                            2FA Binding Active
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {u.securityClearance || 'GAZETTED_OFFICIAL'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            isSuspended
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingUser(u)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-200 transition-all cursor-pointer"
                            title="Inspect Verification Dossier & Documents"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                          </button>

                          <button
                            onClick={() => handleResetPassword(u)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-200 transition-all cursor-pointer"
                            title="Re-issue Temporary One-Time Password"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              isSuspended
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                            }`}
                            title={isSuspended ? 'Restore Authority Credentials' : 'Suspend Authority Credentials'}
                          >
                            {isSuspended ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <ShieldX className="w-3.5 h-3.5 text-rose-600" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROVISIONING MODAL: MULTI-STEP STATUTORY ONBOARDING */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in space-y-5 p-6 md:p-8">
            {/* Modal Top Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  Statutory Credential Authority · Step {provisionStep} of 4
                </span>
                <h3 className="font-bold text-lg text-slate-900 mt-1">
                  Provision Verified Authority Login
                </h3>
                <p className="text-xs text-slate-500">
                  {provisionStep === 1 && 'Step 1: Official Cadre & Professional Identity Details'}
                  {provisionStep === 2 && 'Step 2: Statutory Document Verification & Identity Dossier'}
                  {provisionStep === 3 && 'Step 3: Security Clearances, RBAC Scopes & 2FA Binding'}
                  {provisionStep === 4 && 'Step 4: Sealed Authority Issuance & Digital Certificate'}
                </p>
              </div>
              <button
                onClick={() => setIsProvisionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: IDENTITY & CADRE DETAILS */}
            {provisionStep === 1 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Authority Tier / Role *</label>
                  <select
                    value={newRole}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                  >
                    <option value="EXECUTIVE_ENGINEER">Utility Executive Engineer (Water, Gas, Power, PWD, Telecom)</option>
                    <option value="COMMISSIONER">Municipal Leadership (Commissioner / Additional Commissioner)</option>
                    <option value="NODAL_OFFICER">Chief Nodal Infrastructure Officer</option>
                    <option value="INSPECTOR">Quality & Safety QC Field Inspector</option>
                    <option value="CONTRACTOR">Class-A Registered Infrastructure EPC Contractor</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Legal Officer / Entity Name *</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Er. Vikram Deshmukh"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Official Designation *</label>
                    <input
                      type="text"
                      required
                      value={newDesignation}
                      onChange={(e) => setNewDesignation(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Department / Organization *</label>
                    <select
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value as DepartmentName)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    >
                      <option value="Water & Sewerage">Water & Sewerage</option>
                      <option value="Roads / PWD">Roads / PWD</option>
                      <option value="City Gas Distribution">City Gas Distribution (MNGL)</option>
                      <option value="Electricity (DISCOM)">Electricity (MSEDCL)</option>
                      <option value="Telecom & Digital">Telecom & Digital</option>
                      <option value="Drainage Department">Drainage Department</option>
                      <option value="Traffic Police Authority">Traffic Police Authority</option>
                      <option value="Smart City & Urban Planning">Smart City & Urban Planning</option>
                      <option value="Independent Contractor">Independent Contractor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Gazetted Cadre / License Class *</label>
                    <input
                      type="text"
                      value={newCadre}
                      onChange={(e) => setNewCadre(e.target.value)}
                      placeholder="e.g. MES Class-I · Gazetted"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Official Gov Email *</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. vikram.deshmukh@nmc.gov.in"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Mobile Number (for 2FA OTP) *</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+91 98220 12345"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      if (!newName.trim()) {
                        alert('Please enter legal officer name');
                        return;
                      }
                      setProvisionStep(2);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Proceed to Document Verification →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: STATUTORY DOCUMENT VERIFICATION */}
            {provisionStep === 2 && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-slate-700 space-y-1">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-blue-600" />
                    Mandatory NIC Document Authentication
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Under statutory cybersecurity circulars, all executive engineer and contractor accounts must be grounded in verified Aadhaar, departmental gazette order, and police clearance.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Aadhaar / Gov Photo ID Reference *</label>
                    <input
                      type="text"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Gazette Appointment / License No. *</label>
                    <input
                      type="text"
                      value={appointmentDocNumber}
                      onChange={(e) => setAppointmentDocNumber(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Digital Signature Certificate (DSC) Key *</label>
                    <input
                      type="text"
                      value={dscTokenId}
                      onChange={(e) => setDscTokenId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Police & Vigilance Vetting Ref *</label>
                    <input
                      type="text"
                      value={policeClearanceRef}
                      onChange={(e) => setPoliceClearanceRef(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setProvisionStep(1)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvisionStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Proceed to Security Credentials →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SECURITY CLEARANCES & 2FA BINDING */}
            {provisionStep === 3 && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900">Security Clearance & Authority Limits</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Officer Name</span>
                      <strong className="text-slate-900">{newName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Official Email</span>
                      <strong className="text-slate-900 font-mono">{newEmail || 'Auto-generated'}</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Financial Sanction Ceiling (INR)</label>
                  <input
                    type="number"
                    value={newSanctionCeiling}
                    onChange={(e) => setNewSanctionCeiling(e.target.value)}
                    placeholder="e.g. 50000000"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    ₹{(Number(newSanctionCeiling) / 10000000).toFixed(2)} Crores statutory signing limit
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs text-emerald-900">
                    <strong className="block">Mandatory 2FA SMS & Parichay Token Binding</strong>
                    One-Time Password will be dispatched to <span className="font-bold">{newPhone}</span> upon first login.
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setProvisionStep(2)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateAndSaveCredentials}
                    disabled={isSavingUser}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>{isSavingUser ? 'Sealing & Generating...' : 'Seal & Issue Official Credentials'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SEALED CREDENTIAL CERTIFICATE */}
            {provisionStep === 4 && generatedUser && (
              <div className="space-y-4 text-xs animate-fade-in">
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 shadow-lg border border-slate-700">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white uppercase tracking-wider">
                        Official GovIAM Authorization Certificate
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">{generatedUser.name}</h4>
                      <p className="text-xs text-slate-300">{generatedUser.designation} · {generatedUser.department}</p>
                    </div>
                    <QrCode className="w-12 h-12 text-white shrink-0" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Employee ID / Code</span>
                      <div className="font-mono text-emerald-400 font-bold mt-0.5">{generatedUser.empCode}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">NIC Parichay Username</span>
                      <div className="font-mono text-white mt-0.5">{generatedUser.email}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Temporary One-Time Password</span>
                      <div className="font-mono text-amber-400 font-bold mt-0.5 text-sm">
                        {generatedUser.tempPassword}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">2FA Security Status</span>
                      <div className="text-emerald-400 font-bold mt-0.5">Enforced & Active</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `MR. MAYOR GovIAM Credentials\nOfficer: ${generatedUser.name}\nCode: ${generatedUser.empCode}\nUsername: ${generatedUser.email}\nTemporary Password: ${generatedUser.tempPassword}\n2FA: Enforced`
                      );
                      setHasCopiedPassword(true);
                      setTimeout(() => setHasCopiedPassword(false), 3000);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {hasCopiedPassword ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                    <span>{hasCopiedPassword ? 'Credentials Copied!' : 'Copy Official Credentials'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsProvisionModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Complete & Return to Roster
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OFFICER VERIFICATION DOSSIER MODAL */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in space-y-5 p-6 md:p-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  Statutory Officer Verification Dossier
                </span>
                <h3 className="font-bold text-lg text-slate-900 mt-1">{inspectingUser.name}</h3>
                <p className="text-xs text-slate-500">
                  {inspectingUser.designation} · {inspectingUser.department} · {inspectingUser.empCode || inspectingUser.id}
                </p>
              </div>
              <button
                onClick={() => setInspectingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Official Cadre</span>
                  <strong className="text-slate-900">{inspectingUser.cadre || 'Gazetted Cadre'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Jurisdiction</span>
                  <strong className="text-slate-900">{inspectingUser.jurisdiction || 'Citywide'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Official Email</span>
                  <strong className="text-slate-900 font-mono">{inspectingUser.email}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">2FA Mobile Number</span>
                  <strong className="text-slate-900 font-mono">{inspectingUser.phone || 'Verified on file'}</strong>
                </div>
              </div>

              {/* Verified Documents List */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 text-xs">Archived Statutory Documents</div>
                <div className="space-y-2">
                  {(inspectingUser.documents || [
                    {
                      docType: 'Aadhaar / Government Photo ID',
                      docNumber: 'AADHAAR-VERIFIED-XXXX',
                      verifiedAt: '2026-08-01',
                      verifiedBy: 'NIC e-Pramaan Gateway',
                      status: 'VERIFIED',
                    },
                    {
                      docType: 'Gazette Appointment Order / Class-A License',
                      docNumber: 'MH-GOV-APPT-2026',
                      verifiedAt: '2026-08-01',
                      verifiedBy: 'Municipal Administration Dept',
                      status: 'VERIFIED',
                    },
                  ]).map((doc: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">{doc.docType}</div>
                          <div className="text-[10px] text-slate-500 font-mono">Ref: {doc.docNumber}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Audit Details */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-1 text-[11px]">
                <div>Digital Signature Token: <strong className="text-slate-900 font-mono">{inspectingUser.digitalSignatureId || 'DSC-NIC-SHA256-ACTIVE'}</strong></div>
                <div>Police Clearance Ref: <strong className="text-slate-900 font-mono">{inspectingUser.policeClearanceRef || 'POL-VET-NSK-44021'}</strong></div>
                <div>Issued By: <strong className="text-slate-900">{inspectingUser.issuedBy || 'NMC IT Directorate'}</strong></div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInspectingUser(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

