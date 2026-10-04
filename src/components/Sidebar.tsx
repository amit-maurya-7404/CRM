'use client';

import React from 'react';
import { useTenant } from '@/context/TenantContext';
import {
  Kanban,
  Table,
  BarChart3,
  Sliders,
  Sparkles,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  Building,
  User,
  LogOut,
  Globe,
} from 'lucide-react';

export type ActiveTab = 'pipeline' | 'leads' | 'integrations' | 'dashboard' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenProfileModal?: () => void;
  leadsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenProfileModal,
  leadsCount,
}) => {
  const { currentOrg, currentUser, logout } = useTenant();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'pipeline', label: 'Kanban Pipeline', icon: <Kanban className="h-4 w-4" /> },
    { id: 'leads', label: 'All Leads', icon: <Table className="h-4 w-4" />, badge: leadsCount },
    { id: 'integrations', label: 'Website & Forms', icon: <Globe className="h-4 w-4" />, badge: 'New' },
    { id: 'dashboard', label: 'Analytics & Reports', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'settings', label: 'Custom Fields & Org', icon: <Sliders className="h-4 w-4" /> },
  ];

  return (
    <aside className="hidden md:flex w-60 flex-col justify-between border-r border-slate-800 bg-slate-900/40 p-3 lg:p-4 shrink-0">
      <div className="space-y-6">
        {/* Active Company Badge */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-800/40 p-3">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-semibold text-white truncate">{currentOrg?.name}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Industry:</span>
            <span className="font-medium text-slate-300 truncate max-w-[100px]">{currentOrg?.industry}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-3 w-3" />
            <span>MongoDB Cloud Connected</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/20 to-violet-600/10 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-indigo-400' : 'text-slate-500'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                      item.badge === 'New'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Card */}
      <div className="space-y-2">
        {currentUser && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 flex items-center justify-between">
            <button
              onClick={onOpenProfileModal}
              className="flex items-center gap-2 text-left flex-1 min-w-0 hover:opacity-80 transition-opacity"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 p-0.5 shrink-0">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 text-[11px] font-bold text-indigo-300">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              <div className="truncate min-w-0">
                <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 capitalize">{currentUser.role}</div>
              </div>
            </button>
            <button
              title="Log Out"
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Feature info */}
        <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/40 to-slate-900/60 p-3 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-300 text-[11px]">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Web-to-Lead Integration</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Direct form embeds & webhooks for client websites with zero coding.
          </p>
        </div>
      </div>
    </aside>
  );
};
