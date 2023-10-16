import mongoose, { Document, Model, Schema } from 'mongoose';
import { projectType , chatToType } from '../types.js'

interface IUser extends Document {
  name: string
  role: string
  email: string
  passwd: string
  projects: [projectType]
  organizationID: string
  chatTo: [chatToType]
}

const userSchema = new Schema<IUser>({
  name: String,
  email: String,
  passwd: String,

});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
