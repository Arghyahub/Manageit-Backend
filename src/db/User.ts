import mongoose, { Document, Model, Schema } from 'mongoose';
import { projectType, chatToType } from '../types';

export interface IUser extends Document {
  name: string;
  role: string;
  email: string;
  passwd: string;
  projects: projectType[];
  organizationID: string;
  chatTo: chatToType[];
}

const userSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true },
  passwd: { type: String, required: true },
  projects: [{ type: Object, required: false }],
  organizationID: { type: String, required: true },
  chatTo: [{ type: Object, required: false }],
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
