'use client';

import React, { useState, useEffect } from 'react';
import { Lead, LeadStage, LeadPriority, LeadSource } from '@/types';
import { useTenant } from '@/context/TenantContext';
import { X, UserPlus, Save, Sparkles, Building, Phone, Mail, DollarSign } from 'lucide-react';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadData: any) => Promise<void>;
  initialData?: Lead | null;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { currentOrg, currencySymbol } = useTenant();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [value, setValue] = useState<number | string>(0);
  const [stage, setStage] = useState<LeadStage>('new');
  const [priority, setPriority] = useState<LeadPriority>('medium');
  const [source, setSource] = useState<LeadSource>('website');
  const [nextFollowUp, setNextFollowUp] = useState('');
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setCompany(initialData.company || '');
      setValue(initialData.value || 0);
      setStage(initialData.stage || 'new');
      setPriority(initialData.priority || 'medium');
      setSource(initialData.source || 'website');
      setNextFollowUp(
        initialData.nextFollowUp ? initialData.nextFollowUp.slice(0, 10) : ''
      );
      setCustomFields(initialData.customFields || {});
    } else {
      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      setCompany('');
      setValue(0);
      setStage('new');
      setPriority('medium');
      setSource('website');
      setNextFollowUp('');
      setCustomFields({});
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a lead name');
      return;
    }
    if (!phone.trim()) {
      setError('Please provide a phone number for WhatsApp & calls');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        orgId: currentOrg?._id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        company: company.trim() || undefined,
        value: Number(value) || 0,
        stage,
        priority,
        source,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp).toISOString() : undefined,
        customFields,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomFieldChange = (key: string, val: any) => {
    setCustomFields((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl shadow-black max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialData ? 'Edit Lead Details' : 'Add New Lead'}
              </h3>
              <p className="text-xs text-slate-400">
                Company: <span className="font-semibold text-indigo-300">{currentOrg?.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
              {error}
            </div>
          )}

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Phone Number (WhatsApp) <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Email Address</label>
              <input
                type="email"
                placeholder="e.g. rahul@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Company / Organization</label>
              <input
                type="text"
                placeholder="e.g. TechCorp Ltd"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Estimated Deal Value ({currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-semibold text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Pipeline Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as LeadStage)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="new">New Lead</option>
                <option value="contacted">Contacted</option>
                <option value="meeting">Meeting / Demo</option>
                <option value="proposal">Proposal Sent</option>
                <option value="won">Won Deal 🏆</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as LeadPriority)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent 🔥</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Lead Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="website">Website</option>
                <option value="whatsapp">WhatsApp Inbound</option>
                <option value="instagram">Instagram Ads</option>
                <option value="facebook">Facebook Ads</option>
                <option value="referral">Client Referral</option>
                <option value="cold_call">Cold Outreach</option>
                <option value="google_ads">Google Search Ads</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                Next Follow-Up Date (Optional)
              </label>
              <input
                type="date"
                value={nextFollowUp}
                onChange={(e) => setNextFollowUp(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Dynamic Custom Fields Section */}
          {currentOrg?.customFields && currentOrg.customFields.length > 0 && (
            <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>{currentOrg.name} Custom Fields</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentOrg.customFields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-slate-300 font-medium mb-1">
                      {field.label} {field.required && <span className="text-rose-400">*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={customFields[field.key] || ''}
                        onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="">Select an option</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        value={customFields[field.key] || ''}
                        onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving...' : initialData ? 'Update Lead' : 'Create Lead'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
