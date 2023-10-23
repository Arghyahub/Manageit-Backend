import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import User from "../db/User";
import { IOrganisation, IUser } from "../types";
import Task from "../db/Task";
import Organisation from "../db/Organisation";

// For setting req.user as user, otherwise ts shows error as it can of any type
interface RequestWithUser extends Request {
    user?: IUser | IOrganisation;
}

const secret = process.env.SECRET || "";

// Authenticate user with the token
const authUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ msg: "Token Missing", token: false, valid: false });
    }
    try {
        const decoded = jwt.verify(token, secret) as IUser;
        const user = await User.findById(decoded?.id);

        // Check if user exists
        if (!user) {
            // Check if org exists
            const org = await Organisation.findById(decoded?.id)
            if (!org)
                return res.status(401).json({ msg: "User doesn't exist", token: true, valid: false });
            else {
                req.user = org;
            }
        } else
            req.user = user;

        next();
    } catch (err) {
        return res.status(500).json({ msg: "Some error occured", token: true, valid: true });
    }
};

// Check if user is part of the project
const checkUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    let { projectId } = req.params;

    // Checking if user exists
    if (!req.user || !req.user.projects) {
        return res.status(404).json({ msg: "User/Projects is not found!" });
    }

    // If project id doesn't exist then check for TaskId
    if (!projectId) {
        const { taskId } = req.params;

        // If taskId doesn't exist, then it must be a invalid req
        if (!taskId) {
            return res.status(400).json({ msg: "Invalid Request!" });
        }

        // Authenticate task with the given id
        const task = await Task.findById(taskId).select("projectId");
        if (!task) {
            return res.status(400).json({ msg: "Task not found!" });
        }
        // Update projectId from task's proejectId
        projectId = task.projectId.toString();
    }

    // Matching both the projectIds
    if (req.user.projects.some((project) => project?.projectId?.equals(new Types.ObjectId(projectId)))) {
        next();
    } else
        return res.status(403).json({ msg: "User is not part of the project" });
}

export { authUser, checkUser };