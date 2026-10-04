'use client';

import React, { useState } from 'react';
import { Lead, LeadStage } from '@/types';
import { useTenant } from '@/context/TenantContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import confetti from 'canvas-confetti';
import {
  Phone,
  MessageSquare,
  Clock,
  MoreHorizontal,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Building,
  User,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface KanbanBoardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdateLeadStage: (leadId: string, newStage: LeadStage) => Promise<void>;
  onOpenWhatsApp: (lead: Lead, e: React.MouseEvent) => void;
}

const STAGES: { id: LeadStage; title: string; color: string; bgBadge: string; border: string }[] = [
  { id: 'new', title: 'New Leads', color: 'text-indigo-400', bgBadge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20', border: 'border-t-indigo-500' },
  { id: 'contacted', title: 'Contacted', color: 'text-sky-400', bgBadge: 'bg-sky-500/10 text-sky-300 border-sky-500/20', border: 'border-t-sky-500' },
  { id: 'meeting', title: 'Meeting / Demo', color: 'text-amber-400', bgBadge: 'bg-amber-500/10 text-amber-300 border-amber-500/20', border: 'border-t-amber-500' },
  { id: 'proposal', title: 'Proposal Sent', color: 'text-purple-400', bgBadge: 'bg-purple-500/10 text-purple-300 border-purple-500/20', border: 'border-t-purple-500' },
  { id: 'won', title: 'Won Deals 🏆', color: 'text-emerald-400', bgBadge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', border: 'border-t-emerald-500' },
  { id: 'lost', title: 'Lost / Inactive', color: 'text-rose-400', bgBadge: 'bg-rose-500/10 text-rose-300 border-rose-500/20', border: 'border-t-rose-500' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  onSelectLead,
  onUpdateLeadStage,
  onOpenWhatsApp,
}) => {
  const { currencySymbol, currentOrg } = useTenant();
  const [movingLeadId, setMovingLeadId] = useState<string | null>(null);

  const handleStageChange = async (lead: Lead, newStage: LeadStage, e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.stage === newStage) return;

    if (newStage === 'won') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#6366F1', '#F59E0B', '#3B82F6'],
      });
    }

    setMovingLeadId(lead._id);
    await onUpdateLeadStage(lead._id, newStage);
    setMovingLeadId(null);
  };

  const priorityBadge = (priority: Lead['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">Urgent</span>;
      case 'high':
        return <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/30">High</span>;
      case 'medium':
        return <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-medium text-indigo-400 border border-indigo-500/20">Medium</span>;
      default:
        return <span className="rounded bg-slate-700/50 px-1.5 py-0.5 text-[10px] text-slate-400">Low</span>;
    }
  };

  return (
    <div className="flex h-full w-full gap-4 overflow-x-auto pb-4 pt-1">
      {STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.stage === stage.id);
        const stageTotalValue = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);

        return (
          <div
            key={stage.id}
            className={`flex w-72 sm:w-80 shrink-0 flex-col rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg backdrop-blur-md border-t-2 ${stage.border}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 p-3.5">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${stage.color}`}>
                  {stage.title}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold border ${stage.bgBadge}`}>
                  {stageLeads.length}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-300">
                  {formatCurrency(stageTotalValue, currencySymbol)}
                </span>
              </div>
            </div>

            {/* Cards List */}
            <div className="flex-1 space-y-3 overflow-y-auto p-3 max-h-[calc(100vh-210px)] min-h-[400px]">
              {stageLeads.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-slate-800/80 text-center p-4">
                  <p className="text-xs text-slate-500">No leads in this stage</p>
                </div>
              ) : (
                stageLeads.map((lead) => {
                  const isMoving = movingLeadId === lead._id;
                  const firstCustomFieldKey = currentOrg?.customFields?.[0]?.key;
                  const firstCustomFieldVal = firstCustomFieldKey && lead.customFields?.[firstCustomFieldKey];

                  return (
                    <div
                      key={lead._id}
                      onClick={() => onSelectLead(lead)}
                      className={`group relative rounded-lg border border-slate-800 bg-slate-850/90 p-3.5 shadow-md transition-all hover:border-indigo-500/50 hover:bg-slate-800/90 hover:shadow-indigo-500/10 cursor-pointer ${
                        isMoving ? 'opacity-50 scale-95 pointer-events-none' : ''
                      }`}
                    >
                      {/* Priority & Lead Value */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {priorityBadge(lead.priority)}
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                          {formatCurrency(lead.value, currencySymbol)}
                        </span>
                      </div>

                      {/* Lead Name & Company */}
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {lead.name}
                        </h4>
                        {lead.company && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Building className="h-3 w-3" />
                            <span className="truncate">{lead.company}</span>
                          </div>
                        )}
                      </div>

                      {/* Custom Field Badge if present */}
                      {firstCustomFieldVal && (
                        <div className="mt-2.5 inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-300 border border-slate-700/60 max-w-full truncate">
                          <span className="text-indigo-400 font-semibold">{currentOrg?.customFields?.[0]?.label}:</span>
                          <span className="truncate">{firstCustomFieldVal}</span>
                        </div>
                      )}

                      {/* Follow-up reminder if present */}
                      {lead.nextFollowUp && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>Follow-up: {formatDate(lead.nextFollowUp)}</span>
                        </div>
                      )}

                      {/* Action Bar (WhatsApp, Call, Stage Advance) */}
                      <div className="mt-3.5 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
                        <div className="flex items-center gap-1.5">
                          {/* 1-Click WhatsApp */}
                          <button
                            title="Chat on WhatsApp"
                            onClick={(e) => onOpenWhatsApp(lead, e)}
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600/15 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-500/30"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </button>

                          {/* 1-Click Phone Call */}
                          <a
                            href={`tel:${lead.phone}`}
                            title={`Call ${lead.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-600/15 text-cyan-400 hover:bg-cyan-600 hover:text-white transition-all border border-cyan-500/30"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                        </div>

                        {/* Quick Stage Mover */}
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.stage}
                            onChange={(e) => handleStageChange(lead, e.target.value as LeadStage, e as any)}
                            className="h-6 rounded border border-slate-700 bg-slate-800 px-1.5 text-[10px] font-medium text-slate-300 focus:border-indigo-500 focus:outline-none"
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                Move: {s.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
