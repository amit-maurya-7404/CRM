'use client';

import React, { useState } from 'react';
import { Lead, LeadStage, LeadPriority, LeadSource } from '@/types';
import { useTenant } from '@/context/TenantContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Download,
  Filter,
  Phone,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Edit2,
  Building,
  User,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onEditLead: (lead: Lead, e: React.MouseEvent) => void;
  onDeleteLead: (leadId: string, e: React.MouseEvent) => Promise<void>;
  onOpenWhatsApp: (lead: Lead, e: React.MouseEvent) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  onSelectLead,
  onEditLead,
  onDeleteLead,
  onOpenWhatsApp,
}) => {
  const { currentOrg, currencySymbol } = useTenant();
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredLeads = leads.filter((l) => {
    if (stageFilter !== 'all' && l.stage !== stageFilter) return false;
    if (priorityFilter !== 'all' && l.priority !== priorityFilter) return false;
    return true;
  });

  const exportToCSV = () => {
    if (filteredLeads.length === 0) return;

    const headers = [
      'Name',
      'Phone',
      'Email',
      'Company',
      'Stage',
      'Value',
      'Priority',
      'Source',
      ...(currentOrg?.customFields?.map((f) => f.label) || []),
      'Next Follow-Up',
      'Created Date',
    ];

    const rows = filteredLeads.map((l) => {
      const customFieldValues = (currentOrg?.customFields || []).map(
        (f) => `"${(l.customFields?.[f.key] ?? '').toString().replace(/"/g, '""')}"`
      );

      return [
        `"${l.name}"`,
        `"${l.phone}"`,
        `"${l.email || ''}"`,
        `"${l.company || ''}"`,
        `"${l.stage}"`,
        l.value || 0,
        `"${l.priority}"`,
        `"${l.source}"`,
        ...customFieldValues,
        `"${l.nextFollowUp ? formatDate(l.nextFollowUp) : ''}"`,
        `"${formatDate(l.createdAt)}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentOrg?.slug || 'crm'}_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStageBadge = (stage: LeadStage) => {
    switch (stage) {
      case 'won':
        return <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">Won Deal 🏆</span>;
      case 'proposal':
        return <span className="rounded-full bg-purple-500/15 px-2.5 py-0.5 text-xs font-semibold text-purple-400 border border-purple-500/30">Proposal</span>;
      case 'meeting':
        return <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/30">Meeting</span>;
      case 'contacted':
        return <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-semibold text-sky-400 border border-sky-500/30">Contacted</span>;
      case 'lost':
        return <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/30">Lost</span>;
      default:
        return <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/30">New Lead</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Filter className="h-3.5 w-3.5 text-indigo-400" />
            <span>Filters:</span>
          </div>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Stages</option>
            <option value="new">New Lead</option>
            <option value="contacted">Contacted</option>
            <option value="meeting">Meeting / Demo</option>
            <option value="proposal">Proposal Sent</option>
            <option value="won">Won Deals</option>
            <option value="lost">Lost</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={exportToCSV}
          disabled={filteredLeads.length === 0}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5 text-indigo-400" />
          <span>Export CSV ({filteredLeads.length})</span>
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Lead Contact</th>
                <th className="px-4 py-3 font-semibold">Stage</th>
                <th className="px-4 py-3 font-semibold">Deal Value</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                {/* Dynamically rendered custom columns */}
                {(currentOrg?.customFields || []).slice(0, 2).map((field) => (
                  <th key={field.id} className="px-4 py-3 font-semibold text-indigo-300">
                    {field.label}
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold">Follow-Up</th>
                <th className="px-4 py-3 font-semibold text-right">Instant Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7 + (currentOrg?.customFields?.length ? 2 : 0)} className="px-4 py-12 text-center text-slate-500">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead._id}
                    onClick={() => onSelectLead(lead)}
                    className="group transition-colors hover:bg-slate-800/50 cursor-pointer"
                  >
                    {/* Name & Phone */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {lead.name}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{lead.phone}</span>
                        {lead.company && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[120px]">{lead.company}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Stage */}
                    <td className="px-4 py-3.5">{getStageBadge(lead.stage)}</td>

                    {/* Deal Value */}
                    <td className="px-4 py-3.5 font-bold text-emerald-400">
                      {formatCurrency(lead.value, currencySymbol)}
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3.5 capitalize font-medium">
                      {lead.priority === 'urgent' && <span className="text-rose-400 font-bold">Urgent</span>}
                      {lead.priority === 'high' && <span className="text-amber-400 font-semibold">High</span>}
                      {lead.priority === 'medium' && <span className="text-indigo-400">Medium</span>}
                      {lead.priority === 'low' && <span className="text-slate-400">Low</span>}
                    </td>

                    {/* Dynamic Custom Fields */}
                    {(currentOrg?.customFields || []).slice(0, 2).map((field) => (
                      <td key={field.id} className="px-4 py-3.5 text-slate-300">
                        {lead.customFields?.[field.key] ? (
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] border border-slate-700/60 font-medium">
                            {lead.customFields[field.key]}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    ))}

                    {/* Next Follow Up */}
                    <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                      {lead.nextFollowUp ? (
                        <div className="flex items-center gap-1 text-amber-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(lead.nextFollowUp)}</span>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Button */}
                        <button
                          title="Chat on WhatsApp"
                          onClick={(e) => onOpenWhatsApp(lead, e)}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600/15 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-500/30"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>

                        {/* Call Button */}
                        <a
                          href={`tel:${lead.phone}`}
                          title={`Call ${lead.phone}`}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-600/15 text-cyan-400 hover:bg-cyan-600 hover:text-white transition-all border border-cyan-500/30"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>

                        {/* Edit Button */}
                        <button
                          title="Edit Lead"
                          onClick={(e) => onEditLead(lead, e)}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white transition-all border border-slate-700"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          title="Delete Lead"
                          onClick={(e) => onDeleteLead(lead._id, e)}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800 text-rose-400 hover:bg-rose-600 hover:text-white transition-all border border-slate-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
