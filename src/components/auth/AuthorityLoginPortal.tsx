/**
 * MR. MAYOR - Official Government Authentication & Persona Login Portal
 * High-security Government of Maharashtra / NMC Urban Infrastructure Gateway
 * Featuring Authentic Officer ID Card Blueprint Badges & 2-Factor OTP Verification.
 */

import React, { useState, useMemo } from 'react';
import {
  Building2,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  MapPin,
  LogIn,
  KeyRound,
  RefreshCw,
  Check,
  HardHat,
  Users,
  Layers,
  ArrowLeft,
  Droplet,
  Zap,
  Flame,
  Route,
  Radio,
  Waves,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  QrCode,
  Fingerprint,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User, UserRole, CityPortalConfig, DepartmentName } from '../../types';

export interface OfficialPersonProfile {
  id: string;
  name: string;
  designation: string;
  department: DepartmentName;
  role: UserRole;
  email: string;
  phone: string;
  badge: string;
  empCode: string;
  cadre: string;
  jurisdiction: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  initials: string;
}

export interface AuthorityTier {
  id: string;
  name: string;
  shortLabel: string;
  headline: string;
  subheadline: string;
  themeColor: string;
  icon: any;
  officials: OfficialPersonProfile[];
}

export const AUTHORITY_TIERS: AuthorityTier[] = [
  {
    id: 'executive_engineers',
    name: 'Utility Executive Engineers',
    shortLabel: 'Executive Engineers',
    headline: 'Select Departmental Executive Engineer',
    subheadline: 'Select the designated utility engineer profile to authenticate with the NMC Municipal Gateway.',
    themeColor: '#2563EB',
    icon: Layers,
    officials: [
      {
        id: 'usr-nsk-03',
        name: 'Er. Sanjay Shinde',
        designation: 'Executive Engineer (Water Supply)',
        department: 'Water & Sewerage',
        role: 'EXECUTIVE_ENGINEER',
        email: 'ee.water@bbmp.gov.in',
        phone: '+91 94222 18903',
        badge: 'Water Works Wing',
        empCode: 'NMC-ENG-WTR-4412',
        cadre: 'MES Class-I · Gazetted',
        jurisdiction: 'Citywide Potable Water Grid',
        icon: Droplet,
        color: '#0284C7',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-200',
        initials: 'SS',
      },
      {
        id: 'usr-nsk-03c',
        name: 'Er. Prashant Wagh',
        designation: 'Chief Project Manager (City Gas)',
        department: 'City Gas Distribution',
        role: 'EXECUTIVE_ENGINEER',
        email: 'cpm.gas@mngl.in',
        phone: '+91 98901 77334',
        badge: 'MNGL Gas Infrastructure',
        empCode: 'MNGL-PROJ-GAS-8819',
        cadre: 'Senior Project Lead (PSU)',
        jurisdiction: 'MDPE Gas Network Zone',
        icon: Flame,
        color: '#D97706',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        initials: 'PW',
      },
      {
        id: 'usr-nsk-03b',
        name: 'Er. Deepak Jadhav',
        designation: 'Superintending Engineer (Power)',
        department: 'Electricity (DISCOM)',
        role: 'EXECUTIVE_ENGINEER',
        email: 'se.power@msedcl.in',
        phone: '+91 98224 55102',
        badge: 'MSEDCL Power Distribution',
        empCode: 'MSEDCL-ENG-PWR-3108',
        cadre: 'Superintending Engineer (Class-I)',
        jurisdiction: '33kV Urban Power Ring',
        icon: Zap,
        color: '#CA8A04',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        initials: 'DJ',
      },
      {
        id: 'usr-nsk-04',
        name: 'Er. Nitin Rajput',
        designation: 'Superintending Engineer (Roads & Bridges)',
        department: 'Roads / PWD',
        role: 'DEPT_HEAD',
        email: 'se.pwd@nmc.gov.in',
        phone: '+91 98505 67231',
        badge: 'Public Works (PWD)',
        empCode: 'NMC-PWD-ENG-1102',
        cadre: 'PWD Superintending Cadre',
        jurisdiction: 'Arterial Road Network',
        icon: Route,
        color: '#475569',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-300',
        initials: 'NR',
      },
      {
        id: 'usr-nsk-03d',
        name: 'Er. Priya Sharma',
        designation: 'Chief Telecom & OFC Officer',
        department: 'Telecom & Digital',
        role: 'EXECUTIVE_ENGINEER',
        email: 'telecom.nodal@bsnl.in',
        phone: '+91 94220 88711',
        badge: 'BharatNet / Smart City',
        empCode: 'BSNL-SMC-OFC-9022',
        cadre: 'ITS (Indian Telecom Service)',
        jurisdiction: '5G Smart City OFC Duct Ring',
        icon: Radio,
        color: '#7C3AED',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        initials: 'PS',
      },
      {
        id: 'usr-nsk-03e',
        name: 'Er. Sunil Gaikwad',
        designation: 'Executive Engineer (Drainage & Culverts)',
        department: 'Drainage Department',
        role: 'EXECUTIVE_ENGINEER',
        email: 'ee.drainage@nmc.gov.in',
        phone: '+91 98229 33418',
        badge: 'Stormwater & Drainage',
        empCode: 'NMC-DRN-ENG-5531',
        cadre: 'MES Class-I · Gazetted',
        jurisdiction: 'Godavari River Basin Drains',
        icon: Waves,
        color: '#0D9488',
        bgColor: 'bg-teal-50',
        borderColor: 'border-teal-200',
        initials: 'SG',
      },
      {
        id: 'usr-nsk-03f',
        name: 'DCP Sandeep Patil',
        designation: 'Deputy Commissioner of Police (Traffic)',
        department: 'Traffic Police Authority',
        role: 'DEPT_HEAD',
        email: 'dcp.traffic@nashikpolice.gov.in',
        phone: '+91 253 230 5233',
        badge: 'Traffic Police Authority',
        empCode: 'IPS-MH-TRF-0881',
        cadre: 'IPS / State Police Cadre',
        jurisdiction: 'City Traffic Corridors',
        icon: ShieldAlert,
        color: '#DC2626',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        initials: 'SP',
      },
    ],
  },
  {
    id: 'municipal_leadership',
    name: 'Municipal Leadership & Apex Authorities',
    shortLabel: 'Municipal Leadership',
    headline: 'Select Municipal Leadership Official',
    subheadline: 'Choose which city executive is logging in for statutory Section 313 sanctions, policy oversight, or nodal management.',
    themeColor: '#D97706',
    icon: Building2,
    officials: [
      {
        id: 'usr-nsk-01',
        name: 'Dr. Pravin Gedam (IAS)',
        designation: 'Municipal Commissioner & CEO',
        department: 'Smart City & Urban Planning',
        role: 'COMMISSIONER',
        email: 'commissioner@bbmp.gov.in',
        phone: '+91 253 257 5631',
        badge: 'Apex Executive Authority',
        empCode: 'IAS-MH-2002-HQ',
        cadre: 'Indian Administrative Service (IAS)',
        jurisdiction: 'Citywide Municipal Corporation',
        icon: Building2,
        color: '#D97706',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        initials: 'PG',
      },
      {
        id: 'usr-nsk-01b',
        name: 'Shri. Pradeep Choudhary',
        designation: 'Additional Municipal Commissioner',
        department: 'Smart City & Urban Planning',
        role: 'COMMISSIONER',
        email: 'addl.commissioner@nmc.gov.in',
        phone: '+91 253 257 8890',
        badge: 'Additional Commissioner',
        empCode: 'NMC-ADM-HQ-0104',
        cadre: 'State Civil Services (Selection Grade)',
        jurisdiction: 'City Infrastructure & Kumbh 2027',
        icon: Building2,
        color: '#B45309',
        bgColor: 'bg-amber-50/70',
        borderColor: 'border-amber-200',
        initials: 'PC',
      },
      {
        id: 'usr-nsk-02',
        name: 'Er. Rajesh Kulkarni',
        designation: 'Chief City Infrastructure Nodal Officer',
        department: 'Smart City & Urban Planning',
        role: 'NODAL_OFFICER',
        email: 'nodal.officer@nmc.gov.in',
        phone: '+91 98220 44812',
        badge: 'Nodal Coordination Cell',
        empCode: 'NMC-NODAL-DIR-002',
        cadre: 'Chief Engineer Cadre (MES)',
        jurisdiction: 'Inter-Agency Coordination Hub',
        icon: ShieldCheck,
        color: '#2563EB',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        initials: 'RK',
      },
    ],
  },
  {
    id: 'quality_inspectors',
    name: 'Quality & Safety QC Inspectors',
    shortLabel: 'QC Inspectors',
    headline: 'Select Quality & Safety Field Inspector',
    subheadline: 'Choose which inspection official is conducting on-site compaction audits, barricade checks, or photo verification.',
    themeColor: '#EA580C',
    icon: ShieldCheck,
    officials: [
      {
        id: 'usr-nsk-05',
        name: 'Er. Mahesh Patil',
        designation: 'Senior Quality & Safety Inspector',
        department: 'Roads / PWD',
        role: 'INSPECTOR',
        email: 'inspector.qc@bbmp.gov.in',
        phone: '+91 97631 88920',
        badge: 'Proctor Compaction Lead',
        empCode: 'NMC-QC-INSP-7719',
        cadre: 'Quality Assurance Directorate',
        jurisdiction: 'West Zone & Kumbh Corridors',
        icon: ShieldCheck,
        color: '#EA580C',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        initials: 'MP',
      },
      {
        id: 'usr-nsk-05b',
        name: 'Er. Kavita Jadhav',
        designation: 'Ward Safety & Barricade Auditor',
        department: 'Roads / PWD',
        role: 'INSPECTOR',
        email: 'safety.auditor@nmc.gov.in',
        phone: '+91 98902 44109',
        badge: 'Barricade Safety Auditor',
        empCode: 'NMC-SAF-AUD-8820',
        cadre: 'Field Enforcement Wing',
        jurisdiction: 'CIDCO & Satpur Industrial Zones',
        icon: ShieldAlert,
        color: '#C2410C',
        bgColor: 'bg-orange-50/70',
        borderColor: 'border-orange-200',
        initials: 'KJ',
      },
    ],
  },
  {
    id: 'contractors',
    name: 'Class-A Registered Infrastructure Contractors',
    shortLabel: 'Contractors',
    headline: 'Select Registered Contracting Agency',
    subheadline: 'Choose your contracting firm to manage active work permits, submit daily labor progress, and request final handover.',
    themeColor: '#475569',
    icon: HardHat,
    officials: [
      {
        id: 'usr-nsk-06',
        name: 'Er. Nilesh Bafna',
        designation: 'Project Director',
        department: 'Independent Contractor',
        role: 'CONTRACTOR',
        email: 'contractor.infra@buildcon.in',
        phone: '+91 98230 55109',
        badge: 'Ashoka Buildcon Ltd.',
        empCode: 'CTR-ASHOKA-DIR-01',
        cadre: 'Class-A Registered EPC Lead',
        jurisdiction: 'NH-60 & Dwarka Corridor',
        icon: HardHat,
        color: '#334155',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-300',
        initials: 'NB',
      },
      {
        id: 'usr-nsk-06b',
        name: 'Er. Sunil Mahajan',
        designation: 'Senior Project Manager',
        department: 'Independent Contractor',
        role: 'CONTRACTOR',
        email: 'project.head@larsentoubro.com',
        phone: '+91 98221 44550',
        badge: 'L&T Infrastructure Ltd.',
        empCode: 'CTR-LT-INFRA-4402',
        cadre: 'Class-A Special Category Lead',
        jurisdiction: 'Kumbh Mela Outer Ring Road',
        icon: HardHat,
        color: '#1E293B',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-300',
        initials: 'SM',
      },
      {
        id: 'usr-nsk-06c',
        name: 'Er. Anand Deshmukh',
        designation: 'Executive Director',
        department: 'Independent Contractor',
        role: 'CONTRACTOR',
        email: 'director@eagleinfra.in',
        phone: '+91 98501 33209',
        badge: 'Eagle Infra India Ltd.',
        empCode: 'CTR-EAGLE-EXEC-109',
        cadre: 'Class-A Pipeline Specialist',
        jurisdiction: 'Gangapur Road Pipeline Works',
        icon: HardHat,
        color: '#475569',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-300',
        initials: 'AD',
      },
    ],
  },
  {
    id: 'citizens',
    name: 'Citizen Volunteers & Road Safety Forum',
    shortLabel: 'Citizen Forum',
    headline: 'Select Citizen Representation Profile',
    subheadline: 'Choose a resident profile to lodge road excavation grievances, track active QR permits, or review Mayor directives.',
    themeColor: '#059669',
    icon: Users,
    officials: [
      {
        id: 'usr-nsk-07',
        name: 'Adv. Swati Deshmukh',
        designation: 'President, Citizen Safety Forum',
        department: 'General Public',
        role: 'CITIZEN',
        email: 'citizen.volunteer@gmail.com',
        phone: '+91 98901 22345',
        badge: 'Citizen Safety Forum Lead',
        empCode: 'CTZ-NSK-FORUM-01',
        cadre: 'Civil Society Representative',
        jurisdiction: 'Citywide Grievance Redressal',
        icon: Users,
        color: '#059669',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        initials: 'SD',
      },
      {
        id: 'usr-nsk-07b',
        name: 'Rohit Kadam',
        designation: 'Resident Volunteer (Ward 4)',
        department: 'General Public',
        role: 'CITIZEN',
        email: 'rohit.kadam@outlook.com',
        phone: '+91 98224 99102',
        badge: 'Ward Resident Volunteer',
        empCode: 'CTZ-NSK-WRD4-88',
        cadre: 'Public Civic Volunteer',
        jurisdiction: 'Ward 4 - College Road',
        icon: Users,
        color: '#10B981',
        bgColor: 'bg-emerald-50/70',
        borderColor: 'border-emerald-200',
        initials: 'RK',
      },
    ],
  },
];

