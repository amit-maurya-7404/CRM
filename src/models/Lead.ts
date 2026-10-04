import mongoose, { Schema, Document, Model } from 'mongoose';
import { Lead as ILead } from '@/types';

export interface LeadDocument extends Omit<ILead, '_id'>, Document {}

const LeadSchema = new Schema<LeadDocument>(
  {
    orgId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    value: { type: Number, default: 0 },
    stage: {
      type: String,
      enum: ['new', 'contacted', 'meeting', 'proposal', 'won', 'lost'],
      default: 'new',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    source: {
      type: String,
      enum: ['website', 'whatsapp', 'instagram', 'facebook', 'referral', 'cold_call', 'google_ads', 'other'],
      default: 'website',
    },
    assignedTo: {
      _id: { type: String },
      name: { type: String },
      avatar: { type: String },
      email: { type: String },
    },
    customFields: {
      type: Schema.Types.Mixed,
      default: {},
    },
    nextFollowUp: { type: String },
    notesCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast multi-tenant queries and pipeline analytics
LeadSchema.index({ orgId: 1, stage: 1 });
LeadSchema.index({ orgId: 1, createdAt: -1 });
LeadSchema.index({ orgId: 1, phone: 1 });

export const LeadModel: Model<LeadDocument> =
  mongoose.models.Lead || mongoose.model<LeadDocument>('Lead', LeadSchema);
