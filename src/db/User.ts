import mongoose, { Model, Schema } from 'mongoose';
import { IUser } from '../types';

const userSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true },
  passwd: { type: String, required: true },
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  orgId: { type: Schema.Types.ObjectId, ref: 'Organisation', required: true },
  chatTo: [{ type: Object, required: false }],
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
