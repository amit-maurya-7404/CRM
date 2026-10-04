'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TenantProvider, useTenant } from '@/context/TenantContext';
import { Header } from '@/components/Header';
import { Sidebar, ActiveTab } from '@/components/Sidebar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { LeadsTable } from '@/components/LeadsTable';
import { LeadModal } from '@/components/LeadModal';
import { LeadDrawer } from '@/components/LeadDrawer';
import { DashboardAnalytics } from '@/components/DashboardAnalytics';
import { SettingsView } from '@/components/SettingsView';
import { IntegrationsView } from '@/components/IntegrationsView';
import { ProfileModal } from '@/components/ProfileModal';
import { AuthScreen } from '@/components/AuthScreen';
import { Lead, LeadStage, DashboardStats } from '@/types';
import {
  Kanban,
  Table,
  BarChart3,
  Sliders,
  Plus,
  Sparkles,
  Layers,
  ArrowRight,
  User,
  Globe,
} from 'lucide-react';

function CRMApp() {
  const { currentOrg, currentUser, isLoading: isOrgLoading } = useTenant();

  const [activeTab, setActiveTab] = useState<ActiveTab>('pipeline');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  // Modals & Drawer
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [drawerLead, setDrawerLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch Leads for active tenant
  const fetchLeads = useCallback(async () => {
    if (!currentOrg || !currentUser) return;
    try {
      setIsLoadingLeads(true);
      const url = new URL('/api/leads', window.location.origin);
      url.searchParams.set('orgId', currentOrg._id);
      if (searchQuery) url.searchParams.set('search', searchQuery);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setLeads(json.data);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setIsLoadingLeads(false);
    }
  }, [currentOrg, currentUser, searchQuery]);

  // Fetch Dashboard Stats for active tenant
  const fetchStats = useCallback(async () => {
    if (!currentOrg || !currentUser) return;
    try {
      const res = await fetch(`/api/stats?orgId=${currentOrg._id}`);
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [currentOrg, currentUser]);

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [fetchLeads, fetchStats]);

  // If user is not logged in, render AuthScreen
  if (isOrgLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <span className="text-sm font-medium">Loading Zyntex CRM...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  // Actions
  const handleUpdateLeadStage = async (leadId: string, newStage: LeadStage) => {
    setLeads((prev) =>
      prev.map((l) =>
        l._id === leadId ? { ...l, stage: newStage, updatedAt: new Date().toISOString() } : l
      )
    );
    if (drawerLead && drawerLead._id === leadId) {
      setDrawerLead({ ...drawerLead, stage: newStage });
    }

    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      fetchStats();
    } catch (err) {
      console.error('Error updating stage:', err);
      fetchLeads();
    }
  };

  const handleSaveLead = async (leadData: any) => {
    if (editingLead) {
      const res = await fetch(`/api/leads/${editingLead._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
      const json = await res.json();
      if (json.success) {
        setLeads((prev) => prev.map((l) => (l._id === editingLead._id ? json.data : l)));
        if (drawerLead && drawerLead._id === editingLead._id) {
          setDrawerLead(json.data);
        }
      }
    } else {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
      const json = await res.json();
      if (json.success) {
        setLeads((prev) => [json.data, ...prev]);
      }
    }
    fetchStats();
    setEditingLead(null);
  };

  const handleDeleteLead = async (leadId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this lead?')) return;

    setLeads((prev) => prev.filter((l) => l._id !== leadId));
    if (drawerLead && drawerLead._id === leadId) {
      setIsDrawerOpen(false);
      setDrawerLead(null);
    }

    try {
      await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
      fetchStats();
    } catch (err) {
      console.error('Error deleting lead:', err);
      fetchLeads();
    }
  };

  const handleOpenWhatsApp = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    setDrawerLead(lead);
    setIsDrawerOpen(true);
  };

  const handleSelectLead = (lead: Lead) => {
    setDrawerLead(lead);
    setIsDrawerOpen(true);
  };

  const handleEditLead = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const pendingFollowUps = stats?.pendingFollowUpsCount || 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        onOpenNewLeadModal={() => {
          setEditingLead(null);
          setIsModalOpen(true);
        }}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pendingFollowUps={pendingFollowUps}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          leadsCount={leads.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Mobile Tab Navigation */}
          <div className="flex md:hidden items-center justify-between mb-4 border-b border-slate-800 pb-3 gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0 ${
                activeTab === 'pipeline' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" /> Pipeline
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0 ${
                activeTab === 'leads' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Table className="h-3.5 w-3.5" /> Leads ({leads.length})
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0 ${
                activeTab === 'integrations' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Globe className="h-3.5 w-3.5" /> Forms
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0 ${
                activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" /> Reports
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0 ${
                activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" /> Settings
            </button>
          </div>

          {/* Active View Render */}
          {activeTab === 'pipeline' && (
            <KanbanBoard
              leads={leads}
              onSelectLead={handleSelectLead}
              onUpdateLeadStage={handleUpdateLeadStage}
              onOpenWhatsApp={handleOpenWhatsApp}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsTable
              leads={leads}
              onSelectLead={handleSelectLead}
              onEditLead={handleEditLead}
              onDeleteLead={handleDeleteLead}
              onOpenWhatsApp={handleOpenWhatsApp}
            />
          )}

          {activeTab === 'integrations' && <IntegrationsView />}

          {activeTab === 'dashboard' && (
            <DashboardAnalytics stats={stats} leads={leads} />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Modals & Drawers */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <LeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLead(null);
        }}
        onSave={handleSaveLead}
        initialData={editingLead}
      />

      <LeadDrawer
        isOpen={isDrawerOpen}
        lead={drawerLead}
        onClose={() => {
          setIsDrawerOpen(false);
          setDrawerLead(null);
        }}
        onUpdateLeadStage={handleUpdateLeadStage}
        onEditLead={(lead) => {
          setEditingLead(lead);
          setIsModalOpen(true);
        }}
        onDeleteLead={handleDeleteLead}
      />
    </div>
  );
}

export default function Page() {
  return (
    <TenantProvider>
      <CRMApp />
    </TenantProvider>
  );
}
