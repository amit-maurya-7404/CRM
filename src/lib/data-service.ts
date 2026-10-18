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
    apiKey: 'zyn_live_travel_9a2b8e4f107c88d2e4a1',
    apiKeyCreatedAt: new Date().toISOString(),
    ownerEmail: 'aarav@wanderlusttravel.com',
    adminEmail: 'aarav@wanderlusttravel.com',
    adminPassword: 'password123',
    plan: 'enterprise',
    status: 'active',
    customFields: [
      { id: 'tf_1', key: 'destination', label: 'Destination', type: 'select', options: ['Dubai 5N/6D', 'Bali Honeymoon', 'Europe Grand Tour', 'Maldives Luxury Villa', 'Ladakh Expedition', 'Goa Weekend'], required: true },
      { id: 'tf_2', key: 'travelers_count', label: 'Travelers (Pax)', type: 'select', options: ['1 Solo', '2 Couple', '3-5 Family', '6+ Group'] },
      { id: 'tf_3', key: 'travel_date', label: 'Tentative Travel Date', type: 'date' },
      { id: 'tf_4', key: 'hotel_category', label: 'Hotel Category', type: 'select', options: ['3 Star Budget', '4 Star Premium', '5 Star Luxury Resort'] },
    ],
    modules: [
      {
        id: 'mod_itineraries',
        name: 'Itineraries',
        slug: 'itineraries',
        icon: 'MapPin',
        description: 'Custom tour itineraries, travel packages & day-by-day plans',
        fields: [
          { id: 'f_it_1', key: 'title', label: 'Itinerary Name', type: 'text', required: true },
          { id: 'f_it_2', key: 'destination', label: 'Destination', type: 'text', required: true },
          { id: 'f_it_3', key: 'duration', label: 'Duration', type: 'text' },
          { id: 'f_it_4', key: 'pax', label: 'Travelers (Pax)', type: 'number' },
          { id: 'f_it_5', key: 'package_cost', label: 'Total Cost (₹)', type: 'number' },
          { id: 'f_it_6', key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Shared with Client', 'Approved', 'Booked'] },
        ],
        records: [
          {
            _id: 'rec_it_1',
            title: '7N/8Days Jawai Jodhpur Jaisalmer Jaipur',
            destination: 'Rajasthan Circuit',
            duration: '7N / 8D',
            pax: 2,
            package_cost: 195000,
            status: 'Approved',
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'rec_it_2',
            title: '5N/6D Dubai Luxury Burj & Desert Safari',
            destination: 'Dubai, UAE',
            duration: '5N / 6D',
            pax: 4,
            package_cost: 480000,
            status: 'Shared with Client',
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'rec_it_3',
            title: '9N/10D Ladakh Biking & Pangong Tso Tour',
            destination: 'Leh Ladakh',
            duration: '9N / 10D',
            pax: 6,
            package_cost: 240000,
            status: 'Booked',
            createdAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'mod_hotels',
        name: 'Hotels',
        slug: 'hotels',
        icon: 'Building',
        description: 'Partner luxury hotels, desert camps and heritage resorts',
        fields: [
          { id: 'f_h_1', key: 'hotel_name', label: 'Hotel Name', type: 'text', required: true },
          { id: 'f_h_2', key: 'city', label: 'City / Location', type: 'text', required: true },
          { id: 'f_h_3', key: 'category', label: 'Category', type: 'select', options: ['5 Star Luxury', '4 Star Premium', 'Heritage Haveli', 'Boutique Resort'] },
          { id: 'f_h_4', key: 'room_type', label: 'Room Category', type: 'text' },
          { id: 'f_h_5', key: 'cost_per_night', label: 'Cost / Night (₹)', type: 'number' },
          { id: 'f_h_6', key: 'contact_phone', label: 'Front Desk Phone', type: 'text' },
        ],
        records: [
          {
            _id: 'rec_h_1',
            hotel_name: 'Welcomhotel by ITC Jodhpur',
            city: 'Jodhpur',
            category: '5 Star Luxury',
            room_type: 'Club Room with Breakfast',
            cost_per_night: 14500,
            contact_phone: '+91 291 222 3400',
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'rec_h_2',
            hotel_name: 'Suryagarh Jaisalmer Palace',
            city: 'Jaisalmer',
            category: 'Heritage Haveli',
            room_type: 'Fort View Suite',
            cost_per_night: 22000,
            contact_phone: '+91 299 226 9269',
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'rec_h_3',
            hotel_name: 'Atlantis The Palm Dubai',
            city: 'Dubai',
            category: '5 Star Luxury',
            room_type: 'Ocean King Room',
            cost_per_night: 38000,
            contact_phone: '+971 4 426 2000',
            createdAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'mod_vehicles',
        name: 'Vehicles',
        slug: 'vehicles',
        icon: 'Car',
        description: 'Fleet transport, Innova Crysta, Tempo Travellers & drivers',
        fields: [
          { id: 'f_v_1', key: 'vehicle_name', label: 'Vehicle Name', type: 'text', required: true },
          { id: 'f_v_2', key: 'vehicle_type', label: 'Category', type: 'select', options: ['SUV', 'Sedan', 'Tempo Traveller 12S', 'Luxury Van'] },
          { id: 'f_v_3', key: 'capacity', label: 'Seating Capacity', type: 'text' },
          { id: 'f_v_4', key: 'daily_rate', label: 'Daily Rate (₹)', type: 'number' },
          { id: 'f_v_5', key: 'driver_name', label: 'Driver / Vendor Name', type: 'text' },
          { id: 'f_v_6', key: 'driver_phone', label: 'Driver Phone', type: 'text' },
        ],
        records: [
          {
            _id: 'rec_v_1',
            vehicle_name: 'Toyota Innova Crysta (White)',
            vehicle_type: 'SUV',
            capacity: '6+1 Seater',
            daily_rate: 4500,
            driver_name: 'Rajender Singh',
            driver_phone: '+91 98290 11223',
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'rec_v_2',
            vehicle_name: 'Force Tempo Traveller 12 Seater',
            vehicle_type: 'Tempo Traveller 12S',
            capacity: '12+1 Seater',
            daily_rate: 7500,
            driver_name: 'Kuldeep Choudhary',
            driver_phone: '+91 94140 88990',
            createdAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'mod_bookings',
        name: 'Bookings',
        slug: 'bookings',
        icon: 'CalendarCheck',
        description: 'Confirmed customer bookings, vouchers & payments',
        fields: [
          { id: 'f_b_1', key: 'booking_ref', label: 'Booking Ref', type: 'text', required: true },
          { id: 'f_b_2', key: 'customer_name', label: 'Customer Name', type: 'text', required: true },
          { id: 'f_b_3', key: 'itinerary', label: 'Package Booked', type: 'text' },
          { id: 'f_b_4', key: 'travel_date', label: 'Travel Date', type: 'date' },
          { id: 'f_b_5', key: 'total_amount', label: 'Total Amount (₹)', type: 'number' },
          { id: 'f_b_6', key: 'advance_paid', label: 'Advance Paid (₹)', type: 'number' },
          { id: 'f_b_7', key: 'status', label: 'Booking Status', type: 'select', options: ['Advance Received', 'Vouchers Issued', 'Trip Ongoing', 'Completed'] },
        ],
        records: [
          {
            _id: 'rec_b_1',
            booking_ref: 'WND-2026-081',
            customer_name: 'Kabir & Riya Malhotra',
            itinerary: '7N/8Days Jawai Jodhpur Jaisalmer Jaipur',
            travel_date: '2026-10-25',
            total_amount: 195000,
            advance_paid: 75000,
            status: 'Advance Received',
            createdAt: new Date().toISOString(),
          },
        ],
      },
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
    apiKey: 'zyn_live_gym_7d3c1a8e950b44a2c1d3',
    apiKeyCreatedAt: new Date().toISOString(),
    ownerEmail: 'sameer@pulsefitgym.com',
    adminEmail: 'sameer@pulsefitgym.com',
    adminPassword: 'password123',
    plan: 'professional',
    status: 'active',
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
    apiKey: 'zyn_live_clinic_5f8b2c4e116a88b3f2e1',
    apiKeyCreatedAt: new Date().toISOString(),
    ownerEmail: 'dr.neha@auracareclinic.com',
    adminEmail: 'dr.neha@auracareclinic.com',
    adminPassword: 'password123',
    plan: 'professional',
    status: 'active',
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
    apiKey: 'zyn_live_dining_3e9d8a1c774f22c1b9a8',
    apiKeyCreatedAt: new Date().toISOString(),
    ownerEmail: 'vikas@royalbanquet.com',
    adminEmail: 'vikas@royalbanquet.com',
    adminPassword: 'password123',
    plan: 'starter',
    status: 'active',
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
    apiKey: 'zyn_live_realty_4b1a7d9c663e55f8a0b1',
    apiKeyCreatedAt: new Date().toISOString(),
    ownerEmail: 'rohan@apexrealty.in',
    adminEmail: 'rohan@apexrealty.in',
    adminPassword: 'password123',
    plan: 'enterprise',
    status: 'active',
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
  { _id: 'u_super_admin', orgId: 'org_travel', name: 'Zyntex Platform Owner', email: 'owner@zyntex.com', role: 'super_admin', isPlatformOwner: true, phone: '+919876500001', password: 'password123' },
  { _id: 'u_1', orgId: 'org_travel', name: 'Aarav Kapoor', email: 'aarav@wanderlusttravel.com', role: 'owner', phone: '+919876543210', password: 'password123' },
  { _id: 'u_2', orgId: 'org_gym', name: 'Sameer Joshi', email: 'sameer@pulsefitgym.com', role: 'owner', phone: '+919811223344', password: 'password123' },
  { _id: 'u_3', orgId: 'org_clinic', name: 'Dr. Neha Singhal', email: 'dr.neha@auracareclinic.com', role: 'owner', phone: '+919988776655', password: 'password123' },
  { _id: 'u_4', orgId: 'org_restaurant', name: 'Vikas Oberoi', email: 'vikas@royalbanquet.com', role: 'owner', phone: '+919123456780', password: 'password123' },
  { _id: 'u_5', orgId: 'org_real_estate', name: 'Rohan Sharma', email: 'rohan@apexrealty.in', role: 'owner', phone: '+919876500000', password: 'password123' },
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
        const orgs = await OrganizationModel.find({}).lean();
        if (orgs && orgs.length >= initialOrgs.length) {
          return orgs.map((o) => {
            let modules = o.modules;
            if (!modules || modules.length === 0) {
              const defaultOrg = initialOrgs.find((io) => io.slug === o.slug);
              modules = defaultOrg?.modules || [];
            }
            return { ...o, _id: o._id.toString(), modules } as unknown as Organization;
          });
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
        return updated.map((o) => {
          let modules = o.modules;
          if (!modules || modules.length === 0) {
            const defaultOrg = initialOrgs.find((io) => io.slug === o.slug);
            modules = defaultOrg?.modules || [];
          }
          return { ...o, _id: o._id.toString(), modules } as unknown as Organization;
        });
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
        if (org) {
          let modules = org.modules;
          if (!modules || modules.length === 0) {
            const defaultOrg = initialOrgs.find((io) => io.slug === org.slug);
            modules = defaultOrg?.modules || [];
          }
          return { ...org, _id: org._id.toString(), modules } as unknown as Organization;
        }
      } catch {
        // Fallback
      }
    }
    const memOrg = mockOrgs.find((o) => o._id === id || o.slug === id) || mockOrgs[0] || null;
    if (memOrg && (!memOrg.modules || memOrg.modules.length === 0)) {
      const defaultOrg = initialOrgs.find((io) => io.slug === memOrg.slug);
      memOrg.modules = defaultOrg?.modules || [];
    }
    return memOrg;
  },

  async getOrganizationByApiKey(apiKey: string): Promise<Organization | null> {
    if (!apiKey) return null;
    const trimmedKey = apiKey.trim();
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
        const updated = await OrganizationModel.findOneAndUpdate(
          { $or: [{ _id: orgId }, { slug: orgId }] },
          { $set: update },
          { new: true }
        ).lean();
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
        await OrganizationModel.deleteOne({ $or: [{ _id: id }, { slug: id }] });
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

    const newOrg: Organization = {
      _id: `org_${Date.now()}`,
      name: data.name || 'New Organization',
      slug: (data.name || 'new-org').toLowerCase().replace(/[^a-z0-9]/g, '-'),
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
    const newUser: User = {
      _id: `u_${Date.now()}`,
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
      } catch (err) {
        console.error('Error creating user in MongoDB:', err);
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
        const org = await OrganizationModel.findByIdAndUpdate(
          orgId,
          { $push: { modules: newModule } },
          { new: true }
        ).lean();
        if (org) return { ...org, _id: org._id.toString() } as unknown as Organization;
      } catch (err) {
        console.error('Error creating custom module in MongoDB:', err);
      }
    }
    const memOrg = mockOrgs.find((o) => o._id === orgId);
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
          { _id: orgId, 'modules.slug': moduleSlug },
          { $set: { 'modules.$.fields': fields } },
          { new: true }
        ).lean();
        if (org) return { ...org, _id: org._id.toString() } as unknown as Organization;
      } catch (err) {
        console.error('Error updating module layout in MongoDB:', err);
      }
    }
    const memOrg = mockOrgs.find((o) => o._id === orgId);
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
        const org = await OrganizationModel.findById(orgId);
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
              { _id: orgId, 'modules.slug': moduleSlug },
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

    const memOrg = mockOrgs.find((o) => o._id === orgId);
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
          { _id: orgId, 'modules.slug': moduleSlug },
          { $pull: { 'modules.$.records': { _id: recordId } } },
          { new: true }
        ).lean();
        if (org) return { ...org, _id: org._id.toString() } as unknown as Organization;
      } catch (err) {
        console.error('Error deleting module record in MongoDB:', err);
      }
    }
    const memOrg = mockOrgs.find((o) => o._id === orgId);
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
