'use client';

import React, { useState, useMemo } from 'react';
import { Organization, User } from '@/types';
import { useTenant } from '@/context/TenantContext';
import {
  Shield,
  Building,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Search,
  ExternalLink,
  Users,
  Layers,
  Sparkles,
  Lock,
  Mail,
  Phone,
  Power,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  RefreshCw,
  Sliders,
  DollarSign,
  TrendingUp,
  Server,
  AlertCircle,
} from 'lucide-react';

interface SuperAdminViewProps {
  onOpenWorkspace: (orgId: string) => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({ onOpenWorkspace }) => {
  const {
    organizations,
    currentOrg,
    createTenantCompanyWithCredentials,
    toggleTenantStatus,
    deleteTenantOrganization,
    updateTenantCompany,
    refreshOrganizations,
  } = useTenant();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');

  // Visible passwords map { [orgId]: boolean }
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Copied state indicator { [key]: boolean }
  const [copiedKeys, setCopiedKeys] = useState<Record<string, boolean>>({});

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  // Success Created Modal
  const [createdCompanyResult, setCreatedCompanyResult] = useState<{
    org: Organization;
    password: string;
    email: string;
  } | null>(null);

  // Form State for Creating New Client Company
  const [newCompanyData, setNewCompanyData] = useState({
    orgName: '',
    industry: 'Travel & Tourism',
    ownerName: '',
    email: '',
    password: '',
    plan: 'professional' as 'starter' | 'professional' | 'enterprise',
    currency: 'INR',
    currencySymbol: '₹',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State for Editing Client Company
  const [editFormData, setEditFormData] = useState({
    name: '',
    adminEmail: '',
    adminPassword: '',
    plan: 'professional' as 'starter' | 'professional' | 'enterprise',
    status: 'active' as 'active' | 'suspended',
  });

  // Toggle Password visibility
  const togglePasswordVisibility = (orgId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [orgId]: !prev[orgId],
    }));
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeys((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedKeys((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  // Generate random secure password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `Zyn#${pass.slice(0, 6)}`;
  };

  // Format Client Access Message for WhatsApp/Email
  const generateClientWelcomePack = (org: Organization) => {
    const pass = org.adminPassword || 'password123';
    const email = org.adminEmail || org.ownerEmail || `admin@${org.slug}.com`;
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

    return `🎉 *Welcome to Zyntex CRM - Client Portal Access*
--------------------------------------------------
🏢 *Company Name:* ${org.name}
🌐 *CRM Portal URL:* ${appUrl}/${org.slug}
📧 *Login Email:* ${email}
🔑 *Password:* ${pass}
⚡ *Industry Setup:* ${org.industry}
🛡️ *Workspace ID:* ${org.slug} (Isolated Multi-Tenant)
--------------------------------------------------
Your CRM workspace is pre-configured with custom lead forms, deals pipeline, and booking automation.
Please log in with the credentials above to launch your dedicated CRM workspace.`;
  };

  // Filter organizations
  const filteredOrgs = useMemo(() => {
    return organizations.filter((org) => {
      if (selectedIndustry !== 'all' && org.industry !== selectedIndustry) return false;
      if (selectedPlan !== 'all' && (org.plan || 'professional') !== selectedPlan) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = org.name.toLowerCase().includes(q);
        const matchesSlug = org.slug.toLowerCase().includes(q);
        const matchesEmail = (org.ownerEmail || org.adminEmail || '').toLowerCase().includes(q);
        const matchesIndustry = org.industry.toLowerCase().includes(q);
        if (!matchesName && !matchesSlug && !matchesEmail && !matchesIndustry) return false;
      }
      return true;
    });
  }, [organizations, searchQuery, selectedIndustry, selectedPlan]);

  // Handle Create Company Submission
  const handleCreateCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newCompanyData.orgName.trim() || !newCompanyData.ownerName.trim() || !newCompanyData.email.trim()) {
      setFormError('Please fill in Company Name, Admin Name, and Login Email.');
      return;
    }

    const finalPassword = newCompanyData.password.trim() || generateRandomPassword();

    try {
      setIsSubmitting(true);
      const res = await createTenantCompanyWithCredentials({
        orgName: newCompanyData.orgName.trim(),
        industry: newCompanyData.industry,
        ownerName: newCompanyData.ownerName.trim(),
        email: newCompanyData.email.trim(),
        password: finalPassword,
        plan: newCompanyData.plan,
        currency: newCompanyData.currency,
        currencySymbol: newCompanyData.currencySymbol,
      });

      if (res.success && res.organization) {
        setIsCreateModalOpen(false);
        setCreatedCompanyResult({
          org: res.organization,
          password: finalPassword,
          email: newCompanyData.email.trim(),
        });
        setNewCompanyData({
          orgName: '',
          industry: 'Travel & Tourism',
          ownerName: '',
          email: '',
          password: '',
          plan: 'professional',
          currency: 'INR',
          currencySymbol: '₹',
        });
      } else {
        setFormError(res.error || 'Failed to create company credentials.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error creating company.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (org: Organization) => {
    setEditingOrg(org);
    setEditFormData({
      name: org.name,
      adminEmail: org.adminEmail || org.ownerEmail || '',
      adminPassword: org.adminPassword || 'password123',
      plan: org.plan || 'professional',
      status: org.status || 'active',
    });
    setIsEditModalOpen(true);
  };

  // Handle Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;

    try {
      setIsSubmitting(true);
      await updateTenantCompany(editingOrg._id, {
        name: editFormData.name.trim(),
        adminEmail: editFormData.adminEmail.trim(),
        adminPassword: editFormData.adminPassword.trim(),
        plan: editFormData.plan,
        status: editFormData.status,
      });
      setIsEditModalOpen(false);
      setEditingOrg(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Org
  const handleDeleteOrg = async (org: Organization) => {
    if (organizations.length <= 1) {
      alert('Cannot delete the last remaining organization on the platform.');
      return;
    }
    const confirmed = confirm(
      `⚠️ ARE YOU ABSOLUTELY SURE?\n\nThis will permanently delete "${org.name}" and all its isolated leads, bookings, and customer data.`
    );
    if (!confirmed) return;

    await deleteTenantOrganization(org._id);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-800 overflow-y-auto">
      {/* 1. ENTERPRISE OWNER TOP BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/40 text-white px-4 sm:px-6 py-5 shrink-0 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>👑</span> Platform Owner Control Center
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Multi-Tenant Engine Online
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Zyntex CRM Multi-Tenant Cloud</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Create and manage isolated company workspaces with independent credentials, custom module layouts, and API keys. Every client gets their own isolated CRM without data overlap.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={refreshOrganizations}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs"
              title="Refresh Tenants"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => {
                setNewCompanyData({
                  orgName: '',
                  industry: 'Travel & Tourism',
                  ownerName: '',
                  email: '',
                  password: generateRandomPassword(),
                  plan: 'professional',
                  currency: 'INR',
                  currencySymbol: '₹',
                });
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Create Company Credentials</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-xs">
            <div className="text-[10px] font-medium text-slate-300 flex items-center justify-between">
              <span>Total Client Companies</span>
              <Building className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div className="text-lg font-black text-white mt-1">{organizations.length} Tenants</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">100% Isolated Workspaces</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-xs">
            <div className="text-[10px] font-medium text-slate-300 flex items-center justify-between">
              <span>Active Organizations</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-black text-white mt-1">
              {organizations.filter((o) => (o.status || 'active') === 'active').length} Active
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">Operational Status</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-xs">
            <div className="text-[10px] font-medium text-slate-300 flex items-center justify-between">
              <span>Multi-Tenant Architecture</span>
              <Server className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <div className="text-lg font-black text-white mt-1">MongoDB Cloud</div>
            <div className="text-[10px] text-indigo-300 mt-0.5">Strict Data Isolation</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-xs">
            <div className="text-[10px] font-medium text-slate-300 flex items-center justify-between">
              <span>Current Tenant Active</span>
              <Shield className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-black text-white mt-1 truncate">{currentOrg?.name}</div>
            <div className="text-[10px] text-amber-300 mt-0.5">Logged in as Platform Owner</div>
          </div>
        </div>
      </div>

      {/* 2. FILTER & SEARCH CONTROL BAR */}
      <div className="px-4 sm:px-6 py-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company, admin email, slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-9 pr-3 text-xs rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Industry Filter */}
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="h-8 text-xs rounded border border-slate-200 bg-slate-50 px-2.5 text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="all">All Industries</option>
              <option value="Travel & Tourism">Travel & Tourism</option>
              <option value="Gym & Fitness">Gym & Fitness</option>
              <option value="Clinics & Healthcare">Clinics & Healthcare</option>
              <option value="Restaurant & Banquets">Restaurant & Banquets</option>
              <option value="Real Estate & Properties">Real Estate & Properties</option>
            </select>

            {/* Plan Filter */}
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="h-8 text-xs rounded border border-slate-200 bg-slate-50 px-2.5 text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="all">All Plans</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <span className="text-xs text-slate-400 whitespace-nowrap pl-1">
              Showing <strong>{filteredOrgs.length}</strong> companies
            </span>
          </div>
        </div>

        {/* 3. ENTERPRISE TENANT COMPANIES TABLE */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Company & Industry</th>
                  <th className="px-4 py-3">Admin Login Email</th>
                  <th className="px-4 py-3">Password (Credentials)</th>
                  <th className="px-4 py-3">Live API Key</th>
                  <th className="px-4 py-3">Plan & Status</th>
                  <th className="px-4 py-3 text-right">Owner Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      <Building className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                      <div className="text-xs font-semibold text-slate-700">No client companies matched</div>
                      <div className="text-[11px] text-slate-500">
                        Create your first client company credentials above!
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrgs.map((org) => {
                    const pass = org.adminPassword || 'password123';
                    const adminEmail = org.adminEmail || org.ownerEmail || `admin@${org.slug}.com`;
                    const isPassVisible = visiblePasswords[org._id];
                    const isCopiedPack = copiedKeys[`pack_${org._id}`];
                    const isCopiedPass = copiedKeys[`pass_${org._id}`];
                    const isCopiedEmail = copiedKeys[`email_${org._id}`];
                    const isCopiedApi = copiedKeys[`api_${org._id}`];
                    const isCurrent = currentOrg?._id === org._id;

                    return (
                      <tr
                        key={org._id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isCurrent ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        {/* Company & Industry */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                              {org.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                <span className="truncate">{org.name}</span>
                                {isCurrent && (
                                  <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded border border-blue-200">
                                    Active View
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                <span className="bg-slate-100 px-1.5 py-0.2 rounded text-slate-600 font-medium">
                                  {org.industry}
                                </span>
                                <span className="font-mono text-slate-400 truncate">id: {org.slug}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Admin Login Email */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800 text-xs truncate max-w-[170px]">
                              {adminEmail}
                            </span>
                            <button
                              onClick={() => handleCopy(adminEmail, `email_${org._id}`)}
                              className="text-slate-400 hover:text-blue-600 p-0.5 transition-colors"
                              title="Copy Email"
                            >
                              {isCopiedEmail ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Modules: {(org.modules || []).length} enabled
                          </div>
                        </td>

                        {/* Password (Credentials Box) */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded px-2 py-1 w-fit">
                            <span className="font-mono text-xs font-bold text-slate-900 min-w-[80px]">
                              {isPassVisible ? pass : '••••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(org._id)}
                              className="text-slate-400 hover:text-slate-700 p-0.5"
                              title={isPassVisible ? 'Hide Password' : 'Show Password'}
                            >
                              {isPassVisible ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleCopy(pass, `pass_${org._id}`)}
                              className="text-slate-400 hover:text-blue-600 p-0.5"
                              title="Copy Password"
                            >
                              {isCopiedPass ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* API Key */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
                            <span className="truncate max-w-[130px]">
                              {org.apiKey ? `${org.apiKey.slice(0, 14)}...` : 'Not generated'}
                            </span>
                            {org.apiKey && (
                              <button
                                onClick={() => handleCopy(org.apiKey || '', `api_${org._id}`)}
                                className="text-slate-400 hover:text-blue-600 p-0.5"
                                title="Copy Live API Key"
                              >
                                {isCopiedApi ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">Web-to-Lead Endpoint</span>
                        </td>

                        {/* Plan & Status */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                (org.plan || 'professional') === 'enterprise'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : (org.plan || 'professional') === 'professional'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {org.plan || 'pro'}
                            </span>

                            <button
                              onClick={() =>
                                toggleTenantStatus(
                                  org._id,
                                  (org.status || 'active') === 'active' ? 'suspended' : 'active'
                                )
                              }
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                                (org.status || 'active') === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              }`}
                              title="Click to toggle status"
                            >
                              {(org.status || 'active') === 'active' ? 'Active' : 'Suspended'}
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Copy Welcome Pack */}
                            <button
                              onClick={() =>
                                handleCopy(generateClientWelcomePack(org), `pack_${org._id}`)
                              }
                              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-semibold transition-colors"
                              title="Copy complete welcome message for WhatsApp or Email"
                            >
                              {isCopiedPack ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-600" />
                                  <span className="text-emerald-700 text-[11px]">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3 text-slate-500" />
                                  <span className="text-[11px]">Copy Pack</span>
                                </>
                              )}
                            </button>

                            {/* Launch / Impersonate Workspace */}
                            <button
                              onClick={() => onOpenWorkspace(org._id)}
                              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-xs font-semibold transition-colors shadow-xs"
                              title="Open this company's CRM workspace"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>Open</span>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEdit(org)}
                              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit Credentials"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteOrg(org)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Tenant Workspace"
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
        </div>
      </div>

      {/* MODAL 1: CREATE CLIENT COMPANY & CREDENTIALS */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Create Client Company Credentials</h3>
                  <p className="text-[11px] text-slate-500">
                    Creates an isolated tenant organization with login credentials
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCompanySubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Company Name */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Company / Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Safari Tours"
                    value={newCompanyData.orgName}
                    onChange={(e) =>
                      setNewCompanyData({ ...newCompanyData, orgName: e.target.value })
                    }
                    className="w-full h-8 px-2.5 rounded border border-slate-200 bg-white focus:border-blue-600 focus:outline-none text-xs"
                  />
                </div>

                {/* Industry */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Industry / Domain *</label>
                  <select
                    value={newCompanyData.industry}
                    onChange={(e) =>
                      setNewCompanyData({ ...newCompanyData, industry: e.target.value })
                    }
                    className="w-full h-8 px-2.5 rounded border border-slate-200 bg-white focus:border-blue-600 focus:outline-none text-xs"
                  >
                    <option value="Travel & Tourism">Travel & Tourism (Packages, Hotels)</option>
                    <option value="Gym & Fitness">Gym & Fitness (Memberships, Plans)</option>
                    <option value="Clinics & Healthcare">Clinics & Healthcare (Doctors, Visits)</option>
                    <option value="Restaurant & Banquets">Restaurant & Banquets (Events, Catering)</option>
                    <option value="Real Estate & Properties">Real Estate (Properties, Site visits)</option>
                    <option value="General Business">General Business CRM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Admin Name */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Client Owner / Admin Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Rathore"
                    value={newCompanyData.ownerName}
                    onChange={(e) =>
                      setNewCompanyData({ ...newCompanyData, ownerName: e.target.value })
                    }
                    className="w-full h-8 px-2.5 rounded border border-slate-200 bg-white focus:border-blue-600 focus:outline-none text-xs"
                  />
                </div>

                {/* Admin Email */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Login Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. vikram@royalsafari.com"
                    value={newCompanyData.email}
                    onChange={(e) =>
                      setNewCompanyData({ ...newCompanyData, email: e.target.value })
                    }
                    className="w-full h-8 px-2.5 rounded border border-slate-200 bg-white focus:border-blue-600 focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Assigned Password</label>
                  <button
                    type="button"
                    onClick={() =>
                      setNewCompanyData({
                        ...newCompanyData,
                        password: generateRandomPassword(),
                      })
                    }
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Generate Strong Password</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Client@2026"
                    value={newCompanyData.password}
                    onChange={(e) =>
                      setNewCompanyData({ ...newCompanyData, password: e.target.value })
                    }
                    className="w-full h-8 pl-8 pr-3 font-mono rounded border border-slate-200 bg-white focus:border-blue-600 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Plan */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Subscription Plan</label>
                  <select
                    value={newCompanyData.plan}
                    onChange={(e) =>
                      setNewCompanyData({
                        ...newCompanyData,
                        plan: e.target.value as any,
                      })
                    }
                    className="w-full h-8 px-2.5 rounded border border-slate-200 bg-white focus:border-blue-600 focus:outline-none text-xs"
                  >
                    <option value="starter">Starter Plan</option>
                    <option value="professional">Professional Plan</option>
                    <option value="enterprise">Enterprise Plan (Unlimited)</option>
                  </select>
                </div>

                {/* Currency */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Currency</label>
                  <select
                    value={newCompanyData.currency}
                    onChange={(e) => {
                      const cur = e.target.value;
                      const sym = cur === 'INR' ? '₹' : cur === 'USD' ? '$' : cur === 'EUR' ? '€' : 'د.إ';
                      setNewCompanyData({
                        ...newCompanyData,
                        currency: cur,
                        currencySymbol: sym,
                      });
                    }}
                    className="w-full h-8 px-2.5 rounded border border-slate-200 bg-white focus:border-blue-600 focus:outline-none text-xs"
                  >
                    <option value="INR">INR (₹ Indian Rupee)</option>
                    <option value="USD">USD ($ US Dollar)</option>
                    <option value="EUR">EUR (€ Euro)</option>
                    <option value="AED">AED (د.إ Dirham)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Generate Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATED CREDENTIALS SUCCESS POPUP */}
      {createdCompanyResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-xl border border-emerald-200 bg-white p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Credentials Created Successfully!
                </h3>
                <p className="text-[11px] text-slate-500">
                  Ready to share with your client company
                </p>
              </div>
            </div>

            {/* Credential summary box */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 text-slate-700">
                <span className="font-bold font-sans">Company:</span>
                <span className="font-bold text-slate-900">{createdCompanyResult.org.name}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-sans">Email:</span>
                <span className="text-blue-700 font-bold">{createdCompanyResult.email}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-sans">Password:</span>
                <span className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                  {createdCompanyResult.password}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-sans">Industry:</span>
                <span className="text-slate-700">{createdCompanyResult.org.industry}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  handleCopy(
                    generateClientWelcomePack(createdCompanyResult.org),
                    'created_copy'
                  );
                }}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs shadow-xs transition-colors"
              >
                {copiedKeys['created_copy'] ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copied WhatsApp Onboarding Message!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Client Onboarding Message</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  const orgId = createdCompanyResult.org._id;
                  setCreatedCompanyResult(null);
                  onOpenWorkspace(orgId);
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs shadow-xs transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open This Workspace Now</span>
              </button>

              <button
                onClick={() => setCreatedCompanyResult(null)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 py-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT TENANT CREDENTIALS */}
      {isEditModalOpen && editingOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Edit Credentials: {editingOrg.name}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Company Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full h-8 px-2.5 rounded border border-slate-200 bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Admin Login Email</label>
                <input
                  type="email"
                  required
                  value={editFormData.adminEmail}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, adminEmail: e.target.value })
                  }
                  className="w-full h-8 px-2.5 rounded border border-slate-200 bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Password</label>
                <input
                  type="text"
                  required
                  value={editFormData.adminPassword}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, adminPassword: e.target.value })
                  }
                  className="w-full h-8 px-2.5 font-mono rounded border border-slate-200 bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Plan</label>
                  <select
                    value={editFormData.plan}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        plan: e.target.value as any,
                      })
                    }
                    className="w-full h-8 px-2.5 rounded border border-slate-200 bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full h-8 px-2.5 rounded border border-slate-200 bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
