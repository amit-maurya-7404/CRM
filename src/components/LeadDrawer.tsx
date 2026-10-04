'use client';

import React, { useState, useEffect } from 'react';
import { Lead, Activity, LeadStage } from '@/types';
import { useTenant } from '@/context/TenantContext';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import confetti from 'canvas-confetti';
import {
  X,
  Phone,
  MessageSquare,
  Clock,
  Calendar,
  Building,
  User,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  PhoneCall,
  Users,
  Edit2,
  Trash2,
} from 'lucide-react';

interface LeadDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLeadStage: (leadId: string, newStage: LeadStage) => Promise<void>;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => Promise<void>;
}

export const LeadDrawer: React.FC<LeadDrawerProps> = ({
  lead,
  isOpen,
  onClose,
  onUpdateLeadStage,
  onEditLead,
  onDeleteLead,
}) => {
  const { currentOrg, currencySymbol, currentUser } = useTenant();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  // New Note state
  const [newNote, setNewNote] = useState('');
  const [activityType, setActivityType] = useState<'note' | 'call' | 'whatsapp' | 'meeting'>('note');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // WhatsApp quick template state
  const [waMessage, setWaMessage] = useState('');

  useEffect(() => {
    if (lead && isOpen) {
      fetchActivities(lead._id);
      // Generate default WhatsApp template
      let template = currentOrg?.whatsappTemplate || 'Hi {{name}}, greetings from {{company}}!';
      template = template.replace(/\{\{name\}\}/g, lead.name);
      template = template.replace(/\{\{company\}\}/g, currentOrg?.name || 'our company');
      if (lead.customFields) {
        Object.entries(lead.customFields).forEach(([k, v]) => {
          template = template.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
        });
      }
      setWaMessage(template);
    }
  }, [lead, isOpen, currentOrg]);

  const fetchActivities = async (leadId: string) => {
    try {
      setIsLoadingActivities(true);
      const res = await fetch(`/api/leads/${leadId}/activities`);
      const json = await res.json();
      if (json.success) {
        setActivities(json.data);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  if (!isOpen || !lead) return null;

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setIsSubmittingNote(true);
      const res = await fetch(`/api/leads/${lead._id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: currentOrg?._id,
          user: {
            _id: currentUser?._id || 'u_admin',
            name: currentUser?.name || 'Admin',
          },
          type: activityType,
          content: newNote.trim(),
          followUpDate: followUpDate ? new Date(followUpDate).toISOString() : undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActivities([json.data, ...activities]);
        setNewNote('');
        setFollowUpDate('');
      }
    } catch (err) {
      console.error('Error adding activity:', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleStageChange = async (newStage: LeadStage) => {
    if (newStage === lead.stage) return;
    if (newStage === 'won') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
    await onUpdateLeadStage(lead._id, newStage);
  };

  const handleLaunchWhatsApp = () => {
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(waMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-xl border-l border-slate-700/80 bg-slate-900 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-slate-950/40">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{lead.name}</h2>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  {formatCurrency(lead.value, currencySymbol)}
                </span>
              </div>
              {lead.company && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Building className="h-3.5 w-3.5" />
                  <span>{lead.company}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditLead(lead)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Edit Lead"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDeleteLead(lead._id)}
                className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                title="Delete Lead"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-300">
            {/* Stage Selector Bar */}
            <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <span>Pipeline Stage</span>
                <span className="text-indigo-400">Click to advance</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {(['new', 'contacted', 'meeting', 'proposal', 'won', 'lost'] as LeadStage[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStageChange(st)}
                    className={`rounded-lg py-1.5 px-2 text-[10px] font-bold capitalize transition-all ${
                      lead.stage === st
                        ? st === 'won'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : st === 'lost'
                          ? 'bg-rose-600 text-white'
                          : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3 font-semibold text-cyan-300 hover:bg-cyan-900/40 transition-all shadow-md shadow-cyan-950/50"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Call {lead.phone}</span>
              </a>
              <button
                onClick={handleLaunchWhatsApp}
                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 font-semibold text-emerald-300 hover:bg-emerald-900/40 transition-all shadow-md shadow-emerald-950/50"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Open WhatsApp</span>
              </button>
            </div>

            {/* WhatsApp Template Box */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> 1-Click WhatsApp Message
                </span>
                <span className="text-[10px] text-emerald-500/80">Auto-filled template</span>
              </div>
              <textarea
                rows={3}
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
                className="w-full rounded-lg border border-emerald-500/30 bg-slate-900/80 p-2.5 text-xs text-slate-200 focus:border-emerald-400 focus:outline-none"
              />
              <button
                onClick={handleLaunchWhatsApp}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
              >
                <Send className="h-3.5 w-3.5" /> Send via WhatsApp Web / App
              </button>
            </div>

            {/* Custom Fields & Attributes */}
            <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-4 space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
                Lead Attributes & Custom Fields
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-850 p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Lead Source</span>
                  <span className="font-semibold text-slate-200 capitalize">{lead.source}</span>
                </div>
                <div className="rounded-lg bg-slate-850 p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Priority</span>
                  <span className="font-semibold text-slate-200 capitalize">{lead.priority}</span>
                </div>

                {/* Dynamic custom fields */}
                {currentOrg?.customFields?.map((field) => (
                  <div key={field.id} className="rounded-lg bg-slate-850 p-2.5 border border-slate-800">
                    <span className="text-[10px] text-indigo-400 block font-medium">{field.label}</span>
                    <span className="font-semibold text-slate-200">
                      {lead.customFields?.[field.key] || 'Not specified'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Logger Form */}
            <div className="rounded-xl border border-slate-800 bg-slate-850 p-4 space-y-3">
              <h4 className="font-bold text-white text-xs">Log Call / Meeting / Note</h4>
              <form onSubmit={handleAddActivity} className="space-y-3">
                <div className="flex gap-2">
                  {(['note', 'call', 'whatsapp', 'meeting'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActivityType(type)}
                      className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold capitalize border transition-all ${
                        activityType === type
                          ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700/60 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="What was discussed? Next steps..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Schedule Next Follow-Up:</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingNote}
                    className="self-end rounded-lg bg-indigo-600 px-4 py-1.5 font-semibold text-white shadow-md hover:bg-indigo-500 transition-all disabled:opacity-50 text-xs"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            </div>

            {/* Activity History Timeline */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Activity History</h4>
              {isLoadingActivities ? (
                <div className="py-4 text-center text-slate-500">Loading history...</div>
              ) : activities.length === 0 ? (
                <div className="py-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No activity logged yet. Add a note above!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activities.map((act) => (
                    <div
                      key={act._id}
                      className="rounded-lg border border-slate-800 bg-slate-800/40 p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-indigo-300 capitalize">{act.type}</span>
                        <span className="text-slate-500">{formatRelativeTime(act.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">{act.content}</p>
                      {act.followUpDate && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400">
                          <Calendar className="h-3 w-3" />
                          <span>Follow-up scheduled: {formatDate(act.followUpDate)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
