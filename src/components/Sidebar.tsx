'use client';

import React from 'react';
import { useTenant } from '@/context/TenantContext';
import {
  Kanban,
  Table,
  BarChart3,
  Sliders,
  Building,
  LogOut,
  Globe,
  KeyRound,
  Plus,
  Compass,
  Car,
  CalendarCheck,
  Layers,
  MapPin,
} from 'lucide-react';

export type ActiveTab = 'pipeline' | 'leads' | 'integrations' | 'dashboard' | 'settings' | string;

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenProfileModal?: () => void;
  onOpenCreateModuleModal?: () => void;
  leadsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenProfileModal,
  onOpenCreateModuleModal,
  leadsCount,
}) => {
  const { currentOrg, currentUser, logout, modules } = useTenant();

  const getModuleIcon = (slug: string) => {
    switch (slug) {
      case 'itineraries':
        return <Compass className="h-3.5 w-3.5" />;
      case 'hotels':
        return <Building className="h-3.5 w-3.5" />;
      case 'vehicles':
        return <Car className="h-3.5 w-3.5" />;
      case 'bookings':
        return <CalendarCheck className="h-3.5 w-3.5" />;
      default:
        return <Layers className="h-3.5 w-3.5" />;
    }
  };

  return (
    <aside className="hidden md:flex w-52 flex-col justify-between border-r border-slate-200 bg-white p-2.5 shrink-0 shadow-xs">
      <div className="space-y-3 overflow-y-auto pr-0.5">
        {/* Active Company Badge (Zoho CRM Teamspace style) */}
        <div className="rounded border border-blue-100 bg-blue-50/60 p-2 text-xs">
          <div className="flex items-center gap-1.5 text-blue-900 font-bold truncate">
            <Building className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{currentOrg?.name}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
            <span className="truncate">{currentOrg?.industry}</span>
            <span className="text-emerald-700 font-medium">Online</span>
          </div>
        </div>

        {/* Core CRM Modules */}
        <nav className="space-y-0.5">
          <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Modules</span>
          </div>

          {/* Leads */}
          <button
            onClick={() => onTabChange('leads')}
            className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-xs transition-colors ${
              activeTab === 'leads'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Table className={`h-3.5 w-3.5 ${activeTab === 'leads' ? 'text-white' : 'text-slate-500'}`} />
              <span className="truncate">Leads</span>
            </div>
            <span
              className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === 'leads' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {leadsCount}
            </span>
          </button>

          {/* Deals Pipeline */}
          <button
            onClick={() => onTabChange('pipeline')}
            className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-xs transition-colors ${
              activeTab === 'pipeline'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Kanban className={`h-3.5 w-3.5 ${activeTab === 'pipeline' ? 'text-white' : 'text-slate-500'}`} />
              <span className="truncate">Deals Pipeline</span>
            </div>
          </button>

          {/* Dynamic Custom Modules (Zoho Feature: Itineraries, Hotels, Vehicles, Bookings, etc.) */}
          {modules.map((mod) => {
            const isModActive = activeTab === `module_${mod.slug}`;
            return (
              <button
                key={mod.id || mod.slug}
                onClick={() => onTabChange(`module_${mod.slug}`)}
                className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-xs transition-colors ${
                  isModActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={isModActive ? 'text-white' : 'text-slate-500'}>
                    {getModuleIcon(mod.slug)}
                  </span>
                  <span className="truncate">{mod.name}</span>
                </div>
                {mod.records && mod.records.length > 0 && (
                  <span
                    className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                      isModActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {mod.records.length}
                  </span>
                )}
              </button>
            );
          })}

          {/* + Add Module Button (Zoho Module Builder) */}
          <button
            onClick={onOpenCreateModuleModal}
            className="flex w-full items-center gap-2 rounded px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50 font-semibold transition-colors mt-1"
          >
            <Plus className="h-3.5 w-3.5 text-blue-600" />
            <span>+ Add Module</span>
          </button>
        </nav>

        {/* Tools Section */}
        <nav className="space-y-0.5 pt-2 border-t border-slate-100">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Configuration
          </div>
          <button
            onClick={() => onTabChange('integrations')}
            className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-xs transition-colors ${
              activeTab === 'integrations'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Globe className={`h-3.5 w-3.5 ${activeTab === 'integrations' ? 'text-white' : 'text-slate-500'}`} />
              <span className="truncate">Web Forms & API</span>
            </div>
            <span className="rounded px-1.5 py-0.2 text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              API
            </span>
          </button>

          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-xs transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <BarChart3 className={`h-3.5 w-3.5 ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-500'}`} />
              <span className="truncate">Analytics & Reports</span>
            </div>
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-xs transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Sliders className={`h-3.5 w-3.5 ${activeTab === 'settings' ? 'text-white' : 'text-slate-500'}`} />
              <span className="truncate">Setup & Settings</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Bottom User & API Key Action */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <button
          onClick={onOpenProfileModal}
          className="w-full flex items-center justify-between rounded border border-blue-200 bg-blue-50/70 px-2 py-1.5 hover:bg-blue-100 transition-colors text-left"
          title="View & Copy Live API Key"
        >
          <div className="flex items-center gap-1.5">
            <KeyRound className="h-3 w-3 text-blue-600" />
            <span className="text-[11px] font-bold text-blue-900">API Key Hub</span>
          </div>
          <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">API</span>
        </button>

        {currentUser && (
          <div className="rounded border border-slate-200 bg-slate-50/80 p-1.5 flex items-center justify-between">
            <button
              onClick={onOpenProfileModal}
              className="flex items-center gap-1.5 text-left flex-1 min-w-0 hover:opacity-80 transition-opacity"
            >
              <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[10px] text-white shrink-0">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate min-w-0">
                <div className="text-[11px] font-bold text-slate-800 truncate">{currentUser.name}</div>
                <div className="text-[9px] text-slate-400 capitalize truncate">{currentUser.role}</div>
              </div>
            </button>
            <button
              title="Log Out"
              onClick={logout}
              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
            >
              <LogOut className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
