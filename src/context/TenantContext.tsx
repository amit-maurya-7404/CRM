'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Organization, User, Lead, CustomFieldDefinition, UserRole } from '@/types';

interface TenantContextType {
  organizations: Organization[];
  currentOrg: Organization | null;
  currentUser: User | null;
  isLoading: boolean;
  switchOrganization: (orgId: string) => void;
  createOrganization: (name: string, industry: string, customFields?: CustomFieldDefinition[]) => Promise<Organization | null>;
  updateOrgSettings: (update: Partial<Organization>) => Promise<boolean>;
  refreshOrganizations: () => Promise<void>;
  login: (email: string, password?: string, orgId?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserProfile: (updates: { name?: string; phone?: string; email?: string; avatar?: string }) => void;
  currencySymbol: string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Default Demo Users for Target Industries
const DEMO_USERS: Record<string, User> = {
  org_travel: {
    _id: 'u_1',
    orgId: 'org_travel',
    name: 'Aarav Kapoor',
    email: 'aarav@wanderlusttravel.com',
    role: 'owner',
    phone: '+919876543210',
  },
  org_gym: {
    _id: 'u_2',
    orgId: 'org_gym',
    name: 'Sameer Joshi',
    email: 'sameer@pulsefitgym.com',
    role: 'owner',
    phone: '+919811223344',
  },
  org_clinic: {
    _id: 'u_3',
    orgId: 'org_clinic',
    name: 'Dr. Neha Singhal',
    email: 'dr.neha@auracareclinic.com',
    role: 'owner',
    phone: '+919988776655',
  },
  org_restaurant: {
    _id: 'u_4',
    orgId: 'org_restaurant',
    name: 'Vikas Oberoi',
    email: 'vikas@royalbanquet.com',
    role: 'owner',
    phone: '+919123456780',
  },
  org_real_estate: {
    _id: 'u_5',
    orgId: 'org_real_estate',
    name: 'Rohan Sharma',
    email: 'rohan@apexrealty.in',
    role: 'owner',
    phone: '+919876500000',
  },
};

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrganizations = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/organizations');
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setOrganizations(json.data);

        // Check if user has explicitly logged out
        const isLoggedOut = typeof window !== 'undefined' ? localStorage.getItem('zyntex_is_logged_out') : null;

        if (isLoggedOut === 'true') {
          setCurrentUser(null);
          return;
        }

        // Check active org
        const savedOrgId = typeof window !== 'undefined' ? localStorage.getItem('active_org_id') : null;
        const matchingOrg = json.data.find((o: Organization) => o._id === savedOrgId) || json.data[0];
        setCurrentOrg(matchingOrg);

        // Check saved user or load default for matching org
        const savedUserJson = typeof window !== 'undefined' ? localStorage.getItem('active_user_data') : null;
        if (savedUserJson) {
          try {
            setCurrentUser(JSON.parse(savedUserJson));
          } catch {
            const user = DEMO_USERS[matchingOrg._id] || {
              _id: `u_${matchingOrg._id}`,
              orgId: matchingOrg._id,
              name: `${matchingOrg.name} Admin`,
              email: `admin@${matchingOrg.slug}.com`,
              role: 'owner' as UserRole,
              phone: '+919876543210',
            };
            setCurrentUser(user);
          }
        } else {
          const user = DEMO_USERS[matchingOrg._id] || {
            _id: `u_${matchingOrg._id}`,
            orgId: matchingOrg._id,
            name: `${matchingOrg.name} Admin`,
            email: `admin@${matchingOrg.slug}.com`,
            role: 'owner' as UserRole,
            phone: '+919876543210',
          };
          setCurrentUser(user);
        }
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const switchOrganization = (orgId: string) => {
    const org = organizations.find((o) => o._id === orgId);
    if (org) {
      setCurrentOrg(org);
      if (typeof window !== 'undefined') {
        localStorage.setItem('active_org_id', org._id);
        localStorage.removeItem('zyntex_is_logged_out');
      }

      const user = DEMO_USERS[org._id] || {
        _id: `u_${org._id}`,
        orgId: org._id,
        name: `${org.name} Admin`,
        email: `admin@${org.slug}.com`,
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

    // Find matching org by targetOrgId or email slug
    let matchedOrg = organizations.find((o) => o._id === targetOrgId);
    if (!matchedOrg) {
      matchedOrg = organizations.find(
        (o) => trimmedEmail.includes(o.slug.replace('-', '')) || trimmedEmail.includes(o.slug)
      ) || organizations[0];
    }

    if (!matchedOrg && organizations.length > 0) {
      matchedOrg = organizations[0];
    }

    if (!matchedOrg) {
      return { success: false, error: 'No organization found.' };
    }

    const namePart = trimmedEmail.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const user: User = DEMO_USERS[matchedOrg._id] || {
      _id: `u_${matchedOrg._id}`,
      orgId: matchedOrg._id,
      name: formattedName || 'Authorized User',
      email: trimmedEmail,
      role: trimmedEmail.includes('agent') ? 'agent' : 'owner',
      phone: '+919876543210',
    };

    setCurrentOrg(matchedOrg);
    setCurrentUser(user);

    if (typeof window !== 'undefined') {
      localStorage.setItem('active_org_id', matchedOrg._id);
      localStorage.setItem('active_user_data', JSON.stringify(user));
      localStorage.removeItem('zyntex_is_logged_out');
    }

    return { success: true };
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
      if (json.success) {
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
        setOrganizations((prev) =>
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

  return (
    <TenantContext.Provider
      value={{
        organizations,
        currentOrg,
        currentUser,
        isLoading,
        switchOrganization,
        createOrganization,
        updateOrgSettings,
        refreshOrganizations,
        login,
        logout,
        updateUserProfile,
        currencySymbol: currentOrg?.currencySymbol || '₹',
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
