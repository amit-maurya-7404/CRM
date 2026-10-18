export type LeadStage = 'new' | 'contacted' | 'meeting' | 'proposal' | 'won' | 'lost';
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';
export type LeadSource = 'website' | 'whatsapp' | 'instagram' | 'facebook' | 'referral' | 'cold_call' | 'google_ads' | 'other';
export type UserRole = 'owner' | 'admin' | 'manager' | 'agent' | 'super_admin';

export interface CustomFieldDefinition {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date';
  options?: string[];
  required?: boolean;
}

export interface CustomModule {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  fields: CustomFieldDefinition[];
  records?: Record<string, any>[];
  createdAt?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  activities: string;
  stayHotel: string;
  meals: string;
}

export interface ItineraryData {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  vehicleType: string;
  hotelCost: number;
  transportCost: number;
  activitiesCost: number;
  totalCost: number;
  status: 'draft' | 'sent' | 'confirmed' | 'booked';
  notes?: string;
  days: ItineraryDay[];
}

export interface LayoutFieldItem {
  id: string;
  label: string;
  key: string;
  type: string;
  iconType: string;
  required?: boolean;
  options?: string[];
  hint?: string;
  salutation?: boolean;
}

export interface LayoutSectionItem {
  id: string;
  title: string;
  leftFields: LayoutFieldItem[];
  rightFields: LayoutFieldItem[];
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  industry: string;
  currency: string; // 'INR' | 'USD' | 'EUR' etc.
  currencySymbol: string;
  customFields: CustomFieldDefinition[];
  modules?: CustomModule[];
  moduleLayouts?: Record<string, LayoutSectionItem[]>;
  whatsappTemplate?: string;
  apiKey?: string;
  apiKeyCreatedAt?: string;
  ownerEmail?: string;
  adminEmail?: string;
  adminPassword?: string;
  plan?: 'starter' | 'professional' | 'enterprise';
  status?: 'active' | 'suspended';
  createdAt: string;
}

export interface User {
  _id: string;
  orgId: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  avatar?: string;
  phone?: string;
  isPlatformOwner?: boolean;
}

export interface Lead {
  _id: string;
  orgId: string;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  value: number;
  stage: LeadStage;
  priority: LeadPriority;
  source: LeadSource;
  assignedTo?: {
    _id: string;
    name: string;
    avatar?: string;
    email?: string;
  };
  customFields?: Record<string, any>;
  nextFollowUp?: string; // ISO date string
  notesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  orgId: string;
  leadId: string;
  user: {
    _id: string;
    name: string;
  };
  type: 'note' | 'call' | 'whatsapp' | 'meeting' | 'stage_change';
  content: string;
  previousStage?: LeadStage;
  newStage?: LeadStage;
  followUpDate?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  totalPipelineValue: number;
  wonDealsCount: number;
  wonDealsValue: number;
  conversionRate: number;
  pendingFollowUpsCount: number;
  stageBreakdown: { stage: LeadStage; count: number; totalValue: number }[];
  sourceBreakdown: { source: LeadSource; count: number }[];
  recentActivities: Activity[];
}
