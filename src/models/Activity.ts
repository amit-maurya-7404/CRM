import mongoose, { Schema, Document, Model } from 'mongoose';
import { Activity as IActivity } from '@/types';

export interface ActivityDocument extends Omit<IActivity, '_id'>, Document {}

const ActivitySchema = new Schema<ActivityDocument>(
  {
    orgId: { type: String, required: true, index: true },
    leadId: { type: String, required: true, index: true },
    user: {
      _id: { type: String, required: true },
      name: { type: String, required: true },
    },
    type: {
      type: String,
      enum: ['note', 'call', 'whatsapp', 'meeting', 'stage_change'],
      required: true,
    },
    content: { type: String, required: true },
    previousStage: { type: String },
    newStage: { type: String },
    followUpDate: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ActivitySchema.index({ orgId: 1, leadId: 1, createdAt: -1 });

export const ActivityModel: Model<ActivityDocument> =
  mongoose.models.Activity || mongoose.model<ActivityDocument>('Activity', ActivitySchema);
