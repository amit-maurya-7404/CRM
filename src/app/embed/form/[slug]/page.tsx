'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Organization, CustomFieldDefinition } from '@/types';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Send,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Building,
  Calendar,
  Lock,
} from 'lucide-react';

export default function EmbedFormPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  const [org, setOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState<number | string>('');
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadOrg() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/organizations/${slug}`);
        const json = await res.json();
        if (json.success && json.data) {
          setOrg(json.data);
        } else {
          // Fallback to fetch all and find
          const allRes = await fetch('/api/organizations');
          const allJson = await allRes.json();
          if (allJson.success) {
            const found = allJson.data.find(
              (o: Organization) => o.slug === slug || o._id === slug
            ) || allJson.data[0];
            setOrg(found);
          }
        }
      } catch (err) {
        console.error('Error fetching org:', err);
      } finally {
        setIsLoading(false);
      }
    }
    if (slug) {
      loadOrg();
    }
  }, [slug]);

  const handleCustomFieldChange = (key: string, value: any) => {
    setCustomFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      setErrorMessage('Please provide your name and phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        orgId: org?._id || slug,
        slug: org?.slug || slug,
        name,
        phone,
        email,
        company,
        value: Number(estimatedBudget) || 0,
        ...customFields,
        notes,
        source: 'website',
      };

      const res = await fetch('/api/v1/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setIsSuccess(true);
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch {}
      } else {
        setErrorMessage(json.error || 'Failed to submit form. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-500">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span>Loading secure form...</span>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl animate-in zoom-in-95">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-4">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Inquiry Received!</h2>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
            Thank you, <strong>{name}</strong>! Your details have been submitted to{' '}
            <span className="text-blue-700 font-bold">{org?.name || 'our team'}</span>. One of our specialists will reach out to you on WhatsApp / phone shortly.
          </p>
          <button
            onClick={() => {
              setIsSuccess(false);
              setName('');
              setPhone('');
              setEmail('');
              setCustomFields({});
              setNotes('');
            }}
            className="mt-6 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition-all shadow-xs"
          >
            Submit Another Inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 antialiased">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50">
        {/* Form Title & Company Badge */}
        <div className="border-b border-slate-100 pb-5 mb-5 text-left">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
              {org?.industry || 'Customer Inquiry'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
            {org?.name ? `Inquire with ${org.name}` : 'Get in Touch'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Fill in your details below and our team will connect with you with pricing and custom options.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-blue-600" /> Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-blue-600" /> Phone / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-blue-600" /> Email Address (Optional)
            </label>
            <input
              type="email"
              placeholder="e.g. rahul@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
            />
          </div>

          {/* Dynamic Industry Custom Fields */}
          {org?.customFields && org.customFields.length > 0 && (
            <div className="space-y-3.5 pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                {org.industry} Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {org.customFields.map((field) => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        required={field.required}
                        value={customFields[field.key] || ''}
                        onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none transition-all"
                      >
                        <option value="">Select {field.label}...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt} className="bg-white text-slate-900">
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'date' ? (
                      <input
                        type="date"
                        required={field.required}
                        value={customFields[field.key] || ''}
                        onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none transition-all"
                      />
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        required={field.required}
                        placeholder={`Enter ${field.label}`}
                        value={customFields[field.key] || ''}
                        onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none transition-all"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes / Special Requests */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-slate-700">
              Special Message or Requirements (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Any specific questions or preferences..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Submitting Inquiry...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Inquiry</span>
              </>
            )}
          </button>
        </form>

        {/* Security badge */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 border-t border-slate-100 pt-3 font-medium">
          <Lock className="h-3 w-3 text-blue-600" />
          <span>Powered by Zyntex CRM • Direct Lead Synchronization</span>
        </div>
      </div>
    </div>
  );
}
