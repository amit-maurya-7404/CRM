'use client';

import React, { useState, useMemo } from 'react';
import { Lead, LeadStage, LeadPriority } from '@/types';
import { useTenant } from '@/context/TenantContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Download,
  Filter,
  Phone,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Edit2,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Plus,
  LayoutList,
  Kanban,
  Check,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Clock,
  Sparkles,
  ExternalLink,
  Flame,
  Snowflake,
  SunMedium,
  Send,
} from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onEditLead: (lead: Lead, e: React.MouseEvent) => void;
  onDeleteLead: (leadId: string, e: React.MouseEvent) => Promise<void>;
  onOpenWhatsApp: (lead: Lead, e: React.MouseEvent) => void;
  onOpenNewLeadModal?: () => void;
  onSwitchView?: (view: 'pipeline' | 'leads' | 'integrations' | 'dashboard') => void;
}

type SortField = 'name' | 'createdAt' | 'value' | 'stage';
type SortOrder = 'asc' | 'desc';

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  onSelectLead,
  onEditLead,
  onDeleteLead,
  onOpenWhatsApp,
  onOpenNewLeadModal,
  onSwitchView,
}) => {
  const { currentOrg, currencySymbol } = useTenant();

  // Zoho-style UI State: Closed by default
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedFilterKey, setSelectedFilterKey] = useState<string>('open');
  const [filterSearchQuery, setFilterSearchQuery] = useState('');
  const [systemFilters, setSystemFilters] = useState<{
    hasPhone: boolean;
    hasEmail: boolean;
    highPriority: boolean;
    websiteOnly: boolean;
    hasFollowUp: boolean;
  }>({
    hasPhone: false,
    hasEmail: false,
    highPriority: false,
    websiteOnly: false,
    hasFollowUp: false,
  });

  // Table Sorting & Pagination
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Row Selection (Bulk actions)
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);

  // Dynamic filter counts
  const filterCounts = useMemo(() => {
    return {
      open: leads.filter((l) => l.stage !== 'won' && l.stage !== 'lost' && !l.customFields?.converted_to_booking).length,
      all: leads.length,
      new: leads.filter((l) => l.stage === 'new').length,
      contacted: leads.filter((l) => l.stage === 'contacted').length,
      meeting: leads.filter((l) => l.stage === 'meeting').length,
      proposal: leads.filter((l) => l.stage === 'proposal').length,
      won: leads.filter((l) => l.stage === 'won' || l.customFields?.converted_to_booking).length,
      lost: leads.filter((l) => l.stage === 'lost').length,
      hot: leads.filter((l) => l.priority === 'urgent' || l.priority === 'high').length,
      warm: leads.filter((l) => l.priority === 'medium').length,
      cold: leads.filter((l) => l.priority === 'low').length,
    };
  }, [leads]);

  // Filtering Logic
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Saved filter key
      if (selectedFilterKey === 'open' && (lead.stage === 'won' || lead.stage === 'lost' || lead.customFields?.converted_to_booking)) return false;
      if (selectedFilterKey === 'new' && lead.stage !== 'new') return false;
      if (selectedFilterKey === 'contacted' && lead.stage !== 'contacted') return false;
      if (selectedFilterKey === 'meeting' && lead.stage !== 'meeting') return false;
      if (selectedFilterKey === 'proposal' && lead.stage !== 'proposal') return false;
      if (selectedFilterKey === 'won' && lead.stage !== 'won' && !lead.customFields?.converted_to_booking) return false;
      if (selectedFilterKey === 'lost' && lead.stage !== 'lost') return false;
      if (selectedFilterKey === 'hot' && lead.priority !== 'urgent' && lead.priority !== 'high') return false;
      if (selectedFilterKey === 'warm' && lead.priority !== 'medium') return false;
      if (selectedFilterKey === 'cold' && lead.priority !== 'low') return false;

      // Filter sidebar quick search
      if (filterSearchQuery.trim()) {
        const q = filterSearchQuery.toLowerCase();
        const matchesName = lead.name.toLowerCase().includes(q);
        const matchesPhone = lead.phone.toLowerCase().includes(q);
        const matchesEmail = (lead.email || '').toLowerCase().includes(q);
        const matchesCompany = (lead.company || '').toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesEmail && !matchesCompany) return false;
      }

      // System defined checkboxes
      if (systemFilters.hasPhone && !lead.phone) return false;
      if (systemFilters.hasEmail && !lead.email) return false;
      if (systemFilters.highPriority && lead.priority !== 'high' && lead.priority !== 'urgent') return false;
      if (systemFilters.websiteOnly && lead.source !== 'website') return false;
      if (systemFilters.hasFollowUp && !lead.nextFollowUp) return false;

      return true;
    });
  }, [leads, selectedFilterKey, filterSearchQuery, systemFilters]);

  // Sorting Logic
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'value') {
        comparison = (a.value || 0) - (b.value || 0);
      } else if (sortField === 'stage') {
        comparison = a.stage.localeCompare(b.stage);
      } else {
        // createdAt
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredLeads, sortField, sortOrder]);

  // Pagination
  const totalRecords = sortedLeads.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedLeads.slice(start, start + pageSize);
  }, [sortedLeads, currentPage, pageSize]);

  // Handle Sort Change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Row selection
  const isAllSelected =
    paginatedLeads.length > 0 && paginatedLeads.every((l) => selectedLeadIds.includes(l._id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(paginatedLeads.map((l) => l._id));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Export CSV
  const exportToCSV = (onlySelected = false) => {
    const targetLeads = onlySelected
      ? leads.filter((l) => selectedLeadIds.includes(l._id))
      : filteredLeads;

    if (targetLeads.length === 0) return;

    const headers = [
      'Name',
      'Mobile',
      'Email',
      'Company',
      'Stage',
      'Value',
      'Priority',
      'Source',
      ...(currentOrg?.customFields?.map((f) => f.label) || []),
      'Next Follow-Up',
      'Created Date',
    ];

    const rows = targetLeads.map((l) => {
      const customFieldValues = (currentOrg?.customFields || []).map(
        (f) => `"${(l.customFields?.[f.key] ?? '').toString().replace(/"/g, '""')}"`
      );

      return [
        `"${l.name}"`,
        `"${l.phone}"`,
        `"${l.email || ''}"`,
        `"${l.company || ''}"`,
        `"${l.stage}"`,
        l.value || 0,
        `"${l.priority}"`,
        `"${l.source}"`,
        ...customFieldValues,
        `"${l.nextFollowUp ? formatDate(l.nextFollowUp) : ''}"`,
        `"${formatDate(l.createdAt)}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${currentOrg?.slug || 'crm'}_leads_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedLeadIds.length} selected lead(s)?`)) return;
    for (const id of selectedLeadIds) {
      await onDeleteLead(id, {} as any);
    }
    setSelectedLeadIds([]);
  };

  // Stage Badge Render
  const renderStagePill = (stage: LeadStage) => {
    switch (stage) {
      case 'won':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Closed Won
          </span>
        );
      case 'proposal':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 border border-purple-200">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            Proposal
          </span>
        );
      case 'meeting':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Meeting
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 border border-sky-200">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            Contacted
          </span>
        );
      case 'lost':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Lost
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            New Lead
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
      {/* 1. Zoho Sub-Toolbar (Leads Title, Filter Toggle, Sort, View Modes, Create Lead) */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2 shrink-0">
        {/* Left Side: View Name + Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">Leads</h1>
            <div className="relative">
              <button
                onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-800 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 px-2 py-0.5 rounded transition-colors"
              >
                <span>
                  {selectedFilterKey === 'open'
                    ? 'Open Leads (Active)'
                    : selectedFilterKey === 'all'
                    ? 'All Leads'
                    : selectedFilterKey === 'won'
                    ? 'Converted to Bookings'
                    : selectedFilterKey === 'lost'
                    ? 'Lost Leads'
                    : selectedFilterKey.charAt(0).toUpperCase() + selectedFilterKey.slice(1)}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {isViewDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsViewDropdownOpen(false)} />
                  <div className="absolute left-0 mt-1 z-40 w-52 rounded border border-slate-200 bg-white p-1 shadow-lg text-xs space-y-0.5 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => { setSelectedFilterKey('open'); setIsViewDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left ${selectedFilterKey === 'open' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                      <span>Open Leads (Active)</span>
                      <span className="text-[10px] text-slate-400">{filterCounts.open}</span>
                    </button>
                    <button
                      onClick={() => { setSelectedFilterKey('all'); setIsViewDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left ${selectedFilterKey === 'all' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                      <span>All Leads</span>
                      <span className="text-[10px] text-slate-400">{filterCounts.all}</span>
                    </button>
                    <button
                      onClick={() => { setSelectedFilterKey('won'); setIsViewDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left ${selectedFilterKey === 'won' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                      <span>Converted to Bookings</span>
                      <span className="text-[10px] text-emerald-600 font-bold">{filterCounts.won}</span>
                    </button>
                    <button
                      onClick={() => { setSelectedFilterKey('new'); setIsViewDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left ${selectedFilterKey === 'new' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                      <span>New Leads</span>
                      <span className="text-[10px] text-slate-400">{filterCounts.new}</span>
                    </button>
                    <button
                      onClick={() => { setSelectedFilterKey('proposal'); setIsViewDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left ${selectedFilterKey === 'proposal' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                      <span>Proposal Sent</span>
                      <span className="text-[10px] text-slate-400">{filterCounts.proposal}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
            <span className="text-xs text-slate-400">•</span>
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              isFilterPanelOpen
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:bg-slate-100 border border-transparent'
            }`}
            title="Toggle Filter Pane"
          >
            <Filter className="h-3.5 w-3.5 text-blue-600" />
            <span>Filter</span>
          </button>

          {/* Sort Dropdown Button */}
          <div className="relative group">
            <button
              onClick={() => handleSort('createdAt')}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Change Sorting"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
              <span>Sort</span>
            </button>
          </div>

          {/* View Mode Switchers (Zoho List vs Kanban vs Reports) */}
          <div className="hidden sm:flex items-center border-l border-slate-200 pl-2 gap-1 text-slate-500">
            <button
              title="Table List View"
              onClick={() => onSwitchView?.('leads')}
              className="p-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <LayoutList className="h-3.5 w-3.5" />
            </button>
            <button
              title="Kanban Board View"
              onClick={() => onSwitchView?.('pipeline')}
              className="p-1 rounded text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Kanban className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side: Split Create Lead Button & More Action */}
        <div className="flex items-center gap-2">
          {/* Quick Export CSV */}
          <button
            onClick={() => exportToCSV(false)}
            title="Export Records to CSV"
            className="hidden md:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-slate-200 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>

          {/* Zoho Split Button: Create Lead */}
          <div className="inline-flex rounded shadow-xs">
            <button
              onClick={onOpenNewLeadModal}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-l transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Lead</span>
            </button>
            <button
              onClick={onOpenNewLeadModal}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-1.5 py-1.5 border-l border-blue-500 rounded-r transition-colors"
              title="Create Options"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* More actions dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
              title="More Actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {isMoreMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsMoreMenuOpen(false)} />
                <div className="absolute right-0 mt-1 z-30 w-44 rounded border border-slate-200 bg-white py-1 shadow-lg text-xs">
                  <button
                    onClick={() => {
                      exportToCSV(false);
                      setIsMoreMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export All Leads</span>
                  </button>
                  <button
                    onClick={() => {
                      onSwitchView?.('integrations');
                      setIsMoreMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Web-to-Lead Forms</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Header when rows are checked */}
      {selectedLeadIds.length > 0 && (
        <div className="flex items-center justify-between bg-blue-50 border-b border-blue-200 px-3 py-1.5 text-xs text-blue-900 animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
              {selectedLeadIds.length}
            </span>
            <span>lead(s) selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToCSV(true)}
              className="flex items-center gap-1 bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 font-medium"
            >
              <Download className="h-3 w-3" />
              <span>Export Selected</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 bg-white border border-rose-200 text-rose-700 px-2 py-1 rounded hover:bg-rose-50 font-medium"
            >
              <Trash2 className="h-3 w-3" />
              <span>Delete Selected</span>
            </button>
            <button
              onClick={() => setSelectedLeadIds([])}
              className="text-xs text-slate-500 hover:text-slate-800 underline px-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* 2. Zoho Main Content Split: Left Filter Panel + Right Table */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT FILTER PANEL (Collapsible, exact Zoho structure) */}
        {isFilterPanelOpen && (
          <aside className="w-56 shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between overflow-y-auto text-xs text-slate-700 animate-in slide-in-from-left-2 duration-150">
            <div className="p-3 space-y-4">
              {/* Section: Saved Filters */}
              <div>
                <div className="flex items-center justify-between pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100">
                  <div className="flex items-center gap-1">
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                    <span>Saved Filters</span>
                    <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.2 rounded ml-1">
                      9
                    </span>
                  </div>
                  <button
                    onClick={() => setIsFilterPanelOpen(false)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Close Filter Panel"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-0.5 mt-1">
                  {[
                    { key: 'open', label: 'Open Leads (Active)', count: filterCounts.open },
                    { key: 'all', label: 'All Leads', count: filterCounts.all },
                    { key: 'won', label: 'Converted to Bookings', count: filterCounts.won },
                    { key: 'new', label: 'New Leads', count: filterCounts.new },
                    { key: 'contacted', label: 'Contacted', count: filterCounts.contacted },
                    { key: 'meeting', label: 'Meeting Scheduled', count: filterCounts.meeting },
                    { key: 'proposal', label: 'Proposal Sent', count: filterCounts.proposal },
                    { key: 'lost', label: 'Lost Deals', count: filterCounts.lost },
                    { key: 'hot', label: 'Hot Leads', count: filterCounts.hot, icon: <Flame className="h-3 w-3 text-rose-500" /> },
                    { key: 'warm', label: 'Warm Leads', count: filterCounts.warm, icon: <SunMedium className="h-3 w-3 text-amber-500" /> },
                    { key: 'cold', label: 'Cold Leads', count: filterCounts.cold, icon: <Snowflake className="h-3 w-3 text-blue-400" /> },
                  ].map((filter) => {
                    const isSelected = selectedFilterKey === filter.key;
                    return (
                      <button
                        key={filter.key}
                        onClick={() => setSelectedFilterKey(filter.key)}
                        className={`flex w-full items-center justify-between px-2 py-1 rounded text-xs transition-colors ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {filter.icon}
                          <span className="truncate">{filter.label}</span>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                            isSelected
                              ? 'bg-blue-200/70 text-blue-900 font-bold'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {filter.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section: Filter Leads by (Search input) */}
              <div>
                <div className="text-[11px] font-bold text-slate-600 mb-1.5">Filter Leads by</div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search in leads..."
                    value={filterSearchQuery}
                    onChange={(e) => setFilterSearchQuery(e.target.value)}
                    className="w-full h-7 pl-8 pr-2 text-xs rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Section: System Defined Filters (Checkboxes) */}
              <div>
                <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                  <span>System Defined Filters</span>
                </div>
                <div className="space-y-1.5 pl-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={systemFilters.highPriority}
                      onChange={(e) =>
                        setSystemFilters({ ...systemFilters, highPriority: e.target.checked })
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                    />
                    <span>High Priority</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={systemFilters.hasPhone}
                      onChange={(e) =>
                        setSystemFilters({ ...systemFilters, hasPhone: e.target.checked })
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                    />
                    <span>Has Phone Number</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={systemFilters.hasEmail}
                      onChange={(e) =>
                        setSystemFilters({ ...systemFilters, hasEmail: e.target.checked })
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                    />
                    <span>Has Email Address</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={systemFilters.websiteOnly}
                      onChange={(e) =>
                        setSystemFilters({ ...systemFilters, websiteOnly: e.target.checked })
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                    />
                    <span>Website Ingestion (API)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={systemFilters.hasFollowUp}
                      onChange={(e) =>
                        setSystemFilters({ ...systemFilters, hasFollowUp: e.target.checked })
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                    />
                    <span>Follow-Up Scheduled</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Filter Reset Button */}
            {(selectedFilterKey !== 'all' ||
              filterSearchQuery ||
              Object.values(systemFilters).some(Boolean)) && (
              <div className="p-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedFilterKey('all');
                    setFilterSearchQuery('');
                    setSystemFilters({
                      hasPhone: false,
                      hasEmail: false,
                      highPriority: false,
                      websiteOnly: false,
                      hasFollowUp: false,
                    });
                  }}
                  className="w-full text-center text-xs text-blue-600 hover:text-blue-800 font-semibold py-1 bg-blue-50 rounded"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </aside>
        )}

        {/* RIGHT MAIN DATA TABLE (Zoho high-density table) */}
        <div className="flex-1 flex flex-col justify-between overflow-x-auto bg-white min-w-0">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50/95 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <tr>
                  {/* Select All Checkbox */}
                  <th className="w-9 px-3 py-2 text-center border-r border-slate-100">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                    />
                  </th>

                  {/* Lead Name */}
                  <th
                    onClick={() => handleSort('name')}
                    className="px-3 py-2 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Lead Name</span>
                      <ChevronDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>

                  {/* Mobile Phone */}
                  <th className="px-3 py-2 font-semibold text-slate-700">Mobile</th>

                  {/* Email */}
                  <th className="px-3 py-2 font-semibold text-slate-700">Email</th>

                  {/* Dynamic Organization Custom Field (e.g. Requirement / Itinerary) */}
                  {(currentOrg?.customFields || []).slice(0, 1).map((f) => (
                    <th key={f.id} className="px-3 py-2 font-semibold text-slate-700">
                      {f.label}
                    </th>
                  ))}

                  {/* Deal Value */}
                  <th
                    onClick={() => handleSort('value')}
                    className="px-3 py-2 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Deal Value</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>

                  {/* Stage / Status */}
                  <th
                    onClick={() => handleSort('stage')}
                    className="px-3 py-2 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Stage</span>
                      <ChevronDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>

                  {/* Lead Source */}
                  <th className="px-3 py-2 font-semibold text-slate-700">Source</th>

                  {/* Next Follow Up */}
                  <th className="px-3 py-2 font-semibold text-slate-700">Follow-Up</th>

                  {/* Actions (Hover) */}
                  <th className="w-24 px-3 py-2 text-right font-semibold text-slate-700">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-16 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <div className="h-10 w-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <Search className="h-5 w-5" />
                        </div>
                        <div className="text-xs font-semibold text-slate-700">No leads found</div>
                        <div className="text-[11px] text-slate-500">
                          Try adjusting your filters or click Create Lead to add one.
                        </div>
                        <button
                          onClick={onOpenNewLeadModal}
                          className="mt-2 inline-flex items-center gap-1 bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-medium shadow-xs"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Create Lead</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => {
                    const isSelected = selectedLeadIds.includes(lead._id);
                    return (
                      <tr
                        key={lead._id}
                        onClick={() => onSelectLead(lead)}
                        className={`group transition-colors cursor-pointer text-xs ${
                          isSelected ? 'bg-blue-50/70' : 'hover:bg-blue-50/35'
                        }`}
                      >
                        {/* Checkbox */}
                        <td
                          className="px-3 py-2 text-center border-r border-slate-100"
                          onClick={(e) => toggleSelectRow(lead._id, e)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                          />
                        </td>

                        {/* Lead Name (Clickable Blue Link, Zoho Style) */}
                        <td className="px-3 py-2 font-medium">
                          <div className="flex items-center gap-1.5">
                            <span className="text-blue-600 hover:text-blue-800 hover:underline font-semibold truncate max-w-[170px]">
                              {lead.name}
                            </span>
                            {lead.company && (
                              <span className="text-[11px] text-slate-600 truncate max-w-[100px] hidden lg:inline">
                                ({lead.company})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Mobile Phone (with Zoho call / WhatsApp icons) */}
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <span>{lead.phone}</span>
                            <button
                              title="Chat on WhatsApp"
                              onClick={(e) => onOpenWhatsApp(lead, e)}
                              className="text-emerald-600 hover:text-emerald-700 p-0.5 rounded hover:bg-emerald-50 transition-colors"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </button>
                            <a
                              href={`tel:${lead.phone}`}
                              title="Call"
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-700 p-0.5 rounded hover:bg-blue-50 transition-colors"
                            >
                              <Phone className="h-3 w-3" />
                            </a>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-3 py-2 text-slate-600 truncate max-w-[180px]">
                          {lead.email ? (
                            <span className="truncate">{lead.email}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Dynamic Custom Field Value */}
                        {(currentOrg?.customFields || []).slice(0, 1).map((f) => (
                          <td key={f.id} className="px-3 py-2 text-slate-600 truncate max-w-[160px]">
                            {lead.customFields?.[f.key] ? (
                              <span className="truncate">{lead.customFields[f.key]}</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        ))}

                        {/* Deal Value */}
                        <td className="px-3 py-2 font-bold text-slate-900 whitespace-nowrap">
                          {lead.value > 0 ? (
                            formatCurrency(lead.value, currencySymbol)
                          ) : (
                            <span className="text-slate-400 font-normal">-</span>
                          )}
                        </td>

                        {/* Stage */}
                        <td className="px-3 py-2 whitespace-nowrap">{renderStagePill(lead.stage)}</td>

                        {/* Source */}
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded capitalize">
                            {lead.source}
                          </span>
                        </td>

                        {/* Next Follow Up */}
                        <td className="px-3 py-2 whitespace-nowrap text-slate-500 text-[11px]">
                          {lead.nextFollowUp ? (
                            <span className="flex items-center gap-1 text-amber-700 font-medium">
                              <Clock className="h-3 w-3" />
                              {formatDate(lead.nextFollowUp)}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Action Icons (Zoho hover options) */}
                        <td className="px-3 py-2 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              title="Edit Lead"
                              onClick={(e) => onEditLead(lead, e)}
                              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              title="Delete Lead"
                              onClick={(e) => onDeleteLead(lead._id, e)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 3. Zoho Bottom Status Bar (Total Records & Pagination) */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/90 px-3 py-2 text-xs text-slate-600 shrink-0">
            {/* Total Records Count (exact Zoho text) */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                Total Records {totalRecords}
              </span>
              {selectedFilterKey !== 'all' && (
                <span className="text-[10px] text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded font-medium">
                  Filtered
                </span>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-3">
              {/* Page size dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="hidden sm:inline">Records per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Prev / Next Page Indicator */}
              <div className="flex items-center gap-1 font-medium text-slate-700">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span>
                  {totalRecords === 0
                    ? '0'
                    : `${(currentPage - 1) * pageSize + 1} to ${Math.min(
                        currentPage * pageSize,
                        totalRecords
                      )}`}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Next Page"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
