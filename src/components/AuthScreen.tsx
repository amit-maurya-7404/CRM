'use client';

import React, { useState } from 'react';
import { useTenant } from '@/context/TenantContext';
import {
  Layers,
  Lock,
  Mail,
  ArrowRight,
  Building,
  ShieldCheck,
  Sparkles,
  Plane,
  Dumbbell,
  Stethoscope,
  Utensils,
  Home,
  User,
  Phone,
  Briefcase,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, registerBusiness, organizations } = useTenant();

  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register Business State
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Travel & Tourism');
  const [ownerName, setOwnerName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Login failed. Please check your credentials.');
    }
    setIsLoading(false);
  };

  const handleRegisterBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !ownerName.trim() || !regEmail.trim()) {
      setError('Please fill in Company Name, Owner Name, and Business Email.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const res = await registerBusiness({
      orgName: companyName.trim(),
      industry,
      ownerName: ownerName.trim(),
      email: regEmail.trim(),
      password: regPassword || 'password123',
      phone: regPhone.trim() || '+919876543210',
      currency: currencySymbol === '₹' ? 'INR' : currencySymbol === '$' ? 'USD' : 'EUR',
      currencySymbol,
    });

    if (!res.success) {
      setError(res.error || 'Failed to register business account.');
      setIsLoading(false);
    } else {
      setSuccessMsg('Account created successfully! Launching your CRM workspace...');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden">
      {/* Subtle blue background decorative gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-100/60 via-blue-50/20 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg z-10 space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/25 mb-1">
            <Layers className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Zyntex CRM
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Zoho-Style Multi-Tenant CRM • Isolated Business Accounts & API Keys
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="flex rounded-xl bg-slate-200/80 p-1 border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              authMode === 'signin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In to Your Business
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              authMode === 'register'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Register New Business
          </button>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xl shadow-slate-200/50">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Business Owner Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. admin@yourbusiness.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Account Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In to CRM Pipeline'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER NEW BUSINESS (ZOHO MULTI-TENANT) */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterBusiness} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Company / Brand Name *</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Living"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Industry / Niche *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                    >
                      <option value="Travel & Tourism">✈️ Travel & Tourism</option>
                      <option value="Gym & Fitness">🏋️ Gym & Fitness</option>
                      <option value="Clinics & Healthcare">🩺 Clinics & Healthcare</option>
                      <option value="Restaurant & Banquets">🍽️ Restaurant & Banquets</option>
                      <option value="Real Estate & Properties">🏢 Real Estate & Properties</option>
                      <option value="Education & Coaching">🎓 Education & Coaching</option>
                      <option value="Solar & Energy">☀️ Solar & Energy</option>
                      <option value="IT & Software Agency">💻 IT & Digital Agency</option>
                      <option value="General Business">💼 General Business</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Owner Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Singhal"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Contact Phone / WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Business Login Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="owner@yourcompany.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="password"
                      placeholder="Enter secure password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Currency Symbol</label>
                  <select
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                  >
                    <option value="₹">₹ (INR - Rupee)</option>
                    <option value="$">$ (USD - Dollar)</option>
                    <option value="€">€ (EUR - Euro)</option>
                    <option value="£">£ (GBP - Pound)</option>
                    <option value="د.إ">د.إ (AED - Dirham)</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-2.5 text-[11px] text-blue-800 flex items-start gap-2">
                <KeyRound className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Automatic Setup: Creates your isolated MongoDB database, pre-configured pipeline for <strong>{industry}</strong>, and generates your Live API Key.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <span>{isLoading ? 'Creating Business Workspace...' : 'Create Business & Launch CRM'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Tenant Security Notice */}
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-800">Isolated Multi-Tenant CRM Access</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Each company operates inside its own isolated database workspace. Sign in with the registered email and password created for your business to launch your CRM.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <span>MongoDB Atlas Cloud Connected • Complete Multi-Tenant Security</span>
        </div>
      </div>
    </div>
  );
};