function getDepartmentStyling(department: string = '', role: string = '') {
  if (role === 'CONTRACTOR' || department === 'Independent Contractor') {
    return {
      icon: HardHat,
      color: '#334155',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-300',
      badge: 'Registered EPC Contractor',
    };
  }
  if (role === 'CITIZEN' || department === 'General Public') {
    return {
      icon: Users,
      color: '#059669',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      badge: 'Citizen Safety Representative',
    };
  }
  if (role === 'INSPECTOR') {
    return {
      icon: ShieldCheck,
      color: '#EA580C',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      badge: 'Quality & Safety Wing',
    };
  }
  if (role === 'COMMISSIONER') {
    return {
      icon: Building2,
      color: '#D97706',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      badge: 'Apex Municipal Leadership',
    };
  }
  if (role === 'NODAL_OFFICER' || role === 'ADMIN') {
    return {
      icon: ShieldCheck,
      color: '#2563EB',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      badge: 'Nodal Coordination Cell',
    };
  }
  if (department.includes('Gas')) {
    return {
      icon: Flame,
      color: '#D97706',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      badge: 'MNGL Gas Infrastructure',
    };
  }
  if (department.includes('Electric') || department.includes('Power')) {
    return {
      icon: Zap,
      color: '#CA8A04',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      badge: 'MSEDCL Power Distribution',
    };
  }
  if (department.includes('Road') || department.includes('PWD')) {
    return {
      icon: Route,
      color: '#475569',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-300',
      badge: 'Public Works (PWD)',
    };
  }
  if (department.includes('Telecom') || department.includes('Digital')) {
    return {
      icon: Radio,
      color: '#7C3AED',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      badge: 'BharatNet / Smart City',
    };
  }
  if (department.includes('Drain')) {
    return {
      icon: Waves,
      color: '#0D9488',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      badge: 'Stormwater & Drainage',
    };
  }
  if (department.includes('Traffic') || department.includes('Police')) {
    return {
      icon: ShieldAlert,
      color: '#DC2626',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      badge: 'Traffic Police Authority',
    };
  }
  return {
    icon: Droplet,
    color: '#0284C7',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    badge: department || 'Municipal Department',
  };
}

