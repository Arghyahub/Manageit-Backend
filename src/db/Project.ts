import mongoose, { Document, Model, Schema } from 'mongoose';
import { IUser } from './User';
import { ITask } from './Task';

export interface IProject extends Document {
    name: string,
    desc: string,
    tasks: ITask[],
    users: IUser[]
}

const projectSchema: Schema<IProject> = new Schema({
    name: { type: String, required: true },
    desc: { type: String, required: true },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }]
})

const Project: Model<IProject> = mongoose.model<IProject>('Project', projectSchema);

export default Project;