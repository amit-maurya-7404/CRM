'use client';

import React, { useState } from 'react';
import { useTenant } from '@/context/TenantContext';
import {
  Building2,
  ChevronDown,
  Plus,
  Search,
  Sparkles,
  Bell,
  CheckCircle2,
  Layers,
  ArrowRight,
  User,
  LogOut,
} from 'lucide-react';

interface HeaderProps {
  onOpenNewLeadModal: () => void;
  onOpenProfileModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  pendingFollowUps: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewLeadModal,
  onOpenProfileModal,
  searchQuery,
  onSearchChange,
  pendingFollowUps,
}) => {
  const { organizations, currentOrg, switchOrganization, currentUser, logout } = useTenant();
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 sm:px-6 backdrop-blur-xl">
      {/* Left: Brand & Tenant Switcher */}
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950 font-bold text-white text-sm">
              <Layers className="h-4 w-4 text-indigo-400" />
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white text-base">Zyntex CRM</span>
              <span className="rounded-full bg-indigo-500/10 px-1.5 py-0.5 font-medium text-[10px] text-indigo-400 border border-indigo-500/20">
                Multi-Tenant
              </span>
            </div>
          </div>
        </div>

        {/* Tenant Selector Button */}
        <div className="relative">
          <button
            onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-all shadow-sm"
          >
            <Building2 className="h-3.5 w-3.5 text-indigo-400" />
            <span className="max-w-[120px] sm:max-w-[180px] truncate font-semibold text-white">
              {currentOrg?.name || 'Select Company'}
            </span>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isOrgDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Org Dropdown Menu */}
          {isOrgDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOrgDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 z-50 w-72 rounded-xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Company (Tenant)
                </div>
                <div className="space-y-1 my-1">
                  {organizations.map((org) => {
                    const isSelected = org._id === currentOrg?._id;
                    return (
                      <button
                        key={org._id}
                        onClick={() => {
                          switchOrganization(org._id);
                          setIsOrgDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-medium'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="truncate">
                          <div className="font-semibold">{org.name}</div>
                          <div className="text-[10px] text-slate-400">{org.industry}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 border-t border-slate-800 pt-2 text-[11px] text-slate-400 px-2 flex items-center justify-between">
                  <span>Isolated Database</span>
                  <span className="text-indigo-400">Multi-tenant</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Middle: Search Bar */}
      <div className="hidden lg:flex items-center relative w-72 xl:w-96">
        <Search className="absolute left-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search leads by name, phone, email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 w-full rounded-lg border border-slate-700/80 bg-slate-800/40 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800 focus:outline-none transition-all"
        />
      </div>

      {/* Right: Actions & User Info */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Pending Follow-ups bell */}
        <div className="relative">
          <button
            title={`${pendingFollowUps} follow-ups scheduled`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Bell className="h-4 w-4" />
            {pendingFollowUps > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm shadow-rose-500/50 animate-pulse">
                {pendingFollowUps}
              </span>
            )}
          </button>
        </div>

        {/* Add Lead Primary Button */}
        <button
          onClick={onOpenNewLeadModal}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/35 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add New Lead</span>
          <span className="sm:hidden">New</span>
        </button>

        {/* User Profile Menu Button */}
        <div className="relative border-l border-slate-800 pl-2 sm:pl-3">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-800/60 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-sm">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-900 font-bold text-xs text-indigo-300">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            <div className="hidden xl:block text-left text-xs pr-1">
              <div className="font-semibold text-white truncate max-w-[100px]">{currentUser?.name || 'User'}</div>
              <div className="text-[10px] text-slate-400 capitalize">{currentUser?.role || 'Admin'}</div>
            </div>
            <ChevronDown className="hidden xl:block h-3 w-3 text-slate-400" />
          </button>

          {/* User dropdown menu */}
          {isUserMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsUserMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 z-50 w-56 rounded-xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-800">
                  <div className="font-semibold text-xs text-white truncate">{currentUser?.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{currentUser?.email}</div>
                  <div className="mt-1 text-[10px] font-medium text-emerald-400">{currentOrg?.name}</div>
                </div>

                <div className="space-y-1 my-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenProfileModal();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <User className="h-3.5 w-3.5 text-indigo-400" />
                    <span>My Profile & Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