export function buildDynamicAuthorityTiers(allUsers: User[]): AuthorityTier[] {
  const mapUserToProfile = (u: User): OfficialPersonProfile => {
    const style = getDepartmentStyling(u.department, u.role);
    const initials = (u.name || 'OF')
      .split(' ')
      .filter((w) => !['Er.', 'Dr.', 'Shri.', 'Adv.', 'DCP'].includes(w))
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'OF';

    return {
      id: u.id,
      name: u.name,
      designation: u.designation || 'Authorized Personnel',
      department: (u.department as any) || 'Administration',
      role: u.role,
      email: u.email,
      phone: u.phone || '+91 98000 00000',
      badge: style.badge,
      empCode: u.empCode || u.id,
      cadre: u.cadre || (u.role === 'CONTRACTOR' ? 'Class-A Registered EPC Lead' : 'Gazetted Civil Services Cadre'),
      jurisdiction: u.jurisdiction || 'Citywide',
      icon: style.icon,
      color: style.color,
      bgColor: style.bgColor,
      borderColor: style.borderColor,
      initials,
    };
  };

  const eeUsers = allUsers.filter(
    (u) =>
      u.role === 'EXECUTIVE_ENGINEER' ||
      u.role === 'DEPT_HEAD' ||
      (u.department !== 'Independent Contractor' &&
        u.department !== 'General Public' &&
        u.role !== 'COMMISSIONER' &&
        u.role !== 'NODAL_OFFICER' &&
        u.role !== 'ADMIN' &&
        u.role !== 'INSPECTOR' &&
        u.role !== 'CITIZEN')
  );

  const leadershipUsers = allUsers.filter(
    (u) => u.role === 'COMMISSIONER' || u.role === 'NODAL_OFFICER' || u.role === 'ADMIN'
  );

  const inspectorUsers = allUsers.filter((u) => u.role === 'INSPECTOR');

  const contractorUsers = allUsers.filter(
    (u) => u.role === 'CONTRACTOR' || u.department === 'Independent Contractor'
  );

  const citizenUsers = allUsers.filter(
    (u) => u.role === 'CITIZEN' || u.department === 'General Public'
  );

  return [
    {
      id: 'municipal_leadership',
      name: 'Municipal Leadership & Apex Authorities',
      shortLabel: 'Municipal Leadership',
      headline: 'Select Municipal Leadership Official',
      subheadline: 'Choose which city executive is logging in for statutory Section 313 sanctions, policy oversight, or nodal management.',
      themeColor: '#D97706',
      icon: Building2,
      officials: leadershipUsers.length > 0 ? leadershipUsers.map(mapUserToProfile) : AUTHORITY_TIERS[0].officials,
    },
    {
      id: 'executive_engineers',
      name: 'Utility Executive Engineers',
      shortLabel: 'Executive Engineers',
      headline: 'Select Departmental Executive Engineer',
      subheadline: 'Select the designated utility engineer profile to authenticate with the NMC Municipal Gateway.',
      themeColor: '#2563EB',
      icon: Layers,
      officials: eeUsers.length > 0 ? eeUsers.map(mapUserToProfile) : AUTHORITY_TIERS[1].officials,
    },
    {
      id: 'quality_inspectors',
      name: 'Quality & Safety QC Inspectors',
      shortLabel: 'QC Inspectors',
      headline: 'Select Quality & Safety Field Inspector',
      subheadline: 'Choose which inspection official is conducting on-site compaction audits, barricade checks, or photo verification.',
      themeColor: '#EA580C',
      icon: ShieldCheck,
      officials: inspectorUsers.length > 0 ? inspectorUsers.map(mapUserToProfile) : AUTHORITY_TIERS[2].officials,
    },
    {
      id: 'contractors',
      name: 'Class-A Registered Infrastructure Contractors',
      shortLabel: 'Contractors',
      headline: 'Select Registered Contracting Agency',
      subheadline: 'Choose your contracting firm to manage active work permits, submit daily labor progress, and request final handover.',
      themeColor: '#475569',
      icon: HardHat,
      officials: contractorUsers.length > 0 ? contractorUsers.map(mapUserToProfile) : AUTHORITY_TIERS[3].officials,
    },
    {
      id: 'citizens',
      name: 'Citizen Volunteers & Road Safety Forum',
      shortLabel: 'Citizen Forum',
      headline: 'Select Citizen Representation Profile',
      subheadline: 'Choose a resident profile to lodge road excavation grievances, track active QR permits, or review Mayor directives.',
      themeColor: '#059669',
      icon: Users,
      officials: citizenUsers.length > 0 ? citizenUsers.map(mapUserToProfile) : AUTHORITY_TIERS[4].officials,
    },
  ];
}

