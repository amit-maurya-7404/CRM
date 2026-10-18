'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { CRMApp } from '@/components/CRMApp';

export default function CompanyWorkspacePage() {
  const params = useParams();
  const companySlug =
    typeof params?.companySlug === 'string'
      ? params.companySlug
      : Array.isArray(params?.companySlug)
      ? params.companySlug[0]
      : '';

  return <CRMApp targetOrgSlug={companySlug} />;
}
