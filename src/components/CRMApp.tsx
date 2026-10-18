'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/context/TenantContext';
import { Header } from '@/components/Header';
import { Sidebar, ActiveTab } from '@/components/Sidebar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { LeadsTable } from '@/components/LeadsTable';
import { LeadDetailPage } from '@/components/LeadDetailPage';
import { CustomModuleView } from '@/components/CustomModuleView';
import { CreateModuleModal } from '@/components/CreateModuleModal';
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
  Globe,
  Compass,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface CRMAppProps {
  targetOrgSlug?: string;
}

export function CRMApp({ targetOrgSlug }: CRMAppProps) {
  const {
    currentOrg,
    currentUser,
    isLoading: isOrgLoading,
    organizations,
    setCurrentOrgBySlug,
  } = useTenant();

  // If a target company slug is specified via URL (e.g. /travel-tribes), ensure it's selected in context
  useEffect(() => {
    if (targetOrgSlug && organizations.length > 0) {
      if (!currentOrg || currentOrg.slug !== targetOrgSlug) {
        setCurrentOrgBySlug(targetOrgSlug);
      }
    }
  }, [targetOrgSlug, organizations, currentOrg, setCurrentOrgBySlug]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  // Dedicated Lead Detail Page view
  const [selectedLeadDetail, setSelectedLeadDetail] = useState<Lead | null>(null);

  // Modals & Drawer
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreateModuleModalOpen, setIsCreateModuleModalOpen] = useState(false);
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

  // Helper to sync state to browser URL without full page reload
  const updateUrl = useCallback(
    (params: { tab?: string; leadId?: string | null }, replace = false) => {
      if (typeof window === 'undefined') return;
      const currentUrl = new URL(window.location.href);
      if (params.tab !== undefined) {
        currentUrl.searchParams.set('tab', params.tab);
      }
      if (params.leadId !== undefined) {
        if (params.leadId) {
          currentUrl.searchParams.set('leadId', params.leadId);
        } else {
          currentUrl.searchParams.delete('leadId');
        }
      }
      const newSearch = currentUrl.searchParams.toString();
      const newRelativePathQuery =
        currentUrl.pathname + (newSearch ? `?${newSearch}` : '');

      if (window.location.search !== (newSearch ? `?${newSearch}` : '')) {
        if (replace) {
          window.history.replaceState({ tab: params.tab, leadId: params.leadId }, '', newRelativePathQuery);
        } else {
          window.history.pushState({ tab: params.tab, leadId: params.leadId }, '', newRelativePathQuery);
        }
      }
    },
    []
  );

  // 1. Initial restoration from URL query params (on page load / refresh)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get('tab') as ActiveTab | null;
    const leadIdParam = searchParams.get('leadId');

    if (tabParam) {
      setActiveTab(tabParam);
    }

    if (leadIdParam) {
      fetch(`/api/leads/${leadIdParam}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setSelectedLeadDetail(json.data);
          }
        })
        .catch((err) => {
          console.error('Error restoring lead from URL:', err);
        });
    }
  }, []);

  // 2. Synchronize selectedLeadDetail when leads list arrives if leadId is in URL but not loaded yet
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const leadIdParam = searchParams.get('leadId');
    if (leadIdParam && !selectedLeadDetail && leads.length > 0) {
      const match = leads.find((l) => l._id === leadIdParam);
      if (match) {
        setSelectedLeadDetail(match);
      }
    }
  }, [leads, selectedLeadDetail]);

  // 3. Browser Back / Forward button navigation (popstate)
  useEffect(() => {
    const handlePopState = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = (searchParams.get('tab') as ActiveTab) || 'leads';
      const leadIdParam = searchParams.get('leadId');

      setActiveTab(tabParam);

      if (leadIdParam) {
        const found = leads.find((l) => l._id === leadIdParam);
        if (found) {
          setSelectedLeadDetail(found);
        } else {
          try {
            const res = await fetch(`/api/leads/${leadIdParam}`);
            const json = await res.json();
            if (json.success && json.data) {
              setSelectedLeadDetail(json.data);
            }
          } catch (e) {
            console.error(e);
          }
        }
      } else {
        setSelectedLeadDetail(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [leads]);

  // Reset selected lead when switching organization
  useEffect(() => {
    setSelectedLeadDetail(null);
  }, [currentOrg?._id]);

  // If loading tenant data, show clean loader
  if (isOrgLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center text-slate-600">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-sm font-medium">Loading Zyntex CRM Workspace...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show modern AuthScreen
  if (!currentUser) {
    return <AuthScreen targetOrgSlug={targetOrgSlug} />;
  }

  // If target company slug does not match any existing organization
  if (targetOrgSlug && organizations.length > 0) {
    const matched = organizations.find((o) => o.slug === targetOrgSlug || o._id === targetOrgSlug);
    if (!matched) {
      return (
        <div className="min-h-screen w-full bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-7 shadow-2xl space-y-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Workspace Not Found</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              The company workspace <strong className="text-white">/{targetOrgSlug}</strong> was not found or has been suspended. Please check the URL or contact your platform administrator.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 shadow-lg shadow-blue-500/20 transition-all"
              >
                <span>Return to CRM Portal</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Navigation handlers with URL tracking
  const handleTabChange = (tab: ActiveTab) => {
    setSelectedLeadDetail(null);
    setActiveTab(tab);
    updateUrl({ tab, leadId: null });
  };

  // Click on lead row opens the full Zoho Record Detail Page & updates URL
  const handleSelectLead = (lead: Lead) => {
    setSelectedLeadDetail(lead);
    updateUrl({ tab: activeTab, leadId: lead._id });
  };

  // Back from Lead Detail Page
  const handleBackFromLead = () => {
    setSelectedLeadDetail(null);
    updateUrl({ tab: activeTab, leadId: null });
    fetchLeads();
  };

  // Lead Pager navigation (< >)
  const handleNavigateLead = (direction: 'prev' | 'next') => {
    if (!selectedLeadDetail || leads.length === 0) return;
    const currentIndex = leads.findIndex((l) => l._id === selectedLeadDetail._id);
    if (currentIndex === -1) return;

    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0) nextIndex = leads.length - 1;
    if (nextIndex >= leads.length) nextIndex = 0;

    const targetLead = leads[nextIndex];
    if (targetLead) {
      setSelectedLeadDetail(targetLead);
      updateUrl({ tab: activeTab, leadId: targetLead._id });
    }
  };

  // Actions
  const handleUpdateLeadStage = async (leadId: string, newStage: LeadStage) => {
    setLeads((prev) =>
      prev.map((l) =>
        l._id === leadId ? { ...l, stage: newStage, updatedAt: new Date().toISOString() } : l
      )
    );
    if (selectedLeadDetail && selectedLeadDetail._id === leadId) {
      setSelectedLeadDetail((prev) => (prev ? { ...prev, stage: newStage } : null));
    }
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
        if (selectedLeadDetail && selectedLeadDetail._id === editingLead._id) {
          setSelectedLeadDetail(json.data);
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
    if (selectedLeadDetail && selectedLeadDetail._id === leadId) {
      setSelectedLeadDetail(null);
      updateUrl({ tab: activeTab, leadId: null });
    }
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
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = `Hi ${lead.name}, greetings from ${currentOrg?.name || 'our team'}! How can we assist you today?`;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleEditLead = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const pendingFollowUps = stats?.pendingFollowUpsCount || 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <Header
        onOpenNewLeadModal={() => {
          setEditingLead(null);
          setIsModalOpen(true);
        }}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenSettings={() => handleTabChange('settings')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pendingFollowUps={pendingFollowUps}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenCreateModuleModal={() => setIsCreateModuleModalOpen(true)}
          leadsCount={leads.length}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 overflow-y-auto bg-slate-50 flex flex-col ${
            selectedLeadDetail
              ? 'p-0'
              : activeTab === 'leads' || activeTab.startsWith('module_')
              ? 'p-1.5 sm:p-2.5'
              : 'p-3 sm:p-5'
          }`}
        >
          {/* If a lead is clicked, render the Full Dedicated Lead Detail Page (Zoho Style) */}
          {selectedLeadDetail ? (
            <LeadDetailPage
              lead={selectedLeadDetail}
              onBack={handleBackFromLead}
              onNavigateLead={handleNavigateLead}
              onNavigateToTab={(tab) => {
                setSelectedLeadDetail(null);
                handleTabChange(tab);
              }}
              onUpdateLeadStage={handleUpdateLeadStage}
              onEditLead={(lead) => {
                setEditingLead(lead);
                setIsModalOpen(true);
              }}
              onDeleteLead={handleDeleteLead}
              onLeadUpdated={(updated) => {
                setSelectedLeadDetail(updated);
                setLeads((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
              }}
            />
          ) : (
            <>
              {/* Mobile Tab Navigation */}
              <div className="flex md:hidden items-center justify-between mb-3 border-b border-slate-200 pb-2 gap-1 overflow-x-auto">
                <button
                  onClick={() => handleTabChange('leads')}
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold shrink-0 shadow-xs ${
                    activeTab === 'leads' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  <Table className="h-3.5 w-3.5" /> Leads ({leads.length})
                </button>
                <button
                  onClick={() => handleTabChange('pipeline')}
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold shrink-0 shadow-xs ${
                    activeTab === 'pipeline' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  <Kanban className="h-3.5 w-3.5" /> Pipeline
                </button>
                <button
                  onClick={() => handleTabChange('integrations')}
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold shrink-0 shadow-xs ${
                    activeTab === 'integrations' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" /> Forms
                </button>
                <button
                  onClick={() => handleTabChange('dashboard')}
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold shrink-0 shadow-xs ${
                    activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" /> Reports
                </button>
                <button
                  onClick={() => handleTabChange('settings')}
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold shrink-0 shadow-xs ${
                    activeTab === 'settings' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5" /> Settings
                </button>
              </div>

              {/* Active View Render */}
              {activeTab === 'leads' && (
                <LeadsTable
                  leads={leads}
                  onSelectLead={handleSelectLead}
                  onEditLead={handleEditLead}
                  onDeleteLead={handleDeleteLead}
                  onOpenWhatsApp={handleOpenWhatsApp}
                  onOpenNewLeadModal={() => {
                    setEditingLead(null);
                    setIsModalOpen(true);
                  }}
                  onSwitchView={handleTabChange}
                />
              )}

              {activeTab === 'pipeline' && (
                <KanbanBoard
                  leads={leads}
                  onSelectLead={handleSelectLead}
                  onUpdateLeadStage={handleUpdateLeadStage}
                  onOpenWhatsApp={handleOpenWhatsApp}
                />
              )}

              {/* Custom Modules View (Zoho Feature: Itineraries, Hotels, Vehicles, Bookings, etc.) */}
              {typeof activeTab === 'string' && activeTab.startsWith('module_') && (
                <CustomModuleView moduleSlug={activeTab.replace('module_', '')} />
              )}

              {activeTab === 'integrations' && <IntegrationsView />}

              {activeTab === 'dashboard' && (
                <DashboardAnalytics stats={stats} leads={leads} />
              )}

              {activeTab === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <CreateModuleModal
        isOpen={isCreateModuleModalOpen}
        onClose={() => setIsCreateModuleModalOpen(false)}
        onModuleCreated={(slug) => {
          handleTabChange(`module_${slug}`);
          fetchLeads();
        }}
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
    </div>
  );
}
