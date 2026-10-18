'use client';

import React, { useState, useEffect } from 'react';
import { TenantProvider, useTenant } from '@/context/TenantContext';
import { SuperAdminView } from '@/components/SuperAdminView';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Layers,
  KeyRound,
  ExternalLink,
  LogOut,
  Building2,
  AlertCircle,
} from 'lucide-react';

function SuperAdminConsole() {
  const { currentOrg, loginAsTenantCompany } = useTenant();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authKey, setAuthKey] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Check persisted master session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = sessionStorage.getItem('zyntex_master_admin_auth');
      if (savedAuth === 'authenticated') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleUnlockConsole = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setAuthError(null);

    const trimmed = authKey.trim();
    // Accepted keys: Master Key or Owner Password or Owner Email
    if (
      trimmed === 'zyntex-master-2026' ||
      trimmed === 'password123' ||
      trimmed === 'owner@zyntex.com' ||
      trimmed === 'zyntex#admin2026'
    ) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('zyntex_master_admin_auth', 'authenticated');
      }
    } else {
      setAuthError('Invalid Master Key. Access denied to platform owner console.');
    }
    setIsVerifying(false);
  };

  const handleLockConsole = () => {
    setIsAuthenticated(false);
    setAuthKey('');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('zyntex_master_admin_auth');
    }
  };

  const handleOpenWorkspace = (orgId: string) => {
    loginAsTenantCompany(orgId);
    window.location.href = '/';
  };

  // 1. MASTER AUTHENTICATION GATE (Only owner with key can unlock)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Subtle glowing accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 text-white shadow-xl shadow-amber-500/20 mb-1 border border-amber-400/40">
              <span className="text-2xl">👑</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Platform Owner Console
            </h1>
            <p className="text-xs text-slate-400">
              Unique Secret Link • Client Credentials Management & Multi-Tenant Provisioning
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-7 shadow-2xl shadow-black/80">
            {authError && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleUnlockConsole} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Enter Master Owner Key</span>
                  <span className="text-[10px] text-amber-400/80 font-mono">
                    Key: zyntex-master-2026
                  </span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    autoFocus
                    placeholder="Master Access Key / Password"
                    value={authKey}
                    onChange={(e) => setAuthKey(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 px-4 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-yellow-400 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>{isVerifying ? 'Verifying...' : 'Unlock Super Admin Panel'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-1.5 text-center">
              <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Strictly restricted to CRM Platform Super Admin</span>
            </div>
          </div>

          <div className="text-center">
            <a
              href="/"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1"
            >
              ← Back to Client CRM Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 2. UNLOCKED SUPER ADMIN CONSOLE
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Dedicated Super Admin Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white px-4 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-slate-950 font-black shadow-xs">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tight text-white">Zyntex</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Platform Owner Console
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Unique Secret Route • Client Credentials Generator & Isolation Management
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick link to client CRM login */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors"
            title="Open standard client CRM portal"
          >
            <span>Client CRM Portal</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>

          {/* Lock / Exit */}
          <button
            onClick={handleLockConsole}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-300 transition-colors cursor-pointer"
            title="Lock and exit console"
          >
            <LogOut className="h-3 w-3" />
            <span>Lock Console</span>
          </button>
        </div>
      </header>

      {/* Main SuperAdmin Content */}
      <main className="flex-1">
        <SuperAdminView onOpenWorkspace={handleOpenWorkspace} />
      </main>
    </div>
  );
}

export default function SuperAdminPage() {
  return (
    <TenantProvider>
      <SuperAdminConsole />
    </TenantProvider>
  );
}
