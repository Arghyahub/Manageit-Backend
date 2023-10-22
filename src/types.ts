import { Document, Types } from "mongoose";
import IUser from "./db/User";
import ITask from "./db/Task";

type Role = "admin" | "user";

// Storing id for users
export interface userType {
    userId: Types.ObjectId,
    role: Role
}

// Comments interface for Tasks
export interface commentType extends Document {
    userId: Types.ObjectId,
    userName: string,
    comment: string,
    timestamp: Date,
}

export interface chatToType {
    chatId: string,
    chatName: string
}


// Interface for User (admin and normal user)
export interface IUser extends Document {
    name: string,
    role: Role,
    email: string,
    passwd: string,
    projects?: Types.ObjectId[],
    orgId: Types.ObjectId,
    chatTo?: chatToType[],
}

// Interface for Tasks
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

// Interface for Project
export interface IProject extends Document {
    name: string,
    desc: string,
    createdBy: userType,
    date: Date,
    orgId: Types.ObjectId,
    tasks?: Types.ObjectId[],
    users?: userType[]
}

// Interface for Organisation
export interface IOrganisation extends Document {
    name: string,
    email: string,
    passwd: string,
    projects?: Types.ObjectId[],
    users?: userType[]
}