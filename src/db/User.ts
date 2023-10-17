import mongoose, { Model, Schema } from 'mongoose';
import { IUser } from '../types';

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
