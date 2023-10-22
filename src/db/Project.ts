import mongoose, { Model, Schema } from 'mongoose';
import { IProject } from '../types';

const projectSchema: Schema<IProject> = new Schema({
    name: { type: String, required: true },
    desc: { type: String, required: true },
    createdBy: { _id: false, userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, name: { type: String, required: true } },
    date: { type: Date, default: Date.now, required: true },
    orgId: { type: Schema.Types.ObjectId, ref: 'Organisation', required: true },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    users: [{ _id: false, userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, name: { type: String, required: true } }]
});

const Project: Model<IProject> = mongoose.model<IProject>('Project', projectSchema);

export default Project;
