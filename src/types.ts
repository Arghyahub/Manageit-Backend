import { Document } from 'mongoose';
import IUser from './db/User';
import ITask from './db/Task';

export interface projectType {
    projectId: string
    name: string
}

export interface chatToType {
    chatId: string
    chatName: string
}

// Interface for Project
export interface IProject extends Document {
    name: string,
    desc: string,
    tasks: ITask[],
    users: IUser[]
}

// Interface for Tasks
export interface ITask extends Document {
    name: string;
    description: string;
    status: string;
    assignedBy: IUser;
    assignedTo: IUser[];    /* Task can be assigned to more than one user*/
    createdBy: IUser;
    deadline: Date;
}

// Interface for User (admin and normal user)
export interface IUser extends Document {
    name: string;
    role: string;
    email: string;
    passwd: string;
    projects: projectType[];
    organizationID: string;
    chatTo: chatToType[];
}