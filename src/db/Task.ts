import mongoose, { Model, Schema } from 'mongoose';
import { ITask } from "../types";

const taskSchema: Schema<ITask> = new Schema({
    name: { type: String, required: true },
    desc: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    status: { type: String, required: false },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deadline: { type: Date, required: false },
    date: { type: Date, default: Date.now, required: true },
    comments: [{
        userId: { type: Schema.Types.ObjectId, required: true },
        userName: { type: String, required: true },
        comment: { type: String, required: true },
        timestamp: { type: Date, default: Date.now, required: true }
    }]
});

const Task: Model<ITask> = mongoose.model<ITask>('Task', taskSchema);

export default Task;
