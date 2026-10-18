import mongoose, { Schema, Document, Model } from 'mongoose';
import { User as IUser } from '@/types';

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    orgId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ['owner', 'admin', 'manager', 'agent', 'super_admin'], default: 'agent' },
    password: { type: String },
    avatar: { type: String },
    phone: { type: String },
    isPlatformOwner: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Index to quickly look up users during login
UserSchema.index({ email: 1 });
UserSchema.index({ orgId: 1, email: 1 });

export const UserModel: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
