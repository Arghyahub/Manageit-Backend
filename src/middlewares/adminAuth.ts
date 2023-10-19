import { Request, Response, NextFunction } from "express";
import { IUser } from "../types";

interface RequestWithUser extends Request {
    user?: IUser;
}

// To check if user role is admin for several routes
const checkAdmin = (req: RequestWithUser, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (role === "admin") {
        next();
    } else {
        return res.status(403).json({ msg: "Unauthorized request! Only admins can access this!" });
    }
}

export default checkAdmin;