'use client';

import React from 'react';
import { TenantProvider } from '@/context/TenantContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return <TenantProvider>{children}</TenantProvider>;
}
