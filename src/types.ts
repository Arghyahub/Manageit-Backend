import { Document, Types } from "mongoose";
import IUser from "./db/User";
import ITask from "./db/Task";

type Role = "admin" | "user";

// Ids for organisation
export interface orgType {
    orgId: Types.ObjectId
}
// Storing id for projects
export interface projectType {
    projectId: Types.ObjectId
}

// Storing id for users
export interface userType {
    userId: Types.ObjectId,
    role: Role
}

// For tasks id
export interface taskType {
    taskId: Types.ObjectId
}

// Comments interface for Tasks
export interface commentType extends Document {
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
    projects?: projectType[],
    orgId: orgType,
    chatTo?: chatToType[],
}

// Interface for Tasks
export interface ITask extends Document {
    name: string,
    desc: string,
    projectId: projectType,
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
    orgId: orgType,
    tasks?: taskType[],
    users?: userType[]
}

// Interface for Organisation
export interface IOrganisation extends Document {
    name: string,
    email: string,
    passwd: string,
    projects?: projectType[],
    users?: userType[]
}