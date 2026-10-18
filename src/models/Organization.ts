import mongoose, { Schema, Document, Model } from 'mongoose';
import { Organization as IOrganization } from '@/types';

export interface OrganizationDocument extends Omit<IOrganization, '_id'>, Document {}

const CustomFieldSchema = new Schema(
  {
    id: { type: String, required: true },
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ['text', 'number', 'select', 'date'], default: 'text' },
    options: [{ type: String }],
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const CustomModuleSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    icon: { type: String, default: 'Layers' },
    description: { type: String },
    fields: [CustomFieldSchema],
    records: [{ type: Schema.Types.Mixed, default: [] }],
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

const OrganizationSchema = new Schema<OrganizationDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    industry: { type: String, default: 'General' },
    currency: { type: String, default: 'INR' },
    currencySymbol: { type: String, default: '₹' },
    customFields: [CustomFieldSchema],
    modules: [CustomModuleSchema],
    whatsappTemplate: {
      type: String,
      default: 'Hi {{name}}, thanks for reaching out to {{company}}! How can we help you today?',
    },
    apiKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    apiKeyCreatedAt: {
      type: String,
    },
    ownerEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    adminEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    adminPassword: {
      type: String,
    },
    plan: {
      type: String,
      enum: ['starter', 'professional', 'enterprise'],
      default: 'professional',
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    moduleLayouts: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const OrganizationModel: Model<OrganizationDocument> =
  mongoose.models.Organization || mongoose.model<OrganizationDocument>('Organization', OrganizationSchema);
