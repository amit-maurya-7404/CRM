import mongoose, { Schema, Document, Model } from 'mongoose';
import { User as IUser } from '@/types';

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    orgId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ['owner', 'admin', 'manager', 'agent'], default: 'agent' },
    avatar: { type: String },
    phone: { type: String },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of email within an organization
UserSchema.index({ orgId: 1, email: 1 }, { unique: true });

export const UserModel: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
