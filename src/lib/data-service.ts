import { Organization, User, Lead, Activity, DashboardStats, LeadStage, LeadPriority, LeadSource } from '@/types';
import { connectToDatabase, isMongoConfigured } from './mongodb';
import { OrganizationModel } from '@/models/Organization';
import { UserModel } from '@/models/User';
import { LeadModel } from '@/models/Lead';
import { ActivityModel } from '@/models/Activity';

// Initial Companies Tailored for Target Industries
const initialOrgs: Organization[] = [
  // 1. TRAVEL COMPANY
  {
    _id: 'org_travel',
    name: 'Wanderlust Holidays & Luxury Travel',
    slug: 'wanderlust-travel',
    industry: 'Travel & Tourism',
    currency: 'INR',
    currencySymbol: '₹',
    customFields: [
      { id: 'tf_1', key: 'destination', label: 'Destination', type: 'select', options: ['Dubai 5N/6D', 'Bali Honeymoon', 'Europe Grand Tour', 'Maldives Luxury Villa', 'Ladakh Expedition', 'Goa Weekend'], required: true },
      { id: 'tf_2', key: 'travelers_count', label: 'Travelers (Pax)', type: 'select', options: ['1 Solo', '2 Couple', '3-5 Family', '6+ Group'] },
      { id: 'tf_3', key: 'travel_date', label: 'Tentative Travel Date', type: 'date' },
      { id: 'tf_4', key: 'hotel_category', label: 'Hotel Category', type: 'select', options: ['3 Star Budget', '4 Star Premium', '5 Star Luxury Resort'] },
    ],
    whatsappTemplate: 'Hi {{name}}, greetings from Wanderlust Holidays! Regarding your trip inquiry for {{destination}} for {{travelers_count}} travelers, we have crafted a custom itinerary. Would you like to review the flight & hotel options?',
    createdAt: new Date().toISOString(),
  },
  // 2. GYM & FITNESS CENTER
  {
    _id: 'org_gym',
    name: 'PulseFit 24/7 Health & Gym',
    slug: 'pulsefit-gym',
    industry: 'Gym & Fitness',
    currency: 'INR',
    currencySymbol: '₹',
    customFields: [
      { id: 'gf_1', key: 'membership_plan', label: 'Membership Plan', type: 'select', options: ['1 Month Pass', '3 Months Muscle Build', 'Annual VIP Pass', 'Personal Training + Diet Plan'], required: true },
      { id: 'gf_2', key: 'fitness_goal', label: 'Fitness Goal', type: 'select', options: ['Fat Loss / Weight Loss', 'Muscle Hypertrophy', 'CrossFit & Stamina', 'General Wellness'] },
      { id: 'gf_3', key: 'preferred_batch', label: 'Preferred Batch', type: 'select', options: ['Morning (6:00 AM - 9:00 AM)', 'Afternoon (12:00 PM - 4:00 PM)', 'Evening (5:00 PM - 10:00 PM)'] },
      { id: 'gf_4', key: 'trial_date', label: 'Trial Session Date', type: 'date' },
    ],
    whatsappTemplate: 'Hey {{name}}! Welcome to PulseFit Gym. Your free 1-day workout trial & body analysis test is confirmed. Which batch timing (Morning or Evening) works best for you today?',
    createdAt: new Date().toISOString(),
  },
  // 3. CLINICS & HEALTHCARE
  {
    _id: 'org_clinic',
    name: 'AuraCare Dental & Polyclinic',
    slug: 'auracare-clinic',
    industry: 'Clinics & Healthcare',
    currency: 'INR',
    currencySymbol: '₹',
    customFields: [
      { id: 'cf_1', key: 'treatment_required', label: 'Treatment Required', type: 'select', options: ['Invisalign / Clear Aligners', 'Root Canal & Ceramic Crown', 'Dental Implants', 'Teeth Whitening', 'General Medical Consultation'], required: true },
      { id: 'cf_2', key: 'doctor_assigned', label: 'Consultant Doctor', type: 'select', options: ['Dr. Neha Singhal (Orthodontist)', 'Dr. Rahul Nair (Implantologist)', 'Dr. Ajay Verma (Physician)'] },
      { id: 'cf_3', key: 'appointment_date', label: 'Appointment Date', type: 'date' },
      { id: 'cf_4', key: 'patient_age', label: 'Patient Age', type: 'number' },
    ],
    whatsappTemplate: 'Hello {{name}}, this is AuraCare Clinic. Your appointment request for {{treatment_required}} with {{doctor_assigned}} has been received. Please confirm if 4:30 PM works for you.',
    createdAt: new Date().toISOString(),
  },
  // 4. RESTAURANT & BANQUET
  {
    _id: 'org_restaurant',
    name: 'The Royal Grand Banquet & Bistro',
    slug: 'royal-banquet',
    industry: 'Restaurant & Banquets',
    currency: 'INR',
    currencySymbol: '₹',
    customFields: [
      { id: 'rf_1', key: 'event_type', label: 'Event Type', type: 'select', options: ['Wedding Reception', 'Birthday / Anniversary Party', 'Corporate Gala Dinner', 'Private Family Buffet'], required: true },
      { id: 'rf_2', key: 'guest_count', label: 'Expected Guests (Pax)', type: 'select', options: ['25-50 Pax', '50-100 Pax', '100-250 Pax', '250-500 Pax', '500+ Pax'] },
      { id: 'rf_3', key: 'event_date', label: 'Event Date', type: 'date' },
      { id: 'rf_4', key: 'catering_type', label: 'Menu Spread', type: 'select', options: ['Pure Veg Royal Buffet', 'Gourmet Non-Veg & Seafood', 'Live BBQ & Cocktail Bar'] },
    ],
    whatsappTemplate: 'Hi {{name}}, congratulations on your upcoming {{event_type}}! The Royal Grand Banquet has hall availability for {{guest_count}} guests. When can we schedule your food tasting session?',
    createdAt: new Date().toISOString(),
  },
  // 5. REAL ESTATE (BONUS)
  {
    _id: 'org_real_estate',
    name: 'Apex Realty & Living',
    slug: 'apex-realty',
    industry: 'Real Estate & Properties',
    currency: 'INR',
    currencySymbol: '₹',
    customFields: [
      { id: 'f1', key: 'property_type', label: 'Property Type', type: 'select', options: ['2 BHK Luxury', '3 BHK Penthouse', 'Commercial Office', 'Plot / Villa'], required: true },
      { id: 'f2', key: 'budget_range', label: 'Budget Range', type: 'select', options: ['₹40L - ₹75L', '₹75L - ₹1.5 Cr', '₹1.5 Cr - ₹3 Cr', '₹3 Cr+'] },
      { id: 'f3', key: 'preferred_location', label: 'Preferred Location', type: 'text' },
    ],
    whatsappTemplate: 'Hi {{name}}, greetings from Apex Realty! Regarding your interest in {{property_type}}, when is a good time for a site visit this week?',
    createdAt: new Date().toISOString(),
  },
];

