import mongoose, { Model, Schema } from 'mongoose';
import { IProject } from '../types';

const projectSchema: Schema<IProject> = new Schema({
    name: { type: String, required: true },
    desc: { type: String, required: true },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }]
})

const Project: Model<IProject> = mongoose.model<IProject>('Project', projectSchema);

export default Project;