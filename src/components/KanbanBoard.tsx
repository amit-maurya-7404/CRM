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
  { id: 'new', title: 'New Leads', color: 'text-blue-700', bgBadge: 'bg-blue-50 text-blue-700 border-blue-200', border: 'border-t-blue-600' },
  { id: 'contacted', title: 'Contacted', color: 'text-sky-700', bgBadge: 'bg-sky-50 text-sky-700 border-sky-200', border: 'border-t-sky-500' },
  { id: 'meeting', title: 'Meeting / Demo', color: 'text-amber-700', bgBadge: 'bg-amber-50 text-amber-700 border-amber-200', border: 'border-t-amber-500' },
  { id: 'proposal', title: 'Proposal Sent', color: 'text-purple-700', bgBadge: 'bg-purple-50 text-purple-700 border-purple-200', border: 'border-t-purple-500' },
  { id: 'won', title: 'Won Deals 🏆', color: 'text-emerald-700', bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200', border: 'border-t-emerald-600' },
  { id: 'lost', title: 'Lost / Inactive', color: 'text-rose-700', bgBadge: 'bg-rose-50 text-rose-700 border-rose-200', border: 'border-t-rose-400' },
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
        colors: ['#2563EB', '#10B981', '#F59E0B', '#3B82F6'],
      });
    }

    setMovingLeadId(lead._id);
    await onUpdateLeadStage(lead._id, newStage);
    setMovingLeadId(null);
  };

  const priorityBadge = (priority: Lead['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">Urgent</span>;
      case 'high':
        return <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">High</span>;
      case 'medium':
        return <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-200">Medium</span>;
      default:
        return <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">Low</span>;
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
            className={`flex w-72 sm:w-80 shrink-0 flex-col rounded-2xl border border-slate-200 bg-slate-100/70 shadow-sm border-t-4 ${stage.border}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-slate-200/80 p-3.5 bg-white/70 rounded-t-xl">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${stage.color}`}>
                  {stage.title}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold border ${stage.bgBadge}`}>
                  {stageLeads.length}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-700">
                  {formatCurrency(stageTotalValue, currencySymbol)}
                </span>
              </div>
            </div>

            {/* Cards List */}
            <div className="flex-1 space-y-3 overflow-y-auto p-3 max-h-[calc(100vh-210px)] min-h-[400px]">
              {stageLeads.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 text-center p-4">
                  <p className="text-xs text-slate-400 font-medium">No leads in this stage</p>
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
                      className={`group relative rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:border-blue-400 hover:shadow-md cursor-pointer ${
                        isMoving ? 'opacity-50 scale-95 pointer-events-none' : ''
                      }`}
                    >
                      {/* Priority & Lead Value */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {priorityBadge(lead.priority)}
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {formatCurrency(lead.value, currencySymbol)}
                        </span>
                      </div>

                      {/* Lead Name & Company */}
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {lead.name}
                        </h4>
                        {lead.company && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Building className="h-3 w-3" />
                            <span className="truncate">{lead.company}</span>
                          </div>
                        )}
                      </div>

                      {/* Custom Field Badge if present */}
                      {firstCustomFieldVal && (
                        <div className="mt-2.5 inline-flex items-center gap-1 rounded bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-700 border border-slate-200 max-w-full truncate">
                          <span className="text-blue-600 font-semibold">{currentOrg?.customFields?.[0]?.label}:</span>
                          <span className="truncate">{firstCustomFieldVal}</span>
                        </div>
                      )}

                      {/* Follow-up reminder if present */}
                      {lead.nextFollowUp && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                          <Clock className="h-3 w-3 shrink-0 text-amber-600" />
                          <span>Follow-up: {formatDate(lead.nextFollowUp)}</span>
                        </div>
                      )}

                      {/* Action Bar (WhatsApp, Call, Stage Advance) */}
                      <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5">
                        <div className="flex items-center gap-1.5">
                          {/* 1-Click WhatsApp */}
                          <button
                            title="Chat on WhatsApp"
                            onClick={(e) => onOpenWhatsApp(lead, e)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-200"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </button>

                          {/* 1-Click Phone Call */}
                          <a
                            href={`tel:${lead.phone}`}
                            title={`Call ${lead.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all border border-blue-200"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                        </div>

                        {/* Quick Stage Mover */}
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.stage}
                            onChange={(e) => handleStageChange(lead, e.target.value as LeadStage, e as any)}
                            className="h-6 rounded-md border border-slate-200 bg-slate-50 px-1.5 text-[10px] font-medium text-slate-700 focus:border-blue-600 focus:outline-none"
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
