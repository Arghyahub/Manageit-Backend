import mongoose, { Model, Schema } from 'mongoose';
import { ITask } from "../types";

const taskSchema: Schema<ITask> = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    desc: { type: String, required: true },
    projectId: { type: String, required: true },
    status: { type: String, required: false },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deadline: { type: Date, required: false },
});

const Task: Model<ITask> = mongoose.model<ITask>('Task', taskSchema);

export default Task;
