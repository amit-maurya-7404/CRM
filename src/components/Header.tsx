'use client';

import React, { useState } from 'react';
import { useTenant } from '@/context/TenantContext';
import {
  Building2,
  ChevronDown,
  Plus,
  Search,
  Bell,
  CheckCircle2,
  Layers,
  User,
  LogOut,
  KeyRound,
  Sparkles,
  Settings,
  HelpCircle,
} from 'lucide-react';

interface HeaderProps {
  onOpenNewLeadModal: () => void;
  onOpenProfileModal: () => void;
  onOpenSettings?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  pendingFollowUps: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewLeadModal,
  onOpenProfileModal,
  onOpenSettings,
  searchQuery,
  onSearchChange,
  pendingFollowUps,
}) => {
  const { currentOrg, currentUser, logout } = useTenant();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-11 sm:h-12 w-full items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-4 shrink-0 shadow-xs">
      {/* Left: Brand & Isolated Company Badge */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-white font-bold text-xs shadow-xs">
            <Layers className="h-4 w-4" />
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="font-bold text-slate-900 text-sm tracking-tight">Zyntex</span>
            <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-semibold">
              CRM
            </span>
          </div>
        </div>

        {/* Active Isolated Company Badge (Strictly isolated - no switching) */}
        <div className="flex items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800">
          <Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <span className="max-w-[130px] sm:max-w-[200px] truncate font-bold text-slate-900">
            {currentOrg?.name || 'Business Workspace'}
          </span>
        </div>
      </div>

      {/* Middle: Global Search Input (Zoho "Search records" style) */}
      <div className="hidden md:flex items-center relative w-64 lg:w-80">
        <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search records..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-7 w-full rounded border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
        />
      </div>

      {/* Right: Quick Action cluster */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick Add "+" Button (Zoho top right) */}
        <button
          onClick={onOpenNewLeadModal}
          title="Quick Create Lead"
          className="flex h-7 w-7 items-center justify-center rounded bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        {/* API Key Hub Button */}
        <button
          onClick={onOpenProfileModal}
          title="Company API Key & Web-to-Lead"
          className="hidden sm:flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <KeyRound className="h-3 w-3 text-blue-600" />
          <span>API Key</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            title={`${pendingFollowUps} pending follow-ups`}
            className="flex h-7 w-7 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <Bell className="h-3.5 w-3.5" />
            {pendingFollowUps > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                {pendingFollowUps}
              </span>
            )}
          </button>
        </div>

        {/* Setup / Settings Gear Icon (Zoho CRM style) */}
        <button
          onClick={onOpenSettings}
          title="Setup & CRM Settings"
          className="flex h-7 w-7 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* Profile Avatar & Dropdown */}
        <div className="relative border-l border-slate-200 pl-1.5 sm:pl-2">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1.5 rounded p-0.5 hover:bg-slate-100 transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden xl:inline text-xs font-semibold text-slate-800 truncate max-w-[85px]">
              {currentUser?.name}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden xl:inline" />
          </button>

          {/* User dropdown menu */}
          {isUserMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
              <div className="absolute right-0 mt-1 z-50 w-52 rounded-md border border-slate-200 bg-white p-1.5 shadow-lg text-xs animate-in fade-in zoom-in-95">
                <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                  <div className="font-bold text-slate-900 truncate">{currentUser?.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{currentUser?.email}</div>
                  <div className="mt-0.5 text-[10px] font-medium text-blue-600">{currentOrg?.name}</div>
                </div>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenProfileModal();
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  <User className="h-3.5 w-3.5 text-blue-600" />
                  <span>Profile & API Keys</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-rose-600 hover:bg-rose-50 font-medium"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
