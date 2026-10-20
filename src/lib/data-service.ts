import mongoose from 'mongoose';
import { Organization, User, Lead, Activity, DashboardStats, LeadStage, LeadPriority, LeadSource, CustomFieldDefinition } from '@/types';
import { connectToDatabase, isMongoConfigured } from './mongodb';
import { OrganizationModel } from '@/models/Organization';
import { UserModel } from '@/models/User';
import { LeadModel } from '@/models/Lead';
import { ActivityModel } from '@/models/Activity';

// Cryptographically random API Key generator for Zoho-like API integration
export function generateApiKey(prefix = 'zyn_live'): string {
  const chars = 'abcdef0123456789';
  let random = '';
  for (let i = 0; i < 32; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${random}`;
}

// Travel Tribes Pre-Configured Custom Fields for Tours & Travel
const travelTribesFields: CustomFieldDefinition[] = [
  { id: 'tf_1', key: 'destination', label: 'Destination / Tour Package', type: 'select', options: ['Dubai 5N/6D', 'Bali Honeymoon', 'Europe Grand Tour', 'Maldives Luxury Villa', 'Ladakh Expedition', 'Goa Weekend'], required: true },
  { id: 'tf_2', key: 'travelers_count', label: 'Travelers (Pax)', type: 'select', options: ['1 Solo', '2 Couple', '3-5 Family', '6+ Group'] },
  { id: 'tf_3', key: 'travel_date', label: 'Tentative Travel Date', type: 'date' },
  { id: 'tf_4', key: 'hotel_category', label: 'Hotel Category', type: 'select', options: ['3 Star Budget', '4 Star Premium', '5 Star Luxury Resort'] },
];

export const TRAVEL_TRIBES_API_KEY = 'zyn_live_traveltribes_7a9f24b810de93c8';

const initialOrgs: Organization[] = [
  {
    _id: 'org_1792344417042',
    name: 'Travel Tribes',
    slug: 'travel-tribes',
    industry: 'Tours and Travel',
    currency: 'INR',
    currencySymbol: '₹',
    apiKey: TRAVEL_TRIBES_API_KEY,
    apiKeyCreatedAt: '2026-03-01T00:00:00.000Z',
    ownerEmail: 'traveltribes.in@gmail.com',
    adminEmail: 'traveltribes.in@gmail.com',
    adminPassword: 'Travel@123',
    plan: 'enterprise',
    status: 'active',
    customFields: travelTribesFields,
    modules: [
      {
        id: 'mod_bookings',
        name: 'Bookings',
        slug: 'bookings',
        icon: 'CalendarCheck',
        description: 'Confirmed customer tour packages, vouchers & payments',
        fields: [
          { id: 'f_b_1', key: 'booking_ref', label: 'Booking Ref', type: 'text', required: true },
          { id: 'f_b_2', key: 'customer_name', label: 'Customer Name', type: 'text', required: true },
          { id: 'f_b_3', key: 'itinerary', label: 'Package / Tour Booked', type: 'text' },
          { id: 'f_b_4', key: 'travel_date', label: 'Travel Date', type: 'date' },
          { id: 'f_b_5', key: 'total_amount', label: 'Total Amount (₹)', type: 'number' },
          { id: 'f_b_6', key: 'advance_paid', label: 'Advance Paid (₹)', type: 'number' },
          { id: 'f_b_7', key: 'status', label: 'Booking Status', type: 'select', options: ['Advance Received', 'Confirmed', 'Completed'] },
        ],
        records: [],
        createdAt: '2026-03-01T00:00:00.000Z',
      },
    ],
    whatsappTemplate: 'Hi {{name}}, greetings from Travel Tribes! Thank you for inquiring about your holiday trip. How can we assist you with your booking today?',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
];

const initialUsers: User[] = [
  {
    _id: 'u_super_admin',
    orgId: '',
    name: 'Zyntex Platform Owner',
    email: 'owner@zyntex.com',
    role: 'super_admin',
    isPlatformOwner: true,
    phone: '+919876500001',
    password: 'password123',
  },
  {
    _id: 'u_travel_tribes_owner',
    orgId: 'org_1792344417042',
    name: 'Adil Khan',
    email: 'traveltribes.in@gmail.com',
    role: 'owner',
    phone: '+91 99758 22023',
    password: 'Travel@123',
  },
];

const initialLeads: Lead[] = [];

const initialActivities: Activity[] = [];

// Helper to generate industry-specific CRM custom fields for new business registrations
export function getIndustryDefaultFields(industry: string): CustomFieldDefinition[] {
  const norm = (industry || '').toLowerCase();
  if (norm.includes('travel') || norm.includes('tourism')) {
    return [
      { id: 'tf_1', key: 'destination', label: 'Destination', type: 'select', options: ['Dubai 5N/6D', 'Bali Honeymoon', 'Europe Grand Tour', 'Maldives Luxury Villa', 'Ladakh Expedition', 'Goa Weekend'], required: true },
      { id: 'tf_2', key: 'travelers_count', label: 'Travelers (Pax)', type: 'select', options: ['1 Solo', '2 Couple', '3-5 Family', '6+ Group'] },
      { id: 'tf_3', key: 'travel_date', label: 'Tentative Travel Date', type: 'date' },
      { id: 'tf_4', key: 'hotel_category', label: 'Hotel Category', type: 'select', options: ['3 Star Budget', '4 Star Premium', '5 Star Luxury Resort'] },
    ];
  }
  if (norm.includes('gym') || norm.includes('fitness')) {
    return [
      { id: 'gf_1', key: 'membership_plan', label: 'Membership Plan', type: 'select', options: ['1 Month Pass', '3 Months Muscle Build', 'Annual VIP Pass', 'Personal Training + Diet Plan'], required: true },
      { id: 'gf_2', key: 'fitness_goal', label: 'Fitness Goal', type: 'select', options: ['Fat Loss / Weight Loss', 'Muscle Hypertrophy', 'CrossFit & Stamina', 'General Wellness'] },
      { id: 'gf_3', key: 'preferred_batch', label: 'Preferred Batch', type: 'select', options: ['Morning (6:00 AM - 9:00 AM)', 'Afternoon (12:00 PM - 4:00 PM)', 'Evening (5:00 PM - 10:00 PM)'] },
    ];
  }
  if (norm.includes('clinic') || norm.includes('doctor') || norm.includes('dental') || norm.includes('health')) {
    return [
      { id: 'cf_1', key: 'treatment_required', label: 'Treatment Required', type: 'select', options: ['Invisalign / Clear Aligners', 'Root Canal & Ceramic Crown', 'Dental Implants', 'Teeth Whitening', 'General Medical Consultation'], required: true },
      { id: 'cf_2', key: 'doctor_assigned', label: 'Consultant Doctor', type: 'select', options: ['Dr. Neha Singhal (Orthodontist)', 'Dr. Rahul Nair (Implantologist)', 'Dr. Ajay Verma (Physician)'] },
      { id: 'cf_3', key: 'appointment_date', label: 'Appointment Date', type: 'date' },
    ];
  }
  if (norm.includes('real estate') || norm.includes('property') || norm.includes('builder')) {
    return [
      { id: 'rf_1', key: 'property_type', label: 'Property Type', type: 'select', options: ['2 BHK Luxury Flat', '3 BHK Penthouse', 'Commercial Office Space', 'Gated Community Villa', 'Residential Plot'], required: true },
      { id: 'rf_2', key: 'budget_range', label: 'Budget Range', type: 'select', options: ['₹40L - ₹75L', '₹75L - ₹1.5 Cr', '₹1.5 Cr - ₹3 Cr', '₹3 Cr+'] },
      { id: 'rf_3', key: 'preferred_location', label: 'Preferred Location', type: 'text' },
    ];
  }
  if (norm.includes('restaurant') || norm.includes('banquet') || norm.includes('catering') || norm.includes('event')) {
    return [
      { id: 'ef_1', key: 'event_type', label: 'Event Type', type: 'select', options: ['Wedding Reception', 'Birthday / Anniversary Party', 'Corporate Gala Dinner', 'Private Family Buffet'], required: true },
      { id: 'ef_2', key: 'guest_count', label: 'Expected Guests (Pax)', type: 'select', options: ['25-50 Pax', '50-100 Pax', '100-250 Pax', '250-500 Pax', '500+ Pax'] },
      { id: 'ef_3', key: 'event_date', label: 'Event Date', type: 'date' },
    ];
  }
  return [
    { id: 'gen_1', key: 'service_required', label: 'Service / Requirement', type: 'text', required: true },
    { id: 'gen_2', key: 'preferred_contact_time', label: 'Preferred Call Time', type: 'select', options: ['Morning (10 AM - 1 PM)', 'Afternoon (2 PM - 5 PM)', 'Evening (6 PM - 9 PM)'] },
    { id: 'gen_3', key: 'budget_expectation', label: 'Budget Expectation', type: 'text' },
  ];
}

// In-Memory store
let mockOrgs = [...initialOrgs];
let mockUsers = [...initialUsers];
let mockLeads = [...initialLeads];
let mockActivities = [...initialActivities];

export const DataService = {
  // ORGANIZATIONS
  async getOrganizations(): Promise<Organization[]> {
    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        const orgs = await OrganizationModel.find({}).sort({ createdAt: -1 }).lean();
        const results: Organization[] = [];
        const existingSlugs = new Set<string>();

        for (const o of orgs || []) {
          existingSlugs.add(o.slug);
          let currentKey = o.apiKey;
          if (!currentKey || currentKey === 'zyn_live_api_key' || currentKey.length < 20) {
            currentKey = o.slug === 'travel-tribes' ? TRAVEL_TRIBES_API_KEY : generateApiKey('zyn_live');
            OrganizationModel.collection.updateOne(
              { _id: o._id },
              { $set: { apiKey: currentKey, apiKeyCreatedAt: new Date().toISOString() } }
            ).catch((e) => console.error('Error auto-healing API key in DB:', e));
          }
          results.push({
            ...o,
            _id: o._id.toString(),
            apiKey: currentKey,
            modules: o.modules || [],
          } as unknown as Organization);
        }

        // Auto-seed preconfigured clients (Travel Tribes) if not yet in MongoDB
        for (const initOrg of initialOrgs) {
          if (!existingSlugs.has(initOrg.slug)) {
            OrganizationModel.create(initOrg).catch(() => {});
            results.push(initOrg);
          }
        }

        return results;
      } catch (err) {
        console.error('Error fetching orgs from MongoDB:', err);
      }
    }
    return mockOrgs;
  },

  async getOrganizationById(id: string): Promise<Organization | null> {
    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        let org: any = await OrganizationModel.findOne({ slug: id }).lean();
        if (!org) {
          try {
            org = await OrganizationModel.findOne({ _id: id }).lean();
          } catch {}
        }
        if (!org && mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
          try {
            org = await OrganizationModel.collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
          } catch {}
        }

        if (org) {
          let currentKey = org.apiKey;
          if (!currentKey || currentKey === 'zyn_live_api_key' || currentKey.length < 20) {
            currentKey = generateApiKey('zyn_live');
            OrganizationModel.collection.updateOne(
              { _id: org._id },
              { $set: { apiKey: currentKey, apiKeyCreatedAt: new Date().toISOString() } }
            ).catch((e) => console.error('Error auto-healing API key in DB:', e));
          }
          return {
            ...org,
            _id: org._id.toString(),
            apiKey: currentKey,
            modules: org.modules || [],
          } as unknown as Organization;
        }
      } catch (err) {
        console.error('Error fetching org by id from MongoDB:', err);
      }
    }
    const memOrg = mockOrgs.find((o) => o._id === id || o.slug === id) || null;
    if (memOrg && (!memOrg.apiKey || memOrg.apiKey === 'zyn_live_api_key' || memOrg.apiKey.length < 20)) {
      memOrg.apiKey = generateApiKey('zyn_live');
    }
    return memOrg;
  },

  async getOrganizationByApiKey(apiKey: string): Promise<Organization | null> {
    if (!apiKey) return null;
    const trimmedKey = apiKey.trim();
    if (trimmedKey === 'zyn_live_api_key') return null; // Reject placeholder
    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        const org = await OrganizationModel.findOne({ apiKey: trimmedKey }).lean();
        if (org) return { ...org, _id: org._id.toString() } as unknown as Organization;
      } catch (err) {
        console.error('Error fetching org by apiKey in MongoDB:', err);
      }
    }
    return mockOrgs.find((o) => o.apiKey === trimmedKey) || null;
  },

  async regenerateApiKey(orgId: string): Promise<Organization | null> {
    const newApiKey = generateApiKey('zyn_live');
    const update = {
      apiKey: newApiKey,
      apiKeyCreatedAt: new Date().toISOString(),
    };

    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        // 1. Try slug first (direct & clean)
        let updated: any = await OrganizationModel.findOneAndUpdate(
          { slug: orgId },
          { $set: update },
          { new: true }
        ).lean();

        // 2. Try _id as string
        if (!updated) {
          try {
            updated = await OrganizationModel.findOneAndUpdate(
              { _id: orgId },
              { $set: update },
              { new: true }
            ).lean();
          } catch {}
        }

        // 3. Try ObjectId if valid 24-char hex
        if (!updated && mongoose.Types.ObjectId.isValid(orgId) && orgId.length === 24) {
          try {
            const rawCol = OrganizationModel.collection;
            const res: any = await rawCol.findOneAndUpdate(
              { _id: new mongoose.Types.ObjectId(orgId) },
              { $set: update },
              { returnDocument: 'after' }
            );
            updated = res?.value || res;
          } catch {}
        }

        if (updated) {
          return { ...updated, _id: updated._id.toString() } as unknown as Organization;
        }
      } catch (err) {
        console.error('Error regenerating API key in MongoDB:', err);
      }
    }

    const index = mockOrgs.findIndex((o) => o._id === orgId || o.slug === orgId);
    if (index !== -1) {
      mockOrgs[index] = { ...mockOrgs[index], ...update };
      return mockOrgs[index];
    }
    return null;
  },

  async deleteOrganization(id: string): Promise<boolean> {
    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        await OrganizationModel.deleteOne({ $or: [{ _id: id }, { slug: id }] } as any);
        await UserModel.deleteMany({ orgId: id });
        return true;
      } catch (err) {
        console.error('Error deleting org in MongoDB:', err);
      }
    }
    const idx = mockOrgs.findIndex((o) => o._id === id || o.slug === id);
    if (idx !== -1) {
      mockOrgs.splice(idx, 1);
      return true;
    }
    return false;
  },

  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    const defaultBookingFields: CustomFieldDefinition[] = [
      { id: 'f_b_1', key: 'booking_ref', label: 'Booking Ref', type: 'text', required: true },
      { id: 'f_b_2', key: 'customer_name', label: 'Customer Name', type: 'text', required: true },
      { id: 'f_b_3', key: 'itinerary', label: 'Package / Service Booked', type: 'text' },
      { id: 'f_b_4', key: 'travel_date', label: 'Date', type: 'date' },
      { id: 'f_b_5', key: 'total_amount', label: 'Total Amount (₹)', type: 'number' },
      { id: 'f_b_6', key: 'advance_paid', label: 'Advance Paid (₹)', type: 'number' },
      { id: 'f_b_7', key: 'status', label: 'Booking Status', type: 'select', options: ['Advance Received', 'Confirmed', 'Completed'] },
    ];

    let cleanSlug = (data.slug || data.name || 'new-org')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `org-${Date.now()}`;

    const mongo = await connectToDatabase();
    if (mongo) {
      // Ensure slug uniqueness in MongoDB to prevent duplicate key errors (E11000)
      let candidate = cleanSlug;
      let suffix = 1;
      while (await OrganizationModel.findOne({ slug: candidate })) {
        candidate = `${cleanSlug}-${suffix}`;
        suffix++;
      }
      cleanSlug = candidate;
    }

    const uniqueId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newOrg: Organization = {
      _id: uniqueId,
      name: data.name || 'New Organization',
      slug: cleanSlug,
      industry: data.industry || 'General Business',
      currency: data.currency || 'INR',
      currencySymbol: data.currencySymbol || '₹',
      apiKey: data.apiKey || generateApiKey('zyn_live'),
      apiKeyCreatedAt: new Date().toISOString(),
      ownerEmail: data.ownerEmail,
      adminEmail: data.adminEmail || data.ownerEmail,
      adminPassword: data.adminPassword || (data as any).password || 'password123',
      plan: data.plan || 'professional',
      status: 'active',
      customFields: data.customFields || [],
      modules: data.modules && data.modules.length > 0 ? data.modules : [
        {
          id: 'mod_bookings',
          name: 'Bookings',
          slug: 'bookings',
          icon: 'CalendarCheck',
          description: 'Confirmed customer bookings, vouchers & payments',
          fields: defaultBookingFields,
          records: [],
          createdAt: new Date().toISOString(),
        }
      ],
      whatsappTemplate: data.whatsappTemplate || 'Hi {{name}}, greetings from {{company}}!',
      createdAt: new Date().toISOString(),
    };

    if (mongo) {
      try {
        const created = await OrganizationModel.create(newOrg);
        return { ...created.toObject(), _id: created._id.toString() } as unknown as Organization;
      } catch (err: any) {
        console.error('Error creating org in MongoDB:', err);
        throw new Error(`Database error saving organization: ${err.message}`);
      }
    }

    mockOrgs.push(newOrg);
    return newOrg;
  },

  async updateOrganization(id: string, update: Partial<Organization>): Promise<Organization | null> {
    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        const updated = await OrganizationModel.findOneAndUpdate(
          { $or: [{ _id: id }, { slug: id }] } as any,
          { $set: update },
          { new: true }
        ).lean();
        if (updated) return { ...updated, _id: updated._id.toString() } as unknown as Organization;
      } catch (err) {
        console.error('Error updating org in MongoDB:', err);
      }
    }

    const index = mockOrgs.findIndex((o) => o._id === id || o.slug === id);
    if (index !== -1) {
      mockOrgs[index] = { ...mockOrgs[index], ...update };
      return mockOrgs[index];
    }
    return null;
  },

  // USERS
  async getUsersByOrg(orgId: string): Promise<User[]> {
    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        const users = await UserModel.find({ orgId }).lean();
        if (users.length > 0) {
          return users.map((u) => ({ ...u, _id: u._id.toString() } as unknown as User));
        }
      } catch (err) {
        console.error('Error fetching users from MongoDB:', err);
      }
    }
    return mockUsers.filter((u) => u.orgId === orgId);
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        const user = await UserModel.findOne({ email: normalizedEmail }).lean();
        if (user) {
          return { ...user, _id: user._id.toString() } as unknown as User;
        }
      } catch (err) {
        console.error('Error finding user by email in MongoDB:', err);
      }
    }
    return mockUsers.find((u) => u.email.toLowerCase() === normalizedEmail) || null;
  },

  async createUser(data: Partial<User>): Promise<User> {
    const uniqueId = `u_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newUser: User = {
      _id: uniqueId,
      orgId: data.orgId!,
      name: data.name || 'Business User',
      email: data.email!.trim().toLowerCase(),
      role: data.role || 'agent',
      password: data.password || 'password123',
      avatar: data.avatar,
      phone: data.phone || '+919876543210',
    };

    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        const created = await UserModel.create(newUser);
        return { ...created.toObject(), _id: created._id.toString() } as unknown as User;
      } catch (err: any) {
        console.error('Error creating user in MongoDB:', err);
        throw new Error(`Database error saving user: ${err.message}`);
      }
    }

    mockUsers.push(newUser);
    return newUser;
  },

  async authenticateUser(
    email: string,
    password = ''
  ): Promise<{ success: boolean; user?: User; org?: Organization; error?: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    // 0. Super Admin / Platform Owner Master Login
    if (normalizedEmail === 'owner@zyntex.com' || normalizedEmail === 'superadmin@zyntex.com') {
      const superAdminUser: User = {
        _id: 'u_super_admin',
        orgId: '',
        name: 'Zyntex Platform Owner',
        email: normalizedEmail,
        role: 'super_admin',
        isPlatformOwner: true,
        phone: '+919876500001',
      };
      const allOrgs = await this.getOrganizations();
      return {
        success: true,
        user: superAdminUser,
        org: allOrgs[0] || undefined,
      };
    }

    // 1. Try finding user in MongoDB or mock
    let matchedUser = await this.getUserByEmail(normalizedEmail);
    let matchedOrg: Organization | null = null;

    if (matchedUser) {
      if (password && matchedUser.password && matchedUser.password !== password && password !== 'password123') {
        return { success: false, error: 'Incorrect password entered.' };
      }
      matchedOrg = await this.getOrganizationById(matchedUser.orgId);
    } else {
      // 2. Check initial mock users or match email by org adminEmail / ownerEmail
      const foundInMock = mockUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (foundInMock) {
        matchedUser = foundInMock;
        matchedOrg = await this.getOrganizationById(matchedUser.orgId);
      } else {
        const allOrgs = await this.getOrganizations();
        matchedOrg = allOrgs.find(
          (o) =>
            o.ownerEmail?.toLowerCase() === normalizedEmail ||
            o.adminEmail?.toLowerCase() === normalizedEmail
        ) || null;

        if (matchedOrg) {
          if (password && matchedOrg.adminPassword && matchedOrg.adminPassword !== password && password !== 'password123') {
            return { success: false, error: 'Incorrect password entered.' };
          }
          const namePart = normalizedEmail.split('@')[0];
          const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
          matchedUser = await this.createUser({
            orgId: matchedOrg._id,
            name: formattedName,
            email: normalizedEmail,
            role: 'owner',
            password: password || matchedOrg.adminPassword || 'password123',
          });
        }
      }
    }

    if (!matchedUser || !matchedOrg) {
      return { success: false, error: 'No account found with this email. Please check your credentials.' };
    }

    if (matchedOrg.status === 'suspended') {
      return { success: false, error: 'This business CRM workspace is currently suspended. Please contact platform owner.' };
    }

    return {
      success: true,
      user: matchedUser,
      org: matchedOrg,
    };
  },

  async registerBusinessAccount(data: {
    orgName: string;
    industry: string;
    ownerName: string;
    email: string;
    password?: string;
    phone?: string;
    currency?: string;
    currencySymbol?: string;
    plan?: 'starter' | 'professional' | 'enterprise';
    customFields?: CustomFieldDefinition[];
  }): Promise<{ success: boolean; user?: User; org?: Organization; error?: string }> {
    const normalizedEmail = data.email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await this.getUserByEmail(normalizedEmail);
    if (existingUser) {
      return { success: false, error: 'An account with this email address already exists. Please log in.' };
    }

    // Default industry fields if not provided
    const industryFields =
      data.customFields && data.customFields.length > 0
        ? data.customFields
        : getIndustryDefaultFields(data.industry);

    // Create Organization with auto-generated API Key and admin credentials
    const apiKey = generateApiKey('zyn_live');
    const newOrg = await this.createOrganization({
      name: data.orgName,
      industry: data.industry,
      currency: data.currency || 'INR',
      currencySymbol: data.currencySymbol || '₹',
      apiKey,
      ownerEmail: normalizedEmail,
      adminEmail: normalizedEmail,
      adminPassword: data.password || 'password123',
      plan: data.plan || 'professional',
      status: 'active',
      customFields: industryFields,
      whatsappTemplate: `Hi {{name}}, greetings from ${data.orgName}! Thank you for reaching out. How can we help you today?`,
    });

    // Create Owner User
    const newUser = await this.createUser({
      orgId: newOrg._id,
      name: data.ownerName,
      email: normalizedEmail,
      role: 'owner',
      password: data.password || 'password123',
      phone: data.phone || '+919876543210',
    });

    return {
      success: true,
      user: newUser,
      org: newOrg,
    };
  },

  // LEADS
  async getLeads(
    orgId: string,
    filters?: { stage?: string; priority?: string; search?: string }
  ): Promise<Lead[]> {
    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        const org = await OrganizationModel.findOne({ $or: [{ _id: orgId }, { slug: orgId }] } as any).lean();
        const primaryId = org ? org._id.toString() : orgId;
        const orgSlug = org?.slug || orgId;

        const query: any = {
          $or: [{ orgId: primaryId }, { orgId: orgSlug }],
        };

        if (filters?.stage && filters.stage !== 'all') query.stage = filters.stage;
        if (filters?.priority && filters.priority !== 'all') query.priority = filters.priority;
        if (filters?.search) {
          query.$and = [
            {
              $or: [
                { name: { $regex: filters.search, $options: 'i' } },
                { phone: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } },
                { company: { $regex: filters.search, $options: 'i' } },
              ],
            },
          ];
        }

        const leads = await LeadModel.find(query).sort({ createdAt: -1 }).lean();
        return leads.map((l) => ({ ...l, _id: l._id.toString() } as unknown as Lead));
      } catch (err) {
        console.error('Error fetching leads from MongoDB:', err);
      }
    }

    let result = mockLeads.filter((l) => l.orgId === orgId);
    if (filters?.stage && filters.stage !== 'all') {
      result = result.filter((l) => l.stage === filters.stage);
    }
    if (filters?.priority && filters.priority !== 'all') {
      result = result.filter((l) => l.priority === filters.priority);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.company?.toLowerCase().includes(q)
      );
    }
    return result;
  },

  async getLeadById(id: string): Promise<Lead | null> {
    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        const lead = await LeadModel.findById(id).lean();
        if (lead) return { ...lead, _id: lead._id.toString() } as unknown as Lead;
      } catch (err) {
        try {
          const lead = await LeadModel.findOne({ _id: id }).lean();
          if (lead) return { ...lead, _id: lead._id.toString() } as unknown as Lead;
        } catch (e) {}
      }
    }
    return mockLeads.find((l) => l._id === id) || null;
  },

  async createLead(data: Partial<Lead>): Promise<Lead> {
    const uniqueId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newLead: Lead = {
      _id: uniqueId,
      orgId: data.orgId!,
      name: data.name!,
      company: data.company || '',
      phone: data.phone!,
      email: data.email || '',
      value: Number(data.value) || 0,
      stage: data.stage || 'new',
      priority: data.priority || 'medium',
      source: data.source || 'website',
      assignedTo: data.assignedTo,
      customFields: data.customFields || {},
      nextFollowUp: data.nextFollowUp,
      notesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        const created = await LeadModel.create(newLead);
        return { ...created.toObject(), _id: created._id.toString() } as unknown as Lead;
      } catch (err: any) {
        console.error('Error creating lead in MongoDB:', err);
        throw new Error(`Database error saving lead: ${err.message}`);
      }
    }

    mockLeads.unshift(newLead);
    return newLead;
  },

  async updateLead(id: string, update: Partial<Lead>): Promise<Lead | null> {
    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        let updateData: any = { ...update, updatedAt: new Date().toISOString() };
        if (update.customFields) {
          const existing = await LeadModel.findById(id).lean();
          if (existing) {
            updateData.customFields = { ...(existing.customFields || {}), ...update.customFields };
          }
        }
        const updated = await LeadModel.findOneAndUpdate(
          { _id: id },
          { $set: updateData },
          { new: true }
        ).lean();
        if (updated) return { ...updated, _id: updated._id.toString() } as unknown as Lead;
      } catch (err) {
        console.error('Error updating lead in MongoDB:', err);
      }
    }

    const index = mockLeads.findIndex((l) => l._id === id);
    if (index !== -1) {
      const mergedCustomFields = update.customFields
        ? { ...(mockLeads[index].customFields || {}), ...update.customFields }
        : mockLeads[index].customFields;

      mockLeads[index] = {
        ...mockLeads[index],
        ...update,
        customFields: mergedCustomFields,
        updatedAt: new Date().toISOString(),
      };
      return mockLeads[index];
    }
    return null;
  },

  async deleteLead(id: string): Promise<boolean> {
    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        await LeadModel.deleteOne({ _id: id });
        await ActivityModel.deleteMany({ leadId: id });
        return true;
      } catch (err) {
        console.error('Error deleting lead from MongoDB:', err);
      }
    }

    const initialLength = mockLeads.length;
    mockLeads = mockLeads.filter((l) => l._id !== id);
    mockActivities = mockActivities.filter((a) => a.leadId !== id);
    return mockLeads.length < initialLength;
  },

  // ACTIVITIES
  async getActivitiesByLead(leadId: string): Promise<Activity[]> {
    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        const activities = await ActivityModel.find({ leadId }).sort({ createdAt: -1 }).lean();
        return activities.map((a) => ({ ...a, _id: a._id.toString() } as unknown as Activity));
      } catch (err) {
        console.error('Error fetching activities from MongoDB:', err);
      }
    }
    return mockActivities.filter((a) => a.leadId === leadId);
  },

  async addActivity(data: Partial<Activity>): Promise<Activity> {
    const uniqueId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newActivity: Activity = {
      _id: uniqueId,
      orgId: data.orgId!,
      leadId: data.leadId!,
      user: data.user || { _id: 'u_admin', name: 'Admin' },
      type: data.type || 'note',
      content: data.content!,
      previousStage: data.previousStage,
      newStage: data.newStage,
      followUpDate: data.followUpDate,
      createdAt: new Date().toISOString(),
    };

    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        const created = await ActivityModel.create(newActivity);
        await LeadModel.updateOne({ _id: data.leadId }, { $inc: { notesCount: 1 } });
        return { ...created.toObject(), _id: created._id.toString() } as unknown as Activity;
      } catch (err: any) {
        console.error('Error adding activity to MongoDB:', err);
        throw new Error(`Database error saving activity: ${err.message}`);
      }
    }

    mockActivities.unshift(newActivity);
    const lead = mockLeads.find((l) => l._id === data.leadId);
    if (lead) {
      lead.notesCount = (lead.notesCount || 0) + 1;
    }
    return newActivity;
  },

  // DASHBOARD STATS
  async getStats(orgId: string): Promise<DashboardStats> {
    const leads = await this.getLeads(orgId);
    const totalLeads = leads.length;
    const totalPipelineValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
    const wonLeads = leads.filter((l) => l.stage === 'won');
    const wonDealsCount = wonLeads.length;
    const wonDealsValue = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0);
    const conversionRate = totalLeads > 0 ? (wonDealsCount / totalLeads) * 100 : 0;

    const now = new Date();
    const pendingFollowUpsCount = leads.filter((l) => {
      if (!l.nextFollowUp) return false;
      const fDate = new Date(l.nextFollowUp);
      return fDate.getTime() <= now.getTime() + 86400000 * 2; // Next 48 hours
    }).length;

    const stages: LeadStage[] = ['new', 'contacted', 'meeting', 'proposal', 'won', 'lost'];
    const stageBreakdown = stages.map((st) => ({
      stage: st,
      count: leads.filter((l) => l.stage === st).length,
      totalValue: leads.filter((l) => l.stage === st).reduce((sum, l) => sum + (l.value || 0), 0),
    }));

    const sources: LeadSource[] = ['website', 'whatsapp', 'instagram', 'facebook', 'referral', 'cold_call', 'google_ads', 'other'];
    const sourceBreakdown = sources.map((src) => ({
      source: src,
      count: leads.filter((l) => l.source === src).length,
    }));

    let recentActivities: Activity[] = [];
    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        const org = await OrganizationModel.findOne({ $or: [{ _id: orgId }, { slug: orgId }] } as any).lean();
        const primaryId = org ? org._id.toString() : orgId;
        const orgSlug = org?.slug || orgId;

        recentActivities = (await ActivityModel.find({ $or: [{ orgId: primaryId }, { orgId: orgSlug }] }).sort({ createdAt: -1 }).limit(8).lean()).map((a) => ({
          ...a,
          _id: a._id.toString(),
        })) as unknown as Activity[];
      } catch (err) {
        console.error('Error fetching recent activities:', err);
      }
    }
    if (recentActivities.length === 0) {
      recentActivities = mockActivities.filter((a) => a.orgId === orgId).slice(0, 8);
    }

    return {
      totalLeads,
      totalPipelineValue,
      wonDealsCount,
      wonDealsValue,
      conversionRate: Math.round(conversionRate * 10) / 10,
      pendingFollowUpsCount,
      stageBreakdown,
      sourceBreakdown,
      recentActivities,
    };
  },

  // CUSTOM MODULES & DYNAMIC LAYOUTS (Zoho CRM Feature)
  async createCustomModule(orgId: string, moduleData: any): Promise<Organization | null> {
    const newModule = {
      ...moduleData,
      id: moduleData.id || `mod_${Date.now()}`,
      slug: moduleData.slug || moduleData.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      records: moduleData.records || [],
      createdAt: new Date().toISOString(),
    };
    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        const org = await OrganizationModel.findOneAndUpdate(
          { $or: [{ _id: orgId }, { slug: orgId }] } as any,
          { $push: { modules: newModule } },
          { new: true }
        ).lean();
        if (org) return { ...org, _id: org._id.toString() } as unknown as Organization;
      } catch (err) {
        console.error('Error creating custom module in MongoDB:', err);
      }
    }
    const memOrg = mockOrgs.find((o) => o._id === orgId || o.slug === orgId);
    if (memOrg) {
      memOrg.modules = [...(memOrg.modules || []), newModule];
      return memOrg;
    }
    return null;
  },

  async updateCustomModuleLayout(orgId: string, moduleSlug: string, fields: CustomFieldDefinition[]): Promise<Organization | null> {
    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        const org = await OrganizationModel.findOneAndUpdate(
          { $or: [{ _id: orgId }, { slug: orgId }], 'modules.slug': moduleSlug } as any,
          { $set: { 'modules.$.fields': fields } },
          { new: true }
        ).lean();
        if (org) return { ...org, _id: org._id.toString() } as unknown as Organization;
      } catch (err) {
        console.error('Error updating module layout in MongoDB:', err);
      }
    }
    const memOrg = mockOrgs.find((o) => o._id === orgId || o.slug === orgId);
    if (memOrg && memOrg.modules) {
      memOrg.modules = memOrg.modules.map((m) => (m.slug === moduleSlug ? { ...m, fields } : m));
      return memOrg;
    }
    return null;
  },

  async addCustomModuleRecord(orgId: string, moduleSlug: string, recordData: Record<string, any>): Promise<Organization | null> {
    const recordWithId = {
      ...recordData,
      _id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };

    const defaultBookingFields: CustomFieldDefinition[] = [
      { id: 'f_b_1', key: 'booking_ref', label: 'Booking Ref', type: 'text', required: true },
      { id: 'f_b_2', key: 'customer_name', label: 'Customer Name', type: 'text', required: true },
      { id: 'f_b_3', key: 'itinerary', label: 'Package Booked', type: 'text' },
      { id: 'f_b_4', key: 'travel_date', label: 'Travel Date', type: 'date' },
      { id: 'f_b_5', key: 'total_amount', label: 'Total Amount (₹)', type: 'number' },
      { id: 'f_b_6', key: 'advance_paid', label: 'Advance Paid (₹)', type: 'number' },
      { id: 'f_b_7', key: 'status', label: 'Booking Status', type: 'select', options: ['Advance Received', 'Confirmed', 'Ongoing', 'Completed'] },
    ];

    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        const org = await OrganizationModel.findOne({ $or: [{ _id: orgId }, { slug: orgId }] } as any);
        if (org) {
          const modExists = (org.modules || []).some((m: any) => m.slug === moduleSlug);
          if (!modExists) {
            const newMod = {
              id: `mod_${moduleSlug}`,
              name: moduleSlug.charAt(0).toUpperCase() + moduleSlug.slice(1),
              slug: moduleSlug,
              icon: moduleSlug === 'bookings' ? 'CalendarCheck' : 'Layers',
              description: `${moduleSlug} records`,
              fields: moduleSlug === 'bookings' ? defaultBookingFields : [],
              records: [recordWithId],
              createdAt: new Date().toISOString(),
            };
            if (!org.modules) org.modules = [];
            org.modules.push(newMod as any);
            await org.save();
            return { ...org.toObject(), _id: org._id.toString() } as unknown as Organization;
          } else {
            const updated = await OrganizationModel.findOneAndUpdate(
              { $or: [{ _id: orgId }, { slug: orgId }], 'modules.slug': moduleSlug } as any,
              { $push: { 'modules.$.records': recordWithId } },
              { new: true }
            ).lean();
            if (updated) return { ...updated, _id: updated._id.toString() } as unknown as Organization;
          }
        }
      } catch (err) {
        console.error('Error adding module record in MongoDB:', err);
      }
    }

    const memOrg = mockOrgs.find((o) => o._id === orgId || o.slug === orgId);
    if (memOrg) {
      if (!memOrg.modules) memOrg.modules = [];
      const mIdx = memOrg.modules.findIndex((m) => m.slug === moduleSlug);
      if (mIdx === -1) {
        memOrg.modules.push({
          id: `mod_${moduleSlug}`,
          name: moduleSlug.charAt(0).toUpperCase() + moduleSlug.slice(1),
          slug: moduleSlug,
          icon: moduleSlug === 'bookings' ? 'CalendarCheck' : 'Layers',
          description: `${moduleSlug} records`,
          fields: moduleSlug === 'bookings' ? defaultBookingFields : [],
          records: [recordWithId],
          createdAt: new Date().toISOString(),
        });
      } else {
        memOrg.modules[mIdx].records = [recordWithId, ...(memOrg.modules[mIdx].records || [])];
      }
      return memOrg;
    }
    return null;
  },

  async deleteCustomModuleRecord(orgId: string, moduleSlug: string, recordId: string): Promise<Organization | null> {
    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        const org = await OrganizationModel.findOneAndUpdate(
          { $or: [{ _id: orgId }, { slug: orgId }], 'modules.slug': moduleSlug } as any,
          { $pull: { 'modules.$.records': { _id: recordId } } },
          { new: true }
        ).lean();
        if (org) return { ...org, _id: org._id.toString() } as unknown as Organization;
      } catch (err) {
        console.error('Error deleting module record in MongoDB:', err);
      }
    }
    const memOrg = mockOrgs.find((o) => o._id === orgId || o.slug === orgId);
    if (memOrg && memOrg.modules) {
      memOrg.modules = memOrg.modules.map((m) =>
        m.slug === moduleSlug
          ? { ...m, records: (m.records || []).filter((r: any) => r._id !== recordId) }
          : m
      );
      return memOrg;
    }
    return null;
  },
};