const initialUsers: User[] = [
  { _id: 'u_1', orgId: 'org_travel', name: 'Aarav Kapoor', email: 'aarav@wanderlusttravel.com', role: 'owner', phone: '+919876543210' },
  { _id: 'u_2', orgId: 'org_gym', name: 'Sameer Joshi', email: 'sameer@pulsefitgym.com', role: 'owner', phone: '+919811223344' },
  { _id: 'u_3', orgId: 'org_clinic', name: 'Dr. Neha Singhal', email: 'dr.neha@auracareclinic.com', role: 'owner', phone: '+919988776655' },
  { _id: 'u_4', orgId: 'org_restaurant', name: 'Vikas Oberoi', email: 'vikas@royalbanquet.com', role: 'owner', phone: '+919123456780' },
  { _id: 'u_5', orgId: 'org_real_estate', name: 'Rohan Sharma', email: 'rohan@apexrealty.in', role: 'owner', phone: '+919876500000' },
];

const initialLeads: Lead[] = [
  // Travel leads
  {
    _id: 'lead_t1',
    orgId: 'org_travel',
    name: 'Kabir & Riya Malhotra',
    company: 'Honeymoon Trip',
    phone: '9876543210',
    email: 'kabir.m@gmail.com',
    value: 195000,
    stage: 'meeting',
    priority: 'urgent',
    source: 'instagram',
    assignedTo: { _id: 'u_1', name: 'Aarav Kapoor' },
    customFields: { destination: 'Bali Honeymoon', travelers_count: '2 Couple', hotel_category: '5 Star Luxury Resort' },
    nextFollowUp: new Date(Date.now() + 86400000).toISOString(),
    notesCount: 2,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'lead_t2',
    orgId: 'org_travel',
    name: 'Mehta Family',
    company: 'Family Vacation',
    phone: '9820011223',
    email: 'sanjay.mehta@yahoo.com',
    value: 480000,
    stage: 'proposal',
    priority: 'high',
    source: 'website',
    assignedTo: { _id: 'u_1', name: 'Aarav Kapoor' },
    customFields: { destination: 'Dubai 5N/6D', travelers_count: '3-5 Family', hotel_category: '4 Star Premium' },
    nextFollowUp: new Date(Date.now() + 43200000).toISOString(),
    notesCount: 3,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'lead_t3',
    orgId: 'org_travel',
    name: 'Ankit Aggarwal',
    company: 'Biking Group',
    phone: '9910293847',
    email: 'ankit.biker@gmail.com',
    value: 240000,
    stage: 'won',
    priority: 'medium',
    source: 'referral',
    assignedTo: { _id: 'u_1', name: 'Aarav Kapoor' },
    customFields: { destination: 'Ladakh Expedition', travelers_count: '6+ Group', hotel_category: '3 Star Budget' },
    notesCount: 1,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Gym leads
  {
    _id: 'lead_g1',
    orgId: 'org_gym',
    name: 'Rohit Deshmukh',
    company: 'Software Engineer',
    phone: '9898012345',
    email: 'rohit.d@techcorp.com',
    value: 28000,
    stage: 'contacted',
    priority: 'high',
    source: 'facebook',
    assignedTo: { _id: 'u_2', name: 'Sameer Joshi' },
    customFields: { membership_plan: 'Annual VIP Pass', fitness_goal: 'Fat Loss / Weight Loss', preferred_batch: 'Evening (5:00 PM - 10:00 PM)' },
    nextFollowUp: new Date(Date.now() + 86400000).toISOString(),
    notesCount: 1,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'lead_g2',
    orgId: 'org_gym',
    name: 'Pooja Hegde',
    phone: '9744112233',
    email: 'pooja.fit@gmail.com',
    value: 45000,
    stage: 'meeting',
    priority: 'urgent',
    source: 'instagram',
    assignedTo: { _id: 'u_2', name: 'Sameer Joshi' },
    customFields: { membership_plan: 'Personal Training + Diet Plan', fitness_goal: 'Muscle Hypertrophy', preferred_batch: 'Morning (6:00 AM - 9:00 AM)' },
    nextFollowUp: new Date(Date.now() + 43200000).toISOString(),
    notesCount: 2,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Clinic leads
  {
    _id: 'lead_c1',
    orgId: 'org_clinic',
    name: 'Sanya Mirza',
    phone: '9810192837',
    email: 'sanya.smile@gmail.com',
    value: 125000,
    stage: 'proposal',
    priority: 'urgent',
    source: 'website',
    assignedTo: { _id: 'u_3', name: 'Dr. Neha Singhal' },
    customFields: { treatment_required: 'Invisalign / Clear Aligners', doctor_assigned: 'Dr. Neha Singhal (Orthodontist)', patient_age: 26 },
    nextFollowUp: new Date(Date.now() + 43200000).toISOString(),
    notesCount: 3,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'lead_c2',
    orgId: 'org_clinic',
    name: 'Harish Chandra',
    phone: '9848011223',
    email: 'harish.c@gmail.com',
    value: 65000,
    stage: 'won',
    priority: 'high',
    source: 'referral',
    assignedTo: { _id: 'u_3', name: 'Dr. Neha Singhal' },
    customFields: { treatment_required: 'Dental Implants', doctor_assigned: 'Dr. Rahul Nair (Implantologist)', patient_age: 58 },
    notesCount: 2,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Restaurant & Banquet leads
  {
    _id: 'lead_r1',
    orgId: 'org_restaurant',
    name: 'Sunil & Sunita Goel',
    company: 'Daughter Wedding',
    phone: '9711002233',
    email: 'sunilgoel@gmail.com',
    value: 650000,
    stage: 'meeting',
    priority: 'urgent',
    source: 'referral',
    assignedTo: { _id: 'u_4', name: 'Vikas Oberoi' },
    customFields: { event_type: 'Wedding Reception', guest_count: '250-500 Pax', catering_type: 'Gourmet Non-Veg & Seafood' },
    nextFollowUp: new Date(Date.now() + 86400000).toISOString(),
    notesCount: 4,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'lead_r2',
    orgId: 'org_restaurant',
    name: 'Zomato Regional Team',
    company: 'Corporate Meet',
    phone: '9811223344',
    email: 'events@zomato.com',
    value: 180000,
    stage: 'proposal',
    priority: 'high',
    source: 'website',
    assignedTo: { _id: 'u_4', name: 'Vikas Oberoi' },
    customFields: { event_type: 'Corporate Gala Dinner', guest_count: '50-100 Pax', catering_type: 'Live BBQ & Cocktail Bar' },
    nextFollowUp: new Date(Date.now() + 43200000).toISOString(),
    notesCount: 2,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initialActivities: Activity[] = [
  {
    _id: 'act_1',
    orgId: 'org_travel',
    leadId: 'lead_t1',
    user: { _id: 'u_1', name: 'Aarav Kapoor' },
    type: 'whatsapp',
    content: 'Sent Bali Seminyak Private Pool Villa itinerary with candlelight dinner option.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'act_2',
    orgId: 'org_gym',
    leadId: 'lead_g1',
    user: { _id: 'u_2', name: 'Sameer Joshi' },
    type: 'call',
    content: 'Client attended trial session. Interested in 1-year VIP pass. Follow-up tomorrow after salary date.',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    _id: 'act_3',
    orgId: 'org_clinic',
    leadId: 'lead_c1',
    user: { _id: 'u_3', name: 'Dr. Neha Singhal' },
    type: 'meeting',
    content: '3D intraoral scan completed. Invisalign plan of 18 aligners explained to patient.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

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
        const orgs = await OrganizationModel.find({}).lean();
        if (orgs && orgs.length >= initialOrgs.length) {
          return orgs.map((o) => ({ ...o, _id: o._id.toString() } as unknown as Organization));
        }
        
        // Seed if missing target industries
        for (const org of initialOrgs) {
          await OrganizationModel.findOneAndUpdate(
            { slug: org.slug },
            { $set: org },
            { upsert: true, new: true }
          );
        }
        const updated = await OrganizationModel.find({}).lean();
        return updated.map((o) => ({ ...o, _id: o._id.toString() } as unknown as Organization));
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
        const org = await OrganizationModel.findOne({ $or: [{ _id: id }, { slug: id }] }).lean();
        if (org) return { ...org, _id: org._id.toString() } as unknown as Organization;
      } catch {
        // Fallback
      }
    }
    return mockOrgs.find((o) => o._id === id || o.slug === id) || mockOrgs[0] || null;
  },

  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    const newOrg: Organization = {
      _id: `org_${Date.now()}`,
      name: data.name || 'New Organization',
      slug: (data.name || 'new-org').toLowerCase().replace(/[^a-z0-9]/g, '-'),
      industry: data.industry || 'General Business',
      currency: data.currency || 'INR',
      currencySymbol: data.currencySymbol || '₹',
      customFields: data.customFields || [],
      whatsappTemplate: data.whatsappTemplate || 'Hi {{name}}, greetings from {{company}}!',
      createdAt: new Date().toISOString(),
    };

    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        const created = await OrganizationModel.create(newOrg);
        return { ...created.toObject(), _id: created._id.toString() } as unknown as Organization;
      } catch (err) {
        console.error('Error creating org in MongoDB:', err);
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
          { $or: [{ _id: id }, { slug: id }] },
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

  // LEADS
  async getLeads(
    orgId: string,
    filters?: { stage?: string; priority?: string; search?: string }
  ): Promise<Lead[]> {
    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        // Seed initial leads if empty for this org
        const count = await LeadModel.countDocuments({ orgId });
        if (count === 0) {
          const orgInitialLeads = initialLeads.filter((l) => l.orgId === orgId);
          if (orgInitialLeads.length > 0) {
            await LeadModel.insertMany(orgInitialLeads);
          }
        }

        const query: any = { orgId };
        if (filters?.stage && filters.stage !== 'all') query.stage = filters.stage;
        if (filters?.priority && filters.priority !== 'all') query.priority = filters.priority;
        if (filters?.search) {
          query.$or = [
            { name: { $regex: filters.search, $options: 'i' } },
            { phone: { $regex: filters.search, $options: 'i' } },
            { email: { $regex: filters.search, $options: 'i' } },
            { company: { $regex: filters.search, $options: 'i' } },
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

  async createLead(data: Partial<Lead>): Promise<Lead> {
    const newLead: Lead = {
      _id: `lead_${Date.now()}`,
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
      } catch (err) {
        console.error('Error creating lead in MongoDB:', err);
      }
    }

    mockLeads.unshift(newLead);
    return newLead;
  },

  async updateLead(id: string, update: Partial<Lead>): Promise<Lead | null> {
    const mongo = await connectToDatabase();
    if (mongo) {
      try {
        const updated = await LeadModel.findOneAndUpdate(
          { _id: id },
          { $set: { ...update, updatedAt: new Date().toISOString() } },
          { new: true }
        ).lean();
        if (updated) return { ...updated, _id: updated._id.toString() } as unknown as Lead;
      } catch (err) {
        console.error('Error updating lead in MongoDB:', err);
      }
    }

    const index = mockLeads.findIndex((l) => l._id === id);
    if (index !== -1) {
      mockLeads[index] = { ...mockLeads[index], ...update, updatedAt: new Date().toISOString() };
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
    const newActivity: Activity = {
      _id: `act_${Date.now()}`,
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
      } catch (err) {
        console.error('Error adding activity to MongoDB:', err);
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
        recentActivities = (await ActivityModel.find({ orgId }).sort({ createdAt: -1 }).limit(8).lean()).map((a) => ({
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
};
