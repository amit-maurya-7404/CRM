'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Organization, User, Lead, CustomFieldDefinition, UserRole, CustomModule, LayoutSectionItem } from '@/types';
import { defaultLeadSections, getDefaultSectionsForModule } from '@/lib/defaultLayouts';

interface TenantContextType {
  organizations: Organization[];
  currentOrg: Organization | null;
  currentUser: User | null;
  isLoading: boolean;
  modules: CustomModule[];
  createModule: (name: string, description?: string, icon?: string, fields?: CustomFieldDefinition[]) => Promise<boolean>;
  updateModuleLayout: (moduleSlug: string, fields: CustomFieldDefinition[]) => Promise<boolean>;
  getModuleLayout: (moduleSlug: string) => LayoutSectionItem[];
  saveModuleLayout: (moduleSlug: string, sections: LayoutSectionItem[]) => Promise<boolean>;
  addModuleRecord: (moduleSlug: string, recordData: Record<string, any>) => Promise<boolean>;
  deleteModuleRecord: (moduleSlug: string, recordId: string) => Promise<boolean>;
  switchOrganization: (orgId: string) => void;
  createOrganization: (name: string, industry: string, customFields?: CustomFieldDefinition[]) => Promise<Organization | null>;
  updateOrgSettings: (update: Partial<Organization>) => Promise<boolean>;
  refreshOrganizations: () => Promise<void>;
  login: (email: string, password?: string, orgId?: string) => Promise<{ success: boolean; organization?: Organization; user?: User; error?: string }>;
  setCurrentOrgBySlug: (slug: string) => Organization | null;
  registerBusiness: (data: {
    orgName: string;
    industry: string;
    ownerName: string;
    email: string;
    password?: string;
    phone?: string;
    currency?: string;
    currencySymbol?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  regenerateApiKey: () => Promise<string | null>;
  logout: () => void;
  updateUserProfile: (updates: { name?: string; phone?: string; email?: string; avatar?: string }) => void;
  currencySymbol: string;
  isSuperAdmin: boolean;
  createTenantCompanyWithCredentials: (data: {
    orgName: string;
    industry: string;
    ownerName: string;
    email: string;
    password?: string;
    plan?: 'starter' | 'professional' | 'enterprise';
    currency?: string;
    currencySymbol?: string;
  }) => Promise<{ success: boolean; organization?: Organization; user?: User; error?: string }>;
  toggleTenantStatus: (orgId: string, status: 'active' | 'suspended') => Promise<boolean>;
  deleteTenantOrganization: (orgId: string) => Promise<boolean>;
  updateTenantCompany: (orgId: string, updates: Partial<Organization>) => Promise<boolean>;
  loginAsTenantCompany: (orgId: string) => boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('zyntex_organizations_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return [];
  });
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronized state and localStorage updater for organizations
  const updateOrganizationsState = useCallback(
    (updater: Organization[] | ((prev: Organization[]) => Organization[])) => {
      setOrganizations((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('zyntex_organizations_cache', JSON.stringify(next));
          } catch {}
        }
        return next;
      });
    },
    []
  );

  // Helper to change current organization by slug or id and persist
  const setCurrentOrgBySlug = useCallback((slugOrId: string): Organization | null => {
    if (!slugOrId) return null;
    const org = organizations.find((o) => o.slug === slugOrId || o._id === slugOrId);
    if (org) {
      setCurrentOrg(org);
      if (typeof window !== 'undefined') {
        localStorage.setItem('active_org_id', org._id);
        localStorage.setItem('active_org_slug', org.slug);
      }
      return org;
    }
    return null;
  }, [organizations]);

  const fetchOrganizations = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/organizations?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const orgsList: Organization[] = json.data;
        updateOrganizationsState(orgsList);

        // Check if user has explicitly logged out
        const isLoggedOut = typeof window !== 'undefined' ? localStorage.getItem('zyntex_is_logged_out') : null;

        // Check path slug from URL (e.g., /travel-tribes)
        let pathSlug: string | null = null;
        if (typeof window !== 'undefined') {
          const pathSegments = window.location.pathname.split('/').filter(Boolean);
          if (pathSegments.length > 0 && !['super-admin', 'admin', 'api', 'embed'].includes(pathSegments[0])) {
            pathSlug = pathSegments[0];
          }
        }

        const pathOrg = pathSlug ? orgsList.find((o) => o.slug === pathSlug || o._id === pathSlug) : null;

        if (isLoggedOut === 'true') {
          setCurrentUser(null);
          if (pathOrg) {
            setCurrentOrg(pathOrg);
          }
          return;
        }

        // Check saved user session and saved active org
        const savedUserJson = typeof window !== 'undefined' ? localStorage.getItem('active_user_data') : null;
        const savedOrgSlug = typeof window !== 'undefined' ? localStorage.getItem('active_org_slug') : null;
        const savedOrgId = typeof window !== 'undefined' ? localStorage.getItem('active_org_id') : null;

        if (savedUserJson) {
          try {
            const parsedUser = JSON.parse(savedUserJson);
            setCurrentUser(parsedUser);

            // Match tenant org in order of priority:
            // 1. URL Path slug (if directly on company page like /travel-tribes)
            // 2. Saved active org slug
            // 3. Saved active org id
            // 4. User's assigned orgId or org slug
            const matchedOrg =
              pathOrg ||
              (savedOrgSlug ? orgsList.find((o) => o.slug === savedOrgSlug) : null) ||
              (savedOrgId ? orgsList.find((o) => o._id === savedOrgId) : null) ||
              orgsList.find((o) => o._id === parsedUser.orgId || o.slug === parsedUser.orgId) ||
              orgsList[0] ||
              null;

            if (matchedOrg) {
              setCurrentOrg(matchedOrg);
              if (typeof window !== 'undefined') {
                localStorage.setItem('active_org_id', matchedOrg._id);
                localStorage.setItem('active_org_slug', matchedOrg.slug);
              }
            }
          } catch {
            setCurrentUser(null);
          }
        } else {
          // No active user session
          if (pathOrg) {
            setCurrentOrg(pathOrg);
          } else if (savedOrgSlug) {
            const sOrg = orgsList.find((o) => o.slug === savedOrgSlug);
            if (sOrg) setCurrentOrg(sOrg);
          }
          setCurrentUser(null);
        }
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [updateOrganizationsState]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const switchOrganization = (orgId: string) => {
    const org = organizations.find((o) => o._id === orgId || o.slug === orgId);
    if (org) {
      setCurrentOrg(org);
      if (typeof window !== 'undefined') {
        localStorage.setItem('active_org_id', org._id);
        localStorage.setItem('active_org_slug', org.slug);
        localStorage.removeItem('zyntex_is_logged_out');
      }

      const adminEmail = org.adminEmail || org.ownerEmail || `admin@${org.slug}.com`;
      const user: User = {
        _id: `u_${org._id}`,
        orgId: org._id,
        name: `${org.name} Admin`,
        email: adminEmail,
        role: 'owner' as UserRole,
        phone: '+919876543210',
      };
      setCurrentUser(user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('active_user_data', JSON.stringify(user));
      }
    }
  };

  const login = async (email: string, password = '', targetOrgId?: string) => {
    const trimmedEmail = email.trim().toLowerCase();

    // 0. Super Admin / Platform Owner Quick Login
    if (trimmedEmail === 'owner@zyntex.com' || trimmedEmail === 'superadmin@zyntex.com' || trimmedEmail === 'admin@zyntex.com') {
      const superAdminUser: User = {
        _id: 'u_super_admin',
        orgId: organizations[0]?._id || '',
        name: 'Zyntex Platform Owner',
        email: trimmedEmail,
        role: 'super_admin',
        isPlatformOwner: true,
        phone: '+919876500001',
      };
      const orgToUse = currentOrg || organizations[0] || null;
      if (orgToUse) {
        setCurrentOrg(orgToUse);
        if (typeof window !== 'undefined') {
          localStorage.setItem('active_org_id', orgToUse._id);
          localStorage.setItem('active_org_slug', orgToUse.slug);
        }
      }
      setCurrentUser(superAdminUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('active_user_data', JSON.stringify(superAdminUser));
        localStorage.removeItem('zyntex_is_logged_out');
      }
      return { success: true, organization: orgToUse || undefined, user: superAdminUser };
    }

    // 1. Authenticate against MongoDB via API
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const { user, organization } = json.data;
        setCurrentOrg(organization);
        setCurrentUser(user);

        if (typeof window !== 'undefined') {
          localStorage.setItem('active_org_id', organization._id);
          localStorage.setItem('active_org_slug', organization.slug);
          localStorage.setItem('active_user_data', JSON.stringify(user));
          localStorage.removeItem('zyntex_is_logged_out');
        }
        await fetchOrganizations();
        return { success: true, organization, user };
      } else {
        return { success: false, error: json.error || 'Invalid email or password.' };
      }
    } catch (e) {
      console.warn('API login error:', e);
      return { success: false, error: 'Network error connecting to CRM authentication service.' };
    }
  };

  const loginAsTenantCompany = (orgId: string) => {
    const org = organizations.find((o) => o._id === orgId || o.slug === orgId);
    if (!org) return false;
    const adminEmail = org.adminEmail || org.ownerEmail || `admin@${org.slug}.com`;
    const user: User = {
      _id: `u_${org._id}`,
      orgId: org._id,
      name: `${org.name} Admin`,
      email: adminEmail,
      role: 'owner',
      phone: '+919876543210',
    };
    setCurrentOrg(org);
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('active_org_id', org._id);
      localStorage.setItem('active_org_slug', org.slug);
      localStorage.setItem('active_user_data', JSON.stringify(user));
      localStorage.removeItem('zyntex_is_logged_out');
    }
    return true;
  };

  const registerBusiness = async (data: {
    orgName: string;
    industry: string;
    ownerName: string;
    email: string;
    password?: string;
    phone?: string;
    currency?: string;
    currencySymbol?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const { user, organization } = json.data;
        setCurrentOrg(organization);
        setCurrentUser(user);

        if (typeof window !== 'undefined') {
          localStorage.setItem('active_org_id', organization._id);
          localStorage.setItem('active_user_data', JSON.stringify(user));
          localStorage.removeItem('zyntex_is_logged_out');
        }
        await fetchOrganizations();
        return { success: true };
      }
      return { success: false, error: json.error || 'Failed to create business account.' };
    } catch (err: any) {
      console.error('Registration network error:', err);
      return { success: false, error: err.message || 'Network error during registration.' };
    }
  };

  const regenerateApiKey = async (): Promise<string | null> => {
    if (!currentOrg) return null;
    try {
      const orgIdentifier = currentOrg.slug || currentOrg._id;
      const res = await fetch(`/api/organizations/${orgIdentifier}/regenerate-key`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success && json.data) {
        const updatedOrg = json.data.organization;
        setCurrentOrg(updatedOrg);
        setOrganizations((prev) =>
          prev.map((o) => (o._id === updatedOrg._id || o.slug === updatedOrg.slug ? updatedOrg : o))
        );
        return json.data.apiKey;
      }
      return null;
    } catch (err) {
      console.error('Error regenerating API key:', err);
      return null;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zyntex_is_logged_out', 'true');
      localStorage.removeItem('active_user_data');
    }
  };

  const updateUserProfile = (updates: { name?: string; phone?: string; email?: string; avatar?: string }) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      ...updates,
    };
    setCurrentUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('active_user_data', JSON.stringify(updatedUser));
    }
  };

  const createOrganization = async (
    name: string,
    industry: string,
    customFields: CustomFieldDefinition[] = []
  ) => {
    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          industry,
          currency: 'INR',
          currencySymbol: '₹',
          customFields,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        updateOrganizationsState((prev) => [json.data, ...prev.filter((o) => o._id !== json.data._id)]);
        await fetchOrganizations();
        switchOrganization(json.data._id);
        return json.data;
      }
      return null;
    } catch (err) {
      console.error('Error creating organization:', err);
      return null;
    }
  };

  const updateOrgSettings = async (update: Partial<Organization>): Promise<boolean> => {
    if (!currentOrg) return false;
    try {
      const res = await fetch(`/api/organizations/${currentOrg._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      const json = await res.json();
      if (json.success) {
        setCurrentOrg(json.data);
        updateOrganizationsState((prev) =>
          prev.map((o) => (o._id === json.data._id ? json.data : o))
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating organization:', err);
      return false;
    }
  };

  const refreshOrganizations = async () => {
    await fetchOrganizations();
  };

  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.isPlatformOwner === true || currentUser?.email === 'owner@zyntex.com';

  const createTenantCompanyWithCredentials = async (data: {
    orgName: string;
    industry: string;
    ownerName: string;
    email: string;
    password?: string;
    plan?: 'starter' | 'professional' | 'enterprise';
    currency?: string;
    currencySymbol?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const createdOrg = json.data.organization;
        // Immediately persist to local state and localStorage cache so it never vanishes on refresh
        updateOrganizationsState((prev) => {
          const filtered = prev.filter((o) => o._id !== createdOrg._id && o.slug !== createdOrg.slug);
          return [createdOrg, ...filtered];
        });

        await fetchOrganizations();
        return {
          success: true,
          organization: createdOrg,
          user: json.data.user,
        };
      }
      return { success: false, error: json.error || 'Failed to create company' };
    } catch (err: any) {
      console.error('Error creating tenant company:', err);
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const toggleTenantStatus = async (orgId: string, status: 'active' | 'suspended') => {
    try {
      const res = await fetch(`/api/organizations/${orgId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        updateOrganizationsState((prev) =>
          prev.map((o) => (o._id === orgId ? { ...o, status } : o))
        );
        if (currentOrg?._id === orgId) {
          setCurrentOrg((prev) => (prev ? { ...prev, status } : null));
        }
        return true;
      }
    } catch (err) {
      console.error('Error toggling tenant status:', err);
    }
    return false;
  };

  const deleteTenantOrganization = async (orgId: string) => {
    try {
      const res = await fetch(`/api/organizations/${orgId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        updateOrganizationsState((prev) => prev.filter((o) => o._id !== orgId));
        if (currentOrg?._id === orgId) {
          const remaining = organizations.filter((o) => o._id !== orgId);
          if (remaining.length > 0) {
            switchOrganization(remaining[0]._id);
          } else {
            setCurrentOrg(null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('active_org_id');
              localStorage.removeItem('active_org_slug');
            }
          }
        }
        return true;
      }
    } catch (err) {
      console.error('Error deleting organization:', err);
    }
    return false;
  };

  const updateTenantCompany = async (orgId: string, updates: Partial<Organization>) => {
    try {
      const res = await fetch(`/api/organizations/${orgId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.success) {
        updateOrganizationsState((prev) =>
          prev.map((o) => (o._id === orgId ? json.data : o))
        );
        if (currentOrg?._id === orgId) {
          setCurrentOrg(json.data);
        }
        return true;
      }
    } catch (err) {
      console.error('Error updating tenant company:', err);
    }
    return false;
  };

  const modules = currentOrg?.modules || [];

  const createModule = async (name: string, description?: string, icon?: string, fields?: CustomFieldDefinition[]) => {
    if (!currentOrg) return false;
    try {
      const res = await fetch(`/api/organizations/${currentOrg._id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_module', name, description, icon, fields }),
      });
      const json = await res.json();
      if (json.success) {
        setCurrentOrg({ ...currentOrg, modules: json.data });
        return true;
      }
    } catch (err) {
      console.error('Error creating module:', err);
    }
    return false;
  };

  const updateModuleLayout = async (moduleSlug: string, fields: CustomFieldDefinition[]) => {
    if (!currentOrg) return false;
    try {
      const res = await fetch(`/api/organizations/${currentOrg._id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_layout', moduleSlug, fields }),
      });
      const json = await res.json();
      if (json.success) {
        setCurrentOrg({ ...currentOrg, modules: json.data });
        return true;
      }
    } catch (err) {
      console.error('Error updating module layout:', err);
    }
    return false;
  };

  const addModuleRecord = async (moduleSlug: string, recordData: Record<string, any>) => {
    if (!currentOrg) return false;
    try {
      const res = await fetch(`/api/organizations/${currentOrg._id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_record', moduleSlug, recordData }),
      });
      const json = await res.json();
      if (json.success) {
        setCurrentOrg({ ...currentOrg, modules: json.data });
        return true;
      }
    } catch (err) {
      console.error('Error adding record:', err);
    }
    return false;
  };

  const deleteModuleRecord = async (moduleSlug: string, recordId: string) => {
    if (!currentOrg) return false;
    try {
      const res = await fetch(`/api/organizations/${currentOrg._id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_record', moduleSlug, recordId }),
      });
      const json = await res.json();
      if (json.success) {
        setCurrentOrg({ ...currentOrg, modules: json.data });
        return true;
      }
    } catch (err) {
      console.error('Error deleting record:', err);
    }
    return false;
  };

  const getModuleLayout = useCallback((moduleSlug: string): LayoutSectionItem[] => {
    // 1. Check currentOrg.moduleLayouts
    if (currentOrg?.moduleLayouts && currentOrg.moduleLayouts[moduleSlug]) {
      return currentOrg.moduleLayouts[moduleSlug];
    }

    // 2. Check localStorage
    if (typeof window !== 'undefined') {
      const orgId = currentOrg?._id || 'default';
      const cached = localStorage.getItem(`zyntex_layout_${orgId}_${moduleSlug}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }

    // 3. Fallbacks
    const mod = currentOrg?.modules?.find((m) => m.slug === moduleSlug);
    return getDefaultSectionsForModule(moduleSlug, mod?.name, mod?.fields);
  }, [currentOrg]);

  const saveModuleLayout = useCallback(
    async (moduleSlug: string, sections: LayoutSectionItem[]): Promise<boolean> => {
      if (!currentOrg) return false;

      const orgId = currentOrg._id;

      // 1. Save to localStorage immediately for instant sync
      if (typeof window !== 'undefined') {
        localStorage.setItem(`zyntex_layout_${orgId}_${moduleSlug}`, JSON.stringify(sections));
        // Dispatch global event for live update across all open components
        window.dispatchEvent(
          new CustomEvent('module_layout_updated', {
            detail: { moduleSlug, sections, orgId },
          })
        );
      }

      // 2. Update currentOrg state
      const updatedLayouts = {
        ...(currentOrg.moduleLayouts || {}),
        [moduleSlug]: sections,
      };

      const updatedOrg = {
        ...currentOrg,
        moduleLayouts: updatedLayouts,
      };
      setCurrentOrg(updatedOrg);

      // 3. Persist to API / MongoDB
      try {
        await fetch(`/api/organizations/${orgId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleLayouts: updatedLayouts }),
        });
        return true;
      } catch (err) {
        console.error('Failed to save layout to server:', err);
        return true;
      }
    },
    [currentOrg]
  );

  return (
    <TenantContext.Provider
      value={{
        organizations,
        currentOrg,
        currentUser,
        isLoading,
        modules,
        createModule,
        updateModuleLayout,
        getModuleLayout,
        saveModuleLayout,
        addModuleRecord,
        deleteModuleRecord,
        switchOrganization,
        createOrganization,
        updateOrgSettings,
        refreshOrganizations,
        login,
        setCurrentOrgBySlug,
        registerBusiness,
        regenerateApiKey,
        logout,
        updateUserProfile,
        currencySymbol: currentOrg?.currencySymbol || '₹',
        isSuperAdmin,
        createTenantCompanyWithCredentials,
        toggleTenantStatus,
        deleteTenantOrganization,
        updateTenantCompany,
        loginAsTenantCompany,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
