export type LeadStage = 'new' | 'contacted' | 'meeting' | 'proposal' | 'won' | 'lost';
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';
export type LeadSource = 'website' | 'whatsapp' | 'instagram' | 'facebook' | 'referral' | 'cold_call' | 'google_ads' | 'other';
export type UserRole = 'owner' | 'admin' | 'manager' | 'agent';

export interface CustomFieldDefinition {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date';
  options?: string[];
  required?: boolean;
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  industry: string;
  currency: string; // 'INR' | 'USD' | 'EUR' etc.
  currencySymbol: string;
  customFields: CustomFieldDefinition[];
  whatsappTemplate?: string;
  createdAt: string;
}

export interface User {
  _id: string;
  orgId: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
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
