'use client';

import React, { useState } from 'react';
import { useTenant } from '@/context/TenantContext';
import {
  X,
  User,
  Building,
  Mail,
  Phone,
  Shield,
  LogOut,
  Save,
  CheckCircle2,
  Lock,
  KeyRound,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Code,
  Terminal,
  Globe,
  Send,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, currentOrg, logout, updateUserProfile, regenerateApiKey } = useTenant();

  const [activeTab, setActiveTab] = useState<'profile' | 'api_key'>('profile');

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [password, setPassword] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // API Key & Dev Space State
  const [showApiKey, setShowApiKey] = useState(false);
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [codeType, setCodeType] = useState<'html' | 'js' | 'curl'>('html');
  const [localApiKey, setLocalApiKey] = useState(currentOrg?.apiKey && currentOrg.apiKey !== 'zyn_live_api_key' ? currentOrg.apiKey : '');

  // In-modal live test state
  const [testName, setTestName] = useState('Rahul Test Lead');
  const [testPhone, setTestPhone] = useState('+919876543210');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  React.useEffect(() => {
    if (currentOrg?.apiKey && currentOrg.apiKey !== 'zyn_live_api_key') {
      setLocalApiKey(currentOrg.apiKey);
    }
  }, [currentOrg?.apiKey]);

  // Auto-generate genuine API key if missing from currentOrg
  React.useEffect(() => {
    if (isOpen && currentOrg && (!currentOrg.apiKey || currentOrg.apiKey === 'zyn_live_api_key' || !localApiKey)) {
      regenerateApiKey().then((newKey) => {
        if (newKey) setLocalApiKey(newKey);
      });
    }
  }, [isOpen, currentOrg, localApiKey, regenerateApiKey]);

  if (!isOpen || !currentUser) return null;

  const activeApiKey = localApiKey || currentOrg?.apiKey || '';
  const currentApiKey = activeApiKey;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const apiEndpoint = `${baseUrl}/api/v1/capture-lead`;

  const copyToClipboard = (text: string, identifier: string) => {
    if (!text || text === 'zyn_live_api_key') return;
    navigator.clipboard.writeText(text);
    setCopiedKey(identifier);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, phone });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const handleRegenerateKey = async () => {
    if (
      !confirm(
        'Warning: Regenerating your API Key will invalidate your existing API key immediately. Any website forms using the old key will need to be updated with the new key. Are you sure?'
      )
    ) {
      return;
    }

    setIsRegeneratingKey(true);
    try {
      const newKey = await regenerateApiKey();
      if (newKey) {
        setLocalApiKey(newKey);
      }
      alert('New API Key successfully generated and saved to MongoDB Atlas!');
    } catch (e) {
      console.error('Error renewing key:', e);
    } finally {
      setIsRegeneratingKey(false);
    }
  };

  const handleTestApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApiKey) {
      alert('Please wait for the live API key to load or click Regenerate Key.');
      return;
    }
    setIsTestingKey(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/v1/capture-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Zyntex-Api-Key': currentApiKey,
        },
        body: JSON.stringify({
          apiKey: currentApiKey,
          name: testName,
          phone: testPhone,
          notes: 'Test lead submitted from CRM Profile Developer Space',
          source: 'website',
        }),
      });

      const json = await res.json();
      if (json.success) {
        setTestResult({
          success: true,
          message: `Success! Lead verified & captured for "${currentOrg?.name}" in MongoDB!`,
        });
        try {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
        } catch {}
      } else {
        setTestResult({
          success: false,
          message: json.error || 'Failed to capture test lead.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection error testing API key.',
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  // Ready-to-use snippets for the active business owner
  const htmlSnippet = `<!-- Zyntex CRM Web-to-Lead Form (WordPress, Elementor, Webflow, Custom HTML) -->
<form action="${apiEndpoint}" method="POST" style="max-width: 480px; font-family: sans-serif;">
  <!-- Zoho-style Secure API Key Authentication -->
  <input type="hidden" name="apiKey" value="${currentApiKey}" />
  <input type="hidden" name="source" value="website" />
  
  <div style="margin-bottom: 12px;">
    <label>Full Name *</label><br/>
    <input type="text" name="name" required placeholder="Enter full name" style="width: 100%; padding: 8px; margin-top: 4px;" />
  </div>

  <div style="margin-bottom: 12px;">
    <label>Phone / WhatsApp *</label><br/>
    <input type="tel" name="phone" required placeholder="e.g. 9876543210" style="width: 100%; padding: 8px; margin-top: 4px;" />
  </div>

  <div style="margin-bottom: 12px;">
    <label>Email Address</label><br/>
    <input type="email" name="email" placeholder="client@example.com" style="width: 100%; padding: 8px; margin-top: 4px;" />
  </div>

  <div style="margin-bottom: 12px;">
    <label>Message / Inquiries</label><br/>
    <textarea name="message" rows="3" placeholder="How can we help?" style="width: 100%; padding: 8px; margin-top: 4px;"></textarea>
  </div>

  <button type="submit" style="background: #4f46e5; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
    Send Inquiry to ${currentOrg?.name || 'CRM'}
  </button>
</form>`;

  const jsSnippet = `// JavaScript Fetch API (React / Next.js / Vue / WordPress Script)
async function submitLeadToCRM(customerData) {
  const response = await fetch('${apiEndpoint}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Zyntex-Api-Key': '${currentApiKey}' // Send in Header
    },
    body: JSON.stringify({
      apiKey: '${currentApiKey}', // Or send in Body
      name: customerData.name,
      phone: customerData.phone,
      email: customerData.email,
      source: 'website',
      message: customerData.message
    })
  });

  const result = await response.json();
  if (result.success) {
    console.log('Lead synced to ${currentOrg?.name} CRM:', result.data.leadId);
  }
}`;

  const curlSnippet = `# cURL Terminal Test Command
curl -X POST "${apiEndpoint}" \\
  -H "Content-Type: application/json" \\
  -H "X-Zyntex-Api-Key: ${currentApiKey}" \\
  -d '{
    "apiKey": "${currentApiKey}",
    "name": "Arjun Patel",
    "phone": "9812345678",
    "email": "arjun@example.com",
    "source": "website",
    "message": "Website lead test via cURL"
  }'`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Profile Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 p-0.5 shadow-lg shadow-blue-500/20 shrink-0">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-blue-600 text-2xl font-black text-white">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{currentUser.name}</h2>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-blue-700 border border-blue-200 uppercase">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{currentUser.email}</p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-blue-700 font-semibold">
                <Building className="h-3 w-3" />
                <span>{currentOrg?.name} ({currentOrg?.industry})</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="self-start sm:self-auto flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-all active:scale-95"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pt-4 pb-3">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>User Profile & Account</span>
          </button>

          <button
            onClick={() => setActiveTab('api_key')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all relative ${
              activeTab === 'api_key'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5 text-blue-200" />
            <span>{currentOrg?.name ? `${currentOrg.name} API Key & Webhook` : 'Live API Key & Webhook'}</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>
        </div>

        {/* TAB 1: User Profile & Security */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-blue-600" /> Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-blue-600" /> Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-blue-600" /> Contact Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-blue-600" /> Update Password
              </label>
              <input
                type="password"
                placeholder="Enter new password to update"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
              />
            </div>

            {/* Tenant isolation badge */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 text-xs text-blue-900">
              <div className="flex items-center justify-between font-bold text-blue-900 mb-1">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-blue-600" /> Tenant Account Isolation
                </span>
                <span className="text-blue-700 font-bold bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200">Protected & Isolated</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-800">
                You are signed in as the authorized administrator for <strong>{currentOrg?.name}</strong>. All customer records, deals, and reports are private to your business account.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Close
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all active:scale-95"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Dynamic Company API Key & Developer Space */}
        {activeTab === 'api_key' && (
          <div className="mt-5 space-y-5">
            {/* API Key Box */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                      {currentOrg?.name ? `${currentOrg.name} Live API Key` : 'Company Live API Key'}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Zoho CRM ki tarah, {currentOrg?.name ? `"${currentOrg.name}"` : 'apne CRM'} ki is API key ko client ki website par form me integrate karein leads direct receive karne ke liye.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRegenerateKey}
                  disabled={isRegeneratingKey}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95 shrink-0 shadow-xs"
                >
                  <RefreshCw className={`h-3 w-3 ${isRegeneratingKey ? 'animate-spin text-blue-600' : ''}`} />
                  <span>{isRegeneratingKey ? 'Regenerating...' : 'Regenerate Key'}</span>
                </button>
              </div>

              {/* API Key String with Show/Hide & Copy */}
              <div className="mt-3.5 flex items-center gap-2">
                <div className="relative flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-xs text-blue-900 font-bold truncate select-all shadow-xs">
                  {currentApiKey ? (
                    showApiKey ? currentApiKey : currentApiKey.replace(/^(.{10})(.*)(.{4})$/, '$1••••••••••••••••$3')
                  ) : (
                    <span className="flex items-center gap-1.5 text-slate-400 italic font-sans font-normal">
                      <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                      Generating genuine API Key for {currentOrg?.name || 'Workspace'}...
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  disabled={!currentApiKey}
                  title={showApiKey ? 'Hide API Key' : 'Reveal API Key'}
                  className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-xs disabled:opacity-50"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => currentApiKey && copyToClipboard(currentApiKey, 'api_key')}
                  disabled={!currentApiKey}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  {copiedKey === 'api_key' ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy API Key</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>Webhook Ingestion URL: <strong className="text-blue-900 font-mono">{apiEndpoint}</strong></span>
                <span>Security: HTTPS & CORS enabled</span>
              </div>
            </div>

            {/* Integration Snippets for Website Developers */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">Website Integration Code (With Your API Key)</span>
                </div>

                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200 text-[11px]">
                  <button
                    onClick={() => setCodeType('html')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      codeType === 'html' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    HTML Form
                  </button>
                  <button
                    onClick={() => setCodeType('js')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      codeType === 'js' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    JavaScript SDK
                  </button>
                  <button
                    onClick={() => setCodeType('curl')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      codeType === 'curl' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    cURL Test
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-[11px] font-mono text-blue-900 overflow-x-auto max-h-48 leading-relaxed shadow-xs">
                  {codeType === 'html' && htmlSnippet}
                  {codeType === 'js' && jsSnippet}
                  {codeType === 'curl' && curlSnippet}
                </pre>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      codeType === 'html' ? htmlSnippet : codeType === 'js' ? jsSnippet : curlSnippet,
                      'code_snippet'
                    )
                  }
                  className="absolute top-2 right-2 flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-all shadow-xs"
                >
                  {copiedKey === 'code_snippet' ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live API Key Ingestion Test Simulator */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900">Live API Key Test Simulator</span>
                <span className="text-[10px] text-slate-500 font-medium">— Send a real lead right now with your API key</span>
              </div>

              {testResult && (
                <div
                  className={`rounded-xl border p-2.5 text-xs font-medium ${
                    testResult.success
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-rose-200 bg-rose-50 text-rose-800'
                  }`}
                >
                  {testResult.message}
                </div>
              )}

              <form onSubmit={handleTestApiKey} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs items-end">
                <div>
                  <label className="text-[10px] text-slate-600 font-bold block mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 font-bold block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isTestingKey}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 transition-all disabled:opacity-50 text-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isTestingKey ? 'Verifying...' : 'Post Test Lead with API Key'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
