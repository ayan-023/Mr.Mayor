/**
 * MR. MAYOR - National City Authority Onboarding & Portal Connection Engine
 * Allows selection of Indian State -> District -> Creation of Municipal Digital Twin
 * Generates Official City Access Codes & Department Connection Tokens.
 */

import React, { useState, useMemo } from 'react';
import {
  Building2,
  MapPin,
  ShieldCheck,
  Key,
  Copy,
  Check,
  ArrowRight,
  PlusCircle,
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Share2,
  HardHat,
  Users,
  Compass,
  X,
} from 'lucide-react';
import { INDIAN_STATES, IndianState } from '../../data/indianStates';
import { CityPortalConfig, CityConnectionRequest, CorporationType } from '../../types';
import { api } from '../../services/api';

interface CityOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCities: CityPortalConfig[];
  activeCity: CityPortalConfig | null;
  onCityChanged: (city: CityPortalConfig) => void;
  onCityCreated: (city: CityPortalConfig) => void;
}

export const CityOnboardingModal: React.FC<CityOnboardingModalProps> = ({
  isOpen,
  onClose,
  availableCities,
  activeCity,
  onCityChanged,
  onCityCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'connect' | 'switch'>('create');

  // Creation Wizard State
  const [selectedStateCode, setSelectedStateCode] = useState<string>('MH');
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('Nashik');
  const [customCityName, setCustomCityName] = useState<string>('');
  const [corporationName, setCorporationName] = useState<string>('Nashik Municipal Corporation (NMC)');
  const [corporationType, setCorporationType] = useState<CorporationType>('MUNICIPAL_CORPORATION');
  const [commissionerName, setCommissionerName] = useState<string>('Dr. Pravin Gedam (IAS)');
  const [nodalOfficerName, setNodalOfficerName] = useState<string>('Er. Rajesh Kulkarni');
  const [wardCount, setWardCount] = useState<number>(122);
  const [totalRoadsKm, setTotalRoadsKm] = useState<number>(1420);

  // Success Step after creation
  const [createdResult, setCreatedResult] = useState<CityPortalConfig | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Connect with Code State
  const [joinCode, setJoinCode] = useState<string>('');
  const [joinAuthorityName, setJoinAuthorityName] = useState<string>('');
  const [joinDesignation, setJoinDesignation] = useState<string>('');
  const [joinEmail, setJoinEmail] = useState<string>('');
  const [joinDept, setJoinDept] = useState<string>('Smart City & Urban Planning');
  const [connectSuccessMsg, setConnectSuccessMsg] = useState<string | null>(null);

  // Filtered districts based on state
  const currentState = useMemo(() => {
    return INDIAN_STATES.find((s) => s.code === selectedStateCode) || INDIAN_STATES[0];
  }, [selectedStateCode]);

  const handleStateChange = (stateCode: string) => {
    setSelectedStateCode(stateCode);
    const stateObj = INDIAN_STATES.find((s) => s.code === stateCode) || INDIAN_STATES[0];
    if (stateObj.districts.length > 0) {
      const firstDist = stateObj.districts[0];
      setSelectedDistrictName(firstDist.name);
      setCorporationName(firstDist.corporationName);
      setCorporationType(firstDist.corporationType);
      setWardCount(firstDist.defaultWards);
    }
  };

  const handleDistrictChange = (distName: string) => {
    setSelectedDistrictName(distName);
    const dist = currentState.districts.find((d) => d.name === distName);
    if (dist) {
      setCorporationName(dist.corporationName);
      setCorporationType(dist.corporationType);
      setWardCount(dist.defaultWards);
    }
  };

  const handleCreateCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const distObj = currentState.districts.find((d) => d.name === selectedDistrictName);
    const centerLat = distObj ? distObj.centerLat : 20.0;
    const centerLng = distObj ? distObj.centerLng : 77.0;
    const cityName = customCityName.trim() || selectedDistrictName;

    try {
      const resp = await api.createCityPortal({
        name: cityName,
        state: currentState.name,
        district: selectedDistrictName,
        corporationName: corporationName || `${cityName} Municipal Corporation`,
        corporationType,
        commissionerName: commissionerName || 'Municipal Commissioner (IAS)',
        nodalOfficerName: nodalOfficerName || 'Chief Infrastructure Nodal Officer',
        wardCount: Number(wardCount) || 80,
        totalRoadsKm: Number(totalRoadsKm) || 1200,
        coordinates: { lat: centerLat, lng: centerLng },
      });

      if (resp && resp.city) {
        setCreatedResult(resp.city);
        onCityCreated(resp.city);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize city municipal portal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectWithCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setConnectSuccessMsg(null);

    try {
      const resp = await api.connectWithCityCode({
        cityAccessCode: joinCode.trim().toUpperCase(),
        authorityName: joinAuthorityName || 'Connected Officer',
        authorityDesignation: joinDesignation || 'Assistant Engineer',
        authorityEmail: joinEmail || 'officer@gov.in',
        department: joinDept as any,
      });

      if (resp && resp.success && resp.city) {
        setConnectSuccessMsg(resp.message || 'Successfully connected to City Municipal Portal!');
        onCityChanged(resp.city);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMessage(resp.message || 'Failed to connect. Invalid access code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not verify city connection code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14181F]/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#FAF9F6] border border-[#14181F]/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        
        {/* National Tricolor Top Bar */}
        <div className="tricolor-ribbon" />

        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#FFFFFF] border-b border-[#14181F]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF5EE] border border-[#E06D28]/30 flex items-center justify-center text-[#E06D28]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-editorial font-bold text-xl text-[#14181F] tracking-tight">
                  National Municipal City Portal Onboarding
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1E3A8A] font-bold border border-[#1E3A8A]/20 uppercase tracking-wider">
                  MoHUA Certified
                </span>
              </div>
              <p className="text-xs text-[#718096] font-sans">
                Provision a new City Digital Twin or link your authority using official City Access Codes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#718096] hover:text-[#14181F] hover:bg-[#F5F4F0] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-[#14181F]/10 bg-[#F5F4F0] px-6">
          <button
            onClick={() => {
              setActiveTab('create');
              setCreatedResult(null);
              setErrorMessage(null);
            }}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'border-[#E06D28] text-[#E06D28] bg-[#FAF9F6]'
                : 'border-transparent text-[#718096] hover:text-[#14181F]'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>1. Provision New City Portal</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('connect');
              setErrorMessage(null);
              setConnectSuccessMsg(null);
            }}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'connect'
                ? 'border-[#1E3A8A] text-[#1E3A8A] bg-[#FAF9F6]'
                : 'border-transparent text-[#718096] hover:text-[#14181F]'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>2. Connect Authority with Code</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('switch');
              setErrorMessage(null);
            }}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'switch'
                ? 'border-[#15803D] text-[#15803D] bg-[#FAF9F6]'
                : 'border-transparent text-[#718096] hover:text-[#14181F]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>3. Switch Municipal Workspace ({availableCities.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto max-h-[70vh]">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-[#FFF5EE] border border-[#E06D28]/30 flex items-center gap-3 text-xs text-[#E06D28]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: PROVISION NEW CITY PORTAL */}
          {activeTab === 'create' && !createdResult && (
            <form onSubmit={handleCreateCitySubmit} className="space-y-6">
              <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#14181F]/10 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-[#E06D28] tracking-wider block mb-1">
                  Step 1 • Territorial Jurisdiction
                </span>
                <h3 className="font-serif-editorial font-bold text-base text-[#14181F] mb-4">
                  Select State & District Administration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select State */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4A5568] mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E06D28]" />
                      <span>Indian State / Union Territory</span>
                    </label>
                    <select
                      value={selectedStateCode}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#14181F]/20 bg-[#FAF9F6] text-xs font-semibold text-[#14181F] focus:outline-none focus:border-[#E06D28] cursor-pointer"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st.code} value={st.code}>
                          {st.name} ({st.districts.length} Major Municipalities)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select District */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4A5568] mb-1.5 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
                      <span>District / City Jurisdiction</span>
                    </label>
                    <select
                      value={selectedDistrictName}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#14181F]/20 bg-[#FAF9F6] text-xs font-semibold text-[#14181F] focus:outline-none focus:border-[#1E3A8A] cursor-pointer"
                    >
                      {currentState.districts.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name} — {d.corporationName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#14181F]/5">
                  <label className="block text-[11px] font-bold text-[#718096] mb-1">
                    Custom City / Urban Cluster Name (Optional Override)
                  </label>
                  <input
                    type="text"
                    value={customCityName}
                    onChange={(e) => setCustomCityName(e.target.value)}
                    placeholder={`Leave blank to use ${selectedDistrictName}`}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#14181F]/15 bg-[#FAF9F6] text-xs text-[#14181F] focus:outline-none focus:border-[#14181F]"
                  />
                </div>
              </div>

              {/* Step 2: Municipal Governance */}
              <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#14181F]/10 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-[#15803D] tracking-wider block mb-1">
                  Step 2 • Municipal Authority Profile
                </span>
                <h3 className="font-serif-editorial font-bold text-base text-[#14181F] mb-4">
                  Urban Local Body (ULB) Identity
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#4A5568] mb-1.5">
                      Municipal Corporation Full Title
                    </label>
                    <input
                      type="text"
                      required
                      value={corporationName}
                      onChange={(e) => setCorporationName(e.target.value)}
                      placeholder="e.g. Pune Municipal Corporation (PMC)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#14181F]/15 bg-[#FAF9F6] text-xs text-[#14181F] focus:outline-none focus:border-[#14181F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4A5568] mb-1.5">
                      Governance Entity Type
                    </label>
                    <select
                      value={corporationType}
                      onChange={(e) => setCorporationType(e.target.value as CorporationType)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#14181F]/15 bg-[#FAF9F6] text-xs text-[#14181F] focus:outline-none"
                    >
                      <option value="MUNICIPAL_CORPORATION">Municipal Corporation (Mahanagar Palika)</option>
                      <option value="NAGAR_NIGAM">Nagar Nigam (City Municipal Board)</option>
                      <option value="SMART_CITY_SPV">Smart City Special Purpose Vehicle (SPV)</option>
                      <option value="METROPOLITAN_DEV_AUTHORITY">Metropolitan Development Authority</option>
                      <option value="URBAN_LOCAL_BODY">Urban Local Body (Municipality Council)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4A5568] mb-1.5">
                      Municipal Commissioner / CEO (IAS)
                    </label>
                    <input
                      type="text"
                      required
                      value={commissionerName}
                      onChange={(e) => setCommissionerName(e.target.value)}
                      placeholder="e.g. Vikram Kumar (IAS)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#14181F]/15 bg-[#FAF9F6] text-xs text-[#14181F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4A5568] mb-1.5">
                      Chief Infrastructure Nodal Officer
                    </label>
                    <input
                      type="text"
                      required
                      value={nodalOfficerName}
                      onChange={(e) => setNodalOfficerName(e.target.value)}
                      placeholder="e.g. Er. Srinivas Kandul"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#14181F]/15 bg-[#FAF9F6] text-xs text-[#14181F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4A5568] mb-1.5">
                      Number of Administrative Wards / Zones
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={wardCount}
                      onChange={(e) => setWardCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#14181F]/15 bg-[#FAF9F6] text-xs text-[#14181F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4A5568] mb-1.5">
                      Estimated Road Network (Kilometers)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="50000"
                      value={totalRoadsKm}
                      onChange={(e) => setTotalRoadsKm(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#14181F]/15 bg-[#FAF9F6] text-xs text-[#14181F] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-[#14181F]/20 text-xs font-bold text-[#4A5568] hover:bg-[#F5F4F0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#E06D28] hover:bg-[#C2581A] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Provisioning City Digital Twin...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate City Portal & Connection Tokens</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* CREATED RESULT CARD (Shows official City Access Code & Department Join Tokens) */}
          {activeTab === 'create' && createdResult && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-[#15803D]/30 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#15803D] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#15803D] block">
                    City Municipal Portal Successfully Initialized
                  </span>
                  <h3 className="font-serif-editorial font-bold text-xl text-[#14181F]">
                    {createdResult.corporationName}
                  </h3>
                  <p className="text-xs text-[#4A5568] mt-1 font-sans">
                    Digital Twin established for <strong>{createdResult.district}, {createdResult.state}</strong> with {createdResult.wardCount} Wards and {createdResult.totalRoadsKm} km of mapped road network.
                  </p>
                </div>
              </div>

              {/* Master City Code Banner */}
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#E06D28]/40 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#E06D28]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E06D28]">
                      Official City Master Access Code
                    </span>
                  </div>
                  <span className="text-[10px] text-[#718096]">Share with Department Nodal Leads</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-4 py-3 bg-[#FAF9F6] border border-[#14181F]/15 rounded-xl font-mono text-base font-bold text-[#14181F] tracking-widest text-center selection:bg-[#E06D28] selection:text-white">
                    {createdResult.cityAccessCode}
                  </div>
                  <button
                    onClick={() => copyToClipboard(createdResult.cityAccessCode, 'master')}
                    className="px-4 py-3 rounded-xl bg-[#14181F] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    {copiedKey === 'master' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey === 'master' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#718096] mt-2">
                  Any municipal engineer or utility executive can paste this code into the <strong>Connect Authority</strong> tab to join this city's workspace.
                </p>
              </div>

              {/* Department Connection Codes Grid */}
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#14181F]/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block mb-3">
                  Department-Specific Join Tokens (Share with Respective Directorate Leads):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(createdResult.departmentConnectionCodes).map(([deptKey, code]) => {
                    const deptLabel =
                      deptKey === 'pwd'
                        ? 'Roads / PWD'
                        : deptKey === 'water'
                        ? 'Water Supply'
                        : deptKey === 'electricity'
                        ? 'DISCOM Power'
                        : deptKey === 'gas'
                        ? 'City Gas Network'
                        : deptKey === 'telecom'
                        ? 'Telecom & OFC'
                        : deptKey === 'traffic'
                        ? 'Traffic Police'
                        : 'Contractor Desk';

                    return (
                      <div
                        key={deptKey}
                        className="p-3 rounded-xl bg-[#FAF9F6] border border-[#14181F]/10 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="text-[10px] text-[#718096] block font-semibold">{deptLabel}</span>
                          <span className="font-mono font-bold text-[#14181F]">{code}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(String(code), deptKey)}
                          className="p-1.5 rounded-lg hover:bg-[#FFFFFF] text-[#718096] hover:text-[#14181F] cursor-pointer"
                          title="Copy Token"
                        >
                          {copiedKey === deptKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    onCityChanged(createdResult);
                    onClose();
                  }}
                  className="px-6 py-3 rounded-xl bg-[#15803D] hover:bg-[#166534] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>Enter {createdResult.name} Municipal Twin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CONNECT AUTHORITY WITH CODE */}
          {activeTab === 'connect' && (
            <form onSubmit={handleConnectWithCodeSubmit} className="space-y-6">
              {connectSuccessMsg && (
                <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#15803D]/30 flex items-center gap-3 text-xs text-[#15803D]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{connectSuccessMsg}</span>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#14181F]/10 shadow-2xs">
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-bold text-[#1E3A8A] tracking-wider block mb-1">
                    Authority Inter-Agency Connection
                  </span>
                  <h3 className="font-serif-editorial font-bold text-base text-[#14181F]">
                    Enter City Master Code or Department Join Token
                  </h3>
                  <p className="text-xs text-[#718096] mt-0.5">
                    Link your departmental desk (PWD, Water, DISCOM, Gas, Telecom, Traffic, Contractor) to an active city.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4A5568] mb-1.5 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-[#1E3A8A]" />
                      <span>City Access Code / Department Token</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="e.g. NMC-MH-2026-HQ or PWD-MH-8821"
                      className="w-full px-4 py-3 rounded-xl border border-[#14181F]/20 bg-[#FAF9F6] text-sm font-mono font-bold text-[#14181F] uppercase tracking-widest focus:outline-none focus:border-[#1E3A8A]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#4A5568] mb-1.5">
                        Officer / Representative Name
                      </label>
                      <input
                        type="text"
                        required
                        value={joinAuthorityName}
                        onChange={(e) => setJoinAuthorityName(e.target.value)}
                        placeholder="e.g. Er. Ananya Sharma"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#14181F]/15 bg-[#FAF9F6] text-xs text-[#14181F] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#4A5568] mb-1.5">
                        Official Government Email / ID
                      </label>
                      <input
                        type="email"
                        required
                        value={joinEmail}
                        onChange={(e) => setJoinEmail(e.target.value)}
                        placeholder="e.g. ananya.pwd@gov.in"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#14181F]/15 bg-[#FAF9F6] text-xs text-[#14181F] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#4A5568] mb-1.5">
                        Designation / Official Post
                      </label>
                      <input
                        type="text"
                        required
                        value={joinDesignation}
                        onChange={(e) => setJoinDesignation(e.target.value)}
                        placeholder="e.g. Executive Engineer (Water Supply)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#14181F]/15 bg-[#FAF9F6] text-xs text-[#14181F] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#4A5568] mb-1.5">
                        Your Directorate / Agency
                      </label>
                      <select
                        value={joinDept}
                        onChange={(e) => setJoinDept(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#14181F]/15 bg-[#FAF9F6] text-xs text-[#14181F] focus:outline-none cursor-pointer"
                      >
                        <option value="Roads / PWD">Roads / Public Works Department (PWD)</option>
                        <option value="Water & Sewerage">Water Supply & Sewerage Board</option>
                        <option value="Electricity (DISCOM)">Electricity Distribution (DISCOM)</option>
                        <option value="City Gas Distribution">City Gas Distribution Network</option>
                        <option value="Telecom & Digital">Telecom & Smart OFC Authority</option>
                        <option value="Traffic Police Authority">Traffic Police & Enforcement</option>
                        <option value="Smart City & Urban Planning">Smart City SPV / Municipal Planning</option>
                        <option value="Independent Contractor">Empanelled Infrastructure Contractor</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-[#14181F]/20 text-xs font-bold text-[#4A5568] hover:bg-[#F5F4F0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Validating & Connecting...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Connect to Municipal Workspace</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SWITCH MUNICIPAL WORKSPACE */}
          {activeTab === 'switch' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-serif-editorial font-bold text-base text-[#14181F]">
                    Configured Municipal Digital Twins
                  </h3>
                  <p className="text-xs text-[#718096]">
                    Select any Indian city to inspect active road networks, utility assets, and excavation pipelines.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#15803D] bg-[#F0FDF4] px-3 py-1 rounded-full border border-[#15803D]/20">
                  {availableCities.length} Cities Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {availableCities.map((city) => {
                  const isActive = activeCity?.id === city.id;
                  return (
                    <div
                      key={city.id}
                      onClick={() => {
                        onCityChanged(city);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isActive
                          ? 'bg-[#FFFFFF] border-2 border-[#15803D] shadow-sm ring-2 ring-[#15803D]/20'
                          : 'bg-[#FFFFFF] border-[#14181F]/10 hover:border-[#14181F]/30 hover:shadow-2xs'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-full border border-[#15803D]/30 uppercase">
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-[#E06D28] uppercase tracking-wider">
                            {city.state}
                          </span>
                        </div>
                        <h4 className="font-serif-editorial font-bold text-lg text-[#14181F] leading-tight">
                          {city.name}
                        </h4>
                        <p className="text-[11px] text-[#718096] mt-0.5 line-clamp-1">
                          {city.corporationName}
                        </p>

                        <div className="mt-3 pt-3 border-t border-[#14181F]/5 grid grid-cols-2 gap-2 text-[10px] text-[#4A5568]">
                          <div>
                            <span className="text-[#718096] block">Wards</span>
                            <span className="font-bold text-[#14181F]">{city.wardCount}</span>
                          </div>
                          <div>
                            <span className="text-[#718096] block">Road Network</span>
                            <span className="font-bold text-[#14181F]">{city.totalRoadsKm} km</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 flex items-center justify-between border-t border-[#14181F]/5 text-[10px]">
                        <span className="font-mono text-[#718096]">{city.cityAccessCode}</span>
                        <span className="font-bold text-[#15803D] hover:underline flex items-center gap-0.5">
                          <span>Switch</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#F5F4F0] border-t border-[#14181F]/10 flex items-center justify-between text-[11px] text-[#718096]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#15803D]" />
            <span>National Urban Informatics • Gati Shakti Master Data Layer</span>
          </div>
          <span>Digital India Infrastructure Platform</span>
        </div>

      </div>
    </div>
  );
};
