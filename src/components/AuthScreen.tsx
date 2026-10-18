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
  KeyRound,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';

interface AuthScreenProps {
  targetOrgSlug?: string;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ targetOrgSlug }) => {
  const { login, organizations, currentOrg } = useTenant();

  // Find target organization if slug was provided
  const targetOrg = targetOrgSlug
    ? organizations.find((o) => o.slug === targetOrgSlug || o._id === targetOrgSlug) || currentOrg
    : currentOrg;

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setIsLoading(true);
    setError(null);

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Invalid credentials. Please verify your business login details.');
      setIsLoading(false);
    } else {
      // Determine destination company slug
      const destinationSlug = res.organization?.slug || targetOrg?.slug || targetOrgSlug;
      if (destinationSlug) {
        window.location.href = `/${destinationSlug}`;
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 mb-1 border border-blue-400/30">
            <Layers className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Zyntex CRM
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Zoho-Style Multi-Tenant CRM • Isolated Enterprise Workspaces
          </p>

          {/* If on a dedicated company URL, show company badge */}
          {targetOrg && (
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/60 px-3.5 py-1 text-xs text-blue-300 mt-2 shadow-inner">
              <Building className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Workspace: <strong className="text-white font-semibold">{targetOrg.name}</strong></span>
            </div>
          )}
        </div>

        {/* Main Sign In Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur-xl p-6 sm:p-7 shadow-2xl shadow-black/80">
          <div className="mb-5 pb-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">
                {targetOrg ? `Sign In to ${targetOrg.name}` : 'Business Account Sign In'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter your authorized login credentials
              </p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <KeyRound className="h-4 w-4" />
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-start gap-2">
              <Info className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Business / Owner Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="e.g. admin@yourbusiness.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Account Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to CRM Pipeline'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Super Admin Provisioning Notice (Explains why there is no self-registration) */}
          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-200">Admin-Provisioned Workspaces</div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Public self-registration is disabled. Company CRM accounts and login credentials are created directly by the Super Admin in the Platform Console.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-500" />
          <span>MongoDB Atlas Connected • Complete Multi-Tenant Tenant Isolation</span>
        </div>
      </div>
    </div>
  );
};
