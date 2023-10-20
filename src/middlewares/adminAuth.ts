import { Request, Response, NextFunction } from "express";
import { IUser, projectType } from "../types";
import { Types } from "mongoose";

// For setting req.user as user, otherwise ts shows error as it can of any type
interface RequestWithUser extends Request {
    user?: IUser;
}

const checkAdmin = (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
    const user = req.user;

    // Checking role of user
    if (!user || !user.role || user.role !== "admin") {
        return res.status(403).json({ msg: "Unauthorized request! Only admins can access this!" });
    }

    // If projectId doesn't exist, return
    if (!projectId) {
        return res.status(400).json({ msg: "Project ID is missing!" });
    }

    const projectExists = user.projects?.some((project: projectType) => project.projectId === new Types.ObjectId(projectId));

    // Checking if admin is part of the project
    if (!projectExists) {
        return res.status(403).json({ msg: "Admin is not part of the project" });
    }

    next();
};

export default checkAdmin;
