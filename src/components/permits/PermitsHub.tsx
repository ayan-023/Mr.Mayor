/**
 * MR. MAYOR - Digital Permits (ROP) Hub & GPS Geofence Validator (Editorial Aesthetic)
 */

import React, { useState } from 'react';
import {
  FileBadge,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Printer,
  Compass,
  Building2,
} from 'lucide-react';
import { RoadOpeningPermit } from '../../types';
import { api } from '../../services/api';

interface PermitsHubProps {
  permits: RoadOpeningPermit[];
  onRefreshData: () => void;
}

export const PermitsHub: React.FC<PermitsHubProps> = ({ permits, onRefreshData }) => {
  const [selectedPermit, setSelectedPermit] = useState<RoadOpeningPermit | null>(permits[0] || null);
  const [testLat, setTestLat] = useState(20.0035);
  const [testLng, setTestLng] = useState(73.7845);
  const [geoValidationResult, setGeoValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidateGps = async () => {
    if (!selectedPermit) return;
    setIsValidating(true);
    try {
      const res = await api.validatePermitGps(selectedPermit.id, {
        lat: Number(testLat),
        lng: Number(testLng),
      });
      setGeoValidationResult(res);
    } catch (err: any) {
      alert(err.message || 'Geofence check failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-2xl p-6 md:p-8 shadow-2xs flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8A8A8A] mb-1">
            STATUTORY SANCTIONS & LICENSES
          </div>
          <h1 className="text-xl md:text-2xl font-serif-editorial font-bold text-[#1A1A1A] flex items-center gap-2">
            Digital Road Opening Permits (ROP)
          </h1>
          <p className="text-xs text-[#5A5A5A] mt-1">
            QR-authenticated municipal excavation authorization with GPS geofence locking
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#EEF5F0] text-[#2E6B4F] border border-[#2E6B4F]/30 text-[10px] uppercase tracking-wider font-bold font-mono">
          {permits.length} Active Digital Permits
        </span>
      </div>

      {/* Main Layout */}
      {permits.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-2xl p-12 text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#EEF5F0] text-[#2E6B4F] flex items-center justify-center mx-auto border border-[#2E6B4F]/20">
            <FileBadge className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-serif-editorial font-bold text-xl text-[#1A1A1A]">
              No Road Opening Permits Issued
            </h3>
            <p className="text-xs text-[#737373] leading-relaxed">
              Once an excavation project receives all required departmental clearances (Ward, Traffic Police DCP, and Commissioner), official QR-coded Road Opening Permits (ROP) will be generated here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Permits List */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.18em]">
              Issued Permits Registry
            </h3>

            <div className="space-y-3">
              {permits.map((permit) => {
                const isSelected = permit.id === selectedPermit?.id;
                return (
                  <div
                    key={permit.id}
                    onClick={() => {
                      setSelectedPermit(permit);
                      setGeoValidationResult(null);
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-[#FFFFFF] border-[#1A1A1A] shadow-sm ring-1 ring-[#1A1A1A]'
                        : 'bg-[#FDFCFB] border-[#1A1A1A]/10 hover:bg-[#FFFFFF]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-[#737373] font-bold">
                          {permit.permitNumber}
                        </span>
                        <h4 className="font-serif-editorial font-bold text-[#1A1A1A] text-sm mt-0.5">{permit.projectName}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#EEF5F0] text-[#2E6B4F] border border-[#2E6B4F]/30">
                        {permit.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#737373]">
                      Holder: <span className="text-[#1A1A1A] font-medium">{permit.contractorName}</span>
                    </p>

                    <div className="text-[10px] text-[#8A8A8A] pt-2 border-t border-[#1A1A1A]/5 flex justify-between font-mono">
                      <span>Valid: {permit.validFrom} → {permit.validTo}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (2 cols): Printable Official Permit & Geofence Validator */}
          {selectedPermit && (
            <div className="lg:col-span-2 space-y-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#737373]">Official Municipal Certificate</span>
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F0EEEB] text-[#1A1A1A] border border-[#1A1A1A]/20 text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </button>
            </div>

            {/* Official Municipal Road Opening Permit Certificate */}
            <div className="bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-2xl p-6 md:p-8 shadow-2xs space-y-6 relative overflow-hidden">
              {/* Certificate Header */}
              <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] text-[#FDFCFB] flex items-center justify-center border border-[#1A1A1A]">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8A8A8A]">
                      MUNICIPAL CORPORATION INFRASTRUCTURE DIVISION
                    </span>
                    <h2 className="text-lg md:text-xl font-serif-editorial font-bold text-[#1A1A1A]">
                      DIGITAL ROAD OPENING PERMIT (ROP)
                    </h2>
                    <p className="text-[11px] text-[#737373]">
                      Authorized under Section 198 of the Municipal Infrastructure Protection Code
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="p-2 rounded-xl bg-[#FDFCFB] border border-[#1A1A1A]/10 inline-block">
                    <QrCode className="w-10 h-10 text-[#1A1A1A]" />
                  </div>
                  <div className="text-[8px] font-mono text-[#2E6B4F] uppercase tracking-widest font-bold mt-1">
                    VERIFIED SECURE QR
                  </div>
                </div>
              </div>

              {/* Certificate Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-[#FDFCFB] border border-[#1A1A1A]/10">
                  <span className="text-[9px] text-[#8A8A8A] uppercase tracking-wider font-bold">Permit No</span>
                  <div className="font-mono font-bold text-[#1A1A1A] mt-0.5">{selectedPermit.permitNumber}</div>
                </div>

                <div className="p-3 rounded-lg bg-[#FDFCFB] border border-[#1A1A1A]/10">
                  <span className="text-[9px] text-[#8A8A8A] uppercase tracking-wider font-bold">Approved Contractor</span>
                  <div className="font-bold text-[#1A1A1A] mt-0.5">{selectedPermit.contractorName}</div>
                </div>

                <div className="p-3 rounded-lg bg-[#FDFCFB] border border-[#1A1A1A]/10">
                  <span className="text-[9px] text-[#8A8A8A] uppercase tracking-wider font-bold">Valid Window</span>
                  <div className="font-mono font-semibold text-[#1A1A1A] mt-0.5">
                    {selectedPermit.validFrom} to {selectedPermit.validTo}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#FDFCFB] border border-[#1A1A1A]/10">
                  <span className="text-[9px] text-[#8A8A8A] uppercase tracking-wider font-bold">Security Deposit</span>
                  <div className="font-serif-editorial font-bold text-[#2E6B4F] mt-0.5 text-sm">
                    ₹{(selectedPermit.securityDepositINR / 100000).toFixed(1)} Lakhs
                  </div>
                </div>
              </div>

              {/* Specific Conditions */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider">Mandatory Permitted Working Conditions</h4>
                <ul className="list-disc list-inside text-[#5A5A5A] space-y-1 text-[11px] leading-relaxed font-serif-editorial">
                  <li>Authorized excavation window: <strong className="text-[#1A1A1A] font-sans">{selectedPermit.workingHours}</strong> daily.</li>
                  <li>Mandatory continuous reflective barricading with blinkers at 10m intervals.</li>
                  <li>Backfilling must achieve 95% Modified Proctor Density prior to bituminous resurfacing.</li>
                  <li>Post-restoration "Do Not Dig" road embargo period: <strong className="text-[#2E6B4F] font-sans">180 Days</strong>.</li>
                </ul>
              </div>

              {/* Signatures */}
              <div className="flex items-center justify-between pt-4 border-t border-[#1A1A1A]/10 text-[11px]">
                <div>
                  <div className="text-[#8A8A8A] text-[9px] uppercase tracking-wider">Issued by Authority</div>
                  <div className="font-bold text-[#1A1A1A]">{selectedPermit.issuedBy}</div>
                  <div className="text-[#737373] text-[10px]">{selectedPermit.issuedByDesignation}</div>
                </div>

                <div className="text-right">
                  <div className="text-[#8A8A8A] text-[9px] uppercase tracking-wider">Authorization Status</div>
                  <div className="text-[#2E6B4F] font-bold flex items-center gap-1 justify-end text-[10px] uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" /> DIGITALLY RATIFIED
                  </div>
                  <div className="text-[#8A8A8A] text-[10px] font-mono">{selectedPermit.issuedDate}</div>
                </div>
              </div>
            </div>

            {/* GPS GEOFENCE VALIDATION SIMULATOR */}
            <div className="bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#1A1A1A]" />
                  <h3 className="font-serif-editorial font-bold text-[#1A1A1A] text-base">
                    Live GPS Geofence Field Inspector Simulator
                  </h3>
                </div>
                <span className="text-[10px] text-[#737373]">Simulate on-site QR Scan</span>
              </div>
              <p className="text-xs text-[#5A5A5A]">
                When an enforcement officer or citizen scans the QR on site, the platform checks if the device is physically located inside the approved road corridor buffer (50m).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[#737373] text-[11px] mb-1">Simulated Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={testLat}
                    onChange={(e) => setTestLat(Number(e.target.value))}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-2.5 text-xs text-[#1A1A1A] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#737373] text-[11px] mb-1">Simulated Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={testLng}
                    onChange={(e) => setTestLng(Number(e.target.value))}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-lg p-2.5 text-xs text-[#1A1A1A] font-mono"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleValidateGps}
                    disabled={isValidating}
                    className="w-full py-2.5 rounded-lg bg-[#1A1A1A] hover:bg-[#333333] text-[#FDFCFB] font-bold text-[10px] uppercase tracking-wider shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {isValidating ? 'Validating GPS...' : 'Verify Geofence Buffer'}
                  </button>
                </div>
              </div>

              {geoValidationResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-1 mt-2 animate-fade-in ${
                    geoValidationResult.isValid
                      ? 'bg-[#EEF5F0] border-[#2E6B4F]/30 text-[#2E6B4F]'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {geoValidationResult.isValid ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#2E6B4F]" />
                        <span>GEOFENCE VALID: Excavation is strictly within the approved road corridor buffer ({Math.round(geoValidationResult.distanceToApprovedCorridorMeters)}m from centerline).</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>GEOFENCE BREACH: Current GPS is {Math.round(geoValidationResult.distanceToApprovedCorridorMeters)}m away from approved corridor. Potential illegal digging outside permitted zone!</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);
};
