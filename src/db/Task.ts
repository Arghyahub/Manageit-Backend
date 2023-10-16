import mongoose, { Document, Model, Schema } from 'mongoose';
import { IUser } from './User';

export interface ITask extends Document {
    name: string;
    description: string;
    status: string;
    assignedBy: IUser;
    assignedTo: IUser[];    /* Task can be assigned to more than one user*/
    createdBy: IUser;
    deadline: Date;
}

const taskSchema: Schema<ITask> = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, required: false },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deadline: { type: Date, required: false },
});

const Task: Model<ITask> = mongoose.model<ITask>('Task', taskSchema);

export default Task;
