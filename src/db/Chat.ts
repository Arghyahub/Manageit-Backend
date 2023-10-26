import mongoose, { Model, Schema } from 'mongoose';
import { IChat } from '../types';

const chatSchema: Schema<IChat> = new Schema({
    userList: [
        { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
        { type: Schema.Types.ObjectId, ref: 'Chat', required: true }
    ],
    messages: [{
        userId: { type: Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }]
});

const User: Model<IChat> = mongoose.model<IChat>('Chat', chatSchema);

export default User;
