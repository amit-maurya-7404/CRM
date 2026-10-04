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
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, organizations } = useTenant();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    {
      orgName: 'Wanderlust Holidays & Travel',
      industry: 'Travel & Tourism',
      email: 'aarav@wanderlusttravel.com',
      role: 'Owner / Admin',
      orgId: 'org_travel',
      gradient: 'from-sky-500/20 to-blue-600/10 border-sky-500/30',
      badge: '✈️ Travel Niche',
      icon: <Plane className="h-4 w-4 text-sky-400" />,
    },
    {
      orgName: 'PulseFit 24/7 Health & Gym',
      industry: 'Gym & Fitness',
      email: 'sameer@pulsefitgym.com',
      role: 'Owner / Admin',
      orgId: 'org_gym',
      gradient: 'from-orange-500/20 to-amber-500/10 border-orange-500/30',
      badge: '🏋️‍♂️ Gym Niche',
      icon: <Dumbbell className="h-4 w-4 text-orange-400" />,
    },
    {
      orgName: 'AuraCare Dental & Clinic',
      industry: 'Clinics & Healthcare',
      email: 'dr.neha@auracareclinic.com',
      role: 'Owner / Doctor',
      orgId: 'org_clinic',
      gradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      badge: '🩺 Clinic Niche',
      icon: <Stethoscope className="h-4 w-4 text-emerald-400" />,
    },
    {
      orgName: 'The Royal Grand Banquets',
      industry: 'Restaurant & Banquets',
      email: 'vikas@royalbanquet.com',
      role: 'Owner / Manager',
      orgId: 'org_restaurant',
      gradient: 'from-purple-500/20 to-pink-500/10 border-purple-500/30',
      badge: '🍽️ Restaurant Niche',
      icon: <Utensils className="h-4 w-4 text-purple-400" />,
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setIsLoading(true);
    setError(null);

    const res = await login(email, password, selectedOrgId || undefined);
    if (!res.success) {
      setError(res.error || 'Login failed. Please check credentials.');
    }
    setIsLoading(false);
  };

  const handleDemoLogin = async (demoEmail: string, demoOrgId: string) => {
    setIsLoading(true);
    setError(null);
    setEmail(demoEmail);
    setPassword('password123');
    await login(demoEmail, 'password123', demoOrgId);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-500 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/30 mb-2">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950 font-bold text-white">
              <Layers className="h-7 w-7 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Zyntex CRM
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Multi-Tenant SaaS CRM with MongoDB Atlas Cloud
          </p>
        </div>

        {/* Main Login Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Email Address</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@yourcompany.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Password</span>
                <span className="text-[11px] text-indigo-400 hover:underline cursor-pointer">
                  Forgot?
                </span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to CRM'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-slate-900 px-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Or 1-Click Fast Login As Niche
            </span>
          </div>

          {/* Quick Demo Credentials for Target Industries */}
          <div className="space-y-2.5">
            {demoAccounts.map((demo) => (
              <button
                key={demo.orgId}
                type="button"
                onClick={() => handleDemoLogin(demo.email, demo.orgId)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border bg-gradient-to-r ${demo.gradient} text-left hover:brightness-110 active:scale-[0.98] transition-all group`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-950/70 shrink-0">
                    {demo.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                        {demo.orgName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {demo.email} • <em>password123</em>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>MongoDB Atlas Connected & Multi-tenant Isolated</span>
        </div>
      </div>
    </div>
  );
};
