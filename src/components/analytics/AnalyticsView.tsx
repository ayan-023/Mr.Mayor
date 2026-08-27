/**
 * MR. MAYOR - City Analytics & Savings Charts
 * Data Truthfulness: Explicit Separation between Verified Outcomes and Modelled Projections.
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { CityAnalyticsSummary } from '../../types';
import { ShieldCheck, Info } from 'lucide-react';

interface AnalyticsViewProps {
  analytics: CityAnalyticsSummary;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics }) => {
  const deptData = (analytics.departmentPerformance || []).map((d) => ({
    name: (d.department || '').replace('Department', '').replace('Electricity (DISCOM)', 'DISCOM').trim(),
    Coordinated: d.coordinatedProjects || 0,
    Total: d.totalProjects || 0,
    Score: d.complianceScore || 0,
  }));

  const verifiedSavings = analytics.verifiedSavingsINR || 0;
  const projectedSavings = analytics.projectedSavingsINR || 0;
  const verifiedAvoided = analytics.verifiedExcavationsAvoided || 0;
  const projectedAvoided = analytics.projectedExcavationsAvoided || 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Provenance */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
            STATISTICAL COMPENDIUM & FISCAL IMPACT
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            City Infrastructure Analytics & Financial Impact
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Separating verified completed municipal outcomes from forward-looking AI modelled projections.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span className="font-medium">Data Model: Verified vs Projected</span>
        </div>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Verified Savings</span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              Actual
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {verifiedSavings > 0 ? `₹${(verifiedSavings / 10000000).toFixed(2)} Cr` : '₹0'}
          </div>
          <div className="text-[11px] text-slate-500">
            {verifiedSavings > 0 ? 'Direct verified budget saved' : 'No verified savings recorded yet'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Projected Savings</span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
              Modelled
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            ₹{(projectedSavings / 100000).toFixed(1)} L
          </div>
          <div className="text-[11px] text-slate-500">Potential multi-agency savings</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Avoided Digs (Modelled)</span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase">
              Estimate
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {projectedAvoided} Cuts
          </div>
          <div className="text-[11px] text-slate-500">Potential duplicate cuts avoidable</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Traffic Disruption</span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 uppercase">
              Simulated
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-700">
            -{analytics.trafficDisruptionReductionPct}%
          </div>
          <div className="text-[11px] text-slate-500">Modelled commuter delay drop</div>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Compliance Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Projects Coordinated vs Total by Agency
            </h3>
            <p className="text-xs text-slate-500">Real counts from active municipal database records</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} angle={-15} textAnchor="end" />
                <YAxis stroke="#94A3B8" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '11px', color: '#0F172A' }}
                />
                <Bar dataKey="Total" fill="#CBD5E1" radius={[4, 4, 0, 0]} name="Total Projects" />
                <Bar dataKey="Coordinated" fill="#2563EB" radius={[4, 4, 0, 0]} name="Coordinated" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Provenance & Methodology Explainer */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Data Integrity & Calculation Methodology
            </h3>
            <p className="text-xs text-slate-500">Government audit and verification lifecycle</p>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block">1. Verified Actual Savings (₹0 baseline)</strong>
              <p className="text-[11px] leading-relaxed">
                Savings are only converted to "Verified Actual" after joint trenching has been physically executed on-site, inspected by QC engineers, and verified against separate contractor bill of quantities.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block">2. Modelled Impact Estimates</strong>
              <p className="text-[11px] leading-relaxed">
                Potential savings and avoided road cuts reflect AI corridor analyses based on scheduled overlapping agency proposals on Gangapur Road and College Road.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
