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

const OrganizationSchema = new Schema<OrganizationDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    industry: { type: String, default: 'General' },
    currency: { type: String, default: 'INR' },
    currencySymbol: { type: String, default: '₹' },
    customFields: [CustomFieldSchema],
    whatsappTemplate: {
      type: String,
      default: 'Hi {{name}}, thanks for reaching out to {{company}}! How can we help you today?',
    },
  },
  {
    timestamps: true,
  }
);

export const OrganizationModel: Model<OrganizationDocument> =
  mongoose.models.Organization || mongoose.model<OrganizationDocument>('Organization', OrganizationSchema);
