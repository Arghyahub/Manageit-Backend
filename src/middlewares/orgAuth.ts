import { Request, Response, NextFunction } from "express";
import { IUser } from "../types";
import { Types } from "mongoose";

// For setting req.user as user, otherwise ts shows error as it can of any type
interface RequestWithUser extends Request {
    user?: IUser;
}

// To check if the user is part of the organization and has admin role
const checkAdminInOrg = (req: RequestWithUser, res: Response, next: NextFunction) => {
    const orgId = req.body.orgId;
    const user = req.user;

    // If orgId doesn't exist, return error
    if (!orgId) {
        return res.status(400).json({ msg: "Organization ID is missing in the request body!" });
    }

    // If user doesn't exist, return error
    if (!user) {
        return res.status(404).json({ msg: "User not found!" });
    }

    // Checking if user's orgId is same as in the body
    if (!user.orgId.equals(new Types.ObjectId(orgId))) {
        return res.status(403).json({ msg: "User is not part of the organization!" });
    }
    
    // Checking role of user
    if (user.role !== "admin") {
        return res.status(403).json({ msg: "User is not an admin in the organization!" });
    }

    next();
}

export default checkAdminInOrg;
