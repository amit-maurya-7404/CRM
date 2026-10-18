'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/super-admin');
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        <span>Redirecting to Platform Owner Portal...</span>
      </div>
    </div>
  );
}
