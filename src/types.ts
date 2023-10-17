import { Document } from "mongoose";
import IUser from "./db/User";
import ITask from "./db/Task";

type Role = "admin" | "user";

// Ids for organisation
export interface orgType {
    orgId: string
}
// Storing id for projects
export interface projectType {
    projectId: string
}

// Storing id for users
export interface userType {
    userId: string,
    role: Role
}

// For tasks id
export interface taskType {
    taskId: string
}

export interface chatToType {
    chatId: string
    chatName: string
}


// Interface for User (admin and normal user)
export interface IUser extends Document {
    name: string;
    role: Role;
    email: string;
    passwd: string;
    projects?: projectType[];
    orgId: orgType;
    chatTo?: chatToType[];
}

// Interface for Tasks
export interface ITask extends Document {
    name: string;
    desc: string;
    projectId: string,
    status?: string;
    assignedBy?: userType;
    assignedTo?: userType[];    /* Task can be assigned to more than one user*/
    createdBy: userType;
    deadline?: Date;
}

// Interface for Project
export interface IProject extends Document {
    name: string,
    desc: string,
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