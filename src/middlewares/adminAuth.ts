import { Request, Response, NextFunction } from "express";
import { IUser } from "../types";

// For setting req.user as user, otherwise ts shows error as it can of any type
interface RequestWithUser extends Request {
    user?: IUser;
}

const checkAdmin = (req: RequestWithUser, res: Response, next: NextFunction) => {
    const user = req.user;

    // Checking role of user
    if (!user || !user.role || user.role !== "admin") {
        return res.status(403).json({ msg: "Unauthorized request! Only admins can access this!" });
    }
    next();
};

export default checkAdmin;
