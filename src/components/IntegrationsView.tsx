'use client';

import React, { useState } from 'react';
import { useTenant } from '@/context/TenantContext';
import {
  Globe,
  Code,
  Copy,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Layers,
  Send,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Laptop,
  Play,
  Terminal,
  Webhook,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const IntegrationsView: React.FC = () => {
  const { currentOrg } = useTenant();
  const [activeIntegrationType, setActiveIntegrationType] = useState<'iframe' | 'html' | 'webhook'>('iframe');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live Simulator State
  const [simName, setSimName] = useState('Rahul Verma');
  const [simPhone, setSimPhone] = useState('9876543210');
  const [simEmail, setSimEmail] = useState('rahul.verma@example.com');
  const [simCustomFields, setSimCustomFields] = useState<Record<string, any>>({});
  const [simMessage, setSimMessage] = useState('Inquiring from website contact form for special offers.');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{ success: boolean; message?: string } | null>(null);

  const orgSlug = currentOrg?.slug || 'wanderlust-travel';
  const orgName = currentOrg?.name || 'Your Company';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  // Embed URL
  const embedUrl = `${baseUrl}/embed/form/${orgSlug}`;
  const webhookUrl = `${baseUrl}/api/v1/capture-lead`;

  // Code Snippets
  const iframeCode = `<!-- Zyntex CRM Web-to-Lead Form Embed -->
<iframe
  src="${embedUrl}"
  width="100%"
  height="650px"
  frameborder="0"
  style="border: none; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);"
  title="Inquiry Form - ${orgName}"
></iframe>`;

  const htmlFormCode = `<!-- Zyntex CRM Direct HTML Form (WordPress / Webflow / Elementor) -->
<form action="${webhookUrl}" method="POST" style="max-width: 480px; font-family: sans-serif;">
  <input type="hidden" name="orgId" value="${currentOrg?._id || orgSlug}" />
  <input type="hidden" name="source" value="website" />
  
  <div style="margin-bottom: 12px;">
    <label>Full Name *</label><br/>
    <input type="text" name="name" required placeholder="Your Name" style="width: 100%; padding: 8px; margin-top: 4px;" />
  </div>

  <div style="margin-bottom: 12px;">
    <label>Phone / WhatsApp *</label><br/>
    <input type="tel" name="phone" required placeholder="e.g. 9876543210" style="width: 100%; padding: 8px; margin-top: 4px;" />
  </div>

  <div style="margin-bottom: 12px;">
    <label>Email Address</label><br/>
    <input type="email" name="email" placeholder="you@gmail.com" style="width: 100%; padding: 8px; margin-top: 4px;" />
  </div>
${(currentOrg?.customFields || [])
  .map(
    (f) => `
  <div style="margin-bottom: 12px;">
    <label>${f.label}${f.required ? ' *' : ''}</label><br/>
    ${
      f.type === 'select'
        ? `<select name="${f.key}" ${f.required ? 'required' : ''} style="width: 100%; padding: 8px; margin-top: 4px;">
      <option value="">Select ${f.label}...</option>
      ${f.options?.map((opt) => `<option value="${opt}">${opt}</option>`).join('\n      ')}
    </select>`
        : `<input type="${f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}" name="${f.key}" ${f.required ? 'required' : ''} placeholder="${f.label}" style="width: 100%; padding: 8px; margin-top: 4px;" />`
    }
  </div>`
  )
  .join('')}
  <div style="margin-bottom: 12px;">
    <label>Message</label><br/>
    <textarea name="message" rows="3" placeholder="How can we help?" style="width: 100%; padding: 8px; margin-top: 4px;"></textarea>
  </div>

  <button type="submit" style="background: #4f46e5; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
    Send Inquiry
  </button>
</form>`;

  const webhookJsonCode = `// JavaScript / Node.js / React / Next.js Fetch API
fetch('${webhookUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    orgId: '${currentOrg?._id || orgSlug}',
    name: 'Customer Name',
    phone: '9876543210',
    email: 'customer@gmail.com',
    source: 'website',
    ${(currentOrg?.customFields || []).map((f) => `"${f.key}": "${f.options ? f.options[0] : 'Sample Value'}"`).join(',\n    ')}
    message: 'Inquiry details from contact form'
  })
})
.then(res => res.json())
.then(data => console.log('Lead captured in Zyntex CRM:', data));`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunSimulator = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setSimResult(null);

    try {
      const payload = {
        orgId: currentOrg?._id || orgSlug,
        slug: orgSlug,
        name: simName,
        phone: simPhone,
        email: simEmail,
        ...simCustomFields,
        message: simMessage,
        source: 'website',
      };

      const res = await fetch('/api/v1/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSimResult({ success: true, message: `Lead successfully posted to ${currentOrg?.name} in MongoDB Atlas!` });
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } catch {}
      } else {
        setSimResult({ success: false, message: json.error || 'Failed to capture lead.' });
      }
    } catch (err: any) {
      setSimResult({ success: false, message: err.message || 'Network error.' });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Globe className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Web-to-Lead Integration Hub
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Connect {currentOrg?.name} to Any Website
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Zoho CRM aur HubSpot ki tarah, koi bhi lead jab client ki website (WordPress, Webflow, Shopify, HTML) par form fill karegi, wo direct aapke <strong>Zyntex CRM Pipeline</strong> me auto-create ho jayegi!
            </p>
          </div>

          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-violet-500 transition-all shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open Hosted Form</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Embed Code Generator & Tabs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-md">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveIntegrationType('iframe')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeIntegrationType === 'iframe'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>1-Line Iframe Embed</span>
              </button>
              <button
                onClick={() => setActiveIntegrationType('html')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeIntegrationType === 'html'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Code className="h-3.5 w-3.5" />
                <span>HTML Form Snippet</span>
              </button>
              <button
                onClick={() => setActiveIntegrationType('webhook')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeIntegrationType === 'webhook'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Webhook className="h-3.5 w-3.5" />
                <span>REST API / Webhook</span>
              </button>
            </div>

            {/* Code Box */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium text-slate-300">
                  {activeIntegrationType === 'iframe' && 'Copy-paste this iframe on any website page (WordPress / Shopify / Wix):'}
                  {activeIntegrationType === 'html' && 'Copy this custom HTML form code for Elementor, WPForms or Webflow:'}
                  {activeIntegrationType === 'webhook' && 'Direct REST API endpoint with CORS enabled for frontend/backend:'}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      activeIntegrationType === 'iframe'
                        ? iframeCode
                        : activeIntegrationType === 'html'
                        ? htmlFormCode
                        : webhookJsonCode,
                      activeIntegrationType
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
                >
                  {copiedKey === activeIntegrationType ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[380px] leading-relaxed">
                {activeIntegrationType === 'iframe' && iframeCode}
                {activeIntegrationType === 'html' && htmlFormCode}
                {activeIntegrationType === 'webhook' && webhookJsonCode}
              </pre>

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Webhook Ingestion URL: <strong className="text-white font-mono text-[10px]">{webhookUrl}</strong></span>
                <span className="text-emerald-400 font-semibold">CORS: Allow All (*)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Ingestion Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <Play className="h-4 w-4 text-emerald-400 fill-emerald-400/20" />
              <div>
                <h3 className="text-sm font-bold text-white">Live Website Form Test Simulator</h3>
                <p className="text-[11px] text-slate-400">Test how a visitor inquiry flows into your CRM in real time</p>
              </div>
            </div>

            {simResult && (
              <div
                className={`mb-4 rounded-xl border p-3 text-xs ${
                  simResult.success
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                }`}
              >
                {simResult.message}
              </div>
            )}

            <form onSubmit={handleRunSimulator} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Visitor Name</label>
                <input
                  type="text"
                  required
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Phone</label>
                  <input
                    type="tel"
                    required
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Email</label>
                  <input
                    type="email"
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Niche Field Preview */}
              {currentOrg?.customFields && currentOrg.customFields.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-[10px] font-bold uppercase text-indigo-400">
                    {currentOrg.industry} Dynamic Fields
                  </div>
                  {currentOrg.customFields.slice(0, 2).map((field) => (
                    <div key={field.id} className="space-y-1">
                      <label className="font-semibold text-slate-300">{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          value={simCustomFields[field.key] || ''}
                          onChange={(e) =>
                            setSimCustomFields((prev) => ({ ...prev, [field.key]: e.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                        >
                          <option value="">Select {field.label}...</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt} className="bg-slate-900 text-white">
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder={field.label}
                          value={simCustomFields[field.key] || ''}
                          onChange={(e) =>
                            setSimCustomFields((prev) => ({ ...prev, [field.key]: e.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Message / Requirement</label>
                <textarea
                  rows={2}
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSimulating ? (
                  <span>Sending Test Inquiry...</span>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Test Website Lead</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
