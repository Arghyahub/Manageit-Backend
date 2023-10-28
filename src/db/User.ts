import mongoose, { Model, Schema } from 'mongoose';
import { IUser } from '../types';

const userSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true },
  passwd: { type: String, required: true },
  projects: [{ _id: false, projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true }, name: { type: String, required: true } }],
  orgId: { type: Schema.Types.ObjectId, ref: 'Organisation', required: true },
  chatTo: [{
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat' },
    memberId: String,
    name: String,
    lastVis: { type: Date, default: Date.now }
  }],
  fcmToken: { type: String }
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
