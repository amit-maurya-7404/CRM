'use client';

import React from 'react';
import { DashboardStats, Lead } from '@/types';
import { useTenant } from '@/context/TenantContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  TrendingUp,
  DollarSign,
  Trophy,
  Users,
  Clock,
  PieChart,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  Building,
} from 'lucide-react';

interface DashboardAnalyticsProps {
  stats: DashboardStats | null;
  leads: Lead[];
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  stats,
  leads,
}) => {
  const { currentOrg, currencySymbol } = useTenant();

  if (!stats) {
    return <div className="py-12 text-center text-slate-500">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pipeline Value */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pipeline Value</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">
              {formatCurrency(stats.totalPipelineValue, currencySymbol)}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Across {stats.totalLeads} active leads</span>
            </p>
          </div>
        </div>

        {/* Won Deals Value */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Won Revenue</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-emerald-700">
              {formatCurrency(stats.wonDealsValue, currencySymbol)}
            </h3>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              {stats.wonDealsCount} deals closed successfully
            </p>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Win Conversion Rate</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-amber-700">{stats.conversionRate}%</h3>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              Lead to customer conversion
            </p>
          </div>
        </div>

        {/* Pending Follow-ups */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Scheduled Follow-ups</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">{stats.pendingFollowUpsCount}</h3>
            <p className="mt-1 text-[11px] font-semibold text-rose-700">
              Calls & meetings upcoming
            </p>
          </div>
        </div>
      </div>

      {/* Stage Breakdown & Source Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pipeline Stages Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Pipeline Stages Distribution</h3>
            <span className="text-xs font-semibold text-slate-500">{stats.totalLeads} Total Leads</span>
          </div>

          <div className="space-y-3.5">
            {stats.stageBreakdown.map((item) => {
              const percentage =
                stats.totalLeads > 0 ? Math.round((item.count / stats.totalLeads) * 100) : 0;

              return (
                <div key={item.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 capitalize">{item.stage}</span>
                    <span className="text-slate-500 font-medium">
                      {item.count} leads ({formatCurrency(item.totalValue, currencySymbol)})
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.stage === 'won'
                          ? 'bg-emerald-500'
                          : item.stage === 'proposal'
                          ? 'bg-purple-500'
                          : item.stage === 'meeting'
                          ? 'bg-amber-500'
                          : item.stage === 'contacted'
                          ? 'bg-sky-500'
                          : item.stage === 'lost'
                          ? 'bg-rose-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead Sources Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Lead Acquisition Channels</h3>
            <span className="text-xs font-semibold text-slate-500">By Volume</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.sourceBreakdown.map((src) => (
              <div
                key={src.source}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5"
              >
                <div>
                  <div className="font-bold text-slate-800 capitalize text-xs">{src.source.replace('_', ' ')}</div>
                  <div className="text-[11px] text-slate-500">Acquisition Channel</div>
                </div>
                <div className="rounded-lg bg-blue-50 px-2.5 py-1 font-bold text-blue-700 border border-blue-200 text-xs">
                  {src.count}
                </div>
              </div>
            ))}
          </div>

          {/* SaaS Multi-Tenant Tip */}
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px] text-blue-800">
              <span className="font-bold text-blue-900">Multi-Tenant Intelligence:</span> All metrics shown here are 100% scoped to <strong className="text-blue-950 font-bold">{currentOrg?.name}</strong>. Switching tenants instantly recalculates pipeline analytics!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