interface AuthorityLoginPortalProps {
  onLoginSuccess: (user: any) => void;
  activeCity?: CityPortalConfig | null;
  availableCities?: CityPortalConfig[];
  onSelectCity?: (city: CityPortalConfig) => void;
  onOpenCityOnboarding?: () => void;
}

export const AuthorityLoginPortal: React.FC<AuthorityLoginPortalProps> = ({
  onLoginSuccess,
  activeCity,
  availableCities = [],
  onSelectCity,
}) => {
  const { allUsers, login } = useAuth();

  const dynamicTiers = useMemo(() => buildDynamicAuthorityTiers(allUsers), [allUsers]);

  // Navigation state: 'TIER_SELECT' | 'SPECIALTY_SELECT' | 'SIGN_IN_FORM' | 'OTP_VERIFY'
  const [currentScreen, setCurrentScreen] = useState<'TIER_SELECT' | 'SPECIALTY_SELECT' | 'SIGN_IN_FORM' | 'OTP_VERIFY'>('TIER_SELECT');

  // Selected Tier ID (default: 'municipal_leadership')
  const [selectedTierId, setSelectedTierId] = useState<string>('municipal_leadership');

  const selectedTier = useMemo(() => {
    return dynamicTiers.find((t) => t.id === selectedTierId) || dynamicTiers[0];
  }, [dynamicTiers, selectedTierId]);

  // Selected Official Person
  const [selectedOfficial, setSelectedOfficial] = useState<OfficialPersonProfile>(() => {
    return dynamicTiers[0]?.officials[0] || AUTHORITY_TIERS[0].officials[0];
  });

  // Form Fields
  const [password, setPassword] = useState('GovPortal@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('7482');
  const [otpValue, setOtpValue] = useState('842915');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  // Refresh 4-digit captcha
  const refreshCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  // 1. User selects a tier from Screen 1 (e.g. Executive Engineers)
  const handleSelectTier = (tier: AuthorityTier) => {
    setSelectedTierId(tier.id);
    setCurrentScreen('SPECIALTY_SELECT');
  };

  // 2. User selects a specific engineer / official from Screen 2 (e.g. Water Engineer)
  const handleSelectOfficial = (official: OfficialPersonProfile) => {
    setSelectedOfficial(official);
    setErrorMessage('');
    refreshCaptcha();
    setCurrentScreen('SIGN_IN_FORM');
  };

  // 3. User submits Credentials -> Moves to OTP Screen
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!password.trim()) {
      setErrorMessage('Please enter your portal password.');
      return;
    }

    if (captchaInput.trim() !== captchaCode) {
      setErrorMessage('Invalid Security Captcha code. Please re-enter.');
      refreshCaptcha();
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setOtpValue('842915');
      setCurrentScreen('OTP_VERIFY');
    }, 500);
  };

  // 4. User verifies 2FA OTP -> Logged into the platform
  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (otpValue.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);

      const matchedUser = allUsers.find(
        (u) => u.id === selectedOfficial.id || u.email.toLowerCase() === selectedOfficial.email.toLowerCase()
      ) || {
        id: selectedOfficial.id,
        name: selectedOfficial.name,
        email: selectedOfficial.email,
        role: selectedOfficial.role,
        designation: selectedOfficial.designation,
        department: selectedOfficial.department,
        permissions: ['project.view', 'coordination.view', 'permit.view'],
      };

      login(matchedUser.id);
      onLoginSuccess(matchedUser);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased">
      {/* Top Civic Sovereign Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold text-base shadow-sm ring-1 ring-slate-800 shrink-0">
              <span className="tracking-tight text-base font-extrabold text-blue-400">M</span>
              <span className="tracking-tight text-xs font-bold text-white -ml-0.5">M</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900 leading-tight">
                  MR. MAYOR
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  NIC · Parichay SSO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Unified Urban Infrastructure & Excavation Authorization Gateway
              </p>
            </div>
          </div>

          {/* Active City Selector */}
          <div className="relative">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-900">
                  {activeCity?.name || 'Nashik'}
                </span>
                <span className="text-[10px] text-slate-500 ml-1 hidden md:inline">
                  ({activeCity?.state || 'Maharashtra'})
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isCityDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl p-2 z-50 space-y-1">
                <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Select Municipal Portal
                </div>
                {availableCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      if (onSelectCity) onSelectCity(city);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      activeCity?.id === city.id
                        ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{city.name}</div>
                      <div className="text-[10px] text-slate-500">{city.state}</div>
                    </div>
                    {activeCity?.id === city.id && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Interactive Screen Router */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col justify-center">
        
        {/* ========================================================================= */}
        {/* SCREEN 1: PRIMARY AUTHORITY TIER SELECTOR */}
        {/* ========================================================================= */}
        {currentScreen === 'TIER_SELECT' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Unified Municipal Authentication Gateway</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Who is accessing MR. MAYOR today?
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Select your authority level below to proceed to department selection and sign-in.
              </p>
            </div>

            {/* 5 Main Authority Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {dynamicTiers.map((tier) => {
                const Icon = tier.icon;
                return (
                  <div
                    key={tier.id}
                    onClick={() => handleSelectTier(tier)}
                    className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5"
                      style={{ backgroundColor: tier.themeColor }}
                    />

                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6" style={{ color: tier.themeColor }} />
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {tier.name}
                        </h3>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {tier.officials.length} Specific Profiles Available
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {tier.subheadline}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <span>Select Official Identity</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2: DEDICATED SPECIALTY & ENGINEER SUB-SELECTION PAGE */}
        {/* WITH AUTHENTIC PROFILE PHOTO BLUEPRINT BADGES (NO MARKETING BULLETS) */}
        {/* ========================================================================= */}
        {currentScreen === 'SPECIALTY_SELECT' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Navigation Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <button
                  onClick={() => setCurrentScreen('TIER_SELECT')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Authority Levels</span>
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {selectedTier.headline}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {selectedTier.subheadline}
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold shrink-0">
                {selectedTier.officials.length} Official ID Badges
              </div>
            </div>

            {/* Grid of Specialized Engineers with Authentic ID Blueprint Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {selectedTier.officials.map((official) => {
                return (
                  <div
                    key={official.id}
                    onClick={() => handleSelectOfficial(official)}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-blue-500 p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                  >
                    {/* Top Gov ID Card Header Strip */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5"
                      style={{ backgroundColor: official.color }}
                    />

                    <div className="space-y-3.5 pt-1">
                      {/* Department Emblem & Security Tag */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${official.bgColor} ${official.borderColor} text-slate-800 tracking-tight`}>
                          {official.badge}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 font-semibold tracking-wider">
                          GOVT OF MAHARASHTRA
                        </span>
                      </div>

                      {/* AUTHENTIC PROFILE PHOTO BLUEPRINT FRAME */}
                      <div className="flex items-center gap-3.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                        {/* Circular Officer Avatar from User Reference */}
                        <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 shadow-sm border-2 border-white ring-2 ring-blue-500/20 bg-blue-600">
                          <img
                            src="/officer_profile.png"
                            alt={official.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // fallback to SVG if image fails to load
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Officer Official Service Blueprint Details */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="font-bold text-sm text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                            {official.name}
                          </div>
                          <div className="text-xs font-semibold text-slate-700 leading-tight">
                            {official.designation}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 pt-0.5">
                            ID: <strong className="text-slate-800 font-semibold">{official.empCode}</strong>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Cadre: <strong className="text-slate-700 font-medium">{official.cadre}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Official Service Metadata Footer Bar */}
                      <div className="px-2.5 py-1.5 rounded-lg bg-slate-100/70 border border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="truncate">Jurisdiction: <strong className="text-slate-700">{official.jurisdiction}</strong></span>
                        <span className="font-mono text-emerald-700 font-bold flex items-center gap-1 shrink-0 ml-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active Token
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-3.5 mt-2">
                      <button
                        type="button"
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 group-hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Authenticate & Sign In</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 3: HIGH-SECURITY OFFICIAL SIGN-IN FORM */}
        {/* ========================================================================= */}
        {currentScreen === 'SIGN_IN_FORM' && (
          <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
            {/* Top Back Nav */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setCurrentScreen('SPECIALTY_SELECT')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Officer Profile</span>
              </button>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Step 2 of 3: Credentials
              </span>
            </div>

            {/* Profile Blueprint Badge in Sign-in Form */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 shadow-sm border-2 border-white ring-2 ring-blue-500/30 bg-blue-600">
                <img
                  src="/officer_profile.png"
                  alt={selectedOfficial.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 truncate">
                    {selectedOfficial.name}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-blue-100 text-blue-800">
                    {selectedOfficial.badge}
                  </span>
                </div>
                <div className="text-xs text-slate-600 truncate mt-0.5">
                  {selectedOfficial.designation}
                </div>
                <div className="text-[11px] font-mono text-slate-400 truncate">
                  Code: {selectedOfficial.empCode}
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs">
              {/* Official Email / ID */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Official Email ID / Government Employee Code
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    readOnly
                    value={selectedOfficial.email}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-700 font-mono font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold">
                    Portal Password (Pre-filled for Demo)
                  </label>
                  <span className="text-[10px] text-slate-400">Default: GovPortal@2026</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Security Captcha */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Security Captcha Verification
                </label>
                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-900 text-amber-400 font-mono font-bold tracking-widest text-sm select-none border border-slate-700 shadow-2xs">
                    {captchaCode}
                  </div>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 cursor-pointer"
                    title="Generate new Captcha"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Enter 4-digit code"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 mt-3"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Authority Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to 2FA as {selectedOfficial.name.split(' ')[0]}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 text-[11px] text-slate-400 border-t border-slate-100">
              National Informatics Centre (NIC) · Secured via SHA-256 Multi-Factor Token
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 4: TWO-FACTOR (2FA) OTP VERIFICATION */}
        {/* ========================================================================= */}
        {currentScreen === 'OTP_VERIFY' && (
          <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div className="text-center space-y-1.5 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Two-Factor Security Verification
              </h2>
              <p className="text-xs text-slate-500">
                Enter the 6-digit authorization token sent to your registered mobile
              </p>
            </div>

            {/* Officer Details Capsule */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Official Profile:</span>
                <span className="font-bold text-slate-900">{selectedOfficial.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-800">{selectedOfficial.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registered Phone:</span>
                <span className="font-mono text-slate-800">{selectedOfficial.phone}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleOtpVerify} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  6-Digit OTP Security Code (Pre-filled for Demo)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    placeholder="842915"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Code expires in <strong className="text-slate-800 font-mono">01:48</strong></span>
                <button
                  type="button"
                  onClick={() => setOtpValue('842915')}
                  className="font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Resend Code
                </button>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Security Token...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize & Access Dashboard</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setCurrentScreen('SIGN_IN_FORM')}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Credentials</span>
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
};
