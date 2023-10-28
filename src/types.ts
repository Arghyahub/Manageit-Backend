import { Document, Types } from "mongoose";
import IUser from "./db/User";
import ITask from "./db/Task";

// Storing id and name for users
export interface userType {
    userId: Types.ObjectId,
    name: string
}

// Storing id and status for tasks
export interface taskType extends Document {
    taskId: Types.ObjectId,
    status: string
}

// Storing id and name for projects
export interface projectType extends Document {
    projectId: Types.ObjectId,
    name: string
}

// Comments interface for Tasks
export interface commentType extends Document {
    userId: Types.ObjectId,
    userName: string,
    comment: string,
    timestamp: Date,
}

export interface chatToType extends Document {
    chatId: Types.ObjectId,
    chatName: string,
    lastVis: Date
}

// Message interface for chats
export interface messageType extends Document {
    userId: Types.ObjectId,
    name: string,
    message: string,
    timestamp: Date,
}

// Chat DB interface
export interface IChat extends Document {
    userList: [Types.ObjectId, Types.ObjectId],
    messages: messageType[]
}

// Interface for User DB
export interface IUser extends Document {
    name: string,
    role: string,
    email: string,
    passwd: string,
    projects?: projectType[],
    orgId: Types.ObjectId,
    chatTo?: chatToType[],
    fcmToken: string
}

// Interface for Task DB
export interface ITask extends Document {
    name: string,
    desc: string,
    projectId: Types.ObjectId,
    status?: string;
    assignedBy?: userType;
    assignedTo?: userType[],    /* Task can be assigned to more than one user*/
    createdBy: userType,
    date: Date,
    deadline?: Date,
    comments?: commentType[]
}

// Interface for Project DB
export interface IProject extends Document {
    name: string,
    desc: string,
    createdBy: userType,
    date: Date,
    orgId: Types.ObjectId,
    tasks?: taskType[],
    users?: userType[]
}

// Interface for Organisation DB
export interface IOrganisation extends Document {
    name: string,
    email: string,
    passwd: string,
    role: string,
    projects?: projectType[],
    users?: userType[]
}