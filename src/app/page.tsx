'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/context/TenantContext';
import { AuthScreen } from '@/components/AuthScreen';
import { CRMApp } from '@/components/CRMApp';

export default function RootPage() {
  const { currentOrg, currentUser, isLoading } = useTenant();
  const router = useRouter();

  // If user is already authenticated with an active company, direct them to that company's slug URL
  useEffect(() => {
    if (!isLoading && currentUser && currentOrg?.slug) {
      router.replace(`/${currentOrg.slug}`);
    }
  }, [isLoading, currentUser, currentOrg, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center text-slate-600 font-sans">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-sm font-medium">Loading Zyntex CRM...</span>
        </div>
      </div>
    );
  }

  // If logged in, show redirecting state while navigating to /[companySlug]
  if (currentUser && currentOrg?.slug) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center text-slate-600 font-sans">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-sm font-medium">Opening {currentOrg.name} workspace...</span>
        </div>
      </div>
    );
  }

  // If not logged in, render the clean single-sign-on AuthScreen (no register tab)
  return <AuthScreen />;
}
