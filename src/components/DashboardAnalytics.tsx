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
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950/80 p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Pipeline Value</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-white">
              {formatCurrency(stats.totalPipelineValue, currencySymbol)}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Across {stats.totalLeads} active leads</span>
            </p>
          </div>
        </div>

        {/* Won Deals Value */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950/80 p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Won Revenue</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-400 border border-emerald-500/20">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-emerald-400">
              {formatCurrency(stats.wonDealsValue, currencySymbol)}
            </h3>
            <p className="mt-1 text-[11px] text-slate-400">
              {stats.wonDealsCount} deals closed successfully
            </p>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950/80 p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Win Conversion Rate</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600/15 text-amber-400 border border-amber-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-amber-400">{stats.conversionRate}%</h3>
            <p className="mt-1 text-[11px] text-slate-400">
              Lead to customer conversion
            </p>
          </div>
        </div>

        {/* Pending Follow-ups */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950/80 p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Scheduled Follow-ups</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600/15 text-rose-400 border border-rose-500/20">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-white">{stats.pendingFollowUpsCount}</h3>
            <p className="mt-1 text-[11px] text-rose-400">
              Calls & meetings upcoming
            </p>
          </div>
        </div>
      </div>

      {/* Stage Breakdown & Source Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pipeline Stages Breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Pipeline Stages Distribution</h3>
            <span className="text-xs text-slate-400">{stats.totalLeads} Total</span>
          </div>

          <div className="space-y-3.5">
            {stats.stageBreakdown.map((item) => {
              const percentage =
                stats.totalLeads > 0 ? Math.round((item.count / stats.totalLeads) * 100) : 0;

              return (
                <div key={item.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 capitalize">{item.stage}</span>
                    <span className="text-slate-400">
                      {item.count} leads ({formatCurrency(item.totalValue, currencySymbol)})
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
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
                          : 'bg-indigo-500'
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
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Lead Acquisition Channels</h3>
            <span className="text-xs text-slate-400">By Volume</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.sourceBreakdown.map((src) => (
              <div
                key={src.source}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-850 p-3.5"
              >
                <div>
                  <div className="font-semibold text-white capitalize text-xs">{src.source.replace('_', ' ')}</div>
                  <div className="text-[11px] text-slate-400">Acquisition Channel</div>
                </div>
                <div className="rounded-lg bg-indigo-600/15 px-2.5 py-1 font-bold text-indigo-400 border border-indigo-500/20 text-xs">
                  {src.count}
                </div>
              </div>
            ))}
          </div>

          {/* SaaS Multi-Tenant Tip */}
          <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px] text-slate-400">
              <span className="font-semibold text-indigo-300">Multi-Tenant Intelligence:</span> All metrics shown here are 100% scoped to <strong className="text-white">{currentOrg?.name}</strong>. Switching tenants instantly recalculates pipeline analytics!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
