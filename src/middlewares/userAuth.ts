import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { IUser } from "../types";

// For setting req.user as user, otherwise ts shows error as it can of any type
interface RequestWithUser extends Request {
    user?: IUser;
}

// Check if user is part of the project
const checkUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const id = new Types.ObjectId(req.params.projectId);

    if (!req.user || !req.user.projects) {
        return res.status(404).json({ msg: "User/Projects is not found!" });
    }
    if (req.user.projects.some(project => project.projectId.equals(id))) {
        next();
    }
    return res.status(403).json({ msg: "User is not part of the project" });
};

export default checkUser;